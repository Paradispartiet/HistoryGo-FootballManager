// Kampmotor v6: defensive control and release for the four remaining plans.
// Four-step sequences are pedagogical game hypotheses; numbers are not estimates
// inferred from match tracking. Resolve one terminal effect before xG/chances.
const ROUTES = Object.freeze({
  low_block_transition_541: {
    name: "low_block_counter",
    trigger: "possessionControl", triggerMin: 67,
    groups: [["CB"], ["DM", "CM"], ["ST"], ["WB", "LB", "RB"]],
    metrics: ["restDefenseScore", "depthScore"],
    actions: [
      "Stopperen og den dype blokken beskytter rom foran mål",
      "Midtbanen tvinger angrepet ut av den sentrale pasningslinjen",
      "Ballen vinnes og spissen starter første fremoverspill",
      "Vingbacken følger kontringen og gir støtte til siste pasning"
    ],
    counterKey: "restDefence", xgFor: 0.10
  },
  deep_block_long_release: {
    name: "deep_block_release",
    trigger: "highLine", triggerMin: 64,
    groups: [["CB"], ["DM", "CM"], ["ST"], ["CM", "AM"]],
    metrics: ["restDefenseScore", "balanceScore", "depthScore"],
    actions: [
      "Stopperen beskytter boksen og vinner første ball",
      "Midtbanen posisjonerer seg for klarering og andreball",
      "Spissen møter langt oppspill mens motstanderen står høyt",
      "Neste midtbanespiller sikrer avlegget og støtter gjennombrudd"
    ],
    counterKey: "secondBallCover", xgFor: 0.08
  },
  see_out_the_game: {
    name: "protect_lead",
    trigger: "pressIntensity", triggerMin: 70, requiresLead: true,
    groups: [["CB"], ["DM", "CM"], ["LB", "RB", "WB"], ["ST", "AM", "LW", "RW"]],
    metrics: ["restDefenseScore", "balanceScore", "buildUpScore"],
    actions: [
      "Stopperne reduserer rommet sentralt uten å bryte form",
      "Sekseren kontrollerer returløp og pasning mellom lagdelene",
      "Backen holder riktig sikringsavstand når ballen flyttes ut",
      "Fremste spiller tilbyr et kontrollert avlastningspunkt"
    ],
    counterKey: "pressCoordination", xgAgainstControlled: -0.07
  },
  slow_it_down: {
    name: "tempo_control",
    trigger: "pressIntensity", triggerMin: 68,
    groups: [["GK"], ["CB"], ["DM", "CM"], ["CM", "AM", "LB", "RB", "WB"]],
    metrics: ["buildUpScore", "balanceScore", "restDefenseScore"],
    actions: [
      "Keeperen trekker presset mot seg uten å låse pasningsvinkler",
      "Stopperen skaper en trygg returpassning",
      "Sekseren tilbyr første støttepasning under press",
      "Neste støttepunkt flytter ballen vekk fra presset og bevarer kontroll"
    ],
    counterKey: "passingLaneCover", xgAgainstControlled: -0.04
  }
});
const finite = n => typeof n === "number" && Number.isFinite(n);
const clamp = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const round3 = n=>Math.round(n*1000)/1000;
function selectPlayers(lineup, groups) {
  if (!Array.isArray(lineup)) return null;
  const used = new Set(), selected = [];
  for (const group of groups) {
    const next = lineup.filter(p => p?.playerId && !used.has(p.playerId) &&
      p.matchFitKnown === true && finite(p.matchScore) && group.includes(p.position))
      .sort((a,b)=>b.matchScore-a.matchScore)[0];
    if (!next) return null;
    selected.push(next);
    used.add(next.playerId);
  }
  return selected;
}

export function resolveGameControlPhase(session,{rng=Math.random}={}) {
  if (session?.causalGameControlVersion !== 1) return null;
  const planId=session?.activePlanSnapshot?.id ||
    session?.tacticSnapshot?.id || session?.selectedTacticId;
  const route=ROUTES[planId];
  if (!route) return null;
  if (route.requiresLead && !(finite(session.score?.for) &&
      finite(session.score?.against) && session.score.for > session.score.against)) return null;

  const traits=session.opponent?.styleTraits;
  const trigger=route.trigger==="pressIntensity" ? traits?.pressIntensity
    : route.trigger==="highLine" ? traits?.highLine
      : traits?.possessionControl;
  const threat=session.opponent?.transitionThreat ??
    session.opponent?.styleTraits?.transitionThreat;
  const profile=session.teamFitSnapshot?.tacticalProfile;
  const values=route.metrics.map(key=>profile?.[key]);
  const restDefence=profile?.restDefenseScore;
  const playerSupport=selectPlayers(session.lineupSnapshot,route.groups);
  if (!finite(trigger) || trigger < route.triggerMin || !finite(threat) ||
    !finite(restDefence) || !values.every(finite) || !playerSupport) return null;

  const behaviour=session.opponent?.tacticalBehaviour;
  const counterValue=behaviour?.[route.counterKey];
  const covered=route.counterKey==="passingLaneCover"
    ? counterValue==="central"
    : counterValue==="collective";
  // A documented countermove can defeat the chain; missing information is
  // unknown rather than evidence that an opposition cover is absent.
  const avgFit=playerSupport.reduce((sum,p)=>sum+p.matchScore,0)/playerSupport.length;
  const lowFit=Math.min(...playerSupport.map(p=>p.matchScore));
  const probability=clamp(0.51+(avgFit-65)*0.004 +
    (Math.min(...values)-65)*0.003 +(lowFit-60)*0.001 -
    (trigger-route.triggerMin)*0.003 -
    (covered?0.17:0),0.12,0.84);
  const roll=rng();
  if (!finite(roll)) return null;
  const succeeded=clamp(roll,0,0.999999999)<probability;
  const attacking=route.xgFor!==undefined;
  const failureRisk=restDefence >= 70 ? 0.03 :
    restDefence >= 55 ? (threat >= 70 ? 0.05 : 0.03)
      : threat >= 70 ? 0.09 : 0.06;
  const xgDeltaFor=succeeded&&attacking?route.xgFor:0;
  const xgDeltaAgainst=succeeded
    ? attacking?-0.02:route.xgAgainstControlled
    : failureRisk;
  const outcome=succeeded ? attacking?"counterattack":"controlled" : "lost_control";
  const side=succeeded&&attacking?"for":!succeeded?"against":null;

  return {
    version:6,situation:"game_control_and_release",planId,route:route.name,
    status:outcome,side,probability:round3(probability),
    cause:succeeded
      ? attacking
        ? "Kompakt sikring, første gjenvinning og samordnet avlastning skaper fremoverspill."
        : "Støtteavstander og kontrollert pasningsrytme beskytter ballen og laget."
      : covered
        ? "Motstanderens dokumenterte kollektive motgrep bryter støtte- og pasningskjeden."
        : "Støtteavstand eller gjennomføring svikter og gir motstanderen nytt angrepsrom.",
    steps:route.actions.map((action,i)=>({action,
      result:succeeded||i<(covered?2:3)?"available":"blocked"})),
    xgDeltaFor,xgDeltaAgainst,
    evidence:{
      triggerName:route.trigger,triggerValue:trigger,
      opponentTransitionThreat:threat,
      counterKey:route.counterKey,counterValue:counterValue||"unknown",
      restDefenseScore:restDefence,
      support:playerSupport.map(p=>({
        playerId:p.playerId,position:p.position,roleId:p.roleId,matchScore:p.matchScore
      })),
      metricNames:route.metrics.slice(),metricValues:values,
      gameState:route.requiresLead?"leading":"unrestricted"
    }
  };
}

export function annotateGameControlChances(chances, phase) {
  // A defended lead or secure tempo has PREVENTED risk, not created an
  // unobserved event that can be attached to an unrelated shot.
  if (!Array.isArray(chances)||!phase||!phase.side) return chances;
  const at=chances.findIndex(chance=>chance.side===phase.side);
  if (at<0) return chances;
  const attacking=phase.side==="for";
  return chances.map((chance,i)=>i!==at?chance:{
    ...chance,
    tacticalMoment:{
      kind:attacking?"controlled_counter":"control_lost",
      label:attacking?"Kontring etter samlet forsvar":"Kontroll brutt",
      description:phase.cause,
      planId:phase.planId,planTitle:"Kampkontroll og utløsning",
      status:attacking?"advantage":"countered",side:phase.side,
      keyAction:phase.steps.find(s=>s.result==="blocked")?.action||
        phase.steps[phase.steps.length-1]?.action,
      cause:phase.cause,steps:phase.steps,
      observed:false,basis:"simulated_before_chances_v6",
      xgDelta:attacking?phase.xgDeltaFor:phase.xgDeltaAgainst
    }
  });
}

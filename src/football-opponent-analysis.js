import { evaluatePlanVsOpponent } from "./football-match-plan.js";
import { TACTICAL_SEQUENCES, TACTICAL_PRINCIPLE_SOURCES, evaluateTacticalSequences } from "./football-tactical-sequences.js";

// Motstanderforberedelse v1
//
// Et rent lærings- og planleggingslag over eksisterende terminliste,
// motstanderprofil og formasjons-matchup. Modulen beregner ingen kampbonus,
// rating eller skjult effekt. Den gjør datagrunnlaget om til en konkret
// arbeidsprosess: observasjon -> hypotese -> motgrep -> observasjonspunkt.
// Kampmotoren kan bruke focusId til å PRIORITERE en allerede eksisterende
// kampsituasjon som passer observasjonen; selve effekten kommer fortsatt bare
// fra managergrepet i den situasjonen.

export const OPPONENT_ANALYSIS_VERSION = "opponent-analysis.v1";

const FOCUS_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: "build_up",
    label: "Oppbyggingen deres",
    question: "Hvordan forsøker motstanderen å få ballen kontrollert ut av første fase?",
    hypothesis: "Hvis vi påvirker første pasning uten å åpne neste rom, kan vi styre hvor oppbyggingen deres fortsetter."
  }),
  Object.freeze({
    id: "press",
    label: "Presset deres",
    question: "Hvor starter presset, og hvilken pasning forsøker de å tvinge fram?",
    hypothesis: "Hvis vi kjenner pressutløseren og beholder en fri spiller bak første ledd, kan vi angripe rommet presset forlater."
  }),
  Object.freeze({
    id: "transition",
    label: "Overganger og restforsvar",
    question: "Hva skjer rett etter balltap og ballvinning, før lagene rekker å organisere seg?",
    hypothesis: "Plasseringen før balltapet avgjør om vi kan stoppe overgangen eller selv angripe et ubalansert lag."
  }),
  Object.freeze({
    id: "spaces",
    label: "Nøkkelrom og dueller",
    question: "Hvilke rom og relasjoner avgjør om motstanderens viktigste mønster lykkes?",
    hypothesis: "Hvis vi prioriterer den viktigste duellen uten å rive resten av laget fra hverandre, kan vi beskytte rommet mønsteret trenger."
  })
]);

const COUNTERMEASURES = Object.freeze({
  build_up: Object.freeze([
    Object.freeze({ id: "steer_first_pass", label: "Styr første pasning", target: "system", targetLabel: "Systemet", risk: "Går første pressledd alene, åpnes pasningen bak det.", watch: "Se hvilken spiller som får motta den andre pasningen, ikke bare hvem som starter angrepet." }),
    Object.freeze({ id: "train_press_trigger", label: "Tren pressutløseren", target: "training", targetLabel: "Lag · Trening", risk: "En øvelse uten tydelig utløser kan bli løping uten felles timing.", watch: "Se om nærmeste spiller presser samtidig som laget bak flytter etter." }),
    Object.freeze({ id: "protect_next_space", label: "Beskytt neste rom", target: "tactics", targetLabel: "Lag · Oppstilling", risk: "For mye sikring kan gi motstanderen tid i første fase.", watch: "Se om laget stenger mottakeren motstanderen egentlig vil nå." })
  ]),
  press: Object.freeze([
    Object.freeze({ id: "free_player", label: "Skap en fri spiller", target: "system", targetLabel: "Systemet", risk: "Å lokke presset inn krever presisjon nær eget mål.", watch: "Se hvem som blir fri når første pressledd går mot ballfører." }),
    Object.freeze({ id: "train_escape", label: "Tren å spille av presset", target: "training", targetLabel: "Lag · Trening", risk: "For stort område gjør presset urealistisk; for lite område skjuler rommet bak det.", watch: "Se om laget finner framoverpasningen etter at presset er brutt." }),
    Object.freeze({ id: "keep_exit", label: "Behold en sikker utvei", target: "tactics", targetLabel: "Lag · Oppstilling", risk: "En ren sikkerhetsløsning kan gjøre oppbyggingen for passiv.", watch: "Se om ballfører har støtte både bakover og gjennom pressleddet." })
  ]),
  transition: Object.freeze([
    Object.freeze({ id: "secure_before_loss", label: "Sikre før balltapet", target: "system", targetLabel: "Systemet", risk: "For mange bak ballen kan svekke tilstedeværelsen rundt motstanderens mål.", watch: "Se plasseringen til de tre nærmeste sikringsspillerne idet angrepet pågår." }),
    Object.freeze({ id: "train_transition_window", label: "Tren overgangsvinduet", target: "training", targetLabel: "Lag · Trening", risk: "Høy fart uten en tydelig første handling trener kaos mer enn valg.", watch: "Se første blikk og første løp umiddelbart etter ballvinning eller balltap." }),
    Object.freeze({ id: "balance_around_ball", label: "Hold balanse rundt ballen", target: "tactics", targetLabel: "Lag · Oppstilling", risk: "Kortere sikringsavstander kan redusere bredden i angrepet.", watch: "Se om én spiller støtter ballen mens en annen beskytter rommet bak." })
  ]),
  spaces: Object.freeze([
    Object.freeze({ id: "prioritize_duel", label: "Prioriter nøkkelduellen", target: "tactics", targetLabel: "Lag · Oppstilling", risk: "Overhjelp i én duell kan åpne en annen sone.", watch: "Se hvem som sikrer bak spilleren som går inn i nøkkelduellen." }),
    Object.freeze({ id: "shift_block", label: "Flytt laget mot fareområdet", target: "system", targetLabel: "Systemet", risk: "En forskjøvet blokk kan gi bort motsatt side hvis presset på ballen er svakt.", watch: "Se avstanden fra ballside til motsatt side når motstanderen vender spillet." }),
    Object.freeze({ id: "train_key_relation", label: "Tren den avgjørende relasjonen", target: "training", targetLabel: "Lag · Trening", risk: "En isolert duell forklarer lite hvis støtten rundt ikke er med i øvelsen.", watch: "Se handlingen til medspilleren før og etter selve duellen." })
  ])
});

const asArray = (value) => (Array.isArray(value) ? value : []);

// Keep scouting explanations tied to existing role and skill rules.
const TACTICAL_ROLE_GROUPS = Object.freeze({
  pressScore: ["pressing_forward", "pressing_midfielder", "box_to_box"],
  depthScore: ["channel_runner", "advanced_forward", "pressing_forward"],
  widthScore: ["wide_dribbler", "inverted_winger", "wingback", "overlapping_fullback"]
});

export function buildOpponentTacticalOpportunities({ opponent, tactic, teamFit } = {}) {
  // A generic club without documented style traits offers no verifiable exploit.
  if (!opponent?.styleTraits || !tactic) return [];
  const matchup = evaluatePlanVsOpponent(tactic, opponent, { tacticalProfile: teamFit?.metrics });
  const incomplete = Number(teamFit?.completeCount) < Number(teamFit?.totalSlots);
  return asArray(matchup?.opportunities).map((opportunity) => {
    const combinations = asArray(matchup?.combinations)
      .filter((combination) => combination.opportunityId === opportunity.id);
    const countered = opportunity.readiness === "ready"
      && combinations.some((combination) => combination.counter.status === "active");
    const supportingRoles = asArray(teamFit?.assignments)
      .filter((entry) => entry?.isComplete
        && TACTICAL_ROLE_GROUPS[opportunity.metric]?.includes(entry.role?.id))
      .map((entry) => ({
        player: entry.player?.name || entry.player?.id || "",
        role: entry.role?.name || entry.role?.id || ""
      })).filter((entry) => entry.player && entry.role);
    const contribution = teamFit?.sourcedSkillTendencies?.[opportunity.metric];
    return {
      ...opportunity,
      readiness: incomplete ? "incomplete" : countered ? "countered" : opportunity.readiness,
      combinations,
      supportingRoles,
      documentedPlayers: [...new Set(asArray(contribution?.players).filter(Boolean))],
      hasDocumentedSkill: Number(contribution?.bonus) > 0
    };
  });
}


// Scouting explains the SAME one tactical chain as the live xG calculation.
// Every catalogued plan has four interacting moves and a possible opponent
// countermove. Modelling a response is not proof that the opponent uses it.
// Match real selected roles to existing formation/team metrics; these roles
// are not claims about a player's unverified historical abilities.
const SEQUENCE_METRIC_ROLES = Object.freeze({
  pressScore: ["pressing_forward","pressing_midfielder","box_to_box"],
  depthScore: ["channel_runner","advanced_forward","pressing_forward","wide_dribbler"],
  widthScore: ["wide_dribbler","inverted_winger","wingback","overlapping_fullback"],
  balanceScore: ["balancing_six","holding_midfielder","deep_playmaker","regista"],
  restDefenseScore: ["balancing_six","holding_midfielder","support_fullback","duel_centre_back","stopper"],
  buildUpScore: ["deep_playmaker","regista","holding_midfielder","ball_playing_centre_back","libero","sweeperkeeper"]
});

const SEQUENCE_METRIC_LABELS = Object.freeze({
  pressScore: "Press og timing",
  depthScore: "Dybdeløp og romtrussel",
  widthScore: "Bredde fra kant og back",
  balanceScore: "Sentral balanse",
  restDefenseScore: "Restforsvar og sikring",
  buildUpScore: "Oppbygging og pasningsstøtte"
});

export function buildOpponentTacticalSequences({ opponent, tactic, teamFit, responseTeamFit = null, tactics } = {}) {
  const catalogPattern = TACTICAL_SEQUENCES.find((pattern) => pattern.tacticId === tactic?.id);
  if (!catalogPattern) return [];
  const matchup = opponent?.styleTraits
    ? evaluatePlanVsOpponent(tactic, opponent, { tacticalProfile: teamFit?.metrics })
    : null;
  const result = asArray(matchup?.sequences).find((pattern) => pattern.id === catalogPattern.tacticId);
  const rosterKnown = teamFit && Number.isFinite(Number(teamFit.completeCount))
    && Number.isFinite(Number(teamFit.totalSlots));
  const incomplete = rosterKnown && Number(teamFit.completeCount) < Number(teamFit.totalSlots);
  const checks = Object.entries(catalogPattern.requires).map(([metric, minimum]) => {
    const raw = teamFit?.metrics?.[metric];
    const value = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
    const provenance = teamFit?.sourcedSkillTendencies?.[metric];
    const supportingRoles = asArray(teamFit?.assignments)
      .filter((assignment) => assignment?.isComplete &&
        SEQUENCE_METRIC_ROLES[metric]?.includes(assignment.role?.id))
      .map((assignment) => ({
        player: assignment.player?.name || assignment.player?.id || "",
        role: assignment.role?.name || assignment.role?.id || ""
      })).filter((entry) => entry.player && entry.role);
    return {
      metric, label: SEQUENCE_METRIC_LABELS[metric] || metric,
      minimum, value,
      status: value === null ? "unknown" : value >= minimum ? "ready" : "gap",
      supportingRoles,
      documentedPlayers: [...new Set(asArray(provenance?.players).filter((v) => typeof v === "string" && v.trim()))]
    };
  });
  const triggerValue = opponent?.styleTraits?.[catalogPattern.opponentCondition.trait]
    ?? opponent?.[catalogPattern.opponentCondition.trait];
  const triggerKnown = typeof triggerValue === "number" && Number.isFinite(triggerValue);
  // A partially observed opponent is not the same as an opponent with no
  // exploitable weakness. Similarly, an unknown team metric is not a
  // demonstrated deficiency in the players or formation.
  const status = incomplete ? "incomplete"
    : !opponent?.styleTraits || !triggerKnown ? "unknown_opponent"
    : !teamFit?.metrics || checks.some((check) => check.status === "unknown") ? "unknown_team"
    : !result ? "not_exposed"
    : result.status;
  // Candidate only. Selecting a new tactic remains a conscious manager action;
  // no counter-counter bonus is created by naming this option.
  const nextPlan = asArray(tactics).find((plan) =>
    plan?.id === catalogPattern.responsePlanId) || null;
  const nextPattern = TACTICAL_SEQUENCES.find((pattern) =>
    pattern.tacticId === nextPlan?.id) || null;
  // A source-backed suggestion is not a guarantee. Use the team's REAL
  // role/formation fit recalculated for the proposed plan, when provided by
  // the app. Legacy contexts without it remain explicitly provisional.
  const previewFit = responseTeamFit || teamFit;
  const responseChecks = Object.entries(nextPattern?.requires || {}).map(([metric, minimum]) => {
    const raw = previewFit?.metrics?.[metric];
    const value = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
    return { metric, label: SEQUENCE_METRIC_LABELS[metric] || metric,
      minimum, value, status: value === null ? "unknown" : value >= minimum ? "ready" : "gap" };
  });
  const responseEvaluation = nextPlan && opponent?.styleTraits && previewFit?.metrics
    ? evaluateTacticalSequences(nextPlan.id, opponent, previewFit.metrics)[0] || null
    : null;
  const responseTriggerTrait = nextPattern?.opponentCondition?.trait;
  const responseTrigger = opponent?.styleTraits?.[responseTriggerTrait] ?? opponent?.[responseTriggerTrait];
  const responseStatus = !nextPlan || !nextPattern ? "unavailable"
    : incomplete ? "incomplete"
    : !opponent?.styleTraits || !Number.isFinite(responseTrigger) ? "unknown_opponent"
    : !previewFit?.metrics || responseChecks.some((check) => check.status === "unknown") ? "unknown_team"
    : responseEvaluation?.status || "not_exposed";
  const responsePreview = {
    status: responseStatus,
    basis: responseTeamFit ? "proposed_plan" : "current_plan",
    requirements: responseChecks,
    metCount: responseChecks.filter((check) => check.status === "ready").length,
    requiredCount: responseChecks.length,
    risk: asArray(nextPlan?.risks)[0] || "",
    responsePattern: nextPattern?.title || "",
    // Recomputed preview still does not include an in-match switch cost,
    // future player condition or late tactical adaptations.
    explanation: {
      advantage: responseTeamFit
        ? "Dagens ellever har dekning når rolle- og formasjonsbidrag beregnes med den foreslåtte planen. Omstillingskostnad kommer i tillegg."
        : "Foreløpig dekning med dagens kampplan. Den foreslåtte taktikken må beregnes på nytt før valg.",
      unsupported: "Dagens ellever mangler minst ett nødvendig lagledd for alternativet.",
      countered: "Motstanderen har også et motgrep mot det foreslåtte alternativet.",
      unknown_counter: "Rollene kan støtte alternativet, men motstanderens motgrep er ikke kartlagt.",
      not_exposed: "Den kjente motstanderprofilen viser ikke svakheten dette alternativet søker.",
      incomplete: "Elleveren er ikke komplett. Ingen taktisk anbefaling kan konkluderes.",
      unknown_team: "Lagets taktiske dekning er ukjent. Vurder roller og formasjon først.",
      unknown_opponent: "Motstanderens taktiske trekk er utilstrekkelig kartlagt.",
      unavailable: "Det foreslåtte alternativet finnes ikke i aktiv kampplankatalog."
    }[responseStatus]
  };
  return [{
    id: catalogPattern.tacticId, title: catalogPattern.title,
    responsePlanId: catalogPattern.responsePlanId,
    responsePlanName: nextPlan?.name || null,
    responsePreview,
    moves: catalogPattern.moves.slice(),
    mechanism: catalogPattern.mechanism,
    counterLogic: catalogPattern.counterLogic,
    failureMode: catalogPattern.failureMode,
    observation: catalogPattern.observation,
    phase: catalogPattern.phase,
    principleSourceIds: catalogPattern.principleSourceIds.slice(),
    principleSources: catalogPattern.principleSourceIds
      .map(id => TACTICAL_PRINCIPLE_SOURCES[id])
      .filter(Boolean),
    counter: catalogPattern.counter, response: catalogPattern.response,
    // Current simulated opponent movement, if one occurred during the match.
    // No claim that historical opponents exhibited this exact movement.
    liveExchange: result?.liveExchange || null,
    trigger: {
      trait: catalogPattern.opponentCondition.trait,
      value: triggerKnown ? triggerValue : null,
      minimum: catalogPattern.opponentCondition.min
    },
    checks, status, edgeDelta: status === "advantage" ? 1 : 0,
    risk: asArray(tactic?.risks)[0] || "",
    // Every user-facing verdict refers to the evaluated current formation/XI.
    // 'Not exposed' and 'unknown opponent' must not imply poor player skill.
    explanation: {
      advantage: "Motstanderen gir et relevant rom; alle nødvendige lagledd støtter mønsteret.",
      countered: "Motstanderen har et modellert motgrep som stopper denne spillkjeden.",
      unsupported: "Minst ett nødvendig ledd i egen rolle- eller formasjonsdekning mangler.",
      unknown_counter: "Mulig sårbarhet finnes, men motstanderens motgrep er ikke kartlagt.",
      unknown_team: "Minst én nødvendig lagdimensjon er ikke målt. Ukjent er ikke en svakhet hos spilleren.",
      incomplete: "Elleveren er ikke komplett; vurderingen må kontrolleres igjen etter laguttak.",
      not_exposed: "Denne motstanderprofilen gir ikke grunnlag for å aktivere mønsteret.",
      unknown_opponent: "Motstanderen mangler tilstrekkelig taktisk profil for denne vurderingen."
    }[status]
  }];
}

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function unique(values) {
  return [...new Set(values.map((value) => text(value)).filter(Boolean))];
}

function matchupText(items) {
  return asArray(items).map((item) => text(typeof item === "string" ? item : item?.text)).filter(Boolean);
}

function signalsForFocus(opponent, matchup, focusId) {
  const strengths = asArray(opponent?.strengths);
  const weaknesses = asArray(opponent?.weaknesses);
  const pressurePoints = asArray(opponent?.pressurePoints);
  const keyBattles = asArray(opponent?.keyBattles);
  const dangerZones = asArray(opponent?.dangerZones);
  const vulnerableZones = asArray(opponent?.vulnerableZones);
  const risks = matchupText(matchup?.risks);
  const advantages = matchupText(matchup?.advantages);
  const suggestions = matchupText(matchup?.suggestions);

  if (focusId === "build_up") {
    return unique([
      opponent?.buildUpStyle,
      opponent?.inPossessionShape,
      strengths[0],
      pressurePoints[0],
      ...risks.slice(0, 1),
      ...suggestions.slice(0, 1)
    ]).slice(0, 5);
  }
  if (focusId === "press") {
    return unique([
      opponent?.outOfPossessionShape,
      opponent?.defensiveBlock,
      strengths[0],
      pressurePoints[0],
      ...risks.slice(0, 1),
      ...suggestions.slice(0, 1)
    ]).slice(0, 5);
  }
  if (focusId === "transition") {
    return unique([
      opponent?.attackingStyle,
      strengths[1] || strengths[0],
      weaknesses[0],
      vulnerableZones[0],
      ...risks.slice(0, 1),
      ...advantages.slice(0, 1)
    ]).slice(0, 5);
  }
  return unique([
    keyBattles[0],
    keyBattles[1],
    dangerZones[0],
    vulnerableZones[0],
    ...risks.slice(0, 1),
    ...advantages.slice(0, 1)
  ]).slice(0, 5);
}

export function createOpponentAnalysisWorkspace({ fixture = null, formation = null, tactic = null, teamFit = null, responseTeamFit = null, tactics = [], trainingLabel = "Ikke valgt" } = {}) {
  const opponent = fixture?.opponent || null;
  if (!fixture?.fixtureId || !opponent?.id) {
    return {
      kind: "no_fixture",
      headline: "Ingen motstander er klar for analyse",
      explanation: "Start en ligasesong eller vent til terminlisten har en spillbar kamp. Analyseavdelingen dikter ikke en motstander når kampdata mangler.",
      focuses: []
    };
  }

  const matchup = fixture.formationMatchup || null;
  const focuses = FOCUS_DEFINITIONS.map((focus) => {
    const signals = signalsForFocus(opponent, matchup, focus.id);
    return {
      ...focus,
      signals,
      countermeasures: COUNTERMEASURES[focus.id].map((measure) => ({
        ...measure,
        why: signals[0]
          ? `Profilen viser: ${signals[0]}`
          : "Dette er et faglig standardgrep. Datagrunnlaget er for tynt til å kalle det fasit."
      }))
    };
  });

  return {
    kind: "fixture",
    fixtureId: text(fixture.fixtureId),
    round: Number(fixture.round) || null,
    homeAway: fixture.homeAway === "home" ? "Hjemme" : fixture.homeAway === "away" ? "Borte" : "",
    opponent: {
      id: text(opponent.id),
      name: text(opponent.name || opponent.displayName, "Ukjent motstander"),
      style: text(opponent.style),
      styleName: text(opponent.archetypeName || opponent.styleName || opponent.shortLabel),
      inPossessionShape: text(opponent.inPossessionShape),
      outOfPossessionShape: text(opponent.outOfPossessionShape)
    },
    ownPlan: {
      formation: text(formation?.name, "Formasjon ikke valgt"),
      tactic: text(tactic?.name, "Kampplan ikke valgt"),
      training: text(trainingLabel, "Ikke valgt")
    },
    matchup,
    tacticalOpportunities: buildOpponentTacticalOpportunities({ opponent, tactic, teamFit }),
    tacticalSequences: buildOpponentTacticalSequences({ opponent, tactic, teamFit, responseTeamFit, tactics }),
    focuses
  };
}

export function getOpponentAnalysisFocus(workspace, focusId) {
  return asArray(workspace?.focuses).find((focus) => focus.id === focusId) || null;
}

export function createOpponentAnalysisPlan({ workspace, focusId, countermeasureId, week = null } = {}) {
  if (workspace?.kind !== "fixture") return null;
  const focus = getOpponentAnalysisFocus(workspace, focusId);
  const countermeasure = asArray(focus?.countermeasures).find((entry) => entry.id === countermeasureId) || null;
  if (!focus || !countermeasure) return null;
  return {
    version: OPPONENT_ANALYSIS_VERSION,
    fixtureId: workspace.fixtureId,
    opponentId: workspace.opponent.id,
    opponentName: workspace.opponent.name,
    round: workspace.round,
    week: Number(week) || null,
    focusId: focus.id,
    focusLabel: focus.label,
    question: focus.question,
    hypothesis: focus.hypothesis,
    evidence: focus.signals.slice(0, 3),
    countermeasureId: countermeasure.id,
    countermeasureLabel: countermeasure.label,
    target: countermeasure.target,
    targetLabel: countermeasure.targetLabel,
    why: countermeasure.why,
    risk: countermeasure.risk,
    watch: countermeasure.watch
  };
}

export function normalizeOpponentAnalysisPlan(value) {
  if (!value || value.version !== OPPONENT_ANALYSIS_VERSION) return null;
  const fixtureId = text(value.fixtureId);
  const opponentId = text(value.opponentId);
  const focusId = text(value.focusId);
  const countermeasureId = text(value.countermeasureId);
  if (!fixtureId || !opponentId || !focusId || !countermeasureId) return null;
  return {
    version: OPPONENT_ANALYSIS_VERSION,
    fixtureId,
    opponentId,
    opponentName: text(value.opponentName, "Ukjent motstander"),
    round: Number(value.round) || null,
    week: Number(value.week) || null,
    focusId,
    focusLabel: text(value.focusLabel, focusId),
    question: text(value.question),
    hypothesis: text(value.hypothesis),
    evidence: unique(asArray(value.evidence)).slice(0, 3),
    countermeasureId,
    countermeasureLabel: text(value.countermeasureLabel, countermeasureId),
    target: text(value.target),
    targetLabel: text(value.targetLabel),
    why: text(value.why),
    risk: text(value.risk),
    watch: text(value.watch)
  };
}

export function isOpponentAnalysisPlanForFixture(plan, fixtureId) {
  const normalized = normalizeOpponentAnalysisPlan(plan);
  return Boolean(normalized && normalized.fixtureId === text(fixtureId));
}

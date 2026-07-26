// Simulering: kampplaner som strategi, og bytte av plan midt i kampen.
//
// Kampplanen var én av fem, valgt før avspark og låst der. Nå er den 18 planer
// i seks familier, og den kan byttes underveis — med en pris. Denne vakta
// kjører den rene motoren og sjekker at prisen faktisk finnes, at den avhenger
// av hvor stort spranget er og hvor godt treneren forstår systemet, og at
// byttet ender opp i kampresultatet. Exit 1 ved brudd.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  GAME_STATES,
  MATCH_PLAN_VERSION,
  applyOpponentAdjustment,
  deriveOpponentAdjustment,
  scorePlanNow,
  calculateSwitchCost,
  createPlanChange,
  evaluatePlanForGameState,
  evaluatePlanVsOpponent,
  normalizeMatchPlan,
  planDistance,
  rankPlansForSituation,
  readGameState
} from "../src/football-match-plan.js";
import {
  applyMatchPlanChange,
  applyOpponentAdaptation,
  createMatchdaySession,
  finalizeMatchdaySession,
  getMatchdayGameState
} from "../src/football-matchday-engine.js";
import { getHistoricalOpponentProfile } from "../src/football-historical-opponent-profiles.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "data/football_tactics.json"), "utf8"));
const plans = data.tactics;
const byId = new Map(plans.map((p) => [p.id, p]));

const checks = [];
function check(label, run) {
  run();
  checks.push(label);
  console.log(`  ok   ${label}`);
}

console.log("Kampplan v1 — strategi og bytte underveis\n");

// ---------------------------------------------------------------------------
check("katalogen er utvidet og organisert i familier", () => {
  assert.equal(data.schema, "historygo-football-manager.tactics.v2");
  assert.ok(plans.length >= 15, `bare ${plans.length} kampplaner`);
  assert.ok(Array.isArray(data.families) && data.families.length >= 5);
  const familyIds = new Set(data.families.map((f) => f.id));
  plans.forEach((plan) => {
    assert.ok(familyIds.has(plan.family), `${plan.id} peker på ukjent familie ${plan.family}`);
  });
  // Hver familie må ha minst to planer, ellers er den ikke en familie.
  data.families.forEach((family) => {
    const count = plans.filter((p) => p.family === family.id).length;
    assert.ok(count >= 2, `${family.id} har bare ${count} plan(er)`);
  });
});

check("hver plan forklarer seg selv (intensjon, styrker, risiko)", () => {
  plans.forEach((plan) => {
    assert.ok(plan.intent && plan.intent.length > 15, `${plan.id} mangler intensjon`);
    assert.ok(plan.strengths?.length >= 2, `${plan.id} mangler styrker`);
    assert.ok(plan.risks?.length >= 2, `${plan.id} mangler risiko`);
    assert.ok(plan.gameStates?.length >= 1, `${plan.id} sier ikke når den passer`);
    plan.gameStates.forEach((state) => assert.ok(GAME_STATES.includes(state), `${plan.id}: ukjent ${state}`));
  });
});

check("ingen plan passer alle kampbilder alene", () => {
  // Én plan som «alltid passer» ville gjort valget meningsløst.
  const universal = plans.filter((plan) => plan.gameStates.length === GAME_STATES.length);
  assert.ok(universal.length <= 1, `for mange universalplaner: ${universal.map((p) => p.id).join(", ")}`);
  // Og hvert kampbilde må ha flere planer å velge mellom.
  GAME_STATES.forEach((state) => {
    const count = plans.filter((plan) => plan.gameStates.includes(state)).length;
    assert.ok(count >= 3, `bare ${count} planer for ${state}`);
  });
});

// ---------------------------------------------------------------------------
check("avstanden mellom planer speiler hvor stort spranget er", () => {
  const seeOut = byId.get("see_out_the_game");
  const allOut = byId.get("all_out_attack");
  const patient = byId.get("patient_build_up");
  assert.equal(planDistance(seeOut, seeOut), 0);
  // Lukk kampen -> Alt frem er det største spranget som finnes.
  const extreme = planDistance(seeOut, allOut);
  const mild = planDistance(patient, byId.get("central_possession_4231"));
  assert.ok(extreme > 60, `for kort avstand på ytterpunktene: ${extreme}`);
  assert.ok(mild < extreme, `${mild} skal være mindre enn ${extreme}`);
});

check("bytte koster taktisk klarhet — og et stort bytte koster mer", () => {
  const coach = { coachUnderstanding: 50, formationFamiliarity: 50 };
  const small = calculateSwitchCost({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("central_possession_4231"),
    coachSnapshot: coach,
    eventsRemaining: 2
  });
  const big = calculateSwitchCost({
    fromPlan: byId.get("see_out_the_game"),
    toPlan: byId.get("all_out_attack"),
    coachSnapshot: coach,
    eventsRemaining: 2
  });
  assert.ok(small.clarityCost < 0, "et bytte må koste noe");
  assert.ok(big.clarityCost < small.clarityCost, "stort sprang må koste mer enn lite");
  assert.ok(big.riskCost > small.riskCost);
  // Samme plan koster ingenting.
  const none = calculateSwitchCost({
    fromPlan: byId.get("high_press_343"),
    toPlan: byId.get("high_press_343"),
    coachSnapshot: coach
  });
  assert.equal(none.clarityCost, 0);
  assert.equal(none.settled, true);
});

check("treneren som forstår systemet betaler mindre for omstillingen", () => {
  const args = { fromPlan: byId.get("see_out_the_game"), toPlan: byId.get("all_out_attack"), eventsRemaining: 2 };
  const clueless = calculateSwitchCost({ ...args, coachSnapshot: { coachUnderstanding: 10, formationFamiliarity: 10 } });
  const sharp = calculateSwitchCost({ ...args, coachSnapshot: { coachUnderstanding: 95, formationFamiliarity: 95 } });
  assert.ok(sharp.clarityCost > clueless.clarityCost,
    `god trener (${sharp.clarityCost}) må betale mindre enn dårlig (${clueless.clarityCost})`);
});

check("sent bytte koster mer enn tidlig bytte", () => {
  const args = {
    fromPlan: byId.get("central_possession_4231"),
    toPlan: byId.get("all_out_attack"),
    coachSnapshot: { coachUnderstanding: 50, formationFamiliarity: 50 }
  };
  const early = calculateSwitchCost({ ...args, eventsRemaining: 3 });
  const late = calculateSwitchCost({ ...args, eventsRemaining: 0 });
  assert.ok(late.clarityCost < early.clarityCost,
    `sent (${late.clarityCost}) må koste mer enn tidlig (${early.clarityCost})`);
});

// ---------------------------------------------------------------------------
check("kampbildet leses av grepene, ikke av en resultattavle", () => {
  const flat = readGameState({ decisions: [] });
  assert.equal(flat.state, "level");
  const good = readGameState({ decisions: [{ effects: { momentumDelta: 3 } }] });
  assert.equal(good.state, "leading");
  const bad = readGameState({ decisions: [{ effects: { momentumDelta: -3 } }] });
  assert.equal(bad.state, "behind");
});

check("en plan for et annet kampbilde blir sagt ifra om", () => {
  const seeOut = evaluatePlanForGameState(byId.get("see_out_the_game"), "behind");
  assert.equal(seeOut.fits, false);
  assert.ok(seeOut.note.includes("Lukk kampen"));
  assert.ok(seeOut.momentumDelta < 0);
  const chase = evaluatePlanForGameState(byId.get("chase_the_equaliser"), "behind");
  assert.equal(chase.fits, true);
  assert.ok(chase.momentumDelta > 0);
});

check("planen vurderes mot motstanderens historiske stil", () => {
  // Barcelona 2008-12 bygger kort — press skal lønne seg mot dem.
  const possessionSide = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  assert.ok(possessionSide, "fant ikke motstanderprofilen");
  const press = evaluatePlanVsOpponent(byId.get("counter_press_recovery"), possessionSide);
  assert.ok(press.edge > 0, "press mot kort oppbygging må være gunstig");
  assert.ok(press.notes.length > 0);

  // Leicester 2015-16 lever på omstilling — en høy linje mot dem er dyrt.
  const counterSide = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const highLine = evaluatePlanVsOpponent(byId.get("all_out_attack"), counterSide);
  assert.ok(highLine.edge <= 0, "høy linje mot kontringslag skal ikke belønnes");
});

check("planlista sorteres etter hva som passer situasjonen", () => {
  const ranked = rankPlansForSituation(plans, {
    currentPlan: byId.get("central_possession_4231"),
    gameState: "behind",
    opponent: getHistoricalOpponentProfile("inter_1960s_catenaccio")
  });
  assert.equal(ranked.length, plans.length);
  assert.equal(ranked[0].isCurrent, true, "gjeldende plan skal stå først");
  const rest = ranked.slice(1);
  const firstMismatch = rest.findIndex((entry) => !entry.fitsGameState);
  if (firstMismatch >= 0) {
    rest.slice(firstMismatch).forEach((entry) => {
      assert.equal(entry.fitsGameState, false, "planer som passer bildet må stå før dem som ikke gjør det");
    });
  }
});

// ---------------------------------------------------------------------------
// Hele veien gjennom en kamp.
function buildSession(planId) {
  return createMatchdaySession({
    teamFit: {
      teamScore: 72,
      metrics: { balance: 70, width: 68, depth: 66, buildUp: 71, press: 69, restDefense: 67 },
      assignments: []
    },
    formation: { id: "modern_433", name: "Modern 4-3-3", slots: [] },
    tactic: byId.get(planId),
    opponent: getHistoricalOpponentProfile("milan_1988_90_sacchi"),
    coachContext: { coachUnderstanding: 60, formationFamiliarity: 55, tacticalLearningSpeed: 50, roleFitClarity: 55 }
  });
}

check("en ny sesjon starter med planen du valgte, og uten bytter", () => {
  const session = buildSession("central_possession_4231");
  assert.equal(session.selectedTacticId, "central_possession_4231");
  assert.deepEqual(session.planChanges, []);
  assert.equal(getMatchdayGameState(session).state, "level");
});

check("planbytte registreres på sesjonen uten å mutere den gamle", () => {
  const before = buildSession("central_possession_4231");
  const snapshot = JSON.stringify(before);
  const after = applyMatchPlanChange(before, byId.get("chase_the_equaliser"));
  assert.equal(JSON.stringify(before), snapshot, "motoren skal ikke mutere sesjonen den fikk");
  assert.equal(after.planChanges.length, 1);
  assert.equal(after.selectedTacticId, "chase_the_equaliser");
  assert.equal(after.activePlanSnapshot.id, "chase_the_equaliser");
  const change = after.planChanges[0];
  assert.equal(change.fromPlanId, "central_possession_4231");
  assert.equal(change.toPlanId, "chase_the_equaliser");
  assert.ok(change.distance > 0);
  assert.ok(change.feedback.length > 10, "byttet må forklare seg");
  assert.ok(change.effects.tacticalClarityDelta < 0, "omstillingen må koste klarhet");
});

check("bytte til samme plan gjør ingenting", () => {
  const session = buildSession("high_press_343");
  const same = applyMatchPlanChange(session, byId.get("high_press_343"));
  assert.equal(same, session);
  assert.equal(same.planChanges.length, 0);
});

check("flere bytter i samme kamp stables", () => {
  let session = buildSession("central_possession_4231");
  session = applyMatchPlanChange(session, byId.get("high_press_343"));
  session = applyMatchPlanChange(session, byId.get("see_out_the_game"));
  assert.equal(session.planChanges.length, 2);
  assert.equal(session.planChanges[0].toPlanId, "high_press_343");
  assert.equal(session.planChanges[1].fromPlanId, "high_press_343");
  assert.equal(session.planChanges[1].toPlanId, "see_out_the_game");
});

check("byttet havner i kampresultatet og i rapporten", () => {
  const plain = finalizeMatchdaySession(buildSession("central_possession_4231"));
  const switched = finalizeMatchdaySession(
    applyMatchPlanChange(buildSession("central_possession_4231"), byId.get("all_out_attack"))
  );
  assert.equal(plain.planChanges.length, 0);
  assert.equal(switched.planChanges.length, 1);
  assert.equal(switched.activePlanSnapshot.id, "all_out_attack");
  // Omstillingen må faktisk endre regnestykket, ikke bare stå i loggen.
  assert.notDeepEqual(plain.decisionTotals, switched.decisionTotals);
  assert.ok(switched.decisionTotals.tacticalClarityDelta < 0);
});

check("en ferdigspilt kamp tar ikke imot flere planbytter", () => {
  const session = { ...buildSession("high_press_343"), phase: "resolved" };
  const after = applyMatchPlanChange(session, byId.get("see_out_the_game"));
  assert.equal(after, session);
});

check("motoren er deterministisk", () => {
  const a = applyMatchPlanChange(buildSession("central_possession_4231"), byId.get("all_out_attack"));
  const b = applyMatchPlanChange(buildSession("central_possession_4231"), byId.get("all_out_attack"));
  assert.equal(JSON.stringify(a.planChanges), JSON.stringify(b.planChanges));
});

check("planene normaliseres trygt", () => {
  assert.equal(normalizeMatchPlan(null), null);
  const safe = normalizeMatchPlan({ id: "x" });
  assert.equal(safe.intensity, 60);
  assert.deepEqual(safe.gameStates, []);
  assert.ok(MATCH_PLAN_VERSION.startsWith("historygo-football-manager."));
});


// ---------------------------------------------------------------------------
// Tre spørsmål som avdekket ekte hull: står planen i forhold til motstanderen,
// svarer motstanderen, og lønner det seg å rette opp et dårlig kampbilde?
// ---------------------------------------------------------------------------
check("planen du VELGER teller mot motstanderen fra avspark", () => {
  // Før: matchupen mot motstanderen slo bare inn hvis du tilfeldigvis byttet
  // plan underveis. Lot du planen stå, var valget gratis.
  const shortBuildUpSide = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  const build = (planId) => createMatchdaySession({
    teamFit: {
      teamScore: 72, completeCount: 11, totalSlots: 11,
      metrics: { balanceScore: 70, widthScore: 68, depthScore: 66, buildUpScore: 71, pressScore: 69, restDefenseScore: 67 },
      assignments: []
    },
    formation: { id: "modern_433", name: "Modern 4-3-3", slots: [] },
    tactic: byId.get(planId),
    opponent: shortBuildUpSide,
    coachContext: { coachUnderstanding: 60, formationFamiliarity: 55 }
  });

  const pressing = build("counter_press_recovery");
  assert.ok(pressing.planMatchup, "sesjonen må bære planens matchup");
  assert.ok(pressing.planMatchup.edge > 0, "press mot kort oppbygging må være gunstig");

  const pressResult = finalizeMatchdaySession(pressing);
  const patientResult = finalizeMatchdaySession(build("patient_build_up"));
  assert.notDeepEqual(pressResult.expectedGoals, patientResult.expectedGoals,
    "planvalget må gi utslag i xG uten at man bytter");
  assert.ok(pressResult.expectedGoals.for > patientResult.expectedGoals.for,
    "planen som treffer motstanderen må gi mer trussel");
  assert.ok(pressResult.expectedGoals.against < patientResult.expectedGoals.against);
});

check("motstanderen svarer på kampbildet", () => {
  assert.equal(deriveOpponentAdjustment("level"), null, "et jevnt bilde gir ingen grunn til å justere");
  const pushUp = deriveOpponentAdjustment("leading");
  assert.equal(pushUp.id, "push_up", "styrer du bildet, må de ta sjansen");
  const sitBack = deriveOpponentAdjustment("behind");
  assert.equal(sitBack.id, "sit_back", "leder de, sikrer de det de har");
  // Samme justering skjer bare én gang.
  assert.equal(deriveOpponentAdjustment("leading", { alreadyAdjusted: ["push_up"] }), null);
});

check("justeringen endrer motstanderen uten å mutere profilen", () => {
  const base = getHistoricalOpponentProfile("inter_1960s_catenaccio");
  const before = JSON.stringify(base);
  const shifted = applyOpponentAdjustment(base, deriveOpponentAdjustment("leading"));
  assert.equal(JSON.stringify(base), before, "motstanderprofilen skal ikke muteres");
  assert.ok(shifted.styleTraits.pressIntensity > base.styleTraits.pressIntensity);
  assert.ok(shifted.styleTraits.highLine > base.styleTraits.highLine);
  assert.equal(shifted.adjustmentId, "push_up");
});

check("planen din måles på nytt når motstanderen har justert seg", () => {
  const session = buildSession("patient_build_up");
  // Kampen glipper for dem: momentum i din favør.
  const leading = { ...session, decisions: [{ effects: { momentumDelta: 3 } }] };
  const adapted = applyOpponentAdaptation(leading);
  assert.notEqual(adapted, leading, "bildet gir grunn til justering");
  assert.equal(adapted.opponentAdjustments.length, 1);
  assert.ok(adapted.opponentAdjustments[0].note.length > 20, "justeringen må forklares");
  // Rolig oppbygging mot et lag som nå presser høyt er dyrere enn før.
  assert.ok(adapted.planMatchup.edge <= leading.planMatchup.edge,
    "planen skal ikke bli bedre av at de presser hardere mot den");
  // Og den skjer bare én gang per type.
  assert.equal(applyOpponentAdaptation(adapted), adapted);
});

check("å rette opp et dårlig kampbilde lønner seg", () => {
  const opponent = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const struggling = {
    decisions: [{ effects: { momentumDelta: -4, riskDelta: 2 } }],
    coachSnapshot: { coachUnderstanding: 60, formationFamiliarity: 55 },
    opponent,
    events: [1, 2, 3]
  };
  const rescue = createPlanChange({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("chase_the_equaliser"),
    session: struggling, opponent, eventsRemaining: 2
  });
  const wrong = createPlanChange({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("see_out_the_game"),
    session: struggling, opponent, eventsRemaining: 2
  });

  assert.ok(rescue.improvement > 0, "riktig grep må registreres som en forbedring");
  assert.equal(rescue.tone, "positive");
  const rescueNet = rescue.effects.momentumDelta + rescue.effects.tacticalClarityDelta;
  const wrongNet = wrong.effects.momentumDelta + wrong.effects.tacticalClarityDelta;
  assert.ok(rescueNet > 0, `redningen må lønne seg netto (fikk ${rescueNet})`);
  assert.ok(rescueNet > wrongNet, "riktig grep må slå feil grep");
  assert.ok(rescue.rescueBonus > 0, "dyp trøbbel skal gi en redningsbonus");
});

check("samme grep er verdt mer når kampen glipper enn når alt flyter", () => {
  const opponent = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const make = (momentum) => createPlanChange({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("chase_the_equaliser"),
    session: {
      decisions: [{ effects: { momentumDelta: momentum } }],
      coachSnapshot: { coachUnderstanding: 60, formationFamiliarity: 55 },
      opponent, events: [1, 2, 3]
    },
    opponent, eventsRemaining: 2
  });
  const deepTrouble = make(-5);
  const mildTrouble = make(-2);
  assert.ok(deepTrouble.rescueBonus > mildTrouble.rescueBonus,
    "jo dypere trøbbel, jo mer er den riktige lesningen verdt");
});

check("å bytte bort en plan som passet bedre straffes", () => {
  const opponent = getHistoricalOpponentProfile("milan_1988_90_sacchi");
  const downgrade = createPlanChange({
    fromPlan: byId.get("chase_the_equaliser"),
    toPlan: byId.get("see_out_the_game"),
    session: {
      decisions: [{ effects: { momentumDelta: -4 } }],
      coachSnapshot: { coachUnderstanding: 60, formationFamiliarity: 55 },
      opponent, events: [1, 2, 3]
    },
    opponent, eventsRemaining: 1
  });
  assert.ok(downgrade.improvement < 0, "å forlate en plan som passet må telle negativt");
  assert.equal(downgrade.tone, "negative");
  assert.ok(downgrade.feedback.includes("bytter bort"));
});

check("scorePlanNow rangerer planer i en gitt situasjon", () => {
  const opponent = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const chasing = scorePlanNow(byId.get("chase_the_equaliser"), { gameState: "behind", opponent });
  const closing = scorePlanNow(byId.get("see_out_the_game"), { gameState: "behind", opponent });
  assert.ok(chasing > closing, "å jage utligning må slå å lukke kampen når du er under");
});

check("motstanderens justeringer havner i sluttrapporten", () => {
  let session = buildSession("high_press_343");
  session = { ...session, decisions: [{ effects: { momentumDelta: 3 } }] };
  session = applyOpponentAdaptation(session);
  const report = finalizeMatchdaySession(session);
  assert.equal(report.opponentAdjustments.length, 1);
  assert.ok(report.opponentAdjustments[0].label.length > 3);
});

console.log(`\nAlle ${checks.length} kampplansjekker besto (${plans.length} planer).`);

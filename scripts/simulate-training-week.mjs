// Read-only simulering av Treningsuke v0.2.
import {
  TRAINING_FOCUSES,
  sanitizeWeeklyTrainingFocus,
  calculateTrainingStaffSupport,
  recommendTrainingFocus,
  createTrainingMatchdaySnapshot
} from "../src/football-training-week.js";
import {
  createMatchdaySession,
  resolveMatchdayDecision,
  OPPONENT_PROFILES
} from "../src/football-matchday-engine.js";
import { computeMatchdayConsequences } from "../src/football-match-consequences.js";

let failures = 0;
function check(label, condition) {
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

const coachContext = {
  coachUnderstanding: 60,
  formationFamiliarity: 58,
  tacticalLearningSpeed: 62,
  roleFitClarity: 60,
  activeStaff: [
    { category: "tactical_coach" },
    { category: "fitness_coach" },
    { category: "assistant_coach" }
  ],
  effectProfile: {
    pressingDrills: 70,
    defensiveOrganisation: 66,
    attackingPatterns: 64,
    roleFitClarity: 62,
    formationFamiliarity: 64
  }
};
const teamFit = {
  teamScore: 68, completeCount: 11, totalSlots: 11,
  metrics: { balanceScore: 60, widthScore: 55, depthScore: 58, buildUpScore: 57, pressScore: 60, restDefenseScore: 52, roleFitAverage: 61 },
  relationships: { relationshipScore: 60 },
  historicalFormationFit: { historicalScore: 64, historicalBonus: 1, historicalPenalty: 0 },
  badgeEffects: {}
};
const formation = { id: "test_433", name: "Test 4-3-3", matchEngineEffects: { pressingIntensity: 6, defensiveSecurity: 4 } };

console.log("Treningsuke v0.2-simulering");

console.log("\nModell og lagring:");
check("8 små fokusvalg finnes", TRAINING_FOCUSES.length === 8);
const selected = { focusId: "pressing", week: 3, appliedSessionId: null };
const reloaded = sanitizeWeeklyTrainingFocus(JSON.parse(JSON.stringify(selected)));
check("reload beholder fokus og uke", reloaded?.focusId === "pressing" && reloaded.week === 3);
check("ugyldig fokus forkastes", sanitizeWeeklyTrainingFocus({ focusId: "unlock_players", week: 3 }) === null);
check("relevant stab gir minst middels støtte", calculateTrainingStaffSupport({ focusId: "pressing", coachContext }).level !== "weak");

console.log("\nMotstanderforberedelse:");
const highPress = OPPONENT_PROFILES.find((opponent) => opponent.id === "high_press_opponent");
const recommendation = recommendTrainingFocus({ opponent: highPress, teamFit });
check("kjent high-press-motstander anbefaler oppbygging/dybdeløp", recommendation.focusIds.includes("build_up") && recommendation.focusIds.includes("depth_runs"));
check("uten mini-season gis generelt team-fit-råd", recommendTrainingFocus({ opponent: null, teamFit }).focusIds.length === 1);

console.log("\nEffekt i Kampdag v0.2:");
const pressingSnapshot = createTrainingMatchdaySnapshot({ selection: selected, clubWeek: 3, coachContext, opponent: null });
check("riktig uke lager låst kampdagssnapshot", pressingSnapshot?.focusId === "pressing" && pressingSnapshot.metricBonuses.pressScore > 0);
check("feil uke gir ingen treningsbonus", createTrainingMatchdaySnapshot({ selection: selected, clubWeek: 4, coachContext }) === null);

const pressEvent = { id: "opp_possession_grind", pressure: "medium" };
const pressOption = {
  id: "press_higher",
  checks: [{ type: "metric", key: "pressScore", min: 64 }, { type: "effect", key: "pressingIntensity", min: 6 }],
  impact: { xgFor: 0.35, xgAgainst: 0.05, momentum: 2, clarity: 0 },
  risk: 1
};
const noTrainingPress = resolveMatchdayDecision({ event: pressEvent, option: pressOption, tacticalProfile: teamFit.metrics, matchEngineEffects: formation.matchEngineEffects, coachSnapshot: null });
const trainedPress = resolveMatchdayDecision({ event: pressEvent, option: pressOption, tacticalProfile: teamFit.metrics, matchEngineEffects: formation.matchEngineEffects, coachSnapshot: null, trainingFocus: pressingSnapshot });
check("pressing-fokus hjelper pressing-beslutning", noTrainingPress.tone === "neutral" && trainedPress.tone === "positive" && trainedPress.trainingImpact?.scoreBonus > 0);

const restSnapshot = createTrainingMatchdaySnapshot({ selection: { focusId: "rest_defence", week: 3 }, clubWeek: 3, coachContext, opponent: OPPONENT_PROFILES[2] });
const counterEvent = { id: "opp_counter_threat", pressure: "high" };
const riskyOption = {
  id: "keep_attacking",
  checks: [{ type: "metric", key: "depthScore", min: 70 }],
  impact: { xgFor: 0.35, xgAgainst: 0.05, momentum: 2, clarity: 0 },
  risk: 2
};
const untrainedCounter = resolveMatchdayDecision({ event: counterEvent, option: riskyOption, tacticalProfile: teamFit.metrics, matchEngineEffects: formation.matchEngineEffects, coachSnapshot: null });
const trainedCounter = resolveMatchdayDecision({ event: counterEvent, option: riskyOption, tacticalProfile: teamFit.metrics, matchEngineEffects: formation.matchEngineEffects, coachSnapshot: null, trainingFocus: restSnapshot });
check("rest_defence demper negativ kontringseffekt", trainedCounter.effects.xgDeltaAgainst < untrainedCounter.effects.xgDeltaAgainst && trainedCounter.trainingImpact?.mitigatedRisk === true);

const wrongFocus = resolveMatchdayDecision({ event: counterEvent, option: riskyOption, tacticalProfile: teamFit.metrics, matchEngineEffects: formation.matchEngineEffects, coachSnapshot: null, trainingFocus: pressingSnapshot });
check("feil fokus gir ingen effekt", wrongFocus.trainingImpact === null && wrongFocus.effects.xgDeltaAgainst === untrainedCounter.effects.xgDeltaAgainst);

console.log("\nTilvenning og idempotens:");
const familiaritySnapshot = createTrainingMatchdaySnapshot({ selection: { focusId: "formation_familiarity", week: 3 }, clubWeek: 3, coachContext, opponent: null });
const lastMatch = {
  id: "match-training-1", version: 2, outcome: "draw", teamStrength: 68,
  opponent: { strength: 70 }, expectedGoals: { for: 1, against: 1 },
  formationSnapshot: { id: formation.id, name: formation.name },
  decisions: [], decisionTotals: {},
  trainingFocus: { focusId: familiaritySnapshot.focusId, staffSupport: familiaritySnapshot.staffSupport.level }
};
const trainedConsequences = computeMatchdayConsequences({ lastMatch, coachSnapshot: coachContext, historicalScore: 64 });
const baseConsequences = computeMatchdayConsequences({ lastMatch: { ...lastMatch, trainingFocus: null }, coachSnapshot: coachContext, historicalScore: 64 });
check("formation_familiarity øker tilvenning litt ekstra", trainedConsequences.familiarityGain > baseConsequences.familiarityGain);
lastMatch.consequencesApplied = true;
check("samme kamp får ikke dobbel progresjon", computeMatchdayConsequences({ lastMatch, coachSnapshot: coachContext }) === null);
const consumed = sanitizeWeeklyTrainingFocus({ ...selected, appliedSessionId: "session-1" });
check("brukt fokus kan ikke lage nytt snapshot etter reload/reset", createTrainingMatchdaySnapshot({ selection: consumed, clubWeek: 3, coachContext }) === null);

console.log("\nTestkamp uten mini-season:");
const testSession = createMatchdaySession({ teamFit, formation, coachContext, trainingFocus: pressingSnapshot, opponent: null });
check("testkamp fungerer og beholder treningssnapshot", OPPONENT_PROFILES.some((item) => item.id === testSession.opponent?.id) && testSession.trainingFocus?.focusId === "pressing");

if (failures > 0) {
  console.error(`\n${failures} treningsuke-sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle treningsuke-sjekker bestått.");

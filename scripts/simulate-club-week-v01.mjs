// Club Week Orchestrator v1 — ende-til-ende-simulering av ukerytmen.
//
// Standalone, std-lib only, ingen DOM/localStorage. Binder sammen de samme
// motorene som den live appen bruker: Club Week-engine (dist/), kampdag↔uke-
// porten og kampkonsekvensene (football-match-consequences), off-pitch-laget
// og treningsfokus→off-pitch-koblingen (football-training-week). Verifiserer at
// fasene henger sammen til én sammenhengende runde:
//   analyse → innboks → trening → kampplan → kampdag → oppsummering → ny uke.
//
// Exit 0 = alle sjekker bestått, 1 = minst én feilet (brukes som testsuite).

import {
  createInitialClubWeekState,
  advanceClubWeekPhase,
  applyClubWeekEffects,
  getClubWeekPhaseLabel,
  getClubWeekPhaseGuidance,
  listClubWeekPhases
} from "../dist/index.js";
import {
  evaluateClubWeekMatchdayGate,
  computeMatchdayConsequences
} from "../src/football-match-consequences.js";
import {
  createDefaultOffPitchState,
  applyOffPitchEvent
} from "../src/football-off-pitch-parameters.js";
import { buildTrainingFocusOffPitchEvent } from "../src/football-training-week.js";
import {
  startMiniSeason,
  getCurrentMiniSeasonMatch,
  isCurrentMiniSeasonMatchPlayed,
  applyMiniSeasonMatchResult,
  advanceMiniSeasonWeek
} from "../src/football-mini-season.js";
import { OPPONENT_PROFILES } from "../src/football-matchday-engine.js";

let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failed += 1;
    console.log(`  FEIL ${label}`);
  }
}

const EXPECTED_ORDER = ["analysis", "inbox", "training", "match_prep", "matchday", "review"];

console.log("Club Week Orchestrator v1 — fase-rytme:");
const phases = listClubWeekPhases();
check("seks faser i forventet rekkefølge", phases.map((p) => p.phase).join(",") === EXPECTED_ORDER.join(","));
check("hver fase har en etikett", phases.every((p) => typeof p.label === "string" && p.label.length > 0));
check("hver fase har handlingsrettet veiledning", phases.every((p) => typeof p.guidance === "string" && p.guidance.length > 0));
check("etikett-oppslag matcher faselista", phases.every((p) => getClubWeekPhaseLabel(p.phase) === p.label));
check("veiledning-oppslag matcher faselista", phases.every((p) => getClubWeekPhaseGuidance(p.phase) === p.guidance));

console.log("\nUke-loop (fasen flytter spillet, uka ruller etter oppsummering):");
let week = createInitialClubWeekState({});
check("starter i uke 1 / analyse", week.week === 1 && week.phase === "analysis");

const visited = [week.phase];
for (let i = 0; i < EXPECTED_ORDER.length - 1; i += 1) {
  week = advanceClubWeekPhase(week);
  visited.push(week.phase);
}
check("én runde besøker alle seks fasene i rekkefølge", visited.join(",") === EXPECTED_ORDER.join(","));
check("uka holder seg i uke 1 gjennom hele rytmen", week.week === 1 && week.phase === "review");

const rolled = advanceClubWeekPhase(week);
check("oppsummering → ny uke ruller til uke 2 / analyse", rolled.week === 2 && rolled.phase === "analysis");

console.log("\nKampdag ↔ Club Week-porten (kampdagfasen krever spilt kamp):");
const matchdayWeek = { ...createInitialClubWeekState({ week: 2 }), phase: "matchday" };
check(
  "kampdag uten spilt kamp stenger porten",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchdayWeek }).isBlocked === true
);
check(
  "kamp spilt denne uka åpner porten",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchdayWeek, lastMatch: { playedInClubWeek: 2 } }).isBlocked === false
);
check(
  "utenfor kampdagfasen er porten alltid åpen",
  evaluateClubWeekMatchdayGate({ clubWeekState: { ...matchdayWeek, phase: "training" } }).isBlocked === false
);

console.log("\nTrening → off-pitch (treningsvalget beveger konteksten utenfor banen):");
const baseOffPitch = createDefaultOffPitchState();
const restEvent = buildTrainingFocusOffPitchEvent("rest_defence");
check("restforsvar-fokus gir en off-pitch-hendelse", restEvent !== null && restEvent.type === "training");
const afterRest = applyOffPitchEvent(baseOffPitch, restEvent);
check("restforsvar letter slitasjen", afterRest.team.fatigue < baseOffPitch.team.fatigue);
check("restforsvar løfter taktisk klarhet", afterRest.squad.tacticalClarity > baseOffPitch.squad.tacticalClarity);
check("treningsvalget havner i off-pitch-historikken", afterRest.recentEvents.some((e) => e.type === "training"));

const pressEvent = buildTrainingFocusOffPitchEvent("pressing");
const afterPress = applyOffPitchEvent(baseOffPitch, pressEvent);
check("pressing koster fysisk (mer slitasje)", afterPress.team.fatigue > baseOffPitch.team.fatigue);
check("ukjent fokus gir ingen hendelse", buildTrainingFocusOffPitchEvent("ikke_et_fokus") === null);

console.log("\nKampkonsekvenser → klubbverdier (kampen farger uka videre):");
const lastMatch = {
  version: 2,
  outcome: "win",
  opponent: { name: "Testlaget", strength: 70 },
  teamStrength: 68,
  score: { for: 2, against: 0 },
  expectedGoals: { for: 1.8, against: 0.7 },
  decisionTotals: { tacticalClarityDelta: 2 },
  decisions: [{ tone: "positive" }, { tone: "positive" }],
  formationSnapshot: { id: "f_433", name: "4-3-3" },
  trainingFocus: { focusId: "rest_defence", name: "Restforsvar", contextRelevant: true, staffSupport: "strong" }
};
const consequences = computeMatchdayConsequences({ lastMatch });
check("en spilt kamp gir konsekvenser", consequences !== null);
check("seier løfter minst én klubbverdi", Object.values(consequences.clubEffects).some((d) => d > 0));
check("formasjonstilvenning øker (1-6)", consequences.familiarityGain >= 1 && consequences.familiarityGain <= 6);

const applied = applyClubWeekEffects(createInitialClubWeekState({ week: 2, phase: "review" }), consequences.clubEffects);
check("klubbverdier holder seg i 0-100 etter effekt", Object.values(applied).every((v) => typeof v !== "number" || (v >= 0 && v <= 100)));

console.log("\nMini Season ↔ Club Week (to uker henger sammen):");
// En mini-sesong følger Club Week-rytmen: kampen i kampdagfasen registreres, og
// når uka ruller fra oppsummering til ny uke ruller også mini-sesongen videre.
const miniContext = { seasonId: "club-week-link", opponents: OPPONENT_PROFILES, teamName: "HG-laget" };
let mini = startMiniSeason(miniContext);
let clubWeek = createInitialClubWeekState({});
check("mini-sesong + Club Week starter begge i uke/runde 1", clubWeek.week === 1 && getCurrentMiniSeasonMatch(mini)?.round === 1);

function buildWeekMatch(round, outcome) {
  const match = getCurrentMiniSeasonMatch(mini);
  const opponent = OPPONENT_PROFILES.find((o) => o.id === match.opponentId) || { id: match.opponentId, strength: match.opponentStrength };
  return {
    id: `clubweek-match-${round}`,
    version: 2,
    outcome,
    score: { for: outcome === "win" ? 2 : 1, against: outcome === "loss" ? 2 : 1 },
    opponent: { id: opponent.id, name: match.opponentName, strength: opponent.strength },
    teamStrength: 70,
    decisionTotals: { eventScoreDelta: 1 },
    decisions: [{ tone: "positive" }],
    trainingFocus: { helped: true, staffSupport: "strong", focusId: "pressing" }
  };
}

const weekOutcomes = ["win", "draw"];
for (let w = 0; w < weekOutcomes.length; w += 1) {
  const round = w + 1;
  const currentMatch = getCurrentMiniSeasonMatch(mini);
  check(`uke ${round}: mini-sesongens runde er ${round}`, currentMatch?.round === round && clubWeek.week === round);

  // Gå gjennom fasene til kampdag, registrer kampen der.
  while (clubWeek.phase !== "matchday") {
    clubWeek = advanceClubWeekPhase(clubWeek);
  }
  mini = applyMiniSeasonMatchResult(mini, buildWeekMatch(round, weekOutcomes[w]), miniContext);
  check(`uke ${round}: kampen er registrert i mini-sesongen`, isCurrentMiniSeasonMatchPlayed(mini) === true && mini.matchHistory.length === round);

  // Rull resten av uka (kampdag → oppsummering → ny uke). Ved ukerull ruller
  // også mini-sesongen til neste kamp.
  const weekBefore = clubWeek.week;
  while (clubWeek.week === weekBefore) {
    clubWeek = advanceClubWeekPhase(clubWeek);
  }
  mini = advanceMiniSeasonWeek(mini, miniContext);
  check(`uke ${round} → ny uke: begge ruller i takt`, clubWeek.week === round + 1 && mini.weekIndex === round);
}

check("etter to uker har mini-sesongen 2 kamper og poeng", mini.matchHistory.length === 2 && mini.points === 4);
check("mini-sesongen er fortsatt aktiv (ikke fullført på 2/5)", mini.status === "active" && getCurrentMiniSeasonMatch(mini)?.round === 3);

console.log(`\n${failed === 0 ? "Alle" : passed + "/" + (passed + failed)} Club Week-sjekker ${failed === 0 ? "besto." : "— " + failed + " feilet."}`);
process.exit(failed === 0 ? 0 : 1);

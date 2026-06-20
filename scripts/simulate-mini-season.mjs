// scripts/simulate-mini-season.mjs
//
// Read-only simulering av Mini Season v1 / League Loop v1
// (src/football-mini-season.js).
//
// Verifiserer at fem Club Weeks blir én sammenhengende prøveperiode uten
// DOM/localStorage:
//   - createMiniSeasonState gir gyldig schema,
//   - startMiniSeason lager en deterministisk 5-kampers schedule,
//   - getCurrentMiniSeasonMatch peker på riktig kamp,
//   - applyMiniSeasonMatchResult oppdaterer W/D/L, poeng, mål og form,
//   - advanceMiniSeasonWeek øker uka riktig og fullfører etter 5 kamper,
//   - summarizeMiniSeason / createMiniSeasonTable / formguide er lesbare,
//   - styret vurderer resultat kontekstuelt (tap mot sterk borte straffes
//     mildere enn tap hjemme mot svakere),
//   - høy belastning/uro påvirker review uten å alene avgjøre resultatet,
//   - to like kall gir byte-identisk JSON,
//   - korrupt state gir null i stedet for krasj,
//   - mini-sesongen kan kjøres sammen med Club Week-porten uten runtime-feil.
//
// Rent Node-script (standardbibliotek + prosjektets egne ESM-moduler). Skriver
// ingen filer. Exit code 1 hvis en sjekk feiler, ellers 0.

import {
  MINI_SEASON_VERSION,
  MINI_SEASON_TOTAL_WEEKS,
  MINI_SEASON_POINTS,
  createMiniSeasonState,
  normalizeMiniSeasonState,
  startMiniSeason,
  getCurrentMiniSeasonMatch,
  isCurrentMiniSeasonMatchPlayed,
  applyMiniSeasonMatchResult,
  advanceMiniSeasonWeek,
  completeMiniSeason,
  summarizeMiniSeason,
  createMiniSeasonTable,
  createMiniSeasonBoardReview,
  createMiniSeasonFormGuide,
  createMiniSeasonOffPitchEvent
} from "../src/football-mini-season.js";
import { OPPONENT_PROFILES, createMatchdaySession } from "../src/football-matchday-engine.js";
import { evaluateClubWeekMatchdayGate } from "../src/football-match-consequences.js";

let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

// Bygg et kampdag-aktig resultat (samme felter mini-sesongen leser fra et
// finalizeMatchdaySession-resultat). Deterministisk for lik input.
function buildMatchdayResult({ round, opponent, outcome, goalsFor, goalsAgainst, decisionScore = 0, decisions = [], training = null }) {
  return {
    id: `matchday-${round}-${opponent.id}`,
    version: 2,
    outcome,
    score: { for: goalsFor, against: goalsAgainst },
    opponent: { id: opponent.id, name: opponent.name, strength: opponent.strength },
    teamStrength: 70,
    decisionTotals: { eventScoreDelta: decisionScore },
    decisions,
    trainingFocus: training
  };
}

// Spill en hel sesong fra en context + en liste utfall. Returnerer slutt-state.
function playSeason(context, plan) {
  let season = startMiniSeason(context);
  plan.forEach((step, i) => {
    const match = getCurrentMiniSeasonMatch(season);
    const opponent = OPPONENT_PROFILES.find((o) => o.id === match.opponentId) || { id: match.opponentId, name: match.opponentName, strength: match.opponentStrength };
    const goalsFor = step.goalsFor ?? (step.outcome === "win" ? 2 : step.outcome === "draw" ? 1 : 0);
    const goalsAgainst = step.goalsAgainst ?? (step.outcome === "loss" ? 2 : step.outcome === "draw" ? 1 : 1);
    season = applyMiniSeasonMatchResult(
      season,
      buildMatchdayResult({ round: i + 1, opponent, outcome: step.outcome, goalsFor, goalsAgainst, decisionScore: step.decisionScore, decisions: step.decisions, training: step.training }),
      context
    );
    season = advanceMiniSeasonWeek(season, context);
  });
  return season;
}

const baseContext = {
  seasonId: "sim-season",
  clubWeekState: { boardTrust: 50, playerMorale: 55, tacticalClarity: 55, mediaPressure: 40 }
};

console.log("Mini Season v1 / League Loop v1 — simulering");

// --- 1) createMiniSeasonState: gyldig schema ----------------------------------
console.log("\nSchema og sesongstart:");
const created = createMiniSeasonState(baseContext);
check("versjon er mini-season.v1", created?.version === MINI_SEASON_VERSION);
check("ny state er not_started", created?.status === "not_started");
check("totalWeeks er 5", created?.totalWeeks === MINI_SEASON_TOTAL_WEEKS);
check(
  "alle nøkkelfelt finnes med riktig type",
  created &&
    typeof created.seasonId === "string" &&
    Number.isInteger(created.weekIndex) &&
    Number.isInteger(created.points) &&
    Array.isArray(created.form) &&
    Array.isArray(created.opponentSchedule) &&
    Array.isArray(created.matchHistory) &&
    typeof created.boardExpectation === "string" &&
    typeof created.seasonGoal === "string" &&
    Number.isFinite(created.momentum) &&
    Number.isFinite(created.boardTrustTrend) &&
    Number.isFinite(created.tacticalIdentityScore) &&
    created.finalReview === null
);

// --- 2) startMiniSeason: 5-kampers schedule -----------------------------------
const season = startMiniSeason(baseContext);
check("startMiniSeason gir active", season?.status === "active");
check("schedule har nøyaktig 5 runder", season?.opponentSchedule.length === MINI_SEASON_TOTAL_WEEKS);
check(
  "hver schedule-oppføring er komplett",
  season.opponentSchedule.every(
    (e) =>
      Number.isInteger(e.round) &&
      typeof e.opponentId === "string" &&
      typeof e.opponentName === "string" &&
      ["low", "medium", "high", "elite"].includes(e.difficulty) &&
      ["home", "away"].includes(e.homeAway) &&
      ["win", "avoid_loss", "compete", "free_hit"].includes(e.boardExpectation) &&
      typeof e.narrativeHook === "string" &&
      e.narrativeHook.length > 0
  )
);
check(
  "schedule bruker eksisterende motstanderprofiler",
  season.opponentSchedule.every((e) => OPPONENT_PROFILES.some((p) => p.id === e.opponentId))
);
check(
  "schedule inneholder ulike vanskelighetsgrader",
  new Set(season.opponentSchedule.map((e) => e.difficulty)).size >= 3
);

// --- 3) getCurrentMiniSeasonMatch ---------------------------------------------
console.log("\nKamprekke-navigasjon:");
check("gjeldende kamp er runde 1", getCurrentMiniSeasonMatch(season)?.round === 1);
check("ingen kamp før sesongstart (not_started)", getCurrentMiniSeasonMatch(created) === null);

// --- 4) applyMiniSeasonMatchResult: W/D/L, poeng, mål, form -------------------
console.log("\nResultatregistrering:");
const round1Opponent = OPPONENT_PROFILES.find((o) => o.id === getCurrentMiniSeasonMatch(season).opponentId);
let afterOne = applyMiniSeasonMatchResult(
  season,
  buildMatchdayResult({ round: 1, opponent: round1Opponent, outcome: "win", goalsFor: 3, goalsAgainst: 1, decisionScore: 2, decisions: [{ tone: "positive" }, { tone: "positive" }], training: { helped: true, staffSupport: "strong", focusId: "pressing" } }),
  baseContext
);
check("seier gir 3 poeng", afterOne.points === 3 && afterOne.wins === 1);
check("mål registreres (3–1)", afterOne.goalsFor === 3 && afterOne.goalsAgainst === 1);
check("form får W", afterOne.form.join("") === "W");
check("weekIndex uendret før advance", afterOne.weekIndex === 0);
check("kampen er markert spilt", isCurrentMiniSeasonMatchPlayed(afterOne) === true);
check("matchHistory har én oppføring", afterOne.matchHistory.length === 1);

// Idempotens: samme matchId/runde registreres aldri to ganger.
const afterDuplicate = applyMiniSeasonMatchResult(
  afterOne,
  buildMatchdayResult({ round: 1, opponent: round1Opponent, outcome: "win", goalsFor: 3, goalsAgainst: 1 }),
  baseContext
);
check("samme runde registreres ikke på nytt", afterDuplicate.matchHistory.length === 1 && afterDuplicate.points === 3);

// --- 5) advanceMiniSeasonWeek: øker uka, fullfører etter 5 --------------------
console.log("\nUke-rull og fullføring:");
let advanced = advanceMiniSeasonWeek(afterOne, baseContext);
check("advance øker weekIndex til 1", advanced.weekIndex === 1 && advanced.status === "active");
check("ny gjeldende kamp er runde 2", getCurrentMiniSeasonMatch(advanced)?.round === 2);
// advance uten spilt kamp er no-op (idempotent).
const advanceAgain = advanceMiniSeasonWeek(advanced, baseContext);
check("advance uten spilt kamp er no-op", advanceAgain.weekIndex === 1);

const fullSeason = playSeason(baseContext, [
  { outcome: "win", decisionScore: 1, decisions: [{ tone: "positive" }], training: { helped: true, staffSupport: "normal", focusId: "pressing" } },
  { outcome: "draw", training: { helped: false, staffSupport: "normal", focusId: "shape" } },
  { outcome: "loss" },
  { outcome: "win", decisionScore: 1, decisions: [{ tone: "positive" }] },
  { outcome: "draw" }
]);
check("status completed etter 5 kamper", fullSeason.status === "completed");
check("weekIndex er 5 etter fullføring", fullSeason.weekIndex === MINI_SEASON_TOTAL_WEEKS);
check("5 kamper i matchHistory", fullSeason.matchHistory.length === 5);
// 2 seire + 2 uavgjort + 1 tap = 6+2 = 8 poeng.
check(`poeng beregnes (W3/D1/L0): ${fullSeason.points} === 8`, fullSeason.points === 8);
check(
  "poengtabellen er 3/1/0",
  MINI_SEASON_POINTS.win === 3 && MINI_SEASON_POINTS.draw === 1 && MINI_SEASON_POINTS.loss === 0
);
check("finalReview bygges ved fullføring", fullSeason.finalReview && typeof fullSeason.finalReview.verdict === "string");
check("ingen kamp igjen i fullført sesong", getCurrentMiniSeasonMatch(fullSeason) === null);
check(
  "fullført sesong avviser nye resultater",
  applyMiniSeasonMatchResult(fullSeason, buildMatchdayResult({ round: 9, opponent: round1Opponent, outcome: "win", goalsFor: 1, goalsAgainst: 0 }), baseContext).matchHistory.length === 5
);

// --- 6) Oppsummering, tabell og formkurve ------------------------------------
console.log("\nOppsummering, tabell og formkurve:");
const summary = summarizeMiniSeason(fullSeason);
check(
  "summarizeMiniSeason er lesbar",
  summary && typeof summary.headline === "string" && summary.headline.length > 0 && Array.isArray(summary.lines) && summary.lines.length > 0
);
check("oppsummering speiler poeng og form", summary.points === 8 && summary.formText.length > 0);

const table = createMiniSeasonTable(fullSeason, baseContext);
check("tabell har HG-laget + rivaler", table && table.rows.length >= 4 && table.rows.some((r) => r.isHg));
check(
  "tabellradene har P/W/D/L/GF/GA/GD/Pts og posisjon",
  table.rows.every(
    (r) =>
      Number.isFinite(r.played) &&
      Number.isFinite(r.wins) &&
      Number.isFinite(r.draws) &&
      Number.isFinite(r.losses) &&
      Number.isFinite(r.goalsFor) &&
      Number.isFinite(r.goalsAgainst) &&
      Number.isFinite(r.goalDifference) &&
      Number.isFinite(r.points) &&
      Number.isInteger(r.position)
  )
);
check(
  "tabellen er sortert på poeng (synkende)",
  table.rows.every((row, i, arr) => i === 0 || arr[i - 1].points >= row.points)
);
const tableTwice = JSON.stringify(createMiniSeasonTable(fullSeason, baseContext));
check("tabellen er deterministisk", tableTwice === JSON.stringify(createMiniSeasonTable(fullSeason, baseContext)));

const formGuide = createMiniSeasonFormGuide(fullSeason);
check(
  "formkurve gir bokstaver, trend og notat",
  formGuide && formGuide.form.length === 5 && ["rising", "falling", "stable"].includes(formGuide.trend) && formGuide.note.length > 0
);

// --- 7) Kontekstuell styrevurdering ------------------------------------------
console.log("\nKontekstuell styrevurdering:");
const opp = OPPONENT_PROFILES;

// Tap hjemme mot svakere (runde 1: low, home, forventning «win») vs tap borte
// mot sterkere (runde 2: elite, away, «free_hit»). Bygg to enkeltkamp-sesonger.
function lossInRound(roundIndex) {
  let s = startMiniSeason(baseContext);
  for (let i = 0; i < roundIndex; i += 1) {
    const m = getCurrentMiniSeasonMatch(s);
    const o = opp.find((x) => x.id === m.opponentId);
    s = applyMiniSeasonMatchResult(s, buildMatchdayResult({ round: i + 1, opponent: o, outcome: "draw", goalsFor: 1, goalsAgainst: 1 }), baseContext);
    s = advanceMiniSeasonWeek(s, baseContext);
  }
  const m = getCurrentMiniSeasonMatch(s);
  const o = opp.find((x) => x.id === m.opponentId);
  const before = s.boardTrustTrend;
  s = applyMiniSeasonMatchResult(s, buildMatchdayResult({ round: roundIndex + 1, opponent: o, outcome: "loss", goalsFor: 0, goalsAgainst: 2 }), baseContext);
  return { difficulty: m.difficulty, homeAway: m.homeAway, expectation: m.boardExpectation, trendDelta: s.boardTrustTrend - before };
}

const homeWeakLoss = lossInRound(0); // runde 1: low, home → «win»
const awayEliteLoss = lossInRound(1); // runde 2: elite, away → «free_hit»
check(
  `tap hjemme mot svak straffes hardere (${homeWeakLoss.trendDelta}) enn tap borte mot elite (${awayEliteLoss.trendDelta})`,
  homeWeakLoss.trendDelta < awayEliteLoss.trendDelta
);

// Sterk periode med tydelig identitet → trusted.
const strong = playSeason(baseContext, [
  { outcome: "win", decisionScore: 2, decisions: [{ tone: "positive" }, { tone: "positive" }], training: { helped: true, staffSupport: "strong", focusId: "pressing" } },
  { outcome: "win", decisionScore: 2, decisions: [{ tone: "positive" }, { tone: "positive" }], training: { helped: true, staffSupport: "strong", focusId: "shape" } },
  { outcome: "draw", decisionScore: 1, decisions: [{ tone: "positive" }], training: { helped: true, staffSupport: "strong", focusId: "build_up" } },
  { outcome: "win", decisionScore: 2, decisions: [{ tone: "positive" }, { tone: "positive" }], training: { helped: true, staffSupport: "strong", focusId: "width" } },
  { outcome: "win", decisionScore: 2, decisions: [{ tone: "positive" }, { tone: "positive" }], training: { helped: true, staffSupport: "strong", focusId: "pressing" } }
]);
check(`sterk periode med identitet → trusted (${strong.finalReview.verdict})`, strong.finalReview.verdict === "trusted");

// Kaotisk tapsperiode med dårlig kontekst → failed.
const chaosContext = {
  seasonId: "sim-chaos",
  offPitch: { team: { fatigue: 75, wear: 70, morale: 35, cohesion: 35, boardPressure: 70, mediaPressure: 70 }, squad: { tacticalClarity: 35, hiddenStress: 65 } },
  clubWeekState: { boardTrust: 32, playerMorale: 35, tacticalClarity: 35, mediaPressure: 72 }
};
const weak = playSeason(chaosContext, [
  { outcome: "loss", decisionScore: -2, decisions: [{ tone: "negative" }, { tone: "negative" }] },
  { outcome: "loss", decisionScore: -2, decisions: [{ tone: "negative" }, { tone: "negative" }] },
  { outcome: "loss", decisionScore: -2, decisions: [{ tone: "negative" }, { tone: "negative" }] },
  { outcome: "loss", decisionScore: -2, decisions: [{ tone: "negative" }, { tone: "negative" }] },
  { outcome: "loss", decisionScore: -2, decisions: [{ tone: "negative" }, { tone: "negative" }] }
]);
check(`kaotisk tapsperiode → failed (${weak.finalReview.verdict})`, weak.finalReview.verdict === "failed");

// Ujevn periode uten tydelig identitet → pressure.
const mixed = playSeason(baseContext, [
  { outcome: "win" },
  { outcome: "loss" },
  { outcome: "draw" },
  { outcome: "loss" },
  { outcome: "draw" }
]);
check(`ujevn periode → pressure (${mixed.finalReview.verdict})`, mixed.finalReview.verdict === "pressure");

// Belastning/uro påvirker review uten å alene avgjøre: samme resultater, ulik
// kontekst → ulik contextStabilityScore, men poeng/form er identiske.
const calmMixed = playSeason({ ...baseContext, seasonId: "sim-mixed" }, [
  { outcome: "win" },
  { outcome: "draw" },
  { outcome: "loss" },
  { outcome: "win" },
  { outcome: "draw" }
]);
const stressedMixed = playSeason(
  { seasonId: "sim-mixed", offPitch: { team: { fatigue: 80, wear: 75, boardPressure: 70, mediaPressure: 70, morale: 38, cohesion: 38 }, squad: { hiddenStress: 68, tacticalClarity: 38 } } },
  [
    { outcome: "win" },
    { outcome: "draw" },
    { outcome: "loss" },
    { outcome: "win" },
    { outcome: "draw" }
  ]
);
check("samme resultater gir samme poeng uansett kontekst", calmMixed.points === stressedMixed.points);
check(
  "høy belastning/uro senker contextStabilityScore",
  stressedMixed.contextStabilityScore < calmMixed.contextStabilityScore
);

// --- 8) Off-pitch-kobling -----------------------------------------------------
console.log("\nOff-pitch-kobling (komponerer, dupliserer ikke):");
const offEventGood = createMiniSeasonOffPitchEvent(strong, baseContext);
check("god prestasjon foreslår en off-pitch-hendelse", offEventGood && typeof offEventGood.effects === "object");
check(
  "god prestasjon løfter selvtillit/moral",
  offEventGood && (offEventGood.effects.confidence > 0 || offEventGood.effects.morale > 0)
);
const offEventBad = createMiniSeasonOffPitchEvent(weak, chaosContext);
check(
  "svak prestasjon øker press/uro",
  offEventBad && (offEventBad.effects.boardPressure > 0 || offEventBad.effects.pressure > 0 || offEventBad.effects.hiddenStress > 0)
);

// --- 9) Determinisme og robusthet --------------------------------------------
console.log("\nDeterminisme og robusthet:");
const runA = JSON.stringify(
  playSeason({ seasonId: "det-test" }, [
    { outcome: "win", decisionScore: 1 },
    { outcome: "draw" },
    { outcome: "loss" },
    { outcome: "win" },
    { outcome: "loss" }
  ])
);
const runB = JSON.stringify(
  playSeason({ seasonId: "det-test" }, [
    { outcome: "win", decisionScore: 1 },
    { outcome: "draw" },
    { outcome: "loss" },
    { outcome: "win" },
    { outcome: "loss" }
  ])
);
check("to like fulle gjennomspillinger gir byte-identisk JSON", runA === runB);
check("korrupt state (ikke-objekt) gir null", normalizeMiniSeasonState("korrupt") === null);
check("korrupt state (null) gir null", normalizeMiniSeasonState(null) === null);
const reloaded = normalizeMiniSeasonState(JSON.parse(JSON.stringify(fullSeason)));
check("lagring/reload er idempotent", JSON.stringify(reloaded) === JSON.stringify(fullSeason));
check(
  "completeMiniSeason på halvspilt sesong oppsummerer det spilte",
  completeMiniSeason(advanced, baseContext).status === "completed"
);

// --- 10) Mini Season ↔ Club Week sammen --------------------------------------
console.log("\nMini Season sammen med Club Week (porten + testkamp):");
const teamFit = {
  teamScore: 70,
  completeCount: 11,
  totalSlots: 11,
  metrics: { balanceScore: 70, widthScore: 70, depthScore: 70, buildUpScore: 70, pressScore: 70, restDefenseScore: 70, roleFitAverage: 70 },
  relationships: { relationshipScore: 70 },
  historicalFormationFit: { historicalScore: 70, historicalBonus: 1, historicalPenalty: 0 },
  badgeEffects: {}
};
const formation = { id: "wm_3223", name: "WM", slots: [], matchEngineEffects: { defensiveSecurity: 6 } };
const plannedMatch = getCurrentMiniSeasonMatch(season);
const plannedProfile = OPPONENT_PROFILES.find((p) => p.id === plannedMatch.opponentId);
const plannedSession = createMatchdaySession({ teamFit, formation, opponent: plannedProfile });
check("mini-sesongen kan styre kampens motstander", plannedSession.opponent?.id === plannedMatch.opponentId);

const matchDayWeek = { week: 3, phase: "matchday" };
check(
  "matchday uten spilt kamp stenger Club Week-porten",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchDayWeek }).isBlocked === true
);
check(
  "kamp spilt denne uka åpner porten",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchDayWeek, lastMatch: { playedInClubWeek: 3 } }).isBlocked === false
);

console.log(failures === 0 ? "\nAlle sjekker besto." : `\n${failures} sjekk(er) feilet.`);
process.exit(failures === 0 ? 0 : 1);

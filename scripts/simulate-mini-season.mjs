// scripts/simulate-mini-season.mjs
//
// Read-only simulering av Mini Season v0.1 (src/football-mini-season.js).
//
// Verifiserer prøveperiode-løkken uten DOM/localStorage:
//   - start lager en aktiv sesong med 5-kampers motstanderplan fra de
//     eksisterende motstanderprofilene,
//   - planen overlever lagring/reload (sanitize endrer aldri rekkefølgen),
//   - kamp 1 registreres nøyaktig én gang (matchId som idempotensnøkkel),
//   - 5 kamper gir status completed og riktig poengsum (3/1/0),
//   - styremålene evalueres og sluttvurderingen (trusted/pressure/failed)
//     beregnes fra poeng, Club Week-verdier og målene,
//   - korrupt lagret state gir null i stedet for krasj,
//   - testkamp uten mini-sesong fungerer fortsatt (tilfeldig motstander),
//   - Kampdag ↔ Club Week-porten fra PR #55 er intakt.
//
// Rent Node-script (standardbibliotek + prosjektets egne ESM-moduler). Skriver
// ingen filer. Exit code 1 hvis en sjekk feiler, ellers 0.

import {
  MINI_SEASON_TOTAL_MATCHES,
  MINI_SEASON_POINTS,
  createMiniSeason,
  sanitizeMiniSeason,
  getNextMiniSeasonOpponentId,
  registerMiniSeasonResult,
  calculateMiniSeasonPoints,
  evaluateMiniSeasonObjectives,
  computeMiniSeasonVerdict
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

function buildResult(index, outcome, overrides = {}) {
  return {
    matchId: `matchday-${1000 + index}`,
    opponentId: OPPONENT_PROFILES[index % OPPONENT_PROFILES.length].id,
    opponentName: OPPONENT_PROFILES[index % OPPONENT_PROFILES.length].name,
    formationName: "WM (3-2-2-3)",
    scoreLine: outcome === "win" ? "2–1" : outcome === "draw" ? "1–1" : "0–2",
    outcome,
    teamStrength: 70,
    decisionScore: 0,
    bestDecision: "Behold planen",
    worstDecision: null,
    clubWeek: index + 1,
    appliedAt: new Date().toISOString(),
    ...overrides
  };
}

console.log("Mini Season v0.1-simulering");

// --- 1) Sesongstart og motstanderplan ----------------------------------------
console.log("\nSesongstart og motstanderplan:");
const opponentIds = OPPONENT_PROFILES.map((profile) => profile.id);
const season = createMiniSeason({ opponentIds });

check("ny sesong er aktiv", season?.status === "active");
check("sesongen har seasonId og startedAt", Boolean(season?.seasonId && season?.startedAt));
check(
  `planen har ${MINI_SEASON_TOTAL_MATCHES} motstandere fra profilene`,
  season?.plan.length === MINI_SEASON_TOTAL_MATCHES &&
    season.plan.every((id) => OPPONENT_PROFILES.some((profile) => profile.id === id))
);
check("currentMatchIndex starter på 0", season?.currentMatchIndex === 0);
check("2-3 styremål er satt", season?.objectives.length >= 2 && season.objectives.length <= 3);
check("neste motstander er første i planen", getNextMiniSeasonOpponentId(season) === season.plan[0]);
check("for få motstandere gir null", createMiniSeason({ opponentIds: ["a", "b"] }) === null);

// --- 2) Reload-robusthet (sanitize) -------------------------------------------
console.log("\nReload/robusthet (sanitize):");
const reloaded = sanitizeMiniSeason(JSON.parse(JSON.stringify(season)));
check(
  "lagring/reload endrer ikke planens rekkefølge",
  reloaded && reloaded.plan.join(",") === season.plan.join(",")
);
check("reload beholder status og index", reloaded.status === "active" && reloaded.currentMatchIndex === 0);
check("korrupt state (ikke-objekt) gir null", sanitizeMiniSeason("korrupt") === null);
check("korrupt state (ukjent status) gir null", sanitizeMiniSeason({ status: "weird", plan: season.plan }) === null);
check("korrupt state (kort plan) gir null", sanitizeMiniSeason({ status: "active", plan: ["a"] }) === null);
const duplicateStored = sanitizeMiniSeason({
  ...JSON.parse(JSON.stringify(season)),
  results: [buildResult(0, "win"), buildResult(0, "win")]
});
check(
  "duplikate resultater i lagret state dedupliseres på matchId",
  duplicateStored.results.length === 1 && duplicateStored.currentMatchIndex === 1
);

// --- 3) Resultatregistrering og idempotens -----------------------------------
console.log("\nResultatregistrering (idempotens via matchId):");
const first = registerMiniSeasonResult(season, buildResult(0, "win", { decisionScore: 2 }));
check("kamp 1 registreres", first.changed === true && first.completed === false);
check("kamp 1 øker currentMatchIndex til 1", season.currentMatchIndex === 1 && season.results.length === 1);

const duplicate = registerMiniSeasonResult(season, buildResult(0, "win", { decisionScore: 2 }));
check(
  "samme matchId registreres aldri to ganger (reload/dobbel apply)",
  duplicate.changed === false && season.results.length === 1 && season.currentMatchIndex === 1
);
check("neste motstander er nå nummer to i planen", getNextMiniSeasonOpponentId(season) === season.plan[1]);
check(
  "ugyldig resultat (uten matchId) registreres ikke",
  registerMiniSeasonResult(season, { outcome: "win" }).changed === false
);

// --- 4) Fullført sesong, poeng og styremål -----------------------------------
console.log("\nFullført sesong (5 kamper):");
const outcomes = ["draw", "loss", "loss", "win"];
let completedFlag = false;
outcomes.forEach((outcome, index) => {
  const { completed } = registerMiniSeasonResult(season, buildResult(index + 1, outcome));
  completedFlag = completed;
});
check("femte kamp setter completed", completedFlag === true && season.status === "completed");
check("completedAt er satt", typeof season.completedAt === "string" && season.completedAt.length > 0);
check(
  "fullført sesong avviser nye resultater",
  registerMiniSeasonResult(season, buildResult(9, "win")).changed === false && season.results.length === 5
);

// 2 seire, 1 uavgjort, 2 tap = 3+3+1 = 7 poeng.
const points = calculateMiniSeasonPoints(season.results);
check(`poeng beregnes riktig (W3/D1/L0): ${points} === 7`, points === 7);
check(
  "poengtabellen er 3/1/0",
  MINI_SEASON_POINTS.win === 3 && MINI_SEASON_POINTS.draw === 1 && MINI_SEASON_POINTS.loss === 0
);

const clubWeekState = {
  week: 6,
  phase: "analysis",
  boardTrust: 52,
  playerMorale: 56,
  tacticalClarity: 58,
  trainingCulture: 50,
  mediaPressure: 48
};
const objectives = evaluateMiniSeasonObjectives({ miniSeason: season, clubWeekState });
check("alle styremål evalueres", objectives.length === season.objectives.length);
check(
  "poengmålet (7 av 7) er nådd",
  objectives.find((objective) => objective.id === "points_7")?.achieved === true
);
check(
  "styretillit-målet leser Club Week-verdien",
  objectives.find((objective) => objective.id === "board_trust_40")?.achieved === true
);
check(
  "beslutningsmålet ser kampen med positiv beslutningssum",
  objectives.find((objective) => objective.id === "positive_decisions")?.achieved === true
);

// --- 5) Sluttvurdering --------------------------------------------------------
console.log("\nSluttvurdering (trusted/pressure/failed):");
const verdict = computeMiniSeasonVerdict({ miniSeason: season, clubWeekState });
check(
  "vurdering beregnes med poeng og tekster",
  verdict &&
    ["trusted", "pressure", "failed"].includes(verdict.verdict) &&
    verdict.points === 7 &&
    verdict.headline.length > 0 &&
    verdict.detail.length > 0 &&
    verdict.recommendation.length > 0
);

function buildSeasonWithOutcomes(allOutcomes, decisionScore = 0) {
  const trial = createMiniSeason({ opponentIds });
  allOutcomes.forEach((outcome, index) => {
    registerMiniSeasonResult(trial, buildResult(index, outcome, { decisionScore }));
  });
  return trial;
}

const strongSeason = buildSeasonWithOutcomes(["win", "win", "win", "win", "draw"], 2);
const strongVerdict = computeMiniSeasonVerdict({
  miniSeason: strongSeason,
  clubWeekState: { ...clubWeekState, boardTrust: 62, playerMorale: 60 }
});
check(`sterk periode gir trusted (${strongVerdict.verdict})`, strongVerdict.verdict === "trusted");

const weakSeason = buildSeasonWithOutcomes(["loss", "loss", "loss", "loss", "loss"], -2);
const weakVerdict = computeMiniSeasonVerdict({
  miniSeason: weakSeason,
  clubWeekState: { ...clubWeekState, boardTrust: 34, playerMorale: 38, mediaPressure: 70 }
});
check(`svak periode gir failed (${weakVerdict.verdict})`, weakVerdict.verdict === "failed");

const mixedSeason = buildSeasonWithOutcomes(["win", "draw", "loss", "draw", "loss"], 1);
const mixedVerdict = computeMiniSeasonVerdict({ miniSeason: mixedSeason, clubWeekState });
check(`ujevn periode gir pressure (${mixedVerdict.verdict})`, mixedVerdict.verdict === "pressure");

// --- 6) Testkamp uten mini-sesong og PR #55-porten ----------------------------
console.log("\nTestkamp uten mini-sesong og Club Week-porten:");
check("uten mini-sesong finnes ingen planlagt motstander", getNextMiniSeasonOpponentId(null) === null);
check(
  "fullført sesong styrer ikke lenger motstanderen",
  getNextMiniSeasonOpponentId(season) === null
);

// Kampdag uten motstander-override velger fortsatt en av profilene selv
// (testkamp-flyten fra Kampdag v0.2 er urørt).
const teamFit = {
  teamScore: 70,
  completeCount: 11,
  totalSlots: 11,
  metrics: {
    balanceScore: 70,
    widthScore: 70,
    depthScore: 70,
    buildUpScore: 70,
    pressScore: 70,
    restDefenseScore: 70,
    roleFitAverage: 70
  },
  relationships: { relationshipScore: 70 },
  historicalFormationFit: { historicalScore: 70, historicalBonus: 1, historicalPenalty: 0 },
  badgeEffects: {}
};
const formation = { id: "wm_3223", name: "WM", slots: [], matchEngineEffects: { defensiveSecurity: 6 } };
const testSession = createMatchdaySession({ teamFit, formation, opponent: null });
check(
  "testkamp uten mini-sesong får tilfeldig motstanderprofil",
  OPPONENT_PROFILES.some((profile) => profile.id === testSession.opponent?.id)
);

// Planlagt motstander fra mini-sesongen kan sendes inn som opponent.
const plannedProfile = OPPONENT_PROFILES.find((profile) => profile.id === reloaded.plan[0]);
const plannedSession = createMatchdaySession({ teamFit, formation, opponent: plannedProfile });
check(
  "aktiv mini-sesong kan styre kampens motstander",
  plannedSession.opponent?.id === reloaded.plan[0]
);

// Kampdag ↔ Club Week-porten fra PR #55 er intakt.
const matchDayWeek = { week: 3, phase: "matchday" };
check(
  "matchday uten spilt kamp stenger porten",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchDayWeek }).isBlocked === true
);
check(
  "kamp spilt denne uka åpner porten",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchDayWeek, lastMatch: { playedInClubWeek: 3 } }).isBlocked === false
);
check(
  "pågående kampsesjon stenger porten",
  evaluateClubWeekMatchdayGate({
    clubWeekState: matchDayWeek,
    lastMatch: { playedInClubWeek: 3 },
    hasActiveSession: true
  }).isBlocked === true
);

console.log(failures === 0 ? "\nAlle sjekker besto." : `\n${failures} sjekk(er) feilet.`);
process.exit(failures === 0 ? 0 : 1);

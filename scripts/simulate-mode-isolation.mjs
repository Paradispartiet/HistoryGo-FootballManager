import assert from "node:assert/strict";
import {
  MODE_SESSION_KEY,
  captureModeSession,
  migrateModeSessions,
  persistModeEnvelope,
  resetSecondarySession,
  switchModeSession
} from "../src/football-mode-sessions.js";
import {
  startMiniSeason,
  applyMiniSeasonMatchResult,
  advanceMiniSeasonWeek
} from "../src/football-mini-season.js";
import { readFile } from "node:fs/promises";

const checks = [];
function check(label, run) {
  run();
  checks.push(label);
  console.log(`  ok   ${label}`);
}
function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    dump: () => Object.fromEntries(values)
  };
}

console.log("Mode Isolation v1 — simulering\n");

const leagueSeason = startMiniSeason({ seasonId: "league-1", teamName: "HG FK" });
const league = {
  selectedFormationId: "modern_433",
  selectedTacticId: "possession",
  lineup: { GK: { playerId: "keeper", roleId: "sweeper_keeper" } },
  weeklyTrainingFocus: { focusId: "pressing", week: 3 },
  weeklyTrainingProgram: { programId: "control", week: 3 },
  clubWeekState: { week: 3, phase: "training", metrics: { morale: 64, fatigue: 28 } },
  matchday: { lastMatch: { id: "league-match-2" }, session: null },
  miniSeason: leagueSeason,
  firstTimePlaythrough: { started: true, completed: true, currentStep: "complete" }
};
const state = structuredClone(league);
let envelope = { version: "mode-sessions.v1", activeMode: "league", sessions: { league: captureModeSession(state), scenario: null, training: null } };
const leagueBefore = JSON.stringify(envelope.sessions.league);

check("ligasnapshot er byte-identisk etter inn/ut av treningsrom", () => {
  envelope = switchModeSession(envelope, state, "training");
  state.selectedFormationId = "classic_442";
  state.lineup.GK.roleId = "goalkeeper";
  state.weeklyTrainingFocus = { focusId: "set_pieces", week: 1 };
  envelope = switchModeSession(envelope, state, "league");
  assert.equal(JSON.stringify(envelope.sessions.league), leagueBefore);
  assert.equal(JSON.stringify(captureModeSession(state)), leagueBefore);
});

check("nullstill påvirker bare treningsrommet", () => {
  envelope = switchModeSession(envelope, state, "training");
  state.selectedFormationId = "classic_442";
  envelope.sessions.training = captureModeSession(state);
  envelope = resetSecondarySession(envelope, state, "training");
  assert.equal(state.selectedFormationId, "modern_433");
  assert.equal(JSON.stringify(envelope.sessions.league), leagueBefore);
});

check("scenario har separat uke, kampplan og resultater", () => {
  envelope = switchModeSession(envelope, state, "league");
  envelope = switchModeSession(envelope, state, "scenario", { reset: true });
  state.miniSeason = startMiniSeason({ seasonId: "ajax-scenario", teamName: "Ajax-utfordrer" });
  const scenarioWeekOne = applyMiniSeasonMatchResult(state.miniSeason, {
    id: "scenario-match-1", score: { home: 2, away: 1 }, outcome: "win"
  });
  state.miniSeason = advanceMiniSeasonWeek(scenarioWeekOne);
  assert.equal(state.miniSeason.weekIndex, 1);
  assert.equal(state.miniSeason.matchHistory.length, 1);
  assert.equal(envelope.sessions.league.miniSeason.weekIndex, 0);
  assert.equal(envelope.sessions.league.miniSeason.matchHistory.length, 0);
});

check("ferdig scenariokamp endrer ikke ligaens tabell, terminliste eller spillerstatus", () => {
  const leagueSnapshot = JSON.stringify(envelope.sessions.league);
  state.clubWeekState.metrics = { morale: 99, fatigue: 99 };
  envelope = switchModeSession(envelope, state, "league");
  assert.equal(JSON.stringify(envelope.sessions.league), leagueSnapshot);
  assert.deepEqual(state.clubWeekState.metrics, { morale: 64, fatigue: 28 });
});

check("refresh/resume beholder aktiv ligalagring", () => {
  const storage = memoryStorage();
  persistModeEnvelope(storage, envelope);
  const resumed = migrateModeSessions(storage);
  assert.equal(resumed.activeMode, "league");
  assert.equal(JSON.stringify(resumed.sessions.league), leagueBefore);
});

check("refresh i scenario ødelegger ikke ligalagringen", () => {
  envelope = switchModeSession(envelope, state, "scenario");
  const storage = memoryStorage();
  persistModeEnvelope(storage, envelope);
  const resumed = migrateModeSessions(storage);
  assert.equal(resumed.activeMode, "scenario");
  assert.equal(JSON.stringify(resumed.sessions.league), leagueBefore);
});

check("legacy-format migreres idempotent uten sletting eller datatap", () => {
  const legacySeason = { status: "active", weekIndex: 2, schedule: [{ round: 3 }] };
  const storage = memoryStorage({
    "hgfm.gameStartState.v1": JSON.stringify({ selectedMode: "league", activeLeagueSaveId: "save-7" }),
    "historygo-football-manager.mini-season.v1": JSON.stringify(legacySeason),
    "hgfm.weeklyTrainingFocus.v1": JSON.stringify({ focusId: "pressing", week: 3 })
  });
  const first = migrateModeSessions(storage);
  const second = migrateModeSessions(storage);
  assert.deepEqual(first, second);
  assert.deepEqual(first.sessions.league.miniSeason, legacySeason);
  assert.ok(storage.getItem("historygo-football-manager.mini-season.v1"));
  assert.ok(storage.getItem(MODE_SESSION_KEY));
});

check("footer, status og panelguard følger den ene aktive modusen", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(app, /state\.modeEnvelope\?\.activeMode/);
  assert.match(app, /\.manager-portal, \.club-topbar/);
  assert.match(html, /id="secondaryModeBar"/);
  assert.match(html, /Tilbake til ligaspill/);
});

console.log(`\nAlle ${checks.length} modusisolasjonssjekker besto.`);

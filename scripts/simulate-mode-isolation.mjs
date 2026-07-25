import assert from "node:assert/strict";
import {
  MODES,
  MODE_SESSION_KEY,
  SESSION_STATE_FIELDS,
  SET_STATE_FIELDS,
  applyModeSession,
  captureModeSession,
  createSecondarySession,
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
  // Panelguarden er nå delt: alltid-league-flater vs. flater som også gates bort
  // i før-sesong (managerportal, off-pitch, «flere åpne beslutninger»).
  assert.match(app, /\.club-topbar, #clubWeekFeedback/);
  assert.match(app, /\.manager-portal, #offPitchSignalCard, \.decision-strip/);
  assert.match(app, /const leaguePreseason = leagueMode && !isLeagueSeasonActive\(\)/);
  assert.match(html, /id="secondaryModeBar"/);
  assert.match(html, /Tilbake til ligaspill/);
});

// Regresjonsvakt: Set-felt (lest/levert innboks, fullførte kunnskapsfokus) er
// `Set` i app-staten. En naiv JSON-runde gjorde dem til `{}`, og neste
// `.has(...)` kastet «has is not a function» — renderApp stoppet og appen ble
// stående i «Feil» ved hver last. Capture→apply må bevare `Set`-typen.
check("Set-felt overlever capture→apply-runden (ingen `.has is not a function`)", () => {
  assert.ok(Array.isArray(SET_STATE_FIELDS) && SET_STATE_FIELDS.length > 0);
  const source = {
    readInboxMessageIds: new Set(["m1", "m2"]),
    deliveredInboxMessageIds: new Set(["m1"]),
    completedKnowledgeFocusIds: new Set(["k1"])
  };
  const snapshot = captureModeSession(source);
  // Snapshotet må være JSON-trygt (arrays, ikke Set/{}).
  for (const field of SET_STATE_FIELDS) {
    assert.ok(Array.isArray(snapshot[field]), `${field} skal serialiseres som array`);
  }
  const roundTripped = JSON.parse(JSON.stringify(snapshot));
  const target = {};
  applyModeSession(target, roundTripped);
  for (const field of SET_STATE_FIELDS) {
    assert.ok(target[field] instanceof Set, `${field} skal rehydreres til Set`);
    assert.doesNotThrow(() => target[field].has("x"));
  }
  assert.deepEqual([...target.readInboxMessageIds].sort(), ["m1", "m2"]);
  assert.deepEqual([...target.deliveredInboxMessageIds], ["m1"]);
  // Korrupt lagret verdi (Set lagret som `{}` av gammel build) må heles til tomt Set.
  const healed = {};
  applyModeSession(healed, { deliveredInboxMessageIds: {} });
  assert.ok(healed.deliveredInboxMessageIds instanceof Set);
  assert.doesNotThrow(() => healed.deliveredInboxMessageIds.has("x"));
});

// Landslagsmodus: nasjonen og troppen er landslagets egne, og skal aldri lekke
// inn i klubblagringen. Å besøke Ullevål gir deg landslagsspillere du kan lede
// i landslagsmodus – ikke signere til klubblaget ditt.
check("landslagsmodus er en egen modus med egen nasjon og tropp", () => {
  assert.ok(MODES.includes("national"), "«national» må være en registrert modus");
  assert.ok(SESSION_STATE_FIELDS.includes("nationalTeam"), "nationalTeam må være et sesjonsfelt");
  const fresh = createSecondarySession({ selectedFormationId: "modern_433" }, "national");
  assert.deepEqual(fresh.nationalTeam, { nationality: null, squadPlayerIds: [] });
  assert.equal(fresh.firstTimePlaythrough.currentStep, "nation_select");
  assert.equal(fresh.miniSeason, null);
  assert.equal(fresh.leagueSeason, null);
});

check("landslagstroppen lekker ikke inn i klubblagringen", () => {
  envelope = switchModeSession(envelope, state, "league");
  const leagueSnapshot = JSON.stringify(envelope.sessions.league);
  envelope = switchModeSession(envelope, state, "national", { reset: true });
  state.nationalTeam = { nationality: "Norge", squadPlayerIds: ["haaland", "odegaard"] };
  state.selectedFormationId = "classic_442";
  envelope = switchModeSession(envelope, state, "league");
  assert.equal(JSON.stringify(envelope.sessions.league), leagueSnapshot);
  assert.equal(envelope.sessions.league.nationalTeam, undefined);
  // Klubbstaten må være tilbake, og landslagsfeltet borte fra den aktive staten.
  assert.equal(state.selectedFormationId, "modern_433");
  assert.equal(state.nationalTeam, undefined);
});

check("valgt nasjon huskes ved retur og over refresh", () => {
  envelope = switchModeSession(envelope, state, "national");
  assert.deepEqual(state.nationalTeam, { nationality: "Norge", squadPlayerIds: ["haaland", "odegaard"] });
  const storage = memoryStorage();
  persistModeEnvelope(storage, envelope);
  const resumed = migrateModeSessions(storage);
  assert.equal(resumed.activeMode, "national");
  assert.equal(resumed.sessions.national.nationalTeam.nationality, "Norge");
  assert.equal(JSON.stringify(resumed.sessions.league), leagueBefore);
});

check("nullstilling av landslaget rører ikke klubblaget", () => {
  envelope = resetSecondarySession(envelope, state, "national");
  assert.deepEqual(state.nationalTeam, { nationality: null, squadPlayerIds: [] });
  assert.equal(JSON.stringify(envelope.sessions.league), leagueBefore);
  envelope = switchModeSession(envelope, state, "league");
});

check("landslagsspillere er kun tilgjengelige i landslagsmodus", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  // Speidede landslagsspillere slippes inn i troppen kun når modusen er aktiv …
  assert.match(app, /if \(isNationalModeActive\(\)\) \{[\s\S]{0,400}nationalOnlyPlayerIds\.forEach/);
  // … og da filtrert på den valgte nasjonen.
  assert.match(app, /getNationalTeamNationality\(\)/);
  assert.match(app, /nationality !== nationality/);
  assert.match(app, /function isNationalModeActive\(\)\s*\{\s*return state\.modeEnvelope\?\.activeMode === "national";/);
  // Panelet finnes, og er skjult utenfor landslagsmodus.
  assert.match(html, /id="nationalTeamPanel"/);
  assert.match(html, /data-start-mode="national"/);
  assert.match(app, /panel\.hidden = !isNationalModeActive\(\)/);
});

console.log(`\nAlle ${checks.length} modusisolasjonssjekker besto.`);

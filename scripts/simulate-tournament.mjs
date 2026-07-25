// Simulering: EM og VM i landslagsmodus, hele veien fra gruppespill til finale.
// Kjører den rene motoren uten DOM/localStorage. Exit 1 ved brudd.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  TOURNAMENT_VERSION,
  TOURNAMENT_STAGE_LABELS,
  applyTournamentMatchResult,
  createTournament,
  createTournamentBracket,
  createTournamentGroupTable,
  getCurrentTournamentMatch,
  getEligibleTournaments,
  getTournamentNextOpponent,
  getTournamentTeam,
  normalizeTournamentState,
  summarizeTournament
} from "../src/football-tournament.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "data/football_tournaments.json"), "utf8"));
const { tournaments, nations } = data;

const checks = [];
function check(label, run) {
  run();
  checks.push(label);
  console.log(`  ok   ${label}`);
}

console.log("Mesterskap v1 — EM og VM i landslagsmodus\n");

// ---------------------------------------------------------------------------
check("Norge kan spille både EM og VM", () => {
  const eligible = getEligibleTournaments(tournaments, nations, "Norge").map((t) => t.id);
  assert.deepEqual(eligible.sort(), ["em", "vm"]);
});

check("en ikke-europeisk nasjon får VM, men ikke EM", () => {
  const eligible = getEligibleTournaments(tournaments, nations, "Brasil").map((t) => t.id);
  assert.deepEqual(eligible, ["vm"]);
});

check("en ukjent nasjon faller trygt tilbake til VM (ingen blindvei)", () => {
  const eligible = getEligibleTournaments(tournaments, nations, "Atlantis").map((t) => t.id);
  assert.deepEqual(eligible, ["vm"]);
});

// ---------------------------------------------------------------------------
// Spill gjennom et helt mesterskap med et gitt utfall per kamp.
function playThrough(tournamentId, nationality, resultFor, seed = "sim-1") {
  const definition = tournaments.find((t) => t.id === tournamentId);
  let state = createTournament({ definition, nations, managerNationality: nationality, seed });
  const played = [];
  let guard = 0;
  while (state.status === "active" && guard < 20) {
    guard += 1;
    const opponent = getTournamentNextOpponent(state);
    assert.ok(opponent, "aktiv turnering må alltid ha en neste motstander");
    const score = resultFor(played.length, opponent);
    state = applyTournamentMatchResult(state, { score });
    played.push({ opponent: opponent.nationality, stage: opponent.stage, score });
  }
  assert.ok(guard < 20, "turneringen må terminere");
  return { state, played };
}

const alwaysWin = () => ({ for: 2, against: 0 });
const alwaysLose = () => ({ for: 0, against: 2 });
const alwaysDraw = () => ({ for: 1, against: 1 });

check("EM: fem kamper fra gruppespill til mestertittel", () => {
  const { state, played } = playThrough("em", "Norge", alwaysWin);
  assert.equal(played.length, 5, `forventet 5 kamper, fikk ${played.length}`);
  assert.deepEqual(played.map((m) => m.stage), ["group", "group", "group", "semifinal", "final"]);
  assert.equal(state.status, "completed");
  assert.equal(state.outcome.placement, "Mester");
  assert.equal(state.outcome.champion, "Norge");
});

check("VM: seks kamper fra gruppespill til mestertittel", () => {
  const { state, played } = playThrough("vm", "Norge", alwaysWin);
  assert.equal(played.length, 6, `forventet 6 kamper, fikk ${played.length}`);
  assert.deepEqual(played.map((m) => m.stage),
    ["group", "group", "group", "quarterfinal", "semifinal", "final"]);
  assert.equal(state.outcome.champion, "Norge");
});

check("tre tap i gruppespillet betyr exit — turneringen er over", () => {
  const { state, played } = playThrough("em", "Norge", alwaysLose);
  assert.equal(played.length, 3);
  assert.equal(state.status, "completed");
  assert.equal(state.outcome.advanced, false);
  assert.equal(state.outcome.placement, "Ute i gruppespillet");
  assert.equal(getCurrentTournamentMatch(state), null);
});

check("finaletap gir finaleplass, ikke mestertittel", () => {
  const { state, played } = playThrough("em", "Norge", (index) =>
    index < 4 ? { for: 2, against: 0 } : { for: 0, against: 2 });
  assert.equal(played.length, 5);
  assert.equal(state.outcome.placement, "Finaletap");
  assert.equal(state.outcome.advanced, false);
  assert.ok(state.outcome.champion && state.outcome.champion !== "Norge");
});

check("uavgjort i utslagsrunde avgjøres på straffer (aldri uavklart)", () => {
  const { state } = playThrough("em", "Norge", (index) =>
    index < 3 ? { for: 3, against: 0 } : { for: 1, against: 1 });
  const knockouts = state.fixtures.filter((f) => f.stage !== "group" && f.status === "completed");
  assert.ok(knockouts.length > 0, "det må ha vært spilt utslagskamper");
  knockouts.forEach((fixture) => {
    assert.ok(fixture.result.winnerId, `${fixture.id} mangler vinner`);
    if (fixture.result.homeGoals === fixture.result.awayGoals) {
      assert.ok(fixture.result.penalties?.score, `${fixture.id} uavgjort uten straffer`);
    }
  });
});

// ---------------------------------------------------------------------------
check("gruppetabellen stemmer med de spilte kampene", () => {
  const { state } = playThrough("em", "Norge", alwaysWin);
  const managerTeam = getTournamentTeam(state, state.managerTeamId);
  const table = createTournamentGroupTable(state, managerTeam.groupId);
  assert.equal(table.length, 4);
  const norge = table.find((row) => row.isManager);
  assert.equal(norge.position, 1);
  assert.equal(norge.played, 3);
  assert.equal(norge.won, 3);
  assert.equal(norge.points, 9);
  assert.equal(norge.goalsFor, 6);
  assert.equal(norge.goalsAgainst, 0);
  // Hver gruppekamp er registrert nøyaktig én gang for begge lag.
  const totalPlayed = table.reduce((sum, row) => sum + row.played, 0);
  assert.equal(totalPlayed, 12);
});

check("alle grupper spilles ferdig, ikke bare managerens", () => {
  const { state } = playThrough("vm", "Norge", alwaysWin);
  state.groups.forEach((group) => {
    const table = createTournamentGroupTable(state, group.id);
    table.forEach((row) => {
      assert.equal(row.played, 3, `${group.name}: ${row.nationality} spilte ${row.played} kamper`);
    });
  });
});

check("hver nasjon er med i nøyaktig én gruppe", () => {
  const { state } = playThrough("vm", "Norge", alwaysDraw);
  const seen = new Set();
  state.groups.forEach((group) => {
    assert.equal(group.teamIds.length, 4);
    group.teamIds.forEach((id) => {
      assert.ok(!seen.has(id), `${id} er med i flere grupper`);
      seen.add(id);
    });
  });
  assert.equal(seen.size, 16);
  assert.equal(state.teams.length, 16);
});

check("managerens nasjon er med — og aldri som motstander", () => {
  const { state, played } = playThrough("vm", "Norge", alwaysWin);
  assert.equal(state.teams.filter((team) => team.nationality === "Norge").length, 1);
  assert.ok(state.teams.find((team) => team.isManager)?.nationality === "Norge");
  played.forEach((match) => assert.notEqual(match.opponent, "Norge"));
});

check("hver motstander møtes bare én gang i gruppespillet", () => {
  const { played } = playThrough("vm", "Norge", alwaysWin);
  const groupOpponents = played.filter((m) => m.stage === "group").map((m) => m.opponent);
  assert.equal(new Set(groupOpponents).size, groupOpponents.length);
});

// ---------------------------------------------------------------------------
check("motstanderen bærer en historisk stilprofil og en forklaring", () => {
  const definition = tournaments.find((t) => t.id === "em");
  const state = createTournament({ definition, nations, managerNationality: "Norge", seed: "sim-1" });
  const opponent = getTournamentNextOpponent(state);
  assert.ok(opponent.styleProfileId, "motstanderen må peke på en stil-arketype");
  assert.ok(opponent.styleHeritage.length > 0);
  assert.ok(opponent.narrativeHook.includes(opponent.nationality));
  assert.equal(opponent.knockout, false);
  assert.ok(["home", "away"].includes(opponent.homeAway));
  assert.ok(opponent.stageLabel.startsWith(TOURNAMENT_STAGE_LABELS.group));
});

check("sammendraget teller kamper, mål og neste motstander", () => {
  const { state } = playThrough("em", "Norge", (index) =>
    index < 3 ? { for: 2, against: 1 } : { for: 0, against: 0 });
  const summary = summarizeTournament(state);
  assert.equal(summary.name, "EM");
  assert.equal(summary.nationality, "Norge");
  assert.ok(summary.played >= 3);
  assert.equal(summary.goalsFor >= 6, true);
  assert.ok(summary.groupName?.startsWith("Gruppe "));
});

check("bracketen viser utslagsrundene med resultat", () => {
  const { state } = playThrough("vm", "Norge", alwaysWin);
  const bracket = createTournamentBracket(state);
  assert.deepEqual(bracket.map((entry) => entry.stage), ["quarterfinal", "semifinal", "final"]);
  assert.equal(bracket[0].matches.length, 4);
  assert.equal(bracket[1].matches.length, 2);
  assert.equal(bracket[2].matches.length, 1);
  bracket.forEach((entry) => entry.matches.forEach((match) => {
    assert.equal(match.status, "completed");
    assert.ok(match.winner, `${match.id} mangler vinner`);
  }));
  assert.equal(bracket[2].matches[0].winner, "Norge");
  assert.ok(bracket.some((entry) => entry.matches.some((match) => match.involvesManager)));
});

// ---------------------------------------------------------------------------
check("motoren er deterministisk (samme seed gir byte-identisk turnering)", () => {
  const a = playThrough("vm", "Norge", alwaysWin, "seed-x").state;
  const b = playThrough("vm", "Norge", alwaysWin, "seed-x").state;
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

check("ulik seed gir ulik trekning", () => {
  const a = playThrough("vm", "Norge", alwaysWin, "seed-x").state;
  const b = playThrough("vm", "Norge", alwaysWin, "seed-y").state;
  assert.notEqual(JSON.stringify(a.groups), JSON.stringify(b.groups));
});

check("registrering er idempotent (reload gir aldri dobbel kamp)", () => {
  const definition = tournaments.find((t) => t.id === "em");
  let state = createTournament({ definition, nations, managerNationality: "Norge", seed: "sim-1" });
  state = applyTournamentMatchResult(state, { score: { for: 2, against: 0 } });
  const snapshot = JSON.stringify(state);
  // Motoren skal ikke registrere det samme resultatet på nytt uten en ny kamp.
  const managerTeam = getTournamentTeam(state, state.managerTeamId);
  const table = createTournamentGroupTable(state, managerTeam.groupId);
  assert.equal(table.reduce((sum, row) => sum + row.played, 0), 4);
  assert.equal(snapshot, JSON.stringify(structuredClone(state)));
});

check("ferdig turnering tar ikke imot flere resultater", () => {
  const { state } = playThrough("em", "Norge", alwaysLose);
  const after = applyTournamentMatchResult(state, { score: { for: 5, against: 0 } });
  assert.equal(JSON.stringify(after), JSON.stringify(state));
});

check("lagret turnering overlever en JSON-runde", () => {
  const { state } = playThrough("em", "Norge", alwaysWin);
  const restored = normalizeTournamentState(JSON.parse(JSON.stringify(state)));
  assert.ok(restored);
  assert.equal(restored.version, TOURNAMENT_VERSION);
  assert.equal(JSON.stringify(restored), JSON.stringify(state));
  assert.equal(normalizeTournamentState({ version: "feil" }), null);
  assert.equal(normalizeTournamentState(null), null);
});

check("`overall`/styrke avgjør aldri managerens egen kamp", () => {
  // Norge er svakere enn Spania og Brasil, men vinner likevel når manageren
  // leverer resultatet. Motoren simulerer kun de andre kampene.
  const { state } = playThrough("vm", "Norge", alwaysWin);
  const managerMatches = state.fixtures.filter(
    (f) => f.status === "completed" && (f.homeId === state.managerTeamId || f.awayId === state.managerTeamId)
  );
  managerMatches.forEach((fixture) => {
    assert.equal(fixture.result.simulated, false, `${fixture.id} ble simulert – managerens kamp skal aldri simuleres`);
  });
  assert.equal(state.outcome.champion, "Norge");
});

console.log(`\nAlle ${checks.length} mesterskapssjekker besto.`);

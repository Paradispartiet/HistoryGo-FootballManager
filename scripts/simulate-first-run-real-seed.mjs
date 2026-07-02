#!/usr/bin/env node
// Real-seed sim for Playable First Run Gate v1.
// Uses the repository seed files so KFUM Arena regressions are caught: the
// browser legacy seed starts at kfum_arena, and kfum_arena must not unlock any
// players. The pure next-action engine should therefore route the player to
// History Go/startmodus instead of prøveperiode/kamp.

import fs from "node:fs";
import { computeNextActions } from "../src/football-next-action.js";

const readJson = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const failures = [];
const check = (label, ok) => { if (!ok) failures.push(label); };

const merits = readJson("data/football_team_merits.example.json");
const unlocks = readJson("data/football_unlocks.json");
const indexHtml = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const appJs = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");

const unlockedPlaceIds = new Set(Array.isArray(merits.unlockedPlaceIds) ? merits.unlockedPlaceIds : []);
const playerTypes = new Set(["player", "player_candidate"]);
const seedPlayerIds = new Set();
for (const place of unlocks.placeUnlocks || []) {
  if (!unlockedPlaceIds.has(place.placeId)) continue;
  for (const unlock of place.unlocks || []) {
    if (playerTypes.has(unlock.type) && unlock.targetId) seedPlayerIds.add(unlock.targetId);
  }
}

const base = {
  hasSession: false,
  opponentName: null,
  roster: { enoughUnlocked: false, enoughBench: false, unlockedCount: seedPlayerIds.size },
  lineup: { totalSlots: 11, emptyCount: 11, firstEmptySlotId: "GK", misused: null, duplicate: null },
  clubWeekGate: { isBlocked: false, reason: "" },
  hasTrainingChoice: false,
  matchdayReady: false,
  unreadThreads: 1,
  hasUnseenReport: false,
  miniSeasonActive: false,
  clubWeek: { week: 1, phase: "inbox", phaseLabel: "Innboks" },
  firstTime: { active: true, started: false, completed: false, hasFormation: true, hasRoles: true, hasReadInbox: false, hasPlayedFirstMatch: false, hasSeenReport: false }
};

const actions = (ctx) => computeNextActions(ctx);
const primary = (ctx) => actions(ctx)[0];

check("seed starter med kfum_arena", unlockedPlaceIds.has("kfum_arena"));
check("kfum_arena-seed gir 0 spillere", seedPlayerIds.size === 0);

const seedPrimary = primary(base);
check("under 15 spillere gir Skaff spillbar tropp", seedPrimary?.title === "Skaff spillbar tropp");
check("under 15 spillere peker til History Go/startmodus", seedPrimary?.tag === "History Go" && seedPrimary?.action?.tab === "historygo");
check("History Go startstatus viser X/15", /Akkurat nå har du \$\{readiness\.unlockedCount\}\/\$\{REQUIRED_SQUAD_SIZE\}/.test(appJs));
check("startmodus forklarer 15-spillerkravet", indexHtml.includes("Du trenger 15 spillere for å starte managerløkken"));
check("KFUM-/kompetansested forklares som ikke spillersted", indexHtml.includes("Noen steder gir kompetanse, trenere eller formasjoner"));
check("spillbar tropp har knapp til Lag & taktikk", /id=\"playableSquadReady\"[\s\S]*data-tab-target=\"tactics\"/.test(indexHtml));
check(
  "startmodus skriver ikke til ekte History Go-progresjon",
  !/setItem\(\s*["'`](?:visited_places|hg_groundhopper_stats_v1)/.test(appJs)
);
check("under 15 spillere viser ikke scenario-start", !actions(base).some((a) => /scenario|prøveperiode/i.test(a.title || "")));
check("under 15 spillere viser ikke kamp", !actions(base).some((a) => a.action?.tab === "kamp"));

const localPublicStart = {
  ...base,
  roster: { enoughUnlocked: true, enoughBench: false, unlockedCount: 15 },
  lineup: { ...base.lineup, emptyCount: 11 },
  unreadThreads: 0
};
check("mocket lokal/offentlig start med 15 spillere går til Lag & taktikk", primary(localPublicStart)?.title === "Sett opp laget" && primary(localPublicStart)?.tag === "Lag & taktikk");

const readyFirstStep = {
  ...base,
  roster: { enoughUnlocked: true, enoughBench: true, unlockedCount: 15 },
  lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: null, duplicate: null },
  matchdayReady: true,
  unreadThreads: 1,
  firstTime: { ...base.firstTime, started: true, hasReadInbox: false }
};
check("11 + 4 klart går først til Innboks", primary(readyFirstStep)?.title === "Les innboksen");
check("etter innboks går flyten til Trening", primary({ ...readyFirstStep, unreadThreads: 0, firstTime: { ...readyFirstStep.firstTime, hasReadInbox: true } })?.title === "Velg treningsprogram");
check("etter trening går flyten til Kamp", primary({ ...readyFirstStep, unreadThreads: 0, hasTrainingChoice: true, firstTime: { ...readyFirstStep.firstTime, hasReadInbox: true } })?.title === "Spill kamp");

if (failures.length) {
  console.error("✗ First-run real-seed-sim feilet:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, seedPlayers: seedPlayerIds.size, primary: seedPrimary.title }, null, 2));

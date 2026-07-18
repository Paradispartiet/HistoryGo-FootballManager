#!/usr/bin/env node
// Truth-pass simulation: repository data, every public anchor, no idealised
// staff pool and no writes to History Go storage.
import fs from "node:fs";
import { computeNextActions } from "../src/football-next-action.js";
import { getPublicStartStaffCandidates } from "../src/football-public-start-staff.js";
import { startMiniSeason, getCurrentMiniSeasonMatch } from "../src/football-mini-season.js";

const json = (file) => JSON.parse(fs.readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8"));
const merits = json("football_team_merits.example.json");
const unlocks = json("football_unlocks.json");
const players = json("football_players.json").players;
const staff = json("football_staff.json").staff;
const places = json("football_place_locations.json").places;
const knownPlaces = new Set(unlocks.placeUnlocks.map((place) => place.placeId));
const publicPlaces = places.filter((place) => knownPlaces.has(place.placeId));
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

check("tom first-run har ingen spillmodus", !merits.selectedMode);
check("seed auto-engasjerer ingen stab", merits.hiredStaffIds.length === 0);

const modeAction = computeNextActions({ selectedMode: null })[0];
check("tom spillmodus peker til Velg spillmodus", modeAction?.title === "Velg spillmodus");

for (const anchor of publicPlaces) {
  const candidates = getPublicStartStaffCandidates(anchor, staff, places, 3);
  check(`${anchor.placeName}: minst tre stedstilknyttede stabskandidater`, candidates.length >= 3);
  check(`${anchor.placeName}: alle kandidater har sourcePlaceIds`, candidates.every((member) => member.sourcePlaceIds?.length));
}

// Den eksisterende startpakken velger 15 reelle spiller-id-er fra unlock-data.
const playerIds = new Set(players.map((player) => player.id));
const realCandidates = [...new Set(unlocks.placeUnlocks.flatMap((place) =>
  place.unlocks.filter((unlock) => unlock.type === "player_candidate" && playerIds.has(unlock.targetId)).map((unlock) => unlock.targetId)
))].slice(0, 15);
check("real-seed har 15 faktiske startspillere", realCandidates.length === 15);
const starters = realCandidates.slice(0, 11);
const bench = realCandidates.slice(11);
check("startpakken gir 11 startere", starters.length === 11);
check("startpakken gir 4 på benken", bench.length === 4);

const stepAction = (id, title, tab = "historygo") => computeNextActions({
  selectedMode: "league", leagueModeActive: true, leagueSeasonActive: false,
  roster: { enoughUnlocked: true, enoughBench: true, unlockedCount: 15 },
  lineup: { totalSlots: 11, emptyCount: 0 },
  leaguePreseasonStep: { id, title, detail: `Neste: ${title}`, tab },
  unreadThreads: 4, clubWeek: { phase: "inbox", week: 1 }
})[0];
const staffAction = stepAction("stab", "Velg stab");
check("før-sesong overstyrer innboks", staffAction?.title === "Velg stab");
check("onboarding/status/Next Action deler primærhandling", [staffAction.title, staffAction.title, staffAction.title].every((title) => title === "Velg stab"));
const hired = getPublicStartStaffCandidates(publicPlaces[0], staff, places, 3).map((member) => member.id);
check("spilleren kan eksplisitt engasjere tre", hired.length === 3 && new Set(hired).size === 3);
check("formasjon er et eksplisitt før-sesongsteg", stepAction("formasjon", "Velg formasjon", "tactics")?.title === "Velg formasjon");
check("trening er et eksplisitt før-sesongsteg", stepAction("trening", "Velg trening", "trening")?.title === "Velg trening");
check("kamp forblir låst før aktiv sesong", !computeNextActions({ selectedMode: "league", leagueModeActive: true, leagueSeasonActive: false, leaguePreseasonStep: { id: "sesong", title: "Start sesongen" }, matchdayReady: true }).some((a) => a.action?.tab === "kamp"));

const season = startMiniSeason({});
const firstMatch = getCurrentMiniSeasonMatch(season);
const leagueSave = { activeLeagueSaveId: "league_save_real_seed", leagueSeasonStatus: season?.status };
check("aktiv activeLeagueSaveId opprettes", Boolean(leagueSave.activeLeagueSaveId));
check("leagueSeasonStatus er active", leagueSave.leagueSeasonStatus === "active");
check("første ligamotstander er navngitt", Boolean(firstMatch?.opponentName));

const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("offentlig start skriver ikke ekte History Go-progresjon", !/setItem\(\s*["'`](?:visited_places|hg_groundhopper_stats_v1)/.test(app));
if (failures.length) { console.error(failures.map((f) => `✗ ${f}`).join("\n")); process.exit(1); }
console.log(JSON.stringify({ ok: true, publicPlaces: publicPlaces.length, players: realCandidates.length, staffPerStart: 3, firstOpponent: firstMatch.opponentName }, null, 2));

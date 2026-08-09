import fs from "node:fs";

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${label}: fant ikke forventet kildeblokk`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: kildeblokken finnes mer enn én gang`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const appUrl = new URL("../src/app.js", import.meta.url);
let app = fs.readFileSync(appUrl, "utf8");

app = replaceOnce(
  app,
  'import { resolveClubSquadAccess, listClubHeritagePlayers } from "./football-club-squad.js";',
  'import { resolveClubSquadAccess, reconcileClubBaseSquadSave, listClubHeritagePlayers } from "./football-club-squad.js";',
  "app importerer save-reparasjon"
);

app = replaceOnce(
  app,
  `    chosenPlaceName:\n      typeof base.chosenPlaceName === "string" && base.chosenPlaceName.trim() ? base.chosenPlaceName.trim() : null,\n    playerIds,\n    createdAt: typeof base.createdAt === "string" && base.createdAt.trim() ? base.createdAt : null`,
  `    chosenPlaceName:\n      typeof base.chosenPlaceName === "string" && base.chosenPlaceName.trim() ? base.chosenPlaceName.trim() : null,\n    clubId: typeof base.clubId === "string" && base.clubId.trim() ? base.clubId.trim() : null,\n    poolVersion: typeof base.poolVersion === "string" && base.poolVersion.trim() ? base.poolVersion.trim() : null,\n    generatedFrom: base.generatedFrom === "club_pool" ? "club_pool" : null,\n    repairedAt: typeof base.repairedAt === "string" && base.repairedAt.trim() ? base.repairedAt : null,\n    playerIds,\n    createdAt: typeof base.createdAt === "string" && base.createdAt.trim() ? base.createdAt : null`,
  "localStart metadata"
);

app = replaceOnce(
  app,
  `function getLocalStartPlayerIds() {\n  const localStart = normalizeLocalStart(state.teamMerits?.localStart);\n  return localStart.enabled ? localStart.playerIds : [];\n}`,
  `function getLocalStartPlayerIds() {\n  const localStart = normalizeLocalStart(state.teamMerits?.localStart);\n  if (!localStart.enabled) return [];\n\n  // Eldre saves kan ha en global auto-tropp lagret før klubbpoolen ble canonical.\n  // Reparer den idempotent mot den valgte klubbens faktiske pool før\n  // availability får lov til å gjøre spillerne tilgjengelige.\n  const takeoverClub = getTakeoverClub();\n  if (takeoverClub && localStart.source === "auto_squad") {\n    const access = getClubSquadAccess(takeoverClub);\n    const repair = reconcileClubBaseSquadSave({ localStart, access });\n    if (repair.changed) {\n      state.teamMerits.localStart = normalizeLocalStart(repair.localStart);\n      state.localStartMessage = repair.message || "";\n      saveTeamMerits();\n      return state.teamMerits.localStart.enabled ? state.teamMerits.localStart.playerIds : [];\n    }\n  }\n\n  return localStart.playerIds;\n}`,
  "automatisk save-reparasjon"
);

app = replaceOnce(
  app,
  `function activateStarterSquad(chosenPlayerIds = null) {`,
  `function activateStarterSquad(chosenPlayerIds = null, metadata = null) {`,
  "activateStarterSquad metadata-signatur"
);

app = replaceOnce(
  app,
  `    chosenPlaceId: null,\n    chosenPlaceName: null,\n    playerIds,\n    createdAt: new Date().toISOString()`,
  `    chosenPlaceId: null,\n    chosenPlaceName: null,\n    clubId: typeof metadata?.clubId === "string" ? metadata.clubId : null,\n    poolVersion: typeof metadata?.poolVersion === "string" ? metadata.poolVersion : null,\n    generatedFrom: metadata?.generatedFrom === "club_pool" ? "club_pool" : null,\n    repairedAt: null,\n    playerIds,\n    createdAt: new Date().toISOString()`,
  "lagre klubbpoolmetadata"
);

app = replaceOnce(
  app,
  `        activateStarterSquad(access.baseSquad);`,
  `        activateStarterSquad(access.baseSquad, {\n          clubId: club.id,\n          poolVersion: access.version,\n          generatedFrom: "club_pool"\n        });`,
  "overtakelse lagrer klubbpoolmetadata"
);

const fallbackStart = app.indexOf("  // Starttroppen er det eksisterende spillbarhetsgulvet");
const fallbackEnd = app.indexOf("  // Lokal start utvider bare spillerpoolen.", fallbackStart);
if (fallbackStart < 0 || fallbackEnd < 0) throw new Error("fant ikke availability-starttroppblokken");
const fallbackReplacement = `  // Starttroppen er et spillbarhetsgulv. For en overtatt klubb kommer gulvet\n  // ALLTID fra klubbens egen pool; den globale startertroppen er bare fallback\n  // for egenopprettet klubb. Dermed kan en tom/eldre klubb-save aldri snike inn\n  // tilfeldige spillere fra andre klubber.\n  const localStartPlayerIds = getLocalStartPlayerIds();\n  if (!localStartPlayerIds.length && !isNationalModeActive()) {\n    const takeoverClub = getTakeoverClub();\n    const fallbackPlayerIds = takeoverClub\n      ? (getClubSquadAccess(takeoverClub)?.baseSquad || [])\n      : getStarterSquadPlayerIds(REQUIRED_SQUAD_SIZE);\n    fallbackPlayerIds.forEach((playerId) => {\n      unlockedPlayerIds.add(playerId);\n      const sources = playerSourceById.get(playerId) || { placeIds: new Set(), localStart: false };\n      sources.localStart = true;\n      playerSourceById.set(playerId, sources);\n    });\n  }\n\n`;
app = app.slice(0, fallbackStart) + fallbackReplacement + app.slice(fallbackEnd);

app = replaceOnce(
  app,
  `  if (sources.localStart) {\n    result.push({ placeId: null, placeName: "Lokal starttropp", source: "local_start" });\n  }`,
  `  if (sources.localStart) {\n    const localStart = normalizeLocalStart(state.teamMerits?.localStart);\n    const poolClub = localStart.clubId\n      ? (state.leaguePyramid?.clubs || []).find((club) => club.id === localStart.clubId)\n      : null;\n    result.push({\n      placeId: null,\n      placeName: poolClub ? \\`${poolClub.name} · grunntropp\\` : "Lokal starttropp",\n      source: localStart.generatedFrom === "club_pool" ? "club_pool" : "local_start"\n    });\n  }`,
  "vis klubbpool som spillerkilde"
);

fs.writeFileSync(appUrl, app);

const docsUrl = new URL("../docs/klubbvalg.md", import.meta.url);
let docs = fs.readFileSync(docsUrl, "utf8");
docs = docs.replace(
  "| **Har ikke vært der** | En automatisk grunntropp, og klubbens spillere åpner seg når du besøker banen. |",
  "| **Har ikke vært der** | En automatisk grunntropp fra klubbens egen spillerpool. Resten av klubbpoolen åpnes når du besøker banen. |"
);
docs = docs.replace(
  "Ingen ny gate er funnet opp: spillerne var allerede knyttet til steder gjennom\n`sourcePlaceIds`, og `computeAvailability()` gatet dem allerede på besøkte\nsteder. Det som manglet var koblingen **klubb → bane** (`homePlaceId`) og en\ngrunntropp så et klubbvalg aldri blir en blindvei.",
  "Klubbmedlemskap og oppdagelsessted er nå to forskjellige fakta. `clubAffiliations`\npå spilleren bestemmer hvilken klubbpool spilleren tilhører. `sourcePlaceIds`\nbestemmer bare hvilke History Go-steder som kan oppdage/låse opp spilleren.\n`homePlaceId` kobler separat klubben til banen som åpner resten av poolen. En\nspiller kan dermed være dokumentert klubbspiller uten at klubbidentiteten\navhenger av hvor History Go-kortet hans ligger."
);
const marker = "Tabellen over er **vaktet mot dataene** (`sim:club-squad`)";
if (docs.includes(marker) && !docs.includes("Klubber uten ferdig spillerpool")) {
  docs = docs.replace(marker, "**Klubber uten ferdig spillerpool blir ikke lenger fylt med tilfeldige ekte spillere.** De står som `pending` i klubbdataene og er midlertidig ute av overtakelseslista til minst 15 dokumenterte klubbtilknytninger finnes. Poolen kan bygges ferdig uavhengig av om klubben allerede har et History Go-sted.\n\n" + marker);
}
fs.writeFileSync(docsUrl, docs);

console.log(JSON.stringify({ ok: true, patched: ["src/app.js", "docs/klubbvalg.md"] }, null, 2));

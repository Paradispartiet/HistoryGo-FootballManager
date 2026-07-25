// Dataaudit: data/football_tournaments.json.
// Sjekker skjema, referanser til de historiske stil-arketypene og at hvert
// mesterskap faktisk kan fylles med nasjoner. Exit 1 ved brudd.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { HISTORICAL_OPPONENT_PROFILES } from "../src/football-historical-opponent-profiles.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
function check(label, ok, detail = "") {
  results.push({ label, ok: Boolean(ok), detail });
}

const raw = readFileSync(join(root, "data/football_tournaments.json"), "utf8");
const data = JSON.parse(raw);

check("skjema er historygo-football-manager.tournaments.v1",
  data.schema === "historygo-football-manager.tournaments.v1", data.schema);
check("version er et tall", Number.isInteger(data.version), String(data.version));
check("tournaments og nations er lister",
  Array.isArray(data.tournaments) && Array.isArray(data.nations));

const tournaments = Array.isArray(data.tournaments) ? data.tournaments : [];
const nations = Array.isArray(data.nations) ? data.nations : [];
const profileIds = new Set(HISTORICAL_OPPONENT_PROFILES.map((profile) => profile.id));
const VALID_STAGES = new Set(["quarterfinal", "semifinal", "final"]);

check("både EM og VM finnes",
  ["em", "vm"].every((id) => tournaments.some((t) => t.id === id)),
  tournaments.map((t) => t.id).join(", "));

const seenTournamentIds = new Set();
for (const tournament of tournaments) {
  const label = tournament.id || "(uten id)";
  check(`${label}: unik id`, tournament.id && !seenTournamentIds.has(tournament.id));
  seenTournamentIds.add(tournament.id);
  check(`${label}: har navn og fullt navn`,
    typeof tournament.name === "string" && tournament.name.length > 0 &&
    typeof tournament.fullName === "string" && tournament.fullName.length > 0);
  check(`${label}: teamCount = groupCount × groupSize`,
    tournament.teamCount === tournament.groupCount * tournament.groupSize,
    `${tournament.teamCount} vs ${tournament.groupCount}×${tournament.groupSize}`);
  check(`${label}: gruppene er like store og minst 3 lag`,
    Number.isInteger(tournament.groupSize) && tournament.groupSize >= 3);
  check(`${label}: utslagsrundene er kjente steg`,
    Array.isArray(tournament.knockoutStages) && tournament.knockoutStages.length > 0 &&
    tournament.knockoutStages.every((stage) => VALID_STAGES.has(stage)),
    String(tournament.knockoutStages));
  check(`${label}: siste utslagsrunde er finalen`,
    tournament.knockoutStages?.[tournament.knockoutStages.length - 1] === "final");

  // Bracket-matematikk: antall kvalifiserte må gå opp i utslagsrundene.
  const qualified = tournament.groupCount * 2;
  const expectedStages = Math.log2(qualified);
  check(`${label}: ${qualified} kvalifiserte gir ${expectedStages} utslagsrunder`,
    Number.isInteger(expectedStages) && tournament.knockoutStages?.length === expectedStages,
    `${tournament.knockoutStages?.length} runder oppgitt`);

  // Managerens kampantall: gruppekamper + utslagsrunder.
  const managerMatches = (tournament.groupSize - 1) + tournament.knockoutStages.length;
  check(`${label}: managerMatches stemmer med strukturen`,
    tournament.managerMatches === managerMatches,
    `oppgitt ${tournament.managerMatches}, beregnet ${managerMatches}`);
  check(`${label}: har en forklarende ramme (summary + learningFrame)`,
    typeof tournament.summary === "string" && tournament.summary.length > 10 &&
    typeof tournament.learningFrame === "string" && tournament.learningFrame.length > 10);
}

const seenNations = new Set();
for (const nation of nations) {
  const label = nation.nationality || "(uten nasjonalitet)";
  check(`${label}: unik nasjonalitet`, nation.nationality && !seenNations.has(nation.nationality));
  seenNations.add(nation.nationality);
  // Referanseintegritet: stil-arketypen må finnes.
  check(`${label}: styleProfileId peker på en ekte stil-arketype`,
    profileIds.has(nation.styleProfileId), String(nation.styleProfileId));
  check(`${label}: har en forklart taktisk arv`,
    typeof nation.styleHeritage === "string" && nation.styleHeritage.length > 10);
  check(`${label}: styrke er i det høye sjiktet (70-90)`,
    Number(nation.strength) >= 70 && Number(nation.strength) <= 90, String(nation.strength));
  check(`${label}: har minst én konføderasjon`,
    Array.isArray(nation.confederations) && nation.confederations.length > 0);
}

// Hvert mesterskap må kunne fylles — ellers er modusen en blindvei.
for (const tournament of tournaments) {
  const pool = nations.filter((nation) => nation.confederations?.includes(tournament.confederation));
  check(`${tournament.id}: nok nasjoner til å fylle mesterskapet`,
    pool.length >= tournament.teamCount,
    `${pool.length} tilgjengelige, trenger ${tournament.teamCount}`);
  // Og det må gå opp selv når managerens nasjon tas ut av motstanderpoolen.
  check(`${tournament.id}: går opp også når managerens nasjon trekkes fra`,
    pool.length - 1 >= tournament.teamCount - 1);
}

// Spillernes nasjoner: minst én nasjon i spillerdataen må kunne lede et
// mesterskap, ellers har ingen noe å spille.
{
  const players = JSON.parse(readFileSync(join(root, "data/football_players.json"), "utf8")).players || [];
  const playerNations = new Set(players.map((player) => String(player.nationality || "").trim()).filter(Boolean));
  const covered = [...playerNations].filter((nation) => seenNations.has(nation));
  check("minst én spillernasjon finnes i mesterskapsdataen", covered.length > 0,
    `dekket: ${covered.join(", ") || "ingen"}`);
  check("Norge er dekket (dagens spillbare nasjon)", seenNations.has("Norge"));
}

// ---- Rapport ---------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log("Mesterskapsaudit: data/football_tournaments.json\n");
for (const item of failed) {
  console.log(`    ✗ ${item.label}${item.detail ? ` (${item.detail})` : ""}`);
}
console.log(`${results.length - failed.length}/${results.length} sjekker bestått.`);

if (failed.length > 0) {
  console.error(`\n✗ Mesterskapsaudit feilet: ${failed.length} brudd.`);
  process.exit(1);
}
console.log("\n✓ Mesterskapsaudit OK.");
process.exit(0);

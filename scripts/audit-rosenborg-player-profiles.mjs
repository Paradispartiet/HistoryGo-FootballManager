#!/usr/bin/env node
// ============================================================================
// audit:rosenborg-player-profiles — alle Lerkendal-spillere har en brukbar
// klubbprofil uten at klubbkonteksten blir en parallell ratingmotor.
// ============================================================================

import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CLUB_PLAYER_PROFILE_VERSION,
  enrichClubPlayerProfile
} from "../src/football-club-player-profiles.js";
import { listClubHeritagePlayers } from "../src/football-club-squad.js";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const players = read("data/football_players.json").players || [];
const roles = read("data/football_roles.json").roles || [];
const attributes = read("data/football_attributes.json");
const HOME = "lerkendal_stadion";
const VALID_POSITIONS = new Set(["GK", "CB", "LB", "RB", "WB", "DM", "CM", "AM", "LW", "RW", "ST"]);
const attributeIds = new Set((attributes.attributes || []).map((entry) => entry.id));
const aliases = attributes.strengthAliases || {};

let checks = 0;
const check = (label, condition, detail = "") => {
  checks += 1;
  assert.ok(condition, `${label}${detail ? ` — ${detail}` : ""}`);
};
const resolveStrength = (token) => attributeIds.has(token) || attributeIds.has(aliases[token]);

const raw = players.filter((player) => (player.sourcePlaceIds || []).includes(HOME));
const heritage = listClubHeritagePlayers({ homePlaceId: HOME, players });

check("Rosenborg-pakken er fullskala", raw.length >= 150, String(raw.length));
check("berikelsen mister ingen Lerkendal-spillere", heritage.length === raw.length, `${heritage.length}/${raw.length}`);
check("alle spiller-id-er er unike", new Set(heritage.map((player) => player.id)).size === heritage.length);

for (const player of heritage) {
  const prefix = `${player.name} (${player.id})`;
  const profile = player.clubProfile;
  check(`${prefix}: har klubbprofil`, Boolean(profile));
  check(`${prefix}: riktig profilversjon`, profile?.version === CLUB_PLAYER_PROFILE_VERSION, profile?.version || "mangler");
  check(`${prefix}: er koblet til Rosenborg/Lerkendal`, profile?.clubId === "rosenborg" && profile?.homePlaceId === HOME);
  check(`${prefix}: har klubbstatus`, Boolean(profile?.statusId && profile?.statusLabel && Number.isFinite(profile?.statusRank)));
  check(`${prefix}: har tjenestetype`, Boolean(profile?.tenureType));
  check(`${prefix}: har dokumentert hovedposisjon`, Array.isArray(profile?.documentedPositions) && profile.documentedPositions.length > 0);
  check(`${prefix}: bare gyldige posisjonskoder`, [...(profile?.documentedPositions || []), ...(profile?.secondaryPositions || [])].every((pos) => VALID_POSITIONS.has(pos)));
  check(`${prefix}: posisjonen er aktiv i spillerobjektet`, JSON.stringify(profile?.documentedPositions) === JSON.stringify(player.naturalPositions));
  check(`${prefix}: har minst én styrke`, Array.isArray(profile?.strengths) && profile.strengths.length > 0);
  check(`${prefix}: styrkene tilhører kanonisk attributtvokabular`, (profile?.strengths || []).every(resolveStrength), (profile?.strengths || []).filter((token) => !resolveStrength(token)).join(", "));
  check(`${prefix}: har svakhetsgrunnlag`, Boolean(profile?.weaknessInputs));
  check(`${prefix}: svakheter utledes av eksisterende motor`, profile?.weaknessInputs?.derivation === "existing_player_data_and_weakness_engine");
  check(`${prefix}: har bruksvarsel`, typeof profile?.weaknessInputs?.usageWarning === "string");
  check(`${prefix}: har kildegrad`, ["A", "B", "C"].includes(profile?.evidenceGrade), profile?.evidenceGrade || "mangler");
  check(`${prefix}: har minst to kildehenvisninger`, Array.isArray(profile?.sources) && profile.sources.length >= 2);
  check(`${prefix}: klassen er urørt`, player.classHeight === raw.find((entry) => entry.id === player.id)?.classHeight);
  check(`${prefix}: foretrukne roller er bevart`, Array.isArray(player.preferredRoles));
}

// De mest åpenbare posisjonsfeilene som utløste produksjonsjobben.
const byName = new Map(heritage.map((player) => [player.name, player]));
const kalle = heritage.find((player) => /Kalle.*Løken|Karl-Petter.*Løken/.test(player.name));
const skammelsrud = byName.get("Bent Skammelsrud");
const mini = heritage.find((player) => /Mini.*Jakobsen|Jahn Ivar.*Jakobsen/.test(player.name));
const strand = byName.get("Roar Strand");
check("Kalle Løken er høyresideprofil, ikke ren nier", Boolean(kalle) && kalle.naturalPositions.includes("RW") && kalle.naturalPositions.includes("RB") && !kalle.naturalPositions.includes("ST"));
check("Bent Skammelsrud er sentral/dyp midtbane", Boolean(skammelsrud) && skammelsrud.naturalPositions.includes("CM") && skammelsrud.naturalPositions.includes("DM"));
check("Mini Jakobsen er kantspiller", Boolean(mini) && mini.naturalPositions.includes("RW") && mini.naturalPositions.includes("LW"));
check("Roar Strand er indreløper med dokumentert allsidighet", Boolean(strand) && strand.naturalPositions.includes("CM") && strand.usablePositions.includes("RB"));

// En spiller uten Lerkendal-link skal ikke få Rosenborg-status ved en tilfeldighet.
const outsider = players.find((player) => !(player.sourcePlaceIds || []).includes(HOME));
if (outsider) {
  const untouched = enrichClubPlayerProfile(outsider, { homePlaceId: HOME });
  check("ikke-Rosenborg-spiller får ingen Rosenborg-profil", untouched.clubProfile === undefined);
}

console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  rosenborgSpillere: heritage.length,
  status: Object.fromEntries([...new Set(heritage.map((player) => player.clubProfile.statusId))]
    .sort().map((statusId) => [statusId, heritage.filter((player) => player.clubProfile.statusId === statusId).length])),
  posisjonsKorreksjoner: heritage.filter((player) => player.clubProfile.positionEvidence === "researched_override").length,
  kildegrader: Object.fromEntries(["A", "B", "C"].map((grade) => [grade, heritage.filter((player) => player.clubProfile.evidenceGrade === grade).length]))
}, null, 2));

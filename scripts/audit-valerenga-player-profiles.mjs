#!/usr/bin/env node
// ============================================================================
// audit:valerenga-player-profiles — alle Intility-koblede spillere skal ha
// posisjon, styrker, brukskostnader, klubbstatus og kildegrad uten ny rating.
// ============================================================================

import assert from "node:assert/strict";
import fs from "node:fs";
import {
  VALERENGA_PLAYER_PROFILE_VERSION,
  enrichValerengaPlayerProfile
} from "../src/football-valerenga-player-profiles.js";
import { listClubHeritagePlayers } from "../src/football-club-squad.js";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const players = read("data/football_players.json").players || [];
const attributes = read("data/football_attributes.json");
const HOME = "intility_arena";
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

check("Vålerenga-pakken er fullskala", raw.length >= 120, String(raw.length));
check("berikelsen mister ingen Intility-spillere", heritage.length === raw.length, `${heritage.length}/${raw.length}`);
check("alle spiller-id-er er unike", new Set(heritage.map((player) => player.id)).size === heritage.length);

for (const player of heritage) {
  const prefix = `${player.name} (${player.id})`;
  const profile = player.clubProfile;
  check(`${prefix}: har klubbprofil`, Boolean(profile));
  check(`${prefix}: riktig profilversjon`, profile?.version === VALERENGA_PLAYER_PROFILE_VERSION, profile?.version || "mangler");
  check(`${prefix}: er koblet til Vålerenga/Intility`, profile?.clubId === "valerenga" && profile?.homePlaceId === HOME);
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

const find = (pattern) => heritage.find((player) => pattern.test(player.name));
const henningBerg = find(/^Henning Berg$/);
const rekdal = find(/^Kjetil Rekdal$/);
const berge = find(/^Sander Berge$/);
const berre = find(/^Morten Berre$/);
const dosSantos = find(/Freddy.*dos Santos/i);
const fredheim = find(/Daniel Fredheim Holm/i);
const moa = find(/Moa.*Abdellaoue|Mohammed.*Abdellaoue/i);

check("Henning Berg er stopper/høyreback", Boolean(henningBerg) && henningBerg.naturalPositions.includes("CB") && henningBerg.naturalPositions.includes("RB"));
check("Kjetil Rekdal er sentral/offensiv midtbane", Boolean(rekdal) && rekdal.naturalPositions.includes("CM") && rekdal.naturalPositions.includes("AM"));
check("Sander Berge er defensiv/sentral midtbane", Boolean(berge) && berge.naturalPositions.includes("DM") && berge.naturalPositions.includes("CM"));
check("Morten Berre er angrepsprofil, ikke låst til én kant", Boolean(berre) && berre.naturalPositions.includes("RW") && berre.naturalPositions.includes("ST"));
check("Freddy dos Santos beholder dokumentert allsidighet", Boolean(dosSantos) && dosSantos.naturalPositions.includes("RB") && dosSantos.usablePositions.includes("CM"));
check("Daniel Fredheim Holm er offensiv midtbane/kant", Boolean(fredheim) && fredheim.naturalPositions.includes("AM") && fredheim.naturalPositions.includes("LW"));
check("Moa er midtspiss", Boolean(moa) && moa.naturalPositions.includes("ST"));

const outsider = players.find((player) => !(player.sourcePlaceIds || []).includes(HOME));
if (outsider) {
  const untouched = enrichValerengaPlayerProfile(outsider, { homePlaceId: HOME });
  check("ikke-Vålerenga-spiller får ingen Vålerenga-profil", untouched.clubProfile === undefined);
}

console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  valerengaSpillere: heritage.length,
  status: Object.fromEntries([...new Set(heritage.map((player) => player.clubProfile.statusId))]
    .sort().map((statusId) => [statusId, heritage.filter((player) => player.clubProfile.statusId === statusId).length])),
  posisjonsKorreksjoner: heritage.filter((player) => player.clubProfile.positionEvidence === "researched_override").length,
  kildegrader: Object.fromEntries(["A", "B", "C"].map((grade) => [grade, heritage.filter((player) => player.clubProfile.evidenceGrade === grade).length]))
}, null, 2));

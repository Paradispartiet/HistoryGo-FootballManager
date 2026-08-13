export const CLUB_SQUAD_VERSION = "historygo-football-manager.club-squad.v5";
export const CLUB_PLAYER_POOL_VERSION = "historygo-football-manager.club-player-pool.v1";

export const CLUB_STATUS_RANK = Object.freeze({
  club_icon: 7,
  club_legend: 6,
  elite_career: 5,
  golden_era_core: 5,
  key_player: 4,
  club_profile: 3,
  academy_export: 3,
  short_stay_star: 3,
  squad_profile: 2
});

export const CLUB_STATUS_LABEL = Object.freeze({
  club_icon: "Klubbikon",
  club_legend: "Klubblegende",
  elite_career: "Elitekarriere",
  golden_era_core: "Gullalderens kjerne",
  key_player: "Nøkkelspiller",
  club_profile: "Klubbprofil",
  academy_export: "Akademi / eksport",
  short_stay_star: "Stjerne med kortere opphold",
  squad_profile: "Troppsprofil"
});

export const SQUAD_GROUPS = Object.freeze([
  { positions: ["GK"], count: 2 },
  { positions: ["CB", "LB", "RB", "WB"], count: 5 },
  { positions: ["DM", "CM", "AM"], count: 5 },
  { positions: ["ST", "LW", "RW"], count: 3 }
]);

export const asArray = (value) => Array.isArray(value) ? value : [];
export const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const positionsFor = (player) => [...asArray(player?.naturalPositions), ...asArray(player?.usablePositions)];
export const playsIn = (player, positions) => positionsFor(player).some((position) => positions.includes(position));

export function isSimulationReadyPlayer(player) {
  return SQUAD_GROUPS.some((group) => playsIn(player, group.positions));
}

export function clubAffiliationsFor(player) {
  return asArray(player?.clubAffiliations)
    .filter((entry) => entry && typeof entry.clubId === "string" && entry.clubId.trim())
    .map((entry) => ({
      clubId: entry.clubId.trim(),
      relation: typeof entry.relation === "string" && entry.relation ? entry.relation : "played_for",
      status: typeof entry.status === "string" && entry.status ? entry.status : null,
      source: entry.source === "belagt" ? "belagt" : "utledet"
    }));
}

export function clubAffiliationFor(player, clubId) {
  return clubId ? clubAffiliationsFor(player).find((entry) => entry.clubId === clubId) || null : null;
}

export const playerAffiliatedWithClub = (player, clubId) => Boolean(clubAffiliationFor(player, clubId));
export const clubStatusFor = (player, placeId) => player?.clubStatus?.[placeId] || null;
export const clubStatusSourceFor = (player, placeId) => player?.clubStatusSource?.[placeId] || "utledet";
export const clubStatusRank = (player, ref) => CLUB_STATUS_RANK[clubAffiliationFor(player, ref)?.status || clubStatusFor(player, ref)] ?? 0;
export const affiliationStatusRank = (player, clubId) => CLUB_STATUS_RANK[clubAffiliationFor(player, clubId)?.status] ?? 0;

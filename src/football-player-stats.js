// Spillerstatistikk v1 — hvem scoret, hvem la den fram
//
// Kampmotoren har alltid produsert sjanser og mål, men målene tilhørte ingen.
// Her får de en scorer og en målgivende, slik at sesongen kan fortelle hvem som
// faktisk leverer.
//
// Kjerneprinsippet gjelder også her: **det er ikke `overall` som avgjør.**
// Attribusjonen vektes av posisjonen spilleren står i, rollen manageren ga ham
// og hvor godt han passer der (`fit.matchScore`). En spiss med overall 88 i
// riktig rolle scorer oftere enn en spiss med overall 95 som er feilbrukt — og
// en midtstopper i en 1-1-8 kommer på scoringslista fordi manageren satte ham
// der, ikke fordi han er «dårlig».
//
// Motoren er ren: ingen DOM, ingen lagring, ingen `Date.now`. Den bruker en
// injisert `rng` (kampmotoren sender inn `Math.random`), slik at simuleringene
// kan kjøre den deterministisk.

const POSITION_GROUPS = Object.freeze({
  GK: "keeper",
  CB: "forsvar",
  LB: "back",
  RB: "back",
  WB: "back",
  DM: "midtbane",
  CM: "midtbane",
  AM: "offensiv midtbane",
  LW: "kant",
  RW: "kant",
  ST: "spiss"
});

// Hvor sannsynlig det er at et mål tilhører denne posisjonen. Tallene er
// vekter, ikke prosenter — de normaliseres mot elleveren som faktisk står der.
const GOAL_WEIGHTS = Object.freeze({
  GK: 0.02, CB: 0.5, LB: 0.35, RB: 0.35, WB: 0.5,
  DM: 0.5, CM: 1, AM: 1.9, LW: 2.1, RW: 2.1, ST: 3.6
});

// Målgivende følger et annet mønster: kantene og den offensive midtbanen legger
// flest fram, spissen færre enn han scorer.
const ASSIST_WEIGHTS = Object.freeze({
  GK: 0.05, CB: 0.3, LB: 1.1, RB: 1.1, WB: 1.4,
  DM: 0.7, CM: 1.6, AM: 2.4, LW: 2.3, RW: 2.3, ST: 1.2
});

// Roller som endrer bildet uavhengig av posisjon. En «boks-til-boks»-åtter
// scorer mer enn en balanserende sekser i samme posisjon.
const ROLE_GOAL_MULTIPLIERS = Object.freeze({
  box_striker: 1.5,
  advanced_forward: 1.35,
  pressing_forward: 1.15,
  target_striker: 1.2,
  linking_striker: 1,
  false_nine: 1.05,
  channel_runner: 1.2,
  inverted_winger: 1.35,
  wide_dribbler: 1.1,
  classic_ten: 1.15,
  free_creator: 1.1,
  box_to_box: 1.3,
  pressing_midfielder: 0.9,
  deep_playmaker: 0.7,
  regista: 0.7,
  balancing_six: 0.6,
  holding_midfielder: 0.55,
  overlapping_fullback: 0.8,
  wingback: 0.8,
  inverted_fullback: 0.6,
  support_fullback: 0.55,
  ball_playing_centre_back: 0.8,
  libero: 0.8,
  duel_centre_back: 0.9,
  stopper: 0.9,
  sweeperkeeper: 0.2,
  line_keeper: 0.15
});

const ROLE_ASSIST_MULTIPLIERS = Object.freeze({
  classic_ten: 1.6,
  free_creator: 1.55,
  regista: 1.4,
  deep_playmaker: 1.35,
  wide_dribbler: 1.45,
  overlapping_fullback: 1.5,
  wingback: 1.4,
  inverted_winger: 1.2,
  inverted_fullback: 1.05,
  support_fullback: 1.15,
  false_nine: 1.4,
  linking_striker: 1.35,
  target_striker: 0.85,
  box_striker: 0.6,
  advanced_forward: 0.75,
  channel_runner: 0.9,
  pressing_forward: 0.8,
  box_to_box: 1.15,
  pressing_midfielder: 0.95,
  balancing_six: 0.8,
  holding_midfielder: 0.7,
  ball_playing_centre_back: 0.7,
  libero: 0.8,
  duel_centre_back: 0.4,
  stopper: 0.4,
  sweeperkeeper: 0.3,
  line_keeper: 0.1
});

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

export function positionGroup(position) {
  return POSITION_GROUPS[str(position).toUpperCase()] || "utespiller";
}

// Elleveren slik statistikkmotoren trenger den: id, navn, posisjon, rolle og
// hvor godt spilleren passer der. Bygges fra teamFit én gang ved avspark, så
// kampmotoren slipper å bære hele teamFit videre inn i lagringen.
export function createLineupSnapshot(teamFit) {
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  return assignments
    .filter((assignment) => assignment?.player?.id)
    .map((assignment) => ({
      playerId: str(assignment.player.id),
      name: str(assignment.player.name) || str(assignment.player.id),
      position: str(assignment.slot?.position).toUpperCase(),
      roleId: str(assignment.role?.id),
      roleName: str(assignment.role?.name),
      // matchScore er lagets egen «passer han her»-måling. Den er grunnen til at
      // riktig brukt spiller leverer mer enn feilbrukt klasse.
      matchScore: num(assignment.fit?.matchScore, 60)
    }));
}

function weightFor(entry, table, roleMultipliers) {
  const base = num(table[entry.position], 0.4);
  const roleMultiplier = num(roleMultipliers[entry.roleId], 1);
  // Passformen løfter eller demper, men snur aldri bildet: en midtstopper blir
  // ikke toppscorer av å passe perfekt. 0.6–1.4 rundt et normalnivå på 70.
  const fitFactor = 0.6 + Math.max(0, Math.min(1, (num(entry.matchScore, 60) - 30) / 55)) * 0.8;
  return Math.max(0, base * roleMultiplier * fitFactor);
}

function pickWeighted(entries, weights, roll) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!(total > 0)) return null;
  let cursor = Math.max(0, Math.min(0.999999, roll)) * total;
  for (let i = 0; i < entries.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return entries[i];
  }
  return entries[entries.length - 1];
}

// Hvem scoret, og hvem la den fram? Målgivende er valgfri: noen mål kommer
// alene (soloraid, dødball, retur), og da skal ingen få en assist de ikke tok.
export function attributeGoal(lineup, rng = Math.random) {
  const entries = (Array.isArray(lineup) ? lineup : []).filter((entry) => entry?.playerId);
  if (entries.length === 0) return null;

  const scorer = pickWeighted(entries, entries.map((e) => weightFor(e, GOAL_WEIGHTS, ROLE_GOAL_MULTIPLIERS)), rng());
  if (!scorer) return null;

  // Omtrent tre av fire mål har en målgivende.
  if (rng() > 0.74) return { scorer, assist: null };

  const others = entries.filter((entry) => entry.playerId !== scorer.playerId);
  if (others.length === 0) return { scorer, assist: null };
  const assist = pickWeighted(others, others.map((e) => weightFor(e, ASSIST_WEIGHTS, ROLE_ASSIST_MULTIPLIERS)), rng());
  return { scorer, assist: assist || null };
}

// ---------------------------------------------------------------------------
// Sesongtabellen: aggregering av kamper
// ---------------------------------------------------------------------------

function emptyRow(entry) {
  return {
    playerId: entry.playerId,
    name: entry.name,
    position: entry.position,
    positionGroup: positionGroup(entry.position),
    appearances: 0,
    goals: 0,
    assists: 0,
    points: 0
  };
}

// Én kamps bidrag: hvem spilte, hvem scoret, hvem la den fram.
export function createMatchPlayerStats(lineup, goals) {
  const entries = (Array.isArray(lineup) ? lineup : []).filter((entry) => entry?.playerId);
  return {
    appearances: entries.map((entry) => ({
      playerId: entry.playerId,
      name: entry.name,
      position: entry.position
    })),
    goals: (Array.isArray(goals) ? goals : [])
      .filter((goal) => goal?.scorer?.playerId)
      .map((goal) => ({
        minute: num(goal.minute),
        scorerId: goal.scorer.playerId,
        scorerName: goal.scorer.name,
        assistId: goal.assist?.playerId || null,
        assistName: goal.assist?.name || null
      }))
  };
}

// Legg en ferdig kamp til sesongstatistikken. Ren funksjon: den returnerer en ny
// liste og muterer ikke den forrige.
export function applyMatchPlayerStats(previous, matchStats) {
  const rows = new Map();
  (Array.isArray(previous) ? previous : []).forEach((row) => {
    if (row?.playerId) rows.set(row.playerId, { ...row });
  });

  const ensure = (playerId, name, position) => {
    if (!rows.has(playerId)) {
      rows.set(playerId, emptyRow({ playerId, name, position }));
    }
    const row = rows.get(playerId);
    if (name && !row.name) row.name = name;
    return row;
  };

  (matchStats?.appearances || []).forEach((entry) => {
    if (!entry?.playerId) return;
    ensure(entry.playerId, entry.name, entry.position).appearances += 1;
  });

  (matchStats?.goals || []).forEach((goal) => {
    if (goal?.scorerId) ensure(goal.scorerId, goal.scorerName, "").goals += 1;
    if (goal?.assistId) ensure(goal.assistId, goal.assistName, "").assists += 1;
  });

  return [...rows.values()].map((row) => ({ ...row, points: row.goals + row.assists }));
}

// Sortert visning. Rekkefølgen er stabil: valgt kolonne først, så FÆRREST
// kamper — den som leverer like mye på færre kamper står høyest. Poengsummen
// bryter til slutt, og navnet holder rekkefølgen deterministisk.
//
// Kampene måtte bryte før poengsummen: ellers rykket en spiller med mange
// målgivende forbi en som hadde scoret like mye på under halvparten av kampene,
// på en liste som sier «mål».
export function rankPlayerStats(rows, { sortBy = "goals" } = {}) {
  const list = (Array.isArray(rows) ? rows : []).map((row) => ({ ...row }));
  const primary = (row) => (sortBy === "assists" ? row.assists : sortBy === "points" ? row.points : row.goals);
  return list.sort((a, b) =>
    primary(b) - primary(a) ||
    a.appearances - b.appearances ||
    b.points - a.points ||
    String(a.name).localeCompare(String(b.name), "nb")
  );
}

// Kort sammendrag til toppen av statistikkflata.
export function summarizePlayerStats(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const ranked = rankPlayerStats(list, { sortBy: "goals" });
  const byAssists = rankPlayerStats(list, { sortBy: "assists" });
  const totalGoals = list.reduce((sum, row) => sum + num(row.goals), 0);
  const totalAssists = list.reduce((sum, row) => sum + num(row.assists), 0);
  const matches = list.reduce((max, row) => Math.max(max, num(row.appearances)), 0);
  return {
    matches,
    totalGoals,
    totalAssists,
    topScorer: ranked[0]?.goals > 0 ? ranked[0] : null,
    topAssist: byAssists[0]?.assists > 0 ? byAssists[0] : null
  };
}

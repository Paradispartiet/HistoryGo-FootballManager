function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function signed(value) {
  const number = Number(value) || 0;
  return number > 0 ? `+${number}` : String(number);
}

function clubName(season, clubId) {
  return asArray(season?.clubs).find((club) => club.id === clubId)?.name || clubId || "Ukjent klubb";
}

function managerResultForFixture(season, fixture) {
  if (!fixture?.result || !season?.managerClubId) return null;
  const managerHome = fixture.homeClubId === season.managerClubId;
  const goalsFor = managerHome ? fixture.result.homeGoals : fixture.result.awayGoals;
  const goalsAgainst = managerHome ? fixture.result.awayGoals : fixture.result.homeGoals;
  return {
    goalsFor,
    goalsAgainst,
    outcome: goalsFor > goalsAgainst ? "win" : goalsFor < goalsAgainst ? "loss" : "draw",
    label: goalsFor > goalsAgainst ? "V" : goalsFor < goalsAgainst ? "T" : "U"
  };
}

function managerFixtureForRound(season, round) {
  return asArray(round?.matches).find((match) => (
    match.homeClubId === season?.managerClubId || match.awayClubId === season?.managerClubId
  )) || null;
}

function describeFixture(season, fixture) {
  if (!fixture) return null;
  const managerHome = fixture.homeClubId === season.managerClubId;
  const opponentId = managerHome ? fixture.awayClubId : fixture.homeClubId;
  const result = managerResultForFixture(season, fixture);
  return {
    id: fixture.id,
    round: fixture.round,
    opponent: clubName(season, opponentId),
    venue: managerHome ? "Hjemme" : "Borte",
    ground: asArray(season.clubs).find((club) => club.id === (managerHome ? season.managerClubId : opponentId))?.ground || "",
    result,
    status: fixture.status || (fixture.result ? "completed" : "scheduled")
  };
}

function compactTableRows(table, managerRow) {
  const rows = asArray(table);
  if (!managerRow) return rows.slice(0, 6);
  if (managerRow.position <= 5) return rows.slice(0, 6);

  const chosen = [
    ...rows.slice(0, 3),
    rows[managerRow.position - 2],
    managerRow,
    rows[managerRow.position]
  ].filter(Boolean);

  return [...new Map(chosen.map((row) => [row.clubId, row])).values()]
    .sort((a, b) => a.position - b.position);
}

export function createSeasonSceneModel({
  season = null,
  table = [],
  nextMatch = null,
  boardExpectation = ""
} = {}) {
  const rows = asArray(table);
  const managerRow = rows.find((row) => row.isManager || row.clubId === season?.managerClubId) || null;
  const rounds = asArray(season?.fixtures);
  const totalRounds = Number(season?.competition?.rounds) || rounds.length || 0;
  const currentRound = Number(season?.currentRound) || 1;
  const completed = [];
  const upcoming = [];

  rounds.forEach((round) => {
    const fixture = managerFixtureForRound(season, round);
    const item = describeFixture(season, fixture);
    if (!item) return;
    if (item.result) completed.push(item);
    else upcoming.push(item);
  });

  const recent = completed.slice(-5).reverse();
  const form = completed.slice(-5).map((item) => item.result.label);
  const scheduled = upcoming.slice(0, 4);
  const resolvedNext = nextMatch ? {
    round: nextMatch.round,
    opponent: nextMatch.name || nextMatch.club || "Neste motstander",
    venue: nextMatch.homeAway === "home" ? "Hjemme" : "Borte",
    ground: nextMatch.ground || "",
    matchId: nextMatch.matchId || ""
  } : scheduled[0] || null;

  const state = !season
    ? "preseason"
    : season.status === "completed"
      ? "completed"
      : "active";
  const positionTone = !managerRow
    ? "neutral"
    : managerRow.position <= Math.max(2, Math.ceil(rows.length * 0.2))
      ? "positive"
      : managerRow.position > Math.max(1, rows.length - Math.ceil(rows.length * 0.2))
        ? "negative"
        : "neutral";

  return {
    state,
    tierName: season?.competition?.tierName || season?.tier?.name || "Ligasesong",
    seasonNumber: Number(season?.seasonNumber) || 1,
    currentRound,
    totalRounds,
    managerRow,
    positionTone,
    boardExpectation: boardExpectation || "Bygg klubben gjennom sesongen.",
    nextMatch: resolvedNext,
    form,
    formLabel: form.length ? form.join(" · ") : "Ingen form ennå",
    recent,
    upcoming: scheduled,
    compactTable: compactTableRows(rows, managerRow),
    table: rows,
    goalDifferenceLabel: managerRow ? signed(managerRow.goalDifference) : "0",
    statusLabel: state === "completed"
      ? "Sesongen er ferdigspilt"
      : state === "active"
        ? `Serierunde ${currentRound} av ${totalRounds}`
        : "Før sesongstart"
  };
}

function button(label, className, handler, disabled = false) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = className;
  node.textContent = label;
  node.disabled = disabled;
  if (typeof handler === "function") node.addEventListener("click", handler);
  return node;
}

export function renderSeasonCommand(container, model, { onOpenMatch, onOpenTeam } = {}) {
  if (!container) return;
  container.textContent = "";
  container.dataset.state = model.state;
  container.dataset.positionTone = model.positionTone;

  const head = document.createElement("div");
  head.className = "season-command-head";
  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `${model.tierName} · Sesong ${model.seasonNumber}`;
  const title = document.createElement("h2");
  title.textContent = "Sesongkontroll";
  const status = document.createElement("p");
  status.className = "season-command-status";
  status.textContent = model.statusLabel;
  copy.append(eyebrow, title, status);

  const actions = document.createElement("div");
  actions.className = "season-command-actions";
  actions.append(
    button("Gå til kamp", "is-primary", onOpenMatch, !model.nextMatch || model.state !== "active"),
    button("Juster laget", "is-secondary", onOpenTeam)
  );
  head.append(copy, actions);

  const grid = document.createElement("div");
  grid.className = "season-command-grid";

  const next = document.createElement("article");
  next.className = "season-next-match";
  const nextLabel = document.createElement("span");
  nextLabel.textContent = model.state === "completed" ? "Sesongstatus" : "Neste kamp";
  const nextTitle = document.createElement("strong");
  nextTitle.textContent = model.nextMatch?.opponent || (model.state === "completed" ? "Sesongen er avgjort" : "Venter på terminliste");
  const nextMeta = document.createElement("small");
  nextMeta.textContent = model.nextMatch
    ? `Runde ${model.nextMatch.round} · ${model.nextMatch.venue}${model.nextMatch.ground ? ` · ${model.nextMatch.ground}` : ""}`
    : model.boardExpectation;
  next.append(nextLabel, nextTitle, nextMeta);

  const metrics = document.createElement("div");
  metrics.className = "season-command-metrics";
  const metricData = [
    ["Plass", model.managerRow ? `${model.managerRow.position}.` : "–"],
    ["Poeng", model.managerRow ? String(model.managerRow.points) : "0"],
    ["Målforskjell", model.goalDifferenceLabel],
    ["Form", model.formLabel]
  ];
  metricData.forEach(([label, value]) => {
    const article = document.createElement("article");
    const span = document.createElement("span");
    span.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value;
    article.append(span, strong);
    metrics.append(article);
  });

  grid.append(next, metrics);
  container.append(head, grid);
}

function renderCompactTable(model) {
  const section = document.createElement("section");
  section.className = "season-standings-card";
  const heading = document.createElement("div");
  heading.className = "season-card-heading";
  heading.innerHTML = "<span>Tabellbildet</span><strong>Rundt managerklubben</strong>";
  section.append(heading);

  const table = document.createElement("table");
  table.className = "season-compact-table";
  table.innerHTML = "<thead><tr><th>#</th><th>Klubb</th><th>S</th><th>±</th><th>P</th></tr></thead>";
  const body = document.createElement("tbody");
  model.compactTable.forEach((row, index, rows) => {
    if (index > 0 && row.position - rows[index - 1].position > 1) {
      const separator = document.createElement("tr");
      separator.className = "season-table-gap";
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = "⋯";
      separator.append(cell);
      body.append(separator);
    }
    const tr = document.createElement("tr");
    if (row.isManager) tr.className = "is-manager-club";
    const values = [row.position, row.club, row.played, signed(row.goalDifference), row.points];
    values.forEach((value, cellIndex) => {
      const cell = document.createElement(cellIndex === 1 ? "th" : "td");
      if (cellIndex === 1) cell.scope = "row";
      cell.textContent = String(value);
      tr.append(cell);
    });
    body.append(tr);
  });
  table.append(body);
  section.append(table);
  return section;
}

function fixtureItem(item, kind) {
  const li = document.createElement("li");
  li.className = `season-fixture is-${kind}${item.result ? ` is-${item.result.outcome}` : ""}`;
  const round = document.createElement("span");
  round.textContent = `R${item.round}`;
  const opponent = document.createElement("strong");
  opponent.textContent = item.opponent;
  const meta = document.createElement("small");
  meta.textContent = item.result
    ? `${item.venue} · ${item.result.goalsFor}–${item.result.goalsAgainst}`
    : `${item.venue}${item.ground ? ` · ${item.ground}` : ""}`;
  li.append(round, opponent, meta);
  return li;
}

function renderFixtureCard(model) {
  const section = document.createElement("section");
  section.className = "season-fixtures-card";
  const heading = document.createElement("div");
  heading.className = "season-card-heading";
  heading.innerHTML = "<span>Kamprytmen</span><strong>Siste og neste</strong>";
  section.append(heading);

  const columns = document.createElement("div");
  columns.className = "season-fixture-columns";
  const recent = document.createElement("div");
  recent.innerHTML = "<h4>Siste resultater</h4>";
  const recentList = document.createElement("ol");
  recentList.className = "season-fixture-list";
  if (model.recent.length) model.recent.slice(0, 3).forEach((item) => recentList.append(fixtureItem(item, "recent")));
  else {
    const empty = document.createElement("li");
    empty.className = "season-fixture-empty";
    empty.textContent = "Ingen seriekamper spilt.";
    recentList.append(empty);
  }
  recent.append(recentList);

  const upcoming = document.createElement("div");
  upcoming.innerHTML = "<h4>Kommende kamper</h4>";
  const upcomingList = document.createElement("ol");
  upcomingList.className = "season-fixture-list";
  if (model.upcoming.length) model.upcoming.slice(0, 3).forEach((item) => upcomingList.append(fixtureItem(item, "upcoming")));
  else {
    const empty = document.createElement("li");
    empty.className = "season-fixture-empty";
    empty.textContent = model.state === "completed" ? "Sesongen er ferdigspilt." : "Terminlisten er ikke klar.";
    upcomingList.append(empty);
  }
  upcoming.append(upcomingList);
  columns.append(recent, upcoming);
  section.append(columns);
  return section;
}

function renderFullTable(model) {
  const wrap = document.createElement("div");
  wrap.className = "mini-season-table-wrap season-full-table";
  const table = document.createElement("table");
  table.className = "mini-season-table";
  table.innerHTML = "<caption>Full ligatabell</caption><thead><tr><th>#</th><th>Klubb</th><th>S</th><th>V</th><th>U</th><th>T</th><th>MF</th><th>MM</th><th>±</th><th>P</th></tr></thead>";
  const body = document.createElement("tbody");
  model.table.forEach((row) => {
    const tr = document.createElement("tr");
    if (row.isManager) tr.className = "is-manager-club";
    const values = [row.position, row.club, row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, signed(row.goalDifference), row.points];
    values.forEach((value, index) => {
      const cell = document.createElement(index === 1 ? "th" : "td");
      if (index === 1) cell.scope = "row";
      cell.textContent = String(value);
      tr.append(cell);
    });
    body.append(tr);
  });
  table.append(body);
  wrap.append(table);
  return wrap;
}

function renderAllFixtures(season) {
  const details = document.createElement("details");
  details.className = "league-fixtures-details season-all-fixtures";
  const summary = document.createElement("summary");
  summary.textContent = "Åpne full terminliste og alle resultater";
  details.append(summary);
  asArray(season?.fixtures).forEach((round) => {
    const section = document.createElement("section");
    const heading = document.createElement("h4");
    heading.textContent = `Serierunde ${round.round}`;
    section.append(heading);
    asArray(round.matches).forEach((match) => {
      const row = document.createElement("p");
      row.textContent = `${clubName(season, match.homeClubId)} – ${clubName(season, match.awayClubId)}${match.result ? `  ${match.result.homeGoals}–${match.result.awayGoals}` : ""}`;
      if (match.homeClubId === season.managerClubId || match.awayClubId === season.managerClubId) row.className = "is-manager-fixture";
      section.append(row);
    });
    details.append(section);
  });
  return details;
}

export function renderSeasonLeagueOverview(container, model, season) {
  if (!container) return;
  container.textContent = "";
  if (!season) return;

  const workspace = document.createElement("div");
  workspace.className = "season-workspace-grid";
  workspace.append(renderCompactTable(model), renderFixtureCard(model));

  const depth = document.createElement("details");
  depth.className = "season-depth";
  const summary = document.createElement("summary");
  summary.textContent = "Vis full tabell og terminliste";
  const content = document.createElement("div");
  content.className = "season-depth-content";
  content.append(renderFullTable(model), renderAllFixtures(season));
  depth.append(summary, content);

  container.append(workspace, depth);
}

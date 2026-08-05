function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clampCount(value, max) {
  return Math.max(0, Math.min(max, Number(value) || 0));
}

function qualitativeMetric(value, { positive = 65, caution = 40, reverse = false } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return { label: "Ukjent", tone: "neutral" };
  if (reverse) {
    if (number >= positive) return { label: "Høyt", tone: "negative" };
    if (number <= caution) return { label: "Lavt", tone: "positive" };
    return { label: "Normalt", tone: "neutral" };
  }
  if (number >= positive) return { label: "Sterkt", tone: "positive" };
  if (number <= caution) return { label: "Krever arbeid", tone: "negative" };
  return { label: "Stabilt", tone: "neutral" };
}

function lastResultLabel(lastMatch) {
  if (!lastMatch) return "Ingen kamp spilt";
  const outcome = { win: "Seier", draw: "Uavgjort", loss: "Tap" }[lastMatch.outcome] || "Siste kamp";
  const goalsFor = Number(lastMatch.score?.for);
  const goalsAgainst = Number(lastMatch.score?.against);
  const score = Number.isFinite(goalsFor) && Number.isFinite(goalsAgainst)
    ? ` ${goalsFor}–${goalsAgainst}`
    : "";
  const opponent = lastMatch.opponent?.name ? ` mot ${lastMatch.opponent.name}` : "";
  return `${outcome}${score}${opponent}`;
}

function statusItem(id, label, value, detail, tone, target) {
  return { id, label, value, detail, tone, target };
}

export function createOfficeSceneModel({
  clubName = "Klubben",
  clubWeekState = null,
  phaseLabel = "Oppsett",
  nextActions = [],
  nextMatch = null,
  lineupCount = 0,
  lineupTotal = 11,
  rosterCount = 0,
  rosterRequired = 15,
  trainingSelected = false,
  inboxAttentionCount = 0,
  inboxFocusTitle = "Innboksen er rolig",
  readiness = null,
  teamStatus = "Laget er ikke vurdert ennå.",
  assistantSignal = "Les laget og klubbens signaler før du bestemmer neste grep.",
  standing = null,
  lastMatch = null,
  boardTrust = null,
  playerMorale = null,
  mediaPressure = null
} = {}) {
  const week = Number(clubWeekState?.week) || 1;
  const primary = asArray(nextActions)[0] || {
    tag: "Klart",
    title: "Ingen åpne grep",
    hint: "Klubbuka er under kontroll."
  };
  const filled = clampCount(lineupCount, lineupTotal);
  const roster = clampCount(rosterCount, Math.max(rosterRequired, rosterCount));
  const canStartMatch = Boolean(readiness?.canStartMatch);
  const lineupReady = filled >= lineupTotal;
  const rosterReady = roster >= rosterRequired;
  const unread = Math.max(0, Number(inboxAttentionCount) || 0);
  const nextMatchLabel = nextMatch?.opponent || nextMatch?.name || "Ikke terminfestet";
  const nextMatchMeta = nextMatch
    ? `${nextMatch.round ? `Runde ${nextMatch.round} · ` : ""}${nextMatch.venue || (nextMatch.homeAway === "home" ? "Hjemme" : nextMatch.homeAway === "away" ? "Borte" : "")}${nextMatch.ground ? ` · ${nextMatch.ground}` : ""}`
    : "Sesongen eller terminlisten er ikke klar.";

  const statuses = [
    statusItem("lineup", "Lag", `${filled}/${lineupTotal}`, lineupReady ? "Startelleveren er satt." : `${lineupTotal - filled} plasser gjenstår.`, lineupReady ? "positive" : "negative", "tactics"),
    statusItem("training", "Trening", trainingSelected ? "Valgt" : "Ikke valgt", trainingSelected ? "Ukeplanen er låst inn." : "Velg fokus og program.", trainingSelected ? "positive" : "negative", "trening"),
    statusItem("inbox", "Assistentråd", unread > 0 ? `${unread} venter` : "Håndtert", unread > 0 ? inboxFocusTitle : "Ingen signaler sperrer veien videre.", unread > 0 ? "attention" : "positive", "inbox"),
    statusItem("readiness", "Kampklarhet", canStartMatch ? "Kampklar" : "Ikke klar", canStartMatch ? "Alle autoritative krav er oppfylt." : readiness?.summary || readiness?.reason || "Tropp, laguttak eller trening gjenstår.", canStartMatch ? "positive" : "negative", "kamp")
  ];

  const seasonLine = standing
    ? `${standing.position}. plass · ${standing.points} poeng${Number.isFinite(standing.goalDifference) ? ` · ${standing.goalDifference > 0 ? "+" : ""}${standing.goalDifference}` : ""}`
    : "Ingen tabellstatus ennå";

  return {
    clubName,
    week,
    phaseLabel,
    mainIssue: { tag: primary.tag || "Neste", title: primary.title || "Neste handling", hint: primary.hint || "Se neste handling nederst." },
    nextMatch: { label: nextMatchLabel, meta: nextMatchMeta, available: Boolean(nextMatch) },
    statuses,
    teamStatus,
    assistantSignal,
    seasonLine,
    lastResult: lastResultLabel(lastMatch),
    board: qualitativeMetric(boardTrust),
    morale: qualitativeMetric(playerMorale),
    media: qualitativeMetric(mediaPressure, { reverse: true }),
    rosterReady,
    lineupReady,
    canStartMatch
  };
}

function createActionButton(item, onOpenArea) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "office-status-card";
  button.dataset.tone = item.tone;
  button.dataset.officeTarget = item.target;
  button.setAttribute("aria-label", `${item.label}: ${item.value}. ${item.detail}`);
  const label = document.createElement("span");
  label.textContent = item.label;
  const value = document.createElement("strong");
  value.textContent = item.value;
  const detail = document.createElement("small");
  detail.textContent = item.detail;
  button.append(label, value, detail);
  if (typeof onOpenArea === "function") button.addEventListener("click", () => onOpenArea(item.target));
  return button;
}

export function renderOfficeCommand(container, model, { onOpenArea } = {}) {
  if (!container) return;
  container.textContent = "";
  container.dataset.phase = String(model.phaseLabel || "").toLowerCase();

  const head = document.createElement("header");
  head.className = "office-command-head";
  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `${model.clubName} · Uke ${model.week}`;
  const title = document.createElement("h2");
  title.textContent = "Managerkontoret";
  const phase = document.createElement("p");
  phase.className = "office-command-phase";
  phase.textContent = model.phaseLabel;
  copy.append(eyebrow, title, phase);

  const pulse = document.createElement("div");
  pulse.className = "office-command-pulse";
  const pulseLabel = document.createElement("span");
  pulseLabel.textContent = "Klubbpuls";
  const pulseValue = document.createElement("strong");
  pulseValue.textContent = `${model.board.label} styre · ${model.morale.label.toLowerCase()} moral · ${model.media.label.toLowerCase()} medietrykk`;
  pulse.append(pulseLabel, pulseValue);
  head.append(copy, pulse);

  const main = document.createElement("div");
  main.className = "office-command-main";
  const priority = document.createElement("article");
  priority.className = "office-priority-card";
  const priorityLabel = document.createElement("span");
  priorityLabel.textContent = `Ukas hovedsak · ${model.mainIssue.tag}`;
  const priorityTitle = document.createElement("strong");
  priorityTitle.textContent = model.mainIssue.title;
  const priorityHint = document.createElement("p");
  priorityHint.textContent = model.mainIssue.hint;
  const priorityNote = document.createElement("small");
  priorityNote.textContent = "Utføres med den autoritative «Neste handling» nederst.";
  priority.append(priorityLabel, priorityTitle, priorityHint, priorityNote);

  const match = document.createElement("button");
  match.type = "button";
  match.className = "office-next-match-card";
  match.disabled = !model.nextMatch.available;
  const matchLabel = document.createElement("span");
  matchLabel.textContent = "Neste kamp";
  const matchTitle = document.createElement("strong");
  matchTitle.textContent = model.nextMatch.label;
  const matchMeta = document.createElement("small");
  matchMeta.textContent = model.nextMatch.meta;
  match.append(matchLabel, matchTitle, matchMeta);
  if (typeof onOpenArea === "function" && model.nextMatch.available) match.addEventListener("click", () => onOpenArea("kamp"));
  main.append(priority, match);

  const statusGrid = document.createElement("div");
  statusGrid.className = "office-status-grid";
  model.statuses.forEach((item) => statusGrid.append(createActionButton(item, onOpenArea)));

  const briefing = document.createElement("section");
  briefing.className = "office-briefing-grid";
  const assistant = document.createElement("article");
  assistant.className = "office-assistant-brief";
  const assistantLabel = document.createElement("span");
  assistantLabel.textContent = "Assistentens viktigste råd";
  const assistantTitle = document.createElement("strong");
  assistantTitle.textContent = model.teamStatus;
  const assistantBody = document.createElement("p");
  assistantBody.textContent = model.assistantSignal;
  assistant.append(assistantLabel, assistantTitle, assistantBody);

  const season = document.createElement("button");
  season.type = "button";
  season.className = "office-season-brief";
  const seasonLabel = document.createElement("span");
  seasonLabel.textContent = "Sesongstatus";
  const seasonTitle = document.createElement("strong");
  seasonTitle.textContent = model.seasonLine;
  const seasonBody = document.createElement("small");
  seasonBody.textContent = model.lastResult;
  season.append(seasonLabel, seasonTitle, seasonBody);
  if (typeof onOpenArea === "function") season.addEventListener("click", () => onOpenArea("statistikk"));
  briefing.append(assistant, season);

  container.append(head, main, statusGrid, briefing);
}

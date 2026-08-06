from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def write(path, content):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content.strip() + "\n", encoding="utf-8")


def replace_once(path, old, new):
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Missing anchor in {path}: {old[:120]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


write("src/ui/manager-squad-tactics-presentation.js", r'''
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function labelOf(value, fallback) {
  if (typeof value === "string" && value.trim()) return value.replaceAll("_", " ");
  return value?.name || value?.title || value?.label || value?.id?.replaceAll("_", " ") || fallback;
}

function titleCase(value, fallback) {
  const text = labelOf(value, fallback);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function countFrom(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (Array.isArray(value)) return value.length;
    if (Number.isFinite(Number(value))) return Math.max(0, Number(value));
  }
  return 0;
}

const LOCAL_TARGETS = Object.freeze({
  lineup_incomplete: "lineup",
  duplicate_player: "lineup",
  bench_incomplete: "bench",
  squad_too_small: "historygo",
  training_missing: "trening",
  season_inactive: "statistikk",
  fixture_missing: "statistikk",
  club_week_blocked: "dashboard",
  data_loading: "lineup"
});

function actionFrom({ hasActiveSave, readiness, setup }) {
  if (!hasActiveSave) {
    return {
      label: "Start eller åpne ligaspillet",
      target: "dashboard",
      tone: "attention",
      title: "Ingen aktiv klubbkontekst",
      detail: "Laguttaket blir autoritativt når et aktivt spill er åpnet."
    };
  }

  const blocker = readiness?.primaryBlocker || asArray(readiness?.blockers)[0] || null;
  if (blocker) {
    return {
      label: blocker.code === "training_missing" ? "Gå til Trening" : setup?.actionLabel || "Løs første blokkering",
      target: LOCAL_TARGETS[blocker.code] || blocker.target || "lineup",
      tone: "attention",
      title: setup?.title || blocker.message || "Laget trenger en beslutning",
      detail: setup?.hint || blocker.summary || blocker.message || "Fullfør neste nødvendige lagvalg."
    };
  }

  return {
    label: "Gå til Kamp",
    target: "kamp",
    tone: "positive",
    title: "Laget er kampklart",
    detail: "Startellever, roller, benk og den øvrige kampforberedelsen er klare."
  };
}

function availabilityStatus(rosterReadiness = {}) {
  const injured = countFrom(rosterReadiness, ["injuredCount", "injured", "injuredPlayerIds"]);
  const unavailable = countFrom(rosterReadiness, ["unavailableCount", "unavailable", "unavailablePlayerIds"]);
  const tired = countFrom(rosterReadiness, ["tiredCount", "fatiguedCount", "tired", "fatigued"]);
  const totalConcern = Math.max(injured + tired, unavailable);

  if (injured > 0) {
    return {
      value: `${injured} skadet`,
      detail: tired > 0 ? `${tired} andre spillere trenger belastningsstyring.` : "Vurder dekning og kampbelastning.",
      tone: "negative"
    };
  }
  if (totalConcern > 0) {
    return {
      value: `${totalConcern} må følges opp`,
      detail: tired > 0 ? "Slitasje eller utilgjengelighet påvirker uttaket." : "Kontroller hvem som faktisk er kampklar.",
      tone: "attention"
    };
  }
  return {
    value: "Ingen akutte varsler",
    detail: "Troppen har ingen registrerte skade- eller slitasjesignaler.",
    tone: "positive"
  };
}

function tacticalReading(teamFit = {}) {
  const issues = asArray(teamFit?.report?.issues).filter(Boolean);
  const strengths = asArray(teamFit?.report?.strengths).filter(Boolean);
  const assignments = asArray(teamFit?.assignments);
  const misused = assignments.filter((assignment) => assignment?.player && assignment?.fit?.status === "feilbrukt");

  return {
    issue: issues[0]
      || (misused[0] ? `${misused[0].player.name} er feilbrukt i ${misused[0].slot?.label || "rollen"}.` : null)
      || (number(teamFit?.completeCount) < 11 ? `Startelleveren mangler ${11 - number(teamFit?.completeCount)} spiller${11 - number(teamFit?.completeCount) === 1 ? "" : "e"}.` : null)
      || "Ingen tydelig taktisk svakhet er registrert i den valgte elleveren.",
    strength: strengths[0] || "Taktisk styrke blir tydeligere når alle spiller- og rollevalg er satt.",
    issues: issues.slice(0, 3),
    tone: issues.length > 0 || misused.length > 0 ? "attention" : "positive"
  };
}

export function createSquadTacticsSceneModel({
  hasActiveSave = false,
  readiness = null,
  setup = null,
  formation = null,
  matchPlan = null,
  teamFit = null,
  rosterReadiness = null,
  selectedClub = null
} = {}) {
  const completeStarters = Math.max(0, number(setup?.completeStarters, teamFit?.completeCount));
  const totalSlots = Math.max(11, number(teamFit?.totalSlots, 11));
  const benchCount = Math.max(0, number(setup?.benchCount, rosterReadiness?.benchCount));
  const rolesOk = setup?.rolesOk !== false;
  const misusedCount = Math.max(0, number(setup?.misusedCount));
  const duplicateCount = Math.max(0, number(setup?.duplicateCount));
  const formationName = titleCase(formation, "Formasjon ikke valgt");
  const planName = titleCase(matchPlan, "Kampplan ikke valgt");
  const availability = availabilityStatus(rosterReadiness || {});
  const reading = tacticalReading(teamFit || {});
  const action = actionFrom({ hasActiveSave, readiness, setup });
  const ready = Boolean(readiness?.isReady || readiness?.canStartMatch);
  const clubName = selectedClub?.name || selectedClub?.clubName || "Managerklubben";

  const lineupTone = completeStarters >= totalSlots && rolesOk && duplicateCount === 0 ? "positive" : "negative";
  const tacticsTone = formation && matchPlan ? (misusedCount > 0 ? "attention" : "positive") : "attention";
  const benchTone = benchCount >= 4 ? "positive" : "negative";

  return {
    state: ready ? "ready" : "blocked",
    clubName,
    headline: readiness?.summary || action.detail,
    formation: { name: formationName, plan: planName },
    reading,
    statuses: [
      {
        id: "lineup",
        label: "Startellever",
        value: `${Math.min(completeStarters, totalSlots)}/${totalSlots} klare`,
        detail: completeStarters >= totalSlots ? (rolesOk ? "Alle plasser har spiller og rolle." : "Minst én rolle må avklares.") : `${totalSlots - completeStarters} plasser mangler spiller eller rolle.`,
        tone: lineupTone,
        target: "lineup"
      },
      {
        id: "tactics",
        label: "Formasjon & kampplan",
        value: formationName,
        detail: `${planName}${misusedCount > 0 ? ` · ${misusedCount} feilbruk${misusedCount === 1 ? "" : "er"}` : " · rollebruken er kontrollert"}.`,
        tone: tacticsTone,
        target: "formation"
      },
      {
        id: "availability",
        label: "Tilgjengelighet",
        ...availability,
        target: "bench"
      },
      {
        id: "bench",
        label: "Benk & dekning",
        value: `${Math.min(benchCount, 4)}/4 kampklare`,
        detail: benchCount >= 4 ? "Minimumsbenken er fylt." : `${4 - benchCount} reserve${4 - benchCount === 1 ? "" : "r"} mangler.`,
        tone: benchTone,
        target: "bench"
      }
    ],
    action,
    progress: {
      starters: completeStarters,
      totalSlots,
      bench: benchCount,
      rolesOk,
      misusedCount,
      duplicateCount,
      ready
    }
  };
}

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function statusButton(status, onOpenTarget) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "squad-tactics-status";
  button.dataset.tone = status.tone;
  button.dataset.squadTacticsTarget = status.target;
  button.setAttribute("aria-label", `${status.label}: ${status.value}. ${status.detail}`);
  button.append(
    textElement("span", "squad-tactics-status-label", status.label),
    textElement("strong", "squad-tactics-status-value", status.value),
    textElement("small", "squad-tactics-status-detail", status.detail)
  );
  if (typeof onOpenTarget === "function") button.addEventListener("click", () => onOpenTarget(status.target));
  return button;
}

export function renderManagerSquadTacticsCommand(container, model, { onOpenTarget } = {}) {
  if (!container) return;
  container.textContent = "";
  container.dataset.state = model.state;
  container.dataset.ready = model.progress.ready ? "true" : "false";

  const header = document.createElement("header");
  header.className = "squad-tactics-command-head";
  const heading = document.createElement("div");
  heading.append(
    textElement("p", "eyebrow", `${model.clubName} · sportslig arbeidsrom`),
    textElement("h2", "", "Lag og taktikk"),
    textElement("p", "squad-tactics-command-headline", model.headline)
  );
  const identity = document.createElement("button");
  identity.type = "button";
  identity.className = "squad-tactics-identity";
  identity.dataset.squadTacticsTarget = "formation";
  identity.append(
    textElement("span", "", "Taktisk identitet"),
    textElement("strong", "", model.formation.name),
    textElement("small", "", model.formation.plan)
  );
  if (typeof onOpenTarget === "function") identity.addEventListener("click", () => onOpenTarget("formation"));
  header.append(heading, identity);

  const statusGrid = document.createElement("div");
  statusGrid.className = "squad-tactics-status-grid";
  model.statuses.forEach((status) => statusGrid.append(statusButton(status, onOpenTarget)));

  const reading = document.createElement("div");
  reading.className = "squad-tactics-reading";
  const issue = document.createElement("article");
  issue.className = "squad-tactics-reading-card";
  issue.dataset.tone = model.reading.tone;
  issue.append(
    textElement("span", "", "Viktigste problemområde"),
    textElement("strong", "", model.reading.issue),
    textElement("p", "", model.reading.strength)
  );

  const decision = document.createElement("section");
  decision.className = "squad-tactics-next";
  decision.dataset.complete = model.progress.ready ? "true" : "false";
  const decisionCopy = document.createElement("div");
  decisionCopy.append(
    textElement("span", "", model.progress.ready ? "Klar for kamp" : "Aktiv lagbeslutning"),
    textElement("strong", "", model.action.title),
    textElement("small", "", model.action.detail)
  );
  const action = document.createElement("button");
  action.type = "button";
  action.className = "squad-tactics-command-action";
  action.dataset.squadTacticsTarget = model.action.target;
  action.textContent = model.action.label;
  if (typeof onOpenTarget === "function") action.addEventListener("click", () => onOpenTarget(model.action.target));
  decision.append(decisionCopy, action);
  reading.append(issue, decision);

  container.append(header, statusGrid, reading);
}
''')

write("src/ui/manager-squad-tactics-scene-v2.css", r'''
.manager-squad-tactics-command-panel {
  margin: 0 0 1rem;
  padding: clamp(0.9rem, 2vw, 1.25rem);
  border: 1px solid rgba(255, 255, 255, 0.72);
  background:
    linear-gradient(135deg, rgba(14, 43, 30, 0.96), rgba(4, 8, 7, 0.98) 68%),
    #050807;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
}

#squadTacticsCommand {
  display: grid;
  gap: 1rem;
}

.squad-tactics-command-head,
.squad-tactics-reading {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(15rem, 0.75fr);
  gap: 0.9rem;
  align-items: stretch;
}

.squad-tactics-command-head h2 {
  margin: 0.12rem 0 0.3rem;
  font-size: clamp(1.45rem, 3vw, 2.2rem);
}

.squad-tactics-command-headline {
  max-width: 65ch;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
}

.squad-tactics-identity,
.squad-tactics-status,
.squad-tactics-reading-card,
.squad-tactics-next {
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(0, 0, 0, 0.32);
  color: inherit;
}

.squad-tactics-identity {
  display: grid;
  gap: 0.22rem;
  width: 100%;
  padding: 0.9rem;
  text-align: left;
  cursor: pointer;
}

.squad-tactics-identity span,
.squad-tactics-status-label,
.squad-tactics-reading-card > span,
.squad-tactics-next span {
  font-size: 0.72rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.66);
}

.squad-tactics-identity strong,
.squad-tactics-status-value,
.squad-tactics-reading-card strong,
.squad-tactics-next strong {
  font-size: 1rem;
  line-height: 1.25;
}

.squad-tactics-identity small,
.squad-tactics-status-detail,
.squad-tactics-next small {
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.35;
}

.squad-tactics-status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.squad-tactics-status {
  display: grid;
  align-content: start;
  gap: 0.28rem;
  min-height: 8rem;
  padding: 0.82rem;
  text-align: left;
  cursor: pointer;
}

.squad-tactics-status[data-tone="positive"] {
  border-color: rgba(128, 235, 163, 0.72);
}

.squad-tactics-status[data-tone="attention"] {
  border-color: rgba(247, 208, 103, 0.78);
}

.squad-tactics-status[data-tone="negative"] {
  border-color: rgba(255, 132, 132, 0.78);
}

.squad-tactics-status:hover,
.squad-tactics-status:focus-visible,
.squad-tactics-identity:hover,
.squad-tactics-identity:focus-visible {
  background: rgba(255, 255, 255, 0.09);
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.squad-tactics-reading-card,
.squad-tactics-next {
  display: grid;
  gap: 0.38rem;
  min-width: 0;
  padding: 0.95rem;
}

.squad-tactics-reading-card[data-tone="attention"] {
  border-left: 4px solid #f4c95d;
}

.squad-tactics-reading-card[data-tone="positive"] {
  border-left: 4px solid #79d897;
}

.squad-tactics-reading-card p {
  margin: 0.15rem 0 0;
  color: rgba(255, 255, 255, 0.7);
}

.squad-tactics-next {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.squad-tactics-command-action {
  min-height: 2.9rem;
  padding: 0.72rem 1rem;
  border: 1px solid #fff;
  background: #fff;
  color: #050807;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.squad-tactics-command-action:hover,
.squad-tactics-command-action:focus-visible {
  background: #dff6e7;
  outline: 2px solid #fff;
  outline-offset: 3px;
}

#squadTacticsCommand[data-ready="true"] .squad-tactics-command-action {
  background: #a8edba;
}

@media (max-width: 900px) {
  .squad-tactics-status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .squad-tactics-command-head,
  .squad-tactics-reading {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .manager-squad-tactics-command-panel {
    padding: 0.78rem;
  }

  .squad-tactics-status-grid {
    grid-template-columns: 1fr;
  }

  .squad-tactics-status {
    min-height: 0;
  }

  .squad-tactics-next {
    grid-template-columns: 1fr;
  }

  .squad-tactics-command-action {
    width: 100%;
  }
}
''')

write("docs/MANAGER_SQUAD_TACTICS_SCENE_V2.md", r'''
# Manager Squad & Tactics Scene v2

Denne leveransen gjør **Lag** til managerens samlede sportslige arbeidsrom. Den bygger ingen ny laguttaks-, taktikk-, rolle-, tilgjengelighets-, form- eller ratingmotor.

## Scenens rekkefølge

```text
Lagstatus
→ startellever
→ taktisk identitet
→ problemområder
→ benk og dekning
→ Trening eller Kamp
```

Øverste kommandonivå viser fire operative statuser:

1. **Startellever** – hvor mange av de elleve plassene som har både spiller og rolle.
2. **Formasjon og kampplan** – valgt system, kampplan og registrert feilbruk.
3. **Tilgjengelighet** – skade-, slitasje- og utilgjengelighetssignaler fra eksisterende troppsdata.
4. **Benk og dekning** – om minimum fire kampklare reserver er registrert.

## Autoritative motorer

- `football-team-fit-engine.js` eier spiller-/rollefit, lagbalanse, relasjoner, styrker og problemer.
- `football-matchday-readiness.js` eier kampklarhet, blokkeringer og deres rekkefølge.
- eksisterende availability- og spillerformdata eier skade, slitasje og tilgjengelighet.
- formasjon-, kampplan- og rolledataene eier de taktiske valgene.
- eksisterende uttaks- og benkeflater eier redigeringen.
- `manager-squad-tactics-presentation.js` eier bare scenehierarki og managerspråk.

Kommandonivået kopierer ikke beslutningslogikk. Det leser eksisterende `teamFit`, `rosterReadiness`, `getSquadSetupGateState()` og `getMatchdayReadiness()` og peker manageren til riktig eksisterende arbeidsflate.

## Interaksjon

Statuskortene fører direkte til:

- banen og startelleveren;
- formasjon eller kampplan;
- benken;
- History Go når troppen er for liten;
- Trening når ukeplanen mangler;
- Sesong når kampen ikke er terminfestet;
- Kamp når laget er klart.

Taktikkbrettet forblir scenens visuelle sentrum. Spillerkort, direkte spiller-/rollevalg, drag-and-drop, benk og full motoranalyse beholdes som arbeids- og dybdeflater under kommandonivået.

## Testkontrakt

- ren simulering verifiserer ufullstendig ellever, manglende benk, feilbruk, manglende trening og kampklart lag;
- audit krever presentasjonsmodul, permanent styling, dokumenterte motorgrenser, app-wiring og CI-porter;
- Playwright kontrollerer kommandonivå, fire klikkbare statuser, eksisterende taktikkbrett, mobil overflow, WCAG 2 A/AA og visuell baseline;
- eksisterende laguttaks-, rollefit-, kampklarhets-, trenings- og kampdagstester skal fortsatt bestå.
''')

write("scripts/simulate-manager-squad-tactics-scene-v2.mjs", r'''
import { createSquadTacticsSceneModel } from "../src/ui/manager-squad-tactics-presentation.js";

const checks = [];
function check(label, condition, detail = "") {
  checks.push({ label, ok: Boolean(condition), detail });
}

function teamFit({ complete = 11, issues = [], misused = 0 } = {}) {
  return {
    completeCount: complete,
    totalSlots: 11,
    assignments: Array.from({ length: 11 }, (_, index) => ({
      isComplete: index < complete,
      player: index < complete ? { id: `p${index}`, name: `Spiller ${index + 1}` } : null,
      role: index < complete ? { id: `r${index}`, name: `Rolle ${index + 1}` } : null,
      slot: { slotId: `s${index}`, label: `Plass ${index + 1}` },
      fit: index < misused ? { status: "feilbrukt", matchScore: 30 } : { status: "god", matchScore: 78 }
    })),
    report: { issues, strengths: ["Laget har en tydelig styrke."] }
  };
}

const common = {
  hasActiveSave: true,
  formation: { id: "modern_4231", name: "4-2-3-1" },
  matchPlan: { id: "high_press", name: "Høyt press" },
  selectedClub: { name: "Rosenborg" },
  rosterReadiness: { benchCount: 4 }
};

const incomplete = createSquadTacticsSceneModel({
  ...common,
  teamFit: teamFit({ complete: 8 }),
  setup: { completeStarters: 8, benchCount: 4, rolesOk: true, misusedCount: 0, duplicateCount: 0, title: "Fyll neste ledige plass", hint: "Tre plasser mangler.", actionLabel: "Fyll neste ledige plass" },
  readiness: { isReady: false, summary: "Startelleveren må fullføres.", primaryBlocker: { code: "lineup_incomplete", message: "Sett alle elleve." } }
});
check("ufullstendig scene er blokkert", incomplete.state === "blocked", incomplete.state);
check("ufullstendig scene viser 8/11", incomplete.statuses[0].value === "8/11 klare", incomplete.statuses[0].value);
check("ufullstendig scene peker til laguttak", incomplete.action.target === "lineup", incomplete.action.target);
check("ufullstendig scene bevarer første blocker", incomplete.headline.includes("Startelleveren"), incomplete.headline);

const bench = createSquadTacticsSceneModel({
  ...common,
  teamFit: teamFit(),
  rosterReadiness: { benchCount: 2 },
  setup: { completeStarters: 11, benchCount: 2, rolesOk: true, misusedCount: 0, duplicateCount: 0, title: "Legg minst 4 spillere på benken", hint: "Benk 2/4.", actionLabel: "Vis benken" },
  readiness: { isReady: false, primaryBlocker: { code: "bench_incomplete", message: "Sett minst fire på benken." } }
});
check("benkeblokkering peker til benk", bench.action.target === "bench", bench.action.target);
check("benkestatus viser 2/4", bench.statuses[3].value === "2/4 kampklare", bench.statuses[3].value);
check("benkestatus er negativ", bench.statuses[3].tone === "negative", bench.statuses[3].tone);

const misuse = createSquadTacticsSceneModel({
  ...common,
  teamFit: teamFit({ complete: 11, misused: 2, issues: ["To roller bryter med kampplanen."] }),
  setup: { completeStarters: 11, benchCount: 4, rolesOk: true, misusedCount: 2, duplicateCount: 0, title: "Rett rollebruk", hint: "To spillere er feilbrukt.", actionLabel: "Rett rolle/posisjon" },
  readiness: { isReady: false, primaryBlocker: { code: "lineup_incomplete", message: "Rett laget." } }
});
check("taktikkstatus viser feilbruk", misuse.statuses[1].detail.includes("2 feilbruk"), misuse.statuses[1].detail);
check("problemområdet kommer fra teamFit", misuse.reading.issue === "To roller bryter med kampplanen.", misuse.reading.issue);
check("problemområdet får oppmerksomhetstone", misuse.reading.tone === "attention", misuse.reading.tone);

const training = createSquadTacticsSceneModel({
  ...common,
  teamFit: teamFit(),
  setup: { completeStarters: 11, benchCount: 4, rolesOk: true, misusedCount: 0, duplicateCount: 0 },
  readiness: { isReady: false, summary: "Treningsuka må fullføres.", primaryBlocker: { code: "training_missing", message: "Velg treningsprogram." } }
});
check("manglende trening peker til Trening", training.action.target === "trening", training.action.target);
check("manglende trening bruker tydelig CTA", training.action.label === "Gå til Trening", training.action.label);

const ready = createSquadTacticsSceneModel({
  ...common,
  teamFit: teamFit(),
  setup: { completeStarters: 11, benchCount: 4, rolesOk: true, misusedCount: 0, duplicateCount: 0 },
  readiness: { isReady: true, canStartMatch: true, summary: "Laget er kampklart.", blockers: [] }
});
check("klar scene er ready", ready.state === "ready", ready.state);
check("klar scene peker til Kamp", ready.action.target === "kamp", ready.action.target);
check("klar scene har fire statuskort", ready.statuses.length === 4, String(ready.statuses.length));
check("klar ellever er positiv", ready.statuses[0].tone === "positive", ready.statuses[0].tone);
check("klar benk er positiv", ready.statuses[3].tone === "positive", ready.statuses[3].tone);
check("formasjon bevares", ready.formation.name === "4-2-3-1", ready.formation.name);
check("kampplan bevares", ready.formation.plan === "Høyt press", ready.formation.plan);
check("klubbkontekst bevares", ready.clubName === "Rosenborg", ready.clubName);

const unavailable = createSquadTacticsSceneModel({
  ...common,
  teamFit: teamFit(),
  rosterReadiness: { benchCount: 4, injuredCount: 1, tiredCount: 2 },
  setup: { completeStarters: 11, benchCount: 4, rolesOk: true },
  readiness: { isReady: true }
});
check("skade vises i tilgjengelighet", unavailable.statuses[2].value === "1 skadet", unavailable.statuses[2].value);
check("slitasje forklares", unavailable.statuses[2].detail.includes("2 andre"), unavailable.statuses[2].detail);
check("skade gir negativ tone", unavailable.statuses[2].tone === "negative", unavailable.statuses[2].tone);

const noSave = createSquadTacticsSceneModel({ teamFit: teamFit({ complete: 0 }) });
check("uten save peker scenen til kontoret", noSave.action.target === "dashboard", noSave.action.target);
check("uten save forklarer klubbkontekst", noSave.action.title.includes("Ingen aktiv"), noSave.action.title);

const failed = checks.filter((item) => !item.ok);
checks.forEach((item) => console.log(`${item.ok ? "✓" : "✗"} ${item.label}${item.detail ? ` — ${item.detail}` : ""}`));
if (failed.length) {
  console.error(`\n✗ Manager Squad & Tactics Scene v2 feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Manager Squad & Tactics Scene v2: ${checks.length}/${checks.length}`);
''')

write("scripts/audit-manager-squad-tactics-scene-v2.mjs", r'''
import fs from "node:fs";

const files = {
  html: fs.readFileSync("index.html", "utf8"),
  app: fs.readFileSync("src/app.js", "utf8"),
  presentation: fs.readFileSync("src/ui/manager-squad-tactics-presentation.js", "utf8"),
  css: fs.readFileSync("src/ui/manager-squad-tactics-scene-v2.css", "utf8"),
  docs: fs.readFileSync("docs/MANAGER_SQUAD_TACTICS_SCENE_V2.md", "utf8"),
  package: fs.readFileSync("package.json", "utf8"),
  ci: fs.readFileSync(".github/workflows/ci.yml", "utf8"),
  browser: fs.readFileSync("tests/browser/manager-squad-tactics-scene-v2.spec.js", "utf8")
};

const checks = [
  ["kommandopanel finnes", files.html.includes('id="squadTacticsCommandPanel"')],
  ["kommandoanker finnes", files.html.includes('id="squadTacticsCommand"')],
  ["permanent CSS er lastet", files.html.includes("manager-squad-tactics-scene-v2.css")],
  ["presentasjonsmodul importeres", files.app.includes("manager-squad-tactics-presentation.js")],
  ["scene rendres fra renderløkken", files.app.includes("renderManagerSquadTacticsScene(teamFit)")],
  ["readiness brukes som sannhetskilde", files.app.includes("getMatchdayReadiness(teamFit)")],
  ["squad gate brukes som sannhetskilde", files.app.includes("getSquadSetupGateState(teamFit)")],
  ["eksisterende formasjon brukes", files.app.includes("formation: getFormation()")],
  ["eksisterende kampplan brukes", files.app.includes("matchPlan: getTactic()")],
  ["modellen har fire statuser", files.presentation.includes('label: "Startellever"') && files.presentation.includes('label: "Benk & dekning"')],
  ["presentasjonen viser første problem", files.presentation.includes("Viktigste problemområde")],
  ["presentasjonen har CTA-targets", files.presentation.includes("dataSquadTacticsTarget")],
  ["ingen ny laguttaksmotor", !files.presentation.includes("localStorage") && !files.presentation.includes("calculateTeamFit")],
  ["ingen skjult overall i kommandonivå", !files.presentation.includes("teamScore")],
  ["mobil layout finnes", files.css.includes("@media (max-width: 520px)")],
  ["statuskort har fokustilstand", files.css.includes(":focus-visible")],
  ["dokumentasjonen låser motorgrenser", files.docs.includes("Autoritative motorer")],
  ["dokumentasjonen bevarer taktikkbrettet", files.docs.includes("visuelle sentrum")],
  ["audit-script er registrert", files.package.includes("audit:manager-squad-tactics-scene-v2")],
  ["sim-script er registrert", files.package.includes("sim:manager-squad-tactics-scene-v2")],
  ["audit kjøres i CI", files.ci.includes("npm run audit:manager-squad-tactics-scene-v2")],
  ["sim kjøres i CI", files.ci.includes("npm run sim:manager-squad-tactics-scene-v2")],
  ["browser tester mobil overflow", files.browser.includes("ingen mobil overflow")],
  ["browser tester tilgjengelighet", files.browser.includes("AxeBuilder")],
  ["browser har visuell baseline", files.browser.includes("toHaveScreenshot")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Manager Squad & Tactics Scene v2 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Manager Squad & Tactics Scene v2 audit: ${checks.length}/${checks.length}`);
''')

write("tests/browser/manager-squad-tactics-scene-v2.spec.js", r'''
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function seededSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 82 },
    { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 80 },
    { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 79 },
    { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
  ];
  const round = (number, matches, completed = false) => ({
    round: number,
    status: completed ? "completed" : "scheduled",
    matches: matches.map((match, index) => ({
      id: `squad-r${number}-${index}`,
      round: number,
      status: completed ? "completed" : "scheduled",
      result: completed ? match.result : null,
      homeClubId: match.home,
      awayClubId: match.away
    }))
  });
  return {
    version: "historygo-football-manager.league-season.v3",
    competition: { id: "hg-eliteserien", mode: "league", tierId: "eliteserien", tierName: "Eliteserien", tierLevel: 1, clubCount: 4, rounds: 6, homeAndAway: true, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "manager-squad-tactics-scene-v2",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      round(1, [{ home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } }, { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }]),
      round(4, [{ home: "brann", away: "rosenborg" }, { home: "molde", away: "viking" }]),
      round(5, [{ home: "rosenborg", away: "viking" }, { home: "molde", away: "brann" }]),
      round(6, [{ home: "molde", away: "rosenborg" }, { home: "viking", away: "brann" }])
    ],
    completedMatchIds: ["squad-r1-0", "squad-r1-1"],
    createdFrom: "browser squad tactics scene v2"
  };
}

async function openSquad(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#squadTacticsCommandPanel")).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "squad_scene_v2",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("Lag viser kommandonivå, fire statuser og eksisterende taktikkbrett", async ({ page }) => {
  await openSquad(page);
  await expect(page.locator("#squadTacticsCommand h2")).toHaveText("Lag og taktikk");
  await expect(page.locator(".squad-tactics-status")).toHaveCount(4);
  await expect(page.locator(".squad-tactics-identity strong")).not.toBeEmpty();
  await expect(page.locator(".squad-tactics-reading-card strong")).not.toBeEmpty();
  await expect(page.locator(".squad-tactics-command-action")).toBeVisible();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#formationSelect")).toBeVisible();
  await expect(page.locator("#tacticSelect")).toBeVisible();
});

test("statuskort fører til eksisterende lagflater", async ({ page }) => {
  await openSquad(page);
  await page.locator('.squad-tactics-status[data-squad-tactics-target="formation"]').click();
  await expect(page.locator("#formationSelect")).toBeFocused();
  await page.locator('.squad-tactics-status[data-squad-tactics-target="lineup"]').click();
  await expect(page.locator("#lineupSlots")).toBeInViewport();
  await page.locator('.squad-tactics-status[data-squad-tactics-target="bench"]').last().click();
  await expect(page.locator("#benchPlayersList")).toBeInViewport();
});

test("Lag og taktikk har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSquad(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.squad-tactics-status[data-squad-tactics-target="formation"]').click();
  await expectNoHorizontalOverflow(page);
});

test("Lag og taktikk har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openSquad(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="tactics"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("Lag og taktikk har autoritativ 768 px-baseline", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await openSquad(page);
  await expect(page.locator('[data-tab-section="tactics"]')).toHaveScreenshot("squad-tactics-768.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01
  });
});
''')

# index.html
replace_once(
    "index.html",
    '  <link rel="stylesheet" href="src/ui/manager-matchday-scene-v1.css">',
    '  <link rel="stylesheet" href="src/ui/manager-matchday-scene-v1.css">\n  <link rel="stylesheet" href="src/ui/manager-squad-tactics-scene-v2.css">'
)
replace_once(
    "index.html",
    '            <p class="pitch-hint">Visuelt først: sett brikker, formasjon og kampplan.',
    '            <section id="squadTacticsCommandPanel" class="panel manager-squad-tactics-command-panel" aria-labelledby="squadTacticsCommandTitle">\n              <div id="squadTacticsCommand" aria-live="polite"></div>\n            </section>\n\n            <p class="pitch-hint">Visuelt først: sett brikker, formasjon og kampplan.'
)

# app.js
replace_once(
    "src/app.js",
    'import { compactPlayerName, describeTacticalFit } from "./ui/manager-lineup-presentation.js";',
    'import { compactPlayerName, describeTacticalFit } from "./ui/manager-lineup-presentation.js";\nimport { createSquadTacticsSceneModel, renderManagerSquadTacticsCommand } from "./ui/manager-squad-tactics-presentation.js";'
)

scene_code = r'''
function openManagerSquadTacticsTarget(target) {
  if (["dashboard", "trening", "kamp", "statistikk", "historygo"].includes(target)) {
    activateTab(target);
    return;
  }

  const selectorByTarget = {
    lineup: "#lineupSlots",
    roles: "#lineupRoleChoices",
    formation: "#formationSelect",
    tactics: "#tacticSelect",
    bench: "#benchPlayersList"
  };
  const element = document.querySelector(selectorByTarget[target] || "#lineupSlots");
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  if (element.matches("button, select, input, textarea, [tabindex]")) {
    element.focus({ preventScroll: true });
  }
}

function renderManagerSquadTacticsScene(teamFit) {
  const container = document.getElementById("squadTacticsCommand");
  if (!container) return;
  const availability = getAvailability();
  const model = createSquadTacticsSceneModel({
    hasActiveSave: state.hasUnlocked,
    readiness: getMatchdayReadiness(teamFit),
    setup: getSquadSetupGateState(teamFit),
    formation: getFormation(),
    matchPlan: getTactic(),
    teamFit,
    rosterReadiness: availability?.rosterReadiness,
    selectedClub: state.selectedClub || { name: state.gameStartState?.clubName }
  });
  renderManagerSquadTacticsCommand(container, model, { onOpenTarget: openManagerSquadTacticsTarget });
}

'''
replace_once("src/app.js", "function renderLineup(teamFit) {", scene_code + "function renderLineup(teamFit) {")
replace_once("src/app.js", "  renderLineup(teamFit);\n  renderManagerTrainingScene();", "  renderLineup(teamFit);\n  renderManagerSquadTacticsScene(teamFit);\n  renderManagerTrainingScene();")

# package.json
package_path = ROOT / "package.json"
package_data = json.loads(package_path.read_text(encoding="utf-8"))
package_data["scripts"]["audit:manager-squad-tactics-scene-v2"] = "node scripts/audit-manager-squad-tactics-scene-v2.mjs"
package_data["scripts"]["sim:manager-squad-tactics-scene-v2"] = "node scripts/simulate-manager-squad-tactics-scene-v2.mjs"
package_path.write_text(json.dumps(package_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# CI
replace_once(
    ".github/workflows/ci.yml",
    "          npm run audit:manager-matchday-scene-v1",
    "          npm run audit:manager-matchday-scene-v1\n          npm run audit:manager-squad-tactics-scene-v2"
)
replace_once(
    ".github/workflows/ci.yml",
    "          npm run sim:manager-matchday-scene-v1",
    "          npm run sim:manager-matchday-scene-v1\n          npm run sim:manager-squad-tactics-scene-v2"
)

print("Materialized Manager Squad & Tactics Scene v2")

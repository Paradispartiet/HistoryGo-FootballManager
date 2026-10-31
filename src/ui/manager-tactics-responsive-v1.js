/*
 * Taktikkbrett v1: responsivt presentasjonslag for eksisterende laguttak.
 *
 * Autoritet: #lineupSlots, #benchPlayersList og den eksisterende Tropp-fanen.
 * Ingen ekstra spiller-, posisjons-, fase-, fit- eller lagringsmotor.
 */
import { projectFormationPhase } from "./manager-tactics-phase-projection.js";

const formationIndex = new Map();
let activePhase = "out";

const GRID_ID = "fmResponsiveTacticsGrid";
const PHASE_ID = "fmBaseFormationPhase";
const SQUAD_ID = "fmTacticsSquad";
const NAV_ID = "fmTacticsViewSwitch";

function element(tag, className, textContent) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (textContent !== undefined) item.textContent = String(textContent);
  return item;
}

function ensureStyle() {
  if (document.getElementById("fmResponsiveTacticsCss")) return;
  const link = document.createElement("link");
  link.id = "fmResponsiveTacticsCss";
  link.rel = "stylesheet";
  link.href = new URL("./manager-tactics-responsive-v1.css", import.meta.url).href;
  document.head.append(link);
}

function ensureLayout() {
  const root = document.querySelector('[data-tab-section="tactics"]');
  const grid = root?.querySelector(".office-main");
  const stage = grid?.querySelector(".pitch-stage");
  const pitch = stage?.querySelector("#lineupSlots");
  const details = grid?.querySelector("#sidePanel");
  if (!root || !grid || !stage || !pitch || !details) return null;
  if (grid.id === GRID_ID) return { grid, pitch };

  grid.id = GRID_ID;
  grid.classList.add("fm-tactics-grid");
  grid.dataset.view = "pitch";
  grid.dataset.layout = "edit";

  const nav = element("nav", "fm-tactics-view-switch");
  nav.id = NAV_ID;
  nav.setAttribute("aria-label", "Velg taktikkvisning");
  [
    ["pitch", "Laguttak"],
    ["phase", "Faser"],
    ["squad", "Spillere"]
  ].forEach(([name, title]) => {
    const button = element("button", "", title);
    button.type = "button";
    button.dataset.fmView = name;
    button.setAttribute("aria-pressed", name === "pitch" ? "true" : "false");
    button.addEventListener("click", () => {
      grid.dataset.view = name;
      nav.querySelectorAll("button").forEach((item) => {
        item.setAttribute("aria-pressed", item.dataset.fmView === name ? "true" : "false");
      });
    });
    nav.append(button);
  });
  root.insertBefore(nav, grid);

  // Wide-screen comparison deliberately separates the two canonical tactical
  // phase diagrams. The original pitch is unchanged and comes back on demand.
  const compareButton = element("button", "fm-compare-switch", "Sammenlign faser");
  compareButton.id = "fmComparePhases";
  compareButton.type = "button";
  compareButton.setAttribute("aria-pressed", "false");
  compareButton.setAttribute("aria-label", "Vis med og uten ball side om side");
  compareButton.addEventListener("click", () => {
    const comparing = grid.dataset.layout !== "phases";
    grid.dataset.layout = comparing ? "phases" : "edit";
    compareButton.setAttribute("aria-pressed", String(comparing));
    compareButton.textContent = comparing ? "Rediger laguttak" : "Sammenlign faser";
    compareButton.setAttribute("aria-label", comparing ? "Tilbake til redigerbar startellever" : "Vis med og uten ball side om side");
    if (comparing) {
      activePhase = "out";
      nav.querySelector('[data-fm-view="pitch"]')?.setAttribute("aria-pressed", "true");
      document.querySelectorAll("[data-fm-phase]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.fmPhase === "out"));
      });
    }
    // The data remains owned by the playable pitch, even when it is hidden.
    grid.dispatchEvent(new CustomEvent("fm:tactics-layout-change"));
  });
  stage.querySelector(".pitch-stage-head")?.after(compareButton);

  const attack = element("section", "fm-attack-panel");
  attack.id = "fmAttackPanel";
  attack.setAttribute("aria-label", "Illustrativ form med ball");
  const attackHead = element("div", "fm-panel-heading");
  const attackTitle = element("h3", "", "Med ball · grunnformasjon");
  attackTitle.id = "fmAttackHeading";
  attackHead.append(attackTitle, element("p", "", "Faseform fra formasjonsbiblioteket. Illustrasjon, ikke simulerte løp."));
  const attackPitch = element("div", "pitch fm-phase-pitch fm-attack-pitch");
  attackPitch.id = "fmAttackPitch";
  attackPitch.setAttribute("aria-label", "Spillernes illustrerte posisjoner med ball");
  attack.append(attackHead, attackPitch);
  pitch.after(attack);

  const phase = element("section", "manager-surface fm-phase-panel");
  phase.id = PHASE_ID;
  phase.setAttribute("aria-label", "Formasjoner med og uten ball");
  const phaseHead = element("div", "fm-panel-heading");
  const title = element("h3", "", "Uten ball · laster fasestruktur");
  title.id = "fmPhaseHeading";
  const description = element("p", "", "Faseformen hentes fra det valgte systemet. Spillerfordelingen er illustrativ, ikke simulerte løp.");
  description.id = "fmPhaseExplanation";
  phaseHead.append(title, description);

  const phaseControls = element("div", "fm-phase-controls");
  phaseControls.setAttribute("role", "group");
  phaseControls.setAttribute("aria-label", "Vis form med eller uten ball");
  [["in", "Med ball"], ["out", "Uten ball"]].forEach(([key, label]) => {
    const button = element("button", "", label);
    button.type = "button";
    button.dataset.fmPhase = key;
    button.setAttribute("aria-pressed", key === activePhase ? "true" : "false");
    phaseControls.append(button);
  });
  const phasePitch = element("div", "pitch fm-phase-pitch");
  phasePitch.id = "fmPhasePitch";
  phasePitch.setAttribute("aria-label", "Illustrativ fasefordeling av valgt ellever");
  phase.append(phaseHead, phaseControls, phasePitch);
  stage.after(phase);

  const squad = element("section", "manager-surface fm-squad-panel");
  squad.id = SQUAD_ID;
  squad.setAttribute("aria-label", "Startelleveren som spillerliste");
  const squadHead = element("div", "fm-panel-heading fm-squad-heading");
  const titles = element("div");
  titles.append(element("h3", "", "Startellever"), element("p", "", "Rolle og taktisk samsvar fra den valgte elleveren"));
  const openRoster = element("button", "fm-open-roster", "Hele troppen");
  openRoster.type = "button";
  openRoster.addEventListener("click", () => {
    root.ownerDocument.querySelector('.app-subtab[data-tab-target="squad"]')?.click();
  });
  squadHead.append(titles, openRoster);
  const columns = element("div", "fm-squad-column-head");
  columns.append(element("span", "", "Pos"), element("span", "", "Spiller"), element("span", "", "Rolle"), element("span", "", "Fit"));
  const list = element("div", "fm-squad-rows");
  list.id = "fmTacticsSquadRows";
  squad.append(squadHead, columns, list);
  phase.after(squad);

  // Flytt original benk (og ikke kopier knapper) slik at byttene fortsatt eies
  // av den eksisterende laguttaksmotoren. IDs og hendelseslyttere bevares.
  const bench = stage.querySelector(".pitch-bench");
  if (bench) {
    bench.classList.add("fm-tactics-bench");
    grid.append(bench);
  }

  // Long source-backed impact notes remain available without stretching the
  // live pitch column below the two tactical diagrams.
  const impact = stage.querySelector(".lineup-sourced-impact");
  if (impact) {
    const disclosure = element("details", "fm-tactics-insights");
    disclosure.append(element("summary", "", "Dokumenterte spillerbidrag"));
    disclosure.append(impact);
    // Keep reports outside the grid: the legacy player-profile column can
    // grow taller than its grid row and must never cover the disclosure.
    grid.after(disclosure);
  }
  return { grid, pitch };
}

function buildPhaseNodes(source, projection) {
  const projectedPlayers = new Map((projection?.players || []).map((player) => [player.id, player]));
  return source.map((chip) => {
    const name = chip.dataset.playerName || "Ledig plass";
    const shifted = projectedPlayers.get(chip.dataset.slotId);
    const pos = shifted?.position || chip.dataset.position || chip.dataset.slotLabel || "–";
    const mirror = element("span", "fm-phase-player");
    mirror.style.left = shifted ? `${shifted.x}%` : chip.style.left;
    mirror.style.top = shifted ? `${shifted.y}%` : chip.style.top;
    mirror.append(element("b", "", pos), element("span", "", name === "Tom plass" ? "Ledig" : name));
    if (pos === "GK") mirror.classList.add("is-keeper");
    if (!chip.dataset.playerId) mirror.classList.add("is-empty");
    if (chip.classList.contains("is-selected")) mirror.classList.add("is-selected");
    if (chip.dataset.fitTone === "misused") mirror.classList.add("is-misused");
    return mirror;
  });
}

function renderProjection(pitch) {
  const source = Array.from(pitch.querySelectorAll(".player-chip"));
  const target = document.getElementById("fmPhasePitch");
  const list = document.getElementById("fmTacticsSquadRows");
  if (!target || !list) return;

  target.dataset.density = pitch.dataset.density || "middels";
  target.dataset.narrow = pitch.dataset.narrow || "false";
  target.style.setProperty("--chip-w", pitch.style.getPropertyValue("--chip-w") || "18cqw");

  const formation = formationIndex.get(document.getElementById("formationSelect")?.value);
  const projection = projectFormationPhase(
    source.map((chip) => ({
      id: chip.dataset.slotId,
      position: chip.dataset.position,
      x: chip.dataset.x,
      y: chip.dataset.y
    })),
    formation,
    activePhase
  );
  const phaseLabel = activePhase === "in" ? "Med ball" : "Uten ball";
  document.getElementById("fmPhaseHeading").textContent =
    projection ? `${phaseLabel} · ${projection.shape}` : `${phaseLabel} · grunnformasjon`;
  document.getElementById("fmPhaseExplanation").textContent = projection
    ? "Faseform fra formasjonsbiblioteket. Spillerne fordeles illustrativt ut fra laguttaket; ingen løp eller kampinstrukser simuleres."
    : "Fasedata ikke tilgjengelige. Banen viser grunnformasjonen, ikke en egen fase.";
  target.dataset.phase = projection ? activePhase : "base";
  target.dataset.shape = projection?.shape || "";
  target.dataset.formationId = projection?.formationId || "";

  target.replaceChildren(...buildPhaseNodes(source, projection));

  const attackTarget = document.getElementById("fmAttackPitch");
  if (attackTarget) {
    const attackProjection = projectFormationPhase(
      source.map((chip) => ({
        id: chip.dataset.slotId,
        position: chip.dataset.position,
        x: chip.dataset.x,
        y: chip.dataset.y
      })), formation, "in"
    );
    attackTarget.dataset.phase = attackProjection ? "in" : "base";
    attackTarget.dataset.shape = attackProjection?.shape || "";
    attackTarget.dataset.formationId = attackProjection?.formationId || "";
    document.getElementById("fmAttackHeading").textContent = attackProjection
      ? `Med ball · ${attackProjection.shape}` : "Med ball · grunnformasjon";
    attackTarget.style.setProperty("--chip-w", pitch.style.getPropertyValue("--chip-w") || "18cqw");
    attackTarget.replaceChildren(...buildPhaseNodes(source, attackProjection));
  }

  const rows = source.sort((a, b) => Number(b.dataset.y || 0) - Number(a.dataset.y || 0))
    .map((chip) => {
      const pos = chip.dataset.position || "–";
      const name = chip.dataset.playerName || "Tom plass";
      const role = chip.dataset.roleName || "Ingen rolle";
      const fit = chip.querySelector(".chip-fit")?.textContent || "Ikke vurdert";
      const row = element("div", "fm-squad-row");
      if (chip.classList.contains("is-selected")) row.classList.add("is-selected");
      const posChip = element("span", "fm-position", pos);
      const nameCell = element("span", "fm-player-name", name);
      const roleCell = element("span", "fm-player-role", role);
      const fitCell = element("span", "fm-player-fit", fit);
      fitCell.dataset.tone = chip.dataset.fitTone || "empty";
      row.append(posChip, nameCell, roleCell, fitCell);
      const playerId = chip.dataset.playerId;
      if (playerId) {
        const button = element("button", "fm-player-profile", "Profil");
        button.type = "button";
        button.setAttribute("aria-label", "Åpne spillerprofil for " + name);
        button.addEventListener("click", () => {
          window.dispatchEvent(new CustomEvent("hgfm:open-player-profile", { detail: { playerId, allowLocked: true } }));
        });
        row.append(button);
      }
      return row;
    });
  list.replaceChildren(...rows);
}

function boot() {
  ensureStyle();
  const layout = ensureLayout();
  if (!layout) return;
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      renderProjection(layout.pitch);
    });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(layout.pitch, { childList: true, subtree: false });
  layout.grid.addEventListener("fm:tactics-layout-change", schedule);
  document.getElementById("formationSelect")?.addEventListener("change", schedule);
  document.querySelectorAll("[data-fm-phase]").forEach((button) => {
    button.addEventListener("click", () => {
      activePhase = button.dataset.fmPhase;
      document.querySelectorAll("[data-fm-phase]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      schedule();
    });
  });

  // One read of the canonical formation file; no new tactical state or save.
  fetch(new URL("../../data/hgFootball/formations.json", import.meta.url))
    .then((response) => {
      if (!response.ok) throw new Error("Formation data unavailable");
      return response.json();
    })
    .then((data) => {
      for (const formation of data.formations || []) {
        if (formation?.id) formationIndex.set(formation.id, formation);
      }
      schedule();
    })
    .catch(() => schedule());
  schedule();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}

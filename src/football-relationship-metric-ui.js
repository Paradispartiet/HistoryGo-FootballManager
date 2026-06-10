// src/football-relationship-metric-ui.js
//
// Lite UI-brolag for relasjonsscore.
// Hovedmotoren ligger i football-relationship-engine.js og er allerede koblet
// inn i calculateTeamFit. Denne filen gjør scoren synlig i eksisterende UI uten
// å røre den store app.js-filen.

import { calculateRoleRelationships } from "./football-relationship-engine.js";

const DATA_PATHS = {
  roles: "data/football_roles.json",
  tactics: "data/football_tactics.json"
};

const state = {
  roles: [],
  tactics: [],
  roleByName: new Map(),
  ready: false,
  scheduled: false
};

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Kunne ikke laste ${path}`);
  }

  return response.json();
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function buildRoleIndexes() {
  state.roleByName = new Map();

  state.roles.forEach((role) => {
    if (!role?.id || !role?.name) {
      return;
    }

    state.roleByName.set(normalizeText(role.name), role);
  });
}

function getSelectedTactic() {
  const tacticSelect = document.querySelector("#tacticSelect");
  const selectedId = tacticSelect?.value;
  return state.tactics.find((tactic) => tactic.id === selectedId) || state.tactics[0] || null;
}

function getAssignmentsFromPitch() {
  const chips = [...document.querySelectorAll("#lineupSlots .player-chip")];

  return chips
    .map((chip, index) => {
      const roleName = chip.querySelector(".chip-role")?.textContent || "";
      const playerName = chip.querySelector(".chip-name")?.textContent || "";
      const role = state.roleByName.get(normalizeText(roleName));

      if (!role || normalizeText(roleName) === "ingen rolle") {
        return null;
      }

      return {
        isComplete: true,
        role,
        player: { name: playerName || `Spiller ${index + 1}` },
        slot: { label: chip.getAttribute("aria-label") || `Slot ${index + 1}` }
      };
    })
    .filter(Boolean);
}

function setRelationshipScore(value, title = "") {
  const target = document.querySelector("#relationshipScore");

  if (!target) {
    return;
  }

  target.textContent = value;
  if (title) {
    target.title = title;
  }
}

function renderRelationshipScore() {
  if (!state.ready) {
    setRelationshipScore("–", "Relasjonsmotoren laster.");
    return;
  }

  const tactic = getSelectedTactic();
  const assignments = getAssignmentsFromPitch();

  if (!tactic || assignments.length === 0) {
    setRelationshipScore("–", "Fyll laget for å se relasjonsscore.");
    return;
  }

  const result = calculateRoleRelationships(assignments, tactic);
  const positiveCount = result.positiveRelations?.length || 0;
  const negativeCount = result.negativeRelations?.length || 0;

  setRelationshipScore(
    result.relationshipScore,
    `${positiveCount} positive relasjoner · ${negativeCount} negative relasjoner`
  );
}

function scheduleRender() {
  if (state.scheduled) {
    return;
  }

  state.scheduled = true;
  requestAnimationFrame(() => {
    state.scheduled = false;
    renderRelationshipScore();
  });
}

function observePitch() {
  const pitch = document.querySelector("#lineupSlots");

  if (!pitch) {
    return;
  }

  const observer = new MutationObserver(() => scheduleRender());
  observer.observe(pitch, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function bindControls() {
  ["#formationSelect", "#tacticSelect", "#slotPlayerSelect", "#slotRoleSelect"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener("change", () => scheduleRender());
    }
  });
}

async function initRelationshipMetric() {
  try {
    const [rolesData, tacticsData] = await Promise.all([
      loadJson(DATA_PATHS.roles),
      loadJson(DATA_PATHS.tactics)
    ]);

    state.roles = Array.isArray(rolesData.roles) ? rolesData.roles : [];
    state.tactics = Array.isArray(tacticsData.tactics) ? tacticsData.tactics : [];
    buildRoleIndexes();
    state.ready = true;

    observePitch();
    bindControls();
    scheduleRender();
  } catch (error) {
    console.warn("Relasjonsmetrikken kunne ikke lastes:", error);
    setRelationshipScore("–", "Relasjonsmetrikken kunne ikke lastes.");
  }
}

initRelationshipMetric();

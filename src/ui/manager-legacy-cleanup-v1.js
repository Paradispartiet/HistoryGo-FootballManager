import { MODE_SESSION_KEY } from "../football-mode-sessions.js";
import {
  migrateLegacyModeEnvelope,
  migrateLegacyTeamMerits
} from "../football-legacy-save-migration.js";

const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";

function readJson(storage, key) {
  try {
    const raw = storage?.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function writeJson(storage, key, value) {
  try {
    storage?.setItem(key, JSON.stringify(value));
    return true;
  } catch (_) {
    return false;
  }
}

export function migrateLegacyManagerStorage(storage) {
  if (!storage) return { changed: false, meritsChanged: false, envelopeChanged: false };

  const storedMerits = readJson(storage, TEAM_MERITS_KEY);
  const meritsMigration = migrateLegacyTeamMerits(storedMerits);
  const meritsChanged = meritsMigration.changed
    ? writeJson(storage, TEAM_MERITS_KEY, meritsMigration.merits)
    : false;

  const storedEnvelope = readJson(storage, MODE_SESSION_KEY);
  const envelopeMigration = migrateLegacyModeEnvelope(storedEnvelope);
  const envelopeChanged = envelopeMigration.changed
    ? writeJson(storage, MODE_SESSION_KEY, envelopeMigration.envelope)
    : false;

  return {
    changed: meritsChanged || envelopeChanged,
    meritsChanged,
    envelopeChanged,
    removedFields: meritsMigration.removedFields,
    migratedModes: envelopeMigration.migratedModes
  };
}

function removeLegacyManagerDom() {
  // Pass 5 skjulte disse flatene. Pass 7 fjerner dem fra DOM slik at de ikke
  // lenger er en latent navigasjons- eller tilgjengelighetsflate.
  document.querySelectorAll(
    '[data-tab-section="facilities"], [data-tab-section="market"], ' +
    '.app-subtab[data-tab-target="facilities"], .app-subtab[data-tab-target="market"]'
  ).forEach((node) => node.remove());

  document.getElementById("managerFacilitiesWorkspace")?.remove();
  document.getElementById("managerEconomyWorkspace")?.remove();
  document.getElementById("managerTransferMarketWorkspace")?.remove();

  // Administrasjon er fortsatt et ekte klubbrom. Bare artikkelen som var laget
  // for den fiktive økonomien fjernes; resten av administrasjonsflaten består.
  document.getElementById("adminEconomyNote")?.closest("article")?.remove();
}

function boot() {
  migrateLegacyManagerStorage(globalThis.localStorage);
  removeLegacyManagerDom();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  // Kjør migreringen straks modulen evalueres. manager-shell-view importeres av
  // app.js før app-state hydreres, så gamle felt kan ikke vinne tilbake senere.
  migrateLegacyManagerStorage(globalThis.localStorage);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeLegacyManagerDom, { once: true });
  } else {
    removeLegacyManagerDom();
  }
}

export { boot as runLegacyManagerCleanup };

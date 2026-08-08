// Pass 5 breadcrumb guard.
// Legacy-shellen kjenner fortsatt de gamle navnene «Klubbdrift», «Stab & drift»
// og «Klubbutvikling». Når de dype arbeidsflatene åpnes fra den nye
// organisasjonen, skal brukerens lokasjon fortsatt beskrive Kontor → Klubben.

let syncFrame = 0;

function visible(selector) {
  const element = document.querySelector(selector);
  return element && !element.hidden ? element : null;
}

function desiredLocation() {
  const drawer = document.getElementById("managerClubRoomDrawer");
  if (drawer && !drawer.hidden) {
    const title = String(document.getElementById("managerClubRoomTitle")?.textContent || "").trim();
    return title ? `Kontor · Klubben · ${title}` : "Kontor · Klubben";
  }

  if (visible('[data-tab-section="admin"]')?.querySelector(":scope > .club-organization-back")) {
    return "Kontor · Klubben · Administrasjon";
  }
  if (visible('[data-tab-section="progression"]')?.querySelector(":scope > .club-organization-back")) {
    return "Kontor · Klubben · Klubbutvikling";
  }
  if (visible('[data-tab-section="board"]') && document.getElementById("managerClubOrganization")) {
    return "Kontor · Klubben";
  }
  return "";
}

function syncLocation() {
  const location = document.getElementById("managerLocationText");
  const desired = desiredLocation();
  if (location && desired && location.textContent !== desired) location.textContent = desired;
}

function scheduleSync() {
  cancelAnimationFrame(syncFrame);
  syncFrame = requestAnimationFrame(() => {
    syncFrame = 0;
    syncLocation();
  });
}

function boot() {
  syncLocation();
  const location = document.getElementById("managerLocationText");
  if (location) {
    new MutationObserver(scheduleSync).observe(location, { subtree: true, childList: true, characterData: true });
  }

  const sections = ["board", "admin", "progression"]
    .map((target) => document.querySelector(`[data-tab-section="${target}"]`))
    .filter(Boolean);
  if (sections.length) {
    const observer = new MutationObserver(scheduleSync);
    sections.forEach((section) => observer.observe(section, { attributes: true, attributeFilter: ["hidden"] }));
  }

  const drawer = document.getElementById("managerClubRoomDrawer");
  if (drawer) new MutationObserver(scheduleSync).observe(drawer, { attributes: true, attributeFilter: ["hidden"] });

  document.addEventListener("click", (event) => {
    if (event.target?.closest?.(".club-organization-back, [data-club-room-action], [data-club-room-close], .app-subtab, .main-nav")) {
      queueMicrotask(scheduleSync);
    }
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}

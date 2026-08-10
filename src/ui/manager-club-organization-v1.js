const STYLE_ID = "managerClubOrganizationV1Style";
const SURFACE_ID = "managerClubOrganization";
const DRAWER_ID = "managerClubRoomDrawer";
const GAME_START_KEY = "hgfm.gameStartState.v1";
const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";

const DATA = Object.freeze({
  clubs: new URL("../../data/football_clubs.json", import.meta.url),
  staff: new URL("../../data/football_staff.json", import.meta.url)
});

const STAFF_TYPE_LABELS = Object.freeze({
  head_coach: "Hovedtrener",
  assistant_coach: "Assistenttrener",
  coach: "Trener",
  physical_coach: "Fysisk trener",
  goalkeeper_coach: "Keepertrener",
  goalkeeper_trainer: "Keepertrener",
  physio: "Fysioterapeut",
  physiotherapist: "Fysioterapeut",
  doctor: "Lege",
  medical: "Medisinsk apparat",
  scout: "Speider"
});

const MEDICAL_TYPES = /physio|physiotherapist|doctor|medical|rehab/i;

let runtime = null;
let renderFrame = 0;
let drawerState = { roomId: null, trigger: null };

const asArray = (value) => (Array.isArray(value) ? value : []);

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function node(tag, className = "", value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = String(value);
  return element;
}

function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Kunne ikke laste ${url.pathname}: ${response.status}`);
  return response.json();
}

function staffTypeLabel(value) {
  const id = text(value);
  return STAFF_TYPE_LABELS[id] || id.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("nb-NO")) || "Stab";
}

function qualitativeTrust(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return "Styrets signal er ikke tilgjengelig ennå.";
  if (score >= 65) return "Styret signaliserer tydelig tillit til retningen.";
  if (score <= 35) return "Styret signaliserer bekymring og forventer respons.";
  return "Styret følger utviklingen uten et akutt signal.";
}

function room(id, group, label, summary, detail, facts = [], actions = []) {
  return { id, group, label, summary, detail, facts, actions };
}

export function createClubOrganizationModel({
  clubName = "Managerklubben",
  club = null,
  hiredStaff = [],
  boardExpectation = "Styret følger klubbens utvikling.",
  boardTrust = null,
  squadCount = 0,
  formation = "Ikke valgt",
  tactic = "Ikke valgt",
  trainingProgram = "Ikke valgt",
  trainingFocus = "Ikke valgt",
  conditionSignal = "Ingen medisinsk status tilgjengelig ennå.",
  loadSignal = "Belastning leses fra spiller- og treningssystemet.",
  nextOpponent = "Ingen terminfestet kamp",
  development = {}
} = {}) {
  const staff = asArray(hiredStaff).filter(Boolean);
  const medicalStaff = staff.filter((entry) => MEDICAL_TYPES.test(text(entry?.staffType)));
  const ground = text(club?.ground, "Ikke dokumentert");
  const city = text(club?.city, "");
  const groundLine = [ground, city].filter(Boolean).join(" · ");
  const staffNames = staff.map((entry) => text(entry?.name, entry?.id)).filter(Boolean);
  const staffSummary = staffNames.length
    ? `${staffNames.length} engasjert i støtteapparatet`
    : "Støtteapparatet er ikke bemannet ennå";
  const medicalSummary = medicalStaff.length
    ? medicalStaff.map((entry) => text(entry?.name, staffTypeLabel(entry?.staffType))).join(" · ")
    : "Ingen medisinsk fagprofil er dokumentert i den aktive staben";
  const expertiseCount = Math.max(0, Number(development?.expertiseCount) || 0);
  const badgeCount = Math.max(0, Number(development?.badgeCount) || 0);
  const activePrograms = Math.max(0, Number(development?.activePrograms) || 0);

  const rooms = [
    room(
      "coaches",
      "Fotballavdelingen",
      "Trenerteam",
      staffSummary,
      "Her arbeider trenerne som følger laget gjennom trening, kampforberedelse og kamp. Rommet viser bare personer som faktisk finnes i klubbens aktive stab.",
      staff.length
        ? staff.map((entry) => ({ label: staffTypeLabel(entry?.staffType), value: text(entry?.name, entry?.id) }))
        : [{ label: "Aktiv stab", value: "Ingen engasjerte stabsprofiler" }],
      [{ id: "admin", label: "Arbeid med staben" }]
    ),
    room(
      "training-ground",
      "Fotballavdelingen",
      "Treningsanlegg",
      "Fysisk anleggsdata er ikke dokumentert ennå",
      "Klubbdataene dokumenterer hjemmebane, men ikke treningsfelt, styrkerom, behandlingsrom eller utstyr. Derfor viser HGFM ikke oppdiktede nivå 1–3 eller prosentbonuser her. Når faktiske anleggsdata finnes, skal de presenteres i dette rommet.",
      [
        { label: "Dokumentert treningsanlegg", value: "Ikke tilgjengelig i klubbdata" },
        { label: "Treningsplanlegging", value: `${trainingProgram} · ${trainingFocus}` }
      ],
      [{ id: "training", label: "Åpne Lag · Trening" }]
    ),
    room(
      "medical",
      "Fotballavdelingen",
      "Medisinsk apparat",
      medicalSummary,
      "Det medisinske arbeidet bruker den eksisterende spillerconditionen: skade, belastning, restitusjon og individuell oppfølging. Det opprettes ingen egen medisinsk rating.",
      [
        { label: "Medisinsk fagprofil", value: medicalSummary },
        { label: "Troppstilstand", value: text(conditionSignal, "Ingen akutte signaler") },
        { label: "Belastning", value: text(loadSignal, "Belastning leses fra treningssystemet") }
      ],
      [{ id: "individual-training", label: "Åpne individuell oppfølging" }]
    ),
    room(
      "analysis",
      "Fotballavdelingen",
      "Analyse",
      `${formation} · ${tactic}`,
      "Analyseavdelingen forklarer systemet laget faktisk spiller med, motstanderen og det som skjedde i kamp. Taktikkmotoren og kampanalysen er fortsatt sannhetskildene.",
      [
        { label: "Aktivt system", value: `${formation} · ${tactic}` },
        { label: "Neste motstander", value: text(nextOpponent, "Ingen terminfestet kamp") }
      ],
      [
        { id: "system", label: "Åpne Systemet" },
        { id: "analysis", label: "Åpne kampanalyse" }
      ]
    ),
    room(
      "board",
      "Klubben",
      "Styret",
      qualitativeTrust(boardTrust),
      "Styret oppleves som en del av organisasjonen, ikke som en permanent målervegg. Her leser du forventningen og det aktuelle signalet fra klubbuka.",
      [
        { label: "Forventning", value: text(boardExpectation, "Styret følger klubbens utvikling") },
        { label: "Signal nå", value: qualitativeTrust(boardTrust) }
      ]
    ),
    room(
      "administration",
      "Klubben",
      "Administrasjon",
      `${Math.max(0, Number(squadCount) || 0)} spillere · ${staff.length} i støtteapparatet`,
      "Administrasjonen samler operativ drift rundt laget og staben. Fiktive spillerlønninger, kontraktlengder, overgangssummer og kjøp/salg er ikke en del av den aktive klubbflaten.",
      [
        { label: "Tropp", value: `${Math.max(0, Number(squadCount) || 0)} spillere` },
        { label: "Støtteapparat", value: `${staff.length} engasjerte` }
      ],
      [{ id: "admin", label: "Åpne administrasjonen" }]
    ),
    room(
      "stadium",
      "Klubben",
      "Stadion og hjemmebane",
      groundLine,
      "Hjemmebanen kommer fra den canonical klubbfila. Dette er klubbens dokumenterte stedstilknytning og kan kobles videre til History Go uten å finne på anleggsdata som ikke finnes.",
      [
        { label: "Hjemmebane", value: ground },
        { label: "By", value: city || "Ikke dokumentert" },
        { label: "History Go-sted", value: text(club?.homePlaceId, "Ikke koblet") }
      ]
    ),
    room(
      "development",
      "Klubben",
      "Klubbutvikling",
      activePrograms > 0 ? `${activePrograms} aktive utviklingsprogram` : "History Go-kjeden er klar for videre arbeid",
      "Klubbutvikling beholder den eksisterende History Go-kjeden fra sted og person til ekspertise, utviklingsprogram, badge og lagklasse. Dette er lærings- og identitetsarbeid, ikke fasilitetsnivå eller økonomisimulering.",
      [
        { label: "Ekspertise", value: `${expertiseCount}` },
        { label: "Aktive program", value: `${activePrograms}` },
        { label: "Badges", value: `${badgeCount}` }
      ],
      [{ id: "progression", label: "Åpne klubbutvikling" }]
    )
  ];

  const academyName = text(club?.academyName || club?.academy);
  if (academyName) {
    rooms.push(room(
      "academy",
      "Klubben",
      "Akademi",
      academyName,
      "Akademiet vises bare når klubbdataene faktisk dokumenterer det.",
      [{ label: "Akademi", value: academyName }]
    ));
  }

  return {
    clubName: text(clubName, club?.name || "Managerklubben"),
    clubId: text(club?.id),
    ground,
    city,
    rooms,
    groups: ["Fotballavdelingen", "Klubben"]
  };
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-club-organization-v1.css", import.meta.url).href;
  document.head.append(link);
}

function currentStart() {
  return readJson(GAME_START_KEY, {}) || {};
}

function currentMerits() {
  return readJson(TEAM_MERITS_KEY, {}) || {};
}

function currentClub() {
  if (!runtime) return null;
  const start = currentStart();
  const id = text(start?.takeoverClubId);
  if (id && runtime.clubsById.has(id)) return runtime.clubsById.get(id);
  const name = text(start?.clubName).toLocaleLowerCase("nb-NO");
  return runtime.clubs.find((club) => text(club?.name).toLocaleLowerCase("nb-NO") === name) || null;
}

function currentStaff() {
  if (!runtime) return [];
  const merits = currentMerits();
  return asArray(merits?.hiredStaffIds)
    .map((id) => runtime.staffById.get(String(id)))
    .filter(Boolean);
}

function parseCount(selector) {
  const value = text(document.querySelector(selector)?.textContent);
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function selectedLabel(selector, fallback) {
  const select = document.querySelector(selector);
  return text(select?.selectedOptions?.[0]?.textContent || select?.value, fallback);
}

function buildLiveModel() {
  const start = currentStart();
  const club = currentClub();
  return createClubOrganizationModel({
    clubName: text(start?.clubName, club?.name || "Managerklubben"),
    club,
    hiredStaff: currentStaff(),
    boardExpectation: text(document.getElementById("boardExpectationNote")?.textContent, start?.boardExpectation || "Styret følger klubbens utvikling."),
    boardTrust: Number(document.getElementById("boardTrustValue")?.textContent || document.getElementById("clubBoardTrust")?.textContent),
    squadCount: parseCount("#managerRosterCount") || parseCount("#rosterUnlockedCount") || parseCount("#adminSquadCount"),
    formation: selectedLabel("#formationSelect", "Formasjon ikke valgt"),
    tactic: selectedLabel("#tacticSelect", "Kampplan ikke valgt"),
    trainingProgram: text(document.getElementById("teamSelectedTrainingProgram")?.textContent, "Ikke valgt"),
    trainingFocus: text(document.getElementById("teamSelectedTrainingFocus")?.textContent, "Ikke valgt"),
    conditionSignal: text(document.getElementById("trainingDayCondition")?.textContent, "Spillercondition følges i trenings- og condition-systemet."),
    loadSignal: text(document.getElementById("trainingDayLoad")?.textContent, "Belastning følges i treningssystemet."),
    nextOpponent: text(document.getElementById("managerCalendarMatch")?.textContent, "Ingen terminfestet kamp"),
    development: {
      expertiseCount: document.querySelectorAll("#unlockedExpertiseList .unlock-card, #unlockedExpertiseList > *").length,
      activePrograms: document.querySelectorAll("#badgeProgressList .unlock-card, #badgeProgressList > *").length,
      badgeCount: parseCount("#progressionBadgeCount")
    }
  });
}

function ensureNavigation() {
  const subnav = document.getElementById("appSubnav");
  const boardButton = subnav?.querySelector('.app-subtab[data-tab-target="board"]');
  const boardSection = document.querySelector('[data-tab-section="board"]');
  if (boardButton) {
    boardButton.dataset.subnavParent = "dashboard";
    boardButton.textContent = "Klubben";
    boardButton.classList.remove("office-subnav-proxy");
    if (boardButton.dataset.clubOrganizationBound !== "true") {
      boardButton.dataset.clubOrganizationBound = "true";
      boardButton.addEventListener("click", () => queueMicrotask(activateClub));
    }
    const calendar = subnav?.querySelector('.app-subtab[data-tab-target="calendar"]');
    if (calendar && calendar.nextElementSibling !== boardButton) calendar.after(boardButton);
  }
  if (boardSection) boardSection.dataset.tabParent = "dashboard";

  ["progression", "admin"].forEach((target) => {
    const button = subnav?.querySelector(`.app-subtab[data-tab-target="${target}"]`);
    if (button) button.classList.add("club-organization-deep-proxy");
    const section = document.querySelector(`[data-tab-section="${target}"]`);
    if (section) section.dataset.tabParent = "dashboard";
  });

}

function activateClub() {
  const section = document.querySelector('[data-tab-section="board"]');
  if (!section) return;
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => { candidate.hidden = candidate !== section; });
  document.querySelectorAll(".main-nav .nav-tab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === "dashboard";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  document.querySelectorAll(".app-subtab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === "board";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  const subnav = document.getElementById("appSubnav");
  if (subnav) subnav.hidden = false;
  renderOrganization();
  syncLocation("Kontor · Klubben");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function syncLocation(value) {
  const location = document.getElementById("managerLocationText");
  if (location && value) location.textContent = value;
}

function ensureSurface() {
  const section = document.querySelector('[data-tab-section="board"]');
  if (!section) return null;
  section.classList.add("has-manager-club-organization-v1");
  let surface = document.getElementById(SURFACE_ID);
  if (surface) return surface;
  surface = node("section", "manager-club-organization");
  surface.id = SURFACE_ID;
  surface.setAttribute("aria-label", "Klubborganisasjon");
  surface.setAttribute("aria-live", "polite");
  section.prepend(surface);
  return surface;
}

function roomRow(roomModel) {
  const button = node("button", "club-organization-room");
  button.type = "button";
  button.dataset.clubRoom = roomModel.id;
  button.setAttribute("aria-label", `${roomModel.label}: ${roomModel.summary}`);
  const copy = node("span", "club-organization-room-copy");
  copy.append(node("strong", "", roomModel.label), node("small", "", roomModel.summary));
  button.append(node("span", "club-organization-room-group", roomModel.group), copy, node("span", "club-organization-room-arrow", "→"));
  button.addEventListener("click", () => openRoom(roomModel.id, button));
  return button;
}

function renderOrganization() {
  ensureNavigation();
  const surface = ensureSurface();
  if (!surface || !runtime) return;
  const model = buildLiveModel();
  surface.replaceChildren();

  const head = node("header", "club-organization-head");
  const copy = node("div", "club-organization-head-copy");
  copy.append(
    node("p", "eyebrow", "Kontor · Klubben"),
    node("h2", "", model.clubName),
    node("p", "club-organization-lede", model.ground !== "Ikke dokumentert" ? `${model.ground}${model.city ? ` · ${model.city}` : ""}` : "Utforsk menneskene, fagrommene og stedene som faktisk finnes i klubben.")
  );
  const rule = node("aside", "club-organization-rule");
  rule.append(node("span", "", "Klubbregel"), node("strong", "", "Mennesker og rom før målere"), node("small", "", "Ingen fasilitetsnivåer, fiktive spillerkontrakter eller overgangsmarked på denne flaten."));
  head.append(copy, rule);

  const directory = node("div", "club-organization-directory");
  model.groups.forEach((group) => {
    const groupSection = node("section", "club-organization-group");
    groupSection.append(node("h3", "", group));
    const list = node("div", "club-organization-room-list");
    model.rooms.filter((entry) => entry.group === group).forEach((entry) => list.append(roomRow(entry)));
    groupSection.append(list);
    directory.append(groupSection);
  });
  const academy = model.rooms.find((entry) => entry.id === "academy");
  if (academy && !model.groups.includes(academy.group)) directory.append(roomRow(academy));

  const footer = node("footer", "club-organization-footer");
  footer.append(node("strong", "", "Klubben viser bare det datagrunnlaget støtter."), node("span", "", "Mangler fysiske anleggsdata, sier spillet det i stedet for å dikte nivåer eller bonuser."));
  surface.append(head, directory, footer);
}

function ensureDrawer() {
  let drawer = document.getElementById(DRAWER_ID);
  if (drawer) return drawer;
  drawer = node("div", "manager-club-room-drawer");
  drawer.id = DRAWER_ID;
  drawer.hidden = true;
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-labelledby", "managerClubRoomTitle");
  drawer.innerHTML = `
    <button type="button" class="club-room-backdrop" data-club-room-close aria-label="Lukk klubbrom"></button>
    <aside class="club-room-panel">
      <header class="club-room-head">
        <div><p class="eyebrow" id="managerClubRoomEyebrow">Kontor · Klubben</p><h2 id="managerClubRoomTitle">Klubbrom</h2></div>
        <button type="button" class="club-room-close" data-club-room-close aria-label="Lukk klubbrom">×</button>
      </header>
      <div id="managerClubRoomBody" class="club-room-body"></div>
    </aside>`;
  document.body.append(drawer);
  drawer.querySelectorAll("[data-club-room-close]").forEach((button) => button.addEventListener("click", closeRoom));
  drawer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeRoom();
    }
  });
  return drawer;
}

function roomActionButton(action) {
  const button = node("button", "club-room-action", action.label);
  button.type = "button";
  button.dataset.clubRoomAction = action.id;
  button.addEventListener("click", () => handleRoomAction(action.id));
  return button;
}

function openRoom(roomId, trigger = null) {
  const model = buildLiveModel();
  const roomModel = model.rooms.find((entry) => entry.id === roomId);
  if (!roomModel) return;
  const drawer = ensureDrawer();
  drawerState = { roomId, trigger: trigger instanceof HTMLElement ? trigger : document.activeElement };
  drawer.querySelector("#managerClubRoomEyebrow").textContent = `${roomModel.group} · ${model.clubName}`;
  drawer.querySelector("#managerClubRoomTitle").textContent = roomModel.label;
  const body = drawer.querySelector("#managerClubRoomBody");
  body.replaceChildren();
  body.append(node("p", "club-room-summary", roomModel.summary), node("p", "club-room-detail", roomModel.detail));
  if (roomModel.facts.length) {
    const facts = node("dl", "club-room-facts");
    roomModel.facts.forEach((fact) => {
      const row = node("div", "club-room-fact");
      row.append(node("dt", "", fact.label), node("dd", "", fact.value));
      facts.append(row);
    });
    body.append(facts);
  }
  if (roomModel.actions.length) {
    const actions = node("div", "club-room-actions");
    roomModel.actions.forEach((action) => actions.append(roomActionButton(action)));
    body.append(actions);
  }
  drawer.hidden = false;
  document.documentElement.classList.add("has-manager-club-room");
  syncLocation(`Kontor · Klubben · ${roomModel.label}`);
  queueMicrotask(() => drawer.querySelector(".club-room-close")?.focus());
}

function closeRoom() {
  const drawer = document.getElementById(DRAWER_ID);
  if (!drawer || drawer.hidden) return;
  drawer.hidden = true;
  document.documentElement.classList.remove("has-manager-club-room");
  const trigger = drawerState.trigger;
  drawerState = { roomId: null, trigger: null };
  syncLocation("Kontor · Klubben");
  if (trigger?.isConnected) trigger.focus();
}

function activateExistingTarget(target) {
  const subtab = document.querySelector(`.app-subtab[data-tab-target="${target}"]:not(.club-organization-deep-proxy)`);
  if (subtab instanceof HTMLElement) {
    subtab.click();
    return true;
  }
  const section = document.querySelector(`[data-tab-section="${target}"]`);
  if (!section) return false;
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => { candidate.hidden = candidate !== section; });
  document.querySelectorAll(".main-nav .nav-tab[data-tab-target]").forEach((button) => {
    const selected = ["tactics", "kamp", "dashboard"].includes(target)
      ? button.dataset.tabTarget === target
      : target === "trening" || target === "system"
        ? button.dataset.tabTarget === "tactics"
        : target === "analyse"
          ? button.dataset.tabTarget === "kamp"
          : button.dataset.tabTarget === "dashboard";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  return true;
}

function ensureDeepBack(section, label) {
  let back = section.querySelector(":scope > .club-organization-back");
  if (back) return back;
  back = node("button", "club-organization-back", `← Tilbake til Klubben fra ${label}`);
  back.type = "button";
  back.addEventListener("click", activateClub);
  section.prepend(back);
  return back;
}

function openDeepRoom(target, label) {
  closeRoom();
  const section = document.querySelector(`[data-tab-section="${target}"]`);
  if (!section) return;
  ensureDeepBack(section, label);
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => { candidate.hidden = candidate !== section; });
  document.querySelectorAll(".main-nav .nav-tab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === "dashboard";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  document.querySelectorAll(".app-subtab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === "board";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  syncLocation(`Kontor · Klubben · ${label}`);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function handleRoomAction(action) {
  if (action === "admin") {
    openDeepRoom("admin", "Administrasjon");
    return;
  }
  if (action === "progression") {
    openDeepRoom("progression", "Klubbutvikling");
    return;
  }
  closeRoom();
  if (action === "individual-training") {
    activateExistingTarget("trening");
    queueMicrotask(() => document.getElementById("trainingDayChangeIndividual")?.click());
  } else if (action === "training") activateExistingTarget("trening");
  else if (action === "system") activateExistingTarget("system");
  else if (action === "analysis") activateExistingTarget("analyse");
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    ensureNavigation();
    renderOrganization();
    // Et åpent dialogrom er et interaksjonsøyeblikksbilde. Bakgrunnsrendering
    // kan oppdatere romkatalogen, men må ikke erstatte knappene mens manageren
    // peker, bruker tastatur eller leser en faglig konsekvens. Rommet bygger
    // fersk state neste gang det åpnes.
    const board = document.querySelector('[data-tab-section="board"]');
    if (board && !board.hidden) syncLocation(document.getElementById(DRAWER_ID)?.hidden === false ? document.getElementById("managerLocationText")?.textContent : "Kontor · Klubben");
  });
}

function installObservers() {
  window.addEventListener("storage", scheduleRender);
  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("hgfm:team-merits-changed", scheduleRender);
  document.addEventListener("change", (event) => {
    if (event.target?.matches?.("#formationSelect, #tacticSelect")) scheduleRender();
  });
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.('.main-nav [data-tab-target="dashboard"]')) queueMicrotask(ensureNavigation);
    if (event.target?.closest?.('.app-subtab[data-tab-target="board"]')) queueMicrotask(activateClub);
  });

  const observer = new MutationObserver((mutations) => {
    const surface = document.getElementById(SURFACE_ID);
    const drawer = document.getElementById(DRAWER_ID);
    if (mutations.every((mutation) => surface?.contains(mutation.target) || drawer?.contains(mutation.target))) return;
    scheduleRender();
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class", "data-tab-parent"] });
}

async function loadRuntime() {
  const [clubsData, staffData] = await Promise.all([loadJson(DATA.clubs), loadJson(DATA.staff)]);
  const clubs = asArray(clubsData?.clubs);
  const staff = asArray(staffData?.staff);
  runtime = {
    clubs,
    staff,
    clubsById: new Map(clubs.map((club) => [String(club.id), club])),
    staffById: new Map(staff.map((entry) => [String(entry.id), entry]))
  };
}

async function boot() {
  ensureStyles();
  ensureNavigation();
  ensureSurface();
  ensureDrawer();
  try {
    await loadRuntime();
  } catch (error) {
    console.warn("Kunne ikke laste klubborganisasjonsdata", error);
    runtime = { clubs: [], staff: [], clubsById: new Map(), staffById: new Map() };
  }
  renderOrganization();
  installObservers();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}

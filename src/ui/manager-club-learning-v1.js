const STYLE_ID = "managerClubLearningV1Style";

const ROOM_LEARNING = Object.freeze({
  "Treningsanlegg": Object.freeze({
    intro: "Treningsanlegget er et sted og et arbeidsmiljø, ikke en rating. Klubbspesifikke fakta skal bare vises når de finnes i canonical klubbdata.",
    heading: "Dette skal dokumenteres i anlegget",
    items: Object.freeze([
      ["Baner og underlag", "Hvilke treningsflater klubben faktisk disponerer, underlag, størrelse og hvordan de brukes gjennom uka."],
      ["Rom og soner", "Styrkerom, behandlingsrom, møterom, garderober og andre dokumenterte arbeidsrom rundt treningsfeltet."],
      ["Utstyr og materialforvaltning", "Baller, mål, vester, kjegler, GPS-/analyseutstyr og annet materiell skal beskrives når klubbkilden dokumenterer det — ikke modelleres som bonuspoeng."],
      ["Organisering av treningsarbeidet", "Hvordan trenerteam, fysisk apparat, analyse og materialforvaltning samarbeider rundt den faktiske treningsdagen." ]
    ]),
    note: "Når opplysningene mangler, skal rommet si «ikke dokumentert». Det er en datagrense, ikke et lavt fasilitetsnivå."
  }),
  "Medisinsk apparat": Object.freeze({
    intro: "Det medisinske apparatet følger spillerens vei fra første signal til trygg retur. Den eksisterende player-condition-, belastnings- og treningsstaten er fortsatt sannhetskilden.",
    heading: "Arbeidskjeden",
    items: Object.freeze([
      ["1 · Identifisere", "Registrer smerte, skadehendelse, sykdom eller uvanlig belastningssignal."],
      ["2 · Undersøke", "Avklar funksjon, symptomer og hva spilleren faktisk tåler før videre aktivitet."],
      ["3 · Akuttbehandle", "Håndter det som må gjøres umiddelbart og avgjør om spilleren skal tas ut av aktivitet."],
      ["4 · Rehabilitere", "Bygg kapasiteten gradvis tilbake gjennom belastning som passer skaden og spillerens respons."],
      ["5 · Forebygge", "Bruk skadehistorikk, treningsbelastning og individuelle behov til å redusere unødvendig risiko."],
      ["6 · Belastningsstyre", "Se trening, kampbelastning og restitusjon i sammenheng i stedet for som separate prosentbonuser."],
      ["7 · Returnere", "Spilleren går tilbake til trening og kamp når den eksisterende condition- og tilgjengelighetslogikken faktisk tillater det." ]
    ]),
    note: "HGFM oppretter ingen egen medisinsk overall eller recovery-rating for å representere dette arbeidet."
  })
});

function node(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-club-learning-v1.css", import.meta.url).href;
  document.head.append(link);
}

function renderRoomLearning() {
  const drawer = document.getElementById("managerClubRoomDrawer");
  if (!drawer || drawer.hidden) return;
  const title = String(document.getElementById("managerClubRoomTitle")?.textContent || "").trim();
  const config = ROOM_LEARNING[title];
  const body = document.getElementById("managerClubRoomBody");
  if (!config || !body) return;

  const existing = body.querySelector(".club-room-learning-v1");
  if (existing?.dataset.roomTitle === title) return;
  existing?.remove();

  const section = node("section", "club-room-learning-v1");
  section.dataset.roomTitle = title;
  section.setAttribute("aria-label", `${title} · faglig innhold`);
  section.append(node("p", "club-room-learning-intro", config.intro), node("h3", "", config.heading));

  const list = node("div", "club-room-learning-list");
  config.items.forEach(([label, detail]) => {
    const row = node("div", "club-room-learning-row");
    row.append(node("strong", "", label), node("p", "", detail));
    list.append(row);
  });
  section.append(list, node("p", "club-room-learning-note", config.note));
  body.append(section);
}

function install() {
  ensureStyles();
  renderRoomLearning();
  const observer = new MutationObserver(() => queueMicrotask(renderRoomLearning));
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["hidden"]
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
}

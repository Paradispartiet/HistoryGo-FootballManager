import {
  createMedicalDecisionCase,
  evaluateMedicalDecision
} from "../football-medical-decision-learning.js";
import { MODE_SESSION_KEY, normalizeMode } from "../football-mode-sessions.js";

const STYLE_ID = "managerClubLearningV1Style";
const PLAYER_CONDITION_KEY = "hgfm.playerCondition.v1";

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

function readConditions() {
  try {
    const envelope = JSON.parse(localStorage.getItem(MODE_SESSION_KEY) || "null");
    const activeMode = normalizeMode(envelope?.activeMode);
    const activeSession = envelope?.sessions?.[activeMode];
    if (activeSession && Array.isArray(activeSession.playerCondition)) {
      return activeSession.playerCondition;
    }
  } catch {
    // En korrupt konvolutt skal ikke gjøre den migrerte league-conditionen
    // uleselig. Legacy-nøkkelen under er bare fallback, aldri førstevalg.
  }
  try {
    const value = JSON.parse(localStorage.getItem(PLAYER_CONDITION_KEY) || "null");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function renderMedicalOutcome(container, outcome) {
  container.hidden = false;
  container.dataset.status = outcome.status;
  container.replaceChildren(
    node("strong", "", outcome.label),
    node("p", "", outcome.explanation),
    node("p", "medical-decision-consequence", outcome.consequence),
    node("small", "", outcome.guardrail)
  );
}

function appendMedicalDecisionWorkshop(body) {
  const decisionCase = createMedicalDecisionCase(readConditions());
  const workshop = node("section", "medical-decision-workshop-v1");
  workshop.dataset.caseKind = decisionCase.kind;
  workshop.setAttribute("aria-labelledby", "medicalDecisionWorkshopTitle");
  const kicker = node("span", "medical-decision-kicker", "Situasjon → valg → faglig konsekvens");
  const title = node("h3", "", "Medisinsk beslutningsverksted");
  title.id = "medicalDecisionWorkshopTitle";
  workshop.append(kicker, title, node("strong", "medical-decision-headline", decisionCase.headline), node("p", "", decisionCase.situation));

  if (decisionCase.kind === "no_case") {
    workshop.append(node("p", "medical-decision-empty", decisionCase.question));
    body.append(workshop);
    return;
  }

  const evidence = node("div", "medical-decision-evidence");
  const known = node("section", "");
  known.append(node("strong", "", "Dette vet vi"));
  const knownList = node("ul", "");
  decisionCase.known.forEach((item) => knownList.append(node("li", "", item)));
  known.append(knownList);
  const missing = node("section", "");
  missing.append(node("strong", "", "Dette mangler før en sikker konklusjon"));
  const missingList = node("ul", "");
  decisionCase.missing.forEach((item) => missingList.append(node("li", "", item)));
  missing.append(missingList);
  evidence.append(known, missing);

  const question = node("p", "medical-decision-question", decisionCase.question);
  question.id = "medicalDecisionQuestion";
  const choices = node("div", "medical-decision-choices");
  choices.setAttribute("role", "group");
  choices.setAttribute("aria-labelledby", question.id);
  const outcome = node("div", "medical-decision-outcome");
  outcome.hidden = true;
  outcome.setAttribute("aria-live", "polite");

  decisionCase.choices.forEach((choice) => {
    const button = node("button", "medical-decision-choice", choice.label);
    button.type = "button";
    button.dataset.medicalDecision = choice.id;
    button.addEventListener("click", () => {
      choices.querySelectorAll("button").forEach((candidate) => candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false"));
      const result = evaluateMedicalDecision(decisionCase, choice.id);
      if (result) renderMedicalOutcome(outcome, result);
    });
    button.setAttribute("aria-pressed", "false");
    choices.append(button);
  });

  const source = node("p", "medical-decision-source", "Faggrunnlag: kriteriebasert og individuelt tilpasset rehabilitering; retur vurderes mot symptomer, funksjon, fotballkrav og en delt beslutning i støtteapparatet.");
  workshop.append(evidence, question, choices, outcome, source);
  body.append(workshop);
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
  if (title === "Medisinsk apparat") appendMedicalDecisionWorkshop(body);
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

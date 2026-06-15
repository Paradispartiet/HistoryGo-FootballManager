// HG Football Manager — Inbox Event Integration v1
//
// Dette laget kobler den eksisterende Innboksen («Klubbens puls») til
// kontekstmotorene vi allerede har: off-pitch-parametrene (slitasje, moral,
// press, garderobe, taktisk klarhet …), treningsprogrammene, kampdagen og
// beslutningene. Innboksen var fra før en statisk UI-avdeling; her gjør vi
// trådene LEVENDE: assistenttrener, medisinsk apparat, styret, presse,
// spillergruppe, trening, kampdag og scouting sender signaler som dramatiserer
// konteksten og peker mot konkrete handlinger.
//
// Designprinsipp (CLAUDE.md): «Alle spillere er gode nok. Spørsmålet er om
// treneren forstår dem.» Innboksen forteller derfor ikke spilleren hva som er
// riktig. Den gir bekymringer, observasjoner og press som manageren må TOLKE.
// Noen tråder har tydelige råd, men det skal fremdeles være mulig å ta et bedre
// kontekstuelt valg enn standardforslaget. Meldingene lekker aldri rå
// hidden-tall — bare lesbare signaler.
//
// Modulen er ren ESM: ingen DOM, ingen fetch, ingen localStorage, ingen
// app-state, ingen sideeffekter. Alle funksjoner er deterministiske: lik input
// gir byte-identisk output. State muteres aldri — funksjonene returnerer ny.

const VERSION = "historygo-football-manager.inbox.v1";

const HISTORY_LIMIT = 24; // hvor mange valg vi tar vare på i history.
const THREAD_LIMIT = 40; // tak på antall tråder vi holder i state.

// Lovlige enum-verdier — brukes av normaliseringen så korrupt state ikke lekker.
const THREAD_TYPES = new Set([
  "assistant",
  "medical",
  "board",
  "media",
  "squad",
  "training",
  "matchday",
  "scouting",
  "admin"
]);
const PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const STATUSES = new Set(["unread", "read", "resolved", "archived"]);
const TONES = new Set(["safe", "balanced", "risky", "assertive", "defensive"]);
const LINKED_ACTION_KINDS = new Set([
  "training_program",
  "training_focus",
  "match_plan",
  "formation",
  "rest",
  "board",
  "none"
]);

// De eneste off-pitch-parametrene et valg får lov å nudge. Holdes synk med
// choice-skjemaet og med off-pitch-motorens parametre (alle finnes i dens
// DEFAULTS), slik at applyOffPitchEvent kan route hver delta riktig.
const CHOICE_EFFECT_KEYS = [
  "fatigue",
  "wear",
  "injuryRisk",
  "morale",
  "confidence",
  "cohesion",
  "autonomy",
  "pressure",
  "mediaPressure",
  "boardPressure",
  "expectationPressure",
  "tacticalClarity",
  "roleFrustration",
  "hiddenStress"
];

// Off-pitch event-typer (jf. applyOffPitchEvent) per trådtype.
const THREAD_TYPE_TO_EVENT_TYPE = {
  assistant: "training",
  medical: "training",
  board: "board",
  media: "media",
  squad: "squad",
  training: "training",
  matchday: "matchday",
  scouting: "private",
  admin: "private"
};

// ----------------------------------------------------------------------------
// Hjelpere
// ----------------------------------------------------------------------------
function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function str(value, fallback = "") {
  return isNonEmptyString(value) ? value : fallback;
}

function strArray(value) {
  return asArray(value).filter(isNonEmptyString);
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function roundDelta(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function uniqueStrings(values) {
  return [...new Set(strArray(values))];
}

// Trygg lesing av en off-pitch-state. Vi importerer bevisst IKKE off-pitch-
// motoren her — innboksen skal bare lese tallene den får, ikke eie dem. Verdier
// leses defensivt med fornuftige standardverdier (en rolig, fersk tropp).
function readOffPitch(context) {
  const ctx = isObject(context) ? context : {};
  const stateInput = isObject(ctx.offPitchState) ? ctx.offPitchState : {};
  const team = isObject(stateInput.team) ? stateInput.team : {};
  const squad = isObject(stateInput.squad) ? stateInput.squad : {};
  return {
    fatigue: num(team.fatigue, 22),
    wear: num(team.wear, 18),
    injuryRisk: num(team.injuryRisk, 15),
    morale: num(team.morale, 58),
    confidence: num(team.confidence, 55),
    cohesion: num(team.cohesion, 52),
    autonomy: num(team.autonomy, 50),
    pressure: num(team.pressure, 35),
    mediaPressure: num(team.mediaPressure, 30),
    boardPressure: num(team.boardPressure, 35),
    expectationPressure: num(team.expectationPressure, 40),
    roleFrustration: num(squad.roleFrustration, 20),
    tacticalClarity: num(squad.tacticalClarity, 50),
    hiddenStress: num(squad.hiddenStress, 22)
  };
}

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------
export function createInboxState() {
  return {
    version: VERSION,
    threads: [],
    archivedThreadIds: [],
    readThreadIds: [],
    resolvedThreadIds: [],
    lastGeneratedContextHash: null,
    history: []
  };
}

// Normaliser ett valg til fast choice-skjema. Effekter clampes til de lovlige
// nøklene og rundes til heltall.
function normalizeChoice(choice) {
  const c = isObject(choice) ? choice : {};
  const effects = {};
  const src = isObject(c.effects) ? c.effects : {};
  for (const key of CHOICE_EFFECT_KEYS) {
    const d = roundDelta(src[key]);
    if (d !== 0) effects[key] = d;
  }
  return {
    id: str(c.id, "choice"),
    label: str(c.label, "Svar"),
    description: str(c.description, ""),
    tone: TONES.has(c.tone) ? c.tone : "balanced",
    effects,
    resultText: strArray(c.resultText)
  };
}

// Normaliser linkedAction til fast skjema.
function normalizeLinkedAction(action) {
  const a = isObject(action) ? action : {};
  return {
    kind: LINKED_ACTION_KINDS.has(a.kind) ? a.kind : "none",
    id: isNonEmptyString(a.id) ? a.id : null,
    label: str(a.label, "")
  };
}

// Normaliser én tråd til fast skjema. Tåler delvis/korrupt input.
function normalizeThread(thread) {
  const t = isObject(thread) ? thread : {};
  return {
    id: str(t.id, ""),
    type: THREAD_TYPES.has(t.type) ? t.type : "admin",
    priority: PRIORITIES.has(t.priority) ? t.priority : "medium",
    title: str(t.title, "Melding"),
    sender: str(t.sender, "Klubbkontoret"),
    summary: str(t.summary, ""),
    body: strArray(t.body),
    createdAtLabel: str(t.createdAtLabel, ""),
    status: STATUSES.has(t.status) ? t.status : "unread",
    tags: uniqueStrings(t.tags),
    sourceSignals: uniqueStrings(t.sourceSignals),
    linkedAction: normalizeLinkedAction(t.linkedAction),
    choices: asArray(t.choices).map(normalizeChoice),
    effectsPreview: strArray(t.effectsPreview),
    hiddenContextNote: isNonEmptyString(t.hiddenContextNote) ? t.hiddenContextNote : null,
    resolvedChoiceId: isNonEmptyString(t.resolvedChoiceId) ? t.resolvedChoiceId : null
  };
}

function normalizeHistoryEntry(entry) {
  const e = isObject(entry) ? entry : {};
  return {
    threadId: str(e.threadId, ""),
    choiceId: str(e.choiceId, ""),
    type: str(e.type, ""),
    label: str(e.label, "")
  };
}

// Normaliser en (muligens tom/ufullstendig/korrupt) inbox-state til full v1-form.
// Statuser holdes konsistente med id-listene (arkivert/lest/løst). Trådene
// dedupliseres på id (siste vinner). Deterministisk.
export function normalizeInboxState(state) {
  const src = isObject(state) ? state : {};

  const seenIds = new Set();
  const threads = [];
  for (const raw of asArray(src.threads)) {
    const thread = normalizeThread(raw);
    if (!thread.id || seenIds.has(thread.id)) continue;
    seenIds.add(thread.id);
    threads.push(thread);
  }

  const archivedThreadIds = uniqueStrings(src.archivedThreadIds);
  const readThreadIds = uniqueStrings(src.readThreadIds);
  const resolvedThreadIds = uniqueStrings(src.resolvedThreadIds);

  const archivedSet = new Set(archivedThreadIds);
  const readSet = new Set(readThreadIds);
  const resolvedSet = new Set(resolvedThreadIds);

  // Hold trådstatus konsistent med id-listene. Prioritet: arkivert > løst > lest.
  for (const thread of threads) {
    if (archivedSet.has(thread.id)) thread.status = "archived";
    else if (resolvedSet.has(thread.id)) thread.status = "resolved";
    else if (readSet.has(thread.id) && thread.status === "unread") thread.status = "read";
  }

  return {
    version: VERSION,
    threads: threads.slice(-THREAD_LIMIT),
    archivedThreadIds,
    readThreadIds,
    resolvedThreadIds,
    lastGeneratedContextHash: isNonEmptyString(src.lastGeneratedContextHash)
      ? src.lastGeneratedContextHash
      : null,
    history: asArray(src.history).slice(-HISTORY_LIMIT).map(normalizeHistoryEntry)
  };
}

// ----------------------------------------------------------------------------
// Trådbyggere — fast skjema via makeThread. Hver builder leser konteksten og
// returnerer en lesbar tråd som peker mot en konkret handling.
// ----------------------------------------------------------------------------
function makeThread(partial) {
  return normalizeThread({
    createdAtLabel: "Nå",
    status: "unread",
    ...partial
  });
}

// 2) Medisinsk apparat — reagerer på fatigue/wear/injuryRisk.
export function createInboxThreadFromOffPitchSignal(signal, context) {
  // Generell inngang for et synlig off-pitch-signal. Vi router på kategori til
  // den riktige avsenderen. Returnerer null når signalet ikke gir en tråd.
  const sig = isObject(signal) ? signal : {};
  const op = readOffPitch(context);
  switch (sig.category) {
    case "physical":
    case "injury":
      return buildMedicalThread(op);
    case "boardMedia":
      return buildBoardThread(op) || buildMediaThread(op);
    case "dressingRoom":
    case "mental":
      return buildSquadThread(op);
    case "tacticalClarity":
      return buildAssistantThread(op, context);
    case "pressure":
      return buildMediaThread(op);
    default:
      return null;
  }
}

function buildMedicalThread(op) {
  const load = Math.max(op.fatigue, op.wear);
  const critical = load >= 70 || op.injuryRisk >= 65;
  const watch = load >= 52 || op.injuryRisk >= 45;
  if (!critical && !watch) return null;

  const level = critical ? "critical" : "watch";
  const body = critical
    ? [
        "Vi ser tydelige tegn på overbelastning i gruppa.",
        "Kjører vi en hard uke nå, risikerer vi belastningsskader på nøkkelspillere."
      ]
    : [
        "Flere kropper begynner å vise slitasje.",
        "Vi bør tenke gjennom belastningen før neste økt blir for tung."
      ];

  return makeThread({
    id: `inbox:medical:load:${level}`,
    type: "medical",
    priority: critical ? "urgent" : "high",
    title: critical ? "Faresignal fra medisinsk" : "Belastningen krever et valg",
    sender: "Medisinsk apparat",
    summary: critical
      ? "Skadefaren er forhøyet — en pressuke kan bli dyr."
      : "Slitasjen stiger. Hvordan vil du legge opp uka?",
    body,
    tags: ["belastning", "skadefare"],
    sourceSignals: ["physical", "injury"],
    linkedAction: {
      kind: "training_program",
      id: "recovery_prevention",
      label: "Vurder restitusjons- og skadeforebyggingsuke"
    },
    effectsPreview: ["Lett belastning senker slitasje og skadefare, men koster utvikling."],
    choices: [
      {
        id: "ease_load",
        label: "Lett belastningen denne uka",
        description: "Prioriter restitusjon foran intensitet.",
        tone: "safe",
        effects: { fatigue: -12, wear: -10, injuryRisk: -10, morale: 2 },
        resultText: ["Det medisinske apparatet puster lettet ut. Beina blir ferskere til kamp."]
      },
      {
        id: "reduce_intensity",
        label: "Hold planen, men reduser intensitet",
        description: "Behold strukturen, demp belastningen.",
        tone: "balanced",
        effects: { fatigue: -5, wear: -4, injuryRisk: -4 },
        resultText: ["En forsiktig mellomløsning. Slitasjen flater litt ut."]
      },
      {
        id: "take_risk",
        label: "Ta risikoen og kjør hardt",
        description: "Du tror gruppa tåler det.",
        tone: "risky",
        effects: { fatigue: 6, wear: 5, injuryRisk: 8, confidence: 2, hiddenStress: 3 },
        resultText: ["Du satser. Tåler kroppene det, kan det gi en skarpere uke — ellers blir det dyrt."]
      }
    ]
  });
}

// 3) Styret — reagerer på boardPressure/expectationPressure.
function buildBoardThread(op) {
  const critical = op.boardPressure >= 68 || op.expectationPressure >= 72;
  const watch = op.boardPressure >= 58;
  if (!critical && !watch) return null;

  const level = critical ? "critical" : "watch";
  return makeThread({
    id: `inbox:board:direction:${level}`,
    type: "board",
    priority: critical ? "urgent" : "high",
    title: critical ? "Styret vil ha en tydelig retning" : "Styret følger med",
    sender: "Styret",
    summary: critical
      ? "Styret forventer synlig sportslig retning. Hva svarer du?"
      : "Styret ber om et tydelig sportslig bilde.",
    body: critical
      ? [
          "Styret er ikke nødvendigvis misfornøyd, men de vil se en plan de kan stå bak.",
          "De forventer at du forklarer den sportslige retningen — ikke bare resultatene."
        ]
      : ["Styret ber om en kort oppdatering på hvor laget er på vei."],
    tags: ["styret", "retning"],
    sourceSignals: ["boardMedia", "pressure"],
    linkedAction: { kind: "board", id: null, label: "Møt styret om retningen" },
    effectsPreview: ["Et tydelig svar kan lette styrepresset, men noen svar koster ro senere."],
    choices: [
      {
        id: "explain_plan",
        label: "Forklar langsiktig sportslig plan",
        description: "Stå for retningen og be om tid til å bygge.",
        tone: "balanced",
        effects: { boardPressure: -8, autonomy: 4, expectationPressure: -3 },
        resultText: ["Styret nikker. De gir deg rom så lenge planen er tydelig."]
      },
      {
        id: "promise_reaction",
        label: "Lov umiddelbar reaksjon",
        description: "Du lover rask bedring.",
        tone: "assertive",
        effects: { boardPressure: -12, pressure: 6, expectationPressure: 7, hiddenStress: 5, autonomy: -5 },
        resultText: ["Styret roer seg for nå, men forventningene strammes til. Presset flyttes til neste kamp."]
      },
      {
        id: "ask_for_calm",
        label: "Be om arbeidsro",
        description: "Du ber styret holde igjen.",
        tone: "defensive",
        effects: { boardPressure: -4, autonomy: 6, mediaPressure: 2 },
        resultText: ["Du får litt mer ro internt, men noe av presset siver ut i media."]
      }
    ]
  });
}

// 4) Presse — reagerer på mediaPressure/pressure.
function buildMediaThread(op) {
  const critical = op.mediaPressure >= 64;
  const watch = op.mediaPressure >= 54 || op.pressure >= 64;
  if (!critical && !watch) return null;

  const level = critical ? "critical" : "watch";
  return makeThread({
    id: `inbox:media:pressure:${level}`,
    type: "media",
    priority: critical ? "high" : "medium",
    title: critical ? "Mediene følger laget tett" : "Pressen vil ha en kommentar",
    sender: "Presseansvarlig",
    summary: critical
      ? "Medietrykket er høyt. Hvordan vil du håndtere det?"
      : "Det kommer spørsmål fra pressen før neste kamp.",
    body: critical
      ? [
          "Avisene skriver mye om laget om dagen, og noen overskrifter river i gruppa.",
          "Måten du møter presset på, smitter over på spillerne."
        ]
      : ["Pressen ber om en kommentar foran neste kamp."],
    tags: ["media", "press"],
    sourceSignals: ["boardMedia", "pressure"],
    linkedAction: { kind: "none", id: null, label: "Håndter mediebildet" },
    effectsPreview: ["Hvor du legger presset, avgjør om gruppa skjermes eller belastes."],
    choices: [
      {
        id: "take_pressure",
        label: "Ta presset selv",
        description: "Du legger trykket på deg som manager.",
        tone: "assertive",
        effects: { mediaPressure: -8, pressure: -4, confidence: 2, hiddenStress: 4 },
        resultText: ["Gruppa skjermes. Du bærer en større mental last selv."]
      },
      {
        id: "shield_squad",
        label: "Skjerme spillergruppen",
        description: "Du verner spillerne for kritikk.",
        tone: "defensive",
        effects: { mediaPressure: -4, cohesion: 4, morale: 3, autonomy: 2 },
        resultText: ["Spillerne kjenner at du står foran dem. Samholdet styrkes."]
      },
      {
        id: "pressure_team",
        label: "Legge press på laget",
        description: "Du krever en reaksjon offentlig.",
        tone: "risky",
        effects: { pressure: 6, roleFrustration: 4, confidence: 3, mediaPressure: -2 },
        resultText: ["Noen tenner på presset, andre kjenner det tungt. Det er et sjansespill."]
      }
    ]
  });
}

// 5) Spillergruppe / garderobe — reagerer på morale/cohesion/roleFrustration/
// hiddenStress.
function buildSquadThread(op) {
  const trigger =
    op.morale <= 40 || op.cohesion <= 40 || op.roleFrustration >= 55 || op.hiddenStress >= 55;
  if (!trigger) return null;

  const severe = op.morale <= 32 || op.roleFrustration >= 62 || op.cohesion <= 32;
  const level = severe ? "strained" : "uneasy";

  // Halvskjult signal — vi sier hva som merkes, ikke det eksakte tallet.
  let summary;
  if (op.roleFrustration >= 55) summary = "Flere virker usikre på rollene sine.";
  else if (op.cohesion <= 40) summary = "Garderoben virker litt splittet for tiden.";
  else summary = "Stemningen i gruppa er flat om dagen.";

  return makeThread({
    id: `inbox:squad:mood:${level}`,
    type: "squad",
    priority: severe ? "high" : "medium",
    title: "Signaler fra garderoben",
    sender: "Lagkaptein",
    summary,
    body: [
      "Det er ingen åpen konflikt, men noe ligger og ulmer.",
      "Spillerne ser mot deg for en tydelig retning."
    ],
    tags: ["garderobe", "roller"],
    sourceSignals: ["dressingRoom", "mental"],
    linkedAction: { kind: "training_focus", id: null, label: "Tydeliggjør roller på trening" },
    effectsPreview: ["En tydelig rolleplan samler gruppa; et brått systemskifte kan forvirre den."],
    hiddenContextNote:
      op.hiddenStress >= 55
        ? "Noe ligger under overflaten som tallene ikke fullt ut forklarer."
        : null,
    choices: [
      {
        id: "clarify_roles",
        label: "Samle gruppa rundt tydelig rolleplan",
        description: "Du forklarer hver spillers oppgave.",
        tone: "balanced",
        effects: { cohesion: 6, roleFrustration: -8, tacticalClarity: 4, morale: 3 },
        resultText: ["Spillerne vet hva som forventes. Roen senker seg i garderoben."]
      },
      {
        id: "switch_system",
        label: "Bytte system raskt",
        description: "Du endrer opplegget for å riste løs.",
        tone: "risky",
        effects: { tacticalClarity: -6, cohesion: -3, roleFrustration: -2, confidence: 2 },
        resultText: ["Et friskt pust for noen, men systemet sitter dårligere en stund."]
      },
      {
        id: "hold_and_train",
        label: "Holde fast og trene mer",
        description: "Du stoler på at arbeid løser det.",
        tone: "safe",
        effects: { cohesion: 3, tacticalClarity: 3, roleFrustration: -3, fatigue: 4 },
        resultText: ["Gruppa graver dypere. Det koster litt friskhet, men gir grep."]
      }
    ]
  });
}

// 1) Assistenttrener — taktisk observasjon, kobler mot oppsett/formasjon/trening.
function buildAssistantThread(op, context) {
  if (op.tacticalClarity > 45) return null;

  const ctx = isObject(context) ? context : {};
  const formationName = str(ctx.formation?.name, "systemet");
  const level = op.tacticalClarity <= 35 ? "low" : "soft";

  return makeThread({
    id: `inbox:assistant:clarity:${level}`,
    type: "assistant",
    priority: level === "low" ? "high" : "medium",
    title: "Assistenttreneren har en observasjon",
    sender: "Assistenttrener",
    summary: `Vi kan spille oss fri i ${formationName}, men bare hvis vi trener oppbyggingen først.`,
    body: [
      "Spillerne kan systemet på papiret, men de nøler i de små valgene.",
      "Litt mer tid på formasjonen, så sitter mønstrene."
    ],
    tags: ["taktikk", "klarhet"],
    sourceSignals: ["tacticalClarity"],
    linkedAction: {
      kind: "training_program",
      id: "formation_familiarisation",
      label: "Prioriter formasjonstilvenning"
    },
    effectsPreview: ["Stegvis oppbygging gir klarhet; å stole på spillerne nå gir frihet, men risiko."],
    choices: [
      {
        id: "build_stepwise",
        label: "Bygg opp systemet stegvis",
        description: "Du følger assistentens råd.",
        tone: "balanced",
        effects: { tacticalClarity: 6, cohesion: 3, fatigue: 3 },
        resultText: ["Mønstrene begynner å sitte. Spillerne nøler mindre."]
      },
      {
        id: "trust_players",
        label: "Stol på spillerne nå",
        description: "Du gir gruppa frihet til å løse det selv.",
        tone: "risky",
        effects: { autonomy: 5, tacticalClarity: 2, hiddenStress: 2 },
        resultText: ["Du gir ansvar. Noen vokser på det — andre trenger tydeligere rammer."]
      }
    ]
  });
}

// 6) Trening — peker mot et relevant treningsprogram (gjør programmene spillbare
// gjennom innboksen). Informativ tråd uten valg: handlingen tas i trenings-UI-et.
export function createInboxThreadFromTrainingProgram(program, context) {
  const p = isObject(program) ? program : {};
  const id = str(p.id);
  if (!id) return null;

  const contextBonus = num(p.scoring?.contextBonus, 0);
  const carriesOffPitch = strArray(p.sourceSignals).includes("offPitch");
  // Bare program der off-pitch-konteksten faktisk peker mot dem blir en tråd.
  if (contextBonus <= 0 && !carriesOffPitch) return null;

  const why = strArray(p.recommendedBecause)[0] || str(p.summary, "Konteksten peker mot dette programmet.");

  return makeThread({
    id: `inbox:training:${id}`,
    type: "training",
    priority: "medium",
    title: `Treningsforslag: ${str(p.title, "Ukeprogram")}`,
    sender: "Trenerteamet",
    summary: "Konteksten denne uka peker mot et bestemt treningsprogram.",
    body: [why, "Forslaget er et faglig utgangspunkt — du kan fortsatt lese situasjonen bedre selv."],
    tags: ["trening", "program"],
    sourceSignals: ["offPitch", "training"],
    linkedAction: { kind: "training_program", id, label: `Sett opp uka: ${str(p.title, id)}` },
    effectsPreview: [],
    choices: []
  });
}

// 7) Kampdag — konsekvenstråd etter siste kamp. Knyttes til
// applyMatchdayOffPitchEffects på app-siden; her dramatiseres etterspillet.
export function createInboxThreadFromMatchday(matchdayResult, context) {
  const r = isObject(matchdayResult) ? matchdayResult : {};
  const outcome =
    r.outcome === "win" || r.outcome === "loss" || r.outcome === "draw"
      ? r.outcome
      : (() => {
          const gf = num(r.goalsFor, NaN);
          const ga = num(r.goalsAgainst, NaN);
          if (Number.isFinite(gf) && Number.isFinite(ga)) {
            if (gf > ga) return "win";
            if (gf < ga) return "loss";
            return "draw";
          }
          return null;
        })();
  if (!outcome) return null;

  // Stabil, men kamp-unik nøkkel: lar en ny kamp gi en ny tråd, mens samme kamp
  // ikke dupliseres. Faller tilbake på resultatprofil når ingen id finnes.
  const matchKey = str(r.matchId) || str(r.id) || `${outcome}-${num(r.goalsFor)}-${num(r.goalsAgainst)}-${num(r.week)}`;
  const opponent = str(r.opponentName, str(r.opponent?.name, "motstanderen"));

  if (outcome === "win") {
    return makeThread({
      id: `inbox:matchday:${matchKey}`,
      type: "matchday",
      priority: "low",
      title: `Etter seieren mot ${opponent}`,
      sender: "Assistenttrener",
      summary: "Seieren løftet stemningen. Hvordan følger du den opp?",
      body: ["Gruppa er i godt humør.", "Nå handler det om å bygge videre uten å bli selvtilfreds."],
      tags: ["kampdag", "seier"],
      sourceSignals: ["matchday"],
      linkedAction: { kind: "match_plan", id: null, label: "Bygg videre på kampplanen" },
      effectsPreview: [],
      choices: [
        {
          id: "stay_humble",
          label: "Hold beina på jorda",
          description: "Du roser, men holder fokus.",
          tone: "balanced",
          effects: { cohesion: 3, tacticalClarity: 2 },
          resultText: ["Gruppa tar med seg seieren uten å miste skjerpingen."]
        },
        {
          id: "celebrate",
          label: "La gruppa nyte det",
          description: "Du gir rom for å feire.",
          tone: "safe",
          effects: { morale: 4, confidence: 3, hiddenStress: -3 },
          resultText: ["Stemningen er på topp. Litt overskudd inn i neste uke."]
        }
      ]
    });
  }

  if (outcome === "loss") {
    return makeThread({
      id: `inbox:matchday:${matchKey}`,
      type: "matchday",
      priority: "high",
      title: `Etter tapet mot ${opponent}`,
      sender: "Assistenttrener",
      summary: "Tapet sitter i gruppa. Hvordan svarer du?",
      body: [
        "Det er stille i garderoben.",
        "Måten du håndterer tapet på, avgjør om laget reiser seg eller synker."
      ],
      tags: ["kampdag", "tap"],
      sourceSignals: ["matchday"],
      linkedAction: { kind: "match_plan", id: null, label: "Juster kampplanen" },
      effectsPreview: ["Å verne spillerne samler gruppa; å kreve mer kan tenne eller belaste."],
      choices: [
        {
          id: "take_responsibility",
          label: "Ta ansvaret offentlig",
          description: "Du tar støyten utad.",
          tone: "assertive",
          effects: { mediaPressure: -4, boardPressure: -3, confidence: 2, hiddenStress: 4 },
          resultText: ["Du skjermer spillerne, men bærer mer selv."]
        },
        {
          id: "protect_players",
          label: "Verne om spillerne",
          description: "Du samler gruppa internt.",
          tone: "defensive",
          effects: { cohesion: 5, morale: 4, mediaPressure: 1 },
          resultText: ["Spillerne kjenner støtte. Samholdet tåler tapet."]
        },
        {
          id: "demand_more",
          label: "Kreve mer av gruppa",
          description: "Du setter høyere krav.",
          tone: "risky",
          effects: { roleFrustration: 5, confidence: 3, hiddenStress: 3, morale: -2 },
          resultText: ["Et tydelig krav. Noen reiser seg, andre kjenner presset tungt."]
        }
      ]
    });
  }

  // draw
  return makeThread({
    id: `inbox:matchday:${matchKey}`,
    type: "matchday",
    priority: "low",
    title: `Etter uavgjort mot ${opponent}`,
    sender: "Assistenttrener",
    summary: "Ett poeng. Stemningen holdt seg omtrent som før.",
    body: ["Ingen krise, ingen fest.", "Det er rom for å finjustere før neste kamp."],
    tags: ["kampdag", "uavgjort"],
    sourceSignals: ["matchday"],
    linkedAction: { kind: "match_plan", id: null, label: "Finjuster kampplanen" },
    effectsPreview: [],
    choices: []
  });
}

// 8) Scouting / History Go — minner om at flere spillere må samles. Muterer
// ALDRI History Go-progresjon og låser ikke opp noe; ren melding.
function buildScoutingThread(context) {
  const ctx = isObject(context) ? context : {};
  const readiness = ctx.availability?.rosterReadiness;
  if (!isObject(readiness)) return null;

  const unlockedCount = num(readiness.unlockedCount, NaN);
  const missing = num(readiness.missingUnlocked, NaN);
  const lacking =
    readiness.hasEnoughUnlocked === false ||
    (Number.isFinite(missing) && missing > 0) ||
    (Number.isFinite(unlockedCount) && unlockedCount < 15);
  if (!lacking) return null;

  return makeThread({
    id: "inbox:scouting:squad_depth",
    type: "scouting",
    priority: "medium",
    title: "Scouting: troppen er for tynn",
    sender: "Scout",
    summary: "Vi mangler spillere for å fylle en komplett tropp.",
    body: [
      "Skal vi tåle en sesong, trenger vi flere spillere i stallen.",
      "Besøk flere sportssteder i History Go for å låse opp nye spillere og stab."
    ],
    tags: ["scouting", "history go"],
    sourceSignals: ["roster"],
    linkedAction: { kind: "none", id: null, label: "Samle flere spillere via History Go" },
    effectsPreview: [],
    choices: []
  });
}

// ----------------------------------------------------------------------------
// Kontekstgenerering — bygger alle relevante tråder for gjeldende kontekst.
// Deterministisk: lik kontekst gir byte-identiske tråder i fast rekkefølge.
// ----------------------------------------------------------------------------
export function createInboxThreads(context) {
  const ctx = isObject(context) ? context : {};
  const op = readOffPitch(ctx);
  const threads = [];
  const push = (thread) => {
    if (thread) threads.push(thread);
  };

  // Fast rekkefølge → determinisme. Kampdag først (ferskt etterspill), så de
  // kontekstuelle bekymringene, så de informative trådene.
  if (isObject(ctx.matchdayResult)) push(createInboxThreadFromMatchday(ctx.matchdayResult, ctx));
  push(buildMedicalThread(op));
  push(buildBoardThread(op));
  push(buildMediaThread(op));
  push(buildSquadThread(op));
  push(buildAssistantThread(op, ctx));

  // Treningsforslag: ta den mest off-pitch-relevante (om noen) som tråd.
  const programs = asArray(ctx.trainingPrograms);
  for (const program of programs) {
    const thread = createInboxThreadFromTrainingProgram(program, ctx);
    if (thread) {
      push(thread);
      break; // én treningstråd per kontekst — ikke spam.
    }
  }

  push(buildScoutingThread(ctx));

  return threads;
}

// Deterministisk kontekst-hash fra trådkandidatene (type + trigger + nivå via
// id-ene). Brukes til å unngå unødig regenerering når ingenting vesentlig endres.
function computeContextHash(candidates) {
  return asArray(candidates)
    .map((t) => t.id)
    .sort()
    .join("|");
}

// Slå sammen ferske kandidater inn i en eksisterende inbox-state uten å
// duplisere. En tråd legges bare til hvis id-en ikke allerede er kjent (aktiv,
// lest, løst eller arkivert). Arkiverte/leste/løste tråder bevares. Returnerer
// ny, normalisert state. Deterministisk.
export function integrateInboxThreads(inboxState, context) {
  const state = normalizeInboxState(inboxState);
  const candidates = createInboxThreads({ ...context, existingInboxState: state });
  const contextHash = computeContextHash(candidates);

  const known = new Set([
    ...state.threads.map((t) => t.id),
    ...state.archivedThreadIds,
    ...state.resolvedThreadIds
  ]);

  const fresh = candidates.filter((c) => c.id && !known.has(c.id));

  if (fresh.length === 0) {
    return { ...state, lastGeneratedContextHash: contextHash };
  }

  return {
    ...state,
    threads: [...state.threads, ...fresh].slice(-THREAD_LIMIT),
    lastGeneratedContextHash: contextHash
  };
}

// ----------------------------------------------------------------------------
// Valg & statusendringer — alle returnerer ny, normalisert state.
// ----------------------------------------------------------------------------

// Ta et valg i en tråd. Returnerer { inboxState, offPitchEvent, thread, choice }.
// offPitchEvent er klar til å sendes til off-pitch-motorens applyOffPitchEvent
// (eller null hvis valget ikke fantes / ikke har effekt). Tråden markeres som
// lest og løst, og valget legges i history. Deterministisk; input muteres ikke.
export function applyInboxChoice(inboxState, threadId, choiceId, context) {
  const state = normalizeInboxState(inboxState);
  const thread = state.threads.find((t) => t.id === threadId) || null;
  const choice = thread ? thread.choices.find((c) => c.id === choiceId) || null : null;

  if (!thread || !choice) {
    return { inboxState: state, offPitchEvent: null, thread: null, choice: null };
  }

  const hasEffects = Object.keys(choice.effects).length > 0;
  const offPitchEvent = hasEffects
    ? {
        id: `inbox:${thread.id}:${choice.id}`,
        type: THREAD_TYPE_TO_EVENT_TYPE[thread.type] || "private",
        title: thread.title,
        description: choice.label,
        effects: { ...choice.effects }
      }
    : null;

  const threads = state.threads.map((t) =>
    t.id === thread.id ? { ...t, status: "resolved", resolvedChoiceId: choice.id } : t
  );

  const readThreadIds = uniqueStrings([...state.readThreadIds, thread.id]);
  const resolvedThreadIds = uniqueStrings([...state.resolvedThreadIds, thread.id]);
  const history = [
    ...state.history,
    { threadId: thread.id, choiceId: choice.id, type: thread.type, label: choice.label }
  ].slice(-HISTORY_LIMIT);

  return {
    inboxState: normalizeInboxState({ ...state, threads, readThreadIds, resolvedThreadIds, history }),
    offPitchEvent,
    thread,
    choice
  };
}

// Arkiver en tråd (flytt til arkivet). Tråden beholdes i state.threads, men
// markeres arkivert via archivedThreadIds. Returnerer ny state.
export function archiveInboxThread(inboxState, threadId) {
  const state = normalizeInboxState(inboxState);
  if (!isNonEmptyString(threadId) || !state.threads.some((t) => t.id === threadId)) {
    return state;
  }
  return normalizeInboxState({
    ...state,
    archivedThreadIds: uniqueStrings([...state.archivedThreadIds, threadId])
  });
}

// Marker en tråd som lest. Returnerer ny state.
export function markInboxThreadRead(inboxState, threadId) {
  const state = normalizeInboxState(inboxState);
  if (!isNonEmptyString(threadId) || !state.threads.some((t) => t.id === threadId)) {
    return state;
  }
  return normalizeInboxState({
    ...state,
    readThreadIds: uniqueStrings([...state.readThreadIds, threadId])
  });
}

// ----------------------------------------------------------------------------
// Lesere
// ----------------------------------------------------------------------------

// Aktive tråder: alt som ikke er arkivert. Sortert etter prioritet (urgent
// først), deretter trådens egen rekkefølge — deterministisk.
const PRIORITY_RANK = { urgent: 3, high: 2, medium: 1, low: 0 };

export function getActiveInboxThreads(inboxState) {
  const state = normalizeInboxState(inboxState);
  const archived = new Set(state.archivedThreadIds);
  return state.threads
    .map((thread, index) => ({ thread, index }))
    .filter(({ thread }) => !archived.has(thread.id))
    .sort((a, b) => {
      const pr = (PRIORITY_RANK[b.thread.priority] || 0) - (PRIORITY_RANK[a.thread.priority] || 0);
      return pr !== 0 ? pr : a.index - b.index;
    })
    .map(({ thread }) => thread);
}

export function getArchivedInboxThreads(inboxState) {
  const state = normalizeInboxState(inboxState);
  const archived = new Set(state.archivedThreadIds);
  return state.threads.filter((thread) => archived.has(thread.id));
}

// Antall uleste aktive tråder (verken lest, løst eller arkivert).
export function getUnreadInboxCount(inboxState) {
  return getActiveInboxThreads(inboxState).filter((thread) => thread.status === "unread").length;
}

// Kort sammendrag av innboksens puls — for «Klubbens puls»-tellere og rapport.
export function summarizeInboxPulse(inboxState) {
  const state = normalizeInboxState(inboxState);
  const active = getActiveInboxThreads(state);
  const archived = getArchivedInboxThreads(state);
  const unread = active.filter((t) => t.status === "unread");

  const byType = {};
  for (const thread of active) {
    byType[thread.type] = (byType[thread.type] || 0) + 1;
  }

  const top =
    unread
      .slice()
      .sort((a, b) => (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0))[0] || null;

  let headline;
  if (unread.length === 0) {
    headline = "Innboksen er rolig akkurat nå.";
  } else if (top && (top.priority === "urgent" || top.priority === "high")) {
    headline = top.summary || top.title;
  } else {
    headline = `${unread.length} ${unread.length === 1 ? "tråd venter" : "tråder venter"} på et svar.`;
  }

  return {
    unread: unread.length,
    active: active.length,
    archived: archived.length,
    byType,
    topPriority: top ? top.priority : null,
    headline
  };
}

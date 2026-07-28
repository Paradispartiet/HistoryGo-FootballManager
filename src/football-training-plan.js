// ============================================================================
// Ukens treningsplan v1 — de tre lagene får hver sin jobb
//
// Problemet denne modulen løser er ikke at det var for mange treningsvalg. Det
// var at to av dem gjorde det samme, og at det tredje ikke var et valg:
//
//   «Trening etter Innboks»  var en OVERSKRIFT uten noe å velge i
//   «Ukens treningsfokus»    ga kampdagsbonus
//   «Treningsprogrammer»     ga off-pitch-effekt — og var ellers en parallell
//                            liste over de samme temaene, uten kobling
//
// Programmene inneholder til og med fokusene som økter («Fredag: Restforsvar»
// er `rest_defence`), men å velge programmet valgte ikke fokuset. Du måtte velge
// begge, og bare det ene påvirket kampen. Det er ikke tre valg — det er ett valg
// tatt to ganger, med ulik virkning.
//
// Her får hvert lag én jobb, og de griper i hverandre:
//
//   INNBOKS      leverer signalene. Ikke et treningsvalg — det du leser FØR.
//   PROGRAM      UKAS RAMME. Hva laget bruker uka på → belastning og restitusjon.
//   FOKUS        KAMPENS TEMA. Det ene du prioriterer → kampdagens metrikkbonus.
//   INDIVIDUELL  ENKELTSPILLEREN. Rollefortrolighet, restitusjon, form, opptrening.
//
// Og den ene regelen som binder de to midterste sammen:
//
//   > Fokuset bør ligge INNE i programmet.
//
// Trener du press hele uka og prioriterer oppbygging på kampdag, får laget
// mindre ut av begge. Det er en managerfeil — ikke en spillersvakhet — og flata
// sier det med rene ord.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random.
// ============================================================================

import { getTrainingFocus, getTrainingFocusFatigue } from "./football-training-week.js";

export const TRAINING_PLAN_VERSION = "training-plan.v1";

// Programmenes ukebelastning er summen av øktenes `fatigueLoad`. Tallene fantes
// allerede i football-training-program-compositions.js, men ingen leste dem —
// bare treningsfokusets fatigue påvirket restitusjonen. Programmet, altså ukas
// faktiske arbeidsmengde, var mekanisk uten virkning.
//
// SKALAREGELEN (CLAUDE.md): normaliser eksplisitt mot kildens spenn i stedet for
// å la en klamp gjøre jobben. Malenes faktiske summer i dag:
//   restitusjon 6 · formasjonstilvenning 12 · avslutning/oppbygging/balansert 14
//   defensiv struktur 15 · pressuke 19
// `sim:training-plan` måler dette mot ekte programdata og feiler hvis spennet
// flytter seg eller hvis utslagene klumper seg på taket.
export const PROGRAM_LOAD_MIN = 6;
export const PROGRAM_LOAD_MAX = 19;

// Hvor treningsintensiteten havner. 0.75 = utpreget restitusjonsuke,
// 1.45 = knallhard uke. Fôres inn i applyWeeklyRecovery, som selv klamper.
const INTENSITY_FLOOR = 0.75;
const INTENSITY_SPAN = 0.7;

// Fokuset modulerer rammen, det erstatter den ikke. Fokusets fatigue går fra
// −4 til +6, og gir maksimalt ±0.12 på toppen av programmets intensitet.
const FOCUS_FATIGUE_MAX = 6;
const FOCUS_INTENSITY_WEIGHT = 0.12;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// Rammen: hva programmet koster
// ---------------------------------------------------------------------------

// Summen av øktenes belastning i ett program.
export function getProgramWeeklyLoad(program) {
  return asArray(program?.sessions).reduce((sum, session) => sum + num(session?.fatigueLoad), 0);
}

// Ukas treningsintensitet: programmet setter rammen, fokuset modulerer.
// Uten program faller vi tilbake på fokuset alene (som før), slik at en spiller
// som bare velger fokus fortsatt får en meningsfull uke.
export function calculateWeeklyTrainingIntensity({ program = null, focusId = null } = {}) {
  const focusFatigue = focusId ? getTrainingFocusFatigue(focusId) : 0;
  const focusPart = (clamp(focusFatigue, -FOCUS_FATIGUE_MAX, FOCUS_FATIGUE_MAX) / FOCUS_FATIGUE_MAX) * FOCUS_INTENSITY_WEIGHT;

  if (!program) {
    // Ingen ramme valgt: fokuset alene, rundt nøytralt.
    return round2(clamp(1 + focusPart * 1.25, 0.6, 1.6));
  }

  const load = getProgramWeeklyLoad(program);
  const normalized = clamp((load - PROGRAM_LOAD_MIN) / (PROGRAM_LOAD_MAX - PROGRAM_LOAD_MIN), 0, 1);
  const programPart = INTENSITY_FLOOR + normalized * INTENSITY_SPAN;
  return round2(clamp(programPart + focusPart, 0.6, 1.6));
}

// Lesbar etikett på ukas belastning.
//
// Tersklene er satt etter de FAKTISKE intensitetene programmene gir
// (0,75 · 1,07 · 1,18 · 1,23 · 1,45), ikke etter runde tall. Første forsøk brukte
// 0,85/1,05/1,25 — da havnet fem av sju programmer på «Hard uke» og ingen på
// «Normal», så etiketten sa nesten ingenting. Det er samme feilklasse som en
// klamp som alltid biter: skalaen på den ene siden stemte ikke med dataene på
// den andre. `sim:training-plan` krever nå at etikettene faktisk sprer seg.
export function describeWeeklyLoad(intensity) {
  const value = num(intensity, 1);
  if (value <= 0.9) return { level: "lett", label: "Lett uke", note: "Laget henter inn mer enn kampen kostet." };
  if (value <= 1.15) return { level: "normal", label: "Normal uke", note: "Balansert: laget henter inn omtrent det kampen kostet." };
  if (value <= 1.32) return { level: "hard", label: "Hard uke", note: "Laget henter inn mindre enn kampen kostet. Belastningen kryper oppover." };
  return { level: "svært_hard", label: "Svært hard uke", note: "Kroppene taper terreng. Flere slike uker på rad brenner spillere ut." };
}

// ---------------------------------------------------------------------------
// Koblingen: ligger fokuset inne i programmet?
// ---------------------------------------------------------------------------

// Hvilke treningsfokus et program faktisk jobber med. Både de eksplisitte
// `relatedTrainingFocusIds` og de øktene som ER et treningsfokus teller.
export function getProgramFocusIds(program) {
  const explicit = asArray(program?.relatedTrainingFocusIds).map(str);
  const fromSessions = asArray(program?.sessions).map((session) => str(session?.focusId));
  return [...new Set([...explicit, ...fromSessions].filter((id) => Boolean(getTrainingFocus(id))))];
}

// Samsvaret mellom ramme og tema. Bonusen er bevisst liten (±1 på metrikk-
// bonusen, som selv er 2–5) — den avgjør aldri en kamp. Den forklarer.
export function evaluateProgramFocusCoherence(program, focusId) {
  const focus = getTrainingFocus(focusId);
  if (!program || !focus) {
    return {
      aligned: null,
      level: "ufullstendig",
      metricBonusDelta: 0,
      label: "Ikke ferdig valgt",
      note: !program && !focus
        ? "Velg ukas program og ukas fokus — rammen og temaet henger sammen."
        : !program
          ? "Du har et tema, men ingen ramme. Velg et treningsprogram så laget faktisk jobber med det."
          : "Du har en ramme, men ikke prioritert ett tema inn mot kampen."
    };
  }

  const inside = getProgramFocusIds(program);
  if (inside.includes(focus.id)) {
    return {
      aligned: true,
      level: "samsvar",
      metricBonusDelta: 1,
      label: "Rammen støtter temaet",
      // Programtittel og fokusnavn kan være det samme ordet
      // («Formasjonstilvenning»); da unngår vi tautologien.
      note: program.title.toLowerCase() === focus.name.toLowerCase()
        ? `${program.title} er nettopp det du prioriterer inn mot kampen. Rammen og temaet trekker samme vei, og laget får mer ut av begge.`
        : `${program.title} trener ${focus.name.toLowerCase()} gjennom uka, og du prioriterer det samme inn mot kampen. Laget får mer ut av begge.`
    };
  }

  const names = [...new Set(inside.map((id) => getTrainingFocus(id)?.name).filter(Boolean))];
  return {
    aligned: false,
    level: "sprik",
    metricBonusDelta: -1,
    label: "Ramme og tema spriker",
    note: `${program.title} jobber med ${names.join(", ").toLowerCase() || "noe annet"}, men du prioriterer ${focus.name.toLowerCase()} inn mot kampen. Uka trener én ting og kampplanen krever en annen — laget får mindre ut av begge. Det er et valg du har tatt, ikke noe spillerne mangler.`
  };
}

// ---------------------------------------------------------------------------
// Hele uka som ÉN modell
// ---------------------------------------------------------------------------

// Fire steg i fast rekkefølge. Hvert steg vet om det er gjort, hva som mangler,
// og hvor du går for å gjøre noe med det. `nextStepId` er alltid satt så lenge
// noe gjenstår — flata skal aldri kunne stå uten et neste trykk.
export function createWeeklyTrainingPlan({
  week = 1,
  inboxRead = false,
  program = null,
  focusId = null,
  individualSummary = null,
  conditionSummary = null
} = {}) {
  const focus = getTrainingFocus(focusId);
  const coherence = evaluateProgramFocusCoherence(program, focusId);
  const intensity = calculateWeeklyTrainingIntensity({ program, focusId });
  const load = describeWeeklyLoad(intensity);

  const steps = [
    {
      id: "inbox",
      order: 1,
      title: "Les signalene",
      role: "Innboksen er ikke et treningsvalg — den er det du leser før du velger.",
      done: Boolean(inboxRead),
      status: inboxRead ? "Lest" : "Ulest",
      detail: inboxRead
        ? "Assistent, fysio og garderobe har sagt sitt."
        : "Assistent, fysio, garderobe, styre og presse har signaler du bør ha lest først.",
      target: "inbox",
      modal: null
    },
    {
      id: "program",
      order: 2,
      title: "Velg ukas ramme",
      role: "Programmet er hva laget bruker uka på. Det avgjør belastningen — hvor mye kroppene henter inn igjen.",
      done: Boolean(program),
      status: program ? program.title : "Ikke valgt",
      detail: program
        ? `${load.label.toLowerCase()} · ${load.note}`
        : "Fire økter som henger sammen. Rammen setter ukas arbeidsmengde.",
      target: "trening",
      modal: "modalTrainingProgram"
    },
    {
      id: "focus",
      order: 3,
      title: "Prioriter ett tema",
      role: "Fokuset er det ene du tar med inn i kampen. Det er dette som gir utslag på kampdag.",
      done: Boolean(focus),
      status: focus ? focus.name : "Ikke valgt",
      detail: focus ? focus.effectHint : "Ett av åtte taktiske temaer. Bør ligge inne i programmet du valgte.",
      target: "trening",
      modal: "modalTrainingFocusPick"
    },
    {
      id: "individual",
      order: 4,
      title: "Følg opp enkeltspillere",
      role: "Lagsøkta treffer alle likt. Her gjør du noe med én spiller av gangen.",
      done: num(individualSummary?.used) > 0,
      status: individualSummary?.headline || "Ingen oppfølging",
      detail: individualSummary?.detail || "Rollefortrolighet, restitusjon, skarphet eller opptrening.",
      target: "trening",
      modal: "modalIndividualTraining"
    }
  ];

  const nextStep = steps.find((step) => !step.done) || null;
  // Kamp krever ramme ELLER tema — men flata sier tydelig at begge hører sammen.
  const ready = Boolean(program || focus);

  const explanation = [];
  if (program) explanation.push(`Ramme: ${program.title}. ${load.label} (intensitet ${intensity}). ${load.note}`);
  if (focus) explanation.push(`Tema: ${focus.name}. ${focus.effectHint}`);
  explanation.push(coherence.note);
  if (individualSummary?.headline) explanation.push(individualSummary.headline);
  if (conditionSummary?.headline) explanation.push(conditionSummary.headline);

  const headline = !ready
    ? `Uke ${week}: ingen treningsuke valgt ennå.`
    : coherence.aligned === true
      ? `Uke ${week}: ${program.title} med ${focus.name.toLowerCase()} som tema — rammen og temaet trekker samme vei.`
      : coherence.aligned === false
        ? `Uke ${week}: ${program.title}, men temaet ligger utenfor programmet.`
        : `Uke ${week}: ${program?.title || focus?.name} valgt — ett steg gjenstår.`;

  return {
    version: TRAINING_PLAN_VERSION,
    week,
    steps,
    nextStepId: nextStep?.id || null,
    nextStepTitle: nextStep?.title || null,
    ready,
    coherence,
    intensity,
    load,
    headline,
    explanation
  };
}

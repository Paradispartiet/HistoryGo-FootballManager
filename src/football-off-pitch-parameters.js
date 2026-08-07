// HG Football Manager — Off-pitch Parameters v1
//
// Managerens skjulte og halvskjulte kontekstlag. Der fit-, lagfit- og
// treningsmotorene beskriver hva som taktisk er riktig, modellerer denne
// modulen MENNESKENE rundt taktikken: slitasje, skadefare, moral, selvtillit,
// autonomi, garderobestemning, medie-/styre-/familiepress, skjult mental
// belastning, rollefrustrasjon, kampviktighet og forventningspress.
//
// Designprinsipp (CLAUDE.md / README pkt. 5): forslagssystemene kjenner
// taktikken, men IKKE alt utenfor banen. Dette laget gir det faktiske
// grunnlaget en spiller kan lese bedre enn standardforslaget — og dermed slå
// et «taktisk riktig» valg ved å forstå konteksten. Derfor er det et bevisst
// skille mellom:
//   1) de FAKTISKE underliggende parametrene (full sannhet), og
//   2) de SYNLIGE/halvskjulte signalene en manager faktisk får se.
// Forslagssystemene får bare se det synlige laget (getVisibleOffPitchSignals /
// summarizeOffPitchContext), aldri hele hidden-blokken. Det allvitende systemet
// finnes ikke — det er hele poenget.
//
// Modulen er ren ESM: ingen DOM, ingen fetch, ingen localStorage, ingen
// app-state, ingen sideeffekter. Alle funksjoner er deterministiske: lik input
// gir byte-identisk output. Verdier normaliseres til 0–100 (heltall) der det
// gir mening, og clampes alltid.

const VERSION = "historygo-football-manager.off-pitch.v1";

// ----------------------------------------------------------------------------
// Standardverdier. En ny tropp er ikke perfekt og ikke i krise: moderat moral,
// lav (men ikke null) slitasje, moderat press. Alt skal kunne bevege seg begge
// veier fra her.
// ----------------------------------------------------------------------------
const DEFAULTS = Object.freeze({
  team: Object.freeze({
    fatigue: 22,
    wear: 18,
    injuryRisk: 15,
    morale: 58,
    confidence: 55,
    cohesion: 52,
    autonomy: 50,
    pressure: 35,
    mediaPressure: 30,
    boardPressure: 35,
    expectationPressure: 40
  }),
  squad: Object.freeze({
    roleFrustration: 20,
    selectionTrust: 55,
    tacticalClarity: 50,
    trainingHappiness: 55,
    hiddenStress: 22
  }),
  manager: Object.freeze({
    credibility: 50,
    authority: 50,
    riskTolerance: 50,
    recentDecisionQuality: 50
  }),
  hidden: Object.freeze({
    privatePressure: 20,
    dressingRoomConcern: 18,
    mentalLoad: 25
  })
});

// Hvilken seksjon hver parameter hører hjemme i. Brukes av applyOffPitchEvent og
// de øvrige effekt-funksjonene til å plassere et delta riktig sted.
const PARAM_SECTION = (() => {
  const map = {};
  for (const section of ["team", "squad", "manager", "hidden"]) {
    for (const key of Object.keys(DEFAULTS[section])) {
      map[key] = section;
    }
  }
  return Object.freeze(map);
})();

const HISTORY_LIMIT = 12; // hvor mange nylige signaler/hendelser/program vi tar vare på.

// ----------------------------------------------------------------------------
// Hjelpere
// ----------------------------------------------------------------------------
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampScore(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Les en 0–100-verdi som kan komme inn som 0–1 (andel) eller 0–100. En verdi
// <= 1 tolkes som andel og skaleres opp (×100), ellers brukes den som den er.
// Returnerer null når verdien mangler/er ugyldig, slik at kallere kan skille
// «ukjent» fra 0.
function read01to100(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return clampScore(n <= 1 ? n * 100 : n);
}

function read100(value) {
  const n = Number(value);
  return Number.isFinite(n) ? clampScore(n) : null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

// Normaliser én seksjon mot defaults: alle felt clampes, manglende felt fylles.
function normalizeSection(section, input) {
  const out = {};
  const defaults = DEFAULTS[section];
  const src = isObject(input) ? input : {};
  for (const key of Object.keys(defaults)) {
    out[key] = clampScore(src[key], defaults[key]);
  }
  return out;
}

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

// En fersk, gyldig standard-off-pitch-state. Deep clone av defaults.
export function createDefaultOffPitchState() {
  return {
    version: VERSION,
    team: { ...DEFAULTS.team },
    squad: { ...DEFAULTS.squad },
    manager: { ...DEFAULTS.manager },
    recentSignals: [],
    recentEvents: [],
    recentTrainingProgramIds: [],
    hidden: { ...DEFAULTS.hidden }
  };
}

// Normaliser en (muligens tom/ufullstendig/korrupt) state til full v1-form.
// Tåler null/undefined/feil typer. Alle verdier clampes 0–100. Historikk-lister
// kappes til de nyeste HISTORY_LIMIT. Deterministisk: ingen tidsstempler legges
// til her.
export function normalizeOffPitchState(state) {
  const src = isObject(state) ? state : {};
  return {
    version: VERSION,
    team: normalizeSection("team", src.team),
    squad: normalizeSection("squad", src.squad),
    manager: normalizeSection("manager", src.manager),
    recentSignals: asArray(src.recentSignals).slice(-HISTORY_LIMIT).map(normalizeSignalEntry),
    recentEvents: asArray(src.recentEvents).slice(-HISTORY_LIMIT).map(normalizeEventEntry),
    recentTrainingProgramIds: asArray(src.recentTrainingProgramIds).filter(isNonEmptyString).slice(-HISTORY_LIMIT),
    hidden: normalizeSection("hidden", src.hidden)
  };
}

function normalizeSignalEntry(entry) {
  if (isNonEmptyString(entry)) return { id: "", category: "", severity: "info", text: entry };
  const e = isObject(entry) ? entry : {};
  return {
    id: isNonEmptyString(e.id) ? e.id : "",
    category: isNonEmptyString(e.category) ? e.category : "",
    severity: isNonEmptyString(e.severity) ? e.severity : "info",
    text: isNonEmptyString(e.text) ? e.text : ""
  };
}

function normalizeEventEntry(entry) {
  const e = isObject(entry) ? entry : {};
  return {
    id: isNonEmptyString(e.id) ? e.id : "",
    type: isNonEmptyString(e.type) ? e.type : "",
    title: isNonEmptyString(e.title) ? e.title : ""
  };
}

// ----------------------------------------------------------------------------
// Effekt-motor: alle muterende funksjoner går via dette og returnerer en NY
// normalisert state (ingen input muteres).
// ----------------------------------------------------------------------------

// Anvend et sett {param: delta} på en state. Ukjente parametre ignoreres trygt.
// Returnerer en helt ny, normalisert state.
function applyDeltas(state, deltas) {
  const next = normalizeOffPitchState(state);
  if (!isObject(deltas)) return next;
  for (const [param, delta] of Object.entries(deltas)) {
    const section = PARAM_SECTION[param];
    const d = Number(delta);
    if (!section || !Number.isFinite(d) || d === 0) continue;
    next[section][param] = clampScore(next[section][param] + d);
  }
  return next;
}

function pushSignal(state, signal) {
  state.recentSignals = [...state.recentSignals, normalizeSignalEntry(signal)].slice(-HISTORY_LIMIT);
}

function pushEvent(state, event) {
  state.recentEvents = [...state.recentEvents, normalizeEventEntry(event)].slice(-HISTORY_LIMIT);
}

function pushProgramId(state, programId) {
  if (!isNonEmptyString(programId)) return;
  state.recentTrainingProgramIds = [...state.recentTrainingProgramIds, programId].slice(-HISTORY_LIMIT);
}

// Hendelse → ny state. Brukbar av framtidige innboks-/styre-/media-/garderobe-
// hendelser. Event-formen er stabil:
//   { id, type: "media"|"board"|"squad"|"training"|"matchday"|"private",
//     title, description, effects: { <param>: delta, ... } }
// applyOffPitchEvent: clamper alt, legger event i recentEvents, lager et
// relevant recentSignal og er deterministisk.
export function applyOffPitchEvent(state, event) {
  const e = isObject(event) ? event : {};
  const next = applyDeltas(state, e.effects);
  pushEvent(next, e);
  pushSignal(next, {
    id: isNonEmptyString(e.id) ? `event:${e.id}` : "event",
    category: isNonEmptyString(e.type) ? e.type : "event",
    severity: "info",
    text: isNonEmptyString(e.title) ? e.title : "En hendelse påvirket gruppa."
  });
  return next;
}

// ----------------------------------------------------------------------------
// Treningsprogram → off-pitch-effekter.
//
// Et treningsprogram (komposisjon fra football-training-program-compositions.js,
// eller bare { id, category, sessions }) endrer kropp og hode:
//   - restitusjon/skadeforebygging senker fatigue/wear/injuryRisk
//   - pressuke/høy intensitet øker fatigue/wear/injuryRisk
//   - formasjonstilvenning øker taktisk klarhet og samhold
//   - ensidig hard belastning øker skjult belastning litt
// Belastningen skaleres etter øktenes fatigueLoad/injuryRiskModifier når de
// finnes, slik at programmer med tyngre uker slår hardere ut.
// ----------------------------------------------------------------------------
const PROGRAM_CATEGORY_EFFECTS = {
  recovery: { fatigue: -16, wear: -14, injuryRisk: -12, trainingHappiness: 4, hiddenStress: -4, morale: 2 },
  pressing: { fatigue: 14, wear: 12, injuryRisk: 9, cohesion: 3, tacticalClarity: 3 },
  shape: { tacticalClarity: 9, cohesion: 5, fatigue: 4 },
  defensive: { tacticalClarity: 5, cohesion: 4, fatigue: 7, wear: 4 },
  attacking: { confidence: 4, fatigue: 8, wear: 5, tacticalClarity: 2 },
  build_up: { tacticalClarity: 5, fatigue: 7, wear: 4 },
  balanced: { tacticalClarity: 3, trainingHappiness: 3, fatigue: 4, cohesion: 2 }
};

function programLoadFactor(program) {
  const sessions = asArray(program?.sessions);
  if (sessions.length === 0) return 1;
  const totalLoad = sessions.reduce((sum, s) => sum + (Number(s?.fatigueLoad) || 0), 0);
  const avg = totalLoad / sessions.length;
  // Avg fatigueLoad ligger ca. 1–6 per økt; normaliser rundt 3 (moderat uke).
  return Math.max(0.5, Math.min(1.6, round1(avg / 3)));
}

export function applyTrainingProgramOffPitchEffects(state, trainingProgram, { facilityEffects = {} } = {}) {
  const program = isObject(trainingProgram) ? trainingProgram : {};
  const category = isNonEmptyString(program.category) ? program.category : "balanced";
  const base = PROGRAM_CATEGORY_EFFECTS[category] || PROGRAM_CATEGORY_EFFECTS.balanced;
  const factor = programLoadFactor(program);

  // Belastnings-/fysiske parametre skaleres med uka; mentale/taktiske er faste.
  const scaled = {};
  for (const [param, delta] of Object.entries(base)) {
    const isPhysical = param === "fatigue" || param === "wear" || param === "injuryRisk";
    scaled[param] = Math.round(isPhysical ? delta * factor : delta);
  }

  // Fasiliteter modifiserer den eksisterende treningseffekten; de oppretter
  // ingen parallelle fatigue-, skade- eller taktikkverdier.
  const trainingRelief = Math.max(0, Math.min(2, Number(facilityEffects?.trainingLoadReduction) || 0));
  const medicalProtection = Math.max(0, Math.min(2, Number(facilityEffects?.medicalTrainingProtection) || 0));
  const clarityBonus = Math.max(0, Math.min(2, Number(facilityEffects?.analysisClarityBonus) || 0));
  const happinessBonus = Math.max(0, Math.min(2, Number(facilityEffects?.trainingHappinessBonus) || 0));
  if ((scaled.fatigue || 0) > 0) scaled.fatigue = Math.max(0, scaled.fatigue - trainingRelief);
  if ((scaled.wear || 0) > 0) scaled.wear = Math.max(0, scaled.wear - trainingRelief - medicalProtection);
  if ((scaled.injuryRisk || 0) > 0) scaled.injuryRisk = Math.max(0, scaled.injuryRisk - medicalProtection);
  scaled.tacticalClarity = Math.round((scaled.tacticalClarity || 0) + clarityBonus);
  scaled.trainingHappiness = Math.round((scaled.trainingHappiness || 0) + happinessBonus);

  const next = applyDeltas(state, scaled);
  pushProgramId(next, program.id);
  pushSignal(next, {
    id: isNonEmptyString(program.id) ? `training:${program.id}` : "training",
    category: "training",
    severity: category === "recovery" ? "good" : "info",
    text: isNonEmptyString(program.title)
      ? `Treningsuke gjennomført: ${program.title}.`
      : "En treningsuke ble gjennomført."
  });
  return next;
}

// ----------------------------------------------------------------------------
// Kampdag → off-pitch-effekter.
//
// En kamp tar på kroppen uansett, og resultatet farger hodet:
//   - seier løfter moral/selvtillit/samhold og letter styre-/mediepress
//   - tap senker moral/selvtillit og øker press og skjult uro
//   - selvtillit kan stige selv ved lav moral hvis laget spilte bedre enn
//     forventet (sterk motstander / undervurdert lag)
//   - viktige kamper øker forventnings-/mediepress
// matchdayResult leses fleksibelt: { outcome|result, goalsFor, goalsAgainst,
// opponentStrength, teamStrength, importance }.
// ----------------------------------------------------------------------------
function readOutcome(result) {
  const r = isObject(result) ? result : {};
  const direct = isNonEmptyString(r.outcome) ? r.outcome : isNonEmptyString(r.result) ? r.result : null;
  if (direct === "win" || direct === "loss" || direct === "draw") return direct;
  const gf = Number(r.goalsFor ?? r.score?.for);
  const ga = Number(r.goalsAgainst ?? r.score?.against);
  if (Number.isFinite(gf) && Number.isFinite(ga)) {
    if (gf > ga) return "win";
    if (gf < ga) return "loss";
    return "draw";
  }
  return "draw";
}

const MATCH_OUTCOME_EFFECTS = {
  win: { morale: 8, confidence: 7, cohesion: 4, boardPressure: -5, mediaPressure: -3, selectionTrust: 3, hiddenStress: -3 },
  draw: { morale: 1, confidence: 0, cohesion: 1, boardPressure: 1 },
  loss: { morale: -8, confidence: -6, cohesion: -3, boardPressure: 6, mediaPressure: 5, hiddenStress: 4, roleFrustration: 3 }
};

export function applyMatchdayOffPitchEffects(state, matchdayResult) {
  const result = isObject(matchdayResult) ? matchdayResult : {};
  const outcome = readOutcome(result);
  const effects = { ...(MATCH_OUTCOME_EFFECTS[outcome] || MATCH_OUTCOME_EFFECTS.draw) };

  // Å spille koster fysisk uansett resultat.
  effects.fatigue = (effects.fatigue || 0) + 10;
  effects.wear = (effects.wear || 0) + 8;
  effects.injuryRisk = (effects.injuryRisk || 0) + 5;

  // Bedre enn forventet → selvtillit løftes ekstra, selv om moralen er lav.
  // «Forventet» utledes av styrkeforskjell når den finnes.
  const oppStrength = Number(result.opponentStrength ?? result.opponent?.strength);
  const teamStrength = Number(result.teamStrength);
  if (Number.isFinite(oppStrength) && Number.isFinite(teamStrength)) {
    const underdog = oppStrength - teamStrength; // positiv = vi var svakest på papiret
    if (outcome !== "loss" && underdog >= 6) {
      effects.confidence = (effects.confidence || 0) + 6;
    }
  }

  // Kampviktighet skrur opp forventnings-/mediepress.
  const importance = read01to100(result.importance);
  if (importance !== null && importance >= 60) {
    const extra = Math.round((importance - 60) / 40 * 6);
    effects.expectationPressure = (effects.expectationPressure || 0) + extra;
    effects.mediaPressure = (effects.mediaPressure || 0) + extra;
  }

  const next = applyDeltas(state, effects);
  pushEvent(next, { id: `match:${outcome}`, type: "matchday", title: `Kampresultat: ${outcome}` });
  pushSignal(next, {
    id: `matchday:${outcome}`,
    category: "matchday",
    severity: outcome === "win" ? "good" : outcome === "loss" ? "alert" : "info",
    text:
      outcome === "win"
        ? "Seieren løftet stemningen i gruppa."
        : outcome === "loss"
        ? "Tapet la en demper på stemningen."
        : "Uavgjort holdt stemningen omtrent som før."
  });
  return next;
}

// ----------------------------------------------------------------------------
// Synlige / halvskjulte signaler.
//
// Den SYNLIGE leseren oversetter de faktiske parametrene til lesbare manager-
// signaler — én per kjernekategori (fysisk, skadefare, psykisk/mental,
// garderobe, press, styre/media, taktisk klarhet). Skjult mental belastning
// (hiddenStress) vises bare som en vag uro, aldri som et tall: forslagssystemet
// skal ikke vite alt.
// ----------------------------------------------------------------------------
const SIGNAL_CATEGORIES = [
  "physical",
  "injury",
  "mental",
  "dressingRoom",
  "pressure",
  "boardMedia",
  "tacticalClarity"
];

function signalPhysical(team) {
  const load = Math.max(team.fatigue, team.wear);
  if (load >= 70) return { severity: "alert", text: "Laget virker tungt etter høy belastning." };
  if (load >= 52) return { severity: "watch", text: "Flere spillere ser slitne ut på trening." };
  if (load <= 26) return { severity: "good", text: "Laget virker fysisk friskt og opplagt." };
  return { severity: "info", text: "Belastningen virker håndterbar." };
}

function signalInjury(team) {
  const r = team.injuryRisk;
  if (r >= 65) return { severity: "alert", text: "Skadefaren virker forhøyet. En hard uke kan bli dyr." };
  if (r >= 45) return { severity: "watch", text: "Noen kropper er i faresonen for belastningsskader." };
  if (r <= 20) return { severity: "good", text: "Skadebildet ser rolig ut." };
  return { severity: "info", text: "Skaderisikoen virker normal." };
}

function signalMental(team, squad) {
  // Skjult uro først: synlig, men bevisst vag — årsaken er ikke tydelig.
  if (squad.hiddenStress >= 60) {
    return { severity: "watch", text: "Noe virker urolig i gruppa, men årsaken er ikke tydelig." };
  }
  if (team.morale <= 35) return { severity: "alert", text: "Stemningen virker flat etter de siste ukene." };
  if (team.confidence <= 38) return { severity: "watch", text: "Selvtilliten i laget virker skjør." };
  if (team.morale >= 68 && team.confidence >= 62) {
    return { severity: "good", text: "Laget virker oppstemt og trygt på seg selv." };
  }
  return { severity: "info", text: "Det mentale virker stabilt." };
}

function signalDressingRoom(team, squad) {
  if (squad.roleFrustration >= 60) {
    return { severity: "alert", text: "Det murrer om roller og spilletid i garderoben." };
  }
  if (team.cohesion <= 38) return { severity: "watch", text: "Garderoben virker splittet for tiden." };
  if (squad.selectionTrust <= 38) {
    return { severity: "watch", text: "Noen stiller spørsmål ved laguttaket." };
  }
  if (team.cohesion >= 64) return { severity: "good", text: "Garderoben virker samlet." };
  return { severity: "info", text: "Garderoben virker rolig." };
}

function signalPressure(team) {
  const p = Math.max(team.pressure, team.expectationPressure);
  if (p >= 70) return { severity: "alert", text: "Forventningspresset rundt laget er høyt." };
  if (p >= 52) return { severity: "watch", text: "Presset utenfra øker." };
  if (p <= 28) return { severity: "good", text: "Det er lite ytre press akkurat nå." };
  return { severity: "info", text: "Presset virker moderat." };
}

function signalBoardMedia(team) {
  if (team.boardPressure >= 68) {
    return { severity: "alert", text: "Styret forventer synlig sportslig retning." };
  }
  if (team.mediaPressure >= 64) {
    return { severity: "watch", text: "Mediene følger laget tett om dagen." };
  }
  if (team.boardPressure <= 28 && team.mediaPressure <= 28) {
    return { severity: "good", text: "Styre og medier gir laget arbeidsro." };
  }
  return { severity: "info", text: "Styre og medier virker tålmodige." };
}

function signalTacticalClarity(squad, recentProgramIds) {
  const tc = squad.tacticalClarity;
  const rising = recentProgramIds.slice(-2).includes("formation_familiarisation") && tc >= 45;
  if (rising) return { severity: "good", text: "Taktisk klarhet er stigende etter formasjonstilvenning." };
  if (tc <= 38) return { severity: "watch", text: "Taktisk klarhet er lav — systemet sitter ikke ennå." };
  if (tc >= 66) return { severity: "good", text: "Laget virker trygt på det taktiske opplegget." };
  return { severity: "info", text: "Den taktiske forståelsen virker grei." };
}

const CATEGORY_LABELS = {
  physical: "Fysisk",
  injury: "Skadefare",
  mental: "Psykisk",
  dressingRoom: "Garderobe",
  pressure: "Press",
  boardMedia: "Styre/media",
  tacticalClarity: "Taktisk klarhet"
};

// Synlige signaler: ett kort per kjernekategori, i fast rekkefølge (determinisme).
// Dette er alt forslagssystemene får se — ingen rå hidden-tall lekkes.
export function getVisibleOffPitchSignals(state) {
  const s = normalizeOffPitchState(state);
  const builders = {
    physical: () => signalPhysical(s.team),
    injury: () => signalInjury(s.team),
    mental: () => signalMental(s.team, s.squad),
    dressingRoom: () => signalDressingRoom(s.team, s.squad),
    pressure: () => signalPressure(s.team),
    boardMedia: () => signalBoardMedia(s.team),
    tacticalClarity: () => signalTacticalClarity(s.squad, s.recentTrainingProgramIds)
  };
  return SIGNAL_CATEGORIES.map((category) => {
    const { severity, text } = builders[category]();
    return { id: category, category, label: CATEGORY_LABELS[category], severity, text };
  });
}

// ----------------------------------------------------------------------------
// Skjulte modifikatorer.
//
// Den faktiske, usynlige belastningen som drar prestasjonen forbi det forslags-
// systemet kan se. Disse er ment for kampmotor/managerpoeng, IKKE for å vises
// rått i UI eller mates inn i forslagssystemet. Verdier 0–~100, små.
// ----------------------------------------------------------------------------
export function getHiddenOffPitchModifiers(state) {
  const s = normalizeOffPitchState(state);
  const { hidden, squad } = s;

  const mentalLoad = Math.round((hidden.mentalLoad + squad.hiddenStress) / 2);
  const performanceDrag = Math.round(
    (squad.hiddenStress * 0.4 + hidden.privatePressure * 0.3 + hidden.mentalLoad * 0.3) / 5
  ); // ~0–20
  const cohesionRisk = Math.round((hidden.dressingRoomConcern + squad.roleFrustration) / 2);
  const focusRisk = Math.round((hidden.mentalLoad + hidden.privatePressure) / 2);

  return {
    performanceDrag,
    mentalLoad,
    cohesionRisk,
    focusRisk,
    privatePressure: hidden.privatePressure,
    dressingRoomConcern: hidden.dressingRoomConcern,
    total: clampScore(performanceDrag + cohesionRisk * 0.2 + focusRisk * 0.2)
  };
}

// ----------------------------------------------------------------------------
// Sammendrag — den halvskjulte pakken forslagssystemene kan lese.
//
// Eksponerer de synlige signalene + en VAG hint om skjult uro, men aldri de
// eksakte hidden-tallene. summarizeOffPitchContext er det forslagssystemene
// (suggested setups) bør bruke.
// ----------------------------------------------------------------------------
const SEVERITY_RANK = { alert: 3, watch: 2, info: 1, good: 0 };

export function summarizeOffPitchContext(state) {
  const s = normalizeOffPitchState(state);
  const visible = getVisibleOffPitchSignals(s);
  const byCategory = {};
  for (const sig of visible) byCategory[sig.category] = sig.severity;

  const concerns = visible
    .filter((sig) => sig.severity === "alert" || sig.severity === "watch")
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const positives = visible.filter((sig) => sig.severity === "good");

  let headline;
  let tone;
  if (concerns.length > 0) {
    headline = concerns[0].text;
    tone = concerns[0].severity === "alert" ? "tense" : "watchful";
  } else if (positives.length >= 4) {
    headline = "Rammen rundt laget virker rolig og samlet.";
    tone = "calm";
  } else {
    headline = "Konteksten rundt laget virker stabil.";
    tone = "steady";
  }

  // Vag hint om skjult mental belastning — synlig at noe er der, ikke hva.
  const hiddenHint =
    s.squad.hiddenStress >= 55
      ? "Det ligger en uro under overflaten som tallene ikke fullt ut forklarer."
      : null;

  return {
    headline,
    tone,
    visible,
    byCategory,
    topConcerns: concerns.map((sig) => sig.text),
    positives: positives.map((sig) => sig.text),
    hiddenHint
  };
}

// ----------------------------------------------------------------------------
// deriveOffPitchSignals — bekvemmelighetsinngang for konsumenter.
//
// Tar en kontekst som kan inneholde en eksisterende offPitchState OG/ELLER rå
// situasjonssignaler (fatigueRisk/wearRisk/injuryRisk som 0–1 eller 0–100), og
// returnerer en samlet, lesbar pakke: { state, visible, hidden, summary }.
// Når ingen state finnes brukes default + de rå hintene, slik at appen kan vise
// noe fornuftig før et persistent kontekstlag er fullt bygget ut.
// ----------------------------------------------------------------------------
export function deriveOffPitchSignals(context) {
  const ctx = isObject(context) ? context : {};
  let state = normalizeOffPitchState(ctx.offPitchState);

  // Fold inn rå hint additivt (overstyrer der de finnes — de er ferskere signal).
  const overrides = {};
  const fatigue = read01to100(ctx.fatigueRisk);
  const wear = read01to100(ctx.wearRisk);
  const injury = read01to100(ctx.injuryRisk);
  if (fatigue !== null) overrides.fatigue = fatigue;
  if (wear !== null) overrides.wear = wear;
  if (injury !== null) overrides.injuryRisk = injury;
  if (Object.keys(overrides).length > 0) {
    state = normalizeOffPitchState({ ...state, team: { ...state.team, ...overrides } });
  }

  return {
    state,
    visible: getVisibleOffPitchSignals(state),
    hidden: getHiddenOffPitchModifiers(state),
    summary: summarizeOffPitchContext(state)
  };
}

// ----------------------------------------------------------------------------
// Off-pitch-fit for et treningsprogram.
//
// En DETERMINISTISK off-pitch-justering (signert) for et program gitt staten.
// Dette er managerforståelsen forslagssystemet ikke fullt ut har: recovery er
// mer verdt når kroppene er tunge, pressuke farligere ved høy fatigue,
// formasjonstilvenning mer verdt ved lav taktisk klarhet osv. Returnerer
// { score, explanation, signals } slik at både UI og test kan lese begrunnelsen.
// ----------------------------------------------------------------------------
export function scoreOffPitchFitForTrainingProgram(program, state) {
  const s = normalizeOffPitchState(state);
  const id = isNonEmptyString(program?.id) ? program.id : "";
  const category = isNonEmptyString(program?.category) ? program.category : "";
  const explanation = [];
  const signals = [];
  let score = 0;

  const load = Math.max(s.team.fatigue, s.team.wear);
  const isRecovery = id === "recovery_prevention" || category === "recovery";
  const isPress = id === "press_week" || category === "pressing";
  const isShape = id === "formation_familiarisation" || category === "shape";
  const isDefensive = id === "defensive_structure" || category === "defensive";
  const isBalanced = id === "balanced_learning" || category === "balanced";

  if (isRecovery) {
    if (load >= 50 || s.team.injuryRisk >= 45) {
      const v = Math.round((load - 30) * 0.4 + (s.team.injuryRisk - 30) * 0.3);
      score += Math.max(0, v);
      signals.push("physical", "injury");
      explanation.push(`Tunge kropper (belastning ${load}, skaderisiko ${s.team.injuryRisk}) gjør restitusjon mer verdt: +${Math.max(0, v)}.`);
    } else if (load <= 26 && s.team.injuryRisk <= 25) {
      score -= 8;
      explanation.push("Friske kropper: restitusjon nå koster utvikling (−8).");
    }
  }

  if (isPress) {
    if (load >= 55) {
      const v = Math.round((load - 45) * 0.5);
      score -= v;
      signals.push("physical");
      explanation.push(`Høy belastning (${load}) gjør pressuke risikabel: −${v}.`);
    } else if (load <= 30) {
      score += 6;
      explanation.push("Friske bein tåler et hardt press godt (+6).");
    }
  }

  if (isShape) {
    if (s.squad.tacticalClarity <= 50 || s.team.cohesion <= 50) {
      const v = Math.round((50 - Math.min(s.squad.tacticalClarity, s.team.cohesion)) * 0.4);
      score += Math.max(0, v);
      signals.push("tacticalClarity");
      explanation.push(`Lav taktisk klarhet/samhold gjør formasjonstilvenning mer verdt: +${Math.max(0, v)}.`);
    }
  }

  if (isDefensive) {
    const p = Math.max(s.team.pressure, s.team.boardPressure);
    if (p >= 60) {
      const v = Math.round((p - 60) * 0.3);
      score += v;
      signals.push("pressure");
      explanation.push(`Høyt press utenfra (${p}) gjør defensiv trygghet mer verdt: +${v}.`);
    }
  }

  if (isBalanced) {
    if (s.squad.hiddenStress >= 50 && s.team.pressure >= 30 && s.team.pressure <= 70) {
      score += 6;
      signals.push("mental");
      explanation.push("Uro i gruppa og moderat press: en trygg, balansert uke demper risiko (+6).");
    }
  }

  if (explanation.length === 0) {
    explanation.push("Off-pitch-konteksten peker verken klart for eller mot dette programmet.");
  }

  return { score, explanation, signals: [...new Set(signals)] };
}

// ----------------------------------------------------------------------------
// Debug-snapshot. Full, lesbar dump — INKLUDERT hidden-tall — kun for
// utvikling/test. Skal aldri mates inn i forslagssystemet.
// ----------------------------------------------------------------------------
export function createOffPitchDebugSnapshot(state) {
  const s = normalizeOffPitchState(state);
  return {
    version: s.version,
    state: s,
    visible: getVisibleOffPitchSignals(s),
    hidden: getHiddenOffPitchModifiers(s),
    summary: summarizeOffPitchContext(s)
  };
}

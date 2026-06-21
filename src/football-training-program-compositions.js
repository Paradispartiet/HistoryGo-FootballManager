// HG Football Manager — Training Program Compositions v1
//
// Et rent, data-/motorbasert lag oppå treningsuka. Der football-training-week.js
// modellerer ÉTT taktisk fokus per Club Week, bygger denne modulen ferdige
// UKENTLIGE TRENINGSPROGRAM — komposisjoner av flere økter — som spilleren kan
// velge mellom. Hvert program forklarer seg selv: taktisk mål, økter, risiko,
// kontekst og en deterministisk poeng-/uttellingslogikk.
//
// Designprinsipp (CLAUDE.md / README pkt. 4): dette er et LÆRINGSSPILL.
// Forslagene viser hva som faglig sett er fornuftige standardvalg, men de er
// ALDRI en fasit. Et bevisst kontekstuelt valg — der spilleren leser skjulte
// eller off-pitch-signaler bedre enn standardmotoren — skal kunne slå
// standardforslaget. Derfor belønnes RELEVANTE valg (riktig mengde, riktig
// tidspunkt), ikke universelt «beste» valg:
//   - Restitusjon/skadeforebygging gir god uttelling NÅR slitasje/fatigue/risiko
//     tilsier det, men svakere uttelling (overusePenalty) hvis den brukes uke
//     etter uke uten slitasjegrunnlag.
//   - Press-/intensitetsprogram straffes (riskAdjustment) ved høy fatigue.
//   - Defensiv struktur belønnes før en sterk/risky motstander.
//   - Avslutningsuke belønnes etter konkret sjansesløsing.
//   - Oppbygging belønnes mot høyt press.
//
// Modulen kjenner ikke DOM, localStorage, fetch eller app-state. app.js mater
// inn data (teamFit, motstander, formasjon, taktikk, formasjons-matchup,
// coachContext, slitasje-/skadesignaler, treningshistorikk) og får strukturerte
// programforslag tilbake. Den degraderer trygt: uten motstander, uten teamFit og
// uten coachContext produserer den fortsatt gyldige programmer fra trygge
// standardantakelser (balansert læringsuke er fallback).
//
// Den DUPLISERER ikke treningsuka: hvert program peker tilbake til ekte
// treningsfokus-id-er i football-training-week.js via relatedTrainingFocusIds.

import { TRAINING_FOCUSES, getTrainingFocus } from "./football-training-week.js";

// ----------------------------------------------------------------------------
// Hjelpere
// ----------------------------------------------------------------------------
const DEFAULT_LIMIT = 4; // 2–4 programmer; vi kapper på 4 og krever minst 2.

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function uniqueStrings(values) {
  return [...new Set(asArray(values).filter(isNonEmptyString))];
}

function normalizeLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return clamp(Math.trunc(n), 2, DEFAULT_LIMIT);
}

// Slitasje-/risikosignaler kan komme som 0–1 eller 0–100. Normaliser til 0–1 og
// fall trygt tilbake til 0 (ingen kjent risiko) når data mangler. Viktig: 0 gjør
// at restitusjon IKKE alltid blir riktig — den må fortjenes av faktisk slitasje.
function normalizeRisk(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const scaled = n > 1 ? n / 100 : n;
  return clamp(scaled, 0, 1);
}

// Off-pitch-kontekst (football-off-pitch-parameters.js) leses som ren data fra
// context.offPitchState eller context.offPitchSignals.state — ingen import, så
// ingen kobling/syklus. Returnerer normaliserte 0–1/0–100-verdier eller null
// (ukjent) per felt, slik at programmene kan skjerpe relevansen ved slitasje,
// lav taktisk klarhet eller høyt press uten å bli avhengige av off-pitch-laget.
function readOffPitchInput(context) {
  const state = context.offPitchState && typeof context.offPitchState === "object" ? context.offPitchState : null;
  const fromSignals =
    context.offPitchSignals && typeof context.offPitchSignals === "object" && context.offPitchSignals.state
      ? context.offPitchSignals.state
      : null;
  const src = state || fromSignals;
  if (!src || typeof src !== "object") return null;
  const team = src.team && typeof src.team === "object" ? src.team : {};
  const squad = src.squad && typeof src.squad === "object" ? src.squad : {};
  const to01 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return clamp(n > 1 ? n / 100 : n, 0, 1);
  };
  const to100 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? clamp(n, 0, 100) : null;
  };
  return {
    fatigue01: to01(team.fatigue),
    wear01: to01(team.wear),
    injury01: to01(team.injuryRisk),
    pressure: to100(team.pressure),
    cohesion: to100(team.cohesion),
    tacticalClarity: to100(squad.tacticalClarity),
    hiddenStress: to100(squad.hiddenStress)
  };
}

// Recent focus-/program-id-er fra treningshistorikken (for overuse-deteksjon).
// Godtar både en flat id-liste og en historikk av {focusId|programId|id}.
function readRecentTokens(context) {
  const direct = asArray(context.recentTrainingFocusIds).filter(isNonEmptyString);
  if (direct.length) return direct;
  return asArray(context.currentTrainingHistory)
    .map((entry) =>
      isNonEmptyString(entry)
        ? entry
        : entry?.focusId || entry?.programId || entry?.id || null
    )
    .filter(isNonEmptyString);
}

// Avslutningsproblem fra forrige kamp. Bruk detaljert data når den finnes, ellers
// fall tilbake til lastMatchWeaknessMetric / kamphendelser (README pkt. 4: bruk
// trygg fallback til detaljert missedChance-data finnes).
function readFinishingIssue(context) {
  if (context.lastMatchFinishingIssue) return true;

  const profile = context.missedChanceProfile;
  if (profile && typeof profile === "object") {
    const missed = Number(profile.missedBigChances ?? profile.missed ?? profile.count);
    if (Number.isFinite(missed) && missed > 0) return true;
    if (profile.hasFinishingIssue) return true;
  }

  // Bakrom/dybde er det nærmeste angreps-/avslutningsleddet i teamFit-metrikkene.
  if (context.lastMatchWeaknessMetric === "depthScore") return true;

  const finishingEvent = asArray(context.lastMatchEvents).some((event) =>
    /miss|chance|finish|shot|avslut|bom/i.test(String(event?.id || event?.type || ""))
  );
  return finishingEvent;
}

// ----------------------------------------------------------------------------
// Normalisert kontekst — ett trygt snapshot som både bygging og scoring leser.
// ----------------------------------------------------------------------------
function normalizeContext(context) {
  const ctx = context && typeof context === "object" ? context : {};
  const teamFit = ctx.teamFit && typeof ctx.teamFit === "object" ? ctx.teamFit : null;
  const metrics = teamFit?.metrics && typeof teamFit.metrics === "object" ? teamFit.metrics : {};
  const coachContext = ctx.coachContext && typeof ctx.coachContext === "object" ? ctx.coachContext : null;
  const offPitch = readOffPitchInput(ctx);

  // Slitasje-/skadesignaler: eksplisitt fatigueRisk/wearRisk/injuryRisk vinner
  // (ferskest signal), ellers fall tilbake til off-pitch-statens verdier, ellers
  // 0 (ingen kjent slitasje — restitusjon må fortjenes).
  const explicit = (raw, fallback01) => {
    const n = Number(raw);
    if (Number.isFinite(n)) return normalizeRisk(raw);
    return fallback01 ?? 0;
  };

  return {
    teamFit,
    metrics,
    opponent: ctx.opponent && typeof ctx.opponent === "object" ? ctx.opponent : null,
    formation: ctx.formation && typeof ctx.formation === "object" ? ctx.formation : null,
    tactic: ctx.tactic && typeof ctx.tactic === "object" ? ctx.tactic : null,
    formationMatchup: ctx.formationMatchup && typeof ctx.formationMatchup === "object" ? ctx.formationMatchup : null,
    coachContext,
    offPitch,
    lastMatchWeaknessMetric: isNonEmptyString(ctx.lastMatchWeaknessMetric) ? ctx.lastMatchWeaknessMetric : null,
    finishingIssue: readFinishingIssue(ctx),
    fatigue: explicit(ctx.fatigueRisk, offPitch?.fatigue01),
    wear: explicit(ctx.wearRisk, offPitch?.wear01),
    injury: explicit(ctx.injuryRisk, offPitch?.injury01),
    recentTokens: readRecentTokens(ctx)
  };
}

function metricValue(ctx, key) {
  const n = Number(ctx.metrics[key]);
  return Number.isFinite(n) ? n : null;
}

// Tokens fra formasjons-matchupens risiko (motstanderens stil systemet sliter mot).
function matchupRiskTokens(ctx) {
  return uniqueStrings(asArray(ctx.formationMatchup?.risks).map((r) => r?.token));
}

function opponentHasStyle(ctx, styles) {
  const tokens = uniqueStrings(ctx.opponent?.matchupStyles);
  return styles.some((style) => tokens.includes(style));
}

// Historical Opponent Archetypes v1: les ETT 0–100-trekk fra en historisk stil-
// profils styleTraits. Null for generiske motstandere (uten styleTraits), slik at
// disse bonusene KUN gjelder historiske arketyper (trygg, additiv degradering).
function opponentStyleTrait(ctx, key) {
  const traits = ctx.opponent?.styleTraits;
  if (!traits || typeof traits !== "object") return null;
  const n = Number(traits[key]);
  return Number.isFinite(n) ? clamp(n, 0, 100) : null;
}

// Hvor mange ganger dette programmets signatur-tokens dukker opp i nylig historikk.
function countOveruse(ctx, tokens) {
  const set = new Set(tokens);
  return ctx.recentTokens.filter((token) => set.has(token)).length;
}

// ----------------------------------------------------------------------------
// Programmaler. Statiske, fotballfaglige deler (tittel, økter, faste vilkår).
// Den dynamiske uttellingen ligger i scorerne lenger ned.
//
// Hver session.focusId er en finkornet økt-id. Programmets relatedTrainingFocusIds
// peker derimot på EKTE treningsfokus-id-er i football-training-week.js, slik at
// programmene kobles til den eksisterende treningsuka i stedet for å duplisere den.
// ----------------------------------------------------------------------------
function session(day, title, focusId, intensity, duration, tacticalObjective, expectedEffect, fatigueLoad, injuryRiskModifier) {
  return {
    day,
    title,
    focusId,
    intensity,
    duration,
    tacticalObjective,
    expectedEffect: uniqueStrings(expectedEffect),
    fatigueLoad,
    injuryRiskModifier
  };
}

const PROGRAM_TEMPLATES = [
  {
    id: "recovery_prevention",
    title: "Restitusjon og skadeforebygging",
    category: "recovery",
    summary: "Lav belastning, mobilitet og skadeforebygging for å hente inn slitasje.",
    weekGoal: "Senke fatigue og skaderisiko uten å tape for mye kampform.",
    recommendedBecause: [
      "Hviler kropper og reduserer skaderisiko etter tett kampprogram.",
      "Holder rolleforståelsen ved like med lett, mental økt framfor fysisk topp."
    ],
    conditions: [
      "Relevant når troppen viser tegn til slitasje (fatigue/wear) eller forhøyet skaderisiko.",
      "Mindre relevant – og straffes – hvis den brukes uke etter uke uten slitasjegrunnlag."
    ],
    targetMetrics: ["roleFitAverage"],
    relatedTrainingFocusIds: ["role_understanding"],
    overuseTokens: ["recovery_prevention", "recovery", "injury_prevention", "rest_week"],
    risks: [
      "For mye restitusjon over tid tærer på intensitet, utvikling og kampform.",
      "Gir lite taktisk læring – bruk den når kroppen krever det, ikke som vane."
    ],
    suggestedAdjustments: [
      "Bytt til et taktisk program så snart slitasjen er nede.",
      "Leser du troppen som friskere enn motoren tror, kan et hardere valg gi bedre uttelling."
    ],
    sessions: [
      session("Mandag", "Restitusjonsøkt", "recovery", "low", "short",
        "Aktiv restitusjon og lav puls.", ["Senker akkumulert tretthet"], 1, -3),
      session("Onsdag", "Mobilitet og bevegelighet", "mobility", "low", "normal",
        "Bevegelighet og skadeforebyggende mønstre.", ["Bedre bevegelighet", "Lavere skaderisiko"], 2, -3),
      session("Torsdag", "Skadeforebygging", "injury_prevention", "low", "normal",
        "Styrke- og stabilitetsarbeid for utsatte ledd.", ["Reduserer skaderisiko"], 2, -4),
      session("Fredag", "Lett rolleforståelse", "role_understanding", "low", "short",
        "Mental gjennomgang av roller uten fysisk belastning.", ["Holder rolleforståelsen ved like"], 1, -1)
    ]
  },
  {
    id: "defensive_structure",
    title: "Defensiv struktur",
    category: "defensive",
    summary: "Kompakt lag, restforsvar og kontrollerte overganger før en sterk motstander.",
    weekGoal: "Gjøre laget vanskelig å spille gjennom og trygt ved balltap.",
    recommendedBecause: [
      "Bygger kompakthet og restforsvar før et klart sterkere eller farligere lag.",
      "Reduserer rommene en god motstander lever av i overgang."
    ],
    conditions: [
      "Relevant når neste motstander er klart sterkere eller matchupen er risikabel.",
      "Mindre relevant mot en svak motstander der initiativ gir mer."
    ],
    targetMetrics: ["restDefenseScore", "balanceScore"],
    relatedTrainingFocusIds: ["rest_defence"],
    overuseTokens: ["defensive_structure", "rest_defence", "defensive_organisation"],
    risks: [
      "For defensiv innstilling kan invitere motstanderen og svekke eget angrep.",
      "Struktur uten ballmot gir få egne sjanser."
    ],
    suggestedAdjustments: [
      "Behold én utløser for kontring så laget ikke blir rent reaktivt.",
      "Tror du laget kan ta initiativet mot denne motstanderen, kan et offensivt valg slå dette."
    ],
    sessions: [
      session("Mandag", "Defensiv organisering", "defensive_organisation", "medium", "normal",
        "Avstander, soner og markeringsansvar i blokken.", ["Tettere defensiv blokk"], 4, 0),
      session("Onsdag", "Restforsvar", "rest_defence", "medium", "normal",
        "Sikring bak ballen ved eget angrep.", ["Tryggere ved balltap", "Færre kontringer mot"], 4, 1),
      session("Torsdag", "Overgangskontroll", "transition_control", "medium", "normal",
        "Kontrollerte overganger og gjenvinning i riktig sone.", ["Bedre kontroll i overgang"], 4, 1),
      session("Fredag", "Kompakt lavblokk", "low_block_shape", "medium", "short",
        "Holde formen lav og kompakt under press.", ["Vanskeligere å spille gjennom"], 3, 0)
    ]
  },
  {
    id: "finishing_week",
    title: "Avslutningsuke",
    category: "attacking",
    summary: "Avslutninger, boksbevegelse og valg i siste tredjedel etter sjansesløsing.",
    weekGoal: "Gjøre om flere av sjansene laget allerede skaper.",
    recommendedBecause: [
      "Repeterer avslutninger og beslutninger etter en kamp med bortkastede sjanser.",
      "Kobler trening til konkrete bommer – uttelling kommer når sjansene settes neste gang."
    ],
    conditions: [
      "Relevant når forrige kamp viste avslutningsproblem eller bortkastede storsjanser.",
      "Mindre relevant hvis laget allerede er klinisk foran mål."
    ],
    targetMetrics: ["depthScore"],
    relatedTrainingFocusIds: ["depth_runs"],
    overuseTokens: ["finishing_week", "finishing"],
    risks: [
      "Mye angrepsfokus kan gå på bekostning av defensiv balanse.",
      "Avslutningsform er ferskvare – effekten kan svinge fra kamp til kamp."
    ],
    suggestedAdjustments: [
      "Tren den avslutningstypen spissene faktisk bommet på sist.",
      "Vet du at sjansesløsingen var tilfeldig variasjon, kan et annet fokus gi mer."
    ],
    sessions: [
      session("Mandag", "Avslutningstrening", "finishing", "medium", "normal",
        "Avslutninger fra de sonene laget skaper sjanser i.", ["Bedre avslutningskvalitet"], 4, 1),
      session("Onsdag", "Boksbevegelse", "box_movement", "medium", "normal",
        "Timing og løp inn i boksen.", ["Flere spillere i farlige soner"], 4, 1),
      session("Torsdag", "Valg i siste tredjedel", "decision_making", "medium", "normal",
        "Riktig valg i avgjørende øyeblikk.", ["Bedre beslutninger foran mål"], 3, 0),
      session("Fredag", "Sjanserepetisjon", "chance_repetition", "medium", "short",
        "Repetere kampens faktiske sjansetyper.", ["Mer automatiserte avslutninger"], 3, 1)
    ]
  },
  {
    id: "buildup_vs_press",
    title: "Oppbygging mot høyt press",
    category: "build_up",
    summary: "Trygg oppbygging, pressmotstand og tredjemannsløp mot et høyt pressende lag.",
    weekGoal: "Spille seg trygt og raskt forbi første pressledd.",
    recommendedBecause: [
      "Forbereder oppbygging mot et lag som jager ballen høyt.",
      "Adresserer en matchup eller lagmetrikk der oppbyggingen er sårbar."
    ],
    conditions: [
      "Relevant mot et høyt pressende lag eller når matchupen er risikabel i oppbygging.",
      "Mindre relevant mot en lav blokk som ikke presser."
    ],
    targetMetrics: ["buildUpScore", "roleFitAverage"],
    relatedTrainingFocusIds: ["build_up"],
    overuseTokens: ["buildup_vs_press", "build_up"],
    risks: [
      "Å spille ut bakfra mot høyt press har innebygd risiko ved feil.",
      "Krever presise valg under tidspress – effekten avhenger av utførelse."
    ],
    suggestedAdjustments: [
      "Ha et direkte alternativ klart når presset blir for hardt.",
      "Leser du at motstanderen ikke presser så høyt likevel, kan et annet valg gi mer."
    ],
    sessions: [
      session("Mandag", "Oppbygging under press", "build_up", "medium", "normal",
        "Spille seg ut bakfra mot et høyt pressledd.", ["Tryggere oppbygging"], 4, 0),
      session("Onsdag", "Tredjemannsløp", "third_man_runs", "medium", "normal",
        "Bryte press med tredjemannskombinasjoner.", ["Flere pasningsvinkler ut av press"], 4, 1),
      session("Torsdag", "Pressmotstand", "press_resistance", "medium", "normal",
        "Holde hodet kaldt og beholde ballen under press.", ["Færre balltap i egen halvdel"], 4, 1),
      session("Fredag", "Keeper og distribusjon", "keeper_distribution", "low", "short",
        "Keeperen som første oppspiller mot press.", ["Bedre igangsetting under press"], 2, 0)
    ]
  },
  {
    id: "press_week",
    title: "Pressuke",
    category: "pressing",
    summary: "Pressutløsere, motpress og kompakthet for å vinne ballen høyt.",
    weekGoal: "Samkjøre et aggressivt, koordinert press.",
    recommendedBecause: [
      "Skjerper et press laget allerede har forutsetninger for.",
      "Passer mot en motstander som kan presses i egen oppbygging."
    ],
    conditions: [
      "Relevant når laget har god pressScore eller møter et ballbesittende lag.",
      "Lite relevant – og straffes – ved høy fatigue, fordi pressing koster mye fysisk."
    ],
    targetMetrics: ["pressScore"],
    relatedTrainingFocusIds: ["pressing"],
    overuseTokens: ["press_week", "pressing"],
    risks: [
      "Høy fysisk belastning – kan slå feil ved høy fatigue eller tett kampprogram.",
      "Brytes presset, åpnes rom bak presslinjen."
    ],
    suggestedAdjustments: [
      "Doser intensiteten etter hvor frisk troppen faktisk er.",
      "Er kroppene slitne, vil et roligere program gi mer enn et hardt press."
    ],
    sessions: [
      session("Mandag", "Pressutløsere", "pressing_triggers", "high", "normal",
        "Når og hvordan presset settes i gang.", ["Mer koordinert press"], 6, 2),
      session("Onsdag", "Motpress", "counterpress", "high", "normal",
        "Gjenvinne ballen umiddelbart ved balltap.", ["Raskere gjenvinning"], 6, 2),
      session("Torsdag", "Kompakthet", "compactness", "medium", "normal",
        "Avstander som gjør presset mulig.", ["Tettere lag i press"], 4, 1),
      session("Fredag", "Pressrepetisjon", "pressing", "medium", "short",
        "Lett repetisjon av pressmønstrene.", ["Innøvde pressmønstre"], 3, 1)
    ]
  },
  {
    id: "formation_familiarisation",
    title: "Formasjonstilvenning",
    category: "shape",
    summary: "Gjennomgang av lagform, rollekjeder og faseoverganger i systemet.",
    weekGoal: "Heve systemforståelsen i en ny eller krevende formasjon.",
    recommendedBecause: [
      "Bygger forståelse for en ny eller taktisk krevende formasjon.",
      "Hjelper når trenerteamet ennå ikke kan systemet godt nok."
    ],
    conditions: [
      "Relevant ved ny/krevende formasjon eller lav formasjonskjennskap/trenerforståelse.",
      "Mindre relevant i et innarbeidet system laget kan godt."
    ],
    targetMetrics: ["formationFamiliarity", "coachUnderstanding"],
    relatedTrainingFocusIds: ["formation_familiarity"],
    overuseTokens: ["formation_familiarisation", "formation_familiarity"],
    risks: [
      "Mye systemarbeid gir mindre tid til kampspesifikk forberedelse.",
      "Tilvenning tar tid – effekten kommer gradvis, ikke på én uke."
    ],
    suggestedAdjustments: [
      "Hold systemet stabilt noen uker så tilvenningen får virke.",
      "Kan laget systemet bedre enn motoren tror, gir et kampnært program mer."
    ],
    sessions: [
      session("Mandag", "Gjennomgang av lagform", "shape_walkthrough", "low", "normal",
        "Posisjoner og avstander i alle faser.", ["Tydeligere lagform"], 3, 0),
      session("Onsdag", "Rollekjeder", "role_chains", "medium", "normal",
        "Hvordan rollene henger sammen i systemet.", ["Bedre rolleforståelse"], 3, 0),
      session("Torsdag", "Faseoverganger", "phase_transitions", "medium", "normal",
        "Skifte mellom de seks fasene i formasjonen.", ["Tryggere faseoverganger"], 4, 1),
      session("Fredag", "Formasjonstilvenning", "formation_familiarity", "low", "short",
        "Repetere systemets bevegelser.", ["Høyere systemforståelse"], 2, 0)
    ]
  },
  {
    id: "balanced_learning",
    title: "Balansert læringsuke",
    category: "balanced",
    summary: "En jevn uke med rolleforståelse, oppbygging, press og restforsvar.",
    weekGoal: "Gi jevn læring når kampbildet er uklart.",
    recommendedBecause: [
      "Trygg standarduke som utvikler laget bredt uten å gjette på skjulte signaler.",
      "Fornuftig fallback når datagrunnlaget er tynt."
    ],
    conditions: [
      "Relevant når verken slitasje, motstander eller forrige kamp peker tydelig.",
      "Et trygt utgangspunkt – sjelden det mest spisse valget."
    ],
    targetMetrics: ["roleFitAverage", "buildUpScore", "restDefenseScore"],
    relatedTrainingFocusIds: ["role_understanding", "build_up", "rest_defence"],
    overuseTokens: ["balanced_learning"],
    risks: [
      "Bred uke gir sjelden et avgjørende taktisk fortrinn i en enkeltkamp.",
      "Et spisset program kan slå denne når konteksten er tydelig."
    ],
    suggestedAdjustments: [
      "Bytt til et spisset program så snart kampbildet blir tydelig.",
      "Ser du et tydelig kontekstuelt behov, vil et målrettet valg gi mer uttelling."
    ],
    sessions: [
      session("Mandag", "Rolleforståelse", "role_understanding", "medium", "normal",
        "Ansvar og relasjoner i systemet.", ["Bedre rolleforståelse"], 3, 0),
      session("Onsdag", "Oppbygging", "build_up", "medium", "normal",
        "Trygg igangsetting og første pressledd.", ["Jevnere oppbygging"], 4, 0),
      session("Torsdag", "Presshelhet", "pressing", "medium", "normal",
        "Helhetlig pressarbeid i moderat dose.", ["Mer samkjørt press"], 4, 1),
      session("Fredag", "Restforsvar", "rest_defence", "medium", "short",
        "Sikring bak ballen.", ["Tryggere ved balltap"], 3, 0)
    ]
  }
];

const PROGRAM_TEMPLATE_BY_ID = Object.freeze(
  Object.fromEntries(PROGRAM_TEMPLATES.map((tpl) => [tpl.id, tpl]))
);

// ----------------------------------------------------------------------------
// Scoring. Deterministisk og forklarende. totalScore = baseScore + contextBonus
// + overusePenalty (<= 0) + riskAdjustment (signert). Hver scorer returnerer
// også explanation[] (regnskapet) og signals[] (hvilke data som faktisk traff).
// ----------------------------------------------------------------------------
const BASE_SCORE = {
  recovery_prevention: 38,
  defensive_structure: 42,
  finishing_week: 40,
  buildup_vs_press: 42,
  press_week: 42,
  formation_familiarisation: 40,
  balanced_learning: 44
};

const BASE_CONFIDENCE = {
  recovery_prevention: 0.45,
  defensive_structure: 0.45,
  finishing_week: 0.45,
  buildup_vs_press: 0.45,
  press_week: 0.45,
  formation_familiarisation: 0.45,
  balanced_learning: 0.4
};

const HIGH_PRESS_STYLES = ["high_press", "aggressive_man_press"];
const PRESSABLE_STYLES = ["possession_positional", "build_from_back", "switching_play"];

function overuseContribution(ctx, template) {
  const count = countOveruse(ctx, template.overuseTokens);
  if (count < 2) return { penalty: 0, count };
  // Lineær straff fra og med andre gjentakelse, kappet.
  const penalty = -clamp((count - 1) * 12, 0, 30);
  return { penalty, count };
}

function difficultyWeight(ctx) {
  const map = { low: 0, medium: 1, high: 2, very_high: 3 };
  const difficulty = String(ctx.formation?.tacticalDifficulty || "");
  return map[difficulty] ?? null;
}

const SCORERS = {
  recovery_prevention(ctx, template) {
    const explanation = [];
    const signals = [];
    let contextBonus = 0;
    let riskAdjustment = 0;

    const load = (ctx.fatigue + ctx.wear) / 2;
    if (load > 0) {
      contextBonus += Math.round(load * 40);
      signals.push("fatigueRisk", "wearRisk");
      explanation.push(`Slitasje (fatigue/wear ${round2(load)}) gir +${Math.round(load * 40)} kontekstbonus.`);
    } else {
      explanation.push("Ingen registrert slitasje: restitusjon gir ingen kontekstbonus (skal fortjenes).");
    }
    if (ctx.injury > 0) {
      riskAdjustment += Math.round(ctx.injury * 18);
      signals.push("injuryRisk");
      explanation.push(`Forhøyet skaderisiko (${round2(ctx.injury)}) gir +${Math.round(ctx.injury * 18)} risikojustering.`);
    }
    // Off-pitch: tydeligere bonus når slitasje/skaderisiko kommer fra kontekstlaget.
    if (ctx.offPitch && (load > 0 || ctx.injury > 0)) {
      signals.push("offPitch");
      explanation.push("Off-pitch-signalene bekrefter at kroppene trenger ro.");
    }
    // Historisk arketyp: en høyintensitetsstil (Liverpool-gegenpress, Sacchi-press
    // …) gjør restitusjon mer verdt — men bare når kroppene faktisk er slitne.
    const intensity = opponentStyleTrait(ctx, "intensity");
    if (intensity !== null && intensity >= 78 && load > 0) {
      const bump = Math.round((intensity - 78) / 22 * 10);
      if (bump > 0) {
        contextBonus += bump;
        signals.push("opponent");
        explanation.push(`Høyintensiv historisk stil (intensitet ${intensity}) gjør restitusjon mer verdt: +${bump} kontekstbonus.`);
      }
    }

    const { penalty, count } = overuseContribution(ctx, template);
    if (penalty < 0) {
      explanation.push(`Restitusjon brukt ${count} nylige uker uten nytt grunnlag: ${penalty} overforbruksstraff.`);
    }
    return { contextBonus, riskAdjustment, overusePenalty: penalty, explanation, signals };
  },

  defensive_structure(ctx, template) {
    const explanation = [];
    const signals = [];
    let contextBonus = 0;
    let riskAdjustment = 0;

    const strength = Number(ctx.opponent?.strength);
    if (Number.isFinite(strength)) {
      const strong = clamp((strength - 62) / 28, 0, 1);
      if (strong > 0) {
        contextBonus += Math.round(strong * 30);
        signals.push("opponent");
        explanation.push(`Sterk motstander (styrke ${strength}) gir +${Math.round(strong * 30)} kontekstbonus.`);
      }
    }
    if (ctx.formationMatchup?.lean === "risky") {
      contextBonus += 12;
      signals.push("formationMatchup");
      explanation.push("Risikabel formasjons-matchup gir +12 kontekstbonus.");
    }
    const transition = Number(ctx.opponent?.transitionThreat);
    if (Number.isFinite(transition) && transition >= 78) {
      contextBonus += 8;
      signals.push("opponent");
      explanation.push("Høy overgangstrussel hos motstanderen gir +8 kontekstbonus.");
    }
    const restDef = metricValue(ctx, "restDefenseScore");
    if (restDef !== null && restDef < 55) {
      riskAdjustment += 6;
      signals.push("teamFit");
      explanation.push(`Lavt restforsvar (${Math.round(restDef)}) gjør struktur mer verdt: +6 risikojustering.`);
    }
    // Off-pitch: høyt press utenfra gjør defensiv trygghet mer verdt — men bare
    // som tillegg når motstanderen/matchupen alt taler for struktur.
    if (ctx.offPitch && ctx.offPitch.pressure !== null && ctx.offPitch.pressure >= 60 && contextBonus > 0) {
      const bump = Math.round((ctx.offPitch.pressure - 60) / 40 * 10);
      if (bump > 0) {
        contextBonus += bump;
        signals.push("offPitch");
        explanation.push(`Høyt press utenfra (${ctx.offPitch.pressure}) gir +${bump} kontekstbonus til defensiv trygghet.`);
      }
    }

    const { penalty, count } = overuseContribution(ctx, template);
    if (penalty < 0) explanation.push(`Defensiv struktur brukt ${count} uker på rad: ${penalty} overforbruksstraff.`);
    if (contextBonus === 0) explanation.push("Ingen sterk/risky motstander signalisert: kun grunnpoeng.");
    return { contextBonus, riskAdjustment, overusePenalty: penalty, explanation, signals };
  },

  finishing_week(ctx, template) {
    const explanation = [];
    const signals = [];
    let contextBonus = 0;

    if (ctx.finishingIssue) {
      contextBonus += 25;
      signals.push("lastMatch");
      explanation.push("Avslutningsproblem fra forrige kamp gir +25 kontekstbonus.");
      explanation.push("Ekstra uttelling realiseres senere hvis angrepsspillerne setter lignende sjanser.");
    } else {
      explanation.push("Ingen registrert sjansesløsing: avslutningsuke gir kun grunnpoeng.");
    }
    const depth = metricValue(ctx, "depthScore");
    if (depth !== null && depth < 55) {
      contextBonus += 8;
      signals.push("teamFit");
      explanation.push(`Lav dybde-/bakromstrussel (${Math.round(depth)}) gir +8 kontekstbonus.`);
    }

    const { penalty, count } = overuseContribution(ctx, template);
    if (penalty < 0) explanation.push(`Avslutningsuke gjentatt ${count} ganger: ${penalty} overforbruksstraff.`);
    return { contextBonus, riskAdjustment: 0, overusePenalty: penalty, explanation, signals };
  },

  buildup_vs_press(ctx, template) {
    const explanation = [];
    const signals = [];
    let contextBonus = 0;

    if (opponentHasStyle(ctx, HIGH_PRESS_STYLES)) {
      contextBonus += 25;
      signals.push("opponent");
      explanation.push("Motstanderen presser høyt: +25 kontekstbonus.");
    }
    const riskTokens = matchupRiskTokens(ctx);
    if (riskTokens.some((token) => HIGH_PRESS_STYLES.includes(token))) {
      contextBonus += 12;
      signals.push("formationMatchup");
      explanation.push("Matchup-risiko mot høyt press: +12 kontekstbonus.");
    }
    const buildUp = metricValue(ctx, "buildUpScore");
    if (buildUp !== null && buildUp < 55) {
      contextBonus += 8;
      signals.push("teamFit");
      explanation.push(`Svak oppbygging (${Math.round(buildUp)}) gir +8 kontekstbonus.`);
    }

    const { penalty, count } = overuseContribution(ctx, template);
    if (penalty < 0) explanation.push(`Oppbyggingsuke gjentatt ${count} ganger: ${penalty} overforbruksstraff.`);
    if (contextBonus === 0) explanation.push("Ingen høyt press signalisert: kun grunnpoeng.");
    return { contextBonus, riskAdjustment: 0, overusePenalty: penalty, explanation, signals };
  },

  press_week(ctx, template) {
    const explanation = [];
    const signals = [];
    let contextBonus = 0;
    let riskAdjustment = 0;

    const press = metricValue(ctx, "pressScore");
    if (press !== null && press >= 62) {
      contextBonus += 18;
      signals.push("teamFit");
      explanation.push(`God pressScore (${Math.round(press)}) gir +18 kontekstbonus.`);
    }
    if (opponentHasStyle(ctx, PRESSABLE_STYLES)) {
      contextBonus += 15;
      signals.push("opponent");
      explanation.push("Motstanderen kan presses i oppbygging: +15 kontekstbonus.");
    }

    // Pressing koster mye fysisk: høy fatigue/wear straffer programmet.
    const load = Math.max(ctx.fatigue, ctx.wear);
    if (load > 0.4) {
      riskAdjustment -= Math.round(load * 30);
      signals.push("fatigueRisk");
      if (ctx.offPitch) signals.push("offPitch");
      explanation.push(`Høy slitasje (${round2(load)}) gjør press risikabelt: ${-Math.round(load * 30)} risikojustering.`);
    }

    const { penalty, count } = overuseContribution(ctx, template);
    if (penalty < 0) explanation.push(`Pressuke gjentatt ${count} ganger: ${penalty} overforbruksstraff.`);
    if (contextBonus === 0) explanation.push("Verken god pressScore eller pressbar motstander: kun grunnpoeng.");
    return { contextBonus, riskAdjustment, overusePenalty: penalty, explanation, signals };
  },

  formation_familiarisation(ctx, template) {
    const explanation = [];
    const signals = [];
    let contextBonus = 0;

    const weight = difficultyWeight(ctx);
    if (weight !== null && weight >= 2) {
      contextBonus += 14;
      signals.push("formation");
      explanation.push("Taktisk krevende formasjon gir +14 kontekstbonus.");
    }
    const understanding = Number(ctx.coachContext?.coachUnderstanding);
    if (Number.isFinite(understanding) && understanding < 55) {
      contextBonus += 12;
      signals.push("coachContext");
      explanation.push(`Lav trenerforståelse (${Math.round(understanding)}) gir +12 kontekstbonus.`);
    }
    const familiarity = Number(ctx.coachContext?.formationFamiliarity);
    if (Number.isFinite(familiarity) && familiarity < 55) {
      contextBonus += 10;
      signals.push("coachContext");
      explanation.push(`Lav formasjonskjennskap (${Math.round(familiarity)}) gir +10 kontekstbonus.`);
    }
    // Off-pitch: lav taktisk klarhet eller lavt samhold gjør tilvenning mer verdt.
    if (ctx.offPitch) {
      const tc = ctx.offPitch.tacticalClarity;
      if (tc !== null && tc < 50) {
        const bump = Math.round((50 - tc) / 50 * 14);
        contextBonus += bump;
        signals.push("offPitch");
        explanation.push(`Lav taktisk klarhet (${tc}) gir +${bump} kontekstbonus.`);
      }
      const coh = ctx.offPitch.cohesion;
      if (coh !== null && coh < 50) {
        const bump = Math.round((50 - coh) / 50 * 8);
        contextBonus += bump;
        signals.push("offPitch");
        explanation.push(`Lavt samhold (${coh}) gir +${bump} kontekstbonus.`);
      }
    }

    // Historisk arketyp: en taktisk kompleks stil (totalfotball, posisjonsspill,
    // Sacchi-press …) gjør systemforståelse mer verdt før kampen.
    const complexity = opponentStyleTrait(ctx, "tacticalComplexity");
    if (complexity !== null && complexity >= 80) {
      const bump = Math.round((complexity - 80) / 20 * 10);
      if (bump > 0) {
        contextBonus += bump;
        signals.push("opponent");
        explanation.push(`Taktisk kompleks historisk stil (kompleksitet ${complexity}) gir +${bump} kontekstbonus til tilvenning.`);
      }
    }

    const { penalty, count } = overuseContribution(ctx, template);
    if (penalty < 0) explanation.push(`Tilvenning gjentatt ${count} ganger: ${penalty} overforbruksstraff.`);
    if (contextBonus === 0) explanation.push("Systemet virker innarbeidet: kun grunnpoeng.");
    return { contextBonus, riskAdjustment: 0, overusePenalty: penalty, explanation, signals };
  },

  balanced_learning(ctx, template) {
    const explanation = ["Trygg standarduke: jevn, moderat læring uten å gjette på skjulte signaler."];
    const signals = [];
    // Litt ekstra verdi nettopp når annet datagrunnlag er tynt.
    const sparse = !ctx.teamFit && !ctx.opponent && !ctx.coachContext;
    let contextBonus = sparse ? 8 : 4;
    if (sparse) explanation.push("Tynt datagrunnlag: balansert uke er det tryggeste valget (+8).");
    else explanation.push("Moderat generell verdi (+4).");

    // Off-pitch: uro i gruppa + moderat press → en trygg, balansert uke er en god
    // fallback ved høy usikkerhet uten å gamble på et spisset opplegg.
    if (ctx.offPitch) {
      const hs = ctx.offPitch.hiddenStress;
      const p = ctx.offPitch.pressure;
      if (hs !== null && hs >= 55 && p !== null && p >= 30 && p <= 70) {
        contextBonus += 8;
        signals.push("offPitch");
        explanation.push("Uro i gruppa og moderat press: balansert uke demper risiko (+8).");
      }
    }

    const { penalty, count } = overuseContribution(ctx, template);
    if (penalty < 0) explanation.push(`Balansert uke gjentatt ${count} ganger: ${penalty} overforbruksstraff.`);
    return { contextBonus, riskAdjustment: 0, overusePenalty: penalty, explanation, signals };
  }
};

// Intern scoring på allerede-normalisert kontekst.
function scoreComposition(ctx, composition) {
  const id = composition?.id;
  const template = PROGRAM_TEMPLATE_BY_ID[id];
  const scorer = SCORERS[id];
  if (!template || !scorer) {
    return { baseScore: 0, contextBonus: 0, overusePenalty: 0, riskAdjustment: 0, totalScore: 0, explanation: [] };
  }
  const baseScore = BASE_SCORE[id];
  const { contextBonus, riskAdjustment, overusePenalty, explanation } = scorer(ctx, template);
  const totalScore = baseScore + contextBonus + overusePenalty + riskAdjustment;
  return {
    baseScore,
    contextBonus,
    overusePenalty,
    riskAdjustment,
    totalScore,
    explanation: [`Grunnpoeng ${baseScore}.`, ...explanation, `Totalt ${totalScore}.`]
  };
}

// Offentlig: skår et program mot en (urå) kontekst. Normaliserer selv.
export function scoreTrainingProgramComposition(composition, context) {
  return scoreComposition(normalizeContext(context), composition);
}

function confidenceFor(id, scoring, signalCount) {
  const base = BASE_CONFIDENCE[id] ?? 0.4;
  const raw =
    base +
    scoring.contextBonus * 0.006 +
    Math.max(0, scoring.riskAdjustment) * 0.004 +
    scoring.overusePenalty * 0.006 +
    Math.min(scoring.riskAdjustment, 0) * 0.004 +
    signalCount * 0.01;
  const ceiling = id === "balanced_learning" ? 0.6 : 0.95;
  return round2(clamp(raw, 0.2, ceiling));
}

function buildComposition(template, ctx) {
  const scorer = SCORERS[template.id];
  const { contextBonus, riskAdjustment, overusePenalty, explanation, signals } = scorer(ctx, template);
  const baseScore = BASE_SCORE[template.id];
  const totalScore = baseScore + contextBonus + overusePenalty + riskAdjustment;
  const scoring = {
    baseScore,
    contextBonus,
    overusePenalty,
    riskAdjustment,
    totalScore,
    explanation: [`Grunnpoeng ${baseScore}.`, ...explanation, `Totalt ${totalScore}.`]
  };

  const sourceSignals = uniqueStrings(signals);
  const confidence = confidenceFor(template.id, scoring, sourceSignals.length);

  return {
    id: template.id,
    title: template.title,
    type: "training_program",
    category: template.category,
    summary: template.summary,
    weekGoal: template.weekGoal,
    recommendedBecause: uniqueStrings(template.recommendedBecause),
    conditions: uniqueStrings(template.conditions),
    sessions: template.sessions.map((s) => ({ ...s, expectedEffect: [...s.expectedEffect] })),
    targetMetrics: uniqueStrings(template.targetMetrics),
    relatedTrainingFocusIds: uniqueStrings(template.relatedTrainingFocusIds),
    risks: uniqueStrings(template.risks),
    suggestedAdjustments: uniqueStrings(template.suggestedAdjustments),
    scoring,
    confidence,
    sourceSignals
  };
}

// ----------------------------------------------------------------------------
// Offentlig API
// ----------------------------------------------------------------------------

// Bygg 2–4 treningsprogram-komposisjoner, rangert etter kontekstuell uttelling.
// Degraderer trygt: alle malene er alltid byggbare, og balansert læringsuke er
// en fallback som alltid er med i poolen.
export function createTrainingProgramCompositions(context = {}) {
  const ctx = normalizeContext(context);
  const limit = normalizeLimit(context?.limit);
  const compositions = PROGRAM_TEMPLATES.map((template) => buildComposition(template, ctx));
  // Deterministisk: høyest totalScore først, så høyest konfidens, så id.
  compositions.sort(
    (a, b) =>
      b.scoring.totalScore - a.scoring.totalScore ||
      b.confidence - a.confidence ||
      a.id.localeCompare(b.id)
  );
  return compositions.slice(0, limit);
}

// Hent ett program på id med en gitt (valgfri) kontekst. Praktisk for UI som
// vil vise et bestemt program dypere fra en treningsuke-lenke.
export function getTrainingProgramCompositionById(id, context = {}) {
  const template = PROGRAM_TEMPLATE_BY_ID[id];
  if (!template) return null;
  return buildComposition(template, normalizeContext(context));
}

// Flat liste over alle øktene i ett program (eller flere). Praktisk for en UI
// som vil vise hele uka som én strøm, eller for validering.
export function flattenTrainingProgramSessions(composition) {
  if (Array.isArray(composition)) {
    return composition.flatMap((comp) => asArray(comp?.sessions));
  }
  return asArray(composition?.sessions).map((s) => ({ ...s }));
}

// Treningsfokus (football-training-week.js) → relevante programkomposisjoner.
// Lar Suggested Setups peke en treningsuke videre til dypere programvalg uten å
// duplisere relevanslogikk.
const FOCUS_TO_PROGRAM_IDS = {
  build_up: ["buildup_vs_press"],
  pressing: ["press_week"],
  rest_defence: ["defensive_structure"],
  set_pieces: ["defensive_structure"],
  depth_runs: ["finishing_week"],
  width: ["balanced_learning"],
  formation_familiarity: ["formation_familiarisation"],
  role_understanding: ["balanced_learning", "recovery_prevention"]
};

export function getTrainingProgramIdsForFocus(focusId) {
  return uniqueStrings(FOCUS_TO_PROGRAM_IDS[focusId]);
}

// Eksponer malenes id-er (for UI/validering uten å lekke interne maler).
export function getTrainingProgramCompositionIds() {
  return PROGRAM_TEMPLATES.map((tpl) => tpl.id);
}

// Selvsjekk i utvikling: alle relatedTrainingFocusIds må peke på ekte fokus.
// Kjøres ikke automatisk; sim-scriptet validerer det samme.
export function _validateRelatedFocusIds() {
  const valid = new Set(TRAINING_FOCUSES.map((f) => f.id));
  return PROGRAM_TEMPLATES.every((tpl) =>
    tpl.relatedTrainingFocusIds.every((id) => valid.has(id) && getTrainingFocus(id))
  );
}

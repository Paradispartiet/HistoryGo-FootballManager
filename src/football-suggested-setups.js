// HG Football Manager — Suggested Setups v1
//
// Et rent, data-/motorbasert forslagssystem. Ved store valg (formasjon,
// kampplan, treningsuke) gir det spilleren 2–4 faglig logiske setups som
// FORKLARER seg selv, uten å erstatte spillerens egne valg.
//
// Designprinsipp (CLAUDE.md): forslagene viser taktisk korrekt
// standardforståelse. Spilleren skal fortsatt kunne gjøre egne kontekstuelle
// valg som kan gi BEDRE uttelling enn standardforslaget. Forslag er additive og
// forklarende — aldri en fasit, aldri en lås.
//
// Modulen kjenner ikke DOM, localStorage, fetch eller app-state. app.js mater
// inn data (teamFit, valgt formasjon, tilgjengelige spillere/formasjoner,
// motstanderprofil, formasjonskunnskap, coachContext) og får strukturerte
// forslag tilbake. Den degraderer trygt: uten motstander, uten
// formasjonskunnskap og uten stab produserer den fortsatt fornuftige forslag
// fra det som finnes (teamFit alene holder).
//
// Gjenbruker eksisterende motorer i stedet for å duplisere logikk:
//   - football-training-week.js  (treningsfokus + matchup/svakhet → fokus)
//   - football-matchday-engine.js (formasjons-matchup mot motstanderens stil)

import {
  TRAINING_FOCUSES,
  getTrainingFocus,
  getMatchupRelevantFocusIds,
  getWeaknessRelevantFocusId,
  calculateTrainingStaffSupport
} from "./football-training-week.js";
import { evaluateFormationMatchupVsOpponent } from "./football-matchday-engine.js";
import { getTrainingProgramIdsForFocus } from "./football-training-program-compositions.js";
import { summarizeOffPitchContext } from "./football-off-pitch-parameters.js";

// ----------------------------------------------------------------------------
// Hjelpere
// ----------------------------------------------------------------------------
const DEFAULT_LIMIT = 4; // 2–4 forslag per type; vi kapper på 4 og lar dårlig
// datagrunnlag gi færre (trygg degradering).

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function uniqueStrings(values) {
  return [...new Set(asArray(values).filter((v) => typeof v === "string" && v.length > 0))];
}

function normalizeLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return clamp(Math.trunc(n), 1, DEFAULT_LIMIT);
}

// Lesbare navn på teamFit-metrikkene, brukt i forklaringene.
const METRIC_LABELS = {
  individualFitAverage: "individuell spillerfit",
  roleFitAverage: "rolleforståelsen",
  tacticFitAverage: "taktikkfit",
  balanceScore: "lagbalansen",
  widthScore: "breddespillet",
  depthScore: "dybdeløpene",
  buildUpScore: "oppbyggingsspillet",
  pressScore: "presspillet",
  restDefenseScore: "restforsvaret",
  relationshipScore: "rollerelasjonene"
};

// Metrikkene som beskriver lagets kampområder. Brukes til å finne sterkeste og
// svakeste ledd når motstander/kunnskap mangler.
const TEAM_METRIC_KEYS = [
  "restDefenseScore",
  "pressScore",
  "buildUpScore",
  "widthScore",
  "depthScore",
  "balanceScore",
  "relationshipScore",
  "roleFitAverage"
];

const DIFFICULTY_WEIGHT = { low: 0, medium: 1, high: 2, very_high: 3 };
const DIFFICULTY_LABEL = {
  low: "lav",
  medium: "moderat",
  high: "høy",
  very_high: "svært høy"
};

// Hver setup har en fast form, slik at konsumenter (UI, audit) alltid kan lese
// alle feltene. makeSuggestion fyller defaults for det et forslag ikke setter.
function makeSuggestion(partial) {
  return {
    id: String(partial.id || ""),
    title: String(partial.title || ""),
    type: String(partial.type || ""),
    summary: String(partial.summary || ""),
    why: uniqueStrings(partial.why),
    recommendedBecause: uniqueStrings(partial.recommendedBecause),
    risks: uniqueStrings(partial.risks),
    suggestedAdjustments: uniqueStrings(partial.suggestedAdjustments),
    relatedTrainingFocusIds: uniqueStrings(partial.relatedTrainingFocusIds),
    // Treningsforslag kan peke videre til dypere treningsprogram-komposisjoner
    // (football-training-program-compositions.js). Tom for andre forslagstyper.
    relatedProgramIds: uniqueStrings(partial.relatedProgramIds),
    confidence: round2(clamp(Number(partial.confidence) || 0, 0, 1)),
    sourceSignals: uniqueStrings(partial.sourceSignals)
  };
}

// Sorter teamFit-metrikkene fra svakest til sterkest. Returnerer tom liste hvis
// teamFit/metrics mangler — kallere håndterer det.
function getMetricRanking(teamFit) {
  const metrics = teamFit?.metrics;
  if (!metrics || typeof metrics !== "object") return [];
  return TEAM_METRIC_KEYS
    .map((key) => ({ key, value: Number(metrics[key]) }))
    .filter((entry) => Number.isFinite(entry.value))
    // Deterministisk: stigende verdi, så alfabetisk nøkkel ved likhet.
    .sort((a, b) => a.value - b.value || a.key.localeCompare(b.key));
}

// Off-pitch-kontekst for forslagene. VIKTIG: forslagssystemet får bare den
// HALVSKJULTE pakken (summarizeOffPitchContext) — synlige signaler + en vag
// hint om uro — aldri de rå hidden-tallene. Slik kan en bevisst manager
// fortsatt lese konteksten bedre enn forslaget. Aksepterer enten en rå
// offPitchState (summeres her) eller en ferdig summary i offPitchSignals.
function resolveOffPitchSummary({ offPitchState, offPitchSignals } = {}) {
  if (offPitchSignals && typeof offPitchSignals === "object") {
    if (Array.isArray(offPitchSignals.visible)) return offPitchSignals;
    if (offPitchSignals.summary && typeof offPitchSignals.summary === "object") return offPitchSignals.summary;
  }
  if (offPitchState && typeof offPitchState === "object") {
    return summarizeOffPitchContext(offPitchState);
  }
  return null;
}

// Finn et synlig signal i en kategori med minst en gitt alvorlighet.
function offPitchConcern(summary, categories, severities = ["alert", "watch"]) {
  if (!summary || !Array.isArray(summary.visible)) return null;
  const wantCat = new Set(asArray(categories));
  const wantSev = new Set(asArray(severities));
  return summary.visible.find((sig) => wantCat.has(sig.category) && wantSev.has(sig.severity)) || null;
}

// ----------------------------------------------------------------------------
// 1. Formasjonsforslag
//
// Rangerer tilgjengelige formasjoner etter (a) matchup mot motstanderens
// spillestil og (b) hvor godt trenerteamet forstår systemets vanskelighetsgrad.
// Uten motstander/kunnskap rangeres de etter at et krevende system ikke skal
// foreslås når trenerforståelsen er lav.
// ----------------------------------------------------------------------------
export function suggestFormationSetups({
  formations,
  currentFormation,
  formationKnowledgeById,
  opponent,
  coachContext,
  teamFit,
  limit
} = {}) {
  const max = normalizeLimit(limit);
  const knowledgeById = formationKnowledgeById && typeof formationKnowledgeById === "object"
    ? formationKnowledgeById
    : {};

  // Kandidatliste: tilgjengelige (opplåste) formasjoner. Faller tilbake til den
  // valgte formasjonen alene, slik at vi alltid kan si noe om systemet i bruk.
  const candidates = asArray(formations).filter((formation) => formation && formation.id);
  if (candidates.length === 0 && currentFormation?.id) {
    candidates.push(currentFormation);
  }
  if (candidates.length === 0) return [];

  const coachUnderstanding = Number(coachContext?.coachUnderstanding);
  const hasCoach = Number.isFinite(coachUnderstanding);

  const scored = candidates.map((formation) => {
    const knowledge = knowledgeById[formation.id] || null;
    const matchup = opponent && knowledge
      ? evaluateFormationMatchupVsOpponent(knowledge, opponent.matchupStyles, opponent.name)
      : null;

    const matchupScore = matchup ? Number(matchup.score) || 0 : 0;
    const difficulty = String(formation.tacticalDifficulty || "medium");
    const difficultyWeight = DIFFICULTY_WEIGHT[difficulty] ?? 1;

    // Et krevende system straffes når trenerforståelsen er lav (faglig: ikke be
    // spilleren spille et system trenerteamet ikke kan lære bort ennå). Nøytralt
    // når coachContext mangler.
    const difficultyFit = hasCoach
      ? -(difficultyWeight * (1 - clamp(coachUnderstanding, 0, 100) / 100) * 3)
      : 0;

    const isCurrent = currentFormation?.id === formation.id;
    const continuityBonus = isCurrent ? 1 : 0; // liten nudge mot unødig bytte

    const rankScore = matchupScore * 10 + difficultyFit + continuityBonus;

    return { formation, knowledge, matchup, matchupScore, difficulty, difficultyWeight, difficultyFit, isCurrent, rankScore };
  });

  // Deterministisk rangering: høyest rankScore først, så formasjons-id.
  scored.sort((a, b) => b.rankScore - a.rankScore || a.formation.id.localeCompare(b.formation.id));

  const selected = scored.slice(0, max);

  // Den valgte formasjonen skal alltid vurderes — også når den rangerer lavt
  // (spilleren må se systemets risiko, ikke bare alternativene). Bytt den inn på
  // siste plass hvis den er utenfor toppen.
  if (currentFormation?.id) {
    const currentEntry = scored.find((entry) => entry.formation.id === currentFormation.id);
    if (currentEntry && !selected.includes(currentEntry) && max > 0) {
      selected[selected.length - 1] = currentEntry;
    }
  }

  return selected.map((entry) => buildFormationSuggestion(entry, { opponent, hasCoach, coachUnderstanding }));
}

function buildFormationSuggestion(entry, ctx) {
  const { formation, matchup, difficulty, difficultyWeight, isCurrent } = entry;
  const { opponent, hasCoach, coachUnderstanding } = ctx;
  const difficultyLabel = DIFFICULTY_LABEL[difficulty] || "moderat";

  const why = [];
  const recommendedBecause = [];
  const risks = [];
  const suggestedAdjustments = [];
  const relatedTrainingFocusIds = [];
  const sourceSignals = ["selectedFormation"];

  let summary;
  let confidence = 0.45;

  if (matchup) {
    sourceSignals.push("opponent", "formationKnowledge");
    recommendedBecause.push(`Formasjons-matchup mot ${opponent?.name || "motstanderen"}`);
    if (matchup.lean === "favourable") {
      summary = `Gunstig system mot ${opponent?.name || "motstanderen"}.`;
      why.push(matchup.summary);
      confidence = 0.8;
    } else if (matchup.lean === "risky") {
      summary = `Mulig, men risikabelt mot ${opponent?.name || "motstanderen"}.`;
      why.push(matchup.summary);
      confidence = 0.45;
    } else {
      summary = `Balansert system mot ${opponent?.name || "motstanderen"}.`;
      why.push(matchup.summary);
      confidence = 0.6;
    }
    asArray(matchup.advantages).forEach((a) => why.push(a.text));
    asArray(matchup.risks).forEach((r) => risks.push(r.text));
    asArray(matchup.suggestions).forEach((s) => suggestedAdjustments.push(s));
    getMatchupRelevantFocusIds(matchup).forEach((id) => relatedTrainingFocusIds.push(id));
  } else {
    summary = `Et alternativ med ${difficultyLabel} taktisk vanskelighetsgrad.`;
    if (!opponent) {
      why.push("Ingen motstander er kjent ennå; forslaget bygger på systemets vanskelighetsgrad og lagets behov.");
    } else {
      why.push("Formasjonen har ingen kunnskapsoppslag mot denne spillestilen ennå; vurderingen bygger på vanskelighetsgrad.");
    }
    confidence = 0.5;
  }

  // Trenerforståelse vs. systemets krav: en faglig viktig risiko som ikke
  // avhenger av motstanderen.
  recommendedBecause.push(`Taktisk vanskelighetsgrad: ${difficultyLabel}`);
  if (hasCoach) {
    sourceSignals.push("coachContext");
    recommendedBecause.push("Trenerforståelse av systemet");
    if (difficultyWeight >= 2 && coachUnderstanding < 55) {
      risks.push(
        `Systemet er taktisk krevende (${difficultyLabel}), men trenerforståelsen er foreløpig lav (${Math.round(coachUnderstanding)}). Tilvenning tar tid.`
      );
      relatedTrainingFocusIds.push("formation_familiarity");
      suggestedAdjustments.push("Tren formasjonstilvenning et par uker, eller velg et enklere system inntil videre.");
      confidence = clamp(confidence - 0.1, 0.2, 0.95);
    } else if (difficultyWeight >= 2 && coachUnderstanding >= 65) {
      why.push(`Trenerteamet forstår det krevende systemet godt nok (${Math.round(coachUnderstanding)}).`);
    }
  } else if (difficultyWeight >= 2) {
    risks.push(`Systemet er taktisk krevende (${difficultyLabel}); uten kjent trenerstøtte er tilvenning usikker.`);
    relatedTrainingFocusIds.push("formation_familiarity");
  }

  if (isCurrent) {
    why.push("Dette er systemet laget allerede spiller — kontinuitet gir innarbeidet forståelse.");
  }

  const roleRequirementHint = asArray(formation?.roleRequirements || entry.knowledge?.roleRequirements)[0];
  if (roleRequirementHint) {
    suggestedAdjustments.push(`Rollehint: denne formasjonen trenger tydelig ${String(roleRequirementHint).replace(/_/g, " ")}.`);
  }

  // Alltid en påminnelse om at forslaget er additivt, ikke en lås.
  suggestedAdjustments.push("Du kan velge et annet system; et bevisst kontekstuelt valg kan gi bedre uttelling enn standardforslaget.");

  return makeSuggestion({
    id: `formation:${formation.id}`,
    title: `Spill ${formation.name}`,
    type: "formation",
    summary,
    why,
    recommendedBecause,
    risks,
    suggestedAdjustments,
    relatedTrainingFocusIds,
    confidence,
    sourceSignals
  });
}

// ----------------------------------------------------------------------------
// 2. Kampplanforslag
//
// En kampplan = taktisk tilnærming mot neste kamp. Bygges fra formasjons-matchup
// (risikoer/fordeler mot motstanderens stil), motstanderprofilen (svakheter å
// utnytte, styrker å sikre mot) og teamFit (lagets sterkeste/svakeste ledd).
// Uten motstander faller den tilbake på lagets egne styrker og svakheter.
// ----------------------------------------------------------------------------
export function suggestMatchPlanSetups({
  formation,
  tactic,
  teamFit,
  opponent,
  formationMatchup,
  coachContext,
  offPitchState,
  offPitchSignals,
  limit
} = {}) {
  const max = normalizeLimit(limit);
  const offPitch = resolveOffPitchSummary({ offPitchState, offPitchSignals });
  const plans = [];
  const ranking = getMetricRanking(teamFit);
  const strongest = ranking.length ? ranking[ranking.length - 1] : null;
  const weakest = ranking.length ? ranking[0] : null;
  const matchupFocusIds = getMatchupRelevantFocusIds(formationMatchup);

  // Plan 1: hovedtilnærming basert på matchup-lean (når den finnes).
  if (formationMatchup) {
    plans.push(buildMatchupLeanPlan({ formationMatchup, opponent, matchupFocusIds }));
  }

  if (opponent) {
    // Plan: utnytt motstanderens svakheter / trykkpunkter.
    plans.push(buildExploitPlan({ opponent, formationMatchup, strongest }));
    // Plan: sikre mot motstanderens styrker (kun når den tilfører noe ut over
    // hovedplanen, dvs. når matchup ikke allerede er risikabel-fokusert).
    if (!formationMatchup || formationMatchup.lean !== "risky") {
      plans.push(buildSecurePlan({ opponent, formationMatchup, matchupFocusIds }));
    }
  }

  // Plan(er) fra lagets egne metrikker — alltid relevante, og eneste kilde når
  // motstander mangler.
  if (strongest) {
    plans.push(buildStrengthPlan({ strongest, formation, tactic, hasOpponent: Boolean(opponent) }));
  }
  if (weakest && (!strongest || weakest.key !== strongest.key)) {
    plans.push(buildWeaknessPlan({ weakest, hasOpponent: Boolean(opponent) }));
  }

  // Dedupliser på id (en metrikk kan dukke opp via flere kilder) og kapp.
  const seen = new Set();
  const unique = [];
  for (const plan of plans) {
    if (!plan || seen.has(plan.id)) continue;
    seen.add(plan.id);
    unique.push(plan);
  }

  // Off-pitch: et halvskjult tilleggssignal om ytre press. Additivt og ikke
  // styrende — forslaget peker bare på at konteksten utenfor banen finnes.
  const pressureConcern = offPitchConcern(offPitch, ["pressure", "boardMedia"]);
  const decorated = pressureConcern
    ? unique.map((plan) =>
        makeSuggestion({
          ...plan,
          suggestedAdjustments: [
            ...plan.suggestedAdjustments,
            `Off-pitch: ${pressureConcern.text} Hold roen i kampplanen og les laget, ikke bare tavla.`
          ],
          sourceSignals: [...plan.sourceSignals, "offPitch"]
        })
      )
    : unique;

  return decorated.slice(0, max);
}

function buildMatchupLeanPlan({ formationMatchup, opponent, matchupFocusIds }) {
  const oppName = opponent?.name || "motstanderen";
  const sourceSignals = ["selectedFormation", "formationKnowledge"];
  if (opponent) sourceSignals.push("opponent");

  const risks = asArray(formationMatchup.risks).map((r) => r.text);
  const suggestedAdjustments = asArray(formationMatchup.suggestions).slice();

  let title;
  let summary;
  let why = [formationMatchup.summary];
  let confidence;

  if (formationMatchup.lean === "favourable") {
    title = "Ta initiativet";
    summary = `Spill ut systemets styrker mot ${oppName}.`;
    why.push("Matchupen er gunstig: tør å sette tempo og presse fordelene.");
    confidence = 0.78;
    suggestedAdjustments.push("Hold likevel restforsvaret edru ved balltap — en ledelse kan invitere til kontringer.");
  } else if (formationMatchup.lean === "risky") {
    title = "Pragmatisk og kompakt";
    summary = `Demp ${oppName}s styrker og spill kontrollert.`;
    why.push("Matchupen er risikabel: prioriter struktur og presise overganger framfor risiko.");
    confidence = 0.7;
  } else {
    title = "Balansert kontroll";
    summary = `Jevn matchup mot ${oppName}: vinn de små marginene.`;
    why.push("Ingen tydelig taktisk overvekt — detaljene og managergrepene avgjør.");
    confidence = 0.6;
  }

  asArray(formationMatchup.advantages).forEach((a) => why.push(a.text));

  return makeSuggestion({
    id: `match_plan:matchup_${formationMatchup.lean}`,
    title,
    type: "match_plan",
    summary,
    why,
    recommendedBecause: [`Formasjons-matchup mot ${oppName}`, "Lagets formasjons-matchup-lean"],
    risks,
    suggestedAdjustments,
    relatedTrainingFocusIds: matchupFocusIds,
    confidence,
    sourceSignals
  });
}

function buildExploitPlan({ opponent, formationMatchup, strongest }) {
  const oppName = opponent?.name || "motstanderen";
  const why = [];
  const recommendedBecause = ["Motstanderens svakheter", "Motstanderens trykkpunkter"];
  const suggestedAdjustments = [];

  asArray(opponent.weaknesses).forEach((w) => why.push(`Motstanderens svakhet: ${w}.`));
  asArray(opponent.pressurePoints).forEach((p) => suggestedAdjustments.push(`Legg planen rundt: ${p}.`));
  asArray(formationMatchup?.advantages).forEach((a) => why.push(a.text));

  if (strongest) {
    why.push(`Lagets sterkeste ledd er ${METRIC_LABELS[strongest.key] || strongest.key} — bruk det mot motstanderens svake side.`);
  }

  return makeSuggestion({
    id: "match_plan:exploit_opponent",
    title: `Utnytt ${oppName}s svakheter`,
    type: "match_plan",
    summary: `Rett angrepet mot der ${oppName} er sårbar.`,
    why,
    recommendedBecause,
    risks: ["Å jakte motstanderens svakhet ensidig kan åpne eget restforsvar — hold balansen."],
    suggestedAdjustments,
    relatedTrainingFocusIds: strongest ? uniqueStrings([getWeaknessRelevantFocusId(strongest.key)]) : [],
    confidence: 0.6,
    sourceSignals: ["opponent", "teamFit"]
  });
}

function buildSecurePlan({ opponent, formationMatchup, matchupFocusIds }) {
  const oppName = opponent?.name || "motstanderen";
  const why = [];
  const suggestedAdjustments = [];

  asArray(opponent.strengths).forEach((s) => why.push(`Motstanderens styrke: ${s}.`));
  asArray(formationMatchup?.risks).forEach((r) => why.push(r.text));
  asArray(formationMatchup?.suggestions).forEach((s) => suggestedAdjustments.push(s));
  asArray(opponent.pressurePoints).forEach((p) => suggestedAdjustments.push(`Vær disiplinert på: ${p}.`));

  return makeSuggestion({
    id: "match_plan:secure_vs_opponent",
    title: `Sikre mot ${oppName}s styrker`,
    type: "match_plan",
    summary: `Nøytraliser det ${oppName} er best på før du tar sjanser.`,
    why,
    recommendedBecause: ["Motstanderens styrker", "Formasjons-matchupens risikoer"],
    risks: ["For passivt kan gi motstanderen initiativet — sikring er et utgangspunkt, ikke hele planen."],
    suggestedAdjustments,
    relatedTrainingFocusIds: matchupFocusIds,
    confidence: 0.58,
    sourceSignals: ["opponent", "formationKnowledge"]
  });
}

function buildStrengthPlan({ strongest, formation, tactic, hasOpponent }) {
  const label = METRIC_LABELS[strongest.key] || strongest.key;
  const why = [`Lagets sterkeste kampområde er ${label} (${Math.round(strongest.value)}).`];
  if (formation?.name) why.push(`Bygg kampplanen rundt det ${formation.name} gjør best.`);
  if (tactic?.name) why.push(`Den valgte taktikken «${tactic.name}» bør forsterke dette.`);

  return makeSuggestion({
    id: "match_plan:play_to_strength",
    title: "Spill på lagets styrker",
    type: "match_plan",
    summary: `Sett ${label} i sentrum av kampplanen.`,
    why,
    recommendedBecause: [`Lagets sterkeste ledd (${label})`],
    risks: hasOpponent
      ? ["En ensidig plan blir lett å lese — ha en plan B om motstanderen stenger styrken din."]
      : ["Uten kjent motstander er dette et trygt utgangspunkt, men ikke skreddersydd til kampbildet."],
    suggestedAdjustments: ["Juster underveis hvis motstanderen tar bort lagets styrke."],
    relatedTrainingFocusIds: [],
    confidence: hasOpponent ? 0.52 : 0.5,
    sourceSignals: ["teamFit"]
  });
}

function buildWeaknessPlan({ weakest, hasOpponent }) {
  const label = METRIC_LABELS[weakest.key] || weakest.key;
  const focusId = getWeaknessRelevantFocusId(weakest.key);

  return makeSuggestion({
    id: "match_plan:protect_weakness",
    title: "Skjul lagets svakeste ledd",
    type: "match_plan",
    summary: `Reduser eksponeringen av ${label}.`,
    why: [`Lagets svakeste kampområde er ${label} (${Math.round(weakest.value)}) — kampplanen bør begrense risikoen der.`],
    recommendedBecause: [`Lagets svakeste ledd (${label})`],
    risks: ["For defensiv kompensasjon kan svekke eget angrepsspill — det er en balanse."],
    suggestedAdjustments: [
      "Et bevisst kontekstuelt valg (f.eks. en spiller som dekker svakheten i rollen sin) kan gi bedre uttelling enn å spille rundt den."
    ],
    relatedTrainingFocusIds: focusId ? [focusId] : [],
    confidence: hasOpponent ? 0.5 : 0.48,
    sourceSignals: ["teamFit"]
  });
}

// ----------------------------------------------------------------------------
// 3. Treningsukeforslag
//
// Rangerer treningsfokus etter kontekstuell relevans, samme prioritering som
// recommendTrainingFocus, men levert som flere forklarende kort med
// staff-støtte og risiko. Prioritet:
//   1) matchup-relevant (proaktivt — adresserer en risiko mot neste motstander)
//   2) forrige kamps svakhet (reaktivt)
//   3) motstanderprofilens stil
//   4) lagets svakeste metrikk
// ----------------------------------------------------------------------------
export function suggestTrainingWeekSetups({
  teamFit,
  opponent,
  formationMatchup,
  coachContext,
  lastMatchWeaknessMetric,
  offPitchState,
  offPitchSignals,
  limit
} = {}) {
  const max = normalizeLimit(limit);
  const offPitch = resolveOffPitchSummary({ offPitchState, offPitchSignals });

  // Bygg en prioritert (focusId, kilde) -liste; første forekomst vinner.
  const ordered = [];
  const pushFocus = (focusId, source) => {
    if (focusId && getTrainingFocus(focusId)) ordered.push({ focusId, source });
  };

  getMatchupRelevantFocusIds(formationMatchup).forEach((id) => pushFocus(id, "matchup"));
  pushFocus(getWeaknessRelevantFocusId(lastMatchWeaknessMetric), "forrige_kamp");
  if (opponent?.id) {
    TRAINING_FOCUSES
      .filter((focus) => focus.bestAgainstOpponentStyles.includes(opponent.id))
      .forEach((focus) => pushFocus(focus.id, "motstanderprofil"));
  }
  getMetricRanking(teamFit).forEach((entry) => pushFocus(getWeaknessRelevantFocusId(entry.key), "lagsvakhet"));

  // Trygg degradering: alltid minst ett fornuftig fokus.
  if (ordered.length === 0) pushFocus("role_understanding", "standard");

  const seen = new Set();
  const suggestions = [];
  for (const { focusId, source } of ordered) {
    if (seen.has(focusId)) continue;
    seen.add(focusId);
    suggestions.push(buildTrainingSuggestion({
      focusId,
      source,
      opponent,
      formationMatchup,
      coachContext,
      lastMatchWeaknessMetric,
      offPitch,
      teamFit
    }));
    if (suggestions.length >= max) break;
  }
  return suggestions;
}

const TRAINING_SOURCE_CONFIDENCE = {
  matchup: 0.8,
  forrige_kamp: 0.7,
  motstanderprofil: 0.6,
  lagsvakhet: 0.55,
  standard: 0.4
};

function buildTrainingSuggestion({ focusId, source, opponent, formationMatchup, coachContext, lastMatchWeaknessMetric, offPitch, teamFit }) {
  const focus = getTrainingFocus(focusId);
  const support = calculateTrainingStaffSupport({ focusId, coachContext });
  const oppName = opponent?.name || "neste motstander";

  const why = [];
  const recommendedBecause = [];
  const risks = [];
  const suggestedAdjustments = [];
  const sourceSignals = ["teamFit"];
  const roleRelationWarning = asArray(teamFit?.relationships?.negativeRelations)[0];
  if (roleRelationWarning?.title) {
    suggestedAdjustments.push(`Rollehint: ${roleRelationWarning.title.toLowerCase()} — løs medspillerne rundt rollen før du bytter spiller.`);
  } else if (Number(teamFit?.metrics?.roleFitAverage) < 58) {
    suggestedAdjustments.push("Rollehint: prioriter én rolleendring som gir en spiller flere av sine foretrukne situasjoner.");
  }

  if (source === "matchup") {
    const riskTokens = asArray(formationMatchup?.risks).map((r) => r.token).filter(Boolean);
    why.push(`Matchupen mot ${oppName} er risikabel på ${riskTokens.join(", ") || "et område"}; ${focus.name.toLowerCase()} adresserer det proaktivt.`);
    recommendedBecause.push("Formasjons-matchup mot neste motstander");
    sourceSignals.push("opponent", "formationKnowledge");
  } else if (source === "forrige_kamp") {
    why.push(`Forrige kamp avslørte en svakhet (${METRIC_LABELS[lastMatchWeaknessMetric] || "et lagområde"}); ${focus.name.toLowerCase()} fikser det reaktivt.`);
    recommendedBecause.push("Svakhet avdekket i forrige kamp");
  } else if (source === "motstanderprofil") {
    why.push(`${focus.name} passer kampbildet mot ${oppName}s spillestil.`);
    recommendedBecause.push("Motstanderprofilens spillestil");
    sourceSignals.push("opponent");
  } else if (source === "lagsvakhet") {
    why.push(`Treffer et av lagets svakere kampområder; ${focus.shortDescription.toLowerCase()}`);
    recommendedBecause.push("Lagets svakeste metrikk");
  } else {
    why.push(`Et trygt generelt fokus når kampbildet er ukjent: ${focus.shortDescription.toLowerCase()}`);
    recommendedBecause.push("Generelt råd uten kjent kontekst");
  }

  recommendedBecause.push(`Treffer metrikkene: ${focus.affectedMetrics.join(", ")}`);

  if (coachContext) {
    sourceSignals.push("coachContext");
    if (support.level === "weak") {
      risks.push(`Begrenset staff-støtte (${support.label}) for dette fokuset — effekten blir mindre. Vurder å hente relevant stab.`);
    }
  } else {
    risks.push("Ingen stab er kjent ennå; treningseffekten er nøytral og lav.");
  }

  // Konfidens: kildeprioritet + staff-støtte.
  let confidence = TRAINING_SOURCE_CONFIDENCE[source] ?? 0.4;
  if (support.level === "strong") confidence += 0.1;
  else if (support.level === "medium") confidence += 0.05;
  else confidence -= 0.05;

  suggestedAdjustments.push(
    `${focus.effectHint}`,
    "Du står fritt til å velge et annet fokus — et bevisst valg mot et forventet kampbilde kan gi bedre uttelling."
  );

  // Off-pitch: et halvskjult signal om at kroppene/hodene kan trenge noe annet
  // enn det taktisk «riktige» fokuset. Forslaget får bare se det synlige laget.
  const loadConcern = offPitchConcern(offPitch, ["physical", "injury"]);
  if (loadConcern) {
    suggestedAdjustments.push(
      `Off-pitch: ${loadConcern.text} Vurder belastningen — et lettere/restituerende opplegg kan slå dette fokuset denne uka.`
    );
    sourceSignals.push("offPitch");
  }

  return makeSuggestion({
    id: `training_week:${focusId}`,
    title: focus.name,
    type: "training_week",
    summary: focus.shortDescription,
    why,
    recommendedBecause,
    risks,
    suggestedAdjustments,
    relatedTrainingFocusIds: [focusId],
    // Dypere valg: hvilke ferdige treningsprogram-komposisjoner dette fokuset
    // leder videre til. Additivt — treningsuka består som eget forslag.
    relatedProgramIds: getTrainingProgramIdsForFocus(focusId),
    confidence: clamp(confidence, 0.2, 0.95),
    sourceSignals
  });
}

// ----------------------------------------------------------------------------
// Toppnivå: alle tre forslagstypene i én forklarende pakke.
//
// Beregner formasjons-matchup for den valgte formasjonen når motstander +
// kunnskap finnes, og deler den med kampplan- og treningsgeneratorene.
// Degraderer trygt: hvert felt er alltid et (muligens kortere) array.
// ----------------------------------------------------------------------------
export function createSuggestedSetups({
  teamFit,
  formation,
  tactic,
  availableFormations,
  formationKnowledgeById,
  opponent,
  coachContext,
  lastMatchWeaknessMetric,
  offPitchState,
  offPitchSignals,
  limit
} = {}) {
  const knowledgeById = formationKnowledgeById && typeof formationKnowledgeById === "object"
    ? formationKnowledgeById
    : {};
  const currentKnowledge = formation?.id ? knowledgeById[formation.id] || null : null;
  const formationMatchup = opponent && currentKnowledge
    ? evaluateFormationMatchupVsOpponent(currentKnowledge, opponent.matchupStyles, opponent.name)
    : null;

  return {
    formation: suggestFormationSetups({
      formations: availableFormations,
      currentFormation: formation,
      formationKnowledgeById: knowledgeById,
      opponent,
      coachContext,
      teamFit,
      limit
    }),
    match_plan: suggestMatchPlanSetups({
      formation,
      tactic,
      teamFit,
      opponent,
      formationMatchup,
      coachContext,
      offPitchState,
      offPitchSignals,
      limit
    }),
    training_week: suggestTrainingWeekSetups({
      teamFit,
      opponent,
      formationMatchup,
      coachContext,
      lastMatchWeaknessMetric,
      offPitchState,
      offPitchSignals,
      limit
    })
  };
}

// Flat liste over alle forslag (praktisk for UI som viser én strøm med kort).
export function flattenSuggestedSetups(suggested) {
  if (!suggested || typeof suggested !== "object") return [];
  return [
    ...asArray(suggested.formation),
    ...asArray(suggested.match_plan),
    ...asArray(suggested.training_week)
  ];
}

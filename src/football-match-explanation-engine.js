// HG Football Manager — Match Explanation Engine v1.5
//
// Gjør kampdagen FORKLARENDE. Der kampmotoren
// (football-matchday-engine.js) regner ut xG, utfall og managergrep, tar denne
// modulen det FERDIGE kampresultatet pluss sesjonens snapshots og bygger en
// strukturert, pedagogisk forklaring på HVORFOR utfallet ble som det ble.
//
// Designprinsipp (CLAUDE.md / README pkt. 3 og 5): dette er et læringsspill, og
// misbruk skal forklares som en MANAGERFEIL, aldri som en spillersvakhet.
// Forklaringen peker derfor på konkrete årsakskjeder i de systemene som ALLEREDE
// finnes — lagfit, rollefit, relasjoner, formasjon/taktikk, treningsuke,
// off-pitch (slitasje, moral, skadefare, medietrykk …), managergrep, formasjons-
// matchup og Mini Season-kontekst — ikke på generiske sportsfraser.
//
// Modulen er ren ESM: ingen DOM, ingen fetch, ingen localStorage, ingen
// app-state, ingen sideeffekter, ingen tilfeldighet. Lik input gir byte-identisk
// output (determinisme). Den FINNER ikke opp nye datastrukturer — den leser kun
// det kampsesjonen og resultatet allerede bærer med seg. Når et datagrunnlag
// mangler (f.eks. ingen off-pitch-snapshot), utelates den kategorien stille.

import { getFormationLearningHint } from "./football-formation-knowledge-view-model.js";

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function round2(value) {
  return Math.round(num(value) * 100) / 100;
}

// Terskler for å lese en 0–100-metrikk som sterk/svak. Holdt på linje med
// kampmotorens egne grenser (≈60 = greit nivå).
const STRONG = 66;
const WEAK = 48;

const OUTCOME_LABELS = { win: "Seier", draw: "Uavgjort", loss: "Tap" };

// Hvordan hver taktisk metrikk forklares når den er sterk eller svak. Brukes til
// konkrete årsakskjeder i stedet for tall alene.
const METRIC_NARRATIVE = {
  buildUpScore: {
    label: "oppbyggingen",
    strong: "god oppbygging ga kontroll og rene angrep ut bakfra",
    weak: "skjør oppbygging gjorde laget utrygt med ball under press"
  },
  pressScore: {
    label: "presset",
    strong: "et godt samlet press satte motstanderen under trykk i første fase",
    weak: "for løst press lot motstanderen spille seg ut i ro"
  },
  restDefenseScore: {
    label: "restforsvaret",
    strong: "et solid restforsvar sikret laget mot overganger",
    weak: "et skjørt restforsvar gjorde laget sårbart for kontringer"
  },
  depthScore: {
    label: "dybdetrusselen",
    strong: "dybdeløp truet bakrommet bak forsvaret",
    weak: "lite dybdetrussel gjorde laget enkelt å forsvare seg mot"
  },
  widthScore: {
    label: "bredden",
    strong: "god bredde strakk motstanderen og åpnet rom ute",
    weak: "for lite bredde lot motstanderen stå kompakt"
  },
  balanceScore: {
    label: "balansen",
    strong: "god balanse mellom lagdelene holdt strukturen samlet",
    weak: "ubalanse mellom lagdelene åpnet rom sentralt"
  },
  relationshipScore: {
    label: "rollerelasjonene",
    strong: "gode rollerelasjoner gjorde at spillerne havnet i riktige situasjoner",
    weak: "svake rollerelasjoner lot flere roller stå isolert"
  },
  roleFitAverage: {
    label: "rolleforståelsen",
    strong: "god rollefit lot spillerne gjøre det de er best til",
    weak: "flere spillere sto i roller som ikke passet dem"
  }
};

// Rekkefølge når vi leter etter den sterkeste og svakeste metrikken.
const METRIC_KEYS = [
  "buildUpScore",
  "pressScore",
  "restDefenseScore",
  "depthScore",
  "widthScore",
  "balanceScore",
  "relationshipScore",
  "roleFitAverage"
];

// En liten faktor-samler: hver faktor har tekst og en signert vekt. Vekten
// brukes bare til å rangere de avgjørende faktorene (størst |vekt| først), ikke
// til å regne på resultatet.
function pushFactor(list, text, weight) {
  if (typeof text === "string" && text.length > 0) {
    list.push({ text, weight: num(weight) });
  }
}

function factorTexts(list, limit) {
  const texts = list.map((factor) => factor.text);
  return Number.isInteger(limit) ? texts.slice(0, limit) : texts;
}

// ---------------------------------------------------------------------------
// Taktiske faktorer: formasjon/relasjoner/metrikker/matchup/taktikkvalg.
// ---------------------------------------------------------------------------
function buildTacticalFactors({ tp, relationshipScore, formationMatchup, historicalScore, tactic, opponent, xgFor, xgAgainst }) {
  const factors = [];

  // Lagfit + relasjoner som ga kontroll i oppbyggingen (eksempel i oppgaven).
  if (num(tp.buildUpScore) >= STRONG && relationshipScore >= STRONG) {
    pushFactor(factors, "Høy lagfit og gode relasjoner ga kontroll i oppbyggingen.", 9);
  }

  // Sterk og svak kjernemetrikk hver for seg.
  const strongest = findExtremeMetric(tp, "max");
  const weakest = findExtremeMetric(tp, "min");
  if (strongest && strongest.value >= STRONG) {
    const narrative = METRIC_NARRATIVE[strongest.key];
    pushFactor(factors, `${capitalize(narrative.strong)} (${narrative.label} ${strongest.value}).`, strongest.value - 60);
  }
  if (weakest && weakest.value <= WEAK) {
    const narrative = METRIC_NARRATIVE[weakest.key];
    pushFactor(factors, `${capitalize(narrative.weak)} (${narrative.label} ${weakest.value}).`, -(60 - weakest.value));
  }

  // Formasjons-matchup mot motstanderens spillestil.
  if (isObject(formationMatchup) && formationMatchup.lean === "favourable") {
    pushFactor(factors, `Gunstig formasjons-matchup mot ${opponent?.name || "motstanderen"}: systemet passet spillestilen.`, 5);
  } else if (isObject(formationMatchup) && formationMatchup.lean === "risky") {
    pushFactor(factors, `Risikabel formasjons-matchup mot ${opponent?.name || "motstanderen"}: spillestilen traff systemets svakheter.`, -5);
  }

  // Historisk formasjonsfit.
  if (historicalScore >= 70) {
    pushFactor(factors, "Det historiske systemet passet spillerne godt og ga en tydelig identitet.", 4);
  } else if (historicalScore > 0 && historicalScore < 50) {
    pushFactor(factors, "Det historiske systemet passet spillerne dårlig — systemkravene matchet ikke troppen.", -4);
  }

  // Defensivt taktikkvalg foran sterk motstander (eksempel i oppgaven): lav
  // egen xG kombinert med lav xG mot mot en sterkere motstander leses som en
  // bevisst, risikoredusert ramme.
  const oppStrength = num(opponent?.strength);
  const defensiveTactic = ["low", "deep", "controlled"].some((token) =>
    [tactic?.pressing, tactic?.tempo].includes(token)
  );
  if (defensiveTactic && oppStrength >= 74 && xgAgainst <= 1.1 && xgFor <= 1.2) {
    pushFactor(factors, "Defensiv struktur foran en sterk motstander reduserte risikoen — selv om laget skapte mindre selv.", 3);
  }

  return factors;
}

function findExtremeMetric(tp, mode) {
  let bestKey = null;
  let bestValue = mode === "max" ? -Infinity : Infinity;
  METRIC_KEYS.forEach((key) => {
    const value = Number(tp?.[key]);
    if (!Number.isFinite(value)) return;
    if ((mode === "max" && value > bestValue) || (mode === "min" && value < bestValue)) {
      bestValue = value;
      bestKey = key;
    }
  });
  return bestKey ? { key: bestKey, value: Math.round(bestValue) } : null;
}

// ---------------------------------------------------------------------------
// Historiske stil-faktorer (Historical Opponent Archetypes v1): når motstanderen
// var en historisk arketype, surfacer den tydeligste fordelen og sårbarheten den
// historiske stilen skapte. Tekstene finnes allerede i matchup-vurderingen — vi
// rammer dem inn etter utfallet og vekter dem så de kan bli avgjørende faktorer.
// ---------------------------------------------------------------------------
function buildHistoricalFactors(historicalMatchup) {
  if (!isObject(historicalMatchup)) return [];
  const factors = [];
  const topVulnerability = asArray(historicalMatchup.vulnerabilities)[0];
  const topAdvantage = asArray(historicalMatchup.advantages)[0];

  if (topVulnerability && typeof topVulnerability.text === "string") {
    pushFactor(factors, topVulnerability.text, -6);
  }
  if (topAdvantage && typeof topAdvantage.text === "string") {
    pushFactor(factors, topAdvantage.text, 5);
  }
  return factors;
}

// ---------------------------------------------------------------------------
// Relasjonsfaktorer: surfacer den tydeligste positive og negative koblingen fra
// relasjonsmotoren. Tekstene finnes allerede (title/explanation) — vi velger og
// rammer dem inn etter utfallet.
// ---------------------------------------------------------------------------
function buildRelationshipFactors(relationships) {
  if (!isObject(relationships)) return [];
  const factors = [];
  const positives = asArray(relationships.positiveRelations)
    .slice()
    .sort((a, b) => num(b.points) - num(a.points));
  const negatives = asArray(relationships.negativeRelations)
    .slice()
    .sort((a, b) => num(b.points) - num(a.points));

  if (positives[0]) {
    pushFactor(factors, `${positives[0].title}: ${positives[0].explanation}`, 4);
  }
  if (negatives[0]) {
    pushFactor(factors, `${negatives[0].title}: ${negatives[0].explanation}`, -4);
  }
  return factors;
}

// ---------------------------------------------------------------------------
// Treningsfaktorer: ukens treningsfokus (matchday-snapshot) OG treningsprogram-
// historikken (recovery/press) sett mot kroppens tilstand. Binder treningsvalg
// til kampbildet (eksemplene «Restitusjon ga effekt fordi slitasje var høy» og
// «Pressuka slo negativt ut fordi laget var tungt fysisk»).
// ---------------------------------------------------------------------------
function buildTrainingFactors({ trainingReport, trainingFocus, offPitch }) {
  const factors = [];

  // Ukens fokus: kort dom fra rapporten (helped/summary).
  if (isObject(trainingReport) && typeof trainingReport.summary === "string") {
    pushFactor(factors, trainingReport.summary, trainingReport.helped ? 4 : -1);
  } else if (isObject(trainingFocus) && typeof trainingFocus.name === "string") {
    pushFactor(factors, `Ukens ${trainingFocus.name.toLowerCase()} ble lite testet i denne kampen.`, 0);
  }

  // Treningsprogram (recovery/press) sett mot fatigue/skadefare.
  if (isObject(offPitch)) {
    const programIds = asArray(offPitch.recentTrainingProgramIds);
    const fatigue = Math.max(num(offPitch.fatigue), num(offPitch.wear));
    const injuryRisk = num(offPitch.injuryRisk);
    const ranRecovery = programIds.some((id) => /recovery|restitusjon|prevention/i.test(String(id)));
    const ranPress = programIds.some((id) => /press/i.test(String(id)));

    if (ranRecovery && fatigue <= 35) {
      pushFactor(factors, "Restitusjonsuka roet kroppene: lav slitasje ga overskudd å spille på.", 4);
    } else if (ranPress && fatigue >= 60) {
      pushFactor(factors, "Pressuka slo negativt ut: laget var allerede tungt fysisk og tappet seg ut.", -5);
    } else if (ranPress && fatigue <= 35) {
      pushFactor(factors, "Pressuka ga uttelling: friske bein tålte den høye intensiteten.", 4);
    } else if (!ranRecovery && injuryRisk >= 60) {
      pushFactor(factors, "Høy skadefare ble ikke adressert med restitusjon — en hard uke kan straffe seg.", -3);
    }
  }

  return factors;
}

// ---------------------------------------------------------------------------
// Off-pitch-faktorer: mennesket rundt taktikken. Moral, selvtillit, samhold,
// medie-/styrepress og fysisk tilstand. Den vage skjulte uroen vises som hint,
// aldri som tall (off-pitch-modulens hidden-prinsipp).
// ---------------------------------------------------------------------------
function buildOffPitchFactors({ offPitch, outcome, concededGoals }) {
  if (!isObject(offPitch)) return [];
  const factors = [];

  const morale = num(offPitch.morale);
  const confidence = num(offPitch.confidence);
  const cohesion = num(offPitch.cohesion);
  const mediaPressure = num(offPitch.mediaPressure);
  const boardPressure = num(offPitch.boardPressure);
  const fatigue = Math.max(num(offPitch.fatigue), num(offPitch.wear));
  const injuryRisk = num(offPitch.injuryRisk);

  // Lav moral + høyt medietrykk gjorde laget sårbart etter baklengsmål
  // (eksempel i oppgaven) — relevant særlig når laget faktisk slapp inn mål.
  if (morale <= 42 && mediaPressure >= 60 && concededGoals > 0) {
    pushFactor(factors, "Lav moral og høyt medietrykk gjorde laget mer sårbart etter baklengsmål.", -6);
  } else if (morale >= 66 && confidence >= 62) {
    pushFactor(factors, "Høy moral og selvtillit gjorde laget tøffere i de viktige øyeblikkene.", 5);
  } else if (morale <= 42) {
    pushFactor(factors, "Lav moral i gruppa tappet laget for energi i pressede faser.", -4);
  }

  if (cohesion <= 40) {
    pushFactor(factors, "Splittet garderobe svekket samspillet når det røynet på.", -3);
  }

  if (boardPressure >= 66 && outcome === "loss") {
    pushFactor(factors, "Høyt styrepress la en ekstra byrde på laget i en kamp som måtte vinnes.", -3);
  }

  if (fatigue >= 62) {
    pushFactor(factors, "Tunge kropper (høy slitasje) gjorde laget seinere i duellene utover i kampen.", -4);
  } else if (fatigue <= 28 && injuryRisk <= 25) {
    pushFactor(factors, "Friske, opplagte kropper ga laget overskudd hele veien.", 3);
  }

  // Skjult uro: synlig at noe er der, aldri hva.
  if (typeof offPitch.hiddenHint === "string" && offPitch.hiddenHint.length > 0) {
    pushFactor(factors, offPitch.hiddenHint, -1);
  }

  return factors;
}

// ---------------------------------------------------------------------------
// Managergrep som avgjørende bidrag: beste/svakeste grep fra sluttrapporten.
// ---------------------------------------------------------------------------
function buildDecisionFactors({ bestDecision, worstDecision, positiveCount, negativeCount }) {
  const factors = [];
  if (positiveCount >= 2 && bestDecision?.label) {
    pushFactor(factors, `Gode managergrep underveis — særlig «${bestDecision.label}» (${bestDecision.eventTitle}).`, 5);
  } else if (bestDecision?.label && positiveCount >= 1) {
    pushFactor(factors, `Grepet «${bestDecision.label}» (${bestDecision.eventTitle}) løftet laget i en nøkkelsituasjon.`, 3);
  }
  if (negativeCount >= 2 && worstDecision?.label) {
    pushFactor(factors, `Flere feilslåtte grep — særlig «${worstDecision.label}» (${worstDecision.eventTitle}) kostet kontroll.`, -5);
  } else if (worstDecision?.label && worstDecision.tone === "negative") {
    pushFactor(factors, `Grepet «${worstDecision.label}» (${worstDecision.eventTitle}) slo feil og åpnet kampen.`, -3);
  }
  return factors;
}

// ---------------------------------------------------------------------------
// Læringspunkter: den pedagogiske kjernen. Syntetiserer den viktigste
// årsakskjeden til et konkret, men ÅPENT råd — formulert slik at spilleren kan
// gjøre et annet bevisst valg neste gang (ikke en fasit).
// ---------------------------------------------------------------------------
function buildLearningPoints({ outcome, tp, relationshipScore, weakest, strongest, worstDecision, offPitch, concededGoals, matchup, historicalMatchup, formationKnowledge }) {
  const points = [];

  // Historisk stil-læringspunkt: den pedagogiske kjernen i å møte en historisk
  // arketype. Settes først så den ikke fortrenges av garantien nederst.
  if (isObject(historicalMatchup) && typeof historicalMatchup.historicalLearningPoint === "string" && historicalMatchup.historicalLearningPoint.length > 0) {
    points.push(historicalMatchup.historicalLearningPoint);
  }

  const formationHint = getFormationLearningHint(formationKnowledge);
  if (formationHint) {
    points.push(`Formasjonslæring: ${formationHint}`);
  }

  if (outcome === "win" && num(tp.buildUpScore) >= STRONG && relationshipScore >= STRONG) {
    points.push(
      "Da rollene støttet hverandre, fløt oppbyggingen nesten av seg selv. Husk at det var relasjonene og rollefiten — ikke bare enkeltspillernes klasse — som ga kontrollen."
    );
  }

  if (weakest && weakest.value <= WEAK) {
    const narrative = METRIC_NARRATIVE[weakest.key];
    if (weakest.key === "restDefenseScore" && concededGoals > 0) {
      points.push(
        "Laget slapp inn for lett. Et tryggere restforsvar — eller én back som blir lavere i angrep — kunne holdt igjen uten å miste alt fremover. Det er et bevisst valg, ikke en spillersvakhet."
      );
    } else {
      points.push(
        `Svakest var ${narrative.label}. Vurder en rolle, en relasjon eller et treningsfokus som styrker den — eller en taktikk som gjør den mindre viktig. Spilleren er god nok; spørsmålet er hvordan du bruker ham.`
      );
    }
  }

  if (worstDecision?.label && worstDecision.tone === "negative") {
    points.push(
      `Grepet «${worstDecision.label}» satt ikke denne gangen. I en lignende situasjon kan et roligere alternativ med bedre dekning være tryggere — les hva laget faktisk hadde grunnlag for.`
    );
  }

  if (isObject(offPitch)) {
    const morale = num(offPitch.morale);
    const mediaPressure = num(offPitch.mediaPressure);
    if (morale <= 42 && mediaPressure >= 60) {
      points.push(
        "Konteksten utenfor banen dro ned: lav moral og høyt medietrykk gjør laget skjørt. En stabiliserende uke eller en tryggere ramme kan være mer verdt enn et offensivt grep akkurat nå."
      );
    }
  }

  if (isObject(matchup) && matchup.lean === "risky" && asArray(matchup.suggestions).length > 0) {
    points.push(
      `Spillestilen til motstanderen traff systemets svakhet. ${matchup.suggestions[0]}`
    );
  }

  // Garanti: alltid minst ett læringspunkt, selv i en helt jevn kamp.
  if (points.length === 0) {
    if (strongest && strongest.value >= STRONG) {
      const narrative = METRIC_NARRATIVE[strongest.key];
      points.push(
        `Lagets sterkeste kort var ${narrative.label}. Bygg kampplanen rundt det laget allerede er godt på, så slipper enkeltspillerne å redde et opplegg som ikke passer dem.`
      );
    } else {
      points.push(
        "Kampen var jevn og avgjort på marginer. Se etter ett konkret område — en relasjon, en rolle eller et treningsfokus — du kan løfte til neste kamp."
      );
    }
  }

  return points.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Forslag til neste uke: gjenbruker rapportens treningsråd og History Go-hint,
// og legger til off-pitch- og matchup-baserte forslag. Åpne forslag, ikke krav.
// ---------------------------------------------------------------------------
function buildNextWeekSuggestions({ result, offPitch, matchup }) {
  const suggestions = [];

  if (typeof result.nextWeekAdvice === "string" && result.nextWeekAdvice.length > 0) {
    suggestions.push(result.nextWeekAdvice);
  }

  if (isObject(offPitch)) {
    const fatigue = Math.max(num(offPitch.fatigue), num(offPitch.wear));
    const injuryRisk = num(offPitch.injuryRisk);
    const morale = num(offPitch.morale);
    if (fatigue >= 60 || injuryRisk >= 55) {
      suggestions.push("Vurder en restitusjonsuke: kroppene er tunge og skadefaren er forhøyet.");
    } else if (morale <= 42) {
      suggestions.push("Vurder en uke som bygger moral og samhold før neste kamp.");
    }
  }

  if (isObject(matchup) && matchup.lean === "risky") {
    asArray(matchup.suggestions).slice(0, 1).forEach((suggestion) => suggestions.push(suggestion));
  }

  if (typeof result.historyGoHint === "string" && result.historyGoHint.length > 0) {
    suggestions.push(result.historyGoHint);
  }

  // Dedupliser og hold listen kort.
  return [...new Set(suggestions)].slice(0, 4);
}

// ---------------------------------------------------------------------------
// Hovedfunksjon: bygg hele forklaringen fra et fullført resultat + sesjonen.
//
// Inndata leses fleksibelt: { result, session } der session bærer snapshotene
// kampmotoren allerede lagde (teamFitSnapshot, strengthSnapshot, coachSnapshot,
// trainingFocus, formationMatchup) pluss valgfrie offPitchSnapshot/
// relationshipSnapshot som app.js legger på ved kampstart. Mangler session
// brukes kun resultatets egne felter — forklaringen blir tynnere, men gyldig.
// ---------------------------------------------------------------------------
export function buildMatchExplanation({ result, session } = {}) {
  if (!isObject(result)) {
    return null;
  }

  const sess = isObject(session) ? session : {};
  const tp = sess.teamFitSnapshot?.tacticalProfile || {};
  const relationships = isObject(sess.relationshipSnapshot) ? sess.relationshipSnapshot : null;
  const offPitch = isObject(sess.offPitchSnapshot) ? sess.offPitchSnapshot : null;
  const matchup = isObject(sess.formationMatchup) ? sess.formationMatchup : result.formationMatchup || null;
  const historicalMatchup = isObject(sess.historicalMatchup)
    ? sess.historicalMatchup
    : isObject(result.historicalMatchup)
      ? result.historicalMatchup
      : null;
  const historicalScore = num(sess.teamFitSnapshot?.historicalScore);
  const tactic = sess.tacticSnapshot || result.tacticSnapshot || {};

  const outcome = ["win", "draw", "loss"].includes(result.outcome) ? result.outcome : "draw";
  const score = result.score || { for: 0, against: 0 };
  const goalsFor = num(score.for);
  const goalsAgainst = num(score.against);
  const xgFor = round2(result.expectedGoals?.for);
  const xgAgainst = round2(result.expectedGoals?.against);
  const teamStrength = num(result.teamStrength);
  const opponent = result.opponent || {};
  const oppStrength = num(opponent.strength);
  const relationshipScore = relationships ? num(relationships.relationshipScore) : num(tp.relationshipScore);

  const decisions = asArray(result.decisions);
  const positiveCount = decisions.filter((decision) => decision?.tone === "positive").length;
  const negativeCount = decisions.filter((decision) => decision?.tone === "negative").length;

  const strongest = findExtremeMetric(tp, "max");
  const weakest = findExtremeMetric(tp, "min");

  // --- Kategoriserte faktorer ---
  const tacticalFactors = buildTacticalFactors({
    tp,
    relationshipScore,
    formationMatchup: matchup,
    historicalScore,
    tactic,
    opponent,
    xgFor,
    xgAgainst
  });
  const relationshipFactors = buildRelationshipFactors(relationships);
  const historicalFactors = buildHistoricalFactors(historicalMatchup);
  const trainingFactors = buildTrainingFactors({
    trainingReport: result.trainingFocus,
    trainingFocus: sess.trainingFocus,
    offPitch
  });
  const offPitchFactors = buildOffPitchFactors({ offPitch, outcome, concededGoals: goalsAgainst });
  const decisionFactors = buildDecisionFactors({
    bestDecision: result.bestDecision,
    worstDecision: result.worstDecision,
    positiveCount,
    negativeCount
  });

  // --- Avgjørende faktorer: styrkeforskjell + de tyngste bidragene på tvers ---
  const decisiveCandidates = [];
  const strengthGap = teamStrength - oppStrength;
  if (oppStrength > 0) {
    if (strengthGap >= 8) {
      pushFactor(decisiveCandidates, `Lagstyrke klart over motstanderen (${teamStrength} mot ${oppStrength}) la grunnlaget.`, 8);
    } else if (strengthGap <= -8) {
      pushFactor(decisiveCandidates, `Lagstyrke under motstanderen (${teamStrength} mot ${oppStrength}) gjorde oppgaven tyngre.`, -8);
    } else {
      pushFactor(decisiveCandidates, `Jevn styrke mot motstanderen (${teamStrength} mot ${oppStrength}) — detaljene avgjorde.`, 2);
    }
  }
  [tacticalFactors, historicalFactors, decisionFactors, offPitchFactors, relationshipFactors, trainingFactors].forEach((list) => {
    list.forEach((factor) => decisiveCandidates.push(factor));
  });
  const decisiveFactors = decisiveCandidates
    .slice()
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 5)
    .map((factor) => factor.text);

  // --- Resultatsammendrag ---
  const outcomeLabel = OUTCOME_LABELS[outcome];
  const xgDiff = xgFor - xgAgainst;
  let deservedNote;
  if (outcome === "win" && xgDiff < 0) {
    deservedNote = "Marginene var i lagets favør — sjansebildet (xG) tilsa en jevnere kamp.";
  } else if (outcome === "loss" && xgDiff > 0) {
    deservedNote = "Sjansebildet (xG) var i lagets favør, men uttellingen uteble.";
  } else if (outcome === "win") {
    deservedNote = "Seieren var fortjent ut fra sjansebildet (xG).";
  } else if (outcome === "loss") {
    deservedNote = "Sjansebildet (xG) bekreftet at motstanderen var farligst.";
  } else {
    deservedNote = "Et jevnt sjansebilde (xG) ga et rettferdig delt resultat.";
  }
  const resultSummary = `${outcomeLabel} ${goalsFor}–${goalsAgainst} (xG ${xgFor.toFixed(2)}–${xgAgainst.toFixed(2)}). ${deservedNote}`;

  // --- Hovedoverskrift: utfall + den tydeligste avgjørende årsaken ---
  const leadCause = decisiveFactors[0] || result.formationVerdict || "kampen ble avgjort på små marginer.";
  const headline = `${outcomeLabel} ${goalsFor}–${goalsAgainst}: ${decapitalize(leadCause)}`;

  // --- Læringspunkter og forslag ---
  const learningPoints = buildLearningPoints({
    outcome,
    tp,
    relationshipScore,
    weakest,
    strongest,
    worstDecision: result.worstDecision,
    offPitch,
    concededGoals: goalsAgainst,
    matchup,
    historicalMatchup,
    formationKnowledge: sess.formationKnowledge || result.formationKnowledge || null
  });
  const nextWeekSuggestions = buildNextWeekSuggestions({ result, offPitch, matchup });

  return {
    version: 1,
    headline,
    resultSummary,
    decisiveFactors,
    tacticalFactors: factorTexts(tacticalFactors, 5),
    historicalFactors: factorTexts(historicalFactors, 4),
    trainingFactors: factorTexts(trainingFactors, 4),
    offPitchFactors: factorTexts(offPitchFactors, 4),
    relationshipFactors: factorTexts(relationshipFactors, 4),
    learningPoints,
    nextWeekSuggestions
  };
}

// Stor forbokstav på en selvstendig narrativ-klausul (klausulene er skrevet med
// liten forbokstav slik at de kan gjenbrukes midt i setninger).
function capitalize(text) {
  const str = String(text || "");
  return str.length === 0 ? str : str.charAt(0).toUpperCase() + str.slice(1);
}

// Liten tekst-hjelper: gjør første tegn til liten bokstav slik at en faktor kan
// settes inn midt i en setning uten å skurre. Lar forkortelser (xG) og tall stå.
function decapitalize(text) {
  const str = String(text || "");
  if (str.length === 0) return str;
  if (/^[A-ZÆØÅ][a-zæøå]/.test(str.slice(0, 2))) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
  return str;
}

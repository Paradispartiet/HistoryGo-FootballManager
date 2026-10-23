// Read-only coaching for the four real sessions in the selected training
// program. No catalog, no editable exercises, no alternate training engine.
// Session intensity, duration, objectives and effects remain owned by the
// existing composition and player-condition engines.

function text(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const INTENSITY = Object.freeze({ low: "Lav belastning", medium: "Moderat belastning", high: "Høy belastning" });

export function summarizeTrainingReadiness(conditions = []) {
  const entries = (Array.isArray(conditions) ? conditions : []).filter((entry) => entry && typeof entry === "object");
  const injured = entries.filter((entry) => Number(entry.injury?.weeksOut) > 0);
  const available = entries.filter((entry) => !(Number(entry.injury?.weeksOut) > 0));
  const tired = available.filter((entry) => Number(entry.load) > 50);
  const trackedLoads = available
    .map((entry) => Number(entry.load))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 100)
    .sort((a, b) => b - a);
  // The worst-loaded small group matters to exercise participation. This is a
  // bounded *signal* for ranking existing programs, not a new fatigue model.
  const topLoads = trackedLoads.slice(0, Math.min(5, trackedLoads.length));
  return {
    tracked: entries.length,
    injured: injured.length,
    tired: tired.length,
    fatigueRisk: topLoads.length ? clamp(topLoads.reduce((sum, n) => sum + n, 0) / topLoads.length / 100, 0, 1) : null
  };
}

function exerciseForSession(session = {}, { tacticName = "", opponentStyle = "", readiness = null } = {}) {
  const phrase = [session.focusId, session.title].map(text).join(" ");
  const versusHighPress = /høy.?press|high.?press|aggressiv.?press|gjenvinn/i.test(opponentStyle);
  const versusLowBlock = /lav.?blokk|low.?block|kompakt.?forsvar/i.test(opponentStyle);
  const versusCounter = /kontring|counter.?attack|omstilling|transition/i.test(opponentStyle);
  const tacticalPress = /høy.?press|pressing|gjenvinn/i.test(tacticName);
  const wornDown = Number(readiness?.tired) > 0;
  if (/restitu|recovery|mobilit|skadeforebygg|injury_prevention|bevegelighet/i.test(phrase)) {
    return wornDown
      ? "Rolig mobilitet og kontrollert teknikk, med differensiert oppfølging av slitne spillere."
      : "Rolig mobilitet, teknikk og skadeforebyggende arbeid i små grupper.";
  }
  if (/avslut|finishing|skudd|boks|sjanse/i.test(phrase)) {
    return versusLowBlock
      ? "Angrip etablert, kompakt forsvar: skap overtall på siden og avslutt fra boksrom."
      : "Kampnære angrep som ender med sistepasning og avslutning mot mål.";
  }
  if (/høyt press|pressing|pressutløs|motpress|counterpress|gjenvinn/i.test(phrase)) {
    return tacticalPress
      ? "Samordnet høy gjenvinning: første pressledd går, neste stenger pasningslinjene."
      : "Retningsbestemt spill: én tydelig pressutløser, støtte fra neste ledd og gjenvinning.";
  }
  if (/restforsvar|rest_defence|transition|omstilling|kontring|sikring/i.test(phrase)) {
    return versusCounter
      ? "Angrip med sikringsledd på plass og forsvar en direkte kontring umiddelbart ved balltap."
      : "Spill mot mål med umiddelbar omstilling ved balltap og tydelig sikring.";
  }
  if (/oppbygg|build_up|keeper|distribusjon|tredjemann|pressmotstand|pasning/i.test(phrase)) {
    return versusHighPress
      ? "Spill ut fra keeper under simulert høyt press med støttevinkler og tredjemann."
      : "Spill ut fra bakre ledd mot press, med støttevinkler og tredje spiller.";
  }
  if (/rolle|formasjon|lagform|shape|kompakt|struktur|blokk|fase/i.test(phrase)) {
    return "Kampnær lagdelstrening: stopp, korriger avstander og start situasjonen igjen.";
  }
  if (/bredde|ving|overlapp|innlegg|width/i.test(phrase)) {
    return "Retningsbestemt angrep med breddeholder og løp inn i mellomrom eller boks.";
  }
  if (/hurtighet|styrke|fysisk|eksplosiv|utholden/i.test(phrase)) {
    return "Korte spillnære repetisjoner med retningsforandringer og kontrollert pause.";
  }
  // A safe fallback based on the real authored objective; never invent a
  // stand-alone exercise whose content is absent from the selected session.
  return text(session.tacticalObjective) || "Spillnær økt med ett tydelig fokus fra ukas program.";
}

export function createContextualTrainingSessions(program, {
  tactic = null,
  opponent = null,
  readiness = null,
  selectedFocusId = null
} = {}) {
  if (!program || !Array.isArray(program.sessions)) return [];
  const tacticName = text(tactic?.name || tactic?.label);
  const opponentName = text(opponent?.name || opponent?.displayName);
  const opponentStyle = text(opponent?.styleName || opponent?.archetypeName);
  const signals = new Set(Array.isArray(program.sourceSignals) ? program.sourceSignals : []);
  const tired = Math.max(0, Number(readiness?.tired) || 0);
  const injured = Math.max(0, Number(readiness?.injured) || 0);
  const focusAligned = selectedFocusId && (program.relatedTrainingFocusIds || []).includes(selectedFocusId);
  return program.sessions.slice(0, 4).map((session) => {
    const exercise = exerciseForSession(session, { tacticName, opponentStyle, readiness });
    const objective = text(session.tacticalObjective);
    const nextOpponent = opponentName
      ? `Mot ${opponentName}${opponentStyle ? ` (${opponentStyle})` : ""}: knytt dette til kampforberedelsen.`
      : "Neste motstander er ikke klar; bruk lagets valgte spillprinsipp.";
    const tacticNote = tacticName
      ? `Lagets kampplan: ${tacticName}.`
      : "Bruk lagets valgte kampplan når dere utfører økta.";
    const relevance = [
      objective || "Økta følger det valgte treningsprogrammet.",
      tacticNote,
      nextOpponent
    ].join(" ");
    let load = INTENSITY[session.intensity] || "Belastning fra valgt program";
    if (tired || injured) {
      load += `. ${tired} slitne og ${injured} skadde: vurder deltakelse og individuelt tilpasset belastning.`;
      if (session.intensity === "high") load += " Vurder ekstra hvile før en hard økt.";
    }
    const contextualBasis = [
      tacticName ? "taktikk" : null,
      opponentName && signals.has("opponent") ? "motstander" : null,
      (tired || injured || Number(readiness?.fatigueRisk) > .4) ? "troppstilstand" : null,
      focusAligned ? "ukas fokus" : null
    ].filter(Boolean);
    return {
      ...session,
      exercise,
      relevance,
      load,
      contextualBasis: contextualBasis.length ? contextualBasis.join(" · ") : "valgt program",
      source: "selected-program"
    };
  });
}

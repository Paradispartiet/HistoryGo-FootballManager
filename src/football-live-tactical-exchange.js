// Explicit, deterministic tactical behaviours AFTER a simulated opponent adjustment.
// These describe game-model hypotheses, never documented historical tracking data.
// Without a known in-match behaviour, the 18-plan model remains unchanged.
// An opponent adjustment is an intention, NOT evidence that every defender
// moves in unison. Only infer cover when the historical/style snapshot has
// actual structure AND spacing proxies. All thresholds are game hypotheses.
export const LIVE_OPPONENT_BEHAVIOURS = Object.freeze({
  push_up: Object.freeze({
    pressDirection: "outside_in",
    pressCoordination: "unknown",
    passingLaneCover: "unknown",
    blockSpacing: "stretched",
    restDefense: "unknown"
  }),
  sit_back: Object.freeze({
    pressDirection: "passive",
    pressCoordination: "passive",
    passingLaneCover: "unknown",
    blockSpacing: "compact",
    restDefense: "unknown"
  })
});

const measured = (value) => typeof value === "number" && Number.isFinite(value);

// These are deliberately conditional scouting proxies, NOT a tracking model.
// A raised defensive line is compatible with good or bad collective press.
// An opponent with missing quality/shape evidence never gets free perfect cover.
export function behaviourForOpponentAdjustment(adjustmentId, opponent) {
  const model = LIVE_OPPONENT_BEHAVIOURS[adjustmentId];
  if (!model) return null;
  const structure = measured(opponent?.defensiveStructure)
    ? opponent.defensiveStructure
    : opponent?.styleTraits?.defensiveStructure;
  const compactness = opponent?.styleTraits?.defensiveCompactness;
  const highLine = opponent?.styleTraits?.highLine;
  const coordinated = measured(structure) && measured(compactness)
    && structure >= 75 && compactness >= 64;
  const sparse = measured(structure) && structure < 60;
  const resistance = measured(opponent?.pressResistance)
    ? opponent.pressResistance : opponent?.styleTraits?.pressResistance;
  const possession = opponent?.styleTraits?.possessionControl ?? opponent?.possessionControl;
  const transition = opponent?.styleTraits?.transitionThreat ?? opponent?.transitionThreat;
  const pairSignal = (a, b, highA, highB, lowA, lowB, highLabel, lowLabel) =>
    !measured(a) || !measured(b) ? "unknown"
      : a >= highA && b >= highB ? highLabel
      : a <= lowA && b <= lowB ? lowLabel : "unknown";
  const signals = {
    // Mechanism-specific proxy pairs avoid conflating one high rating
    // with a real press trap, aerial duel, overload or outlet.
    wideShift: pairSignal(structure, compactness, 80, 68, 55, 55, "covered", "open"),
    pressEscape: pairSignal(resistance, possession, 78, 68, 52, 52, "supported", "isolated"),
    secondBall: pairSignal(structure, compactness, 80, 70, 55, 55, "covered", "loose"),
    targetDuel: pairSignal(structure, compactness, 82, 75, 54, 55, "double", "single"),
    boxCover: pairSignal(structure, compactness, 80, 75, 54, 55, "protected", "unprotected"),
    counterOutlet: pairSignal(transition, resistance, 78, 65, 50, 55, "available", "isolated"),
    centralPocket: pairSignal(possession, resistance, 77, 70, 50, 55, "available", "blocked")
  };
  if (adjustmentId === "push_up") {
    return {
      ...model, ...signals,
      pressCoordination: coordinated ? "collective" : sparse ? "individual" : "unknown",
      passingLaneCover: coordinated ? "central" : sparse ? "none" : "unknown",
      restDefense: measured(highLine) && highLine >= 72 && sparse
        ? "exposed" : "unknown"
    };
  }
  return {
    ...model, ...signals,
    passingLaneCover: coordinated ? "central" : "unknown",
    restDefense: measured(structure) && measured(compactness)
      && structure >= 75 && compactness >= 64 ? "secured" : "unknown"
  };
}

// Shared, explicit pressing-escape evidence. A specific observed isolation
// overrides a more general authored outlet route. Neither missing scouting
// nor an unknown route is proof that the press can be escaped.
const AUTHORED_PRESS_ESCAPE_ROUTES = new Set(["third_man", "switch_play", "direct"]);
export function resolvePressEscapeEvidence(shape) {
  if (shape?.pressEscape === "supported" || shape?.pressEscape === "isolated") {
    return shape.pressEscape;
  }
  return AUTHORED_PRESS_ESCAPE_ROUTES.has(shape?.pressEscapeRoute)
    ? "supported" : null;
}

// First vertical slice of tactical movement/decision resolution. The steps
// represent interacting positional decisions, NOT observed player coordinates.
// Countering one dependency blocks the whole chain; four actions are never
// four independent xG bonuses. No phantom historical player skill is created.
export function evaluateLiveTacticalExchange(pattern, opponent) {
  const shape = opponent?.tacticalBehaviour;
  if (!shape || !pattern) return null;

  const knownCover = ["central", "wide", "none"].includes(shape.passingLaneCover);
  const knownCoordination = ["collective", "individual", "passive"].includes(shape.pressCoordination);
  const activeCentralCover = knownCover && knownCoordination &&
    shape.passingLaneCover === "central" &&
    (shape.pressCoordination === "collective" || shape.blockSpacing === "compact");

  if (["patient_build_up", "central_possession_4231"].includes(pattern.tacticId)) {
    if (!knownCover || !knownCoordination) return null;
    const isPatient = pattern.tacticId === "patient_build_up";
    const blocked = activeCentralCover;
    const stepLabels = isPatient
      ? ["Inviter første pressledd", "Skap vinkel via keeper og støtte",
        "Finn fri sekser/tredjemann", "Spill forbi presset med neste løp"]
      : ["Bind førstepresset", "Skap et avlegg", "Finn tredjemann mellom ledd",
        "Angrip rommet bak neste ledd"];
    return {
      status: blocked ? "countered" : "advantage",
      cause: blocked
        ? "Kollektiv sentral pasningsdekning stenger forbindelsen til tredjemann."
        : "Sentral pasningsvei er fri; intensitet alene bryter ikke tredjemannskjeden.",
      steps: stepLabels.map((action, index) => ({
        action,
        result: blocked && index >= 2 ? "blocked" : "available"
      })),
      failureConsequence: blocked
        ? "Forsøket må avbrytes eller spilles ut av sonen; en tvungen sentral pasning kan gi balltap."
        : null,
      managerObservation: "Sjekk samtidig press på ballfører, dekning av sekser og fri tredjemann.",
      evidence: { ...shape }
    };
  }

  if (["direct_counter_442", "low_block_transition_541"].includes(pattern.tacticId)) {
    if (!["secured", "exposed"].includes(shape.restDefense)) return null;
    const blocked = shape.restDefense === "secured";
    return {
      status: blocked ? "countered" : "advantage",
      cause: blocked
        ? "Motstanderens restforsvar dekker første vertikale pasning og løpet bak."
        : "Motstanderens høye angrep etterlater et ubeskyttet overgangsrom.",
      steps: [
        { action: "Vinn ball og orienter fremover", result: "available" },
        { action: "Se etter første vertikale pasning", result: blocked ? "blocked" : "available" },
        { action: "Angrip bakrom med støtteløp", result: blocked ? "blocked" : "available" },
        { action: "Fullfør før blokken rekker tilbake", result: blocked ? "blocked" : "available" }
      ],
      failureConsequence: blocked
        ? "Forsert overgang kan gi raskt balltap og nytt motstandertrykk."
        : null,
      managerObservation: "Se om første pasning og to fremoversprinter finnes før laget forlater sikringsposisjonene.",
      evidence: { ...shape }
    };
  }


  // Remaining fourteen authored plans, resolved against distinct mechanisms.
  // 'Observed' here means a stated simulated shape, never a historic tracking
  // observation. Each chain has one dependency that can stop later actions.
  const rule = LIVE_EXCHANGE_RULES[pattern.tacticId];
  if (rule) {
    const observed = shape[rule.signal];
    if (observed !== rule.counterValue && observed !== rule.freeValue) return null;
    const blocked = observed === rule.counterValue;
    return {
      status: blocked ? "countered" : "advantage",
      cause: blocked ? rule.counterExplanation : rule.freeExplanation,
      steps: pattern.moves.map((action, index) => ({
        action, result: blocked && index >= rule.breakAt ? "blocked" : "available"
      })),
      failureConsequence: blocked ? rule.failure : null,
      managerObservation: rule.observe,
      evidence: { ...shape }
    };
  }

  return null;
}

// Each rule encodes ONE relevant opponent counter and the ensuing limitation.
// Triggers and skill prerequisites still live in TACTICAL_SEQUENCES; this does
// not claim that every favourable signal produces a real goal or recovery.
export const LIVE_EXCHANGE_RULES = Object.freeze({
  positional_overloads: {
    signal: "wideShift", counterValue: "covered", freeValue: "open", breakAt: 2,
    counterExplanation: "Samordnet sideforskyvning lukker mottakeren på motsatt side før vendingen.",
    freeExplanation: "Motstanderens svake sidesikring gir en mulig fri kant etter vending.",
    failure: "Et forutsigbart sideskifte kan brytes og gi overgang imot.",
    observe: "Følg både ballside-overtallet, vendingens tid og mottakeren på svak side."
  },
  high_press_343: {
    signal: "pressEscape", counterValue: "supported", freeValue: "isolated", breakAt: 2,
    counterExplanation: "Motstanderen har et støttet pasningsledd som spiller gjennom pressfellen.",
    freeExplanation: "Mottakeren mangler støtten som kreves for å bryte et koordinert press.",
    failure: "Presset blir overspilt og kan åpne rom bak den fremste vingbacken.",
    observe: "Se om fremste presser støttes av dekning, midtbane og en sikret bakre linje."
  },
  counter_press_recovery: {
    signal: "pressEscape", counterValue: "supported", freeValue: "isolated", breakAt: 2,
    counterExplanation: "Rettvendt støtte og neste pasning spiller forbi gjenvinningspresset.",
    freeExplanation: "Motstanderen mangler utspillsstøtte i første overgang.",
    failure: "Mislykket gjenvinning kan åpne større kontringsrom enn det opprinnelige angrepet.",
    observe: "Se etter nærmeste ballpresser, stengte utpasninger og sikring bak dem."
  },
  midfield_press_trap: {
    signal: "pressEscape", counterValue: "supported", freeValue: "isolated", breakAt: 2,
    counterExplanation: "En støttet mottaker vender ut av midtbanefellen med neste pasning.",
    freeExplanation: "Uten tilgjengelig støtte kan en styrt sentral pasning fanges.",
    failure: "Fellen åpnes når mottaker kan vende før neste forsvarer har flyttet.",
    observe: "Kontroller pressutløser, støttevinkel og om bakre lagdel skyver samtidig."
  },
  deep_block_long_release: {
    signal: "secondBall", counterValue: "covered", freeValue: "loose", breakAt: 2,
    counterExplanation: "Motstanderens sikringsledd kontrollerer nedfallsrommet etter langballen.",
    freeExplanation: "Det finnes et åpent nedfallsrom for laget som spiller direkte.",
    failure: "En klarering uten andreballstøtte gir et nytt angrep imot.",
    observe: "Se hvem som konkurrerer om første ball og hvem som står klar for nedfallet."
  },
  direct_second_balls: {
    signal: "secondBall", counterValue: "covered", freeValue: "loose", breakAt: 2,
    counterExplanation: "Deres midtbane dekker nedfallsrommet og stopper andreballskjeden.",
    freeExplanation: "Åpent nedfallsrom lar støttespilleren sette neste pasning.",
    failure: "Tap av både første og andre ball kan gi vedvarende motstandertrykk.",
    observe: "Vurder duellstøtte, avstand fra mottaker og motstanderens balanse bak ballen."
  },
  target_man_focus: {
    signal: "targetDuel", counterValue: "double", freeValue: "single", breakAt: 1,
    counterExplanation: "Mottaksspissen blir fanget av samtidig duellpress og sikring.",
    freeExplanation: "En isolert forsvarer kan gi rom til avlegg og tredje løp.",
    failure: "Uten rent avlegg blir midtbanen stående bak ballen under et mulig brudd.",
    observe: "Se om spissen får vendt eller lagt av, og om tredje løper faktisk har fart."
  },
  wide_fast_433: {
    signal: "wideShift", counterValue: "covered", freeValue: "open", breakAt: 2,
    counterExplanation: "Kollektiv sidesikring stopper kantens førstevending før boksløpene.",
    freeExplanation: "En utilstrekkelig forskyvning gir kantspilleren isolasjon og tid.",
    failure: "En innestengt kantspiller kan miste ballen ved sidelinja.",
    observe: "Følg forsvarende back, nærmeste sikringsspiller og støtte bak kanten."
  },
  crossing_box_presence: {
    signal: "boxCover", counterValue: "protected", freeValue: "unprotected", breakAt: 2,
    counterExplanation: "Førsteduell og romsikring i boksen bryter innleggets mottakskjede.",
    freeExplanation: "Mangelfull bokssikring kan gi rom for ulike angriperløp.",
    failure: "Mange innlegg uten timing eller sikring kan gi farlige klareringsoverganger.",
    observe: "Se om fremste stolpe, straffemerket og returommet har støtte i riktig øyeblikk."
  },
  overlap_channels: {
    signal: "counterOutlet", counterValue: "available", freeValue: "isolated", breakAt: 3,
    counterExplanation: "En fri kontringsmottaker kan angripe rommet bak den høye backen.",
    freeExplanation: "Motstanderen mangler en tilgjengelig første kontringsutløser.",
    failure: "To høye backer uten balansert sekser gir gjennombrudd imot ved balltap.",
    observe: "Se hvem som sikrer den fraflyttede kanalen idet overlappen starter."
  },
  see_out_the_game: {
    signal: "centralPocket", counterValue: "available", freeValue: "blocked", breakAt: 2,
    counterExplanation: "En rettvendt mottaker mellom lagdelene kan dra ut stopper.",
    freeExplanation: "Motstanderen mangler et tilgjengelig mellomrom å vende opp i.",
    failure: "En passiv dyp blokk kan bli låst under langvarig trykk.",
    observe: "Følg avstanden mellom midtbane og forsvar når ballen skifter side."
  },
  chase_the_equaliser: {
    signal: "counterOutlet", counterValue: "available", freeValue: "isolated", breakAt: 3,
    counterExplanation: "Motstanderen har første kontringsmottaker bak det høye sluttpresset.",
    freeExplanation: "Motstanderen mangler en umiddelbar utløser for kontring.",
    failure: "Et mislykket press åpner bakrom bak begge oppflyttede backer.",
    observe: "Kontroller gjenvinningsavstander og bakre sikring før laget sender flere inn."
  },
  slow_it_down: {
    signal: "passingLaneCover", counterValue: "central", freeValue: "none", breakAt: 2,
    counterExplanation: "Koordinert dekning av returpasningen bryter den rolige oppbyggingen.",
    freeExplanation: "Uten sentral dekning kan en trygg støttepasning løse presset.",
    failure: "Lavt tempo uten pasningsvinkler gir risiko for balltap nær eget mål.",
    observe: "Se om begge støttelinjene og keeperen fortsatt har frie vinkler."
  },
  all_out_attack: {
    signal: "counterOutlet", counterValue: "available", freeValue: "isolated", breakAt: 3,
    counterExplanation: "En fri mottaker bak fremste pressledd kan utløse en stor sjanse imot.",
    freeExplanation: "Det første kontringsleddet til motstanderen er isolert.",
    failure: "Når siste sikringsledd brytes, kan en eneste langpasning sette angriper fri.",
    observe: "Se om laget har en bakre sikrer og hvem som dekker rommet ved balltap."
  }
});

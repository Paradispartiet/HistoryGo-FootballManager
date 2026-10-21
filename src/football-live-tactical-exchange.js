// Explicit, deterministic tactical behaviours AFTER a simulated opponent adjustment.
// These describe game-model hypotheses, never documented historical tracking data.
// Without a known in-match behaviour, the 18-plan model remains unchanged.
export const LIVE_OPPONENT_BEHAVIOURS = Object.freeze({
  push_up: Object.freeze({
    pressDirection: "outside_in",
    pressCoordination: "collective",
    passingLaneCover: "central",
    blockSpacing: "stretched",
    restDefense: "exposed"
  }),
  sit_back: Object.freeze({
    pressDirection: "passive",
    pressCoordination: "passive",
    passingLaneCover: "central",
    blockSpacing: "compact",
    restDefense: "secured"
  })
});

export function behaviourForOpponentAdjustment(adjustmentId) {
  const model = LIVE_OPPONENT_BEHAVIOURS[adjustmentId];
  return model ? { ...model } : null;
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

  return null;
}

// src/engine/evaluateFormationMatchup.ts
//
// Formation Knowledge Engine – beregningslaget.
//
// Gjør det authored kunnskapslaget (data/hgFootball/formationKnowledge.json)
// beregningsbart: hvilken spillestil en formasjon legemliggjør, og hvordan to
// formasjoner står mot hverandre. Forankret HELT i dataene – ingen oppfunnet
// taktikkmatrise. Bruker hver formasjons authored strongAgainst/weakAgainst
// (mot motstanderstil-tokens) + de stil-tokens motstanderen faktisk legemliggjør
// (utledet fra parameterProfile + baseShape).
//
// Ren modul: ingen DOM, fetch, localStorage eller sideeffekter. Data inn,
// strukturert resultat ut. Dette er README-prinsippet «ingen taktikk er perfekt
// mot alt» gjort konkret: samme formasjon kan være favourable mot én stil og
// risky mot en annen.

export type FormationParameterProfile = {
  pressHeight: string;
  defensiveLine: string;
  width: string;
  possession: string;
  tempo: string;
  transition: string;
  restDefence: string;
  pressingScheme: string;
  risk: string;
};

export type FormationMatchupInput = {
  formationId?: string;
  name?: string;
  baseShape?: string;
  parameterProfile: FormationParameterProfile;
  strongAgainst: string[];
  weakAgainst: string[];
};

export type FormationMatchupLean = "favourable" | "balanced" | "risky";

export type FormationMatchupPoint = {
  token: string;
  source: "opponent_weakness" | "own_strength" | "opponent_strength" | "own_weakness";
  text: string;
};

export type FormationMatchupResult = {
  yourTokens: string[];
  opponentTokens: string[];
  advantages: FormationMatchupPoint[];
  risks: FormationMatchupPoint[];
  score: number;
  lean: FormationMatchupLean;
  summary: string;
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * Hvilke motstanderstil-tokens en formasjon legemliggjør, utledet fra
 * parameterProfile. (Form-baserte tokens som narrow_442 håndteres av
 * deriveFormationShapeTokens.)
 */
export function deriveFormationStyleTokens(profile: FormationParameterProfile): string[] {
  const tokens: string[] = [];
  const p = profile;

  if (p.pressHeight === "high") tokens.push("high_press");
  if (p.pressHeight === "high" && p.pressingScheme === "man_oriented") tokens.push("aggressive_man_press");
  if (p.defensiveLine === "deep" || (p.pressHeight === "low" && p.restDefence === "strong")) tokens.push("deep_low_block");
  if (p.possession === "patient") tokens.push("possession_positional");
  if (p.possession === "patient" && p.defensiveLine === "high") tokens.push("build_from_back");
  if (p.possession === "patient" && p.width === "wide") tokens.push("switching_play");
  if (p.possession === "direct" && p.transition === "high") tokens.push("direct_counter");
  if (p.transition === "high" && p.tempo === "high") tokens.push("fast_transition");
  if (p.transition === "high" && (p.possession === "direct" || p.tempo === "high")) tokens.push("fast_runners_in_behind");
  if (p.width === "wide") tokens.push("wide_overload");

  return unique(tokens);
}

/**
 * Form-baserte tokens utledet fra baseShape (f.eks. "5-3-2", "4-4-2").
 */
export function deriveFormationShapeTokens(baseShape: string | undefined): string[] {
  if (typeof baseShape !== "string" || baseShape.trim() === "") {
    return [];
  }

  const tokens: string[] = [];
  const shape = baseShape.trim();
  const parts = shape.split("-");
  const back = parts[0];
  const front = parts[parts.length - 1];

  if (shape === "4-4-2") tokens.push("narrow_442");
  if (shape === "5-3-2") tokens.push("compact_532");
  if (back === "3") tokens.push("three_at_back");
  if (front === "2") tokens.push("two_striker_press");

  return unique(tokens);
}

function embodiedTokens(side: FormationMatchupInput): string[] {
  return unique([
    ...deriveFormationStyleTokens(side.parameterProfile),
    ...deriveFormationShapeTokens(side.baseShape),
  ]);
}

function intersect(a: string[], b: string[]): string[] {
  const set = new Set(b);
  return unique(a.filter((value) => set.has(value)));
}

function leanFromScore(score: number): FormationMatchupLean {
  if (score >= 2) return "favourable";
  if (score <= -2) return "risky";
  return "balanced";
}

/**
 * Vurder ditt system mot motstanderens. `you` er din formasjon, `opponent`
 * motstanderens. Returnerer fordeler, risikoer og en samlet lean.
 */
export function evaluateFormationMatchup(
  you: FormationMatchupInput,
  opponent: FormationMatchupInput,
): FormationMatchupResult {
  const yourTokens = embodiedTokens(you);
  const opponentTokens = embodiedTokens(opponent);

  const advantages: FormationMatchupPoint[] = [];
  const risks: FormationMatchupPoint[] = [];

  // Fordel: motstanderen er svak mot en stil ditt system legemliggjør.
  for (const token of intersect(opponent.weakAgainst, yourTokens)) {
    advantages.push({
      token,
      source: "opponent_weakness",
      text: `Motstanderen sliter mot «${token}» – som ditt system bygger på.`,
    });
  }
  // Fordel: ditt system er sterkt mot stilen motstanderen spiller.
  for (const token of intersect(you.strongAgainst, opponentTokens)) {
    advantages.push({
      token,
      source: "own_strength",
      text: `Ditt system er sterkt mot «${token}» – slik motstanderen spiller.`,
    });
  }
  // Risiko: motstanderen er sterk mot en stil ditt system legemliggjør.
  for (const token of intersect(opponent.strongAgainst, yourTokens)) {
    risks.push({
      token,
      source: "opponent_strength",
      text: `Motstanderen er sterk mot «${token}» – din spillestil.`,
    });
  }
  // Risiko: ditt system sliter mot stilen motstanderen spiller.
  for (const token of intersect(you.weakAgainst, opponentTokens)) {
    risks.push({
      token,
      source: "own_weakness",
      text: `Ditt system sliter mot «${token}» – slik motstanderen spiller.`,
    });
  }

  const score = advantages.length - risks.length;
  const lean = leanFromScore(score);
  const opponentName = opponent.name ?? opponent.formationId ?? "motstanderen";

  let summary: string;
  if (lean === "favourable") {
    summary = `Gunstig matchup mot ${opponentName}: flere fordeler enn risikoer. Det foreslåtte systemet bør passe godt.`;
  } else if (lean === "risky") {
    summary = `Risikabel matchup mot ${opponentName}: motstanderens stil treffer systemets svakheter. Vurder kontekstuelle justeringer.`;
  } else {
    summary = `Balansert matchup mot ${opponentName}: ingen tydelig taktisk overvekt – kampen avgjøres av detaljer og managergrep.`;
  }

  return {
    yourTokens,
    opponentTokens,
    advantages,
    risks,
    score,
    lean,
    summary,
  };
}

/**
 * Vurder ditt system mot en motstander beskrevet ved spillestil-tokens (ikke en
 * full formasjon) – f.eks. kampmotorens motstanderprofiler. Da kjenner vi bare
 * hvordan DITT system står mot stilen (egne strongAgainst/weakAgainst), ikke
 * motstanderens egne styrker/svakheter. Returnerer samme resultatform.
 */
export function evaluateFormationVsOpponentStyles(
  you: FormationMatchupInput,
  opponentStyles: string[],
  opponentName?: string,
): FormationMatchupResult {
  const yourTokens = embodiedTokens(you);
  const opponentTokens = unique(
    (Array.isArray(opponentStyles) ? opponentStyles : []).filter(
      (token): token is string => typeof token === "string" && token.length > 0,
    ),
  );

  const advantages: FormationMatchupPoint[] = [];
  const risks: FormationMatchupPoint[] = [];

  for (const token of intersect(you.strongAgainst, opponentTokens)) {
    advantages.push({
      token,
      source: "own_strength",
      text: `Ditt system er sterkt mot «${token}» – slik motstanderen spiller.`,
    });
  }
  for (const token of intersect(you.weakAgainst, opponentTokens)) {
    risks.push({
      token,
      source: "own_weakness",
      text: `Ditt system sliter mot «${token}» – slik motstanderen spiller.`,
    });
  }

  const score = advantages.length - risks.length;
  const lean = leanFromScore(score);
  const name = opponentName ?? "motstanderen";

  let summary: string;
  if (lean === "favourable") {
    summary = `Gunstig matchup mot ${name}: systemet passer godt mot denne spillestilen.`;
  } else if (lean === "risky") {
    summary = `Risikabel matchup mot ${name}: spillestilen treffer systemets svakheter. Vurder kontekstuelle justeringer.`;
  } else {
    summary = `Balansert matchup mot ${name}: ingen tydelig taktisk overvekt mot denne spillestilen.`;
  }

  return {
    yourTokens,
    opponentTokens,
    advantages,
    risks,
    score,
    lean,
    summary,
  };
}

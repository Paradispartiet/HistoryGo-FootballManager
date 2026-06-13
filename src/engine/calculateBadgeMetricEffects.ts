// src/engine/calculateBadgeMetricEffects.ts
//
// TypeScript-port av src/football-badge-effect-engine.js.
//
// Liten, forsiktig motor som kobler opptjente treningsbadges inn i lagfit.
// Den tar høyeste opptjente nivå per badgefamilie og gjør det om til små
// bonuser på eksisterende lagmetrikker. Den endrer ikke metrikkene direkte –
// den beregner effekter som en lagfit-sammenstilling kan legge oppå
// basismetrikkene. Porten er trofast mot legacy (samme nivåbonuser, samme
// familie→metrikk-kart, samme tak), slik at TS-motoren kan overta uten
// regresjon. Metrikknavnene er bevisst legacy-navnene (depthScore, pressScore,
// …) fordi badge-effektene legges oppå et legacy-kompatibelt metrikkobjekt.

export type BadgeLevel = "bronze" | "silver" | "gold";

// Inndata er bevisst defensivt typet, slik at en delvis/ugyldig katalog
// håndteres like robust som i legacy.
export type TrainingBadgeLevelEntry = {
  id?: string;
  level?: string;
};

export type TrainingBadgeFamily = {
  id?: string;
  levels?: TrainingBadgeLevelEntry[];
};

export type TrainingBadgeCatalog = {
  badgeFamilies?: TrainingBadgeFamily[];
} | null | undefined;

export type EarnedBadgeEffectContext = {
  familyLevels: Record<string, BadgeLevel>;
};

export type BadgeMetricEffects = Record<string, number>;

export type BuildEarnedBadgeEffectContextInput = {
  earnedBadgeIds?: string[];
  trainingBadges?: TrainingBadgeCatalog;
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

// Nivårangering brukes for å finne høyeste opptjente nivå per familie.
const LEVEL_ORDER: Record<string, number> = { bronze: 1, silver: 2, gold: 3 };

// Bonusverdi per nivå. Bevisst små tall – badges skal nudge, ikke dominere.
const LEVEL_BONUS: Record<BadgeLevel, number> = { bronze: 2, silver: 4, gold: 6 };

// Maks samlet badgebonus per metrikk, slik at mange badges ikke stabler seg
// til urimelige utslag.
const MAX_BADGE_BONUS_PER_METRIC = 12;

// Mapping fra badgefamilie til hvilke lagmetrikker den påvirker. Hver familie
// returnerer en liste med [metrikk, bonus]-par gitt nivåbonusen.
const BADGE_FAMILY_METRIC_MAP: Record<string, (bonus: number) => [string, number][]> = {
  team_speed: (bonus) => [["depthScore", bonus], ["pressScore", Math.floor(bonus / 2)]],
  team_stamina: (bonus) => [["pressScore", bonus], ["restDefenseScore", Math.floor(bonus / 2)]],
  high_press: (bonus) => [["pressScore", bonus]],
  rest_defense: (bonus) => [["restDefenseScore", bonus]],
  attacking_width: (bonus) => [["widthScore", bonus]],
  attacking_depth: (bonus) => [["depthScore", bonus]],
  build_from_back: (bonus) => [["buildUpScore", bonus]],
  passing_quality: (bonus) => [["buildUpScore", bonus], ["balanceScore", Math.floor(bonus / 2)]],
  low_block: (bonus) => [["restDefenseScore", bonus], ["balanceScore", Math.floor(bonus / 2)]],
  centre_back_pair: (bonus) => [["restDefenseScore", bonus]],
  midfield_triangle: (bonus) => [["balanceScore", bonus], ["buildUpScore", Math.floor(bonus / 2)]],
  keeper_distribution: (bonus) => [["buildUpScore", bonus]],
  keeper_box_control: (bonus) => [["restDefenseScore", bonus]],
  training_culture: (bonus) => [["tacticFitAverage", Math.floor(bonus / 2)]],
};

// Bygg en kontekst fra opptjente badges. Vi trenger badge-katalogen
// (trainingBadges) for trygt å koble en badge-id til familie og nivå –
// familienavn inneholder selv understreker, så id-en kan ikke parses direkte.
// Resultatet er høyeste opptjente nivå per familie.
export function buildEarnedBadgeEffectContext(
  input: BuildEarnedBadgeEffectContextInput = {},
): EarnedBadgeEffectContext {
  const { earnedBadgeIds = [], trainingBadges = null } = input;
  const families = Array.isArray(trainingBadges?.badgeFamilies)
    ? trainingBadges.badgeFamilies
    : [];
  const badgeIdToFamilyLevel = new Map<string, { familyId: string; level: string }>();

  families.forEach((family) => {
    if (!family || !family.id) {
      return;
    }

    const familyId = family.id;

    (Array.isArray(family.levels) ? family.levels : []).forEach((level) => {
      if (level && level.id && level.level) {
        badgeIdToFamilyLevel.set(level.id, { familyId, level: level.level });
      }
    });
  });

  const familyLevels: Record<string, BadgeLevel> = {};
  const ids = Array.isArray(earnedBadgeIds) ? earnedBadgeIds : [];

  ids.forEach((badgeId) => {
    const entry = badgeIdToFamilyLevel.get(badgeId);

    if (!entry) {
      return;
    }

    const rank = LEVEL_ORDER[entry.level] ?? 0;

    if (rank === 0) {
      return;
    }

    const currentLevel = familyLevels[entry.familyId];
    const currentRank = currentLevel ? (LEVEL_ORDER[currentLevel] ?? 0) : 0;

    if (rank > currentRank) {
      familyLevels[entry.familyId] = entry.level as BadgeLevel;
    }
  });

  return { familyLevels };
}

// Regn om konteksten til faktiske metrikkbonuser. Summerer bonuser per metrikk
// på tvers av familier og setter et tak per metrikk.
export function calculateBadgeMetricEffects(
  context: EarnedBadgeEffectContext | null | undefined,
): BadgeMetricEffects {
  const familyLevels = context?.familyLevels ?? {};
  const effects: BadgeMetricEffects = {};

  Object.entries(familyLevels).forEach(([familyId, level]) => {
    const bonus = LEVEL_BONUS[level] ?? 0;
    const mapper = BADGE_FAMILY_METRIC_MAP[familyId];

    if (bonus === 0 || !mapper) {
      return;
    }

    mapper(bonus).forEach(([metric, amount]) => {
      if (!amount) {
        return;
      }

      effects[metric] = (effects[metric] ?? 0) + amount;
    });
  });

  Object.keys(effects).forEach((metric) => {
    effects[metric] = Math.min(effects[metric] ?? 0, MAX_BADGE_BONUS_PER_METRIC);
  });

  return effects;
}

// Legg badgeeffektene oppå et sett basismetrikker. Bare metrikker som faktisk
// får en bonus berøres, og de clampes til 0–100. Tomme effekter gir et
// uendret (men kopiert) metrikkobjekt.
export function applyBadgeEffectsToMetrics<T extends Record<string, number>>(
  metrics: T,
  badgeEffects: BadgeMetricEffects | null | undefined,
): T {
  const adjusted: Record<string, number> = { ...metrics };
  const effects = badgeEffects ?? {};

  Object.entries(effects).forEach(([metric, amount]) => {
    if (typeof adjusted[metric] !== "number" || !amount) {
      return;
    }

    adjusted[metric] = clamp((adjusted[metric] ?? 0) + amount);
  });

  return adjusted as T;
}

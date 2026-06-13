// src/engine/buildCoachContext.ts
//
// TypeScript-port av src/hg-football-coach-context-engine.js.
//
// Kobler ansatt stab (trenerapparatet) inn i lagfit-/formasjonsmotoren. Staben
// gjør IKKE spillerne bedre direkte. Den gjør treneren bedre til å lære,
// forstå og implementere systemet, slik at avanserte formasjoner blir lettere
// å mestre over tid – særlig når staben passer formasjonens krav. Porten er
// trofast mot legacy (samme kategorier, vekter, terskler og formler).
//
// Kjerneprinsipp: alle spillere er gode. Treneren avgjør om systemet får frem
// styrkene deres. Staben gjør treneren bedre til å bruke systemene riktig.

// ---------------------------------------------------------------------------
// Typer (defensivt, slik at delvise data håndteres like robust som i legacy)
// ---------------------------------------------------------------------------
export type StaffMember = {
  id?: string;
  name?: string;
  staffType?: string;
  canBeHiredAs?: string[];
  expertiseIds?: string[];
  roles?: string[];
  fitsClubs?: string[];
};

export type StaffRole = {
  id?: string;
  name?: string;
  affects?: string[];
};

export type CoachContextFormation = {
  id?: string;
  name?: string;
  notes?: string;
  eraId?: string;
  tacticalSchool?: string;
  tacticalDifficulty?: string;
  principles?: string[];
  commonNames?: string[];
  coachingRequirements?: string[];
  matchEngineEffects?: { coachingDemand?: number } & Record<string, number> | null;
};

export type CoachContextTeamMerits = {
  formationFamiliarity?: Record<string, number>;
  activeTrainingWeek?: number;
};

export type StaffEffectProfile = {
  tacticalLearningSpeed: number;
  formationFamiliarity: number;
  roleFitClarity: number;
  defensiveOrganisation: number;
  attackingPatterns: number;
  pressingDrills: number;
  injuryRecovery: number;
  goalkeeperDevelopment: number;
  youthDevelopment: number;
};

export type ActiveStaffEntry = {
  id: string | null;
  name: string;
  staffType: string | null;
  category: string | null;
  staffRoleId: string | null;
  staffRoleName: string | null;
  affects: string[];
};

export type StaffEffectProfileResult = {
  effectProfile: StaffEffectProfile;
  activeStaff: ActiveStaffEntry[];
  categoryCounts: Record<string, number>;
  expertiseTokens: Set<string>;
  notes: string[];
};

export type CoachContext = {
  staffCount: number;
  activeStaff: ActiveStaffEntry[];
  effectProfile: StaffEffectProfile;
  formationFamiliarity: number;
  coachUnderstanding: number;
  tacticalLearningSpeed: number;
  roleFitClarity: number;
  injuryRecovery: number;
  goalkeeperDevelopment: number;
  formationDifficultyRelief: number;
  historicalFitSupport: number;
  strengths: string[];
  issues: string[];
  notes: string[];
};

export type CoachContextReport = {
  headline: string;
  strengths: string[];
  issues: string[];
  notes: string[];
};

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function num(value: unknown): number {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

const GENERAL_BASELINE = 40;
const PROFILE_BASELINE: StaffEffectProfile = {
  tacticalLearningSpeed: GENERAL_BASELINE,
  formationFamiliarity: GENERAL_BASELINE,
  roleFitClarity: GENERAL_BASELINE,
  defensiveOrganisation: 0,
  attackingPatterns: 0,
  pressingDrills: 0,
  injuryRecovery: 0,
  goalkeeperDevelopment: 0,
  youthDevelopment: 0,
};

const PROFILE_DIMS = Object.keys(PROFILE_BASELINE) as (keyof StaffEffectProfile)[];

const PROFILE_MAX = 90;

const TYPE_TO_CATEGORY: Record<string, string> = {
  head_coach: "manager",
  manager: "manager",
  assistant_coach: "assistant_coach",
  assistant: "assistant_coach",
  first_team_coach: "first_team_coach",
  tactical_coach: "tactical_coach",
  training_coach: "training_coach",
  technical_coach: "technical_coach",
  coach: "coach",
  fitness_coach: "fitness_coach",
  physical_coach: "fitness_coach",
  physio: "physio",
  physiotherapist: "physio",
  goalkeeper_coach: "goalkeeper_coach",
  former_goalkeeper_goalkeeper_coach: "goalkeeper_coach",
  analyst: "analyst",
  sporting_director: "sporting_director",
  academy_coach: "academy_coach",
  scout: "scout",
};

const CATEGORY_EFFECTS: Record<string, Record<string, number>> = {
  manager: { formationFamiliarity: 22, tacticalLearningSpeed: 16, roleFitClarity: 16, attackingPatterns: 14, defensiveOrganisation: 14 },
  assistant_coach: { tacticalLearningSpeed: 24, roleFitClarity: 22, formationFamiliarity: 20 },
  tactical_coach: { formationFamiliarity: 24, tacticalLearningSpeed: 22, roleFitClarity: 18, attackingPatterns: 12, defensiveOrganisation: 12 },
  training_coach: { tacticalLearningSpeed: 22, formationFamiliarity: 18, roleFitClarity: 14, pressingDrills: 10 },
  first_team_coach: { formationFamiliarity: 20, attackingPatterns: 12, defensiveOrganisation: 12, tacticalLearningSpeed: 12 },
  technical_coach: { roleFitClarity: 18, attackingPatterns: 16, youthDevelopment: 10 },
  coach: { formationFamiliarity: 18, tacticalLearningSpeed: 18, roleFitClarity: 12, pressingDrills: 8 },
  goalkeeper_coach: { goalkeeperDevelopment: 30, defensiveOrganisation: 16 },
  physio: { injuryRecovery: 30 },
  fitness_coach: { pressingDrills: 22, injuryRecovery: 16, defensiveOrganisation: 8 },
  analyst: { tacticalLearningSpeed: 18, formationFamiliarity: 16, defensiveOrganisation: 14, attackingPatterns: 14 },
  sporting_director: { formationFamiliarity: 8, roleFitClarity: 8, youthDevelopment: 12 },
  academy_coach: { youthDevelopment: 20, roleFitClarity: 12 },
  scout: { youthDevelopment: 12, roleFitClarity: 8 },
};

const DIFFICULTY_DEMAND: Record<string, number> = { low: 35, medium: 50, high: 62, very_high: 72 };

const DIFFICULTY_MAX_RELIEF: Record<string, number> = { low: 2, medium: 4, high: 8, very_high: 12 };

const LEARNING_CATEGORIES = ["assistant_coach", "training_coach", "tactical_coach", "first_team_coach", "analyst"];

type FormationTheme = {
  id: string;
  test: RegExp;
  tokens: string[];
  dim: keyof StaffEffectProfile;
};

const FORMATION_THEMES: FormationTheme[] = [
  {
    id: "pressing",
    test: /press|gjenvinning|gegen|høyt forsvar|høy line|aggressiv/,
    tokens: ["pressing_structure", "physical_preparation", "stamina_training", "speed_training", "pressing_team", "high_intensity_team", "transition_team"],
    dim: "pressingDrills",
  },
  {
    id: "rest_defense",
    test: /restforsvar|lav blokk|defensiv|libero|catenaccio|verrou|sikring|kompakt|man.?marker|markering/,
    tokens: ["rest_defense", "defensive_structure", "match_discipline", "defensive_structure_project"],
    dim: "defensiveOrganisation",
  },
  {
    id: "positional",
    test: /posisjonsspill|sentral kontroll|kombinasjon|pasning|oppbygg|total|positional|box|guardiola|cruyff|ajax|metodo|danubian|donau/,
    tokens: ["passing_training", "build_up_play", "team_organisation", "technical_training", "development_culture"],
    dim: "attackingPatterns",
  },
];

function formationText(formation: CoachContextFormation | undefined): string {
  return [
    ...asArray(formation?.principles),
    ...asArray(formation?.commonNames),
    ...asArray(formation?.coachingRequirements),
    formation?.tacticalSchool,
    formation?.name,
    formation?.notes,
    formation?.eraId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getStaffCategory(member: StaffMember | null | undefined): string | null {
  if (!member || typeof member !== "object") {
    return null;
  }

  const primary = typeof member.staffType === "string" ? TYPE_TO_CATEGORY[member.staffType] : null;
  if (primary) {
    return primary;
  }

  const secondary = asArray(member.canBeHiredAs)
    .map((type) => TYPE_TO_CATEGORY[type])
    .find(Boolean);

  return secondary || (member.staffType ? "coach" : null);
}

function collectStaffTokens(hiredStaff: StaffMember[]): Set<string> {
  const tokens = new Set<string>();
  asArray(hiredStaff).forEach((member) => {
    asArray(member?.expertiseIds).forEach((id) => tokens.add(id));
    asArray(member?.roles).forEach((id) => tokens.add(id));
    asArray(member?.fitsClubs).forEach((id) => tokens.add(id));
  });
  return tokens;
}

// 1) Samlet effektprofil for ansatt stab.
export function calculateStaffEffectProfile(input: {
  hiredStaff?: StaffMember[];
  staffRoles?: StaffRole[];
}): StaffEffectProfileResult {
  const staff = asArray(input.hiredStaff);
  const roles = asArray(input.staffRoles);
  const rolesById = new Map<string, StaffRole>(
    roles.filter((role): role is StaffRole & { id: string } => Boolean(role && role.id)).map((role) => [role.id, role]),
  );

  const accumulated: Record<string, number> = {};
  PROFILE_DIMS.forEach((dim) => {
    accumulated[dim] = 0;
  });

  const activeStaff: ActiveStaffEntry[] = [];
  const notes: string[] = [];
  const categoryCounts: Record<string, number> = {};

  staff.forEach((member) => {
    const category = getStaffCategory(member);
    const weights = category ? CATEGORY_EFFECTS[category] : null;

    let staffRole: StaffRole | null = category ? rolesById.get(category) ?? null : null;
    if (!staffRole) {
      const viaHire = asArray(member?.canBeHiredAs).find((type) =>
        rolesById.has(TYPE_TO_CATEGORY[type] || type),
      );
      if (viaHire) {
        staffRole = rolesById.get(TYPE_TO_CATEGORY[viaHire] || viaHire) ?? null;
      }
    }

    if (weights && category) {
      Object.entries(weights).forEach(([dim, amount]) => {
        accumulated[dim] = (accumulated[dim] ?? 0) + amount;
      });
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    } else {
      notes.push(`Ukjent stabstype (${member?.staffType || "ukjent"}); gir ingen taktisk effekt.`);
    }

    activeStaff.push({
      id: member?.id || null,
      name: member?.name || member?.id || "Ukjent stab",
      staffType: member?.staffType || null,
      category: category || null,
      staffRoleId: staffRole?.id || null,
      staffRoleName: staffRole?.name || null,
      affects: asArray(staffRole?.affects),
    });
  });

  const effectProfile = {} as StaffEffectProfile;
  PROFILE_DIMS.forEach((dim) => {
    effectProfile[dim] = clamp(PROFILE_BASELINE[dim] + (accumulated[dim] ?? 0), 0, PROFILE_MAX);
  });

  return {
    effectProfile,
    activeStaff,
    categoryCounts,
    expertiseTokens: collectStaffTokens(staff),
    notes,
  };
}

function computeExpertiseRelief(
  formation: CoachContextFormation | undefined,
  expertiseTokens: Set<string>,
  effectProfile: StaffEffectProfile | undefined,
): number {
  const text = formationText(formation);
  let relief = 0;

  if (expertiseTokens.has("team_organisation")) {
    relief += 3;
  }

  FORMATION_THEMES.forEach((theme) => {
    if (theme.test.test(text) && theme.tokens.some((token) => expertiseTokens.has(token))) {
      relief += 4;
    }
  });

  if (/sweeper|keeper|målvakt/.test(text) && num(effectProfile?.goalkeeperDevelopment) > 0) {
    relief += 2;
  }

  return Math.min(15, relief);
}

// 2) Formasjonstilvenning (0-100).
export function calculateFormationFamiliarity(input: {
  formation?: CoachContextFormation;
  effectProfile?: StaffEffectProfile;
  teamMerits?: CoachContextTeamMerits;
  expertiseTokens?: Set<string>;
}): number {
  const profile = input.effectProfile;
  const tokens = input.expertiseTokens instanceof Set ? input.expertiseTokens : new Set<string>();
  const learn = num(profile?.tacticalLearningSpeed);
  const famEffect = num(profile?.formationFamiliarity);
  const expertiseRelief = computeExpertiseRelief(input.formation, tokens, profile);

  const difficulty = input.formation?.tacticalDifficulty;
  const coachingDemand = num(input.formation?.matchEngineEffects?.coachingDemand);
  const demand = clamp((DIFFICULTY_DEMAND[difficulty ?? ""] ?? 50) + coachingDemand, 0, 85);

  const stored = input.formation?.id
    ? input.teamMerits?.formationFamiliarity?.[input.formation.id]
    : undefined;
  if (Number.isFinite(stored)) {
    return clamp(Math.round((stored as number) + (famEffect - GENERAL_BASELINE) * 0.15 + expertiseRelief * 0.4));
  }

  let familiarity = 45;
  familiarity += (famEffect - GENERAL_BASELINE) * 0.5;
  familiarity += (learn - GENERAL_BASELINE) * 0.3;
  familiarity += expertiseRelief;

  const support = (famEffect + learn) / 2;
  const demandGap = Math.max(0, demand - support);
  familiarity -= demandGap * 0.4;

  return clamp(Math.round(familiarity));
}

function matchFormationThemes(
  formation: CoachContextFormation | undefined,
  expertiseTokens: Set<string> | undefined,
  effectProfile: StaffEffectProfile | undefined,
): { id: string; tokenSupport: boolean; dimSupport: boolean }[] {
  const text = formationText(formation);
  const tokens = expertiseTokens instanceof Set ? expertiseTokens : new Set<string>();
  const matches: { id: string; tokenSupport: boolean; dimSupport: boolean }[] = [];

  FORMATION_THEMES.forEach((theme) => {
    if (!theme.test.test(text)) {
      return;
    }
    const tokenSupport = theme.tokens.some((token) => tokens.has(token));
    const dimSupport = num(effectProfile?.[theme.dim]) >= 20;
    if (tokenSupport || dimSupport) {
      matches.push({ id: theme.id, tokenSupport, dimSupport });
    }
  });

  return matches;
}

// 3) Trenerforståelse (0-100).
export function calculateCoachUnderstanding(input: {
  formation?: CoachContextFormation;
  effectProfile?: StaffEffectProfile;
  expertiseTokens?: Set<string>;
  activeStaff?: ActiveStaffEntry[];
}): number {
  const profile = input.effectProfile;
  const base =
    (num(profile?.tacticalLearningSpeed) + num(profile?.formationFamiliarity) + num(profile?.roleFitClarity)) / 3;

  let understanding = base;

  const difficulty = input.formation?.tacticalDifficulty;
  const coachingDemand = num(input.formation?.matchEngineEffects?.coachingDemand);
  const demand = (DIFFICULTY_DEMAND[difficulty ?? ""] ?? 50) + coachingDemand;

  understanding -= Math.max(0, demand - 50) * 0.25;

  const themes = matchFormationThemes(input.formation, input.expertiseTokens, profile);
  themes.forEach((theme) => {
    understanding += theme.tokenSupport ? 8 : 5;
  });

  const hasAnalyticalEye = asArray(input.activeStaff).some(
    (member) => member && (member.category === "analyst" || member.category === "tactical_coach"),
  );
  if (hasAnalyticalEye) {
    understanding += 4;
  }

  return clamp(Math.round(understanding));
}

// 4) Taktisk læringsfart (0-100).
export function calculateTacticalLearningSpeed(input: {
  effectProfile?: StaffEffectProfile;
  activeStaff?: ActiveStaffEntry[];
  teamMerits?: CoachContextTeamMerits;
}): number {
  let speed = num(input.effectProfile?.tacticalLearningSpeed);

  const learningStaff = asArray(input.activeStaff).filter(
    (member) => member && member.category !== null && LEARNING_CATEGORIES.includes(member.category),
  ).length;
  speed += Math.min(12, learningStaff * 4);

  const week = input.teamMerits?.activeTrainingWeek;
  if (Number.isInteger(week) && (week as number) > 1) {
    speed += Math.min(4, ((week as number) - 1) * 0.5);
  }

  return clamp(Math.round(speed));
}

// 5) Formasjonsvanskelighets-relief (0-12).
export function calculateFormationDifficultyRelief(input: {
  formation?: CoachContextFormation;
  coachUnderstanding?: number;
  formationFamiliarity?: number;
  tacticalLearningSpeed?: number;
}): number {
  const difficulty = input.formation?.tacticalDifficulty;
  const maxRelief = DIFFICULTY_MAX_RELIEF[difficulty ?? ""] ?? 4;

  const support =
    (num(input.coachUnderstanding) + num(input.formationFamiliarity) + num(input.tacticalLearningSpeed)) / 3;
  const factor = clamp((support - 45) / 40, 0, 1);

  return Math.round(maxRelief * factor * 10) / 10;
}

// Samlet coachContext for laget. Alltid gyldig og nøytral selv uten ansatt stab.
export function buildCoachContext(input: {
  hiredStaff?: StaffMember[];
  staffRoles?: StaffRole[];
  formation?: CoachContextFormation;
  teamMerits?: CoachContextTeamMerits;
}): CoachContext {
  const staff = asArray(input.hiredStaff);

  const profileResult = calculateStaffEffectProfile({
    hiredStaff: staff,
    ...(input.staffRoles !== undefined ? { staffRoles: input.staffRoles } : {}),
  });
  const { effectProfile, activeStaff, expertiseTokens, notes: profileNotes } = profileResult;

  const formationFamiliarity = calculateFormationFamiliarity({
    ...(input.formation !== undefined ? { formation: input.formation } : {}),
    effectProfile,
    ...(input.teamMerits !== undefined ? { teamMerits: input.teamMerits } : {}),
    expertiseTokens,
  });
  const coachUnderstanding = calculateCoachUnderstanding({
    ...(input.formation !== undefined ? { formation: input.formation } : {}),
    effectProfile,
    expertiseTokens,
    activeStaff,
  });
  const tacticalLearningSpeed = calculateTacticalLearningSpeed({
    effectProfile,
    activeStaff,
    ...(input.teamMerits !== undefined ? { teamMerits: input.teamMerits } : {}),
  });
  const formationDifficultyRelief = calculateFormationDifficultyRelief({
    ...(input.formation !== undefined ? { formation: input.formation } : {}),
    coachUnderstanding,
    formationFamiliarity,
    tacticalLearningSpeed,
  });

  const themeMatches = matchFormationThemes(input.formation, expertiseTokens, effectProfile);
  const historicalFitSupport = clamp(
    Math.round((coachUnderstanding - GENERAL_BASELINE) * 0.5 + themeMatches.length * 8),
    0,
    40,
  );

  const difficulty = input.formation?.tacticalDifficulty;
  const isDemanding = difficulty === "high" || difficulty === "very_high";

  const strengths: string[] = [];
  const issues: string[] = [];
  const notes = [...profileNotes];

  if (coachUnderstanding >= 62 && formationFamiliarity >= 62) {
    strengths.push("Trenerteamet hjelper laget å forstå den krevende formasjonen.");
  }
  if (formationFamiliarity >= 60 && staff.length > 0) {
    strengths.push("Staben øker formasjonstilvenningen.");
  }
  if (tacticalLearningSpeed >= 62 && effectProfile.roleFitClarity >= 55) {
    strengths.push("Assistent/trenere gir systemet bedre rolleforståelse.");
  }

  if (isDemanding && coachUnderstanding < 52) {
    issues.push("Formasjonen er taktisk krevende, men trenerteamet gir foreløpig lite støtte.");
  }
  if (isDemanding && formationFamiliarity < 50) {
    issues.push("Laget mangler formasjonstilvenning til dette systemet.");
  }
  if (isDemanding && themeMatches.length === 0) {
    issues.push("Staben hjelper lite med systemets viktigste prinsipper.");
  }

  if (staff.length === 0) {
    notes.push("Ingen stab er engasjert ennå; trenerstøtten er nøytral og lav.");
  }

  return {
    staffCount: staff.length,
    activeStaff,
    effectProfile,
    formationFamiliarity,
    coachUnderstanding,
    tacticalLearningSpeed,
    roleFitClarity: effectProfile.roleFitClarity,
    injuryRecovery: effectProfile.injuryRecovery,
    goalkeeperDevelopment: effectProfile.goalkeeperDevelopment,
    formationDifficultyRelief,
    historicalFitSupport,
    strengths,
    issues,
    notes,
  };
}

// Forklarende rapporttekst for UI.
export function buildCoachContextReport(input: {
  coachContext?: CoachContext | null;
  formation?: CoachContextFormation;
}): CoachContextReport {
  const { coachContext, formation } = input;

  if (!coachContext) {
    return { headline: "Ingen trenerdata tilgjengelig ennå.", strengths: [], issues: [], notes: [] };
  }

  const strengths = [...asArray(coachContext.strengths)];
  const issues = [...asArray(coachContext.issues)];
  const notes = [...asArray(coachContext.notes)];

  const understanding = num(coachContext.coachUnderstanding);
  const familiarity = num(coachContext.formationFamiliarity);
  const roleClarity = num(coachContext.roleFitClarity);
  const formationName = formation?.name || "formasjonen";

  let headline: string;
  if (coachContext.staffCount === 0) {
    headline = `Ingen stab støtter ${formationName} ennå. Engasjer assistenttrener, taktisk trener eller treningscoach.`;
  } else if (understanding >= 65 && familiarity >= 60 && roleClarity >= 55) {
    headline = `Trenerteamet støtter ${formationName} godt: høy rolleforståelse og god formasjonstilvenning.`;
  } else if (understanding < 52 || familiarity < 50) {
    headline = "Staben hjelper lite med dette systemet ennå. Vurder assistenttrener/taktisk trener/treningscoach.";
  } else {
    headline = "Staben gir systemet noe støtte, men det er rom for sterkere trenerteam.";
  }

  const categories = new Set(asArray(coachContext.activeStaff).map((member) => member?.category));

  if (categories.has("goalkeeper_coach")) {
    notes.push("Keepertrener styrker den defensive organiseringen, men påvirker ikke angrepsmønstrene direkte.");
  }
  if (categories.has("physio")) {
    notes.push("Fysio forbedrer restitusjon/skadeberedskap, men gir ikke direkte formasjonsforståelse.");
  }

  return { headline, strengths, issues, notes };
}

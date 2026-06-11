// HG Football Manager — Coach Context Engine (v1)
//
// Kobler ansatt stab (trenerapparatet) inn i lagfit-/formasjonsmotoren. Staben
// gjør IKKE spillerne bedre direkte. Den gjør treneren bedre til å lære,
// forstå og implementere systemet, slik at avanserte formasjoner blir lettere
// å mestre over tid – særlig når staben passer formasjonens krav.
//
// Designprinsipper:
//   - Ren modul: ingen DOM, ingen fetch, ingen localStorage, ingen app-state,
//     ingen sideeffekter. Alt utledes fra inn-argumentene.
//   - Ingen enkeltformasjoner og ingen enkeltstaff (f.eks. Jørgen Isnes)
//     hardkodes. Staff kobles via staffType/canBeHiredAs/expertiseIds/roles og
//     staffRoles.affects; formasjoner leses via tacticalDifficulty, principles,
//     tacticalSchool, name, notes og matchEngineEffects.
//   - Forsiktig effekt. Staben hjelper, men kan ikke gjøre en targetspiss til
//     falsk nier eller en klassisk ving til libero. Riktige spillertyper er
//     fortsatt trenerens ansvar.
//
// Kjerneprinsipp: alle spillere er gode. Treneren avgjør om systemet får frem
// styrkene deres. Staben gjør treneren bedre til å bruke systemene riktig.

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function num(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

// Effektprofilens dimensjoner. Generelle trener-/læringsdimensjoner starter på
// en nøytral baseline (~40); spesialdimensjoner starter på 0 og fylles bare av
// relevant stab.
const GENERAL_BASELINE = 40;
const PROFILE_BASELINE = {
  tacticalLearningSpeed: GENERAL_BASELINE,
  formationFamiliarity: GENERAL_BASELINE,
  roleFitClarity: GENERAL_BASELINE,
  defensiveOrganisation: 0,
  attackingPatterns: 0,
  pressingDrills: 0,
  injuryRecovery: 0,
  goalkeeperDevelopment: 0,
  youthDevelopment: 0
};

const PROFILE_MAX = 90;

// Kanoniske stab-kategorier. Mapper både football_staff.json sine staffType-/
// canBeHiredAs-verdier og data/hgFootball/staffRoles.json sine id-er til en
// felles kategori, uten å hardkode enkeltpersoner.
const TYPE_TO_CATEGORY = {
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
  scout: "scout"
};

// Hvor mye hver kategori bidrar (additivt) per dimensjon. Vektene er forsiktige:
// én god ansatt løfter sine dimensjoner til ~60-65, en dekket stab nær taket 90.
const CATEGORY_EFFECTS = {
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
  scout: { youthDevelopment: 12, roleFitClarity: 8 }
};

// Difficulty -> hvor mye forståelse/tilvenning systemet realistisk krever. Dette
// er IKKE en straff for å være avansert; det hever kravet til at staben må støtte
// systemet for at det skal bli forståelig.
const DIFFICULTY_DEMAND = { low: 35, medium: 50, high: 62, very_high: 72 };

// Maks difficulty relief per vanskelighetsgrad (0-12-skala).
const DIFFICULTY_MAX_RELIEF = { low: 2, medium: 4, high: 8, very_high: 12 };

// Kategorier som driver taktisk læringsfart tydeligst.
const LEARNING_CATEGORIES = ["assistant_coach", "training_coach", "tactical_coach", "first_team_coach", "analyst"];

// Tematiske formasjonsbehov. Hvert tema kobler et tekstmønster i formasjonen til
// relevant stab-ekspertise/roller og en effektprofil-dimensjon. Brukes både til
// formationFamiliarity-relief og coachUnderstanding-bonus.
const FORMATION_THEMES = [
  {
    id: "pressing",
    test: /press|gjenvinning|gegen|høyt forsvar|høy line|aggressiv/,
    tokens: ["pressing_structure", "physical_preparation", "stamina_training", "speed_training", "pressing_team", "high_intensity_team", "transition_team"],
    dim: "pressingDrills"
  },
  {
    id: "rest_defense",
    test: /restforsvar|lav blokk|defensiv|libero|catenaccio|verrou|sikring|kompakt|man.?marker|markering/,
    tokens: ["rest_defense", "defensive_structure", "match_discipline", "defensive_structure_project"],
    dim: "defensiveOrganisation"
  },
  {
    id: "positional",
    test: /posisjonsspill|sentral kontroll|kombinasjon|pasning|oppbygg|total|positional|box|guardiola|cruyff|ajax|metodo|danubian|donau/,
    tokens: ["passing_training", "build_up_play", "team_organisation", "technical_training", "development_culture"],
    dim: "attackingPatterns"
  }
];

// Samlet tekst om formasjonen (prinsipper, skole, navn, notater, epoke) i
// lowercase, brukt av tema-matching.
function formationText(formation) {
  return [
    ...asArray(formation?.principles),
    ...asArray(formation?.commonNames),
    ...asArray(formation?.coachingRequirements),
    formation?.tacticalSchool,
    formation?.name,
    formation?.notes,
    formation?.eraId
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// Hvilken kanonisk kategori en ansatt tilhører. Primært staffType, sekundært
// canBeHiredAs (første treff). Faller tilbake til "coach" når typen er ukjent,
// slik at en ukjent profil fortsatt gir en forsiktig generell effekt uten krasj.
export function getStaffCategory(member) {
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

// Samler stabens ekspertise-/rolle-/klubbtokens til ett oppslag for tema-matching.
function collectStaffTokens(hiredStaff) {
  const tokens = new Set();
  asArray(hiredStaff).forEach((member) => {
    asArray(member?.expertiseIds).forEach((id) => tokens.add(id));
    asArray(member?.roles).forEach((id) => tokens.add(id));
    asArray(member?.fitsClubs).forEach((id) => tokens.add(id));
  });
  return tokens;
}

// 1) Samlet effektprofil for ansatt stab.
//
// Leser hver ansatt, klassifiserer kategori, matcher mot staffRoles og legger
// kategoriens vekter additivt oppå baseline. Resultatet clampes 0-90 slik at
// selv en fullt dekket stab ikke blir altoverskyggende.
export function calculateStaffEffectProfile({ hiredStaff, staffRoles } = {}) {
  const staff = asArray(hiredStaff);
  const roles = asArray(staffRoles);
  const rolesById = new Map(roles.filter((role) => role && role.id).map((role) => [role.id, role]));

  const accumulated = {};
  Object.keys(PROFILE_BASELINE).forEach((dim) => {
    accumulated[dim] = 0;
  });

  const activeStaff = [];
  const notes = [];
  const categoryCounts = {};

  staff.forEach((member) => {
    const category = getStaffCategory(member);
    const weights = category ? CATEGORY_EFFECTS[category] : null;

    // staffRole-match: primær via category===staffRole.id, ellers via canBeHiredAs.
    let staffRole = category ? rolesById.get(category) || null : null;
    if (!staffRole) {
      const viaHire = asArray(member?.canBeHiredAs).find((type) => rolesById.has(TYPE_TO_CATEGORY[type] || type));
      if (viaHire) {
        staffRole = rolesById.get(TYPE_TO_CATEGORY[viaHire] || viaHire) || null;
      }
    }

    if (weights) {
      Object.entries(weights).forEach(([dim, amount]) => {
        accumulated[dim] += amount;
      });
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
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
      affects: asArray(staffRole?.affects)
    });
  });

  const effectProfile = {};
  Object.keys(PROFILE_BASELINE).forEach((dim) => {
    effectProfile[dim] = clamp(PROFILE_BASELINE[dim] + accumulated[dim], 0, PROFILE_MAX);
  });

  return {
    effectProfile,
    activeStaff,
    categoryCounts,
    expertiseTokens: collectStaffTokens(staff),
    notes
  };
}

// Hvor mye stabens ekspertise letter akkurat denne formasjonen (0-15). Generell
// lagorganisering hjelper litt overalt; tema-treff (press/restforsvar/posisjon)
// gir mer når både formasjonen krever det og staben dekker det.
function computeExpertiseRelief(formation, expertiseTokens, effectProfile) {
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

  // Keeper-/sweeperformasjoner hjelpes bare litt av keeperutvikling.
  if (/sweeper|keeper|målvakt/.test(text) && num(effectProfile?.goalkeeperDevelopment) > 0) {
    relief += 2;
  }

  return Math.min(15, relief);
}

// 2) Formasjonstilvenning (0-100).
//
// Uttrykker hvor godt laget/trenerteamet kjenner valgt formasjon. Bruker lagret
// historikk hvis den finnes (teamMerits.formationFamiliarity[formationId]);
// ellers beregnes den fra effektprofilen mot formasjonens krav. En avansert
// formasjon får ikke flat straff, men lavere tilvenning når staben ikke støtter
// den – og høyere når den gjør det.
export function calculateFormationFamiliarity({ formation, effectProfile, teamMerits, expertiseTokens } = {}) {
  const profile = effectProfile || {};
  const tokens = expertiseTokens instanceof Set ? expertiseTokens : new Set();
  const learn = num(profile.tacticalLearningSpeed);
  const famEffect = num(profile.formationFamiliarity);
  const expertiseRelief = computeExpertiseRelief(formation, tokens, profile);

  const difficulty = formation?.tacticalDifficulty;
  const coachingDemand = num(formation?.matchEngineEffects?.coachingDemand);
  const demand = clamp((DIFFICULTY_DEMAND[difficulty] ?? 50) + coachingDemand, 0, 85);

  const stored = formation?.id ? teamMerits?.formationFamiliarity?.[formation.id] : undefined;
  if (Number.isFinite(stored)) {
    // Lagret tilvenning er hovedverdien; staben gir litt ekstra støtte/relief.
    return clamp(Math.round(stored + (famEffect - GENERAL_BASELINE) * 0.15 + expertiseRelief * 0.4));
  }

  // Ingen historikk: beregn fra staben. Start 45.
  let familiarity = 45;
  familiarity += (famEffect - GENERAL_BASELINE) * 0.5;
  familiarity += (learn - GENERAL_BASELINE) * 0.3;
  familiarity += expertiseRelief;

  // Krevende formasjon uten støtte trekker tilvenningen ned (ikke flat straff).
  const support = (famEffect + learn) / 2;
  const demandGap = Math.max(0, demand - support);
  familiarity -= demandGap * 0.4;

  return clamp(Math.round(familiarity));
}

// Hvilke temaer formasjonen krever, og om staben dekker dem.
function matchFormationThemes(formation, expertiseTokens, effectProfile) {
  const text = formationText(formation);
  const tokens = expertiseTokens instanceof Set ? expertiseTokens : new Set();
  const matches = [];

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
//
// Trenerteamets evne til å forstå systemets prinsipper. Bygger på generelle
// trenerdimensjoner, dempet av systemets krav, og løftet når staben matcher
// systemets bærende prinsipper (press / restforsvar / posisjonsspill).
export function calculateCoachUnderstanding({ formation, effectProfile, expertiseTokens, activeStaff } = {}) {
  const profile = effectProfile || {};
  const base =
    (num(profile.tacticalLearningSpeed) + num(profile.formationFamiliarity) + num(profile.roleFitClarity)) / 3;

  let understanding = base;

  const difficulty = formation?.tacticalDifficulty;
  const coachingDemand = num(formation?.matchEngineEffects?.coachingDemand);
  const demand = (DIFFICULTY_DEMAND[difficulty] ?? 50) + coachingDemand;

  // Krevende systemer er vanskeligere å forstå uten støtte.
  understanding -= Math.max(0, demand - 50) * 0.25;

  // Tema-treff (press/restforsvar/posisjon) løfter forståelsen tydelig.
  const themes = matchFormationThemes(formation, expertiseTokens, profile);
  themes.forEach((theme) => {
    understanding += theme.tokenSupport ? 8 : 5;
  });

  // Analytiker/taktisk trener gir litt ekstra systemforståelse.
  const hasAnalyticalEye = asArray(activeStaff).some((member) =>
    member && (member.category === "analyst" || member.category === "tactical_coach")
  );
  if (hasAnalyticalEye) {
    understanding += 4;
  }

  return clamp(Math.round(understanding));
}

// 4) Taktisk læringsfart (0-100).
//
// Hvor raskt formasjonstilvenning kan vokse over tid. Drives av effektprofilens
// læringsdimensjon og av lærings-tunge kategorier (assistent, treningscoach,
// taktisk trener, A-lagstrener, analytiker). Treningsuke teller svakt med.
export function calculateTacticalLearningSpeed({ effectProfile, activeStaff, teamMerits } = {}) {
  let speed = num(effectProfile?.tacticalLearningSpeed);

  const learningStaff = asArray(activeStaff).filter(
    (member) => member && LEARNING_CATEGORIES.includes(member.category)
  ).length;
  speed += Math.min(12, learningStaff * 4);

  const week = teamMerits?.activeTrainingWeek;
  if (Number.isInteger(week) && week > 1) {
    speed += Math.min(4, (week - 1) * 0.5);
  }

  return clamp(Math.round(speed));
}

// 5) Formasjonsvanskelighets-relief (0-12).
//
// Hvor mye staben reduserer en krevende formasjons penalty. Gis bare når
// forståelse, tilvenning og læringsfart faktisk er gode nok. Svak stab på en
// very_high-formasjon gir nesten ingen relief; relevant stab gir mye.
export function calculateFormationDifficultyRelief({
  formation,
  coachUnderstanding,
  formationFamiliarity,
  tacticalLearningSpeed
} = {}) {
  const difficulty = formation?.tacticalDifficulty;
  const maxRelief = DIFFICULTY_MAX_RELIEF[difficulty] ?? 4;

  const support = (num(coachUnderstanding) + num(formationFamiliarity) + num(tacticalLearningSpeed)) / 3;
  // Map støtte 45..85 -> 0..1.
  const factor = clamp((support - 45) / 40, 0, 1);

  return Math.round(maxRelief * factor * 10) / 10;
}

// Samlet coachContext for laget. Alltid gyldig og nøytral selv uten ansatt stab.
export function buildCoachContext({ hiredStaff, staffRoles, formation, teamMerits } = {}) {
  const staff = asArray(hiredStaff);

  const profileResult = calculateStaffEffectProfile({ hiredStaff: staff, staffRoles });
  const { effectProfile, activeStaff, expertiseTokens, notes: profileNotes } = profileResult;

  const formationFamiliarity = calculateFormationFamiliarity({
    formation,
    effectProfile,
    teamMerits,
    expertiseTokens
  });
  const coachUnderstanding = calculateCoachUnderstanding({
    formation,
    effectProfile,
    expertiseTokens,
    activeStaff
  });
  const tacticalLearningSpeed = calculateTacticalLearningSpeed({ effectProfile, activeStaff, teamMerits });
  const formationDifficultyRelief = calculateFormationDifficultyRelief({
    formation,
    coachUnderstanding,
    formationFamiliarity,
    tacticalLearningSpeed
  });

  // historicalFitSupport: forsiktig mål på hvor godt staben støtter systemets
  // historiske prinsipper. Brukes som en liten dytt i den historiske fit-motoren.
  const themeMatches = matchFormationThemes(formation, expertiseTokens, effectProfile);
  const historicalFitSupport = clamp(
    Math.round((coachUnderstanding - GENERAL_BASELINE) * 0.5 + themeMatches.length * 8),
    0,
    40
  );

  const difficulty = formation?.tacticalDifficulty;
  const isDemanding = difficulty === "high" || difficulty === "very_high";

  const strengths = [];
  const issues = [];
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
    notes
  };
}

// Forklarende rapporttekst for UI. Bygger en kort, lesbar status om
// trenerstøtten uten ny UI-struktur. Returnerer { headline, strengths, issues,
// notes } – aldri en runtime-feil.
export function buildCoachContextReport({ coachContext, formation } = {}) {
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

  let headline;
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

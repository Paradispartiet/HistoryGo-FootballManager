// HG Football Manager — Staff & Training Identity v1
// Ren, deterministisk stab-identitet: ingen DOM, localStorage eller fetch.

const ROLE_LABELS = {
  assistant_coach: "Assistenttrener",
  coach: "Trenerteam",
  head_coach: "Trenerteam",
  physical_coach: "Fysisk trener",
  goalkeeper_coach: "Keepertrener",
  physio: "Fysio"
};

const PROGRAM_EXPERTISE = {
  recovery_prevention: ["load_management", "injury_prevention", "physical_preparation"],
  high_press_intensity: ["pressing_structure", "stamina_training", "physical_preparation"],
  build_from_back: ["build_up_play", "passing_training", "keeper_distribution"],
  defensive_structure: ["defensive_structure", "rest_defense", "set_piece_defense", "team_organisation"],
  finishing_chance_creation: ["finishing_training", "chance_creation", "depth_runs"],
  formation_familiarisation: ["team_organisation", "development_culture", "match_discipline"],
  balanced_learning: ["development_culture", "team_organisation", "technical_training"]
};

const BIAS_BY_EXPERTISE = {
  pressing_structure: "press",
  stamina_training: "press",
  build_up_play: "oppbygging",
  passing_training: "oppbygging",
  defensive_structure: "defensiv struktur",
  rest_defense: "defensiv struktur",
  finishing_training: "avslutning",
  chance_creation: "avslutning",
  technical_training: "teknikk",
  development_culture: "rolle-/formasjonslæring",
  team_organisation: "rolle-/formasjonslæring",
  goalkeeper_training: "keeper",
  keeper_distribution: "keeper",
  sweeper_keeper_training: "keeper",
  load_management: "restitusjon",
  injury_prevention: "restitusjon",
  physical_preparation: "restitusjon"
};

function asArray(v) { return Array.isArray(v) ? v : []; }
function clamp(n, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }
function unique(v) { return [...new Set(asArray(v).filter((x) => typeof x === "string" && x.length > 0))]; }
function hasType(member, type) { return member?.staffType === type || asArray(member?.canBeHiredAs).includes(type); }

export function getRequiredExpertiseForTrainingProgram(programId) {
  return unique(PROGRAM_EXPERTISE[programId]);
}

export function buildStaffIdentitySummary({ staff = [], expertise = [], unlocks = null, teamMerits = {}, hiredStaff = null } = {}) {
  const hiredIds = new Set(asArray(teamMerits?.hiredStaffIds));
  const activeStaff = asArray(hiredStaff).length ? asArray(hiredStaff) : asArray(staff).filter((m) => hiredIds.has(m?.id));
  const unlockedIds = new Set([...asArray(teamMerits?.unlockedExpertiseIds), ...activeStaff.flatMap((m) => asArray(m?.expertiseIds))]);
  const expertiseById = new Map(asArray(expertise).map((e) => [e.id, e]));
  const unlockedExpertise = unique([...unlockedIds]).map((id) => ({ id, name: expertiseById.get(id)?.name || id, category: expertiseById.get(id)?.category || null }));
  const roleFlags = {
    assistant: activeStaff.some((m) => hasType(m, "assistant_coach")),
    goalkeeper: activeStaff.some((m) => hasType(m, "goalkeeper_coach")),
    physio: activeStaff.some((m) => hasType(m, "physio") || ["load_management", "injury_prevention"].some((id) => asArray(m?.expertiseIds).includes(id))),
    coaches: activeStaff.filter((m) => hasType(m, "coach") || hasType(m, "head_coach") || hasType(m, "physical_coach")).length
  };
  const trainingBiases = unique([...unlockedIds].map((id) => BIAS_BY_EXPERTISE[id])).slice(0, 6);
  const strengths = [];
  if (roleFlags.assistant) strengths.push("Assistenttrener kan lese helhet, kampforberedelse og formasjonstilvenning.");
  if (roleFlags.physio) strengths.push("Fysio-/belastningskompetanse gjør restitusjon og skadeforebygging tydeligere.");
  if (roleFlags.goalkeeper) strengths.push("Keepertrener støtter distribusjon, feltkontroll og defensiv dødball.");
  trainingBiases.slice(0, 3).forEach((b) => strengths.push(`Trenerteamet har faglig tyngde innen ${b}.`));
  const gaps = [];
  if (!roleFlags.assistant) gaps.push("Mangler tydelig assistenttrener for helhetslesing og taktiske signaler.");
  if (!roleFlags.physio) gaps.push("Mangler fysio/belastningskompetanse for presise slitasjesignaler.");
  if (!roleFlags.goalkeeper) gaps.push("Mangler keepertrener for keeperrollen i oppbygging og dødballer.");
  if (roleFlags.coaches < 2) gaps.push("Trenerteamet er smalt: færre spesialfelt støtter ukas program.");
  const staffScore = clamp(Math.round(activeStaff.length * 12 + unlockedExpertise.length * 4 + (roleFlags.assistant ? 10 : 0) + (roleFlags.physio ? 10 : 0) + (roleFlags.goalkeeper ? 8 : 0)));
  const identityLabel = staffScore >= 70 ? "Sterkt trenerteam" : staffScore >= 45 ? "Tydelig treneridentitet" : activeStaff.length ? "Smalt støtteapparat" : "Uetablert stab";
  const allProgramNeeds = unique(Object.values(PROGRAM_EXPERTISE).flat());
  const missingExpertise = allProgramNeeds.filter((id) => !unlockedIds.has(id)).map((id) => ({ id, name: expertiseById.get(id)?.name || id, canUnlockThroughHistoryGo: asArray(expertiseById.get(id)?.unlockedByPlaceIds).length > 0, placeIds: asArray(expertiseById.get(id)?.unlockedByPlaceIds) })).slice(0, 8);
  const supportSignals = [
    roleFlags.assistant ? "Assistenten gir bedre signaler om formasjon, rollefit og kampforberedelse." : null,
    roleFlags.physio ? "Fysio leser fatigue/wear/injuryRisk før belastende treningsuker." : null,
    roleFlags.goalkeeper ? "Keepertreneren varsler når keeperrollen krever distribusjon eller feltkontroll." : null
  ].filter(Boolean);
  return { staffScore, identityLabel, strengths: strengths.slice(0, 5), gaps: gaps.slice(0, 5), trainingBiases, supportSignals, suggestedFocusAreas: unique([...trainingBiases, ...gaps.map((g) => g.replace(/\.$/, ""))]).slice(0, 5), staffVoices: { assistant: roleFlags.assistant, physio: roleFlags.physio, goalkeeperCoach: roleFlags.goalkeeper, coachingTeam: activeStaff.length > 0 }, unlockedExpertise, missingExpertise, activeStaff: activeStaff.map((m) => ({ id: m.id, name: m.name, staffType: m.staffType, roleLabel: ROLE_LABELS[m.staffType] || "Stab" })) };
}

export function evaluateStaffSupportForTrainingProgram(program, staffIdentity = {}) {
  staffIdentity = staffIdentity && typeof staffIdentity === "object" ? staffIdentity : {};
  const programId = typeof program === "string" ? program : program?.id;
  const required = getRequiredExpertiseForTrainingProgram(programId);
  const unlocked = new Set(asArray(staffIdentity.unlockedExpertise).map((e) => e.id));
  const matched = required.filter((id) => unlocked.has(id));
  const missing = required.filter((id) => !unlocked.has(id));
  const voices = staffIdentity.staffVoices || {};
  let bonus = Math.min(8, matched.length * 2);
  const notes = [];
  if (matched.length) notes.push(`Relevant ekspertise: ${matched.join(", ")} (+${bonus}).`);
  if (missing.length) notes.push(`Mangler støtte: ${missing.join(", ")} — programmet er fortsatt mulig, men mindre presist.`);
  if (programId === "recovery_prevention" && voices.physio) { bonus += 4; notes.push("Fysio gjør slitasje-/skadeforebygging mer presis (+4)."); }
  if (programId === "build_from_back" && voices.goalkeeperCoach) { bonus += 3; notes.push("Keepertrener støtter keeper som oppspillspunkt (+3)."); }
  if (programId === "formation_familiarisation" && voices.assistant) { bonus += 3; notes.push("Assistenttrener støtter formasjonstilvenning (+3)."); }
  return { bonus: clamp(bonus, 0, 12), matchedExpertise: matched, missingExpertise: missing, notes, level: bonus >= 8 ? "strong" : bonus >= 4 ? "medium" : "weak", label: bonus >= 8 ? "Sterk" : bonus >= 4 ? "Middels" : "Svak" };
}

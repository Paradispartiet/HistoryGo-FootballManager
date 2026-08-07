import {
  calculateFacilityEffects,
  canUpgradeFacility,
  normalizeFacilityState,
  summarizeFacilityState,
  upgradeFacilityInMerits
} from "../src/football-facilities.js";
import { applyWeeklyRecovery } from "../src/football-player-condition.js";
import { applyTrainingProgramOffPitchEffects, createDefaultOffPitchState } from "../src/football-off-pitch-parameters.js";

let checks = 0;
let failures = 0;
function check(label, condition, detail = "") {
  checks += 1;
  if (condition) console.log(`  ok   ${label}${detail ? ` (${detail})` : ""}`);
  else { failures += 1; console.error(`  FEIL ${label}${detail ? ` (${detail})` : ""}`); }
}

console.log("\nFacilities Upgrades v1 simulation");
const fresh = normalizeFacilityState(null);
check("gamle saves starter 1/1/1", fresh.levels.training === 1 && fresh.levels.medical === 1 && fresh.levels.analysis === 1);
check("grunnstate er grunnleggende", summarizeFacilityState(fresh).label === "Grunnleggende");
check("første valg i uke 4 er lov", canUpgradeFacility(fresh, "training", { week: 4 }).allowed === true);

const first = upgradeFacilityInMerits({ teamName: "Test" }, "training", { week: 4 });
check("oppgradering endrer nivå", first.changed && first.facilities.levels.training === 2);
check("andre fasilitet samme uke blokkeres", upgradeFacilityInMerits(first.merits, "medical", { week: 4 }).changed === false);
check("andre uke åpner nytt valg", canUpgradeFacility(first.facilities, "medical", { week: 5 }).allowed === true);
check("uvedkommende save-felt bevares", first.merits.teamName === "Test");

let merits = first.merits;
merits = upgradeFacilityInMerits(merits, "training", { week: 5 }).merits;
check("trening kan nå nivå 3", normalizeFacilityState(merits.facilities).levels.training === 3);
check("maksnivå kan ikke overskrides", upgradeFacilityInMerits(merits, "training", { week: 6 }).changed === false);

const strong = normalizeFacilityState({ levels: { training: 3, medical: 3, analysis: 3 } });
const effects = calculateFacilityEffects(strong);
check("sterkt treningsanlegg gir relief 2", effects.trainingLoadReduction === 2);
check("sterk medisinsk gir recovery +6", effects.weeklyRecoveryBonus === 6);
check("sterk analyse gir klarhet +2", effects.analysisClarityBonus === 2);
check("3/3/3 oppsummeres som Sterk", summarizeFacilityState(strong).label === "Sterk");

const condition = [{ playerId: "p1", name: "Spiller", load: 60, form: 0, matchesPlayed: 2, minutesPlayed: 180, consecutiveFullMatches: 2, injury: null }];
const normalRecovery = applyWeeklyRecovery(condition, { trainingIntensity: 1 });
const medicalRecovery = applyWeeklyRecovery(condition, { trainingIntensity: 1, recoveryBonus: 6 });
check("medisinsk avdeling restituerer mer", medicalRecovery[0].load < normalRecovery[0].load, `${medicalRecovery[0].load} < ${normalRecovery[0].load}`);

const shape = { id: "shape", title: "Formasjonsarbeid", category: "shape", sessions: [{ fatigueLoad: 3 }] };
const baselineOffPitch = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), shape);
const improvedOffPitch = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), shape, { facilityEffects: effects });
check("analyse gir mer taktisk klarhet", improvedOffPitch.squad.tacticalClarity > baselineOffPitch.squad.tacticalClarity);
check("treningsanlegg reduserer fatigue fra økta", improvedOffPitch.team.fatigue < baselineOffPitch.team.fatigue);
check("treningsanlegg øker treningstrivsel", improvedOffPitch.squad.trainingHappiness > baselineOffPitch.squad.trainingHappiness);

const pressing = { id: "press", title: "Pressuke", category: "pressing", sessions: [{ fatigueLoad: 5 }] };
const normalPress = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), pressing);
const protectedPress = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), pressing, { facilityEffects: effects });
check("medisinsk avdeling senker injuryRisk-økning", protectedPress.team.injuryRisk < normalPress.team.injuryRisk);

console.log(`\nFacilities Upgrades v1: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

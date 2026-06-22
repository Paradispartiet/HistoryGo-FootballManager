import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildStaffIdentitySummary, evaluateStaffSupportForTrainingProgram } from '../src/football-staff-identity-engine.js';
import { createTrainingProgramCompositions } from '../src/football-training-program-compositions.js';
import { createInboxThreads } from '../src/football-inbox-events.js';
import { buildMatchExplanation } from '../src/football-match-explanation-engine.js';

const readJson = async (p) => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));
const staff = (await readJson('data/football_staff.json')).staff;
const expertise = (await readJson('data/football_expertise.json')).expertise;

const empty = buildStaffIdentitySummary({ staff, expertise, teamMerits: { hiredStaffIds: [], unlockedExpertiseIds: [] } });
assert.equal(empty.staffScore, 0);
assert.ok(empty.gaps.length >= 2);

const richMerits = { hiredStaffIds: ['jorgen_isnes', 'bislett_speed_specialist'], unlockedExpertiseIds: ['team_organisation', 'development_culture', 'pressing_structure', 'load_management', 'injury_prevention', 'physical_preparation'] };
const rich = buildStaffIdentitySummary({ staff, expertise, teamMerits: richMerits });
assert.ok(rich.staffScore > empty.staffScore);
assert.equal(rich.staffVoices.physio, true);

const recovery = evaluateStaffSupportForTrainingProgram('recovery_prevention', rich);
assert.ok(recovery.bonus >= 4);
const formation = evaluateStaffSupportForTrainingProgram('formation_familiarisation', rich);
assert.ok(formation.notes.length > 0);

const programs = createTrainingProgramCompositions({ staffIdentity: rich, offPitchState: { team: { fatigue: 75, wear: 70, injuryRisk: 66 }, squad: {} }, limit: 3 });
assert.ok(programs.some((p) => p.staffSupport));

const inbox = createInboxThreads({ staffIdentity: rich, offPitchState: { team: { fatigue: 75, wear: 70, injuryRisk: 66 }, squad: { tacticalClarity: 45 } }, coachContext: { formationFamiliarity: 45 } });
assert.ok(inbox.some((t) => /Fysio|Assistent/.test(t.sender)));
assert.ok(inbox.length <= 8);

const explanation = buildMatchExplanation({ result: { outcome: 'loss', score: { for: 0, against: 1 }, expectedGoals: { for: 0.8, against: 1.4 }, opponent: { strength: 60 }, decisions: [] }, session: { teamFitSnapshot: { tacticalProfile: { buildUpScore: 50, pressScore: 50, restDefenseScore: 45, roleFitAverage: 55 } }, trainingFocus: { focusId: 'role_understanding', name: 'Rolleforståelse' }, offPitchSnapshot: { fatigue: 70, wear: 65, injuryRisk: 62 }, staffIdentitySnapshot: rich } });
assert.ok(explanation.trainingFactors.some((t) => /Fysio|Trenerteam|Assistent/.test(t)));
console.log('Staff identity sim OK');

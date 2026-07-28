// Read-only simulering av Ukens treningsplan v1.
//
// Det denne skal fange er ikke om koden kjører, men om de tre treningslagene
// faktisk henger sammen — og om skalaen mellom dem stemmer. Programmenes
// `fatigueLoad` lå ubrukt før denne motoren; steg 3 måler at mappingen nå
// sprer seg over hele spennet i stedet for å klumpe seg på taket (CLAUDE.md:
// «en klamp som alltid biter er en skalafeil»).
import fs from "node:fs";
import {
  TRAINING_PLAN_VERSION,
  PROGRAM_LOAD_MIN,
  PROGRAM_LOAD_MAX,
  getProgramWeeklyLoad,
  getProgramFocusIds,
  calculateWeeklyTrainingIntensity,
  describeWeeklyLoad,
  evaluateProgramFocusCoherence,
  createWeeklyTrainingPlan
} from "../src/football-training-plan.js";
import {
  createTrainingProgramCompositions,
  getTrainingProgramCompositionById,
  getTrainingProgramCompositionIds
} from "../src/football-training-program-compositions.js";
import {
  TRAINING_FOCUSES,
  createTrainingMatchdaySnapshot
} from "../src/football-training-week.js";
import { applyWeeklyRecovery } from "../src/football-player-condition.js";

let failures = 0;
function check(label, condition) {
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}
function stage(title) {
  console.log(`\n${title}`);
}

const allPrograms = getTrainingProgramCompositionIds().map((id) => getTrainingProgramCompositionById(id, {}));

// ---------------------------------------------------------------------------
stage("1. Rammen har en ekte belastning");

check("versjonen er stemplet", TRAINING_PLAN_VERSION === "training-plan.v1");
check("alle programmer er byggbare", allPrograms.length >= 7 && allPrograms.every(Boolean));
check(
  "hvert program har en positiv ukebelastning",
  allPrograms.every((program) => getProgramWeeklyLoad(program) > 0)
);

const loads = allPrograms.map((program) => ({ id: program.id, load: getProgramWeeklyLoad(program) }));
const minLoad = Math.min(...loads.map((entry) => entry.load));
const maxLoad = Math.max(...loads.map((entry) => entry.load));
console.log(`     belastning per program: ${loads.map((e) => `${e.id} ${e.load}`).join(" · ")}`);

check(
  `restitusjonsuka er lettest (${minLoad})`,
  loads.find((entry) => entry.load === minLoad)?.id === "recovery_prevention"
);
check(
  `pressuka er hardest (${maxLoad})`,
  loads.find((entry) => entry.load === maxLoad)?.id === "press_week"
);

// ---------------------------------------------------------------------------
stage("2. Skalaen: konstantene stemmer med ekte programdata");

// Dette er hele poenget med steget. Konstantene i motoren er ikke gjettet — de
// er MÅLT ut av malene. Flytter noen på en `fatigueLoad`, skal denne feile,
// ikke stille legge alle uker på taket.
check(`PROGRAM_LOAD_MIN (${PROGRAM_LOAD_MIN}) = laveste faktiske belastning (${minLoad})`, PROGRAM_LOAD_MIN === minLoad);
check(`PROGRAM_LOAD_MAX (${PROGRAM_LOAD_MAX}) = høyeste faktiske belastning (${maxLoad})`, PROGRAM_LOAD_MAX === maxLoad);

const intensities = allPrograms.map((program) => calculateWeeklyTrainingIntensity({ program }));
const uniqueIntensities = new Set(intensities);
console.log(`     intensitet: ${intensities.map((v, i) => `${allPrograms[i].id} ${v}`).join(" · ")}`);

check("ulike programmer gir ulik intensitet", uniqueIntensities.size >= 4);
check("ingen intensitet metter gulvet på 0.6", intensities.every((value) => value > 0.6));
check("ingen intensitet metter taket på 1.6", intensities.every((value) => value < 1.6));
check(
  "spennet er reelt (høyeste minst 0.4 over laveste)",
  Math.max(...intensities) - Math.min(...intensities) >= 0.4
);

// Fokuset modulerer rammen, det overstyrer den ikke.
const pressProgram = allPrograms.find((program) => program.id === "press_week");
const recoveryProgram = allPrograms.find((program) => program.id === "recovery_prevention");
const pressWithRest = calculateWeeklyTrainingIntensity({ program: pressProgram, focusId: "rest_defence" });
const pressWithPress = calculateWeeklyTrainingIntensity({ program: pressProgram, focusId: "pressing" });
check("fokuset flytter intensiteten litt", pressWithRest < pressWithPress);
check(
  "men rammen dominerer: en pressuke med hvilefokus er fortsatt hardere enn en restitusjonsuke med pressfokus",
  pressWithRest > calculateWeeklyTrainingIntensity({ program: recoveryProgram, focusId: "pressing" })
);
check(
  "uten program faller vi tilbake til fokuset alene, rundt nøytralt",
  Math.abs(calculateWeeklyTrainingIntensity({ program: null, focusId: "role_understanding" }) - 1) < 0.05
);

// ---------------------------------------------------------------------------
stage("3. Belastningen virker faktisk på restitusjonen");

// Den forrige feilen i denne klassen var at treningsvalget IKKE påvirket
// hvilen i det hele tatt. Her måler vi at det gjør det nå, og at forskjellen
// mellom en lett og en hard uke er merkbar.
const tired = [{ playerId: "p1", name: "Sliten", load: 70, form: 0, matchesPlayed: 10, minutesPlayed: 900, consecutiveFullMatches: 4, injury: null }];
const afterLight = applyWeeklyRecovery(tired, { trainingIntensity: calculateWeeklyTrainingIntensity({ program: recoveryProgram }) })[0];
const afterHard = applyWeeklyRecovery(tired, { trainingIntensity: calculateWeeklyTrainingIntensity({ program: pressProgram }) })[0];
console.log(`     load 70 → restitusjonsuke ${afterLight.load} · pressuke ${afterHard.load}`);

check("en restitusjonsuke henter inn mer enn en pressuke", afterLight.load < afterHard.load);
check("forskjellen er merkbar (minst 8 belastningspoeng)", afterHard.load - afterLight.load >= 8);
check("selv en pressuke henter inn noe", afterHard.load < 70);

check("en lett uke merkes som lett", describeWeeklyLoad(calculateWeeklyTrainingIntensity({ program: recoveryProgram })).level === "lett");
check("en pressuke merkes som svært hard", describeWeeklyLoad(calculateWeeklyTrainingIntensity({ program: pressProgram })).level === "svært_hard");

// En etikett som nesten alltid sier det samme er verdiløs. Første utgave la fem
// av sju programmer på «Hard uke» og ingen på «Normal» — tersklene var satt
// etter runde tall i stedet for etter de faktiske intensitetene.
{
  const levels = allPrograms.map((program) => describeWeeklyLoad(calculateWeeklyTrainingIntensity({ program })).level);
  const spread = new Set(levels);
  const commonest = Math.max(...[...spread].map((level) => levels.filter((l) => l === level).length));
  console.log(`     etiketter: ${allPrograms.map((p, i) => `${p.id} ${levels[i]}`).join(" · ")}`);
  check(`etikettene sprer seg over minst tre nivåer (${spread.size})`, spread.size >= 3);
  check(`ingen etikett dekker mer enn to tredjedeler av programmene (${commonest}/${levels.length})`, commonest <= Math.ceil(levels.length * 2 / 3));
}

// ---------------------------------------------------------------------------
stage("4. Koblingen: ligger temaet inne i rammen?");

check(
  "hvert program peker på minst ett ekte treningsfokus",
  allPrograms.every((program) => getProgramFocusIds(program).length > 0)
);
check(
  "alle programmenes fokus finnes i TRAINING_FOCUSES",
  allPrograms.every((program) => getProgramFocusIds(program).every((id) => TRAINING_FOCUSES.some((focus) => focus.id === id)))
);

const aligned = evaluateProgramFocusCoherence(pressProgram, "pressing");
const misaligned = evaluateProgramFocusCoherence(pressProgram, "build_up");
check("samsvar gir +1", aligned.aligned === true && aligned.metricBonusDelta === 1);
check("sprik gir −1", misaligned.aligned === false && misaligned.metricBonusDelta === -1);
check("sprik forklares med et managervalg, ikke en spillersvakhet", /valg du har tatt|spillerne mangler/.test(misaligned.note));
check("uten program er samsvaret ufullstendig, ikke straffet", evaluateProgramFocusCoherence(null, "pressing").metricBonusDelta === 0);
check("uten fokus er samsvaret ufullstendig, ikke straffet", evaluateProgramFocusCoherence(pressProgram, null).metricBonusDelta === 0);

// Hvert program må ha MINST ett fokus som gir samsvar, ellers hadde et program
// vært umulig å treffe med — en blindvei i miniatyr.
check(
  "hvert program kan treffes med minst ett fokus",
  allPrograms.every((program) => TRAINING_FOCUSES.some((focus) => evaluateProgramFocusCoherence(program, focus.id).aligned === true))
);
// … og minst ett som gir sprik, ellers ville regelen vært uten innhold.
check(
  "hvert program kan også bommes på",
  allPrograms.every((program) => TRAINING_FOCUSES.some((focus) => evaluateProgramFocusCoherence(program, focus.id).aligned === false))
);

// ---------------------------------------------------------------------------
stage("5. Samsvaret når faktisk kampdagen");

const coachContext = { activeStaff: [{ category: "tactical_coach" }], effectProfile: { pressingDrills: 60 } };
const snapshotArgs = {
  selection: { focusId: "pressing", week: 3, appliedSessionId: null },
  clubWeek: 3,
  coachContext
};
const neutral = createTrainingMatchdaySnapshot({ ...snapshotArgs });
const withAlign = createTrainingMatchdaySnapshot({ ...snapshotArgs, coherenceBonus: 1 });
const withSprik = createTrainingMatchdaySnapshot({ ...snapshotArgs, coherenceBonus: -1 });

check("samsvar løfter metrikkbonusen", withAlign.metricBonuses.pressScore > neutral.metricBonuses.pressScore);
check("sprik senker metrikkbonusen", withSprik.metricBonuses.pressScore < neutral.metricBonuses.pressScore);
check("bonusen er stemplet i snapshotet", withAlign.coherenceBonus === 1 && withSprik.coherenceBonus === -1);
// Invarianten, ikke bare ett tilfelle: uansett fokus og uansett stabsnivå skal
// et sprik koste — men aldri nulle ut uka. Gulvet i motoren er beltet; dette er
// selen. Med dagens tall (baseBonus 2–4) er gulvet ikke bindende, så det er
// invarianten som er verdt å måle, ikke gulvuttrykket i seg selv.
{
  const staffLevels = [
    { label: "uten stab", coachContext: { activeStaff: [] } },
    { label: "middels stab", coachContext: { activeStaff: [{ category: "tactical_coach" }] } },
    { label: "sterk stab", coachContext: { activeStaff: [{ category: "tactical_coach" }, { category: "training_coach" }, { category: "coach" }] } }
  ];
  const bonuses = [];
  for (const focus of TRAINING_FOCUSES) {
    for (const staff of staffLevels) {
      const snapshot = createTrainingMatchdaySnapshot({
        selection: { focusId: focus.id, week: 3, appliedSessionId: null },
        clubWeek: 3,
        coachContext: staff.coachContext,
        coherenceBonus: -1
      });
      bonuses.push(...Object.values(snapshot.metricBonuses));
    }
  }
  check(
    `et sprik nuller aldri ut treningsuka (${TRAINING_FOCUSES.length} fokus × ${staffLevels.length} stabsnivå, laveste bonus ${Math.min(...bonuses)})`,
    bonuses.length > 0 && bonuses.every((value) => value >= 1)
  );
}
check(
  "uten argumentet er tallene identiske med før (additiv endring)",
  JSON.stringify(neutral.metricBonuses) === JSON.stringify(
    createTrainingMatchdaySnapshot({ ...snapshotArgs, coherenceBonus: 0 }).metricBonuses
  )
);

// ---------------------------------------------------------------------------
stage("6. Uka som fire steg");

const emptyPlan = createWeeklyTrainingPlan({ week: 1 });
check("tom uke gir fire steg", emptyPlan.steps.length === 4);
check("stegene er nummerert i rekkefølge", emptyPlan.steps.map((step) => step.order).join(",") === "1,2,3,4");
check("rekkefølgen er innboks → program → fokus → individuell", emptyPlan.steps.map((step) => step.id).join(",") === "inbox,program,focus,individual");
check("tom uke er ikke klar for kamp", emptyPlan.ready === false);
check("tom uke peker på første steg", emptyPlan.nextStepId === "inbox");
check("hvert steg sier hva laget det gjør", emptyPlan.steps.every((step) => step.role.length > 20));
check("hvert steg har et sted å gå", emptyPlan.steps.every((step) => step.modal || step.target));

const halfPlan = createWeeklyTrainingPlan({ week: 2, inboxRead: true, program: pressProgram });
check("valgt ramme merkes som gjort", halfPlan.steps.find((step) => step.id === "program").done === true);
check("neste steg blir da temaet", halfPlan.nextStepId === "focus");
check("ramme alene gjør uka spillbar", halfPlan.ready === true);

const fullPlan = createWeeklyTrainingPlan({
  week: 2,
  inboxRead: true,
  program: pressProgram,
  focusId: "pressing",
  individualSummary: { used: 2, free: 1, capacity: 3, headline: "2 av 3 spillere følges opp individuelt.", detail: "Rolletrening" }
});
check("full uke har ingen gjenstående steg", fullPlan.nextStepId === null);
check("full uke med samsvar sier det i overskriften", /samme vei/.test(fullPlan.headline));
check("forklaringen nevner både ramme, tema og enkeltspillere", fullPlan.explanation.length >= 4);

const conflictPlan = createWeeklyTrainingPlan({ week: 2, inboxRead: true, program: pressProgram, focusId: "build_up" });
check("sprik løftes i overskriften", /utenfor programmet/.test(conflictPlan.headline));

// ---------------------------------------------------------------------------
stage("7. Renhet");

// Kommentarene i motoren NEVNER det de lover å ikke gjøre («ingen DOM, fetch,
// localStorage …»). En renhetssjekk på rå tekst ville vært grønn av feil grunn
// den ene veien og rød av feil grunn den andre — så vi ser bare på koden.
const planSource = fs
  .readFileSync(new URL("../src/football-training-plan.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");
check("ingen DOM", !/document\.|window\./.test(planSource));
check("ingen lagring", !/localStorage|sessionStorage/.test(planSource));
check("ingen nettverk", !/fetch\(/.test(planSource));
check("ingen tilfeldighet", !/Math\.random|Date\.now/.test(planSource));
check("leser aldri overall", !/overall/.test(planSource));

const twice = JSON.stringify(createWeeklyTrainingPlan({ week: 5, program: pressProgram, focusId: "pressing" }));
check(
  "deterministisk: samme input gir byte-identisk output",
  twice === JSON.stringify(createWeeklyTrainingPlan({ week: 5, program: pressProgram, focusId: "pressing" }))
);

// Programlisten fra den ekte anbefalingsmotoren må også fungere som ramme.
const recommended = createTrainingProgramCompositions({ limit: 3 });
check("anbefalte programmer kan brukes som ramme uten videre", recommended.every((program) => getProgramWeeklyLoad(program) > 0));

// ---------------------------------------------------------------------------
const total = failures;
console.log(`\n${total === 0 ? "✓" : "✗"} Ukens plan: ${total === 0 ? "alle sjekker bestått" : `${total} feil`}.`);
process.exit(total === 0 ? 0 : 1);

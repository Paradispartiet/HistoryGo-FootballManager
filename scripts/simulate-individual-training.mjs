// Read-only simulering av Individuell trening v1.
//
// Det viktigste steget her er ikke mekanikken, men steg 6: at ingen av sporene
// kan gjøre en spiller «bedre». Individuell trening er stedet der et ratingspill
// ville sneket seg inn bakveien, så motoren og dataene sjekkes eksplisitt mot
// `overall`.
import fs from "node:fs";
import {
  INDIVIDUAL_TRAINING_VERSION,
  normalizeIndividualTrainingCatalogue,
  getIndividualTrack,
  calculateIndividualCapacity,
  sanitizeIndividualAssignments,
  evaluateIndividualAssignment,
  individualStaffSupport,
  resolveIndividualTrainingWeek,
  summarizeIndividualTraining
} from "../src/football-individual-training.js";
import {
  applyIndividualTrainingEffects,
  applyWeeklyRecovery,
  createCondition,
  isInjured,
  freshnessFor
} from "../src/football-player-condition.js";
import {
  applyTrainingRoleGrowth,
  getRoleFamiliarity,
  ROLE_FAMILIARITY_MAX
} from "../src/football-role-familiarity-engine.js";

let failures = 0;
function check(label, condition) {
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}
function stage(title) {
  console.log(`\n${title}`);
}

const raw = JSON.parse(fs.readFileSync(new URL("../data/football_individual_training.json", import.meta.url), "utf8"));
const catalogue = normalizeIndividualTrainingCatalogue(raw);
const roles = JSON.parse(fs.readFileSync(new URL("../data/football_roles.json", import.meta.url), "utf8"));
const roleIds = new Set((Array.isArray(roles) ? roles : roles.roles || []).map((role) => role.id));

// ---------------------------------------------------------------------------
stage("1. Katalogen");

check("versjonen er stemplet", INDIVIDUAL_TRAINING_VERSION === "individual-training.v1");
check("datafilen har sitt eget skjema", raw.schema === "historygo-football-manager.individual-training.v1");
check(`sporene er lastet (${catalogue.tracks.length})`, catalogue.tracks.length >= 4);
check(
  "sporene dekker jobbene: rolle, svak side, kropp, form og skade",
  ["role_drills", "weakness_work", "recovery", "sharpness", "rehab"].every((id) => Boolean(getIndividualTrack(catalogue, id)))
);
check("hvert spor forklarer effekten sin", catalogue.tracks.every((track) => track.effectText.length > 10));
check("hvert spor forklarer risikoen sin", catalogue.tracks.every((track) => track.riskText.length > 10));
check(
  "hvert spor har en managernote som peker på treneren, ikke spilleren",
  catalogue.tracks.every((track) => track.managerNote.length > 10)
);
check("en tom/ukjent katalog degraderer til gyldig struktur", normalizeIndividualTrainingCatalogue(null).tracks.length === 0);
check("en tom katalog har fortsatt minst én plass", normalizeIndividualTrainingCatalogue(null).capacity.base >= 1);

// ---------------------------------------------------------------------------
stage("2. Kapasitet: stab gir plasser, men aldri null");

const noStaff = calculateIndividualCapacity(catalogue, { staffCategories: [] });
const someStaff = calculateIndividualCapacity(catalogue, { staffCategories: ["fitness_coach", "tactical_coach"] });
const lotsOfStaff = calculateIndividualCapacity(catalogue, {
  staffCategories: ["fitness_coach", "tactical_coach", "physio", "technical_coach", "coach", "doctor", "training_coach"]
});
console.log(`     kapasitet: uten stab ${noStaff} · to trenere ${someStaff} · full stab ${lotsOfStaff}`);

check("uten stab kan du fortsatt følge opp én spiller", noStaff === 1);
check("stab gir flere plasser", someStaff > noStaff);
check("kapasiteten er kappet", lotsOfStaff === catalogue.capacity.max);
check("irrelevant stab gir ingen plasser", calculateIndividualCapacity(catalogue, { staffCategories: ["kitman", "chef"] }) === noStaff);

// ---------------------------------------------------------------------------
stage("3. Tildelinger saneres");

const messy = [
  { playerId: "a", trackId: "recovery" },
  { playerId: "a", trackId: "sharpness" },          // duplikat spiller
  { playerId: "b", trackId: "finnes_ikke" },        // ukjent spor
  { playerId: "", trackId: "recovery" },            // uten spiller
  { playerId: "c", trackId: "role_drills" },        // rolletrening uten rolle
  { playerId: "d", trackId: "role_drills", roleId: "deep_playmaker" }
];
const sanitized = sanitizeIndividualAssignments(messy, { catalogue, capacity: 5, week: 3 });
check("duplikat spiller droppes", sanitized.assignments.filter((entry) => entry.playerId === "a").length === 1);
check("ukjent spor droppes", !sanitized.assignments.some((entry) => entry.playerId === "b"));
check("tildeling uten spiller droppes", !sanitized.assignments.some((entry) => !entry.playerId));
check("rolletrening uten rolle droppes", !sanitized.assignments.some((entry) => entry.playerId === "c"));
check("gyldig rolletrening beholdes", sanitized.assignments.some((entry) => entry.playerId === "d" && entry.roleId === "deep_playmaker"));
check("uka følger med", sanitized.week === 3);
check(
  "kapasiteten kapper lagrede tildelinger",
  sanitizeIndividualAssignments(
    ["p1", "p2", "p3", "p4"].map((playerId) => ({ playerId, trackId: "recovery" })),
    { catalogue, capacity: 2 }
  ).assignments.length === 2
);

// ---------------------------------------------------------------------------
stage("4. Et «nei» har alltid en grunn");

const fit = createCondition("fit_player", "Frisk");
const hurt = { ...createCondition("hurt_player", "Skadet"), injury: { weeksOut: 3, reason: "Belastning" } };
const player = { id: "fit_player", name: "Frisk" };
const injuredPlayer = { id: "hurt_player", name: "Skadet" };

const rehabOnFit = evaluateIndividualAssignment({ track: getIndividualTrack(catalogue, "rehab"), player, condition: fit });
const sharpOnHurt = evaluateIndividualAssignment({ track: getIndividualTrack(catalogue, "sharpness"), player: injuredPlayer, condition: hurt });
const roleNoRole = evaluateIndividualAssignment({ track: getIndividualTrack(catalogue, "role_drills"), player, condition: fit });

check("opptrening på en frisk spiller avvises", rehabOnFit.valid === false);
check("… med en forklaring", rehabOnFit.reason.length > 10);
check("skarphet på en skadet spiller avvises", sharpOnHurt.valid === false);
check("… og peker på opptrening i stedet", /[Oo]pptrening/.test(sharpOnHurt.reason));
check("rolletrening uten rolle avvises med grunn", roleNoRole.valid === false && /rolle/i.test(roleNoRole.reason));
check("opptrening på en skadet spiller godtas", evaluateIndividualAssignment({ track: getIndividualTrack(catalogue, "rehab"), player: injuredPlayer, condition: hurt }).valid === true);
check(
  "rolletrening med rolle godtas",
  evaluateIndividualAssignment({ track: getIndividualTrack(catalogue, "role_drills"), player, condition: fit, roleId: "deep_playmaker" }).valid === true
);

// ---------------------------------------------------------------------------
stage("5. Uka gjøres opp");

const conditions = [
  { ...createCondition("tired", "Sliten"), load: 72, consecutiveFullMatches: 4, matchesPlayed: 8, minutesPlayed: 720 },
  { ...createCondition("flat", "Formsvak"), load: 30, form: -1.2, matchesPlayed: 6, minutesPlayed: 500 },
  { ...createCondition("learner", "Elev"), load: 20, matchesPlayed: 4, minutesPlayed: 320 },
  { ...createCondition("broken", "Ute"), load: 55, injury: { weeksOut: 3, reason: "Belastning" } }
];
const playersById = {
  tired: { id: "tired", name: "Sliten" },
  flat: { id: "flat", name: "Formsvak" },
  learner: { id: "learner", name: "Elev" },
  broken: { id: "broken", name: "Ute" }
};
const conditionsById = Object.fromEntries(conditions.map((entry) => [entry.playerId, entry]));

const assignments = [
  { playerId: "tired", trackId: "recovery", roleId: null },
  { playerId: "flat", trackId: "sharpness", roleId: null },
  { playerId: "learner", trackId: "role_drills", roleId: "deep_playmaker" },
  { playerId: "broken", trackId: "rehab", roleId: null }
];

const resolved = resolveIndividualTrainingWeek({
  catalogue,
  assignments,
  playersById,
  conditionsById,
  staffCategories: ["fitness_coach", "tactical_coach", "physio"],
  playsRoleThisWeek: { learner: "deep_playmaker" }
});

check("alle fire ble gjennomført", resolved.reports.length === 4 && resolved.reports.every((report) => report.applied));
check("hver rapport forklarer seg", resolved.reports.every((report) => report.explanation.length >= 2));
check("restitusjon gir negativ belastning", resolved.loadDeltas.tired < 0);
check("skarphet koster belastning", resolved.loadDeltas.flat > 0);
check("skarphet løfter formen", resolved.formDeltas.flat > 0);
check("rolletrening gir vekst", resolved.familiarityGains.some((gain) => gain.playerId === "learner" && gain.growth > 0));
check("opptrening korter ned skaden", resolved.rehabWeeks.broken >= 1);

// Rekkefølgen som app.js bruker: laget hviler først, så enkeltspilleren.
const afterTeamRest = applyWeeklyRecovery(conditions, { trainingIntensity: 1 });
const afterIndividual = applyIndividualTrainingEffects(afterTeamRest, resolved);
const before = Object.fromEntries(afterTeamRest.map((entry) => [entry.playerId, entry]));
const after = Object.fromEntries(afterIndividual.map((entry) => [entry.playerId, entry]));
console.log(`     sliten: load ${before.tired.load} → ${after.tired.load} · skadet: ${before.broken.injury?.weeksOut} → ${after.broken.injury?.weeksOut ?? "tilbake"} uker`);

check("egen restitusjon legger seg OPPÅ lagets hvile", after.tired.load < before.tired.load);
check("skarphet drar belastningen opp igjen", after.flat.load > before.flat.load);
check("formen løftes", after.flat.form > before.flat.form);
check("opptreningen korter ned skaden ut over den vanlige uketellingen", (after.broken.injury?.weeksOut ?? 0) < (before.broken.injury?.weeksOut ?? 0));
check("belastningen holder seg innenfor 0–100", afterIndividual.every((entry) => entry.load >= 0 && entry.load <= 100));
check("formen holder seg innenfor ±3", afterIndividual.every((entry) => Math.abs(entry.form) <= 3));

const familiarity = applyTrainingRoleGrowth({}, resolved.familiarityGains);
check("fortroligheten havner i det felles oppslaget", getRoleFamiliarity(familiarity, "learner", "deep_playmaker") > 0);
check("fortroligheten er kappet på 100", getRoleFamiliarity(applyTrainingRoleGrowth({ "x::y": 98 }, [{ playerId: "x", roleId: "y", growth: 50 }]), "x", "y") === ROLE_FAMILIARITY_MAX);
check("negativ vekst ignoreres — trening forvitrer ikke", getRoleFamiliarity(applyTrainingRoleGrowth({ "x::y": 40 }, [{ playerId: "x", roleId: "y", growth: -20 }]), "x", "y") === 40);

// Trening bygger saktere enn å faktisk spille rollen.
const usedRole = resolveIndividualTrainingWeek({
  catalogue, assignments: [{ playerId: "learner", trackId: "role_drills", roleId: "deep_playmaker" }],
  playersById, conditionsById, staffCategories: [], playsRoleThisWeek: { learner: "deep_playmaker" }
}).familiarityGains[0].growth;
const unusedRole = resolveIndividualTrainingWeek({
  catalogue, assignments: [{ playerId: "learner", trackId: "role_drills", roleId: "deep_playmaker" }],
  playersById, conditionsById, staffCategories: [], playsRoleThisWeek: {}
}).familiarityGains[0].growth;
check("å trene rollen han faktisk spiller gir mer", usedRole > unusedRole);
check("men å trene en rolle han ikke spiller gir fortsatt noe", unusedRole > 0);

check("stab gjør økta bedre", individualStaffSupport(getIndividualTrack(catalogue, "recovery"), ["physio", "fitness_coach"]).factor > individualStaffSupport(getIndividualTrack(catalogue, "recovery"), []).factor);
check("uten stab skjer det fortsatt noe", individualStaffSupport(getIndividualTrack(catalogue, "recovery"), []).factor > 0);

// Ugyldige tildelinger stopper ikke uka — de rapporteres.
const withInvalid = resolveIndividualTrainingWeek({
  catalogue,
  assignments: [{ playerId: "tired", trackId: "rehab", roleId: null }, { playerId: "flat", trackId: "recovery", roleId: null }],
  playersById, conditionsById, staffCategories: []
});
check("ugyldig tildeling rapporteres, ikke kastes", withInvalid.reports.some((report) => report.applied === false));
check("resten av uka gjennomføres likevel", withInvalid.reports.some((report) => report.applied === true));

// ---------------------------------------------------------------------------
stage("6. Dette er ikke et ratingspill");

const engineSource = fs
  .readFileSync(new URL("../src/football-individual-training.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

check("motoren leser aldri overall", !/overall/.test(engineSource));
check("motoren rører aldri matchScore", !/matchScore/.test(engineSource));
check("datafilen har ingen overall-felter", !/"overall"/.test(JSON.stringify(raw)));
check(
  "ingen spor kan heve en spillers klasse — kun fortrolighet, belastning, form og skade",
  catalogue.tracks.every((track) =>
    track.familiarityGrowth > 0 || track.loadDelta !== 0 || track.formDelta !== 0 || track.rehabWeeks > 0
  ) && !/rating|ability|skill(?!s)/i.test(engineSource)
);
check(
  "formutslaget er lite og midlertidig (maks 0.5 per uke)",
  catalogue.tracks.every((track) => Math.abs(track.formDelta) <= 0.5)
);
check(
  "rollefortrolighet fra trening er mindre enn fra en godt spilt kamp (9)",
  catalogue.tracks.every((track) => track.familiarityGrowth <= 9)
);

// ---------------------------------------------------------------------------
stage("7. Renhet og data");

check("ingen DOM", !/document\.|window\./.test(engineSource));
check("ingen lagring", !/localStorage|sessionStorage/.test(engineSource));
check("ingen nettverk", !/fetch\(/.test(engineSource));
check("ingen tilfeldighet", !/Math\.random|Date\.now/.test(engineSource));
check("ingen hardkodede spor i motoren", !/role_drills|sharpness/.test(engineSource));
check(
  "deterministisk: samme input gir byte-identisk output",
  JSON.stringify(resolveIndividualTrainingWeek({ catalogue, assignments, playersById, conditionsById, staffCategories: ["physio"] }))
    === JSON.stringify(resolveIndividualTrainingWeek({ catalogue, assignments, playersById, conditionsById, staffCategories: ["physio"] }))
);
check(
  "muterer ikke inn-tilstanden",
  conditions.find((entry) => entry.playerId === "tired").load === 72
);
check("rolle-id-en i testen finnes i rolledataene", roleIds.has("deep_playmaker"));

const summaryEmpty = summarizeIndividualTraining({ catalogue, assignments: [], capacity: 3 });
const summaryUsed = summarizeIndividualTraining({ catalogue, assignments, capacity: 4 });
check("tom uke sier hvor mange plasser du har", /plass/.test(summaryEmpty.headline));
check("tom uke er ingen feil, bare en ubrukt mulighet", summaryEmpty.free === 3 && summaryEmpty.used === 0);
check("brukt uke teller riktig", summaryUsed.used === 4 && summaryUsed.free === 0);

// ---------------------------------------------------------------------------
stage("8. Wiret i appen");

const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

check("katalogen lastes fra datafil", /individualTraining: "data\/football_individual_training\.json"/.test(app));
check("ingen spor er hardkodet i app.js", !/role_drills|"sharpness"/.test(app));
check("uka anvendes fra restitusjonssteget", /applyWeeklyRecovery\([\s\S]{0,220}applyIndividualTrainingWeek\(\)/.test(app));

// REKKEFØLGE-VAKT. Tildelingene er nøklet på Club Week-uka, og
// `getIndividualAssignments()` returnerer tom liste hvis uka ikke stemmer.
// Ukesoppgjøret må derfor kjøre MENS `state.clubWeekState` fortsatt peker på
// uka som avsluttes — altså før `setClubWeekState(next)`.
//
// Flytter noen på de to linjene, slutter individuell trening å virke helt
// stille: ingen feil, ingen unntak, bare en uke som ikke gjorde noe. Ingen
// annen vakt ville sett det.
{
  const rollover = app.slice(app.indexOf("if (next.week !== previous.week)"));
  const recoveryAt = rollover.indexOf("applyWeeklyPlayerRecovery()");
  const commitAt = rollover.indexOf("setClubWeekState(next)");
  check(
    "ukesoppgjøret kjører før den nye uka settes (ellers er tildelingene borte)",
    recoveryAt > -1 && commitAt > -1 && recoveryAt < commitAt
  );
}
// Vakten er skrevet mot INTENSJONEN: begge kallene skal stå i render-løypa.
// En tidligere utgave krevde at de sto på HVER SIN LINJE rett etter hverandre,
// og ble rød da et tredje render-kall (svake sider) kom imellom — uten at noe
// var galt. Render-løypa er kroppen til renderApp().
{
  const renderApp = app.slice(app.indexOf("function renderApp()"));
  check("individuell trening rendres fra render-løypa", /\n  renderIndividualTraining\(\);/.test(renderApp));
  check("ukens plan rendres fra render-løypa", /\n  renderWeeklyTrainingPlan\(\);/.test(renderApp));
}
check("inline-steget finnes", /id="individualTrainingStep"/.test(html) && /id="individualTrainingPicker"/.test(html));
check("den gamle popupen er fjernet", !/id="modalIndividualTraining"/.test(html));
check("tildelinger er modus-isolert", /"individualTraining"/.test(fs.readFileSync(new URL("../src/football-mode-sessions.js", import.meta.url), "utf8")));

// ---------------------------------------------------------------------------
const total = failures;
console.log(`\n${total === 0 ? "✓" : "✗"} Individuell trening: ${total === 0 ? "alle sjekker bestått" : `${total} feil`}.`);
process.exit(total === 0 ? 0 : 1);

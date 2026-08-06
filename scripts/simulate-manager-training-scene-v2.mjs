import { createManagerTrainingSceneModel } from "../src/ui/manager-training-presentation.js";

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

const emptyPlan = {
  week: 3,
  headline: "Uke 3: ingen treningsuke valgt ennå.",
  ready: false,
  nextStepId: "inbox",
  load: { label: "Normal uke", note: "Balansert belastning.", level: "normal" },
  coherence: { label: "Ikke ferdig valgt", note: "Velg program og fokus.", level: "ufullstendig" },
  steps: [
    { id: "inbox", title: "Les signalene", done: false },
    { id: "program", title: "Velg ukas ramme", done: false },
    { id: "focus", title: "Prioriter ett tema", done: false },
    { id: "individual", title: "Følg opp enkeltspillere", done: false }
  ]
};

console.log("\n1. Tom treningsuke");
const empty = createManagerTrainingSceneModel({
  week: 3,
  phase: "training",
  opponent: { name: "Viking", homeAway: "away", ground: "Lyse Arena" },
  plan: emptyPlan,
  assistantSignal: "Viking presser høyt.",
  assistantDetail: "Laget må kunne spille seg ut under press.",
  conditionSummary: { tracked: 15, injuredCount: 0, tiredCount: 2 }
});
check("uken og fasen er lesbare", empty.week === 3 && empty.phaseLabel === "Training");
check("neste motstander er bevart", empty.opponent.name === "Viking" && /Lyse Arena/.test(empty.opponent.meta));
check("assistentens signal står først", empty.assistant.signal === "Viking presser høyt.");
check("fire operative statuser bygges", empty.statuses.length === 4);
check("slitasje løftes som oppmerksomhet", empty.statuses[0].tone === "attention" && /2 slitne/.test(empty.statuses[0].value));
check("første handling peker til Assistentråd", empty.action.target === "inbox");
check("tom uke er ikke komplett", empty.complete === false && empty.progress.ready === false);

console.log("\n2. Signal lest og program valgt");
const halfPlan = {
  ...emptyPlan,
  headline: "Uke 3: Pressuke valgt — ett steg gjenstår.",
  nextStepId: "focus",
  steps: emptyPlan.steps.map((step) => ({ ...step, done: ["inbox", "program"].includes(step.id) }))
};
const half = createManagerTrainingSceneModel({
  week: 3,
  phase: "training",
  plan: halfPlan,
  selectedProgram: { title: "Pressuke" },
  conditionSummary: { tracked: 15, injuredCount: 0, tiredCount: 0 }
});
check("valgt program vises", half.statuses.find((item) => item.id === "program")?.value === "Pressuke");
check("fokus blir neste arbeidssteg", half.action.target === "trainingFocusStep");
check("frisk tropp beskrives uten råscore", half.statuses[0].value === "Frisk tropp");

console.log("\n3. Program og fokus valgt");
const fullPlan = {
  ...emptyPlan,
  headline: "Uke 3: Pressuke med pressing som tema — rammen og temaet trekker samme vei.",
  ready: true,
  nextStepId: null,
  coherence: { label: "Rammen støtter temaet", note: "Laget får mer ut av begge.", level: "samsvar" },
  steps: emptyPlan.steps.map((step) => ({ ...step, done: step.id !== "individual" }))
};
const full = createManagerTrainingSceneModel({
  week: 3,
  phase: "match_preparation",
  plan: fullPlan,
  selectedProgram: { title: "Pressuke" },
  selectedFocus: { name: "Pressing", effectHint: "Løfter presset på kampdag." },
  individualSummary: { used: 0, detail: "Ingen spiller trenger særskilt oppfølging." },
  conditionSummary: { tracked: 15, injuredCount: 0, tiredCount: 0 }
});
check("program og fokus vises samtidig", full.statuses.find((item) => item.id === "program")?.value === "Pressuke" && full.statuses.find((item) => item.id === "focus")?.value === "Pressing");
check("samsvar er positivt", full.coherence.tone === "positive");
check("individuell trening er valgfri", full.statuses.find((item) => item.id === "individual")?.value === "Valgfritt");
check("ferdig uke peker til Kamp", full.action.target === "kamp");
check("ferdig uke er stemplet", full.complete === true && full.progress.ready === true);

console.log("\n4. Skade og individuell oppfølging");
const injury = createManagerTrainingSceneModel({
  week: 4,
  plan: fullPlan,
  conditionSummary: { tracked: 15, injuredCount: 1, tiredCount: 2 },
  individualSummary: { used: 2, detail: "Én rehabilitering og én rolleøkt." },
  selectedProgram: { title: "Restitusjonsuke" },
  selectedFocus: { name: "Restforsvar" }
});
check("skade får negativ tone", injury.statuses[0].tone === "negative" && injury.statuses[0].value === "1 skadet");
check("individuell oppfølging viser antall", injury.statuses.find((item) => item.id === "individual")?.value === "2 følges opp");
check("statuskort peker til eksisterende arbeidssteg", injury.statuses.every((item) => ["details", "trainingProgramStep", "trainingFocusStep", "individualTrainingStep"].includes(item.target)));

console.log(`\nManager Training Scene v2: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

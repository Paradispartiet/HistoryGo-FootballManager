import { createMatchdaySceneModel } from "../src/ui/manager-matchday-presentation.js";

let failures = 0;
let checks = 0;
function check(label, condition, detail = "") {
  checks += 1;
  if (condition) console.log(`  ok   ${label}${detail ? ` (${detail})` : ""}`);
  else {
    failures += 1;
    console.error(`  FEIL ${label}${detail ? ` (${detail})` : ""}`);
  }
}

const common = {
  teamName: "Bislett FK",
  opponentBrief: "Viking · Eliteserien · Runde 4",
  opponent: { name: "Viking", style: "høyt press", era: "moderne" },
  competitionLabel: "Eliteserien",
  roundLabel: "Runde 4",
  venueLabel: "Borte",
  formationName: "Modern 4-2-3-1",
  tacticName: "Balansert",
  trainingLabel: "Kampforberedelse · Pressmotstand",
  lastSignal: "Assistenten advarer mot presset i første fase."
};

const blocked = createMatchdaySceneModel({
  ...common,
  primaryAction: "Velg treningsprogram",
  readiness: {
    status: "blocked",
    canStartMatch: false,
    summary: "Treningsuka mangler et program.",
    blockers: [{ code: "training", message: "Velg treningsprogram.", target: "trening" }]
  }
});

const ready = createMatchdaySceneModel({
  ...common,
  readiness: { status: "ready", canStartMatch: true, summary: "Laget er kampklart.", blockers: [] }
});

const preMatch = createMatchdaySceneModel({
  ...common,
  readiness: { status: "in_progress", canStartMatch: true, summary: "Kampforberedelsen er åpnet.", blockers: [] },
  session: { phase: "pre_match", opponent: common.opponent }
});

const live = createMatchdaySceneModel({
  ...common,
  readiness: { status: "in_progress", canStartMatch: true, summary: "Kampen pågår.", blockers: [] },
  session: { phase: "event_2", opponent: common.opponent }
});

const report = createMatchdaySceneModel({
  ...common,
  readiness: { status: "ready", canStartMatch: true, summary: "Neste kamp kan forberedes.", blockers: [] },
  lastMatch: { score: { for: 2, against: 1 } },
  report: {
    outcomeLabel: "Seier",
    scoreLine: "2–1",
    decisiveUnit: "Presset vant ballen høyt før vinnermålet.",
    nextWeekAdvice: "Behold pressstrukturen, men gi laget mer restitusjon.",
    keyFactors: ["Sterkt press"],
    analysis: ["Laget kontrollerte andre omgang."],
    bestDecision: { label: "Høyere press etter pause" },
    formationVerdict: "Formasjonen støttet presset godt."
  }
});

console.log("\nManager Matchday Scene v1 simulation");
check("blokkert scene har riktig fase", blocked.phase === "blocked", blocked.phase);
check("første blokkering blir primærmål", blocked.primaryTarget === "trening", blocked.primaryTarget);
check("blokkert scene viser krav", blocked.blockers.length === 1);
check("kampklar scene har ready-fase", ready.phase === "ready", ready.phase);
check("kampklar scene åpner eksisterende kampforberedelse", ready.primaryTarget === "create_session", ready.primaryTarget);
check("før avspark har pre_match-fase", preMatch.phase === "pre_match", preMatch.phase);
check("før avspark peker til eksisterende kickoff", preMatch.primaryTarget === "kickoff", preMatch.primaryTarget);
check("live scene har live-fase", live.phase === "live", live.phase);
check("live scene peker til kampbildet", live.primaryTarget === "live", live.primaryTarget);
check("rapportscene har report-fase", report.phase === "report", report.phase);
check("rapportscene peker til Analyse", report.primaryTarget === "analyse", report.primaryTarget);
check("rapportscene viser resultat", report.result.label === "Seier · 2–1", report.result.label);
check("rapportscene viser vendepunkt", report.result.turningPoint.includes("Høyere press"), report.result.turningPoint);
check("rapportscene viser læring", report.result.learningPoint.includes("restitusjon"), report.result.learningPoint);
check("alle scener har tre faser", [blocked, ready, preMatch, live, report].every((scene) => scene.stages.length === 3));
check("bare én fase er aktiv", [blocked, ready, preMatch, live, report].every((scene) => scene.stages.filter((stage) => stage.state === "active").length === 1));
check("alle scener har fire statuskort", [blocked, ready, preMatch, live, report].every((scene) => scene.statusCards.length === 4));
check("kampplan peker til Lag", ready.statusCards.find((card) => card.id === "plan")?.target === "tactics");
check("trening peker til treningsflaten", ready.statusCards.find((card) => card.id === "training")?.target === "trening");
check("motstanderstatus peker til kampdetaljer før kamp", ready.statusCards.find((card) => card.id === "opponent")?.target === "details");
check("motstanderstatus peker til analyse etter kamp", report.statusCards.find((card) => card.id === "opponent")?.target === "analyse");
check("motstander og kontekst er bevart", ready.opponentName === "Viking" && ready.opponentContext.includes("Runde 4"));
check("formasjon og kampplan er samlet", ready.planLabel.includes("Modern 4-2-3-1") && ready.planLabel.includes("Balansert"));
check("treningsuka er synlig", ready.trainingLabel.includes("Pressmotstand"));
check("assistentens signal er synlig", ready.signalLabel.includes("første fase"));

console.log(`\nManager Matchday Scene v1 simulation: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

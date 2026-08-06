import { createMatchdaySceneModel } from "../src/ui/manager-matchday-presentation.js";
import { createPostMatchAnalysisModel } from "../src/ui/manager-post-match-analysis-v1.js";

let checks = 0;
let failures = 0;
function check(label, condition, detail = "") {
  checks += 1;
  if (condition) console.log(`  ok   ${label}${detail ? ` (${detail})` : ""}`);
  else {
    failures += 1;
    console.error(`  FEIL ${label}${detail ? ` (${detail})` : ""}`);
  }
}

function resultFixture(outcome = "win", { injury = false } = {}) {
  const scoreByOutcome = {
    win: { for: 2, against: 1 },
    draw: { for: 1, against: 1 },
    loss: { for: 0, against: 2 }
  };
  const labelByOutcome = { win: "Seier", draw: "Uavgjort", loss: "Tap" };
  const score = scoreByOutcome[outcome];
  const scoreLine = `${score.for}–${score.against}`;
  const lastMatch = {
    id: `post-${outcome}`,
    version: 2,
    outcome,
    score,
    expectedGoals: { for: outcome === "loss" ? 0.72 : 1.86, against: outcome === "win" ? 0.94 : 1.42 },
    playerStats: {
      appearances: [
        { playerId: "p1", name: "Ada Angriper", position: "ST", minutes: 90 },
        { playerId: "p2", name: "Mina Midtbane", position: "AM", minutes: 90 }
      ],
      goals: outcome === "loss" ? [] : [
        { minute: 24, scorerId: "p1", scorerName: "Ada Angriper", assistId: "p2", assistName: "Mina Midtbane" },
        ...(outcome === "win" ? [{ minute: 78, scorerId: "p1", scorerName: "Ada Angriper", assistId: null, assistName: null }] : [])
      ]
    },
    substitutions: [
      { minute: 66, playerOutName: "Kari Kant", playerInName: "Sara Hurtig" }
    ],
    clubConsequences: {
      effects: outcome === "win"
        ? { playerMorale: 3, boardTrust: 2, mediaPressure: -1 }
        : outcome === "loss"
          ? { playerMorale: -2, boardTrust: -2, mediaPressure: 2 }
          : { playerMorale: 1 },
      familiarity: 3
    },
    exposedWeaknessMetric: "restDefenseScore"
  };
  const report = {
    outcome,
    outcomeLabel: labelByOutcome[outcome],
    scoreLine,
    expectedGoalsLine: `${lastMatch.expectedGoals.for.toFixed(2)} – ${lastMatch.expectedGoals.against.toFixed(2)}`,
    keyFactors: ["Presset skapte brudd høyt i banen", "Restforsvaret ble utfordret"],
    analysis: ["Laget kontrollerte store deler av andre omgang."],
    bestDecision: { label: "Høyere press etter pause", eventTitle: "Grep ved 60 minutter" },
    worstDecision: { label: "For stor risiko i restforsvaret", eventTitle: "Grep ved 72 minutter" },
    formationVerdict: "4-2-3-1 ga gode presshøyder, men krevde bedre sikring.",
    decisiveUnit: "Midtbanepresset avgjorde kampbildet.",
    nextWeekAdvice: "Prioriter restforsvar og restitusjon i neste treningsuke.",
    historyGoHint: "Studer lag som kombinerte høyt press med sterk sikring.",
    exposedWeaknessMetric: "restDefenseScore",
    explanation: {
      headline: `${labelByOutcome[outcome]} ${scoreLine}: presset skapte kampens tydeligste fordel.`,
      resultSummary: `${labelByOutcome[outcome]} ${scoreLine}. Sjansebildet forklarer både kontrollen og risikoen.`,
      decisiveFactors: ["Høy lagfit og gode relasjoner ga kontroll i oppbyggingen.", "Høyt press ga flere brudd."],
      tacticalFactors: ["Presset traff motstanderens svake første fase."],
      relationshipFactors: ["Tier og spiss fant hverandre mellom leddene."],
      trainingFactors: ["Ukens pressfokus ga laget et tydelig felles signal."],
      offPitchFactors: injury
        ? ["En skade i andre omgang krever medisinsk oppfølging og lavere belastning."]
        : ["Troppen hadde nok overskudd til å opprettholde intensiteten."],
      learningPoints: ["Sikre bak presset før begge backene går samtidig."],
      nextWeekSuggestions: ["Tren restforsvar og legg inn restitusjon tidlig i uka."]
    }
  };
  return { lastMatch, report };
}

console.log("\nManager Post-match Analysis v1 simulation");

const win = resultFixture("win");
const winModel = createPostMatchAnalysisModel(win);
check("seier gir positiv tone", winModel.outcomeTone === "positive", winModel.outcomeTone);
check("resultatet vises", winModel.scoreLine === "2–1", winModel.scoreLine);
check("xG-linjen kommer fra rapporten", winModel.xgLine.includes("1.86"), winModel.xgLine);
check("forklaringsmotorens overskrift brukes", winModel.headline.includes("presset"), winModel.headline);
check("avgjørende faktorer bevares", winModel.decisiveFactors.length === 2);
check("taktiske og relasjonelle faktorer samles", winModel.tacticalFactors.length === 2);
check("beste managergrep vises", winModel.decisions.best?.label.includes("Høyere press"));
check("svakeste managergrep vises", winModel.decisions.worst?.label.includes("restforsvaret"));
check("målscorer vises", winModel.goals[0]?.label.includes("Ada Angriper"));
check("målgivende vises", winModel.goals[0]?.detail.includes("Mina Midtbane"));
check("spillerbidrag aggregeres uten overall", winModel.contributors[0]?.detail === "2 mål");
check("klubbkonsekvenser vises", winModel.consequences.effects.length === 3);
check("formasjonstilvenning vises", winModel.consequences.familiarityLabel.includes("+3"));
check("neste handling peker til Trening", winModel.next.primaryTarget === "trening");
check("full analyse er sekundær handling", winModel.next.secondaryTarget === "analyse");

const drawModel = createPostMatchAnalysisModel(resultFixture("draw"));
check("uavgjort gir nøytral tone", drawModel.outcomeTone === "neutral", drawModel.outcomeTone);
check("uavgjort viser korrekt resultat", drawModel.scoreLine === "1–1", drawModel.scoreLine);
check("uavgjort beholder læringspunkt", drawModel.learningPoints[0].includes("Sikre bak presset"));

const lossModel = createPostMatchAnalysisModel(resultFixture("loss"));
check("tap gir negativ tone", lossModel.outcomeTone === "negative", lossModel.outcomeTone);
check("tap uten egne mål håndteres", lossModel.goals.length === 0);
check("tap viser negative klubbkonsekvenser", lossModel.consequences.effects.some((effect) => effect.tone === "negative"));

const injuryModel = createPostMatchAnalysisModel(resultFixture("draw", { injury: true }));
check("skadesignal fra eksisterende forklaring vises", injuryModel.humanFactors.some((factor) => factor.includes("skade")));
check("skadesignal leder fortsatt til neste treningsuke", injuryModel.next.primaryTarget === "trening");

const scene = createMatchdaySceneModel({
  teamName: "Rosenborg",
  opponent: { name: "Viking", style: "høyt press" },
  competitionLabel: "Eliteserien",
  roundLabel: "Runde 8",
  venueLabel: "Borte",
  formationName: "4-2-3-1",
  tacticName: "Kontrollert press",
  trainingLabel: "Press og restforsvar",
  lastSignal: "Assistenten ber laget sikre bak presset.",
  readiness: { canStartMatch: true, blockers: [] },
  ...win
});
check("rapportfasen opprettes fra eksisterende lastMatch", scene.phase === "report", scene.phase);
check("etterkampmodellen ligger i Kampdagscenen", Boolean(scene.postMatch));
check("eksisterende Analyse-mål beholdes", scene.primaryTarget === "analyse", scene.primaryTarget);
check("eksisterende fire statuskort beholdes", scene.statusCards.length === 4);
check("ingen etterkampmodell før kamp", createMatchdaySceneModel({ readiness: { canStartMatch: true } }).postMatch === null);

console.log(`\nManager Post-match Analysis v1 simulation: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

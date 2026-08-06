import { createManagerSquadTacticsSceneModel } from "../src/ui/manager-squad-tactics-scene-v2.js";

const checks = [];
function check(label, condition, detail = "") {
  checks.push({ label, ok: Boolean(condition), detail });
}

const incomplete = createManagerSquadTacticsSceneModel({
  gateReady: false,
  gateTitle: "Fyll neste ledige plass",
  gateHint: "Startelleveren mangler 3 plasser.",
  gateActionText: "Fyll neste ledige plass",
  starterText: "8/11",
  benchText: "4/4",
  rolesText: "OK",
  formationName: "4-2-3-1",
  tacticName: "Høyt press"
});
check("ufullstendig scene er blokkert", incomplete.state === "blocked", incomplete.state);
check("ufullstendig scene viser 8/11", incomplete.statuses[0].value === "8/11 klare", incomplete.statuses[0].value);
check("ufullstendig scene bruker eksisterende gatehandling", incomplete.action.target === "gate-action", incomplete.action.target);
check("ufullstendig scene bevarer gatehint", incomplete.reading.issue.includes("3 plasser"), incomplete.reading.issue);

const bench = createManagerSquadTacticsSceneModel({
  gateReady: false,
  gateTitle: "Legg minst 4 spillere på benken",
  gateHint: "Benk 2/4.",
  starterText: "11/11",
  benchText: "2/4",
  rolesText: "OK",
  formationName: "4-3-3",
  tacticName: "Balansert"
});
check("benkestatus viser 2/4", bench.statuses[3].value === "2/4 kampklare", bench.statuses[3].value);
check("benkestatus er negativ", bench.statuses[3].tone === "negative", bench.statuses[3].tone);

const roles = createManagerSquadTacticsSceneModel({
  gateReady: true,
  starterText: "11/11",
  benchText: "4/4",
  rolesText: "Trenger valg",
  misuseText: "2 feilbruk",
  formationName: "3-4-3",
  tacticName: "Direkte kontring",
  availabilityText: "Ingen akutte varsler."
});
check("rolleproblem får oppmerksomhetstone", roles.statuses[1].tone === "attention", roles.statuses[1].tone);
check("rolleproblem vises i lesningen", roles.reading.issue.includes("oppfølging"), roles.reading.issue);

const training = createManagerSquadTacticsSceneModel({
  gateReady: true,
  starterText: "11/11",
  benchText: "4/4",
  rolesText: "OK",
  formationName: "4-2-3-1",
  tacticName: "Høyt press",
  matchdayTarget: "trening",
  matchdayActionText: "Velg treningsprogram"
});
check("manglende trening peker til Trening", training.action.target === "trening", training.action.target);
check("manglende trening bruker tydelig CTA", training.action.label === "Gå til Trening", training.action.label);

const ready = createManagerSquadTacticsSceneModel({
  gateReady: true,
  starterText: "11/11",
  benchText: "4/4",
  rolesText: "OK",
  formationName: "4-2-3-1",
  tacticName: "Høyt press",
  availabilityText: "Ingen akutte tilgjengelighetsvarsler.",
  matchdayReady: true,
  matchdayTarget: "kickoff",
  matchdayActionText: "Start kamp"
});
check("klar scene er ready", ready.state === "ready", ready.state);
check("klar scene peker til Kamp", ready.action.target === "kamp", ready.action.target);
check("klar scene har fire statuskort", ready.statuses.length === 4, String(ready.statuses.length));
check("klar ellever er positiv", ready.statuses[0].tone === "positive", ready.statuses[0].tone);
check("klar benk er positiv", ready.statuses[3].tone === "positive", ready.statuses[3].tone);
check("formasjon bevares", ready.formation.name === "4-2-3-1", ready.formation.name);
check("kampplan bevares", ready.formation.plan === "Høyt press", ready.formation.plan);
check("ingen hidden overall introduseres", !Object.hasOwn(ready, "teamScore"));

const unavailable = createManagerSquadTacticsSceneModel({
  gateReady: true,
  starterText: "11/11",
  benchText: "4/4",
  rolesText: "OK",
  availabilityText: "1 skadet og 2 slitne spillere."
});
check("skade gir negativ tilgjengelighet", unavailable.statuses[2].tone === "negative", unavailable.statuses[2].tone);
check("skadeforklaring bevares", unavailable.statuses[2].detail.includes("1 skadet"), unavailable.statuses[2].detail);

const failed = checks.filter((item) => !item.ok);
checks.forEach((item) => console.log(`${item.ok ? "✓" : "✗"} ${item.label}${item.detail ? ` — ${item.detail}` : ""}`));
if (failed.length) {
  console.error(`\n✗ Manager Squad & Tactics Scene v2 feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Manager Squad & Tactics Scene v2: ${checks.length}/${checks.length}`);

// Forbundets dom v1 — simulering
//
// Kjører den rene motoren (`src/football-federation-verdict.js`) og sjekker at
// mesterskapet gjøres opp mot NASJONENS TYNGDE — ikke mot en fast fasit.
//
// Det viktigste den vokter: at semifinale med en liten nasjon er en bragd, og
// med en stor nasjon et nederlag. Uten det er landslagsmodus bare ligaen med
// andre navn.

import {
  FEDERATION_VERDICT_VERSION,
  createFederationArchiveEntry,
  createFederationVerdict,
  deriveFederationExpectation,
  reachedStageOf,
  summarizeFederationHistory
} from "../src/football-federation-verdict.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tournaments = JSON.parse(readFileSync(join(root, "data/football_tournaments.json"), "utf8"));

let failed = 0;
let passed = 0;
function check(label, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failed += 1;
    console.log(`  FEIL ${label}${detail ? ` (${detail})` : ""}`);
  }
}

const em = tournaments.tournaments.find((t) => t.id === "em");
const vm = tournaments.tournaments.find((t) => t.id === "vm");

function finished({ nationality = "Norge", stage = "group", champion = null, name = "EM", knockoutStages = vm.knockoutStages }) {
  return {
    tournamentId: name.toLowerCase(),
    name,
    status: "completed",
    managerNationality: nationality,
    knockoutStages,
    outcome: { stage, champion, placement: champion === nationality ? "Mester" : `Ute etter ${stage}` }
  };
}

const summary = { played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 6, goalsAgainst: 6 };

console.log("Forbundets dom: mesterskapet gjøres opp mot nasjonens tyngde\n");

// ---- 1) Forventningen følger nasjonens styrke -----------------------------
console.log("1. Forventningen");
{
  const stor = deriveFederationExpectation({ strength: 85, knockoutStages: vm.knockoutStages });
  const god = deriveFederationExpectation({ strength: 78, knockoutStages: vm.knockoutStages });
  const middels = deriveFederationExpectation({ strength: 72, knockoutStages: vm.knockoutStages });
  const liten = deriveFederationExpectation({ strength: 60, knockoutStages: vm.knockoutStages });

  check("en toppnasjon skal spille finale", stor.stage === "final", stor.stage);
  check("en sterk nasjon skal nå semifinalen", god.stage === "semifinal", god.stage);
  check("en middels nasjon skal nå kvartfinalen", middels.stage === "quarterfinal", middels.stage);
  check("en liten nasjon skal ut av gruppa", liten.stage === "quarterfinal", liten.stage);
  check("forventningen forklares", [stor, god, middels, liten].every((e) => e.note.length > 20));

  // EM har ingen kvartfinale — kravet må flyttes til en runde som finnes.
  const emMiddels = deriveFederationExpectation({ strength: 72, knockoutStages: em.knockoutStages });
  check("EM har ingen kvartfinale, så kravet flyttes", em.knockoutStages.includes(emMiddels.stage), `${emMiddels.stage} mot ${JSON.stringify(em.knockoutStages)}`);
  check("tom mesterskapsdefinisjon krasjer ikke", Boolean(deriveFederationExpectation({}).stage));
}

// ---- 2) Samme resultat, ulik dom -------------------------------------------
console.log("\n2. Samme resultat, ulik dom");
{
  const semi = (strength) => createFederationVerdict({
    tournament: finished({ stage: "semifinal" }),
    summary,
    expectation: deriveFederationExpectation({ strength, knockoutStages: vm.knockoutStages })
  });

  const medLiten = semi(60);
  const medStor = semi(85);
  check("semifinale med en liten nasjon er over forventning", medLiten.verdict === "exceeded", medLiten.verdict);
  check("semifinale med en toppnasjon er under forventning", medStor.verdict === "below", medStor.verdict);
  check("den lille nasjonen får tillit, den store mister", medLiten.trustDelta > 0 && medStor.trustDelta < 0);
  check(
    "bragden krediteres lesningen din",
    medLiten.reasons.some((line) => /lesningen din som bar dem/.test(line)),
    medLiten.reasons.join(" | ")
  );
}

// ---- 3) Dommen dekker hele stigen ------------------------------------------
console.log("\n3. Hele stigen");
{
  const forventet = deriveFederationExpectation({ strength: 78, knockoutStages: vm.knockoutStages }); // semifinale
  const dom = (stage, champion = null) => createFederationVerdict({
    tournament: finished({ stage, champion }),
    summary,
    expectation: forventet
  });

  check("tittel er triumf", dom("final", "Norge").verdict === "triumph");
  check("finaletap er over forventning", dom("final").verdict === "exceeded");
  check("semifinale er innfridd", dom("semifinal").verdict === "met");
  check("kvartfinale er under forventning", dom("quarterfinal").verdict === "below", dom("quarterfinal").verdict);
  check("gruppeexit er svikt", dom("group").verdict === "failed", dom("group").verdict);

  check("hver dom har overskrift og forbundsbeskjed", ["final", "semifinal", "quarterfinal", "group"].every((s) => {
    const d = dom(s);
    return d.headline.length > 15 && d.federationMessage.length > 20;
  }));
  check("versjonen er merket", dom("semifinal").version === FEDERATION_VERDICT_VERSION);
}

// ---- 4) Ingen dom før mesterskapet er ferdig ------------------------------
console.log("\n4. Robusthet");
{
  const pågår = { ...finished({ stage: "semifinal" }), status: "active" };
  check("et pågående mesterskap dømmes ikke", createFederationVerdict({ tournament: pågår, summary }) === null);
  check("mesterskap uten utfall dømmes ikke", createFederationVerdict({ tournament: { status: "completed" }, summary }) === null);
  check("ingen turnering krasjer ikke", createFederationVerdict({}) === null);
  check("reachedStageOf leser mesteren", reachedStageOf(finished({ stage: "final", champion: "Norge" })) === "champion");
  check("reachedStageOf leser exit", reachedStageOf(finished({ stage: "group" })) === "group");
  check("reachedStageOf uten utfall gir null", reachedStageOf({}) === null);
}

// ---- 5) Ingen får sparken av ett mesterskap -------------------------------
console.log("\n5. Sparken");
{
  const forventet = deriveFederationExpectation({ strength: 85, knockoutStages: vm.knockoutStages });
  const katastrofe = (previous = []) => createFederationVerdict({
    tournament: finished({ stage: "group" }),
    summary,
    expectation: forventet,
    previousVerdicts: previous
  });

  const første = katastrofe();
  check("første gruppeexit gir advarsel, ikke sparken", første.warning === true && første.sacked === false);
  check("advarselen sier det rett ut", /ett mesterskap til/.test(første.federationMessage), første.federationMessage);

  const andre = katastrofe([createFederationArchiveEntry(første)]);
  check("andre gruppeexit på rad koster jobben", andre.sacked === true && andre.managerSafe === false);
  check("sparken viser til advarselen", /advarselen/.test(andre.federationMessage));

  const redning = createFederationVerdict({
    tournament: finished({ stage: "final", champion: "Norge" }),
    summary,
    expectation: forventet,
    previousVerdicts: [createFederationArchiveEntry(første)]
  });
  check("en tittel etter advarsel redder jobben", redning.sacked === false && redning.verdict === "triumph");
}

// ---- 6) Forklaringen peker på manageren ------------------------------------
console.log("\n6. Forklaringen");
{
  const dom = createFederationVerdict({
    tournament: finished({ stage: "group" }),
    summary: { played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 1, goalsAgainst: 5 },
    expectation: deriveFederationExpectation({ strength: 84, knockoutStages: vm.knockoutStages })
  });
  const tekst = dom.reasons.join(" ");
  check("rekorden står i klartekst", /0-2-1 på 3 kamper/.test(tekst), tekst);
  check("lite scoring forklares som oppsettet", /oppsettet ga ikke nok trussel/.test(tekst));
  check("mye baklengs forklares som balansen", /balansen bakover/.test(tekst));
  check("uavgjorte uten seier påpekes", /aldri en kamp/.test(tekst));
  check("kravet gjentas i dommen", /Forbundets krav var/.test(tekst));
  check("ingen grunn skylder på spillerne", !/dårlig(e)? spiller|ikke gode nok|for svak tropp/i.test(tekst), tekst);
}

// ---- 7) Merittlista ---------------------------------------------------------
console.log("\n7. Merittlista");
{
  const forventet = deriveFederationExpectation({ strength: 66, knockoutStages: em.knockoutStages });
  const tittel = createFederationVerdict({ tournament: finished({ stage: "final", champion: "Norge", name: "EM", knockoutStages: em.knockoutStages }), summary, expectation: forventet });
  const exit = createFederationVerdict({ tournament: finished({ stage: "group", name: "VM" }), summary, expectation: forventet });

  const archive = [createFederationArchiveEntry(tittel), createFederationArchiveEntry(exit)];
  check("oppføringen husker mesterskap og nasjon", archive[0].tournamentName === "EM" && archive[0].nationality === "Norge");
  check("oppføringen husker dommen", archive[0].verdict === "triumph");
  check("oppføringen husker hva som var forventet", archive[0].expectedStage === forventet.stage);
  check("null-dom gir null oppføring", createFederationArchiveEntry(null) === null);

  const summaryOut = summarizeFederationHistory(archive);
  check("sammendraget teller mesterskap", summaryOut.tournaments === 2);
  check("sammendraget teller titler", summaryOut.titles === 1);
  check("tomt arkiv krasjer ikke", summarizeFederationHistory([]).tournaments === 0);
}

// ---- 8) Motoren er ren ------------------------------------------------------
console.log("\n8. Renhet");
{
  const source = readFileSync(join(root, "src/football-federation-verdict.js"), "utf8").replace(/\/\/.*$/gm, "");
  check("ingen DOM", !/document\.|window\./.test(source));
  check("ingen lagring", !/localStorage/.test(source));
  check("ingen tilfeldighet", !/Math\.random/.test(source));
  check("ingen Date.now", !/Date\.now/.test(source));
  check("dommen leser ikke overall", !/\boverall\b/.test(source));
}

console.log(`\n${passed}/${passed + failed} sjekker bestått.`);
if (failed > 0) {
  console.error(`\n✗ Forbundets dom feilet: ${failed} sjekk(er).`);
  process.exit(1);
}
console.log("\n✓ Forbundets dom OK.");
process.exit(0);

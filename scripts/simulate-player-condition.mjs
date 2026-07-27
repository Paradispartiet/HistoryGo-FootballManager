// Spillerform og slitasje v1 — simulering
//
// Kjører den rene motoren (`src/football-player-condition.js`) med injisert rng,
// og sjekker at bruk faktisk får konsekvenser: at det koster å spille en mann
// 90 minutter hver uke, at hvile hjelper, og at skader kommer av belastning som
// har fått stå — ikke ut av intet.
//
// Det viktigste den vokter: **dette sier ingenting om hvor god spilleren er.**
// Motoren leser aldri `overall`, og forklaringene peker på bruken.

import {
  applyMatchForm,
  applyMatchLoad,
  applyMatchToConditions,
  applyWeeklyRecovery,
  conditionFor,
  createCondition,
  describeCondition,
  fatigueFactorFor,
  formLabelFor,
  freshnessFor,
  injuredPlayerIds,
  isInjured,
  playersNeedingRest,
  rollInjuries,
  summarizeSquadCondition
} from "../src/football-player-condition.js";
import { readFileSync } from "node:fs";

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

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const fullMatch = (ids, minutes = 90) => ids.map((id) => ({ playerId: id, name: id, minutes }));

console.log("Spillerform og slitasje: troppen mellom kampene\n");

// ---- 1) Belastning følger minutter ----------------------------------------
console.log("1. Belastning");
{
  let c = applyMatchLoad([], { played: [
    { playerId: "hel", name: "Hel kamp", minutes: 90 },
    { playerId: "halv", name: "Halv kamp", minutes: 45 },
    { playerId: "sluttminutt", name: "Sluttminutter", minutes: 8 }
  ] });

  const hel = conditionFor(c, "hel");
  const halv = conditionFor(c, "halv");
  const kort = conditionFor(c, "sluttminutt");

  check("en full kamp gir mest belastning", hel.load > halv.load && halv.load > kort.load, `${hel.load} / ${halv.load} / ${kort.load}`);
  check("halv kamp gir omtrent halv belastning", Math.abs(halv.load - hel.load / 2) < 0.5, `${halv.load} mot ${hel.load / 2}`);
  check("kamper telles", hel.matchesPlayed === 1 && hel.minutesPlayed === 90);
  check("full kamp teller i rekka", hel.consecutiveFullMatches === 1);
  check("kort innhopp bryter ikke inn i rekka", kort.consecutiveFullMatches === 0);

  // Intensiteten i kampplanen betyr noe.
  const rolig = applyMatchLoad([], { played: fullMatch(["a"]), intensity: 0.7 });
  const hardt = applyMatchLoad([], { played: fullMatch(["a"]), intensity: 1.5 });
  check("høy intensitet koster mer enn lav", conditionFor(hardt, "a").load > conditionFor(rolig, "a").load,
    `${conditionFor(hardt, "a").load} mot ${conditionFor(rolig, "a").load}`);

  check("belastningen tar aldri av (maks 100)", (() => {
    let x = [];
    for (let i = 0; i < 20; i += 1) x = applyMatchLoad(x, { played: fullMatch(["a"]), intensity: 1.6 });
    return conditionFor(x, "a").load === 100;
  })());
}

// ---- 2) Friskhet og hva den gjør på banen ---------------------------------
console.log("\n2. Friskhet");
{
  const frisk = createCondition("a", "A");
  check("uthvilt spiller har full friskhet", freshnessFor(frisk) === 100);
  check("uthvilt spiller straffes ikke", fatigueFactorFor(frisk) === 1);

  const litt = { ...frisk, load: 40 };
  check("moderat belastning koster ingenting ennå", fatigueFactorFor(litt) === 1, "under terskelen skal ikke straffes");

  const sliten = { ...frisk, load: 80 };
  const kjort = { ...frisk, load: 100 };
  check("høy belastning senker bidraget", fatigueFactorFor(sliten) < 1, `faktor=${fatigueFactorFor(sliten)}`);
  check("mer belastning senker mer", fatigueFactorFor(kjort) < fatigueFactorFor(sliten));
  check("selv en utkjørt spiller er fortsatt en spiller (aldri under 0.78)", fatigueFactorFor(kjort) >= 0.78,
    `faktor=${fatigueFactorFor(kjort)}`);
}

// ---- 3) Hvile hjelper ------------------------------------------------------
console.log("\n3. Hvile");
{
  let c = applyMatchLoad([], { played: fullMatch(["a"]) });
  const etterKamp = conditionFor(c, "a").load;
  c = applyWeeklyRecovery(c, { trainingIntensity: 1 });
  const etterUke = conditionFor(c, "a").load;
  check("en uke tar belastning bort", etterUke < etterKamp, `${etterUke} mot ${etterKamp}`);

  const restitusjon = applyWeeklyRecovery(applyMatchLoad([], { played: fullMatch(["a"]) }), { trainingIntensity: 0.5 });
  const pressuke = applyWeeklyRecovery(applyMatchLoad([], { played: fullMatch(["a"]) }), { trainingIntensity: 1.6 });
  check("restitusjonsuke henter mer enn en pressuke",
    conditionFor(restitusjon, "a").load < conditionFor(pressuke, "a").load,
    `${conditionFor(restitusjon, "a").load} mot ${conditionFor(pressuke, "a").load}`);
  check("belastningen går aldri under null", conditionFor(applyWeeklyRecovery([createCondition("a")], {}), "a").load === 0);
}

// ---- 4) Rotasjon mot å kjøre samme mann -----------------------------------
console.log("\n4. Rotasjon lønner seg");
{
  // To spillere. Den ene spiller alt, den andre roteres inn annenhver kamp.
  let kjort = [];
  let rotert = [];
  for (let uke = 0; uke < 6; uke += 1) {
    kjort = applyWeeklyRecovery(applyMatchLoad(kjort, { played: fullMatch(["sliter"]) }), { trainingIntensity: 1 });
    if (uke % 2 === 0) rotert = applyMatchLoad(rotert, { played: fullMatch(["rotert"]) });
    rotert = applyWeeklyRecovery(rotert, { trainingIntensity: 1 });
  }
  const a = conditionFor(kjort, "sliter");
  const b = conditionFor(rotert, "rotert");
  check("den som spiller alt bygger belastning", a.load > 0, `load=${a.load}`);
  check("den roterte er friskere", freshnessFor(b) > freshnessFor(a), `${freshnessFor(b)} mot ${freshnessFor(a)}`);
  check("rekka med fulle kamper synes", a.consecutiveFullMatches === 6, `rekke=${a.consecutiveFullMatches}`);
  check("forklaringen peker på bruken, ikke på spilleren",
    /kamper på rad|friskhet|Frisk|kjenne/i.test(describeCondition(a)), describeCondition(a));
}

// ---- 5) Form følger kampene han spilte ------------------------------------
console.log("\n5. Form");
{
  const played = fullMatch(["scorer", "menig"]);
  let c = applyMatchForm([], { played, goals: [{ scorerId: "scorer", assistId: "menig" }], outcome: "win" });
  check("en scorer i en seier stiger i form", conditionFor(c, "scorer").form > 0);
  check("den som la den fram stiger også", conditionFor(c, "menig").form > 0);
  check("scoreren stiger mest", conditionFor(c, "scorer").form > conditionFor(c, "menig").form);

  let tap = applyMatchForm([], { played, goals: [], outcome: "loss" });
  check("et tap uten bidrag senker formen", conditionFor(tap, "menig").form < 0);

  // Form er midlertidig: den trekkes mot null.
  let høy = applyMatchForm([], { played: fullMatch(["a"]), goals: [{ scorerId: "a" }, { scorerId: "a" }], outcome: "win" });
  const topp = conditionFor(høy, "a").form;
  for (let i = 0; i < 5; i += 1) høy = applyMatchForm(høy, { played: fullMatch(["a"]), goals: [], outcome: "draw" });
  check("formen faller tilbake mot normalen uten nye bidrag", conditionFor(høy, "a").form < topp, `${conditionFor(høy, "a").form} mot ${topp}`);
  check("formen holder seg innenfor −3..+3", conditionFor(høy, "a").form >= -3 && conditionFor(høy, "a").form <= 3);

  check("en innbytter med få minutter beveger formen mindre", (() => {
    const lang = applyMatchForm([], { played: [{ playerId: "x", minutes: 90 }], goals: [], outcome: "loss" });
    const kort = applyMatchForm([], { played: [{ playerId: "x", minutes: 10 }], goals: [], outcome: "loss" });
    return conditionFor(kort, "x").form > conditionFor(lang, "x").form;
  })());

  check("formetiketten er lesbar", formLabelFor({ form: 2.4 }) === "i storform" && formLabelFor({ form: -2.2 }) === "i formkrise");
}

// ---- 6) Skader kommer av belastning, ikke av intet -------------------------
console.log("\n6. Skader");
{
  const frisk = [{ ...createCondition("a", "A"), load: 10, consecutiveFullMatches: 1 }];
  check("en uthvilt spiller blir ikke skadet", !isInjured(conditionFor(rollInjuries(frisk, { played: fullMatch(["a"]), rng: () => 0 }), "a")));

  const utkjørt = [{ ...createCondition("b", "B"), load: 95, consecutiveFullMatches: 6 }];
  check("en utkjørt spiller KAN bli skadet", isInjured(conditionFor(rollInjuries(utkjørt, { played: fullMatch(["b"]), rng: () => 0 }), "b")));
  check("men det er ikke sikkert", !isInjured(conditionFor(rollInjuries(utkjørt, { played: fullMatch(["b"]), rng: () => 0.99 }), "b")));

  check("ingen blir skadet på benken", !isInjured(conditionFor(rollInjuries(utkjørt, { played: [], rng: () => 0 }), "b")));

  const skadet = rollInjuries(utkjørt, { played: fullMatch(["b"]), rng: () => 0 });
  const injury = conditionFor(skadet, "b").injury;
  check("skaden har en varighet", injury.weeksOut > 0);
  check("skaden forklares med bruken", /kamper på rad/.test(injury.reason), injury.reason);
  check("verre belastning gir lengre fravær", injury.weeksOut === 3, `uker=${injury.weeksOut}`);

  // Skaden teller ned i uker, ikke i kamper.
  let c = skadet;
  const uker = injury.weeksOut;
  for (let i = 0; i < uker; i += 1) {
    check(`skadet i uke ${i + 1}`, isInjured(conditionFor(c, "b")));
    c = applyWeeklyRecovery(c, { trainingIntensity: 1 });
  }
  check("tilbake etter fraværet", !isInjured(conditionFor(c, "b")));
  check("tilbake fra skade er ikke tilbake i toppform", conditionFor(c, "b").form < 0, `form=${conditionFor(c, "b").form}`);

  check("skadeliste kan slås opp", injuredPlayerIds(skadet).has("b") && !injuredPlayerIds(skadet).has("a"));
}

// ---- 7) Hele etterkamp-steget ---------------------------------------------
console.log("\n7. Etter kampen");
{
  const played = fullMatch(["a", "b", "c"]);
  const after = applyMatchToConditions([], {
    played,
    goals: [{ scorerId: "a", assistId: "b" }],
    outcome: "win",
    intensity: 1.2,
    rng: makeRng(5)
  });
  check("alle som spilte er registrert", after.length === 3);
  check("belastning er lagt på", after.every((entry) => entry.load > 0));
  check("form er oppdatert", conditionFor(after, "a").form > 0);
  check("ingen blir skadet av én kamp fra frisk", after.every((entry) => !isInjured(entry)));

  // Motoren muterer ikke inndata.
  const before = [createCondition("a", "A")];
  applyMatchToConditions(before, { played: fullMatch(["a"]), rng: makeRng(1) });
  check("inndata muteres ikke", before[0].load === 0);
}

// ---- 8) Råd og sammendrag --------------------------------------------------
console.log("\n8. Råd til manageren");
{
  const squad = [
    { ...createCondition("sliten", "Sliten"), load: 80, consecutiveFullMatches: 5 },
    { ...createCondition("frisk", "Frisk"), load: 5 },
    { ...createCondition("skadet", "Skadet"), load: 70, injury: { weeksOut: 2, reason: "belastning" } }
  ];

  const rest = playersNeedingRest(squad);
  check("den slitne foreslås hvilt", rest.length === 1 && rest[0].playerId === "sliten", JSON.stringify(rest.map((r) => r.playerId)));
  check("den skadde foreslås ikke hvilt (han er allerede ute)", !rest.some((entry) => entry.playerId === "skadet"));
  check("rådet forklarer seg", rest[0].advice.length > 0);

  const summary = summarizeSquadCondition(squad);
  check("sammendraget teller skadde", summary.injuredCount === 1);
  check("sammendraget teller slitne", summary.tiredCount === 1);
  check("sammendraget finner den friskeste", summary.freshest.playerId === "frisk");
  check("sammendraget lister skadde med fravær", summary.injured[0].weeksOut === 2);

  const tom = summarizeSquadCondition([]);
  check("tom tropp krasjer ikke", tom.tracked === 0 && tom.freshest === null);
}

// ---- 9) Motoren er ren, og den dømmer ikke spilleren ----------------------
console.log("\n9. Renhet");
{
  const source = readFileSync(new URL("../src/football-player-condition.js", import.meta.url), "utf8");
  const code = source.replace(/\/\/.*$/gm, "");
  check("leser aldri overall", !/\boverall\b/.test(code));
  check("ingen DOM", !/document\.|window\./.test(code));
  check("ingen lagring", !/localStorage/.test(code));
  check("ingen skjult tilfeldighet", !/Math\.random\(\)/.test(code.replace(/rng = Math\.random/g, "")));
  check("ingen Date.now", !/Date\.now/.test(code));
  check("ukjent spiller gir en nullstilt tilstand i stedet for å krasje", conditionFor([], "finnes_ikke").load === 0);
}

// ---- 10) Balansen ----------------------------------------------------------
// Første utgave ga FIRE skader etter to kamper. Det straffer deg for å spille
// spillet, ikke for å bruke en mann for hardt — og gjør troppen uspillbar.
// Disse sjekkene låser balansen, ikke bare mekanikken.
console.log("\n10. Balansen");
{
  // En hel sesong (14 runder) der ellevern spiller hver kamp med normal trening.
  const xi = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
  const rng = makeRng(99);
  let squad = [];
  for (let runde = 0; runde < 14; runde += 1) {
    squad = applyMatchToConditions(squad, { played: fullMatch(xi), outcome: "draw", intensity: 1, rng });
    squad = applyWeeklyRecovery(squad, { trainingIntensity: 1 });
  }
  const skadde = squad.filter((entry) => isInjured(entry)).length;
  const maksLoad = Math.max(...squad.map((entry) => entry.load));
  check("en full sesong med samme ellever gir ingen skadeepidemi", skadde <= 1, `skadde=${skadde}`);
  check("belastningen kryper oppover, men tar ikke av", maksLoad > 0 && maksLoad < 85, `maks load=${maksLoad}`);
  check("laget er fortsatt spillbart etter en sesong", squad.every((entry) => fatigueFactorFor(entry) >= 0.85));

  // Samme sesong, men med pressuker oppå full spilletid: DA skal det svi.
  const rng2 = makeRng(99);
  let presset = [];
  for (let runde = 0; runde < 14; runde += 1) {
    presset = applyMatchToConditions(presset, { played: fullMatch(xi), outcome: "draw", intensity: 1.5, rng: rng2 });
    presset = applyWeeklyRecovery(presset, { trainingIntensity: 1.6 });
  }
  const pressLoad = Math.max(...presset.map((entry) => entry.load));
  check("pressuker oppå full spilletid brenner laget ut", pressLoad > maksLoad + 20, `${pressLoad} mot ${maksLoad}`);
  check("den utbrente troppen leverer målbart mindre", presset.some((entry) => fatigueFactorFor(entry) < 0.95));

  // Rotasjon skal faktisk løse problemet.
  const rng3 = makeRng(99);
  let rotert = [];
  const bred = [...xi, "l", "m", "n", "o"];
  // Ekte rotasjon: vinduet på elleve går RUNDT hele troppen. Første forsøk
  // brukte en vanlig slice, og da spilte de åtte i midten hver eneste kamp —
  // testen målte ikke rotasjon i det hele tatt.
  for (let runde = 0; runde < 14; runde += 1) {
    const elleve = Array.from({ length: 11 }, (_, i) => bred[(runde * 4 + i) % bred.length]);
    rotert = applyMatchToConditions(rotert, { played: fullMatch(elleve), outcome: "draw", intensity: 1, rng: rng3 });
    rotert = applyWeeklyRecovery(rotert, { trainingIntensity: 1 });
  }
  check("rotasjon holder alle friske", rotert.every((entry) => fatigueFactorFor(entry) === 1 && !isInjured(entry)));

  // Og en enkelt spiller kjørt i senk skal fortsatt bare RISIKERE skade.
  const utkjørt = [{ ...createCondition("z", "Z"), load: 100, consecutiveFullMatches: 10 }];
  let treff = 0;
  const rng4 = makeRng(4242);
  for (let i = 0; i < 200; i += 1) {
    if (isInjured(conditionFor(rollInjuries(utkjørt, { played: fullMatch(["z"]), rng: rng4 }), "z"))) treff += 1;
  }
  check("selv en utkjørt spiller skades sjelden i én enkelt kamp (under 20 %)", treff / 200 < 0.2, `andel=${(treff / 200).toFixed(2)}`);
  check("men risikoen er reell (over 2 %)", treff / 200 > 0.02, `andel=${(treff / 200).toFixed(2)}`);
}

console.log(`\n${passed}/${passed + failed} sjekker bestått.`);
if (failed > 0) {
  console.error(`\n✗ Spillerform og slitasje feilet: ${failed} sjekk(er).`);
  process.exit(1);
}
console.log("\n✓ Spillerform og slitasje OK.");
process.exit(0);

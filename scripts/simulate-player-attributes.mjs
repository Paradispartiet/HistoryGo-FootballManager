#!/usr/bin/env node
// ============================================================================
// sim:player-attributes — ferdighetene beskriver en PROFIL, ikke en rang.
//
// Dette er vakten som må holde når spillet får et tall per ferdighet. Et
// attributtsystem ER et ratingspill hvis man ikke måler noe annet, så her måles
// nettopp det andre:
//
//   • at profilen SPRIKER (en profil som ikke spriker er en rating med flere
//     kolonner)
//   • at skalaen brukes, i stedet for å pile seg opp på taket — huset blir
//     bitt av skala-mismatch, og et tak som alltid biter er symptomet
//   • at klassen er POSISJONSAVHENGIG: samme spiller, ulikt tall
//   • at lavere klassehøyde faktisk KAN slå høyere i riktig rolle
//   • at ingen ekte spiller får en påstand kilden ikke bærer
// ============================================================================

import fs from "node:fs";
import assert from "node:assert";
import {
  normalizeAttributeCatalogue,
  derivePlayerAttributes,
  derivePlayerAttributeIndex,
  describePositionDemands,
  calculateRoleAttributeFit,
  splitRoleRequirements,
  classCeilingFactor,
  ATTRIBUTE_SCALE
} from "../src/football-player-attributes.js";
import { calculatePlayerMatchFit, calculateClassBonus, CLASS_BONUS_MAX } from "../src/football-fit-engine.js";

// `Math.min(...liste)` sprer hele lista som ARGUMENTER, og argumentlista har en
// grense — målt ~125 000 i denne noden. Katalogen har 2053 spillere × 58
// ferdigheter = 119 074 verdier, altså 1,05x margin: neste klubbimport på ~120
// navn ville tatt dette skriptet ned med «Maximum call stack size exceeded» i
// stedet for å kjøre vaktene. Funnet under en bittest som la til 300 spillere.
//
// Feilen er lumsk fordi den ikke ser ut som en datafeil: hele vaktskriptet dør,
// og da er det ingen vakt igjen som kan si fra om noe annet.
const minst = (liste) => liste.reduce((a, b) => (b < a ? b : a), Infinity);
const størst = (liste) => liste.reduce((a, b) => (b > a ? b : a), -Infinity);

let medianArv = 0;
const read = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
let checks = 0;
const check = (label, ok, detail = "") => {
  assert.ok(ok, `${label}${detail ? ` — ${detail}` : ""}`);
  checks += 1;
};

const catalogue = normalizeAttributeCatalogue(read("data/football_attributes.json"));
const players = read("data/football_players.json").players;
const roles = read("data/football_roles.json").roles;
const tactics = read("data/football_tactics.json").tactics;
for (const role of roles) role.requiredSkills = splitRoleRequirements(catalogue, role).skills;

const { scaling, profiles } = derivePlayerAttributeIndex(players, { catalogue, roles });
for (const player of players) player.attributes = profiles[player.id];

// ---------------------------------------------------------------------------
// 1. Alle får en profil, og den er deterministisk
// ---------------------------------------------------------------------------
check("alle spillere fikk en profil", players.every((player) => profiles[player.id]));
assert.deepEqual(
  derivePlayerAttributes(players[0], { catalogue, roles, scaling }).values,
  derivePlayerAttributes(players[0], { catalogue, roles, scaling }).values,
  "profilen er ikke deterministisk"
);
checks += 1;

for (const player of players.slice(0, 40)) {
  const profile = profiles[player.id];
  check(`${player.name} har alle 42 ferdighetene`, Object.keys(profile.values).length === catalogue.attributes.length);
  check(`${player.name} har kilde på hver ferdighet`, Object.keys(profile.provenance).length === catalogue.attributes.length);
}

// ---------------------------------------------------------------------------
// 2. Profilen SPRIKER — det er hele forskjellen fra en rating
// ---------------------------------------------------------------------------
const ranges = players.map((player) => profiles[player.id].spread.range).sort((a, b) => a - b);
const medianRange = ranges[Math.floor(ranges.length / 2)];
// Grensen er 8, ikke 10. Klassetaket senker toppene, og etter at spillerne ble
// tiered på ekte nivå (78–99 i stedet for 86–99) har bunnsjiktet mindre spenn å
// sprike i — en 79-spiller KAN ikke sprike 16 når taket hans er 13. Målt median
// er 9. Det som må holde er at profilen bruker det spennet han HAR.
check("median spiller spriker minst 8 av 20", medianRange >= 8, `median ${medianRange}`);
check("ingen spiller er flat", ranges[0] >= 5, `laveste sprik ${ranges[0]}`);

// Det absolutte spriket er ikke lenger den ærlige testen: en spiller med lavt
// tak KAN ikke sprike 16. Det som må holde er at han bruker det spennet han
// HAR — ellers er profilen flat uansett hva taket sier.
const usage = players.map((player) => {
  const profile = profiles[player.id];
  const available = (ATTRIBUTE_SCALE.max - ATTRIBUTE_SCALE.floor)
    * classCeilingFactor(player.classHeight, scaling.classBand);
  return profile.spread.range / available;
}).sort((a, b) => a - b);
const medianUsage = usage[Math.floor(usage.length / 2)];
check("median spiller bruker det meste av sitt eget spenn", medianUsage > 0.7,
  `${(medianUsage * 100).toFixed(0)} %`);
check("ingen spiller bruker under en tredel", usage[0] > 0.33, `${(usage[0] * 100).toFixed(0)} %`);

// Klassebåndet leses av korpuset, ikke hardkodet. Sto det fast på 85–99 ville
// hele bunnsjiktet blitt klemt til null da spillerne ble tiered til 78–99.
check("klassebåndet er målt av korpuset",
  scaling.classBand.low === minst(players.map((p) => p.classHeight))
  && scaling.classBand.high === størst(players.map((p) => p.classHeight)),
  JSON.stringify(scaling.classBand));
// Denne vakten måtte skrives om. Første utgave sjekket bare at faktoren var
// > 0 — og et hardkodet bånd på 85–99 består den, fordi alt under 85 klemmes
// til bunnfaktoren i stedet for å feile. Et klem som alltid biter ser ut som en
// grense og er en skala-mismatch.
//
// Det som avslører den er at nivåene UNDER det gamle båndet må skilles fra
// hverandre. Klemmes de, kollapser 78–84 til én eneste faktor.
const belowOldBand = players.filter((player) => player.classHeight < 85);
check("det finnes spillere under det gamle båndet", belowOldBand.length > 50, String(belowOldBand.length));
const factorsBelow = new Set(belowOldBand.map((player) =>
  classCeilingFactor(player.classHeight, scaling.classBand).toFixed(4)));
check("nivåene under 85 skilles fra hverandre", factorsBelow.size >= 4,
  `${factorsBelow.size} ulike faktorer`);
check("båndets topp gir full faktor",
  Math.abs(classCeilingFactor(scaling.classBand.high, scaling.classBand) - 1) < 0.001);

// ---------------------------------------------------------------------------
// 3. Skalaen brukes — taket biter ikke
// ---------------------------------------------------------------------------
// Dette er husets tilbakevendende bug: en verdi som klemmes mot et tak i
// stedet for å normaliseres. Første utgave la 5 % av alle verdier på nøyaktig
// 20 og produserte toere om ekte spillere.
// Den FLATE grunnlinja — alle posisjonsgrupper like — er malimporten begge
// klumpevaktene under finnes for. Den regnes ut én gang her og måles av begge,
// slik at ingen av grensene igjen kan stå og vise til et tall noen målte for
// hånd for tre importer siden.
const flatRå = read("data/football_attributes.json");
for (const vekter of Object.values(flatRå.positionProfiles || {})) {
  for (const gruppe of Object.keys(vekter)) vekter[gruppe] = 50;
}
const flatProfiles = derivePlayerAttributeIndex(read("data/football_players.json").players,
  { catalogue: normalizeAttributeCatalogue(flatRå), roles }).profiles;
const toStørsteAv = (verdier) => {
  const b = [...new Set(verdier)].map((v) => verdier.filter((o) => o === v).length).sort((a, c) => c - a);
  return (b[0] + (b[1] || 0)) / verdier.length;
};

const allValues = players.flatMap((player) => Object.values(profiles[player.id].values));
const atCeiling = allValues.filter((value) => value === ATTRIBUTE_SCALE.max).length / allValues.length;
const distinct = new Set(allValues).size;
// Grensen er 4 %, ikke 5 %. Bitetesten som gjeninnfører klemmingen lander på
// nøyaktig 5,0 %, så en 5 %-grense ville bestått med null margin — og en vakt
// uten margin er en vakt som slipper gjennom neste variant av samme feil.
// Faktisk verdi nå er 2,8 %.
check("under 4 % av verdiene ligger på taket", atCeiling < 0.04, `${(atCeiling * 100).toFixed(1)} %`);
check("skalaen brukes bredt", distinct >= 12, `${distinct} ulike verdier`);
check("ingen verdi under proffgulvet", minst(allValues) >= ATTRIBUTE_SCALE.floor, String(minst(allValues)));
check("ingen verdi over taket", størst(allValues) <= ATTRIBUTE_SCALE.max);
check("skaleringen ble målt av korpuset", scaling.sampled === players.length * catalogue.attributes.length);

// ---------------------------------------------------------------------------
// 4. Det finnes INGEN samlescore — heller ikke en posisjonsvektet
// ---------------------------------------------------------------------------
// Første utgave hadde `deriveClassForPosition()`: ferdighetene vektet etter
// posisjonens krav, ett tall ut. Den var `overall` på nytt med posisjon limt
// på, og ga Ødegaard 46 som midtstopper — en posisjon han aldri skal spille.
// Ferdighetene ER scoren; en spiller skal aldri kunne oppsummeres i ett tall.
const POSITIONS = ["GK", "CB", "LB", "RB", "WB", "DM", "CM", "AM", "LW", "RW", "ST"];
// Kommentarene strippes: motoren FORKLARER hvorfor samlescoren ble fjernet, og
// en vakt som leser prosa ville falt på sin egen begrunnelse.
const attributeSource = fs.readFileSync(new URL("../src/football-player-attributes.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("ingen posisjonsvektet samlescore i motoren", !/deriveClassForPosition/.test(attributeSource));
check("motoren eksporterer ingen samlescore-funksjon",
  !/export function derive(Class|Overall|Rating)/.test(attributeSource));

// Det posisjonen krever uttrykkes som KONKRETE ferdigheter med tall, ikke som
// et snitt. «CB krever hodespill, han har 6» er et faktum om en ferdighet.
const odegaard = profiles["martin_odegaard"];
if (odegaard) {
  const asCB = describePositionDemands(odegaard, "CB", catalogue);
  check("posisjonskrav returnerer ferdigheter, ikke ett tall", typeof asCB === "object" && Array.isArray(asCB.missing));
  check("Ødegaard mangler noe CB krever", asCB.missing.length > 0);
  check("hvert manglende krav er en navngitt ferdighet med tall",
    asCB.missing.every((entry) => entry.name && Number.isFinite(entry.value)));
  check("beskrivelsen har ingen samlescore",
    !("class" in asCB) && !("score" in asCB) && !("rating" in asCB));

  // Og det viktigste: ferdighetene hans er DE SAMME uansett hvor han står.
  const asAM = describePositionDemands(odegaard, "AM", catalogue);
  const vision = odegaard.values.vision;
  check("Ødegaard har samme spilleforståelse uansett posisjon",
    [...asCB.met, ...asCB.missing, ...asAM.met, ...asAM.missing]
      .filter((entry) => entry.id === "vision").every((entry) => entry.value === vision));
  check("Ødegaard er sterk på spilleforståelse", vision >= 16, String(vision));
}

// Profilens topp er spillerens egen, og endrer seg ikke med plasseringen.
for (const player of players.slice(0, 40)) {
  const profile = profiles[player.id];
  check(`${player.name}s toppferdigheter er sortert synkende`,
    profile.top.every((entry, i) => i === 0 || entry.value <= profile.top[i - 1].value));
}

// ---------------------------------------------------------------------------
// 4b. Posisjonsprofilen slår faktisk ut på ekte spillere
// ---------------------------------------------------------------------------
// Grunnlinja er den ekte forskjellen på en profil og en halv profil. Uten den
// fikk alt spillet ikke hadde kilde på nøyaktig samme tall, og en tier hadde
// like «ukjente» forsvarstall som en midtstopper. Her måles at den slår ut på
// hele katalogen — ikke bare at tallene finnes i datafila.
const groupMean = (player, group) => {
  const ids = catalogue.attributes.filter((entry) => entry.group === group).map((entry) => entry.id);
  const values = ids.map((id) => profiles[player.id].values[id]);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};
const inPosition = (position) => players.filter((player) => player.naturalPositions[0] === position);
const cohortMean = (position, group) => {
  const cohort = inPosition(position);
  return cohort.reduce((sum, player) => sum + groupMean(player, group), 0) / cohort.length;
};

check("det finnes nok midtstoppere og offensive til å måle", inPosition("CB").length >= 5 && inPosition("AM").length >= 5,
  `CB ${inPosition("CB").length}, AM ${inPosition("AM").length}`);
// Marginene er MÅLT, ikke gjettet, og de er målt PÅ NYTT etter at klassetaket
// kom til — taket senker toppen, så avstandene krympet fra 8,5/9,0/11,1/13,0 til
// 6,0/6,2/8,0/9,5. En margin som ikke følger med en slik endring slutter å bite
// uten at noe feiler.
//
// Første utgave sto på +3 og slapp bitetesten som ga tieren midtstopperens
// forsvarsvekt: AM-snittet steg til 10,2 mens CB lå på 15,4. Grensene står nå
// like under de ekte avstandene, og bitetesten er kjørt på nytt mot dem.
check("midtstoppere forsvarer mer enn offensive midtbanespillere",
  cohortMean("CB", "forsvar") > cohortMean("AM", "forsvar") + 4,
  `${cohortMean("CB", "forsvar").toFixed(1)} mot ${cohortMean("AM", "forsvar").toFixed(1)}`);
check("offensive midtbanespillere skaper mer enn midtstoppere",
  cohortMean("AM", "kreativitet") > cohortMean("CB", "kreativitet") + 4,
  `${cohortMean("AM", "kreativitet").toFixed(1)} mot ${cohortMean("CB", "kreativitet").toFixed(1)}`);
check("spisser angriper mer enn midtstoppere",
  cohortMean("ST", "angrep") > cohortMean("CB", "angrep") + 6,
  `${cohortMean("ST", "angrep").toFixed(1)} mot ${cohortMean("CB", "angrep").toFixed(1)}`);
check("bare keepere har keeperferdigheter",
  cohortMean("GK", "gk") > cohortMean("ST", "gk") + 8,
  `${cohortMean("GK", "gk").toFixed(1)} mot ${cohortMean("ST", "gk").toFixed(1)}`);

// Og konkret om spilleren dette handlet om.
if (odegaard) {
  const defending = ["tackling", "marking", "heading", "blocking"].map((id) => odegaard.values[id]);
  const creating = ["vision", "final_pass", "tempo_control"].map((id) => odegaard.values[id]);
  check("Ødegaard har lave forsvarsferdigheter", Math.max(...defending) <= 11, JSON.stringify(defending));
  check("Ødegaard har høye kreative ferdigheter", Math.min(...creating) >= 15, JSON.stringify(creating));
  check("avstanden er stor", Math.min(...creating) - Math.max(...defending) >= 4);
}

// Gulvet skal ikke lenger være en haug. Med flat grunnlinje lå 21 % av alle
// verdier på ett og samme tall.
const floorShare = allValues.filter((value) => value === ATTRIBUTE_SCALE.floor).length / allValues.length;
check("gulvet er ikke lenger en haug", floorShare < 0.10, `${(floorShare * 100).toFixed(1)} %`);
// Vakten under målte FØRST bare den største bøtta, og den målingen var selv en
// SKALA-FEIL — husets tilbakevendende bug, denne gangen i vakten i stedet for i
// motoren.
//
// `buildAttributeScaling()` utleder `high` av HELE spillerlista, så en import
// flytter normaliseringen for alle. Sogndal flyttet den fra 20,069 til 19,897,
// og det er nok til at 1403 av 1935 eksisterende spillere endret én verdi med
// ett poeng. Målt direkte: de SAMME spillerne, uendret, går fra 19,4 % til
// 22,8 % bare ved å bytte skalering. De 58 nye Sogndal-spillerne bidro med
// 0,2 av de 3,6 poengene.
//
// Tallet målte altså hvor avrundingsgrensa tilfeldigvis falt mellom 9 og 10 —
// ikke om fordelingen hadde klumpet seg. Løsningen er å måle noe som ikke er
// avhengig av grensa: de TO største bøttene til sammen. Flytter grensa seg,
// bytter massen plass mellom to nabotall og summen står stille; klumper
// fordelingen seg på ekte, stiger summen.
//
// Målt over de tre tilstandene: 36,0 % (før, før-skalering), 36,3 % (samme
// spillere, ny skalering), 36,4 % (etter importen). Moden svingte 3,4 poeng;
// dette tallet flyttet seg 0,4.
//
// Så gikk klaringen tom. Fem samtidige klubbarver med 65 % tomme styrkelister
// tok tallet til 38,00 % mot en grense på 0,38 — vakten fyrte på ærlig vekst,
// nøyaktig slik profil-ratcheten gjorde før den ble skrevet om.
//
// Svaret er det samme: mål BEGGE endepunktene på nytt. Bittet — flat
// grunnlinje, alle posisjonsgrupper like — har flyttet seg fra 40,2 % til
// 46,93 %, fordi jo flere spillere som bare bærer grunnlinja, jo hardere
// kollapser de når grunnlinja flates ut. Avstanden VOKSTE altså fra 3,8 til
// 8,9 poeng: vakten skiller bedre enn før, det er nivået som har flyttet seg.
//
// Grensa flyttes derfor fra 0,38 til 0,40 — 2,0 poeng over målt, 6,9 under
// bittet — og bittet MÅLES nå hver kjøring i stedet for å stå som et tall i
// en kommentar. Grensa skal aldri under den målte bitteverdien.
//
// Vær ærlig om hva denne er verdt: den er en BAKSTOPPER, ikke førstelinja.
// Fire bitt ble prøvd — flat grunnlinje, ett klassenivå for alle, klem i stedet
// for normalisering, og 300 identiske malimporterte spillere — og hver eneste
// gang fyrte en mer presis vakt først (sprikvakten, kohortvakten,
// klassefaktorvakten, profil-ratcheten). Den fyrer altså aldri alene i praksis.
// Den står fordi den er billig og fordi den nå MÅLER det den påstår; den forrige
// utgaven gjorde ikke det, og den falske alarmen den ga på Sogndal-importen er
// grunnen til at dette avsnittet finnes.
const bøtter = [...new Set(allValues)]
  .map((value) => allValues.filter((other) => other === value).length)
  .sort((a, b) => b - a);
const toStørste = (bøtter[0] + (bøtter[1] || 0)) / allValues.length;
const toStørsteFlat = toStørsteAv(players.flatMap((p) => Object.values(flatProfiles[p.id].values)));
// Den absolutte grensa er ERSTATTET av en relativ, og grunnen er at den aldri
// kunne fange feilen den påstod å fange.
//
// Vakten sier «verdiene klumper seg ikke på to tall» og feller et for HØYT
// tall. Men målt mot en malimport går tallet ned, ikke opp:
//
//   ærlig katalog        44,30 %
//   malimport 100        44,01 %
//   malimport 300        43,99 %
//   malimport 600        42,73 %
//
// Malte spillere får fire ferdigheter hver, og det SPRER verdiene deres bort
// fra grunnlinjen. Den absolutte grensa har altså vært en terskel mot et tall
// som beveger seg motsatt vei av feilen — og den har måttet flyttes fem ganger
// (0,38 → 0,40 → 0,42 → 0,43 → 0,45) uten å ha fanget noe.
//
// Det vakten FAKTISK har målt hele tiden, er det ene bittet som virker: en flat
// grunnlinje klumper hardere enn en posisjonsvektet. Det er en forskjell, ikke
// et nivå, og forskjellen trenger ingen kalibrering:
//
//   ærlig      44,30 mot flat 48,65   = 4,36 poeng
//   malimport 300                     = 2,49 poeng
//   flat grunnlinje (bittet)          = 0 poeng, per definisjon
//
// Kravet er derfor at posisjonsvektingen må BIDRA — minst halvannet poeng
// mindre klumping enn en posisjonsblind katalog. Det er selvkalibrerende: begge
// endepunktene regnes ut hver kjøring fra de samme dataene, så tallet kan aldri
// bli utdatert slik de fem forrige grensene ble.
const baselineBidrag = toStørsteFlat - toStørste;
check("posisjonsvektingen reduserer klumpingen", baselineBidrag >= 0.015,
  `flat ${(toStørsteFlat * 100).toFixed(2)} % mot ærlig ${(toStørste * 100).toFixed(2)} %` +
  ` = ${(baselineBidrag * 100).toFixed(2)} poeng`);

// Svake sider måles bare der de betyr noe. En utespiller som ikke redder skudd
// er ikke svak, han er utespiller — og en «svakest»-liste full av
// keeperferdigheter forteller manageren ingenting han kan gjøre noe med.
const gkIds = new Set(catalogue.attributes.filter((entry) => entry.group === "gk").map((entry) => entry.id));
for (const player of players.filter((entry) => !entry.naturalPositions.includes("GK"))) {
  check(`${player.name} får ikke keeperferdigheter som svakhet`,
    profiles[player.id].weak.every((entry) => !gkIds.has(entry.id)),
    profiles[player.id].weak.map((entry) => entry.id).join(", "));
}

// ---------------------------------------------------------------------------
// 4c. Klassehøyden setter NIVÅET — form og nivå er to akser
// ---------------------------------------------------------------------------
// Feilen dette retter: `strengths` og posisjon sa hva en spiller var god TIL,
// og ingenting sa hvor høyt det rakk. Ghayas Zahid og Martin Ødegaard har begge
// `vision` og `final_pass` blant styrkene sine, og fikk derfor begge 20 — en
// eliteseriespiller og en landslagskaptein, likt.
const peak = (player) => profiles[player.id].top[0].value;
const byClass = [...players].sort((a, b) => a.classHeight - b.classHeight);
const lowClass = byClass.slice(0, 60);
const highClass = byClass.slice(-20);
const mean = (list) => list.reduce((sum, player) => sum + peak(player), 0) / list.length;
// Målt: 17,6 mot 14,6. Grensen står på 2,5 — spennet er begrenset av at
// klassebåndet i dataene bare er 86–99, og at vi med vilje har valgt gode
// spillere. Et større sprik ville krevd at dataene sa noe annet enn de gjør.
check("de høyeste klassene topper høyere enn de laveste",
  mean(highClass) > mean(lowClass) + 2.5,
  `${mean(highClass).toFixed(1)} mot ${mean(lowClass).toFixed(1)}`);
check("bare de aller ypperste når 20",
  players.filter((player) => peak(player) >= 20).every((player) => player.classHeight >= 98),
  players.filter((player) => peak(player) >= 20).map((player) => `${player.name} ${player.classHeight}`).join(", "));
check("toppferdigheten følger klassehøyden monotont nok",
  peak(byClass[byClass.length - 1]) > peak(byClass[0]) + 3);

// Men NIVÅ må ikke bli FORM: en lavere klasse skal ikke gjøre svake sider
// mindre svake, bare toppene lavere. Ellers konvergerer hele katalogen mot
// midten — målt ga tosidig kompresjon 34 % av alle verdier på nøyaktig 9.
const weakestOf = (player) => profiles[player.id].spread.min;
const meanWeakest = (list) => list.reduce((sum, player) => sum + weakestOf(player), 0) / list.length;
check("klassen rører ikke bunnen",
  Math.abs(meanWeakest(highClass) - meanWeakest(lowClass)) <= 1.5,
  `høy ${meanWeakest(highClass).toFixed(1)}, lav ${meanWeakest(lowClass).toFixed(1)}`);

// Profilene må faktisk skille spillere fra hverandre. Dette er den ekte
// målingen bak «ingen enkeltverdi tar mer enn en femtedel» — den var bare en
// proxy. Med posisjonsmal og nivå alene fikk spillere med samme posisjon og
// samme nivå BOKSTAVELIG TALT identiske profiler: 333 av 528 delte profil med
// minst én annen, og den største identiske gruppa var 26 spillere. Å velge
// mellom dem var meningsløst.
//
// `era` sto på hver eneste spiller og ble aldri lest. Den er nå en akse, og
// halverte problemet. Det som gjenstår er en ekte begrensning i kildene, ikke
// en feil: flere ulike profiler krever mer kildemateriale per spiller, ikke mer
// oppdiktet variasjon.
// Samme deling som styrke-settene under, av samme grunn og for samme kilder.
// En spiller UTEN dokumenterte styrker har ingen individuell påstand å skille
// seg på — profilen hans er posisjon pluss epoke pluss klassetak, og han skal
// ligne andre med samme posisjon, epoke og nivå. Det er ikke en feil, det er
// hva det ser ut som å ikke vite noe.
//
// Målt: 86,2 % blant dem med styrker, 56,8 % blant de 44 uten (største klon 5 —
// posisjon og epoke skiller dem fortsatt). Blandet blir tallet 85,5 %, og da
// måler ratcheten hvor mange udokumenterte spillere som nettopp ble importert
// i stedet for hvor godt profilene skiller folk fra hverandre.
const dokumenterte = players.filter((player) => (player.strengths || []).length > 0);
const signatures = new Map();
for (const player of dokumenterte) {
  const key = JSON.stringify(profiles[player.id].values);
  signatures.set(key, (signatures.get(key) || 0) + 1);
}
const uniqueShare = signatures.size / dokumenterte.length;
const largestClone = størst([...signatures.values()]);
// Grensa var en RATCHET, og den er nå skrevet om. Historikken står fordi den
// forklarer hvorfor: den sto på 0,55 da uniktheten var 58 %, ble flyttet til
// 0,70 og 0,76 da Vålerenga-arven ble lest fra kilde i stedet for malgenerert,
// til 0,86 etter Odd/Aalesund/Haugesund/Skeid/Moss/Bryne, og til 0,863 da
// Sarpsborg-rettingen tok korpuset til 86,4 %.
//
// Så FALT den, tre importer på rad: 86,31 % (Sogndal + Kongsvinger) og 86,24 %
// (Ranheim). Hver gang ble den foreskrevne kontrollen gjort — er dette en
// kartleggingsfeil forkledd som kildebegrensning? — og hos Ranheim VAR det
// delvis det: «scoringer i Eliteserien» og «64 mål» sto i kilden og var ikke
// lest, og å lese dem ga 0,10 poeng tilbake. De fire som ble igjen er ekte
// kildebegrensning, lest mot både `Kvaliteter` og `Historikk`: to menn hvis
// eneste påstand er «mange kamper», og to spisser hvis eneste påstand er
// «scoret avgjørende mål».
//
// Da er premisset for en ratchet oppbrukt, og en vakt hvis premiss er oppbrukt
// skal skrives om, ikke slakkes. Årsaken er ARITMETISK, ikke kvalitativ: en
// import med lavere egen unikhet enn korpuset trekker snittet ned, og en tynn
// kilde ER alltid under snittet. En absolutt korpusandel kan derfor ikke
// overleve ærlig vekst — fjerde gang huset lærer at en korpusbred andel er feil
// form.
//
// Omskrivingen er å slutte å måle mot GÅRSDAGENS tall og begynne å måle mot
// FEILEN vakten finnes for. Begge endepunktene er målt:
//
//     ærlig katalog                                85,66 %
//     samme katalog, flat grunnlinje (malimport)   84,22 %
//
// Grensa settes mellom dem, nærmere bittet enn dagens tall, slik at den fanger
// en malimport og samtidig tåler noen ærlige tynne arver. Den skal fortsatt opp
// hvis avstanden vokser — men den flyttes aldri under den målte bitteverdien.
//
// Forrige runde sto det her at AVSTANDEN mellom endepunktene vokste — 1,07 til
// 1,44 poeng — og at en krympende avstand ville bety at vakten måtte skrives om
// igjen. Notodden og Hønefoss målte 85,46 mot 84,35, altså 1,11, og da er den
// spådommen prøvd. Serien er nå 1,07 · 1,44 · 1,39 · 1,11.
//
// Den svinger, den vokser ikke. Og det er nettopp derfor avstanden IKKE kan bli
// selve grensa: en vakt med krav om minst 1,20 poeng ville felt to av fire
// ærlige målinger. Å bytte en dilutert absoluttandel mot et svingende
// differansetall er ikke å måle mot feilen, det er å bytte støykilde.
//
// Grensa på 0,848 gjør fortsatt jobben sin: den ligger 1,11 poeng OVER
// flat-bittet, som altså fortsatt felles. Tallet å følge med på er ikke
// avstanden, men KLARINGEN — 0,66 poeng opp fra grensa til dagens katalog. Den
// krymper med hver tynn arv, og når den er brukt opp, er svaret å måle begge
// endepunktene på nytt og flytte grensa dit den fortsatt ligger mellom dem —
// aldri under bittet.
//
// Og for at det ikke skal måtte gjøres for hånd igjen: bittet MÅLES her, hver
// kjøring, og skrives ut sammen med den ærlige andelen. Kommentaren over kan
// bli foreldet; de to tallene i utskriften kan det ikke.
const flatSignaturer = new Set(dokumenterte.map((player) =>
  JSON.stringify(flatProfiles[player.id].values)));
const flatShare = flatSignaturer.size / dokumenterte.length;
// ---------------------------------------------------------------------------
// Korpusandelen er PENSJONERT som grense — femte gang huset lærer det samme
// ---------------------------------------------------------------------------
// Denne grensa har vært en ratchet, så en absolutt terskel målt mot et
// flat-grunnlinje-bitt. Etter seks legacy-konverteringer holder ingen av
// delene, og denne gangen er svaret å FJERNE den, ikke å flytte den igjen.
//
// Tre målinger avgjør det:
//
//   1. Bittet snudde. Ærlig katalog 83,23 %, flat grunnlinje 83,30 %. Det
//      finnes ikke lenger en terskel som slipper den ene og feller den andre.
//      Posisjonsvektingen var aldri det som skilte DOKUMENTERTE spillere fra
//      hverandre — den finnes for å gjøre en tier svak i forsvar — og da
//      styrkene ble færre og ærligere, forsvant korrelasjonen som gjorde
//      flat-bittet brukbart.
//
//   2. Målet er ikke monotont i feilen. En malimport på 60 spillere gir 83,56 %
//      og en på 100 gir 83,47 % — begge HØYERE enn den ærlige katalogens 83,23.
//      Først ved rundt 150 faller tallet. En vakt som blir grønnere av den
//      feilen den skal fange, kan ikke reddes av en bedre terskel.
//
//   3. Vakten som faktisk fanger feilen finnes allerede. Bitt med en realistisk
//      malimport — hele Molde-arven gitt posisjonsmalens styrker — fyrer
//      per-klubb-vakten under av seg selv, og med en skarpere melding:
//      «aker_stadion: 8 unike sett av 89 (9 %)».
//
// Tallene REGNES fortsatt ut og skrives ut, fordi trenden er verdt å se. De er
// bare ikke lenger en port. Porten mot malimport er per-klubb-målingen.


// Taket står på 14, og det er hevet fra 12 med åpne øyne. Den største
// klonen er nå 12 moderne midtstoppere som TOLV FORSKJELLIGE klubbkilder
// beskriver med de samme tre ordene — hodespill, duellspill,
// posisjonering — og som ligger på samme klassenivå. Det er en grense for
// hva kildene sier, ikke en malimport, og et tak på 12 ville felt neste
// ekte import av en midtstopper. Det som faktisk fanger en malgenerert arv
// er per-klubb-målingen lenger ned.
check("ingen stor gruppe spillere er bytte-identiske", largestClone <= 14, String(largestClone));

// Profilandelen alene er for treg til å fange EN klubb importert på mal. Målt:
// å reversere Brann til malstyrker koster bare 2 poeng (75 % → 73 %), fordi
// epoke og nivå fortsatt skiller spillerne. Den følsomme målingen ligger
// oppstrøms — i styrke-settene selv, som er nettopp det en malimport gjør likt.
// Målt: 576 unike styrke-sett av 1117 (51,6 %) — og det tallet FALT da
// målingen ble ærlig. Settene sorteres nå før de telles, fordi tolv
// midtstoppere med «heading, duels, positioning» i ulik rekkefølge er
// bit-identiske profiler. Ti prosentpoeng av den gamle «variasjonen» var
// permutasjoner, og grensene på 0,52 og 0,55 hvilte delvis på den støyen.
//
// Grensa er derfor satt på nytt fra bitetester på den ærlige målingen:
// reverteres Tromsø til mal faller den til 44,6 %, Vålerenga til 41,5 %
// og Rosenborg til 48,0 %. Etter Fredrikstad-kilden står den på 54,2 %,
// og grensa er flyttet fra 0,49 til 0,54, etter Start-kilden (55,6 %).
//
// Rosenborg-kilden ga en mindre gevinst enn Vålerenga-kilden, og det er en
// egenskap ved kilden, ikke ved importen: RBK-dokumentet har 42 unike
// styrkesetninger for 156 spillere (27 %), mot VIFs 127 av 127 (100 %). Det
// grupperer etter rolle — tolv offensive backer deler én setning. Grensa
// flyttes derfor til 0,55, ikke lenger.
//
// Grensa sto på 0,46 med under ett prosentpoengs margin, og de to største
// kollisjonsgruppene var på 34 og 27 — begge fra Vålerenga- og
// Rosenborg-importene, som ble malgenerert i mangel av kildebeskrivelser.
// VIF-kilden kom, begge gruppene er borte, og grensa flyttes til 0,52.
// Rosenborg står igjen som den siste malimporten; når den lista kommer,
// skal grensa opp igjen.
// Settet SORTERES før det telles. Uten det teller målingen permutasjoner som
// variasjon: tolv moderne midtstoppere har «heading, duels, positioning» i
// ulik rekkefølge fra hver sin klubbkilde, og de er bit-identiske profiler.
// Rekkefølgen betyr ingenting for utledningen, så den skal ikke bety noe for
// målingen heller — ellers pynter tallet på seg selv.
//
// Odd tok den fra 55,6 % til 57,0 %. Kilden er den mest ordrike hittil (95 av
// 100 styrkesett unike for seg selv). Samtidig ble 69 lagrede styrker
// kanonisert: de sto som ALIAS (`one_v_one` ved siden av `one_vs_one`), og da
// teller denne målingen én ferdighet som to. Det trakk tallet ned 0,2 poeng, og
// det er riktig — det var pynt.
//
// Aalesund tok den videre til 59,3 %, og samtidig fikk `marking` og `flair`
// sine første 85 spillere: to ferdigheter katalogen hadde, men som én
// ordbokoppføring hadde spist («markering» pekte på `duels`). Et smalere
// vokabular gir likere sett.
//
// Haugesund tok den til 60,4 %, og grensa til 0,59. Den kilden ga
// `natural_fitness` sine første spillere — men den var ikke spist av en
// ordbok, den hadde bare aldri møtt en kilde som sa «tilgjengelighet».
//
// Skeid tok den NED igjen til 60,0 %, og Bryne opp til 61,0 %. Hødd delte
// målingen i to (se over) og lander på 60,5 % blant dem som har styrker.
// Grensa er 0,60. En ratchet går ikke ned. Fallet er kildens egenskap og ikke en feil: Skeid
// beskriver den moderne troppen med korte stikkord («Allsidighet, disiplin,
// arbeidskapasitet») der de eldre profilene får hele setninger, og 81 % unike
// styrkesett internt er det laveste av de seks siste kildene. Det er ærlig
// beskrevet av en klubb hvis dokumenterte storhet ligger i 1947–1974.
// MÅLINGEN ER DELT I TO, og Hødd er grunnen.
//
// Hødd-kilden sier ordrett om 28 av sine 85 profiler at den ikke dokumenterer
// en individuell ferdighet «som bør importeres som strength uten ny kilde». De
// spillerne står derfor UTEN dokumenterte styrker: profilen deres kommer fra
// posisjons- og epokegrunnlinja, og ingen av de 58 verdiene er merket `belagt`.
//
// Å telle dem her ville sagt at de er like. Det er sant om strengene og usant
// om saken: spørsmålet metrikken stiller er «er styrkene lest per spiller eller
// MALT per posisjon», og en tom liste er ingen av delene. En malt spiller har
// fått en påstand han ikke har dekning for; en tom har ikke fått noen.
//
// Så: unikheten måles blant dem som HAR styrker, og de tomme får sin egen vakt
// rett under. Til sammen er de strengere enn den ene var — den nye kan bare gå
// NED, så neste kildeløse klubb feller den.
const medStyrker = players.filter((player) => (player.strengths || []).length > 0);
const utenStyrker = players.filter((player) => (player.strengths || []).length === 0);
const strengthSets = new Map();
for (const player of medStyrker) {
  const key = JSON.stringify([...player.strengths].sort());
  strengthSets.set(key, (strengthSets.get(key) || 0) + 1);
}
const strengthShare = strengthSets.size / medStyrker.length;

// ---------------------------------------------------------------------------
// Og den samme målingen PER ARV — som er der den faktisk diskriminerer
// ---------------------------------------------------------------------------
// Tredje gang huset lærer det samme: en korpusbred andel er feil form.
//
// Målt PER ARV, og på EKSKLUSIVE spillere — de med nøyaktig én kilde.
//
// Gulvet var kalibrert mot de modellerte arvene: «Lerkendal 43 %, Marienlyst
// 45 %» var de to laveste, og 0,40 sto rett under dem. Den kalibreringen døde
// med konverteringene. Legacy-filenes firetokens scoutingpakker var VARIERTE —
// modellering produserer variasjon — så da de forsvant, sto de tynne, ekte
// v2-kildene igjen som de laveste, og Sandnes Ulf falt gjennom på 40 %.
//
// Det andre problemet var at målingen talte alle spillerne på banen. Sandnes
// Ulf endret seg fordi Aalesund, Skeid og Haugesund ble konvertert: fellesspillere
// mistet styrkene sine og falt ut av tellingen, og det de tok med seg var
// nettopp den lånte variasjonen. En arv kan ikke måles på naboens kilde.
//
// Eksklusive spillere løser begge deler på én gang, og den andre egenskapen er
// den viktigste: et eksklusivt utvalg er INVARIANT under konvertering av naboer.
// Tallet flytter seg bare når denne kildens egne påstander endrer seg.
//
// Målt på eksklusive spillere med styrker, 21 arver:
//
//   Sandnes Ulf 32 %, Hødd 39 %       <- v2-kilder som sier «målproduksjon» om mange
//   Sarpsborg 48 %, Kongsvinger 48 %
//   median 83 %
//
// Bittet: hele Molde-arven gitt posisjonsmalens styrker gir 9 %. Gulvet settes
// på 0,25 — sju poeng under den laveste ærlige og godt over bittet.
{
  const perArvStyrker = new Map();
  for (const player of medStyrker) {
    const steder = player.sourcePlaceIds || [];
    if (steder.length !== 1) continue;
    if (!perArvStyrker.has(steder[0])) perArvStyrker.set(steder[0], []);
    perArvStyrker.get(steder[0]).push(player);
  }
  const andeler = [];
  for (const [placeId, liste] of perArvStyrker) {
    if (liste.length < 20) continue;
    const sett = new Set(liste.map((player) => JSON.stringify([...player.strengths].sort())));
    const andel = sett.size / liste.length;
    andeler.push(andel);
    check(`${placeId}: styrkene skiller spillere fra hverandre`, andel > 0.25,
      `${sett.size} unike sett av ${liste.length} (${(andel * 100).toFixed(0)} %)`);
  }
  // Denne er en RØYKTEST, ikke en kvalitetsgrense, og gulvet er derfor lavt.
  //
  // Den krevde tidligere 20 arver med minst 20 eksklusive styrkebærende
  // spillere. Det kravet kan ikke overleve arbeidet det er del av: hver
  // konvertering tømmer en arv, og målt — når alle 22 modellerte arver er
  // konvertert, står bare ÅTTE igjen som kvalifiserer. Vakten ville felt siste
  // etappe av sin egen jobb.
  //
  // Og den beskytter ikke mot det den ser ut til å beskytte mot. En malimport
  // gir ALLE spillerne i en arv styrker, så den gjør arven kvalifiserende av
  // seg selv — per-klubb-sjekken over er selvbevæpnende mot nettopp den feilen
  // den finnes for. Det eneste dette tallet fanger, er at løkka har sluttet å
  // kjøre i det hele tatt, og til det holder et lavt gulv.
  check("per-klubb-målingen kjører i det hele tatt", andeler.length >= 5, String(andeler.length));
  // Medianen er PENSJONERT som grense, av samme grunn som profil-unikheten og
  // etter samme prøve: den er ikke monoton i feilen.
  //
  //   ærlig katalog            median 63,0 %   (8 arver, laveste 32 %)
  //   spredt malimport, 100    median 63,0 %   — uendret
  //   spredt malimport, 300    median 47,6 %   (laveste 10 %)
  //
  // Den rører seg ikke i det hele tatt for en malimport på hundre spillere, og
  // når den endelig gjør det ved tre hundre, har gulvet på 0,25 for lengst
  // felt arven det gjelder — laveste går fra 32 % til 10 %.
  //
  // Grensa var dessuten kalibrert på en populasjon som ikke finnes lenger. Da
  // den ble satt til 0,75, var medianen dominert av de modellerte arvene, og
  // firetokens scoutingpakker er VARIERTE. Nå som alle 22 er konvertert, står
  // bare de ærlige v2-kildene igjen — tynne, og med gjentatte sett fordi de
  // sier «målproduksjon» om mange. 63 % er hva ærlighet ser ut som her.
  //
  // Tallet skrives ut, men det er en trend, ikke en port.
  const median = [...andeler].sort((a, b) => a - b)[Math.floor(andeler.length / 2)];
  medianArv = median;
}

// Målingen er PER ARV, ikke korpusbred — og det er andre gang huset lærer det.
// Den korpusbrede varianten sto én runde på 1,2 % og var allerede feil form:
// en andel av 1800 spillere blir uskarpere for hver import, akkurat som
// styrke-settene ble før per-klubb-målingen kom.
//
// To arver har et ekte hull, og de står NAVNGITT med sin målte verdi. Da kan de
// ikke vokse, og en ny kildeløs klubb kan ikke gjemme seg i gjennomsnittet.
// MÅLT PÅ EKSKLUSIVE SPILLERE — de som bare har denne ene kilden.
//
// Taket telte tidligere alle spillerne på banen, og v2-konverteringen av
// Rosenborg, Tromsø og Vålerenga viste hvorfor det er feil form: `strengths`
// ligger per SPILLER, så da de tre ble tømt, mistet 129 spillere som ALLTID
// står på flere modellerte baner sine verdier samtidig. Strømsgodset gikk til
// 7 % tomme uten at noen hadde rørt Strømsgodset-kilden, og felte taket sitt.
//
// Et tak som beveger seg når naboen konverteres måler naboen, ikke kilden.
// Alle tallene under er derfor remålt på spillere med nøyaktig én kilde, og de
// betyr nå det de sier: hvor ofte DENNE kilden lot være å dokumentere en
// ferdighet. Rekkefølgen er den samme som før — den følger hvor mye kilden
// siterer — men nivåene er høyere, fordi fellesspillerne som pyntet på tallet
// er ute.
const KJENT_UDOKUMENTERT = {
  // Kilden sier ordrett om 28 av sine 85 at den ikke dokumenterer en ferdighet
  // «som bør importeres som strength uten ny kilde». Målt 13 av 69.
  hoddvoll: 0.26,
  // Samme v2-form, og 31 av 85 sier det samme — de fleste fra cupmesterlagene
  // 1933–1937, der kilden bare har «fast på cupmesterlaget 1937». Ni til er
  // moderne spillere hvis eneste påstand er overgangsverdi, som ikke er en
  // ferdighet. Målt 41 av 83.
  //
  // Taket er HEVET fra 0,41, og grunnen er en RETTING, ikke et frafall: tolv av
  // disse bar `determination` utledet av «dokumentert cup-/finaleerfaring».
  // Sarpsborg-kilden viste hva den kartleggingen gjør i stor skala, og regelen
  // den avdekket gjelder hele katalogen — en tittel er lagets. Beviset på at
  // hevingen kjøpte noe står i profil-unikheten: den gikk OPP, fra 86,2 % til
  // 86,4 %, samtidig som disse listene ble tomme.
  consto_arena: 0.54,
  // HamKam: 41 av 85 med samme markør, i egen ordlyd — «ingen teknisk/fysisk
  // strength skal derfor fylles uten ny individuell kilde». Målt 33 av 81.
  // Hevet fra 0,34 av samme retting: åtte bar `determination` fra «dokumentert
  // opprykksverdi», og et opprykk er lagets.
  briskeby_stadion: 0.60,
  // Sarpsborg er det fjerde hullet, og det eneste med en annen årsak: kilden
  // avstår bare 14 ganger av 100 — den SIER noe om nesten alle. Men hele
  // ordforrådet er fjorten fraser, og de er merittfraser. «Del av det første
  // cupmesterlaget i 1917» er en påstand om laget, ikke om mannen, og av 35
  // SFK-profiler er det alt kilden har om 33 av dem.
  //
  // Første import kartla merittene til `determination` likevel. Da fikk tretten
  // menn fra 1917-laget identisk profil, og korpusets profil-unikhet falt til
  // 85,1 %. Å la meritten være tom løftet den til 86,1 % og Sarpsborg selv fra
  // 66 % til 84 %. En tom liste er derfor ikke det dårligere alternativet her —
  // det er det som ga den mest presise katalogen.
  // Målt 39 av 107.
  sarpsborg_stadion: 0.50,
  // Sogndal er den TYNNESTE arven i katalogen, og kilden sier det selv: 52 av
  // 85 profiler erklærer ordrett at «ingen teknisk eller fysisk strength skal
  // fylles uten en ny individuell kilde». Ni til bærer bare finaleerfaring
  // (cupfinalelaget 1976 ramset opp) eller eksportverdi, som ikke er
  // ferdigheter. Målt 50 av 75.
  //
  // Taket er høyt fordi hullet er ekte, ikke fordi importen var slurvete.
  // Alternativet var å la Sogndal stå uten arv i det hele tatt — klubben hadde
  // ingen bane i katalogen før denne importen — og 75 navngitte spillere med
  // riktig posisjon, epoke og nivå er mer enn ingenting. Det som IKKE er gjort,
  // er å dikte opp ferdigheter for å pynte på tallet.
  fosshaugane_campus: 0.88,
  // Kongsvinger er samme kildeform som Sogndal, men vesentlig bedre belagt:
  // bare 16 av 85 avstår, mot Sogndals 52. Det som tømmer resten er
  // merittregelen — «dokumentert cupsemifinaleerfaring» står 25 ganger, og KILs
  // fire cupsemifinaler er lagets merittliste sett fra spilleren, ikke en
  // ferdighet hos mannen. Målt 40 av 79.
  gjemselund_stadion: 0.66,
  // Ranheim er den tredje v2-kilden, og markøren skiftet ordlyd igjen — «ingen
  // teknisk eller fysisk STYRKE fylles utover dette uten ny individuell kilde»,
  // norsk ord og uten «skal». 55 av 85 profiler bruker den. Kilden har ingen
  // fraseliste i det hele tatt: de 30 andre er skrevet ut i klartekst og lest
  // for hånd. Fem av dem er salg, utlån og «rask integrasjon» — marked, ikke
  // ferdighet. Målt 44 av 81.
  extra_arena: 0.72,
  // Strømmen har den rikeste prosaen av alle v2-kildene — VG- og klubbomtaler av
  // 2025-/2026-troppen med faktiske ferdighetsbeskrivelser, som gir 100 % unike
  // styrkesett blant de 16 som har noen. Men den gjelder en liten del av arven:
  // 69 av 85 profiler er tynn-markert, og 30 mangler posisjon helt.
  // Målt 24 av 54.
  strommen_stadion: 0.64,
  // Raufoss blander alle TRE kildeformene i én fil — 49 tynne, 18 fraselister og
  // 18 prosapåstander — og er den best dekkede av v2-kildene: bare 36 % uten
  // styrker. Prosaen er klubbens egne spillervurderinger, med faktiske
  // ferdighetsbeskrivelser («silkefot av et pasningsbein», «god fysikk, ro,
  // teknikk og overblikk»).
  //
  // Målt 18 av 58. Tallet ble bedre ETTER at flettingen av koblede spillere kom
  // på plass — tre Raufoss-profiler som sto tomme, hadde påstander i en annen
  // klubbs kilde. Taket er satt på det målte, ikke på det opprinnelige 21 av 58.
  raufoss_arena: 0.48,
  // Sandnes Ulf er den BEST dekkede arven i katalogen: bare 6 av 60 uten
  // dokumenterte styrker. Kilden avstår åtte ganger av 85 og er nesten ren
  // fraseform. Taket står likevel her, fordi 10 % er over standardtaket på 5 %
  // og en navngitt verdi er den eneste måten hullet ikke kan vokse i stillhet.
  // Målt 6 av 60.
  oster_hus_arena: 0.16,
  // Egersund er den best DATERTE kilden i katalogen — bare 7 av 85 uten årstall,
  // de fleste med hele karrierespennet («441 kamper og klubbens målrekord med
  // 241 mål, 1975–1992»). Til gjengjeld avstår den 73 ganger av 85, så bare tolv
  // profiler bærer en påstand i det hele tatt. Godt datert og tynt beskrevet er
  // to uavhengige egenskaper ved en kilde. Målt 36 av 56.
  egersund_arena: 0.86,
  // Åsane er stiftet i 1971, og kilden er derfor nesten helt moderne — 61 av 76
  // på banen. Den avstår 69 ganger av 85, men de seksten som står igjen rommer
  // den mest DETALJERTE enkeltbeskrivelsen i katalogen: Martin Uelands
  // tidligere lagkamerater gir fem ferdigheter i én setning. Målt 56 av 76.
  myrdal_idrettspark: 0.82,
  // Jerv avstår 67 ganger av 85. De atten som står igjen er nesten alle
  // konkrete HANDLINGER — stupheadingen mot Brann, fire strafferedninger i
  // samme kvalifiseringsfinale, opprykksmålet mot Rolvsøy i 1982 — så det som
  // finnes er godt, det er bare lite av det. Målt 53 av 72.
  levermyr_stadion: 0.80,
  // Notodden er det største hullet i katalogen, og årsaken er ny: kilden
  // beskriver DOKUMENTASJON i stedet for fotball. 77 av 85 kvalitetslinjer har
  // formen «N kamper dokumenterer kontinuitet», og kilden slår selv fast i
  // toppen at kampmengde, mål, landslag og opprykk «ikke automatisk oversettes
  // til skjulte tekniske/fysiske attributter». 39 av linjene sier i tillegg
  // ordrett at ferdighetsprofilen «holdes thin-source».
  //
  // Regelen det ga står i importen: EN KAMP ER INDIVIDUELL, MEN DEN ER IKKE EN
  // FERDIGHET. Åtte profiler sier noe om hvordan mannen spilte — Eric Kitolano
  // «rask, driblesterk og villig til å utfordre én mot én», Magne Hoseths
  // «silkemyke venstrefot» — og de åtte er de eneste som bærer styrker herfra.
  // Målt 61 av 80.
  //
  // Taket er satt tett på det målte med vilje. Et tak på 76 % vokter lite i seg
  // selv, men gulvet på baksiden gjør det: faller to av de nitten med styrker
  // ut, slår vakten inn.
  notodden_stadion: 0.96,
  // Hønefoss har samme form og samme forbud, men er dobbelt så godt dekket —
  // fordi klubbens adelskalender fører MÅL per mann fra 1987. 24 av 85 har
  // dermed en individuell påstand mot Notoddens åtte, og etter at de 27 uten
  // oppgitt posisjon er utelatt, står bare 23 av 58 tomme.
  //
  // To kilder med identisk struktur, identisk forbud og dobbelt så stor
  // forskjell i dekning: det er skillet mellom godt datert og godt beskrevet
  // igjen, i en tredje form. Målt 23 av 58.
  aka_arena: 0.58,
  // Fem klubber kom samtidig, og de er de fem best BESKREVNE tynne kildene så
  // langt — fordi de siterer noen. Kjelsås siterer Eivind Kampen, Arendal
  // skriver kampomtaler, Grorud lager spillerportretter. Hullet er derfor
  // markant mindre enn hos Notodden (76 %), og de skiller seg innbyrdes på
  // nøyaktig samme akse: jo mer kilden siterer, jo færre tomme.
  //
  // Kjelsås er den laveste av alle klubbheritagene med prosakilde — men 42 av
  // 85 profiler har ingen posisjon i kilden og utelates, så de 46 som står
  // igjen er de kilden faktisk sier noe om. Målt 16 av 46.
  grefsen_stadion: 0.42,
  // Arendal: klubbens egne kampomtaler gir 30 av 85 en påstand. Målt 43 av 77.
  norac_stadion: 0.68,
  // Levanger: best DATERT av de fem (5 av 85 uten årstall) og teller mål per
  // mann gjennom hele nivå-2-perioden. Målt 42 av 76.
  levanger_stadion: 0.76,
  // Ull/Kisa er den tynneste: elleve påstander av 85, resten troppslister.
  // Målt 54 av 81.
  jessheim_stadion: 0.84,
  // Grorud: nitten påstander, alle fra klubbens egne spillerportretter. De tre
  // som bare har HØYDE står tomme med vilje — se ordboka. Målt 47 av 71.
  grorud_idrettspark: 0.80,
  // De v2-KONVERTERTE arvene. De står på 100 % fordi konverteringen tømte dem
  // med vilje: kildefilene sier på hver eneste profil at ingen ferdighet låses
  // fra legacy-filens scoutingtekst. Taket er derfor ikke en grense her, det er
  // en registrering av at arven ikke dokumenterer ferdigheter i det hele tatt.
  // Tallet skal SYNKE når individuelle kilder leses tilbake.
  nadderud_stadion: 1.01,    // Stabæk
  araasen_stadion: 1.01,     // Lillestrøm
  nordmore_stadion: 1.01,    // Kristiansund
  kfum_arena: 1.01,          // KFUM Oslo
  aspmyra_stadion: 1.01,     // Bodø/Glimt
  jotun_arena: 1.01,         // Sandefjord
  brann_stadion: 1.01,       // Brann
  bislett_stadion: 1.01,     // Lyn
  lyse_arena: 1.01,          // Viking
  sor_arena: 1.01,           // Start
  bryne_stadion: 1.01,       // Bryne
  mellos_stadion: 1.01,      // Moss
  color_line_stadion: 1.01,  // Aalesund
  nordre_asen: 1.01,         // Skeid
  fredrikstad_stadion: 1.01, // Fredrikstad: se konverteringen
  skagerak_arena: 1.01,      // Odd
  intility_arena: 1.01,      // Vålerenga: 66 av 66
  romssa_arena: 1.01,        // Tromsø: 53 av 53
  // De fire første arvene som har fått et KILDEPASS etter konverteringen: hver
  // eksklusive profil lest på nytt, og bare de som har en gjenbrukbar
  // individclaim får styrker tilbake. Passet skiller tre tilstander, og bare
  // den første gir noe — DOKUMENTERT (en kilde beskriver mannen), DELVIS
  // (karriere og rolle er dokumentert, men det er ikke en ferdighet) og
  // THIN-SOURCE (ingen beskrivende kilde funnet).
  //
  // Dette er de eneste takene i tabellen som er MÅLT NEDOVER fra 1,01, og det
  // er slik gjelden fra konverteringen betales: tallet er ikke en grense noen
  // har satt, det er hvor langt kilden faktisk rakk.
  //
  // Rangeringen gjentar aksen alle de tynne kildene har vist: det avgjørende er
  // ikke hvor mye klubben har skrevet, men hvor mye den SITERER. Rosenborg har
  // mest dokumentasjon av alle og lavest dekning av de fire, fordi mesteparten
  // handler om meritter og kampmengde. Haugesund har halvparten så mye tekst og
  // dobbelt så mange spillerbeskrivelser.
  lerkendal_stadion: 0.80,   // Rosenborg: målt 66 av 83
  aker_stadion: 0.77,        // Molde: målt 41 av 54
  marienlyst_stadion: 0.76,  // Strømsgodset: målt 63 av 84
  haugesund_stadion: 0.59    // Haugesund/Haugar/Djerv: målt 50 av 87
};

// ---------------------------------------------------------------------------
// Det motsatte hullet: arver der INGEN står uten styrker
// ---------------------------------------------------------------------------
// `KJENT_UDOKUMENTERT` over setter tak på hvor HØY tomandelen får bli. Ingenting
// har satt gulv, og det er der den største gjelden i katalogen har ligget i ro.
//
// En ekstern sluttaudit av alle 42 klubbpooler (10.08.2026) fant at tolv av
// kildefilene er bygget etter en eldre modell der styrker og svakheter er
// «redaksjonelle scoutingvurderinger» — utledet av rolle og karriere, ikke lest
// om den enkelte spilleren. Ti andre pooler kunne den ikke sertifisere i det
// hele tatt, fordi filene ikke lot seg finne.
//
// Katalogen svarer på begge deler med ett tall:
//
//     22 arver med minst 40 spillere har NULL tomme styrkelister
//     til sammen 1951 spillere, i snitt 3,7 styrker hver
//
//     de 16 v2-arvene:  52,9 % tomme, i snitt 1,37 styrker
//     best dekkede v2:  Sandnes Ulf, 10,0 % tomme
//
// Null av 1951 er ikke hva en kilde ser ut som. En kilde er taus om NOEN — det
// er hele grunnen til at taket over finnes. Null tomme er hva en GENERATOR ser
// ut som, og de 22 er nøyaktig auditens tolv legacy-filer pluss de ti den ikke
// fant. De ti er altså ikke et åpent spørsmål lenger: de bærer samme fingeravtrykk.
//
// Lista er en INVENTARLISTE, ikke en dom over enkeltspillere. Den står her
// fordi gjeld som bare finnes i et opplastet auditdokument blir glemt, og fordi
// den da kan telles ned: konverteres en arv til source-only, får den tomme
// lister, og da SKAL oppføringen fjernes. Vakten under krever begge veier.
const MODELLERTE_ARVER = new Set([
]);
const perArv = new Map();
for (const player of players) {
  for (const placeId of player.sourcePlaceIds || []) {
    if (!perArv.has(placeId)) perArv.set(placeId, { alle: 0, tomme: 0, styrker: 0 });
    perArv.get(placeId).alle += 1;
    perArv.get(placeId).styrker += (player.strengths || []).length;
    if ((player.strengths || []).length === 0) perArv.get(placeId).tomme += 1;
  }
}
const eksklusivt = new Map();
for (const player of players) {
  const steder = player.sourcePlaceIds || [];
  if (steder.length !== 1) continue;
  const id = steder[0];
  if (!eksklusivt.has(id)) eksklusivt.set(id, { alle: 0, tomme: 0 });
  eksklusivt.get(id).alle += 1;
  if ((player.strengths || []).length === 0) eksklusivt.get(id).tomme += 1;
}
for (const [placeId, tall] of eksklusivt) {
  if (tall.alle < 20) continue;
  const andel = tall.tomme / tall.alle;
  const tak = KJENT_UDOKUMENTERT[placeId] ?? 0.05;
  check(`${placeId}: andelen uten dokumenterte styrker vokser ikke`, andel < tak,
    `${tall.tomme} av ${tall.alle} (${(andel * 100).toFixed(0)} %, tak ${(tak * 100).toFixed(0)} %)`);
}

// Gulvet, målt på EKSKLUSIVE spillere — de som bare har denne ene kilden.
//
// Første utgave telte alle spillerne på banen, og den ville misfyrt straks en
// konvertering startet: `strengths` ligger per SPILLER, så da Rosenborg ble
// tømt, mistet 60 spillere som også står på Molde, Brann og atten andre
// modellerte baner sine verdier samtidig. Totalandelen deres hoppet til 2–19 %
// tomme uten at én eneste av dem var konvertert.
//
// Eksklusive spillere skiller det rent. Målt etter Rosenborg/Tromsø/Vålerenga:
// de tre står på 83/83, 53/53 og 66/66 tomme; de nitten andre står på 0 av
// mellom 24 og 87. Ingen gråsone.
const modellerteNå = [...eksklusivt.entries()]
  .filter(([, tall]) => tall.alle >= 20 && tall.tomme === 0)
  .map(([placeId]) => placeId);
const uNavngitt = modellerteNå.filter((placeId) => !MODELLERTE_ARVER.has(placeId));
check("arver uten én eneste tom styrkeliste står navngitt", uNavngitt.length === 0,
  uNavngitt.join(", "));
// Og motsatt vei, som er den som teller ned: har en oppført arv fått tomme
// lister blant sine egne, er den konvertert, og oppføringen er foreldet.
const foreldet = [...MODELLERTE_ARVER].filter((placeId) => {
  const tall = eksklusivt.get(placeId);
  return tall && tall.alle >= 20 && tall.tomme > 0;
});
check("ingen foreldede oppføringer i MODELLERTE_ARVER", foreldet.length === 0,
  `${foreldet.join(", ")} har fått tomme lister og skal ut av lista`);

// Og de tomme må være tomme AV EN GRUNN — bare der en kilde selv trakk grensen.
const kjenteSteder = new Set(Object.keys(KJENT_UDOKUMENTERT));
const tommeAndreSteder = utenStyrker.filter((player) =>
  !(player.sourcePlaceIds || []).some((placeId) => kjenteSteder.has(placeId)));
check("tomme styrkelister finnes bare der kilden sa fra",
  tommeAndreSteder.length === 0, tommeAndreSteder.map((p) => p.name).join(", "));
// Det korpusbrede tallet blir stående som en LØS bunnlinje, ikke som ratchet.
// Det kan bare synke etter hvert som katalogen vokser (se forklaringen over),
// så grensa er satt der den fanger et kollaps og ikke en fortynning.
// Remålt etter tolv legacy-konverteringer, og den er BEHOLDT der
// profil-unikheten ble lagt ned. Forskjellen er avgjørende: denne responderer
// monotont på feilen.
//
//   ærlig katalog            45,54 %
//   spredt malimport, 100    41,75 %
//   spredt malimport, 300    35,39 %
//
// Profil-unikheten gikk OPP av en malimport på 100 og kunne derfor ikke reddes
// av en terskel. Denne går ned, og da er remåling riktig svar. Grensa flyttes
// fra 0,50 til 0,43 — mellom den ærlige katalogen og bittet på 100 spillere.
//
// Nivået faller fordi konverteringene fjerner modellerte firetokens-sett og
// lar tynne, ekte lesninger stå igjen; åtte Levanger-navn bærer nøyaktig
// ["finishing"]. Det er ikke fortynning som skal slippe unna, det er ærlighet.
//
// Remålt igjen etter de siste konverteringene, og denne gangen fordi klaringen
// var nede i 0,19 poeng — 43,19 % mot en grense på 0,43. Endepunktene nå:
//
//   ærlig katalog        43,19 %
//   malimport 100        37,02 %
//   malimport 300        27,40 %
//   malimport 600        19,72 %
//
// Grensa settes til 0,40, midt mellom den ærlige katalogen og 100-bittet — 3,2
// poeng klaring hver vei i stedet for 0,19 på den ene siden. Monotoniteten er
// prøvd på nytt og holder: dette er fortsatt et mål som synker med feilen, og
// det er derfor det fortsatt kan ha en terskel.
check("styrkene er lest per spiller, ikke malt per posisjon", strengthShare > 0.40,
  `${strengthSets.size} unike styrke-sett av ${medStyrker.length} med styrker (${(strengthShare * 100).toFixed(1)} %)`);

// ---------------------------------------------------------------------------
// Og den samme målingen PER KLUBB — som er der feilen faktisk bor
// ---------------------------------------------------------------------------
// De to andelene over er korpusbrede, og det gjør dem uskarpe på en måte som
// ble tydelig med Strømsgodset: den kilden har 48 unike styrkesetninger for 144
// spillere (33 %), fordi den grupperer etter rolle. Å importere den senket
// korpusandelene under grensene — ikke fordi noen malgenererte noe, men fordi
// en stor klubb med tynn kilde kom inn.
//
// En korpusbred andel kan ikke skille «noen malgenererte en klubb» fra «en ny
// klubb har tynnere kilde enn snittet», og den blir svakere jo større katalogen
// blir. Å senke grensen for å få plass ville vært å gi opp det den vokter; å
// beholde den ville felt en ekte kildeimport.
//
// Målingen som faktisk treffer er per klubb: en malgenerert arv har spillere
// hvis styrker er BIT-IDENTISKE med posisjonsmalen. En ekte kilde treffer den
// aldri systematisk, uansett hvor grovt den grupperer.
const POSISJONSMAL = {
  GK: ["shot_stopping", "reflexes", "positioning", "command_of_area"],
  CB: ["duels", "heading", "positioning", "blocking", "defensive_reading"],
  RB: ["stamina", "crossing", "overlapping_runs", "defensive_reading"],
  LB: ["stamina", "crossing", "overlapping_runs", "defensive_reading"],
  DM: ["positioning", "tackling", "interceptions", "simple_passing"],
  CM: ["stamina", "simple_passing", "positioning", "tempo_control"],
  AM: ["vision", "final_pass", "first_touch", "combination_play"],
  LW: ["dribbling", "one_v_one", "acceleration", "wide_movement"],
  RW: ["dribbling", "one_v_one", "acceleration", "wide_movement"],
  ST: ["box_finishing", "movement", "positioning", "box_movement"]
};
const heritagePlaces = new Map();
for (const player of players) {
  for (const placeId of player.sourcePlaceIds || []) {
    if (!heritagePlaces.has(placeId)) heritagePlaces.set(placeId, []);
    heritagePlaces.get(placeId).push(player);
  }
}
const malandeler = [];
for (const [placeId, squad] of heritagePlaces) {
  if (squad.length < 20) continue;
  const påMal = squad.filter((player) => {
    const mal = POSISJONSMAL[player.naturalPositions?.[0]];
    return mal && JSON.stringify(player.strengths) === JSON.stringify(mal);
  }).length;
  malandeler.push([placeId, påMal / squad.length, påMal, squad.length]);
}
check("hver klubbarv er målt mot posisjonsmalen", malandeler.length >= 10,
  `${malandeler.length} arver med minst 20 spillere`);

// Ingen arv bærer lenger malgenerert gjeld. Tabellen sto med Tromsø (38 av 81)
// og Viking (22 av 70) da vakten ble skrevet; begge kildelistene kom, og begge
// falt til null. Den står tom med vilje — kommer en ny klubb inn på mal, er
// taket 10 % for alle, og det feller den.
const KJENT_MALGJELD = {};

for (const [placeId, andel, antall, total] of malandeler) {
  const tak = KJENT_MALGJELD[placeId] ?? 0.1;
  check(`${placeId} er ikke malgenerert`, andel < tak,
    `${antall} av ${total} står på posisjonsmalen (tak ${(tak * 100).toFixed(0)} %)`);
}

// Og epoken må faktisk slå ut: to spillere med samme posisjon og nivå, men ulik
// epoke, skal ikke være like.
check("epoken er en akse i katalogen", Object.keys(catalogue.eraProfiles).length >= 2,
  Object.keys(catalogue.eraProfiles).join(", "));

// ---------------------------------------------------------------------------
// Epoken må komme fra kilden, ikke fra en fallback
// ---------------------------------------------------------------------------
// Importene utledet `era` av årstall i kilden, med «historical» som fallback
// når kilden ikke oppga noe. Det er husets tilbakevendende feil i ny form: en
// fallback som ALLTID biter. 46 av 90 Aalesund-profiler har ikke ett eneste
// årstall, så arven havnet på 59 % `historical` — for en klubb som kom til
// øverste nivå første gang i 2002.
//
// TO VAKTER BLE SKREVET FØRST, OG INGEN AV DEM BET.
//
// Den ene målte epokespennet mellom klubbene, den andre korpusandelen.
// Bitetesten — datér alle udaterte Aalesund-profiler til `historical` igjen —
// gikk rett gjennom begge: spennet står stille fordi Sandefjord (1 %) og
// Viking (67 %) eier ytterpunktene uansett hva Aalesund gjør, og korpusandelen
// flyttet seg fra 42,7 % til 45,7 %, godt innenfor enhver rimelig grense.
//
// Én klubbs epokemiks er rett og slett ikke synlig i utdataene, og 59 % er
// dessuten helt riktig for Fredrikstad (ni seriegull 1938–1961). Det finnes
// ingen fordeling å måle mot.
//
// Det som KAN måles, er om påstanden er belagt. `eraSource` er samme mønster
// som `classSource` og `clubStatusSource`: `belagt` betyr at kilden daterte
// ham. En fallback som daterer det udaterte produserer `utledet`, og da
// beveger dette tallet seg — det er hele poenget med å skrive det ned.
{
  const kilder = players.map((player) => player.eraSource);
  check("hver spiller sier hvor epoken kom fra",
    kilder.every((value) => value === "belagt" || value === "utledet"),
    [...new Set(kilder)].join(", "));
  const belagt = kilder.filter((value) => value === "belagt").length / players.length;
  // RATCHET. Målt 38,7 % etter HamKam (29,3 % ved innføringen), og det er lavt
  // med vilje: 608 spillere står utenfor klubbkildene og har ingen registrert
  // datering i det hele tatt. Tallet skal opp for hver kilde som daterer det
  // den navngir, og aldri ned.
  //
  // Skeid løftet det fordi kilden daterer med ORD der den mangler tall — «en
  // tidlig landslagsgenerasjon», «en sterk norsk etterkrigsperiode». Det er
  // like mye kildens egen datering som et årstall, og teller derfor `belagt`.
  check("epoken er belagt for en reell andel", belagt > 0.38, `${(belagt * 100).toFixed(1)} %`);
  check("begge kildegradene er i bruk", new Set(kilder).size === 2);
}
const eraPairs = [];
for (const player of players) {
  const twin = players.find((other) =>
    other.id !== player.id && other.era !== player.era
    && other.classHeight === player.classHeight
    && other.naturalPositions[0] === player.naturalPositions[0]);
  if (twin) { eraPairs.push([player, twin]); if (eraPairs.length > 8) break; }
}
check("det finnes par å måle epoken på", eraPairs.length > 0, String(eraPairs.length));
for (const [a, b] of eraPairs) {
  check(`${a.name} (${a.era}) og ${b.name} (${b.era}) har ulik profil`,
    JSON.stringify(profiles[a.id].values) !== JSON.stringify(profiles[b.id].values));
}

// ---------------------------------------------------------------------------
// 5. KJERNEPRINSIPPET: klassehøyde avgjør ikke
// ---------------------------------------------------------------------------
// «Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.» Det må
// være MÅLBART, ikke bare skrevet i en kommentar.
let rolesWonByLowerClass = 0;
for (const role of roles) {
  const scored = players
    .map((player) => ({ player, fit: calculateRoleAttributeFit(profiles[player.id], role, catalogue) }))
    .filter((entry) => entry.fit !== null)
    .sort((a, b) => b.fit - a.fit);
  if (scored.length === 0) continue;
  const highest = Math.max(...scored.map((entry) => entry.player.classHeight));
  if (scored[0].player.classHeight < highest) rolesWonByLowerClass += 1;
}
check("i de fleste roller vinner ikke den med høyest klassehøyde",
  rolesWonByLowerClass / roles.length > 0.6, `${rolesWonByLowerClass} av ${roles.length}`);

// Og det samme gjennom hele kampmotoren, ikke bare i rollefiten.
const tactic = tactics[0];
let beatenByLower = 0;
for (const role of roles) {
  const position = role.validPositions[0];
  const scored = players
    .map((player) => ({ player, score: calculatePlayerMatchFit(player, { position }, role, tactic, roles).matchScore }))
    .sort((a, b) => b.score - a.score);
  const highest = Math.max(...scored.map((entry) => entry.player.classHeight));
  if (scored[0].player.classHeight < highest) beatenByLower += 1;
}
check("matchScore lar lavere klassehøyde vinne roller", beatenByLower > roles.length * 0.4,
  `${beatenByLower} av ${roles.length}`);

// ---------------------------------------------------------------------------
// 6. Klassebonusen er rollavhengig, og holder seg i sitt spenn
// ---------------------------------------------------------------------------
const bonuses = players.flatMap((player) => roles.map((role) => calculateClassBonus(player, role)));
check("klassebonusen holder seg under taket", størst(bonuses) <= CLASS_BONUS_MAX + 0.001,
  String(størst(bonuses)));
check("klassebonusen er aldri negativ", minst(bonuses) >= 0);
// Den skal SPRE seg. En bonus som ligger i samme punkt er ingen bonus.
const bonusSpread = størst(bonuses) - minst(bonuses);
check("klassebonusen sprer seg over spennet", bonusSpread > CLASS_BONUS_MAX * 0.5, String(bonusSpread.toFixed(2)));

// Samme spiller må få ULIK bonus i ulike roller — det er hele endringen fra
// det flate `(overall - 85) * 0.55`.
for (const player of players.slice(0, 30)) {
  const perRole = roles.map((role) => calculateClassBonus(player, role));
  check(`${player.name} får ulik klassebonus i ulike roller`,
    Math.max(...perRole) - Math.min(...perRole) > 1, String(Math.max(...perRole) - Math.min(...perRole)));
}

// Uten profil faller motoren tilbake på det gamle uttrykket — demoen skal ikke
// stå hvis dataene ikke er lastet.
const bare = { id: "x", classHeight: 90, attributes: null };
check("fallback uten profil bruker klassehøyden", Math.abs(calculateClassBonus(bare, roles[0]) - 2.75) < 0.001);

// ---------------------------------------------------------------------------
// 7. Ingen påstand kilden ikke bærer
// ---------------------------------------------------------------------------
// Hver eneste `belagt`-verdi må kunne spores tilbake til spillerens egne
// `strengths`. Finner motoren på en påstand om en ekte fotballspiller, faller
// dette.
for (const player of players) {
  const profile = profiles[player.id];
  const tokens = new Set((player.strengths || []).map((token) =>
    catalogue.byId.has(token) ? token : catalogue.aliases[token]).filter(Boolean));
  for (const [id, source] of Object.entries(profile.provenance)) {
    if (source !== "belagt") continue;
    check(`${player.name}: «${id}» er belagt fordi den står i strengths`, tokens.has(id), id);
  }
}

// Og gulvet er en proff spillers gulv — ingen ekte spiller får et ettall.
check("gulvet er satt over skalaens bunn", ATTRIBUTE_SCALE.floor > ATTRIBUTE_SCALE.min);

// ---------------------------------------------------------------------------
// 8. Rollekrav: ferdigheter skilles fra FORHOLD
// ---------------------------------------------------------------------------
// `role.requires` blander «spilleren må kunne dette» med «systemet må gi ham
// dette». Blandes de, blir en systemsvikt til en spillersvakhet.
let skillCount = 0;
let conditionCount = 0;
for (const role of roles) {
  const { skills, conditions } = splitRoleRequirements(catalogue, role);
  skillCount += skills.length;
  conditionCount += conditions.length;
  check(`rollen «${role.id}» har ferdighetskrav`, skills.length > 0);
}
check("forholdene holdes utenfor spillervurderingen", conditionCount > 20, String(conditionCount));
check("ingen rolle er bare forhold", roles.every((role) => splitRoleRequirements(catalogue, role).skills.length > 0));

// ---------------------------------------------------------------------------
// 9. Motoren er ren
// ---------------------------------------------------------------------------
const source = fs.readFileSync(new URL("../src/football-player-attributes.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("motoren er ren", !/document|localStorage|fetch\(|Date\.now|Math\.random/.test(source));
check("motoren hardkoder ingen spillere", !players.slice(0, 30).some((player) => source.includes(player.name)));
check("motoren hardkoder ingen ferdighetsliste",
  !catalogue.attributes.slice(0, 20).every((attribute) => source.includes(`"${attribute.id}"`)));

// Og app.js bruker den faktisk.
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app.js utleder ferdighetsprofilene", /derivePlayerAttributeIndex\(/.test(app));
check("app.js løser rollenes ferdighetskrav", /role\.requiredSkills = splitRoleRequirements\(/.test(app));
check("app.js viser en FERDIGHET i sirkelen, ikke en samlescore",
  /const signature = player\.attributes\?\.top\?\.\[0\]/.test(app));
check("app.js navngir ferdigheten under tallet", /profileSignature/.test(app));
check("app.js sorterer profilen etter spillerens egne toppferdigheter",
  /for \(const entry of profile\.top\.slice\(0, PROFILE_TOP_SKILLS\)\)/.test(app));
check("app.js regner ingen posisjonsvektet klasse", !/deriveClassForPosition/.test(app));
check("app.js viser ferdighetsprofilen", /renderPlayerAttributes\(/.test(app));

const sample = profiles["martin_odegaard"] || profiles[players[0].id];
console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  ferdigheter: catalogue.attributes.length,
  skalering: scaling,
  sprikMedian: medianRange,
  // De to endepunktene grensa på 0,848 skal ligge mellom. Skrives ut hver
  // kjøring nettopp fordi de før måtte måles for hånd og ble stående feil.
  // Gjelden auditen fant, gjort tellbar: arver der ingen står uten styrker.
  // Tallet skal SYNKE. Går det opp, er en ny arv importert med utfylte felt.
  perArvStyrkesett: { median: `${(medianArv * 100).toFixed(1)} %` },
  modellerteArver: {
    arver: MODELLERTE_ARVER.size,
    spillere: [...MODELLERTE_ARVER].reduce((sum, id) => sum + (perArv.get(id)?.alle || 0), 0),
    snittStyrker: MODELLERTE_ARVER.size === 0 ? "—"
      : ([...MODELLERTE_ARVER].reduce((sum, id) => {
        const t = perArv.get(id);
        return sum + (t ? t.styrker / t.alle : 0);
      }, 0) / MODELLERTE_ARVER.size).toFixed(2)
  },
  toppbøtter: {
    ærlig: `${(toStørste * 100).toFixed(2)} %`,
    flatGrunnlinje: `${(toStørsteFlat * 100).toFixed(2)} %`,
    baselineBidrag: `${((toStørsteFlat - toStørste) * 100).toFixed(2)} poeng (krav 1,50)`
  },
  profilUnikhet: {
    ærlig: `${(uniqueShare * 100).toFixed(2)} %`,
    flatGrunnlinje: `${(flatShare * 100).toFixed(2)} %`,
    merknad: "måling, ikke grense — se kommentaren i skriptet"
  },
  påTaket: `${(atCeiling * 100).toFixed(1)} %`,
  rollerVunnetAvLavereKlasse: `${rolesWonByLowerClass} av ${roles.length}`,
  kampRollerVunnetAvLavereKlasse: `${beatenByLower} av ${roles.length}`,
  eksempel: {
    spiller: sample.playerId,
    topp: sample.top.map((entry) => `${entry.name} ${entry.value} (${entry.source})`),
    manglerSomCB: (describePositionDemands(sample, "CB", catalogue)?.missing || [])
      .map((entry) => `${entry.name} ${entry.value}`),
    posisjonerMålt: POSITIONS.length
  }
}, null, 2));

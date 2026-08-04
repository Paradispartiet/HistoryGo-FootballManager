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
  scaling.classBand.low === Math.min(...players.map((p) => p.classHeight))
  && scaling.classBand.high === Math.max(...players.map((p) => p.classHeight)),
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
const allValues = players.flatMap((player) => Object.values(profiles[player.id].values));
const atCeiling = allValues.filter((value) => value === ATTRIBUTE_SCALE.max).length / allValues.length;
const distinct = new Set(allValues).size;
// Grensen er 4 %, ikke 5 %. Bitetesten som gjeninnfører klemmingen lander på
// nøyaktig 5,0 %, så en 5 %-grense ville bestått med null margin — og en vakt
// uten margin er en vakt som slipper gjennom neste variant av samme feil.
// Faktisk verdi nå er 2,8 %.
check("under 4 % av verdiene ligger på taket", atCeiling < 0.04, `${(atCeiling * 100).toFixed(1)} %`);
check("skalaen brukes bredt", distinct >= 12, `${distinct} ulike verdier`);
check("ingen verdi under proffgulvet", Math.min(...allValues) >= ATTRIBUTE_SCALE.floor, String(Math.min(...allValues)));
check("ingen verdi over taket", Math.max(...allValues) <= ATTRIBUTE_SCALE.max);
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
const topBucket = Math.max(...[...new Set(allValues)].map((value) =>
  allValues.filter((other) => other === value).length)) / allValues.length;
check("ingen enkeltverdi tar mer enn en femtedel", topBucket < 0.20, `${(topBucket * 100).toFixed(1)} %`);

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
const signatures = new Map();
for (const player of players) {
  const key = JSON.stringify(profiles[player.id].values);
  signatures.set(key, (signatures.get(key) || 0) + 1);
}
const uniqueShare = signatures.size / players.length;
const largestClone = Math.max(...signatures.values());
// Grensa er en RATCHET og flyttes opp når den er vunnet. Den sto på 0,55 da
// uniktheten var 58 %; etter at styrkene ble lest fra kildene for fem tidligere
// importer er den 75 %. En grense som blir stående lavt beskytter ikke det som
// er oppnådd — neste malgenererte import ville dratt den ned igjen uten at noe
// feilet. Målt: 668 unike av 892 (75 %), største klon 12.
//
// Sandefjord var testen på om det holder uten epokeaksen: klubben ble stiftet i
// 1998, så alle 68 navnene er `modern`, og epoken — som var det som reddet
// Brann — skiller ingenting her. Andelen falt likevel ikke (75 % både før og
// etter). Det er styrkene lest per spiller som bærer, ikke epoken.
check("profilene skiller stort sett spillere fra hverandre", uniqueShare > 0.70,
  `${signatures.size} unike av ${players.length} (${(uniqueShare * 100).toFixed(0)} %)`);
check("ingen stor gruppe spillere er bytte-identiske", largestClone <= 20, String(largestClone));

// Profilandelen alene er for treg til å fange EN klubb importert på mal. Målt:
// å reversere Brann til malstyrker koster bare 2 poeng (75 % → 73 %), fordi
// epoke og nivå fortsatt skiller spillerne. Den følsomme målingen ligger
// oppstrøms — i styrke-settene selv, som er nettopp det en malimport gjør likt.
// Målt: 429 unike styrke-sett av 892 (48 %), 44 % med én klubb reversert.
const strengthSets = new Map();
for (const player of players) {
  const key = JSON.stringify(player.strengths);
  strengthSets.set(key, (strengthSets.get(key) || 0) + 1);
}
const strengthShare = strengthSets.size / players.length;
check("styrkene er lest per spiller, ikke malt per posisjon", strengthShare > 0.46,
  `${strengthSets.size} unike styrke-sett av ${players.length} (${(strengthShare * 100).toFixed(0)} %)`);

// Og epoken må faktisk slå ut: to spillere med samme posisjon og nivå, men ulik
// epoke, skal ikke være like.
check("epoken er en akse i katalogen", Object.keys(catalogue.eraProfiles).length >= 2,
  Object.keys(catalogue.eraProfiles).join(", "));
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
check("klassebonusen holder seg under taket", Math.max(...bonuses) <= CLASS_BONUS_MAX + 0.001,
  String(Math.max(...bonuses)));
check("klassebonusen er aldri negativ", Math.min(...bonuses) >= 0);
// Den skal SPRE seg. En bonus som ligger i samme punkt er ingen bonus.
const bonusSpread = Math.max(...bonuses) - Math.min(...bonuses);
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

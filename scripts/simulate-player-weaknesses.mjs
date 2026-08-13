// Read-only simulering av Svake sider v1.
//
// Dette er modulen der et ratingspill lettest kunne sneket seg inn bakveien:
// «alle spillere har svakheter» er én setning unna «noen spillere er dårligere».
// Steg 5 og 6 er derfor de viktigste — de måler at svakhetene aldri rører
// `overall`, og at de er IDENTIFISERT ut av data som allerede fantes i
// spillerfila, ikke påstander motoren har funnet på.
import fs from "node:fs";
import {
  PLAYER_WEAKNESS_VERSION,
  WEAKNESS_PROGRESS_MAX,
  normalizeWeaknessCatalogue,
  normalizeWeaknessProgress,
  getWeaknessAttribute,
  identifyPlayerWeaknesses,
  getWeaknessProgress,
  applyWeaknessTraining,
  weeklyWeaknessGrowth,
  describeWeaknessProgress,
  summarizeLineupWeaknessWork,
  summarizePlayerWeaknesses
} from "../src/football-player-weaknesses.js";
import {
  normalizeIndividualTrainingCatalogue,
  getIndividualTrack,
  evaluateIndividualAssignment,
  resolveIndividualTrainingWeek
} from "../src/football-individual-training.js";
import { calculateMatchStrength } from "../src/football-matchday-engine.js";

let failures = 0;
function check(label, condition) {
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}
function stage(title) { console.log(`\n${title}`); }

const read = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8"));
// Ferdighetsvokabularet og posisjonskravene bor i football_attributes.json;
// svakhetsfila eier bare TRENINGEN av dem. Slås sammen her på nøyaktig samme
// måte som app.js gjør det, ellers måler vakten en katalog produksjonen aldri
// ser.
const rawWeaknesses = read("../data/football_player_weaknesses.json");
const rawAttributes = read("../data/football_attributes.json");
const rawCatalogue = {
  ...rawWeaknesses,
  attributes: rawAttributes.attributes,
  positionDemands: rawAttributes.positionDemands
};
const catalogue = normalizeWeaknessCatalogue(rawCatalogue);
const playersData = read("../data/football_players.json");
const players = Array.isArray(playersData) ? playersData : playersData.players;
const rolesData = read("../data/football_roles.json");
const roles = Array.isArray(rolesData) ? rolesData : rolesData.roles;
const individual = normalizeIndividualTrainingCatalogue(read("../data/football_individual_training.json"));

const weaknessesFor = (player) => identifyPlayerWeaknesses(player, { roles, catalogue });

// ---------------------------------------------------------------------------
stage("1. Katalogen");

check("versjonen er stemplet", PLAYER_WEAKNESS_VERSION === "player-weaknesses.v1");
check("datafilen har sitt eget skjema", rawCatalogue.schema === "historygo-football-manager.player-weaknesses.v1");
check("attributtene er lastet", catalogue.attributes.length >= 30);
check("hver har en lesbar svakhetsetikett på norsk", catalogue.attributes.every((a) => a.weaknessLabel.length > 5));
check("hver har en kategori", catalogue.attributes.every((a) => ["fysisk", "teknisk", "taktisk", "mental"].includes(a.category)));
check("hver har en vanskelighetsgrad", catalogue.attributes.every((a) => ["lett", "moderat", "hard"].includes(a.difficulty)));
check("alle posisjoner har krav", ["GK", "CB", "LB", "RB", "WB", "DM", "CM", "AM", "LW", "RW", "ST"].every((p) => (catalogue.positionDemands[p] || []).length >= 5));
check(
  "alle posisjonskrav peker på kjente attributter",
  Object.values(catalogue.positionDemands).every((tokens) => tokens.every((t) => Boolean(getWeaknessAttribute(catalogue, t))))
);
// Dekningen må være nåbar fra ekte spillerdata, ellers er den pynt. Veien går
// gjennom aliaslista, og den må gås BEGGE veier — det var den ikke før.
//
// Første utgave slo bare opp bakover: hvilke aliaser peker på dette tokenet, og
// har noen spiller ett av dem? Det holdt så lenge spillerdataene selv bar
// aliaser (`reading_game` sto lagret hos ni spillere). Da styrkene ble
// kanonisert, forsvant hele den veien, og `coveredBy: ["box_movement"]` ble
// «unåbar» — enda hver eneste spiller med `box_presence` dekker den.
//
// Et `coveredBy`-token kan altså selv VÆRE et alias. Vakten må derfor først
// kanonisere tokenet, akkurat som motoren gjør, og deretter spørre om noen
// spiller har den ferdigheten.
check(
  "alle coveredBy er nåbare fra ekte spillerstyrker",
  (() => {
    const aliases = rawAttributes.strengthAliases || {};
    const strengths = new Set(players.flatMap((p) => p.strengths).map((t) => aliases[t] || t));
    const reachable = (token) => strengths.has(aliases[token] || token);
    return catalogue.attributes.every((a) => a.coveredBy.every(reachable));
  })()
);
check("en manglende fil degraderer til gyldig, tom katalog", normalizeWeaknessCatalogue(null).attributes.length === 0);

// ---------------------------------------------------------------------------
stage("2. Bare posisjonsavklarte spillere får avledede svake sider");

// Svakhetsmotoren identifiserer jobbkrav fra naturalPositions/usablePositions.
// En ekte spiller uten kildebelagt posisjon gir derfor ikke motoren noe
// grunnlag å utlede en svakhet fra. Å tvinge fram tre svakheter i det tilfellet
// ville være samme type personpåstand som P2-importen eksplisitt avstår fra.
const hasResolvedPosition = (player) =>
  [...(player.naturalPositions || []), ...(player.usablePositions || [])]
    .some((position) => (catalogue.positionDemands[position] || []).length > 0);
const resolvedPlayers = players.filter(hasResolvedPosition);
const unresolvedPlayers = players.filter((player) => !hasResolvedPosition(player));
const resolvedCounts = resolvedPlayers.map((player) => weaknessesFor(player).length);
const unresolvedWithWeaknesses = unresolvedPlayers.filter((player) => weaknessesFor(player).length > 0);
const resolvedWithNone = resolvedPlayers.filter((player) => weaknessesFor(player).length === 0);
const resolvedThin = resolvedPlayers.filter((player) => weaknessesFor(player).length < 3);
const allCounts = players.map((player) => weaknessesFor(player).length);

console.log(`     posisjonsavklart: ${resolvedPlayers.length} · uløst: ${unresolvedPlayers.length}`);
console.log(`     avklarte svake sider: min ${Math.min(...resolvedCounts)} · maks ${Math.max(...resolvedCounts)} · uten ${resolvedWithNone.length}`);
if (resolvedThin.length > 0) console.log(`     avklarte med færre enn tre: ${resolvedThin.map((p) => p.name).join(", ")}`);

check("uløst posisjon gir ingen konstruerte svake sider", unresolvedWithWeaknesses.length === 0);
check("alle posisjonsavklarte har minst én svak side", resolvedWithNone.length === 0);
check("de aller fleste posisjonsavklarte har tre", resolvedCounts.filter((n) => n >= 3).length >= resolvedPlayers.length - 5);
check("ingen får flere enn grensen", allCounts.every((n) => n <= 3));

const labels = new Set(resolvedPlayers.flatMap((player) => weaknessesFor(player).map((w) => w.label)));
console.log(`     ${labels.size} ulike svakheter i bruk`);
check("svakhetene er varierte, ikke samme tre for alle", labels.size >= 15);
{
  // En svakhet som gjelder nesten alle posisjonsavklarte sier ingenting.
  const tally = new Map();
  resolvedPlayers.forEach((player) => weaknessesFor(player).forEach((w) => tally.set(w.label, (tally.get(w.label) || 0) + 1)));
  const commonest = Math.max(...tally.values());
  console.log(`     vanligste svakhet dekker ${commonest}/${resolvedPlayers.length} posisjonsavklarte spillere`);
  check(`ingen enkelt svakhet dekker mer enn halvparten (${commonest}/${resolvedPlayers.length})`, commonest <= resolvedPlayers.length / 2);
}

// ---------------------------------------------------------------------------
stage("3. Identifiseringen er riktig — og ikke oppfunnet");

check(
  "en svakhet er aldri noe han allerede har som styrke",
  players.every((player) => weaknessesFor(player).every((w) => !player.strengths.includes(w.attributeId)))
);
check(
  "en svakhet er aldri dekket av en beslektet styrke",
  players.every((player) => weaknessesFor(player).every((w) => {
    const attribute = getWeaknessAttribute(catalogue, w.attributeId);
    return !attribute.coveredBy.some((related) => player.strengths.includes(related));
  }))
);
check(
  "alle svakheter er krav han faktisk møter i sine egne posisjoner",
  players.every((player) => {
    const reach = new Set([...player.naturalPositions, ...player.usablePositions]);
    return weaknessesFor(player).every((w) => {
      const fromPosition = [...reach].some((p) => (catalogue.positionDemands[p] || []).includes(w.attributeId));
      const fromRole = roles.some((role) => role.validPositions.some((p) => reach.has(p)) && role.requires.includes(w.attributeId));
      return fromPosition || fromRole;
    });
  })
);
check(
  "deterministisk: samme spiller gir alltid samme liste",
  players.every((player) => JSON.stringify(weaknessesFor(player)) === JSON.stringify(weaknessesFor(player)))
);

// Den konkrete feilen fra første utgave: rangering over `poorFits` ga keeperen
// «løper lite uten ball» fordi spiss lå der. En svakhet i en posisjon han
// uansett ikke skal spille er støy, ikke en dør verdt å åpne.
{
  const keeper = players.find((player) => player.naturalPositions.includes("GK"));
  const keeperWeaknesses = weaknessesFor(keeper).map((w) => w.attributeId);
  console.log(`     ${keeper.name}: ${weaknessesFor(keeper).map((w) => w.label).join(" · ")}`);
  check(
    "en keeper får ikke markspiller-svakheter fra poorFits",
    !keeperWeaknesses.some((id) => ["off_ball_runs", "hold_up_play", "box_finishing", "late_runs", "overlapping_runs", "crossing"].includes(id))
  );
}
// … og den andre: overlappende tokens. En prolific spiss skal ikke meldes
// «setter ikke sjansene» fordi styrken hennes heter box_finishing.
{
  const scorer = players.find((player) => player.strengths.includes("box_finishing") && !player.strengths.includes("finishing"));
  if (scorer) {
    check(
      `${scorer.name} meldes ikke svak på avslutninger (har box_finishing)`,
      !weaknessesFor(scorer).some((w) => w.attributeId === "finishing")
    );
  }
}

// ---------------------------------------------------------------------------
stage("4. Trening: dører åpnes, klasse røres ikke");

const store0 = {};
const growthEasy = weeklyWeaknessGrowth(catalogue, "positioning");
const growthHard = weeklyWeaknessGrowth(catalogue, "acceleration");
console.log(`     vekst per uke: posisjonering ${growthEasy} · akselerasjon ${growthHard}`);
check("lette svakheter flytter seg raskere enn harde", growthEasy > growthHard);
check("selv en hard svakhet flytter seg litt", growthHard >= 1);
check("stab øker takten", weeklyWeaknessGrowth(catalogue, "positioning", 1.25) > growthEasy);

let store = applyWeaknessTraining(store0, [{ playerId: "p1", attributeId: "positioning", growth: growthEasy }]);
check("framgangen lagres", getWeaknessProgress(store, "p1", "positioning") === growthEasy);
for (let i = 0; i < 20; i += 1) {
  store = applyWeaknessTraining(store, [{ playerId: "p1", attributeId: "positioning", growth: growthEasy }]);
}
check("framgangen er kappet på 100", getWeaknessProgress(store, "p1", "positioning") === WEAKNESS_PROGRESS_MAX);
check("negativ vekst ignoreres", getWeaknessProgress(applyWeaknessTraining({ "x::y": 40 }, [{ playerId: "x", attributeId: "y", growth: -20 }]), "x", "y") === 40);
check("muterer ikke inn-staten", Object.keys(store0).length === 0);

{
  // Hvor mange uker tar det å løse en svak side? Skal koste noe, men ikke være
  // umulig — måles i stedet for å antas.
  const weeksFor = (attributeId) => {
    let value = 0;
    let weeks = 0;
    while (value < 50 && weeks < 60) { value += weeklyWeaknessGrowth(catalogue, attributeId); weeks += 1; }
    return weeks;
  };
  const easy = weeksFor("positioning");
  const hard = weeksFor("acceleration");
  console.log(`     uker til «merkbart bedre»: posisjonering ${easy} · akselerasjon ${hard}`);
  check(`en lett svakhet tar noen uker, ikke én (${easy})`, easy >= 4 && easy <= 10);
  check(`en hard svakhet tar mesteparten av en sesong (${hard})`, hard >= 12 && hard <= 40);
}

check("nivåene leses", describeWeaknessProgress(0).level === "urørt" && describeWeaknessProgress(100).level === "løst");
check("et løst arbeid minner deg på å bruke ham", /bruk ham der/i.test(describeWeaknessProgress(90).hint));
check("saneringen tåler skrot", Object.keys(normalizeWeaknessProgress({ tull: 5, "a::b": 30, "c::": 9 })).length === 1);

// ---------------------------------------------------------------------------
stage("5. Uttellingen kommer bare når du bruker ham der");

const learner = players.find((player) => weaknessesFor(player).length >= 1);
const target = weaknessesFor(learner)[0];
const roleThatDemands = roles.find((role) => role.requires.includes(target.attributeId));
const trained = applyWeaknessTraining({}, [{ playerId: learner.id, attributeId: target.attributeId, growth: 60 }]);

const usedLineup = summarizeLineupWeaknessWork(trained, [{ player: learner, role: roleThatDemands }], { roles, catalogue });
const idleRole = roles.find((role) => !role.requires.includes(target.attributeId));
const idleLineup = summarizeLineupWeaknessWork(trained, [{ player: learner, role: idleRole }], { roles, catalogue });
const untrainedLineup = summarizeLineupWeaknessWork({}, [{ player: learner, role: roleThatDemands }], { roles, catalogue });

check("trent + brukt i rollen som krever det gir bonus", usedLineup.bonus > 0);
check("… og sier hvem det gjaldt", usedLineup.openedDoors.some((door) => door.playerId === learner.id));
check("trent, men ikke brukt gir ingenting", idleLineup.bonus === 0);
check("… og det SIES, i stedet for å skjules", idleLineup.idleWork.length > 0 && /ubrukt/.test(idleLineup.headline));
check("utrent gir ingenting", untrainedLineup.bonus === 0);
check("bonusen er kappet", summarizeLineupWeaknessWork(trained, Array(20).fill({ player: learner, role: roleThatDemands }), { roles, catalogue }).bonus <= catalogue.biteReliefCap);

// Kampstyrken: liten, klampet, og aldri avgjørende alene.
const baseFit = { teamScore: 70, completeCount: 11, totalSlots: 11, metrics: {}, relationships: {}, historicalFormationFit: {}, badgeEffects: {} };
const without = calculateMatchStrength({ teamFit: baseFit, formation: { id: "f", matchEngineEffects: {} } });
const withBonus = calculateMatchStrength({ teamFit: baseFit, formation: { id: "f", matchEngineEffects: {} }, weaknessWorkBonus: 4 });
const withAbsurd = calculateMatchStrength({ teamFit: baseFit, formation: { id: "f", matchEngineEffects: {} }, weaknessWorkBonus: 99 });
check("bonusen når kampstyrken", withBonus.finalStrength > without.finalStrength);
check("bonusen er klampet til 4", withAbsurd.modifiers.weaknessWorkBonus === 4);
check("den er liten nok til aldri å avgjøre alene", withAbsurd.finalStrength - without.finalStrength <= 4);
check("den er stemplet i modifikatorene", Object.prototype.hasOwnProperty.call(withBonus.modifiers, "weaknessWorkBonus"));

// ---------------------------------------------------------------------------
stage("6. Dette er ikke et ratingspill");

const engine = fs.readFileSync(new URL("../src/football-player-weaknesses.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

check("motoren leser aldri overall", !/overall/.test(engine));
check("motoren rører aldri matchScore", !/matchScore/.test(engine));
check("datafilen har ingen tallverdier per spiller", !/"overall"/.test(JSON.stringify(rawCatalogue)));
check("katalogen nevner ingen spiller ved id", !players.some((player) => JSON.stringify(rawCatalogue).includes(`"${player.id}"`)));
check(
  "en svak side er aldri et fratrekk — bonusen kan bare være 0 eller positiv",
  [0, 1, 2, 3, 4, 99, -5].every((value) => calculateMatchStrength({ teamFit: baseFit, formation: { id: "f", matchEngineEffects: {} }, weaknessWorkBonus: value }).modifiers.weaknessWorkBonus >= 0)
);
check(
  "en spiller med høy overall har like gjerne svake sider som en med lav",
  (() => {
    const sorted = [...players].sort((a, b) => b.classHeight - a.classHeight);
    const top = sorted.slice(0, 10).filter((p) => weaknessesFor(p).length > 0).length;
    const bottom = sorted.slice(-10).filter((p) => weaknessesFor(p).length > 0).length;
    return top === bottom;
  })()
);

// ---------------------------------------------------------------------------
stage("7. Svakhetstrening som treningsspor");

const track = getIndividualTrack(individual, "weakness_work");
check("sporet finnes i katalogen", Boolean(track) && track.requires === "weakness");
check("sporet hever ingenting", track.familiarityGrowth === 0 && track.formDelta === 0 && track.rehabWeeks === 0);
check("sporet koster litt bein", track.loadDelta > 0);
check("risikoteksten sier at ubrukt arbeid er bortkastet", /bruke ham|kastet bort/i.test(track.riskText));

const condition = { playerId: learner.id, load: 10, form: 0, injury: null };
check(
  "kan ikke trene noe som ikke er hans svake side",
  evaluateIndividualAssignment({ track, player: learner, condition, attributeId: "shot_stopping", weaknesses: weaknessesFor(learner) }).valid === false
    || weaknessesFor(learner).some((w) => w.attributeId === "shot_stopping")
);
check(
  "må velge en svak side",
  evaluateIndividualAssignment({ track, player: learner, condition, weaknesses: weaknessesFor(learner) }).valid === false
);
check(
  "en av hans egne svake sider godtas",
  evaluateIndividualAssignment({ track, player: learner, condition, attributeId: target.attributeId, weaknesses: weaknessesFor(learner) }).valid === true
);

const resolved = resolveIndividualTrainingWeek({
  catalogue: individual,
  assignments: [{ playerId: learner.id, trackId: "weakness_work", attributeId: target.attributeId }],
  playersById: { [learner.id]: learner },
  conditionsById: { [learner.id]: condition },
  staffCategories: ["technical_coach"],
  weaknessesByPlayerId: { [learner.id]: weaknessesFor(learner) }
});
check("uka gir et mål, ikke et tall", resolved.weaknessTargets.length === 1 && !("growth" in resolved.weaknessTargets[0]));
check("målet bærer stabsfaktoren", resolved.weaknessTargets[0].staffFactor > 0);
check("rapporten forklarer at det åpner dører, ikke hever klassen", resolved.reports[0].explanation.some((line) => /åpner rollene/.test(line)));

// ---------------------------------------------------------------------------
stage("8. Wiret i appen");

const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

check("katalogen lastes fra datafil", /playerWeaknesses: "data\/football_player_weaknesses\.json"/.test(app));
check("ingen svakheter er hardkodet i app.js", !/weaknessLabel:|"hold_up_play"/.test(app));
check("framgangen persisteres i teamMerits", /weaknessProgress: normalizeWeaknessProgress/.test(app));
check("uttellingen mates inn i kampdagen", /weaknessWorkBonus: getLineupWeaknessWork/.test(app));
check("svakhetstrening anvendes fra ukesoppgjøret", /resolved\.weaknessTargets[\s\S]{0,400}applyWeaknessTraining/.test(app));
check("flata rendres fra render-løypa", /\n  renderPlayerWeaknesses\(teamFit\);/.test(app));
check("popupen finnes", /id="modalWeaknesses"/.test(html) && /data-modal-open="modalWeaknesses"/.test(html));
check("svake sider vises der du velger treningen", /individual-training-weaknesses/.test(app) && /individual-training-weaknesses/.test(fs.readFileSync(new URL("../style.css", import.meta.url), "utf8")));

// ---------------------------------------------------------------------------
const total = failures;
console.log(`\n${total === 0 ? "✓" : "✗"} Svake sider: ${total === 0 ? "alle sjekker bestått" : `${total} feil`}.`);
process.exit(total === 0 ? 0 : 1);

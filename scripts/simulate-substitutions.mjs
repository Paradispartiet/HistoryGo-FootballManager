// Innbytte v1 — simulering
//
// Kjører den rene motoren (`src/football-substitutions.js`) uten DOM og uten
// lagring, og sjekker at et innbytte oppfører seg som en beslutning: det har en
// pris, det kan treffe eller bomme, og det forklares.
//
// Det viktigste den vokter: **den som kommer inn måles på PLASSEN han går inn
// i**, ikke på klassen sin. En spiller med lavere `overall` som passer plassen
// bedre skal løfte laget.

import {
  MAX_SUBSTITUTIONS,
  applySubstitution,
  availableSubstitutions,
  createBenchSnapshot,
  evaluateSubstitution,
  playedPlayersFor,
  rankSubstitutionsForSlot,
  substitutionsRemaining
} from "../src/football-substitutions.js";
import { createLineupSnapshot, applyMatchPlayerStats, createMatchPlayerStats } from "../src/football-player-stats.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(readFileSync(join(root, relative), "utf8"));

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

// ---- Ekte data: spillere, roller, formasjoner, kampplaner ------------------
const playersData = readJson("data/football_players.json");
const rolesData = readJson("data/football_roles.json");
const formationsData = readJson("data/football_formations.json");
const tacticsData = readJson("data/football_tactics.json");

const players = playersData.players || playersData.items || [];
const roles = rolesData.roles || rolesData.items || [];
const formations = formationsData.formations || formationsData.items || [];
const tactics = tacticsData.tactics || tacticsData.items || [];

const formation = formations.find((entry) => (entry.slots || []).length === 11) || formations[0];
const tactic = tactics[0];

function roleForPosition(position) {
  const byPosition = {
    GK: "line_keeper", CB: "stopper", LB: "support_fullback", RB: "support_fullback",
    WB: "wingback", DM: "balancing_six", CM: "box_to_box", AM: "classic_ten",
    LW: "wide_dribbler", RW: "inverted_winger", ST: "box_striker"
  };
  return roles.find((role) => role.id === byPosition[position]) || roles[0];
}

// Bygg et teamFit-lignende objekt direkte: simuleringen tester
// innbyttemotoren, ikke lagfit-motoren.
function buildTeamFit(startXI) {
  return {
    assignments: formation.slots.map((slot, index) => {
      const player = startXI[index];
      const role = roleForPosition(slot.position);
      return {
        slot,
        player,
        role,
        fit: { matchScore: 60 + ((index * 7) % 25) },
        isComplete: true
      };
    })
  };
}

const startXI = players.slice(0, 11);
const benchPlayers = players.slice(11, 15);
const teamFit = buildTeamFit(startXI);

function baseSession(extra = {}) {
  return {
    events: [{}, {}, {}],
    timeline: [{}, {}],
    minuteLog: [],
    coachSnapshot: { coachUnderstanding: 55, formationFamiliarity: 55 },
    lineupSnapshot: createLineupSnapshot(teamFit),
    benchSnapshot: createBenchSnapshot({ benchPlayers, teamFit, tactic, roles }),
    substitutions: [],
    playedPlayers: [],
    ...extra
  };
}

console.log("Innbytte: benken kommer på banen\n");

// ---- 1) Benken finnes, og den er vurdert mot hver plass -------------------
console.log("1. Benken");
{
  const session = baseSession();
  check("startelleveren har elleve plasser", session.lineupSnapshot.length === 11);
  check("hver plass har en slotId", session.lineupSnapshot.every((entry) => entry.slotId));
  check("startelleveren har spilt fra avspark", session.lineupSnapshot.every((entry) => entry.onFrom === 0));
  check("benken har fire spillere", session.benchSnapshot.length === 4, `antall=${session.benchSnapshot.length}`);
  check(
    "hver benkespiller er vurdert mot alle elleve plassene",
    session.benchSnapshot.every((entry) => Object.keys(entry.fitBySlot).length === 11)
  );
  check("tre bytter er tillatt", substitutionsRemaining(session) === MAX_SUBSTITUTIONS && MAX_SUBSTITUTIONS === 3);

  const available = availableSubstitutions(session);
  check("alle fire er tilgjengelige før første bytte", available.bench.length === 4);
}

// ---- 2) Plassen avgjør, ikke klassen --------------------------------------
console.log("\n2. Plassen avgjør, ikke klassen");
{
  // To identiske benkespillere bortsett fra passform på plassen. Den ene passer
  // godt, den andre dårlig — begge går inn på SAMME plass.
  const session = baseSession();
  const slot = session.lineupSnapshot[9];
  const bench = session.benchSnapshot.map((entry, index) => ({
    ...entry,
    playerId: `benk${index}`,
    name: `Benk ${index}`,
    fitBySlot: { ...entry.fitBySlot, [slot.slotId]: { matchScore: index === 0 ? 88 : 44, positionFit: 80, roleFit: 70, misusePenalty: index === 0 ? 0 : 30 } }
  }));
  const withBench = { ...session, benchSnapshot: bench, lineupSnapshot: session.lineupSnapshot.map((e) => e.slotId === slot.slotId ? { ...e, matchScore: 62 } : e) };

  const good = evaluateSubstitution({ session: withBench, outPlayerId: slot.playerId, inPlayerId: "benk0", minute: 60 });
  const bad = evaluateSubstitution({ session: withBench, outPlayerId: slot.playerId, inPlayerId: "benk1", minute: 60 });

  check("et bytte som løfter passformen gir positiv forbedring", good.improvement > 0, `improvement=${good.improvement}`);
  check("et bytte som senker passformen gir negativ forbedring", bad.improvement < 0, `improvement=${bad.improvement}`);
  check("det gode byttet slår det dårlige", good.improvement > bad.improvement);
  check("det gode byttet løfter momentum", good.effects.momentumDelta > 0);
  check("det dårlige byttet koster momentum", bad.effects.momentumDelta < 0);
  check("feilbruk forklares som ditt valg", bad.reasons.some((line) => /Feilbruk/.test(line)), bad.reasons.join(" | "));
  check("den som kommer inn overtar rollen til den som går av", good.roleName === slot.roleName);
}

// ---- 3) Slitasje: friske bein er verdt noe sent i kampen ------------------
console.log("\n3. Slitasje");
{
  const session = baseSession();
  const out = session.lineupSnapshot[7];
  const inId = session.benchSnapshot[0].playerId;
  const tidlig = evaluateSubstitution({ session, outPlayerId: out.playerId, inPlayerId: inId, minute: 30 });
  const sent = evaluateSubstitution({ session, outPlayerId: out.playerId, inPlayerId: inId, minute: 85 });

  check("ingen slitasjegevinst før 55. minutt", tidlig.tiredness === 0, `tiredness=${tidlig.tiredness}`);
  check("full slitasjegevinst sent i kampen", sent.tiredness > 0.8, `tiredness=${sent.tiredness}`);
  check("et sent bytte koster mer klarhet", sent.effects.riskDelta > tidlig.effects.riskDelta);
  check("sent bytte forklares", sent.reasons.some((line) => /Sent bytte/.test(line)));
}

// ---- 4) Kampbildet: svarer byttet på situasjonen? -------------------------
console.log("\n4. Kampbildet");
{
  const session = baseSession();
  const striker = session.lineupSnapshot.find((entry) => entry.position === "ST") || session.lineupSnapshot[10];
  const defender = session.lineupSnapshot.find((entry) => entry.position === "CB") || session.lineupSnapshot[1];
  const inId = session.benchSnapshot[0].playerId;

  const angrepBak = evaluateSubstitution({ session, outPlayerId: striker.playerId, inPlayerId: inId, minute: 70, gameState: "behind" });
  const forsvarBak = evaluateSubstitution({ session, outPlayerId: defender.playerId, inPlayerId: inId, minute: 70, gameState: "behind" });
  check("offensivt bytte belønnes når du jager", angrepBak.situation > 0, `situation=${angrepBak.situation}`);
  check("defensivt bytte belønnes ikke når du jager", forsvarBak.situation < 0, `situation=${forsvarBak.situation}`);
  check("lesningen forklares", angrepBak.reasons.some((line) => /jager/.test(line)));

  const forsvarLed = evaluateSubstitution({ session, outPlayerId: defender.playerId, inPlayerId: inId, minute: 70, gameState: "leading" });
  check("defensivt bytte belønnes når du leder", forsvarLed.situation > 0, `situation=${forsvarLed.situation}`);

  const jevnt = evaluateSubstitution({ session, outPlayerId: striker.playerId, inPlayerId: inId, minute: 70, gameState: "level" });
  check("jevnt kampbilde gir ingen situasjonsbonus", jevnt.situation === 0);
}

// ---- 5) Gjennomføring: elleveren endrer seg faktisk ------------------------
console.log("\n5. Gjennomføring");
{
  const session = baseSession();
  const out = session.lineupSnapshot[9];
  const incoming = session.benchSnapshot[0];
  const after = applySubstitution(session, { outPlayerId: out.playerId, inPlayerId: incoming.playerId, minute: 62 });

  check("sesjonen er en ny sesjon (ingen mutasjon)", after !== session);
  check("forrige sesjon er urørt", session.substitutions.length === 0 && session.lineupSnapshot[9].playerId === out.playerId);
  check("elleveren har fortsatt elleve spillere", after.lineupSnapshot.length === 11);
  check("den som gikk av står ikke lenger på banen", !after.lineupSnapshot.some((entry) => entry.playerId === out.playerId));
  check("den som kom inn står på banen", after.lineupSnapshot.some((entry) => entry.playerId === incoming.playerId));

  const replaced = after.lineupSnapshot.find((entry) => entry.playerId === incoming.playerId);
  check("innbytteren overtok plassen", replaced.slotId === out.slotId);
  check("innbytteren overtok posisjonen", replaced.position === out.position);
  check("innbytteren overtok rollen", replaced.roleId === out.roleId);
  check("innbytteren spilte fra byttetidspunktet", replaced.onFrom === 62);
  check("innbytteren er merket som innbytter", replaced.cameOnAsSub === true);
  check("byttet er registrert", after.substitutions.length === 1);
  check("byttet bærer effekter i samme form som grepene", ["eventScoreDelta", "xgDeltaFor", "xgDeltaAgainst", "momentumDelta", "riskDelta", "tacticalClarityDelta"].every((key) => key in after.substitutions[0].effects));
  check("to bytter igjen", substitutionsRemaining(after) === 2);

  const available = availableSubstitutions(after);
  check("den brukte benkespilleren kan ikke komme inn igjen", !available.bench.some((entry) => entry.playerId === incoming.playerId));
  check("tre står igjen på benken", available.bench.length === 3);
}

// ---- 6) Kvoten holder ------------------------------------------------------
console.log("\n6. Kvoten");
{
  let session = baseSession();
  for (let i = 0; i < 4; i += 1) {
    const out = session.lineupSnapshot[i];
    const bench = availableSubstitutions(session).bench[0];
    if (!bench) break;
    session = applySubstitution(session, { outPlayerId: out.playerId, inPlayerId: bench.playerId, minute: 50 + i * 8 });
  }
  check("høyst tre bytter gjennomføres", session.substitutions.length === 3, `antall=${session.substitutions.length}`);
  check("ingen bytter igjen", substitutionsRemaining(session) === 0);

  const bench = session.benchSnapshot.find((entry) => !session.substitutions.some((sub) => sub.inPlayerId === entry.playerId));
  const blocked = applySubstitution(session, { outPlayerId: session.lineupSnapshot[10].playerId, inPlayerId: bench.playerId, minute: 88 });
  check("et fjerde bytte avvises", blocked === session);
}

// ---- 7) Ugyldige bytter avvises trygt --------------------------------------
console.log("\n7. Ugyldige bytter");
{
  const session = baseSession();
  check("ukjent spiller ut gir ingen vurdering", evaluateSubstitution({ session, outPlayerId: "finnes_ikke", inPlayerId: session.benchSnapshot[0].playerId }) === null);
  check("ukjent spiller inn gir ingen vurdering", evaluateSubstitution({ session, outPlayerId: session.lineupSnapshot[0].playerId, inPlayerId: "finnes_ikke" }) === null);
  check("ugyldig bytte endrer ikke sesjonen", applySubstitution(session, { outPlayerId: "x", inPlayerId: "y", minute: 60 }) === session);
  check("tom sesjon krasjer ikke", applySubstitution(null, { outPlayerId: "a", inPlayerId: "b" }) === null);
}

// ---- 8) Spilletid: innbytteren får kampen sin ------------------------------
console.log("\n8. Spilletid");
{
  const session = baseSession();
  const out = session.lineupSnapshot[9];
  const incoming = session.benchSnapshot[0];
  const after = applySubstitution(session, { outPlayerId: out.playerId, inPlayerId: incoming.playerId, minute: 60 });

  const played = playedPlayersFor(after, 90);
  check("tolv spillere var på banen", played.length === 12, `antall=${played.length}`);
  const outRow = played.find((entry) => entry.playerId === out.playerId);
  const inRow = played.find((entry) => entry.playerId === incoming.playerId);
  check("den som gikk av spilte 60 minutter", outRow.minutes === 60, `minutter=${outRow.minutes}`);
  check("innbytteren spilte 30 minutter", inRow.minutes === 30, `minutter=${inRow.minutes}`);
  check("en som spilte hele kampen står med 90", played.find((entry) => entry.playerId === session.lineupSnapshot[0].playerId).minutes === 90);

  // Uten bytter skal alle stå med 90 — ingen spesialtilfelle.
  const utenBytter = playedPlayersFor(baseSession(), 90);
  check("uten bytter spilte elleve spillere 90 minutter", utenBytter.length === 11 && utenBytter.every((entry) => entry.minutes === 90));

  // Statistikken skal telle innbytteren som en kamp, med minuttene sine.
  const stats = createMatchPlayerStats(played, []);
  const rows = applyMatchPlayerStats([], stats);
  check("innbytteren står med én kamp", rows.find((row) => row.playerId === incoming.playerId).appearances === 1);
  check("innbytteren står med 30 minutter", rows.find((row) => row.playerId === incoming.playerId).minutes === 30);
  check("den som gikk av står med sine 60", rows.find((row) => row.playerId === out.playerId).minutes === 60);
}

// ---- 9) Rådgivning: hvem er det beste byttet her? -------------------------
console.log("\n9. Rangering");
{
  const session = baseSession();
  const out = session.lineupSnapshot[9];
  const ranked = rankSubstitutionsForSlot({ session, outPlayerId: out.playerId, minute: 70, gameState: "behind" });
  check("alle fire benkespillere vurderes", ranked.length === 4);
  check("rangeringen er sortert på forbedring", ranked.every((entry, i) => i === 0 || ranked[i - 1].improvement >= entry.improvement));
  check("hvert alternativ forklarer seg", ranked.every((entry) => entry.reasons.length > 0 && entry.summary));
}

console.log(`\n${passed}/${passed + failed} sjekker bestått.`);
if (failed > 0) {
  console.error(`\n✗ Innbytte feilet: ${failed} sjekk(er).`);
  process.exit(1);
}
console.log("\n✓ Innbytte OK.");
process.exit(0);

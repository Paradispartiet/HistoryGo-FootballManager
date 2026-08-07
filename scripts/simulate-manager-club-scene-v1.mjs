import { createManagerClubSceneModel } from "../src/ui/manager-club-presentation.js";

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

const stableClub = {
  boardTrust: 58,
  playerMorale: 62,
  tacticalClarity: 66,
  trainingCulture: 54,
  mediaPressure: 42
};

console.log("\n1. Ny klubb med ufullstendig stall");
const newClub = createManagerClubSceneModel({
  clubName: "Bislett FK",
  week: 1,
  phaseLabel: "Analyse",
  boardExpectation: "Bygg en spillbar tropp.",
  clubState: stableClub,
  roster: { unlockedCount: 7, requiredCount: 15 },
  staffIdentity: { staffScore: 0, identityLabel: "Uetablert stab", gaps: ["Mangler assistenttrener."] },
  hiredStaffCount: 0,
  unlockedPlayersCount: 7,
  unlockedPlacesCount: 2
});
check("klubb og uke er lesbare", newClub.clubName === "Bislett FK" && newClub.week === 1);
check("seks varige klubbfunksjoner bygges", newClub.statuses.length === 6);
check("ufullstendig stall peker til Speiding", newClub.priority.target === "historygo" && /spillergrunnlaget/i.test(newClub.priority.title));
check("speiderstatus viser manglende stall", newClub.statuses.find((item) => item.id === "scouting")?.tone === "attention");
check("fasiliteter er en egen status", newClub.statuses.find((item) => item.id === "facilities")?.target === "facilities");
check("marked er en egen status", newClub.statuses.find((item) => item.id === "market")?.target === "market");
check("ny klubb er ikke operativt komplett", newClub.complete === false);

console.log("\n2. Kampklar stall med smalt støtteapparat");
const staffGap = createManagerClubSceneModel({
  clubName: "Bislett FK",
  week: 3,
  phaseLabel: "Trening",
  clubState: stableClub,
  roster: { unlockedCount: 18, requiredCount: 15 },
  staffIdentity: {
    staffScore: 34,
    identityLabel: "Smalt støtteapparat",
    strengths: ["Assistenten gir bedre taktiske signaler."],
    gaps: ["Mangler fysio/belastningskompetanse."]
  },
  hiredStaffCount: 2,
  unlockedStaffCount: 5,
  unlockedPlayersCount: 18,
  unlockedPlacesCount: 6,
  unlockedExpertiseCount: 2
});
check("smal stab blir lokal hovedoppgave", staffGap.priority.target === "admin");
check("første stabs-gap forklares", /fysio/i.test(staffGap.priority.detail));
check("stabstatus bruker eksisterende identitet", staffGap.statuses.find((item) => item.id === "staff")?.value === "Smalt støtteapparat");
check("speiding blir positiv når stallen er komplett", staffGap.statuses.find((item) => item.id === "scouting")?.tone === "positive");
check("fasilitetslesningen bruker eksisterende stab og treningskultur", staffGap.facilities.detail.includes("2 i stab") && staffGap.facilities.detail.includes("treningskultur 54"));

console.log("\n3. Stab og ekspertise klare, ingen aktiv progresjon");
const development = createManagerClubSceneModel({
  clubName: "Bislett FK",
  week: 6,
  clubState: { ...stableClub, boardTrust: 68 },
  roster: { unlockedCount: 20, requiredCount: 15 },
  staffIdentity: {
    staffScore: 76,
    identityLabel: "Sterkt trenerteam",
    strengths: ["Trenerteamet har faglig tyngde innen press."],
    gaps: []
  },
  hiredStaffCount: 6,
  unlockedStaffCount: 7,
  unlockedPlayersCount: 20,
  unlockedPlacesCount: 8,
  unlockedExpertiseCount: 5,
  activeProgramCount: 0,
  earnedBadgeCount: 1
});
check("ledig utviklingskapasitet peker til Klubbutvikling", development.priority.target === "progression");
check("styretillit får positiv tone", development.statuses.find((item) => item.id === "board")?.tone === "positive");
check("utviklingsstatus viser badges", development.statuses.find((item) => item.id === "development")?.value === "1 badge");
check("støtteapparatet er positivt", development.staff.tone === "positive" && development.staff.score === 76);

console.log("\n4. Lav styretillit overstyrer andre klubbprosjekter");
const lowTrust = createManagerClubSceneModel({
  clubState: { ...stableClub, boardTrust: 28 },
  roster: { unlockedCount: 5, requiredCount: 15 },
  staffIdentity: { staffScore: 0, identityLabel: "Uetablert stab", gaps: ["Mangler stab."] },
  hiredStaffCount: 0
});
check("lav tillit prioriteres først", lowTrust.priority.target === "details" && lowTrust.priority.tone === "negative");
check("styrekortet viser rå tillit uten å lage ny score", lowTrust.statuses.find((item) => item.id === "board")?.value === "28/100");

console.log("\n5. Etablert klubb");
const mature = createManagerClubSceneModel({
  clubName: "Rosenborg",
  week: 10,
  phaseLabel: "Kampforberedelse",
  boardExpectation: "Hold retningen og utfordre i toppen.",
  clubState: { boardTrust: 78, playerMorale: 74, tacticalClarity: 72, trainingCulture: 70, mediaPressure: 31 },
  roster: { unlockedCount: 24, requiredCount: 15 },
  staffIdentity: { staffScore: 84, identityLabel: "Sterkt trenerteam", strengths: ["Staben dekker alle hovedområder."], gaps: [] },
  hiredStaffCount: 6,
  unlockedStaffCount: 8,
  unlockedPlayersCount: 24,
  unlockedPlacesCount: 12,
  unlockedExpertiseCount: 8,
  activeProgramCount: 2,
  earnedBadgeCount: 4,
  activeClassificationCount: 1
});
check("etablert klubb følger retningen", mature.priority.target === "details" && mature.priority.tone === "positive");
check("etablert klubb stemples komplett", mature.complete === true);
check("fem klubbpulsverdier bygges", mature.pulse.length === 5);
check("medietrykk leses omvendt", mature.pulse.find((item) => item.id === "media")?.tone === "positive");
check("utviklingsstatus viser aktive program", mature.statuses.find((item) => item.id === "development")?.value === "2 aktive");
check("sterk klubb gir sterk fasilitetslesning", mature.facilities.label === "Sterk");
check("lavt press og sterke klubbverdier gir god markedstemperatur", mature.market.label === "God temperatur" && mature.market.tone === "positive");
check("alle statusmål peker til eksisterende flater", mature.statuses.every((item) => ["details", "historygo", "admin", "progression", "facilities", "market"].includes(item.target)));

console.log(`\nManager Club Scene v1: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

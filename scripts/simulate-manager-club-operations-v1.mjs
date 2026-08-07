import { createManagerClubSceneModel } from "../src/ui/manager-club-presentation.js";

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

function model(overrides = {}) {
  return createManagerClubSceneModel({
    clubName: "Bislett FK",
    week: 8,
    clubState: {
      boardTrust: 72,
      playerMorale: 68,
      tacticalClarity: 64,
      trainingCulture: 70,
      mediaPressure: 32,
      ...(overrides.clubState || {})
    },
    roster: { unlockedCount: 20, requiredCount: 15 },
    staffIdentity: {
      staffScore: 78,
      identityLabel: "Bredt støtteapparat",
      strengths: ["Staben dekker hovedområdene."],
      gaps: []
    },
    hiredStaffCount: 5,
    unlockedStaffCount: 6,
    unlockedPlayersCount: 20,
    unlockedPlacesCount: 9,
    unlockedExpertiseCount: 5,
    activeProgramCount: 1,
    earnedBadgeCount: 2,
    activeClassificationCount: 1,
    ...overrides,
    clubState: {
      boardTrust: 72,
      playerMorale: 68,
      tacticalClarity: 64,
      trainingCulture: 70,
      mediaPressure: 32,
      ...(overrides.clubState || {})
    }
  });
}

console.log("\nManager Club Operations v1 simulation");

const healthy = model();
check("seks klubbområder finnes", healthy.statuses.length === 6, String(healthy.statuses.length));
check("fasiliteter peker til eksisterende flate", healthy.statuses.find((item) => item.id === "facilities")?.target === "facilities");
check("marked peker til eksisterende flate", healthy.statuses.find((item) => item.id === "market")?.target === "market");
check("sterkt anleggsgrunnlag leses som sterkt", healthy.facilities.label === "Sterk", healthy.facilities.label);
check("god klubbtemperatur leses positivt", healthy.market.tone === "positive", healthy.market.label);
check("fasilitetslesningen bruker antall spillere", healthy.facilities.detail.includes("20 spillere"));
check("fasilitetslesningen bruker engasjert stab", healthy.facilities.detail.includes("5 i stab"));
check("fasilitetslesningen bruker treningskultur", healthy.facilities.detail.includes("treningskultur 70"));
check("marked leser faktisk medietrykk", healthy.market.detail.includes("Medietrykk") || healthy.market.detail.includes("medietrykk"));
check("ingen ekstra klubbpuls oppfinnes", healthy.pulse.length === 5);

const pressured = model({ clubState: { mediaPressure: 81, playerMorale: 39, boardTrust: 44, trainingCulture: 52 } });
check("høyt medietrykk gir negativ markedslesning", pressured.market.tone === "negative", pressured.market.label);
check("markedslesningen beholder rå medieverdi", pressured.market.detail.includes("81"));
check("fasiliteter forblir lesesignal også under press", ["Sterk", "Solid", "Grunnleggende", "Ikke lest"].includes(pressured.facilities.label));

const bare = model({
  clubState: { boardTrust: 50, playerMorale: 50, tacticalClarity: 50, trainingCulture: 0, mediaPressure: 0 },
  roster: { unlockedCount: 0, requiredCount: 15 },
  staffIdentity: { staffScore: 0, identityLabel: "Uetablert stab", gaps: ["Mangler stab."] },
  hiredStaffCount: 0,
  unlockedStaffCount: 0,
  unlockedPlayersCount: 0,
  unlockedPlacesCount: 0,
  unlockedExpertiseCount: 0,
  activeProgramCount: 0,
  earnedBadgeCount: 0,
  activeClassificationCount: 0
});
check("tom klubb har fortsatt fasilitetsinngang", bare.statuses.some((item) => item.target === "facilities"));
check("tom klubb har fortsatt markedsinngang", bare.statuses.some((item) => item.target === "market"));
check("manglende stall prioriteres fortsatt foran read-only klubbflater", bare.priority.target === "historygo");

console.log(`\nManager Club Operations v1: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

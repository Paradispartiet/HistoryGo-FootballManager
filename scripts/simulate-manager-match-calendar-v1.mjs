import { createManagerMatchCalendarContext } from "../src/ui/manager-match-calendar-v1.js";

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Match Calendar v1 simulation");

const friday = createManagerMatchCalendarContext({
  week: 4,
  dayIndex: 5,
  day: "Fredag",
  time: "10:00",
  eventId: "match-prep",
  eventTitle: "Kampforberedelse",
  target: "tactics",
  source: "calendar"
}, { week: 4, phase: "match_prep" });
check("fredag beholder kalenderuke", friday?.week === 4);
check("fredag beholder dag og arbeidsflate", friday?.dayIndex === 5 && friday?.day === "Fredag" && friday?.target === "tactics");
check("fredag beholder hendelsen", friday?.eventId === "match-prep" && friday?.eventTitle === "Kampforberedelse");
check("fredag er eksplisitt kalenderkontekst", friday?.source === "calendar");

const saturday = createManagerMatchCalendarContext({
  week: 4,
  dayIndex: 6,
  day: "Lørdag",
  time: "15:00",
  eventId: "matchday",
  eventTitle: "Kamp mot Viking",
  target: "kamp",
  source: "calendar"
}, { week: 4, phase: "matchday" });
check("lørdag beholder kampdag", saturday?.dayIndex === 6 && saturday?.day === "Lørdag");
check("lørdag beholder kampens klokkeslett", saturday?.time === "15:00");
check("lørdag peker til eksisterende Kamp", saturday?.target === "kamp");
check("lørdag beholder motstanderhendelsen", saturday?.eventTitle === "Kamp mot Viking");

const directPrep = createManagerMatchCalendarContext({ target: "tactics" }, { week: 2, phase: "match_prep" });
check("direkte kampforberedelse faller tilbake til fredag", directPrep?.week === 2 && directPrep?.dayIndex === 5 && directPrep?.day === "Fredag");
check("direkte kampforberedelse lager ingen kalenderkilde", directPrep?.source === "direct");

const directMatch = createManagerMatchCalendarContext({ target: "kamp" }, { week: 2, phase: "matchday" });
check("direkte kamp faller tilbake til lørdag", directMatch?.week === 2 && directMatch?.dayIndex === 6 && directMatch?.day === "Lørdag");
check("uvedkommende arbeidsflater avvises", createManagerMatchCalendarContext({ target: "trening" }, { week: 2 }) === null);

console.log(`\nManager Match Calendar v1 simulation: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

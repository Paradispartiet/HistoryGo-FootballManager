import {
  createManagerWeekCalendar,
  currentManagerDayIndex,
  MANAGER_WEEK_PHASE_ORDER
} from "../src/football-manager-calendar.js";

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });

const expectedDays = {
  analysis: 1,
  inbox: 2,
  training: 3,
  match_prep: 5,
  matchday: 6,
  review: 7
};

for (const phase of MANAGER_WEEK_PHASE_ORDER) {
  check(`${phase} lander på riktig ukedag`, currentManagerDayIndex({ phase }) === expectedDays[phase], String(currentManagerDayIndex({ phase })));
}

const week = createManagerWeekCalendar({
  clubWeekState: { week: 4, phase: "training" },
  opponent: { name: "Viking", homeAway: "home", round: 4 },
  trainingSelected: true,
  inboxHandled: true,
  lineupReady: true
});

check("kalenderen har syv dager", week.days.length === 7, String(week.days.length));
check("uke og nå-dag kommer fra Club Week", week.week === 4 && week.summary === "Uke 4 · Onsdag", week.summary);
check("kun én dag er I dag", week.days.filter((day) => day.isCurrent).length === 1);
check("mandag og tirsdag er ferdige i treningsfasen", week.days[0].status === "completed" && week.days[1].status === "completed");
check("onsdag er nåværende treningsdag", week.days[2].status === "current" && week.days[2].phase === "training");
check("torsdag er fortsatt del av eksisterende treningsfase", week.days[3].phase === "training");
check("fredag, lørdag og søndag kommer senere", week.days.slice(4).every((day) => day.status === "upcoming"));
check("kampen plasseres på lørdag", week.days[5].title === "Kamp mot Viking", week.days[5].title);
check("runde og hjemme/borte vises", /Hjemmekamp · runde 4/.test(week.days[5].detail), week.days[5].detail);
check("ingen dag inneholder handling eller target", week.days.every((day) => !Object.hasOwn(day, "action") && !Object.hasOwn(day, "target")));

const review = createManagerWeekCalendar({
  clubWeekState: { week: 4, phase: "review" },
  lastMatch: { score: { for: 2, against: 1 } }
});
check("etterkamp ligger på søndag", review.currentDay.day === "Søndag");
check("resultatet vises i etterkampen", review.days[6].detail.includes("2–1"), review.days[6].detail);

const nextWeek = createManagerWeekCalendar({ clubWeekState: { week: 5, phase: "analysis" } });
check("ny uke starter på mandag", nextWeek.summary === "Uke 5 · Mandag", nextWeek.summary);
check("ny uke har ingen ferdige dager", nextWeek.days.every((day) => day.status !== "completed"));

const failed = checks.filter((entry) => !entry.ok);
checks.forEach((entry) => console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` — ${entry.detail}` : ""}`));
if (failed.length) {
  console.error(`\n✗ Kalender og manageruke v1 feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Kalender og manageruke v1: ${checks.length}/${checks.length}`);

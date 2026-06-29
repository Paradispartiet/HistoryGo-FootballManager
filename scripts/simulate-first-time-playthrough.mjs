#!/usr/bin/env node
import { computeNextActions } from "../src/football-next-action.js";
import { buildMiniSeasonSchedule } from "../src/football-mini-season.js";
import { HISTORICAL_OPPONENT_PROFILES } from "../src/football-historical-opponent-profiles.js";

const failures = [];
const check = (label, ok) => { if (!ok) failures.push(label); };
const base = {
  hasSession: false,
  opponentName: null,
  roster: { enoughUnlocked: true, enoughBench: true },
  lineup: { totalSlots: 11, emptyCount: 11, firstEmptySlotId: "GK", misused: null, duplicate: null },
  clubWeekGate: { isBlocked: false, reason: "" },
  hasTrainingChoice: false,
  matchdayReady: false,
  unreadThreads: 1,
  hasUnseenReport: false,
  miniSeasonActive: false,
  clubWeek: { week: 1, phase: "analysis", phaseLabel: "Analyse" },
  firstTime: { active: true, started: false, completed: false, hasFormation: true, hasRoles: false, hasReadInbox: false, hasPlayedFirstMatch: false, hasSeenReport: false }
};
const primary = (ctx) => computeNextActions(ctx)[0]?.title;

check("tom first-time state gir Start prøveperiode", primary(base) === "Start femkampers prøveperiode");
check("valgt formasjon men ikke 11 spillere gir Fullfør startellever", primary({ ...base, miniSeasonActive: true, firstTime: { ...base.firstTime, started: true }, lineup: { ...base.lineup, emptyCount: 4 } }) === "Fullfør startellever");
check("11 spillere men manglende trening gir Velg trening", primary({ ...base, miniSeasonActive: true, firstTime: { ...base.firstTime, started: true, hasRoles: true }, lineup: { ...base.lineup, emptyCount: 0 }, matchdayReady: true }) === "Velg trening for Ajax-kampen");
check("etter trening men ulest innboks gir kampnotat", primary({ ...base, miniSeasonActive: true, hasTrainingChoice: true, firstTime: { ...base.firstTime, started: true, hasRoles: true }, lineup: { ...base.lineup, emptyCount: 0 }, matchdayReady: true }) === "Les assistentens kampnotat");
check("etter lest innboks gir Spill første kamp", primary({ ...base, miniSeasonActive: true, hasTrainingChoice: true, unreadThreads: 0, firstTime: { ...base.firstTime, started: true, hasRoles: true, hasReadInbox: true }, lineup: { ...base.lineup, emptyCount: 0 }, matchdayReady: true }) === "Spill første kamp");
check("etter kamp men rapport ikke sett gir Les første kamprapport", primary({ ...base, miniSeasonActive: true, hasTrainingChoice: true, unreadThreads: 0, firstTime: { ...base.firstTime, started: true, hasRoles: true, hasReadInbox: true, hasPlayedFirstMatch: true, hasSeenReport: false }, lineup: { ...base.lineup, emptyCount: 0 }, matchdayReady: true }) === "Les første kamprapport");
check("etter rapport sett gir Gå til uke 2", primary({ ...base, miniSeasonActive: true, hasTrainingChoice: true, unreadThreads: 0, firstTime: { ...base.firstTime, started: true, hasRoles: true, hasReadInbox: true, hasPlayedFirstMatch: true, hasSeenReport: true }, lineup: { ...base.lineup, emptyCount: 0 }, matchdayReady: true }) === "Gå til uke 2");
const schedule = buildMiniSeasonSchedule({ opponents: HISTORICAL_OPPONENT_PROFILES, firstOpponentId: "ajax_1971_73_total_football" });
check("kuratert første motstander er Ajax 1971–73", schedule[0]?.opponentId === "ajax_1971_73_total_football");

if (failures.length) {
  console.error("✗ First-time playthrough-sim feilet:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, firstOpponent: schedule[0].opponentName }, null, 2));

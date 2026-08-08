#!/usr/bin/env node
// Manager Flow UI simulation — canonical etter Kalender/Pass 7.
//
// `computeNextActions` er fortsatt en ren intern prioriteringsmotor som enkelte
// eksisterende flater bruker til status/gating. Den er IKKE en synlig global
// navigasjonsflyt: Kalender eier den synlige manageruka. Denne simuleringen
// beskytter bare prioriteringen mellom eksisterende arbeidsflater og låser at
// de slettede facilities/economy/transfer-systemene aldri kommer tilbake her.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeNextActions, NEXT_ACTION_TYPES } from "../src/football-next-action.js";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const appSource = readFileSync(join(root, "src/app.js"), "utf8");
const htmlSource = readFileSync(join(root, "index.html"), "utf8");
const nextSource = readFileSync(join(root, "src/football-next-action.js"), "utf8");
const calendarSource = readFileSync(join(root, "src/ui/manager-calendar-workspace-v1.js"), "utf8");
const shellSource = readFileSync(join(root, "src/ui/manager-shell-elements.js"), "utf8");
const matchdaySource = readFileSync(join(root, "src/ui/manager-matchday-presentation.js"), "utf8");

const failures = [];
function check(label, ok) {
  if (ok) console.log(`✓ ${label}`);
  else failures.push(label);
}

const READY = Object.freeze({
  hasSession: false,
  opponentName: "Brann",
  roster: { enoughUnlocked: true, enoughBench: true, unlockedCount: 15 },
  lineup: {
    totalSlots: 11,
    emptyCount: 0,
    firstEmptySlotId: null,
    misused: null,
    duplicate: null
  },
  clubWeekGate: { isBlocked: false, reason: "" },
  hasTrainingChoice: true,
  matchdayReady: true,
  unreadThreads: 0,
  hasUnseenReport: false,
  miniSeasonActive: true,
  clubWeek: { week: 3, phase: "match_prep", phaseLabel: "Kampforberedelse" }
});

const ctx = (overrides = {}) => ({ ...READY, ...overrides });
const actions = (context) => computeNextActions(context);
const titles = (context) => actions(context).map((item) => item.title);
const primary = (context) => actions(context)[0] || null;

// 1. Oppstart / onboarding: uten valgt modus skal ingen arbeidsflate late som
// managerloopen allerede er i gang.
{
  const first = primary({ selectedMode: null });
  check("uten valgt modus prioriteres spillmodus", first?.title === "Velg spillmodus");
  check("spillmodus-handlingen peker til eksisterende tab", first?.action?.type === NEXT_ACTION_TYPES.TAB);
}

// 2. Tropp og laguttak før trening/kamp.
{
  const thinRoster = primary(ctx({
    roster: { enoughUnlocked: false, enoughBench: false, unlockedCount: 8 },
    matchdayReady: false
  }));
  check("for liten tropp prioriterer spillbar tropp", thinRoster?.title === "Skaff spillbar tropp");

  const incomplete = primary(ctx({
    lineup: { totalSlots: 11, emptyCount: 3, firstEmptySlotId: "CM2", misused: null, duplicate: null },
    matchdayReady: false
  }));
  check("ufullstendig ellever prioriterer Lag", incomplete?.title === "Sett opp laget");

  const fill = actions(ctx({
    lineup: { totalSlots: 11, emptyCount: 3, firstEmptySlotId: "CM2", misused: null, duplicate: null },
    matchdayReady: false
  })).find((item) => item.title === "Fullfør startelleveren");
  check("intern slot-handling peker på første ledige plass", fill?.action?.type === NEXT_ACTION_TYPES.SLOT && fill.action.slotId === "CM2");
}

// 3. Feilbruk og dobbeltbruk er fortsatt konkrete lagproblemer.
{
  const misuse = primary(ctx({
    lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: { name: "Garrincha", position: "ST", slotId: "ST1" }, duplicate: null },
    matchdayReady: false
  }));
  check("feilbruk prioriterer rollevalg", misuse?.title === "Velg roller");

  const duplicate = primary(ctx({
    lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: null, duplicate: { name: "Pelé", slotId: "ST2" } },
    matchdayReady: false
  }));
  check("dobbeltbruk prioriterer opprydding", duplicate?.title === "Rett opp dobbeltbruk");
}

// 4. Innboks er signal før manglende treningsvalg; når den er håndtert, peker
// intern status på eksisterende trening. Kalenderen bestemmer når dette skjer.
{
  const unread = primary(ctx({ unreadThreads: 2, hasTrainingChoice: false, matchdayReady: false }));
  check("uleste signaler prioriteres før treningsvalg", unread?.title === "Les innboksen");

  const training = primary(ctx({ unreadThreads: 0, hasTrainingChoice: false, matchdayReady: false }));
  check("etter innboks prioriteres manglende treningsvalg", training?.title === "Velg treningsprogram");
}

// 5. Når forberedelsene er komplette, finnes ingen ekstra Facilities-gate.
// Neste interne kampstatus peker direkte på eksisterende Kamp-flate.
{
  const ready = primary(READY);
  check("klart lag har ingen ekstra managergate før Kamp", ready?.title === "Spill kamp");
  check("kampstatus peker til eksisterende Kamp-flate", ready?.action?.type === NEXT_ACTION_TYPES.TAB && ready.action.tab === "kamp");
  check("ingen facilities-handling finnes i prioritert liste", !titles(READY).some((title) => /fasilitet|facilit/i.test(title)));
}

// 6. Kampdag og review bruker eksisterende kamp-/analyseflater.
{
  const blockedByMatch = primary(ctx({
    clubWeekGate: { isBlocked: true, reason: "Kampdagfasen venter på en spilt kamp." }
  }));
  check("kampdag-gate peker til ukens kamp", ["Spill ukens kamp", "Spill kamp"].includes(blockedByMatch?.title));

  const report = primary(ctx({
    clubWeek: { week: 3, phase: "review", phaseLabel: "Oppsummering" },
    hasUnseenReport: true
  }));
  check("review med ulest rapport prioriterer kampanalyse", report?.title === "Se kampanalyse");

  const reviewed = primary(ctx({
    clubWeek: { week: 3, phase: "review", phaseLabel: "Oppsummering" },
    hasUnseenReport: false
  }));
  check("review uten ulest rapport peker mot neste kampuke", reviewed?.title === "Forbered neste kamp");
}

// 7. Pågående kamp vinner over andre mangler.
{
  const inProgress = primary(ctx({
    hasSession: true,
    roster: { enoughUnlocked: false, enoughBench: false, unlockedCount: 3 },
    lineup: { totalSlots: 11, emptyCount: 7, firstEmptySlotId: "GK", misused: null, duplicate: null }
  }));
  check("pågående kamp prioriterer Fortsett kampen", inProgress?.title === "Fortsett kampen");
}

// 8. Pass 7-produktgrensen er eksplisitt i selve Next-motoren.
check("Next-motoren inneholder ingen facilities-logikk", !/facilit/i.test(nextSource));
check("Next-motoren inneholder ingen økonomi-/kontraktgate", !/clubEconomy|wageBudget|contract/i.test(nextSource));
check("Next-motoren inneholder ingen overgangsmarkeds-gate", !/transferMarket|transferWindow|overgangsvindu/i.test(nextSource));

// 9. Kalenderen er den synlige eieren av manageruka, og global Next er skjult.
check("Kalender-workspacen er aktiv managerflate", calendarSource.includes("manager-calendar-surface") && calendarSource.includes("managerCalendarTimeline"));
check("global Next er skjult i normal kalenderloop", readFileSync(join(root, "src/ui/manager-calendar-workspace-v1.css"), "utf8").includes("manager-next-action") && readFileSync(join(root, "src/ui/manager-calendar-workspace-v1.css"), "utf8").includes("display: none !important"));

// 10. Ligaspill og kampdag bruker fortsatt de eksisterende autoritative flatene.
check("league save får id når sesong starter", appSource.includes("activeLeagueSaveId: model.activeLeagueSaveId || `league_save_${Date.now()}`"));
check("klubbidentiteten står i toppen", shellSource.includes('id="headerClubName"') && appSource.includes("function renderHeaderClubIdentity"));
check("klubbkortet på Kontor er borte", !htmlSource.includes('id="leagueClubCard"'));
check("sesongkontroll og ligadata rendres", htmlSource.includes('id="seasonCommand"') && appSource.includes("createSeasonSceneModel({") && appSource.includes("renderSeasonCommand(elements.seasonCommand, scene"));
check("Kamp bruker eksisterende femtilstands scene", matchdaySource.includes("resolvePhase") && matchdaySource.includes("primaryAction") && matchdaySource.includes('action: "Start kampen"'));

// 11. Determinisme og handlingskontrakt.
check("lik input gir byte-identisk output", JSON.stringify(actions(READY)) === JSON.stringify(actions(READY)));
{
  const all = actions(ctx({ unreadThreads: 2, hasUnseenReport: true, miniSeasonActive: false }));
  const seen = new Set();
  let duplicate = false;
  for (const item of all) {
    if (seen.has(item.title)) duplicate = true;
    seen.add(item.title);
    check(`handling «${item.title}» har id/tag/hint`, Boolean(item.id) && Boolean(item.tag) && Boolean(item.hint));
    check(`handling «${item.title}» har gyldig type`, item.action === null || Object.values(NEXT_ACTION_TYPES).includes(item.action?.type));
  }
  check("prioriteringslisten har ingen dupliserte titler", !duplicate);
}

check("tynn kontekst kaster ikke", Array.isArray(computeNextActions({})) && Array.isArray(computeNextActions(undefined)));

if (failures.length) {
  console.error("\n✗ Manager Flow UI-sim feilet:");
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log("\n✓ Manager Flow UI: Kalender-eid flyt uten facilities/economy/transfer-gate");
console.log(JSON.stringify({
  ok: true,
  readyPrimary: primary(READY)?.title,
  reviewPrimary: primary(ctx({ clubWeek: { week: 3, phase: "review", phaseLabel: "Oppsummering" }, hasUnseenReport: false }))?.title
}, null, 2));

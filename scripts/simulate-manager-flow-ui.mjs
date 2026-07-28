#!/usr/bin/env node
// Read-only sim for Next Action-motoren (Playable Manager Flow Polish v1.1).
// Verifiserer at "neste handling"-prioriteringen som driver stripa øverst på
// Oversikt oppfører seg som forventet: riktig primærhandling gitt ulike
// tilstander, riktig gating (pågående kamp / Club Week-port), korrekt sett-
// flagg for kamprapporten, determinisme og ryddige handlingsbeskrivelser.
//
// Motoren er ren (ingen DOM/fetch/localStorage), så den testes isolert uten et
// nettleser-DOM. Standardbibliotek, ingen avhengigheter. Exit 1 ved brudd.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeNextActions, NEXT_ACTION_TYPES } from "../src/football-next-action.js";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const appSource = readFileSync(join(root, "src/app.js"), "utf8");
const htmlSource = readFileSync(join(root, "index.html"), "utf8");

const failures = [];
const check = (label, ok) => {
  if (!ok) failures.push(label);
};

// Et "alt klart"-utgangspunkt: komplett, kampklart lag uten åpne problemer.
const READY = {
  hasSession: false,
  opponentName: null,
  roster: { enoughUnlocked: true, enoughBench: true },
  lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: null, duplicate: null },
  clubWeekGate: { isBlocked: false, reason: "" },
  hasTrainingChoice: true,
  matchdayReady: true,
  unreadThreads: 0,
  hasUnseenReport: false,
  miniSeasonActive: true,
  clubWeek: { week: 2, phase: "match_prep", phaseLabel: "Kampplan" }
};

const ctx = (overrides = {}) => ({ ...READY, ...overrides });
const titles = (context) => computeNextActions(context).map((a) => a.title);
const primary = (context) => titles(context)[0] || null;

// 1) Pågående kamp vinner alt — selv med ufullstendig lag/roster.
{
  const c = ctx({
    hasSession: true,
    opponentName: "Ungarn 1953",
    roster: { enoughUnlocked: false, enoughBench: false },
    lineup: { totalSlots: 11, emptyCount: 4, firstEmptySlotId: "S1", misused: null, duplicate: null }
  });
  check("pågående kamp gir primær «Fortsett kampen»", primary(c) === "Fortsett kampen");
  check("pågående kamp undertrykker lag-/roster-handlinger", !titles(c).includes("Fullfør startelleveren") && !titles(c).includes("Samle flere spillere"));
}

// 2) Tom tropp (15-kravet) blokkerer — samling er primær.
check("ufullstendig tropp gir primær «Skaff spillbar tropp»", primary(ctx({ roster: { enoughUnlocked: false, enoughBench: false, unlockedCount: 0 } })) === "Skaff spillbar tropp");

// 3) Tomme plasser i startelleveren — fyll laget, med slot-handling.
{
  const c = ctx({ lineup: { totalSlots: 11, emptyCount: 3, firstEmptySlotId: "CM2", misused: null, duplicate: null }, matchdayReady: false });
  check("tomme plasser gir primær «Sett opp laget»", primary(c) === "Sett opp laget");
  const fill = computeNextActions(c).find((a) => a.title === "Fullfør startelleveren");
  check("fyll-handling peker på en slot", fill?.action?.type === NEXT_ACTION_TYPES.SLOT && fill.action.slotId === "CM2");
}

// 4) Feilbruk er en managerfeil som skal rettes (rollevalg).
{
  const c = ctx({ lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: { name: "Garrincha", position: "ST", slotId: "ST1" }, duplicate: null }, matchdayReady: false });
  check("feilbruk gir primær «Velg roller»", primary(c) === "Velg roller");
  const fix = computeNextActions(c).find((a) => a.title === "Velg roller");
  check("rolle-handling peker på riktig slot", fix?.action?.slotId === "ST1");
}

// 5) Duplikat og manglende benk er egne porter.
{
  const dup = ctx({ lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: null, duplicate: { name: "Pelé", slotId: "ST2" } }, matchdayReady: false });
  check("duplikat gir primær «Rett opp dobbeltbruk»", primary(dup) === "Rett opp dobbeltbruk");
  const bench = ctx({ roster: { enoughUnlocked: true, enoughBench: false, unlockedCount: 15 }, matchdayReady: false });
  check("11 startere men under 4 benk gir benk-gate via «Sett opp laget»", primary(bench) === "Sett opp laget");
}

// 6) Club Week-port stengt — spill ukens kamp, og «Spill kamp» (ready) undertrykkes.
{
  const c = ctx({ clubWeekGate: { isBlocked: true, reason: "Kampdagfasen venter på en spilt kamp." } });
  check("stengt port gir primær «Spill ukens kamp»", primary(c) === "Spill ukens kamp");
  check("stengt port undertrykker «Spill kamp»", !titles(c).includes("Spill kamp"));
  check("stengt port undertrykker «Gå til neste fase»", !titles(c).includes("Gå til neste fase") && !titles(c).includes("Forbered neste kamp"));
}

// 7) Club Week-fasen prioriterer innboksen når klubben faktisk står i innboksfasen.
{
  const c = ctx({ clubWeek: { week: 2, phase: "inbox", phaseLabel: "Innboks" }, unreadThreads: 2 });
  check("innboksfase + ulest tråd gir primær «Les innboksen»", primary(c) === "Les innboksen");
}

// 8) Review-fasen prioriterer ulest kamprapport før ny uke.
{
  const c = ctx({ clubWeek: { week: 2, phase: "review", phaseLabel: "Oppsummering" }, hasUnseenReport: true });
  check("review-fase + ulest rapport gir primær «Se kampanalyse»", primary(c) === "Se kampanalyse");
}

// 9) Innboks er klubbens signalapparat og skal leses før treningsvalg også utenfor innboksfasen.
{
  const c = ctx({ hasTrainingChoice: false, unreadThreads: 2, clubWeek: { week: 2, phase: "match_prep", phaseLabel: "Kampplan" } });
  const t = titles(c);
  check("ulest innboks før trening gir primær «Les innboksen»", primary(c) === "Les innboksen");
  check("innboks prioriteres foran «Velg treningsprogram»", t.indexOf("Les innboksen") < t.indexOf("Velg treningsprogram"));
}

// 10) 11 + 4 klart går via Innboks bare ved uleste signaler; lest/rolig innboks går til trening.
{
  const unread = ctx({ hasTrainingChoice: false, unreadThreads: 1 });
  check("komplett lag + ulest innboks + ingen trening gir «Les innboksen»", primary(unread) === "Les innboksen");

  const read = ctx({ hasTrainingChoice: false, unreadThreads: 0 });
  const t = titles(read);
  check("innboks lest + ingen trening gir «Velg treningsprogram»", primary(read) === "Velg treningsprogram");
  check("ingen uleste tråder + ingen trening gir «Velg treningsprogram»", primary(read) === "Velg treningsprogram");
  check("ingen trening valgt viser ikke «Spill kamp» som kamp-CTA", !t.includes("Spill kamp"));
}

// 10) Alt klart → «Spill kamp» er primær.
check("kampklart lag gir primær «Spill kamp»", primary(READY) === "Spill kamp");

// 11) Sett-flagg for kamprapporten styrer «Se kampanalyse».
check("etter kamp + ulest rapport gir primær «Se kampanalyse»", primary(ctx({ hasUnseenReport: true })) === "Se kampanalyse");
check("sett rapport skjuler «Se kampanalyse»", !titles(ctx({ hasUnseenReport: false })).includes("Se kampanalyse"));
check("rapport sett peker videre mot «Forbered neste kamp» i review", primary(ctx({ clubWeek: { week: 3, phase: "review", phaseLabel: "Oppsummering" }, hasUnseenReport: false })) === "Forbered neste kamp");

// 12) Ligaspill lekker ikke scenario-/mini-season-CTA-er inn i Neste handling.
{
  const leagueTitles = titles(ctx({ miniSeasonActive: false, firstTime: null }));
  check("league mode gir ikke Ajax-scenario", !leagueTitles.includes("Start Ajax 1971–73-scenario"));
  check("league mode gir ikke mini-season CTA", !leagueTitles.includes("Start prøveperiode") && !leagueTitles.includes("Start femkampers prøveperiode"));
  const scenarioTitles = titles(ctx({
    miniSeasonActive: false,
    firstTime: { active: true, started: false, completed: false },
    scenarioModeActive: true
  }));
  check("scenario mode kan fortsatt gi Ajax-scenario", scenarioTitles.includes("Start Ajax 1971–73-scenario"));
}


// 12b) Ligaspill er en ekte pre-season gate: kampdag blir ikke primær før league-save/sesong er aktiv.
{
  const gated = ctx({ miniSeasonActive: false, leagueModeActive: true, leagueSeasonActive: false, leaguePreseasonReady: true });
  check("ligaspill uten aktiv league-save gir ikke primær «Spill kamp»", primary(gated) !== "Spill kamp");
  const active = ctx({ miniSeasonActive: true, leagueModeActive: true, leagueSeasonActive: true, leaguePreseasonReady: true });
  check("ligaspill med aktiv league-save kan gi primær «Spill kamp»", primary(active) === "Spill kamp");
}

// 12c) Klubb-save-kortet er wiret i ligamodus uten å åpne kampdag før aktiv save.
check("league save får id når sesong starter", appSource.includes("activeLeagueSaveId: model.activeLeagueSaveId || `league_save_${Date.now()}`"));
// Klubbidentitet er klubben spilleren opprettet (navn + manager), ikke et
// History Go-stedsanker. Den står nå i toppen i stedet for i en egen boks på
// Kontor, som gjentok tall managerportalen og klubbuka allerede viste.
check("klubbidentiteten står i toppen", htmlSource.includes('id="headerClubName"') && appSource.includes("function renderHeaderClubIdentity"));
check("klubbidentiteten viser navn og manager", htmlSource.includes('id="headerClubManager"') && appSource.includes("model.managerName"));
check("klubbkortet på Kontor er borte", !htmlSource.includes('id="leagueClubCard"'));
check("klubbkort bruker ikke stedsanker", !htmlSource.includes('id="leagueClubAnchor"') && !appSource.includes("Klubbanker / hjemsted"));
check("leagueSeasonStatus vises som norsk managerstatus", appSource.includes("Før sesong") && appSource.includes("Aktiv sesong") && appSource.includes("Fullført sesong"));
check("aktiv save viser ligastatus/terminliste", htmlSource.includes("Terminliste og tabell") && appSource.includes("getNextLeagueOpponent(state.leagueSeason)"));

// 13) Fallback: review-fasen gir «Forbered neste kamp», ellers «Gå til neste fase».
check("review-fase gir «Forbered neste kamp»", titles(ctx({ clubWeek: { week: 3, phase: "review", phaseLabel: "Oppsummering" } })).includes("Forbered neste kamp"));
check("ikke-review gir «Gå til neste fase»", titles(READY).includes("Gå til neste fase"));

// 14) Determinisme: lik input gir byte-identisk output.
check(
  "determinisme: lik kontekst gir identisk resultat",
  JSON.stringify(computeNextActions(READY)) === JSON.stringify(computeNextActions(READY))
);

// 15) Ryddige beskrivelser: ingen dupliserte titler, gyldige handlingstyper.
{
  const all = computeNextActions(ctx({ hasUnseenReport: true, unreadThreads: 2, miniSeasonActive: false, firstTime: null }));
  const seen = new Set();
  let dup = false;
  for (const a of all) {
    if (seen.has(a.title)) dup = true;
    seen.add(a.title);
    check(`handling «${a.title}» har id/tag/hint`, Boolean(a.id) && Boolean(a.tag) && Boolean(a.hint));
    const validType = a.action === null || Object.values(NEXT_ACTION_TYPES).includes(a.action?.type);
    check(`handling «${a.title}» har gyldig handlingstype`, validType);
  }
  check("ingen dupliserte titler", !dup);
}

// 16) Tom/tynn kontekst kaster ikke og gir alltid noe brukbart.
check("tom kontekst kaster ikke", Array.isArray(computeNextActions({})));
check("tom kontekst gir minst én handling eller tom liste uten feil", Array.isArray(computeNextActions(undefined)));

// 17) Innboksflaten forklarer signalporten og CTA bruker eksisterende tab-handler.
{
  const html = await import("node:fs").then(({ readFileSync }) => readFileSync(new URL("../index.html", import.meta.url), "utf8"));
  const app = await import("node:fs").then(({ readFileSync }) => readFileSync(new URL("../src/app.js", import.meta.url), "utf8"));
  check("innboksen kurateres til ukas kvote (få, relevante signaler)", app.includes("getInboxWeeklyCap") && app.includes("slice(0, cap)"));
  check("ukekvoten kvitteres ut per uke og løftes ved ny uke", app.includes("hasAcknowledgedInboxThisWeek") && app.includes("acknowledgeInboxThisWeek"));
  check("kuratering og telleverk deler samme regel", app.includes("getInboxAttentionCount"));
  check("innboksmeldinger kan bindes til ukevindu (datavask)", app.includes("message.minWeek") && app.includes("message.maxWeek"));
  check("Innboks CTA peker til trening", html.includes('id="inboxGoTraining"') && html.includes('data-tab-target="trening"') && html.includes("Gå til Trening"));
  // Rekkefølgen forklares nå av planmotoren (fire nummererte steg) i stedet for
  // én setning i markupen. Vakten er derfor skrevet mot INTENSJONEN — at flata
  // sier at Innboks kommer først og hvorfor — ikke mot en bestemt formulering.
  const planEngine = readFileSync(join(root, "src/football-training-plan.js"), "utf8");
  check(
    "Trening forklarer hvorfor den kommer etter Innboks",
    /id: "inbox"/.test(planEngine)
      && /Innboksen er ikke et treningsvalg/.test(planEngine)
      && /order: 1/.test(planEngine)
      && html.includes('id="trainingPlanSteps"')
  );
  check("Trening har tydelig valgt/ikke valgt gate", html.includes('id="trainingChoiceGate"') && html.includes('id="trainingChoiceStatus"'));
  check("Trening-panelet har CTA videre til Kamp når valgt", html.includes('id="trainingGoMatch"') && html.includes('data-tab-target="kamp"') && html.includes("Gå til Kamp"));
  check("Trening skiller anbefalt, trygt og dypere valg", app.includes("Anbefalt nå") && app.includes("Andre trygge valg") && app.includes("Dypere treningsprogram / historikk"));
  check(
    "Trening gjør valgt uke tydelig",
    app.includes("Treningsuke valgt")
      && app.includes("elements.trainingPlanHeadline")
      && app.includes("elements.trainingPlanLoad")
  );
  check("Kampfanen har tydelig kampdag-gate", app.includes("renderMatchdayGate") && app.includes("Kampklar:") && app.includes("Primærhandling:"));
  check("Kampfanen viser CTA-er for states", app.includes("Spill kamp") && app.includes("Fortsett kampen") && app.includes("Forbered neste kamp"));
  check("Kamprapporten folder dybde i details", app.includes("matchday-detail-drawer") && app.includes("Full kampanalyse"));
}

if (failures.length) {
  console.error("✗ Manager Flow UI-sim feilet:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      readyPrimary: primary(READY),
      readyFlow: titles(ctx({ hasUnseenReport: true, unreadThreads: 1, miniSeasonActive: false }))
    },
    null,
    2
  )
);
process.exit(0);

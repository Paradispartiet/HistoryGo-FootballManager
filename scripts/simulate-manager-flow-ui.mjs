#!/usr/bin/env node
// Read-only sim for Next Action-motoren (Playable Manager Flow Polish v1.1).
// Verifiserer at "neste handling"-prioriteringen som driver stripa øverst på
// Oversikt oppfører seg som forventet: riktig primærhandling gitt ulike
// tilstander, riktig gating (pågående kamp / Club Week-port), korrekt sett-
// flagg for kamprapporten, determinisme og ryddige handlingsbeskrivelser.
//
// Motoren er ren (ingen DOM/fetch/localStorage), så den testes isolert uten et
// nettleser-DOM. Standardbibliotek, ingen avhengigheter. Exit 1 ved brudd.

import { computeNextActions, NEXT_ACTION_TYPES } from "../src/football-next-action.js";

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
  check("stengt port undertrykker «Gå til neste fase»", !titles(c).includes("Gå til neste fase") && !titles(c).includes("Gå til neste uke"));
}

// 7) Club Week-fasen prioriterer innboksen når klubben faktisk står i innboksfasen.
{
  const c = ctx({ clubWeek: { week: 2, phase: "inbox", phaseLabel: "Innboks" }, unreadThreads: 2 });
  check("innboksfase + ulest tråd gir primær «Les innboksen»", primary(c) === "Les innboksen");
}

// 8) Review-fasen prioriterer ulest kamprapport før ny uke.
{
  const c = ctx({ clubWeek: { week: 2, phase: "review", phaseLabel: "Oppsummering" }, hasUnseenReport: true });
  check("review-fase + ulest rapport gir primær «Se kamprapporten»", primary(c) === "Se kamprapporten");
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
  check("treningsvalg prioriteres foran «Spill kamp»", t.indexOf("Velg treningsprogram") < t.indexOf("Spill kamp"));
}

// 10) Alt klart → «Spill kamp» er primær.
check("kampklart lag gir primær «Spill kamp»", primary(READY) === "Spill kamp");

// 11) Sett-flagg for kamprapporten styrer «Se kamprapporten».
check("ulest rapport gir «Se kamprapporten»", titles(ctx({ hasUnseenReport: true })).includes("Se kamprapporten"));
check("sett rapport skjuler «Se kamprapporten»", !titles(ctx({ hasUnseenReport: false })).includes("Se kamprapporten"));

// 12) Prøveperiode foreslås når laget er klart og ingen er aktiv.
check("inaktiv prøveperiode + klart lag gir «Start prøveperiode»", titles(ctx({ miniSeasonActive: false })).includes("Start prøveperiode"));
check("aktiv prøveperiode skjuler «Start prøveperiode»", !titles(ctx({ miniSeasonActive: true })).includes("Start prøveperiode"));

// 13) Fallback: review-fasen gir «Gå til neste uke», ellers «Gå til neste fase».
check("review-fase gir «Gå til neste uke»", titles(ctx({ clubWeek: { week: 3, phase: "review", phaseLabel: "Oppsummering" } })).includes("Gå til neste uke"));
check("ikke-review gir «Gå til neste fase»", titles(READY).includes("Gå til neste fase"));

// 14) Determinisme: lik input gir byte-identisk output.
check(
  "determinisme: lik kontekst gir identisk resultat",
  JSON.stringify(computeNextActions(READY)) === JSON.stringify(computeNextActions(READY))
);

// 15) Ryddige beskrivelser: ingen dupliserte titler, gyldige handlingstyper.
{
  const all = computeNextActions(ctx({ hasUnseenReport: true, unreadThreads: 2, miniSeasonActive: false }));
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
  check("første uke begrenser innboksen til ett tydelig signal før trening", app.includes("isFirstWeekBeforeTraining") && app.includes("slice(0, 1)"));
  check("Innboks CTA peker til trening", html.includes('id="inboxGoTraining"') && html.includes('data-tab-target="trening"') && html.includes("Gå til Trening"));
  check("Trening forklarer hvorfor den kommer etter Innboks", html.includes("Du velger trening etter at klubbens signaler er lest"));
  check("Trening har tydelig valgt/ikke valgt gate", html.includes('id="trainingChoiceGate"') && html.includes('id="trainingChoiceStatus"'));
  check("Trening-panelet har CTA videre til Kamp når valgt", html.includes('id="trainingGoMatch"') && html.includes('data-tab-target="kamp"') && html.includes("Gå til Kamp"));
  check("Trening skiller anbefalt, trygt og dypere valg", app.includes("Anbefalt nå") && app.includes("Andre trygge valg") && app.includes("Dypere treningsprogram / historikk"));
  check("Trening gjør valgt uke tydelig", app.includes("Treningsuke valgt") && app.includes("Kort effekt/risiko"));
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

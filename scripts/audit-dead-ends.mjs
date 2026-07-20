#!/usr/bin/env node
// Read-only dead-end-audit: en streng spillflyt-kontrakt for den første
// spillbare løkka. Der `audit-flow.mjs` sjekker at hvert ledd FINNES og er
// wiret, sjekker dette scriptet at ingenting synlig og klikkbart fører
// brukeren inn i en blindvei: tomme «senere»-faner, feil ankerhopp, knapper
// uten konsekvens, eller scenario-/mini-sesong-flater som lekker inn i
// ligaspill.
//
// Hovedregel (jf. CLAUDE.md, «Et spillbart v0.1 trenger færre flater, ikke
// flere»): alt som er synlig og klikkbart i første løkke må enten gjøre en
// konkret spillhandling, ta brukeren til riktig neste spillflate, eller være
// tydelig deaktivert / «kommer senere» uten å åpne en tom dead end.
//
// Statisk sjekk — kjører ikke DOM-en. Standardbibliotek, ingen avhengigheter.
// Exit 1 ved brudd, 0 ellers.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const app = readFileSync(join(root, "src/app.js"), "utf8");
const css = readFileSync(join(root, "style.css"), "utf8");

// ---- HTML-hjelpere ----------------------------------------------------------

const htmlIds = new Set();
for (const match of html.matchAll(/\sid="([^"]+)"/g)) htmlIds.add(match[1]);

const tabTargets = new Set();
for (const match of html.matchAll(/data-tab-target="([^"]+)"/g)) tabTargets.add(match[1]);

const tabSections = new Set();
for (const match of html.matchAll(/data-tab-section="([^"]+)"/g)) tabSections.add(match[1]);

// Alle nav-fane-knapper i hovednav, med rå åpningstag-tekst, slik at vi kan se
// hvilke som er primære/sekundære, deaktiverte og merket «Senere».
function navTabButtons() {
  const buttons = [];
  for (const m of html.matchAll(/<button\b[^>]*\bdata-tab-target="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)) {
    const openTag = m[0].slice(0, m[0].indexOf(">") + 1);
    if (!/\bnav-tab\b/.test(openTag)) continue;
    buttons.push({
      target: m[1],
      openTag,
      inner: m[2],
      isPrimary: /\bnav-tab-primary\b/.test(openTag),
      isSecondary: /\bnav-tab-secondary\b/.test(openTag),
      isDisabled: /\sdisabled(?=[\s>])/.test(openTag) || /aria-disabled="true"/.test(openTag),
      isFuture: /nav-future-badge/.test(m[2])
    });
  }
  return buttons;
}

// Åpningstaggen for et gitt id (for å lese f.eks. `hidden`).
function openTagForId(id) {
  const re = new RegExp(`<[a-zA-Z][^>]*\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`);
  const m = html.match(re);
  return m ? m[0] : "";
}

const isStaticallyHidden = (id) => /\shidden(?=[\s>])/.test(openTagForId(id));

// ---- Sjekk-rammeverk --------------------------------------------------------

const results = [];
let currentStage = "";
function stage(name) {
  currentStage = name;
}
function check(label, ok, detail = "") {
  results.push({ stage: currentStage, label, ok: Boolean(ok), detail });
}

// ---- 1) Fane ↔ seksjon-symmetri --------------------------------------------
stage("1. Fane ↔ seksjon");
{
  const missingSection = [...tabTargets].filter((t) => !tabSections.has(t));
  const orphanSection = [...tabSections].filter((s) => !tabTargets.has(s));
  check(
    "hver data-tab-target peker på en data-tab-section",
    missingSection.length === 0,
    missingSection.map((t) => `target=${t}`).join(", ")
  );
  check(
    "ingen foreldreløse seksjoner (tom fane uten knapp)",
    orphanSection.length === 0,
    orphanSection.map((s) => `section=${s}`).join(", ")
  );
}

// ---- 2) «Senere»-faner er ikke aktive blindveier ---------------------------
stage("2. «Senere»-faner deaktivert");
{
  const buttons = navTabButtons();
  const futureButtons = buttons.filter((b) => b.isFuture);
  check("minst én «Senere»-knapp finnes (ellers er regelen tom)", futureButtons.length > 0, `antall=${futureButtons.length}`);
  for (const b of futureButtons) {
    check(
      `«Senere»-fane ${b.target} er deaktivert (disabled/aria-disabled)`,
      b.isDisabled,
      "merket «Senere» men fortsatt en aktiv fane → blindvei"
    );
  }
  // En «Senere»-fane skal aldri samtidig være merket som primær spillbar løkke.
  for (const b of futureButtons) {
    check(`«Senere»-fane ${b.target} er ikke primær`, !b.isPrimary);
  }
}

// ---- 3) Primære nav-faner leder til en ekte spillflate ---------------------
stage("3. Primær nav → spillflate");
{
  const buttons = navTabButtons();
  const futureTargets = new Set(buttons.filter((b) => b.isFuture).map((b) => b.target));
  const primary = buttons.filter((b) => b.isPrimary);
  check("minst én primær nav-fane finnes", primary.length > 0, `antall=${primary.length}`);
  for (const b of primary) {
    check(`primær fane ${b.target} har en seksjon`, tabSections.has(b.target));
    check(`primær fane ${b.target} er ikke deaktivert`, !b.isDisabled);
    check(`primær fane ${b.target} er ikke en «Senere»-flate`, !futureTargets.has(b.target));
  }
}

// ---- 3b) Aktive faner leder ikke til en «senere»-placeholder ---------------
// En fane som er klikkbar (ikke disabled, ikke «Senere»-badge) må lede til en
// seksjon med ekte innhold — ikke en flate som fortsatt er merket som senere
// (`future-label`). Å åpne en fane krever altså at placeholderen fjernes.
stage("3b. Aktive faner har ekte innhold");
{
  const sectionBlock = (target) => {
    const re = new RegExp(
      `data-tab-section="${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?(?=<div class="tab-section|</main>)`
    );
    const m = html.match(re);
    return m ? m[0] : "";
  };
  const buttons = navTabButtons();
  const active = buttons.filter((b) => !b.isDisabled && !b.isFuture);
  for (const b of active) {
    const block = sectionBlock(b.target);
    check(
      `aktiv fane ${b.target} leder ikke til en «senere»-placeholder`,
      block !== "" && !/class="future-label"/.test(block),
      "seksjonen er fortsatt merket future-label → åpnet, men uferdig"
    );
  }
}

// ---- 4) Alle querySelector("#id") i app.js finnes i DOM ---------------------
stage("4. JS-id-oppslag finnes");
{
  const queried = new Set();
  for (const m of app.matchAll(/querySelector\(\s*["'`]#([A-Za-z0-9_-]+)["'`]\s*\)/g)) queried.add(m[1]);
  const missing = [...queried].filter((id) => !htmlIds.has(id));
  check(
    "ingen querySelector(\"#id\") peker på id som mangler i index.html",
    missing.length === 0,
    missing.map((id) => `#${id}`).join(", ")
  );
}

// ---- 5) href="#id"-ankre er ikke blindveier --------------------------------
stage("5. Anker-lenker");
{
  const anchors = [];
  for (const m of html.matchAll(/href="#([A-Za-z0-9_-]+)"/g)) anchors.push(m[1]);
  const dangling = anchors.filter((id) => !htmlIds.has(id));
  check(
    "alle href=\"#id\" peker på en eksisterende id",
    dangling.length === 0,
    dangling.map((id) => `#${id}`).join(", ")
  );
  // Et anker som peker på et element som er `hidden` i statisk markup er en
  // blindvei: klikket scroller ingensteds før JS eventuelt viser det.
  const hiddenAnchors = anchors.filter((id) => htmlIds.has(id) && isStaticallyHidden(id));
  check(
    "ingen href-anker peker på et statisk skjult element",
    hiddenAnchors.length === 0,
    hiddenAnchors.map((id) => `#${id} (hidden)`).join(", ")
  );
}

// ---- 6) Scenario / mini-sesong lekker ikke inn i ligaspill ------------------
stage("6. Mini-sesong isolert fra liga");
{
  // Panelet skal være `hidden` i statisk markup, slik at en render-/state-feil
  // aldri kan la «5 kamper for styret» dukke opp i vanlig ligaspill.
  const miniPanel = html.match(/<section\b[^>]*\bmini-season-panel\b[^>]*>/);
  check("mini-sesong-panelet finnes i markup", Boolean(miniPanel));
  check(
    "mini-sesong-panelet er hidden by default",
    Boolean(miniPanel) && /\shidden(?=[\s>])/.test(miniPanel[0]),
    "uten default-hidden kan panelet lekke inn i ligaspill ved render-feil"
  );
  // app.js skjuler panelet når scenario IKKE er aktivt.
  check(
    "renderMiniSeason gater panelet på scenario-modus",
    /panel\.hidden\s*=\s*!isScenarioModeActive\(\)/.test(app)
  );
  check(
    "renderMiniSeason returnerer tidlig utenfor scenario-modus",
    /if\s*\(!isScenarioModeActive\(\)\)\s*\{[\s\S]{0,200}return;/.test(app)
  );

  // League Loop v0.2: ligasesong-panelet er speilbildet — hidden by default i
  // markup og gatet på ligamodus i app.js, så liga- og scenarioflatene aldri
  // vises samtidig.
  const leaguePanel = html.match(/<section\b[^>]*\bleague-season-panel\b[^>]*>/);
  check("ligasesong-panelet finnes i markup", Boolean(leaguePanel));
  check(
    "ligasesong-panelet er hidden by default",
    Boolean(leaguePanel) && /\shidden(?=[\s>])/.test(leaguePanel[0]),
    "uten default-hidden kan panelet lekke inn i scenariomodus ved render-feil"
  );
  check(
    "renderLeagueSeason gater panelet på ligamodus",
    /panel\.hidden\s*=\s*!isLeagueModeActive\(\)/.test(app)
  );
  check(
    "ligasesongen starter automatisk uten scenario-sideeffekter",
    /function ensureLeagueSeason\(\)[\s\S]{0,1200}createLeagueSeason\(\{/.test(app)
      && !/function ensureLeagueSeason\(\)[\s\S]{0,1200}firstTimePlaythrough/.test(app)
  );
}

// ---- 7) Kamp kan ikke startes uten lag + trening ---------------------------
stage("7. Kamp-gating");
{
  check(
    "playMatchday krever kampklar tropp + valgt trening",
    /getMatchdayReadiness\([^)]*\)\.isReady\s*\|\|\s*\(!state\.weeklyTrainingProgram\?\.programId\s*&&\s*!state\.weeklyTrainingFocus\?\.focusId\)/.test(app)
  );
}

// ---- 8) «Neste fase» kan ikke hoppe forbi kampen ---------------------------
stage("8. Fase-gating");
{
  check(
    "«Neste fase»-knappen deaktiveres av kampdag-porten",
    /advanceClubWeekPhase\.disabled\s*=\s*gate\.isBlocked/.test(app)
  );
  check(
    "fase-handleren stopper på stengt port",
    /const gate = getClubWeekMatchdayGate\(\);[\s\S]{0,200}if\s*\(gate\.isBlocked\)/.test(app)
  );
}

// ---- 9) Rapport → ny uke har en vei videre ---------------------------------
stage("9. Rapport → ny uke");
{
  check("«Neste fase»-handlingen finnes (#advanceClubWeekPhase)", htmlIds.has("advanceClubWeekPhase"));
  check("ny uke nullstiller ukens trening", /weeklyTrainingFocus\s*=\s*null/.test(app) && /weeklyTrainingProgram\s*=\s*null/.test(app));
  check("ny uke ruller mini-sesongen", /advanceMiniSeasonForNewWeek\(\)/.test(app));
}

// ---- 10) Én primær vei videre ----------------------------------------------
// «Neste handling» skal være den ENESTE alltid-synlige primære veien videre,
// men den bor nå kompakt i manager-footeren i stedet for som hero på Oversikt.
// Konkurrerende «neste»-lister (Neste beslutninger) skal støtte den, ikke
// konkurrere — de foldes bak en <details>, ikke stå åpne som en andre primær.
stage("10. Én primær vei videre");
{
  const primaryCount = (html.match(/class="next-action-primary"/g) || []).length;
  check("nøyaktig én primær «Neste handling»-knapp i managerkontoret", primaryCount === 1, `antall=${primaryCount}`);

  const footer = html.match(/<footer\b[^>]*class="site-footer"[\s\S]*?<\/footer>/);
  check("«Neste handling» ligger i manager-footeren", Boolean(footer) && /next-action-strip/.test(footer[0]));

  // «Neste handling»-stripa skal være alltid synlig — ikke gjemt bak <details>.
  const strip = html.match(/<section\b[^>]*\bnext-action-strip\b[\s\S]*?<\/section>/);
  check("«Neste handling»-stripa finnes", Boolean(strip));
  check(
    "«Neste handling»-stripa er ikke foldet bak <details>",
    Boolean(strip) && !/<details/.test(strip[0])
  );

  // Konkurrerende «Neste beslutninger» skal være foldet (sekundær støtte).
  const decision = html.match(/<section\b[^>]*\bdecision-strip\b[\s\S]*?<\/section>/);
  check("«Neste beslutninger»-panelet finnes", Boolean(decision));
  check(
    "«Neste beslutninger» er foldet bak <details> (støtter, konkurrerer ikke)",
    Boolean(decision) && /<details/.test(decision[0]),
    "en andre alltid-åpen «neste»-liste konkurrerer med den primære veien"
  );
}

// ---- 11) `hidden` vinner alltid over author-`display:` ----------------------
// Blindvei-klassen bak flere paneler: et panel gates bort i JS/markup med
// `hidden`, men en author-regel som `.mini-season-panel { display: grid }` slår
// nettleserens svake `[hidden] { display:none }`, så panelet lekker likevel inn
// på flaten (scenario-prøveperiode i ligamodus, ligasesong i treningsrommet,
// side-/rollekort som aldri skjules). Én autoritativ global regel må sikre at
// `hidden` alltid betyr «ikke vist», ellers gjeninnfører neste panel med en
// egen `display:` blindveien. Vi krever regelen framfor å telle per-panel-vakter.
stage("11. `hidden` vinner over display");
{
  // Fjern kommentarer først, slik at et eksempel i en kommentar ikke teller.
  const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // En regel der selektor-lista inneholder et bart `[hidden]` (ikke `.x[hidden]`)
  // og deklarasjonen er `display:none !important`.
  const globalHiddenRule = new RegExp(
    "(^|[,{}])\\s*\\[hidden\\]\\s*(,[^{]*)?\\{[^}]*display\\s*:\\s*none\\s*!important[^}]*\\}"
  );
  check(
    "style.css har en global `[hidden] { display: none !important }`-regel",
    globalHiddenRule.test(cssNoComments),
    "uten den slår enhver author-`display:` over `hidden` og panelet lekker inn på flaten"
  );
}

// ---- Rapport ----------------------------------------------------------------

const failed = results.filter((r) => !r.ok);
const byStage = new Map();
for (const r of results) {
  if (!byStage.has(r.stage)) byStage.set(r.stage, []);
  byStage.get(r.stage).push(r);
}

console.log("Dead-end-audit: første spillbare løkke uten blindveier\n");
for (const [stageName, items] of byStage) {
  const stageFailed = items.filter((i) => !i.ok).length;
  console.log(`${stageFailed === 0 ? "✓" : "✗"} ${stageName}`);
  for (const item of items) {
    if (item.ok) continue;
    console.log(`    ✗ ${item.label}${item.detail ? ` (${item.detail})` : ""}`);
  }
}

console.log(`\n${results.length - failed.length}/${results.length} sjekker bestått.`);

if (failed.length > 0) {
  console.error(`\n✗ Dead-end-audit feilet: ${failed.length} blindvei(er) i første spillbare løkke.`);
  process.exit(1);
}

console.log("\n✓ Dead-end-audit OK: ingen blindveier i første spillbare løkke.");
process.exit(0);

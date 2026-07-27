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
const engine = readFileSync(join(root, "src/football-matchday-engine.js"), "utf8");
const modeSessions = readFileSync(join(root, "src/football-mode-sessions.js"), "utf8");

// ---- HTML-hjelpere ----------------------------------------------------------

const htmlIds = new Set();
for (const match of html.matchAll(/\sid="([^"]+)"/g)) htmlIds.add(match[1]);

const tabTargets = new Set();
for (const match of html.matchAll(/data-tab-target="([^"]+)"/g)) tabTargets.add(match[1]);

const tabSections = new Set();
for (const match of html.matchAll(/data-tab-section="([^"]+)"/g)) tabSections.add(match[1]);

// Alle fane-knapper som faktisk navigerer: hovedmenyen OG kortene i «Kontorets
// avdelinger». Avdelingskortene er nå den ekte veien inn til stab, speiding,
// klubb, styret og fasiliteter — de lå tidligere i en nedtrekksmeny som
// duplikerte navnene i hovedmenyen. Ser auditen bare på .nav-tab, slipper en
// deaktivert-regel som «Senere» rett gjennom på kortene.
function navTabButtons() {
  const buttons = [];
  for (const m of html.matchAll(/<button\b[^>]*\bdata-tab-target="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)) {
    const openTag = m[0].slice(0, m[0].indexOf(">") + 1);
    const isNavTab = /\bnav-tab\b/.test(openTag);
    const isDepartment = /\bdept-link-card\b/.test(openTag);
    if (!isNavTab && !isDepartment) continue;
    buttons.push({
      target: m[1],
      openTag,
      inner: m[2],
      label: (m[2].match(/<span class="nav-label">([^<]+)<\/span>/) || m[2].match(/<strong>([^<]+)<\/strong>/) || [])[1] || "",
      navModes: (openTag.match(/data-nav-modes="([^"]*)"/) || [, ""])[1].split(/\s+/).filter(Boolean),
      isNavTab,
      isDepartment,
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

  // Konkurrerende «Neste beslutninger» skal ikke være en andre alltid-åpen
  // primær. Godkjent hvis den enten er foldet bak <details> ELLER flyttet inn i
  // en popup (skjult til man åpner den) — en popup skjuler den enda tydeligere.
  const decision = html.match(/<section\b[^>]*\bdecision-strip\b[\s\S]*?<\/section>/);
  check("«Neste beslutninger»-panelet finnes", Boolean(decision));
  const decisionInDetails = Boolean(decision) && /<details/.test(decision[0]);
  const decisionInPopup = /data-modal-open="modalDecisions"/.test(html)
    && /<div\b[^>]*\bmodal-overlay\b[^>]*\bid="modalDecisions"[\s\S]*?\bdecision-strip\b/.test(html);
  check(
    "«Neste beslutninger» konkurrerer ikke (foldet bak <details> eller i popup)",
    decisionInDetails || decisionInPopup,
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

// ---- 12) Onboarding er en egen skjerm, ikke på spillflaten -----------------
// Krav (bruker): valg av spillmodus skal skje på en EGEN startskjerm, aldri
// oppå selve spillflaten. `#onboardingScreen` må ligge utenfor app-rammen
// (<main class="app-shell">), og mode-valg-knappene (`data-start-mode`) må bo i
// den skjermen — ikke inne i en spillbar fane.
stage("12. Onboarding er egen skjerm");
{
  const onboarding = html.match(/<div\b[^>]*\bid="onboardingScreen"[^>]*>[\s\S]*?<\/div>\s*<\/div>/);
  check("#onboardingScreen finnes i markup", htmlIds.has("onboardingScreen"));
  const main = html.match(/<main\b[^>]*class="app-shell"[\s\S]*?<\/main>/);
  check("app-rammen (<main class=\"app-shell\">) finnes", Boolean(main));
  check(
    "ingen mode-valg (data-start-mode) inne i spillflaten <main>",
    Boolean(main) && !/data-start-mode=/.test(main[0]),
    "modusvalg på spillflaten er nettopp det brukeren ba oss fjerne"
  );
  check(
    "mode-valg-knappene bor i onboarding-skjermen",
    Boolean(onboarding) && /data-start-mode=/.test(onboarding[0])
  );
  check(
    "renderOnboardingScreen styrer startskjermen på `onboarded`",
    /screen\.hidden\s*=\s*state\.onboarded\s*&&\s*!state\.modeChooserOpen/.test(app)
  );
}

// ---- 13) Startelleveren kan alltid fylles ------------------------------------
// Krever formasjonen flere av en posisjon enn troppen har (1-1-8 med åtte
// spisser er det verste tilfellet), sto manageren igjen med tomme plasser,
// beskjeden «Fyll 2 plasser» og ingen spiller å fylle dem med. Feilbruk er lov
// – motoren forklarer den. Auto-fyll må derfor ha et siste «hvem som helst»-
// nivå, ellers er kampdagen låst.
stage("13. Startelleveren kan alltid fylles");
{
  const picker = app.match(/function findBestAvailablePlayerForSlot\([\s\S]*?\n\}/);
  check("findBestAvailablePlayerForSlot finnes", Boolean(picker));
  check(
    "auto-fyll har et siste nivå som tar hvilken som helst ledig spiller",
    Boolean(picker) && /\(\)\s*=>\s*true/.test(picker[0]),
    "uten det blir plasser stående tomme når troppen mangler posisjonen"
  );
  check(
    "fallbacken er begrunnet i koden (feilbruk er lov, ikke en feil)",
    Boolean(picker) && /Feilbruk er lov/.test(picker[0])
  );
}

// ---- 14) Struktur: seksjoner og popuper ligger der de kan vises -------------
// To ekte blindveier bodde i markupen, og begge ga BLANK skjerm:
//   1) Én manglende </div> gjorde at hele formasjonsbiblioteket havnet INNI
//      Speiding-seksjonen. Biblioteket ble 0x0 fordi forelderen var display:none.
//   2) Alle popuper lå inne i hver sin faneseksjon. En popup som åpnes fra en
//      ANNEN skjerm kunne derfor ikke tegnes: `position: fixed` slipper unna
//      `overflow`, men ikke unna at en forelder er `display: none`.
//      Innstillinger (åpnes fra toppen på hver skjerm) og troppevalget (åpnes
//      fra Lag) var begge døde.
// Ingen av dem gir feilmelding i konsollen — bare tomt bilde. Derfor denne vakta.
stage("14. Struktur: seksjoner og popuper");
{
  // Enkel, avhengighetsfri div-teller: er markupen balansert?
  const divOpen = (html.match(/<div\b/g) || []).length;
  const divClose = (html.match(/<\/div>/g) || []).length;
  check(
    "div-taggene er balanserte",
    divOpen === divClose,
    `${divOpen} åpne mot ${divClose} lukkede`
  );

  // Hver faneseksjon må starte på toppnivå i <main>, ikke inne i en annen.
  // Vi måler nestingdybden ved å telle div-balansen fram til hver seksjon.
  const sectionRe = /<div\b[^>]*data-tab-section="([a-zA-Z]+)"/g;
  const depthAt = (index) => {
    const before = html.slice(0, index);
    return (before.match(/<div\b/g) || []).length - (before.match(/<\/div>/g) || []).length;
  };
  const sections = [];
  let match;
  while ((match = sectionRe.exec(html)) !== null) {
    sections.push({ name: match[1], depth: depthAt(match.index) });
  }
  check("alle faneseksjoner er funnet", sections.length >= 10, `${sections.length} seksjoner`);
  const baseDepth = sections.length ? sections[0].depth : 0;
  const nested = sections.filter((section) => section.depth !== baseDepth);
  check(
    "ingen faneseksjon ligger inne i en annen seksjon",
    nested.length === 0,
    nested.map((s) => `${s.name} (dybde ${s.depth}, forventet ${baseDepth})`).join(", ")
  );

  // Popuper må ligge UTENFOR faneseksjonene, ellers kan de bare vises på «sin»
  // egen skjerm. Vi regner ut hver seksjons faktiske spenn (fra åpningstaggen
  // til den matchende </div>) og sjekker at ingen popup starter inni et av dem.
  const sectionSpans = [];
  sectionRe.lastIndex = 0;
  while ((match = sectionRe.exec(html)) !== null) {
    const from = match.index;
    let depth = 0;
    const tagRe = /<div\b|<\/div>/g;
    tagRe.lastIndex = from;
    let tag;
    while ((tag = tagRe.exec(html)) !== null) {
      depth += tag[0] === "</div>" ? -1 : 1;
      if (depth === 0) break;
    }
    sectionSpans.push({ name: match[1], from, to: tag ? tagRe.lastIndex : html.length });
  }

  const modalRe = /<div\b[^>]*class="modal-overlay"[^>]*id="([a-zA-Z]+)"/g;
  const modals = [];
  while ((match = modalRe.exec(html)) !== null) {
    const inside = sectionSpans.find((span) => match.index > span.from && match.index < span.to);
    modals.push({ id: match[1], inside: inside ? inside.name : null });
  }
  check("popupene er funnet", modals.length >= 10, `${modals.length} popuper`);
  const buried = modals.filter((modal) => modal.inside);
  check(
    "ingen popup ligger inne i en faneseksjon",
    buried.length === 0,
    buried.map((m) => `${m.id} i ${m.inside}`).join(", ")
  );

  // Konkret regresjonsvakt for de to som faktisk var døde.
  check(
    "innstillinger kan åpnes fra alle skjermer",
    modals.some((modal) => modal.id === "modalSettings" && !modal.inside)
  );
  check(
    "troppevalget kan åpnes fra Lag",
    modals.some((modal) => modal.id === "modalDraft" && !modal.inside)
  );
}

// ---- 15) Taktikktavla: to ULIKE valg, og ingenting oppå hverandre -----------
// «Hvorfor har vi to formasjonsvelgere?» — det hadde vi ikke. Vi hadde én
// formasjonsvelger og én kampplanvelger, men begge etikettene var sr-only og
// hver kampplan het noe som «Bredt og hurtig 4-3-3». Tallet i navnet motsa den
// valgte formasjonen, og de leste som to av samme sort.
stage("15. Taktikktavla");
{
  const tactics = JSON.parse(readFileSync(join(root, "data/football_tactics.json"), "utf8")).tactics || [];
  check("kampplaner finnes", tactics.length >= 3, `${tactics.length} kampplaner`);
  const numbered = tactics.filter((tactic) => /\d\s*-\s*\d/.test(String(tactic.name || "")));
  check(
    "ingen kampplan har et formasjonstall i navnet",
    numbered.length === 0,
    numbered.map((t) => t.name).join(", ")
  );
  check(
    "formasjonsarven er beholdt som data",
    tactics.every((tactic) => typeof tactic.formation === "string" && tactic.formation.length > 0)
  );
  check(
    "arven vises som opplysning under valget, ikke i navnet",
    html.includes('id="tacticOriginHint"') && app.includes("-tradisjonen")
  );

  // Synlige etiketter: sr-only sa ingenting til den som ser skjermen.
  const controls = html.match(/<form class="pitch-controls"[\s\S]*?<\/form>/);
  check("taktikkontrollene finnes", Boolean(controls));
  check(
    "begge valgene har en synlig etikett",
    Boolean(controls) &&
      /<label for="formationSelect">Formasjon<\/label>/.test(controls[0]) &&
      /<label for="tacticSelect">Kampplan<\/label>/.test(controls[0]) &&
      !/class="sr-only"/.test(controls[0])
  );

  // Modus-linja må ligge utenfor <main>: hver faneseksjon er absolutt posisjonert
  // og dekker hele app-rammen, så et søsken i normal flyt ble tegnet oppå.
  const mainBlock = html.match(/<main\s+class="app-shell"[\s\S]*?<\/main>/);
  check("app-rammen finnes", Boolean(mainBlock));
  check(
    "modus-linja ligger utenfor app-rammen",
    Boolean(mainBlock) && !mainBlock[0].includes('id="secondaryModeBar"') && html.includes('id="secondaryModeBar"')
  );

  // Brikkene må kunne krympe: uten disse rant innholdet ut i sidene selv om
  // boksene ikke kolliderte — noe en ren boks-måling aldri fanget.
  const chipRule = css.match(/\.player-chip \{[\s\S]*?\n\}/);
  check("brikkeregelen finnes i CSS", Boolean(chipRule));
  check(
    "brikka kan krympe under innholdets minstebredde",
    Boolean(chipRule) && /grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(chipRule[0])
  );
  check(
    "ingenting kan renne ut av brikka",
    Boolean(chipRule) && /overflow:\s*hidden/.test(chipRule[0])
  );
  check(
    "smal brikke dropper posisjonsmerket",
    css.includes('.pitch[data-narrow="true"] .chip-pos') && app.includes("PITCH_NARROW_CHIP_PX")
  );
}

// ---- 16) App-rammen kan ikke kollapse ---------------------------------------
// Body er et grid med faste rader. Uten EKSPLISITT radplassering tildeles de
// etter rekkefølgen av SYNLIGE barn — og da flyttet en skjult modus-linje (og
// de seksten popupene som bor på body-nivå) hele oppsettet: footeren fikk den
// fleksible raden, og spillflaten kollapset til 20 piksler. DOM-en så helt
// riktig ut; skjermen var tom.
stage("16. App-rammen kan ikke kollapse");
{
  const bodyRule = css.match(/\nbody \{[\s\S]*?\n\}/g)?.find((rule) => rule.includes("grid-template-rows"));
  check("body er et grid med faste rader", Boolean(bodyRule));
  check(
    "skjermområdet har en fleksibel rad",
    Boolean(bodyRule) && /minmax\(0,\s*1fr\)/.test(bodyRule)
  );
  // Hver ramme-del må ha sin egen rad, uansett hva som er skjult.
  const explicitRows = [
    ["body > .site-header", 1],
    ["body > nav", 2],
    ["body > .secondary-mode-bar", 3],
    ["body > .app-shell", 4],
    ["body > .site-footer", 5]
  ];
  explicitRows.forEach(([selector, row]) => {
    const index = css.indexOf(`${selector} {`);
    const block = index >= 0 ? css.slice(index, css.indexOf("}", index)) : "";
    check(`${selector} har eksplisitt rad ${row}`, block.includes(`grid-row: ${row}`), block.trim().slice(0, 60));
  });

  // Samme familie av feil ett nivå ned: faneflata er en kolonne-flexboks med
  // `height: 100%` og `overflow-y: auto`. Uten `flex: 0 0 auto` på barna har de
  // `flex-shrink: 1` — og da KLEMMES panelene sammen i stedet for at flata
  // ruller. `.dept-hero` har `overflow: hidden` og falt til 38px: bare en
  // eyebrow igjen, overskrift, ingress og knapper borte. Ingen feilmelding,
  // ingenting som manglet i DOM-en.
  const sectionRule = css.indexOf(".app-shell > .tab-section > * {");
  const sectionBlock = sectionRule >= 0 ? css.slice(sectionRule, css.indexOf("}", sectionRule)) : "";
  check(
    "faneflatas barn krymper ikke (flex: 0 0 auto) — flata ruller i stedet",
    /flex:\s*0\s+0\s+auto/.test(sectionBlock),
    sectionBlock.trim().slice(0, 60) || "regelen mangler"
  );
}

// ---- 17) Menyen lyver ikke -------------------------------------------------
// Den verste blindveien er ikke en tom flate — det er en fane som sender deg et
// annet sted enn navnet sitt sier. «Stab» åpnet Assistentråd, «Klubb» åpnet
// Trening og «Analyse» åpnet Scenarioer, samtidig som «Stab» og «Klubb» også
// fantes i en nedtrekksmeny og pekte på HELT andre flater. Da hjelper det ikke
// at hver enkelt flate finnes: du kan ikke lære deg huset.
stage("17. Menyen lyver ikke");
{
  const buttons = navTabButtons();
  const navTabs = buttons.filter((b) => b.isNavTab);
  const departments = buttons.filter((b) => b.isDepartment);

  // 17a) Manageruka i spillet: nøyaktig disse fem, i denne rekkefølgen.
  const gameLoop = navTabs.filter((b) => b.navModes.includes("league"));
  const expected = [
    ["Kontor", "dashboard"],
    ["Trening", "trening"],
    ["Taktikk", "tactics"],
    ["Kamp", "kamp"],
    ["Analyse", "analyse"],
    ["Statistikk", "statistikk"]
  ];
  check(
    "hovedmenyen i ligaspill er Kontor → Trening → Taktikk → Kamp → Analyse → Statistikk",
    gameLoop.length === expected.length &&
      gameLoop.every((b, i) => b.label === expected[i][0] && b.target === expected[i][1]),
    gameLoop.map((b) => `${b.label}→${b.target}`).join(", ")
  );

  // 17b) Ingen etikett to steder. To «Stab» som peker på hver sin flate er en
  // meny du ikke kan stole på.
  const labels = buttons.filter((b) => b.label).map((b) => b.label);
  const duplicated = labels.filter((label, i) => labels.indexOf(label) !== i);
  check(
    "ingen navigasjonsetikett finnes to steder med ulikt mål",
    duplicated.length === 0,
    [...new Set(duplicated)].join(", ")
  );

  // 17c) Hver nav-fane sier hvilke modi den hører hjemme i, og app.js håndhever det.
  const missingModes = navTabs.filter((b) => b.navModes.length === 0);
  check(
    "hver nav-fane bærer data-nav-modes",
    missingModes.length === 0,
    missingModes.map((b) => b.target).join(", ")
  );
  check("app.js har applyModeScopedNav", /function applyModeScopedNav\(/.test(app));
  check("renderModeIsolation kaller applyModeScopedNav", /applyModeScopedNav\(mode\)/.test(app));

  // 17d) Scenarioer er en egen modus fra forsiden, ikke en fane i spillet.
  const scenarioTab = navTabs.find((b) => b.target === "scenarios");
  check("Scenario-fanen finnes bare i scenariomodus", Boolean(scenarioTab) && scenarioTab.navModes.join(" ") === "scenario",
    scenarioTab ? scenarioTab.navModes.join(" ") : "fanen mangler");
  check("Scenarioer er et eget modusvalg på forsiden", /data-start-mode="scenario"/.test(html));

  // 17e) Fotballvitenskap er en læremodul utenfor spillet: egen modus, og den
  // åpner formasjonsbiblioteket — ikke lagets treningsuke.
  const scienceTab = navTabs.find((b) => b.target === "hgfmLibrary");
  check("Fotballvitenskap-fanen finnes bare i sin egen modus", Boolean(scienceTab) && scienceTab.navModes.join(" ") === "training",
    scienceTab ? scienceTab.navModes.join(" ") : "fanen mangler");
  check("Fotballvitenskap heter ikke lenger Treningsrom", !/Treningsrom/.test(html) && !/Treningsrom/.test(app));
  check(
    "Fotballvitenskap-modus åpner formasjonsbiblioteket, ikke Trening",
    /mode === "training"[\s\S]{0,400}?activateTab\("hgfmLibrary"\)/.test(app),
    "modusvalget sendte deg tidligere rett inn i lagets treningsflate"
  );

  // 17f) Kontoret er der du gjør kontorarbeidet: speiding og stab ligger der.
  const deptTargets = new Set(departments.map((b) => b.target));
  for (const target of ["historygo", "admin", "market", "board"]) {
    check(`Kontorets avdelinger inneholder ${target}`, deptTargets.has(target));
  }
  check("Speiding er ikke lenger en egen hovedfane", !navTabs.some((b) => b.target === "historygo"));
  check("Stab er ikke lenger en hovedfane som åpner innboksen", !navTabs.some((b) => b.label === "Stab"));

  // 17g) Nedtrekksmenyen som duplikerte kontorflatene er borte.
  check("den duplikate kontor-nedtrekksmenyen er fjernet", !/navOfficeMenu/.test(html) && !/navOfficeMenu/.test(app));
}

// ---- 18) Statistikken har et sted, og et innhold ---------------------------
// Tabellen lå i en popup bak en knapp på Kontor, og prøveperioden som et kort
// i dashbordet. To flater med sesongtall, ingen av dem der du ville lett.
stage("18. Statistikk");
{
  check("Statistikk er en egen faneseksjon", tabSections.has("statistikk"));
  check("tabellen ligger ikke lenger i en popup på Kontor", !/modalLeagueTable/.test(html) && !/modalLeagueTable/.test(app));
  const section = (() => {
    const i = html.indexOf('data-tab-section="statistikk"');
    if (i < 0) return "";
    const end = html.indexOf('<div class="tab-section', i + 10);
    return html.slice(i, end > 0 ? end : html.length);
  })();
  check("ligatabell og terminliste ligger på Statistikk", /id="leagueSeasonOverview"/.test(section));
  check("spillerstatistikken har en tabellflate", /id="playerStatsTable"/.test(section));

  // Motoren må faktisk kreditere målene, ellers er scoringslista alltid tom.
  check("kampmotoren attribuerer mål til en spiller", /attributeGoal\(/.test(engine));
  check("kampmotoren tar vare på elleveren ved avspark", /lineupSnapshot: createLineupSnapshot\(teamFit\)/.test(engine));
  check("kampresultatet bærer spillerstatistikk", /playerStats: createMatchPlayerStats\(/.test(engine));
  check("app.js akkumulerer statistikken per sesong", /registerMatchInPlayerStats\(/.test(app));
  check("statistikken er isolert per modus", /"playerSeasonStats"/.test(modeSessions));

  // Klubbuka skal sende deg et sted.
  check("klubbukens faser navigerer", /CLUB_WEEK_PHASE_TABS/.test(app) && /activateTab\(target\)/.test(app));

  // Boksene som skulle bort.
  check("«Klubben din»-boksen er fjernet fra Kontor", !/id="leagueClubCard"/.test(html));
  check("«Spillmodus»-boksen er fjernet fra Kontor", !/id="gameModeStatusCard"/.test(html));
  check("modusbyttet finnes fortsatt i Innstillinger", /data-settings-action="mode"/.test(html));
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

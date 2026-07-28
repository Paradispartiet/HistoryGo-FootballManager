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
const subsEngine = readFileSync(join(root, "src/football-substitutions.js"), "utf8");

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
    // Kontorets underfaner er også navigasjon, og skal derfor følge de samme
    // reglene: en «Senere»-flate må være deaktivert, og ingen etikett skal peke
    // to steder. Uten dette var stripa et blindsonefelt for hele vakten.
    const isSubtab = /\bapp-subtab\b/.test(openTag);
    if (!isNavTab && !isDepartment && !isSubtab) continue;
    buttons.push({
      target: m[1],
      openTag,
      inner: m[2],
      label: (m[2].match(/<span class="nav-label">([^<]+)<\/span>/) || m[2].match(/<strong>([^<]+)<\/strong>/) || [])[1]
        || (isSubtab ? m[2].replace(/<[^>]*>[\s\S]*?<\/[^>]*>/g, "").replace(/<[^>]*>/g, "").trim() : "")
        || "",
      navModes: (openTag.match(/data-nav-modes="([^"]*)"/) || [, ""])[1].split(/\s+/).filter(Boolean),
      isNavTab,
      isDepartment,
      isSubtab,
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
    ["body > nav.main-nav", 2],
    ["body > .secondary-mode-bar", 3],
    ["body > nav.app-subnav", 4],
    ["body > .app-shell", 5],
    ["body > .site-footer", 6]
  ];
  explicitRows.forEach(([selector, row]) => {
    const index = css.indexOf(`${selector} {`);
    const block = index >= 0 ? css.slice(index, css.indexOf("}", index)) : "";
    check(`${selector} har eksplisitt rad ${row}`, block.includes(`grid-row: ${row}`), block.trim().slice(0, 60));
  });

  // Denne fella har nå slått til to ganger: først da en skjult modus-linje
  // flyttet alle radene, så da kontorets underfanestripe (også en <nav>) arvet
  // hovedmenyens rad fra en generisk `body > nav` og ble tegnet oppå den —
  // skjermområdet forsvant helt. Derfor to strukturelle krav:
  //
  //   a) ANTALL rader i grid-template-rows må stemme med antall ramme-deler.
  //   b) INGEN selektor får treffe to ramme-deler (ingen bar `body > nav`).
  const rowSpec = (bodyRule || "").match(/grid-template-rows:\s*([^;]+);/)?.[1]?.trim() || "";
  const rowCount = rowSpec.split(/\s+(?![^(]*\))/).filter(Boolean).length;
  check(
    `grid-template-rows har én rad per ramme-del (${rowCount} rader, ${explicitRows.length} deler)`,
    rowCount === explicitRows.length,
    rowSpec
  );
  check(
    "ingen generisk `body > nav`-regel som kan treffe to menyer",
    !/\nbody > nav \{/.test(css),
    "en bar `body > nav` ga underfanestripa samme rad som hovedmenyen"
  );
  // Hvert <nav> i rammen må faktisk ha fått en rad tildelt.
  const bodyNavClasses = [...html.matchAll(/<nav class="([^"]+)"/g)]
    .map((m) => m[1].split(/\s+/)[0])
    .filter((cls) => cls === "main-nav" || cls === "app-subnav");
  check(
    "hver meny i rammen har sin egen eksplisitte rad",
    bodyNavClasses.every((cls) => css.includes(`body > nav.${cls} {`)),
    bodyNavClasses.join(", ")
  );

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

  // 17f) Kontoret er der du gjør kontorarbeidet, og flatene ligger i UNDERFANER
  // i stedet for i en vegg av kort. Vakten måler intensjonen — at hver
  // kontorflate er direkte tilgjengelig fra Kontor — ikke hvilken widget som
  // brukes til å komme dit.
  const subtabs = [...html.matchAll(/<button\b[^>]*\bclass="[^"]*app-subtab[^"]*"[^>]*\bdata-tab-target="([^"]+)"/g)].map((m) => m[1]);
  const officeTargets = new Set([...subtabs, ...departments.map((b) => b.target)]);
  for (const target of ["dashboard", "historygo", "progression", "admin", "inbox", "market", "board", "facilities"]) {
    check(`Kontorflaten ${target} er en underfane på Kontor`, officeTargets.has(target));
  }
  // Taktikk er delt på samme måte: tavla, troppen og systemet.
  for (const target of ["tactics", "squad", "system"]) {
    check(`Taktikkflaten ${target} er en underfane på Taktikk`, officeTargets.has(target));
  }
  check("underfanestripa finnes", /id="appSubnav"/.test(html) && /function renderSubtabs\(/.test(app));
  check(
    "stripa vises bare når du står på én av flatene den lister",
    /subnav\.hidden = group\.length === 0 \|\| !onGroupSurface/.test(app)
  );
  // Én stripe for hele appen. En stripe til ville krevd en rad til i
  // body-gridet — nøyaktig fella som alt har kostet oss én gang.
  check(
    "det finnes bare ÉN underfanestripe",
    (html.match(/<nav class="app-subnav"/g) || []).length === 1
  );
  check(
    "hver underfane sier hvilken hovedfane den hører til",
    subtabs.length > 0 && (html.match(/class="app-subtab[^"]*"[^>]*data-subnav-parent="/g) || []).length === subtabs.length
  );
  check(
    "hver underfane peker på en seksjon som faktisk finnes",
    subtabs.every((target) => new RegExp(`data-tab-section="${target}"`).test(html)),
    subtabs.filter((target) => !new RegExp(`data-tab-section="${target}"`).test(html)).join(", ")
  );
  check(
    "hver kontorflate sier at Kontor eier den",
    ["historygo", "progression", "admin", "inbox", "market", "board", "facilities"].every(
      (target) => new RegExp(`data-tab-section="${target}"[^>]*data-tab-parent="dashboard"`).test(html)
    )
  );
  check(
    "hver taktikkflate sier at Taktikk eier den",
    ["squad", "system"].every(
      (target) => new RegExp(`data-tab-section="${target}"[^>]*data-tab-parent="tactics"`).test(html)
    )
  );
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
  // Sjekker INTENSJONEN, ikke den nøyaktige teksten: snapshotet bygges fra
  // teamFit. Argumentlista utvides når nye lag kobles på (friskhet ved avspark),
  // uten at noe faktisk er galt.
  check("kampmotoren tar vare på elleveren ved avspark", /lineupSnapshot: createLineupSnapshot\(teamFit[,)]/.test(engine));
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

// ---- 19) Benken er en mulighet, ikke bare et krav --------------------------
// Spillet KREVDE fire benkespillere før du fikk spille, og så kom ingen av dem
// noen gang inn. En tvungen input uten konsekvens er samme blindvei som en fane
// som ikke sender deg noe sted — den ser bare ut som en beslutning.
stage("19. Innbytte");
{
  check("spillet krever fortsatt en benk", /REQUIRED_BENCH\s*=\s*4/.test(app));
  check("innbyttemotoren finnes og er ren", /export function applySubstitution/.test(subsEngine) && !/document\.|localStorage/.test(subsEngine));
  check("benken vurderes mot hver plass ved avspark", /benchSnapshot: createBenchSnapshot\(/.test(engine));
  check("app.js sender faktisk benken inn i kampen", /benchPlayers: getAvailability\(\)/.test(app));
  check("byttet er wiret i kampflaten", /appendMatchSubstitutions\(card, session\)/.test(app) && /function makeSubstitution\(/.test(app));
  check("byttet summeres i resultatet som grepene", /sumDecisionEffects\(\[\.\.\.decisions, \.\.\.planChanges, \.\.\.substitutions\]\)/.test(engine));
  check("byttet står i kamprapporten", /function appendSubstitutionLog/.test(app));
  check("byttet står i minuttloggen", /type: "substitution"/.test(engine) && /substitution: "Innbytte"/.test(app));

  // Spilletid: en innbytter må få kampen sin, ellers er statistikken en løgn.
  check("statistikken teller alle som var på banen", /playedPlayersFor\(session, 90\)/.test(engine));
  check("statistikken fører minutter", /row\.minutes \+=/.test(readFileSync(join(root, "src/football-player-stats.js"), "utf8")));

  // Byttet skal måles på PLASSEN, ikke på klassen.
  check(
    "innbyttet vurderes mot plassen spilleren går inn i",
    /fitBySlot/.test(subsEngine) && /matchScoreBefore/.test(subsEngine) && /matchScoreAfter/.test(subsEngine)
  );
  check("innbyttemotoren avgjør ikke på overall", !/\boverall\b/.test(subsEngine.replace(/\/\/.*$/gm, "")));

  // Sluttrapporten viste overskriften «Kampen minutt for minutt» med ingenting
  // under: en ferdig kamp har ikke klokke (`liveMinute`), så avdekkingsfilteret
  // strøk hele loggen. Overskrift uten innhold er en blindvei i miniatyr.
  check(
    "minuttloggen vises i sluttrapporten, ikke bare under avspilling",
    /if \(session\?\.outcome \|\| session\?\.phase === "resolved"\) return log;/.test(app)
  );
}

// ---- 20) Bruken har en pris ------------------------------------------------
// Innbytte gjorde benken til en mulighet, men det var fortsatt gratis å la
// stjernen stå 90 minutter hver uke: ingen ble sliten, ingen skadet, ingen
// mistet form. Da er ikke rotasjon en avveining — bare noe du KAN gjøre.
stage("20. Form og slitasje");
{
  const condition = readFileSync(join(root, "src/football-player-condition.js"), "utf8");

  check("tilstandsmotoren finnes og er ren", /export function applyMatchToConditions/.test(condition) && !/document\.|localStorage/.test(condition));
  check("motoren dømmer ikke spilleren på overall", !/\boverall\b/.test(condition.replace(/\/\/.*$/gm, "")));
  check("skader er deterministiske (injisert rng)", /rng = Math\.random/.test(condition) && !/[^.]Math\.random\(\)/.test(condition.replace(/rng = Math\.random/g, "")));

  check("kampen legger belastning på troppen", /registerMatchInPlayerCondition\(/.test(app));
  check("uka gir hvile", /applyWeeklyPlayerRecovery\(\)/.test(app) && /applyWeeklyRecovery\(/.test(app));
  check("slitasjen virker inn på lagstyrken", /conditionPenalty: getSquadFatiguePenalty\(teamFit\)/.test(app) && /finalStrength -= fatiguePenalty/.test(engine));
  check("en sliten starter er tommere tidligere", /startFreshness/.test(readFileSync(join(root, "src/football-substitutions.js"), "utf8")));
  check("tilstanden er isolert per modus", /"playerCondition"/.test(modeSessions));

  // Synlighet: skjult slitasje er en felle, ikke en avveining.
  // At funksjonen FINNES er ikke nok — den må kalles fra render-løypa. Første
  // forsøk havnet inne i en klikk-handler, så flata oppdaterte seg bare hvis du
  // tilfeldigvis trykket på en sorteringsknapp. Vakta så bare at kallet fantes.
  check("tilstanden vises der du velger laget", /function renderSquadCondition/.test(app) && /className = `player-condition/.test(app));
  check(
    "tilstandsflata rendres fra renderApp, ikke bare fra en klikk-handler",
    /\n  renderPlayerStats\(\);\n  renderSquadCondition\(\);/.test(app),
    "kallet må stå i render-løypa"
  );
  check("Trening har en tilstandsflate", /id="squadConditionList"/.test(html));

  // Og den viktigste regelen av alle: skader skal aldri kunne tømme elleveren.
  check(
    "skader kan aldri gjøre startelleveren ufyllbar",
    /const injured = injuredPlayerIds\(getPlayerCondition\(\)\)/.test(app) &&
      /\(candidate\) => fit\(candidate\),\s*\n\s*\(\) => true/.test(app),
    "siste nivå må slippe gjennom alle, også skadde"
  );
}

// ---- 21) Scenarioer er flertall ------------------------------------------
// Scenarioer var en hel spillmodus med ETT innhold: Ajax 1971–73, hardkodet som
// et kort i HTML og en id i app.js. Overskriften lovet «historiske og taktiske
// utfordringer» i flertall og leverte én.
stage("21. Scenarioer");
{
  const scenarios = JSON.parse(readFileSync(join(root, "data/football_scenarios.json"), "utf8"));
  check("katalogen har flere scenarioer", (scenarios.scenarios || []).length > 1, `antall=${(scenarios.scenarios || []).length}`);
  check("scenariolista bygges fra data", /id="scenarioList"/.test(html) && /function renderScenarioList/.test(app));
  check("ingen scenario-kort er hardkodet i HTML", !/class="scenario-card"/.test(html));
  check("den hardkodede Ajax-knappen er borte", !/startAjaxScenarioButton/.test(html) && !/startAjaxScenarioButton/.test(app));
  check("hvert scenario kan startes fra kortet sitt", /function startScenario\(/.test(app) && /startScenario\(info\.id\)/.test(app));
  check("scenarioet former hvem du møter", /createScenarioMiniSeasonContext\(scenario, base\)/.test(app));
  check("scenariolista rendres fra renderApp", /\n  renderScenarioList\(\);/.test(app));
}

// ---- 22) Sesongen får en slutt som betyr noe ------------------------------
// Ligasesongen KUNNE avsluttes — status ble «completed», og en «Start ny
// sesong»-knapp dukket opp. Men styrets forventning var en setning satt da
// klubben ble opprettet, som ingen målte deg mot, og sesong 2 startet som om
// sesong 1 aldri hadde skjedd.
stage("22. Sesongdom");
{
  const review = readFileSync(join(root, "src/football-season-review.js"), "utf8");

  check("sesongdom-motoren finnes og er ren", /export function createSeasonReview/.test(review) && !/document\.|localStorage/.test(review));
  check("styrets mål er en tabellplass, ikke en stemning", /targetPosition/.test(review) && /export function deriveSeasonTarget/.test(review));
  check("dommen felles når sesongen fullføres", /registerSeasonReview\(updated\)/.test(app));
  check("dommen vises på Statistikk", /id="seasonReviewPanel"/.test(html) && /function renderSeasonReview/.test(app));
  check("dommen rendres fra render-løypa", /\n  renderSeasonReview\(\);/.test(app));

  // Sesongen skal huskes.
  check("merittlista finnes", /id="seasonArchiveTable"/.test(html) && /appendSeasonArchive\(/.test(app));
  check("merittlista er isolert per modus", /"seasonArchive"/.test(modeSessions));

  // Rullen til neste sesong må faktisk rulle.
  check("ny sesong nullstiller spillerstatistikken", /state\.playerSeasonStats = \{ rows: \[\], matchIds: \[\] \};[\s\S]{0,200}savePlayerSeasonStats\(\)/.test(app));
  check("ny sesong gir troppen sommerferie", /applySummerBreak\(getPlayerCondition\(\)\)/.test(app));
  check("sesongen arkiveres før rullen", /registerSeasonReview\(state\.leagueSeason\)/.test(app));

  // Og ingen skal sparkes av ett uhell.
  check("advarselen kommer før sparken", /const sacked = verdict === "failed" && hadWarning/.test(review));
}

// ---- 23) Ingen render-funksjon skriver til luft ----------------------------
// `renderLeagueOnboarding()` skrev til fire `elements.leagueOnboarding*` som
// ALDRI ble definert i elements-objektet, og til fire id-er som ikke fantes i
// index.html. Funksjonen returnerte stille, og hele før-sesong-sjekklista var
// usynlig — eneste vei til seriestart var «Neste handling» i footeren.
//
// `check:dom-ids` så det ikke: den sjekker `querySelector("#id")`-oppslag, og
// her fantes ingen oppslag i det hele tatt. Dette er den generelle regelen som
// fanger hele klassen.
stage("23. Ingen render skriver til luft");
{
  const used = new Set([...app.matchAll(/\belements\.([A-Za-z0-9_]+)/g)].map((m) => m[1]));

  // Hent ut elements-objektet ved å telle klammer, ikke med regex.
  const start = app.indexOf("const elements = {");
  let defined = new Set();
  if (start >= 0) {
    let depth = 0;
    let i = start + "const elements = {".length - 1;
    for (; i < app.length; i += 1) {
      if (app[i] === "{") depth += 1;
      else if (app[i] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const block = app.slice(start, i + 1);
    defined = new Set([...block.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)].map((m) => m[1]));
  }

  const missing = [...used].filter((name) => !defined.has(name)).sort();
  check(
    "hver elements.X som brukes er faktisk definert",
    missing.length === 0,
    missing.map((name) => `elements.${name}`).join(", ")
  );

  // Og selve før-sesong-panelet skal finnes, med steg som navigerer.
  check("før-sesong-panelet finnes i DOM", /id="leagueOnboardingPanel"/.test(html) && /id="leagueOnboardingSteps"/.test(html));
  check("hvert før-sesong-steg er en knapp som navigerer", /button\.addEventListener\("click", \(\) => activateLeagueOnboardingTarget\(step\)\)/.test(app));
  check("panelet skjuler seg selv når alt er klart", /panel\.hidden = !active \|\| done/.test(app));
}

// ---- 24) Mesterskapet gjøres opp -------------------------------------------
// Landslagsmodus HADDE en merittliste, men ingen hadde en mening om den: å ryke
// i gruppa med Brasil og å nå semifinalen med Norge sto som samme slags linje.
stage("24. Forbundets dom");
{
  const fed = readFileSync(join(root, "src/football-federation-verdict.js"), "utf8");

  check("dom-motoren finnes og er ren", /export function createFederationVerdict/.test(fed) && !/document\.|localStorage/.test(fed));
  check("forventningen følger nasjonens styrke", /export function deriveFederationExpectation/.test(fed) && /minStrength/.test(fed));
  check("dommen felles når mesterskapet er ferdig", /createFederationVerdict\(\{/.test(app) && /state\.federationVerdict = verdict/.test(app));
  check("dommen vises i landslagsflata", /id="federationVerdict"/.test(html) && /#federationVerdictHeadline/.test(app));
  check("merittlista viser dommen", /entry\.verdictLabel/.test(app));
  check("forbundets tillit er modus-isolert", /"federationTrust"/.test(modeSessions));
  check("advarselen kommer før avskjed", /const sacked = verdict === "failed" && hadWarning/.test(fed));
  check("dommen leser ikke overall", !/\boverall\b/.test(fed.replace(/\/\/.*$/gm, "")));
}

stage("25. Treningsuka har én rekkefølge");
{
  // Flata hadde tre treningsvalg som så sidestilte ut: «Trening etter Innboks»
  // (en overskrift uten noe å velge i), ukens treningsfokus og treningsprogram.
  // To av dem gjorde overlappende ting, og ingenting sa hvilken rekkefølge de
  // hørte hjemme i. Det er en blindvei av forvirring, ikke av manglende knapper:
  // du kan trykke overalt uten å forstå hva du nettopp gjorde.
  const plan = readFileSync(join(root, "src/football-training-plan.js"), "utf8");
  const individual = readFileSync(join(root, "src/football-individual-training.js"), "utf8");

  check("planmotoren finnes og er ren", /export function createWeeklyTrainingPlan/.test(plan) && !/document\.|localStorage/.test(plan.replace(/\/\/.*$/gm, "")));
  check("uka har fire steg i fast rekkefølge", /id: "inbox"[\s\S]{0,2000}id: "program"[\s\S]{0,2000}id: "focus"[\s\S]{0,2000}id: "individual"/.test(plan));
  check("hvert steg peker videre (popup eller fane)", /modal: "modalTrainingProgram"/.test(plan) && /target: "inbox"/.test(plan));
  check("planen viser alltid neste steg", /nextStepId/.test(plan) && /elements\.trainingPlanNext/.test(app));
  check("planflata finnes og rendres fra render-løypa", /id="trainingPlanSteps"/.test(html) && /\n  renderWeeklyTrainingPlan\(\);/.test(app));

  // Rammen og temaet må henge sammen — og spriket må forklares som et
  // managervalg, ikke som en spillersvakhet.
  check("samsvar ramme/tema er en ekte regel", /export function evaluateProgramFocusCoherence/.test(plan) && /metricBonusDelta/.test(plan));
  check("samsvaret når kampdagen", /coherenceBonus: evaluateProgramFocusCoherence\(/.test(app));
  check("et sprik nuller aldri ut treningsuka", /Math\.max\(1, \(contextRelevant/.test(readFileSync(join(root, "src/football-training-week.js"), "utf8")));

  // Programmets egne belastningstall må faktisk brukes. Lå de ubrukt, var ukas
  // ramme mekanisk uten virkning — samme klasse feil som skalafeilene.
  check("programmets belastning normaliseres mot kildens spenn", /PROGRAM_LOAD_MIN/.test(plan) && /PROGRAM_LOAD_MAX/.test(plan) && /- PROGRAM_LOAD_MIN\) \/ \(PROGRAM_LOAD_MAX - PROGRAM_LOAD_MIN\)/.test(plan));
  check("belastningen styrer restitusjonen", /calculateWeeklyTrainingIntensity\(\{[\s\S]{0,200}\}\);\n  state\.playerCondition = applyWeeklyRecovery/.test(app));

  // Individuell trening: en manager uten stab må fortsatt kunne følge opp noen.
  check("individuell trening finnes og er datadrevet", /export function resolveIndividualTrainingWeek/.test(individual) && !/role_drills/.test(individual));
  check("kapasiteten er aldri null", /base: 1/.test(individual) || /clamp\(Math\.trunc\(num\(rawCapacity\.base, DEFAULT_CAPACITY\.base\)\), 1, 5\)/.test(individual));
  check("individuell trening hever aldri overall", !/\boverall\b/.test(individual.replace(/\/\/.*$/gm, "")));
  check("et avvist spor har alltid en grunn", /valid: false, reason:/.test(individual));
  check("flata for individuell trening finnes", /id="individualTrainingPicker"/.test(html) && /renderIndividualTraining/.test(app));

  // Detaljene ligger i popup-er, ikke som en scrollevegg av like store bokser.
  check("valgene ligger i popup-er", /data-modal-open="modalTrainingProgram"/.test(html) && /data-modal-open="modalTrainingFocusPick"/.test(html) && /data-modal-open="modalIndividualTraining"/.test(html));
  check("Trening-flata er ikke lenger en vegg av paneler", (html.match(/<div class="tab-section trening-view"[\s\S]*?\n    <\/div>/)?.[0]?.match(/<section class="panel/g) || []).length <= 2);
}

stage("26. Svake sider er en dør, ikke en dom");
{
  // «Alle spillere har svakheter» er én setning unna «noen spillere er
  // dårligere». Denne vakten holder den setningen på riktig side: svake sider
  // trekker aldri fra, de identifiseres ut av data som allerede fantes, og
  // arbeidet med dem åpner roller i stedet for å heve klasse.
  const weak = readFileSync(join(root, "src/football-player-weaknesses.js"), "utf8");
  const weakCode = weak.replace(/\/\/.*$/gm, "");
  const matchday = readFileSync(join(root, "src/football-matchday-engine.js"), "utf8");

  check("motoren finnes og er ren", /export function identifyPlayerWeaknesses/.test(weak) && !/document\.|localStorage/.test(weakCode));
  check("den leser aldri overall eller matchScore", !/\boverall\b/.test(weakCode) && !/matchScore/.test(weakCode));
  check("svakhetene er data, ikke hardkodet", /id="modalWeaknesses"/.test(html) && !/weaknessLabel:/.test(app));
  check("uttellingen er en BONUS, aldri et fratrekk", /finalStrength \+= weaknessBonus/.test(matchday) && !/finalStrength -= weaknessBonus/.test(matchday));
  check("bonusen er liten og klampet", /clampRange\(num\(weaknessWorkBonus\), 0, 4\)/.test(matchday));
  check("den betaler bare når spilleren står i rollen som krever det", /export function summarizeLineupWeaknessWork/.test(weak) && /openedDoors/.test(weak));
  check("ubrukt arbeid skjules ikke", /idleWork/.test(weak) && /idleWork/.test(app));
  check("hver spiller kan gjøre noe med dem", /export function applyWeaknessTraining/.test(weak) && /requires === "weakness"/.test(readFileSync(join(root, "src/football-individual-training.js"), "utf8")));
  check("et avvist svakhetsvalg har en grunn", /Dette er ikke en av hans svake sider/.test(readFileSync(join(root, "src/football-individual-training.js"), "utf8")));
  check("framgangen er modus-uavhengig lagret i teamMerits, ikke i History Go", /state\.teamMerits\.weaknessProgress = applyWeaknessTraining/.test(app) && !/visited_places[\s\S]{0,80}weakness/.test(app));
  check("flata forklarer at det ikke er en dom", /ikke en dom over dem/.test(html));
}

stage("27. Ingen funksjon to steder");
{
  // «Pass på at vi ikke har doble funksjoner, altså samme funksjon to
  // forskjellige steder.» To knapper som gjør det samme er ikke dobbelt så
  // hjelpsomt — det er to modeller av huset du må holde i hodet samtidig.

  // a) Snarveier til HOVEDFANER hører hjemme i hovedmenyen. En popup full av
  //    dem er menyen én gang til, i en skuff. («Gå til rom» var nettopp det.)
  const primaryTargets = new Set(
    [...html.matchAll(/<button\b[^>]*\bclass="[^"]*nav-tab-primary[^"]*"[^>]*\bdata-tab-target="([^"]+)"/g)].map((m) => m[1])
  );
  const modalShortcutsToPrimary = [...html.matchAll(/<div class="modal-overlay"[\s\S]*?<\/div>\s*<\/div>/g)]
    .flatMap((m) => [...m[0].matchAll(/data-tab-target="([^"]+)"/g)].map((t) => t[1]))
    .filter((target) => primaryTargets.has(target));
  check(
    "ingen popup er en kopi av hovedmenyen",
    modalShortcutsToPrimary.length <= 2,
    `popup-snarveier til hovedfaner: ${[...new Set(modalShortcutsToPrimary)].join(", ")}`
  );

  // b) Samme flate skal ikke ha to knapper til samme sted.
  const sections = [...html.matchAll(/<div class="tab-section[^"]*" data-tab-section="([^"]+)"[\s\S]*?(?=\n    <!-- =====|\n  <div class="modal-overlay")/g)];
  const dupes = [];
  for (const section of sections) {
    const targets = [...section[0].matchAll(/data-tab-target="([^"]+)"/g)].map((m) => m[1]);
    const seen = new Set();
    for (const target of targets) {
      if (seen.has(target) && !dupes.includes(`${section[1]}→${target}`)) dupes.push(`${section[1]}→${target}`);
      seen.add(target);
    }
  }
  check("ingen flate har to knapper til samme sted", dupes.length === 0, dupes.join(", "));

  // c) Én id = ett sted. Duplikate id-er betyr at samme kontroll er tegnet to
  //    ganger, og at app.js bare finner den ene av dem.
  const ids = [...html.matchAll(/\sid="([A-Za-z0-9_-]+)"/g)].map((m) => m[1]);
  const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  check("ingen id finnes to ganger i markupen", dupIds.length === 0, dupIds.join(", "));

  // d) Én popup åpnes fra ett sted. Åpnes den fra to, er den to innganger til
  //    samme funksjon — og da hører innholdet trolig hjemme på en flate.
  const openers = [...html.matchAll(/data-modal-open="([A-Za-z0-9_-]+)"/g)].map((m) => m[1]);
  const dupOpeners = [...new Set(openers.filter((id, i) => openers.indexOf(id) !== i))];
  check("ingen popup åpnes fra to steder", dupOpeners.length === 0, dupOpeners.join(", "));

  // e) De tre snarveiene som lå på Speiding skal være borte for godt: staben
  //    hører til Stab & drift, stedene til Speiding selv, startvalget til
  //    Oversikt, og Klubbutvikling hadde alt sin egen underfane.
  check("stabslistene ligger på Stab & drift", /data-tab-section="admin"[\s\S]*?id="availableStaffList"[\s\S]*?id="hiredStaffList"[\s\S]*?<!-- =+ MARKED/.test(html));
  check("stedene ligger på Speiding", /data-tab-section="historygo"[\s\S]*?id="unlockPlacesList"[\s\S]*?id="placeReportsList"/.test(html));
  check("startvalget ligger i før-sesong-panelet på Oversikt", /id="leagueOnboardingPanel"[\s\S]*?id="startModePanel"/.test(html));
  check("de gamle popupene er borte", !/modalStaff|modalPlaces|modalStart\b|modalRooms/.test(html) && !/modalStaff|modalPlaces|modalRooms/.test(app));
  check("onboarding-steget for stab peker på flata der staben faktisk er", /stab: \{ tab: "admin", selector: "#availableStaffList" \}/.test(app));
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

import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const files = {
  runtime: read("../src/ui/manager-visual-identity-v1.js"),
  css: read("../src/ui/manager-visual-identity-v1.css"),
  layout: read("../src/ui/manager-visual-identity-layout-v1.css"),
  shell: read("../src/ui/manager-shell-view.js"),
  identity: read("../src/ui/manager-club-identity.js"),
  docs: read("../docs/MANAGER_VISUAL_IDENTITY_V1.md"),
  browser: read("../tests/browser/manager-visual-identity-v1.spec.js"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml")
};

let checks = 0;
let failures = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

console.log("\nManager Visual Identity v1 audit");

check("visuell kontekst lastes sist i managerskallet", files.shell.includes('import "./manager-visual-identity-v1.js"'));
check("fem hovedområder har eksplisitt sceneområde", ["office", "team", "scouting", "match", "stats"].every((area) => files.runtime.includes(`"${area}"`)));
check("Kalender er tidslinjescene", files.runtime.includes('calendar: "timeline"'));
check("Klubben er organisasjonsscene", files.runtime.includes('board: "organization"'));
check("Lag er banescene", files.runtime.includes('tactics: "pitch"'));
check("Speiding er listescene", files.runtime.includes('historygo: "scouting-list"'));
check("Kamp er kampdagsscene", files.runtime.includes('kamp: "matchday"'));
check("Stats er stats-/dokumentscene", files.runtime.includes('statistikk: "stats"'));
check("ingen ny lagring i visuell runtime", !/localStorage|sessionStorage/.test(files.runtime));
check("ingen ny nettverks- eller tilfeldighetslogikk", !/fetch\(|Math\.random/.test(files.runtime));
check("klubbidentiteten forblir separat presentasjonskilde", files.identity.includes("CLUB_VISUAL_IDENTITIES") && files.css.includes("--club-accent"));
check("områdeaksent blandes med klubbidentitet", files.css.includes("--area-accent") && files.css.includes("color-mix"));
check("klubbfarge brukes som markør, ikke heldekkende lerret", files.docs.includes("ikke") && files.docs.includes("heldekkende bakgrunn") && files.css.includes("var(--club-accent"));
check("ligaspillet låser fem hovedområder", files.runtime.includes("CORE_MANAGER_AREAS") && files.runtime.includes("? 5"));
check("shell-layouten er faktisk grid", files.layout.includes("display: grid") && files.layout.includes("repeat(var(--manager-nav-count, 5)"));
check("gammel Manageruka-etikett er visuelt demotert", files.layout.includes(".nav-group-label-primary") && files.layout.includes("display: none !important"));
check("mobilfanene kan krympe uten menyoverflow", files.layout.includes("min-width: 0 !important") && files.layout.includes("overflow-x: visible !important"));
check("mobilnavn beholdes lesbare", files.css.includes('font-size: .63rem') && !files.css.includes("text-overflow: ellipsis"));
check("underfaner presenteres som underline-kontroll", files.css.includes(".app-subnav .app-subtab.is-active") && files.css.includes("border-bottom-color: var(--area-accent)"));
check("typografisk displayhierarki finnes", files.css.includes("--manager-display-font") && files.css.includes("letter-spacing: -.035em"));
check("dokumentasjonen låser tre visuelle nivåer", files.docs.includes("Hovedscene") && files.docs.includes("Inspektør") && files.docs.includes("Sekundær informasjon"));
check("Kontor har tidslinjekarakter", files.css.includes(".manager-calendar-event-time") && files.css.includes(".manager-calendar-event.has-attention"));
check("Lag lar banen være hovedobjekt", files.css.includes(".pitch-stage") && files.css.includes(".side-panel"));
check("Speiding er tabell/listelesing", files.css.includes(".scouting-player-table") && files.css.includes(".scouting-club-table"));
check("Kamp har egen kampdagsscene", files.css.includes(".matchday-scene") && files.css.includes("border-top: 3px solid var(--area-accent)"));
check("Stats bruker tabulære tall", files.css.includes("font-variant-numeric: tabular-nums"));
check("Pass 6 har 390/768/1280 browservakter", ["390", "768", "1280"].every((width) => files.browser.includes(width)));
check("browser tester fem hovedområder", files.browser.includes("Kontor") && files.browser.includes("Speiding") && files.browser.includes("Stats"));
check("browser krever ekte femkolonne-grid", files.browser.includes('display: "grid"') && files.browser.includes("columns: 5"));
check("browser tester scenevariasjon", files.browser.includes("new Set(backgrounds).size"));
check("browser tester typografisk hierarki", files.browser.includes("headingSize") && files.browser.includes("detailSize"));
check("browser tester global overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browser tester WCAG A/AA", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("simuleringen er registrert", files.package.includes('"sim:manager-visual-identity-v1"'));
check("auditen er registrert", files.package.includes('"audit:manager-visual-identity-v1"'));
check("CI kjører Pass 6-audit", files.ci.includes("audit:manager-visual-identity-v1"));
check("CI kjører Pass 6-simulering", files.ci.includes("sim:manager-visual-identity-v1"));
check("Pass 7 er eksplisitt separat cleanup", files.docs.includes("Pass 7") && files.docs.includes("ikke slette legacy-CSS"));

console.log(`\nManager Visual Identity v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;

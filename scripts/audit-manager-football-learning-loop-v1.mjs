import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const ui = read("src/ui/manager-football-learning-loop-v1.js");
const shell = read("src/ui/manager-shell-view.js");
const css = read("src/ui/manager-football-learning-loop-v1.css");
const browser = read("tests/browser/manager-football-learning-loop-v1.spec.js");
const app = read("src/app.js");

const checks = [
  ["shell importerer læringslaget", shell.includes('import "./manager-football-learning-loop-v1.js";')],
  ["rolledata gjenbrukes", ui.includes("football_roles.json")],
  ["rolle-relasjoner forklares", ui.includes("createRoleRelationshipLesson") && ui.includes("Relasjon til andre roller")],
  ["faktisk ellever leses fra eksisterende spillerbrikker", ui.includes("createActualLineupRoleLesson") && ui.includes("lineupAssignmentsFromPitch")],
  ["spillerbrikkene eksponerer eksisterende spiller-, rolle- og plassvalg", app.includes("chip.dataset.playerName") && app.includes("chip.dataset.roleId") && app.includes("chip.dataset.slotLabel")],
  ["faktiske spillere og plasser navngis", ui.includes("Relasjonen i din faktiske ellever") && ui.includes("actual.selected.playerName") && ui.includes("actual.partner.slotLabel")],
  ["manglende kuratert rollepar forklares uten dom", ui.includes("Ikke representert i elleveren") && ui.includes("Det betyr ikke at oppstillingen er feil")],
  ["faktisk rollepar markeres på banen", ui.includes("is-role-learning-focus") && ui.includes("is-role-learning-partner") && css.includes("is-role-learning-partner")],
  ["bred dribler + overlapp har eksplisitt romrisiko", ui.includes("samme brede kanal")],
  ["trening forklarer hvorfor", ui.includes("Hvorfor denne økta") && ui.includes("createTrainingLearningLesson")],
  ["trening peker fram mot kampobservasjon", ui.includes("Se etter i kamp")],
  ["systemet viser kompromiss", ui.includes("Kompromiss:") && ui.includes("createSystemLearningLesson")],
  ["etterkamp bruker faktiske taktiske li-signaler", ui.includes("tacticalSignals") && ui.includes("querySelectorAll(\"li\")")],
  ["etterkamp har eksplisitt ikke-dikt-regel", ui.includes("ikke på en oppdiktet teoriforklaring")],
  ["ingen ny localStorage-state", !ui.includes("localStorage.setItem")],
  ["ingen tilfeldig logikk", !ui.includes("Math.random") && !ui.includes("Date.now")],
  ["ingen ny motorclaim", /presentasjon og forklaring, ikke motor/.test(ui)],
  ["CSS har mobiltilpasning", css.includes("@media(max-width:700px)")],
  ["browser dekker systemlæring", browser.includes("footballLearningSystemBridge")],
  ["browser dekker treningslæring", browser.includes("footballLearningTrainingRationale")],
  ["browser dekker rolle-relasjon", browser.includes("football-learning-role-relationship")],
  ["browser dekker faktisk ellever og navngitt rollepar", browser.includes("Relasjonen i din faktiske ellever") && browser.includes("Valgt ving") && browser.includes("Valgt back")],
  ["browser dekker no-fiction når kuratert partner mangler", browser.includes("Det betyr ikke at oppstillingen er feil")],
  ["browser dekker registrert etterkampsignal", browser.includes("Bare registrerte taktiske faktorer")],
  ["browser dekker no-fiction fallback", browser.includes("Ingen tydelig taktisk faktor er registrert")],
  ["browser dekker mobil overflow", browser.includes("expectNoHorizontalOverflow")],
  ["browser dekker WCAG", browser.includes("AxeBuilder")]
];

checks.forEach(([label, ok]) => assert.equal(ok, true, label));
console.log(`Manager football learning loop v1 audit: ${checks.length}/${checks.length}`);

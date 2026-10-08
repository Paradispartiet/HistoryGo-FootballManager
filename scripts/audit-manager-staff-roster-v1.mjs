import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const app = read("src/app.js");
const shell = read("src/ui/manager-shell-view.js");
const ui = read("src/ui/manager-staff-workspace-v1.js");
const moduleSource = read("src/football-staff-roster.js");
const staffRoles = JSON.parse(read("data/hgFootball/staffRoles.json"));
const staff = JSON.parse(read("data/football_staff.json")).staff || [];
const ci = read(".github/workflows/ci.yml");
const pkg = JSON.parse(read("package.json"));

let checks = 0;
const check = (value, message) => {
  assert.ok(value, message);
  checks += 1;
  console.log(`✓ ${checks}. ${message}`);
};

check(!app.includes("const REQUIRED_STAFF_SIZE ="), "universelt staff-minimum er fjernet fra app-gaten");
check(app.includes("summarizeStarterStaffReadiness"), "før-sesong bruker startersett-readiness");
check(app.includes("done: staffReadiness.complete"), "før-sesong blir klar når startersettet er engasjert");
check(!app.includes("done: staffRoster.complete"), "full rollekapasitet er ikke lenger før-sesongkrav");
check(app.includes("decorateHiredStaffWithAssignments(hired)"), "coach-context får fortsatt effektiv rolle");
check(app.includes("selectStarterStaffCandidates(staff, clubId)"), "startgulvet er fortsatt klubbtilknyttet");
check(moduleSource.includes("clubAssignments.length > 0"), "dokumenterte klubbsett trenger ikke fylle seks kapasitetsslots");
check(moduleSource.includes("summarizeStarterStaffReadiness"), "ren readiness-modell finnes");
check(
  staffRoles.collectionRequirements?.training_coaches?.includes("kan samles"),
  "staffRoles beskriver trenere som samlingskapasitet"
);
check(
  staffRoles.staffRoles?.find((role) => role.id === "training_coach")?.maxActive === 3,
  "tre trenere er maxActive-kapasitet, ikke minimum"
);
check(shell.includes('manager-staff-workspace-v1.js'), "stabsflaten lastes");
check(ui.includes("maks") && ui.includes("summarizeStarterStaffReadiness"), "UI skiller rollekapasitet fra starterkrav");
check(ui.includes("Klubbens dokumenterte starterstab er engasjert."), "UI forklarer klubbspesifikk readiness");
check(staff.filter((member) => member.starterStaff === true).length === 6, "seks generiske fallback-profiler finnes");
check(staff.filter((member) => member.starterStaff === true).every((member) => member.isPlaceholder === true), "generisk fallback dikter ikke ekte personer");

const rosenborgStarters = staff.filter(
  (member) => Array.isArray(member.starterClubIds) && member.starterClubIds.includes("rosenborg")
);
check(rosenborgStarters.length === 6, "Rosenborg beholder sitt dokumenterte sekspersoners startersett");
check(rosenborgStarters.every((member) => member.isPlaceholder !== true && member.needsResearch !== true), "Rosenborg-settet er kuratert");
check(rosenborgStarters.every((member) => String(member.sourceUrl || "").startsWith("https://www.rbk.no/")), "Rosenborg-kandidatene har offisiell klubbkilde");

check(app.includes("threshold: staffReadiness.requiredCount"), "Administrasjon bruker klubbens startersett som terskel");
check(app.includes("prospectiveAssigned") && app.includes("assignedCandidate?.assignedStaffRole"), "ansettelsesgrensen bruker effektiv rollekapasitet");
check(app.includes("starterStaff.length > 0") && app.includes("member?.needsResearch !== true"), "ethvert dokumentert klubbsett skjuler generisk fallback");
check(pkg.scripts["audit:manager-staff-roster-v1"], "audit er registrert");
check(pkg.scripts["sim:manager-staff-roster-v1"], "simulering er registrert");
check(ci.includes("audit:manager-staff-roster-v1") && ci.includes("sim:manager-staff-roster-v1"), "CI kjører stabsportene");

console.log(`\n${checks}/${checks} staff-roster-auditsjekker bestått.`);

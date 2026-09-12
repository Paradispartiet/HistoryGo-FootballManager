import fs from "node:fs";
import assert from "node:assert/strict";
import {
  REQUIRED_FIRST_TEAM_STAFF,
  selectStarterStaffCandidates,
  summarizeStaffRoster
} from "../src/football-staff-roster.js";

const readJson = (path) =>
  JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

const staff = readJson("data/football_staff.json").staff || [];
const clubs = readJson("data/football_clubs.json").clubs || [];

const eliteserien = clubs
  .filter((club) => club?.tier === "eliteserien")
  .sort(
    (a, b) =>
      Number(b?.strength || 0) - Number(a?.strength || 0) ||
      String(a?.name || a?.id || "").localeCompare(String(b?.name || b?.id || ""), "nb")
  );

assert.equal(
  eliteserien.length,
  16,
  "2026-snapshotet skal ha 16 Eliteserie-klubber"
);

const rows = eliteserien.map((club) => {
  const clubId = String(club.id);
  const curated = staff.filter(
    (member) =>
      member?.id &&
      member?.isPlaceholder !== true &&
      member?.needsResearch !== true &&
      Array.isArray(member?.starterClubIds) &&
      member.starterClubIds.map(String).includes(clubId)
  );

  const summary = summarizeStaffRoster(curated);
  const selected = selectStarterStaffCandidates(staff, clubId);

  assert.equal(
    selected.length,
    REQUIRED_FIRST_TEAM_STAFF,
    `${club.name}: startervalget skal alltid gi et spillbart 1+3+1+1-gulv`
  );

  if (summary.complete) {
    assert.ok(
      selected.every((member) => member?.isPlaceholder !== true && member?.needsResearch !== true),
      `${club.name}: komplett klubbsett skal ikke bruke placeholders`
    );
    assert.ok(
      selected.every(
        (member) =>
          Array.isArray(member?.starterClubIds) &&
          member.starterClubIds.map(String).includes(clubId)
      ),
      `${club.name}: komplett starterstaff skal være eksplisitt klubbtilknyttet`
    );
  } else {
    assert.ok(
      selected.every((member) => member?.isPlaceholder === true),
      `${club.name}: ufullstendig klubbsett skal falle helt tilbake til generisk placeholder-gulv`
    );
  }

  return { club, curated, summary };
});

const rosenborg = rows.find((row) => row.club.id === "rosenborg");
assert.ok(
  rosenborg?.summary.complete,
  "Rosenborg skal være første komplette kuraterte Eliteserie-sett"
);
assert.ok(
  rosenborg.curated.every(
    (member) => member?.isPlaceholder !== true && member?.needsResearch !== true
  ),
  "Rosenborg-settet skal være kuratert, ikke placeholder-basert"
);

const complete = rows.filter((row) => row.summary.complete);
console.log(
  `Eliteserien staff coverage: ${complete.length}/${rows.length} komplette klubbsett.`
);

for (const row of rows) {
  const prefix = row.summary.complete ? "✓" : "·";
  const missing = row.summary.complete
    ? ""
    : ` · mangler ${row.summary.missingLabel || "rolledekning"}`;
  console.log(
    `${prefix} ${row.club.name}: ${row.summary.filledCount}/${REQUIRED_FIRST_TEAM_STAFF} roller · ${row.curated.length} kuraterte kandidater${missing}`
  );
}

console.log(
  `\nNeste staff-batch velges blant ${rows.filter((row) => !row.summary.complete).length} ufullstendige Eliteserie-klubber; enkeltprofiler gjør aldri en halv klubb starterklar.`
);

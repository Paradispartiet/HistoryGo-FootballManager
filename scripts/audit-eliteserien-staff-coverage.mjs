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

assert.equal(eliteserien.length, 16, "2026-snapshotet skal ha 16 Eliteserie-klubber");

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
  const selected = selectStarterStaffCandidates(staff, clubId);
  const capacity = summarizeStaffRoster(selected);
  const documented = curated.length > 0;

  if (documented) {
    assert.equal(
      selected.length,
      curated.length,
      `${club.name}: alle dokumenterte starterprofiler skal være rollekompatible og valgbare`
    );
    assert.ok(
      selected.every((member) => member?.isPlaceholder !== true && member?.needsResearch !== true),
      `${club.name}: dokumentert klubbsett skal ikke bruke placeholders`
    );
    assert.ok(
      selected.every(
        (member) =>
          Array.isArray(member?.starterClubIds) &&
          member.starterClubIds.map(String).includes(clubId)
      ),
      `${club.name}: dokumentert starterstaff skal være eksplisitt klubbtilknyttet`
    );
    assert.ok(
      selected.every((member) => /^https:\/\//.test(String(member?.sourceUrl || ""))),
      `${club.name}: dokumentert starterstaff skal ha kilde`
    );
  } else {
    assert.equal(
      selected.length,
      REQUIRED_FIRST_TEAM_STAFF,
      `${club.name}: ukurert klubb skal fortsatt få seks-personers fallback`
    );
    assert.ok(
      selected.every((member) => member?.isPlaceholder === true),
      `${club.name}: ukurert klubb skal bruke tydelig placeholder-fallback`
    );
  }

  return { club, curated, selected, capacity, documented };
});

const documented = rows.filter((row) => row.documented);
assert.ok(
  rows.find((row) => row.club.id === "rosenborg")?.documented,
  "Rosenborg skal ha dokumentert klubbsett"
);

console.log(
  `Eliteserien staff coverage: ${documented.length}/${rows.length} dokumenterte klubbsett.`
);

for (const row of rows) {
  const prefix = row.documented ? "✓" : "·";
  const kind = row.documented ? "dokumentert" : "fallback";
  console.log(
    `${prefix} ${row.club.name}: ${row.selected.length} starterprofiler · ${kind} · aktiv kapasitet ${row.capacity.filledCount}/${row.capacity.requiredCount}`
  );
}

console.log(
  `\nNeste staff-batch velges blant ${rows.filter((row) => !row.documented).length} klubber uten dokumentert startersett; et virkelig klubbsett trenger ikke fylle alle seks kapasitetsslots.`
);

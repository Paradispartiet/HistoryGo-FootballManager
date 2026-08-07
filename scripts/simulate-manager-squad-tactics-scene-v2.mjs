import {
  createRosterViewModel,
  filterRosterRows
} from "../src/ui/manager-player-workspace-v1.js";

const checks = [];
function check(label, condition, detail = "") {
  checks.push({ label, ok: Boolean(condition), detail });
}

const players = [
  {
    id: "maker",
    name: "Midtbane Maker",
    nationality: "Norge",
    naturalPositions: ["AM", "CM"],
    usablePositions: ["RW"],
    preferredRoles: ["classic_ten"],
    likesTactics: ["possession"],
    dislikesTactics: ["long_ball_only"]
  },
  {
    id: "stopper",
    name: "Forsvars Stopper",
    nationality: "Norge",
    naturalPositions: ["CB"],
    usablePositions: [],
    preferredRoles: ["stopper"],
    likesTactics: ["compact_shape"],
    dislikesTactics: []
  },
  {
    id: "locked",
    name: "Låst Spiller",
    naturalPositions: ["ST"],
    preferredRoles: ["advanced_forward"]
  }
];

const roles = [
  { id: "classic_ten", name: "Klassisk tier" },
  { id: "stopper", name: "Stopper" },
  { id: "advanced_forward", name: "Avansert spiss" }
];

const rows = createRosterViewModel({
  players,
  unlockedPlayerIds: new Set(["maker", "stopper"]),
  statsRows: [
    { playerId: "maker", appearances: 8, goals: 3, assists: 6, minutes: 690 },
    { playerId: "stopper", appearances: 9, goals: 1, assists: 0, minutes: 810 }
  ],
  conditions: [
    { playerId: "maker", load: 18, form: 1.4, injury: null },
    { playerId: "stopper", load: 76, form: -1.2, injury: null }
  ],
  roleFamiliarity: {
    "maker::classic_ten": 64,
    "stopper::stopper": 31
  },
  individualTraining: [
    { playerId: "maker", trackId: "role_learning", roleId: "classic_ten" }
  ],
  roles,
  tacticId: "possession"
});

check("kun opplåste spillere vises", rows.length === 2, String(rows.length));
check("sesongtall følger spilleren", rows[0].appearances === 8 && rows[0].goals === 3 && rows[0].assists === 6);
check("rollefortrolighet vises", rows[0].role.familiarity === 64, String(rows[0].role.familiarity));
check("taktikk-fit er kvalitativ", rows[0].fit.label === "God" && !Object.hasOwn(rows[0].fit, "score"), rows[0].fit.label);
check("klar spiller er klar", rows[0].status.id === "ready", rows[0].status.id);
check("belastet spiller får belastningsstatus", ["loaded", "tired"].includes(rows[1].status.id), rows[1].status.id);
check("form vises som retning", rows[0].form.label === "↑" && rows[1].form.label === "↓");
check("individuell trening følger spilleren", rows[0].training?.roleId === "classic_ten");
check("ingen overall-felt i troppsraden", rows.every((row) => !Object.hasOwn(row, "overall")));

const byName = filterRosterRows(rows, { query: "maker", sort: "name" });
check("søk finner riktig spiller", byName.length === 1 && byName[0].id === "maker");

const defenders = filterRosterRows(rows, { position: "CB" });
check("posisjonsfilter finner stopper", defenders.length === 1 && defenders[0].id === "stopper");

const ready = filterRosterRows(rows, { availability: "ready" });
check("tilgjengelighetsfilter virker", ready.length === 1 && ready[0].id === "maker");

const byGoals = filterRosterRows(rows, { sort: "goals" });
check("mål-sortering virker", byGoals[0].id === "maker");

const failed = checks.filter((item) => !item.ok);
checks.forEach((item) => console.log(`${item.ok ? "✓" : "✗"} ${item.label}${item.detail ? ` — ${item.detail}` : ""}`));
if (failed.length) {
  console.error(`\n✗ Spillerliste og spillerprofil v1 feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Spillerliste og spillerprofil v1: ${checks.length}/${checks.length}`);

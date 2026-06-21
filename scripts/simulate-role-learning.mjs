import fs from "node:fs";
import { createRoleLearningViewModel } from "../src/football-role-learning-view-model.js";
import { calculateRoleRelationships } from "../src/football-relationship-engine.js";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const players = read("data/football_players.json").players;
const roles = read("data/football_roles.json").roles;
const tactics = read("data/football_tactics.json").tactics;
const tactic = tactics.find((item) => item.id === "wide_transitions") || tactics[0];
const slot = { slotId: "LW1", label: "Venstre kant", position: "LW" };
const player = players.find((item) => item.preferredRoles?.includes("wide_dribbler")) || players[0];
const role = roles.find((item) => item.id === "wide_dribbler");
const badRole = roles.find((item) => item.id === "target_striker") || role;
const relationships = calculateRoleRelationships([
  { isComplete: true, role, player, slot },
  { isComplete: true, role: roles.find((item) => item.id === "overlapping_fullback"), player: players[1], slot: { position: "LB" } }
], tactic);

const good = createRoleLearningViewModel({ player, role, slot, tactic, roles, relationships });
const misused = createRoleLearningViewModel({ player, role: badRole, slot: { ...slot, position: "ST" }, tactic, roles, relationships });

const failures = [];
if (!good || good.fitScore < 60 || !good.usesStrengths.length) failures.push("expected positive role learning for representative fit");
if (!misused || !misused.misuseExplanation || !misused.managerHint.toLowerCase().includes("manager")) failures.push("expected misuse explanation framed as manager responsibility");
if (!good.relationNeeds.length) failures.push("expected relation needs");
if (!good.alternativeRoles.length) failures.push("expected alternative roles");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, good: { fit: good.fitScore, hint: good.managerHint }, misused: { fit: misused.fitScore, hint: misused.managerHint } }, null, 2));

// Dataaudit: data/football_tactics.json (kampplaner).
//
// Kampplanen er strategi, ikke rangering. Auditen holder katalogen ærlig: at
// hver plan forklarer seg selv, at taggene faktisk betyr noe for spillerne
// (ellers er de dekorasjon), og at ingen plan er et gratis riktig svar.
// Exit 1 ved brudd.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
function check(label, ok, detail = "") {
  results.push({ label, ok: Boolean(ok), detail });
}

const data = JSON.parse(readFileSync(join(root, "data/football_tactics.json"), "utf8"));
const plans = Array.isArray(data.tactics) ? data.tactics : [];
const families = Array.isArray(data.families) ? data.families : [];

check("skjema er historygo-football-manager.tactics.v2",
  data.schema === "historygo-football-manager.tactics.v2", String(data.schema));
check("katalogen er utvidet", plans.length >= 15, `${plans.length} kampplaner`);
check("familiene er definert", families.length >= 5, `${families.length} familier`);

const GAME_STATES = new Set(["leading", "level", "behind"]);
const AXES = {
  pressing: ["low", "medium_low", "medium", "high", "very_high"],
  tempo: ["controlled", "direct_when_possible", "fast"],
  width: ["compact", "medium", "medium_wide", "wide"],
  defensiveLine: ["low", "medium_low", "medium", "medium_high", "high"],
  buildUp: ["secure_first", "structured_build_up", "direct_wide", "direct_play", "aggressive_build_up"]
};

const familyIds = new Set(families.map((f) => f.id));
const seen = new Set();

for (const family of families) {
  check(`${family.id || "(uten id)"}: familien forklarer seg`,
    Boolean(family.id) && typeof family.name === "string" && family.name.length > 0
      && typeof family.summary === "string" && family.summary.length > 15
      && typeof family.risk === "string" && family.risk.length > 15);
  const count = plans.filter((p) => p.family === family.id).length;
  check(`${family.id}: har minst to planer`, count >= 2, `${count} plan(er)`);
}

for (const plan of plans) {
  const label = plan.id || "(uten id)";
  check(`${label}: unik id og navn`, Boolean(plan.id) && Boolean(plan.name) && !seen.has(plan.id));
  seen.add(plan.id);

  // Navnet er planens strategi, ikke en formasjon. Et formasjonstall i navnet
  // fikk kampplanvelgeren til å lese som en formasjonsvelger nummer to.
  check(`${label}: navnet er ikke et formasjonstall`, !/\d\s*-\s*\d/.test(String(plan.name)), plan.name);

  check(`${label}: peker på en kjent familie`, familyIds.has(plan.family), String(plan.family));
  check(`${label}: forklarer intensjonen sin`,
    typeof plan.intent === "string" && plan.intent.length > 15);
  check(`${label}: oppgir styrker og risiko`,
    Array.isArray(plan.strengths) && plan.strengths.length >= 2
      && Array.isArray(plan.risks) && plan.risks.length >= 2);
  check(`${label}: sier når den passer`,
    Array.isArray(plan.gameStates) && plan.gameStates.length >= 1
      && plan.gameStates.every((s) => GAME_STATES.has(s)),
    String(plan.gameStates));
  check(`${label}: intensitet er 0-100`,
    Number.isFinite(Number(plan.intensity)) && plan.intensity >= 0 && plan.intensity <= 100,
    String(plan.intensity));
  check(`${label}: har tags`, Array.isArray(plan.tags) && plan.tags.length >= 4, `${plan.tags?.length} tags`);

  Object.entries(AXES).forEach(([axis, allowed]) => {
    check(`${label}: ${axis} er en kjent verdi`, allowed.includes(plan[axis]), String(plan[axis]));
  });

  // Formasjonsarven er data, ikke et krav — men den må finnes, siden UI-et
  // viser den som «Fra X-tradisjonen».
  check(`${label}: bærer formasjonsarven`,
    typeof plan.formation === "string" && /\d/.test(plan.formation), String(plan.formation));
}

// Ingen plan skal være et gratis riktig svar for alle kampbilder.
{
  const universal = plans.filter((p) => Array.isArray(p.gameStates) && p.gameStates.length === 3);
  check("ingen plan passer alle kampbilder (høyst én allrounder)",
    universal.length <= 1, universal.map((p) => p.id).join(", "));
  for (const state of GAME_STATES) {
    const count = plans.filter((p) => p.gameStates?.includes(state)).length;
    check(`kampbildet «${state}» har flere planer å velge mellom`, count >= 3, `${count} planer`);
  }
}

// Taggene må bety noe: de scorer mot spillernes likesTactics/dislikesTactics.
// En tag ingen spiller bryr seg om er dekorasjon.
{
  const players = JSON.parse(readFileSync(join(root, "data/football_players.json"), "utf8")).players || [];
  const known = new Set();
  players.forEach((player) => {
    (player.likesTactics || []).forEach((t) => known.add(t));
    (player.dislikesTactics || []).forEach((t) => known.add(t));
  });
  const orphan = new Map();
  plans.forEach((plan) => {
    (plan.tags || []).forEach((tag) => {
      if (!known.has(tag)) {
        if (!orphan.has(tag)) orphan.set(tag, []);
        orphan.get(tag).push(plan.id);
      }
    });
  });
  check("alle kampplan-tags treffer noe i spillerdataen",
    orphan.size === 0,
    [...orphan.entries()].map(([tag, ids]) => `${tag} (${ids.join(",")})`).join("; "));

  // Og hver plan må ha minst én tag som faktisk gir utslag.
  const toothless = plans.filter((plan) => !(plan.tags || []).some((tag) => known.has(tag)));
  check("hver plan har minst én tag som gir utslag", toothless.length === 0,
    toothless.map((p) => p.id).join(", "));
}

// ---- Rapport ---------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
console.log("Kampplanaudit: data/football_tactics.json\n");
for (const item of failed) {
  console.log(`    ✗ ${item.label}${item.detail ? ` (${item.detail})` : ""}`);
}
console.log(`${results.length - failed.length}/${results.length} sjekker bestått.`);

if (failed.length > 0) {
  console.error(`\n✗ Kampplanaudit feilet: ${failed.length} brudd.`);
  process.exit(1);
}
console.log("\n✓ Kampplanaudit OK.");
process.exit(0);

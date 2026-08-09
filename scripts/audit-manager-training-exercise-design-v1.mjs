import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const model = read("src/football-training-exercise-design.js");
const ui = read("src/ui/manager-training-exercise-design-v1.js");
const day = read("src/ui/manager-training-day-v1.js");
const shell = read("src/ui/manager-shell-view.js");
const css = read("src/ui/manager-training-exercise-design-v1.css");
const doc = read("docs/MANAGER_TRAINING_EXERCISE_DESIGN_V1.md");

const checks = [];
function check(name, condition) {
  checks.push({ name, ok: Boolean(condition) });
}

check("ren læringsmodell finnes", model.includes("TRAINING_EXERCISE_DESIGN_VERSION"));
check("fire organiseringsdimensjoner", ["area", "numbers", "direction", "touches"].every((token) => model.includes(`${token}:`)));
check("restforsvar dekkes", model.includes('id: "rest_defence"'));
check("press dekkes", model.includes('id: "pressing"'));
check("oppbygging dekkes", model.includes('id: "build_up"'));
check("bredde dekkes", model.includes('id: "width"'));
check("avslutning dekkes", model.includes('id: "finishing"'));
check("restitusjon dekkes", model.includes('id: "recovery"'));
check("rolle/struktur dekkes", model.includes('id: "team_shape"'));
check("fysisk arbeid dekkes", model.includes('id: "physical"'));
check("trygg generisk fallback", model.includes('id: "generic"'));
check("modellen har ingen DOM", !/\bdocument\b|\bwindow\b/.test(model));
check("modellen har ingen lagring", !/localStorage|sessionStorage|indexedDB/.test(model));
check("modellen har ingen skjult totalscore", !/overall|matchScore|exerciseScore|scoreDelta/i.test(model));
check("UI bruker den rene modellen", ui.includes('from "../football-training-exercise-design.js"'));
check("UI bruker native dialog", ui.includes('document.createElement("dialog")'));
check("UI har ingen ny lagring", !/localStorage|sessionStorage|indexedDB/.test(ui));
check("treningsdagen sender økthendelse", day.includes('new CustomEvent("hgfm:training-exercise-open"'));
check("økter kan åpnes med tastatur", day.includes('event.key !== "Enter"') && day.includes('event.key !== " "'));
check("plassholderøkter kan ikke åpnes", day.includes("isExerciseSession") && day.includes('aria-disabled'));
check("shell laster øvelsesflaten", shell.includes('import "./manager-training-exercise-design-v1.js"'));
check("mobilregel finnes", css.includes("@media (max-width: 560px)"));
check("produktgrensen er dokumentert", /ingen ny treningsmotor/i.test(doc) && /endrer ikke/i.test(doc));
check("læringslaget forklarer ingen lagret effekt", model.includes("endrer ikke lagret treningsbelastning"));

const failed = checks.filter((entry) => !entry.ok);
for (const entry of checks) console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}`);
console.log(`\nTreningsøvelser v1 audit: ${checks.length - failed.length}/${checks.length}`);
if (failed.length) process.exit(1);

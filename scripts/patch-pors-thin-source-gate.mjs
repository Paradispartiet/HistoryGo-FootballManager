import assert from "node:assert/strict";
import fs from "node:fs";

const path = new URL("./simulate-player-attributes.mjs", import.meta.url);
let source = fs.readFileSync(path, "utf8");

const marker = "  romssa_arena: 1.01,        // Tromsø: 53 av 53\n";
const addition = `${marker}  // Pors P2: klubbhistorikken dokumenterer medlemskap/epoker og et begrenset\n  // posisjonslag, men ingen individuelle ferdighetsclaims. 58/58 nye eksklusive\n  // profiler er derfor THIN-SOURCE på ferdighetsaksen. 1,01 er en eksplisitt\n  // registrering av 100 % tomme styrkelister, ikke tillatelse til modellering.\n  pors_stadion: 1.01,\n`;

assert.ok(source.includes(marker), "fant ikke KJENT_UDOKUMENTERT-innsettingspunkt");
assert.ok(!source.includes("pors_stadion: 1.01"), "Pors er allerede registrert i KJENT_UDOKUMENTERT");
source = source.replace(marker, addition);
fs.writeFileSync(path, source);
console.log("registered pors_stadion as explicit 100% thin-source heritage");

import fs from "node:fs";
import { P1_HERITAGES } from "../src/football-player-source-claims-p1.js";

const players = JSON.parse(fs.readFileSync("data/football_players.json", "utf8")).players || [];
const asArray = (value) => Array.isArray(value) ? value : [];

for (const heritage of P1_HERITAGES.filter((entry) => entry.generation === "existing")) {
  const population = players.filter((player) => {
    const ids = asArray(player.sourcePlaceIds);
    return ids.length === 1 && ids[0] === heritage.placeId;
  });
  const documented = population.filter((player) => asArray(player.strengths).length > 0);
  console.log(`${heritage.key}: ${documented.length}/${population.length} nonempty raw strengths`);
  console.log(documented.map((player) => `${player.id}=[${asArray(player.strengths).join(",")}]`).join("\n"));
}

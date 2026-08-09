import fs from "node:fs";

const appUrl = new URL("../src/app.js", import.meta.url);
let app = fs.readFileSync(appUrl, "utf8");
const marker = "  // Starttroppen er et spillbarhetsgulv. For en overtatt klubb kommer gulvet";
const insertion = `  // Et stadionbesøk åpner HELE den eksplisitte klubbpoolen. Dette kan ikke\n  // overlates til place-unlocks alene: clubAffiliations og sourcePlaceIds er\n  // bevisst to forskjellige relasjoner, og framtidige klubbspillere kan derfor\n  // tilhøre poolen uten å ha stadionet som eget oppdagelsessted.\n  const takeoverClubForPool = getTakeoverClub();\n  if (takeoverClubForPool && !isNationalModeActive()) {\n    const clubAccess = getClubSquadAccess(takeoverClubForPool);\n    if (clubAccess?.mode === "heritage") {\n      const groundPlaceId = takeoverClubForPool.homePlaceId || null;\n      (clubAccess.clubPoolIds || []).forEach((playerId) => {\n        unlockedPlayerIds.add(playerId);\n        const sources = playerSourceById.get(playerId) || { placeIds: new Set(), localStart: false };\n        if (groundPlaceId) sources.placeIds.add(groundPlaceId);\n        playerSourceById.set(playerId, sources);\n      });\n    }\n  }\n\n`;

if (!app.includes("const takeoverClubForPool = getTakeoverClub();")) {
  const index = app.indexOf(marker);
  if (index < 0) throw new Error("fant ikke starttroppmarkøren i app.js");
  app = app.slice(0, index) + insertion + app.slice(index);
}

fs.writeFileSync(appUrl, app);
console.log(JSON.stringify({ ok: true, patched: "src/app.js", fullPoolUnlock: true }, null, 2));

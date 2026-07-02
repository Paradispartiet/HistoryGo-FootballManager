// HG Football Manager — Tactical Knowledge Layer v1
//
// Dette er bevisst et forklaringslag, ikke en taktikkmotor. Det leser de
// eksisterende taktikkfeltene (pressing, defensiveLine, formation, buildUp,
// chanceCreation og tags) og oversetter dem til pedagogiske beskrivelser,
// spillerkrav og assistentfeedback. Ingen score eller kamputfall regnes her.

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasTag(tactic, tag) {
  return asArray(tactic?.tags).includes(tag);
}

const PRINCIPLES = {
  low_block: {
    title: "Lav blokk",
    explanation:
      "Laget faller dypt, beskytter boksen og tvinger motstanderen bredt. Det gir mindre rom bak forsvaret, men gjør det vanskeligere å vinne ballen høyt.",
    requirements: ["posisjonering", "konsentrasjon", "duellstyrke", "kommunikasjon", "disiplin"],
    feedback:
      "Lav blokk fungerte defensivt, men laget trenger nok pasningskvalitet og ro til å spille seg ut etter ballvinning."
  },
  mid_block: {
    title: "Midtblokk",
    explanation:
      "Laget holder seg kompakt i midten, kontrollerer rommet foran forsvaret og venter på riktige pressøyeblikk.",
    requirements: ["disiplin", "lagarbeid", "posisjonering", "konsentrasjon", "koordinert bevegelse"],
    feedback: "Midtblokken krevde tålmodighet og samlet avstand mellom lagdelene for å stoppe spill gjennom midten."
  },
  high_press: {
    title: "Høyt press",
    explanation:
      "Laget forsøker å vinne ballen nær motstanderens mål. Det krever intensitet, koordinasjon, raske forsvarere og en keeper som kan dekke bakrom.",
    requirements: ["utholdenhet", "aggressivitet", "hurtighet", "lagarbeid", "konsentrasjon"],
    feedback:
      "Høyt press ga mulighet for ballvinning høyt, men hvis midtbanen ikke følger etter blir laget strukket."
  },
  high_line: {
    title: "Høy forsvarslinje",
    explanation:
      "En høy linje komprimerer banen og støtter press og gjenvinning, men åpner større bakrom mot raske angripere.",
    requirements: ["hurtige stoppere", "proaktiv keeper", "timing", "kommunikasjon", "konsentrasjon"],
    feedback:
      "Laget sto høyt; uten nok fart og timing hos stopperne kan motstanderen komme inn bak forsvarslinjen."
  },
  inverted_fullbacks: {
    title: "Inverterte backer",
    explanation:
      "Backene trekker inn i banen for å skape sentralt overtall og bedre restforsvar, men balltap sentralt kan gi farlige brudd.",
    requirements: ["pasning", "teknikk", "spilleforståelse", "posisjonering", "balltrygghet"],
    feedback:
      "Inverterte backer kan gi bedre sentral kontroll, men krever teknikk og spilleforståelse når laget mister ballen."
  },
  short_corners: {
    title: "Korte cornere",
    explanation:
      "Korte cornere beholder ballen, skaper bedre vinkler og kan trekke forsvarere ut. De passer ofte tekniske lag bedre enn rene luftstyrkelag.",
    requirements: ["pasning", "teknikk", "bevegelse", "innleggskvalitet", "beslutninger"],
    feedback: "Korte cornere kan gi bedre vinkler, men laget må fortsatt fylle boksen og sikre returløp."
  },
  formation_433: {
    title: "4-3-3 som grunnstruktur",
    explanation:
      "4-3-3 kan gi bredde, pressmuligheter og midtbanekontroll, men kan bli sårbar bredt og rundt en enslig sekser.",
    requirements: ["pressende spiss", "koordinerte kanter", "trygg sekser", "bredde", "restforsvar"],
    feedback: "4-3-3 ga naturlig bredde og presslinjer, men rommet rundt sekseren må beskyttes."
  },
  man_press: {
    title: "Mann-mot-mann-press",
    explanation:
      "Spillerne følger tydelige motstandere og prøver å fjerne tid og rom raskt. Det øker ballvinningssjansen, men risikoen blir stor hvis én spiller blir slått.",
    requirements: ["aggressivitet", "hurtighet", "duellstyrke", "konsentrasjon", "kommunikasjon"],
    feedback: "Mann-mot-mann-press kan vinne ballen høyt, men ett tapt løp åpner store rom bak presset."
  },
  zone_press: {
    title: "Sonepress",
    explanation:
      "Laget kontrollerer rom, flytter samlet og presser når ballen kommer inn i bestemte soner. Det krever kompakt lag og koordinert bevegelse.",
    requirements: ["lagarbeid", "posisjonering", "spilleforståelse", "kommunikasjon", "disiplin"],
    feedback: "Sonepresset krever korte avstander; hvis ett ledd stopper, kan motstanderen spille gjennom sonen."
  }
};

export function getTacticalKnowledgeForTactic(tactic = {}) {
  const keys = [];
  if (tactic.pressing === "low" || tactic.defensiveLine === "low" || hasTag(tactic, "low_block")) keys.push("low_block");
  if (["medium", "medium_low"].includes(tactic.pressing) || ["medium", "medium_low"].includes(tactic.defensiveLine)) keys.push("mid_block");
  if (["high", "very_high"].includes(tactic.pressing) || hasTag(tactic, "high_press")) keys.push("high_press");
  if (["high", "medium_high"].includes(tactic.defensiveLine) || hasTag(tactic, "high_line")) keys.push("high_line");
  if (String(tactic.formation || "").includes("4-3-3")) keys.push("formation_433");
  if (hasTag(tactic, "overloads") || hasTag(tactic, "central_control")) keys.push("inverted_fullbacks");
  if (hasTag(tactic, "pressing") && tactic.pressing === "very_high") keys.push("man_press");
  if (hasTag(tactic, "structured_build_up") || hasTag(tactic, "compact_shape")) keys.push("zone_press");
  if (hasTag(tactic, "possession") || hasTag(tactic, "structured_build_up")) keys.push("short_corners");

  return [...new Set(keys)].map((key) => ({ id: key, ...PRINCIPLES[key] }));
}

export function buildTacticalKnowledgeFeedback({ tactic, tacticalProfile = {}, xgAgainst = 0 } = {}) {
  const knowledge = getTacticalKnowledgeForTactic(tactic);
  const feedback = [];
  const ids = new Set(knowledge.map((item) => item.id));
  if (ids.has("high_press") && Number(tacticalProfile.pressScore) < 55) {
    feedback.push("Presset startet høyt, men press-score viser at laget ikke fikk nok samlet trykk rundt ballfører.");
  }
  if (ids.has("high_line") && Number(tacticalProfile.restDefenseScore) < 55) {
    feedback.push("Høy linje uten solid restforsvar økte bakromsrisikoen mot raske angrep.");
  }
  if (ids.has("low_block") && Number(tacticalProfile.buildUpScore) < 55) {
    feedback.push("Lav blokk reduserte rom bak laget, men svak oppbygging gjorde det vanskelig å spille seg ut etter ballvinning.");
  }
  if (ids.has("formation_433") && Number(tacticalProfile.widthScore) >= 65) {
    feedback.push("4-3-3-strukturen ga bredde og tydelige pressvinkler, men sekserrommet må fortsatt beskyttes.");
  }
  if (ids.has("inverted_fullbacks") && Number(tacticalProfile.restDefenseScore) < 60) {
    feedback.push("Inverterte backer kan gi sentral kontroll, men balltap i midten gjorde brudd farligere.");
  }
  if (ids.has("zone_press") && Number(tacticalProfile.balanceScore) < 55) {
    feedback.push("Sonepress krever kompakt lag; svak balanse gjorde avstandene mellom leddene for store.");
  }
  if (!feedback.length && knowledge[0]?.feedback) feedback.push(knowledge[0].feedback);
  if (Number(xgAgainst) >= 1.8 && ids.has("man_press")) feedback.push(PRINCIPLES.man_press.feedback);
  return feedback.slice(0, 2);
}

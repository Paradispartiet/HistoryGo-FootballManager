// HG Football Manager — Treningsøvelser og øvelsesdesign v1
//
// Rent lærings-/forklaringslag over eksisterende treningsøkter. Modulen endrer
// ingen treningseffekt, kampbonus, fatigue, progresjon eller lagring. Den svarer
// bare på: «Hvis jeg organiserer den samme økta annerledes, hva trener jeg mer
// eller mindre av — og hva bør jeg som trener se etter?»

export const TRAINING_EXERCISE_DESIGN_VERSION = "historygo-football-manager.training-exercise-design.v1";

export const EXERCISE_DESIGN_CONTROLS = Object.freeze({
  area: Object.freeze([
    Object.freeze({ id: "tight", label: "Lite område" }),
    Object.freeze({ id: "medium", label: "Middels område" }),
    Object.freeze({ id: "large", label: "Stort område" })
  ]),
  numbers: Object.freeze([
    Object.freeze({ id: "even", label: "Likhet" }),
    Object.freeze({ id: "attack_overload", label: "Overtall med ball" }),
    Object.freeze({ id: "defence_overload", label: "Overtall uten ball" })
  ]),
  direction: Object.freeze([
    Object.freeze({ id: "directional", label: "Mot mål / målsone" }),
    Object.freeze({ id: "positional", label: "Posisjonsspill" }),
    Object.freeze({ id: "transition", label: "Omstilling ved balltap" })
  ]),
  touches: Object.freeze([
    Object.freeze({ id: "free", label: "Frie touch" }),
    Object.freeze({ id: "three", label: "Maks 3 touch" }),
    Object.freeze({ id: "two", label: "Maks 2 touch" })
  ])
});

const ARCHETYPES = Object.freeze([
  Object.freeze({
    id: "rest_defence",
    match: /restforsvar|rest defense|omstilling|transition|kontring|sikring|andreball/i,
    title: "Restforsvar og omstilling",
    objective: "Organisere laget bak angrepet slik at balltap ikke automatisk blir en fri kontring.",
    baseSetup: "Et mulig utgangspunkt er spill mot mål eller kontringsmål der laget med ball må beholde et tydelig sikringsledd bak angrepet.",
    defaultConfig: Object.freeze({ area: "large", numbers: "attack_overload", direction: "transition", touches: "three" }),
    coachingPoints: Object.freeze([
      "Hvem er på riktig side av ballen før balltapet?",
      "Er avstanden mellom sikringsspillerne liten nok til å kontrollere første pasning framover?",
      "Kan laget stoppe eller forsinke kontringen uten panikkløp bakover?"
    ])
  }),
  Object.freeze({
    id: "pressing",
    match: /press|gjenvinn|defensiv struktur|kompakt|høyt press/i,
    title: "Press og kollektiv avstand",
    objective: "Trene at første pressledd og støtten bak går samtidig, slik at motstanderen ikke bare spiller gjennom presset.",
    baseSetup: "Et mulig utgangspunkt er retningsbestemt spill der laget uten ball får tydelige pressutløsere og må flytte samlet når første spiller går.",
    defaultConfig: Object.freeze({ area: "medium", numbers: "attack_overload", direction: "directional", touches: "three" }),
    coachingPoints: Object.freeze([
      "Starter presset på et tydelig signal, eller løper én spiller alene?",
      "Stenger neste ledd den enkle pasningen ut av presset?",
      "Holder laget korte nok avstander til å vinne andreballen?"
    ])
  }),
  Object.freeze({
    id: "build_up",
    match: /oppbygg|build|pasning|possession|førstetouch|første touch|rondo/i,
    title: "Oppbygging og pasningslinjer",
    objective: "Gi ballfører flere løsninger og trene mottakere til å orientere seg før de får ballen.",
    baseSetup: "Et mulig utgangspunkt er spill fra keeper eller bakre sone mot en målsone, med støtte foran, ved siden av og bak ballen.",
    defaultConfig: Object.freeze({ area: "medium", numbers: "attack_overload", direction: "directional", touches: "three" }),
    coachingPoints: Object.freeze([
      "Har ballfører minst to reelle pasningsalternativer?",
      "Ser mottakeren neste handling før førstetouchet?",
      "Skaper laget en fri neste spiller før pasningen slås?"
    ])
  }),
  Object.freeze({
    id: "width",
    match: /bredde|ving|overlapp|innlegg|cross|delivery|siste pasning/i,
    title: "Bredde, mellomrom og boks",
    objective: "Strekke motstanderens siste ledd uten at flere medspillere bare fyller den samme brede kanalen.",
    baseSetup: "Et mulig utgangspunkt er retningsbestemt spill med markerte sidekanaler og krav om at bredden kobles til løp i mellomrom eller boks.",
    defaultConfig: Object.freeze({ area: "large", numbers: "even", direction: "directional", touches: "free" }),
    coachingPoints: Object.freeze([
      "Hvem holder bredden, og hvem angriper rommet som bredden åpner?",
      "Kommer overlappen etter at vingen har bundet motstanderen?",
      "Er det nok spillere i boksen når innlegget eller cutbacken kommer?"
    ])
  }),
  Object.freeze({
    id: "finishing",
    match: /avslut|finishing|skudd|sjanse|mål/i,
    title: "Avslutning fra kampnære situasjoner",
    objective: "Trene hele kjeden inn i avslutningen: bevegelse, sistepasning, kroppsstilling og selve skuddet.",
    baseSetup: "Et mulig utgangspunkt er spill mot mål der avslutningen må komme etter en bestemt angrepshandling, ikke som isolerte skudd uten kontekst.",
    defaultConfig: Object.freeze({ area: "medium", numbers: "attack_overload", direction: "directional", touches: "free" }),
    coachingPoints: Object.freeze([
      "Kommer avslutteren til ballen i balanse?",
      "Skaper sistepasningen en bedre vinkel eller bare et raskere skudd?",
      "Angriper flere spillere ulike soner i boksen?"
    ])
  }),
  Object.freeze({
    id: "recovery",
    match: /restitus|recovery|mobilitet|bevegelighet|skadeforebygg|prevention/i,
    title: "Restitusjon og skadeforebygging",
    objective: "Beholde kvalitet i bevegelse og tilgjengelighet uten å gjøre en restitusjonsøkt til en ny hard fotballøkt.",
    baseSetup: "Et mulig utgangspunkt er lavintensivt arbeid i små grupper eller stasjoner, med kontrollert tempo og tydelig teknisk kvalitet.",
    defaultConfig: Object.freeze({ area: "medium", numbers: "even", direction: "positional", touches: "free" }),
    coachingPoints: Object.freeze([
      "Holder spillerne kontrollert tempo og god bevegelseskvalitet?",
      "Er økta fortsatt restitusjon, eller har konkurranseformen gjort den unødvendig hard?",
      "Blir bevegelsene renere utover økta i stedet for mer slitne?"
    ])
  }),
  Object.freeze({
    id: "team_shape",
    match: /rolle|formasjon|struktur|taktisk gjennomgang|team shape/i,
    title: "Rolleforståelse og lagstruktur",
    objective: "Trene avstander og relasjoner mellom roller slik at spillerne vet hvem som går, hvem som støtter og hvem som sikrer.",
    baseSetup: "Et mulig utgangspunkt er retningsbestemt formasjonsarbeid der situasjoner stoppes og startes på nytt for å justere avstander og rollebevegelser.",
    defaultConfig: Object.freeze({ area: "large", numbers: "even", direction: "directional", touches: "free" }),
    coachingPoints: Object.freeze([
      "Fyller to spillere samme rom uten at det skaper en fordel?",
      "Finnes det en tydelig støtte bak spilleren som går fram?",
      "Beholder laget forbindelsen mellom leddene når én rolle forlater posisjonen?"
    ])
  }),
  Object.freeze({
    id: "physical",
    match: /hurtighet|speed|eksplosiv|utholden|stamina|fysisk|styrke/i,
    title: "Fysisk kvalitet i fotballhandling",
    objective: "Koble fysisk arbeid til en konkret fotballhandling i stedet for å trene løping løsrevet fra situasjonen.",
    baseSetup: "Et mulig utgangspunkt er korte, retningsbestemte repetisjoner med ball eller tydelig spillsignal, slik at akselerasjon og bremsing skjer i en fotballkontekst.",
    defaultConfig: Object.freeze({ area: "large", numbers: "even", direction: "transition", touches: "free" }),
    coachingPoints: Object.freeze([
      "Starter spilleren fordi han leser situasjonen, eller bare fordi treneren blåser?",
      "Holder bevegelseskvaliteten seg gjennom repetisjonene?",
      "Er løpsretningen den samme typen bevegelse laget faktisk trenger i kamp?"
    ])
  }),
  Object.freeze({
    id: "generic",
    match: /.*/,
    title: "Fra øvelse til kampatferd",
    objective: "Gjøre treningsøkta tydelig nok til at manageren kan se den samme handlingen igjen i kamp.",
    baseSetup: "Start med én tydelig fotballhandling, gi spillerne et avgrenset rom og en regel som gjør at akkurat den handlingen må brukes ofte.",
    defaultConfig: Object.freeze({ area: "medium", numbers: "even", direction: "directional", touches: "free" }),
    coachingPoints: Object.freeze([
      "Hvilken konkret handling skal bli bedre?",
      "Tvinger reglene fram handlingen, eller kan spillerne løse øvelsen uten å bruke den?",
      "Kan du se den samme atferden igjen i kamp?"
    ])
  })
]);

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function optionIds(key) {
  return new Set((EXERCISE_DESIGN_CONTROLS[key] || []).map((option) => option.id));
}

function optionLabel(key, id) {
  return (EXERCISE_DESIGN_CONTROLS[key] || []).find((option) => option.id === id)?.label || id;
}

export function resolveTrainingExerciseArchetype(session = {}) {
  const source = [session.title, session.objective, session.focus, session.programTitle]
    .map(clean)
    .filter(Boolean)
    .join(" · ");
  return ARCHETYPES.find((entry) => entry.match.test(source)) || ARCHETYPES.at(-1);
}

export function normalizeExerciseDesignConfig(value, archetype = ARCHETYPES.at(-1)) {
  const source = value && typeof value === "object" ? value : {};
  const fallback = archetype?.defaultConfig || ARCHETYPES.at(-1).defaultConfig;
  const result = {};
  for (const key of Object.keys(EXERCISE_DESIGN_CONTROLS)) {
    const candidate = clean(source[key]);
    result[key] = optionIds(key).has(candidate) ? candidate : fallback[key];
  }
  return result;
}

export function createDefaultExerciseDesign(session = {}) {
  const archetype = resolveTrainingExerciseArchetype(session);
  return {
    version: TRAINING_EXERCISE_DESIGN_VERSION,
    archetypeId: archetype.id,
    config: normalizeExerciseDesignConfig(archetype.defaultConfig, archetype)
  };
}

function areaEffect(config) {
  if (config.area === "tight") {
    return "Lite område forkorter avstandene og øker tettheten rundt ballen. Beslutningene kommer raskere, men øvelsen gjengir i mindre grad store kampavstander og lange løp.";
  }
  if (config.area === "large") {
    return "Stort område gir større avstander å kontrollere og flere lange bevegelser. Spillerne får ofte litt mer tid på ballen, men laget må dekke mer rom når strukturen brytes.";
  }
  return "Middels område balanserer beslutningspress og kampnære avstander uten å gjøre øvelsen ekstrem i én retning.";
}

function numbersEffect(config) {
  if (config.numbers === "attack_overload") {
    return "Overtall med ball gjør det lettere å skape pasningslinjer og gir flere vellykkede repetisjoner i angrep. Laget uten ball må samtidig forsvare rom med mindre støtte.";
  }
  if (config.numbers === "defence_overload") {
    return "Overtall uten ball gjør løsningen vanskeligere for laget med ball og tvinger fram raskere orientering, støtte og risikovurdering. For lav mestring kan samtidig gjøre øvelsen mindre læringsrik.";
  }
  return "Likhet gir begge lag samme numeriske utgangspunkt. Da kommer forskjellene oftere fra avstander, timing, teknikk og valg enn fra et innebygd overtall.";
}

function directionEffect(config) {
  if (config.direction === "positional") {
    return "Posisjonsspill flytter oppmerksomheten mot støttevinkler, orientering og ballflyt. Uten et sluttmål blir overgangen til avslutning og returløp mindre framtredende.";
  }
  if (config.direction === "transition") {
    return "Omstillingsregel gjør balltap og ballvinning til selve vendepunktet i øvelsen. Første reaksjon, sikring og første pasning framover blir viktigere enn lang, uavbrutt ballbesittelse.";
  }
  return "Retning mot mål eller målsone gir spillerne en tydelig framoverreferanse. Gjennombrudd, dybde, returløp og når angrepet bør avsluttes blir lettere å lese.";
}

function touchesEffect(config) {
  if (config.touches === "two") {
    return "Maks to touch øker kravet til orientering før mottak og rask ballflyt. Det kan gjøre treg scanning synlig, men kan også fjerne nødvendige føringer, driblinger og pauser hvis regelen brukes ukritisk.";
  }
  if (config.touches === "three") {
    return "Maks tre touch gir tid til et kontrollert førstetouch og neste handling, men presser fortsatt spilleren til å orientere seg tidlig.";
  }
  return "Frie touch gir størst kamprealisme og rom for føring og én-mot-én. Treneren må samtidig passe på at ekstra touch ikke blir en måte å utsette beslutningen på.";
}

function topicEffect(archetype, config) {
  switch (archetype.id) {
    case "rest_defence":
      if (config.direction !== "transition") return "For restforsvar blir balltapet mindre tydelig når øvelsen ikke har en umiddelbar omstilling. Da trener du mer generell struktur enn selve sikringen bak angrepet.";
      return config.area === "large"
        ? "Dette oppsettet gir restforsvaret reelle avstander å kontrollere etter balltap. Se spesielt på plasseringen før ballen mistes."
        : "Dette trener førstereaksjonen godt, men mindre av de lange kontringsrommene som oppstår på full bane.";
    case "pressing":
      return config.area === "tight"
        ? "Det lille rommet gjør pressavstandene korte og gir mange gjenvinningsøyeblikk. Pass på at øvelsen fortsatt krever kollektiv støtte, ikke bare raske enkeltdueller."
        : "De større avstandene gjør det tydelig om andre og tredje pressledd faktisk flytter med når første spiller går.";
    case "build_up":
      return config.numbers === "attack_overload"
        ? "Overtallet gir ballfører flere støttevinkler og gjør det mulig å repetere oppbyggingsmønsteret ofte før motstanden økes."
        : "Uten overtall blir oppbyggingen mer kampnær og vanskeligere; vurder om spillerne fortsatt får nok vellykkede repetisjoner til å lære mønsteret.";
    case "width":
      return config.area === "large"
        ? "Større bredde gjør det lettere å skille mellom spilleren som holder utsiden og spilleren som angriper rommet innenfor."
        : "Et trangt område trener kombinasjoner, men kan skjule selve poenget med bredde fordi motstanderens siste ledd ikke må strekkes like langt.";
    case "finishing":
      return config.direction === "directional"
        ? "Retningen gjør avslutningen til slutten på en angrepssekvens. Coaching bør starte med hvordan sjansen skapes, ikke bare hvor skuddet ender."
        : "Uten tydelig retning trener du lettere ballkontroll og kombinasjon enn selve kjeden inn i avslutningen.";
    case "recovery":
      return config.direction === "transition" || config.touches === "two"
        ? "Dette oppsettet trekker økta mot konkurranse og høyere beslutningstempo. Hvis målet virkelig er restitusjon, bør kvalitet og kontroll vinne over intensitet."
        : "Oppsettet holder konkurransekravet nede og lar treneren prioritere kontrollert bevegelse, mobilitet og teknisk kvalitet.";
    case "team_shape":
      return config.area === "large"
        ? "Store avstander gjør rolleforbindelsene synlige: hvem støtter når en spiller går, og hvor oppstår hullet hvis ingen sikrer?"
        : "Trangere rom gjør kombinasjonene hyppigere, men kan skjule de egentlige avstandene mellom leddene i kamp.";
    case "physical":
      return config.direction === "transition"
        ? "Omstillingssignalet kobler akselerasjonen til en lesbar fotballhendelse. Startøyeblikket blir like viktig som toppfarten."
        : "Uten tydelig spillsignal kan øvelsen bli mer generell løping enn trening av den fysiske handlingen laget faktisk trenger i kamp.";
    default:
      return "Vurder om reglene gjør den ønskede fotballhandlingen nødvendig. Hvis spillerne kan lykkes uten å bruke handlingen, trener øvelsen sannsynligvis noe annet enn du tror.";
  }
}

function managerQuestion(archetype, config) {
  if (archetype.id === "rest_defence") return "Når ballen mistes: er problemet reaksjonen etter balltapet, eller plasseringen laget hadde før balltapet?";
  if (archetype.id === "pressing") return "Når første spiller går: blir neste pasning faktisk stengt av medspillerne bak ham?";
  if (archetype.id === "build_up") return "Får mottakeren ballen fordi han er fri nå, eller fordi laget allerede har skapt en fri neste spiller?";
  if (archetype.id === "width") return "Åpner bredden et annet rom, eller står flere spillere bare bredt samtidig?";
  if (archetype.id === "finishing") return "Gir øvelsen gode avslutninger fordi spillerne lærer å skape dem, eller fordi motstanden er for kunstig?";
  if (archetype.id === "recovery") return "Ser bevegelsene bedre ut etter økta, eller har du gjort en restitusjonsdag til en ny belastningsdag?";
  if (archetype.id === "team_shape") return "Når én rolle forlater posisjonen: hvem fyller rommet, hvem støtter, og hvem sikrer?";
  if (archetype.id === "physical") return "Starter spilleren raskt fordi han leser signalet i spillet, eller fordi øvelsen forteller ham nøyaktig når han skal løpe?";
  return `Med ${optionLabel("area", config.area).toLocaleLowerCase("nb-NO")}: kan du peke på den konkrete kampatferden øvelsen skal forbedre?`;
}

export function evaluateTrainingExerciseDesign(session = {}, value = null) {
  const archetype = resolveTrainingExerciseArchetype(session);
  const config = normalizeExerciseDesignConfig(value, archetype);
  return {
    version: TRAINING_EXERCISE_DESIGN_VERSION,
    archetype: {
      id: archetype.id,
      title: archetype.title,
      objective: archetype.objective,
      baseSetup: archetype.baseSetup
    },
    config,
    selections: {
      area: optionLabel("area", config.area),
      numbers: optionLabel("numbers", config.numbers),
      direction: optionLabel("direction", config.direction),
      touches: optionLabel("touches", config.touches)
    },
    effects: [
      { id: "area", label: "Rom og avstander", text: areaEffect(config) },
      { id: "numbers", label: "Overtall og mestring", text: numbersEffect(config) },
      { id: "direction", label: "Retning og overgang", text: directionEffect(config) },
      { id: "touches", label: "Tid på ballen", text: touchesEffect(config) }
    ],
    topicEffect: topicEffect(archetype, config),
    coachingPoints: [...archetype.coachingPoints],
    managerQuestion: managerQuestion(archetype, config),
    guardrail: "Dette er et læringslag over den valgte økta. Oppsettet endrer ikke lagret treningsbelastning, kampbonus, spillerverdier eller progresjon i v1."
  };
}

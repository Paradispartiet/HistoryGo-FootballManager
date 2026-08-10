// ============================================================================
// Fotballæring i managerløkken v1 — presentasjon og forklaring, ikke motor.
//
// Kobler eksisterende rolle-, taktikk-, trenings- og kampanalysesignaler til
// fotballfaglige forklaringer. Ingen egen state, scoring, progresjon eller
// kamp-/taktikk-/treningsberegning opprettes her.
// ============================================================================

const STYLE_ID = "managerFootballLearningLoopV1Style";
const ROLE_DATA_URL = new URL("../../data/football_roles.json", import.meta.url);

let roles = [];
let rolesLoaded = false;
let renderFrame = 0;

const ROLE_RELATION_LESSONS = Object.freeze({
  "inverted_winger|overlapping_fullback": Object.freeze({
    benefit: "Innoverkanten kan trekke inn og frigjøre yttersiden, mens backen gir laget bredde utenfra.",
    risk: "Hvis backen går før vingen har flyttet motstanderen, kan begge bli lette å stenge og laget stå åpent bak ballen.",
    watch: "Se etter om vingen trekker inn før backen går forbi, og hvem som sikrer rommet bak angrepet."
  }),
  "overlapping_fullback|wide_dribbler": Object.freeze({
    benefit: "Overlappen kan skape to-mot-en rundt en ving som allerede binder backen i én-mot-én.",
    risk: "Hvis begge blir stående i samme brede kanal, blokkerer de hverandres rom og restforsvaret kan svekkes.",
    watch: "Se etter timing: vingen binder motstanderen først, backen går når rommet faktisk åpnes."
  }),
  "balancing_six|box_to_box": Object.freeze({
    benefit: "Sekseren kan holde balansen mens boks-til-boks-spilleren forlater midtbanen og angriper neste rom.",
    risk: "Hvis begge går fram samtidig, mangler laget et sentralt sikringspunkt når ballen mistes.",
    watch: "Se etter om én av dem alltid er på riktig side av ballen når den andre går."
  }),
  "balancing_six|deep_playmaker": Object.freeze({
    benefit: "Den balanserende sekseren kan beskytte rommet rundt en dyp playmaker som trenger tid og pasningsvinkler.",
    risk: "Hvis begge blir for lave, kan avstanden fram til de offensive spillerne bli for stor.",
    watch: "Se etter om playmakeren får flere pasningslinjer samtidig som laget beholder forbindelsen til neste ledd."
  }),
  "channel_runner|linking_striker": Object.freeze({
    benefit: "Den møtende spissen kan trekke en stopper ut, mens bakromsspissen angriper rommet som oppstår bak.",
    risk: "Hvis begge møter eller begge går samtidig, forsvinner kontrasten som gjør relasjonen vanskelig å forsvare.",
    watch: "Se etter motsatte bevegelser: én mot ball, én gjennom siste ledd."
  }),
  "channel_runner|deep_playmaker": Object.freeze({
    benefit: "Den dype playmakeren kan vende spillet framover tidlig når bakromsspissen starter løpet sitt.",
    risk: "For tidlige løp uten press på ballfører kan bare gjøre laget langt og isolere spissen.",
    watch: "Se etter om løpet starter idet playmakeren får tid til å se framover."
  }),
  "false_nine|inverted_winger": Object.freeze({
    benefit: "En falsk nier som faller kan åpne rom for en innoverkant som angriper forbi ham inn i boksen.",
    risk: "Hvis ingen angriper bakrommet når nieren faller, får laget mye ball foran motstanderens forsvar uten dybde.",
    watch: "Se etter hvem som løper forbi den falske nieren når han møter."
  }),
  "box_striker|overlapping_fullback": Object.freeze({
    benefit: "Backens bredde og innlegg/cutbacks kan gi boksspissen flere avslutninger fra farlige rom.",
    risk: "Hvis hele angrepet ender i tidlige innlegg uten nok folk i boksen, blir servicen lett å forsvare.",
    watch: "Se etter om innlegget kommer når spissen og minst én medspiller har rukket å fylle boksen."
  })
});

const TRAINING_LESSONS = Object.freeze([
  Object.freeze({ match: /restforsvar|rest defense|sikring/, title: "Restforsvar er organiseringen bak angrepet", principle: "Når laget angriper må noen fortsatt kontrollere kontringsrom, andreballer og motstanderens fremste spillere.", why: "Økta skal derfor trene plassering og avstander mens laget har ball — ikke bare forsvar etter at ballen allerede er mistet.", watch: "Når laget mister ballen: hvor mange er på riktig side av den, og hvor raskt kan motstanderen spille framover?" }),
  Object.freeze({ match: /høyt press|pressing|press\b/, title: "Press er avstander og samtidighet", principle: "Første pressledd virker bare når neste ledd flytter med og stenger enkle pasninger ut av presset.", why: "Økta bør gjøre pressutløser, støttevinkel og lagets avstander tydelige, ikke bare få spillerne til å løpe mer.", watch: "Når én spiller går i press: følger de nærmeste etter, eller åpnes en fri pasning gjennom laget?" }),
  Object.freeze({ match: /oppbygg|build|pasning|førstetouch|first touch/, title: "Oppbygging handler om pasningslinjer før pasningen", principle: "Ballfører trenger støtte foran, ved siden av og bak ballen for å kunne spille gjennom press uten å tvinge fram en risikopasning.", why: "Teknikk og struktur må trenes sammen: mottak, kroppsstilling og hvor medspillerne tilbyr neste pasning.", watch: "Når laget spiller ut bakfra: har ballfører minst to tydelige løsninger, og vender mottakeren framover når rommet finnes?" }),
  Object.freeze({ match: /bredde|ving|overlapp|innlegg|siste pasning|cross|delivery/, title: "Bredde skal åpne rom — ikke bare flytte spillere ut", principle: "Bredde strekker motstanderens siste ledd, men verdien kommer først når noen samtidig angriper mellomrom og boks.", why: "Økta bør koble den brede spilleren til bevegelser rundt og foran ballen, slik at samme kanal ikke fylles av flere uten hensikt.", watch: "Når ballen går ut: hvem holder bredden, hvem angriper mellomrommet, og hvem sikrer bak angrepet?" }),
  Object.freeze({ match: /omstilling|transition|kontring|vertikal/, title: "Omstilling er et tidsvindu", principle: "Rett etter ballvinning er motstanderen ofte ute av balanse; laget må raskt avgjøre om rommet skal angripes eller ballen sikres.", why: "Treningen bør øve gjenkjenning og første handling, ikke bare høy fart.", watch: "Etter ballvinning: søker første blikk framover, og finnes det et løp som faktisk kan utnytte ubalansen?" }),
  Object.freeze({ match: /avslut|finishing|sjans/, title: "Avslutningen starter før skuddet", principle: "Kvaliteten på avslutningen påvirkes av hvordan spilleren kommer inn i rommet, kroppsstilling, tid og type sistepasning.", why: "Økta bør gjenskape beslutningen som leder til skuddet, ikke bare repetere skudd uten press og kontekst.", watch: "Kommer avslutteren til ballen i balanse og med et tydelig valg, eller blir skuddet en nødløsning?" }),
  Object.freeze({ match: /hurtighet|eksplosiv|speed/, title: "Hurtighet i fotball er handling i riktig øyeblikk", principle: "Akselerasjon betyr mest når spilleren leser situasjonen tidlig nok til å starte før motstanderen.", why: "Fysisk fart bør kobles til fotballhandlinger: press, rykk bak linjen, returløp og retningsforandring.", watch: "Hvem starter først når rommet åpnes — og brukes farten til en konkret fordel med eller uten ball?" }),
  Object.freeze({ match: /belast|restitus|utholden|stamina|recovery/, title: "Belastning er en del av læringen", principle: "Spillere lærer dårligere når kvaliteten i bevegelse og beslutning faller fordi belastningen er feil dosert.", why: "Målet er ikke mest mulig arbeid, men nok belastning til å utvikle kampatferden uten å ødelegge kvaliteten eller restitusjonen.", watch: "Holder laget samme avstander, tempo og tekniske kvalitet sent i økta — eller kollapser utførelsen?" })
]);

const SIGNAL_LESSONS = Object.freeze([
  Object.freeze({ match: /press|gjenvinn/, principle: "Press", explanation: "Press fungerer kollektivt: avstanden mellom første og andre pressledd avgjør om motstanderen kan spille seg ut.", watch: "Vurder om presset ble støttet av laget, ikke bare om første spiller løp mot ballen." }),
  Object.freeze({ match: /bakrom|høy linje|forsvarslinje|rom bak/, principle: "Dybdekontroll", explanation: "En høyere forsvarslinje komprimerer banen, men krever press på ballfører og kontroll på løp bak linjen.", watch: "Se sammen på presset foran ballen og rommet bak siste ledd; de to valgene kan ikke vurderes hver for seg." }),
  Object.freeze({ match: /bredde|kant|side|overlapp|innlegg/, principle: "Bredde og romfordeling", explanation: "Bredde skal flytte motstanderen og åpne andre rom. To spillere i samme kanal er bare nyttig hvis bevegelsene skaper en tydelig to-mot-en eller frigjør et annet rom.", watch: "Se hvem som holdt bredden, hvem som angrep mellomrommet og hvem som sikret bak ballen." }),
  Object.freeze({ match: /omstilling|kontring|transition|restforsvar|andreball/, principle: "Overgang og restforsvar", explanation: "Angrep og forsvar henger sammen: plasseringen mens laget angriper bestemmer hvor sårbart laget er i det øyeblikket ballen mistes.", watch: "Se på situasjonen rett før balltapet, ikke bare selve kontringen etterpå." }),
  Object.freeze({ match: /oppbygg|pasning|spille seg|balltap|førstetouch/, principle: "Oppbygging", explanation: "Oppbygging lykkes når ballfører har støttevinkler og mottakere som kan spille videre, ikke bare når pasningsprosenten er høy.", watch: "Se om laget skapte en fri neste spiller før pasningen ble slått." }),
  Object.freeze({ match: /relasjon|avstand|støtte|kombinasjon|mellomrom/, principle: "Relasjoner", explanation: "Roller virker gjennom hverandre: én bevegelse er verdifull når den åpner rom, gir støtte eller sikrer for en annen.", watch: "Vurder hvilke to eller tre spillere som faktisk skapte situasjonen sammen." }),
  Object.freeze({ match: /avslut|xg|sjanse|mål/, principle: "Sjansekvalitet", explanation: "Resultatet av et skudd er ikke hele læringen. Rommet, sistepasningen og avslutterens balanse sier mer om hvor gjentakbar sjansen er.", watch: "Se på hvordan sjansen ble skapt før du vurderer selve avslutningen." })
]);

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalized(value) {
  return clean(value).toLocaleLowerCase("nb-NO");
}

function tokenLabel(value) {
  return clean(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("nb-NO"));
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function relationKey(a, b) {
  return [clean(a), clean(b)].sort().join("|");
}

function roleByLabel(roleList, value) {
  const wanted = normalized(value).replace(/^rolle\s*:\s*/i, "").replace(/^valgt\s*:\s*/i, "");
  return roleList.find((role) => normalized(role?.id) === wanted || normalized(role?.name) === wanted) || null;
}

function roleById(roleList, value) {
  const wanted = clean(value);
  return roleList.find((role) => clean(role?.id) === wanted) || null;
}

function roleTokens(role, field) {
  return Array.isArray(role?.[field]) ? role[field].map(clean).filter(Boolean) : [];
}

function relationRank(selectedRole, partnerRole) {
  if (!selectedRole || !partnerRole) return null;
  if (ROLE_RELATION_LESSONS[relationKey(selectedRole.id, partnerRole.id)]) return 0;
  if (roleTokens(selectedRole, "goodWith").includes(partnerRole.id)) return 1;
  if (roleTokens(partnerRole, "goodWith").includes(selectedRole.id)) return 2;
  return null;
}

function lineupDistance(a, b) {
  const ax = Number(a?.x);
  const ay = Number(a?.y);
  const bx = Number(b?.x);
  const by = Number(b?.y);
  if (![ax, ay, bx, by].every(Number.isFinite)) return Number.POSITIVE_INFINITY;
  return Math.hypot(ax - bx, ay - by);
}

function coordinate(value) {
  const source = clean(value);
  return source ? Number(source) : Number.NaN;
}

export function createRoleRelationshipLesson(role, roleList = [], visibleRoleLabels = []) {
  if (!role) return null;
  const compatibleRoles = (Array.isArray(role.goodWith) ? role.goodWith : [])
    .map((token) => roleList.find((candidate) => candidate.id === token))
    .filter(Boolean);
  const visible = visibleRoleLabels.map((label) => roleByLabel(roleList, label)).filter(Boolean);
  const actualPartner = compatibleRoles.find((candidate) => visible.some((entry) => entry.id === candidate.id));
  const partner = actualPartner || compatibleRoles[0] || null;
  const note = partner ? ROLE_RELATION_LESSONS[relationKey(role.id, partner.id)] : null;
  const goodConcept = (Array.isArray(role.goodWith) ? role.goodWith : [])[0];
  const badConcept = (Array.isArray(role.badFor) ? role.badFor : [])[0];
  return {
    partnerName: partner?.name || (goodConcept ? tokenLabel(goodConcept) : "komplementær støtte"),
    isInLineup: Boolean(actualPartner),
    benefit: note?.benefit || `${role.name} fungerer best når en medspiller gir ${goodConcept ? tokenLabel(goodConcept).toLocaleLowerCase("nb-NO") : "en annen bevegelse eller støtte"} i samme angrep.`,
    risk: note?.risk || `Pass på ${badConcept ? tokenLabel(badConcept).toLocaleLowerCase("nb-NO") : "at flere roller ikke søker det samme rommet uten sikring"}.`,
    watch: note?.watch || "Se etter om rollene fyller ulike rom, gir hverandre pasningslinjer og om én spiller sikrer når en annen forlater posisjonen."
  };
}

// Konkretiserer den kuraterte rolleforklaringen mot de elleve spillerne som
// faktisk står på banen. Dette er fortsatt bare presentasjon: inputen kommer
// fra eksisterende lineup/rollekatalog, og resultatet endrer ingen fit-score.
export function createActualLineupRoleLesson({ selectedSlotId = "", lineup = [], roleList = [] } = {}) {
  const assignments = (Array.isArray(lineup) ? lineup : [])
    .map((entry) => ({
      slotId: clean(entry?.slotId),
      slotLabel: clean(entry?.slotLabel) || "Ukjent plass",
      position: clean(entry?.position),
      line: clean(entry?.line),
      playerName: clean(entry?.playerName) || "Ukjent spiller",
      roleId: clean(entry?.roleId),
      roleName: clean(entry?.roleName),
      x: coordinate(entry?.x),
      y: coordinate(entry?.y)
    }))
    .filter((entry) => entry.slotId && entry.playerName && entry.roleId);
  const selected = assignments.find((entry) => entry.slotId === clean(selectedSlotId)) || null;
  const selectedRole = roleById(roleList, selected?.roleId);
  if (!selected || !selectedRole) return null;

  const partners = assignments
    .filter((entry) => entry.slotId !== selected.slotId)
    .map((entry) => ({ entry, role: roleById(roleList, entry.roleId) }))
    .filter((candidate) => candidate.role)
    .map((candidate) => ({
      ...candidate,
      rank: relationRank(selectedRole, candidate.role),
      distance: lineupDistance(selected, candidate.entry)
    }))
    .filter((candidate) => candidate.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.distance - b.distance || a.entry.slotId.localeCompare(b.entry.slotId));

  const actual = partners[0] || null;
  const fallback = createRoleRelationshipLesson(
    selectedRole,
    roleList,
    actual ? [actual.role.name] : []
  );
  if (!fallback) return null;

  if (!actual) {
    return {
      status: "missing_curated_partner",
      selected,
      selectedRole,
      partner: null,
      partnerRole: null,
      suggestedPartnerName: fallback.partnerName,
      benefit: fallback.benefit,
      risk: fallback.risk,
      watch: fallback.watch
    };
  }

  const note = ROLE_RELATION_LESSONS[relationKey(selectedRole.id, actual.role.id)] || null;
  const benefit = note?.benefit || (actual.rank === 2
    ? `${actual.role.name} er dokumentert som en rolle som fungerer godt med ${selectedRole.name}.`
    : `${selectedRole.name} er dokumentert som en rolle som fungerer godt med ${actual.role.name}.`);
  const badConcept = roleTokens(selectedRole, "badFor")[0];
  return {
    status: "actual_pair",
    selected,
    selectedRole,
    partner: actual.entry,
    partnerRole: actual.role,
    suggestedPartnerName: actual.role.name,
    benefit,
    risk: note?.risk || `Følg med på ${badConcept ? tokenLabel(badConcept).toLocaleLowerCase("nb-NO") : "om rolleparet fyller samme rom uten sikring"}.`,
    watch: note?.watch || `Se etter om ${selected.playerName} og ${actual.entry.playerName} gir hverandre ulike bevegelser, pasningslinjer og sikring.`
  };
}

export function createTrainingLearningLesson(value) {
  const source = normalized(value);
  const lesson = TRAINING_LESSONS.find((entry) => entry.match.test(source));
  return lesson || {
    title: "Fra øvelse til kampatferd",
    principle: "Trening er nyttig når øvelsen utvikler en konkret handling laget trenger i kamp.",
    why: "Koble programmet til et fotballproblem: hvilket rom, hvilken relasjon eller hvilken beslutning skal bli bedre?",
    watch: "Se etter den samme handlingen i neste kamp. Hvis atferden ikke endres, må øvelsen eller forklaringen justeres."
  };
}

export function createMatchSignalLearningLesson(value) {
  const source = normalized(value);
  const lesson = SIGNAL_LESSONS.find((entry) => entry.match.test(source));
  return lesson || {
    principle: "Kampatferd",
    explanation: "Et kampsignal blir læring først når du kobler hendelsen til spillernes avstander, rom og valg før situasjonen oppsto.",
    watch: "Gå ett eller to trekk tilbake i situasjonen og finn hvilket valg som skapte fordelen eller problemet."
  };
}

export function createSystemLearningLesson({ intent = "", risk = "", parameters = [] } = {}) {
  const values = parameters.map((entry) => `${normalized(entry.label)} ${normalized(entry.value)} ${normalized(entry.explanation)}`).join(" ");
  let watch = "Se om kampbildet faktisk viser den atferden kampplanen ber om, og om risikoen blir håndtert av rollene rundt ballen.";
  if (/press/.test(values) && /høyt|svært høyt|middels høyt/.test(values)) {
    watch = "Se om første pressledd får støtte bakfra. Hvis avstanden blir stor, er et høyt press bare enkeltspillere som løper.";
  } else if (/forsvarslinje/.test(values) && /høyt|middels høyt/.test(values)) {
    watch = "Se om ballfører er under press når linjen står høyt. Uten press foran ballen blir bakrommet den reelle kostnaden.";
  } else if (/bredde/.test(values) && /stor|middels stor/.test(values)) {
    watch = "Se om bredden åpner mellomrom sentralt, eller om laget bare blir strukket og mister korte forbindelser.";
  } else if (/oppbygging/.test(values) && /direkte|vertikal|framover/.test(values)) {
    watch = "Se om de tidlige framoverpasningene har mottakere og støtte rundt andreballen, eller bare flytter balltapet høyere i banen.";
  } else if (/oppbygging/.test(values)) {
    watch = "Se om den kontrollerte oppbyggingen faktisk skaper en fri spiller framover, ikke bare flere pasninger foran motstanderens press.";
  }
  return {
    intent: clean(intent) || "Kampplanens intensjon er ikke dokumentert.",
    tradeoff: clean(risk) || "Ingen dokumentert risiko er tilgjengelig for denne kampplanen.",
    watch
  };
}

async function loadRoles() {
  if (rolesLoaded) return roles;
  rolesLoaded = true;
  try {
    const response = await fetch(ROLE_DATA_URL);
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    roles = Array.isArray(data?.roles) ? data.roles : [];
  } catch (error) {
    console.warn("Kunne ikke laste rolledata til fotballæringslaget", error);
    roles = [];
  }
  return roles;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-football-learning-loop-v1.css", import.meta.url).href;
  document.head.append(link);
}

function lineupAssignmentsFromPitch() {
  return Array.from(document.querySelectorAll("#lineupSlots .player-chip")).map((chip) => ({
    slotId: chip.dataset.slotId,
    slotLabel: chip.dataset.slotLabel,
    position: chip.dataset.position,
    line: chip.dataset.line,
    playerName: chip.dataset.playerName,
    roleId: chip.dataset.roleId,
    roleName: chip.dataset.roleName,
    x: chip.dataset.x,
    y: chip.dataset.y
  }));
}

function markActualRolePair(selectedSlotId = "", partnerSlotId = "") {
  document.querySelectorAll("#lineupSlots .player-chip").forEach((chip) => {
    chip.classList.toggle("is-role-learning-focus", chip.dataset.slotId === selectedSlotId);
    chip.classList.toggle("is-role-learning-partner", Boolean(partnerSlotId) && chip.dataset.slotId === partnerSlotId);
  });
}

function enhanceRoleLearning() {
  const region = document.getElementById("managerLineupRoleLearning");
  if (!region || region.hidden || !roles.length) {
    markActualRolePair();
    return;
  }
  const selected = roleByLabel(roles, document.getElementById("managerLineupSlotRole")?.textContent);
  if (!selected) {
    markActualRolePair();
    return;
  }
  const selectedSlotId = clean(document.getElementById("managerLineupSlotInspector")?.dataset.slotId);
  const actual = createActualLineupRoleLesson({
    selectedSlotId,
    lineup: lineupAssignmentsFromPitch(),
    roleList: roles
  });
  const generic = actual ? null : createRoleRelationshipLesson(selected, roles, []);
  if (!actual && !generic) {
    markActualRolePair();
    return;
  }
  markActualRolePair(selectedSlotId, actual?.partner?.slotId || "");
  const signature = actual
    ? `${actual.status}|${actual.selected.slotId}|${actual.selectedRole.id}|${actual.partner?.slotId || actual.suggestedPartnerName}`
    : `${selected.id}|${generic.partnerName}|generic`;
  let block = region.querySelector(".football-learning-role-relationship");
  if (block?.dataset.learningSignature === signature) return;
  if (!block) {
    block = document.createElement("section");
    block.className = "football-learning-role-relationship";
    region.append(block);
  }
  block.dataset.learningSignature = signature;
  if (actual?.status === "actual_pair") {
    block.innerHTML = `
      <h4>Relasjonen i din faktiske ellever</h4>
      <p class="football-learning-kicker"><strong>${escapeHtml(actual.selected.playerName)}</strong> + <strong>${escapeHtml(actual.partner.playerName)}</strong></p>
      <dl class="football-learning-actual-pair">
        <div><dt>Plasser</dt><dd>${escapeHtml(actual.selected.slotLabel)} ↔ ${escapeHtml(actual.partner.slotLabel)}</dd></div>
        <div><dt>Roller</dt><dd>${escapeHtml(actual.selectedRole.name)} ↔ ${escapeHtml(actual.partnerRole.name)}</dd></div>
      </dl>
      <p><strong>Hva de prøver å skape:</strong> ${escapeHtml(actual.benefit)}</p>
      <p><strong>Risiko:</strong> ${escapeHtml(actual.risk)}</p>
      <p><strong>Se etter:</strong> ${escapeHtml(actual.watch)}</p>
      <small>De to spillerplassene er markert på banen. Forklaringen leser dagens ellever og den eksisterende rollekatalogen; den endrer ingen rollefit.</small>`;
    return;
  }
  if (actual) {
    block.innerHTML = `
      <h4>Rollen i din faktiske ellever</h4>
      <p class="football-learning-kicker"><strong>${escapeHtml(actual.selected.playerName)}</strong> · ${escapeHtml(actual.selected.slotLabel)} · ${escapeHtml(actual.selectedRole.name)}</p>
      <p><strong>Ikke representert i elleveren:</strong> Ingen annen valgt spiller har den kuraterte komplementærrollen ${escapeHtml(actual.suggestedPartnerName)}.</p>
      <p>Det betyr ikke at oppstillingen er feil. Det betyr at rollekatalogen ikke har et dokumentert rollepar å forklare i akkurat denne elleveren.</p>
      <p><strong>Mulig hensikt:</strong> ${escapeHtml(actual.benefit)}</p>
      <p><strong>Se etter:</strong> ${escapeHtml(actual.watch)}</p>`;
    return;
  }
  block.innerHTML = `
    <h4>Relasjon til andre roller</h4>
    <p class="football-learning-kicker">Komplementær rolle: <strong>${escapeHtml(generic.partnerName)}</strong></p>
    <p><strong>Hvorfor:</strong> ${escapeHtml(generic.benefit)}</p>
    <p><strong>Risiko:</strong> ${escapeHtml(generic.risk)}</p>
    <p><strong>Se etter:</strong> ${escapeHtml(generic.watch)}</p>`;
}

function trainingSourceText() {
  return [
    document.getElementById("trainingDayProgramTitle")?.textContent,
    document.getElementById("trainingDayFocus")?.textContent,
    ...Array.from(document.querySelectorAll("#trainingDaySessions .training-day-session-title")).map((node) => node.textContent)
  ].filter(Boolean).join(" · ");
}

function enhanceTraining() {
  const side = document.querySelector("#managerTrainingDay .training-day-side");
  if (!side) return;
  const source = trainingSourceText();
  const lesson = createTrainingLearningLesson(source);
  const signature = `${lesson.title}|${source}`;
  let card = document.getElementById("footballLearningTrainingRationale");
  if (card?.dataset.learningSignature === signature) return;
  if (!card) {
    card = document.createElement("section");
    card.id = "footballLearningTrainingRationale";
    card.className = "training-day-card football-learning-training";
    side.append(card);
  }
  card.dataset.learningSignature = signature;
  card.innerHTML = `
    <span>Fotballprinsipp</span>
    <strong>${lesson.title}</strong>
    <p>${lesson.principle}</p>
    <p><b>Hvorfor denne økta:</b> ${lesson.why}</p>
    <p><b>Se etter i kamp:</b> ${lesson.watch}</p>`;
}

function systemParameters(workspace) {
  return Array.from(workspace.querySelectorAll("[data-system-parameter]")).map((row) => ({
    label: clean(row.querySelector(".manager-system-principle-label")?.textContent),
    value: clean(row.querySelector(".manager-system-principle-value")?.textContent),
    explanation: clean(row.querySelector(".manager-system-principle-explanation")?.textContent)
  }));
}

function firstSystemRisk(workspace) {
  const columns = Array.from(workspace.querySelectorAll(".manager-system-knowledge-column"));
  const riskColumn = columns.find((column) => /risiko/i.test(column.querySelector("strong")?.textContent || ""));
  return clean(riskColumn?.querySelector("li")?.textContent);
}

function enhanceSystem() {
  const workspace = document.getElementById("managerSystemWorkspaceV2");
  if (!workspace) return;
  const model = createSystemLearningLesson({
    intent: workspace.querySelector(".manager-system-intent")?.textContent,
    risk: firstSystemRisk(workspace),
    parameters: systemParameters(workspace)
  });
  const signature = `${model.intent}|${model.tradeoff}|${model.watch}`;
  let block = document.getElementById("footballLearningSystemBridge");
  if (block?.dataset.learningSignature === signature) return;
  if (!block) {
    block = document.createElement("section");
    block.id = "footballLearningSystemBridge";
    block.className = "football-learning-system-bridge";
    workspace.append(block);
  }
  block.dataset.learningSignature = signature;
  block.innerHTML = `
    <span>Fra kampplan til kampatferd</span>
    <strong>${model.intent}</strong>
    <p><b>Kompromiss:</b> ${model.tradeoff}</p>
    <p><b>Se etter i kamp:</b> ${model.watch}</p>`;
}

function tacticalSignals(postMatch) {
  const tacticalCard = Array.from(postMatch.querySelectorAll(".matchday-post-match-card"))
    .find((card) => /taktisk evaluering/i.test(card.querySelector("span")?.textContent || ""));
  return tacticalCard
    ? Array.from(tacticalCard.querySelectorAll("li")).map((item) => clean(item.textContent)).filter(Boolean).slice(0, 2)
    : [];
}

function enhancePostMatch() {
  const postMatch = document.querySelector(".matchday-post-match");
  if (!postMatch) return;
  const signals = tacticalSignals(postMatch);
  const intent = clean(document.querySelector("#managerSystemWorkspaceV2 .manager-system-intent")?.textContent);
  const signature = `${intent}|${signals.join("|")}`;
  let block = postMatch.querySelector(".football-learning-post-match");
  if (block?.dataset.learningSignature === signature) return;
  if (!block) {
    block = document.createElement("section");
    block.className = "football-learning-post-match";
    postMatch.append(block);
  }
  block.dataset.learningSignature = signature;
  block.replaceChildren();

  const header = document.createElement("header");
  header.innerHTML = `<span>Fotballæring</span><h4>Valg → kampsignal → læring</h4>${intent ? `<p><b>Kampplanens utgangspunkt:</b> ${intent}</p>` : ""}`;
  block.append(header);

  if (!signals.length) {
    const empty = document.createElement("p");
    empty.className = "football-learning-empty";
    empty.textContent = "Ingen tydelig taktisk faktor er registrert i kampforklaringen. Derfor kobles det heller ikke på en oppdiktet teoriforklaring etter denne kampen.";
    block.append(empty);
  } else {
    const grid = document.createElement("div");
    grid.className = "football-learning-signal-grid";
    signals.forEach((signal) => {
      const lesson = createMatchSignalLearningLesson(signal);
      const card = document.createElement("article");
      card.innerHTML = `
        <span>Kampsignal</span>
        <strong>${signal}</strong>
        <p><b>Prinsipp · ${lesson.principle}:</b> ${lesson.explanation}</p>
        <p><b>Neste gang:</b> ${lesson.watch}</p>`;
      grid.append(card);
    });
    block.append(grid);
  }
  const source = document.createElement("small");
  source.textContent = "Bare registrerte taktiske faktorer fra den eksisterende kampforklaringen brukes som kampsignaler her.";
  block.append(source);
}

function renderLearningLayer() {
  enhanceRoleLearning();
  enhanceTraining();
  enhanceSystem();
  enhancePostMatch();
}

function scheduleRender() {
  // Coalesce, ikke debounce: kontinuerlige DOM-oppdateringer i managerflaten
  // skal aldri kunne skyve læringsrenderen foran seg for alltid.
  if (renderFrame) return;
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderLearningLayer();
  });
}

function installObservers() {
  window.addEventListener("hgfm:team-merits-changed", scheduleRender);
  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("storage", scheduleRender);
  document.addEventListener("click", () => queueMicrotask(scheduleRender), true);
  document.addEventListener("change", scheduleRender, true);
  const observer = new MutationObserver(() => scheduleRender());
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class", "data-selected"] });
}

async function boot() {
  ensureStyles();
  // System, trening og etterkamp er uavhengige av rollekatalogen. Lytt derfor
  // på managerflatene før rolledata lastes, så raske tab-/rapport-rerenders
  // aldri kan passere læringslaget mens fetch fortsatt pågår.
  installObservers();
  renderLearningLayer();
  await loadRoles();
  renderLearningLayer();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
}

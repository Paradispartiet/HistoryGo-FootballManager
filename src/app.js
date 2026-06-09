import { FOOTBALL_POSITIONS } from "./football-fit-engine.js";
import { calculateTeamFit } from "./football-team-fit-engine.js";
import {
  createLegacyManagerAppStateFromBrowserState,
  getDashboardViewModelFromLegacyManagerState,
  createInitialClubWeekStateFromBrowser,
  advanceClubWeekPhaseFromBrowser,
  applyClubWeekEffectsFromBrowser,
  createClubWeekSummaryFromBrowser,
  getClubWeekPhaseLabelFromBrowser,
} from "./app-manager-engine-bridge.js";

const DATA_PATHS = {
  players: "data/football_players.json",
  roles: "data/football_roles.json",
  tactics: "data/football_tactics.json",
  formations: "data/football_formations.json",
  knowledgePrinciples: "data/football_knowledge_principles.json",
  clubInboxMessages: "data/club_inbox_messages.json",
  clubInboxSenders: "data/club_inbox_senders.json",
  clubInboxThreads: "data/club_inbox_threads.json",
  // History Go-unlocks: steder, stab, ekspertise, treningsprogrammer og badges.
  unlocks: "data/football_unlocks.json",
  staff: "data/football_staff.json",
  expertise: "data/football_expertise.json",
  trainingPrograms: "data/football_training_programs.json",
  trainingBadges: "data/football_training_badges.json",
  teamClassifications: "data/football_team_classifications.json",
  // V1 bruker example-filen som midlertidig lag-/demostate (unlockedPlaceIds,
  // hiredStaffIds, earnedBadgeIds osv.). Flyttes til save-system senere.
  teamMerits: "data/football_team_merits.example.json"
};

const EMPTY_VALUE = "__empty__";
const POSITIONS_KEY = "hgfm.slotPositions.v1";
const ACTIVE_KNOWLEDGE_FOCUS_KEY = "hgfm.activeKnowledgeFocus.v1";
const COMPLETED_KNOWLEDGE_FOCUS_KEY = "hgfm.completedKnowledgeFocus.v1";
const TRAINING_WEEK_KEY = "hgfm.trainingWeek.v1";
const CLUB_WEEK_STATE_KEY = "hgfm.clubWeekState.v1";
const CLUB_WEEK_FEEDBACK_KEY = "hgfm.clubWeekFeedback.v1";
const CLUB_WEEK_EVENT_LOG_KEY = "hgfm.clubWeekEventLog.v1";
// History Go-lagprogresjon (team merits) i localStorage. Seedes fra example-filen
// ved første lasting, deretter persisteres brukerens egne endringer her.
const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";
// Innboks-tråder: leste og leverte meldings-id-er (kun UI/progresjon).
const READ_INBOX_MESSAGE_IDS_KEY = "hgfm.readInboxMessageIds.v1";
const DELIVERED_INBOX_MESSAGE_IDS_KEY = "hgfm.deliveredInboxMessageIds.v1";

// Ekte History Go-progresjon i localStorage (skrives av History Go-appen, ikke
// av Football Manager). Brukes som kilde til faktisk besøkte sportsteder.
//   visited_places            – objekt/map med besøkte placeId-er ({ id: true }).
//   hg_groundhopper_stats_v1  – Groundhopper-/sportstatistikk, der
//                               visited_groundhopper_places er hovedlisten.
const HISTORY_GO_VISITED_PLACES_KEY = "visited_places";
const HISTORY_GO_GROUNDHOPPER_STATS_KEY = "hg_groundhopper_stats_v1";

// Maks antall klubbhendelser som beholdes i loggen (nyeste først).
const CLUB_WEEK_EVENT_LOG_LIMIT = 12;

// Standard y-bånd per lagdel (0 % = topp/angrep, 100 % = bunn/keeper).
const LINE_Y = { keeper: 90, defense: 72, midfield: 50, attack: 24 };

const state = {
  players: [],
  roles: [],
  tactics: [],
  formations: [],
  knowledgePrinciples: [],
  selectedFormationId: null,
  selectedTacticId: null,
  selectedSlotId: null,
  lineup: {},
  // slotId -> { x, y } i prosent innenfor banen, for gjeldende formasjon.
  slotPositions: {},
  // Valgt kunnskapskort som ukens treningsfokus (kun UI/state, ingen kampmotor-effekt).
  activeKnowledgeFocusId: null,
  // Kunnskapsfokus som er markert fullført denne uken (kun UI/progresjon, ingen score-effekt).
  completedKnowledgeFocusIds: new Set(),
  // Gjeldende treningsuke (kun UI/progresjon, ingen kampmotor- eller score-effekt).
  trainingWeek: 1,
  // Club Week Engine-tilstand (uke, fase og klubbverdier). Normaliseres av engine/fallback.
  clubWeekState: null,
  // Kort tilbakemelding om siste fasebytte (kun UI/tekst, ingen score- eller engine-effekt).
  clubWeekFeedback: "Klubbuken er klar.",
  // Kort logg over fasebytter i Club Week (nyeste først). Kun UI/state/localStorage.
  clubWeekEventLog: [],
  // Lesbare innboksmeldinger fra datafil. Kun visning i denne PR-en –
  // ingen state-effekter, svarvalg eller konsekvenser ennå.
  clubInboxMessages: [],
  // Full avsenderkatalog for Innboks. Brukes til å vise stabile klubbstemmer fra start.
  clubInboxSenders: [],
  // Trådkatalog for Innboks. Grupperer meldinger i samtaletråder per avsender/tema.
  clubInboxThreads: [],
  // Innboks-tråd-state (kun UI/progresjon i localStorage – ingen kampmotor-,
  // rollefit- eller matching-effekt):
  // - delivered = meldinger som har blitt utløst/vist minst én gang (matchet
  //   fase/conditions). Huskes i historikken selv etter at conditions slutter å matche.
  // - read = meldinger brukeren har markert som lest via "Marker tråd som lest".
  // - Innboks viser aktive tråder med uleste meldinger.
  // - Arkiv viser tråder med levert/lest historikk.
  readInboxMessageIds: new Set(),
  deliveredInboxMessageIds: new Set(),
  // History Go-unlocks (v1). Kobler besøkte steder til Football Manager-ressurser.
  // Filtreres gjennom teamMerits.unlockedPlaceIds. Ingen fit-/kampmotor-effekt.
  unlocks: { placeUnlocks: [] },
  staff: [],
  expertise: [],
  trainingPrograms: [],
  trainingBadges: { badgeFamilies: [] },
  teamClassifications: { classifications: [] },
  // Midlertidig lag-/demostate fra example-filen (unlockedPlaceIds, hiredStaffIds,
  // unlockedExpertiseIds, earnedBadgeIds, badgeProgress, activeClassifications).
  teamMerits: null
};

const elements = {
  formationSelect: document.querySelector("#formationSelect"),
  tacticSelect: document.querySelector("#tacticSelect"),
  teamStatus: document.querySelector("#teamStatus"),
  teamScore: document.querySelector("#teamScore"),
  roleFitAverage: document.querySelector("#roleFitAverage"),
  tacticFitAverage: document.querySelector("#tacticFitAverage"),
  balanceScore: document.querySelector("#balanceScore"),
  restDefenseScore: document.querySelector("#restDefenseScore"),
  formationTitle: document.querySelector("#formationTitle"),
  completeCount: document.querySelector("#completeCount"),
  lineupSlots: document.querySelector("#lineupSlots"),
  selectedSlotTitle: document.querySelector("#selectedSlotTitle"),
  slotPlayerSelect: document.querySelector("#slotPlayerSelect"),
  slotRoleSelect: document.querySelector("#slotRoleSelect"),
  selectedMatchScore: document.querySelector("#selectedMatchScore"),
  selectedFitStatus: document.querySelector("#selectedFitStatus"),
  selectedFitExplanation: document.querySelector("#selectedFitExplanation"),
  reportSummary: document.querySelector("#reportSummary"),
  strengthsList: document.querySelector("#strengthsList"),
  issuesList: document.querySelector("#issuesList"),
  widthScore: document.querySelector("#widthScore"),
  depthScore: document.querySelector("#depthScore"),
  buildUpScore: document.querySelector("#buildUpScore"),
  pressScore: document.querySelector("#pressScore"),
  managerSummary: document.querySelector("#managerSummary"),
  managerTopActions: document.querySelector("#managerTopActions"),
  managerTrainingPlan: document.querySelector("#managerTrainingPlan"),
  managerRoleChanges: document.querySelector("#managerRoleChanges"),
  managerWeakPoints: document.querySelector("#managerWeakPoints"),
  managerKnowledgeRecommendations: document.querySelector("#managerKnowledgeRecommendations"),
  activeKnowledgeFocus: document.querySelector("#activeKnowledgeFocus"),
  clearKnowledgeFocus: document.querySelector("#clearKnowledgeFocus"),
  trainingWeekStatus: document.querySelector("#trainingWeekStatus"),
  advanceTrainingWeek: document.querySelector("#advanceTrainingWeek"),
  trainingHistoryList: document.querySelector("#trainingHistoryList"),
  knowledgeCompletedThisWeek: document.querySelector("#knowledgeCompletedThisWeek"),
  knowledgeCompletedTotal: document.querySelector("#knowledgeCompletedTotal"),
  clubWeekSummary: document.querySelector("#clubWeekSummary"),
  clubWeekPhase: document.querySelector("#clubWeekPhase"),
  clubWeekFeedback: document.querySelector("#clubWeekFeedback"),
  advanceClubWeekPhase: document.querySelector("#advanceClubWeekPhase"),
  clubBoardTrust: document.querySelector("#clubBoardTrust"),
  clubPlayerMorale: document.querySelector("#clubPlayerMorale"),
  clubTacticalClarity: document.querySelector("#clubTacticalClarity"),
  clubTrainingCulture: document.querySelector("#clubTrainingCulture"),
  clubMediaPressure: document.querySelector("#clubMediaPressure"),
  clubWeekEventLog: document.querySelector("#clubWeekEventLog"),
  inboxMessageList: document.querySelector("#inboxMessageList"),
  inboxThreadList: document.querySelector("#inboxThreadList"),
  inboxThreadArchive: document.querySelector("#inboxThreadArchive"),
  // History Go-unlocks (v1).
  unlockPlacesList: document.querySelector("#unlockPlacesList"),
  availableStaffList: document.querySelector("#availableStaffList"),
  hiredStaffList: document.querySelector("#hiredStaffList"),
  unlockedExpertiseList: document.querySelector("#unlockedExpertiseList"),
  availableTrainingProgramsList: document.querySelector("#availableTrainingProgramsList"),
  earnedBadgesList: document.querySelector("#earnedBadgesList"),
  teamClassificationsList: document.querySelector("#teamClassificationsList"),
  // History Go-treningsuke og progresjon (v1, interaktivt).
  hgTrainingWeekStatus: document.querySelector("#hgTrainingWeekStatus"),
  advanceHgTrainingWeek: document.querySelector("#advanceHgTrainingWeek"),
  resetHgTeamMerits: document.querySelector("#resetHgTeamMerits"),
  badgeProgressList: document.querySelector("#badgeProgressList"),
  // Ekte History Go-sync (v1): statusfelt og manuell synk-knapp.
  historyGoSyncStatus: document.querySelector("#historyGoSyncStatus"),
  syncHistoryGoPlaces: document.querySelector("#syncHistoryGoPlaces")
};

let managerEngineRenderId = 0;

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Kunne ikke laste ${path}`);
  }

  return response.json();
}

function setOptions(select, items, getValue, getLabel, emptyLabel = null, shouldDisable = null) {
  select.innerHTML = "";

  if (emptyLabel) {
    const emptyOption = document.createElement("option");
    emptyOption.value = EMPTY_VALUE;
    emptyOption.textContent = emptyLabel;
    select.append(emptyOption);
  }

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = getValue(item);
    option.textContent = getLabel(item);
    option.disabled = shouldDisable ? shouldDisable(item) : false;
    select.append(option);
  });
}

function validateFootballData({ players, roles, tactics, formations }) {
  const warnings = [];
  const roleIds = new Set(roles.map((role) => role.id));
  const validPositions = new Set(FOOTBALL_POSITIONS);

  players.forEach((player) => {
    if (!player.id || !player.name) {
      warnings.push("En spiller mangler id eller name.");
    }

    if (typeof player.overall !== "number" || player.overall < 85 || player.overall > 100) {
      warnings.push(`${player.name || player.id} har overall utenfor 85–100.`);
    }

    if (!Array.isArray(player.naturalPositions) || player.naturalPositions.length === 0) {
      warnings.push(`${player.name || player.id} mangler naturalPositions.`);
    }

    player.naturalPositions?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${player.name || player.id} har ukjent naturalPosition: ${position}.`);
      }
    });

    player.usablePositions?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${player.name || player.id} har ukjent usablePosition: ${position}.`);
      }
    });

    player.poorFits?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${player.name || player.id} har ukjent poorFit: ${position}.`);
      }
    });

    if (!Array.isArray(player.preferredRoles) || player.preferredRoles.length === 0) {
      warnings.push(`${player.name || player.id} mangler preferredRoles.`);
    }

    player.preferredRoles?.forEach((roleId) => {
      if (!roleIds.has(roleId)) {
        warnings.push(`${player.name || player.id} peker på ukjent rolle: ${roleId}.`);
      }
    });
  });

  roles.forEach((role) => {
    if (!role.id || !role.name) {
      warnings.push("En rolle mangler id eller name.");
    }

    if (!Array.isArray(role.validPositions) || role.validPositions.length === 0) {
      warnings.push(`${role.name || role.id} mangler validPositions.`);
    }

    role.validPositions?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${role.name || role.id} har ukjent validPosition: ${position}.`);
      }
    });
  });

  tactics.forEach((tactic) => {
    if (!tactic.id || !tactic.name) {
      warnings.push("En taktikk mangler id eller name.");
    }

    if (!Array.isArray(tactic.tags) || tactic.tags.length === 0) {
      warnings.push(`${tactic.name || tactic.id} mangler tags.`);
    }
  });

  formations.forEach((formation) => {
    if (!formation.id || !formation.name) {
      warnings.push("En formasjon mangler id eller name.");
    }

    if (!Array.isArray(formation.slots) || formation.slots.length !== 11) {
      warnings.push(`${formation.name || formation.id} må ha nøyaktig 11 slots.`);
    }

    formation.slots?.forEach((slot) => {
      if (!slot.slotId || !slot.label || !slot.position) {
        warnings.push(`${formation.name || formation.id} har en ufullstendig slot.`);
      }

      if (!validPositions.has(slot.position)) {
        warnings.push(`${formation.name || formation.id} har ukjent slot-posisjon: ${slot.position}.`);
      }
    });
  });

  return warnings;
}

// ============================================================================
// History Go unlock-motor (v1)
// Kobler besøkte/samlede History Go-steder til Football Manager-ressurser.
// Kjerneløkke: Sted → Person → Ekspertise → Treningsprogram → Badge → Lagklasse.
// Alt filtreres gjennom unlockedPlaceIds (+ team merits). Rene hjelpefunksjoner,
// robuste mot manglende prototypefelt. Ingen effekt på fit-/kamp-/scoremotoren.
// ============================================================================

// Rekkefølge på badge-nivåer, brukes til klassifiseringsberegning.
const BADGE_LEVEL_ORDER = { bronze: 1, silver: 2, gold: 3 };

// Tekst per programstatus, brukt i render.
const TRAINING_STATUS_TEXT = {
  available: "Tilgjengelig",
  needs_staff: "Mangler riktig stab",
  needs_expertise: "Mangler ekspertise"
};

// Seed fra football_team_merits.example.json. Brukes som utgangspunkt ved første
// lasting og når brukeren nullstiller progresjonen.
let teamMeritsSeed = null;

// Dyp klone uten å dele referanser med seed eller localStorage-parsing.
function cloneTeamMerits(merits) {
  return JSON.parse(JSON.stringify(merits));
}

function isTeamMeritsObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// Normaliser team merits til forventet form slik at render-/progresjonslaget
// alltid har gyldige arrays/tall, uansett seed eller lagret tilstand.
function normalizeTeamMerits(merits) {
  const base = isTeamMeritsObject(merits) ? merits : {};
  return {
    ...base,
    activeTrainingWeek:
      Number.isInteger(base.activeTrainingWeek) && base.activeTrainingWeek >= 1 ? base.activeTrainingWeek : 1,
    hiredStaffIds: Array.isArray(base.hiredStaffIds) ? base.hiredStaffIds : [],
    unlockedPlaceIds: Array.isArray(base.unlockedPlaceIds) ? base.unlockedPlaceIds : [],
    unlockedExpertiseIds: Array.isArray(base.unlockedExpertiseIds) ? base.unlockedExpertiseIds : [],
    earnedBadgeIds: Array.isArray(base.earnedBadgeIds) ? base.earnedBadgeIds : [],
    badgeProgress: Array.isArray(base.badgeProgress) ? base.badgeProgress : [],
    activeClassifications: Array.isArray(base.activeClassifications) ? base.activeClassifications : []
  };
}

// Les team merits: prøv localStorage først, fall ellers tilbake til seed-data.
// Må tåle manglende/korrupt localStorage uten å krasje. Lagrer seed-en for
// senere bruk (resetTeamMerits).
function loadTeamMerits(seedMerits) {
  teamMeritsSeed = isTeamMeritsObject(seedMerits) ? cloneTeamMerits(seedMerits) : null;

  try {
    const raw = localStorage.getItem(TEAM_MERITS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isTeamMeritsObject(parsed)) {
        return normalizeTeamMerits(parsed);
      }
    }
  } catch (error) {
    // Korrupt eller utilgjengelig localStorage: bruk seed i stedet for å krasje.
  }

  return teamMeritsSeed ? normalizeTeamMerits(cloneTeamMerits(teamMeritsSeed)) : null;
}

// Lagre gjeldende team merits til localStorage. Stille no-op hvis lagring feiler.
function saveTeamMerits() {
  if (!state.teamMerits) {
    return;
  }
  try {
    localStorage.setItem(TEAM_MERITS_KEY, JSON.stringify(state.teamMerits));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Nullstill progresjon: slett localStorage-key, gjenopprett seed og rerender.
function resetTeamMerits() {
  try {
    localStorage.removeItem(TEAM_MERITS_KEY);
  } catch (error) {
    // Fjerning kan feile i privat modus e.l. Da fortsetter vi uansett.
  }

  state.teamMerits = teamMeritsSeed ? normalizeTeamMerits(cloneTeamMerits(teamMeritsSeed)) : null;
  recomputeActiveClassifications();
  renderApp();
}

// Hold activeClassifications synk med opptjente badges. Kjøres etter hver
// badge-endring og ved lasting/nullstilling slik at lagrede/viste klasser
// alltid speiler earnedBadgeIds.
function recomputeActiveClassifications() {
  if (state.teamMerits) {
    state.teamMerits.activeClassifications = computeActiveClassificationIds();
  }
}

// ----------------------------------------------------------------------------
// Ekte History Go-sync (v1)
// Football Manager leser History Go sin egen localStorage-progresjon og bruker
// faktisk besøkte sportsteder som grunnlag for unlocks. Dette legges som et lag
// oppå demo-/lagstaten i hgfm.teamMerits.v1 – det erstatter den ikke.
// ----------------------------------------------------------------------------

// Trygg JSON-lesing fra localStorage. Krasjer aldri: returnerer fallback ved
// manglende nøkkel, ugyldig JSON eller utilgjengelig localStorage (privat modus).
function readJsonLocalStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch (error) {
    return fallback;
  }
}

// Besøkte steder fra History Go (`visited_places`). Forventet form er et
// objekt/map { placeId: truthy }. Returnerer Set med placeId-er der verdien er
// truthy. Ugyldig format gir tom Set + console.warn.
function getHistoryGoVisitedPlaceIds() {
  const raw = readJsonLocalStorage(HISTORY_GO_VISITED_PLACES_KEY, null);
  const ids = new Set();

  if (raw === null || raw === undefined) {
    return ids;
  }

  if (typeof raw !== "object" || Array.isArray(raw)) {
    console.warn("History Go-sync: visited_places har ugyldig format (forventet objekt/map).");
    return ids;
  }

  Object.entries(raw).forEach(([placeId, value]) => {
    if (placeId && value) {
      ids.add(placeId);
    }
  });

  return ids;
}

// Groundhopper-/sportsteder fra History Go (`hg_groundhopper_stats_v1`). Bruker
// `visited_groundhopper_places` (array) som hovedliste. Ugyldig format gir tom
// Set + console.warn.
function getHistoryGoGroundhopperPlaceIds() {
  const raw = readJsonLocalStorage(HISTORY_GO_GROUNDHOPPER_STATS_KEY, null);
  const ids = new Set();

  if (raw === null || raw === undefined) {
    return ids;
  }

  if (typeof raw !== "object" || Array.isArray(raw)) {
    console.warn("History Go-sync: hg_groundhopper_stats_v1 har ugyldig format (forventet objekt).");
    return ids;
  }

  const visited = raw.visited_groundhopper_places;

  if (visited === undefined) {
    return ids;
  }

  if (!Array.isArray(visited)) {
    console.warn("History Go-sync: visited_groundhopper_places er ikke en array.");
    return ids;
  }

  visited.forEach((placeId) => {
    if (typeof placeId === "string" && placeId) {
      ids.add(placeId);
    }
  });

  return ids;
}

// Samlede sportsteder fra History Go som faktisk har unlock-data i Football
// Manager. Slår sammen Groundhopper-steder og generelt besøkte steder, og
// filtrerer til placeId-er som finnes i state.unlocks.placeUnlocks. Dermed bryr
// Football Manager seg bare om History Go-steder den selv har innhold for.
function getHistoryGoCollectedSportPlaceIds() {
  const collected = new Set();
  getHistoryGoGroundhopperPlaceIds().forEach((id) => collected.add(id));
  getHistoryGoVisitedPlaceIds().forEach((id) => collected.add(id));

  const knownPlaceIds = new Set(
    (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [])
      .map((place) => place && place.placeId)
      .filter(Boolean)
  );

  const result = new Set();
  collected.forEach((id) => {
    if (knownPlaceIds.has(id)) {
      result.add(id);
    }
  });

  return result;
}

// Synk ekte History Go-steder inn i team merits. Legger nye besøkte sportsteder
// til state.teamMerits.unlockedPlaceIds uten å overskrive eksisterende
// progresjon. Finnes ingen ekte History Go-steder, beholdes demo-/lagstaten
// urørt. Normaliserer alltid unlockedPlaceIds til en duplikatfri array.
function syncUnlockedPlacesFromHistoryGo() {
  if (!state.teamMerits) {
    return;
  }

  const collected = getHistoryGoCollectedSportPlaceIds();

  const existing = Array.isArray(state.teamMerits.unlockedPlaceIds)
    ? state.teamMerits.unlockedPlaceIds.filter((id) => typeof id === "string" && id)
    : [];

  // Ingen ekte History Go-steder: ikke rør eksisterende demo-/lagstate.
  if (collected.size === 0) {
    state.teamMerits.unlockedPlaceIds = Array.from(new Set(existing));
    return;
  }

  const merged = new Set(existing);
  collected.forEach((id) => merged.add(id));

  state.teamMerits.unlockedPlaceIds = Array.from(merged);
  saveTeamMerits();
}

// Unlock-typer i football_unlocks.json som regnes som stab/trener/personkandidat.
function isStaffUnlockType(type) {
  return typeof type === "string" && /staff|coach|person|candidate/i.test(type);
}

// Opplåste steder som Set – leses fra midlertidig team-state.
function getUnlockedPlaceIds() {
  const ids = state.teamMerits?.unlockedPlaceIds;
  return new Set(Array.isArray(ids) ? ids : []);
}

// placeUnlocks filtrert på opplåste steder.
function getPlaceUnlocks() {
  const unlockedPlaceIds = getUnlockedPlaceIds();
  const placeUnlocks = state.unlocks?.placeUnlocks;
  if (!Array.isArray(placeUnlocks)) {
    return [];
  }
  return placeUnlocks.filter((place) => place && unlockedPlaceIds.has(place.placeId));
}

// Stab-id-er som er eksplisitt låst opp via football_unlocks.json på et opplåst
// sted (type som inneholder staff/coach/person/candidate, f.eks. head_coach_candidate).
function getStaffIdsFromPlaceUnlocks() {
  const ids = new Set();
  getPlaceUnlocks().forEach((place) => {
    (Array.isArray(place.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (unlock && isStaffUnlockType(unlock.type) && unlock.targetId) {
        ids.add(unlock.targetId);
      }
    });
  });
  return ids;
}

// Stab som er tilgjengelig: kommer fra et opplåst sted (sourcePlaceIds) eller er
// eksplisitt låst opp gjennom football_unlocks.json.
function getUnlockedStaff() {
  const unlockedPlaceIds = getUnlockedPlaceIds();
  const explicitStaffIds = getStaffIdsFromPlaceUnlocks();
  const staff = Array.isArray(state.staff) ? state.staff : [];

  return staff.filter((member) => {
    if (!member || !member.id) {
      return false;
    }
    const sources = Array.isArray(member.sourcePlaceIds) ? member.sourcePlaceIds : [];
    const fromPlace = sources.some((placeId) => unlockedPlaceIds.has(placeId));
    return fromPlace || explicitStaffIds.has(member.id);
  });
}

// Engasjert stab: tilgjengelig stab som finnes i hiredStaffIds.
function getHiredStaff() {
  const hiredIds = new Set(
    Array.isArray(state.teamMerits?.hiredStaffIds) ? state.teamMerits.hiredStaffIds : []
  );
  return getUnlockedStaff().filter((member) => hiredIds.has(member.id));
}

// Alle staff-typer en ansatt kan dekke (staffType + canBeHiredAs).
function getStaffCoveredTypes(member) {
  const types = new Set();
  if (member?.staffType) {
    types.add(member.staffType);
  }
  (Array.isArray(member?.canBeHiredAs) ? member.canBeHiredAs : []).forEach((type) => types.add(type));
  return types;
}

// Opplåst ekspertise som Set av id-er: via opplåst sted, via teamMerits, eller
// fordi en ansatt stab har ekspertisen i expertiseIds.
function getUnlockedExpertiseIds() {
  const unlockedPlaceIds = getUnlockedPlaceIds();
  const fromMerits = new Set(
    Array.isArray(state.teamMerits?.unlockedExpertiseIds) ? state.teamMerits.unlockedExpertiseIds : []
  );

  const hiredExpertise = new Set();
  getHiredStaff().forEach((member) => {
    (Array.isArray(member.expertiseIds) ? member.expertiseIds : []).forEach((id) => hiredExpertise.add(id));
  });

  const result = new Set();
  const expertise = Array.isArray(state.expertise) ? state.expertise : [];
  expertise.forEach((item) => {
    if (!item || !item.id) {
      return;
    }
    const places = Array.isArray(item.unlockedByPlaceIds) ? item.unlockedByPlaceIds : [];
    const fromPlace = places.some((placeId) => unlockedPlaceIds.has(placeId));
    if (fromPlace || fromMerits.has(item.id) || hiredExpertise.has(item.id)) {
      result.add(item.id);
    }
  });
  return result;
}

// Opplåst ekspertise som hele objekter.
function getUnlockedExpertise() {
  const ids = getUnlockedExpertiseIds();
  const expertise = Array.isArray(state.expertise) ? state.expertise : [];
  return expertise.filter((item) => item && ids.has(item.id));
}

// Badgefamilier som er åpnet av opplåst ekspertise (via opensBadgeFamilies).
function getOpenedBadgeFamilyIds() {
  const families = new Set();
  getUnlockedExpertise().forEach((item) => {
    (Array.isArray(item.opensBadgeFamilies) ? item.opensBadgeFamilies : []).forEach((id) => families.add(id));
  });
  return families;
}

// Treningsprogrammer innen rekkevidde, med status og begrunnelse.
// Relevansport: programmet vises bare hvis minst ett krav-ekspertise er opplåst,
// eller programmets badgefamilie er åpnet av opplåst ekspertise. Status:
//   available       – ekspertise på plass OG matchende ansatt stab
//   needs_staff     – ekspertise på plass, men ingen ansatt stab matcher
//   needs_expertise – nådd via badgefamilie, men selve krav-ekspertisen mangler
function getAvailableTrainingPrograms() {
  const unlockedExpertise = getUnlockedExpertiseIds();
  const openedFamilies = getOpenedBadgeFamilyIds();
  const hiredStaff = getHiredStaff();
  const programs = Array.isArray(state.trainingPrograms) ? state.trainingPrograms : [];

  const results = [];

  programs.forEach((program) => {
    if (!program || !program.id) {
      return;
    }

    const required = Array.isArray(program.requiresExpertiseIds) ? program.requiresExpertiseIds : [];
    const matchedExpertise = required.filter((id) => unlockedExpertise.has(id));
    const hasExpertise = matchedExpertise.length > 0;
    const familyOpened = openedFamilies.has(program.badgeFamilyId);

    if (!hasExpertise && !familyOpened) {
      return;
    }

    const requiredStaffTypes = Array.isArray(program.requiredStaffTypes) ? program.requiredStaffTypes : [];
    const matchedStaff = hiredStaff.filter((member) => {
      const covered = getStaffCoveredTypes(member);
      return requiredStaffTypes.some((type) => covered.has(type));
    });
    const hasStaff = matchedStaff.length > 0;

    let status;
    const reasons = [];

    if (!hasExpertise) {
      status = "needs_expertise";
      const missing = required.filter((id) => !unlockedExpertise.has(id));
      reasons.push(`Mangler ekspertise: ${missing.join(", ") || "ukjent"}`);
    } else if (!hasStaff) {
      status = "needs_staff";
      reasons.push(`Krever stab: ${requiredStaffTypes.join(", ") || "ukjent"}`);
    } else {
      status = "available";
      reasons.push(`Ekspertise på plass: ${matchedExpertise.join(", ")}`);
      reasons.push(`Stab: ${matchedStaff.map((member) => member.name || member.id).join(", ")}`);
    }

    results.push({ program, status, reasons });
  });

  const order = { available: 0, needs_staff: 1, needs_expertise: 2 };
  results.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  return results;
}

// Oppslag fra badge-id til badgeobjekt beriket med familieinfo.
function getBadgeCatalog() {
  const families = Array.isArray(state.trainingBadges?.badgeFamilies) ? state.trainingBadges.badgeFamilies : [];
  const byBadgeId = new Map();

  families.forEach((family) => {
    (Array.isArray(family.levels) ? family.levels : []).forEach((level) => {
      if (level && level.id) {
        byBadgeId.set(level.id, {
          ...level,
          familyId: family.id,
          familyName: family.name,
          category: family.category
        });
      }
    });
  });

  return byBadgeId;
}

// Opptjente badges (fra earnedBadgeIds) som berikede badgeobjekter.
function getEarnedBadges() {
  const earnedIds = Array.isArray(state.teamMerits?.earnedBadgeIds) ? state.teamMerits.earnedBadgeIds : [];
  const catalog = getBadgeCatalog();
  return earnedIds.map((id) => catalog.get(id)).filter(Boolean);
}

// Høyeste oppnådde badge-nivå (som tall) per badgefamilie ut fra earnedBadgeIds.
function getEarnedBadgeLevelByFamily() {
  const levels = new Map();
  getEarnedBadges().forEach((badge) => {
    const rank = BADGE_LEVEL_ORDER[badge.level] || 0;
    const current = levels.get(badge.familyId) || 0;
    if (rank > current) {
      levels.set(badge.familyId, rank);
    }
  });
  return levels;
}

// Beregn hvilke lagklasser som er oppnådd ut fra earnedBadgeIds. Trygg helper
// for senere bruk; v1-render viser eksplisitt lagrede activeClassifications.
function computeActiveClassificationIds() {
  const familyLevels = getEarnedBadgeLevelByFamily();
  const classifications = Array.isArray(state.teamClassifications?.classifications)
    ? state.teamClassifications.classifications
    : [];

  return classifications
    .filter((classification) => {
      const required = Array.isArray(classification.requiresBadges) ? classification.requiresBadges : [];
      return required.length > 0 && required.every((req) => {
        const have = familyLevels.get(req.familyId) || 0;
        const need = BADGE_LEVEL_ORDER[req.minimumLevel] || 0;
        return have >= need;
      });
    })
    .map((classification) => classification.id);
}

// Aktive lagklasser beregnet direkte fra opptjente badges, slik at visningen
// alltid speiler earnedBadgeIds. state.teamMerits.activeClassifications holdes
// synk med samme beregning (recomputeActiveClassifications) for persistens.
function getActiveTeamClassifications() {
  const classifications = Array.isArray(state.teamClassifications?.classifications)
    ? state.teamClassifications.classifications
    : [];
  const activeIds = new Set(computeActiveClassificationIds());
  return classifications.filter((classification) => activeIds.has(classification.id));
}

// Engasjer tilgjengelig stab: legg staff-id i hiredStaffIds, lagre og rerender.
// Robust mot ukjent/utilgjengelig id og duplikater (console.warn, ingen krasj).
function hireStaff(staffId) {
  if (!state.teamMerits) {
    console.warn("hireStaff: team merits mangler – kan ikke engasjere stab.");
    return;
  }

  const member = getUnlockedStaff().find((candidate) => candidate.id === staffId);

  if (!member) {
    console.warn(`hireStaff: ukjent eller utilgjengelig staff-id: ${staffId}`);
    return;
  }

  if (!Array.isArray(state.teamMerits.hiredStaffIds)) {
    state.teamMerits.hiredStaffIds = [];
  }

  if (state.teamMerits.hiredStaffIds.includes(staffId)) {
    return;
  }

  state.teamMerits.hiredStaffIds.push(staffId);
  saveTeamMerits();
  renderApp();
}

// Finn neste badge-nivå i et program som ennå ikke er opptjent. Sjekker nivåer
// i rekkefølge bronse → sølv → gull, og hopper over nivåer som krever et
// foregående nivå som ikke er opptjent ennå. Returnerer level-objektet eller null.
function findNextBadgeTargetForProgram(program) {
  const levels = Array.isArray(program?.levels) ? program.levels : [];
  const earned = new Set(
    Array.isArray(state.teamMerits?.earnedBadgeIds) ? state.teamMerits.earnedBadgeIds : []
  );

  const ordered = [...levels].sort(
    (a, b) => (BADGE_LEVEL_ORDER[a?.level] || 0) - (BADGE_LEVEL_ORDER[b?.level] || 0)
  );

  for (const level of ordered) {
    if (!level || !level.targetBadgeId || earned.has(level.targetBadgeId)) {
      continue;
    }

    if (level.requiresPreviousLevel) {
      const rank = BADGE_LEVEL_ORDER[level.level] || 0;
      const previous = ordered.find((candidate) => (BADGE_LEVEL_ORDER[candidate?.level] || 0) === rank - 1);
      if (previous && previous.targetBadgeId && !earned.has(previous.targetBadgeId)) {
        continue;
      }
    }

    return level;
  }

  return null;
}

// Velg et tilgjengelig treningsprogram: sett (eller behold) en aktiv
// badge-progresjon mot programmets neste badge-nivå. Krever at programmet finnes
// i getAvailableTrainingPrograms() med status "available".
function selectTrainingProgram(programId) {
  if (!state.teamMerits) {
    console.warn("selectTrainingProgram: team merits mangler – kan ikke velge program.");
    return;
  }

  const entry = getAvailableTrainingPrograms().find(
    (item) => item.program?.id === programId && item.status === "available"
  );

  if (!entry) {
    console.warn(`selectTrainingProgram: program er ikke tilgjengelig: ${programId}`);
    return;
  }

  const program = entry.program;
  const target = findNextBadgeTargetForProgram(program);

  if (!target) {
    console.warn(`selectTrainingProgram: ingen gjenstående badge-nivå i program: ${programId}`);
    return;
  }

  if (!Array.isArray(state.teamMerits.badgeProgress)) {
    state.teamMerits.badgeProgress = [];
  }

  const requiredWeeks =
    Number.isInteger(target.weeksRequired) && target.weeksRequired >= 1 ? target.weeksRequired : 1;
  const existing = state.teamMerits.badgeProgress.find(
    (item) => item && item.targetBadgeId === target.targetBadgeId
  );

  if (existing) {
    // Samme target finnes allerede: behold opptjent progress, oppdater metadata.
    existing.badgeFamilyId = program.badgeFamilyId;
    existing.requiredWeeks = requiredWeeks;
    existing.activeProgramId = program.id;
  } else {
    state.teamMerits.badgeProgress.push({
      badgeFamilyId: program.badgeFamilyId,
      targetBadgeId: target.targetBadgeId,
      progressWeeks: 0,
      requiredWeeks,
      activeProgramId: program.id
    });
  }

  saveTeamMerits();
  renderApp();
}

// Avanser treningsuke: øk uketeller, gi hver aktiv progresjon +1 uke, tildel
// badge når requiredWeeks er nådd (uten duplikater), oppdater lagklasser fra
// earned badges, lagre og rerender.
function advanceHgTrainingWeek() {
  if (!state.teamMerits) {
    console.warn("advanceHgTrainingWeek: team merits mangler – kan ikke avansere uke.");
    return;
  }

  const merits = state.teamMerits;

  merits.activeTrainingWeek = (Number.isInteger(merits.activeTrainingWeek) ? merits.activeTrainingWeek : 0) + 1;

  if (!Array.isArray(merits.earnedBadgeIds)) {
    merits.earnedBadgeIds = [];
  }

  const remaining = [];

  (Array.isArray(merits.badgeProgress) ? merits.badgeProgress : []).forEach((progress) => {
    if (!progress || typeof progress !== "object") {
      return;
    }

    const required =
      Number.isInteger(progress.requiredWeeks) && progress.requiredWeeks >= 1 ? progress.requiredWeeks : 1;
    const nextWeeks = (Number.isInteger(progress.progressWeeks) ? progress.progressWeeks : 0) + 1;

    if (nextWeeks >= required) {
      // Badge oppnådd: legg til (uten duplikat) og fjern progresjonen.
      if (progress.targetBadgeId && !merits.earnedBadgeIds.includes(progress.targetBadgeId)) {
        merits.earnedBadgeIds.push(progress.targetBadgeId);
      }
      return;
    }

    progress.progressWeeks = nextWeeks;
    remaining.push(progress);
  });

  merits.badgeProgress = remaining;

  // Lagklasser beregnes på nytt fra earned badges etter badge-endringene.
  recomputeActiveClassifications();

  saveTeamMerits();
  renderApp();
}

// Enkel validering av unlock-/stab-/badge-data. Skriver advarsler med
// console.warn, men krasjer ikke appen om prototypedata mangler felt.
function validateUnlockData() {
  const warnings = [];
  const placeUnlocks = Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [];
  const staff = Array.isArray(state.staff) ? state.staff : [];
  const expertise = Array.isArray(state.expertise) ? state.expertise : [];
  const programs = Array.isArray(state.trainingPrograms) ? state.trainingPrograms : [];
  const families = Array.isArray(state.trainingBadges?.badgeFamilies) ? state.trainingBadges.badgeFamilies : [];

  const familyIds = new Set(families.map((family) => family && family.id).filter(Boolean));
  const badgeIds = new Set();
  families.forEach((family) => {
    (Array.isArray(family.levels) ? family.levels : []).forEach((level) => {
      if (level && level.id) {
        badgeIds.add(level.id);
      }
    });
  });
  const staffIds = new Set(staff.map((member) => member && member.id).filter(Boolean));

  placeUnlocks.forEach((place) => {
    if (typeof place?.placeId !== "string" || !place.placeId) {
      warnings.push("Et placeUnlock mangler gyldig placeId (streng).");
    }
  });

  staff.forEach((member) => {
    if (!member?.id || !member?.name || !member?.staffType) {
      warnings.push(`Stab mangler id, name eller staffType: ${member?.id || member?.name || "ukjent"}.`);
    }
    if (member && member.sourcePlaceIds !== undefined && !Array.isArray(member.sourcePlaceIds)) {
      warnings.push(`Stab ${member.id || member.name} har sourcePlaceIds som ikke er array.`);
    }
  });

  expertise.forEach((item) => {
    if (!item?.id || !item?.name || !item?.category) {
      warnings.push(`Ekspertise mangler id, name eller category: ${item?.id || item?.name || "ukjent"}.`);
    }
  });

  programs.forEach((program) => {
    if (!program?.id || !program?.badgeFamilyId || !Array.isArray(program?.requiresExpertiseIds)) {
      warnings.push(`Treningsprogram mangler id, badgeFamilyId eller requiresExpertiseIds: ${program?.id || "ukjent"}.`);
    }
    if (program?.badgeFamilyId && !familyIds.has(program.badgeFamilyId)) {
      warnings.push(`Treningsprogram ${program.id} peker på ukjent badgeFamilyId: ${program.badgeFamilyId}.`);
    }
  });

  const earnedBadgeIds = Array.isArray(state.teamMerits?.earnedBadgeIds) ? state.teamMerits.earnedBadgeIds : [];
  earnedBadgeIds.forEach((id) => {
    if (!badgeIds.has(id)) {
      warnings.push(`earnedBadgeId finnes ikke i badge-katalogen: ${id}.`);
    }
  });

  const hiredStaffIds = Array.isArray(state.teamMerits?.hiredStaffIds) ? state.teamMerits.hiredStaffIds : [];
  hiredStaffIds.forEach((id) => {
    if (!staffIds.has(id)) {
      warnings.push(`hiredStaffId finnes ikke i staff-filen: ${id}.`);
    }
  });

  const programIds = new Set(programs.map((program) => program && program.id).filter(Boolean));
  const classificationIds = new Set(
    (Array.isArray(state.teamClassifications?.classifications) ? state.teamClassifications.classifications : [])
      .map((classification) => classification && classification.id)
      .filter(Boolean)
  );

  const badgeProgress = Array.isArray(state.teamMerits?.badgeProgress) ? state.teamMerits.badgeProgress : [];
  badgeProgress.forEach((entry) => {
    if (entry?.activeProgramId && !programIds.has(entry.activeProgramId)) {
      warnings.push(`badgeProgress peker på ukjent treningsprogram: ${entry.activeProgramId}.`);
    }
    if (entry?.targetBadgeId && !badgeIds.has(entry.targetBadgeId)) {
      warnings.push(`badgeProgress peker på ukjent badge: ${entry.targetBadgeId}.`);
    }
  });

  const activeClassifications = Array.isArray(state.teamMerits?.activeClassifications)
    ? state.teamMerits.activeClassifications
    : [];
  activeClassifications.forEach((id) => {
    if (!classificationIds.has(id)) {
      warnings.push(`activeClassification finnes ikke i klassifiseringsfilen: ${id}.`);
    }
  });

  return warnings;
}

function getFormation() {
  return state.formations.find((formation) => formation.id === state.selectedFormationId) || state.formations[0];
}

function getTactic() {
  return state.tactics.find((tactic) => tactic.id === state.selectedTacticId) || state.tactics[0];
}

function getSelectedSlot() {
  const formation = getFormation();
  return formation?.slots.find((slot) => slot.slotId === state.selectedSlotId) || formation?.slots[0] || null;
}

function getTeamFit() {
  const formation = getFormation();
  const tactic = getTactic();

  if (!formation || !tactic) {
    return null;
  }

  return calculateTeamFit({
    lineup: state.lineup,
    formation,
    tactic,
    players: state.players,
    roles: state.roles
  });
}

function getUsedPlayerIds(exceptSlotId = null) {
  return new Set(
    Object.entries(state.lineup)
      .filter(([slotId]) => slotId !== exceptSlotId)
      .map(([, slotState]) => slotState.playerId)
      .filter(Boolean)
  );
}

function getDefaultRoleForPlayer(player, slot) {
  if (!player || !slot) {
    return null;
  }

  const preferredRole = player.preferredRoles
    .map((roleId) => state.roles.find((role) => role.id === roleId))
    .find((role) => role?.validPositions.includes(slot.position));

  if (preferredRole) {
    return preferredRole.id;
  }

  const validRole = state.roles.find((role) => role.validPositions.includes(slot.position));
  return validRole?.id || state.roles[0]?.id || null;
}

function findBestAvailablePlayerForSlot(slot, usedPlayerIds) {
  const tiers = [
    (candidate) => candidate.naturalPositions.includes(slot.position),
    (candidate) => candidate.usablePositions.includes(slot.position),
    (candidate) => !candidate.poorFits.includes(slot.position)
  ];

  for (const matches of tiers) {
    const player = state.players.find((candidate) => !usedPlayerIds.has(candidate.id) && matches(candidate));

    if (player) {
      return player;
    }
  }

  return null;
}

function seedLineupForFormation() {
  const formation = getFormation();

  state.lineup = {};
  state.selectedSlotId = formation?.slots[0]?.slotId || null;

  if (!formation) {
    return;
  }

  const usedPlayerIds = new Set();

  formation.slots.forEach((slot) => {
    const player = findBestAvailablePlayerForSlot(slot, usedPlayerIds);

    if (!player) {
      state.lineup[slot.slotId] = {
        playerId: null,
        roleId: null
      };
      return;
    }

    usedPlayerIds.add(player.id);
    state.lineup[slot.slotId] = {
      playerId: player.id,
      roleId: getDefaultRoleForPlayer(player, slot)
    };
  });
}

function loadStoredPositions() {
  try {
    return JSON.parse(localStorage.getItem(POSITIONS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveStoredPositions(all) {
  try {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(all));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Aktivt treningsfokus: hvilket kunnskapskort brukeren har valgt for uken.
// Kun lett persistens i localStorage, ingen effekt på score eller engine.
function loadActiveKnowledgeFocus() {
  try {
    return localStorage.getItem(ACTIVE_KNOWLEDGE_FOCUS_KEY) || null;
  } catch (error) {
    return null;
  }
}

function saveActiveKnowledgeFocus(principleId) {
  try {
    localStorage.setItem(ACTIVE_KNOWLEDGE_FOCUS_KEY, principleId);
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function clearActiveKnowledgeFocus() {
  try {
    localStorage.removeItem(ACTIVE_KNOWLEDGE_FOCUS_KEY);
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Treningsuke: enkel uke-state slik at "fullført denne uken" knyttes til en uke.
// Kun UI/progresjon i localStorage – ingen effekt på score, engine eller matching.
function loadTrainingWeek() {
  try {
    const stored = Number(JSON.parse(localStorage.getItem(TRAINING_WEEK_KEY)));
    return Number.isInteger(stored) && stored >= 1 ? stored : 1;
  } catch (error) {
    return 1;
  }
}

function saveTrainingWeek(week) {
  try {
    localStorage.setItem(TRAINING_WEEK_KEY, JSON.stringify(week));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function advanceTrainingWeek() {
  state.trainingWeek += 1;
  saveTrainingWeek(state.trainingWeek);
  // Ny uke starter uten valgt fokus; aktivt fokus nullstilles.
  state.activeKnowledgeFocusId = null;
  clearActiveKnowledgeFocus();
  // Fullført-status leses på nytt for gjeldende uke (tom for en helt ny uke).
  state.completedKnowledgeFocusIds = loadCompletedKnowledgeFocusIds();
}

// Club Week-tilstand: uke, fase og klubbverdier fra Club Week Engine.
// Kun lett persistens i localStorage – selve logikken ligger i engine/fallback.
function loadClubWeekState() {
  try {
    const stored = JSON.parse(localStorage.getItem(CLUB_WEEK_STATE_KEY));

    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      return stored;
    }

    return null;
  } catch (error) {
    return null;
  }
}

function saveClubWeekState(clubWeekState) {
  try {
    localStorage.setItem(CLUB_WEEK_STATE_KEY, JSON.stringify(clubWeekState));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function setClubWeekState(clubWeekState) {
  state.clubWeekState = clubWeekState;
  saveClubWeekState(clubWeekState);
  renderApp();
}

// Club Week-feedback: kort tekst om siste fasebytte. Kun lett persistens i
// localStorage – ingen effekt på score, engine eller matching.
function loadClubWeekFeedback() {
  try {
    return localStorage.getItem(CLUB_WEEK_FEEDBACK_KEY) || "Klubbuken er klar.";
  } catch (error) {
    return "Klubbuken er klar.";
  }
}

function saveClubWeekFeedback(message) {
  try {
    localStorage.setItem(CLUB_WEEK_FEEDBACK_KEY, message);
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function setClubWeekFeedback(message) {
  state.clubWeekFeedback = message;
  saveClubWeekFeedback(message);
}

// Club Week-hendelseslogg: korte hendelser fra fasebytter. Nyeste først, maks 12.
// Kun lett persistens i localStorage – ingen effekt på score, engine eller matching.
function loadClubWeekEventLog() {
  try {
    const stored = JSON.parse(localStorage.getItem(CLUB_WEEK_EVENT_LOG_KEY));
    return Array.isArray(stored) ? stored.slice(0, CLUB_WEEK_EVENT_LOG_LIMIT) : [];
  } catch (error) {
    return [];
  }
}

function saveClubWeekEventLog(events) {
  try {
    const list = Array.isArray(events) ? events.slice(0, CLUB_WEEK_EVENT_LOG_LIMIT) : [];
    localStorage.setItem(CLUB_WEEK_EVENT_LOG_KEY, JSON.stringify(list));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function addClubWeekEvent(event) {
  // Nyeste hendelse først, behold maks 12.
  state.clubWeekEventLog = [event, ...state.clubWeekEventLog].slice(0, CLUB_WEEK_EVENT_LOG_LIMIT);
  saveClubWeekEventLog(state.clubWeekEventLog);
}

// Lokal fase-etikettmap som fallback for konsekvenstekster. Holdes synk med
// Club Week Engine-fasene; brukes kun til visningstekst.
const CLUB_WEEK_PHASE_LABELS = {
  analysis: "Analyse",
  training: "Trening",
  club_work: "Klubbdrift",
  match_preparation: "Kampforberedelse",
  match_day: "Kampdag"
};

// Små, synlige konsekvenser av et fasebytte. Returnerer effekter på
// klubbverdier og en kort norsk tilbakemelding. Kun UI/Club Week-state –
// ingen lagscore, kampmotor, rollefit eller Football Knowledge-matching.
function getClubWeekTransitionConsequences(previousState, nextState) {
  if (previousState.phase === "training") {
    if (state.activeKnowledgeFocusId && isKnowledgeFocusCompleted(state.activeKnowledgeFocusId)) {
      return {
        effects: { trainingCulture: 2, tacticalClarity: 1 },
        message:
          "Treningsfasen er fullført. Kunnskapsøkten ga +2 treningskultur og +1 taktisk klarhet."
      };
    }

    if (state.activeKnowledgeFocusId) {
      return {
        effects: { trainingCulture: -1 },
        message:
          "Treningsfasen er over. Valgt kunnskapsøkt ble ikke fullført, og treningskulturen faller med 1."
      };
    }

    return {
      effects: { tacticalClarity: -1 },
      message:
        "Treningsfasen er over uten valgt kunnskapsfokus. Taktisk klarhet faller med 1."
    };
  }

  if (previousState.phase === "match_preparation") {
    return {
      effects: { mediaPressure: 1 },
      message: "Kampdag nærmer seg. Medietrykket øker med 1."
    };
  }

  if (previousState.phase === "match_day" && nextState.phase === "analysis") {
    return {
      effects: { mediaPressure: -1 },
      message: `Kampdagen er over. Klubben går inn i uke ${nextState.week} med ny analysefase.`
    };
  }

  const label = CLUB_WEEK_PHASE_LABELS[nextState.phase] || "neste fase";

  return {
    effects: {},
    message: `Klubben går videre til ${label}.`
  };
}

// Fullført ukesøkt: hvilke kunnskapsfokus brukeren har markert som gjennomført.
// Rent UI/progresjonslag i localStorage – ingen effekt på score, engine eller matching.
// Lagres som objekt per uke ({ "1": [...], "2": [...] }), holdes i minnet som Set
// for raske oppslag på gjeldende uke. Robust migrering: gammel flat array tolkes
// som uke 1.
function readCompletedKnowledgeFocusStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPLETED_KNOWLEDGE_FOCUS_KEY));

    if (Array.isArray(stored)) {
      // Gammel lagringsmodell: flat array behandles som uke 1.
      return { "1": stored };
    }

    if (stored && typeof stored === "object") {
      return stored;
    }

    return {};
  } catch (error) {
    return {};
  }
}

function loadCompletedKnowledgeFocusIds() {
  const store = readCompletedKnowledgeFocusStore();
  const weekIds = store[String(state.trainingWeek)];
  return new Set(Array.isArray(weekIds) ? weekIds : []);
}

function saveCompletedKnowledgeFocusIds(ids) {
  try {
    const store = readCompletedKnowledgeFocusStore();
    store[String(state.trainingWeek)] = Array.from(ids);
    localStorage.setItem(COMPLETED_KNOWLEDGE_FOCUS_KEY, JSON.stringify(store));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function markKnowledgeFocusCompleted(principleId) {
  if (!principleId) {
    return;
  }

  state.completedKnowledgeFocusIds.add(principleId);
  saveCompletedKnowledgeFocusIds(state.completedKnowledgeFocusIds);
}

function isKnowledgeFocusCompleted(principleId) {
  return Boolean(principleId) && state.completedKnowledgeFocusIds.has(principleId);
}

// Logiske standardposisjoner: grupper slots per lagdel og spre dem jevnt i bredden.
function computeDefaultPositions(formation) {
  const positions = {};
  const byLine = {};

  formation.slots.forEach((slot) => {
    (byLine[slot.line] ||= []).push(slot);
  });

  Object.entries(byLine).forEach(([line, slots]) => {
    const y = LINE_Y[line] ?? 50;
    const count = slots.length;

    slots.forEach((slot, index) => {
      const x = count === 1 ? 50 : 14 + (72 * index) / (count - 1);
      positions[slot.slotId] = { x, y };
    });
  });

  return positions;
}

// Sørg for at gjeldende formasjon har posisjoner (lagret eller standard) for alle slots.
function ensurePositionsForFormation() {
  const formation = getFormation();

  if (!formation) {
    state.slotPositions = {};
    return;
  }

  const all = loadStoredPositions();
  const defaults = computeDefaultPositions(formation);
  const stored = all[formation.id] || {};
  const merged = {};

  formation.slots.forEach((slot) => {
    merged[slot.slotId] = stored[slot.slotId] || defaults[slot.slotId];
  });

  all[formation.id] = merged;
  saveStoredPositions(all);
  state.slotPositions = merged;
}

function persistCurrentPositions() {
  const formation = getFormation();

  if (!formation) {
    return;
  }

  const all = loadStoredPositions();
  all[formation.id] = state.slotPositions;
  saveStoredPositions(all);
}

function renderList(list, items) {
  list.innerHTML = "";

  if (items.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Ingen tydelige punkter ennå.";
    list.append(item);
    return;
  }

  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  });
}

// Trygg liste-render: hopper over hvis elementet mangler, og viser emptyText når listen er tom.
function renderTextList(list, items, getText, emptyText) {
  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const item = document.createElement("li");
    item.textContent = emptyText || "Ingen tydelige punkter ennå.";
    list.append(item);
    return;
  }

  items.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = getText(entry);
    list.append(item);
  });
}

// Trygg liste-render for managerTrainingPlan: ligner renderTextList, men gir
// det aktivt valgte kunnskapsfokuset egen visuell markering via item.type.
// Bruker kun textContent, ingen innerHTML.
function renderTrainingFocusList(list, items, emptyText) {
  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = emptyText || "Ingen tydelige punkter ennå.";
    list.append(empty);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");

    if (item.type === "knowledge_focus") {
      const completed = isKnowledgeFocusCompleted(item.principleId);

      li.className = "training-focus-item is-knowledge-focus";

      if (completed) {
        li.classList.add("is-completed");
      }

      // Tekst og knapp i egne noder, slik at vi kun bruker textContent.
      const text = document.createElement("p");
      text.className = "training-focus-text";
      text.textContent = item.text;
      li.append(text);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "training-focus-complete-button";
      button.textContent = completed ? "Fullført" : "Fullfør ukesøkt";
      button.disabled = completed;
      button.addEventListener("click", () => {
        markKnowledgeFocusCompleted(item.principleId);
        renderApp();
      });
      li.append(button);
    } else {
      li.className = "training-focus-item";
      li.textContent = item.text;
    }

    list.append(li);
  });
}

// Render kunnskapsanbefalinger som ryddige kort i stedet for én lang tekstlinje.
// Bruker kun textContent, ingen innerHTML.
function renderKnowledgeCards(list, items, emptyText) {
  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = emptyText || "Ingen kunnskapsanbefalinger ennå.";
    list.append(empty);
    return;
  }

  items.forEach((item) => {
    const isActiveFocus = item.principleId === state.activeKnowledgeFocusId;
    const isCompletedFocus = isKnowledgeFocusCompleted(item.principleId);

    const card = document.createElement("li");
    card.className = "knowledge-card";

    if (isActiveFocus) {
      card.classList.add("is-active-focus");
    }

    if (isCompletedFocus) {
      card.classList.add("is-completed-focus");
    }

    const header = document.createElement("div");
    header.className = "knowledge-card-header";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const meta = document.createElement("span");
    meta.textContent = `${item.priorityText} · ${item.categoryText}`;

    header.append(title, meta);

    const reason = document.createElement("p");
    reason.className = "knowledge-reason";
    reason.textContent = `Hvorfor: ${item.reason}`;

    const advice = document.createElement("p");
    advice.className = "knowledge-advice";
    advice.textContent = `Trenergrep: ${item.coachAdvice}`;

    const session = document.createElement("p");
    session.className = "knowledge-session";
    session.textContent = `Økt: ${item.trainingSession}`;

    card.append(header, reason, advice, session);

    if (isActiveFocus) {
      const status = document.createElement("p");
      status.className = "knowledge-focus-status";
      status.textContent = "Aktivt treningsfokus";
      card.append(status);
    }

    if (isCompletedFocus) {
      const completedStatus = document.createElement("p");
      completedStatus.className = "knowledge-completed-status";
      completedStatus.textContent = "Fullført";
      card.append(completedStatus);
    }

    const action = document.createElement("button");
    action.type = "button";
    action.className = "knowledge-card-action";
    action.textContent = isActiveFocus ? "Aktivt fokus" : "Sett som ukens fokus";
    action.addEventListener("click", () => {
      state.activeKnowledgeFocusId = item.principleId;
      saveActiveKnowledgeFocus(item.principleId);
      renderApp();
    });
    card.append(action);

    list.append(card);
  });
}

// Leser hele fullført-lageret (objekt per uke). Tynn wrapper rundt den
// migrerende leseren, slik at historikk-renderen kan vise alle uker, ikke
// bare gjeldende uke. Kun UI/progresjon, ingen engine- eller score-effekt.
function getCompletedKnowledgeFocusStore() {
  return readCompletedKnowledgeFocusStore();
}

// Progresjonstall: hvor mange økter er fullført denne uken. Leser fra Set-et
// for gjeldende uke. Kun UI/progresjon, ingen engine- eller score-effekt.
function countCompletedThisWeek() {
  return state.completedKnowledgeFocusIds.size;
}

// Progresjonstall: hvor mange økter er fullført totalt på tvers av alle uker.
// Robust mot ugyldige verdier: bare arrays teller, andre verdier ignoreres.
// Kun UI/progresjon, ingen engine- eller score-effekt.
function countCompletedTotal() {
  const store = getCompletedKnowledgeFocusStore();
  return Object.values(store).reduce((total, ids) => {
    return total + (Array.isArray(ids) ? ids.length : 0);
  }, 0);
}

// Finn lesbar tittel for en fullført principleId i gjeldende viewModel.
// Faller trygt tilbake til selve ID-en hvis prinsippet ikke finnes lenger.
function findKnowledgePrincipleTitle(principleId, viewModel) {
  const match = viewModel.knowledgeRecommendations.find((item) => item.principleId === principleId);
  return match?.title || principleId;
}

// Enkel treningshistorikk: lister fullførte kunnskapsøkter gruppert per uke,
// nyeste uke først. Rent UI/progresjon fra localStorage – ingen engine- eller
// score-effekt. Bruker kun textContent, ingen innerHTML.
function renderTrainingHistory(list, viewModel) {
  if (!list) {
    return;
  }

  const store = getCompletedKnowledgeFocusStore();
  const weeks = Object.keys(store)
    .map((week) => Number(week))
    .filter((week) => Number.isInteger(week) && week >= 1)
    .sort((a, b) => b - a);

  list.innerHTML = "";

  const hasHistory = weeks.some((week) => {
    const ids = store[String(week)];
    return Array.isArray(ids) && ids.length > 0;
  });

  if (!hasHistory) {
    const empty = document.createElement("li");
    empty.textContent = "Ingen fullførte kunnskapsøkter ennå.";
    list.append(empty);
    return;
  }

  weeks.forEach((week) => {
    const ids = store[String(week)];

    if (!Array.isArray(ids) || ids.length === 0) {
      return;
    }

    const titles = ids.map((id) => findKnowledgePrincipleTitle(id, viewModel));

    const item = document.createElement("li");
    item.className = "training-history-week";
    item.textContent = `Uke ${week}: ${titles.join(", ")}`;
    list.append(item);
  });
}

function getTeamStatus(teamFit) {
  if (!teamFit || teamFit.completeCount < teamFit.totalSlots) {
    return "Ufullstendig";
  }

  if (teamFit.duplicatePlayers?.length > 0) {
    return "Ugyldig ellever";
  }

  if (teamFit.teamScore >= 84) {
    return "Sterk helhet";
  }

  if (teamFit.teamScore >= 72) {
    return "God helhet";
  }

  if (teamFit.teamScore >= 60) {
    return "Ujevn helhet";
  }

  return "Taktisk krasj";
}

function renderControls() {
  setOptions(
    elements.formationSelect,
    state.formations,
    (formation) => formation.id,
    (formation) => formation.name
  );

  setOptions(
    elements.tacticSelect,
    state.tactics,
    (tactic) => tactic.id,
    (tactic) => tactic.name
  );

  elements.formationSelect.value = state.selectedFormationId;
  elements.tacticSelect.value = state.selectedTacticId;
}

function renderLineup(teamFit) {
  const formation = getFormation();

  elements.lineupSlots.innerHTML = "";
  elements.formationTitle.textContent = formation?.name || "Formasjon";

  if (!formation || !teamFit) {
    return;
  }

  formation.slots.forEach((slot) => {
    const assignment = teamFit.assignments.find((item) => item.slot.slotId === slot.slotId);
    const position = state.slotPositions[slot.slotId] || { x: 50, y: 50 };

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "player-chip";
    chip.dataset.slotId = slot.slotId;
    chip.dataset.line = slot.line;
    chip.style.left = `${position.x}%`;
    chip.style.top = `${position.y}%`;

    if (slot.slotId === state.selectedSlotId) {
      chip.classList.add("is-selected");
    }

    if (assignment?.fit?.status === "feilbrukt") {
      chip.classList.add("is-misused");
    }

    if (teamFit.duplicatePlayers.some((player) => player.id === assignment?.player?.id)) {
      chip.classList.add("is-duplicate");
    }

    const playerName = assignment?.player?.name || "Tom plass";
    const roleName = assignment?.role?.name || "Ingen rolle";
    const score = assignment?.fit?.matchScore ?? "–";

    chip.innerHTML = `
      <span class="chip-pos">${slot.position}</span>
      <span class="chip-name">${playerName}</span>
      <span class="chip-role">${roleName}</span>
      <span class="chip-score">${score}</span>
    `;

    chip.setAttribute("aria-label", `${slot.label}: ${playerName}. Dra for å flytte, klikk for å velge.`);

    attachChipDrag(chip, slot.slotId);

    elements.lineupSlots.append(chip);
  });
}

// Drag-and-drop med pointer events: fungerer med mus og touch (også iPad).
// Liten bevegelse tolkes som klikk (velg plass), større bevegelse som flytting.
function attachChipDrag(chip, slotId) {
  const DRAG_THRESHOLD = 5;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let pitchRect = null;
  let pendingPosition = null;

  function clamp(value) {
    return Math.min(96, Math.max(4, value));
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    pitchRect = elements.lineupSlots.getBoundingClientRect();
    pendingPosition = null;

    chip.classList.add("is-dragging");

    try {
      chip.setPointerCapture(event.pointerId);
    } catch (error) {
      // Ignorer hvis pointer capture ikke støttes.
    }
  }

  function onPointerMove(event) {
    if (!dragging || !pitchRect) {
      return;
    }

    if (!moved && (Math.abs(event.clientX - startX) > DRAG_THRESHOLD || Math.abs(event.clientY - startY) > DRAG_THRESHOLD)) {
      moved = true;
    }

    if (!moved) {
      return;
    }

    event.preventDefault();

    const x = clamp(((event.clientX - pitchRect.left) / pitchRect.width) * 100);
    const y = clamp(((event.clientY - pitchRect.top) / pitchRect.height) * 100);

    pendingPosition = { x, y };
    chip.style.left = `${x}%`;
    chip.style.top = `${y}%`;
  }

  function onPointerUp(event) {
    if (!dragging) {
      return;
    }

    dragging = false;
    chip.classList.remove("is-dragging");

    try {
      chip.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignorer.
    }

    if (moved && pendingPosition) {
      state.slotPositions[slotId] = pendingPosition;
      persistCurrentPositions();
      // Behold valgt plass i sync slik at editoren peker på spilleren som ble flyttet.
      state.selectedSlotId = slotId;
      renderApp();
      return;
    }

    // Ren klikk: velg plassen.
    state.selectedSlotId = slotId;
    renderApp();
  }

  chip.addEventListener("pointerdown", onPointerDown);
  chip.addEventListener("pointermove", onPointerMove);
  chip.addEventListener("pointerup", onPointerUp);
  chip.addEventListener("pointercancel", onPointerUp);
}

function renderSlotEditor(teamFit) {
  const slot = getSelectedSlot();

  if (!slot) {
    return;
  }

  const slotState = state.lineup[slot.slotId] || { playerId: null, roleId: null };
  const assignment = teamFit?.assignments.find((item) => item.slot.slotId === slot.slotId);
  const usedPlayerIds = getUsedPlayerIds(slot.slotId);

  elements.selectedSlotTitle.textContent = `${slot.label} · ${slot.position}`;

  setOptions(
    elements.slotPlayerSelect,
    state.players,
    (player) => player.id,
    (player) => `${player.name} · ${player.overall}`,
    "Tom plass",
    (player) => usedPlayerIds.has(player.id)
  );

  const roleOptions = state.roles.filter((role) => role.validPositions.includes(slot.position));

  setOptions(
    elements.slotRoleSelect,
    roleOptions,
    (role) => role.id,
    (role) => role.name,
    "Ingen rolle"
  );

  elements.slotPlayerSelect.value = slotState.playerId || EMPTY_VALUE;
  elements.slotRoleSelect.value = slotState.roleId || EMPTY_VALUE;

  if (assignment?.fit) {
    elements.selectedMatchScore.textContent = assignment.fit.matchScore;
    elements.selectedFitStatus.textContent = assignment.fit.status;
    elements.selectedFitExplanation.textContent = assignment.fit.explanation;
  } else {
    elements.selectedMatchScore.textContent = "–";
    elements.selectedFitStatus.textContent = "Ufullstendig plass";
    elements.selectedFitExplanation.textContent = "Velg både spiller og rolle for å se om denne plassen fungerer.";
  }
}

function renderTeamSummary(teamFit) {
  if (!teamFit) {
    return;
  }

  elements.teamStatus.textContent = getTeamStatus(teamFit);
  elements.teamScore.textContent = teamFit.teamScore;
  elements.completeCount.textContent = `${teamFit.completeCount}/${teamFit.totalSlots}`;
  elements.roleFitAverage.textContent = teamFit.metrics.roleFitAverage;
  elements.tacticFitAverage.textContent = teamFit.metrics.tacticFitAverage;
  elements.balanceScore.textContent = teamFit.metrics.balanceScore;
  elements.restDefenseScore.textContent = teamFit.metrics.restDefenseScore;
  elements.widthScore.textContent = teamFit.metrics.widthScore;
  elements.depthScore.textContent = teamFit.metrics.depthScore;
  elements.buildUpScore.textContent = teamFit.metrics.buildUpScore;
  elements.pressScore.textContent = teamFit.metrics.pressScore;
}

function renderReport(teamFit) {
  if (!teamFit) {
    return;
  }

  elements.reportSummary.textContent = teamFit.report.summary;
  renderList(elements.strengthsList, teamFit.report.strengths);
  renderList(elements.issuesList, teamFit.report.issues);
}

// Finn aktiv kunnskapsanbefaling i gjeldende viewModel, eller null hvis ingen er valgt
// eller det valgte kortet ikke finnes lenger. Kun UI/state, ingen engine-effekt.
function getActiveKnowledgeRecommendation(viewModel) {
  if (!viewModel || !state.activeKnowledgeFocusId) return null;
  return viewModel.knowledgeRecommendations.find(
    (item) => item.principleId === state.activeKnowledgeFocusId
  ) || null;
}

function renderManagerDashboardViewModel(viewModel) {
  if (!viewModel) {
    return;
  }

  if (elements.trainingWeekStatus) {
    elements.trainingWeekStatus.textContent = `Treningsuke ${state.trainingWeek}`;
  }

  if (elements.knowledgeCompletedThisWeek) {
    elements.knowledgeCompletedThisWeek.textContent = String(countCompletedThisWeek());
  }

  if (elements.knowledgeCompletedTotal) {
    elements.knowledgeCompletedTotal.textContent = String(countCompletedTotal());
  }

  elements.teamStatus.textContent = viewModel.score.label;
  elements.teamScore.textContent = viewModel.score.setupScoreText;
  elements.balanceScore.textContent = viewModel.score.teamBalanceText;

  const widthMetric = viewModel.metrics.find((metric) => metric.label === "Bredde");
  const pressMetric = viewModel.metrics.find((metric) => metric.label === "Press");
  const defenceMetric = viewModel.metrics.find((metric) => metric.label === "Forsvar");
  const midfieldMetric = viewModel.metrics.find((metric) => metric.label === "Midtbane");
  const attackMetric = viewModel.metrics.find((metric) => metric.label === "Angrep");

  elements.widthScore.textContent = widthMetric?.valueText ?? elements.widthScore.textContent;
  elements.pressScore.textContent = pressMetric?.valueText ?? elements.pressScore.textContent;
  elements.restDefenseScore.textContent = defenceMetric?.valueText ?? elements.restDefenseScore.textContent;
  elements.buildUpScore.textContent = midfieldMetric?.valueText ?? elements.buildUpScore.textContent;
  elements.depthScore.textContent = attackMetric?.valueText ?? elements.depthScore.textContent;

  elements.reportSummary.textContent = viewModel.summary.summary;

  renderList(elements.strengthsList, viewModel.keyStrengths);

  const issueTexts = [
    ...viewModel.keyProblems,
    ...viewModel.topActions.slice(0, 3).map((action) => action.label),
  ];

  renderList(elements.issuesList, issueTexts);

  if (elements.managerSummary) {
    elements.managerSummary.textContent = viewModel.summary.summary;
  }

  renderTextList(
    elements.managerTopActions,
    viewModel.topActions,
    (action) => `${action.priorityText}: ${action.label} — ${action.rationale}`,
    viewModel.emptyStates.topActions,
  );

  const activeKnowledge = getActiveKnowledgeRecommendation(viewModel);

  const trainingItems = [
    ...(activeKnowledge ? [{
      type: "knowledge_focus",
      principleId: activeKnowledge.principleId,
      text: `Valgt ukesøkt: ${activeKnowledge.title} — ${activeKnowledge.trainingSession}`
    }] : []),
    ...viewModel.trainingPlan.map((item) => ({
      type: "engine_training",
      text: `${item.areaText}: ${item.suggestedSession}`
    }))
  ];

  renderTrainingFocusList(
    elements.managerTrainingPlan,
    trainingItems,
    viewModel.emptyStates.trainingPlan,
  );

  renderTextList(
    elements.managerRoleChanges,
    viewModel.roleChanges,
    (item) => `${item.statusText}: ${item.label}`,
    viewModel.emptyStates.roleChanges,
  );

  renderTextList(
    elements.managerWeakPoints,
    viewModel.weakPoints,
    (item) => `${item.categoryText}: ${item.label} — ${item.suggestedAction}`,
    viewModel.emptyStates.weakPoints,
  );

  renderKnowledgeCards(
    elements.managerKnowledgeRecommendations,
    viewModel.knowledgeRecommendations,
    viewModel.emptyStates.knowledgeRecommendations,
  );

  renderTrainingHistory(elements.trainingHistoryList, viewModel);

  if (elements.activeKnowledgeFocus) {
    const active = activeKnowledge;

    if (active) {
      if (isKnowledgeFocusCompleted(active.principleId)) {
        elements.activeKnowledgeFocus.textContent =
          `Aktivt fokus: ${active.title} — fullført denne uken`;
      } else {
        elements.activeKnowledgeFocus.textContent =
          `Aktivt fokus: ${active.title} — ${active.trainingSession}`;
      }
    } else {
      elements.activeKnowledgeFocus.textContent = "Ingen aktiv kunnskapsøkt valgt.";
    }

    if (elements.clearKnowledgeFocus) {
      elements.clearKnowledgeFocus.hidden = !active;
    }
  }
}

async function renderManagerEngineBridge() {
  const renderId = ++managerEngineRenderId;

  const legacyManagerState = await createLegacyManagerAppStateFromBrowserState({
    teamId: "browser_legacy_team",
    teamName: "Browser Legacy Team",
    players: state.players,
    roles: state.roles,
    tactics: state.tactics,
    formations: state.formations,
    selectedTacticId: state.selectedTacticId,
    selectedFormationId: state.selectedFormationId,
    lineup: state.lineup,
    knowledgePrinciples: state.knowledgePrinciples,
  });

  if (renderId !== managerEngineRenderId) {
    return;
  }

  const viewModel = getDashboardViewModelFromLegacyManagerState(legacyManagerState);

  renderManagerDashboardViewModel(viewModel);
}

// Render Club Week-hendelseslogg: korte hendelser fra fasebytter, nyeste først.
// Bruker kun textContent, ingen innerHTML. Trygg fallback hvis felt mangler.
function renderClubWeekEventLog(list) {
  if (!list) return;

  list.innerHTML = "";

  if (!state.clubWeekEventLog.length) {
    const empty = document.createElement("li");
    empty.className = "club-week-event-log-empty";
    empty.textContent = "Ingen klubbhendelser ennå.";
    list.append(empty);
    return;
  }

  for (const event of state.clubWeekEventLog) {
    const week = (event && (typeof event.week === "number" || typeof event.week === "string"))
      ? event.week
      : "?";
    const phaseLabel = (event && event.phaseLabel) || (event && event.phase) || "Fase";
    const message = (event && event.message) || "Hendelse registrert.";

    const item = document.createElement("li");
    item.className = "club-week-event-log-item";
    item.textContent = `Uke ${week} · ${phaseLabel}: ${message}`;
    list.append(item);
  }
}

// Render Club Week-panelet: uke, fase og klubbverdier. Async fordi summary/label
// hentes via bridge (engine eller fallback). Påvirker ikke resten av renderApp.
async function renderClubWeek() {
  if (!state.clubWeekState) {
    return;
  }

  const clubWeekState = state.clubWeekState;

  const [summary, phaseLabel] = await Promise.all([
    createClubWeekSummaryFromBrowser(clubWeekState),
    getClubWeekPhaseLabelFromBrowser(clubWeekState.phase),
  ]);

  if (elements.clubWeekSummary) {
    elements.clubWeekSummary.textContent = summary;
  }

  if (elements.clubWeekPhase) {
    elements.clubWeekPhase.textContent = phaseLabel;
  }

  if (elements.clubWeekFeedback) {
    elements.clubWeekFeedback.textContent = state.clubWeekFeedback || "Klubbuken er klar.";
  }

  if (elements.clubBoardTrust) {
    elements.clubBoardTrust.textContent = String(clubWeekState.boardTrust);
  }

  if (elements.clubPlayerMorale) {
    elements.clubPlayerMorale.textContent = String(clubWeekState.playerMorale);
  }

  if (elements.clubTacticalClarity) {
    elements.clubTacticalClarity.textContent = String(clubWeekState.tacticalClarity);
  }

  if (elements.clubTrainingCulture) {
    elements.clubTrainingCulture.textContent = String(clubWeekState.trainingCulture);
  }

  if (elements.clubMediaPressure) {
    elements.clubMediaPressure.textContent = String(clubWeekState.mediaPressure);
  }

  renderClubWeekEventLog(elements.clubWeekEventLog);
}

// Fallback-innboksmeldinger brukes hvis datafilen ikke laster. Holder
// Innboksen levende selv uten data/club_inbox_messages.json.
function getFallbackInboxMessages() {
  return [
    {
      id: "welcome_from_board",
      from: "Styret",
      tag: "Sesongmål",
      title: "Velkommen til klubben",
      body: "Styret forventer en stabil sesong. Bygg en ellever som henger sammen taktisk, og vis at klassespillere kan brukes riktig.",
      phases: ["analysis", "training", "club_work", "match_preparation", "match_day"],
      conditions: {}
    },
    {
      id: "assistant_training_focus",
      from: "Trenerteam",
      tag: "Trening",
      title: "Ukens treningsvalg",
      body: "Når laget har en tydelig svakhet, bør treningsuka brukes til ett konkret prinsipp. Velg en kunnskapsøkt og fullfør den før klubben går videre.",
      phases: ["training"],
      conditions: {}
    }
  ];
}

// Fallback-avsendere brukes hvis avsenderfilen ikke laster. Holder et minimum
// av stabile klubbstemmer tilgjengelig selv uten data/club_inbox_senders.json.
function getFallbackInboxSenders() {
  return [
    {
      id: "board",
      name: "Styret",
      group: "club_leadership",
      description: "Klubbens øverste ledelse.",
      defaultTag: "Styret"
    },
    {
      id: "coaching_team",
      name: "Trenerteam",
      group: "sporting_staff",
      description: "Gir sportslige vurderinger.",
      defaultTag: "Trening"
    },
    {
      id: "press_officer",
      name: "Presseansvarlig",
      group: "media",
      description: "Håndterer kommunikasjon og medietrykk.",
      defaultTag: "Presse"
    },
    {
      id: "administration",
      name: "Administrasjonen",
      group: "club_operations",
      description: "Holder klubben i gang.",
      defaultTag: "Administrasjon"
    },
    {
      id: "groundhopper",
      name: "Groundhopper",
      group: "history_go",
      description: "Kobler managerdelen til History Go.",
      defaultTag: "Groundhopper"
    }
  ];
}

// Les et sett med meldings-id-er fra localStorage. Robust mot manglende eller
// korrupt storage: ugyldig innhold gir et tomt Set. Filtrerer bort tomme/ikke-
// string-verdier. Kun UI/progresjon – ingen effekt på score, engine eller matching.
function loadInboxMessageIdSet(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key));

    if (!Array.isArray(stored)) {
      return new Set();
    }

    return new Set(stored.filter((id) => typeof id === "string" && id.length > 0));
  } catch (error) {
    return new Set();
  }
}

// Lagre et sett med meldings-id-er til localStorage som JSON-array. Stille no-op
// hvis lagring feiler (privat modus e.l.) – Innboks fungerer da videre i minnet.
function saveInboxMessageIdSet(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function loadReadInboxMessageIds() {
  return loadInboxMessageIdSet(READ_INBOX_MESSAGE_IDS_KEY);
}

function saveReadInboxMessageIds() {
  saveInboxMessageIdSet(READ_INBOX_MESSAGE_IDS_KEY, state.readInboxMessageIds);
}

function loadDeliveredInboxMessageIds() {
  return loadInboxMessageIdSet(DELIVERED_INBOX_MESSAGE_IDS_KEY);
}

function saveDeliveredInboxMessageIds() {
  saveInboxMessageIdSet(DELIVERED_INBOX_MESSAGE_IDS_KEY, state.deliveredInboxMessageIds);
}

// Fallback-tråder brukes hvis tråddatafilen ikke laster. Holder et minimum av
// trådstruktur tilgjengelig selv uten data/club_inbox_threads.json.
function getFallbackInboxThreads() {
  return [
    {
      id: "board_direction_and_trust",
      senderId: "board",
      subject: "Retning og styretillit",
      category: "club_leadership",
      description: "Styrets vurdering av klubbens retning og tillit."
    },
    {
      id: "coaching_training_focus",
      senderId: "coaching_team",
      subject: "Treningsfokus",
      category: "sporting_staff",
      description: "Trenerteamets meldinger om trening og taktisk klarhet."
    }
  ];
}

// Slå opp en tråd i trådkatalogen via threadId. Returnerer null hvis threadId
// mangler eller ikke finnes – da bygges tråden ad hoc fra meldingens egne felt.
function getInboxThread(threadId) {
  if (!threadId) {
    return null;
  }
  return state.clubInboxThreads.find((thread) => thread.id === threadId) || null;
}

// Finn threadId for en melding. Bruker message.threadId hvis det finnes, ellers
// faller vi tilbake til message.id slik at meldingen blir sin egen tråd.
function getMessageThreadId(message) {
  if (message && typeof message.threadId === "string" && message.threadId.length > 0) {
    return message.threadId;
  }
  return message?.id || null;
}

// Finn avsenderen for en tråd: først trådens egen senderId, så meldingens
// senderId. Returnerer avsenderobjektet (eller null) via getInboxSender.
function getThreadSender(thread, message) {
  const senderId = thread?.senderId || message?.senderId || null;
  return getInboxSender(senderId);
}

// Slå opp en avsender i avsenderkatalogen via senderId. Returnerer null hvis
// senderId mangler eller ikke finnes – da brukes meldingens egen from/tag.
function getInboxSender(senderId) {
  if (!senderId) {
    return null;
  }
  return state.clubInboxSenders.find((sender) => sender.id === senderId) || null;
}

// Gyldige klubbverdi-nøkler for betinget innboksfiltrering. Holdes synk med
// Club Week-state. Brukes kun til lesefiltrering – ingen state-effekt.
const CLUB_WEEK_METRIC_KEYS = new Set([
  "boardTrust",
  "playerMorale",
  "tacticalClarity",
  "trainingCulture",
  "mediaPressure"
]);

// Avgjør om en innboksmelding skal vises i gjeldende Club Week-fase og
// med gjeldende klubbverdier. Rent lesefilter – endrer ikke state.
function messageMatchesClubWeek(message) {
  if (!message || typeof message !== "object") {
    return false;
  }

  const phase = state.clubWeekState?.phase || "analysis";

  if (Array.isArray(message.phases) && message.phases.length > 0 && !message.phases.includes(phase)) {
    return false;
  }

  const conditions = message.conditions;

  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }

  const { metric, operator, value } = conditions;

  if (!CLUB_WEEK_METRIC_KEYS.has(metric)) {
    return false;
  }

  if (operator !== "lte" && operator !== "gte") {
    return false;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return false;
  }

  const currentValue = state.clubWeekState?.[metric];

  if (typeof currentValue !== "number" || !Number.isFinite(currentValue)) {
    return false;
  }

  if (operator === "lte") {
    return currentValue <= value;
  }

  return currentValue >= value;
}

// Meldinger som matcher gjeldende Club Week-fase/conditions akkurat nå.
function getActiveInboxMessages() {
  return state.clubInboxMessages.filter(messageMatchesClubWeek);
}

// Marker alle aktive meldinger som levert. En melding som har matchet fase/
// conditions huskes da i historikken selv etter at conditions slutter å matche.
function syncDeliveredInboxMessages(activeMessages) {
  let changed = false;

  for (const message of activeMessages) {
    if (message?.id && !state.deliveredInboxMessageIds.has(message.id)) {
      state.deliveredInboxMessageIds.add(message.id);
      changed = true;
    }
  }

  if (changed) {
    saveDeliveredInboxMessageIds();
  }
}

// Grupper meldinger i tråder. Returnerer en array av trådgrupper med thread,
// sender, meldinger, uleste meldinger og siste melding. Bevarer datarekkefølge
// (nyeste/sist aktive tråd vises i den rekkefølgen meldingene kommer i v1).
function groupInboxMessagesByThread(messages) {
  const groups = new Map();

  for (const message of messages) {
    const threadId = getMessageThreadId(message);

    if (!threadId) {
      continue;
    }

    if (!groups.has(threadId)) {
      groups.set(threadId, {
        threadId,
        thread: getInboxThread(threadId),
        messages: []
      });
    }

    groups.get(threadId).messages.push(message);
  }

  return Array.from(groups.values()).map((group) => {
    const latestMessage = group.messages[group.messages.length - 1] || null;
    const unreadMessages = group.messages.filter((message) => {
      return message?.id && !state.readInboxMessageIds.has(message.id);
    });

    return {
      threadId: group.threadId,
      thread: group.thread,
      sender: getThreadSender(group.thread, latestMessage),
      messages: group.messages,
      unreadMessages,
      latestMessage
    };
  });
}

// Aktiv Innboks: tråder med minst én ulest, aktiv melding. Synker samtidig
// levert-historikken slik at arkivet husker meldinger som er vist minst én gang.
function getActiveInboxThreads() {
  const activeMessages = getActiveInboxMessages();
  syncDeliveredInboxMessages(activeMessages);

  const unreadActiveMessages = activeMessages.filter((message) => {
    return message?.id && !state.readInboxMessageIds.has(message.id);
  });

  return groupInboxMessagesByThread(unreadActiveMessages);
}

// Trådarkiv: levert historikk som ikke er ulest-aktiv. En melding som fortsatt
// er aktiv og ulest hører hjemme i Innboks, ikke i arkivet.
function getArchivedInboxThreads() {
  const deliveredMessages = state.clubInboxMessages.filter((message) => {
    return message?.id && state.deliveredInboxMessageIds.has(message.id);
  });

  const readOrInactiveMessages = deliveredMessages.filter((message) => {
    const isRead = state.readInboxMessageIds.has(message.id);
    const isActive = messageMatchesClubWeek(message);
    const isUnreadActive = isActive && !isRead;
    return !isUnreadActive;
  });

  return groupInboxMessagesByThread(readOrInactiveMessages);
}

// Bygg ett message-card-element fra en melding. Bruker kun textContent,
// gjenbruker eksisterende message-card-CSS. isEmpty gir empty-state-stil.
function createMessageCard(message, isEmpty = false) {
  const article = document.createElement("article");
  article.className = isEmpty ? "message-card is-empty" : "message-card";

  // Avsenderkatalogen brukes når senderId finnes; ellers faller vi tilbake til
  // meldingens egen from/tag. Beskrivelse vises ikke i UI ennå.
  const sender = getInboxSender(message.senderId);

  if (sender?.group) {
    article.dataset.senderGroup = sender.group;
  }

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const from = document.createElement("span");
  from.className = "message-from";
  from.textContent = sender?.name || message.from || "Klubbkontoret";

  const tag = document.createElement("span");
  tag.className = "message-tag";
  tag.textContent = message.tag || sender?.defaultTag || "Melding";

  const title = document.createElement("h3");
  title.textContent = message.title || "Ny melding";

  const body = document.createElement("p");
  body.textContent = message.body || "Ingen meldingstekst.";

  meta.append(from, tag);
  article.append(meta, title, body);

  return article;
}

// Bygg ett trådkort fra en trådgruppe. Bruker kun createElement/textContent og
// gjenbruker message-card-CSS. options.showReadButton gir en "Marker tråd som
// lest"-knapp som markerer alle uleste meldinger i tråden som lest.
function createInboxThreadCard(threadGroup, options = {}) {
  const article = document.createElement("article");
  article.className = "message-card inbox-thread-card";

  const thread = threadGroup.thread;
  const latestMessage = threadGroup.latestMessage;
  const sender = threadGroup.sender;
  const unreadCount = threadGroup.unreadMessages.length;

  if (sender?.group) {
    article.dataset.senderGroup = sender.group;
  }

  const meta = document.createElement("div");
  meta.className = "message-meta";

  // Avsendernavn: trådens/meldingens avsender, ellers meldingens egen from.
  const from = document.createElement("span");
  from.className = "message-from";
  from.textContent = sender?.name || latestMessage?.from || "Klubbkontoret";

  // Kategori/tag: trådens kategori, ellers avsenderens standardtag.
  const tag = document.createElement("span");
  tag.className = "message-tag";
  tag.textContent = thread?.category || sender?.defaultTag || "Tråd";

  meta.append(from, tag);

  if (unreadCount > 0) {
    const unread = document.createElement("span");
    unread.className = "message-tag";
    unread.textContent = unreadCount === 1 ? "1 ulest" : `${unreadCount} uleste`;
    meta.append(unread);
  }

  const subject = document.createElement("h3");
  subject.textContent = thread?.subject || latestMessage?.title || "Tråd";

  const latestTitle = document.createElement("p");
  latestTitle.className = "inbox-thread-latest-title";
  latestTitle.textContent = `Siste: ${latestMessage?.title || "Ingen meldinger"}`;

  const body = document.createElement("p");
  body.textContent = latestMessage?.body || "Ingen meldingstekst.";

  article.append(meta, subject, latestTitle, body);

  if (options.showReadButton) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "inbox-thread-read-button";
    button.textContent = "Marker tråd som lest";
    button.addEventListener("click", () => {
      for (const message of threadGroup.unreadMessages) {
        if (message?.id) {
          state.readInboxMessageIds.add(message.id);
        }
      }
      saveReadInboxMessageIds();
      renderApp();
    });
    article.append(button);
  }

  return article;
}

// Render Innboks som trådsystem: aktive tråder (uleste, aktive meldinger) og
// trådarkiv (levert/lest historikk). Tømmer containerne (eneste innerHTML-bruk)
// og bygger trådkort med createElement/textContent.
function renderInboxThreads() {
  const activeContainer = elements.inboxThreadList;
  const archiveContainer = elements.inboxThreadArchive;

  if (activeContainer) {
    activeContainer.innerHTML = "";
    const activeThreads = getActiveInboxThreads();

    if (!activeThreads.length) {
      activeContainer.append(createMessageCard({
        from: "Klubbkontoret",
        tag: "Ingen uleste tråder",
        title: "Innboksen er rolig",
        body: "Det er ingen aktive uleste tråder akkurat nå."
      }, true));
    } else {
      activeThreads.forEach((thread) => {
        activeContainer.append(createInboxThreadCard(thread, { showReadButton: true }));
      });
    }
  }

  if (archiveContainer) {
    archiveContainer.innerHTML = "";
    const archivedThreads = getArchivedInboxThreads();

    if (!archivedThreads.length) {
      archiveContainer.append(createMessageCard({
        from: "Klubbkontoret",
        tag: "Arkiv",
        title: "Ingen trådhistorikk ennå",
        body: "Tråder dukker opp her etter at meldinger er levert eller lest."
      }, true));
    } else {
      archivedThreads.slice(0, 12).forEach((thread) => {
        archiveContainer.append(createInboxThreadCard(thread, { showReadButton: false }));
      });
    }
  }
}

// ============================================================================
// History Go unlock-render (v1)
// Bygger kort med createElement/textContent (ingen innerHTML utenom clearing).
// Trygg mot manglende elementer og felt. Ingen fit-/kampmotor-effekt.
// ============================================================================

// Tom-tilstand for en unlock-liste.
function renderUnlockEmpty(container, text) {
  const empty = document.createElement("p");
  empty.className = "unlock-empty muted-text";
  empty.textContent = text;
  container.append(empty);
}

function createUnlockCard() {
  const card = document.createElement("article");
  card.className = "unlock-card";
  return card;
}

function appendUnlockTitle(card, text) {
  const title = document.createElement("h4");
  title.className = "unlock-card-title";
  title.textContent = text;
  card.append(title);
}

function appendUnlockMeta(card, text) {
  const meta = document.createElement("p");
  meta.className = "unlock-meta";
  meta.textContent = text;
  card.append(meta);
}

// Steder: navn, rolle og kort hva stedet låser opp.
function renderUnlockPlaces() {
  const list = elements.unlockPlacesList;
  if (!list) {
    return;
  }

  list.innerHTML = "";
  const places = getPlaceUnlocks();

  if (!places.length) {
    renderUnlockEmpty(list, "Ingen besøkte History Go-steder ennå.");
    return;
  }

  places.forEach((place) => {
    const card = createUnlockCard();
    appendUnlockTitle(card, place.placeName || place.placeId);

    if (place.placeRole) {
      appendUnlockMeta(card, `Rolle: ${place.placeRole}`);
    }

    const unlocks = Array.isArray(place.unlocks) ? place.unlocks : [];
    if (unlocks.length) {
      const ul = document.createElement("ul");
      ul.className = "unlock-list";
      unlocks.forEach((unlock) => {
        const li = document.createElement("li");
        li.textContent = `${unlock.type}: ${unlock.targetId}`;
        ul.append(li);
      });
      card.append(ul);
    }

    list.append(card);
  });
}

// Ett stab-kort: navn, type, hva de kan ansettes som, viktigste ekspertise,
// og prototype-notat når isPlaceholder er satt.
function createStaffCard(member) {
  const card = createUnlockCard();
  appendUnlockTitle(card, member.name || member.id);
  appendUnlockMeta(card, `Type: ${member.staffType || "ukjent"}`);

  const canBeHiredAs = Array.isArray(member.canBeHiredAs) ? member.canBeHiredAs : [];
  if (canBeHiredAs.length) {
    appendUnlockMeta(card, `Kan ansettes som: ${canBeHiredAs.join(", ")}`);
  }

  const expertiseIds = Array.isArray(member.expertiseIds) ? member.expertiseIds : [];
  if (expertiseIds.length) {
    appendUnlockMeta(card, `Ekspertise: ${expertiseIds.slice(0, 4).join(", ")}`);
  }

  if (member.isPlaceholder) {
    const note = document.createElement("p");
    note.className = "staff-placeholder-note";
    note.textContent = "Prototypeprofil – krever research.";
    card.append(note);
  }

  appendStaffAction(card, member);

  return card;
}

// Engasjer-knapp for ledig stab, eller "Engasjert"-status for ansatt stab.
function appendStaffAction(card, member) {
  const hiredIds = new Set(
    Array.isArray(state.teamMerits?.hiredStaffIds) ? state.teamMerits.hiredStaffIds : []
  );

  if (hiredIds.has(member.id)) {
    card.classList.add("is-hired");
    const status = document.createElement("p");
    status.className = "unlock-status is-available";
    status.textContent = "Engasjert";
    card.append(status);
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "unlock-card-action";
  button.textContent = "Engasjer";
  button.addEventListener("click", () => hireStaff(member.id));
  card.append(button);
}

// Tilgjengelig og engasjert stab.
function renderStaffUnlocks() {
  const availableList = elements.availableStaffList;
  if (availableList) {
    availableList.innerHTML = "";
    const available = getUnlockedStaff();
    if (!available.length) {
      renderUnlockEmpty(availableList, "Ingen tilgjengelig stab ennå. Besøk flere steder.");
    } else {
      available.forEach((member) => availableList.append(createStaffCard(member)));
    }
  }

  const hiredList = elements.hiredStaffList;
  if (hiredList) {
    hiredList.innerHTML = "";
    const hired = getHiredStaff();
    if (!hired.length) {
      renderUnlockEmpty(hiredList, "Ingen engasjert stab ennå.");
    } else {
      hired.forEach((member) => hiredList.append(createStaffCard(member)));
    }
  }
}

// Ekspertise: navn, kategori og hvilke badgefamilier den åpner.
function renderExpertiseUnlocks() {
  const list = elements.unlockedExpertiseList;
  if (!list) {
    return;
  }

  list.innerHTML = "";
  const expertise = getUnlockedExpertise();

  if (!expertise.length) {
    renderUnlockEmpty(list, "Ingen tilgjengelig ekspertise ennå.");
    return;
  }

  expertise.forEach((item) => {
    const card = createUnlockCard();
    appendUnlockTitle(card, item.name || item.id);
    appendUnlockMeta(card, `Kategori: ${item.category || "ukjent"}`);

    const families = Array.isArray(item.opensBadgeFamilies) ? item.opensBadgeFamilies : [];
    if (families.length) {
      appendUnlockMeta(card, `Åpner badgefamilier: ${families.join(", ")}`);
    }

    list.append(card);
  });
}

// Treningsprogrammer: navn, kategori, target badge family, status og nivåer.
function renderTrainingPrograms() {
  const list = elements.availableTrainingProgramsList;
  if (!list) {
    return;
  }

  list.innerHTML = "";
  const entries = getAvailableTrainingPrograms();

  if (!entries.length) {
    renderUnlockEmpty(list, "Ingen treningsprogrammer er innen rekkevidde ennå.");
    return;
  }

  const activeProgramIds = new Set(
    (Array.isArray(state.teamMerits?.badgeProgress) ? state.teamMerits.badgeProgress : [])
      .map((progress) => progress && progress.activeProgramId)
      .filter(Boolean)
  );

  entries.forEach(({ program, status, reasons }) => {
    const card = createUnlockCard();
    card.classList.add(status === "available" ? "is-available-program" : "is-locked-program");
    appendUnlockTitle(card, program.name || program.id);
    appendUnlockMeta(
      card,
      `Kategori: ${program.category || "ukjent"} · Badgefamilie: ${program.badgeFamilyId || "ukjent"}`
    );

    const statusEl = document.createElement("p");
    statusEl.className = "unlock-status";
    statusEl.classList.add(status === "available" ? "is-available" : "is-locked");
    statusEl.textContent = TRAINING_STATUS_TEXT[status] || status;
    card.append(statusEl);

    (Array.isArray(reasons) ? reasons : []).forEach((reason) => appendUnlockMeta(card, reason));

    const levels = Array.isArray(program.levels) ? program.levels : [];
    if (levels.length) {
      const ul = document.createElement("ul");
      ul.className = "unlock-list";
      levels.forEach((level) => {
        const li = document.createElement("li");
        const weeks = typeof level.weeksRequired === "number" ? `${level.weeksRequired} uker` : "ukjent";
        li.textContent = `${level.level}: ${weeks}`;
        ul.append(li);
      });
      card.append(ul);
    }

    // Tilgjengelige programmer kan velges; låste programmer viser kun status.
    if (status === "available") {
      const isActive = activeProgramIds.has(program.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "unlock-card-action";
      button.textContent = isActive ? "Velg neste nivå" : "Velg program";
      button.addEventListener("click", () => selectTrainingProgram(program.id));
      card.append(button);
    }

    list.append(card);
  });
}

// Badges: opptjente badges fra earnedBadgeIds som små pills.
function renderEarnedBadges() {
  const list = elements.earnedBadgesList;
  if (!list) {
    return;
  }

  list.innerHTML = "";
  const badges = getEarnedBadges();

  if (!badges.length) {
    renderUnlockEmpty(list, "Ingen opptjente badges ennå.");
    return;
  }

  badges.forEach((badge) => {
    const pill = document.createElement("span");
    pill.className = "badge-pill is-earned";
    pill.textContent = `${badge.familyName || badge.familyId}: ${badge.name || badge.id}`;
    list.append(pill);
  });
}

// Treningsuke-status og aktive badge-progresjoner i History Go-fanen.
function renderHgTrainingWeek() {
  if (elements.hgTrainingWeekStatus) {
    const week = Number.isInteger(state.teamMerits?.activeTrainingWeek)
      ? state.teamMerits.activeTrainingWeek
      : 1;
    elements.hgTrainingWeekStatus.textContent = `Treningsuke ${week}`;
  }

  renderBadgeProgress();
}

// Aktive treningsprogresjoner: programnavn, target badge-navn og uke-teller.
function renderBadgeProgress() {
  const list = elements.badgeProgressList;
  if (!list) {
    return;
  }

  list.innerHTML = "";

  const progress = Array.isArray(state.teamMerits?.badgeProgress) ? state.teamMerits.badgeProgress : [];

  if (!progress.length) {
    renderUnlockEmpty(list, "Ingen aktive treningsprogresjoner. Velg et treningsprogram for å starte.");
    return;
  }

  const catalog = getBadgeCatalog();
  const programsById = new Map(
    (Array.isArray(state.trainingPrograms) ? state.trainingPrograms : [])
      .filter((program) => program && program.id)
      .map((program) => [program.id, program])
  );

  progress.forEach((entry) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const card = createUnlockCard();
    card.classList.add("unlock-progress-card");

    const program = programsById.get(entry.activeProgramId);
    appendUnlockTitle(card, program?.name || entry.activeProgramId || "Treningsprogram");

    const badge = catalog.get(entry.targetBadgeId);
    appendUnlockMeta(card, `Mål-badge: ${badge ? badge.name || badge.id : entry.targetBadgeId || "ukjent"}`);

    const done = Number.isInteger(entry.progressWeeks) ? entry.progressWeeks : 0;
    const need = Number.isInteger(entry.requiredWeeks) && entry.requiredWeeks >= 1 ? entry.requiredWeeks : 1;

    const line = document.createElement("p");
    line.className = "unlock-progress-line";
    line.textContent = `${done}/${need} uker`;
    card.append(line);

    list.append(card);
  });
}

// Lagklasser: navn og beskrivelse.
function renderTeamClassifications() {
  const list = elements.teamClassificationsList;
  if (!list) {
    return;
  }

  list.innerHTML = "";
  const classifications = getActiveTeamClassifications();

  if (!classifications.length) {
    renderUnlockEmpty(list, "Ingen aktive lagklasser ennå.");
    return;
  }

  classifications.forEach((classification) => {
    const card = createUnlockCard();
    appendUnlockTitle(card, classification.name || classification.id);
    if (classification.description) {
      appendUnlockMeta(card, classification.description);
    }
    list.append(card);
  });
}

// Statusfelt for ekte History Go-sync: hvor mange steder som er funnet i hver
// kilde, og hvor mange relevante Football Manager-unlock-steder som er aktive.
function renderHistoryGoSyncStatus() {
  const el = elements.historyGoSyncStatus;
  if (!el) {
    return;
  }

  const visitedCount = getHistoryGoVisitedPlaceIds().size;
  const groundhopperCount = getHistoryGoGroundhopperPlaceIds().size;
  const relevantCount = getHistoryGoCollectedSportPlaceIds().size;

  if (relevantCount === 0) {
    el.textContent =
      "History Go-sync: ingen besøkte sportsteder funnet ennå. Bruker demo-/lagstate.";
    return;
  }

  el.textContent =
    `History Go-sync: ${relevantCount} relevante sportsteder funnet. ` +
    `(${visitedCount} i visited_places, ${groundhopperCount} i hg_groundhopper_stats_v1.)`;
}

function renderApp() {
  const teamFit = getTeamFit();

  renderControls();
  renderTeamSummary(teamFit);
  renderLineup(teamFit);
  renderSlotEditor(teamFit);
  renderReport(teamFit);

  renderManagerEngineBridge();
  renderClubWeek().catch(console.error);
  renderInboxThreads();

  // History Go-unlocks (v1): sted → person → ekspertise → program → badge → lagklasse.
  renderHistoryGoSyncStatus();
  renderUnlockPlaces();
  renderStaffUnlocks();
  renderExpertiseUnlocks();
  renderTrainingPrograms();
  renderHgTrainingWeek();
  renderEarnedBadges();
  renderTeamClassifications();
}

function bindEvents() {
  elements.formationSelect.addEventListener("change", (event) => {
    state.selectedFormationId = event.target.value;
    seedLineupForFormation();
    ensurePositionsForFormation();
    renderApp();
  });

  elements.tacticSelect.addEventListener("change", (event) => {
    state.selectedTacticId = event.target.value;
    renderApp();
  });

  elements.slotPlayerSelect.addEventListener("change", (event) => {
    const slot = getSelectedSlot();

    if (!slot) {
      return;
    }

    const nextPlayerId = event.target.value === EMPTY_VALUE ? null : event.target.value;
    const player = state.players.find((item) => item.id === nextPlayerId) || null;
    const currentRoleId = state.lineup[slot.slotId]?.roleId || null;
    const currentRole = state.roles.find((role) => role.id === currentRoleId);

    state.lineup[slot.slotId] = {
      playerId: nextPlayerId,
      roleId: currentRole?.validPositions.includes(slot.position) ? currentRoleId : getDefaultRoleForPlayer(player, slot)
    };

    renderApp();
  });

  elements.slotRoleSelect.addEventListener("change", (event) => {
    const slot = getSelectedSlot();

    if (!slot) {
      return;
    }

    state.lineup[slot.slotId] = {
      playerId: state.lineup[slot.slotId]?.playerId || null,
      roleId: event.target.value === EMPTY_VALUE ? null : event.target.value
    };

    renderApp();
  });

  if (elements.clearKnowledgeFocus) {
    elements.clearKnowledgeFocus.addEventListener("click", () => {
      state.activeKnowledgeFocusId = null;
      clearActiveKnowledgeFocus();
      renderApp();
    });
  }

  if (elements.advanceTrainingWeek) {
    elements.advanceTrainingWeek.addEventListener("click", () => {
      advanceTrainingWeek();
      renderApp();
    });
  }

  // History Go-progresjon: avanser treningsuke og nullstill lagstate.
  if (elements.advanceHgTrainingWeek) {
    elements.advanceHgTrainingWeek.addEventListener("click", () => {
      advanceHgTrainingWeek();
    });
  }

  if (elements.resetHgTeamMerits) {
    elements.resetHgTeamMerits.addEventListener("click", () => {
      resetTeamMerits();
    });
  }

  // Manuell synk av ekte History Go-steder. Gjør testing enkel på iPad/GitHub Pages.
  if (elements.syncHistoryGoPlaces) {
    elements.syncHistoryGoPlaces.addEventListener("click", () => {
      syncUnlockedPlacesFromHistoryGo();
      recomputeActiveClassifications();
      saveTeamMerits();
      renderApp();
    });
  }

  if (elements.advanceClubWeekPhase) {
    elements.advanceClubWeekPhase.addEventListener("click", async () => {
      // Mangler tilstanden, lager vi en initial uke 1 / analyse først.
      if (!state.clubWeekState) {
        state.clubWeekState = await createInitialClubWeekStateFromBrowser({});
      }

      const previous = state.clubWeekState;
      let next = await advanceClubWeekPhaseFromBrowser(previous);
      const consequences = getClubWeekTransitionConsequences(previous, next);

      // Bruk små klubbkonsekvenser kun når et fasebytte faktisk gir effekter.
      if (Object.keys(consequences.effects).length > 0) {
        next = await applyClubWeekEffectsFromBrowser(next, consequences.effects);
      }

      // Loggfør hendelsen med fasen som nettopp ble avsluttet (previous).
      const previousPhaseLabel = CLUB_WEEK_PHASE_LABELS[previous.phase] || previous.phase;

      addClubWeekEvent({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        week: previous.week,
        phase: previous.phase,
        phaseLabel: previousPhaseLabel,
        message: consequences.message
      });

      // Feedback må settes før setClubWeekState, som trigger renderApp().
      setClubWeekFeedback(consequences.message);
      setClubWeekState(next);
    });
  }
}

function initTabs() {
  const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
  const sections = Array.from(document.querySelectorAll("[data-tab-section]"));

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tabTarget;

      tabButtons.forEach((other) => {
        const isActive = other === button;
        other.classList.toggle("is-active", isActive);
        other.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      sections.forEach((section) => {
        section.hidden = section.dataset.tabSection !== target;
      });
    });
  });
}

async function init() {
  initTabs();

  try {
    const [
      playersData,
      rolesData,
      tacticsData,
      formationsData,
      knowledgeData,
      clubInboxMessagesData,
      clubInboxSendersData,
      clubInboxThreadsData,
      unlocksData,
      staffData,
      expertiseData,
      trainingProgramsData,
      trainingBadgesData,
      teamClassificationsData,
      teamMeritsData
    ] = await Promise.all([
      loadJson(DATA_PATHS.players),
      loadJson(DATA_PATHS.roles),
      loadJson(DATA_PATHS.tactics),
      loadJson(DATA_PATHS.formations),
      // Kunnskapsdata er valgfri: hvis filen mangler, fortsetter demoen uten den.
      loadJson(DATA_PATHS.knowledgePrinciples).catch(() => null),
      // Innboksdata er valgfri: hvis filen mangler, brukes fallback-meldinger.
      loadJson(DATA_PATHS.clubInboxMessages).catch(() => null),
      // Avsenderkatalogen er valgfri: hvis filen mangler, brukes fallback-avsendere.
      loadJson(DATA_PATHS.clubInboxSenders).catch(() => null),
      // Trådkatalogen er valgfri: hvis filen mangler, brukes fallback-tråder.
      loadJson(DATA_PATHS.clubInboxThreads).catch(() => null),
      // History Go-unlock-data er valgfri: hvis en fil mangler, fortsetter
      // appen uten det aktuelle laget (prototype-robusthet).
      loadJson(DATA_PATHS.unlocks).catch(() => null),
      loadJson(DATA_PATHS.staff).catch(() => null),
      loadJson(DATA_PATHS.expertise).catch(() => null),
      loadJson(DATA_PATHS.trainingPrograms).catch(() => null),
      loadJson(DATA_PATHS.trainingBadges).catch(() => null),
      loadJson(DATA_PATHS.teamClassifications).catch(() => null),
      loadJson(DATA_PATHS.teamMerits).catch(() => null)
    ]);

    state.players = playersData.players;
    state.roles = rolesData.roles;
    state.tactics = tacticsData.tactics;
    state.formations = formationsData.formations;

    if (Array.isArray(knowledgeData?.principles)) {
      state.knowledgePrinciples = knowledgeData.principles;
    } else {
      state.knowledgePrinciples = [];
      console.warn("Fotballkunnskap-data mangler eller har feil format. Fortsetter uten kunnskapsanbefalinger.");
    }

    if (Array.isArray(clubInboxMessagesData?.messages)) {
      state.clubInboxMessages = clubInboxMessagesData.messages;
    } else {
      state.clubInboxMessages = getFallbackInboxMessages();
      console.warn("Innboks-data mangler eller har feil format. Bruker fallback-meldinger.");
    }

    if (Array.isArray(clubInboxSendersData?.senders)) {
      state.clubInboxSenders = clubInboxSendersData.senders;
    } else {
      state.clubInboxSenders = getFallbackInboxSenders();
      console.warn("Innboks-avsendere mangler eller har feil format. Bruker fallback-avsendere.");
    }

    if (Array.isArray(clubInboxThreadsData?.threads)) {
      state.clubInboxThreads = clubInboxThreadsData.threads;
    } else {
      state.clubInboxThreads = getFallbackInboxThreads();
      console.warn("Innboks-tråder mangler eller har feil format. Bruker fallback-tråder.");
    }

    // History Go-unlocks (v1): normaliser hver fil til forventet form. Manglende
    // eller feilformede filer faller tilbake til tomme strukturer, slik at
    // resten av appen (fit-/lagfitmotor) er upåvirket.
    state.unlocks = Array.isArray(unlocksData?.placeUnlocks) ? unlocksData : { placeUnlocks: [] };
    state.staff = Array.isArray(staffData?.staff) ? staffData.staff : [];
    state.expertise = Array.isArray(expertiseData?.expertise) ? expertiseData.expertise : [];
    state.trainingPrograms = Array.isArray(trainingProgramsData?.programs) ? trainingProgramsData.programs : [];
    state.trainingBadges = Array.isArray(trainingBadgesData?.badgeFamilies) ? trainingBadgesData : { badgeFamilies: [] };
    state.teamClassifications = Array.isArray(teamClassificationsData?.classifications)
      ? teamClassificationsData
      : { classifications: [] };
    // Seed fra example-filen brukes ved første lasting; deretter persisteres
    // brukerens egne endringer i localStorage (hgfm.teamMerits.v1).
    const seedMerits = teamMeritsData && typeof teamMeritsData === "object" && !Array.isArray(teamMeritsData)
      ? teamMeritsData
      : null;
    state.teamMerits = loadTeamMerits(seedMerits);

    if (!state.teamMerits) {
      console.warn("History Go team merits mangler eller har feil format. Unlock-laget vises tomt.");
    } else {
      // Ekte History Go-sync: unlock-data (state.unlocks) er nå lastet, så vi kan
      // filtrere besøkte steder mot placeUnlocks og merge dem inn i team merits
      // uten å overskrive eksisterende progresjon.
      syncUnlockedPlacesFromHistoryGo();
      // Hold lagklasser synk med opptjente badges fra start (seed kan ha
      // utdaterte activeClassifications).
      recomputeActiveClassifications();
      saveTeamMerits();
    }

    state.selectedFormationId = state.formations[0]?.id || null;
    state.selectedTacticId = state.tactics[0]?.id || null;
    state.trainingWeek = loadTrainingWeek();
    state.activeKnowledgeFocusId = loadActiveKnowledgeFocus();
    state.completedKnowledgeFocusIds = loadCompletedKnowledgeFocusIds();
    state.readInboxMessageIds = loadReadInboxMessageIds();
    state.deliveredInboxMessageIds = loadDeliveredInboxMessageIds();

    const dataWarnings = validateFootballData(state);

    if (dataWarnings.length > 0) {
      console.warn("Football Manager-data har kvalitetsadvarsler:", dataWarnings);
    }

    const unlockWarnings = validateUnlockData();

    if (unlockWarnings.length > 0) {
      console.warn("History Go unlock-data har kvalitetsadvarsler:", unlockWarnings);
    }

    // Club Week-tilstand: les lagret tilstand og la engine/fallback normalisere
    // den (ugyldig/gammel verdi blir uke 1 / analyse).
    const storedClubWeekState = loadClubWeekState();
    state.clubWeekState = await createInitialClubWeekStateFromBrowser(storedClubWeekState || {});
    state.clubWeekFeedback = loadClubWeekFeedback();
    state.clubWeekEventLog = loadClubWeekEventLog();

    seedLineupForFormation();
    ensurePositionsForFormation();
    bindEvents();
    renderApp();
  } catch (error) {
    elements.teamStatus.textContent = "Feil";
    elements.reportSummary.textContent = `${error.message}. Kjør prosjektet via GitHub Pages eller en enkel lokal server.`;
  }
}

init();

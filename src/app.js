import { FOOTBALL_POSITIONS } from "./football-fit-engine.js";
import { calculateTeamFit } from "./football-team-fit-engine.js";
import { calculateBadgeMetricEffects } from "./football-badge-effect-engine.js";
import {
  createMatchReport,
  createMatchdaySession,
  resolveMatchdayDecision,
  finalizeMatchdaySession,
  getSessionEventIndex,
  OPPONENT_PROFILES,
  evaluateFormationMatchupVsOpponent
} from "./football-matchday-engine.js";
import {
  HISTORICAL_OPPONENT_PROFILES,
  getHistoricalOpponentProfile,
  pickHistoricalOpponentProfile
} from "./football-historical-opponent-profiles.js";
import {
  MINI_SEASON_VERSION,
  MINI_SEASON_TOTAL_WEEKS,
  MINI_SEASON_OUTCOME_LABELS,
  startMiniSeason as createMiniSeasonStart,
  normalizeMiniSeasonState,
  getCurrentMiniSeasonMatch,
  isCurrentMiniSeasonMatchPlayed,
  applyMiniSeasonMatchResult,
  advanceMiniSeasonWeek,
  summarizeMiniSeason,
  createMiniSeasonTable,
  createMiniSeasonFormGuide,
  createMiniSeasonOffPitchEvent
} from "./football-mini-season.js";
import {
  computeMatchdayConsequences,
  evaluateClubWeekMatchdayGate
} from "./football-match-consequences.js";
import {
  TRAINING_FOCUSES,
  getTrainingFocus,
  sanitizeWeeklyTrainingFocus,
  calculateTrainingStaffSupport,
  recommendTrainingFocus,
  createTrainingMatchdaySnapshot,
  buildTrainingFocusOffPitchEvent
} from "./football-training-week.js";
import { createSuggestedSetups } from "./football-suggested-setups.js";
import { computeNextActions, NEXT_ACTION_TYPES } from "./football-next-action.js";
import {
  normalizeRoleFamiliarity,
  recordMatchRoleUsage,
  summarizeLineupFamiliarity,
  describeRoleFamiliarity,
  getRoleFamiliarity
} from "./football-role-familiarity-engine.js";
import { createRoleLearningViewModel } from "./football-role-learning-view-model.js";
import { createTrainingProgramCompositions } from "./football-training-program-compositions.js";
import { buildStaffIdentitySummary } from "./football-staff-identity-engine.js";
import {
  createDefaultOffPitchState,
  normalizeOffPitchState,
  summarizeOffPitchContext,
  applyMatchdayOffPitchEffects,
  applyOffPitchEvent,
  applyTrainingProgramOffPitchEffects
} from "./football-off-pitch-parameters.js";
import {
  createInboxState,
  normalizeInboxState,
  integrateInboxThreads,
  applyInboxChoice,
  archiveInboxThread,
  markInboxThreadRead,
  getActiveInboxThreads as getActiveInboxEventThreads,
  getArchivedInboxThreads as getArchivedInboxEventThreads,
  getUnreadInboxCount as getUnreadInboxEventCount
} from "./football-inbox-events.js";
import {
  adaptHgFormations,
  buildRoleTypeIndex,
  getRoleDisplayNames,
  getHistoricalFormationRoleHint
} from "./hg-football-formation-adapter.js";
import {
  buildFormationKnowledgeIndex,
  buildOpponentProfileIndex,
  createFormationKnowledgeViewModel,
  getFormationLearningHint
} from "./football-formation-knowledge-view-model.js";
import {
  buildCoachContext,
  buildCoachContextReport,
  getStaffCategory
} from "./hg-football-coach-context-engine.js";
import {
  preloadManagerEngine,
  getLoadedManagerEngine,
  createLegacyManagerAppStateFromBrowserState,
  createLegacyManagerAppStateFromBrowserStateSync,
  getDashboardViewModelFromLegacyManagerState,
  createInitialClubWeekStateFromBrowser,
  advanceClubWeekPhaseFromBrowser,
  applyClubWeekEffectsFromBrowser,
  createClubWeekSummaryFromBrowser,
  getClubWeekPhaseLabelFromBrowser,
  getClubWeekPhaseGuidanceFromBrowser,
  listClubWeekPhasesFromBrowser,
} from "./app-manager-engine-bridge.js";

const DATA_PATHS = {
  players: "data/football_players.json",
  // Spillerarketyper (rolleprofiler/underliggende logikk) som ekte spillere
  // kobler seg til via archetypeIds. Brukes ikke til å fylle spillerselect.
  playerArchetypes: "data/football_player_archetypes.json",
  roles: "data/football_roles.json",
  tactics: "data/football_tactics.json",
  // Gammel formasjonskatalog beholdes som legacy/fallback. Taktikktavla på
  // forsiden drives nå av de historiske hgFootball-formasjonene under, men
  // filen slettes ikke: den er trygg fallback hvis hgFootball-data mangler.
  legacyFormations: "data/football_formations.json",
  // Historisk formasjonsgrunnlag (data/hgFootball/) som nå fyller formationSelect
  // og tegnes på den eksisterende grønne banen via formasjonsadapteren.
  hgFormations: "data/hgFootball/formations.json",
  hgFormationEras: "data/hgFootball/formationEras.json",
  hgRoleTypes: "data/hgFootball/roleTypes.json",
  hgRoleFitRules: "data/hgFootball/playerRoleFitRules.json",
  hgUnlockRules: "data/hgFootball/unlockRules.json",
  // Stab-/trenerroller: hvilke lag-/utviklingsdimensjoner hver rolle påvirker.
  // Driver coachContext-motoren (formationFamiliarity, coachUnderstanding m.m.).
  hgStaffRoles: "data/hgFootball/staffRoles.json",
  // Formation Knowledge Engine: kunnskapslag (matchups/parameterprofil) per
  // formasjon. Driver formasjons-matchup mot motstanderprofiler på kampdag.
  hgFormationKnowledge: "data/hgFootball/formationKnowledge.json",
  knowledgePrinciples: "data/football_knowledge_principles.json",
  clubInboxMessages: "data/club_inbox_messages.json",
  clubInboxMessageManifest: "data/club_inbox_messages/manifest.json",
  clubInboxSenders: "data/club_inbox_senders.json",
  clubInboxThreads: "data/club_inbox_threads.json",
  clubInboxChoiceManifest: "data/club_inbox_choices/manifest.json",
  clubInboxReplyManifest: "data/club_inbox_replies/manifest.json",
  // History Go-unlocks: steder, stab, ekspertise, treningsprogrammer og badges.
  unlocks: "data/football_unlocks.json",
  placeLocations: "data/football_place_locations.json",
  staff: "data/football_staff.json",
  expertise: "data/football_expertise.json",
  trainingPrograms: "data/football_training_programs.json",
  trainingBadges: "data/football_training_badges.json",
  teamClassifications: "data/football_team_classifications.json",
  // Stedsrapporter (v1): forklarer hva hvert sportsted gir manageren. Rent
  // UI-/forklaringslag – ingen unlock-, fit- eller badgeeffektmotor-effekt.
  placeReports: "data/football_place_reports.json",
  // V1 bruker example-filen som midlertidig lag-/demostate (unlockedPlaceIds,
  // hiredStaffIds, earnedBadgeIds osv.). Flyttes til save-system senere.
  teamMerits: "data/football_team_merits.example.json"
};

const EMPTY_VALUE = "__empty__";
const POSITIONS_KEY = "hgfm.slotPositions.v1";
const ACTIVE_KNOWLEDGE_FOCUS_KEY = "hgfm.activeKnowledgeFocus.v1";
const COMPLETED_KNOWLEDGE_FOCUS_KEY = "hgfm.completedKnowledgeFocus.v1";
const TRAINING_WEEK_KEY = "hgfm.trainingWeek.v1";
const WEEKLY_TRAINING_FOCUS_KEY = "hgfm.weeklyTrainingFocus.v1";
// Ukens valgte treningsprogram (komposisjon). Holdes adskilt fra treningsfokus
// og HG-badge-programmer. Kun UI/progresjon + engangs off-pitch-effekt per uke.
const WEEKLY_TRAINING_PROGRAM_KEY = "hgfm.weeklyTrainingProgram.v1";
const CLUB_WEEK_STATE_KEY = "hgfm.clubWeekState.v1";
const CLUB_WEEK_FEEDBACK_KEY = "hgfm.clubWeekFeedback.v1";
const CLUB_WEEK_EVENT_LOG_KEY = "hgfm.clubWeekEventLog.v1";
// History Go-lagprogresjon (team merits) i localStorage. Seedes fra example-filen
// ved første lasting, deretter persisteres brukerens egne endringer her.
const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";
// Innboks-tråder: leste og leverte meldings-id-er (kun UI/progresjon).
const READ_INBOX_MESSAGE_IDS_KEY = "hgfm.readInboxMessageIds.v1";
const DELIVERED_INBOX_MESSAGE_IDS_KEY = "hgfm.deliveredInboxMessageIds.v1";
// Innboks-svarvalg (v1): brukerens valgte svar per messageId. Kun UI/progresjon
// pluss små engangs-effekter på Club Week-verdier.
const SELECTED_INBOX_CHOICES_KEY = "hgfm.selectedInboxChoices.v1";
// Kampdag (v1): siste spilte kamp. Kun UI/progresjon i localStorage – ingen serie,
// tabell, sesong eller livekamp. Selve kampberegningen ligger i kampmotoren.
const MATCHDAY_STATE_KEY = "hgfm.matchday.v1";
// Mini Season v0.1: 5-kampers prøveperiode (motstanderplan, resultater, styremål
// og sluttvurdering). Kun UI/progresjon i localStorage – ingen liga, tabell,
// økonomi eller ny kampmotor. Selve logikken ligger i football-mini-season.js.
const MINI_SEASON_KEY = MINI_SEASON_VERSION;
const FIRST_TIME_PLAYTHROUGH_KEY = "hgfm.firstTimePlaythrough.v1";
const FIRST_TIME_OPPONENT_ID = "ajax_1971_73_total_football";

// Ekte History Go-progresjon i localStorage (skrives av History Go-appen, ikke
// av Football Manager). Brukes som kilde til faktisk besøkte sportsteder.
//   visited_places            – objekt/map med besøkte placeId-er ({ id: true }).
//   hg_groundhopper_stats_v1  – Groundhopper-/sportstatistikk, der
//                               visited_groundhopper_places er hovedlisten.
const HISTORY_GO_VISITED_PLACES_KEY = "visited_places";
const HISTORY_GO_GROUNDHOPPER_STATS_KEY = "hg_groundhopper_stats_v1";

// Maks antall klubbhendelser som beholdes i loggen (nyeste først).
const CLUB_WEEK_EVENT_LOG_LIMIT = 12;

// Troppskrav (roster readiness): minst 15 opplåste spillere totalt, der 11 står
// i startelleveren og minst 4 er benkespillere, før manager-/kampdelen regnes
// som spillklar.
const REQUIRED_SQUAD_SIZE = 15;
const REQUIRED_STARTERS = 11;
const REQUIRED_BENCH = 4;

// Standard y-bånd per lagdel (0 % = topp/angrep, 100 % = bunn/keeper).
const LINE_Y = { keeper: 90, defense: 72, midfield: 50, attack: 24 };

const state = {
  players: [],
  // Spillerarketyper fra football_player_archetypes.json. Underliggende
  // rolleprofiler som ekte spillere kobler seg til via archetypeIds. Brukes
  // ikke til å fylle spillerselect og har ingen direkte fit-/kampmotor-effekt.
  playerArchetypes: [],
  roles: [],
  tactics: [],
  // Runtime-formasjoner som taktikktavla bruker. Fylles nå fra de historiske
  // hgFootball-formasjonene via adapteren (adaptHgFormations). Gamle
  // football_formations.json beholdes i legacyFormations som fallback.
  formations: [],
  legacyFormations: [],
  // Historisk hgFootball-grunnlag (data/hgFootball/). Rådata pluss oppslag.
  // Driver formationSelect, faseformasjons-/taktikkpanelet og rollefit-hint.
  hgFormations: [],
  hgFormationEras: [],
  // Formation Knowledge Engine: oppslag formationId -> kunnskap (strongAgainst/
  // weakAgainst m.m.). Driver formasjons-matchup mot motstanderprofiler.
  formationKnowledgeById: {},
  hgRoleTypes: [],
  // Oppslag id -> roleType for visningsnavn på nøkkelroller (roleTypes.json).
  hgRoleTypeIndex: new Map(),
  hgRoleFitRules: null,
  hgUnlockRules: null,
  // Stab-/trenerroller (staffRoles) for coachContext-motoren. Normaliseres til
  // staffRolesData.staffRoles || [] i init().
  hgStaffRoles: [],
  knowledgePrinciples: [],
  // Peker på en hgFootball-formation.id (felles state, ingen parallell id).
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
  // Taktisk treningsfokus for gjeldende Club Week. Holdes bevisst adskilt fra
  // kunnskapsfokus og History Go-programmer/badges.
  weeklyTrainingFocus: null,
  // Ukens valgte treningsprogram (komposisjon). { programId, week, applied }.
  // Adskilt fra treningsfokus; brukes til valgt-tilstand og engangs off-pitch-effekt.
  weeklyTrainingProgram: null,
  // Club Week Engine-tilstand (uke, fase og klubbverdier). Normaliseres av engine/fallback.
  clubWeekState: null,
  // Kort tilbakemelding om siste fasebytte (kun UI/tekst, ingen score- eller engine-effekt).
  clubWeekFeedback: "Klubbuken er klar.",
  // Kort logg over fasebytter i Club Week (nyeste først). Kun UI/state/localStorage.
  clubWeekEventLog: [],
  // Base-meldinger fra datafil. Svarvalg og replies ligger i egne kataloger og
  // kobles inn i runtime (getAllRuntimeInboxMessages).
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
  // Innboks-svarvalg (v1):
  // - clubInboxChoices = valgkatalogen lastet fra manifest (én fil per avsender).
  // - selectedInboxChoices = brukerens valg som map { [messageId]: choiceId }.
  // Effekter på Club Week-verdier brukes kun første gang et valg tas; reload
  // bruker ikke effekter på nytt. Ingen kampmotor-, rollefit- eller matching-effekt.
  clubInboxChoices: [],
  selectedInboxChoices: {},
  // Hvilken innbokstråd som er åpnet/ekspandert i panelet (kun UI). Tråder vises
  // kollapset som klikkbare rader; den åpne tråden viser innhold og svarvalg.
  openInboxThreadId: null,
  // Innboks-trådsvar (v1):
  // - clubInboxReplies = reply-katalogen lastet fra manifest (én fil per avsender).
  // Et reply er en oppfølgingsmelding som låses opp når et bestemt svarvalg er
  // tatt. Replies er runtime-meldinger med egne id-er som gjenbruker eksisterende
  // delivered/read-modell. De har ingen effekter eller egne svarvalg i v1.
  clubInboxReplies: [],
  // History Go-unlocks (v1). Kobler besøkte steder til Football Manager-ressurser.
  // Filtreres gjennom availability-snapshotet (teamMerits + ekte History
  // Go-progresjon). Ingen fit-/kampmotor-effekt.
  unlocks: { placeUnlocks: [] },
  // Koordinater for steder som kan levere lokal starttropp. Datafilen er eneste
  // kilde til koordinater; app.js inneholder ingen stedsspesifikke posisjoner.
  placeLocations: { places: [] },
  staff: [],
  expertise: [],
  trainingPrograms: [],
  trainingBadges: { badgeFamilies: [] },
  teamClassifications: { classifications: [] },
  // Stedsrapporter (v1): forklaringskort per sportsted. Kun visning – ingen
  // effekt på unlock-, fit- eller badgeeffektmotor.
  placeReports: { placeReports: [] },
  // Midlertidig lag-/demostate fra example-filen (unlockedPlaceIds, hiredStaffIds,
  // unlockedExpertiseIds, earnedBadgeIds, badgeProgress, activeClassifications).
  teamMerits: null,
  // Midlertidig UI-melding for geolokasjon/aktivering. Selve valget persisteres
  // under teamMerits.localStart; denne teksten er kun status i gjeldende økt.
  localStartMessage: "",
  // Kampdag (v0.2): siste spilte kamp pluss eventuell pågående kampsesjon
  // (faser pre_match → event_1..3 → resolved med managerbeslutninger). Kun
  // UI/progresjon i localStorage – ingen serie, tabell, sesong eller livekamp.
  matchday: { lastMatch: null, session: null },
  // Mini Season v0.1: aktiv/fullført 5-kampers prøveperiode, eller null når
  // ingen prøveperiode er startet. Kun UI/progresjon i localStorage.
  miniSeason: null,
  firstTimePlaythrough: { started: false, completed: false, currentStep: "start" }
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
  // Kompakt taktisk systempanel for valgt historisk formasjon (nær banen).
  tacticalSystemPanel: document.querySelector("#tacticalSystemPanel"),
  // Additivt historisk rollefit-hint i sidepanelet.
  historicalRoleHint: document.querySelector("#historicalRoleHint"),
  roleLearningCard: document.querySelector("#roleLearningCard"),
  selectedSlotTitle: document.querySelector("#selectedSlotTitle"),
  slotPlayerSelect: document.querySelector("#slotPlayerSelect"),
  slotRoleSelect: document.querySelector("#slotRoleSelect"),
  selectedMatchScore: document.querySelector("#selectedMatchScore"),
  selectedFitStatus: document.querySelector("#selectedFitStatus"),
  selectedFitExplanation: document.querySelector("#selectedFitExplanation"),
  reportSummary: document.querySelector("#reportSummary"),
  // Trenerstøtte (coachContext) i lagrapporten.
  coachContextHeadline: document.querySelector("#coachContextHeadline"),
  coachContextFamiliarity: document.querySelector("#coachContextFamiliarity"),
  coachContextUnderstanding: document.querySelector("#coachContextUnderstanding"),
  coachContextLearning: document.querySelector("#coachContextLearning"),
  coachContextStaff: document.querySelector("#coachContextStaff"),
  badgeEffectsSummary: document.querySelector("#badgeEffectsSummary"),
  // Kampdag (v1): knapper og resultatområde i analysepanelet.
  playMatchdayButton: document.querySelector("#playMatchdayButton"),
  resetMatchdayButton: document.querySelector("#resetMatchdayButton"),
  matchdayResult: document.querySelector("#matchdayResult"),
  // Mini Season v0.1: prøveperiodepanelet nær Club Week-topbaren.
  miniSeasonStatus: document.querySelector("#miniSeasonStatus"),
  startMiniSeasonButton: document.querySelector("#startMiniSeasonButton"),
  resetMiniSeasonButton: document.querySelector("#resetMiniSeasonButton"),
  miniSeasonOverview: document.querySelector("#miniSeasonOverview"),
  firstTimePlaythroughCard: document.querySelector("#firstTimePlaythroughCard"),
  firstTimeReadiness: document.querySelector("#firstTimeReadiness"),
  firstTimeOpponent: document.querySelector("#firstTimeOpponent"),
  firstTimeAssistant: document.querySelector("#firstTimeAssistant"),
  weeklyTrainingStatus: document.querySelector("#weeklyTrainingStatus"),
  weeklyTrainingRecommendation: document.querySelector("#weeklyTrainingRecommendation"),
  weeklyTrainingOptions: document.querySelector("#weeklyTrainingOptions"),
  strengthsList: document.querySelector("#strengthsList"),
  issuesList: document.querySelector("#issuesList"),
  widthScore: document.querySelector("#widthScore"),
  depthScore: document.querySelector("#depthScore"),
  buildUpScore: document.querySelector("#buildUpScore"),
  pressScore: document.querySelector("#pressScore"),
  relationshipScore: document.querySelector("#relationshipScore"),
  // Relasjoner (synlig metrikk + forklarende liste i lagrapporten).
  relationshipHeadline: document.querySelector("#relationshipHeadline"),
  relationshipList: document.querySelector("#relationshipList"),
  managerSummary: document.querySelector("#managerSummary"),
  managerTopActions: document.querySelector("#managerTopActions"),
  // Neste handling-stripe (Playable Manager Flow Polish v1): prioritert
  // primærhandling + sekundære steg utledet av eksisterende state.
  nextActionStrip: document.querySelector("#nextActionStrip"),
  nextActionPhase: document.querySelector("#nextActionPhase"),
  nextActionPrimary: document.querySelector("#nextActionPrimary"),
  nextActionPrimaryTag: document.querySelector("#nextActionPrimaryTag"),
  nextActionPrimaryTitle: document.querySelector("#nextActionPrimaryTitle"),
  nextActionPrimaryHint: document.querySelector("#nextActionPrimaryHint"),
  nextActionSecondary: document.querySelector("#nextActionSecondary"),
  suggestedSetups: document.querySelector("#suggestedSetups"),
  contextSignals: document.querySelector("#contextSignals"),
  contextHeadline: document.querySelector("#contextHeadline"),
  trainingPrograms: document.querySelector("#trainingPrograms"),
  weeklyTrainingProgramStatus: document.querySelector("#weeklyTrainingProgramStatus"),
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
  clubWeekPhaseSteps: document.querySelector("#clubWeekPhaseSteps"),
  clubWeekPhaseGuidance: document.querySelector("#clubWeekPhaseGuidance"),
  clubWeekFeedback: document.querySelector("#clubWeekFeedback"),
  advanceClubWeekPhase: document.querySelector("#advanceClubWeekPhase"),
  clubBoardTrust: document.querySelector("#clubBoardTrust"),
  clubPlayerMorale: document.querySelector("#clubPlayerMorale"),
  clubTacticalClarity: document.querySelector("#clubTacticalClarity"),
  clubTrainingCulture: document.querySelector("#clubTrainingCulture"),
  clubMediaPressure: document.querySelector("#clubMediaPressure"),
  clubWeekEventLog: document.querySelector("#clubWeekEventLog"),
  inboxThreadList: document.querySelector("#inboxThreadList"),
  inboxThreadArchive: document.querySelector("#inboxThreadArchive"),
  // History Go-unlocks (v1).
  unlockPlacesList: document.querySelector("#unlockPlacesList"),
  unlockedPlayersStatus: document.querySelector("#unlockedPlayersStatus"),
  unlockedPlayersList: document.querySelector("#unlockedPlayersList"),
  availableStaffList: document.querySelector("#availableStaffList"),
  hiredStaffList: document.querySelector("#hiredStaffList"),
  unlockedExpertiseList: document.querySelector("#unlockedExpertiseList"),
  availableTrainingProgramsList: document.querySelector("#availableTrainingProgramsList"),
  earnedBadgesList: document.querySelector("#earnedBadgesList"),
  teamClassificationsList: document.querySelector("#teamClassificationsList"),
  // Lagidentitet (v1): forklarings-/planleggingspanel.
  teamIdentityPanel: document.querySelector("#teamIdentityPanel"),
  // Stedsrapporter (v1).
  placeReportsList: document.querySelector("#placeReportsList"),
  // History Go-treningsuke og progresjon (v1, interaktivt).
  hgTrainingWeekStatus: document.querySelector("#hgTrainingWeekStatus"),
  advanceHgTrainingWeek: document.querySelector("#advanceHgTrainingWeek"),
  resetHgTeamMerits: document.querySelector("#resetHgTeamMerits"),
  badgeProgressList: document.querySelector("#badgeProgressList"),
  // Ekte History Go-sync (v1): statusfelt og manuell synk-knapp.
  historyGoSyncStatus: document.querySelector("#historyGoSyncStatus"),
  syncHistoryGoPlaces: document.querySelector("#syncHistoryGoPlaces"),
  // Din fotballsamling: oppsummering av availability-snapshotet i History Go-fanen.
  collectionPlacesCount: document.querySelector("#collectionPlacesCount"),
  collectionPlayersCount: document.querySelector("#collectionPlayersCount"),
  collectionStaffCount: document.querySelector("#collectionStaffCount"),
  collectionFormationsCount: document.querySelector("#collectionFormationsCount"),
  collectionMatchdayBadge: document.querySelector("#collectionMatchdayBadge"),
  collectionSourceNote: document.querySelector("#collectionSourceNote"),
  collectionNextStep: document.querySelector("#collectionNextStep"),
  nearbyRecommendationsAnchor: document.querySelector("#nearbyRecommendationsAnchor"),
  nearbyRecommendationsList: document.querySelector("#nearbyRecommendationsList"),
  startModePanel: document.querySelector("#startModePanel"),
  startModeChoices: document.querySelector("#startModeChoices"),
  activeLocalStart: document.querySelector("#activeLocalStart"),
  localStartStatus: document.querySelector("#localStartStatus"),
  useHistoryGoCollection: document.querySelector("#useHistoryGoCollection"),
  activateLocalStart: document.querySelector("#activateLocalStart"),
  publicStartPlaceSelect: document.querySelector("#publicStartPlaceSelect"),
  activatePublicPlaceStart: document.querySelector("#activatePublicPlaceStart"),
  publicStartAnchorStatus: document.querySelector("#publicStartAnchorStatus"),
  clearPublicStartAnchor: document.querySelector("#clearPublicStartAnchor"),
  clearLocalStart: document.querySelector("#clearLocalStart"),
  // Kampklar-status i kampdagpanelet (gating-forklaring, ingen ny kampmotor).
  matchdayReadiness: document.querySelector("#matchdayReadiness"),
  // Tropp og benk (roster readiness): topbar-teller + statisk panel i Kontoret.
  // Rendres av app.js fra availability-snapshotet – ingen separat modul.
  rosterReadyCount: document.querySelector("#rosterReadyCount"),
  rosterReadinessBadge: document.querySelector("#rosterReadinessBadge"),
  rosterUnlockedCount: document.querySelector("#rosterUnlockedCount"),
  rosterStarterCount: document.querySelector("#rosterStarterCount"),
  rosterBenchCount: document.querySelector("#rosterBenchCount"),
  rosterReadyStatus: document.querySelector("#rosterReadyStatus"),
  rosterReadinessNote: document.querySelector("#rosterReadinessNote"),
  benchPlayersList: document.querySelector("#benchPlayersList"),
  // Fase 2: dynamisk sidepanel (spillerprofil vs. neste beslutninger).
  sidePanelKicker: document.querySelector("#sidePanelKicker"),
  sideProfile: document.querySelector("#sideProfile"),
  profileRating: document.querySelector("#profileRating"),
  profileName: document.querySelector("#profileName"),
  profilePositions: document.querySelector("#profilePositions"),
  profileSource: document.querySelector("#profileSource"),
  profileStrengths: document.querySelector("#profileStrengths"),
  profileNeeds: document.querySelector("#profileNeeds"),
  sideDecisions: document.querySelector("#sideDecisions"),
  sideDecisionsList: document.querySelector("#sideDecisionsList"),
  // Fase 2: statuskort med neste beslutninger på hovedskjermen.
  decisionCards: document.querySelector("#decisionCards"),
  // Fase 2: avdelinger med levende status.
  inboxPulseCount: document.querySelector("#inboxPulseCount"),
  adminSquadCount: document.querySelector("#adminSquadCount"),
  adminStaffCount: document.querySelector("#adminStaffCount"),
  marketMediaValue: document.querySelector("#marketMediaValue"),
  marketReputationNote: document.querySelector("#marketReputationNote"),
  boardTrustValue: document.querySelector("#boardTrustValue"),
  boardTrustFill: document.querySelector("#boardTrustFill"),
  boardTrustNote: document.querySelector("#boardTrustNote")
};

let managerEngineRenderId = 0;

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Kunne ikke laste ${path}`);
  }

  return response.json();
}

// Slår sammen innboks-meldinger fra én fil per avsender (manifest-basert) til
// én samlet array. Faller tilbake til den gamle samlefilen og deretter til
// hardkodede fallback-meldinger. Kaster aldri videre til init().
async function loadClubInboxMessages() {
  // 1) Primærkilde: manifest + én avsenderfil per avsender.
  try {
    const manifest = await loadJson(DATA_PATHS.clubInboxMessageManifest);

    if (Array.isArray(manifest?.files)) {
      const results = await Promise.allSettled(
        manifest.files.map((filePath) => loadJson(filePath))
      );

      const merged = [];
      results.forEach((result, index) => {
        const filePath = manifest.files[index];

        if (result.status !== "fulfilled") {
          console.warn(`Innboks-avsenderfil kunne ikke lastes: ${filePath}`);
          return;
        }

        const fileData = result.value;
        if (!Array.isArray(fileData?.messages)) {
          console.warn(`Innboks-avsenderfil mangler gyldig messages-array: ${filePath}`);
          return;
        }

        fileData.messages.forEach((message) => {
          if (
            typeof fileData.senderId === "string" &&
            message &&
            typeof message.senderId === "string" &&
            message.senderId !== fileData.senderId
          ) {
            console.warn(
              `Innboks-melding ${message.id ?? "(ukjent id)"} har senderId "${message.senderId}" men ligger i ${filePath} (forventet "${fileData.senderId}").`
            );
          }
          merged.push(message);
        });
      });

      const validated = validateClubInboxMessages(merged);
      if (validated.length > 0) {
        return validated;
      }
    } else {
      console.warn("Innboks-manifest mangler eller har feil format. Prøver legacy samlefil.");
    }
  } catch (error) {
    console.warn("Innboks-manifest mangler eller har feil format. Prøver legacy samlefil.");
  }

  // 2) Legacy fallback: den gamle samlefilen.
  try {
    const legacyData = await loadJson(DATA_PATHS.clubInboxMessages);
    if (Array.isArray(legacyData?.messages)) {
      return validateClubInboxMessages(legacyData.messages);
    }
  } catch (error) {
    // Faller gjennom til hardkodede fallback-meldinger nedenfor.
  }

  // 3) Siste fallback: hardkodede meldinger.
  console.warn("Innboks-data mangler eller har feil format. Bruker fallback-meldinger.");
  return getFallbackInboxMessages();
}

// Intern validering av en samlet messages-array. Filtrerer bort objekter uten
// string-id og varsler om dubletter eller manglende felt, men stopper aldri appen.
function validateClubInboxMessages(messages) {
  const seenIds = new Set();
  const valid = [];

  messages.forEach((message) => {
    if (!message || typeof message.id !== "string") {
      console.warn("Innboks-melding uten gyldig string-id ble hoppet over.");
      return;
    }

    if (seenIds.has(message.id)) {
      console.warn(`Innboks-melding med duplikat id oppdaget: ${message.id}`);
    }
    seenIds.add(message.id);

    if (typeof message.senderId !== "string") {
      console.warn(`Innboks-melding ${message.id} mangler senderId.`);
    }
    if (typeof message.threadId !== "string") {
      console.warn(`Innboks-melding ${message.id} mangler threadId.`);
    }

    valid.push(message);
  });

  return valid;
}

// Gyldige metric-nøkler for innboks-svarvalg. Holdes synk med Club Week-state.
// Brukes til validering og effekt-applisering. Ingen andre nøkler påvirker noe.
const INBOX_CHOICE_METRIC_KEYS = new Set([
  "boardTrust",
  "playerMorale",
  "mediaPressure",
  "trainingCulture",
  "tacticalClarity"
]);

// Last innboks-svarvalg manifest-basert (én fil per avsender). Slår sammen alle
// vellykkede filers choices-array, validerer og returnerer samlet array. Kaster
// aldri videre til init – ved manglende/feilende manifest returneres tom array.
async function loadClubInboxChoices() {
  try {
    const manifest = await loadJson(DATA_PATHS.clubInboxChoiceManifest);

    if (!Array.isArray(manifest?.files)) {
      console.warn("Innboks-valg-manifest mangler eller har feil format. Ingen svarvalg lastes.");
      return [];
    }

    const results = await Promise.allSettled(
      manifest.files.map((filePath) => loadJson(filePath))
    );

    const merged = [];
    results.forEach((result, index) => {
      const filePath = manifest.files[index];

      if (result.status !== "fulfilled") {
        console.warn(`Innboks-valgfil kunne ikke lastes: ${filePath}`);
        return;
      }

      const fileData = result.value;
      if (!Array.isArray(fileData?.choices)) {
        console.warn(`Innboks-valgfil mangler gyldig choices-array: ${filePath}`);
        return;
      }

      fileData.choices.forEach((choice) => merged.push(choice));
    });

    return validateClubInboxChoices(merged);
  } catch (error) {
    console.warn("Innboks-valg-manifest mangler eller har feil format. Ingen svarvalg lastes.");
    return [];
  }
}

// Intern validering av en samlet choices-array. Beholder kun objekter med
// string-id og varsler om dubletter og manglende/ugyldige felt. Stopper aldri
// appen – ugyldige enkeltfelt logges, men valget beholdes med string-id.
function validateClubInboxChoices(choices) {
  const seenIds = new Set();
  const valid = [];

  choices.forEach((choice) => {
    if (!choice || typeof choice.id !== "string") {
      console.warn("Innboks-valg uten gyldig string-id ble hoppet over.");
      return;
    }

    if (seenIds.has(choice.id)) {
      console.warn(`Innboks-valg med duplikat id oppdaget: ${choice.id}`);
    }
    seenIds.add(choice.id);

    if (typeof choice.messageId !== "string") {
      console.warn(`Innboks-valg ${choice.id} mangler messageId.`);
    }
    if (typeof choice.threadId !== "string") {
      console.warn(`Innboks-valg ${choice.id} mangler threadId.`);
    }
    if (typeof choice.senderId !== "string") {
      console.warn(`Innboks-valg ${choice.id} mangler senderId.`);
    }

    if (choice.effects && typeof choice.effects === "object" && !Array.isArray(choice.effects)) {
      for (const [metric, delta] of Object.entries(choice.effects)) {
        if (!INBOX_CHOICE_METRIC_KEYS.has(metric)) {
          console.warn(`Innboks-valg ${choice.id} har ukjent metric i effects: ${metric}`);
        } else if (typeof delta !== "number") {
          console.warn(`Innboks-valg ${choice.id} har ikke-numerisk effektverdi for ${metric}.`);
        }
      }
    }

    valid.push(choice);
  });

  return valid;
}

// Last innboks-trådsvar manifest-basert (én fil per avsender). Slår sammen alle
// vellykkede filers replies-array, validerer og returnerer samlet array. Kaster
// aldri videre til init – ved manglende/feilende manifest returneres tom array,
// og innboksen fungerer som før uten trådsvar.
async function loadClubInboxReplies() {
  try {
    const manifest = await loadJson(DATA_PATHS.clubInboxReplyManifest);

    if (!Array.isArray(manifest?.files)) {
      console.warn("Innboks-reply-manifest mangler eller har feil format. Ingen trådsvar lastes.");
      return [];
    }

    const results = await Promise.allSettled(
      manifest.files.map((filePath) => loadJson(filePath))
    );

    const merged = [];
    results.forEach((result, index) => {
      const filePath = manifest.files[index];

      if (result.status !== "fulfilled") {
        console.warn(`Innboks-replyfil kunne ikke lastes: ${filePath}`);
        return;
      }

      const fileData = result.value;
      if (!Array.isArray(fileData?.replies)) {
        console.warn(`Innboks-replyfil mangler gyldig replies-array: ${filePath}`);
        return;
      }

      const fileSenderId = typeof fileData.senderId === "string" ? fileData.senderId : null;
      fileData.replies.forEach((reply) => merged.push({ reply, fileSenderId }));
    });

    return validateClubInboxReplies(merged);
  } catch (error) {
    console.warn("Innboks-reply-manifest mangler eller har feil format. Ingen trådsvar lastes.");
    return [];
  }
}

// Intern validering av en samlet replies-array. Hvert element er { reply,
// fileSenderId } der fileSenderId er avsenderfilens senderId (eller null).
// Beholder kun objekter med string-id og varsler om dubletter og manglende/
// ugyldige felt. Stopper aldri appen – returnerer rene reply-objekter.
function validateClubInboxReplies(entries) {
  const seenIds = new Set();
  const valid = [];

  entries.forEach(({ reply, fileSenderId }) => {
    if (!reply || typeof reply.id !== "string") {
      console.warn("Innboks-reply uten gyldig string-id ble hoppet over.");
      return;
    }

    if (seenIds.has(reply.id)) {
      console.warn(`Innboks-reply med duplikat id oppdaget: ${reply.id}`);
    }
    seenIds.add(reply.id);

    if (typeof reply.triggerChoiceId !== "string") {
      console.warn(`Innboks-reply ${reply.id} mangler triggerChoiceId.`);
    }
    if (typeof reply.responseToMessageId !== "string") {
      console.warn(`Innboks-reply ${reply.id} mangler responseToMessageId.`);
    }
    if (typeof reply.threadId !== "string") {
      console.warn(`Innboks-reply ${reply.id} mangler threadId.`);
    }
    if (typeof reply.senderId !== "string") {
      console.warn(`Innboks-reply ${reply.id} mangler senderId.`);
    } else if (fileSenderId && reply.senderId !== fileSenderId) {
      console.warn(
        `Innboks-reply ${reply.id} har senderId "${reply.senderId}" men ligger i fil for "${fileSenderId}".`
      );
    }
    if (reply.phases !== undefined && !Array.isArray(reply.phases)) {
      console.warn(`Innboks-reply ${reply.id} har phases som ikke er array.`);
    }
    if (
      reply.conditions !== undefined &&
      (typeof reply.conditions !== "object" || reply.conditions === null || Array.isArray(reply.conditions))
    ) {
      console.warn(`Innboks-reply ${reply.id} har conditions som ikke er objekt.`);
    }

    valid.push(reply);
  });

  return valid;
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

function validateFootballData({ players, playerArchetypes = [], roles, tactics, formations }) {
  const warnings = [];
  const roleIds = new Set(roles.map((role) => role.id));
  const validPositions = new Set(FOOTBALL_POSITIONS);

  // Arketypeobjekter må ha id; bygg samtidig oppslag for spillernes archetypeIds.
  const archetypeIds = new Set();
  playerArchetypes.forEach((archetype) => {
    if (!archetype || !archetype.id) {
      warnings.push("En spillerarketype mangler id.");
      return;
    }
    archetypeIds.add(archetype.id);
  });

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

    if (!Array.isArray(player.strengths) || player.strengths.length === 0) {
      warnings.push(`${player.name || player.id} mangler strengths.`);
    }

    if (!Array.isArray(player.needs) || player.needs.length === 0) {
      warnings.push(`${player.name || player.id} mangler needs.`);
    }

    if (!Array.isArray(player.likesTactics) || player.likesTactics.length === 0) {
      warnings.push(`${player.name || player.id} mangler likesTactics.`);
    }

    // Hver archetypeId må peke på en arketype i football_player_archetypes.json.
    player.archetypeIds?.forEach((archetypeId) => {
      if (!archetypeIds.has(archetypeId)) {
        const message = `${player.name || player.id} peker på ukjent arketype: ${archetypeId}.`;
        warnings.push(message);
        console.warn(`Spillerarketype-kobling mangler: ${message}`);
      }
    });

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

// Lesbare etiketter for badge-nivåer i UI (lagidentitet). Fallback til id-en selv.
const BADGE_LEVEL_LABELS = { none: "Ingen", bronze: "Bronse", silver: "Sølv", gold: "Gull" };

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

// Normaliser formationFamiliarity-oppslaget { [formationId]: 0-100 }. Tåler
// manglende/korrupt struktur og gamle localStorage-data: ikke-objekt blir {},
// og bare gyldige tallverdier (clampet 0-100) beholdes.
function normalizeFormationFamiliarity(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result = {};
  Object.entries(value).forEach(([formationId, raw]) => {
    if (typeof formationId !== "string" || !formationId) {
      return;
    }
    const numberValue = Number(raw);
    if (Number.isFinite(numberValue)) {
      result[formationId] = Math.max(0, Math.min(100, Math.round(numberValue)));
    }
  });
  return result;
}

// Normaliser lokal starttropp separat slik at gamle/korrupt lagrede merits
// aldri kan lekke ugyldige koordinater eller spiller-id-er inn i availability.
function isValidLatitude(value) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function normalizePublicStartAnchor(value) {
  const base = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const enabled = base.enabled === true;
  const placeId = typeof base.placeId === "string" && base.placeId.trim() ? base.placeId.trim() : null;
  const placeName = typeof base.placeName === "string" && base.placeName.trim() ? base.placeName.trim() : null;
  const latitude = isValidLatitude(base.latitude) ? base.latitude : null;
  const longitude = isValidLongitude(base.longitude) ? base.longitude : null;
  const source = base.source === "public_history_go_place" ? base.source : "public_history_go_place";

  if (!enabled || !placeId || !placeName || latitude === null || longitude === null) {
    return {
      enabled: false,
      placeId: null,
      placeName: null,
      latitude: null,
      longitude: null,
      source: null,
      createdAt: null
    };
  }

  return {
    enabled: true,
    placeId,
    placeName,
    latitude,
    longitude,
    source,
    createdAt: typeof base.createdAt === "string" && base.createdAt.trim() ? base.createdAt : null
  };
}

function normalizeLocalStart(value) {
  const base = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const playerIds = Array.isArray(base.playerIds)
    ? [...new Set(base.playerIds.filter((playerId) => typeof playerId === "string").map((playerId) => playerId.trim()))]
        .filter(Boolean)
        .slice(0, REQUIRED_SQUAD_SIZE)
    : [];

  return {
    enabled: base.enabled === true && playerIds.length > 0,
    source: typeof base.source === "string" && base.source.trim() ? base.source : null,
    latitude: isValidLatitude(base.latitude) ? base.latitude : null,
    longitude: isValidLongitude(base.longitude) ? base.longitude : null,
    chosenPlaceId: typeof base.chosenPlaceId === "string" && base.chosenPlaceId.trim() ? base.chosenPlaceId : null,
    chosenPlaceName:
      typeof base.chosenPlaceName === "string" && base.chosenPlaceName.trim() ? base.chosenPlaceName.trim() : null,
    playerIds,
    createdAt: typeof base.createdAt === "string" && base.createdAt.trim() ? base.createdAt : null
  };
}

// Normaliser team merits til forventet form slik at render-/progresjonslaget
// alltid har gyldige arrays/tall, uansett seed eller lagret tilstand.
function normalizeTeamMerits(merits) {
  const base = isTeamMeritsObject(merits) ? merits : {};
  const localStart = normalizeLocalStart(base.localStart);
  const publicStartAnchor = normalizePublicStartAnchor(base.publicStartAnchor);
  const migratedPublicStartAnchor = publicStartAnchor.enabled
    ? publicStartAnchor
    : normalizePublicStartAnchor({
        enabled: localStart.source === "chosen_place" && Boolean(localStart.chosenPlaceId),
        placeId: localStart.chosenPlaceId,
        placeName: localStart.chosenPlaceName,
        latitude: localStart.latitude,
        longitude: localStart.longitude,
        source: "public_history_go_place",
        createdAt: localStart.createdAt
      });

  return {
    ...base,
    activeTrainingWeek:
      Number.isInteger(base.activeTrainingWeek) && base.activeTrainingWeek >= 1 ? base.activeTrainingWeek : 1,
    publicStartAnchor: migratedPublicStartAnchor,
    localStart,
    hiredStaffIds: Array.isArray(base.hiredStaffIds) ? base.hiredStaffIds : [],
    // Formasjonstilvenning per formationId (0-100). Vokser sakte med treningsuker
    // via advanceHgTrainingWeek. Robust mot gamle localStorage-data: ugyldige
    // verdier filtreres bort og manglende felt blir et tomt oppslag.
    formationFamiliarity: normalizeFormationFamiliarity(base.formationFamiliarity),
    // Role Familiarity Engine v1: fortrolighet per spiller×rolle (0-100), bygget
    // ved RIKTIG bruk over kamper. Bor i manager-staten (teamMerits), aldri i
    // History Go-progresjonen. Robust mot gamle/korrupte data.
    roleFamiliarity: normalizeRoleFamiliarity(base.roleFamiliarity),
    unlockedPlaceIds: Array.isArray(base.unlockedPlaceIds) ? base.unlockedPlaceIds : [],
    unlockedExpertiseIds: Array.isArray(base.unlockedExpertiseIds) ? base.unlockedExpertiseIds : [],
    earnedBadgeIds: Array.isArray(base.earnedBadgeIds) ? base.earnedBadgeIds : [],
    badgeProgress: Array.isArray(base.badgeProgress) ? base.badgeProgress : [],
    activeClassifications: Array.isArray(base.activeClassifications) ? base.activeClassifications : [],
    // Off-pitch Parameters v1: managerens kontekstlag (slitasje, moral, press,
    // garderobe, taktisk klarhet …) ligger i manager-staten, ikke i History
    // Go-progresjonen. Normaliseres alltid; ny tropp får default-konteksten.
    offPitch: normalizeOffPitchState(base.offPitch),
    // Inbox Event Integration v1: innboksens levende tråder (genererte fra
    // off-pitch/trening/kampdag/kontekst, leste/løste/arkiverte). Ligger også i
    // manager-staten, ikke i History Go-progresjonen. Aldri visited_places /
    // hg_groundhopper_stats_v1.
    inbox: normalizeInboxState(base.inbox),
    // Club Week Orchestrator v1: uke/fase/klubbverdier bor nå i merits, sammen
    // med off-pitch og innboks, slik at hele manageruka er én sammenhengende
    // state. null til den er migrert/initialisert (engine/fallback eier formen).
    clubWeekState: sanitizeStoredClubWeekState(base.clubWeekState)
  };
}

// Off-pitch-kontekst (Off-pitch Parameters v1) for manager-staten. Ligger i
// teamMerits.offPitch; returnerer alltid en normalisert state (default når den
// mangler). Leses av treningsprogram-, forslag- og kontekst-UI-et.
function getOffPitchState() {
  return state.teamMerits?.offPitch
    ? normalizeOffPitchState(state.teamMerits.offPitch)
    : createDefaultOffPitchState();
}

// Match Explanation v1.5: en lesbar off-pitch-snapshot SLIK KONTEKSTEN VAR FØR
// kampen, til kampforklaringen. Eksponerer kun de lesbare team-/squad-verdiene
// og et VAGT hint om skjult uro (summarizeOffPitchContext.hiddenHint) — aldri de
// rå hidden-tallene (off-pitch-modulens hidden-prinsipp). Kampmotoren leser den;
// app.js eier all lasting/normalisering.
function buildMatchdayOffPitchSnapshot() {
  const offPitchState = getOffPitchState();
  const summary = summarizeOffPitchContext(offPitchState);
  const team = offPitchState.team || {};
  const squad = offPitchState.squad || {};
  return {
    morale: team.morale,
    confidence: team.confidence,
    cohesion: team.cohesion,
    fatigue: team.fatigue,
    wear: team.wear,
    injuryRisk: team.injuryRisk,
    mediaPressure: team.mediaPressure,
    boardPressure: team.boardPressure,
    tacticalClarity: squad.tacticalClarity,
    recentTrainingProgramIds: Array.isArray(offPitchState.recentTrainingProgramIds)
      ? [...offPitchState.recentTrainingProgramIds]
      : [],
    hiddenHint: summary.hiddenHint || null,
    topConcerns: Array.isArray(summary.topConcerns) ? summary.topConcerns.slice(0, 3) : [],
    positives: Array.isArray(summary.positives) ? summary.positives.slice(0, 3) : []
  };
}

// Inbox Event Integration v1: innboksens tråd-state (teamMerits.inbox).
// Returnerer alltid en normalisert state (default når den mangler).
function getInboxState() {
  return state.teamMerits?.inbox
    ? normalizeInboxState(state.teamMerits.inbox)
    : createInboxState();
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
  if (state.teamMerits) {
    state.teamMerits.localStart = normalizeLocalStart(null);
    state.teamMerits.publicStartAnchor = normalizePublicStartAnchor(null);
  }
  state.localStartMessage = "";
  recomputeActiveClassifications();
  invalidateAvailability();
  // Nullstilling kan låse spillere/formasjoner igjen; fjern nå-låste spillere
  // fra lineup og fall tilbake til første tilgjengelige formasjon ved behov.
  sanitizeLineupForUnlockedPlayers();
  sanitizeSelectedFormation();
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

// Unlock-typer i football_unlocks.json som regnes som spillerkandidat.
function isPlayerUnlockType(type) {
  return typeof type === "string" && (type === "player_candidate" || /player/i.test(type));
}

function getLocalStartPlayerIds() {
  const localStart = normalizeLocalStart(state.teamMerits?.localStart);
  return localStart.enabled ? localStart.playerIds : [];
}

function getPublicStartAnchor() {
  const anchor = normalizePublicStartAnchor(state.teamMerits?.publicStartAnchor);
  if (!anchor.enabled) {
    return null;
  }
  return {
    placeId: anchor.placeId,
    placeName: anchor.placeName,
    latitude: anchor.latitude,
    longitude: anchor.longitude,
    source: anchor.source,
    createdAt: anchor.createdAt
  };
}

function setPublicStartAnchor(placeId) {
  if (!state.teamMerits || typeof placeId !== "string" || !placeId.trim()) {
    return null;
  }

  const place = getPlaceLocationIndex().get(placeId.trim());
  const isPublicPlace = getPublicStartPlaces().some((entry) => entry.placeId === placeId.trim());
  if (!place || !isPublicPlace || !isValidLatitude(place.latitude) || !isValidLongitude(place.longitude)) {
    state.teamMerits.publicStartAnchor = normalizePublicStartAnchor(null);
    saveTeamMerits();
    return null;
  }

  state.teamMerits.publicStartAnchor = normalizePublicStartAnchor({
    enabled: true,
    placeId: place.placeId,
    placeName: place.placeName,
    latitude: place.latitude,
    longitude: place.longitude,
    source: "public_history_go_place",
    createdAt: new Date().toISOString()
  });
  saveTeamMerits();
  return getPublicStartAnchor();
}

function clearPublicStartAnchor() {
  if (!state.teamMerits) {
    return;
  }
  const anchor = getPublicStartAnchor();
  state.teamMerits.publicStartAnchor = normalizePublicStartAnchor(null);
  const localStart = normalizeLocalStart(state.teamMerits.localStart);
  if (anchor && localStart.source === "chosen_place" && localStart.chosenPlaceId === anchor.placeId) {
    state.teamMerits.localStart = normalizeLocalStart(null);
    invalidateAvailability();
    sanitizeLineupForUnlockedPlayers();
    sanitizeSelectedFormation();
  }
  state.localStartMessage = "Offentlig startsted er fjernet.";
  saveTeamMerits();
  renderApp();
}

// Haversine-avstand mellom to { latitude, longitude }-punkter, i kilometer.
function calculateDistanceKm(a, b) {
  if (
    !isValidLatitude(a?.latitude) ||
    !isValidLongitude(a?.longitude) ||
    !isValidLatitude(b?.latitude) ||
    !isValidLongitude(b?.longitude)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const startLatitude = toRadians(a.latitude);
  const endLatitude = toRadians(b.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  const clampedHaversine = Math.max(0, Math.min(1, haversine));
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(clampedHaversine), Math.sqrt(1 - clampedHaversine));
}

function getPlaceLocationIndex(placeLocations = state.placeLocations) {
  const index = new Map();
  (Array.isArray(placeLocations?.places) ? placeLocations.places : []).forEach((place) => {
    if (
      place &&
      typeof place.placeId === "string" &&
      place.placeId &&
      isValidLatitude(place.latitude) &&
      isValidLongitude(place.longitude)
    ) {
      index.set(place.placeId, place);
    }
  });
  return index;
}

// Returnerer stabile spillerkandidater sortert etter nærmeste kvalifiserte sted.
// Samme spiller beholdes bare én gang, via stedet med kortest avstand.

function getPersonNameById(collection, id) {
  return (Array.isArray(collection) ? collection : []).find((item) => item?.id === id)?.name || null;
}

function normalizeRecommendationLimit(limit) {
  return Number.isInteger(limit) && limit >= 0 ? limit : 6;
}

function describePlaceRecommendation(placeId) {
  if (!placeId) {
    return null;
  }

  const location = getPlaceLocationIndex().get(placeId);
  const placeUnlocks = Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [];
  const place = placeUnlocks.find((entry) => entry && entry.placeId === placeId) || null;
  const report = getPlaceReport(placeId);
  const unlockSummary = { players: 0, staff: 0, expertise: 0, training: 0 };
  const playerNames = [];
  const staffNames = [];

  (Array.isArray(place?.unlocks) ? place.unlocks : []).forEach((unlock) => {
    if (!unlock || !unlock.type) {
      return;
    }
    if (isPlayerUnlockType(unlock.type)) {
      unlockSummary.players += 1;
      const name = getPersonNameById(state.players, unlock.targetId);
      if (name) {
        playerNames.push(name);
      }
    } else if (isStaffUnlockType(unlock.type)) {
      unlockSummary.staff += 1;
      const name = getPersonNameById(state.staff, unlock.targetId);
      if (name) {
        staffNames.push(name);
      }
    } else if (unlock.type === "expertise") {
      unlockSummary.expertise += 1;
    } else if (unlock.type === "training_program" || unlock.type === "training_model") {
      unlockSummary.training += 1;
    }
  });

  const recommendedUse = Array.isArray(report?.recommendedUse) ? report.recommendedUse.filter(Boolean) : [];
  return {
    placeId,
    placeName: place?.placeName || location?.placeName || report?.title || placeId,
    isUnlocked: getUnlockedPlaceIds().has(placeId),
    unlockSummary,
    shortReason: report?.managerValue || report?.summary || "",
    recommendedUse,
    playerNames,
    staffNames,
    report
  };
}

function getNearbyPlaceRecommendations(limit = 6) {
  const anchor = getPublicStartAnchor();
  if (!anchor) {
    return [];
  }

  const safeLimit = normalizeRecommendationLimit(limit);
  const locationIndex = getPlaceLocationIndex();
  const placeUnlocks = Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [];
  const orderedPlaceIds = new Set([
    ...placeUnlocks.map((place) => place?.placeId).filter(Boolean),
    ...locationIndex.keys()
  ]);

  return [...orderedPlaceIds]
    .filter((placeId) => placeId !== anchor.placeId)
    .map((placeId, order) => {
      const location = locationIndex.get(placeId);
      if (!location) {
        return null;
      }
      const distanceKm = calculateDistanceKm(anchor, location);
      if (!Number.isFinite(distanceKm)) {
        return null;
      }
      const description = describePlaceRecommendation(placeId);
      if (!description) {
        return null;
      }
      return { ...description, distanceKm, order };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm || a.order - b.order || a.placeName.localeCompare(b.placeName))
    .slice(0, safeLimit);
}

function getNearestLocalStartPlayers({ players, placeUnlocks, placeLocations, startLocation, limit }) {
  const playerIndex = new Map(
    (Array.isArray(players) ? players : []).filter((player) => player?.id).map((player) => [player.id, player])
  );
  const locationIndex = getPlaceLocationIndex(placeLocations);
  const nearestByPlayerId = new Map();

  (Array.isArray(placeUnlocks) ? placeUnlocks : []).forEach((place, placeOrder) => {
    const location = locationIndex.get(place?.placeId);
    if (!location) {
      return;
    }
    const distanceKm = calculateDistanceKm(startLocation, location);
    if (!Number.isFinite(distanceKm)) {
      return;
    }

    (Array.isArray(place.unlocks) ? place.unlocks : []).forEach((unlock, unlockOrder) => {
      if (!unlock || !isPlayerUnlockType(unlock.type) || !playerIndex.has(unlock.targetId)) {
        return;
      }
      const candidate = {
        player: playerIndex.get(unlock.targetId),
        playerId: unlock.targetId,
        placeId: place.placeId,
        placeName: place.placeName || location.placeName || place.placeId,
        distanceKm,
        order: placeOrder * 1000 + unlockOrder
      };
      const current = nearestByPlayerId.get(candidate.playerId);
      if (!current || candidate.distanceKm < current.distanceKm) {
        nearestByPlayerId.set(candidate.playerId, candidate);
      }
    });
  });

  const safeLimit = Number.isInteger(limit) && limit >= 0 ? limit : REQUIRED_SQUAD_SIZE;
  return [...nearestByPlayerId.values()]
    .sort((a, b) => a.distanceKm - b.distanceKm || a.order - b.order || a.playerId.localeCompare(b.playerId))
    .slice(0, safeLimit);
}

// Offentlige startsteder kommer bare fra den versjonerte History Go-stedslisten
// og må også finnes i unlock-katalogen. UI-et tilbyr aldri fritekst eller adresse.
function getPublicStartPlaces() {
  const knownHistoryGoPlaceIds = new Set(
    (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [])
      .map((place) => place?.placeId)
      .filter(Boolean)
  );

  return (Array.isArray(state.placeLocations?.places) ? state.placeLocations.places : [])
    .filter((place) =>
      place &&
      knownHistoryGoPlaceIds.has(place.placeId) &&
      typeof place.placeName === "string" &&
      place.placeName.trim() &&
      isValidLatitude(place.latitude) &&
      isValidLongitude(place.longitude)
    )
    .map((place) => ({
      placeId: place.placeId,
      placeName: place.placeName.trim(),
      latitude: place.latitude,
      longitude: place.longitude
    }))
    .sort((a, b) => a.placeName.localeCompare(b.placeName, "nb"));
}

function activateLocalStartSquad(startLocation, startSource = {}) {
  if (!isValidLatitude(startLocation?.latitude) || !isValidLongitude(startLocation?.longitude)) {
    state.localStartMessage = "Kunne ikke starte lokalt fordi posisjonen har ugyldige koordinater.";
    renderApp();
    return;
  }

  if (!state.teamMerits) {
    state.localStartMessage = "Kunne ikke starte lokalt fordi lagprogresjonen ikke er tilgjengelig.";
    renderApp();
    return;
  }

  const candidates = getNearestLocalStartPlayers({
    players: state.players,
    placeUnlocks: state.unlocks?.placeUnlocks,
    placeLocations: state.placeLocations,
    startLocation,
    limit: REQUIRED_SQUAD_SIZE
  });

  if (!candidates.length) {
    state.localStartMessage = "Fant ingen kvalifiserte spillere ved koordinatfestede fotballsteder.";
    renderApp();
    return;
  }

  const isPublicPlaceStart = startSource.source === "chosen_place";
  state.teamMerits.localStart = normalizeLocalStart({
    enabled: true,
    source: isPublicPlaceStart ? "chosen_place" : "current_location",
    latitude: startLocation.latitude,
    longitude: startLocation.longitude,
    chosenPlaceId: isPublicPlaceStart ? startSource.chosenPlaceId : null,
    chosenPlaceName: isPublicPlaceStart ? startSource.chosenPlaceName : null,
    playerIds: candidates.map((candidate) => candidate.playerId),
    createdAt: new Date().toISOString()
  });
  state.localStartMessage = "";
  saveTeamMerits();
  invalidateAvailability();
  sanitizeLineupForUnlockedPlayers();
  renderApp();
}

function clearLocalStartSquad() {
  if (!state.teamMerits) {
    return;
  }
  state.teamMerits.localStart = normalizeLocalStart(null);
  state.localStartMessage = "";
  saveTeamMerits();
  invalidateAvailability();
  sanitizeLineupForUnlockedPlayers();
  sanitizeSelectedFormation();
  renderApp();
}

// ----------------------------------------------------------------------------
// Availability-snapshot (runtime source of truth)
// Én samlet beregning av hva manageren har tilgang til akkurat nå:
//   - opplåste place-id-er, med eksplisitt kilde (ekte History Go-progresjon
//     vs. lokal manager-/demostate i hgfm.teamMerits.v1)
//   - tilgjengelige spillere og stab (football_unlocks.json placeId -> targetId)
//   - ulåste/låste historiske formasjoner (unlockRules.json + unlockLinks)
//   - roster readiness (15-spillerkravet)
// Prinsipp: History Go er det brukeren samler; HG Football Manager er det
// brukeren kan bruke basert på samlingen. All annen kode leser denne
// beregningen via getAvailability()/de tynne getterne under – ingen parallelle
// unlocklesere.
// ----------------------------------------------------------------------------

// Formasjonstier som gir grunntilgang uten samlede kilder, slik at manageren
// alltid har noen startsystemer å bygge med (unlockRules.json: start/early).
const FORMATION_BASELINE_TIERS = new Set(["start", "early"]);

// Memoisert snapshot. Invalidieres ved hver renderApp og i mutasjoner som
// trenger fersk beregning før neste render (reset/sync/formasjonssanering).
let availabilityCache = null;

function invalidateAvailability() {
  availabilityCache = null;
}

function getAvailability() {
  if (!availabilityCache) {
    availabilityCache = computeAvailability();
  }
  return availabilityCache;
}

// Selve beregningen. Leser kun rå kilder (state + History Go-localStorage) og
// kaller aldri de tynne getterne under – ingen rekursjon.
function computeAvailability() {
  // 1) Steder. Ekte History Go-progresjon leses live; manager-/demostate ligger
  // i hgfm.teamMerits.v1 (seedet fra example-filen og tidligere merges).
  const historyGoPlaceIds = getHistoryGoCollectedSportPlaceIds();
  const meritPlaceIds = new Set(
    (Array.isArray(state.teamMerits?.unlockedPlaceIds) ? state.teamMerits.unlockedPlaceIds : []).filter(
      (placeId) => typeof placeId === "string" && placeId
    )
  );
  const unlockedPlaceIds = new Set([...meritPlaceIds, ...historyGoPlaceIds]);

  // Eksplisitt kildeskille: et sted regnes som "history-go" når det ligger i
  // History Go-progresjonen akkurat nå, ellers "manager" (demo-/seed-/lagstate).
  // Skillet gjør det mulig å håndheve produksjonsprinsippet (kun samlet History
  // Go-innhold) senere, uten å fjerne demo-støtten nå.
  const placeSourceById = new Map();
  unlockedPlaceIds.forEach((placeId) => {
    placeSourceById.set(placeId, historyGoPlaceIds.has(placeId) ? "history-go" : "manager");
  });

  // 2) placeUnlocks (football_unlocks.json) filtrert på opplåste steder.
  const allPlaceUnlocks = Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [];
  const placeUnlocks = allPlaceUnlocks.filter((place) => place && unlockedPlaceIds.has(place.placeId));

  // 3) Spillere og stab via konkrete placeId -> targetId-unlocks. Ukjente
  // spiller-id-er ignoreres med console.warn. Finnes ingen player-unlocks,
  // er listen tom – det faller aldri tilbake til alle spillere.
  const unlockedPlayerIds = new Set();
  const playerSourceById = new Map();
  const explicitStaffIds = new Set();
  placeUnlocks.forEach((place) => {
    (Array.isArray(place.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (!unlock || !unlock.targetId) {
        return;
      }
      if (isPlayerUnlockType(unlock.type)) {
        unlockedPlayerIds.add(unlock.targetId);
        const sources = playerSourceById.get(unlock.targetId) || { placeIds: new Set(), localStart: false };
        sources.placeIds.add(place.placeId);
        playerSourceById.set(unlock.targetId, sources);
      } else if (isStaffUnlockType(unlock.type)) {
        explicitStaffIds.add(unlock.targetId);
      }
    });
  });

  // Lokal start utvider bare spillerpoolen. Den åpner ingen steder og skriver
  // aldri til History Go-progresjonen (visited_places/groundhopper-state).
  getLocalStartPlayerIds().forEach((playerId) => {
    unlockedPlayerIds.add(playerId);
    const sources = playerSourceById.get(playerId) || { placeIds: new Set(), localStart: false };
    sources.localStart = true;
    playerSourceById.set(playerId, sources);
  });

  const players = Array.isArray(state.players) ? state.players : [];
  const playersById = new Map(players.filter((player) => player && player.id).map((player) => [player.id, player]));
  const unlockedPlayers = [];
  unlockedPlayerIds.forEach((playerId) => {
    const player = playersById.get(playerId);
    if (player) {
      unlockedPlayers.push(player);
    } else {
      console.warn(`Spiller-unlock peker på ukjent spiller-id: ${playerId} (ignoreres).`);
      unlockedPlayerIds.delete(playerId);
    }
  });

  const staff = Array.isArray(state.staff) ? state.staff : [];
  const unlockedStaff = staff.filter((member) => {
    if (!member || !member.id) {
      return false;
    }
    const sources = Array.isArray(member.sourcePlaceIds) ? member.sourcePlaceIds : [];
    return sources.some((placeId) => unlockedPlaceIds.has(placeId)) || explicitStaffIds.has(member.id);
  });

  // 4) Formasjonstilgjengelighet: unlockRules.json + formation.unlockLinks
  // vurdert mot samlingen (steder, spillere, stab, badges).
  const collectedPools = {
    unlockedPlaceIds,
    unlockedPlayerIds,
    unlockedStaffIds: new Set(unlockedStaff.map((member) => member.id)),
    earnedBadgeIds: new Set(Array.isArray(state.teamMerits?.earnedBadgeIds) ? state.teamMerits.earnedBadgeIds : [])
  };

  const unlockedFormations = [];
  const lockedFormations = [];
  const formationStatusById = new Map();
  (Array.isArray(state.formations) ? state.formations : []).forEach((formation) => {
    const status = evaluateFormationUnlock(formation, collectedPools);
    formationStatusById.set(formation.id, status);
    (status.unlocked ? unlockedFormations : lockedFormations).push(formation);
  });

  // 5) Roster readiness (15-spillerkravet) fra opplåste spillere + lineup.
  const rosterReadiness = computeRosterReadiness(unlockedPlayers);

  return {
    historyGoPlaceIds,
    managerPlaceIds: new Set([...unlockedPlaceIds].filter((placeId) => !historyGoPlaceIds.has(placeId))),
    unlockedPlaceIds,
    placeSourceById,
    placeUnlocks,
    unlockedPlayers,
    unlockedPlayerIds,
    playerSourceById,
    unlockedStaff,
    unlockedStaffIds: collectedPools.unlockedStaffIds,
    unlockedFormations,
    lockedFormations,
    formationStatusById,
    rosterReadiness
  };
}

// Ett unlock-krav ({ sourceType, ref?, theme? }) mot samlede kilder. Krav uten
// konkret ref (kun tema, slik reglene i unlockRules.json er skrevet i dag) kan
// ikke verifiseres mot samlingen ennå og regnes som ikke oppfylt –
// grunntilgangstierne sørger for at manageren likevel har systemer å spille med.
function isUnlockRequirementSatisfied(requirement, pools) {
  if (!requirement || typeof requirement !== "object") {
    return false;
  }

  const ref = typeof requirement.ref === "string" ? requirement.ref : "";

  // Eksplisitt startmarkør i formations.json (history_go_place/starting_unlock).
  if (ref === "starting_unlock") {
    return true;
  }

  if (!ref) {
    return false;
  }

  switch (requirement.sourceType) {
    case "history_go_place":
    case "sport_place":
    case "football_stadium":
    case "football_club":
    case "groundhopper_place":
      return pools.unlockedPlaceIds.has(ref);
    case "collected_player":
      return pools.unlockedPlayerIds.has(ref);
    case "collected_manager":
    case "collected_staff":
      return pools.unlockedStaffIds.has(ref);
    case "football_badge":
      return pools.earnedBadgeIds.has(ref);
    default:
      // football_story/football_lexicon_entry har ingen samle-/progresjonskilde
      // i denne appen ennå.
      return false;
  }
}

// anyOf/allOf-klausuler fra unlockRules.json. allOf må være komplett oppfylt;
// anyOf trenger minst ett treff. Tom/manglende requires gir ingen åpning her.
function isUnlockRequiresSatisfied(requires, pools) {
  if (!requires || typeof requires !== "object") {
    return false;
  }

  const allOf = Array.isArray(requires.allOf) ? requires.allOf : [];
  const anyOf = Array.isArray(requires.anyOf) ? requires.anyOf : [];

  if (!allOf.length && !anyOf.length) {
    return false;
  }

  const allSatisfied = allOf.every((requirement) => isUnlockRequirementSatisfied(requirement, pools));
  const anySatisfied = !anyOf.length || anyOf.some((requirement) => isUnlockRequirementSatisfied(requirement, pools));

  return allSatisfied && anySatisfied;
}

// Første konkrete krav (med ref) som er oppfylt i en requires-klausul. Brukes
// kun til "Ulåst via …"-forklaring i UI – selve unlock-avgjørelsen tas over.
function findSatisfiedUnlockRequirement(requires, pools) {
  const allOf = Array.isArray(requires?.allOf) ? requires.allOf : [];
  const anyOf = Array.isArray(requires?.anyOf) ? requires.anyOf : [];
  return (
    [...allOf, ...anyOf].find(
      (requirement) => requirement?.ref && isUnlockRequirementSatisfied(requirement, pools)
    ) || null
  );
}

// Formasjonsstatus: { unlocked, tier, reason, satisfiedBy }. Unlock handler om
// tilgang/kunnskap/samlekilde – aldri om kvalitet. Alle formasjoner blir stående
// i det historiske formasjonsbiblioteket uansett status. satisfiedBy er det
// konkrete kravet (sted/spiller/stab/badge) som åpnet systemet, til UI-visning.
function evaluateFormationUnlock(formation, pools) {
  if (!formation || !formation.id) {
    return { unlocked: true, tier: null, reason: "Ukjent formasjon – behandles som åpen.", satisfiedBy: null };
  }

  const rules = Array.isArray(state.hgUnlockRules?.rules) ? state.hgUnlockRules.rules : [];
  const rule =
    rules.find((item) => item && item.appliesTo === "formation" && item.formationId === formation.id) || null;
  const tier = rule?.tier || null;
  const links = Array.isArray(formation.unlockLinks) ? formation.unlockLinks : [];

  // Grunntilgang: start-/early-tier er managerens basissystemer.
  if (tier && FORMATION_BASELINE_TIERS.has(tier)) {
    return { unlocked: true, tier, reason: "Grunntilgang (start-/tidligformasjon).", satisfiedBy: null };
  }

  // Ingen registrert regel og ingen unlockLinks: ingen kjent låsekilde.
  if (!rule && !links.length) {
    return { unlocked: true, tier, reason: "Ingen opplåsingsregel registrert – åpen.", satisfiedBy: null };
  }

  if (rule && isUnlockRequiresSatisfied(rule.requires, pools)) {
    return {
      unlocked: true,
      tier,
      reason: "Låst opp via History Go-samling (unlock-regel).",
      satisfiedBy: findSatisfiedUnlockRequirement(rule.requires, pools)
    };
  }

  const satisfiedLink = links.find((link) => isUnlockRequirementSatisfied(link, pools));
  if (satisfiedLink) {
    return {
      unlocked: true,
      tier,
      reason: "Låst opp via History Go-samling (unlock-kobling).",
      satisfiedBy: satisfiedLink.ref ? satisfiedLink : null
    };
  }

  return { unlocked: false, tier, reason: buildFormationUnlockNote(formation), satisfiedBy: null };
}

// Roster readiness (15-spillerkravet): 11 i startelleveren + minst 4 på benken.
// Startere telles fra state.lineup (playerId); benk er øvrige opplåste spillere.
function computeRosterReadiness(unlockedPlayers) {
  const lineupPlayerIds = new Set(
    Object.values(state.lineup || {})
      .map((slotState) => slotState && slotState.playerId)
      .filter(Boolean)
  );

  const starters = unlockedPlayers.filter((player) => lineupPlayerIds.has(player.id));
  const benchCandidates = unlockedPlayers.filter((player) => !lineupPlayerIds.has(player.id));

  const unlockedCount = unlockedPlayers.length;
  const starterCount = starters.length;
  const benchCount = benchCandidates.length;
  const hasEnoughUnlocked = unlockedCount >= REQUIRED_SQUAD_SIZE;
  const hasCompleteXi = starterCount >= REQUIRED_STARTERS;
  const hasEnoughBench = benchCount >= REQUIRED_BENCH;

  return {
    starters,
    benchCandidates,
    unlockedCount,
    starterCount,
    benchCount,
    hasEnoughUnlocked,
    hasCompleteXi,
    hasEnoughBench,
    isReady: hasEnoughUnlocked && hasCompleteXi && hasEnoughBench,
    missingUnlocked: Math.max(0, REQUIRED_SQUAD_SIZE - unlockedCount),
    missingStarters: Math.max(0, REQUIRED_STARTERS - starterCount),
    missingBench: Math.max(0, REQUIRED_BENCH - benchCount)
  };
}

// Felles refresh ved History Go-progresjon (manuell synk-knapp, updateProfile i
// samme vindu, storage-event fra andre vinduer): merge nye steder inn i team
// merits, recompute availability og saner lineup/valgt formasjon før rerender.
function refreshAvailabilityFromHistoryGo() {
  if (state.teamMerits) {
    syncUnlockedPlacesFromHistoryGo();
    recomputeActiveClassifications();
    saveTeamMerits();
  }

  invalidateAvailability();
  sanitizeLineupForUnlockedPlayers();
  sanitizeSelectedFormation();
  renderApp();
}

// ----------------------------------------------------------------------------
// Tynne gettere over availability-snapshotet. Resten av appen bruker disse;
// ingen andre steder skal beregne unlocks selv.
// ----------------------------------------------------------------------------

// Opplåste steder som Set (teamMerits + ekte History Go-progresjon).
function getUnlockedPlaceIds() {
  return getAvailability().unlockedPlaceIds;
}

// placeUnlocks filtrert på opplåste steder.
function getPlaceUnlocks() {
  return getAvailability().placeUnlocks;
}

// Stab som er tilgjengelig: kommer fra et opplåst sted (sourcePlaceIds) eller er
// eksplisitt låst opp gjennom football_unlocks.json.
function getUnlockedStaff() {
  return getAvailability().unlockedStaff;
}

// Opplåste spillere: ekte spillere fra state.players som er pekt på av et
// player_candidate-unlock på et opplåst sted.
function getUnlockedPlayers() {
  return getAvailability().unlockedPlayers;
}

// Er en formasjon tilgjengelig som aktiv managerformasjon?
function isFormationUnlocked(formationId) {
  if (!formationId) {
    return false;
  }
  const status = getAvailability().formationStatusById.get(formationId);
  return status ? status.unlocked : true;
}

// Er en spiller låst opp (kan velges)?
function isPlayerUnlocked(playerId) {
  if (!playerId) {
    return false;
  }
  return getUnlockedPlayers().some((player) => player.id === playerId);
}

// Kilder for en opplåst spiller. Leser playerSourceById fra availability slik
// at lokal start kan vises uten å late som spillerens sted er samlet.
function getPlayerSourcePlaces(playerId) {
  if (!playerId) {
    return [];
  }

  const snapshot = getAvailability();
  const sources = snapshot.playerSourceById.get(playerId);
  if (!sources) {
    return [];
  }

  const placeById = new Map(snapshot.placeUnlocks.map((place) => [place.placeId, place]));
  const result = [...sources.placeIds].map((placeId) => {
    const place = placeById.get(placeId);
    return { placeId, placeName: place?.placeName || placeId, source: snapshot.placeSourceById.get(placeId) };
  });
  if (sources.localStart) {
    result.push({ placeId: null, placeName: "Lokal starttropp", source: "local_start" });
  }
  return result;
}

// ----------------------------------------------------------------------------
// Lesbare unlock-forklaringer (kun visning)
// Oversetter tekniske unlock-typer/-id-er til navn spilleren kjenner igjen.
// Leser eksisterende kataloger (players/staff/expertise/programs) og availability-
// snapshotet – beregner aldri egne unlocks.
// ----------------------------------------------------------------------------

// Norske etiketter for unlock-typene i football_unlocks.json.
const UNLOCK_TYPE_LABELS = {
  player_candidate: "Spiller",
  head_coach_candidate: "Trenerkandidat",
  staff_candidate: "Stab",
  expertise: "Ekspertise",
  training_program: "Treningsprogram",
  training_model: "Treningsmodell"
};

// Lesbar tekst for ett place-unlock: "Spiller: Martin Ødegaard" i stedet for
// "player_candidate: martin_odegaard". Faller tilbake til formatert id.
function describeUnlockTarget(unlock) {
  const typeLabel = UNLOCK_TYPE_LABELS[unlock?.type] || formatTagText(unlock?.type || "ukjent");
  const targetId = unlock?.targetId || "";

  let name = null;
  if (isPlayerUnlockType(unlock?.type)) {
    name = (Array.isArray(state.players) ? state.players : []).find((player) => player?.id === targetId)?.name;
  } else if (isStaffUnlockType(unlock?.type)) {
    name = (Array.isArray(state.staff) ? state.staff : []).find((member) => member?.id === targetId)?.name;
  } else if (unlock?.type === "expertise") {
    name = (Array.isArray(state.expertise) ? state.expertise : []).find((item) => item?.id === targetId)?.name;
  } else if (unlock?.type === "training_program") {
    name = (Array.isArray(state.trainingPrograms) ? state.trainingPrograms : []).find(
      (program) => program?.id === targetId
    )?.name;
  }

  return `${typeLabel}: ${name || formatTagText(targetId)}`;
}

// Historiske formasjoner som peker på et sted i sine unlock-krav (unlockRules
// eller unlockLinks med ref === placeId). Kun visning: forklarer "dette stedet
// åpner system X" i stedskort og stedsrapporter.
function getFormationsLinkedToPlace(placeId) {
  if (!placeId) {
    return [];
  }

  const rules = Array.isArray(state.hgUnlockRules?.rules) ? state.hgUnlockRules.rules : [];
  const refersToPlace = (requirement) => requirement?.ref === placeId;

  return (Array.isArray(state.formations) ? state.formations : []).filter((formation) => {
    const rule = rules.find((item) => item?.appliesTo === "formation" && item.formationId === formation.id);
    const ruleRefs = [
      ...(Array.isArray(rule?.requires?.anyOf) ? rule.requires.anyOf : []),
      ...(Array.isArray(rule?.requires?.allOf) ? rule.requires.allOf : [])
    ];
    const links = Array.isArray(formation.unlockLinks) ? formation.unlockLinks : [];
    return ruleRefs.some(refersToPlace) || links.some(refersToPlace);
  });
}

// ----------------------------------------------------------------------------
// Stedsrapporter (v1)
// Rent forklarings-/UI-lag. Kobler hvert sportsted til en lesbar rapport om hva
// stedet gir manageren (spillere, stab, ekspertise, trening, identitet).
// Leser unlock-data, men endrer den ikke. Ingen fit-/badgeeffektmotor-effekt.
// ----------------------------------------------------------------------------

// Finn en stedsrapport på placeId.
function getPlaceReport(placeId) {
  if (!placeId) {
    return null;
  }
  const reports = Array.isArray(state.placeReports?.placeReports)
    ? state.placeReports.placeReports
    : [];
  return reports.find((report) => report && report.placeId === placeId) || null;
}

// Lite oppsummeringsobjekt med antall unlocks per kategori for ett sted. Leser
// rå placeUnlocks (ufiltrert) slik at telleverket gjelder selve stedet.
function getPlaceReportUnlockSummary(placeId) {
  const summary = { players: 0, staff: 0, expertise: 0, training: 0 };
  if (!placeId) {
    return summary;
  }

  const placeUnlocks = Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [];
  const place = placeUnlocks.find((entry) => entry && entry.placeId === placeId);
  if (!place) {
    return summary;
  }

  (Array.isArray(place.unlocks) ? place.unlocks : []).forEach((unlock) => {
    if (!unlock || !unlock.type) {
      return;
    }
    if (isPlayerUnlockType(unlock.type)) {
      summary.players += 1;
    } else if (isStaffUnlockType(unlock.type)) {
      summary.staff += 1;
    } else if (unlock.type === "expertise") {
      summary.expertise += 1;
    } else if (unlock.type === "training_program" || unlock.type === "training_model") {
      summary.training += 1;
    }
  });

  return summary;
}

// Rapporter for aktive/samlede steder (via getPlaceUnlocks()). Mangler en rapport
// for et opplåst sted, bygges en enkel fallback fra selve placeUnlock-objektet.
function getUnlockedPlaceReports() {
  return getPlaceUnlocks().map((place) => {
    const report = getPlaceReport(place.placeId);
    if (report) {
      return report;
    }
    return {
      placeId: place.placeId,
      title: place.placeName || place.placeId,
      summary: "Ingen detaljert stedsrapport tilgjengelig ennå for dette stedet.",
      managerValue: "",
      unlocksExplanation: {},
      recommendedUse: [],
      helpsBuildClassifications: [],
      warning: ""
    };
  });
}

// Slå opp et lesbart navn for en lagklasse-id. Faller tilbake til id-en selv.
function getClassificationName(classificationId) {
  const classifications = Array.isArray(state.teamClassifications?.classifications)
    ? state.teamClassifications.classifications
    : [];
  const match = classifications.find((entry) => entry && entry.id === classificationId);
  return match?.name || classificationId;
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

// ----------------------------------------------------------------------------
// Lagidentitet (v1)
// Forklarings- og planleggingslag oppå badges/lagklasser: hvilke identiteter
// laget har, hvilke det nesten har, og hva som mangler (badges, treningsprogram,
// steder, spillere og stab). Rene helpers – ingen fit-/kampmotor-, badgeeffekt-
// eller unlock-effekt.
// ----------------------------------------------------------------------------

// Lesbart navn for en badgefamilie ut fra trainingBadges. Fallback til id-en.
function getBadgeFamilyName(familyId) {
  const families = Array.isArray(state.trainingBadges?.badgeFamilies)
    ? state.trainingBadges.badgeFamilies
    : [];
  const match = families.find((family) => family && family.id === familyId);
  return match?.name || familyId;
}

// Lesbar etikett for et badge-nivå (bronze/silver/gold/none). Fallback til verdien.
function getBadgeLevelLabel(level) {
  return BADGE_LEVEL_LABELS[level] || level;
}

// Høyeste opptjente nivå i en badgefamilie ut fra earnedBadgeIds. Returnerer
// { level: "none", rank: 0, badge: null } når ingenting er opptjent, ellers
// bronze/silver/gold med rank 1/2/3 og selve badgeobjektet.
function getBadgeFamilyCurrentLevel(familyId) {
  let best = { level: "none", rank: 0, badge: null };
  getEarnedBadges().forEach((badge) => {
    if (badge.familyId !== familyId) {
      return;
    }
    const rank = BADGE_LEVEL_ORDER[badge.level] || 0;
    if (rank > best.rank) {
      best = { level: badge.level, rank, badge };
    }
  });
  return best;
}

// Progresjon mot én lagklasse: hvert badgekrav med nåværende/krevd nivå, hvor
// mange krav som er møtt, om identiteten er oppnådd, og hvilke krav som mangler.
function getClassificationProgress(classification) {
  const required = Array.isArray(classification?.requiresBadges) ? classification.requiresBadges : [];

  const requirements = required.map((req) => {
    const familyId = req?.familyId;
    const minimumLevel = req?.minimumLevel;
    const requiredRank = BADGE_LEVEL_ORDER[minimumLevel] || 0;
    const current = getBadgeFamilyCurrentLevel(familyId);
    return {
      familyId,
      familyName: getBadgeFamilyName(familyId),
      minimumLevel,
      minimumLevelLabel: getBadgeLevelLabel(minimumLevel),
      currentLevel: current.level,
      currentLevelLabel: getBadgeLevelLabel(current.level),
      currentRank: current.rank,
      requiredRank,
      completed: current.rank >= requiredRank
    };
  });

  const totalRequirements = requirements.length;
  const completedRequirements = requirements.filter((req) => req.completed).length;
  const progressRatio = totalRequirements > 0 ? completedRequirements / totalRequirements : 0;
  const isUnlocked = totalRequirements > 0 && completedRequirements === totalRequirements;
  const missingRequirements = requirements.filter((req) => !req.completed);

  return {
    classification,
    requirements,
    completedRequirements,
    totalRequirements,
    progressRatio,
    isUnlocked,
    missingRequirements
  };
}

// Alle lagklasser med progresjon, sortert: oppnådde først, deretter nesten
// ferdige (høyest andel oppfylte krav), deretter resten (stabilt på navn).
function getTeamIdentityProgress() {
  const classifications = Array.isArray(state.teamClassifications?.classifications)
    ? state.teamClassifications.classifications
    : [];

  return classifications
    .filter((classification) => classification && classification.id)
    .map((classification) => getClassificationProgress(classification))
    .sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      if (b.progressRatio !== a.progressRatio) {
        return b.progressRatio - a.progressRatio;
      }
      const aName = a.classification.name || a.classification.id || "";
      const bName = b.classification.name || b.classification.id || "";
      return aName.localeCompare(bName);
    });
}

// Treningsprogrammer som bygger en gitt badgefamilie (program.badgeFamilyId).
function getTrainingProgramsForBadgeFamily(familyId) {
  if (!familyId) {
    return [];
  }
  const programs = Array.isArray(state.trainingPrograms) ? state.trainingPrograms : [];
  return programs.filter((program) => program && program.badgeFamilyId === familyId);
}

// Steder som kan hjelpe en badgefamilie: finn programmene for familien, hvilke
// ekspertise-id-er de krever, og hvilke steder i football_unlocks.json som låser
// opp disse ekspertisene eller selve treningsprogrammene. Returnerer unike
// { placeId, placeName }. Leser rå placeUnlocks (alle steder), ikke bare opplåste.
function getPlacesForBadgeFamily(familyId) {
  if (!familyId) {
    return [];
  }

  const programs = getTrainingProgramsForBadgeFamily(familyId);
  const expertiseIds = new Set();
  const programIds = new Set();
  programs.forEach((program) => {
    if (program.id) {
      programIds.add(program.id);
    }
    (Array.isArray(program.requiresExpertiseIds) ? program.requiresExpertiseIds : []).forEach((id) =>
      expertiseIds.add(id)
    );
  });

  const placeUnlocks = Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [];
  const result = [];
  const seen = new Set();

  placeUnlocks.forEach((place) => {
    if (!place || !place.placeId || seen.has(place.placeId)) {
      return;
    }
    const helps = (Array.isArray(place.unlocks) ? place.unlocks : []).some((unlock) => {
      if (!unlock || !unlock.targetId) {
        return false;
      }
      if (unlock.type === "expertise" && expertiseIds.has(unlock.targetId)) {
        return true;
      }
      return unlock.type === "training_program" && programIds.has(unlock.targetId);
    });
    if (helps) {
      seen.add(place.placeId);
      result.push({ placeId: place.placeId, placeName: place.placeName || place.placeId });
    }
  });

  return result;
}

// Hjelper: har en spiller minst én av verdiene i et listefelt?
function playerFieldIncludesAny(player, field, values) {
  const list = Array.isArray(player?.[field]) ? player[field] : [];
  return values.some((value) => list.includes(value));
}

// Opplåste spillere som passer en lagidentitet. Enkel v1-mapping i kode:
// matcher på likesTactics/strengths/archetypes/era/kilde. Filtrert til
// getUnlockedPlayers() og begrenset til maks 5. Ren visning – ingen kampeffekt.
function getRelevantPlayersForClassification(classificationId) {
  const matchers = {
    transition_team: (p) => playerFieldIncludesAny(p, "likesTactics", ["fast_transitions", "vertical_play", "direct_counter"]),
    pressing_team: (p) =>
      playerFieldIncludesAny(p, "likesTactics", ["high_press"]) ||
      playerFieldIncludesAny(p, "strengths", ["pressing", "pressing_intelligence"]) ||
      playerFieldIncludesAny(p, "archetypes", ["pressing_intelligence"]),
    control_team: (p) => playerFieldIncludesAny(p, "likesTactics", ["possession", "structured_build_up", "central_control"]),
    wide_dominant_team: (p) => playerFieldIncludesAny(p, "likesTactics", ["wide_attack", "isolate_wingers"]),
    defensive_structure_team: (p) => playerFieldIncludesAny(p, "likesTactics", ["compact_shape", "low_block", "medium_press"]),
    set_piece_team: (p) =>
      playerFieldIncludesAny(p, "strengths", ["heading", "duels", "box_presence"]) ||
      playerFieldIncludesAny(p, "archetypes", ["box_presence"]),
    development_team: (p) =>
      p?.era === "modern" || (Array.isArray(p?.sourcePlaceIds) && p.sourcePlaceIds.includes("ekebergsletta"))
  };

  const matcher = matchers[classificationId];
  if (!matcher) {
    return [];
  }
  return getUnlockedPlayers().filter(matcher).slice(0, 5);
}

// Tilgjengelig stab som passer en lagidentitet. Enkel v1-mapping på ekspertise.
// Filtrert til getUnlockedStaff() (tilgjengelig/engasjert stab) og maks 5.
function getRelevantStaffForClassification(classificationId) {
  const expertiseByClassification = {
    development_team: ["development_culture", "club_building"],
    pressing_team: ["pressing_structure", "team_organisation"],
    defensive_structure_team: ["defensive_structure", "rest_defense", "team_organisation"],
    control_team: ["passing_training", "build_up_play", "team_organisation"],
    transition_team: ["speed_training", "physical_preparation", "depth_runs"],
    wide_dominant_team: ["wide_attack", "chance_creation"],
    set_piece_team: ["set_piece_attack", "set_piece_defense", "duel_training"]
  };

  const wanted = expertiseByClassification[classificationId];
  if (!Array.isArray(wanted)) {
    return [];
  }
  const wantedSet = new Set(wanted);

  return getUnlockedStaff()
    .filter((member) => {
      const expertiseIds = Array.isArray(member.expertiseIds) ? member.expertiseIds : [];
      return expertiseIds.some((id) => wantedSet.has(id));
    })
    .slice(0, 5);
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

  // Respekter staffRoles.maxActive der mappingen er sikker. Usikker mapping
  // (ukjent kategori eller manglende staffRole) blokkerer ikke – da er det bedre
  // å advare enn å hindre engasjement i prototypen.
  if (!canHireWithinStaffLimits(member)) {
    return;
  }

  state.teamMerits.hiredStaffIds.push(staffId);
  saveTeamMerits();
  renderApp();
}

// Sjekk om en ny ansatt holder seg innenfor staffRoles.maxActive for sin
// kategori. Returnerer true (tillat) ved usikker mapping. Keepertrener og
// "tidligere keeper"-keepertrener deler kategori, så grensen gjelder begge.
function canHireWithinStaffLimits(member) {
  const category = getStaffCategory(member);
  if (!category) {
    return true;
  }

  const staffRole = (Array.isArray(state.hgStaffRoles) ? state.hgStaffRoles : []).find(
    (role) => role && role.id === category
  );
  const maxActive = staffRole && Number.isInteger(staffRole.maxActive) ? staffRole.maxActive : null;
  if (!maxActive) {
    return true;
  }

  const currentInCategory = getHiredStaff().filter((hired) => getStaffCategory(hired) === category).length;
  if (currentInCategory >= maxActive) {
    console.warn(
      `hireStaff: ${staffRole.name || category} er allerede engasjert med maks ${maxActive}. Ny ansettelse blokkeres.`
    );
    return false;
  }

  return true;
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

  // Formasjonstilvenning vokser sakte med treningsuker, raskere med god
  // læringsfart/stab. Lagres per formationId og brukes som grunnlag av
  // coachContext-motoren. Aldri en hard avhengighet: progresjonen skal aldri
  // knekke uken om coachContext/formasjon mangler.
  try {
    const formation = getFormation();
    if (formation && formation.id) {
      if (!merits.formationFamiliarity || typeof merits.formationFamiliarity !== "object") {
        merits.formationFamiliarity = {};
      }
      const coachContext = getCoachContext();
      const stored = merits.formationFamiliarity[formation.id];
      // Start fra dynamisk staff-verdi første gang, deretter fra lagret verdi.
      const current = Number.isFinite(stored) ? stored : Number(coachContext.formationFamiliarity) || 45;
      const learn = Math.max(0, Math.min(100, Number(coachContext.tacticalLearningSpeed) || 0));
      // +1 til +4 per uke basert på taktisk læringsfart.
      const gain = 1 + Math.round((learn / 100) * 3);
      merits.formationFamiliarity[formation.id] = Math.max(0, Math.min(100, Math.round(current + gain)));
    }
  } catch (error) {
    // Progresjon er valgfri tilleggsverdi; en feil her skal ikke stoppe uken.
  }

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

  // Ekte spiller-id-er og arketype-id-er for å validere player_candidate-unlocks.
  const playerIds = new Set(
    (Array.isArray(state.players) ? state.players : []).map((player) => player && player.id).filter(Boolean)
  );
  const archetypeIds = new Set(
    (Array.isArray(state.playerArchetypes) ? state.playerArchetypes : [])
      .map((archetype) => archetype && archetype.id)
      .filter(Boolean)
  );

  placeUnlocks.forEach((place) => {
    if (typeof place?.placeId !== "string" || !place.placeId) {
      warnings.push("Et placeUnlock mangler gyldig placeId (streng).");
    }

    (Array.isArray(place?.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (!unlock || !isPlayerUnlockType(unlock.type)) {
        return;
      }

      // KFUM Arena skal aldri gi spillere – den er kun trener-/ekspertise-kilde.
      if (place.placeId === "kfum_arena") {
        const message = "KFUM Arena skal ikke gi spillere.";
        warnings.push(message);
        console.warn(message);
      }

      const targetId = unlock.targetId;

      if (!targetId) {
        warnings.push(`Et player_candidate på ${place.placeId || "ukjent sted"} mangler targetId.`);
        return;
      }

      // En player_candidate skal peke på en ekte spiller-id, ikke en arketype-id.
      if (!playerIds.has(targetId)) {
        if (archetypeIds.has(targetId)) {
          const message =
            `player_candidate på ${place.placeId || "ukjent sted"} peker på arketype-id "${targetId}" ` +
            "i stedet for en ekte spiller-id fra football_players.json.";
          warnings.push(message);
          console.warn(message);
        } else {
          warnings.push(
            `player_candidate på ${place.placeId || "ukjent sted"} peker på ukjent spiller-id: ${targetId} (ignoreres).`
          );
        }
      }
    });
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

// Validerer stedsrapporter (football_place_reports.json). Rene UI-data, så feil
// gir console.warn og advarsler – aldri krasj. Sjekker at hver rapport har
// placeId som finnes i placeUnlocks, at lagklasse-id-er finnes hvis mulig, og at
// KFUM/Bislett ikke beskriver spillere som unlock (de er ikke spillerkilder).
function validatePlaceReportsData() {
  const warnings = [];
  const reports = Array.isArray(state.placeReports?.placeReports)
    ? state.placeReports.placeReports
    : [];
  const placeUnlocks = Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [];
  const placeIds = new Set(placeUnlocks.map((place) => place && place.placeId).filter(Boolean));
  const classificationIds = new Set(
    (Array.isArray(state.teamClassifications?.classifications) ? state.teamClassifications.classifications : [])
      .map((classification) => classification && classification.id)
      .filter(Boolean)
  );

  // Steder som ikke skal beskrive spillere som unlock i v1.
  const noPlayerPlaceIds = new Set(["kfum_arena", "bislett_stadion"]);

  reports.forEach((report) => {
    if (typeof report?.placeId !== "string" || !report.placeId) {
      const message = "En stedsrapport mangler gyldig placeId (streng).";
      warnings.push(message);
      console.warn(message);
      return;
    }

    if (!placeIds.has(report.placeId)) {
      const message =
        `Stedsrapport peker på placeId som ikke finnes i football_unlocks.json: ${report.placeId}.`;
      warnings.push(message);
      console.warn(message);
    }

    (Array.isArray(report.helpsBuildClassifications) ? report.helpsBuildClassifications : []).forEach((id) => {
      if (classificationIds.size > 0 && !classificationIds.has(id)) {
        const message =
          `Stedsrapport ${report.placeId} peker på ukjent lagklasse: ${id}.`;
        warnings.push(message);
        console.warn(message);
      }
    });

    // KFUM og Bislett er ikke spillerkilder – rapporten skal ikke beskrive
    // spillere som faktisk opplåsing.
    if (noPlayerPlaceIds.has(report.placeId)) {
      const summary = getPlaceReportUnlockSummary(report.placeId);
      if (summary.players > 0) {
        const message =
          `Stedsrapport ${report.placeId} skal ikke beskrive spillere som unlock, men stedet har player-unlocks.`;
        warnings.push(message);
        console.warn(message);
      }
    }
  });

  return warnings;
}

// Validerer lagklasser (football_team_classifications.json) for lagidentitet.
// Rene UI-/planleggingsdata, så feil gir console.warn og advarsler – aldri krasj.
// Sjekker at hver klasse har en id, at hvert badgekrav peker på en kjent
// badgefamilie, og at minimumLevel er bronze/silver/gold.
function validateTeamClassificationsData() {
  const warnings = [];
  const classifications = Array.isArray(state.teamClassifications?.classifications)
    ? state.teamClassifications.classifications
    : [];
  const families = Array.isArray(state.trainingBadges?.badgeFamilies) ? state.trainingBadges.badgeFamilies : [];
  const familyIds = new Set(families.map((family) => family && family.id).filter(Boolean));
  const validLevels = new Set(["bronze", "silver", "gold"]);

  classifications.forEach((classification) => {
    if (typeof classification?.id !== "string" || !classification.id) {
      const message = "En lagklasse mangler gyldig id (streng).";
      warnings.push(message);
      console.warn(message);
      return;
    }

    (Array.isArray(classification.requiresBadges) ? classification.requiresBadges : []).forEach((req) => {
      if (typeof req?.familyId !== "string" || !familyIds.has(req.familyId)) {
        const message = `Lagklasse ${classification.id} peker på ukjent badgefamilie: ${req?.familyId || "ukjent"}.`;
        warnings.push(message);
        console.warn(message);
      }
      if (!validLevels.has(req?.minimumLevel)) {
        const message = `Lagklasse ${classification.id} har ugyldig minimumLevel: ${req?.minimumLevel || "ukjent"}.`;
        warnings.push(message);
        console.warn(message);
      }
    });
  });

  return warnings;
}

function getFormation() {
  return (
    state.formations.find((formation) => formation.id === state.selectedFormationId) ||
    getAvailability().unlockedFormations[0] ||
    state.formations[0]
  );
}

function getTactic() {
  return state.tactics.find((tactic) => tactic.id === state.selectedTacticId) || state.tactics[0];
}

function getSelectedSlot() {
  const formation = getFormation();
  return formation?.slots.find((slot) => slot.slotId === state.selectedSlotId) || formation?.slots[0] || null;
}


function getStaffIdentitySummary() {
  return buildStaffIdentitySummary({
    staff: state.staff,
    expertise: state.expertise,
    unlocks: state.unlocks,
    teamMerits: state.teamMerits,
    hiredStaff: getHiredStaff()
  });
}

// Role Familiarity Engine v1: manager-statens fortrolighetsoppslag (spiller×rolle).
function getRoleFamiliarityStore() {
  return state.teamMerits?.roleFamiliarity && typeof state.teamMerits.roleFamiliarity === "object"
    ? state.teamMerits.roleFamiliarity
    : {};
}

// Komplette spiller×rolle-par i den valgte startelleveren, med fit-status.
// Grunnlag for både fortrolighets-bonusen og registreringen etter kamp.
function getLineupRoleUsageEntries(teamFit) {
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  return assignments
    .filter((item) => item.player && item.role)
    .map((item) => ({
      playerId: item.player.id,
      roleId: item.role.id,
      status: item.fit?.status || "brukbar"
    }));
}

// Oppsummert fortrolighet for den valgte startelleveren (snitt, etablerte/ferske
// og en liten, klampet kampstyrke-bonus). Ren visning + bonus, ingen mutasjon.
function getLineupFamiliaritySummary(teamFit) {
  const pairs = getLineupRoleUsageEntries(teamFit).map(({ playerId, roleId }) => ({ playerId, roleId }));
  return summarizeLineupFamiliarity(getRoleFamiliarityStore(), pairs);
}

// Registrer den spilte startelleverens rollebruk: bygg fortrolighet ved riktig
// bruk, forvitre litt ved feilbruk. Persisteres i teamMerits (aldri i History
// Go-progresjonen). Idempotent nok: kalles én gang per fullført kamp.
function recordRoleFamiliarityFromMatch(teamFit) {
  if (!state.teamMerits) {
    return;
  }
  const entries = getLineupRoleUsageEntries(teamFit);
  if (!entries.length) {
    return;
  }
  state.teamMerits.roleFamiliarity = recordMatchRoleUsage(getRoleFamiliarityStore(), entries);
  saveTeamMerits();
}

// Bygg coachContext fra ansatt stab, staffRoles, valgt formasjon og team merits.
// Alltid gyldig og nøytral/lav selv uten ansatt stab (ingen null-krasj).
function getCoachContext() {
  return buildCoachContext({
    hiredStaff: getHiredStaff(),
    staffRoles: state.hgStaffRoles,
    formation: getFormation(),
    teamMerits: state.teamMerits
  });
}

function getTeamFit() {
  const formation = getFormation();
  const tactic = getTactic();

  if (!formation || !tactic) {
    return null;
  }

  const args = {
    lineup: state.lineup,
    formation,
    tactic,
    players: state.players,
    roles: state.roles,
    earnedBadgeIds: state.teamMerits?.earnedBadgeIds || [],
    trainingBadges: state.trainingBadges,
    coachContext: getCoachContext()
  };

  // Steg 7b: TS-motoren eier teamFit-beregningen når den er lastet. Outputen er
  // bevist byte-identisk med legacy (paritetstest over 255 caser), så alle
  // konsumenter (renderLineup/renderSidePanel/buildNextDecisions/kampdag) får
  // samme data. Uten bygget dist/ faller vi tilbake til legacy-motoren.
  const engine = getLoadedManagerEngine();
  if (engine?.calculateTeamFit) {
    return engine.calculateTeamFit(args);
  }

  return calculateTeamFit(args);
}

// ----------------------------------------------------------------------------
// Kampdag (v0.2)
// Tester det valgte HISTORISKE systemet via kampmotoren, nå som en spillbar
// sekvens: laguttak → kampplan (pre_match) → 3 formasjons-/motstanderhendelser
// → managergrep med lesbar konsekvens → summerte beslutningseffekter →
// resultat → forklarende sluttrapport. Ingen serie, tabell, sesong, livekamp,
// skader, scouting, transfer eller reaksjoner. Endrer ikke unlocks,
// spillerfilter, badgeeffektmotor, fitmotor eller KFUM/Bislett-regler.
// ----------------------------------------------------------------------------

// Gyldige sesjonsfaser. Brukes til å forkaste korrupt/ukjent session-state fra
// localStorage uten å krasje.
const MATCHDAY_SESSION_PHASES = ["pre_match", "event_1", "event_2", "event_3"];

// Minimal strukturell validering av en lagret kampsesjon. Returnerer sesjonen
// eller null — aldri en runtime-feil.
function sanitizeStoredMatchdaySession(session) {
  if (!session || typeof session !== "object" || Array.isArray(session)) {
    return null;
  }
  if (!MATCHDAY_SESSION_PHASES.includes(session.phase)) {
    return null;
  }
  if (!Array.isArray(session.events) || session.events.length === 0) {
    return null;
  }
  if (!Array.isArray(session.decisions)) {
    return null;
  }
  return session;
}

// Les kampdag-state fra localStorage. Krasjer aldri: faller tilbake til tom
// state ved manglende nøkkel, ugyldig JSON eller utilgjengelig localStorage.
// v1-lagrede kamper (kun lastMatch) leses fortsatt.
function loadMatchdayState() {
  try {
    const stored = JSON.parse(localStorage.getItem(MATCHDAY_STATE_KEY));

    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      return {
        lastMatch: stored.lastMatch || null,
        session: sanitizeStoredMatchdaySession(stored.session),
        // Sett-flagg for kamprapporten (Playable Manager Flow Polish v1.1):
        // hvilken kamp manageren sist har sett rapporten for.
        lastSeenMatchId: stored.lastSeenMatchId || null
      };
    }

    return { lastMatch: null, session: null, lastSeenMatchId: null };
  } catch (error) {
    return { lastMatch: null, session: null, lastSeenMatchId: null };
  }
}

// Lagre gjeldende kampdag-state. Stille no-op hvis lagring feiler (privat modus).
function saveMatchdayState() {
  try {
    localStorage.setItem(MATCHDAY_STATE_KEY, JSON.stringify(state.matchday));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Kampklar-status: samler hvorfor laget eventuelt ikke kan spille kampdag.
// Leser kun teamFit og availability-snapshotets roster readiness – ingen ny
// motor, ingen egne unlock-beregninger. Returnerer { isReady, reasons }.
function getMatchdayReadiness(teamFit) {
  const readiness = getAvailability().rosterReadiness;
  const reasons = [];

  if (!teamFit) {
    reasons.push("Lagdata er ikke lastet ennå.");
    return { isReady: false, reasons };
  }

  const missingStarters = teamFit.totalSlots - teamFit.completeCount;
  if (missingStarters > 0) {
    reasons.push(
      `Fyll ${missingStarters} plass${missingStarters === 1 ? "" : "er"} i startelleveren (spiller og rolle).`
    );
  }

  const duplicates = Array.isArray(teamFit.duplicatePlayers) ? teamFit.duplicatePlayers : [];
  if (duplicates.length > 0) {
    reasons.push(`Samme spiller står på flere plasser: ${duplicates.map((player) => player.name).join(", ")}.`);
  }

  if (!readiness.hasEnoughBench) {
    reasons.push(`Mangler ${readiness.missingBench} benkespiller${readiness.missingBench === 1 ? "" : "e"} (krav: ${REQUIRED_BENCH}).`);
  }

  if (!readiness.hasEnoughUnlocked) {
    reasons.push(
      `Samle ${readiness.missingUnlocked} spiller${readiness.missingUnlocked === 1 ? "" : "e"} til via History Go-steder (krav: ${REQUIRED_SQUAD_SIZE} i troppen).`
    );
  }

  return { isReady: reasons.length === 0, reasons };
}

// Sørg for at matchday-state alltid har riktig form før den brukes.
function ensureMatchdayState() {
  if (!state.matchday || typeof state.matchday !== "object") {
    state.matchday = { lastMatch: null, session: null, lastSeenMatchId: null };
  }
  if (!("session" in state.matchday)) {
    state.matchday.session = null;
  }
  if (!("lastSeenMatchId" in state.matchday)) {
    state.matchday.lastSeenMatchId = null;
  }
}

// Sett-flagg for kamprapporten: en fersk kamp regnes som "ulest" til manageren
// faktisk har åpnet Kamp-flaten. Brukes av Neste handling-stripa slik at
// «Se kamprapporten» forsvinner når rapporten er sett.
function hasUnseenMatchReport() {
  const lastMatch = state.matchday?.lastMatch || null;
  if (!lastMatch) {
    return false;
  }
  return (lastMatch.id || null) !== (state.matchday?.lastSeenMatchId || null);
}

// Marker den siste kampens rapport som sett. Idempotent og persistert.
// Returnerer true hvis noe faktisk endret seg (slik at kalleren kan rerendre).
function markMatchReportSeen() {
  if (!hasUnseenMatchReport()) {
    return false;
  }
  ensureMatchdayState();
  state.matchday.lastSeenMatchId = state.matchday.lastMatch?.id || null;
  saveMatchdayState();
  return true;
}

// Formasjons-matchup mot en gitt motstander, basert på valgt formasjons
// kunnskapsoppslag (Formation Knowledge Engine). Returnerer null hvis motstander
// eller kunnskap mangler. Brukes til matchup-bevisst treningsråd og -bonus.
function getFormationMatchupVsOpponent(opponent) {
  const formation = getFormation();
  const knowledge = formation ? state.formationKnowledgeById[formation.id] : null;
  if (!opponent || !knowledge) {
    return null;
  }
  return evaluateFormationMatchupVsOpponent(knowledge, opponent.matchupStyles, opponent.name);
}

// Start kampdag: oppretter en ny kampsesjon (pre_match) med motstanderprofil,
// snapshots og 3 genererte hendelser. Selve resultatet beregnes først når alle
// managergrep er tatt (finalizeMatchdaySession).
function playMatchday() {
  const teamFit = getTeamFit();
  const formation = getFormation();

  if (!teamFit || !formation) {
    return;
  }

  ensureMatchdayState();

  // Allerede en kamp i gang: ikke start på nytt (Nullstill kamp rydder).
  if (state.matchday.session) {
    return;
  }

  // Kampdag-gating: ikke spill med ufullstendig eller ugyldig lag. Statusfeltet
  // i kampdagpanelet (renderMatchdayReadiness) forklarer hva som mangler.
  if (!getMatchdayReadiness(teamFit).isReady) {
    renderApp();
    return;
  }

  // Aktive lagklasser hvis helperen finnes (ren liten identitetsbonus i motoren).
  const activeClassifications =
    typeof getActiveTeamClassifications === "function" ? getActiveTeamClassifications() : [];

  // Mini Season v0.1 styrer motstanderen når en prøveperiode er aktiv. Uten aktiv
  // periode er dette en testkamp: velg en historisk stil-motstander
  // (læringsmotstander) i stedet for en generisk robot.
  const opponent = getMiniSeasonNextOpponent() || pickHistoricalOpponentProfile();
  const coachContext = getCoachContext();
  const trainingFocus = createTrainingMatchdaySnapshot({
    selection: state.weeklyTrainingFocus,
    clubWeek: state.clubWeekState?.week,
    coachContext,
    opponent,
    // Matchup mot denne motstanderen gjør et relevant treningsfokus litt mer verdt
    // (proaktiv kontekst). Null hvis motstander/kunnskap mangler.
    formationMatchup: getFormationMatchupVsOpponent(opponent),
    // Reaktiv kontekst: å trene det forrige kamp avslørte som svakest belønnes òg.
    lastMatchWeaknessMetric: state.matchday?.lastMatch?.exposedWeaknessMetric || null
  });

  state.matchday.session = createMatchdaySession({
    teamFit,
    formation,
    tactic: getTactic(),
    activeClassifications,
    coachContext,
    // Mini Season v0.1: aktiv prøveperiode styrer motstanderen etter den
    // lagrede planen. Uten aktiv mini-sesong (null) velger kampmotoren
    // tilfeldig motstander som før (testkamp).
    opponent,
    trainingFocus,
    // Formation Knowledge Engine: valgt formasjons kunnskapsoppslag (hvis dekket)
    // lar kampmotoren beregne formasjons-matchup mot motstanderens spillestil.
    formationKnowledge: state.formationKnowledgeById[formation?.id] || null,
    // Match Explanation v1.5: snapshot av relasjoner og off-pitch-kontekst før
    // kampen, så sluttforklaringen kan binde sammen taktikk, relasjoner, trening
    // og menneskene rundt laget.
    relationships: teamFit?.relationships || null,
    offPitchContext: buildMatchdayOffPitchSnapshot(),
    staffIdentity: getStaffIdentitySummary(),
    // Role Familiarity Engine v1: liten, klampet kampstyrke-bonus for kontinuitet
    // i rollene. Beregnet utenfor fit-motoren og matet inn additivt.
    roleFamiliarityBonus: getLineupFamiliaritySummary(teamFit).bonus
  });

  // Reservér ukas fokus til denne sesjonen med én gang. Dermed kan reload eller
  // «Nullstill kamp» aldri gi samme ukebonus til en ny kamp.
  if (trainingFocus && state.matchday.session?.id) {
    state.weeklyTrainingFocus = {
      ...state.weeklyTrainingFocus,
      appliedSessionId: state.matchday.session.id
    };
    saveWeeklyTrainingFocus();
  }

  saveMatchdayState();
  renderApp();
}

// Avspark: kampplanen er sett, gå fra pre_match til første hendelse.
function startMatchdayKickoff() {
  ensureMatchdayState();
  const session = state.matchday.session;

  if (!session || session.phase !== "pre_match") {
    return;
  }

  session.phase = "event_1";
  saveMatchdayState();
  renderApp();
}

// Ta et managergrep for gjeldende hendelse: vurder valget mot sesjonens
// snapshots, lagre beslutningen med konsekvens, og gå videre til neste
// hendelse — eller avslutt kampen og bygg sluttrapporten.
function chooseMatchdayDecision(optionId) {
  ensureMatchdayState();
  const session = state.matchday.session;
  const eventIndex = getSessionEventIndex(session);

  if (session === null || eventIndex === null) {
    return;
  }

  const event = session.events[eventIndex];
  const option = (event.options || []).find((candidate) => candidate.id === optionId);

  if (!option) {
    return;
  }

  const resolution = resolveMatchdayDecision({
    event,
    option,
    tacticalProfile: session.teamFitSnapshot?.tacticalProfile,
    matchEngineEffects: session.matchEngineEffects,
    coachSnapshot: session.coachSnapshot,
    trainingFocus: session.trainingFocus
  });

  if (!resolution) {
    return;
  }

  session.decisions.push({
    eventId: event.id,
    eventTitle: event.title,
    optionId: option.id,
    optionLabel: option.label,
    tone: resolution.tone,
    effects: resolution.effects,
    feedback: resolution.feedback,
    trainingImpact: resolution.trainingImpact
  });

  if (eventIndex + 1 < session.events.length) {
    session.phase = `event_${eventIndex + 2}`;
  } else {
    // Siste hendelse besvart: avslutt kampen og vis sluttrapporten.
    state.matchday.lastMatch = finalizeMatchdaySession(session);
    // Kampdag ↔ Club Week: merk resultatet med uka det ble spilt i, slik at
    // kampdagfasen kan kreve en faktisk spilt kamp før uka ruller videre.
    state.matchday.lastMatch.playedInClubWeek = state.clubWeekState?.week ?? null;
    // Club Week Consequence Loop v1: kampen gir små klubb-/tilvenningseffekter
    // én gang. Markeringen (consequencesApplied) persisteres i saveMatchdayState.
    applyMatchdayConsequences(state.matchday.lastMatch, session);
    // Mini Season v0.1: registrer resultatet i en aktiv prøveperiode (matchId
    // som idempotensnøkkel — reload/dobbeltkall gir aldri dobbel registrering).
    registerMatchInMiniSeason(state.matchday.lastMatch);
    // Role Familiarity Engine v1: bygg spillernes rolle-fortrolighet ved riktig
    // bruk (forvitre litt ved feilbruk). Startelleveren er låst gjennom sesjonen,
    // så gjeldende teamFit speiler laget som spilte. Kjøres én gang per kamp
    // (denne grenen treffes bare når siste hendelse er besvart).
    recordRoleFamiliarityFromMatch(getTeamFit());
    state.matchday.session = null;
  }

  saveMatchdayState();
  renderApp();
}

// Norske etiketter og kort tekst for kampkonsekvenser, f.eks.
// "Spillermoral +3, Taktisk klarhet +2, Medietrykk -1". Tom streng uten utslag.
const MATCH_CONSEQUENCE_EFFECT_LABELS = {
  boardTrust: "Styretillit",
  playerMorale: "Spillermoral",
  tacticalClarity: "Taktisk klarhet",
  trainingCulture: "Treningskultur",
  mediaPressure: "Medietrykk"
};

function formatMatchConsequenceEffects(effects) {
  if (!effects || typeof effects !== "object" || Array.isArray(effects)) {
    return "";
  }

  const parts = [];
  for (const [metric, delta] of Object.entries(effects)) {
    if (!MATCH_CONSEQUENCE_EFFECT_LABELS[metric] || typeof delta !== "number" || delta === 0) {
      continue;
    }
    parts.push(`${MATCH_CONSEQUENCE_EFFECT_LABELS[metric]} ${delta > 0 ? "+" : ""}${delta}`);
  }

  return parts.join(", ");
}

// Club Week Consequence Loop v1: bruk et fullført Kampdag v0.2-resultat til
// små, lesbare effekter på eksisterende Club Week-verdier og formasjons-
// tilvenning i teamMerits. Kjøres kun i det kampen avsluttes, og resultatet
// merkes med consequencesApplied slik at reload/dobbeltkall aldri gir ny
// effekt. Gamle v1-kamper (uten version 2) gir aldri konsekvens og krasjer
// ikke. Ingen liga, tabell, sesong eller ny motor — bare små deltaer.
function applyMatchdayConsequences(lastMatch, session) {
  if (!lastMatch || typeof lastMatch !== "object" || lastMatch.consequencesApplied) {
    return;
  }

  const consequences = computeMatchdayConsequences({
    lastMatch,
    coachSnapshot: session?.coachSnapshot || null,
    historicalScore: Number(session?.teamFitSnapshot?.historicalScore) || 0
  });

  if (!consequences) {
    return;
  }

  // Club Week-verdier: samme mønster som innboksvalg — kun eksisterende
  // numeriske verdier påvirkes, og resultatet clamps 0–100.
  const appliedEffects = {};
  if (state.clubWeekState && typeof state.clubWeekState === "object") {
    for (const [metric, delta] of Object.entries(consequences.clubEffects)) {
      if (typeof state.clubWeekState[metric] === "number" && typeof delta === "number" && delta !== 0) {
        state.clubWeekState[metric] = clampMetric(state.clubWeekState[metric] + delta);
        appliedEffects[metric] = delta;
      }
    }
    if (Object.keys(appliedEffects).length > 0) {
      saveClubWeekState(state.clubWeekState);
    }
  }

  // Formasjonstilvenning for brukt formasjon: eksisterende struktur i
  // teamMerits.formationFamiliarity[formationId], clampet 0–100. Startverdi
  // ved første kamp hentes fra stabens formationFamiliarity (som i trenings-
  // uken), ellers fra lagret verdi.
  let familiarityApplied = null;
  if (state.teamMerits && consequences.formationId && consequences.familiarityGain > 0) {
    const merits = state.teamMerits;
    if (!merits.formationFamiliarity || typeof merits.formationFamiliarity !== "object") {
      merits.formationFamiliarity = {};
    }
    const stored = merits.formationFamiliarity[consequences.formationId];
    const current = Number.isFinite(stored)
      ? stored
      : Number(session?.coachSnapshot?.formationFamiliarity) || 45;
    const startValue = Math.max(0, Math.min(100, Math.round(current)));
    const nextValue = Math.max(0, Math.min(100, Math.round(startValue + consequences.familiarityGain)));
    merits.formationFamiliarity[consequences.formationId] = nextValue;
    saveTeamMerits();
    familiarityApplied = {
      formationId: consequences.formationId,
      formationName: lastMatch.formationSnapshot?.name || consequences.formationId,
      gain: nextValue - startValue,
      value: nextValue
    };
  }

  // Off-pitch Parameters v1: kampen farger også konteksten utenfor banen
  // (moral, selvtillit, slitasje, press). Manager-staten oppdateres én gang per
  // kamp (samme consequencesApplied-vern). Ingen History Go-progresjon røres.
  if (state.teamMerits) {
    state.teamMerits.offPitch = applyMatchdayOffPitchEffects(getOffPitchState(), {
      outcome: lastMatch.outcome,
      goalsFor: lastMatch.score?.for,
      goalsAgainst: lastMatch.score?.against,
      teamStrength: lastMatch.teamStrength,
      opponentStrength: lastMatch.opponent?.strength,
      exposedWeaknessMetric: lastMatch.exposedWeaknessMetric
    });
    saveTeamMerits();
  }

  // Engangsmarkering + lagret oppsummering for sluttrapporten. Persisteres
  // sammen med lastMatch i matchday-state av kalleren (saveMatchdayState).
  lastMatch.consequencesApplied = true;
  lastMatch.clubConsequences = {
    effects: appliedEffects,
    familiarity: familiarityApplied
  };

  // Kort kampkonsekvens i Club Week-loggen og som feedback.
  const outcomeLabel = { win: "Seier", draw: "Uavgjort", loss: "Tap" }[lastMatch.outcome] || "Kamp";
  const effectsText = formatMatchConsequenceEffects(appliedEffects);
  const summaryParts = [];
  if (effectsText) {
    summaryParts.push(`Kampkonsekvens: ${effectsText}.`);
  }
  if (familiarityApplied && familiarityApplied.gain > 0) {
    summaryParts.push(`Formasjonstilvenning i ${familiarityApplied.formationName} +${familiarityApplied.gain}.`);
  }

  const message = [`${outcomeLabel} mot ${lastMatch.opponent?.name || "ukjent motstander"}.`, ...summaryParts].join(" ");

  addClubWeekEvent({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    week: state.clubWeekState?.week ?? "?",
    phase: "matchday",
    phaseLabel: "Kampdag",
    message
  });
  // I kampdagfasen er det denne kampen som åpner porten for fasebyttet.
  setClubWeekFeedback(
    state.clubWeekState?.phase === "matchday" ? `${message} Uka kan nå rulle videre.` : message
  );

  // Profilrelatert progresjon (Club Week-verdier/formationFamiliarity) er
  // faktisk endret: varsle appskallet. Ren rendering skjer i kalleren.
  if (Object.keys(appliedEffects).length > 0 || familiarityApplied) {
    window.dispatchEvent(new Event("updateProfile"));
  }
}

// Nullstill kampdag: fjern både siste kamp og eventuell pågående sesjon.
function resetMatchday() {
  ensureMatchdayState();
  state.matchday.lastMatch = null;
  state.matchday.session = null;
  saveMatchdayState();
  renderApp();
}

// ----------------------------------------------------------------------------
// Mini Season v0.1 — 5-kampers prøveperiode
// En lett spillramme oppå eksisterende Club Week og Kampdag v0.2: motstander-
// plan fra de eksisterende motstanderprofilene, resultathistorikk, små
// styremål og en sluttvurdering etter 5 kamper. Ingen liga, tabell, økonomi,
// overgangsmarked eller ny motor. Selve logikken ligger i
// football-mini-season.js; app.js eier kun lagring (hgfm.miniSeason.v1) og UI.
// ----------------------------------------------------------------------------

// Les mini-sesong fra localStorage. Krasjer aldri: manglende nøkkel, ugyldig
// JSON eller korrupt struktur gir null (= ingen prøveperiode startet).

function normalizeFirstTimePlaythrough(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    started: Boolean(source.started),
    completed: Boolean(source.completed),
    currentStep: typeof source.currentStep === "string" && source.currentStep ? source.currentStep : "start"
  };
}

function loadFirstTimePlaythrough() {
  try {
    return normalizeFirstTimePlaythrough(JSON.parse(localStorage.getItem(FIRST_TIME_PLAYTHROUGH_KEY)));
  } catch (error) {
    return normalizeFirstTimePlaythrough(null);
  }
}

function saveFirstTimePlaythrough() {
  try {
    localStorage.setItem(FIRST_TIME_PLAYTHROUGH_KEY, JSON.stringify(normalizeFirstTimePlaythrough(state.firstTimePlaythrough)));
  } catch (error) {
    // UI-progresjon kan feile i privat modus uten å stoppe førsteuka.
  }
}

function isFirstTimePlaythroughActive() {
  return !state.firstTimePlaythrough?.completed;
}

function getFirstTimeOpponentProfile() {
  return getHistoricalOpponentProfile(FIRST_TIME_OPPONENT_ID) ||
    HISTORICAL_OPPONENT_PROFILES.find((profile) => /ajax|total/i.test(`${profile.id} ${profile.displayName} ${profile.archetypeName}`)) ||
    HISTORICAL_OPPONENT_PROFILES[0] ||
    null;
}

function buildFirstTimeNextActionState(teamFit, readiness = null) {
  const ft = normalizeFirstTimePlaythrough(state.firstTimePlaythrough);
  if (ft.completed) return { active: false, started: ft.started, completed: true };
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const filled = assignments.filter((item) => item.player).length;
  const misused = assignments.some((item) => item.player && item.fit?.status === "feilbrukt");
  const opponent = getFirstTimeOpponentProfile();
  const firstMatchPlayed = Boolean(state.miniSeason?.matchHistory?.length) || Boolean(state.matchday?.lastMatch);
  const reportSeen = firstMatchPlayed && !hasUnseenMatchReport();
  return {
    active: true,
    started: ft.started || state.miniSeason?.status === "active",
    completed: ft.completed,
    hasFormation: Boolean(state.selectedFormationId),
    hasRoles: filled >= 11 && !misused,
    hasReadInbox: (getActiveInboxThreads().length + getUnreadInboxEventCount(getInboxState())) === 0,
    hasPlayedFirstMatch: firstMatchPlayed,
    hasSeenReport: reportSeen,
    opponentName: opponent?.displayName || "Ajax 1971–73 — Totalfotball",
    readiness: readiness || (teamFit ? getMatchdayReadiness(teamFit) : { isReady: false })
  };
}

function renderFirstTimePlaythrough(teamFit) {
  const card = elements.firstTimePlaythroughCard;
  if (!card) return;
  const ft = buildFirstTimeNextActionState(teamFit);
  card.hidden = !ft.active;
  if (!ft.active) return;
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const filled = assignments.filter((item) => item.player).length;
  const opponent = getFirstTimeOpponentProfile();
  if (elements.firstTimeReadiness) {
    const training = state.weeklyTrainingProgram?.programId || state.weeklyTrainingFocus?.focusId ? "valgt" : "mangler";
    elements.firstTimeReadiness.textContent = `Startellever ${Math.min(filled, 11)}/11 · trening ${training} · rapport ${ft.hasSeenReport ? "sett" : "venter"}`;
  }
  if (elements.firstTimeOpponent && opponent) {
    elements.firstTimeOpponent.textContent = `${opponent.displayName}: Fare — høyt press/høy linje. Mulighet — rom bak presset hvis oppbyggingen holder.`;
  }
  if (elements.firstTimeAssistant) {
    let advice = "Start med å gjøre laget kampklart.";
    if (filled < 11) advice = "Velg en formasjon laget forstår og fyll startelleveren.";
    else if (!state.weeklyTrainingProgram?.programId && !state.weeklyTrainingFocus?.focusId) advice = "Motstanderen presser høyt. Tenk oppbygging under press eller en tryggere utvei.";
    else if (!ft.hasReadInbox) advice = "Les innboksen før du spiller kamp.";
    else if (!ft.hasPlayedFirstMatch) advice = "Spill kampen når readiness er grønn nok.";
    else if (!ft.hasSeenReport) advice = "Etter kampen bør du lese rapporten før du går videre.";
    elements.firstTimeAssistant.textContent = advice;
  }
}

function loadMiniSeason() {
  try {
    return normalizeMiniSeasonState(JSON.parse(localStorage.getItem(MINI_SEASON_KEY)));
  } catch (error) {
    return null;
  }
}

// Manager-kontekst som mini-sesongen leser (off-pitch + Club Week-verdier). Den
// brukes til å avlede sesongmål/styreforventning og til kontekstuell vurdering.
// Leser kun manager-state — aldri History Go-progresjon.
function getMiniSeasonContext() {
  return {
    seasonId: `mini-season-${Date.now()}`,
    offPitch: getOffPitchState(),
    clubWeekState: state.clubWeekState,
    // Historical Opponent Archetypes v1: prøveperioden settes opp mot historiske
    // stil-lag (læringsmotstandere), ikke generiske roboter. Profilene er
    // runtime-kompatible med kampmotoren.
    opponents: HISTORICAL_OPPONENT_PROFILES,
    firstOpponentId: isFirstTimePlaythroughActive() ? FIRST_TIME_OPPONENT_ID : null,
    teamName: "HG-laget"
  };
}

// Lagre gjeldende mini-sesong. Stille no-op hvis lagring feiler (privat modus).
function saveMiniSeason() {
  try {
    if (state.miniSeason) {
      localStorage.setItem(MINI_SEASON_KEY, JSON.stringify(state.miniSeason));
    } else {
      localStorage.removeItem(MINI_SEASON_KEY);
    }
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Start en ny prøveperiode (Mini Season v1 / League Loop v1): en deterministisk
// 5-kampers kamprekke bygges fra de eksisterende motstanderprofilene, og
// sesongmål/styreforventning avledes av managerkonteksten. Erstatter en fullført
// periode; en aktiv periode røres ikke.
function startMiniSeason() {
  if (state.miniSeason?.status === "active") {
    return;
  }

  const miniSeason = createMiniSeasonStart(getMiniSeasonContext());
  if (!miniSeason) {
    return;
  }

  state.miniSeason = miniSeason;
  if (!state.firstTimePlaythrough?.completed) {
    state.firstTimePlaythrough = { ...normalizeFirstTimePlaythrough(state.firstTimePlaythrough), started: true, currentStep: "lineup" };
    saveFirstTimePlaythrough();
  }
  saveMiniSeason();

  addClubWeekEvent({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    week: state.clubWeekState?.week ?? "?",
    phase: state.clubWeekState?.phase || "analysis",
    phaseLabel: "Prøveperiode",
    message: `Prøveperioden er i gang: ${MINI_SEASON_TOTAL_WEEKS} kamper avgjør styrets dom. Sesongmål: ${miniSeason.seasonGoal}.`
  });

  renderApp();
}

// Nullstill prøveperioden. Fjerner KUN mini-sesong-state — rører aldri
// History Go-unlocks, team merits, Club Week-state eller kampdag-state.
function resetMiniSeason() {
  if (!state.miniSeason) {
    return;
  }
  state.miniSeason = null;
  saveMiniSeason();
  renderApp();
}

// Neste planlagte motstander som full motstanderprofil, eller null når ingen
// mini-sesong er aktiv (da beholder kampdagen dagens tilfeldige motstander).
function getMiniSeasonNextOpponent() {
  const match = getCurrentMiniSeasonMatch(state.miniSeason);
  if (!match) {
    return null;
  }
  // Historiske stil-profiler først; fall tilbake til de generiske (for en
  // mini-sesong som ble startet før Historical Opponent Archetypes v1).
  const profile =
    getHistoricalOpponentProfile(match.opponentId) ||
    OPPONENT_PROFILES.find((candidate) => candidate.id === match.opponentId) ||
    null;
  // Behold kamprekkas hjemme/borte og forventning oppå motstanderprofilen, slik
  // at kampdag og UI kan vise rammen rundt kampen.
  return profile
    ? { ...profile, homeAway: match.homeAway, boardExpectation: match.boardExpectation, narrativeHook: match.narrativeHook }
    : null;
}

// Registrer et fullført Kampdag v0.2-resultat i den aktive mini-sesongen.
// Mini-sesongen er en ren motor (football-mini-season.js): app.js mater inn
// kampresultatet og managerkonteksten og lagrer den nye staten. matchId gjør
// registreringen idempotent (reload/dobbeltkall gir aldri dobbel registrering).
// Selve uke-rullen skjer når Club Week går fra oppsummering til ny uke.
function registerMatchInMiniSeason(lastMatch) {
  const miniSeason = state.miniSeason;
  if (!miniSeason || miniSeason.status !== "active" || !lastMatch || typeof lastMatch !== "object") {
    return;
  }

  // Allerede registrert denne runden? Da er dette en reload/dobbeltkall.
  const before = isCurrentMiniSeasonMatchPlayed(miniSeason);
  const context = getMiniSeasonContext();

  const matchdayResult = {
    id: lastMatch.id || null,
    matchId: lastMatch.id || null,
    outcome: lastMatch.outcome || "draw",
    score: { for: Number(lastMatch.score?.for) || 0, against: Number(lastMatch.score?.against) || 0 },
    opponent: lastMatch.opponent || null,
    teamStrength: Number(lastMatch.teamStrength) || 0,
    decisionTotals: lastMatch.decisionTotals || {},
    decisions: Array.isArray(lastMatch.decisions) ? lastMatch.decisions : [],
    trainingFocus: lastMatch.trainingFocus || null
  };

  const updated = applyMiniSeasonMatchResult(miniSeason, matchdayResult, context);
  if (isCurrentMiniSeasonMatchPlayed(updated) === before && JSON.stringify(updated) === JSON.stringify(miniSeason)) {
    // Ingen endring (idempotens) — ikke logg eller varsle på nytt.
    return;
  }

  state.miniSeason = updated;
  saveMiniSeason();

  // Off-pitch-kobling: mini-sesongens kontekst kan farge laget utenfor banen
  // (selvtillit/press/uro/belastning) etter kampen. Komponerer MED den
  // eksisterende applyMatchdayOffPitchEffects — dupliserer den ikke. Aldri
  // History Go-progresjon (kun teamMerits.offPitch).
  if (state.teamMerits) {
    const offPitchEvent = createMiniSeasonOffPitchEvent(updated, context);
    if (offPitchEvent) {
      state.teamMerits.offPitch = applyOffPitchEvent(getOffPitchState(), offPitchEvent);
      saveTeamMerits();
    }
  }

  const summary = summarizeMiniSeason(updated);
  const lastEntry = updated.matchHistory[updated.matchHistory.length - 1];
  const outcomeLabel = MINI_SEASON_OUTCOME_LABELS[lastEntry?.outcome] || "Kamp";
  const message = `Prøveperiode runde ${lastEntry?.round ?? "?"} av ${updated.totalWeeks}: ${outcomeLabel} ${lastEntry?.scoreLine || ""} mot ${lastEntry?.opponentName || "motstanderen"}. ${summary.points} poeng (form ${summary.formText || "—"}).`;

  addClubWeekEvent({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    week: state.clubWeekState?.week ?? "?",
    phase: "matchday",
    phaseLabel: "Prøveperiode",
    message
  });

  // Mini-sesong-progresjon er faktisk endret: varsle appskallet (samme mønster
  // som kampkonsekvensene). Ren rendering skjer i kalleren.
  window.dispatchEvent(new Event("updateProfile"));
}

// Rull mini-sesongen videre når Club Week går fra oppsummering til ny uke. Den
// rene motoren krever at ukas kamp er spilt før den ruller (ellers no-op), og
// fullfører sesongen med styrets sluttvurdering etter femte kamp.
function advanceMiniSeasonForNewWeek() {
  const miniSeason = state.miniSeason;
  if (!miniSeason || miniSeason.status !== "active") {
    return;
  }
  const updated = advanceMiniSeasonWeek(miniSeason, getMiniSeasonContext());
  if (JSON.stringify(updated) === JSON.stringify(miniSeason)) {
    return;
  }
  state.miniSeason = updated;
  saveMiniSeason();

  if (updated.status === "completed") {
    addClubWeekEvent({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      week: state.clubWeekState?.week ?? "?",
      phase: "review",
      phaseLabel: "Prøveperiode",
      message: `Prøveperioden er fullført med ${updated.points} poeng. ${updated.finalReview?.headline || ""}`.trim()
    });
  } else {
    const nextMatch = getCurrentMiniSeasonMatch(updated);
    if (nextMatch) {
      const venue = nextMatch.homeAway === "home" ? "hjemme" : "borte";
      addClubWeekEvent({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        week: state.clubWeekState?.week ?? "?",
        phase: "analysis",
        phaseLabel: "Prøveperiode",
        message: `Prøveperiode runde ${nextMatch.round} av ${updated.totalWeeks}: ${nextMatch.opponentName} (${venue}). ${nextMatch.narrativeHook}`
      });
    }
  }

  window.dispatchEvent(new Event("updateProfile"));
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

function findBestAvailablePlayerForSlot(slot, usedPlayerIds, availablePlayers) {
  const tiers = [
    (candidate) => candidate.naturalPositions.includes(slot.position),
    (candidate) => candidate.usablePositions.includes(slot.position),
    (candidate) => !candidate.poorFits.includes(slot.position)
  ];

  for (const matches of tiers) {
    const player = availablePlayers.find((candidate) => !usedPlayerIds.has(candidate.id) && matches(candidate));

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

  // Bare opplåste spillere kan seedes inn i startoppstillingen. Er ingen
  // spillere låst opp, fylles ingen plasser automatisk.
  const availablePlayers = getUnlockedPlayers();
  const usedPlayerIds = new Set();

  formation.slots.forEach((slot) => {
    const player = findBestAvailablePlayerForSlot(slot, usedPlayerIds, availablePlayers);

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

// Saner gjeldende lineup mot opplåste spillere. Gamle valg i localStorage/state
// skal ikke kunne omgå unlock-regelen: en plass som peker på en spiller som ikke
// lenger er opplåst, beholder rollen sin men mister playerId. Returnerer true
// hvis noe ble endret.
function sanitizeLineupForUnlockedPlayers() {
  const unlockedIds = new Set(getUnlockedPlayers().map((player) => player.id));
  let changed = false;

  Object.entries(state.lineup).forEach(([slotId, slotState]) => {
    if (slotState && slotState.playerId && !unlockedIds.has(slotState.playerId)) {
      state.lineup[slotId] = { ...slotState, playerId: null };
      changed = true;
    }
  });

  return changed;
}

// Saner valgt formasjon mot formasjons-unlocks. Hvis valgt formasjon er låst
// (eller mangler) etter refresh/sanering, fall tilbake til første tilgjengelige
// formasjon og reseed lineup/posisjoner. Returnerer true hvis formasjonen ble
// byttet.
function sanitizeSelectedFormation() {
  if (!state.formations.length) {
    return false;
  }

  const snapshot = getAvailability();
  const currentStatus = snapshot.formationStatusById.get(state.selectedFormationId);

  if (currentStatus?.unlocked) {
    return false;
  }

  const fallback = snapshot.unlockedFormations[0] || state.formations[0];

  if (!fallback || fallback.id === state.selectedFormationId) {
    return false;
  }

  state.selectedFormationId = fallback.id;
  seedLineupForFormation();
  ensurePositionsForFormation();
  // Lineup er reseedet; snapshotets roster readiness må beregnes på nytt.
  invalidateAvailability();
  return true;
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

// Ukens taktiske treningsfokus. Uke-id og appliedSessionId gjør lagringen
// robust mot reload, feil uke og gjenbruk etter nullstilling av kamp.
function loadWeeklyTrainingFocus() {
  try {
    return sanitizeWeeklyTrainingFocus(JSON.parse(localStorage.getItem(WEEKLY_TRAINING_FOCUS_KEY)));
  } catch (error) {
    return null;
  }
}

function saveWeeklyTrainingFocus() {
  try {
    if (state.weeklyTrainingFocus) {
      localStorage.setItem(WEEKLY_TRAINING_FOCUS_KEY, JSON.stringify(state.weeklyTrainingFocus));
    } else {
      localStorage.removeItem(WEEKLY_TRAINING_FOCUS_KEY);
    }
  } catch (error) {
    // Privat modus e.l.: appen fortsetter uten persistens.
  }
}

function selectWeeklyTrainingFocus(focusId) {
  const focus = getTrainingFocus(focusId);
  const week = Number(state.clubWeekState?.week);
  if (!focus || !Number.isInteger(week) || state.matchday?.session || state.weeklyTrainingFocus?.appliedSessionId) {
    return;
  }
  const previousFocusId = state.weeklyTrainingFocus?.focusId || null;
  state.weeklyTrainingFocus = { focusId: focus.id, week, appliedSessionId: null };
  saveWeeklyTrainingFocus();

  // Treningsvalget beveger konteksten utenfor banen. Vi anvender effekten kun
  // når fokuset faktisk endres denne uka, slik at gjentatte klikk ikke stabler
  // opp samme effekt. Off-pitch-historikken husker hva som ble trent, slik at
  // kampdag og senere forklaringer kan vise hvorfor laget ble som det ble.
  if (state.teamMerits && focus.id !== previousFocusId) {
    const offPitchEvent = buildTrainingFocusOffPitchEvent(focus.id);
    if (offPitchEvent) {
      state.teamMerits.offPitch = applyOffPitchEvent(getOffPitchState(), offPitchEvent);
      saveTeamMerits();
    }
  }

  renderApp();
}

function syncWeeklyTrainingFocusToClubWeek() {
  const week = Number(state.clubWeekState?.week);
  if (state.weeklyTrainingFocus && state.weeklyTrainingFocus.week !== week) {
    state.weeklyTrainingFocus = null;
    saveWeeklyTrainingFocus();
  }
  if (state.weeklyTrainingProgram && state.weeklyTrainingProgram.week !== week) {
    state.weeklyTrainingProgram = null;
    saveWeeklyTrainingProgram();
  }
}

// Ukens valgte treningsprogram (komposisjon). Lagring speiler treningsfokuset:
// programId + uke + applied-flagg gjør den robust mot reload og forhindrer at
// off-pitch-effekten stables opp ved gjentatte klikk.
function sanitizeWeeklyTrainingProgram(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const programId = typeof value.programId === "string" ? value.programId : null;
  const week = Number(value.week);
  if (!programId || !Number.isInteger(week) || week < 1) {
    return null;
  }
  return { programId, week, applied: Boolean(value.applied) };
}

function loadWeeklyTrainingProgram() {
  try {
    return sanitizeWeeklyTrainingProgram(JSON.parse(localStorage.getItem(WEEKLY_TRAINING_PROGRAM_KEY)));
  } catch (error) {
    return null;
  }
}

function saveWeeklyTrainingProgram() {
  try {
    if (state.weeklyTrainingProgram) {
      localStorage.setItem(WEEKLY_TRAINING_PROGRAM_KEY, JSON.stringify(state.weeklyTrainingProgram));
    } else {
      localStorage.removeItem(WEEKLY_TRAINING_PROGRAM_KEY);
    }
  } catch (error) {
    // Privat modus e.l.: appen fortsetter uten persistens.
  }
}

// Velg ukens treningsprogram. Idempotent per uke: programmet kan byttes så lenge
// off-pitch-effekten ikke er brukt (applied), og effekten anvendes kun én gang.
// Selve uttellingen/forklaringen kommer fra komposisjonsmotoren — UI velger bare.
function selectWeeklyTrainingProgram(program) {
  const week = Number(state.clubWeekState?.week);
  if (!program || typeof program.id !== "string" || !Number.isInteger(week)) {
    return;
  }
  if (state.matchday?.session || state.weeklyTrainingProgram?.applied) {
    return;
  }
  if (state.weeklyTrainingProgram?.programId === program.id) {
    return;
  }

  state.weeklyTrainingProgram = { programId: program.id, week, applied: false };

  // Treningsprogrammet beveger konteksten utenfor banen (slitasje, klarhet,
  // samhold). Effekten anvendes kun én gang per uke; senere bytter samme uke
  // bare oppdaterer hvilket program som er valgt uten å stable opp belastning.
  if (state.teamMerits) {
    state.teamMerits.offPitch = applyTrainingProgramOffPitchEffects(getOffPitchState(), program);
    state.weeklyTrainingProgram.applied = true;
    saveTeamMerits();
  }
  saveWeeklyTrainingProgram();

  renderApp();
}

// Gyldige fase-ID-er i den nye 6-fase-rytmen. Brukes til sanering av lagret
// clubWeekState (gamle fase-ID-er som match_day/club_work faller til analyse).
const CLUB_WEEK_PHASE_IDS = ["analysis", "inbox", "training", "match_prep", "matchday", "review"];

// Saner en lagret clubWeekState til forventet form. Tolerant mot null/feil
// typer og gamle fase-ID-er. Speiler engine-normaliseringen, men er synkron
// slik at merits-normalisereren kan bruke den ved oppstart (før engine er lastet).
function sanitizeStoredClubWeekState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const week = Number(value.week);
  const clampM = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 50;
  };
  return {
    week: Number.isInteger(week) && week >= 1 ? week : 1,
    phase: CLUB_WEEK_PHASE_IDS.includes(value.phase) ? value.phase : "analysis",
    boardTrust: clampM(value.boardTrust),
    playerMorale: clampM(value.playerMorale),
    tacticalClarity: clampM(value.tacticalClarity),
    trainingCulture: clampM(value.trainingCulture),
    mediaPressure: clampM(value.mediaPressure)
  };
}

// Club Week-tilstand: uke, fase og klubbverdier fra Club Week Engine. Kanonisk
// plassering er teamMerits.clubWeekState (Club Week Orchestrator v1). Migrerer
// fra den gamle frittstående localStorage-nøkkelen når merits ennå mangler en
// verdi. Selve fase-/effektlogikken ligger i engine/fallback.
function loadClubWeekState() {
  const fromMerits = state.teamMerits?.clubWeekState;
  if (fromMerits && typeof fromMerits === "object" && !Array.isArray(fromMerits)) {
    return fromMerits;
  }

  // Migrering: les den gamle nøkkelen én gang slik at eksisterende spill ikke
  // mister uke/fase/verdier når staten flyttes inn i merits.
  try {
    const stored = JSON.parse(localStorage.getItem(CLUB_WEEK_STATE_KEY));
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      return stored;
    }
  } catch (error) {
    // Ignorer korrupt/utilgjengelig lagring – vi faller tilbake til ny uke 1.
  }

  return null;
}

function saveClubWeekState(clubWeekState) {
  // Skriv til den kanoniske plasseringen i merits. Uten merits (skulle ikke
  // skje etter init) faller vi stille tilbake uten persistens.
  if (state.teamMerits && typeof state.teamMerits === "object") {
    state.teamMerits.clubWeekState = clubWeekState;
    saveTeamMerits();
  }

  // Rydd bort den gamle frittstående nøkkelen etter at staten er migrert inn.
  try {
    localStorage.removeItem(CLUB_WEEK_STATE_KEY);
  } catch (error) {
    // Privat modus e.l.: ufarlig, den gamle nøkkelen blir bare liggende.
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
  inbox: "Innboks",
  training: "Trening",
  match_prep: "Kampplan",
  matchday: "Kampdag",
  review: "Oppsummering"
};

// Kampdag ↔ Club Week-kobling: les porten fra den rene modellen med gjeldende
// state. Stengt port betyr at kampdagfasen venter på en faktisk spilt kamp
// (eller at en pågående kampsesjon fullføres) før uka kan rulle videre.
function getClubWeekMatchdayGate() {
  return evaluateClubWeekMatchdayGate({
    clubWeekState: state.clubWeekState,
    lastMatch: state.matchday?.lastMatch || null,
    hasActiveSession: Boolean(state.matchday?.session)
  });
}

// Kort norsk effekt-fras per treningsfokus: hva treningen faktisk gjorde med
// laget på kampdag. Brukes til den kausale "derfor"-forklaringen.
const TRAINING_FOCUS_MATCH_EFFECT_PHRASE = {
  rest_defence: "dempet laget kontringsrisikoen",
  pressing: "presset laget mer samordnet",
  build_up: "spilte laget tryggere ut bakfra",
  width: "fant laget bedre rom i bredden",
  depth_runs: "truet laget rommet bak forsvaret oftere",
  role_understanding: "sto rollene tydeligere i pressede situasjoner",
  set_pieces: "sto laget bedre rustet på dødballer",
  formation_familiarity: "satt systemet tryggere"
};

// Club Week Orchestrator v1: den kausale lenken trening → kampdag. Leser ukas
// treningssnapshot fra den spilte kampen og forklarer HVORFOR laget ble som det
// ble. Dette speiler kampmotorens faktiske oppførsel: et kontekstuelt relevant
// fokus demper de situasjonene det ble trent på (trainingDamping i
// resolveMatchdayDecision). Tom streng når ingen trening er knyttet til kampen.
function buildTrainingMatchCausalNote() {
  const lastMatch = state.matchday?.lastMatch;
  const trainingFocus = lastMatch?.trainingFocus;
  if (!trainingFocus || !trainingFocus.focusId) {
    return "";
  }
  const focusName = trainingFocus.name || getTrainingFocus(trainingFocus.focusId)?.name || "treningsfokuset";
  const opponentName = lastMatch.opponent?.name || "motstanderen";
  const phrase = TRAINING_FOCUS_MATCH_EFFECT_PHRASE[trainingFocus.focusId] || "ga laget noe å støtte seg på";

  if (trainingFocus.contextRelevant) {
    return `Du trente ${focusName} før ${opponentName}, derfor ${phrase}.`;
  }
  return `Du trente ${focusName} før ${opponentName}. Det ga laget arbeid, men traff ikke kampbildet direkte denne gangen.`;
}

// Små, synlige konsekvenser av et fasebytte i den nye 6-fase-rytmen
// (analyse → innboks → trening → kampplan → kampdag → oppsummering → ny uke).
// Returnerer effekter på klubbverdier og en kort norsk tilbakemelding som
// forklarer hvorfor uka beveget seg som den gjorde. Kun UI/Club Week-state –
// ingen lagscore, kampmotor, rollefit eller Football Knowledge-matching.
function getClubWeekTransitionConsequences(previousState, nextState) {
  switch (previousState.phase) {
    case "analysis":
      return {
        effects: {},
        message: "Analysen er gjennomgått. Nå rydder du innboksen før uka planlegges."
      };

    case "inbox":
      return {
        effects: {},
        message: "Innboksen er håndtert, og svarene har satt seg i konteksten. Treningsuka kan planlegges."
      };

    case "training": {
      const selectedFocus = getTrainingFocus(state.weeklyTrainingFocus?.focusId);
      const focusNote = selectedFocus
        ? ` Valgt fokus: ${selectedFocus.name} — det følger med inn i kampplanen.`
        : " Uten valgt treningsfokus går laget inn i kampuka uten en tydelig rød tråd.";

      if (state.activeKnowledgeFocusId && isKnowledgeFocusCompleted(state.activeKnowledgeFocusId)) {
        return {
          effects: { trainingCulture: 2, tacticalClarity: 1 },
          message: `Treningsfasen er fullført. Kunnskapsøkten ga +2 treningskultur og +1 taktisk klarhet.${focusNote}`
        };
      }

      if (state.activeKnowledgeFocusId) {
        return {
          effects: { trainingCulture: -1 },
          message: `Treningsfasen er over. Valgt kunnskapsøkt ble ikke fullført, og treningskulturen faller med 1.${focusNote}`
        };
      }

      return {
        effects: selectedFocus ? {} : { tacticalClarity: -1 },
        message: selectedFocus
          ? `Treningsfasen er over.${focusNote}`
          : `Treningsfasen er over uten valgt kunnskapsfokus. Taktisk klarhet faller med 1.${focusNote}`
      };
    }

    case "match_prep":
      return {
        effects: { mediaPressure: 1 },
        message: "Kampplanen er låst. Kampdag nærmer seg, og medietrykket øker med 1."
      };

    case "matchday": {
      // Kampen er spilt (porten åpnet av applyMatchdayConsequences). Selve
      // klubbeffektene ble brukt da kampen ble avsluttet; her forklarer vi
      // hvorfor laget presterte som det gjorde, og leder over i oppsummeringen.
      const causalNote = buildTrainingMatchCausalNote();
      const base = "Kampen er spilt. Nå oppsummeres uka.";
      return {
        effects: {},
        message: causalNote ? `${causalNote} ${base}` : base
      };
    }

    case "review":
      return {
        effects: { mediaPressure: -1 },
        message: `Uke ${previousState.week} er oppsummert. Klubben går inn i uke ${nextState.week} med ny analysefase.`
      };

    default: {
      const label = CLUB_WEEK_PHASE_LABELS[nextState.phase] || "neste fase";
      return {
        effects: {},
        message: `Klubben går videre til ${label}.`
      };
    }
  }
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

  // hgFootball-formasjoner kommer fra adapteren med ferdige standardkoordinater
  // (shape -> slot-koordinat). Bruk dem direkte når alle slots har x/y, ellers
  // fall tilbake til den gamle linjebaserte fordelingen (legacy-formasjoner).
  const hasExplicitCoordinates = formation.slots.every(
    (slot) => Number.isFinite(slot.x) && Number.isFinite(slot.y)
  );

  if (hasExplicitCoordinates) {
    formation.slots.forEach((slot) => {
      positions[slot.slotId] = { x: slot.x, y: slot.y };
    });
    return positions;
  }

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
    // Vis navn + epoke + skole slik at f.eks. historisk "WM 3-2-2-3" og moderne
    // "Box Midfield 3-2-2-3" ikke forveksles selv om tallene ligner. Låste
    // formasjoner merkes og kan ikke velges som aktiv managerformasjon –
    // unlock handler om tilgang/samlekilde, ikke kvalitet.
    (formation) =>
      isFormationUnlocked(formation.id)
        ? formation.selectLabel || formation.name
        : `${formation.selectLabel || formation.name} · Låst`,
    null,
    (formation) => !isFormationUnlocked(formation.id)
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

    const player = assignment?.player || null;
    const playerName = player?.name || "Tom plass";
    const roleName = assignment?.role?.name || "Ingen rolle";
    const score = assignment?.fit?.matchScore ?? "–";
    const overall = Number.isFinite(player?.overall) ? player.overall : null;

    chip.innerHTML = `
      <span class="chip-token${overall === null ? " is-empty" : ""}">${overall ?? slot.position}</span>
      <span class="chip-name">${playerName}</span>
      <span class="chip-role">${roleName}</span>
      <span class="chip-foot">
        <span class="chip-pos">${slot.position}</span>
        <span class="chip-score">${score}</span>
      </span>
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

function renderSidePanel(teamFit) {
  const slot = getSelectedSlot();

  if (!slot) {
    return;
  }

  let slotState = state.lineup[slot.slotId] || { playerId: null, roleId: null };

  // Bare spillere som er tilgjengelige via History Go eller lokal starttropp kan velges.
  const availablePlayers = getUnlockedPlayers();

  // Hvis denne plassen har en spiller som ikke lenger er opplåst, fjern
  // playerId men behold rollen, og rerender trygt.
  if (slotState.playerId && !availablePlayers.some((player) => player.id === slotState.playerId)) {
    slotState = { ...slotState, playerId: null };
    state.lineup[slot.slotId] = slotState;
  }

  const assignment = teamFit?.assignments.find((item) => item.slot.slotId === slot.slotId);
  const usedPlayerIds = getUsedPlayerIds(slot.slotId);

  elements.selectedSlotTitle.textContent = `${slot.label} · ${slot.position}`;

  if (availablePlayers.length === 0) {
    // Ingen spillere låst opp: vis én disabled placeholder-option uten å krasje.
    elements.slotPlayerSelect.innerHTML = "";
    const option = document.createElement("option");
    option.value = EMPTY_VALUE;
    option.textContent = "Ingen spillere låst opp ennå";
    option.disabled = true;
    elements.slotPlayerSelect.append(option);
  } else {
    setOptions(
      elements.slotPlayerSelect,
      availablePlayers,
      (player) => player.id,
      (player) => `${player.name} · ${player.overall}`,
      "Tom plass",
      (player) => usedPlayerIds.has(player.id)
    );
  }

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

  // Additivt historisk rollefit-hint: forklarer om valgt rolle passer det valgte
  // historiske systemet. Erstatter ikke lagfit-motoren over.
  renderHistoricalRoleHint(slot, slotState);
  renderRoleLearningCard({ slot, slotState, assignment, teamFit });

  // Dynamisk sidepanel: spillerprofil når plassen har en spiller, ellers
  // "Neste beslutninger". Selve handlingene (spiller-/rollevalg) vises alltid.
  const player =
    assignment?.player || state.players.find((item) => item.id === slotState.playerId) || null;

  if (player) {
    if (elements.sidePanelKicker) {
      elements.sidePanelKicker.textContent = `${slot.label} · ${slot.position}`;
    }
    if (elements.sideProfile) {
      elements.sideProfile.hidden = false;
    }
    if (elements.sideDecisions) {
      elements.sideDecisions.hidden = true;
    }
    renderPlayerProfile(player, slot);
  } else {
    if (elements.sidePanelKicker) {
      elements.sidePanelKicker.textContent = "Neste beslutninger";
    }
    if (elements.sideProfile) {
      elements.sideProfile.hidden = true;
    }
    if (elements.sideDecisions) {
      elements.sideDecisions.hidden = false;
    }
    renderSideDecisions(teamFit);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRoleLearningCard({ slot, slotState, assignment, teamFit }) {
  if (!elements.roleLearningCard) return;
  const player = assignment?.player || state.players.find((item) => item.id === slotState?.playerId) || null;
  const role = assignment?.role || state.roles.find((item) => item.id === slotState?.roleId) || null;
  if (!player || !role) {
    elements.roleLearningCard.hidden = true;
    elements.roleLearningCard.innerHTML = "";
    return;
  }

  const vm = createRoleLearningViewModel({
    player,
    role,
    slot,
    tactic: getTactic(),
    roles: state.roles,
    relationships: teamFit?.relationships || null,
    formationKnowledge: state.formationKnowledgeById[getFormation()?.id] || null,
    fit: assignment?.fit || null
  });
  if (!vm) {
    elements.roleLearningCard.hidden = true;
    return;
  }

  const row = (label, values, emptyText = "Ingen tydelig signal") => {
    const items = Array.isArray(values) ? values.filter(Boolean) : [values].filter(Boolean);
    return `
      <div class="role-learning-row">
        <dt>${label}</dt>
        <dd>${escapeHtml(items.slice(0, 3).join(" · ") || emptyText)}</dd>
      </div>`;
  };

  // Role Familiarity Engine v1: hvor godt denne spilleren kjenner denne rollen
  // etter riktig bruk over kamper. Ren visning oppå rolleforståelseskortet.
  const familiarity = describeRoleFamiliarity(getRoleFamiliarity(getRoleFamiliarityStore(), player.id, role.id));

  elements.roleLearningCard.hidden = false;
  elements.roleLearningCard.innerHTML = `
    <div class="role-learning-head">
      <div>
        <p class="eyebrow">Rolleforståelse</p>
        <h4>${escapeHtml(vm.playerName)} som ${escapeHtml(vm.roleName)}</h4>
      </div>
      <span class="role-learning-badge" data-status="${escapeHtml(vm.fitLabel)}">${vm.fitScore ?? "–"} · ${escapeHtml(vm.fitLabel)}</span>
    </div>
    <p class="role-learning-type">${escapeHtml(vm.playerType)}</p>
    <dl class="role-learning-list">
      ${row("Rollen krever", vm.roleCore)}
      ${row("Dette får spilleren brukt", vm.usesStrengths)}
      ${row("Dette mister spilleren", vm.losesStrengths, vm.misuseExplanation)}
      ${row("Relasjoner som hjelper", vm.relationNeeds)}
      ${vm.relationWarnings.length ? row("Relasjonsvarsel", vm.relationWarnings) : ""}
      ${vm.formationRoleHint ? row("Formasjon", [vm.formationRoleHint]) : ""}
    </dl>
    <div class="role-learning-familiarity" data-level="${familiarity.level}">
      <div class="role-learning-familiarity-head">
        <span>Rolleerfaring</span>
        <strong>${familiarity.value} · ${escapeHtml(familiarity.label)}</strong>
      </div>
      <div class="role-learning-familiarity-meter" aria-hidden="true"><span style="width:${familiarity.value}%"></span></div>
      <p class="role-learning-familiarity-hint">${escapeHtml(familiarity.hint)}</p>
    </div>
    <p class="role-learning-hint"><strong>Managerhint:</strong> ${escapeHtml(vm.managerHint)}</p>
    ${vm.alternativeRoles.length ? `<p class="role-learning-alt">Alternativer: ${escapeHtml(vm.alternativeRoles.join(", "))}</p>` : ""}
  `;
}

// Fyll spillerprofilen i sidepanelet: rating, navn, posisjoner, samlet History
// Go-sted, styrker og behov. Taktisk samsvar settes allerede over (fit-boksen).
function renderPlayerProfile(player, slot) {
  if (elements.profileRating) {
    elements.profileRating.textContent = Number.isFinite(player.overall) ? player.overall : "–";
  }
  if (elements.profileName) {
    elements.profileName.textContent = player.name || player.id;
  }
  if (elements.profilePositions) {
    const natural = Array.isArray(player.naturalPositions) ? player.naturalPositions : [];
    const usable = Array.isArray(player.usablePositions) ? player.usablePositions : [];
    const parts = [];
    if (natural.length) {
      parts.push(natural.join(" / "));
    }
    if (usable.length) {
      parts.push(`(også ${usable.join(", ")})`);
    }
    elements.profilePositions.textContent = parts.join(" ") || "Ingen posisjoner registrert";
  }
  if (elements.profileSource) {
    const sources = getPlayerSourcePlaces(player.id);
    elements.profileSource.textContent = sources.length
      ? `History Go-sted: ${sources.map((place) => place.placeName).join(", ")}`
      : "History Go-sted: ukjent kilde";
  }
  if (elements.profileStrengths) {
    renderTextChips(elements.profileStrengths, player.strengths, "Ingen registrert");
  }
  if (elements.profileNeeds) {
    renderTextChips(elements.profileNeeds, player.needs, "Ingen registrert");
  }
}

// Liten hjelper: fyll en <ul> med korte tekstpunkter (eller tom-tekst).
function renderTextChips(list, items, emptyText) {
  list.innerHTML = "";
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!values.length) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    list.append(li);
    return;
  }
  values.slice(0, 5).forEach((value) => {
    const li = document.createElement("li");
    li.textContent = formatTagText(value);
    list.append(li);
  });
}

// Gjør tekniske tags lesbare: "final_pass" -> "Final pass".
function formatTagText(value) {
  const text = String(value).replace(/_/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Additivt historisk rollefit-hint (historicalFormationRoleHint). Sammenligner
// den valgte rollen mot valgt historisk formasjons roleRequirements/
// preferredPlayerTypes/misusedPlayerTypes og viser en kort forklarende tekst.
// Påvirker ikke lagfit-scoren; faller tilbake til nøytral tekst uten match.
function renderHistoricalRoleHint(slot, slotState) {
  if (!elements.historicalRoleHint) {
    return;
  }

  const formation = getFormation();
  const role = slotState?.roleId
    ? state.roles.find((item) => item.id === slotState.roleId) || null
    : null;

  const hint = getHistoricalFormationRoleHint(formation, role, state.hgRoleTypeIndex);
  elements.historicalRoleHint.textContent = hint.text;
  elements.historicalRoleHint.dataset.tone = hint.tone;
}

// ----------------------------------------------------------------------------
// Taktisk systempanel (Managerkontoret)
// Kompakt info om den valgte historiske formasjonen rett ved banen: epoke,
// taktisk skole, faseformasjoner, vanskelighetsgrad, nøkkelroller, de viktigste
// prinsippene og en kort History Go-opplåsingsnote. Dette er bevisst kort og
// kamp-/taktikkrelevant – det fullstendige biblioteket finnes i egen fane.
// ----------------------------------------------------------------------------

const TACTIC_DIFFICULTY_LABELS = {
  low: "Lav",
  medium: "Middels",
  high: "Høy",
  very_high: "Svært høy"
};

const TACTIC_PHASE_FIELDS = [
  { key: "baseShape", label: "Grunnform" },
  { key: "inPossessionShape", label: "Med ball" },
  { key: "outOfPossessionShape", label: "Uten ball" },
  { key: "pressShape", label: "Press" },
  { key: "lowBlockShape", label: "Lav blokk" },
  { key: "restDefenceShape", label: "Restforsvar" }
];

// Liten chip-liste-bygger for systempanelet (kun textContent, ingen innerHTML).
function appendTacticChips(container, items, variant) {
  const list = document.createElement("ul");
  list.className = `tactic-system-chips${variant ? ` tactic-system-chips-${variant}` : ""}`;
  const values = (Array.isArray(items) ? items : []).filter(Boolean);

  if (!values.length) {
    const empty = document.createElement("li");
    empty.className = "tactic-system-chip is-empty";
    empty.textContent = "–";
    list.append(empty);
  } else {
    values.forEach((value) => {
      const chip = document.createElement("li");
      chip.className = "tactic-system-chip";
      chip.textContent = value;
      list.append(chip);
    });
  }

  container.append(list);
}

// Kort History Go-opplåsingsnote for valgt formasjon. Leser trygt fra
// unlockRules.json (tier + tema) med fallback til formation.unlockLinks. Blokker
// ikke bruk; dette er ren visning.
function buildFormationUnlockNote(formation) {
  const rules = Array.isArray(state.hgUnlockRules?.rules) ? state.hgUnlockRules.rules : [];
  const sources = Array.isArray(state.hgUnlockRules?.unlockSources) ? state.hgUnlockRules.unlockSources : [];
  const sourceNames = new Map(sources.map((source) => [source.id, source.name]));
  const tierLabels = { start: "Startformasjon", early: "Tidlig", standard: "Standard", advanced: "Avansert" };

  const describe = (clause) =>
    (Array.isArray(clause) ? clause : [])
      .map((req) => {
        const name = sourceNames.get(req.sourceType) || req.sourceType;
        return req.theme ? `${name}: ${req.theme}` : name;
      })
      .filter(Boolean);

  const rule = rules.find((item) => item.appliesTo === "formation" && item.formationId === formation.id);

  if (rule) {
    const tierLabel = tierLabels[rule.tier] || rule.tier || "Standard";
    const themes = [...describe(rule.requires?.anyOf), ...describe(rule.requires?.allOf)];
    const themeText = themes.length ? ` · ${themes.slice(0, 3).join(" · ")}` : "";
    return `Tilknyttet History Go (${tierLabel})${themeText}`;
  }

  const links = (Array.isArray(formation.unlockLinks) ? formation.unlockLinks : [])
    .map((link) => {
      const name = sourceNames.get(link.sourceType) || link.sourceType;
      return link.theme ? `${name}: ${link.theme}` : name;
    })
    .filter(Boolean);

  if (links.length) {
    return `Tilknyttet History Go · ${links.slice(0, 3).join(" · ")}`;
  }

  return "Ingen spesifikk opplåsingsregel registrert ennå.";
}

// Kort, lesbar beskrivelse av ett unlock-krav: "sted: Highbury (Arsenal
// Stadium)", "spiller: Pelé", "trener/stab: Herbert Chapman", "badge: …".
// Krav uten konkret ref beskrives med tema. Kun visning.
function describeUnlockRequirementShort(requirement) {
  if (!requirement || typeof requirement !== "object") {
    return "";
  }

  const ref = typeof requirement.ref === "string" ? requirement.ref : "";

  if (!ref) {
    return requirement.theme ? `tema: ${requirement.theme}` : "";
  }

  switch (requirement.sourceType) {
    case "history_go_place":
    case "sport_place":
    case "football_stadium":
    case "football_club":
    case "groundhopper_place": {
      const place = (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : []).find(
        (entry) => entry?.placeId === ref
      );
      return `sted: ${place?.placeName || formatTagText(ref)}`;
    }
    case "collected_player": {
      const player = (Array.isArray(state.players) ? state.players : []).find((entry) => entry?.id === ref);
      return `spiller: ${player?.name || formatTagText(ref)}`;
    }
    case "collected_manager":
    case "collected_staff": {
      const member = (Array.isArray(state.staff) ? state.staff : []).find((entry) => entry?.id === ref);
      return `trener/stab: ${member?.name || formatTagText(ref)}`;
    }
    case "football_badge": {
      const badge = getBadgeCatalog().get(ref);
      return `badge: ${badge?.name || formatTagText(ref)}`;
    }
    default:
      return requirement.theme ? `tema: ${requirement.theme}` : formatTagText(ref);
  }
}

// Unlock-kravene for én formasjon (regelens anyOf/allOf + unlockLinks).
// Konkrete krav (med ref) prioriteres, siden de er handlingsbare for spilleren.
function getFormationUnlockRequirements(formation) {
  const rules = Array.isArray(state.hgUnlockRules?.rules) ? state.hgUnlockRules.rules : [];
  const rule = rules.find((item) => item?.appliesTo === "formation" && item.formationId === formation?.id);
  const all = [
    ...(Array.isArray(rule?.requires?.allOf) ? rule.requires.allOf : []),
    ...(Array.isArray(rule?.requires?.anyOf) ? rule.requires.anyOf : []),
    ...(Array.isArray(formation?.unlockLinks) ? formation.unlockLinks : [])
  ].filter((requirement) => requirement && typeof requirement === "object");

  const concrete = all.filter((requirement) => typeof requirement.ref === "string" && requirement.ref);
  return concrete.length ? concrete : all;
}

// Kort tilgangstekst for én formasjon: "Ulåst via sted: Highbury …" for ulåste
// systemer der availability-snapshotet kan forklare kilden, og "Låst – åpnes
// via …" med konkrete krav for låste. Kun visning – ingen unlock-beregning.
function buildFormationAccessText(formation) {
  const status = formation ? getAvailability().formationStatusById.get(formation.id) : null;

  if (!status) {
    return "";
  }

  if (status.unlocked) {
    if (status.satisfiedBy) {
      const source = describeUnlockRequirementShort(status.satisfiedBy);
      return source ? `Ulåst via ${source}.` : status.reason;
    }
    if (status.tier && FORMATION_BASELINE_TIERS.has(status.tier)) {
      return "Ulåst som grunnsystem (start-/tidligformasjon).";
    }
    return status.reason;
  }

  const requirements = getFormationUnlockRequirements(formation)
    .map((requirement) => describeUnlockRequirementShort(requirement))
    .filter(Boolean);

  if (!requirements.length) {
    return "Låst. Ingen kjent opplåsingskilde registrert ennå.";
  }

  return `Låst – åpnes via ${requirements.slice(0, 3).join(" eller ")}.`;
}

function appendFormationKnowledgeList(root, label, items, className = "") {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!values.length) return;
  const block = document.createElement("div");
  block.className = `formation-knowledge-mini-block${className ? ` ${className}` : ""}`;
  const title = document.createElement("p");
  title.className = "formation-knowledge-mini-label";
  title.textContent = label;
  block.append(title);
  const list = document.createElement("ul");
  list.className = "formation-knowledge-mini-list";
  values.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });
  block.append(list);
  root.append(block);
}

function createFormationKnowledgeMiniCard(formation, { compact = false } = {}) {
  const knowledge = formation ? state.formationKnowledgeById[formation.id] : null;
  const vm = createFormationKnowledgeViewModel({
    formation,
    knowledge,
    roleIndex: state.hgRoleTypeIndex,
    opponentIndex: state.historicalOpponentIndex
  });
  if (!vm) return null;

  const card = document.createElement("section");
  card.className = `formation-knowledge-mini${compact ? " is-compact" : ""}`;
  const eyebrow = document.createElement("p");
  eyebrow.className = "formation-knowledge-mini-eyebrow";
  eyebrow.textContent = "Formasjonskunnskap";
  const title = document.createElement("h4");
  title.textContent = vm.displayName;
  const subtitle = document.createElement("p");
  subtitle.className = "formation-knowledge-mini-subtitle";
  subtitle.textContent = vm.subtitle;
  const core = document.createElement("p");
  core.className = "formation-knowledge-mini-core";
  core.textContent = vm.corePrinciple;
  card.append(eyebrow, title, subtitle, core);

  appendFormationKnowledgeList(card, "Styrker", vm.quickStrengths, "is-strength");
  appendFormationKnowledgeList(card, "Svakheter", vm.quickWeaknesses, "is-weakness");
  appendFormationKnowledgeList(card, "Rollekrav", vm.roleRequirements, "is-role");

  const hint = vm.managerHints[0] || vm.learningPoints[0];
  if (hint) {
    const managerHint = document.createElement("p");
    managerHint.className = "formation-knowledge-mini-hint";
    managerHint.textContent = `Managerhint: ${hint}`;
    card.append(managerHint);
  }

  return card;
}

function renderTacticalSystemPanel() {
  const panel = elements.tacticalSystemPanel;
  if (!panel) {
    return;
  }

  panel.innerHTML = "";
  const formation = getFormation();

  if (!formation) {
    const empty = document.createElement("p");
    empty.className = "tactic-system-empty";
    empty.textContent = "Velg en formasjon for å se det taktiske systemet.";
    panel.append(empty);
    return;
  }

  // Topplinje: epoke · periode · skole. Holder like tall (f.eks. to 3-2-2-3)
  // tydelig adskilt fordi epoke og skole vises eksplisitt.
  const head = document.createElement("div");
  head.className = "tactic-system-head";

  const eyebrow = document.createElement("p");
  eyebrow.className = "tactic-system-eyebrow";
  eyebrow.textContent = [formation.eraName, formation.eraPeriod, formation.tacticalSchool]
    .filter(Boolean)
    .join(" · ");
  head.append(eyebrow);

  const titleRow = document.createElement("div");
  titleRow.className = "tactic-system-title";
  const shapeBadge = document.createElement("span");
  shapeBadge.className = "tactic-system-shape";
  shapeBadge.textContent = formation.baseShape || "";
  const titleText = document.createElement("h3");
  titleText.textContent = formation.name;
  titleRow.append(shapeBadge, titleText);
  head.append(titleRow);

  const difficulty = document.createElement("span");
  difficulty.className = `tactic-system-diff tactic-system-diff-${formation.tacticalDifficulty || "medium"}`;
  difficulty.textContent = `Taktisk vanskelighetsgrad: ${
    TACTIC_DIFFICULTY_LABELS[formation.tacticalDifficulty] || formation.tacticalDifficulty || "–"
  }`;
  head.append(difficulty);

  panel.append(head);

  const knowledgeCard = createFormationKnowledgeMiniCard(formation);
  if (knowledgeCard) {
    panel.append(knowledgeCard);
  }

  // Faseformasjoner: grunnform + de fem fasene i kompakte bokser.
  const phaseGrid = document.createElement("div");
  phaseGrid.className = "tactic-system-phases";
  TACTIC_PHASE_FIELDS.forEach(({ key, label }) => {
    const box = document.createElement("div");
    box.className = "tactic-system-phase";
    const phaseLabel = document.createElement("span");
    phaseLabel.className = "tactic-system-phase-label";
    phaseLabel.textContent = label;
    const phaseValue = document.createElement("span");
    phaseValue.className = "tactic-system-phase-value";
    phaseValue.textContent = formation[key] || "–";
    box.append(phaseLabel, phaseValue);
    phaseGrid.append(box);
  });
  panel.append(phaseGrid);

  // Nøkkelroller (roleRequirements) med visningsnavn fra roleTypes.json.
  const roleNames = getRoleDisplayNames(formation.roleRequirements, state.hgRoleTypeIndex);
  const rolesBlock = document.createElement("div");
  rolesBlock.className = "tactic-system-block";
  const rolesLabel = document.createElement("p");
  rolesLabel.className = "tactic-system-block-label";
  rolesLabel.textContent = "Nøkkelroller";
  rolesBlock.append(rolesLabel);
  appendTacticChips(rolesBlock, roleNames, "role");
  panel.append(rolesBlock);

  // 2–4 viktigste prinsipper.
  const principlesBlock = document.createElement("div");
  principlesBlock.className = "tactic-system-block";
  const principlesLabel = document.createElement("p");
  principlesLabel.className = "tactic-system-block-label";
  principlesLabel.textContent = "Viktigste prinsipper";
  principlesBlock.append(principlesLabel);
  appendTacticChips(principlesBlock, (formation.principles || []).slice(0, 4), "principle");
  panel.append(principlesBlock);

  // Kort tilgangstekst for valgt system: hva samlingen faktisk åpnet det med
  // ("Ulåst via sted: …"), eller grunntilgang. Blokkerer ikke bruk.
  const unlockNote = document.createElement("p");
  unlockNote.className = "tactic-system-unlock";
  unlockNote.textContent = buildFormationAccessText(formation) || buildFormationUnlockNote(formation);
  panel.append(unlockNote);

  // Kort formasjonstilgjengelighet: hvor mange systemer er ulåst og hvordan
  // låste systemer åpnes. Bevisst kort – ingen ny stor visning.
  const snapshot = getAvailability();
  const availabilityNote = document.createElement("p");
  availabilityNote.className = "tactic-system-availability";
  availabilityNote.textContent =
    `${snapshot.unlockedFormations.length} av ${state.formations.length} historiske systemer er ulåst. ` +
    `Låste systemer er merket "Låst" i formasjonsvalget og åpnes via History Go-samling (steder, spillere, stab) – de er ikke dårligere.`;
  panel.append(availabilityNote);

  // Nærmeste låste systemer med konkret opplåsingskilde (sted/spiller/stab).
  // Kort liste (maks 3) slik at spilleren ser hvorfor noe er låst og hva som
  // åpner det – ingen ny formation picker, bare forklaring ved siden av.
  const lockedWithSource = snapshot.lockedFormations
    .map((locked) => ({
      formation: locked,
      sources: getFormationUnlockRequirements(locked)
        .filter((requirement) => requirement.ref)
        .map((requirement) => describeUnlockRequirementShort(requirement))
        .filter(Boolean)
    }))
    .filter((entry) => entry.sources.length > 0)
    .slice(0, 3);

  if (lockedWithSource.length) {
    const lockedBlock = document.createElement("div");
    lockedBlock.className = "tactic-system-block";
    const lockedLabel = document.createElement("p");
    lockedLabel.className = "tactic-system-block-label";
    lockedLabel.textContent = "Nærmeste låste systemer";
    lockedBlock.append(lockedLabel);

    const lockedList = document.createElement("ul");
    lockedList.className = "tactic-system-locked-list";
    lockedWithSource.forEach(({ formation: locked, sources }) => {
      const item = document.createElement("li");
      item.className = "tactic-system-locked-item";
      item.textContent = `${locked.name}: åpnes via ${sources.slice(0, 2).join(" eller ")}.`;
      lockedList.append(item);
    });
    lockedBlock.append(lockedList);
    panel.append(lockedBlock);
  }
}

// ----------------------------------------------------------------------------
// Neste beslutninger (Fase 2)
// Samler de viktigste åpne beslutningene på tvers av laget, klubbuken, innboksen
// og History Go. Hver beslutning peker mot en konkret handling (velg plass,
// avanser klubbuke, bytt fane). Ren UI/navigasjon – ingen score- eller
// kampmotor-effekt.
// ----------------------------------------------------------------------------

// Handling som velger en plass på banen og bytter til Kontoret-fanen.
function selectSlotDecision(slotId) {
  return () => {
    state.selectedSlotId = slotId;
    activateTab("tactics");
    renderApp();
  };
}

// Handling som aktiverer en ulåst historisk formasjon via den eksisterende
// formasjonsflyten (samme steg som formationSelect-endring) og går til banen.
function selectFormationDecision(formationId) {
  return () => {
    if (!isFormationUnlocked(formationId)) {
      return;
    }
    state.selectedFormationId = formationId;
    seedLineupForFormation();
    ensurePositionsForFormation();
    activateTab("tactics");
    renderApp();
  };
}

function buildNextDecisions(teamFit) {
  const decisions = [];

  if (!teamFit) {
    return decisions;
  }

  const assignments = Array.isArray(teamFit.assignments) ? teamFit.assignments : [];

  // 1) Tomme plasser i startelleveren.
  const emptySlots = assignments.filter((item) => !item.player);
  if (emptySlots.length) {
    decisions.push({
      tag: "Lag",
      title: emptySlots.length === 1 ? "Fyll én tom plass" : `Fyll ${emptySlots.length} tomme plasser`,
      detail: `Startelleveren mangler ${emptySlots.length} av ${teamFit.totalSlots} spillere.`,
      action: selectSlotDecision(emptySlots[0].slot.slotId)
    });
  }

  // 2) Feilbrukte spillere.
  const misused = assignments.filter((item) => item.player && item.fit?.status === "feilbrukt");
  if (misused.length) {
    decisions.push({
      tag: "Taktikk",
      title: misused.length === 1 ? "Én spiller er feilbrukt" : `${misused.length} spillere er feilbrukt`,
      detail: `${misused[0].player.name} passer dårlig som ${misused[0].slot.position}. Bytt rolle eller posisjon.`,
      action: selectSlotDecision(misused[0].slot.slotId)
    });
  }

  // 3) Samme spiller brukt flere ganger.
  const duplicateIds = new Set((teamFit.duplicatePlayers || []).map((player) => player.id));
  if (duplicateIds.size) {
    const duplicateAssignment = assignments.find((item) => item.player && duplicateIds.has(item.player.id));
    if (duplicateAssignment) {
      decisions.push({
        tag: "Lag",
        title: "Samme spiller står flere steder",
        detail: `${duplicateAssignment.player.name} er satt opp på mer enn én plass. Velg en annen spiller.`,
        action: selectSlotDecision(duplicateAssignment.slot.slotId)
      });
    }
  }

  // 4) Troppen mangler samlingsgrunnlag (15-spillerkravet): pek spilleren mot
  // History Go-samlingen. Leser kun roster readiness fra availability-snapshotet.
  const rosterReadiness = getAvailability().rosterReadiness;
  if (!rosterReadiness.hasEnoughUnlocked || !rosterReadiness.hasEnoughBench) {
    const gapParts = [];
    if (rosterReadiness.missingUnlocked > 0) {
      gapParts.push(`${rosterReadiness.missingUnlocked} spillere mangler i troppen (krav: ${REQUIRED_SQUAD_SIZE})`);
    } else if (rosterReadiness.missingBench > 0) {
      gapParts.push(`${rosterReadiness.missingBench} benkespillere mangler (krav: ${REQUIRED_BENCH})`);
    }
    decisions.push({
      tag: "Samling",
      title: "Samle flere spillere",
      detail: `${gapParts.join(", ")}. Besøk/synk History Go-steder og bruk opplåste spillere.`,
      action: () => activateTab("historygo")
    });
  }

  // 5) Kampdag når laget er kampklart (samme gating som kampdagpanelet:
  // komplett ellever, ingen duplikater, full benk og 15-spillerkravet).
  if (getMatchdayReadiness(teamFit).isReady && !state.matchday?.session) {
    decisions.push({
      tag: "Kampdag",
      title: "Spill neste kamp",
      detail: "Laget er kampklart. Test det historiske systemet i kamp.",
      action: playMatchday
    });
  }

  // 6) Historisk system ulåst via samlingen, men ikke i bruk: foreslå å teste
  // det. Bruker formationStatusById (satisfiedBy) – ingen egen unlock-lesing.
  const collectedFormation = getAvailability().unlockedFormations.find((formation) => {
    if (formation.id === state.selectedFormationId) {
      return false;
    }
    const status = getAvailability().formationStatusById.get(formation.id);
    return Boolean(status?.satisfiedBy);
  });
  if (collectedFormation) {
    const source = describeUnlockRequirementShort(
      getAvailability().formationStatusById.get(collectedFormation.id)?.satisfiedBy
    );
    decisions.push({
      tag: "Taktikk",
      title: "Test historisk system",
      detail: `${collectedFormation.name} er ulåst${source ? ` via ${source}` : ""}. Prøv systemet på taktikktavla.`,
      action: selectFormationDecision(collectedFormation.id)
    });
  }

  // 7) Driv klubbuken videre — eller spill ukens kamp når kampdagfasen
  // krever det (Kampdag ↔ Club Week-porten).
  if (state.clubWeekState) {
    const phaseLabel = CLUB_WEEK_PHASE_LABELS[state.clubWeekState.phase] || state.clubWeekState.phase;
    const gate = getClubWeekMatchdayGate();
    if (gate.isBlocked) {
      decisions.push({
        tag: "Klubbuke",
        title: "Spill ukens kamp",
        detail: `Uke ${state.clubWeekState.week} står i fasen «${phaseLabel}». ${gate.reason}`,
        action: () => activateTab("kamp")
      });
    } else {
      decisions.push({
        tag: "Klubbuke",
        title: "Driv klubbuken videre",
        detail: `Du er i fasen «${phaseLabel}» i uke ${state.clubWeekState.week}.`,
        action: () => {
          advanceClubWeekPhaseAction().catch(console.error);
        }
      });
    }
  }

  // 8) Uleste innbokstråder (statiske JSON-tråder + levende kontekst-tråder).
  const unreadThreads = getActiveInboxThreads().length + getUnreadInboxEventCount(getInboxState());
  if (unreadThreads > 0) {
    decisions.push({
      tag: "Innboks",
      title: unreadThreads === 1 ? "1 ulest tråd venter" : `${unreadThreads} uleste tråder`,
      detail: "Klubbens puls har meldinger som venter på et svar.",
      action: () => activateTab("inbox")
    });
  }

  // 9) Stab klar til å engasjeres.
  const hiredIds = new Set(state.teamMerits?.hiredStaffIds || []);
  const availableToHire = getUnlockedStaff().filter((member) => !hiredIds.has(member.id));
  if (availableToHire.length) {
    decisions.push({
      tag: "History Go",
      title: availableToHire.length === 1 ? "Engasjer ny stab" : `${availableToHire.length} stab er klare`,
      detail: `${availableToHire[0].name || availableToHire[0].id} er låst opp og kan engasjeres.`,
      action: () => activateTab("historygo")
    });
  }

  // 10) Treningsprogram klart til å startes.
  const availablePrograms = getAvailableTrainingPrograms().filter((entry) => entry.status === "available");
  if (availablePrograms.length) {
    decisions.push({
      tag: "Trening",
      title: "Start et treningsprogram",
      detail: `${availablePrograms.length} program kan starte badge-progresjon nå.`,
      action: () => activateTab("historygo")
    });
  }

  // 11) Lagets største svakhet fra rapporten (informativ, ingen direkte handling).
  const issues = teamFit.report?.issues;
  if (Array.isArray(issues) && issues.length) {
    decisions.push({
      tag: "Analyse",
      title: "Følg opp lagets svakhet",
      detail: issues[0],
      action: null
    });
  }

  if (!decisions.length) {
    decisions.push({
      tag: "Klart",
      title: "Laget er klart",
      detail: "Ingen åpne beslutninger akkurat nå. Driv klubbuken videre når du er klar.",
      action: null
    });
  }

  return decisions;
}

// Bygg ett beslutningselement. baseClass "decision-card" gir statuskort,
// "decision-item" gir den kompakte sidepanel-varianten. Beslutninger uten
// handling rendres som ikke-klikkbare kort.
function createDecisionElement(decision, baseClass) {
  const isCard = baseClass === "decision-card";
  const isStatic = typeof decision.action !== "function";

  const el = document.createElement(isStatic ? "div" : "button");
  el.className = isStatic ? `${baseClass} is-static` : baseClass;

  if (!isStatic) {
    el.type = "button";
    el.addEventListener("click", decision.action);
  }

  const tag = document.createElement("span");
  tag.className = isCard ? "decision-card-tag" : "decision-tag";
  tag.textContent = decision.tag;

  const title = document.createElement(isCard ? "h3" : "span");
  title.className = isCard ? "decision-card-title" : "decision-title";
  title.textContent = decision.title;

  const detail = document.createElement(isCard ? "p" : "span");
  detail.className = isCard ? "decision-card-detail" : "decision-detail";
  detail.textContent = decision.detail;

  el.append(tag, title, detail);
  return el;
}

// Sidepanel-variant: kompakt liste med de viktigste beslutningene.
function renderSideDecisions(teamFit) {
  const list = elements.sideDecisionsList;
  if (!list) {
    return;
  }

  list.innerHTML = "";
  buildNextDecisions(teamFit).slice(0, 6).forEach((decision) => {
    const li = document.createElement("li");
    li.append(createDecisionElement(decision, "decision-item"));
    list.append(li);
  });
}

// Bygg det rene kontekstobjektet som Next Action-motoren leser. Trekker kun ut
// eksisterende state (teamFit, availability, Club Week-port, innboks, trening,
// mini-sesong) — ingen ny beregning, ingen mutasjon.
function buildNextActionContext(teamFit) {
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const emptySlots = assignments.filter((item) => !item.player);
  const misused = assignments.filter((item) => item.player && item.fit?.status === "feilbrukt");
  const duplicateIds = new Set((teamFit?.duplicatePlayers || []).map((player) => player.id));
  const duplicateAssignment =
    assignments.find((item) => item.player && duplicateIds.has(item.player.id)) || null;

  const rosterReadiness = getAvailability().rosterReadiness;
  const readiness = teamFit ? getMatchdayReadiness(teamFit) : { isReady: false };
  const gate = getClubWeekMatchdayGate();
  const clubWeekState = state.clubWeekState || null;

  return {
    hasSession: Boolean(state.matchday?.session),
    opponentName: state.matchday?.session?.opponent?.name || null,
    roster: {
      enoughUnlocked: Boolean(rosterReadiness.hasEnoughUnlocked),
      enoughBench: Boolean(rosterReadiness.hasEnoughBench)
    },
    lineup: {
      totalSlots: teamFit?.totalSlots || 11,
      emptyCount: emptySlots.length,
      firstEmptySlotId: emptySlots[0]?.slot?.slotId || null,
      misused: misused.length
        ? {
            name: misused[0].player.name,
            position: misused[0].slot.position,
            slotId: misused[0].slot.slotId
          }
        : null,
      duplicate: duplicateAssignment
        ? { name: duplicateAssignment.player.name, slotId: duplicateAssignment.slot.slotId }
        : null
    },
    clubWeekGate: { isBlocked: Boolean(gate.isBlocked), reason: gate.reason || "" },
    hasTrainingChoice:
      Boolean(state.weeklyTrainingProgram?.programId) || Boolean(state.weeklyTrainingFocus?.focusId),
    matchdayReady: Boolean(readiness.isReady),
    unreadThreads: getActiveInboxThreads().length + getUnreadInboxEventCount(getInboxState()),
    hasUnseenReport: hasUnseenMatchReport(),
    miniSeasonActive: state.miniSeason?.status === "active",
    firstTime: buildFirstTimeNextActionState(teamFit, readiness),
    clubWeek: clubWeekState
      ? {
          week: clubWeekState.week,
          phase: clubWeekState.phase,
          phaseLabel: CLUB_WEEK_PHASE_LABELS[clubWeekState.phase] || clubWeekState.phase
        }
      : null
  };
}

// Oversett en handlingsbeskrivelse fra Next Action-motoren til en faktisk
// klikk-handler. Selve prioriteringen bor i den rene motoren; her bor bare
// koblingen til app-state-handlerne.
function resolveNextActionRun(action) {
  if (!action || typeof action !== "object") {
    return null;
  }
  switch (action.type) {
    case NEXT_ACTION_TYPES.TAB:
      return () => activateTab(action.tab);
    case NEXT_ACTION_TYPES.SLOT:
      return action.slotId ? selectSlotDecision(action.slotId) : null;
    case NEXT_ACTION_TYPES.MINI_SEASON:
      return () => {
        startMiniSeason();
      };
    case NEXT_ACTION_TYPES.CLUB_WEEK:
      return () => {
        advanceClubWeekPhaseAction().catch(console.error);
      };
    default:
      return null;
  }
}

// Playable Manager Flow Polish v1: én tydelig "neste handling" + sekundære
// steg, utledet av eksisterende state via den rene Next Action-motoren
// (src/football-next-action.js). Returnerer { tag, title, hint, run }.
function computeManagerNextActions(teamFit) {
  const context = buildNextActionContext(teamFit);
  return computeNextActions(context).map((descriptor) => ({
    tag: descriptor.tag,
    title: descriptor.title,
    hint: descriptor.hint,
    run: resolveNextActionRun(descriptor.action)
  }));
}

// Render "Neste handling"-stripen øverst på Oversikt: én tydelig primærhandling
// (stor, invertert knapp) + opptil to sekundære steg. Faseteksten viser hvor i
// uka treneren er. Alt er utledet av computeManagerNextActions.
function renderNextActionStrip(teamFit) {
  const primaryButton = elements.nextActionPrimary;
  const secondaryContainer = elements.nextActionSecondary;
  if (!primaryButton || !secondaryContainer) {
    return;
  }

  if (elements.nextActionPhase) {
    const week = Number(state.clubWeekState?.week) || 1;
    const phaseLabel = state.clubWeekState
      ? CLUB_WEEK_PHASE_LABELS[state.clubWeekState.phase] || state.clubWeekState.phase
      : "Oppsett";
    elements.nextActionPhase.textContent = `Uke ${week} · ${phaseLabel}`;
  }

  renderFirstTimePlaythrough(teamFit);

  const actions = computeManagerNextActions(teamFit);
  const primary = actions[0] || {
    tag: "Klart",
    title: "Laget er klart",
    hint: "Ingen åpne grep akkurat nå. Driv klubbuken videre når du er klar.",
    run: null
  };

  if (elements.nextActionPrimaryTag) elements.nextActionPrimaryTag.textContent = primary.tag;
  if (elements.nextActionPrimaryTitle) elements.nextActionPrimaryTitle.textContent = primary.title;
  if (elements.nextActionPrimaryHint) elements.nextActionPrimaryHint.textContent = primary.hint;
  primaryButton.disabled = typeof primary.run !== "function";
  // Onclick-property (ikke addEventListener) hindrer at handlere hoper seg opp
  // mellom renders.
  primaryButton.onclick = typeof primary.run === "function" ? primary.run : null;

  secondaryContainer.innerHTML = "";
  actions.slice(1, 3).forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next-action-chip";
    const tag = document.createElement("span");
    tag.className = "next-action-chip-tag";
    tag.textContent = action.tag;
    const title = document.createElement("span");
    title.className = "next-action-chip-title";
    title.textContent = action.title;
    button.append(tag, title);
    if (typeof action.run === "function") {
      button.addEventListener("click", action.run);
    } else {
      button.disabled = true;
    }
    secondaryContainer.append(button);
  });
}

// Statuskort-strip på hovedskjermen. Første aktive beslutning fremheves.
function renderDecisionCards(teamFit) {
  const container = elements.decisionCards;
  if (!container) {
    return;
  }

  container.innerHTML = "";
  buildNextDecisions(teamFit).slice(0, 4).forEach((decision, index) => {
    const card = createDecisionElement(decision, "decision-card");
    if (index === 0 && typeof decision.action === "function") {
      card.classList.add("is-primary");
    }
    container.append(card);
  });
}

// Levende status i avdelingene: innboks-puls, stallstørrelse, medietrykk og
// styretillit. Leser eksisterende state direkte. Trygg mot manglende elementer.
function renderDepartments() {
  if (elements.inboxPulseCount) {
    // Uleste tråder = statiske JSON-tråder + levende kontekst-tråder (Inbox Event v1).
    const unread = getActiveInboxThreads().length + getUnreadInboxEventCount(getInboxState());
    elements.inboxPulseCount.textContent = String(unread);
  }

  if (elements.adminSquadCount) {
    elements.adminSquadCount.textContent = String(getUnlockedPlayers().length);
  }

  if (elements.adminStaffCount) {
    const count = getHiredStaff().length;
    elements.adminStaffCount.textContent = `${count} ${count === 1 ? "ansatt" : "ansatte"}`;
  }

  const media = state.clubWeekState?.mediaPressure;
  if (elements.marketMediaValue) {
    elements.marketMediaValue.textContent = Number.isFinite(media) ? String(media) : "–";
  }
  if (elements.marketReputationNote && Number.isFinite(media)) {
    elements.marketReputationNote.textContent =
      media >= 65
        ? "Høyt medietrykk. Omdømmet er under press – styr forventningene aktivt."
        : media <= 40
          ? "Lavt medietrykk. Det er rolig rundt klubben akkurat nå."
          : "Medietrykket er normalt. Omdømmet følger resultatene dine.";
  }

  const trust = state.clubWeekState?.boardTrust;
  if (elements.boardTrustValue) {
    elements.boardTrustValue.textContent = Number.isFinite(trust) ? String(trust) : "–";
  }
  if (elements.boardTrustFill && Number.isFinite(trust)) {
    elements.boardTrustFill.style.width = `${Math.max(0, Math.min(100, trust))}%`;
  }
  if (elements.boardTrustNote && Number.isFinite(trust)) {
    elements.boardTrustNote.textContent =
      trust >= 65
        ? "Styret har solid tillit til treneren."
        : trust <= 35
          ? "Styret er bekymret. Tilliten er lav – det trengs resultater."
          : "Styret følger utviklingen tett. Tilliten er moderat.";
  }
}

function renderTeamSummary(teamFit) {
  // Scorepanelet skrives fra teamFit (getTeamFit). Etter steg 7b er teamFit
  // selv TS-beregnet når motoren er lastet, så hele Laganalyse-panelet (score,
  // metrikker, rapport, ellever) kommer nå fra én og samme motor –
  // calculateTeamFit – i stedet for å blande inn dashboard-pipelinens setupScore.
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
  elements.relationshipScore.textContent = teamFit.metrics.relationshipScore;
}

function renderReport(teamFit) {
  if (!teamFit) {
    return;
  }

  elements.reportSummary.textContent = teamFit.report.summary;
  renderList(elements.strengthsList, teamFit.report.strengths);
  renderList(elements.issuesList, teamFit.report.issues);
  renderCoachContextStatus(teamFit.coachContext);
  renderRelationships(teamFit);
}

// Relasjoner mellom rollene (kun visning): gjør relasjonsmotorens resultat
// synlig i lagrapporten. Leser teamFit.relationships (samme kilde som
// relationshipScore i metrikkpanelet) – beregner ingenting selv. Forklarer
// HVORFOR roller hjelper eller blokkerer hverandre, i tråd med prinsippet om
// at relasjoner er en del av taktikken, ikke en spillerstyrke.
function renderRelationships(teamFit) {
  if (!elements.relationshipList || !elements.relationshipHeadline) {
    return;
  }

  const relationships = teamFit?.relationships;
  const positives = Array.isArray(relationships?.positiveRelations) ? relationships.positiveRelations : [];
  const negatives = Array.isArray(relationships?.negativeRelations) ? relationships.negativeRelations : [];

  elements.relationshipList.innerHTML = "";

  // Ufullstendig ellever: relasjoner krever komplette rollepar for å bety noe.
  if (!relationships || teamFit.completeCount < teamFit.totalSlots) {
    elements.relationshipHeadline.textContent =
      "Fyll laget for å se hvordan rollene støtter hverandre.";
    return;
  }

  const score = relationships.relationshipScore;
  if (score >= 76) {
    elements.relationshipHeadline.textContent =
      `Relasjonsscore ${score}: rollene løfter hverandre og havner oftere i riktige situasjoner.`;
  } else if (score < 50) {
    elements.relationshipHeadline.textContent =
      `Relasjonsscore ${score}: flere roller mangler medspillerne de trenger for å fungere.`;
  } else {
    elements.relationshipHeadline.textContent =
      `Relasjonsscore ${score}: noen koblinger virker, andre roller står litt isolert.`;
  }

  const appendRelation = (relation, tone, sign) => {
    const entry = document.createElement("article");
    entry.className = `relationship-entry is-${tone}`;

    const title = document.createElement("p");
    title.className = "relationship-title";
    const points = Number.isFinite(relation.points) ? ` (${sign}${relation.points})` : "";
    title.textContent = `${relation.title}${points}`;
    entry.append(title);

    if (relation.explanation) {
      const explanation = document.createElement("p");
      explanation.className = "relationship-explanation";
      explanation.textContent = relation.explanation;
      entry.append(explanation);
    }

    elements.relationshipList.append(entry);
  };

  positives.forEach((relation) => appendRelation(relation, "positive", "+"));
  negatives.forEach((relation) => appendRelation(relation, "negative", "−"));

  if (positives.length === 0 && negatives.length === 0) {
    const entry = document.createElement("p");
    entry.className = "relationship-explanation muted-text";
    entry.textContent = "Ingen tydelige relasjoner mellom rollene ennå.";
    elements.relationshipList.append(entry);
  }
}

// Liten coachContext-status i lagrapporten (kun visning): formasjonstilvenning,
// trenerforståelse, taktisk læringsfart og stab. Ingen ny taktikktavle eller
// stort panel – bruker den eksisterende lagrapporten.
function renderCoachContextStatus(coachContext) {
  if (!elements.coachContextHeadline) {
    return;
  }

  if (!coachContext) {
    elements.coachContextHeadline.textContent =
      "Engasjer stab for å se hvordan trenerteamet støtter formasjonen.";
    [
      elements.coachContextFamiliarity,
      elements.coachContextUnderstanding,
      elements.coachContextLearning,
      elements.coachContextStaff
    ].forEach((node) => {
      if (node) {
        node.textContent = "–";
      }
    });
    return;
  }

  const report = buildCoachContextReport({ coachContext, formation: getFormation() });
  elements.coachContextHeadline.textContent = report.headline;

  if (elements.coachContextFamiliarity) {
    elements.coachContextFamiliarity.textContent = String(coachContext.formationFamiliarity);
  }
  if (elements.coachContextUnderstanding) {
    elements.coachContextUnderstanding.textContent = String(coachContext.coachUnderstanding);
  }
  if (elements.coachContextLearning) {
    elements.coachContextLearning.textContent = String(coachContext.tacticalLearningSpeed);
  }
  if (elements.coachContextStaff) {
    elements.coachContextStaff.textContent = String(coachContext.staffCount);
  }
}

// ----------------------------------------------------------------------------
// Badge-effekter i laganalysen (kun visning)
// PR #30 koblet opptjente treningsbadges inn i lagfitmotoren, og
// calculateTeamFit returnerer nå badgeEffects ved siden av metrics/baseMetrics.
// Her viser vi disse effektene i UI slik at brukeren ser hvilke badges som
// nudger lagets metrics. Ren render – ingen endring i badge-effektmotor,
// lagfitmotor, unlock-system eller progresjon.
// ----------------------------------------------------------------------------

// Norske visningsnavn for lagmetrikkene som badge-effekter kan påvirke.
const BADGE_EFFECT_METRIC_LABELS = {
  individualFitAverage: "Individuell fit",
  roleFitAverage: "Rollefit",
  tacticFitAverage: "Taktisk fit",
  balanceScore: "Balanse",
  widthScore: "Bredde",
  depthScore: "Dybde",
  buildUpScore: "Oppbygging",
  pressScore: "Press",
  restDefenseScore: "Restforsvar"
};

// Norske nivåetiketter for badge-nivåene.
const BADGE_EFFECT_LEVEL_LABELS = { bronze: "Bronse", silver: "Sølv", gold: "Gull" };

function formatBadgeEffectMetricLabel(metric) {
  return BADGE_EFFECT_METRIC_LABELS[metric] || metric;
}

function formatBadgeEffectMetrics(metrics) {
  return metrics
    .map((entry) =>
      Number.isFinite(entry.amount)
        ? `${formatBadgeEffectMetricLabel(entry.metric)} (+${entry.amount})`
        : formatBadgeEffectMetricLabel(entry.metric)
    )
    .join(", ");
}

// Bygg badge-sentrerte visningseffekter fra opptjente badges. Tar høyeste
// opptjente nivå per familie (samme prioritering som lagfitmotoren bruker) og
// regner ut familiens metrikkeffekter via den eksporterte motorfunksjonen, slik
// at visningen alltid speiler det motoren faktisk legger oppå metrikkene.
function buildBadgeEffectDisplayItems() {
  const highestByFamily = new Map();

  getEarnedBadges().forEach((badge) => {
    if (!badge || !badge.familyId) {
      return;
    }

    const rank = BADGE_LEVEL_ORDER[badge.level] || 0;
    const current = highestByFamily.get(badge.familyId);

    if (!current || rank > (BADGE_LEVEL_ORDER[current.level] || 0)) {
      highestByFamily.set(badge.familyId, badge);
    }
  });

  const items = [];

  highestByFamily.forEach((badge) => {
    const familyEffects = calculateBadgeMetricEffects({
      familyLevels: { [badge.familyId]: badge.level }
    });

    const metrics = Object.entries(familyEffects)
      .filter(([, amount]) => Number(amount) > 0)
      .map(([metric, amount]) => ({ metric, amount }));

    if (metrics.length === 0) {
      return;
    }

    items.push({
      name: badge.familyName || badge.familyId,
      level: BADGE_EFFECT_LEVEL_LABELS[badge.level] || badge.level || null,
      summary: badge.description || null,
      metrics
    });
  });

  return items;
}

// Vis hvilke opptjente badges som påvirker laget, og hvilke metrics de nudger.
// Uten aktive effekter vises en tydelig tom-tekst. Bruker textContent (ikke
// innerHTML) for alt brukernært innhold.
function renderBadgeEffects(teamFit) {
  const panel = elements.badgeEffectsSummary;
  if (!panel) {
    return;
  }

  panel.innerHTML = "";

  const badgeEffects = teamFit?.badgeEffects;
  const hasActiveEffects =
    badgeEffects &&
    typeof badgeEffects === "object" &&
    Object.values(badgeEffects).some((amount) => Number(amount) > 0);

  if (!hasActiveEffects) {
    const empty = document.createElement("p");
    empty.className = "badge-effect-empty";
    empty.textContent = "Ingen badge-effekter aktive ennå.";
    panel.append(empty);
    return;
  }

  // Eventuell grunnscore før badges og samlet bonus til lagscore vises bare hvis
  // lagfitmotoren faktisk leverer feltene.
  if (Number.isFinite(teamFit?.baseTeamScore)) {
    const base = document.createElement("p");
    base.className = "badge-effect-meta";
    base.textContent = `Grunnscore før badges: ${teamFit.baseTeamScore}`;
    panel.append(base);
  }

  if (Number.isFinite(teamFit?.teamScoreBonus) && teamFit.teamScoreBonus !== 0) {
    const bonus = document.createElement("p");
    bonus.className = "badge-effect-meta";
    bonus.textContent = `Badge-bonus til lagscore: +${teamFit.teamScoreBonus}`;
    panel.append(bonus);
  }

  // Foretrekk en badge-sentrert visning (navn + nivå). Faller tilbake til en
  // metrikk-sentrert visning hvis vi ikke finner berikede badges, slik at
  // panelet aldri står tomt når effekter er aktive.
  let effects = buildBadgeEffectDisplayItems();

  if (effects.length === 0) {
    effects = Object.entries(badgeEffects)
      .filter(([, amount]) => Number(amount) > 0)
      .map(([metric, amount]) => ({
        name: formatBadgeEffectMetricLabel(metric),
        level: null,
        summary: null,
        metrics: [{ metric, amount: Number(amount) }]
      }));
  }

  effects.slice(0, 6).forEach((effect) => {
    const card = document.createElement("article");
    card.className = "badge-effect-card";

    const title = document.createElement("p");
    title.className = "badge-effect-title";
    title.textContent = effect.name;
    card.append(title);

    if (effect.level) {
      const meta = document.createElement("p");
      meta.className = "badge-effect-meta";
      meta.textContent = `Nivå: ${effect.level}`;
      card.append(meta);
    }

    if (effect.metrics.length > 0) {
      const metricsEl = document.createElement("p");
      metricsEl.className = "badge-effect-metrics";
      metricsEl.textContent = `Påvirker: ${formatBadgeEffectMetrics(effect.metrics)}`;
      card.append(metricsEl);
    }

    if (effect.summary) {
      const summaryEl = document.createElement("p");
      summaryEl.className = "badge-effect-meta";
      summaryEl.textContent = effect.summary;
      card.append(summaryEl);
    }

    panel.append(card);
  });
}

// Kampklar-status i kampdagpanelet: grønn "Klar for kampdag" når laget er
// gyldig, ellers en tydelig forklaring på hva som mangler. Spill kamp-knappen
// følger samme status, og deaktiveres også mens en kamp pågår.
function renderMatchdayReadiness(teamFit) {
  const el = elements.matchdayReadiness;
  const { isReady, reasons } = getMatchdayReadiness(teamFit);
  const session = state.matchday?.session || null;

  if (el) {
    if (session) {
      el.dataset.ready = "true";
      el.textContent = `Kamp pågår mot ${session.opponent?.name || "ukjent motstander"}. Ta managergrepene under.`;
    } else {
      el.dataset.ready = isReady ? "true" : "false";
      el.textContent = isReady
        ? "Klar for kampdag: 11 gyldige startere og minst 4 på benken."
        : `Ikke kampklar ennå: ${reasons.join(" ")}`;
    }
  }

  if (elements.playMatchdayButton) {
    elements.playMatchdayButton.disabled = !isReady || Boolean(session);
  }
}

// Liten hjelpemetode for meta-linjer i kampdagkortene.
function appendMatchdayMeta(parent, text, className = "matchday-meta") {
  const el = document.createElement("p");
  el.className = className;
  el.textContent = text;
  parent.append(el);
}

function appendMatchdaySubheading(parent, text) {
  const heading = document.createElement("h4");
  heading.className = "matchday-subheading";
  heading.textContent = text;
  parent.append(heading);
}

function appendMatchdayList(parent, lines) {
  const list = document.createElement("ul");
  list.className = "matchday-list";
  lines.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    list.append(item);
  });
  parent.append(list);
}

// Norske trykk-etiketter for hendelser.
const MATCHDAY_PRESSURE_LABELS = { low: "Lavt trykk", medium: "Middels trykk", high: "Høyt trykk" };

// Tatt managergrep med tone-farget konsekvens, brukt både underveis og i
// sluttrapporten.
function appendMatchdayDecisionLog(parent, decisions, heading) {
  if (!Array.isArray(decisions) || decisions.length === 0) {
    return;
  }

  appendMatchdaySubheading(parent, heading);

  decisions.forEach((decision) => {
    const entry = document.createElement("div");
    const tone = ["positive", "neutral", "negative"].includes(decision.tone) ? decision.tone : "neutral";
    entry.className = `matchday-decision-entry is-${tone}`;

    const title = document.createElement("p");
    title.className = "matchday-decision-title";
    title.textContent = `${decision.eventTitle}: ${decision.optionLabel}`;
    entry.append(title);

    if (decision.feedback) {
      const feedback = document.createElement("p");
      feedback.className = "matchday-decision-feedback";
      feedback.textContent = decision.feedback;
      entry.append(feedback);
    }

    parent.append(entry);
  });
}

// Pre_match: motstanderprofil, valgt system/taktikk, kampplan og avspark.
function renderMatchdaySessionPreMatch(container, session) {
  const card = document.createElement("article");
  card.className = "matchday-result-card";

  appendMatchdayMeta(card, `Kampdag mot ${session.opponent?.name || "Ukjent motstander"}`);

  const phase = document.createElement("p");
  phase.className = "matchday-phase";
  phase.textContent = "Kampplan før avspark";
  card.append(phase);

  const opponent = session.opponent || {};

  // Playable Manager Flow Polish v1: kompakt kampbrief øverst — motstander, stil,
  // nøkkelduell, én fare, én mulighet og anbefalt forberedelse + statuschip, slik
  // at treneren intuitivt ser «dette er laget jeg møter, dette prøver de på, dette
  // må jeg passe på» før han graver i de fulle profilene under. Rene utdrag fra
  // den eksisterende motstander-/matchup-dataen — ingen ny motor.
  {
    const histMatchup =
      session.historicalMatchup && typeof session.historicalMatchup === "object" ? session.historicalMatchup : null;
    const formationMatchup =
      session.formationMatchup && typeof session.formationMatchup === "object" ? session.formationMatchup : null;
    const firstText = (arr) => {
      const item = (Array.isArray(arr) ? arr : [])[0];
      if (!item) return null;
      return typeof item === "string" ? item : item.text || null;
    };

    const styleParts = [];
    if (opponent.style) styleParts.push(opponent.style);
    if (opponent.archetypeName) styleParts.push(opponent.archetypeName);
    if (opponent.tacticalSchool) styleParts.push(opponent.tacticalSchool);

    const keyDuell = (Array.isArray(opponent.keyBattles) ? opponent.keyBattles : [])[0] || null;
    const danger =
      firstText(histMatchup?.vulnerabilities) ||
      firstText(formationMatchup?.risks) ||
      (Array.isArray(opponent.strengths) ? opponent.strengths : [])[0] ||
      (Array.isArray(opponent.pressurePoints) ? opponent.pressurePoints : [])[0] ||
      null;
    const opportunity =
      firstText(histMatchup?.advantages) ||
      firstText(formationMatchup?.advantages) ||
      (Array.isArray(opponent.weaknesses) ? opponent.weaknesses : [])[0] ||
      null;
    const prep =
      firstText(histMatchup?.recommendedPreparation) ||
      firstText(formationMatchup?.suggestions) ||
      (Array.isArray(opponent.managerHints) ? opponent.managerHints : [])[0] ||
      null;

    const finalStrength = Number(session.strengthSnapshot?.finalStrength) || 0;
    const status =
      finalStrength < 50 ? { tone: "risk", text: "Risiko · lav lagstyrke" } : { tone: "ready", text: "Klar for kamp" };

    const brief = document.createElement("div");
    brief.className = "matchday-brief";

    const statusChip = document.createElement("span");
    statusChip.className = "matchday-brief-status";
    statusChip.dataset.tone = status.tone;
    statusChip.textContent = status.text;
    brief.append(statusChip);

    const dl = document.createElement("dl");
    dl.className = "matchday-brief-list";
    const row = (label, value) => {
      if (!value) return;
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      dl.append(dt, dd);
    };
    row("Motstander", opponent.name || "Ukjent motstander");
    row("Stil", styleParts.join(" · "));
    row("Nøkkelduell", keyDuell);
    row("Én fare", danger);
    row("Én mulighet", opportunity);
    row("Anbefalt forberedelse", prep);
    brief.append(dl);
    card.append(brief);
  }

  // Historical Opponent Archetypes v1: når motstanderen er en historisk stil-
  // profil, vis en kompakt kampforberedelses-boks (historisk stil, formasjon,
  // taktisk skole, nøkkelduell, managerhint) FØR den ordinære profilen. Rent
  // tekstlig/faglig referanse — ingen logoer/drakter/emblemer.
  if (opponent.archetypeName || opponent.tacticalSchool) {
    appendMatchdaySubheading(card, "Historisk stil-motstander");
    const histLines = [];
    if (opponent.archetypeName) histLines.push(`Arketyp: ${opponent.archetypeName}`);
    if (opponent.era) histLines.push(`Epoke: ${opponent.era}`);
    if (opponent.tacticalSchool) histLines.push(`Taktisk skole: ${opponent.tacticalSchool}`);
    if (opponent.inPossessionShape) histLines.push(`Med ball: ${opponent.inPossessionShape}`);
    if (opponent.outOfPossessionShape) histLines.push(`Uten ball: ${opponent.outOfPossessionShape}`);
    (Array.isArray(opponent.keyBattles) ? opponent.keyBattles : []).slice(0, 2).forEach((line) => {
      histLines.push(`Nøkkelduell: ${line}`);
    });
    (Array.isArray(opponent.managerHints) ? opponent.managerHints : []).slice(0, 2).forEach((line) => {
      histLines.push(`Managerhint: ${line}`);
    });
    if (opponent.historicalNote) histLines.push(`Historisk: ${opponent.historicalNote}`);
    appendMatchdayList(card, histLines);

    const opponentFormation = state.formations.find((candidate) => candidate.id === opponent.formationId) || null;
    const opponentFormationKnowledge = opponent.formationId ? state.formationKnowledgeById[opponent.formationId] : null;
    const opponentFormationVm = createFormationKnowledgeViewModel({
      formation: opponentFormation,
      knowledge: opponentFormationKnowledge,
      roleIndex: state.hgRoleTypeIndex,
      opponentIndex: state.historicalOpponentIndex
    });
    if (opponentFormationVm) {
      appendMatchdaySubheading(card, "Formasjonen bak stilen");
      const formationLines = [
        `${opponentFormationVm.displayName}: ${opponentFormationVm.corePrinciple}`
      ];
      opponentFormationVm.matchupSignals.slice(0, 2).forEach((line) => {
        formationLines.push(`Se etter: ${line}`);
      });
      if (opponentFormationVm.managerHints[0]) {
        formationLines.push(`Managerhint: ${opponentFormationVm.managerHints[0]}`);
      }
      appendMatchdayList(card, formationLines);
    }
  }

  // Stil-matchup (Historical Opponent Archetypes v1): hvordan den historiske
  // stilen møter lagets ledd. Vises bare for historiske arketyper.
  const histMatchup = session.historicalMatchup;
  if (histMatchup && typeof histMatchup === "object") {
    appendMatchdaySubheading(card, "Stil-matchup");
    const hmLines = [histMatchup.summary];
    (Array.isArray(histMatchup.advantages) ? histMatchup.advantages : []).slice(0, 2).forEach((a) => {
      hmLines.push(`Fordel: ${a.text}`);
    });
    (Array.isArray(histMatchup.vulnerabilities) ? histMatchup.vulnerabilities : []).slice(0, 2).forEach((v) => {
      hmLines.push(`Sårbarhet: ${v.text}`);
    });
    (Array.isArray(histMatchup.recommendedPreparation) ? histMatchup.recommendedPreparation : []).slice(0, 2).forEach((p) => {
      hmLines.push(`Forberedelse: ${p}`);
    });
    appendMatchdayList(card, hmLines);
  }

  // Motstanderprofil.
  appendMatchdaySubheading(card, "Motstanderprofil");
  const opponentLines = [];
  if (opponent.style) {
    opponentLines.push(`Stil: ${opponent.style}`);
  }
  (Array.isArray(opponent.strengths) ? opponent.strengths : []).forEach((line) => {
    opponentLines.push(`Styrke: ${line}`);
  });
  (Array.isArray(opponent.weaknesses) ? opponent.weaknesses : []).forEach((line) => {
    opponentLines.push(`Svakhet: ${line}`);
  });
  (Array.isArray(opponent.pressurePoints) ? opponent.pressurePoints : []).forEach((line) => {
    opponentLines.push(`Setter press på: ${line}`);
  });
  appendMatchdayList(card, opponentLines);

  // Formasjons-matchup (Formation Knowledge Engine): hvordan ditt system står mot
  // motstanderens spillestil. Vises bare når valgt formasjon har kunnskapsoppslag.
  const matchup = session.formationMatchup;
  if (matchup) {
    appendMatchdaySubheading(card, "Formasjons-matchup");
    const leanText = matchup.lean === "favourable"
      ? "Gunstig"
      : matchup.lean === "risky"
        ? "Risikabel"
        : "Balansert";
    const matchupLines = [`${leanText}: ${matchup.summary}`];
    (Array.isArray(matchup.advantages) ? matchup.advantages : []).forEach((a) => {
      matchupLines.push(`Fordel: ${a.text}`);
    });
    (Array.isArray(matchup.risks) ? matchup.risks : []).forEach((r) => {
      matchupLines.push(`Risiko: ${r.text}`);
    });
    (Array.isArray(matchup.suggestions) ? matchup.suggestions : []).forEach((s) => {
      matchupLines.push(`Vurder: ${s}`);
    });
    appendMatchdayList(card, matchupLines);
  }

  // Eget system og kampplan.
  appendMatchdaySubheading(card, "Din kampplan");
  const formation = session.formationSnapshot || {};
  const formationParts = [formation.name || "Ukjent formasjon"];
  if (formation.baseShape) formationParts.push(formation.baseShape);
  if (formation.tacticalSchool) formationParts.push(formation.tacticalSchool);
  const planLines = [`Formasjon: ${formationParts.join(" · ")}`];
  if (session.tacticSnapshot?.name) {
    planLines.push(`Taktikk: ${session.tacticSnapshot.name}`);
  }
  planLines.push(`Lagstyrke: ${Number(session.strengthSnapshot?.finalStrength) || 0}`);
  // Role Familiarity Engine v1: gjør den lille kontinuitetsbonusen synlig og
  // forklart når den faktisk slår ut.
  const familiarityBonus = Number(session.strengthSnapshot?.modifiers?.roleFamiliarityBonus) || 0;
  if (familiarityBonus > 0) {
    planLines.push(`Rolleerfaring: +${familiarityBonus} lagstyrke fra kontinuitet i rollene`);
  }
  const coach = session.coachSnapshot;
  if (coach) {
    planLines.push(
      `Trenerstøtte: systemforståelse ${coach.coachUnderstanding}, formasjonstilvenning ${coach.formationFamiliarity}`
    );
  }
  if (session.trainingFocus) {
    const contextNote = session.trainingFocus.contextRelevant
      ? " · kontekstuelt relevant mot matchupen (ekstra uttelling)"
      : "";
    planLines.push(
      `Ukens treningsfokus: ${session.trainingFocus.name} · staff-støtte ${session.trainingFocus.staffSupport?.label?.toLowerCase() || "svak"} · ${session.trainingFocus.effectHint}${contextNote}`
    );
  }
  appendMatchdayList(card, planLines);

  // Svak forutsetning vises tydelig før avspark, uten å blokkere.
  const finalStrength = Number(session.strengthSnapshot?.finalStrength) || 0;
  if (finalStrength < 50) {
    const warning = document.createElement("p");
    warning.className = "matchday-weak-warning";
    warning.textContent = "Svak forutsetning: laget går inn i kampen med lav lagstyrke.";
    card.append(warning);
  }

  const kickoff = document.createElement("button");
  kickoff.type = "button";
  kickoff.className = "matchday-kickoff-button";
  kickoff.textContent = "Start kampen";
  kickoff.addEventListener("click", () => {
    startMatchdayKickoff();
  });
  card.append(kickoff);

  container.append(card);
}

// Event-fase: kampstatus, tidligere grep med konsekvens, aktuell hendelse og
// managerens valgknapper.
function renderMatchdaySessionEvent(container, session, eventIndex) {
  const card = document.createElement("article");
  card.className = "matchday-result-card";

  appendMatchdayMeta(card, `Kamp mot ${session.opponent?.name || "Ukjent motstander"}`);

  const phase = document.createElement("p");
  phase.className = "matchday-phase";
  phase.textContent = `Hendelse ${eventIndex + 1} av ${session.events.length}`;
  card.append(phase);

  // Tidligere grep med kort konsekvens.
  appendMatchdayDecisionLog(card, session.decisions, "Grep så langt");

  const event = session.events[eventIndex];

  const eventCard = document.createElement("div");
  eventCard.className = `matchday-event-card is-pressure-${event.pressure || "medium"}`;

  const pressure = document.createElement("p");
  pressure.className = "matchday-event-pressure";
  pressure.textContent = MATCHDAY_PRESSURE_LABELS[event.pressure] || MATCHDAY_PRESSURE_LABELS.medium;
  eventCard.append(pressure);

  const title = document.createElement("h4");
  title.className = "matchday-event-title";
  title.textContent = event.title;
  eventCard.append(title);

  const text = document.createElement("p");
  text.className = "matchday-event-text";
  text.textContent = event.text;
  eventCard.append(text);

  const options = document.createElement("div");
  options.className = "matchday-decision-options";
  (event.options || []).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "matchday-decision-button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      chooseMatchdayDecision(option.id);
    });
    options.append(button);
  });
  eventCard.append(options);

  card.append(eventCard);
  container.append(card);
}

// Sluttrapport: v1-kjernen (resultat, xG, nøkkelfaktorer, analyse) pluss
// v0.2-feltene (managergrep, beste/svakeste grep, systemdom, avgjørende
// lagdel, råd og History Go-hint) når de finnes.
function renderMatchdayReport(container, lastMatch) {
  const report = createMatchReport(lastMatch);
  if (!report || typeof report !== "object") {
    const empty = document.createElement("p");
    empty.className = "matchday-empty muted-text";
    empty.textContent = "Ingen kamp spilt ennå.";
    container.append(empty);
    return;
  }

  const card = document.createElement("article");
  card.className = "matchday-result-card matchday-report-card";

  const safeOutcome = ["win", "draw", "loss"].includes(report.outcome) ? report.outcome : "draw";
  const safeOutcomeLabel = { win: "Seier", draw: "Uavgjort", loss: "Tap" }[safeOutcome];

  // Playable Manager Flow Polish v1: rapporten leder med det dramatiske (resultat
  // + hovedforklaring + de avgjørende faktorene + det kampen lærte deg), og
  // folder den fulle datadumpen bak en details-skuff. Ingen informasjon fjernes —
  // den prioriteres.

  // 1) Resultat øverst: stor score + fargekodet utfall.
  const score = document.createElement("p");
  score.className = "matchday-score";
  score.textContent = report.scoreLine || "0–0";
  card.append(score);

  const outcome = document.createElement("p");
  outcome.className = `matchday-outcome is-${safeOutcome}`;
  outcome.textContent = safeOutcomeLabel;
  card.append(outcome);

  // 2) Kompakt kontekst: motstander (+ stil/arketyp) og eget system på to linjer.
  const opponentParts = [report.opponentName || "Ukjent motstander"];
  if (report.opponentStyle) opponentParts.push(report.opponentStyle);
  if (report.opponentArchetype) opponentParts.push(report.opponentArchetype);
  if (report.opponentTacticalSchool) opponentParts.push(report.opponentTacticalSchool);
  appendMatchdayMeta(card, `Motstander: ${opponentParts.join(" · ")}`);

  const formationParts = [report.formationName || "Ukjent formasjon"];
  if (report.baseShape) formationParts.push(report.baseShape);
  if (report.tacticName) formationParts.push(report.tacticName);
  appendMatchdayMeta(card, `Ditt system: ${formationParts.join(" · ")}`);

  appendMatchdayMeta(
    card,
    `xG ${report.expectedGoalsLine || "0 – 0"} · lagstyrke ${Number.isFinite(Number(report.teamStrength)) ? report.teamStrength : 0}`
  );

  // 3) Hovedforklaring (Match Explanation v1.5).
  const explanation = report.explanation && typeof report.explanation === "object" ? report.explanation : null;
  if (explanation?.headline) {
    const headline = document.createElement("p");
    headline.className = "matchday-explanation-headline";
    headline.textContent = explanation.headline;
    card.append(headline);
  }
  if (explanation?.resultSummary) {
    appendMatchdayMeta(card, explanation.resultSummary);
  }

  // 4) Tre avgjørende faktorer.
  const decisiveFactors = Array.isArray(explanation?.decisiveFactors) ? explanation.decisiveFactors : [];
  if (decisiveFactors.length > 0) {
    appendMatchdaySubheading(card, "Avgjørende faktorer");
    appendMatchdayList(card, decisiveFactors.slice(0, 3));
  }

  // 5) Det kampen lærte deg: én taktisk, én rolle-/relasjons- og én
  // trenings-/off-pitch-læring, kuratert fra forklaringen.
  if (explanation) {
    const learnings = [];
    const tacticLearn = (explanation.tacticalFactors || [])[0] || (explanation.historicalFactors || [])[0];
    if (tacticLearn) learnings.push(`Taktisk: ${tacticLearn}`);
    const relationLearn = (explanation.relationshipFactors || [])[0];
    if (relationLearn) learnings.push(`Relasjoner: ${relationLearn}`);
    const offPitchLearn = (explanation.trainingFactors || [])[0] || (explanation.offPitchFactors || [])[0];
    if (offPitchLearn) learnings.push(`Trening/off-pitch: ${offPitchLearn}`);
    if (!learnings.length && Array.isArray(explanation.learningPoints)) {
      explanation.learningPoints.slice(0, 3).forEach((line) => learnings.push(line));
    }
    if (learnings.length > 0) {
      appendMatchdaySubheading(card, "Det kampen lærte deg");
      appendMatchdayList(card, learnings);
    }
  }

  // 6) Neste uke bør du vurdere …
  const nextWeek = [];
  (Array.isArray(explanation?.nextWeekSuggestions) ? explanation.nextWeekSuggestions : []).slice(0, 2).forEach((line) => nextWeek.push(line));
  if (!nextWeek.length && report.nextWeekAdvice) nextWeek.push(report.nextWeekAdvice);
  if (nextWeek.length > 0) {
    appendMatchdaySubheading(card, "Neste uke bør du vurdere");
    appendMatchdayList(card, nextWeek);
  }

  // 7) Full kampanalyse i en foldet skuff: detaljene er der, men dominerer ikke.
  const drawer = document.createElement("details");
  drawer.className = "matchday-detail-drawer";
  const drawerSummary = document.createElement("summary");
  drawerSummary.textContent = "Full kampanalyse";
  drawer.append(drawerSummary);
  const body = document.createElement("div");
  drawer.append(body);

  if (report.eraName) {
    appendMatchdayMeta(body, `Epoke: ${report.eraName}`);
  }

  // Fulle forklaringslister (kuraterte høydepunkter ligger over).
  const explanationSections = [
    ["Taktisk bilde", explanation?.tacticalFactors],
    ["Historisk stil-matchup", explanation?.historicalFactors],
    ["Relasjoner", explanation?.relationshipFactors],
    ["Trening", explanation?.trainingFactors],
    ["Utenfor banen", explanation?.offPitchFactors],
    ["Læringspunkter", explanation?.learningPoints]
  ];
  explanationSections.forEach(([title, items]) => {
    if (Array.isArray(items) && items.length > 0) {
      appendMatchdaySubheading(body, title);
      appendMatchdayList(body, items);
    }
  });

  // Managergrep med konsekvens (v0.2).
  appendMatchdayDecisionLog(body, report.decisions, "Managergrep i kampen");

  // Beste/svakeste grep (v0.2).
  if (report.bestDecision || report.worstDecision) {
    appendMatchdaySubheading(body, "Managerdommen");
    const verdictLines = [];
    if (report.bestDecision) {
      verdictLines.push(`Beste grep: ${report.bestDecision.label} (${report.bestDecision.eventTitle}).`);
    }
    if (report.worstDecision) {
      verdictLines.push(`Svakeste grep: ${report.worstDecision.label} (${report.worstDecision.eventTitle}).`);
    }
    appendMatchdayList(body, verdictLines);
  }

  // Hvorfor systemet fungerte eller ikke (v0.2).
  if (report.formationVerdict) {
    appendMatchdaySubheading(body, "Systemdommen");
    const verdict = document.createElement("p");
    verdict.className = "matchday-meta";
    verdict.textContent = report.formationVerdict;
    body.append(verdict);
  }

  // Nøkkelfaktorer + kampanalyse.
  const keyFactors = Array.isArray(report.keyFactors) ? report.keyFactors : [];
  const analysis = Array.isArray(report.analysis) ? report.analysis : [];
  if (keyFactors.length > 0) {
    appendMatchdaySubheading(body, "Nøkkelfaktorer");
    appendMatchdayList(body, keyFactors);
  }
  if (analysis.length > 0) {
    appendMatchdaySubheading(body, "Kampanalyse");
    appendMatchdayList(body, analysis);
  }

  if (report.trainingFocus?.summary) {
    appendMatchdaySubheading(body, "Ukens trening");
    appendMatchdayList(body, [report.trainingFocus.summary]);
  }

  // Veien videre: avgjørende lagdel, treningsråd og History Go-hint (v0.2).
  const nextLines = [];
  if (report.decisiveUnit) nextLines.push(report.decisiveUnit);
  if (report.nextWeekAdvice) nextLines.push(`Neste uke: ${report.nextWeekAdvice}`);
  if (report.historyGoHint) nextLines.push(report.historyGoHint);
  if (nextLines.length > 0) {
    appendMatchdaySubheading(body, "Veien videre");
    appendMatchdayList(body, nextLines);
  }

  // Kampkonsekvens (Club Week Consequence Loop v1).
  const clubConsequences = lastMatch?.clubConsequences;
  if (clubConsequences && typeof clubConsequences === "object") {
    const consequenceLines = [];
    const effectsText = formatMatchConsequenceEffects(clubConsequences.effects);
    if (effectsText) {
      consequenceLines.push(`Klubben: ${effectsText}.`);
    }
    const familiarity = clubConsequences.familiarity;
    if (familiarity && typeof familiarity === "object" && Number(familiarity.gain) > 0) {
      consequenceLines.push(
        `Formasjonstilvenning i ${familiarity.formationName || familiarity.formationId} +${familiarity.gain}.`
      );
    }
    if (consequenceLines.length > 0) {
      appendMatchdaySubheading(body, "Kampkonsekvens");
      appendMatchdayList(body, consequenceLines);
    }
  }

  // Bare ta med skuffen hvis den faktisk fikk innhold.
  if (body.childNodes.length > 0) {
    card.append(drawer);
  }

  container.append(card);
}

// Kampdag (v0.2): viser pågående kampsesjon (kampplan/hendelser) eller siste
// spilte kamp. Bruker textContent (ingen innerHTML) og bygger alle elementer
// programmatisk.
function renderMatchday(teamFit) {
  const container = elements.matchdayResult;

  renderMatchdayReadiness(teamFit);

  if (!container) {
    return;
  }

  container.textContent = "";

  const session = state.matchday?.session || null;

  if (session) {
    if (session.phase === "pre_match") {
      renderMatchdaySessionPreMatch(container, session);
      return;
    }

    const eventIndex = getSessionEventIndex(session);
    if (eventIndex !== null) {
      renderMatchdaySessionEvent(container, session, eventIndex);
      return;
    }

    // Ukjent fase i lagret sesjon: rydd stille og fall tilbake til siste kamp.
    state.matchday.session = null;
  }

  const lastMatch = state.matchday?.lastMatch || null;

  if (!lastMatch) {
    const empty = document.createElement("p");
    empty.className = "matchday-empty muted-text";
    empty.textContent = "Ingen kamp spilt ennå.";
    container.append(empty);
    return;
  }

  renderMatchdayReport(container, lastMatch);
}

// ----------------------------------------------------------------------------
// Mini Season v0.1 — panelrendering
// Lite panel nær Club Week-topbaren: status, Kamp X av 5, neste motstander,
// poeng, styremål, siste resultater og sluttvurdering når perioden er
// fullført. Bygger alt programmatisk med textContent (ingen innerHTML).
// ----------------------------------------------------------------------------

function appendMiniSeasonMeta(parent, text, className = "mini-season-meta") {
  const el = document.createElement("p");
  el.className = className;
  el.textContent = text;
  parent.append(el);
}

// Sportslig status: poeng, rekord og formkurve som kompakte tall + W/D/L-pinner.
function renderMiniSeasonStanding(parent, summary, formGuide) {
  const standing = document.createElement("div");
  standing.className = "mini-season-standing";

  const stat = (label, value) => {
    const box = document.createElement("div");
    box.className = "mini-season-stat";
    const v = document.createElement("span");
    v.className = "mini-season-stat-value";
    v.textContent = value;
    const l = document.createElement("span");
    l.className = "mini-season-stat-label";
    l.textContent = label;
    box.append(v, l);
    standing.append(box);
  };

  stat("Poeng", String(summary.points));
  stat("S-U-T", summary.record);
  stat("Mål", `${summary.goalsFor}–${summary.goalsAgainst}`);
  parent.append(standing);

  // Formkurve som fargede pinner (W/D/L), eldste til nyeste.
  const form = Array.isArray(formGuide?.form) ? formGuide.form : [];
  if (form.length > 0) {
    const formRow = document.createElement("div");
    formRow.className = "mini-season-form";
    form.forEach((letter) => {
      const pin = document.createElement("span");
      const outcome = letter === "W" ? "win" : letter === "L" ? "loss" : "draw";
      pin.className = `mini-season-form-pin is-${outcome}`;
      pin.textContent = letter;
      formRow.append(pin);
    });
    parent.append(formRow);
    if (formGuide?.note) {
      appendMiniSeasonMeta(parent, formGuide.note);
    }
  }
}

// Prøveperiode-tabell (light league): HG-laget mot rivaler. Deterministisk.
function renderMiniSeasonTable(parent, table) {
  if (!table || !Array.isArray(table.rows) || table.rows.length === 0) {
    return;
  }

  appendMatchdaySubheading(parent, "Prøveperiode-tabell");
  const wrap = document.createElement("div");
  wrap.className = "mini-season-table-wrap";
  const tableEl = document.createElement("table");
  tableEl.className = "mini-season-table";

  const head = document.createElement("tr");
  ["#", "Lag", "K", "S", "U", "T", "MF", "MM", "MD", "P"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    head.append(th);
  });
  tableEl.append(head);

  table.rows.forEach((row) => {
    const tr = document.createElement("tr");
    if (row.isHg) {
      tr.className = "is-hg";
    }
    const cells = [
      String(row.position),
      row.name,
      String(row.played),
      String(row.wins),
      String(row.draws),
      String(row.losses),
      String(row.goalsFor),
      String(row.goalsAgainst),
      row.goalDifference > 0 ? `+${row.goalDifference}` : String(row.goalDifference),
      String(row.points)
    ];
    cells.forEach((value, index) => {
      const td = document.createElement("td");
      if (index === 1) {
        td.className = "mini-season-table-team";
      }
      td.textContent = value;
      tr.append(td);
    });
    tableEl.append(tr);
  });

  wrap.append(tableEl);
  parent.append(wrap);
}

function renderMiniSeasonResults(parent, miniSeason) {
  const history = Array.isArray(miniSeason.matchHistory) ? miniSeason.matchHistory : [];
  if (history.length === 0) {
    return;
  }

  appendMatchdaySubheading(parent, "Resultater");
  const list = document.createElement("ul");
  list.className = "mini-season-results";
  history.forEach((result) => {
    const item = document.createElement("li");
    const outcome = ["win", "draw", "loss"].includes(result.outcome) ? result.outcome : "draw";
    item.className = `is-${outcome}`;
    const outcomeLabel = MINI_SEASON_OUTCOME_LABELS[outcome] || "Uavgjort";
    const venue = result.homeAway === "home" ? "hjemme" : "borte";
    item.textContent = `Runde ${result.round}: ${outcomeLabel} ${result.scoreLine || "0–0"} mot ${result.opponentName || "ukjent motstander"} (${venue})`;
    list.append(item);
  });
  parent.append(list);
}

function renderMiniSeasonVerdict(parent, finalVerdict) {
  if (!finalVerdict || typeof finalVerdict !== "object") {
    return;
  }

  const box = document.createElement("div");
  const verdict = ["trusted", "pressure", "failed"].includes(finalVerdict.verdict)
    ? finalVerdict.verdict
    : "pressure";
  box.className = `mini-season-verdict is-${verdict}`;

  const label = document.createElement("p");
  label.className = "mini-season-verdict-label";
  label.textContent = finalVerdict.label || "Styrets dom";
  box.append(label);

  if (finalVerdict.headline) {
    appendMiniSeasonMeta(box, finalVerdict.headline, "mini-season-verdict-headline");
  }
  if (finalVerdict.detail) {
    appendMiniSeasonMeta(box, finalVerdict.detail);
  }
  if (finalVerdict.recommendation) {
    appendMiniSeasonMeta(box, finalVerdict.recommendation);
  }

  parent.append(box);
}

function renderWeeklyTrainingFocus(teamFit) {
  const status = elements.weeklyTrainingStatus;
  const recommendationEl = elements.weeklyTrainingRecommendation;
  const options = elements.weeklyTrainingOptions;
  if (!status || !recommendationEl || !options) return;

  syncWeeklyTrainingFocusToClubWeek();
  const week = Number(state.clubWeekState?.week) || 1;
  const selected = getTrainingFocus(state.weeklyTrainingFocus?.focusId);
  const used = Boolean(state.weeklyTrainingFocus?.appliedSessionId);
  status.textContent = selected
    ? `Uke ${week}: ${selected.name}${used ? " · brukt i ukas kampplan" : " · valgt"}`
    : `Uke ${week}: Velg ett fokus før kamp.`;
  status.dataset.selected = selected ? "true" : "false";

  // Matchup-bevisst treningsråd: tren det matchupen mot neste motstander er
  // risikabel på. Faller tilbake til motstanderprofil-/svakhetsråd uten matchup.
  const nextOpponentForFocus = getMiniSeasonNextOpponent();
  const recommendation = recommendTrainingFocus({
    opponent: nextOpponentForFocus,
    teamFit,
    formationMatchup: getFormationMatchupVsOpponent(nextOpponentForFocus),
    lastMatchWeaknessMetric: state.matchday?.lastMatch?.exposedWeaknessMetric || null
  });
  recommendationEl.textContent = recommendation.reason;

  options.textContent = "";
  TRAINING_FOCUSES.forEach((focus) => {
    const support = calculateTrainingStaffSupport({ focusId: focus.id, coachContext: getCoachContext() });
    const isSelected = selected?.id === focus.id;
    const isRecommended = recommendation.focusIds.includes(focus.id);
    const card = document.createElement("article");
    card.className = "weekly-training-card";
    card.dataset.support = support.level;
    if (isSelected) card.classList.add("is-selected");
    if (isRecommended) card.classList.add("is-recommended");

    const heading = document.createElement("h3");
    heading.textContent = focus.name;
    const description = document.createElement("p");
    description.textContent = focus.shortDescription;
    const effect = document.createElement("p");
    effect.className = "weekly-training-effect";
    effect.textContent = focus.effectHint;
    const meta = document.createElement("p");
    meta.className = "weekly-training-support";
    meta.textContent = `Staff-støtte: ${support.label}${isRecommended ? " · anbefalt" : ""}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = isSelected ? "Valgt" : "Velg fokus";
    button.disabled = used || Boolean(state.matchday?.session) || isSelected;
    button.addEventListener("click", () => selectWeeklyTrainingFocus(focus.id));
    card.append(heading, description, effect, meta, button);
    options.append(card);
  });
}

// Suggested Setups v1: 2–4 forklarende oppsettforslag (formasjon, kampplan,
// treningsuke) på dashbordet. Bygger på samme motorer som resten av appen
// (teamFit, formasjonskunnskap, motstander, coachContext) og degraderer trygt.
// Forslagene er additive: de låser ikke spilleren, men forklarer
// standardforståelsen slik at egne kontekstuelle valg kan slå dem.
const SUGGESTED_SETUP_GROUPS = [
  { type: "formation", label: "Formasjon" },
  { type: "match_plan", label: "Kampplan" },
  { type: "training_week", label: "Treningsuke" }
];

function suggestedSetupConfidenceLabel(confidence) {
  const value = Number(confidence) || 0;
  if (value >= 0.7) return "Høy";
  if (value >= 0.5) return "Middels";
  return "Lav";
}

function appendSuggestedSetupList(card, className, label, items) {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (list.length === 0) return;
  const heading = document.createElement("p");
  heading.className = "suggested-setup-list-label";
  heading.textContent = label;
  const ul = document.createElement("ul");
  ul.className = className;
  list.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.append(li);
  });
  card.append(heading, ul);
}

// Hva et forslag faktisk kan «settes» til i eksisterende state. Formasjons- og
// treningsuke-forslag peker på et konkret valg (selectedFormationId / ukens
// treningsfokus); kampplan-forslag er rene råd uten egen state og får ikke knapp.
function resolveSuggestedSetupAction(suggestion) {
  if (suggestion.type === "formation") {
    const formationId = suggestion.id.startsWith("formation:")
      ? suggestion.id.slice("formation:".length)
      : null;
    if (!formationId) return null;
    const isSelected = state.selectedFormationId === formationId;
    const unlocked = isFormationUnlocked(formationId);
    return {
      isSelected,
      disabled: !unlocked || isSelected,
      label: isSelected ? "Aktivt system" : unlocked ? "Bruk dette systemet" : "Låst formasjon",
      apply: () => {
        if (!isFormationUnlocked(formationId)) return;
        state.selectedFormationId = formationId;
        seedLineupForFormation();
        ensurePositionsForFormation();
        renderApp();
      }
    };
  }
  if (suggestion.type === "training_week") {
    const focusId = suggestion.relatedTrainingFocusIds[0]
      || (suggestion.id.startsWith("training_week:") ? suggestion.id.slice("training_week:".length) : null);
    if (!focusId) return null;
    const isSelected = state.weeklyTrainingFocus?.focusId === focusId;
    const locked = Boolean(state.matchday?.session || state.weeklyTrainingFocus?.appliedSessionId);
    return {
      isSelected,
      disabled: isSelected || locked,
      label: isSelected ? "Valgt fokus" : "Velg som treningsfokus",
      apply: () => selectWeeklyTrainingFocus(focusId)
    };
  }
  return null;
}

function buildSuggestedSetupCard(suggestion) {
  const action = resolveSuggestedSetupAction(suggestion);
  const card = document.createElement("article");
  card.className = "suggested-setup-card";
  if (action?.isSelected) card.classList.add("is-selected");

  if (action?.isSelected) {
    const chosen = document.createElement("span");
    chosen.className = "card-selected-flag";
    chosen.textContent = "✓ Valgt";
    card.append(chosen);
  }

  const head = document.createElement("div");
  head.className = "suggested-setup-head";
  const title = document.createElement("h4");
  title.textContent = suggestion.title;
  const confidence = document.createElement("span");
  confidence.className = "suggested-setup-confidence";
  confidence.dataset.level = suggestedSetupConfidenceLabel(suggestion.confidence).toLowerCase();
  confidence.textContent = `Konfidens: ${suggestedSetupConfidenceLabel(suggestion.confidence)}`;
  head.append(title, confidence);
  card.append(head);

  const summary = document.createElement("p");
  summary.className = "suggested-setup-summary";
  summary.textContent = suggestion.summary;
  card.append(summary);

  if (suggestion.type === "formation") {
    const formationId = suggestion.id.startsWith("formation:") ? suggestion.id.slice("formation:".length) : null;
    const learningHint = getFormationLearningHint(state.formationKnowledgeById[formationId]);
    if (learningHint) {
      const hint = document.createElement("p");
      hint.className = "suggested-setup-learning-hint";
      hint.textContent = `Læringshint: ${learningHint}`;
      card.append(hint);
    }
  }

  appendSuggestedSetupList(card, "suggested-setup-why", "Hvorfor nå", suggestion.why);
  appendSuggestedSetupList(card, "suggested-setup-risks", "Risiko", suggestion.risks);
  appendSuggestedSetupList(card, "suggested-setup-adjust", "Du kan justere", suggestion.suggestedAdjustments);

  // Forslag som peker på et konkret valg får en knapp som setter det i state.
  // Kampplan-forslag er rene råd og forblir uten knapp.
  if (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggested-setup-apply";
    button.textContent = action.label;
    button.disabled = action.disabled;
    if (!action.disabled) {
      button.addEventListener("click", action.apply);
    }
    card.append(button);
  }

  return card;
}

function renderSuggestedSetups(teamFit) {
  const container = elements.suggestedSetups;
  if (!container) return;

  container.textContent = "";

  const formation = getFormation();
  if (!formation) {
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Velg et system for å se foreslåtte oppsett.";
    container.append(empty);
    return;
  }

  const suggested = createSuggestedSetups({
    teamFit,
    formation,
    tactic: getTactic(),
    availableFormations: getAvailability().unlockedFormations,
    formationKnowledgeById: state.formationKnowledgeById,
    opponent: getMiniSeasonNextOpponent(),
    coachContext: getCoachContext(),
    lastMatchWeaknessMetric: state.matchday?.lastMatch?.exposedWeaknessMetric || null,
    // Off-pitch: forslagene får bare det halvskjulte laget (synlige signaler),
    // aldri hele hidden-blokken — en bevisst manager kan lese mer.
    offPitchState: getOffPitchState(),
    limit: 3
  });

  let total = 0;
  SUGGESTED_SETUP_GROUPS.forEach(({ type, label }) => {
    const items = Array.isArray(suggested[type]) ? suggested[type] : [];
    if (items.length === 0) return;
    total += items.length;

    const group = document.createElement("div");
    group.className = "suggested-setups-group";
    group.dataset.type = type;

    const heading = document.createElement("h3");
    heading.className = "suggested-setups-group-label";
    heading.textContent = label;
    group.append(heading);

    const cards = document.createElement("div");
    cards.className = "suggested-setups-cards";
    items.forEach((suggestion) => cards.append(buildSuggestedSetupCard(suggestion)));
    group.append(cards);
    container.append(group);
  });

  if (total === 0) {
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Ingen forslag akkurat nå – fyll laget for et bedre datagrunnlag.";
    container.append(empty);
  }
}

// Training Program Composition v1: ferdige ukeprogram (flere økter) som
// valgspill. Bygger på samme motorer som resten av appen og degraderer trygt.
// Forslagene låser ikke spilleren — de viser faglige standardvalg som et bevisst
// kontekstuelt valg kan slå.
function trainingProgramConfidenceLabel(confidence) {
  const value = Number(confidence) || 0;
  if (value >= 0.6) return "Høy";
  if (value >= 0.45) return "Middels";
  return "Lav";
}

const PROGRAM_INTENSITY_LABEL = { low: "lav", medium: "moderat", high: "høy" };

function buildTrainingProgramCard(program, context = {}) {
  const isSelected = Boolean(context.isSelected);
  const locked = Boolean(context.locked);
  const card = document.createElement("article");
  card.className = "training-program-card";
  if (isSelected) card.classList.add("is-selected");
  const canSelect = !isSelected && !locked;
  if (canSelect) {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Velg treningsprogram: ${program.title}`);
    card.addEventListener("click", (event) => {
      if (event.target instanceof HTMLButtonElement) return;
      selectWeeklyTrainingProgram(program);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectWeeklyTrainingProgram(program);
    });
  }

  if (isSelected) {
    const chosen = document.createElement("span");
    chosen.className = "card-selected-flag";
    chosen.textContent = "✓ Valgt";
    card.append(chosen);
  }

  const head = document.createElement("div");
  head.className = "training-program-head";
  const title = document.createElement("h3");
  title.textContent = program.title;
  const confidence = document.createElement("span");
  confidence.className = "training-program-confidence";
  confidence.dataset.level = trainingProgramConfidenceLabel(program.confidence).toLowerCase();
  // totalScore/konfidens som forklaring, ikke fasit.
  confidence.textContent = `Uttelling ${program.scoring.totalScore} · konfidens ${trainingProgramConfidenceLabel(program.confidence)}`;
  head.append(title, confidence);
  card.append(head);

  const summary = document.createElement("p");
  summary.className = "training-program-summary";
  summary.textContent = program.summary;
  card.append(summary);

  // Playable Manager Flow Polish v1: kort, lesbar "Passer nå fordi"-etikett i
  // stedet for et nøytralt avsnitt.
  if (program.recommendedBecause.length > 0) {
    const why = document.createElement("p");
    why.className = "training-program-why";
    why.textContent = `Passer nå fordi: ${program.recommendedBecause[0]}`;
    card.append(why);
  }

  // Forbereder mot: matchup-relevansen mot neste motstander, vist når programmet
  // er foreslått nettopp pga. motstanderen (sourceSignals inneholder "opponent").
  const opponentName = context.opponentName;
  if (opponentName && Array.isArray(program.sourceSignals) && program.sourceSignals.includes("opponent")) {
    const prepares = document.createElement("p");
    prepares.className = "training-program-prepares";
    prepares.textContent = `Forbereder mot: ${opponentName}`;
    card.append(prepares);
  }

  // Øktene i uka — kompakt, foldet liste så kortet ikke domineres av detaljene.
  const sessionsDetails = document.createElement("details");
  sessionsDetails.className = "training-program-sessions-details";
  const sessionsSummary = document.createElement("summary");
  sessionsSummary.textContent = `Økter denne uka (${program.sessions.length})`;
  sessionsDetails.append(sessionsSummary);
  const sessions = document.createElement("ul");
  sessions.className = "training-program-sessions";
  program.sessions.forEach((session) => {
    const li = document.createElement("li");
    li.textContent = `${session.day}: ${session.title} (${PROGRAM_INTENSITY_LABEL[session.intensity] || session.intensity})`;
    sessions.append(li);
  });
  sessionsDetails.append(sessions);
  card.append(sessionsDetails);

  if (program.risks.length > 0) {
    const riskLabel = document.createElement("p");
    riskLabel.className = "training-program-list-label";
    riskLabel.textContent = "Risiko";
    const risks = document.createElement("ul");
    risks.className = "training-program-risks";
    program.risks.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      risks.append(li);
    });
    card.append(riskLabel, risks);
  }

  if (program.staffSupport) {
    const support = document.createElement("div");
    support.className = "training-program-staff-support";
    const label = document.createElement("p");
    label.className = "training-program-list-label";
    label.textContent = `Støtte fra stab: ${program.staffSupport.label}`;
    support.append(label);
    const details = document.createElement("ul");
    [...(program.staffSupport.notes || [])].slice(0, 3).forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      details.append(li);
    });
    if (!details.childNodes.length) {
      const li = document.createElement("li");
      li.textContent = "Ingen tydelig spesialiststøtte — managerens tolkning blir viktigere.";
      details.append(li);
    }
    support.append(details);
    card.append(support);
  }

  // Valgknapp: gjør kortet til et faktisk valg koblet til ukens treningsstate.
  const button = document.createElement("button");
  button.type = "button";
  button.className = "training-program-select";
  button.textContent = isSelected ? "✓ Valgt" : "Velg dette programmet";
  button.disabled = isSelected || locked;
  if (canSelect) {
    button.addEventListener("click", () => selectWeeklyTrainingProgram(program));
  }
  card.append(button);

  return card;
}

function renderTrainingProgramCompositions(teamFit) {
  const container = elements.trainingPrograms;
  if (!container) return;

  container.textContent = "";

  const selectedProgramId = state.weeklyTrainingProgram?.programId || null;
  const locked = Boolean(state.matchday?.session || state.weeklyTrainingProgram?.applied);

  const opponent = getMiniSeasonNextOpponent();
  const offPitchState = getOffPitchState();
  const programs = createTrainingProgramCompositions({
    teamFit,
    opponent,
    formation: getFormation(),
    tactic: getTactic(),
    formationMatchup: getFormationMatchupVsOpponent(opponent),
    coachContext: getCoachContext(),
    lastMatchWeaknessMetric: state.matchday?.lastMatch?.exposedWeaknessMetric || null,
    // Off-pitch Parameters v1: slitasje/skadefare/press kommer nå fra manager-
    // statens kontekstlag. Restitusjon/skadeforebygging blir dermed situasjons-
    // bestemt — den må fortjenes av faktisk slitasje, ikke velges som vane.
    offPitchState,
    recentTrainingFocusIds: offPitchState.recentTrainingProgramIds,
    staffIdentity: getStaffIdentitySummary(),
    limit: 3
  });

  if (!Array.isArray(programs) || programs.length === 0) {
    updateWeeklyTrainingProgramStatus(null);
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Ingen treningsprogram akkurat nå – fyll laget for et bedre datagrunnlag.";
    container.append(empty);
    return;
  }

  // Valgt program kan ligge utenfor de 3 anbefalte denne renderen; pass på at
  // det fortsatt vises som et kort så valget alltid er synlig.
  let visiblePrograms = programs;
  let selectedProgram = programs.find((program) => program.id === selectedProgramId) || null;
  if (selectedProgramId && !selectedProgram) {
    const extra = createTrainingProgramCompositions({
      teamFit,
      opponent,
      formation: getFormation(),
      tactic: getTactic(),
      formationMatchup: getFormationMatchupVsOpponent(opponent),
      coachContext: getCoachContext(),
      lastMatchWeaknessMetric: state.matchday?.lastMatch?.exposedWeaknessMetric || null,
      offPitchState,
      recentTrainingFocusIds: offPitchState.recentTrainingProgramIds,
      staffIdentity: getStaffIdentitySummary(),
      limit: 8
    });
    selectedProgram = (Array.isArray(extra) ? extra : []).find((program) => program.id === selectedProgramId) || null;
    if (selectedProgram) {
      visiblePrograms = [selectedProgram, ...programs.filter((program) => program.id !== selectedProgramId)];
    }
  }

  updateWeeklyTrainingProgramStatus(selectedProgram);

  visiblePrograms.forEach((program) =>
    container.append(
      buildTrainingProgramCard(program, {
        isSelected: program.id === selectedProgramId,
        locked,
        opponentName: opponent?.name || null
      })
    )
  );
}

// Kort oppsummering av ukens valgte treningsprogram på hovedflaten/treningsfanen.
function updateWeeklyTrainingProgramStatus(selectedProgram) {
  const status = elements.weeklyTrainingProgramStatus;
  if (!status) return;
  const week = Number(state.clubWeekState?.week) || 1;
  if (selectedProgram) {
    const applied = state.weeklyTrainingProgram?.applied;
    status.textContent = `Uke ${week}: ${selectedProgram.title}${applied ? " · brukt denne uka" : " · valgt"}`;
    status.dataset.selected = "true";
  } else {
    status.textContent = `Uke ${week}: Velg ett treningsprogram for uka.`;
    status.dataset.selected = "false";
  }
}

// Off-pitch Parameters v1: kompakt «Kontekst»-seksjon i managerkontor-stil.
// Viser lesbare manager-signaler (fysisk, psykisk, garderobe, press, styre/
// media, taktisk klarhet, skadefare) — ikke rå tall, og aldri hele hidden-laget.
// Poenget er at manageren skal LESE konteksten, ikke avlese et regneark.
function renderContextPanel() {
  const container = elements.contextSignals;
  if (!container) return;

  const summary = summarizeOffPitchContext(getOffPitchState());

  if (elements.contextHeadline) {
    elements.contextHeadline.textContent = summary.headline;
    elements.contextHeadline.dataset.tone = summary.tone;
  }

  container.textContent = "";
  summary.visible.forEach((signal) => {
    const row = document.createElement("div");
    row.className = "context-signal";
    row.dataset.severity = signal.severity;

    const label = document.createElement("span");
    label.className = "context-signal-label";
    label.textContent = signal.label;

    const text = document.createElement("span");
    text.className = "context-signal-text";
    text.textContent = signal.text;

    row.append(label, text);
    container.append(row);
  });

  // Vag hint om skjult uro — synlig at noe er der, ikke hva. Forsterker
  // læringsspill-poenget: forslagene ser ikke alt.
  if (summary.hiddenHint) {
    const hint = document.createElement("p");
    hint.className = "context-hidden-hint";
    hint.textContent = summary.hiddenHint;
    container.append(hint);
  }
}

function renderMiniSeason() {
  const statusEl = elements.miniSeasonStatus;
  const overview = elements.miniSeasonOverview;
  const startButton = elements.startMiniSeasonButton;
  const resetButton = elements.resetMiniSeasonButton;
  const miniSeason = state.miniSeason;

  if (startButton) {
    startButton.hidden = miniSeason?.status === "active";
    startButton.textContent = miniSeason?.status === "completed" ? "Start ny prøveperiode" : "Start prøveperiode";
  }
  if (resetButton) {
    resetButton.hidden = !miniSeason;
  }

  const summary = miniSeason ? summarizeMiniSeason(miniSeason) : null;

  if (statusEl) {
    if (!miniSeason || !summary) {
      statusEl.textContent =
        "Ingen aktiv prøveperiode. Start en 5-kampers prøveperiode og bli vurdert av styret — anbefalt ramme for kampdag-loopen.";
    } else if (miniSeason.status === "completed") {
      statusEl.textContent = `Prøveperioden er fullført: ${summary.points} poeng på ${miniSeason.totalWeeks} kamper.`;
    } else {
      statusEl.textContent = `Runde ${Math.min(miniSeason.weekIndex + 1, miniSeason.totalWeeks)} av ${miniSeason.totalWeeks} · ${summary.points} poeng så langt.`;
    }
  }

  if (!overview) {
    return;
  }

  overview.textContent = "";

  if (!miniSeason || !summary) {
    return;
  }

  // Sesongmål + samlet styreforventning: den sportslige retningen for perioden.
  appendMiniSeasonMeta(overview, `Sesongmål: ${miniSeason.seasonGoal}`, "mini-season-goal");
  if (miniSeason.boardExpectation) {
    appendMiniSeasonMeta(overview, miniSeason.boardExpectation);
  }

  // Neste motstander med hjemme/borte, forventning og «hva betyr dette nå?».
  if (miniSeason.status === "active") {
    const nextMatch = getCurrentMiniSeasonMatch(miniSeason);
    if (nextMatch) {
      const venue = nextMatch.homeAway === "home" ? "Hjemme" : "Borte";
      appendMiniSeasonMeta(
        overview,
        `Runde ${nextMatch.round}/${miniSeason.totalWeeks} · ${nextMatch.opponentName} · ${venue}`,
        "mini-season-next-opponent"
      );
      appendMiniSeasonMeta(overview, nextMatch.narrativeHook);
    }
  }

  renderMiniSeasonStanding(overview, summary, createMiniSeasonFormGuide(miniSeason));
  renderMiniSeasonTable(overview, createMiniSeasonTable(miniSeason, getMiniSeasonContext()));
  renderMiniSeasonResults(overview, miniSeason);

  if (miniSeason.status === "completed") {
    renderMiniSeasonVerdict(overview, miniSeason.finalReview);
  }
}

// Finn aktiv kunnskapsanbefaling i gjeldende viewModel, eller null hvis ingen er valgt
// eller det valgte kortet ikke finnes lenger. Kun UI/state, ingen engine-effekt.
function getActiveKnowledgeRecommendation(viewModel) {
  if (!viewModel || !state.activeKnowledgeFocusId) return null;
  return viewModel.knowledgeRecommendations.find(
    (item) => item.principleId === state.activeKnowledgeFocusId
  ) || null;
}

// Treningsuke-tellere leses fra state (ikke fra viewModel) og hører derfor
// hjemme i den synkrone render-stien, ikke bak den async TS-broen. Ellers
// sluttet de å oppdatere seg når dist/ ikke var bygget.
function renderTrainingWeekCounters() {
  if (elements.trainingWeekStatus) {
    elements.trainingWeekStatus.textContent = `Treningsuke ${state.trainingWeek}`;
  }

  if (elements.knowledgeCompletedThisWeek) {
    elements.knowledgeCompletedThisWeek.textContent = String(countCompletedThisWeek());
  }

  if (elements.knowledgeCompletedTotal) {
    elements.knowledgeCompletedTotal.textContent = String(countCompletedTotal());
  }
}

function renderManagerDashboardViewModel(viewModel, teamFit = null) {
  if (!viewModel) {
    return;
  }

  // Scorepanelet (score/metrikker/rapport) eies av teamFit via renderTeamSummary/
  // renderReport. Sammendrag, topp-grep, rollebytter og svakheter eies av teamFit
  // via renderManagerDetailFromTeamFit. Denne funksjonen skriver derfor kun de
  // gjenstående dashboard-seksjonene: treningsplan (med kunnskapsfokus) og
  // kunnskapsanbefalinger – innhold som er koblet til kunnskaps-funksjonen.

  const activeKnowledge = getActiveKnowledgeRecommendation(viewModel);

  // Treningsøktene avledes fra teamFit-svakhetene når motoren er lastet, slik at
  // de matcher svakhetene panelet viser. Faller tilbake til den strukturerte
  // treningsplanen uten bygget dist/. Kunnskapsfokus-elementet (valgt ukesøkt)
  // beholdes uansett, siden det tilhører kunnskaps-funksjonen.
  const trainingEngine = getLoadedManagerEngine();
  const teamFitFocus = (trainingEngine?.createTrainingFocusFromTeamFit && teamFit)
    ? trainingEngine.createTrainingFocusFromTeamFit(teamFit)
    : viewModel.trainingPlan.map((item) => ({
        areaText: item.areaText,
        suggestedSession: item.suggestedSession
      }));

  const trainingItems = [
    ...(activeKnowledge ? [{
      type: "knowledge_focus",
      principleId: activeKnowledge.principleId,
      text: `Valgt ukesøkt: ${activeKnowledge.title} — ${activeKnowledge.trainingSession}`
    }] : []),
    ...teamFitFocus.map((item) => ({
      type: "engine_training",
      text: `${item.areaText}: ${item.suggestedSession}`
    }))
  ];

  renderTrainingFocusList(
    elements.managerTrainingPlan,
    trainingItems,
    viewModel.emptyStates.trainingPlan,
  );

  // Rollebytter og svakheter rendres separat fra teamFit
  // (renderManagerDetailFromTeamFit), slik at de bruker samme motor/metrikker
  // som elleveren og headline. Denne funksjonen rører dem derfor ikke lenger.

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

function getBrowserManagerStateArgs() {
  return {
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
  };
}

// Render manager-detalj-panelet fra TS-motoren. Etter preloadManagerEngine() i
// init() er motoren tilgjengelig synkront, så vi bygger og rendrer i samme
// tikk som resten av renderApp (ingen async-blink). Før motoren er ferdig
// lastet – eller hvis dist/ ikke er bygget – faller vi tilbake til den async
// lastestien, som er null-trygg og lar legacy-demoen kjøre uendret.
// Manager-detalj-panelets teamFit-avledede seksjoner (rollebytter + svakheter).
// De bruker samme motor/metrikker (calculateTeamFit) som headline og elleveren,
// og erstatter den strukturerte pipelinens versjoner som kunne motsi headline.
// Uten bygget dist/ (motor ikke lastet) lar vi panelet stå som det er.
function renderManagerDetailFromTeamFit(teamFit) {
  const engine = getLoadedManagerEngine();

  if (engine?.createTeamFitManagerInsight && teamFit) {
    const insight = engine.createTeamFitManagerInsight(teamFit, { tactic: getTactic(), roles: state.roles });

    if (elements.managerSummary) {
      elements.managerSummary.textContent = insight.summary;
    }

    renderTextList(
      elements.managerTopActions,
      insight.topActions,
      (action) => `${action.priorityText}: ${action.label}`,
      "Ingen prioriterte grep akkurat nå.",
    );
  }

  if (elements.managerRoleChanges && engine?.recommendRoleChangesFromTeamFit && teamFit) {
    const recommendations = engine
      .recommendRoleChangesFromTeamFit(teamFit, { tactic: getTactic(), roles: state.roles })
      .filter((recommendation) => recommendation.status !== "keep_role")
      .sort((a, b) => (b.candidates[0]?.improvement ?? 0) - (a.candidates[0]?.improvement ?? 0));

    renderTextList(
      elements.managerRoleChanges,
      recommendations,
      (recommendation) => recommendation.label,
      "Ingen tydelige rollebytter akkurat nå. Rollebruken bør i hovedsak beholdes.",
    );
  }

  if (elements.managerWeakPoints && engine?.analyzeWeakPointsFromTeamFit && teamFit) {
    const weakPoints = engine.analyzeWeakPointsFromTeamFit(teamFit);

    renderTextList(
      elements.managerWeakPoints,
      weakPoints,
      (weakPoint) => `${weakPoint.categoryText}: ${weakPoint.label} — ${weakPoint.suggestedAction}`,
      "Ingen tydelige svakheter i denne vurderingen.",
    );
  }
}

function renderManagerEngineBridge(teamFit) {
  if (getLoadedManagerEngine()) {
    // Invalider evt. in-flight async-render slik at den ikke overskriver dette.
    managerEngineRenderId += 1;

    const legacyManagerState = createLegacyManagerAppStateFromBrowserStateSync(
      getBrowserManagerStateArgs(),
    );

    renderManagerDashboardViewModel(
      getDashboardViewModelFromLegacyManagerState(legacyManagerState),
      teamFit,
    );

    return;
  }

  renderManagerEngineBridgeAsync(teamFit);
}

async function renderManagerEngineBridgeAsync(teamFit) {
  const renderId = ++managerEngineRenderId;

  const legacyManagerState = await createLegacyManagerAppStateFromBrowserState(
    getBrowserManagerStateArgs(),
  );

  if (renderId !== managerEngineRenderId) {
    return;
  }

  const viewModel = getDashboardViewModelFromLegacyManagerState(legacyManagerState);

  renderManagerDashboardViewModel(viewModel, teamFit);
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
// Tegn fase-stripa: én bolk per fase i rekkefølge, gjeldende fase markert og
// allerede passerte faser dempet. Rent visningslag — ingen state-endring.
function renderClubWeekPhaseSteps(container, phaseList, currentPhase) {
  if (!container) {
    return;
  }
  container.replaceChildren();
  const phases = Array.isArray(phaseList) ? phaseList : [];
  const currentIndex = phases.findIndex((entry) => entry.phase === currentPhase);

  phases.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "club-week-step";
    if (index === currentIndex) {
      item.classList.add("is-active");
      item.setAttribute("aria-current", "step");
    } else if (currentIndex >= 0 && index < currentIndex) {
      item.classList.add("is-done");
    }
    item.textContent = entry.label;
    if (entry.guidance) {
      item.title = entry.guidance;
    }
    container.append(item);
  });
}

async function renderClubWeek() {
  if (!state.clubWeekState) {
    return;
  }

  const clubWeekState = state.clubWeekState;

  const [summary, phaseLabel, guidance, phaseList] = await Promise.all([
    createClubWeekSummaryFromBrowser(clubWeekState),
    getClubWeekPhaseLabelFromBrowser(clubWeekState.phase),
    getClubWeekPhaseGuidanceFromBrowser(clubWeekState.phase),
    listClubWeekPhasesFromBrowser(),
  ]);

  if (elements.clubWeekSummary) {
    elements.clubWeekSummary.textContent = summary;
  }

  if (elements.clubWeekPhase) {
    elements.clubWeekPhase.textContent = phaseLabel;
  }

  // Club Week Orchestrator v1: fase-stripa gjør ukerytmen synlig og markerer
  // hvor manageren er nå. Veiledningen forteller hva som skal gjøres i fasen.
  if (elements.clubWeekPhaseSteps) {
    renderClubWeekPhaseSteps(elements.clubWeekPhaseSteps, phaseList, clubWeekState.phase);
  }

  if (elements.clubWeekPhaseGuidance) {
    elements.clubWeekPhaseGuidance.textContent = guidance;
  }

  if (elements.clubWeekFeedback) {
    elements.clubWeekFeedback.textContent = state.clubWeekFeedback || "Klubbuken er klar.";
  }

  // Kampdag ↔ Club Week: stengt port gjør "Neste fase" utilgjengelig og
  // forklarer hvorfor, slik at kampdag og klubbuke er én sammenhengende rytme.
  if (elements.advanceClubWeekPhase) {
    const gate = getClubWeekMatchdayGate();
    elements.advanceClubWeekPhase.disabled = gate.isBlocked;
    elements.advanceClubWeekPhase.textContent = gate.isBlocked ? "Spill kampen først" : "Neste fase →";
    elements.advanceClubWeekPhase.title = gate.isBlocked ? gate.reason : "";
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
      phases: ["analysis", "inbox", "training", "match_prep", "matchday", "review"],
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

// Les brukerens valgte innboks-svar fra localStorage som map { messageId: choiceId }.
// Robust: returnerer {} ved parsefeil eller hvis lagret verdi ikke er et objekt.
function loadSelectedInboxChoices() {
  try {
    const stored = JSON.parse(localStorage.getItem(SELECTED_INBOX_CHOICES_KEY));

    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      return {};
    }

    const result = {};
    for (const [messageId, choiceId] of Object.entries(stored)) {
      if (typeof messageId === "string" && typeof choiceId === "string") {
        result[messageId] = choiceId;
      }
    }
    return result;
  } catch (error) {
    return {};
  }
}

// Lagre valgte innboks-svar. Stille no-op hvis lagring feiler (privat modus e.l.).
function saveSelectedInboxChoices(selectedChoices) {
  try {
    const map = selectedChoices && typeof selectedChoices === "object" && !Array.isArray(selectedChoices)
      ? selectedChoices
      : {};
    localStorage.setItem(SELECTED_INBOX_CHOICES_KEY, JSON.stringify(map));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Alle svarvalg som hører til en gitt melding (kan være 0–2 i v1).
function getChoicesForMessage(messageId) {
  return state.clubInboxChoices.filter((choice) => choice.messageId === messageId);
}

// Det allerede valgte svaret for en melding, eller null hvis intet er valgt.
function getSelectedChoiceForMessage(messageId) {
  const choiceId = state.selectedInboxChoices?.[messageId];
  if (!choiceId) {
    return null;
  }
  return state.clubInboxChoices.find((choice) => choice.id === choiceId) || null;
}

// Klem en klubbverdi inn i gyldig 0–100-bånd.
function clampMetric(value) {
  return Math.max(0, Math.min(100, value));
}

// Bruk et valgs effekter på Club Week-verdiene. Kun gyldige metric-nøkler med
// numerisk delta og eksisterende numerisk verdi i clubWeekState påvirkes, og
// resultatet clamps 0–100. Skriver tilbake til localStorage via saveClubWeekState.
// Ingen kampmotor-, rollefit-, matching- eller Club Week Engine-endring.
function applyInboxChoiceEffects(choice) {
  const effects = choice?.effects;
  if (!effects || typeof effects !== "object" || Array.isArray(effects)) {
    return;
  }
  if (!state.clubWeekState || typeof state.clubWeekState !== "object") {
    return;
  }

  for (const [metric, delta] of Object.entries(effects)) {
    if (!INBOX_CHOICE_METRIC_KEYS.has(metric) || typeof delta !== "number") {
      continue;
    }
    if (typeof state.clubWeekState[metric] === "number") {
      state.clubWeekState[metric] = clampMetric(state.clubWeekState[metric] + delta);
    }
  }

  saveClubWeekState(state.clubWeekState);
}

// Velg ett svar for en melding. Idempotent per messageId: hvis et valg allerede
// finnes for meldingen, gjøres ingenting (effekter brukes kun første gang).
function chooseInboxChoice(choiceId) {
  const choice = state.clubInboxChoices.find((item) => item.id === choiceId);
  if (!choice) {
    console.warn(`Innboks-valg ikke funnet: ${choiceId}`);
    return;
  }

  if (state.selectedInboxChoices[choice.messageId]) {
    return;
  }

  state.selectedInboxChoices[choice.messageId] = choice.id;
  saveSelectedInboxChoices(state.selectedInboxChoices);

  applyInboxChoiceEffects(choice);

  const phaseLabel = (state.clubWeekState && CLUB_WEEK_PHASE_LABELS[state.clubWeekState.phase])
    || state.clubWeekState?.phase
    || "Innboks";

  addClubWeekEvent({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    week: state.clubWeekState?.week ?? "?",
    phase: state.clubWeekState?.phase || "inbox",
    phaseLabel,
    title: "Innboksvalg",
    detail: choice.responseTitle || "Valg registrert",
    message: `Innboksvalg: ${choice.responseTitle || "Valg registrert"}`
  });

  renderApp();
}

// Norske etiketter for klubbverdier i effekttekst.
const INBOX_CHOICE_EFFECT_LABELS = {
  boardTrust: "Styretillit",
  playerMorale: "Spillermoral",
  mediaPressure: "Medietrykk",
  trainingCulture: "Treningskultur",
  tacticalClarity: "Taktisk klarhet"
};

// Bygg en lesbar effekttekst, f.eks. "Effekt: Styretillit +2, Taktisk klarhet +1".
// Returnerer tom streng hvis ingen gyldige effekter finnes.
function formatInboxChoiceEffects(effects) {
  if (!effects || typeof effects !== "object" || Array.isArray(effects)) {
    return "";
  }

  const parts = [];
  for (const [metric, delta] of Object.entries(effects)) {
    if (!INBOX_CHOICE_METRIC_KEYS.has(metric) || typeof delta !== "number" || delta === 0) {
      continue;
    }
    const label = INBOX_CHOICE_EFFECT_LABELS[metric] || metric;
    const sign = delta > 0 ? "+" : "";
    parts.push(`${label} ${sign}${delta}`);
  }

  if (parts.length === 0) {
    return "";
  }

  return `Effekt: ${parts.join(", ")}`;
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

// Alle valgte svarvalg-id-er som et Set (brukerens valg fra selectedInboxChoices).
function getSelectedInboxChoiceIds() {
  return new Set(Object.values(state.selectedInboxChoices || {}).filter((id) => typeof id === "string"));
}

// Trådsvar som er låst opp fordi det utløsende svarvalget er tatt. Returnerer
// runtime-meldinger (kopier) merket med isReply, slik at de kan behandles som
// vanlige innboksmeldinger uten å mutere state.clubInboxReplies eller
// state.clubInboxMessages. Egne id-er gjør at delivered/read-modellen fungerer.
function getUnlockedInboxReplies() {
  const selectedChoiceIds = getSelectedInboxChoiceIds();

  return state.clubInboxReplies
    .filter((reply) => selectedChoiceIds.has(reply.triggerChoiceId))
    .map((reply) => ({
      ...reply,
      isReply: true,
      replyToMessageId: reply.responseToMessageId
    }));
}

// Samlet runtime-meldingssett: base-meldinger pluss opplåste trådsvar. Replies
// kommer etter base-meldingene, slik at et svar blir siste melding i tråden.
function getAllRuntimeInboxMessages() {
  return [
    ...state.clubInboxMessages,
    ...getUnlockedInboxReplies()
  ];
}

// Meldinger som matcher gjeldende Club Week-fase/conditions akkurat nå.
function getActiveInboxMessages() {
  return getAllRuntimeInboxMessages().filter(messageMatchesClubWeek);
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
  const deliveredMessages = getAllRuntimeInboxMessages().filter((message) => {
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

// Inbox UI v2: tråder vises kollapset som klikkbare rader. Den åpne tråden
// (openInboxThreadId) viser innhold og svarvalg i samme panel. Toggler åpen/lukket
// uten å røre lest/levert-modellen eller kontekstmotoren — kun visningsstate.
function toggleInboxThread(threadId) {
  if (!threadId) return;
  state.openInboxThreadId = state.openInboxThreadId === threadId ? null : threadId;
  renderApp();
}

// Gjør et trådkort til en klikkbar, kollapserbar rad: header-knappen toggler
// åpen/lukket, og det ekspanderbare innholdet legges i en body-container som kun
// vises når tråden er åpen. open=true viser innholdet (f.eks. for arkiv-håndtering).
function makeThreadCollapsible(article, headerNodes, bodyNodes, { threadId, open }) {
  const header = document.createElement("button");
  header.type = "button";
  header.className = "inbox-thread-toggle";
  header.setAttribute("aria-expanded", open ? "true" : "false");
  headerNodes.forEach((node) => header.append(node));
  if (threadId) {
    header.addEventListener("click", () => toggleInboxThread(threadId));
  }

  const body = document.createElement("div");
  body.className = "inbox-thread-body";
  bodyNodes.forEach((node) => node && body.append(node));

  article.classList.add("is-collapsible");
  if (open) article.classList.add("is-open");
  article.append(header, body);
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

// Bygg svarvalg-blokk for én melding. Returnerer null hvis meldingen ikke har
// valg. Hvis et svar allerede er valgt, vises en responsblokk; ellers vises
// knapper. Bruker kun createElement/textContent – aldri innerHTML.
function createInboxChoiceBlock(message) {
  const messageId = message?.id;
  if (typeof messageId !== "string") {
    return null;
  }

  const choices = getChoicesForMessage(messageId);
  if (!choices.length) {
    return null;
  }

  const container = document.createElement("div");
  container.className = "inbox-choice-list";

  const selected = getSelectedChoiceForMessage(messageId);

  if (selected) {
    const response = document.createElement("div");
    response.className = "inbox-choice-response";

    const chosen = document.createElement("p");
    chosen.className = "inbox-choice-response-title";
    chosen.textContent = `Valgt svar: ${selected.label || ""}`;

    const title = document.createElement("p");
    title.className = "inbox-choice-response-title";
    title.textContent = selected.responseTitle || "";

    const body = document.createElement("p");
    body.className = "inbox-choice-response-body";
    body.textContent = selected.responseBody || "";

    response.append(chosen, title, body);

    const effectsText = formatInboxChoiceEffects(selected.effects);
    if (effectsText) {
      const effects = document.createElement("p");
      effects.className = "inbox-choice-effects";
      effects.textContent = effectsText;
      response.append(effects);
    }

    container.append(response);
  } else {
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "inbox-choice-button";
      button.textContent = choice.label || "Svar";
      button.addEventListener("click", () => chooseInboxChoice(choice.id));
      container.append(button);
    });
  }

  return container;
}

// Bygg ett trådkort fra en trådgruppe. Bruker kun createElement/textContent og
// gjenbruker message-card-CSS. options.showReadButton gir en "Marker tråd som
// lest"-knapp som markerer alle uleste meldinger i tråden som lest.
// Stabil id for en statisk trådgruppe — må matche threadId som brukes i
// createInboxThreadCard, slik at åpen/lukket-tilstanden treffer riktig kort.
function getThreadGroupId(threadGroup) {
  return threadGroup?.thread?.id || threadGroup?.latestMessage?.threadId || threadGroup?.latestMessage?.id || null;
}

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
  // Et trådsvar (reply) er siste melding i tråden når den er låst opp. Marker det
  // tydelig med "Nytt svar:" slik at tråden synes levende igjen etter et valg.
  if (latestMessage?.isReply) {
    latestTitle.textContent = `Nytt svar: ${latestMessage.title || "Oppfølging"}`;
  } else {
    latestTitle.textContent = `Siste: ${latestMessage?.title || "Ingen meldinger"}`;
  }

  const body = document.createElement("p");
  body.textContent = latestMessage?.body || "Ingen meldingstekst.";

  // Svarvalg (v1): vis valg/valgt svar for meldinger i tråden som har choices.
  // Bygger kun med createElement/textContent. Valg markerer ikke tråden som lest.
  const choiceBlocks = [];
  for (const message of threadGroup.messages) {
    const choiceBlock = createInboxChoiceBlock(message);
    if (choiceBlock) {
      choiceBlocks.push(choiceBlock);
    }
  }

  let readButton = null;
  if (options.showReadButton) {
    readButton = document.createElement("button");
    readButton.type = "button";
    readButton.className = "inbox-thread-read-button";
    readButton.textContent = "Marker tråd som lest";
    readButton.addEventListener("click", () => {
      for (const message of threadGroup.unreadMessages) {
        if (message?.id) {
          state.readInboxMessageIds.add(message.id);
        }
      }
      saveReadInboxMessageIds();
      renderApp();
    });
  }

  const threadId = thread?.id || latestMessage?.threadId || latestMessage?.id || null;
  makeThreadCollapsible(
    article,
    [meta, subject, latestTitle],
    [body, ...choiceBlocks, readButton],
    { threadId, open: Boolean(options.open) }
  );

  return article;
}

// ============================================================================
// Inbox Event Integration v1 — levende tråder fra kontekstlaget.
//
// De eksisterende statiske JSON-trådene over beholdes uendret. Her legger vi til
// et DYNAMISK lag: tråder generert fra off-pitch-parametrene, treningsprogram,
// kampdag og beslutninger (src/football-inbox-events.js). Trådene rendres i de
// SAMME containerne (inboxThreadList / inboxThreadArchive) — ingen ny parallell
// innboks-arkitektur. State ligger i teamMerits.inbox, aldri i History
// Go-progresjonen.
// ============================================================================
const INBOX_EVENT_TYPE_LABELS = {
  assistant: "Assistent",
  medical: "Medisinsk",
  board: "Styret",
  media: "Presse",
  squad: "Garderobe",
  training: "Trening",
  matchday: "Kampdag",
  scouting: "Scouting",
  admin: "Administrasjon"
};

const INBOX_EVENT_PRIORITY_LABELS = {
  urgent: "Haster",
  high: "Høy",
  medium: "Middels",
  low: "Lav"
};

const INBOX_EVENT_STATUS_LABELS = {
  resolved: "Besvart",
  read: "Lest",
  archived: "Arkivert"
};

const INBOX_EVENT_SENDER_ROLES = {
  assistant: "Assistenttrener",
  medical: "Fysio",
  board: "Styret",
  media: "Presse",
  squad: "Spillergruppe",
  training: "Trenerteam",
  matchday: "Analytiker",
  scouting: "Speider",
  admin: "Klubbkontor"
};

const INBOX_EVENT_SIGNAL_LABELS = {
  training: "Trening",
  training_program: "Trening",
  training_focus: "Trening",
  matchday: "Kamp",
  tacticalClarity: "Kampplan",
  tactic: "Kampplan",
  physical: "Slitasje",
  fatigue: "Slitasje",
  injury: "Slitasje",
  injuryRisk: "Slitasje",
  mental: "Moral",
  dressingRoom: "Moral",
  confidence: "Moral",
  boardMedia: "Styrepress",
  boardPressure: "Styrepress",
  pressure: "Styrepress",
  mediaPressure: "Styrepress",
  staff: "Stab",
  offPitch: "Kontekst",
  roster: "Tropp"
};

function getInboxEventImpactLabels(thread) {
  const labels = new Set();
  (Array.isArray(thread?.sourceSignals) ? thread.sourceSignals : []).forEach((signal) => {
    const label = INBOX_EVENT_SIGNAL_LABELS[signal];
    if (label) labels.add(label);
  });
  if (thread?.type && INBOX_EVENT_SIGNAL_LABELS[thread.type]) {
    labels.add(INBOX_EVENT_SIGNAL_LABELS[thread.type]);
  }
  return [...labels].slice(0, 4);
}

// Bygg/forny innboksens levende tråder fra gjeldende kontekst. Idempotent:
// integrateInboxThreads dupliserer aldri tråder, og vi lagrer kun når noe faktisk
// endret seg. Muterer ALDRI History Go-progresjon (kun teamMerits.inbox).
function refreshInboxEvents(teamFit) {
  if (!state.teamMerits) {
    return;
  }

  const offPitchState = getOffPitchState();
  const lastMatch = state.matchday?.lastMatch;
  const matchdayResult =
    lastMatch && typeof lastMatch === "object"
      ? {
          matchId: lastMatch.id || null,
          outcome: lastMatch.outcome,
          goalsFor: lastMatch.score?.for,
          goalsAgainst: lastMatch.score?.against,
          opponentName: lastMatch.opponent?.name,
          week: lastMatch.playedInClubWeek
        }
      : null;

  // Treningsprogram med off-pitch-relevans kan bli en treningstråd. Degraderer
  // trygt til tom liste hvis komposisjonsmotoren ikke kan kjøre.
  let trainingPrograms = [];
  try {
    trainingPrograms = createTrainingProgramCompositions({
      teamFit,
      offPitchState,
      recentTrainingFocusIds: offPitchState.recentTrainingProgramIds,
      staffIdentity: getStaffIdentitySummary(),
      limit: 5
    });
  } catch (error) {
    trainingPrograms = [];
  }

  const before = getInboxState();
  const after = integrateInboxThreads(before, {
    offPitchState,
    trainingPrograms,
    matchdayResult,
    availability: getAvailability(),
    formation: getFormation(),
    tactic: getTactic(),
    teamFit,
    staffIdentity: getStaffIdentitySummary(),
    existingInboxState: before
  });

  if (JSON.stringify(after) !== JSON.stringify(before)) {
    state.teamMerits.inbox = after;
    saveTeamMerits();
  }
}

// Ta et valg i en levende tråd: oppdater inbox-state, og send valgets
// offPitchEvent gjennom off-pitch-motoren slik at konteksten faktisk beveger seg.
function chooseInboxEventChoice(threadId, choiceId) {
  if (!state.teamMerits) {
    return;
  }
  const result = applyInboxChoice(getInboxState(), threadId, choiceId, {});
  state.teamMerits.inbox = result.inboxState;
  if (result.offPitchEvent) {
    state.teamMerits.offPitch = applyOffPitchEvent(getOffPitchState(), result.offPitchEvent);
  }
  saveTeamMerits();
  renderApp();
}

function archiveInboxEventThread(threadId) {
  if (!state.teamMerits) {
    return;
  }
  state.teamMerits.inbox = archiveInboxThread(getInboxState(), threadId);
  saveTeamMerits();
  renderApp();
}

function markInboxEventThreadRead(threadId) {
  if (!state.teamMerits) {
    return;
  }
  state.teamMerits.inbox = markInboxThreadRead(getInboxState(), threadId);
  saveTeamMerits();
  renderApp();
}

// Bygg ett trådkort for en levende inbox-event-tråd. Bruker kun createElement/
// textContent og gjenbruker message-card-stilen pluss kompakte inbox-event-*
// klasser. options.archived = arkivvisning (ingen handlingsknapper).
function createInboxEventThreadCard(thread, options = {}) {
  const article = document.createElement("article");
  article.className = "message-card inbox-thread-card inbox-event-card";
  article.dataset.type = thread.type;
  article.dataset.priority = thread.priority;
  article.dataset.status = thread.status;

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const from = document.createElement("span");
  from.className = "message-from";
  const senderRole = INBOX_EVENT_SENDER_ROLES[thread.type] || "Klubben";
  from.textContent = `${senderRole}: ${thread.sender}`;

  const typeTag = document.createElement("span");
  typeTag.className = "message-tag";
  typeTag.textContent = INBOX_EVENT_TYPE_LABELS[thread.type] || "Melding";

  const priorityTag = document.createElement("span");
  priorityTag.className = "message-tag inbox-event-priority";
  priorityTag.dataset.priority = thread.priority;
  priorityTag.textContent = INBOX_EVENT_PRIORITY_LABELS[thread.priority] || thread.priority;

  meta.append(from, typeTag, priorityTag);

  if (thread.status !== "unread" && INBOX_EVENT_STATUS_LABELS[thread.status]) {
    const statusTag = document.createElement("span");
    statusTag.className = "message-tag inbox-event-status";
    statusTag.textContent = INBOX_EVENT_STATUS_LABELS[thread.status];
    meta.append(statusTag);
  }

  const title = document.createElement("h3");
  title.textContent = thread.title;

  const summary = document.createElement("p");
  summary.className = "inbox-thread-latest-title";
  summary.textContent = thread.summary;

  const impactLabels = getInboxEventImpactLabels(thread);
  const impact = document.createElement("p");
  impact.className = "inbox-event-impact";
  impact.textContent = impactLabels.length
    ? `Betyr noe for: ${impactLabels.join(" · ")}`
    : "Betyr noe for: managerens neste prioritering";

  // Ekspanderbart innhold samles i bodyNodes og vises bare når tråden er åpen.
  const bodyNodes = [];

  thread.body.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    bodyNodes.push(p);
  });

  // Halvskjult kontekst-hint (vag uro) — forsterker læringsspill-poenget.
  if (thread.hiddenContextNote) {
    const hint = document.createElement("p");
    hint.className = "inbox-event-hidden-hint";
    hint.textContent = thread.hiddenContextNote;
    bodyNodes.push(hint);
  }

  // Tags + lenket handling.
  if (thread.tags.length || thread.linkedAction.label) {
    const footer = document.createElement("div");
    footer.className = "inbox-event-footer";
    thread.tags.forEach((tagText) => {
      const tag = document.createElement("span");
      tag.className = "inbox-event-tag";
      tag.textContent = tagText;
      footer.append(tag);
    });
    if (thread.linkedAction.label) {
      const link = document.createElement("span");
      link.className = "inbox-event-linked";
      link.textContent = `→ ${thread.linkedAction.label}`;
      footer.append(link);
    }
    bodyNodes.push(footer);
  }

  // Resultat etter valg (resolved) eller valgknapper (unread/read).
  if (thread.status === "resolved") {
    const chosen = thread.choices.find((choice) => choice.id === thread.resolvedChoiceId);
    if (chosen) {
      const response = document.createElement("div");
      response.className = "inbox-choice-response";
      const chosenTitle = document.createElement("p");
      chosenTitle.className = "inbox-choice-response-title";
      chosenTitle.textContent = `Valgt: ${chosen.label}`;
      response.append(chosenTitle);
      chosen.resultText.forEach((line) => {
        const body = document.createElement("p");
        body.className = "inbox-choice-response-body";
        body.textContent = line;
        response.append(body);
      });
      bodyNodes.push(response);
    }
  } else if (thread.choices.length) {
    const choiceList = document.createElement("div");
    choiceList.className = "inbox-choice-list";
    thread.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "inbox-choice-button";
      button.dataset.tone = choice.tone;
      button.textContent = choice.label;
      if (choice.description) {
        button.title = choice.description;
      }
      button.addEventListener("click", () => chooseInboxEventChoice(thread.id, choice.id));
      choiceList.append(button);
    });
    bodyNodes.push(choiceList);
  }

  // Handlingsknapper (ikke i arkivvisning).
  if (!options.archived) {
    const actions = document.createElement("div");
    actions.className = "inbox-event-actions";

    if (thread.status === "unread") {
      const readButton = document.createElement("button");
      readButton.type = "button";
      readButton.className = "inbox-thread-read-button";
      readButton.textContent = "Marker som lest";
      readButton.addEventListener("click", () => markInboxEventThreadRead(thread.id));
      actions.append(readButton);
    }

    const archiveButton = document.createElement("button");
    archiveButton.type = "button";
    archiveButton.className = "inbox-thread-read-button inbox-event-archive-button";
    archiveButton.textContent = "Arkiver";
    archiveButton.addEventListener("click", () => archiveInboxEventThread(thread.id));
    actions.append(archiveButton);

    bodyNodes.push(actions);
  }

  makeThreadCollapsible(
    article,
    [meta, title, summary, impact],
    bodyNodes,
    { threadId: thread.id, open: Boolean(options.open) }
  );

  return article;
}

// Render Innboks som trådsystem: levende kontekst-tråder (Inbox Event v1) først,
// deretter de statiske JSON-trådene. Aktive tråder i inboxThreadList, arkiv i
// inboxThreadArchive. Tømmer containerne (eneste innerHTML-bruk) og bygger
// trådkort med createElement/textContent.
function renderInboxThreads() {
  const activeContainer = elements.inboxThreadList;
  const archiveContainer = elements.inboxThreadArchive;
  const inboxState = getInboxState();
  const eventActive = getActiveInboxEventThreads(inboxState);
  const eventArchived = getArchivedInboxEventThreads(inboxState);

  if (activeContainer) {
    activeContainer.innerHTML = "";

    const activeThreads = getActiveInboxThreads();

    // Hvilken tråd er åpen? Brukerens valg vinner; ellers åpnes den første aktive
    // tråden som standard slik at det alltid er én lesbar tråd uten ekstra klikk.
    const activeThreadIds = [
      ...eventActive.map((thread) => thread.id),
      ...activeThreads.map((threadGroup) => getThreadGroupId(threadGroup))
    ].filter(Boolean);
    const openId = activeThreadIds.includes(state.openInboxThreadId)
      ? state.openInboxThreadId
      : activeThreadIds[0] || null;

    eventActive.forEach((thread) => {
      activeContainer.append(createInboxEventThreadCard(thread, { open: thread.id === openId }));
    });

    activeThreads.forEach((threadGroup) => {
      activeContainer.append(
        createInboxThreadCard(threadGroup, {
          showReadButton: true,
          open: getThreadGroupId(threadGroup) === openId
        })
      );
    });

    if (!eventActive.length && !activeThreads.length) {
      activeContainer.append(createMessageCard({
        from: "Klubbkontoret",
        tag: "Ingen uleste tråder",
        title: "Innboksen er rolig",
        body: "Det er ingen aktive uleste tråder akkurat nå."
      }, true));
    }
  }

  if (archiveContainer) {
    archiveContainer.innerHTML = "";

    eventArchived.slice(-12).forEach((thread) => {
      archiveContainer.append(
        createInboxEventThreadCard(thread, { archived: true, open: thread.id === state.openInboxThreadId })
      );
    });

    const archivedThreads = getArchivedInboxThreads();
    archivedThreads.slice(0, 12).forEach((threadGroup) => {
      archiveContainer.append(
        createInboxThreadCard(threadGroup, {
          showReadButton: false,
          open: getThreadGroupId(threadGroup) === state.openInboxThreadId
        })
      );
    });

    if (!eventArchived.length && !archivedThreads.length) {
      archiveContainer.append(createMessageCard({
        from: "Klubbkontoret",
        tag: "Arkiv",
        title: "Ingen trådhistorikk ennå",
        body: "Tråder dukker opp her etter at meldinger er levert eller lest."
      }, true));
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
  const snapshot = getAvailability();
  const places = snapshot.placeUnlocks;

  if (!places.length) {
    renderUnlockEmpty(list, "Ingen besøkte History Go-steder ennå.");
    return;
  }

  places.forEach((place) => {
    const card = createUnlockCard();
    appendUnlockTitle(card, place.placeName || place.placeId);

    // Eksplisitt kildeskille: ekte History Go-progresjon vs. manager-/demostate.
    const source = snapshot.placeSourceById.get(place.placeId);
    appendUnlockMeta(
      card,
      source === "history-go" ? "Kilde: History Go-progresjon" : "Kilde: manager-/demostate"
    );

    if (place.placeRole) {
      appendUnlockMeta(card, `Rolle: ${formatTagText(place.placeRole)}`);
    }

    // Lesbar "dette stedet låser opp"-liste: navn i stedet for tekniske id-er.
    const unlocks = Array.isArray(place.unlocks) ? place.unlocks : [];
    if (unlocks.length) {
      appendUnlockMeta(card, "Dette stedet låser opp:");
      const ul = document.createElement("ul");
      ul.className = "unlock-list";
      unlocks.forEach((unlock) => {
        const li = document.createElement("li");
        li.textContent = describeUnlockTarget(unlock);
        ul.append(li);
      });
      card.append(ul);
    }

    // Historiske systemer stedet peker mot i unlock-reglene (ren forklaring).
    const linkedFormations = getFormationsLinkedToPlace(place.placeId);
    if (linkedFormations.length) {
      appendUnlockMeta(
        card,
        `Åpner historiske systemer: ${linkedFormations.map((formation) => formation.name).join(", ")}`
      );
    }

    list.append(card);
  });
}

// Opplåste spillere: statuslinje + kort med navn, posisjoner, overall og
// kildeplass(er). Bruker bare textContent. Ren visning – ingen fit-/kampeffekt.
function renderUnlockedPlayers() {
  const players = getUnlockedPlayers();

  if (elements.unlockedPlayersStatus) {
    if (players.length > 0) {
      elements.unlockedPlayersStatus.textContent = `Opplåste spillere: ${players.length}`;
    } else {
      elements.unlockedPlayersStatus.textContent =
        "Ingen spillere låst opp ennå. Besøk/synk fotballsteder som Ullevaal, Intility, Gressbanen eller Ekebergsletta.";
    }
  }

  const list = elements.unlockedPlayersList;
  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (players.length === 0) {
    return;
  }

  players.forEach((player) => {
    const card = createUnlockCard();
    appendUnlockTitle(card, player.name || player.id);

    const positions = Array.isArray(player.naturalPositions) ? player.naturalPositions : [];
    if (positions.length) {
      appendUnlockMeta(card, `Posisjoner: ${positions.join(", ")}`);
    }

    if (Number.isFinite(player.overall)) {
      appendUnlockMeta(card, `Overall: ${player.overall}`);
    }

    const sources = getPlayerSourcePlaces(player.id);
    if (sources.length) {
      appendUnlockMeta(card, `Kilde: ${sources.map((place) => place.placeName).join(", ")}`);
    }

    list.append(card);
  });
}

// Stedsrapporter: ett kort per aktivt/samlet sted. Forklarer hva stedet gir
// manageren. Bygger alt med createElement/textContent (ingen innerHTML utenom
// clearing). Ren visning – ingen fit-/kampmotor- eller unlock-effekt.
function renderPlaceReports() {
  const list = elements.placeReportsList;
  if (!list) {
    return;
  }

  list.innerHTML = "";
  const reports = getUnlockedPlaceReports();

  if (!reports.length) {
    renderUnlockEmpty(
      list,
      "Ingen stedsrapporter aktive ennå. Synk besøkte History Go-steder for å se hva de gir manageren."
    );
    return;
  }

  reports.forEach((report) => {
    const card = document.createElement("article");
    card.className = "place-report-card";

    const title = document.createElement("h4");
    title.className = "place-report-title";
    title.textContent = report.title || report.placeId || "Ukjent sted";
    card.append(title);

    if (report.summary) {
      const summary = document.createElement("p");
      summary.className = "place-report-summary";
      summary.textContent = report.summary;
      card.append(summary);
    }

    if (report.managerValue) {
      const managerValue = document.createElement("p");
      managerValue.className = "place-report-summary";
      managerValue.textContent = report.managerValue;
      card.append(managerValue);
    }

    // Små tellere/pills for spillere, stab, ekspertise og trening.
    const counts = getPlaceReportUnlockSummary(report.placeId);
    const meta = document.createElement("div");
    meta.className = "place-report-meta";
    [
      ["Spillere", counts.players],
      ["Stab", counts.staff],
      ["Ekspertise", counts.expertise],
      ["Trening", counts.training]
    ].forEach(([label, value]) => {
      const pill = document.createElement("span");
      pill.className = "place-report-pill";
      pill.textContent = `${label}: ${value}`;
      meta.append(pill);
    });
    card.append(meta);

    // Historiske formasjoner stedet låser opp (fra unlock-reglene, kun visning).
    // Gjør sted → formasjon-koblingen synlig der spilleren leser om stedet.
    const linkedFormations = getFormationsLinkedToPlace(report.placeId);
    if (linkedFormations.length) {
      const formationSection = document.createElement("p");
      formationSection.className = "place-report-section";
      const strong = document.createElement("strong");
      strong.textContent = "Formasjoner: ";
      formationSection.append(strong);
      formationSection.append(
        document.createTextNode(
          `Åpner ${linkedFormations.map((formation) => formation.name).join(", ")}.`
        )
      );
      card.append(formationSection);
    }

    // unlocksExplanation som korte avsnitt med ledetekst.
    const explanation = report.unlocksExplanation || {};
    const explanationFields = [
      ["Spillere", explanation.players],
      ["Stab", explanation.staff],
      ["Ekspertise", explanation.expertise],
      ["Trening", explanation.training],
      ["Lagidentitet", explanation.identity]
    ];
    explanationFields.forEach(([label, text]) => {
      if (!text) {
        return;
      }
      const section = document.createElement("p");
      section.className = "place-report-section";
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      section.append(strong);
      section.append(document.createTextNode(text));
      card.append(section);
    });

    // recommendedUse som punktliste.
    const recommended = Array.isArray(report.recommendedUse) ? report.recommendedUse : [];
    if (recommended.length) {
      const heading = document.createElement("p");
      heading.className = "place-report-section";
      const strong = document.createElement("strong");
      strong.textContent = "Anbefalt bruk:";
      heading.append(strong);
      card.append(heading);

      const ul = document.createElement("ul");
      ul.className = "place-report-list";
      recommended.forEach((item) => {
        if (!item) {
          return;
        }
        const li = document.createElement("li");
        li.textContent = item;
        ul.append(li);
      });
      card.append(ul);
    }

    // helpsBuildClassifications som lesbare navn der mulig, ellers id.
    const classifications = Array.isArray(report.helpsBuildClassifications)
      ? report.helpsBuildClassifications
      : [];
    if (classifications.length) {
      const section = document.createElement("p");
      section.className = "place-report-section";
      const strong = document.createElement("strong");
      strong.textContent = "Hjelper å bygge: ";
      section.append(strong);
      section.append(
        document.createTextNode(classifications.map((id) => getClassificationName(id)).join(", "))
      );
      card.append(section);
    }

    if (report.warning) {
      const warning = document.createElement("p");
      warning.className = "place-report-warning";
      warning.textContent = report.warning;
      card.append(warning);
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
  const identity = getStaffIdentitySummary();
  const identityHost = elements.hiredStaffList?.parentElement;
  const oldIdentity = identityHost?.querySelector(".staff-identity-summary");
  if (oldIdentity) oldIdentity.remove();
  if (identityHost) {
    const box = document.createElement("section");
    box.className = "staff-identity-summary";
    const h = document.createElement("h3");
    h.textContent = `Stabens vurdering: ${identity.identityLabel} (${identity.staffScore}/100)`;
    box.append(h);
    const ul = document.createElement("ul");
    [...identity.strengths, ...identity.gaps].slice(0, 3).forEach((text) => { const li = document.createElement("li"); li.textContent = text; ul.append(li); });
    box.append(ul);
    identityHost.prepend(box);
  }

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

// ============================================================================
// Lagidentitet-render (v1)
// Forklarings- og planleggingspanel: hvilke identiteter laget har oppnådd,
// hvilke det nesten har, og hva som mangler (badges, treningsprogram, steder,
// spillere og stab). Bygger alt med createElement/textContent (ingen innerHTML
// utenom clearing). Ren visning – ingen fit-/kampmotor- eller unlock-effekt.
// ============================================================================

// En liten overskrift i identitetspanelet.
function appendIdentityHeading(panel, text) {
  const heading = document.createElement("h4");
  heading.className = "unlock-subhead";
  heading.textContent = text;
  panel.append(heading);
}

// En anbefalingsrad med etikett og pills (treningsprogram, steder, spillere,
// stab). Vises bare når det finnes minst ett element.
function appendIdentityRecommendation(card, label, items) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!values.length) {
    return;
  }

  const section = document.createElement("div");
  section.className = "team-identity-recommendations";

  const labelEl = document.createElement("span");
  labelEl.className = "team-identity-rec-label";
  labelEl.textContent = label;
  section.append(labelEl);

  const pills = document.createElement("div");
  pills.className = "team-identity-pills";
  values.forEach((value) => {
    const pill = document.createElement("span");
    pill.className = "team-identity-pill";
    pill.textContent = value;
    pills.append(pill);
  });
  section.append(pills);

  card.append(section);
}

// Kort for en oppnådd identitet: navn, "Oppnådd", beskrivelse og møtte krav.
function createUnlockedIdentityCard(entry) {
  const classification = entry.classification;
  const card = document.createElement("article");
  card.className = "team-identity-card is-unlocked";

  const title = document.createElement("h5");
  title.className = "team-identity-title";
  title.textContent = classification.name || classification.id;
  card.append(title);

  const status = document.createElement("p");
  status.className = "team-identity-status";
  status.textContent = "Oppnådd";
  card.append(status);

  if (classification.description) {
    const desc = document.createElement("p");
    desc.className = "team-identity-desc";
    desc.textContent = classification.description;
    card.append(desc);
  }

  if (entry.requirements.length) {
    const reqs = document.createElement("ul");
    reqs.className = "team-identity-requirements";
    entry.requirements.forEach((req) => {
      const li = document.createElement("li");
      li.className = "is-met";
      li.textContent = `${req.familyName}: ${req.currentLevelLabel} (krav ${req.minimumLevelLabel})`;
      reqs.append(li);
    });
    card.append(reqs);
  }

  return card;
}

// Kort for en nesten oppnådd identitet: navn, beskrivelse, progress, manglende
// badges og anbefalte treningsprogram, steder, spillere og stab.
function createNearIdentityCard(entry) {
  const classification = entry.classification;
  const card = document.createElement("article");
  card.className = "team-identity-card is-near";

  const title = document.createElement("h5");
  title.className = "team-identity-title";
  title.textContent = classification.name || classification.id;
  card.append(title);

  if (classification.description) {
    const desc = document.createElement("p");
    desc.className = "team-identity-desc";
    desc.textContent = classification.description;
    card.append(desc);
  }

  const progressLine = document.createElement("p");
  progressLine.className = "team-identity-progress";
  progressLine.textContent = `${entry.completedRequirements}/${entry.totalRequirements} krav oppfylt`;
  card.append(progressLine);

  const missing = entry.missingRequirements;
  if (missing.length) {
    const list = document.createElement("ul");
    list.className = "team-identity-requirements";
    missing.forEach((req) => {
      const li = document.createElement("li");
      li.className = "is-missing";
      li.textContent = `Mangler ${req.familyName}: ${req.minimumLevelLabel} (har ${req.currentLevelLabel})`;
      list.append(li);
    });
    card.append(list);
  }

  // Anbefalte treningsprogram og steder ut fra de manglende badgefamiliene.
  const programNames = new Set();
  const placeNames = new Set();
  missing.forEach((req) => {
    getTrainingProgramsForBadgeFamily(req.familyId).forEach((program) => {
      programNames.add(program.name || program.id);
    });
    getPlacesForBadgeFamily(req.familyId).forEach((place) => {
      placeNames.add(place.placeName);
    });
  });

  appendIdentityRecommendation(card, "Treningsprogrammer", Array.from(programNames));
  appendIdentityRecommendation(card, "Steder", Array.from(placeNames));

  const players = getRelevantPlayersForClassification(classification.id);
  appendIdentityRecommendation(card, "Spillere", players.map((player) => player.name || player.id));

  const staff = getRelevantStaffForClassification(classification.id);
  appendIdentityRecommendation(card, "Stab", staff.map((member) => member.name || member.id));

  return card;
}

// Hovedrender for lagidentitet. Tom/oppstartstekst uten badges, ellers aktive
// og nærmeste identiteter.
function renderTeamIdentityPanel() {
  const panel = elements.teamIdentityPanel;
  if (!panel) {
    return;
  }

  panel.innerHTML = "";

  // Uten opptjente badges har laget ingen tydelig identitet ennå.
  if (!getEarnedBadges().length) {
    const empty = document.createElement("p");
    empty.className = "team-identity-empty";
    empty.textContent =
      "Laget har ikke tydelig identitet ennå. Start med treningsprogrammer i History Go-fanen for å bygge de første badges.";
    panel.append(empty);
    return;
  }

  const progress = getTeamIdentityProgress();
  const unlocked = progress.filter((entry) => entry.isUnlocked);
  const near = progress.filter((entry) => !entry.isUnlocked).slice(0, 3);

  if (unlocked.length) {
    appendIdentityHeading(panel, "Aktive identiteter");
    const grid = document.createElement("div");
    grid.className = "team-identity-grid";
    unlocked.forEach((entry) => grid.append(createUnlockedIdentityCard(entry)));
    panel.append(grid);
  }

  if (near.length) {
    appendIdentityHeading(panel, "Nærmeste identiteter");
    const grid = document.createElement("div");
    grid.className = "team-identity-grid";
    near.forEach((entry) => grid.append(createNearIdentityCard(entry)));
    panel.append(grid);
  }
}

function renderLocalStartStatus() {
  if (!elements.localStartStatus) {
    return;
  }

  const localStart = normalizeLocalStart(state.teamMerits?.localStart);
  const publicStartAnchor = getPublicStartAnchor();
  const readiness = getAvailability().rosterReadiness;
  const shouldShowChoices = !localStart.enabled && !readiness.hasEnoughUnlocked;

  if (elements.startModePanel) {
    elements.startModePanel.hidden = !localStart.enabled && !shouldShowChoices && !publicStartAnchor;
  }
  if (elements.startModeChoices) {
    elements.startModeChoices.hidden = !shouldShowChoices;
  }
  if (elements.activeLocalStart) {
    elements.activeLocalStart.hidden = !localStart.enabled;
  }

  const publicPlaces = getPublicStartPlaces();
  if (elements.publicStartPlaceSelect) {
    const selectedPlaceId = elements.publicStartPlaceSelect.value;
    elements.publicStartPlaceSelect.replaceChildren();
    publicPlaces.forEach((place) => {
      const option = document.createElement("option");
      option.value = place.placeId;
      option.textContent = place.placeName;
      elements.publicStartPlaceSelect.append(option);
    });
    if (publicPlaces.some((place) => place.placeId === selectedPlaceId)) {
      elements.publicStartPlaceSelect.value = selectedPlaceId;
    }
    elements.publicStartPlaceSelect.disabled = publicPlaces.length === 0;
  }
  if (elements.activatePublicPlaceStart) {
    elements.activatePublicPlaceStart.disabled = publicPlaces.length === 0;
  }

  const activeSource = localStart.source === "chosen_place" && localStart.chosenPlaceName
    ? ` via ${localStart.chosenPlaceName}`
    : "";
  elements.localStartStatus.textContent = state.localStartMessage ||
    (localStart.enabled
      ? `Lokal starttropp aktiv${activeSource}: ${localStart.playerIds.length} spillere.`
      : publicPlaces.length === 0 && shouldShowChoices
        ? "Ingen offentlige History Go-startsteder er tilgjengelige i stedslisten."
        : "Velg hvordan managerkarrieren skal starte.");

  if (elements.publicStartAnchorStatus) {
    elements.publicStartAnchorStatus.textContent = publicStartAnchor
      ? `Offentlig startsted: ${publicStartAnchor.placeName}`
      : "Ingen offentlig startposisjon valgt.";
  }
  if (elements.clearPublicStartAnchor) {
    elements.clearPublicStartAnchor.hidden = !publicStartAnchor;
    elements.clearPublicStartAnchor.disabled = !publicStartAnchor;
  }
  if (elements.clearLocalStart) {
    elements.clearLocalStart.disabled = !localStart.enabled;
  }
}

// Din fotballsamling: oppsummering av hva samlingen gir laget akkurat nå.
// Leser kun availability-snapshotet (getAvailability) – steder, spillere, stab,
// ulåste formasjoner og roster readiness. Beregner ingen egne unlocks.
function renderCollectionSummary() {
  if (!elements.collectionPlacesCount) {
    return;
  }

  const snapshot = getAvailability();
  const readiness = snapshot.rosterReadiness;

  elements.collectionPlacesCount.textContent = String(snapshot.unlockedPlaceIds.size);
  if (elements.collectionPlayersCount) {
    elements.collectionPlayersCount.textContent = String(snapshot.unlockedPlayers.length);
  }
  if (elements.collectionStaffCount) {
    elements.collectionStaffCount.textContent = String(snapshot.unlockedStaff.length);
  }
  if (elements.collectionFormationsCount) {
    elements.collectionFormationsCount.textContent =
      `${snapshot.unlockedFormations.length}/${state.formations.length}`;
  }

  if (elements.collectionMatchdayBadge) {
    elements.collectionMatchdayBadge.dataset.ready = readiness.isReady ? "true" : "false";
    elements.collectionMatchdayBadge.textContent = readiness.isReady ? "Klar for kampdag" : "Ikke kampklar";
  }

  // Kildeskille for utvikling/test: hva som kommer fra ekte History Go-progresjon
  // og hva som kommer fra manager-/demostate.
  if (elements.collectionSourceNote) {
    const historyGoCount = snapshot.historyGoPlaceIds.size;
    const managerCount = snapshot.managerPlaceIds.size;
    const localStartCount = getLocalStartPlayerIds().length;
    elements.collectionSourceNote.textContent =
      `Kilder: ${historyGoCount} sted${historyGoCount === 1 ? "" : "er"} fra ekte History Go-progresjon, ` +
      `${managerCount} fra manager-/demostate (utvikling/test), ` +
      `${localStartCount} spiller${localStartCount === 1 ? "" : "e"} fra lokal starttropp.`;
  }

  // Konkret neste handling mot kampdag, i prioritert rekkefølge.
  if (elements.collectionNextStep) {
    let nextStep;
    if (snapshot.unlockedPlayers.length === 0) {
      nextStep =
        "Neste: samle spillersteder i History Go (f.eks. Ullevaal, Intility, Gressbanen eller Ekebergsletta) og synk.";
    } else if (!readiness.hasCompleteXi) {
      nextStep = `Neste: fyll startelleveren i Kontoret (${readiness.starterCount} av ${REQUIRED_STARTERS} på plass).`;
    } else if (!readiness.hasEnoughBench || !readiness.hasEnoughUnlocked) {
      nextStep = "Neste: samle flere spillere til benken via History Go-steder.";
    } else {
      nextStep = "Troppen er klar: gå til Kontoret, finjuster formasjonen og spill kamp.";
    }
    elements.collectionNextStep.textContent = nextStep;
  }
}


function renderNearbyRecommendations() {
  if (!elements.nearbyRecommendationsAnchor || !elements.nearbyRecommendationsList) {
    return;
  }

  const anchor = getPublicStartAnchor();
  elements.nearbyRecommendationsList.innerHTML = "";
  if (!anchor) {
    elements.nearbyRecommendationsAnchor.textContent = "Velg et offentlig startsted for å se nærliggende fotballsteder.";
    return;
  }

  elements.nearbyRecommendationsAnchor.textContent = `Basert på offentlig startsted: ${anchor.placeName}`;
  const recommendations = getNearbyPlaceRecommendations(6);
  if (!recommendations.length) {
    renderUnlockEmpty(elements.nearbyRecommendationsList, "Ingen nærliggende fotballsteder med koordinater funnet ennå.");
    return;
  }

  recommendations.forEach((recommendation) => {
    const card = document.createElement("article");
    card.className = "nearby-recommendation-card";

    const head = document.createElement("div");
    head.className = "nearby-recommendation-head";
    const title = document.createElement("h4");
    title.textContent = recommendation.placeName;
    const distance = document.createElement("span");
    distance.className = "nearby-recommendation-distance";
    distance.textContent = `${recommendation.distanceKm.toFixed(1)} km`;
    head.append(title, distance);
    card.append(head);

    const status = document.createElement("p");
    status.className = "nearby-recommendation-status";
    status.dataset.unlocked = recommendation.isUnlocked ? "true" : "false";
    status.textContent = recommendation.isUnlocked ? "Samlet" : "Ikke samlet";
    card.append(status);

    const summary = document.createElement("p");
    summary.className = "nearby-recommendation-summary";
    const counts = recommendation.unlockSummary;
    summary.textContent = `Spillere: ${counts.players} · Stab: ${counts.staff} · Ekspertise: ${counts.expertise} · Trening: ${counts.training}`;
    card.append(summary);

    const reasonText = recommendation.recommendedUse[0] || recommendation.shortReason;
    if (reasonText) {
      const reason = document.createElement("p");
      reason.className = "nearby-recommendation-reason";
      reason.textContent = reasonText;
      card.append(reason);
    }

    const names = [...recommendation.playerNames.slice(0, 3), ...recommendation.staffNames.slice(0, 2)];
    if (names.length) {
      const people = document.createElement("p");
      people.className = "nearby-recommendation-people";
      people.textContent = `Profiler: ${names.join(", ")}`;
      card.append(people);
    }

    elements.nearbyRecommendationsList.append(card);
  });
}

// Statusfelt for ekte History Go-sync: hvor mange steder som er funnet i hver
// kilde, og hvor mange relevante Football Manager-unlock-steder som er aktive.
function renderHistoryGoSyncStatus() {
  const el = elements.historyGoSyncStatus;
  if (!el) {
    return;
  }

  const snapshot = getAvailability();
  const visitedCount = getHistoryGoVisitedPlaceIds().size;
  const groundhopperCount = getHistoryGoGroundhopperPlaceIds().size;
  const historyGoCount = snapshot.historyGoPlaceIds.size;
  const managerCount = snapshot.managerPlaceIds.size;

  if (historyGoCount === 0) {
    el.textContent =
      `History Go-sync: ingen besøkte sportsteder funnet fra History Go-appen ennå. ` +
      `Alt under kommer fra manager-/demostate (${managerCount} steder) – demodata for utvikling og test.`;
    return;
  }

  el.textContent =
    `History Go-sync: ${historyGoCount} sportsteder fra ekte History Go-progresjon ` +
    `(${visitedCount} i visited_places, ${groundhopperCount} i hg_groundhopper_stats_v1)` +
    (managerCount > 0 ? ` + ${managerCount} fra manager-/demostate (utvikling/test).` : ".");
}

// Tropp og benk (roster readiness): rendres fra availability-snapshotet inn i
// statisk HTML i index.html. Ingen egen modul, ingen egen JSON-/localStorage-
// lesing og ingen CSS-injeksjon.
function renderRosterReadiness() {
  const readiness = getAvailability().rosterReadiness;

  if (elements.rosterReadyCount) {
    elements.rosterReadyCount.textContent = `${readiness.unlockedCount}/${REQUIRED_SQUAD_SIZE}`;
  }
  if (elements.rosterUnlockedCount) {
    elements.rosterUnlockedCount.textContent = `${readiness.unlockedCount}/${REQUIRED_SQUAD_SIZE}`;
  }
  if (elements.rosterStarterCount) {
    elements.rosterStarterCount.textContent = `${readiness.starterCount}/${REQUIRED_STARTERS}`;
  }
  if (elements.rosterBenchCount) {
    elements.rosterBenchCount.textContent = `${Math.min(readiness.benchCount, REQUIRED_BENCH)}/${REQUIRED_BENCH}`;
  }
  if (elements.rosterReadyStatus) {
    elements.rosterReadyStatus.textContent = readiness.isReady ? "Åpen" : "Låst";
  }

  if (elements.rosterReadinessBadge) {
    elements.rosterReadinessBadge.textContent = readiness.isReady ? "Spillklar" : "Låst";
    elements.rosterReadinessBadge.dataset.ready = readiness.isReady ? "true" : "false";
  }

  if (elements.rosterReadinessNote) {
    const noteParts = [];
    if (readiness.missingUnlocked > 0) {
      noteParts.push(`samle ${readiness.missingUnlocked} spiller${readiness.missingUnlocked === 1 ? "" : "e"} til`);
    }
    if (readiness.missingStarters > 0) {
      noteParts.push(`fyll ${readiness.missingStarters} plass${readiness.missingStarters === 1 ? "" : "er"} i startelleveren`);
    }
    if (readiness.missingBench > 0) {
      noteParts.push(`ha ${readiness.missingBench} benkespiller${readiness.missingBench === 1 ? "" : "e"} til`);
    }

    elements.rosterReadinessNote.textContent = readiness.isReady
      ? "Troppen er spillklar: 11 på banen og minst 4 på benken. Neste steg er kampmotor/motstanderprofil."
      : `Ikke spillklar ennå: ${noteParts.join(", ") || "mangler troppsgrunnlag"}.`;
  }

  renderBenchList(readiness.benchCandidates);
}

// Benkeliste: opplåste spillere som ikke står i startelleveren. De første fire
// regnes som registrert benk (15-spillerkravet); resten er reserve.
function renderBenchList(players) {
  const list = elements.benchPlayersList;
  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (players.length === 0) {
    const empty = document.createElement("p");
    empty.className = "bench-empty muted-text";
    empty.textContent = "Ingen benkespillere tilgjengelig ennå.";
    list.append(empty);
    return;
  }

  players.slice(0, Math.max(REQUIRED_BENCH, 8)).forEach((player, index) => {
    const card = document.createElement("article");
    card.className = index < REQUIRED_BENCH ? "bench-player-card is-registered" : "bench-player-card";

    const name = document.createElement("strong");
    name.textContent = player.name || player.id;

    const meta = document.createElement("span");
    const positions = Array.isArray(player.naturalPositions) ? player.naturalPositions.join(", ") : "–";
    meta.textContent = `${positions} · ${Number.isFinite(player.overall) ? player.overall : "–"}`;

    card.append(name, meta);
    list.append(card);
  });
}

function renderApp() {
  // Fersk availability-beregning per render: én runtime-kilde for unlocks,
  // formasjonstilgjengelighet og roster readiness.
  invalidateAvailability();

  const teamFit = getTeamFit();

  renderControls();
  renderTeamSummary(teamFit);
  renderLineup(teamFit);
  renderRosterReadiness();
  renderTacticalSystemPanel();
  renderSidePanel(teamFit);
  renderNextActionStrip(teamFit);
  renderDecisionCards(teamFit);
  renderSuggestedSetups(teamFit);
  renderContextPanel();
  renderReport(teamFit);
  renderBadgeEffects(teamFit);
  renderMatchday(teamFit);
  renderMiniSeason();
  renderWeeklyTrainingFocus(teamFit);
  renderTrainingProgramCompositions(teamFit);

  renderTrainingWeekCounters();
  renderManagerEngineBridge(teamFit);
  renderManagerDetailFromTeamFit(teamFit);
  renderClubWeek().catch(console.error);
  refreshInboxEvents(teamFit);
  renderInboxThreads();
  renderDepartments();

  // History Go-unlocks (v1): sted → person → ekspertise → program → badge → lagklasse.
  renderHistoryGoSyncStatus();
  renderCollectionSummary();
  renderNearbyRecommendations();
  renderLocalStartStatus();
  renderUnlockPlaces();
  renderUnlockedPlayers();
  renderPlaceReports();
  renderStaffUnlocks();
  renderExpertiseUnlocks();
  renderTrainingPrograms();
  renderHgTrainingWeek();
  renderEarnedBadges();
  renderTeamClassifications();
  renderTeamIdentityPanel();
}

function bindEvents() {
  elements.formationSelect.addEventListener("change", (event) => {
    const nextFormationId = event.target.value;

    // Disabled options skal hindre dette, men vern uansett: låste formasjoner
    // kan ikke aktiveres som managerformasjon.
    if (!isFormationUnlocked(nextFormationId)) {
      renderApp();
      return;
    }

    state.selectedFormationId = nextFormationId;
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

  if (elements.useHistoryGoCollection) {
    elements.useHistoryGoCollection.addEventListener("click", () => {
      // Startvalget "Bruk History Go-samlingen min" er et rent UI-valg: det
      // skal ikke skrive til teamMerits, visited_places eller
      // hg_groundhopper_stats_v1. Availability leser ekte History Go-progresjon
      // live i computeAvailability(), så en rerender er nok.
      state.localStartMessage = "Bruker eksisterende History Go-samling uten å endre progresjon.";
      invalidateAvailability();
      sanitizeLineupForUnlockedPlayers();
      sanitizeSelectedFormation();
      renderApp();
    });
  }

  if (elements.activateLocalStart) {
    elements.activateLocalStart.addEventListener("click", () => {
      if (!navigator.geolocation) {
        state.localStartMessage = "Geolokasjon støttes ikke av denne nettleseren.";
        renderLocalStartStatus();
        return;
      }

      state.localStartMessage = "Henter posisjonen din …";
      renderLocalStartStatus();
      navigator.geolocation.getCurrentPosition(
        (position) => {
          activateLocalStartSquad({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          const messages = {
            1: "Tilgang til geolokasjon ble avslått. Tillat posisjonstilgang og prøv igjen.",
            2: "Kunne ikke finne posisjonen din. Kontroller posisjonstjenestene og prøv igjen.",
            3: "Posisjonsforespørselen tok for lang tid. Prøv igjen."
          };
          state.localStartMessage = messages[error.code] || "Kunne ikke hente posisjonen din.";
          renderLocalStartStatus();
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  if (elements.activatePublicPlaceStart) {
    elements.activatePublicPlaceStart.addEventListener("click", () => {
      const place = getPublicStartPlaces().find(
        (entry) => entry.placeId === elements.publicStartPlaceSelect?.value
      );
      if (!place) {
        state.localStartMessage = "Velg et offentlig History Go-sted fra listen.";
        renderLocalStartStatus();
        return;
      }

      const anchor = setPublicStartAnchor(place.placeId);
      if (!anchor) {
        state.localStartMessage = "Startstedet mangler gyldige koordinater og ble ikke lagret.";
        renderLocalStartStatus();
        return;
      }

      activateLocalStartSquad(
        { latitude: anchor.latitude, longitude: anchor.longitude },
        { source: "chosen_place", chosenPlaceId: anchor.placeId, chosenPlaceName: anchor.placeName }
      );
    });
  }

  if (elements.clearPublicStartAnchor) {
    elements.clearPublicStartAnchor.addEventListener("click", clearPublicStartAnchor);
  }

  if (elements.clearLocalStart) {
    elements.clearLocalStart.addEventListener("click", clearLocalStartSquad);
  }

  // Manuell synk av ekte History Go-steder. Gjør testing enkel på iPad/GitHub Pages.
  if (elements.syncHistoryGoPlaces) {
    elements.syncHistoryGoPlaces.addEventListener("click", () => {
      refreshAvailabilityFromHistoryGo();
    });
  }

  // Same-window refresh: History Go/appskallet dispatcher "updateProfile" når
  // progresjonen endres i samme vindu. Re-synk, recompute og rerender uten å
  // være avhengig av storage-eventet (som bare fyrer i andre vinduer).
  window.addEventListener("updateProfile", () => {
    refreshAvailabilityFromHistoryGo();
  });

  // Cross-tab/vindu: History Go skriver progresjon i localStorage; storage-
  // eventet dekker endringer fra andre vinduer/faner. key === null betyr clear().
  window.addEventListener("storage", (event) => {
    if (
      !event.key ||
      event.key === HISTORY_GO_VISITED_PLACES_KEY ||
      event.key === HISTORY_GO_GROUNDHOPPER_STATS_KEY
    ) {
      refreshAvailabilityFromHistoryGo();
    }
  });

  if (elements.advanceClubWeekPhase) {
    elements.advanceClubWeekPhase.addEventListener("click", () => {
      advanceClubWeekPhaseAction().catch(console.error);
    });
  }

  // Kampdag (v1): spill kamp med gjeldende laguttak / nullstill siste kamp.
  if (elements.playMatchdayButton) {
    elements.playMatchdayButton.addEventListener("click", () => {
      playMatchday();
    });
  }

  if (elements.resetMatchdayButton) {
    elements.resetMatchdayButton.addEventListener("click", () => {
      resetMatchday();
    });
  }

  // Mini Season v0.1: start ny prøveperiode / nullstill kun mini-sesong-state.
  if (elements.startMiniSeasonButton) {
    elements.startMiniSeasonButton.addEventListener("click", () => {
      startMiniSeason();
    });
  }

  if (elements.resetMiniSeasonButton) {
    elements.resetMiniSeasonButton.addEventListener("click", () => {
      resetMiniSeason();
    });
  }
}

// Avanser klubbukens fase med konsekvenser, logg og feedback. Delt mellom
// toppstripe-knappen og "Neste beslutninger". Trigger renderApp via setClubWeekState.
async function advanceClubWeekPhaseAction() {
  // Mangler tilstanden, lager vi en initial uke 1 / analyse først.
  if (!state.clubWeekState) {
    state.clubWeekState = await createInitialClubWeekStateFromBrowser({});
  }

  // Kampdag ↔ Club Week: kampdagfasen krever en kamp spilt denne uka før uka
  // ruller videre. Stengt port gir kun feedback — ingen fasebytte eller logg.
  const gate = getClubWeekMatchdayGate();
  if (gate.isBlocked) {
    setClubWeekFeedback(gate.reason);
    renderApp();
    return;
  }

  const previous = state.clubWeekState;
  let next = await advanceClubWeekPhaseFromBrowser(previous);
  if (next.week !== previous.week) {
    if (!state.firstTimePlaythrough?.completed && state.matchday?.lastMatch && !hasUnseenMatchReport()) {
      state.firstTimePlaythrough = { started: true, completed: true, currentStep: "completed" };
      saveFirstTimePlaythrough();
    }
    state.weeklyTrainingFocus = null;
    saveWeeklyTrainingFocus();
    state.weeklyTrainingProgram = null;
    saveWeeklyTrainingProgram();
    // Mini Season v1 / League Loop v1: en ny Club Week-uke ruller mini-sesongen
    // til neste kamp (eller fullfører den etter femte kamp).
    advanceMiniSeasonForNewWeek();
  }
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
}

// Aktiver en fane programmatisk: brukes av fane-knappene og av "Neste
// beslutninger" som navigerer brukeren til riktig avdeling.
function activateTab(target) {
  const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
  const sections = Array.from(document.querySelectorAll("[data-tab-section]"));

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === target;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  sections.forEach((section) => {
    section.hidden = section.dataset.tabSection !== target;
  });

  // Å åpne Kamp-flaten regnes som at manageren har sett kamprapporten — da
  // forsvinner «Se kamprapporten» fra Neste handling-stripa. Stille persistens;
  // selve rerendret skjer der navigasjonen utløses (initTabs / handlinger).
  if (target === "kamp") {
    markMatchReportSeen();
    if (!state.firstTimePlaythrough?.completed && state.matchday?.lastMatch) {
      state.firstTimePlaythrough = { ...normalizeFirstTimePlaythrough(state.firstTimePlaythrough), currentStep: "report" };
      saveFirstTimePlaythrough();
    }
  }
}

function initTabs() {
  const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tabTarget;
      // Rerender bare når sett-flagget faktisk endrer noe (åpner Kamp med en
      // ulest rapport), slik at Neste handling-stripa oppdateres uten å rendre
      // hele appen på hvert fanetrykk.
      const needsRender = target === "kamp" && hasUnseenMatchReport();
      activateTab(target);
      if (needsRender) {
        renderApp();
      }
    });
  });
}

async function init() {
  initTabs();

  // Start lasting av TS-motoren parallelt med datafilene. Vi venter på den før
  // første render, slik at manager-detalj-panelet kan bygges synkront i
  // renderApp i stedet for å skrive seg inn en tikk senere (ingen blink).
  const managerEngineReady = preloadManagerEngine();

  try {
    const [
      playersData,
      playerArchetypesData,
      rolesData,
      tacticsData,
      formationsData,
      knowledgeData,
      clubInboxSendersData,
      clubInboxThreadsData,
      unlocksData,
      placeLocationsData,
      staffData,
      expertiseData,
      trainingProgramsData,
      trainingBadgesData,
      teamClassificationsData,
      placeReportsData,
      teamMeritsData,
      hgFormationErasData,
      hgRoleTypesData,
      hgRoleFitRulesData,
      hgUnlockRulesData,
      hgStaffRolesData,
      legacyFormationsData,
      hgFormationKnowledgeData
    ] = await Promise.all([
      loadJson(DATA_PATHS.players),
      // Spillerarketyper er valgfrie for kjøring: hvis filen mangler, fortsetter
      // appen med tom arketypeliste (kun validering varsler om brutte koblinger).
      loadJson(DATA_PATHS.playerArchetypes).catch(() => null),
      loadJson(DATA_PATHS.roles),
      loadJson(DATA_PATHS.tactics),
      // Primærkilde for taktikktavla: de historiske hgFootball-formasjonene.
      loadJson(DATA_PATHS.hgFormations),
      // Kunnskapsdata er valgfri: hvis filen mangler, fortsetter demoen uten den.
      loadJson(DATA_PATHS.knowledgePrinciples).catch(() => null),
      // Avsenderkatalogen er valgfri: hvis filen mangler, brukes fallback-avsendere.
      loadJson(DATA_PATHS.clubInboxSenders).catch(() => null),
      // Trådkatalogen er valgfri: hvis filen mangler, brukes fallback-tråder.
      loadJson(DATA_PATHS.clubInboxThreads).catch(() => null),
      // History Go-unlock-data er valgfri: hvis en fil mangler, fortsetter
      // appen uten det aktuelle laget (prototype-robusthet).
      loadJson(DATA_PATHS.unlocks).catch(() => null),
      loadJson(DATA_PATHS.placeLocations).catch(() => null),
      loadJson(DATA_PATHS.staff).catch(() => null),
      loadJson(DATA_PATHS.expertise).catch(() => null),
      loadJson(DATA_PATHS.trainingPrograms).catch(() => null),
      loadJson(DATA_PATHS.trainingBadges).catch(() => null),
      loadJson(DATA_PATHS.teamClassifications).catch(() => null),
      // Stedsrapporter er valgfrie: hvis filen mangler/er ugyldig, faller appen
      // tilbake til tom liste og bygger enkle fallback-kort fra placeUnlocks.
      loadJson(DATA_PATHS.placeReports).catch(() => null),
      loadJson(DATA_PATHS.teamMerits).catch(() => null),
      // Historiske epoker (kreves for å vise epoke/skole på valgt formasjon).
      loadJson(DATA_PATHS.hgFormationEras).catch(() => null),
      // roleTypes/fit-regler/unlock-regler er valgfrie: ved feil faller appen
      // tilbake til id-er / nøytrale hint uten å kaste.
      loadJson(DATA_PATHS.hgRoleTypes).catch(() => null),
      loadJson(DATA_PATHS.hgRoleFitRules).catch(() => null),
      loadJson(DATA_PATHS.hgUnlockRules).catch(() => null),
      // Stab-/trenerroller er valgfrie: ved feil faller coachContext tilbake til
      // ren kategori-vekting uten staffRoles-affects, og krasjer ikke.
      loadJson(DATA_PATHS.hgStaffRoles).catch(() => null),
      // Gammel formasjonskatalog beholdes som trygg fallback.
      loadJson(DATA_PATHS.legacyFormations).catch(() => null),
      // Formasjonskunnskap er valgfri: mangler den, kjøres kampdag uten matchup.
      loadJson(DATA_PATHS.hgFormationKnowledge).catch(() => null)
    ]);

    state.players = playersData.players || [];
    state.playerArchetypes = playerArchetypesData?.archetypes || [];
    state.roles = rolesData.roles;
    state.tactics = tacticsData.tactics;

    // Historisk hgFootball-grunnlag: rådata + oppslag. Taktikktavla bygges fra
    // disse via adapteren (shape -> slots), ikke fra en hardkodet liste i JS.
    state.hgFormations = Array.isArray(formationsData?.formations) ? formationsData.formations : [];
    state.hgFormationEras = Array.isArray(hgFormationErasData?.eras) ? hgFormationErasData.eras : [];
    state.hgRoleTypes = Array.isArray(hgRoleTypesData?.roleTypes) ? hgRoleTypesData.roleTypes : [];
    state.hgRoleTypeIndex = buildRoleTypeIndex(hgRoleTypesData);
    state.hgRoleFitRules = hgRoleFitRulesData || null;
    state.hgUnlockRules = hgUnlockRulesData || null;
    state.hgStaffRoles = Array.isArray(hgStaffRolesData?.staffRoles) ? hgStaffRolesData.staffRoles : [];
    state.legacyFormations = Array.isArray(legacyFormationsData?.formations)
      ? legacyFormationsData.formations
      : [];

    // Indekser formasjonskunnskap på formationId for raskt matchup-/UI-oppslag.
    state.formationKnowledgeById = buildFormationKnowledgeIndex(hgFormationKnowledgeData);
    state.historicalOpponentIndex = buildOpponentProfileIndex(HISTORICAL_OPPONENT_PROFILES);

    // Oversett historiske formasjoner til runtime-format og fyll taktikktavla.
    // Faller trygt tilbake til legacy-katalogen hvis hgFootball-data mangler.
    state.formations = adaptHgFormations(formationsData, hgFormationErasData);
    if (!state.formations.length) {
      state.formations = state.legacyFormations;
      console.warn("hgFootball-formasjoner mangler eller er ugyldige. Faller tilbake til legacy football_formations.json.");
    }

    if (Array.isArray(knowledgeData?.principles)) {
      state.knowledgePrinciples = knowledgeData.principles;
    } else {
      state.knowledgePrinciples = [];
      console.warn("Fotballkunnskap-data mangler eller har feil format. Fortsetter uten kunnskapsanbefalinger.");
    }

    // Innboks-meldinger lastes manifest-basert (én fil per avsender) med
    // fallback til legacy samlefil og deretter hardkodede meldinger.
    state.clubInboxMessages = await loadClubInboxMessages();

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
    state.placeLocations = Array.isArray(placeLocationsData?.places) ? placeLocationsData : { places: [] };
    state.staff = Array.isArray(staffData?.staff) ? staffData.staff : [];
    state.expertise = Array.isArray(expertiseData?.expertise) ? expertiseData.expertise : [];
    state.trainingPrograms = Array.isArray(trainingProgramsData?.programs) ? trainingProgramsData.programs : [];
    state.trainingBadges = Array.isArray(trainingBadgesData?.badgeFamilies) ? trainingBadgesData : { badgeFamilies: [] };
    state.teamClassifications = Array.isArray(teamClassificationsData?.classifications)
      ? teamClassificationsData
      : { classifications: [] };
    state.placeReports = Array.isArray(placeReportsData?.placeReports)
      ? placeReportsData
      : { placeReports: [] };
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

    // Startvalg: første tilgjengelige (ulåste) formasjon, ikke bare første i
    // listen. Team merits er lastet og History Go-synket over, så availability-
    // snapshotet er gyldig her.
    state.selectedFormationId = (getAvailability().unlockedFormations[0] || state.formations[0])?.id || null;
    state.selectedTacticId = state.tactics[0]?.id || null;
    state.trainingWeek = loadTrainingWeek();
    state.activeKnowledgeFocusId = loadActiveKnowledgeFocus();
    state.completedKnowledgeFocusIds = loadCompletedKnowledgeFocusIds();
    state.readInboxMessageIds = loadReadInboxMessageIds();
    state.deliveredInboxMessageIds = loadDeliveredInboxMessageIds();
    // Innboks-svarvalg (v1): valgkatalog fra manifest + brukerens lagrede valg.
    // loadClubInboxChoices kaster aldri – appen fungerer uten valg-manifest.
    state.clubInboxChoices = await loadClubInboxChoices();
    state.selectedInboxChoices = loadSelectedInboxChoices();
    // Innboks-trådsvar (v1): reply-katalog fra manifest. loadClubInboxReplies
    // kaster aldri – appen fungerer uten reply-manifest.
    state.clubInboxReplies = await loadClubInboxReplies();
    // Kampdag (v1): hent siste spilte kamp fra localStorage.
    state.matchday = loadMatchdayState();
    // Mini Season v0.1: hent eventuell prøveperiode fra localStorage. Korrupt
    // eller manglende state gir null (= ingen prøveperiode startet).
    state.miniSeason = loadMiniSeason();
    state.firstTimePlaythrough = loadFirstTimePlaythrough();

    const dataWarnings = validateFootballData(state);

    if (dataWarnings.length > 0) {
      console.warn("Football Manager-data har kvalitetsadvarsler:", dataWarnings);
    }

    const unlockWarnings = validateUnlockData();

    if (unlockWarnings.length > 0) {
      console.warn("History Go unlock-data har kvalitetsadvarsler:", unlockWarnings);
    }

    const placeReportWarnings = validatePlaceReportsData();

    if (placeReportWarnings.length > 0) {
      console.warn("Stedsrapport-data har kvalitetsadvarsler:", placeReportWarnings);
    }

    const classificationWarnings = validateTeamClassificationsData();

    if (classificationWarnings.length > 0) {
      console.warn("Lagklasse-data har kvalitetsadvarsler:", classificationWarnings);
    }

    // Club Week-tilstand: les lagret tilstand (fra merits, evt. migrert fra den
    // gamle nøkkelen) og la engine/fallback normalisere den (ugyldig/gammel
    // verdi blir uke 1 / analyse).
    const storedClubWeekState = loadClubWeekState();
    state.clubWeekState = await createInitialClubWeekStateFromBrowser(storedClubWeekState || {});
    // Persister med én gang: skriver den kanoniske kopien inn i merits og rydder
    // bort den gamle frittstående localStorage-nøkkelen (migrering).
    saveClubWeekState(state.clubWeekState);
    state.weeklyTrainingFocus = loadWeeklyTrainingFocus();
    state.weeklyTrainingProgram = loadWeeklyTrainingProgram();
    syncWeeklyTrainingFocusToClubWeek();
    state.clubWeekFeedback = loadClubWeekFeedback();
    state.clubWeekEventLog = loadClubWeekEventLog();

    seedLineupForFormation();
    // Saner lineup etter at players/unlocks/teamMerits er lastet og synket, slik
    // at gamle valg ikke omgår unlock-regelen.
    sanitizeLineupForUnlockedPlayers();
    // Vern: skulle valgt formasjon likevel være låst, fall tilbake til første
    // tilgjengelige formasjon.
    sanitizeSelectedFormation();
    ensurePositionsForFormation();
    bindEvents();

    // Vent til TS-motoren er ferdig lastet (eller bekreftet utilgjengelig) før
    // første render, slik at renderManagerEngineBridge kan kjøre synkront.
    // Demoen fungerer uansett: er dist/ ikke bygget, løser preload til null.
    await managerEngineReady;

    renderApp();
  } catch (error) {
    elements.teamStatus.textContent = "Feil";
    elements.reportSummary.textContent = `${error.message}. Kjør prosjektet via GitHub Pages eller en enkel lokal server.`;
  }
}

init();

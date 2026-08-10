Warning: truncated output (original token count: 172077)
Total output lines: 17163

import { FOOTBALL_POSITIONS } from "./football-fit-engine.js";
import {
  buildSelectedSquadPlayerIds,
  migrateLegacyPlayerPoolSquadState,
  normalizePlayerPoolSquadState,
  normalizeRecruitmentState
} from "./football-recruitment.js";
import { decorateHiredStaffWithAssignments, selectStarterStaffCandidates, summarizeStaffRoster } from "./football-staff-roster.js";
import { calculateFacilityEffects, normalizeFacilityState, upgradeFacilityInMerits } from "./football-facilities.js";
import { createManagerFacilitiesModel, renderManagerFacilitiesWorkspace } from "./ui/manager-facilities-workspace-v1.js";
import "./ui/manager-shell-elements.js";
import { createMatchFlowSnapshot } from "./ui/manager-shell-view.js";
import { createClubIdentityView, renderClubIdentity } from "./ui/manager-club-identity.js";
import { getTrainingWorkspaceTarget, syncTrainingWorkspace } from "./ui/training-workspace-view.js";
import { compactPlayerName, describeTacticalFit } from "./ui/manager-lineup-presentation.js";
import { createMatchdaySceneModel, renderManagerMatchdayCommand } from "./ui/manager-matchday-presentation.js";
import { createSeasonSceneModel, renderSeasonCommand, renderSeasonLeagueOverview } from "./ui/manager-season-presentation.js";
import { createOfficeSceneModel, renderOfficeCommand } from "./ui/manager-office-presentation.js";
import { createManagerTrainingSceneModel, renderManagerTrainingCommand } from "./ui/manager-training-presentation.js";
import { createManagerClubSceneModel, renderManagerClubCommand } from "./ui/manager-club-presentation.js";
import { getTacticalKnowledgeForTactic } from "./football-tactical-knowledge.js";
import { calculateTeamFit } from "./football-team-fit-engine.js";
import { calculateBadgeMetricEffects } from "./football-badge-effect-engine.js";
import {
  createMatchReport,
  createMatchdaySession,
  resolveMatchdayDecision,
  finalizeMatchdaySession,
  getSessionEventIndex,
  advanceMatchClock,
  logMatchMoment,
  applyMatchPlanChange,
  applyMatchdaySubstitution,
  applyOpponentAdaptation,
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
  createFederationArchiveEntry,
  createFederationVerdict,
  deriveFederationExpectation
} from "./football-federation-verdict.js";
import {
  appendSeasonArchive,
  createSeasonArchiveEntry,
  createSeasonReview,
  deriveSeasonTarget,
  summarizeSeasonHistory
} from "./football-season-review.js";
import {
  createScenarioMiniSeasonContext,
  describeScenario,
  getScenario,
  normalizeScenarios
} from "./football-scenarios.js";
import {
  applyMatchPlayerStats,
  rankPlayerStats,
  summarizePlayerStats
} from "./football-player-stats.js";
import {
  applyMatchToConditions,
  applyWeeklyRecovery,
  conditionFor,
  describeCondition,
  fatigueFactorFor,
  freshnessFor,
  injuredPlayerIds,
  isInjured,
  playersNeedingRest,
  applySummerBreak,
  applyIndividualTrainingEffects,
  summarizeSquadCondition
} from "./football-player-condition.js";
import {
  MAX_SUBSTITUTIONS,
  availableSubstitutions,
  rankSubstitutionsForSlot,
  substitutionsRemaining
} from "./football-substitutions.js";
import {
  LEAGUE_SEASON_VERSION,
  createLeagueSeason,
  DEFAULT_LEAGUE_TIER,
  isPlayoffPending,
  resolveLeagueOutcome,
  normalizeLeagueSeason,
  getNextLeagueOpponent,
  completeLeagueRound,
  createLeagueTable,
  startNextLeagueSeason
} from "./football-league-season.js";
import { judgeClubTradition, buildTraditionThresholds } from "./football-club-tradition.js";
import { resolveClubSquadAccess, reconcileClubBaseSquadSave, listClubHeritagePlayers } from "./football-club-squad.js";
import {
  normalizeAttributeCatalogue,
  derivePlayerAttributeIndex,
  describePositionDemands,
  splitRoleRequirements,
  resolveAttributeToken
} from "./football-player-attributes.js";
import {
  listSelectableClubs,
  resolveStartTier,
  describeClubSelection,
  deriveClubExpectation,
  createManagerClubFromSelection,
  createOwnManagerClub
} from "./football-club-selection.js";
import {
  createLeaguePlayoff,
  completePlayoffLeg,
  resolveLeaguePlayoff,
  describePlayoff,
  getPlayoffMatchdayOpponent,
  normalizeLeaguePlayoff,
  LEAGUE_PLAYOFF_VERSION
} from "./football-league-playoff.js";
import {
  TOURNAMENT_STAGE_LABELS,
  createTournament,
  normalizeTournamentState,
  getEligibleTournaments,
  getTournamentNextOpponent,
  applyTournamentMatchResult,
  createTournamentGroupTable,
  createTournamentBracket,
  getTournamentTeam,
  summarizeTournament
} from "./football-tournament.js";
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
import { selectDefaultFormation, selectDefaultMatchPlan } from "./football-default-formation.js";
import { evaluateMatchdayReadiness } from "./football-matchday-readiness.js";
import {
  GAME_STATE_LABELS,
  rankPlansForSituation,
  readGameState
} from "./football-match-plan.js";
import {
  normalizeRoleFamiliarity,
  recordMatchRoleUsage,
  summarizeLineupFamiliarity,
  describeRoleFamiliarity,
  getRoleFamiliarity,
  applyTrainingRoleGrowth
} from "./football-role-familiarity-engine.js";
import { createRoleLearningViewModel } from "./football-role-learning-view-model.js";
import {
  createTrainingProgramCompositions,
  getTrainingProgramCompositionById
} from "./football-training-program-compositions.js";
// Ukens plan: den ene modellen som binder ramme, tema og enkeltspiller sammen.
import {
  createWeeklyTrainingPlan,
  calculateWeeklyTrainingIntensity,
  evaluateProgramFocusCoherence,
  describeWeeklyLoad
} from "./football-training-plan.js";
import {
  PLAYER_WEAKNESS_VERSION,
  normalizeWeaknessCatalogue,
  normalizeWeaknessProgress,
  identifyPlayerWeaknesses,
  getWeaknessProgress,
  describeWeaknessProgress,
  applyWeaknessTraining,
  weeklyWeaknessGrowth,
  summarizeLineupWeaknessWork,
  getWeaknessAttribute
} from "./football-player-weaknesses.js";
import {
  normalizeIndividualTrainingCatalogue,
  getIndividualTrack,
  calculateIndividualCapacity,
  sanitizeIndividualAssignments,
  evaluateIndividualAssignment,
  resolveIndividualTrainingWeek,
  summarizeIndividualTraining
} from "./football-individual-training.js";
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
  getHistoricalFormationRoleHint,
  lineXPositions
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
import {
  migrateModeSessions,
  persistModeEnvelope,
  switchModeSession,
  resetSecondarySession,
  captureModeSession,
  applyModeSession
} from "./football-mode-sessions.js";

const DATA_PATHS = {
  players: "data/football_players.json",
  // Spillerarketyper (rolleprofiler/underliggende logikk) som ekte spillere
  // kobler seg til via archetypeIds. Brukes ikke til å fylle spillerselect.
  playerArchetypes: "data/football_player_archetypes.json",
  roles: "data/football_roles.json",
  tactics: "data/football_tactics.json",
  // Scenarioer: korte historiske utfordringer bygget på arketypene.
  scenarios: "data/football_scenarios.json",
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
  footballBookKnowledgeIndex: "data/football_book_knowledge_principles.json",
  clubInboxMessages: "data/club_inbox_messages.json",
  clubInboxMessageManifest: "data/club_inbox_messages/manifest.json",
  clubInboxSenders: "data/club_inbox_senders.json",
  clubInboxThreads: "data/club_inbox_threads.json",
  clubInboxChoiceManifest: "data/club_inbox_choices/manifest.json",
  clubInboxReplyManifest: "data/club_inbox_replies/manifest.json",
  // History Go-unlocks: steder, stab, ekspertise, treningsprogrammer og badges.
  unlocks: "data/football_unlocks.json",
  // Mesterskap (EM/VM) for landslagsmodus: turneringsstruktur + nasjoner med
  // historisk stil-arketype. Ingen nasjoner eller mesterskap hardkodes i JS.
  tournaments: "data/football_tournaments.json",
  placeLocations: "data/football_place_locations.json",
  staff: "data/football_staff.json",
  expertise: "data/football_expertise.json",
  trainingPrograms: "data/football_training_programs.json",
  // Individuell trening: sporene en enkeltspiller kan settes på ved siden av
  // lagsøkta. Ingen av dem hever `overall` — se docs/trening.md.
  individualTraining: "data/football_individual_training.json",
  // Svake sider: attributtkatalog + posisjonskrav. Svakhetene identifiseres ut
  // av spillerdataene som allerede finnes — se docs/svake-sider.md.
  playerWeaknesses: "data/football_player_weaknesses.json",
  // Ferdighetsvokabularet: de 42 ferdighetene spillere måles på, aliasene som
  // binder eldre tokens til dem, og posisjonenes RANGERTE kravlister. Lå
  // tidligere inne i svakhetsfila, som da eide to ting samtidig.
  attributes: "data/football_attributes.json",
  // Ligaklubbenes spillestil, tegnet på klubbenes egen tradisjon. Klubben eier
  // identitet og nivå (football_clubs.json); dette eier fotballen.
  leagueClubProfiles: "data/football_league_club_profiles.json",
  // Seriepyramiden: Eliteserien / OBOS-ligaen / 2. divisjon med klubber, nivåer
  // og opp-/nedrykksregler. Kilden for HVEM du møter og HVOR du står.
  clubs: "data/football_clubs.json",
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

// Brikkefordelingen på banen er versjonert i selve dataene, ikke i nøkkelen.
// Layout 1 strakk HVER linje ut til sidelinja (spissparet i 4-4-2 havnet på
// 14 % og 86 %) og klemte tette formasjoner inn i det samme smale båndet.
// Lagrede layout 1-koordinater ville overstyrt den rettede fordelingen for alle
// som allerede har spilt — også via modus-konvoluttens sesjoner, som en ren
// nøkkelbump ikke ville nådd. Derfor stemples settet, og et umerket/utdatert
// sett forkastes én gang. Manuelt flyttede brikker nullstilles da; alt annet i
// lagringen er urørt.
const PITCH_LAYOUT_VERSION = 3;
const PITCH_LAYOUT_FIELD = "__layout";
const ACTIVE_KNOWLEDGE_FOCUS_KEY = "hgfm.activeKnowledgeFocus.v1";
const COMPLETED_KNOWLEDGE_FOCUS_KEY = "hgfm.completedKnowledgeFocus.v1";
const TRAINING_WEEK_KEY = "hgfm.trainingWeek.v1";
const WEEKLY_TRAINING_FOCUS_KEY = "hgfm.weeklyTrainingFocus.v1";
// Ukens valgte treningsprogram (komposisjon). Holdes adskilt fra treningsfokus
// og HG-badge-programmer. Kun UI/progresjon + engangs off-pitch-effekt per uke.
const WEEKLY_TRAINING_PROGRAM_KEY = "hgfm.weeklyTrainingProgram.v1";
// Ukas individuelle oppfølging: { week, assignments: [{playerId, trackId, roleId}] }.
const INDIVIDUAL_TRAINING_KEY = "hgfm.individualTraining.v1";
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
// Innboks-kuratering v2: hvilken uke spilleren sist kvitterte ut ukas signal.
// Ren UI-state — styrer bare hvor mange tråder som løftes til «Viktig nå» per
// uke, aldri motoren.
const INBOX_ACK_WEEK_KEY = "hgfm.inboxAcknowledgedWeek.v1";
// Kampdag (v1): siste spilte kamp. Kun UI/progresjon i localStorage – ingen serie,
// tabell, sesong eller livekamp. Selve kampberegningen ligger i kampmotoren.
const MATCHDAY_STATE_KEY = "hgfm.matchday.v1";
// Mini Season v0.1: 5-kampers prøveperiode (motstanderplan, resultater, styremål
// og sluttvurdering). Kun UI/progresjon i localStorage – ingen liga, tabell,
// økonomi eller ny kampmotor. Selve logikken ligger i football-mini-season.js.
const MINI_SEASON_KEY = MINI_SEASON_VERSION;
const LEAGUE_SEASON_KEY = LEAGUE_SEASON_VERSION;
const LEAGUE_PLAYOFF_KEY = LEAGUE_PLAYOFF_VERSION;
const FIRST_TIME_PLAYTHROUGH_KEY = "hgfm.firstTimePlaythrough.v1";
const GAME_START_STATE_KEY = "hgfm.gameStartState.v1";
// Onboarding v2: egen startskjerm. `onboarded` = spilleren har valgt spillmodus
// minst én gang, så startskjermen ikke legger seg over spillet ved hver last.
const ONBOARDED_KEY = "hgfm.onboarded.v1";
const AJAX_TOTAL_FOOTBALL_SCENARIO_ID = "ajax_1971_73_totalfootball";
const FIRST_TIME_OPPONENT_ID = "ajax_1971_73_total_football";

// Ekte History Go-progresjon i localStorage (skrives av History Go-appen, ikke
// av Football Manager). Brukes som kilde til faktisk besøkte sportsteder.
//   visited_places            – objekt/map med besøkte placeId-er ({ id: true }).
//   hg_groundhopper_stats_v1  – Groundhopper-/sportstatistikk, der
//                               visited_groundhopper_places er hovedlisten.
const HISTORY_GO_VISITED_PLACES_KEY = "visited_places";
const HISTORY_GO_GROUNDHOPPER_STATS_KEY = "hg_groundhopper_stats_v1";
// Quiz-status fra History Go. Kilden er verifisert mot History Go-repoet
// (Paradispartiet/History-Go):
//   js/quizzes.js:     HG_LEARNING_LOG_KEY = "hg_learning_log_v1"
//                      // «eneste sannhet: quiz + observasjoner»
//   js/learningLog.js: isQuizEvent() => type === "quiz_perfect"
//                      || "quiz_set_complete" || "quiz_legacy"
//   Radene bærer `parentTargetId` = stedets id (jf. quizzes.js og
//   tests/knowledge-v2-model.test.js: parentTargetId: "torggata").
// Vi LESER kun denne nøkkelen – Football Manager skriver aldri til den.
const HISTORY_GO_LEARNING_LOG_KEY = "hg_learning_log_v1";
const HISTORY_GO_QUIZ_EVENT_TYPES = new Set(["quiz_perfect", "quiz_set_complete", "quiz_legacy"]);

// Maks antall klubbhendelser som beholdes i loggen (nyeste først).
const CLUB_WEEK_EVENT_LOG_LIMIT = 12;

// Troppskrav (roster readiness): minst 15 opplåste spillere totalt, der 11 står
// i startelleveren og minst 4 er benkespillere, før manager-/kampdelen regnes
// som spillklar.
const REQUIRED_SQUAD_SIZE = 15;
const REQUIRED_STARTERS = 11;
const REQUIRED_BENCH = 4;
const REQUIRED_STAFF_SIZE = 6;

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
  // Katalogen over individuelle treningsspor (fra datafil, normalisert).
  individualTrainingCatalogue: { capacity: { base: 1, perStaffMember: 1, max: 5 }, tracks: [] },
  // Ukas individuelle oppfølging: { week, assignments: [] }.
  individualTraining: { week: null, assignments: [] },
  // Katalogen over svake sider (fra datafil, normalisert).
  weaknessCatalogue: { attributes: [], positionDemands: {}, difficulty: {}, biteReliefCap: 4 },
  // Spillestilprofiler for ligaklubbene, keyet på klubb-id.
  leagueClubProfiles: {},
  // Seriepyramiden: { tiers, clubs }. Tom pyramide betyr at motoren faller
  // tilbake på standardnivået — spillet står ikke, men karrierestigen mangler.
  leaguePyramid: { tiers: [], clubs: [] },
  // Aktiv kvalifisering (opp-/nedrykkskamper). Null når sesongen ikke endte på
  // en kvalifiseringsplass.
  leaguePlayoff: null,
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
  // Uken spilleren sist kvitterte ut ukas innbokssignal (0 = ingen ennå).
  inboxAcknowledgedWeek: 0,
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
  // Egen 14-runders ligatilstand. Scenarioets miniSeason deles aldri med ligaen.
  leagueSeason: null,
  modeEnvelope: null,
  modeChooserOpen: false,
  // Landslagsmodus: valgt nasjon + uttatt landslagstropp (isolert per modus).
  nationalTeam: { nationality: null, squadPlayerIds: [] },
  // Aktivt mesterskap (EM/VM) i landslagsmodus, eller null før du melder på.
  tournament: null,
  // Ferdigspilte mesterskap: nasjon, mesterskap og plassering. Landslagets
  // merittliste, adskilt fra klubbens.
  tournamentHistory: [],
  // Onboarding v2: har spilleren valgt modus på egen startskjerm minst én gang?
  onboarded: false,
  firstTimePlaythrough: { started: false, completed: false, currentStep: "start" },
  gameStartState: { selectedMode: null, activeLeagueSaveId: undefined, activeScenarioId: undefined },
  openTrainingStepId: "trainingProgramStep"
};

const elements = {
  formationSelect: document.querySelector("#formationSelect"),
  tacticSelect: document.querySelector("#tacticSelect"),
  teamStatus: document.querySelector("#teamStatus"),
  roleFitAverage: document.querySelector("#roleFitAverage"),
  tacticFitAverage: document.querySelector("#tacticFitAverage"),
  balanceScore: document.querySelector("#balanceScore"),
  restDefenseScore: document.querySelector("#restDefenseScore"),
  formationTitle: document.querySelector("#formationTitle"),
  completeCount: document.querySelector("#completeCount"),
  lineupSlots: document.querySelector("#lineupSlots"),
  lineupPlayerChoices: document.querySelector("#lineupPlayerChoices"),
  lineupRoleChoices: document.querySelector("#lineupRoleChoices"),
  // Kompakt taktisk systempanel for valgt historisk formasjon (nær banen).
  tacticalSystemPanel: document.querySelector("#tacticalSystemPanel"),
  // Additivt historisk rollefit-hint i sidepanelet.
  historicalRoleHint: document.querySelector("#historicalRoleHint"),
  roleLearningCard: document.querySelector("#roleLearningCard"),
  selectedSlotTitle: document.querySelector("#selectedSlotTitle"),
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
  // League Loop v0.2: ligasesong-panelet (samme motor, liga-presentasjon).
  leagueSeasonPanel: document.querySelector("#leagueSeasonPanel"),
  leagueSeasonStatus: document.querySelector("#leagueSeasonStatus"),
  seasonCommand: document.querySelector("#seasonCommand"),
  leagueSeasonOverview: document.querySelector("#leagueSeasonOverview"),
  startNewLeagueSeasonButton: document.querySelector("#startNewLeagueSeasonButton"),
  // Legacy id: firstTimePlaythroughCard is now used as the game mode card.
  // Do not treat it as mandatory onboarding.
  onboardingScreen: document.querySelector("#onboardingScreen"),
  firstTimePlaythroughCard: document.querySelector("#firstTimePlaythroughCard"),
  officeCommand: document.querySelector("#officeCommand"),
  officeCommandPanel: document.querySelector("#officeCommandPanel"),
  firstTimeReadiness: document.querySelector("#firstTimeReadiness"),
  firstTimeOpponent: document.querySelector("#firstTimeOpponent"),
  firstTimeAssistant: document.querySelector("#firstTimeAssistant"),
  modeChoiceCards: Array.from(document.querySelectorAll("[data-start-mode]")),
  scenarioList: document.querySelector("#scenarioList"),
  trainingChoiceGate: document.querySelector("#trainingChoiceGate"),
  trainingChoiceStatus: document.querySelector("#trainingChoiceStatus"),
  trainingChoiceSignal: document.querySelector("#trainingChoiceSignal"),
  trainingChoiceRecommended: document.querySelector("#trainingChoiceRecommended"),
  trainingChoiceRisk: document.querySelector("#trainingChoiceRisk"),
  trainingGoMatch: document.querySelector("#trainingGoMatch"),
  // Ukens plan (football-training-plan.js): fire steg i fast rekkefølge.
  trainingCommand: document.querySelector("#trainingCommand"),
  trainingDepth: document.querySelector("#trainingDepth"),
  trainingPlanHeadline: document.querySelector("#trainingPlanHeadline"),
  trainingPlanCoherence: document.querySelector("#trainingPlanCoherence"),
  trainingPlanLoad: document.querySelector("#trainingPlanLoad"),
  trainingPlanSteps: document.querySelector("#trainingPlanSteps"),
  trainingPlanNext: document.querySelector("#trainingPlanNext"),
  trainingProgramLoadValue: document.querySelector("#trainingProgramLoadValue"),
  // Individuell trening (football-individual-training.js).
  individualTrainingCapacity: document.querySelector("#individualTrainingCapacity"),
  individualTrainingAssignments: document.querySelector("#individualTrainingAssignments"),
  individualTrainingPicker: document.querySelector("#individualTrainingPicker"),
  // Svake sider (football-player-weaknesses.js).
  weaknessWorkSummary: document.querySelector("#weaknessWorkSummary"),
  weaknessList: document.querySelector("#weaknessList"),
  // Appens underfanestripe (én for alle hovedfaner som har underinndeling).
  appSubnav: document.querySelector("#appSubnav"),
  progressionBadgeCount: document.querySelector("#progressionBadgeCount"),
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
  // Neste handling-stripe (Playable Manager Flow Polish v1): prioritert
  // primærhandling + sekundære steg utledet av eksisterende state.
  nextActionStrip: document.querySelector("#nextActionStrip"),
  nextActionPhase: document.querySelector("#nextActionPhase"),
  nextActionPrimary: document.querySelector("#nextActionPrimary"),
  nextActionPrimaryTag: document.querySelector("#nextActionPrimaryTag"),
  nextActionPrimaryTitle: document.querySelector("#nextActionPrimaryTitle"),
  nextActionPrimaryHint: document.querySelector("#nextActionPrimaryHint"),
  nextActionSecondary: document.querySelector("#nextActionSecondary"),
  suggestedSetupsTactics: document.querySelector("#suggestedSetupsTactics"),
  contextSignals: document.querySelector("#contextSignals"),
  contextHeadline: document.querySelector("#contextHeadline"),
  trainingPrograms: document.querySelector("#trainingPrograms"),
  weeklyTrainingProgramStatus: document.querySelector("#weeklyTrainingProgramStatus"),
  managerTrainingPlan: document.querySelector("#managerTrainingPlan"),
  managerRoleChanges: document.querySelector("#managerRoleChanges"),
  managerWeakPoints: document.querySelector("#managerWeakPoints"),
  // Analyse-fanen viser de samme to listene som den dype rapporten, fra samme
  // motorkall — ikke en egen beregning som kunne begynt å motsi den.
  analyseMatchReport: document.querySelector("#analyseMatchReport"),
  statsSummary: document.querySelector("#statsSummary"),
  statsMatches: document.querySelector("#statsMatches"),
  statsGoals: document.querySelector("#statsGoals"),
  statsAssists: document.querySelector("#statsAssists"),
  statsTopScorer: document.querySelector("#statsTopScorer"),
  statsStanding: document.querySelector("#statsStanding"),
  statsBoardGoal: document.querySelector("#statsBoardGoal"),
  headerClubName: document.querySelector("#headerClubName"),
  headerClubManager: document.querySelector("#headerClubManager"),
  playerStatsTable: document.querySelector("#playerStatsTable"),
  leagueOnboardingPanel: document.querySelector("#leagueOnboardingPanel"),
  leagueOnboardingLead: document.querySelector("#leagueOnboardingLead"),
  leagueOnboardingSteps: document.querySelector("#leagueOnboardingSteps"),
  seasonReviewPanel: document.querySelector("#seasonReviewPanel"),
  seasonReviewVerdict: document.querySelector("#seasonReviewVerdict"),
  seasonReviewHeadline: document.querySelector("#seasonReviewHeadline"),
  seasonReviewBoard: document.querySelector("#seasonReviewBoard"),
  seasonReviewReasons: document.querySelector("#seasonReviewReasons"),
  seasonReviewHighlights: document.querySelector("#seasonReviewHighlights"),
  seasonArchiveSummary: document.querySelector("#seasonArchiveSummary"),
  seasonArchiveTable: document.querySelector("#seasonArchiveTable"),
  squadConditionSummary: document.querySelector("#squadConditionSummary"),
  squadConditionList: document.querySelector("#squadConditionList"),
  analyseRoleChanges: document.querySelector("#analyseRoleChanges"),
  analyseWeakPoints: document.querySelector("#analyseWeakPoints"),
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
  clubWeekGateHint: document.querySelector("#clubWeekGateHint"),
  clubBoardTrust: document.querySelector("#clubBoardTrust"),
  clubPlayerMorale: document.querySelector("#clubPlayerMorale"),
  clubTacticalClarity: document.querySelector("#clubTacticalClarity"),
  clubTrainingCulture: document.querySelector("#clubTrainingCulture"),
  clubMediaPressure: document.querySelector("#clubMediaPressure"),
  clubWeekEventLog: document.querySelector("#clubWeekEventLog"),
  inboxThreadList: document.querySelector("#inboxThreadList"),
  inboxThreadArchive: document.querySelector("#inboxThreadArchive"),
  inboxFocusTitle: document.querySelector("#inboxFocusTitle"),
  inboxFocusStatus: document.querySelector("#inboxFocusStatus"),
  inboxQueuePanel: document.querySelector("#inboxQueuePanel"),
  inboxQueueCount: document.querySelector("#inboxQueueCount"),
  inboxQueueList: document.querySelector("#inboxQueueList"),
  inboxSignalUnread: document.querySelector("#inboxSignalUnread"),
  inboxSignalReplies: document.querySelector("#inboxSignalReplies"),
  inboxSignalStatus: document.querySelector("#inboxSignalStatus"),
  inboxGoTraining: document.querySelector("#inboxGoTraining"),
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
  startModePanel: document.querySelector("#startModePanel"),
  startModeChoices: document.querySelector("#startModeChoices"),
  startModeRosterNeed: document.querySelector("#startModeRosterNeed"),
  playableSquadReady: document.querySelector("#playableSquadReady"),
  activeLocalStart: document.querySelector("#activeLocalStart"),
  localStartStatus: document.querySelector("#localStartStatus"),
  useHistoryGoCollection: document.querySelector("#useHistoryGoCollection"),
  clearLocalStart: document.querySelector("#clearLocalStart"),
  // Kampdagscene og foldet teknisk dybde.
  matchdayCommand: document.querySelector("#matchdayCommand"),
  matchdayDepth: document.querySelector("#matchdayDepth"),
  // Kampklar-status i kampdagpanelet (gating-forklaring, ingen ny kampmotor).
  matchdayReadiness: document.querySelector("#matchdayReadiness"),
  // Lag & taktikk-gate: kompakt 11 + 4-sjekkliste og neste manageroppgave.
  squadSetupGate: document.querySelector("#squadSetupGate"),
  squadSetupGateTitle: document.querySelector("#squadSetupGateTitle"),
  squadSetupGateHint: document.querySelector("#squadSetupGateHint"),
  squadSetupGateAction: document.querySelector("#squadSetupGateAction"),
  squadGateStarters: document.querySelector("#squadGateStarters"),
  squadGateBench: document.querySelector("#squadGateBench"),
  squadGateRoles: document.querySelector("#squadGateRoles"),
  squadGateMisuse: document.querySelector("#squadGateMisuse"),
  squadGateDuplicates: document.querySelector("#squadGateDuplicates"),
  // Tropp og benk (roster readiness): topbar-teller + statisk panel i Kontoret.
  // Rendres av app.js fra availability-snapshotet – ingen separat modul.
  rosterReadyCount: document.querySelector("#rosterReadyCount"),
  rosterReadinessBadge: document.querySelector("#rosterReadinessBadge"),
  rosterUnlockedCount: document.querySelector("#rosterUnlockedCount"),
  rosterReadyStatus: document.querySelector("#rosterReadyStatus"),
  rosterReadinessNote: document.querySelector("#rosterReadinessNote"),
  benchPlayersList: document.querySelector("#benchPlayersList"),
  // Fase 2: dynamisk sidepanel (spillerprofil vs. neste beslutninger).
  sidePanelKicker: document.querySelector("#sidePanelKicker"),
  sideProfile: document.querySelector("#sideProfile"),
  profileName: document.querySelector("#profileName"),
  profilePositions: document.querySelector("#profilePositions"),
  profileSource: document.querySelector("#profileSource"),
  profileSignature: document.querySelector("#profileSignature"),
  profileAttributes: document.querySelector("#profileAttributes"),
  profileAttributeList: document.querySelector("#profileAttributeList"),
  profileAttributeNote: document.querySelector("#profileAttributeNote"),
  profileStrengths: document.querySelector("#profileStrengths"),
  profileNeeds: document.querySelector("#profileNeeds"),
  sideDecisions: document.querySelector("#sideDecisions"),
  // Fase 2: statuskort med neste beslutninger på hovedskjermen.
  decisionCards: document.querySelector("#decisionCards"),
  // Fase 2: avdelinger med levende status.
  inboxPulseCount: document.querySelector("#inboxPulseCount"),
  adminSquadCount: document.querySelector("#adminSquadCount"),
  adminStaffCount: document.querySelector("#adminStaffCount"),
  marketMediaValue: document.querySelector("#marketMediaValue"),
  marketReputationNote: document.querySelector("#marketReputationNote"),
  clubCommand: document.querySelector("#clubCommand"),
  clubDepth: document.querySelector("#clubDepth"),
  boardTrustValue: document.querySelector("#boardTrustValue"),
  boardTrustFill: document.querySelector("#boardTrustFill"),
  boardTrustNote: document.querySelector("#boardTrustNote"),
  boardExpectationNote: document.querySelector("#boardExpectationNote"),
  boardClubMetrics: document.querySelector("#boardClubMetrics"),
  boardWeekNote: document.querySelector("#boardWeekNote"),
  marketSignals: document.querySelector("#marketSignals"),
  marketFanMood: document.querySelector("#marketFanMood"),
  marketSponsorNote: document.querySelector("#marketSponsorNote"),
  adminDriftMetrics: document.querySelector("#adminDriftMetrics"),
  adminStaffNote: document.querySelector("#adminStaffNote")
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

    if (typeof player.classHeight !== "number" || player.classHeight < 85 || player.classHeight > 100) {
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

function normalizeNearbyFavorites(value) {
  const base = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const placeIds = Array.isArray(base.placeIds)
    ? [...new Set(base.placeIds.filter((placeId) => typeof placeId === "string").map((placeId) => placeId.trim()))]
        .filter(Boolean)
    : [];

  return {
    placeIds,
    updatedAt: typeof base.updatedAt === "string" ? base.updatedAt : null
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
    clubId: typeof base.clubId === "string" && base.clubId.trim() ? base.clubId.trim() : null,
    poolVersion: typeof base.poolVersion === "string" && base.poolVersion.trim() ? base.poolVersion.trim() : null,
    generatedFrom: base.generatedFrom === "club_pool" ? "club_pool" : null,
    repairedAt: typeof base.repairedAt === "string" && base.repairedAt.trim() ? base.repairedAt : null,
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
    nearbyFavorites: normalizeNearbyFavorites(base.nearbyFavorites),
    ...normalizeRecruitmentState(base),
    ...normalizePlayerPoolSquadState(base),
    hiredStaffIds: Array.isArray(base.hiredStaffIds) ? base.hiredStaffIds : [],
    // Reelle fasilitetsoppgraderinger v1: varig klubbstate i eksisterende teamMerits.
    facilities: normalizeFacilityState(base.facilities),
    // Formasjonstilvenning per formationId (0-100). Vokser sakte med treningsuker
    // via advanceHgTrainingWeek. Robust mot gamle localStorage-data: ugyldige
    // verdier filtreres bort og manglende felt blir et tomt oppslag.
    formationFamiliarity: normalizeFormationFamiliarity(base.formationFamiliarity),
    // Role Familiarity Engine v1: fortrolighet per spiller×rolle (0-100), bygget
    // ved RIKTIG bruk over kamper. Bor i manager-staten (teamMerits), aldri i
    // History Go-progresjonen. Robust mot gamle/korrupte data.
    roleFamiliarity: normalizeRoleFamiliarity(base.roleFamiliarity),
    // Framgang på svake sider, spiller×attributt → 0–100. Persisteres sammen med
    // rollefortroligheten, aldri i History Go-progresjonen.
    weaknessProgress: normalizeWeaknessProgress(base.weaknessProgress),
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
  if (state.modeEnvelope && !isLeagueModeActive()) return;
  if (!state.teamMerits) {
    return;
  }
  try {
    localStorage.setItem(TEAM_MERITS_KEY, JSON.stringify(state.teamMerits));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }

  // Mode Isolation eier også et snapshot av league-staten. Hold samme
  // canonical teamMerits synkronisert der med én gang; ellers kan et
  // eldre snapshot vinne over hgfm.teamMerits.v1 ved neste reload.
  if (state.modeEnvelope && isLeagueModeActive()) {
    state.modeEnvelope.sessions.league = {
      ...state.modeEnvelope.sessions.league,
      teamMerits: cloneTeamMerits(state.teamMerits)
    };
    try {
      state.modeEnvelope = persistModeEnvelope(localStorage, state.modeEnvelope);
    } catch (_) {
      // Privat modus: legacy teamMerits-lagringen over er fortsatt best effort.
    }
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
    state.teamMerits.nearbyFavorites = normalizeNearbyFavorites(null);
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
// Steder der spilleren faktisk har tatt quizen i History Go.
// Returnerer `null` når læringsloggen ikke finnes/ikke er lesbar – da vet vi
// ingenting om quiz, og quiz-porten skal IKKE håndheves (ellers ville spillere
// blitt låst ute av spillere de umulig kunne låst opp).
function getHistoryGoQuizCompletedPlaceIds() {
  const raw = readJsonLocalStorage(HISTORY_GO_LEARNING_LOG_KEY, null);
  if (raw === null || raw === undefined) {
    return null;
  }
  if (!Array.isArray(raw)) {
    console.warn("History Go-sync: hg_learning_log_v1 har ugyldig format (forventet array).");
    return null;
  }

  const ids = new Set();
  raw.forEach((event) => {
    if (!event || typeof event !== "object") return;
    if (!HISTORY_GO_QUIZ_EVENT_TYPES.has(event.type)) return;
    // parentTargetId er stedets id; targetId er en sammensatt set-id som
    // starter med stedet. Godta begge, slik at små formatvarianter tåles.
    const parent = typeof event.parentTargetId === "string" ? event.parentTargetId.trim() : "";
    if (parent) ids.add(parent);
    const target = typeof event.targetId === "string" ? event.targetId.trim() : "";
    if (target) ids.add(target.split("::")[0].split("__")[0]);
  });
  return ids;
}

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
  if (!localStart.enabled) return [];

  // Eldre saves kan ha en global auto-tropp lagret før klubbpoolen ble canonical.
  // Reparer den idempotent mot den valgte klubbens faktiske pool før
  // availability får lov til å gjøre spillerne tilgjengelige.
  const takeoverClub = getTakeoverClub();
  if (takeoverClub && localStart.source === "auto_squad") {
    const access = getClubSquadAccess(takeoverClub);
    const repair = reconcileClubBaseSquadSave({ localStart, access });
    if (repair.changed) {
      state.teamMerits.localStart = normalizeLocalStart(repair.localStart);
      state.localStartMessage = repair.message || "";
      saveTeamMerits();
      return state.teamMerits.localStart.enabled ? state.teamMerits.localStart.playerIds : [];
    }
  }

  return localStart.playerIds;
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


function getNearbyFavoritePlaceIds() {
  return normalizeNearbyFavorites(state.teamMerits?.nearbyFavorites).placeIds;
}

function isNearbyFavorite(placeId) {
  return typeof placeId === "string" && getNearbyFavoritePlaceIds().includes(placeId);
}

function setNearbyFavoritePlaceIds(placeIds) {
  if (!state.teamMerits) {
    return;
  }
  state.teamMerits.nearbyFavorites = normalizeNearbyFavorites({
    placeIds,
    updatedAt: new Date().toISOString()
  });
  saveTeamMerits();
}

function toggleNearbyFavorite(placeId) {
  if (!state.teamMerits || typeof placeId !== "string" || !placeId.trim()) {
    return;
  }
  const normalizedPlaceId = placeId.trim();
  const current = getNearbyFavoritePlaceIds();
  setNearbyFavoritePlaceIds(
    current.includes(normalizedPlaceId)
      ? current.filter((favoriteId) => favoriteId !== normalizedPlaceId)
      : [...current, normalizedPlaceId]
  );
  renderApp();
}

function removeNearbyFavorite(placeId) {
  if (!state.teamMerits || typeof placeId !== "string" || !placeId.trim()) {
    return;
  }
  setNearbyFavoritePlaceIds(getNearbyFavoritePlaceIds().filter((favoriteId) => favoriteId !== placeId.trim()));
  renderApp();
}





// Auto-tropp UTEN sted/koordinater. Erstatter den gamle geografiske «nærmeste
// spillere»-modellen: stedsanker og geolokasjon er faset ut. Bygger en
// balansert 15-spillertropp rett fra spillerkatalogen (data/football_players.json),
// med spillere som faktisk kan låses opp via player_candidate-unlocks først.
// Ingen spillerdata hardkodes her, og ekte History Go-progresjon røres aldri.
const STARTER_SQUAD_GROUPS = [
  { positions: ["GK"], count: 2 },
  { positions: ["CB", "LB", "RB", "WB"], count: 5 },
  { positions: ["DM", "CM", "AM"], count: 5 },
  { positions: ["ST", "LW", "RW"], count: 3 }
];

function getStarterSquadPlayerIds(limit = REQUIRED_SQUAD_SIZE) {
  const players = Array.isArray(state.players) ? state.players : [];
  if (!players.length) return [];

  // Kun KLUBBspillere: auto-troppen skal aldri dele ut landslagsstjernene
  // (Ullevaal/Maracanã). De er belønningen for å samle i History Go.
  const candidateIds = new Set();
  (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : []).forEach((place) => {
    if (isNationalArenaPlace(place)) return;
    (Array.isArray(place?.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (unlock && isPlayerUnlockType(unlock.type) && typeof unlock.targetId === "string") {
        candidateIds.add(unlock.targetId);
      }
    });
  });

  // Jevne klubbspillere først (lavest overall), så toppsjiktet er noe du samler
  // deg til – ikke noe auto-fyll deler ut gratis. Alle er gode nok (85+).
  const ordered = [...players].filter((player) => candidateIds.has(player.id)).sort((a, b) => {
    const diff = (Number(a.classHeight) || 0) - (Number(b.classHeight) || 0);
    if (diff !== 0) return diff;
    return String(a.id).localeCompare(String(b.id));
  });

  const playsIn = (player, positions) => {
    const natural = Array.isArray(player?.naturalPositions) ? player.naturalPositions : [];
    const usable = Array.isArray(player?.usablePositions) ? player.usablePositions : [];
    return [...natural, ...usable].some((position) => positions.includes(position));
  };

  const picked = [];
  const takenIds = new Set();
  // 1) Dekk posisjonsgruppene, slik at troppen faktisk kan settes opp på banen.
  STARTER_SQUAD_GROUPS.forEach((group) => {
    let need = group.count;
    ordered.forEach((player) => {
      if (need <= 0 || takenIds.has(player.id) || picked.length >= limit) return;
      if (!playsIn(player, group.positions)) return;
      picked.push(player.id);
      takenIds.add(player.id);
      need -= 1;
    });
  });
  // 2) Fyll opp til 15 med de gjenværende beste kandidatene.
  ordered.forEach((player) => {
    if (picked.length >= limit || takenIds.has(player.id)) return;
    picked.push(player.id);
    takenIds.add(player.id);
  });

  return picked.slice(0, limit);
}

// Er auto-starttroppen aktiv (starttropp uten History Go)?
function isStarterSquadActive() {
  const localStart = normalizeLocalStart(state.teamMerits?.localStart);
  return localStart.enabled && localStart.playerIds.length > 0;
}

// Stabskandidater som følger auto-troppen: deterministisk utvalg fra
// stabskatalogen, slik at «Velg stab» er mulig uten History Go-samling.
// Manageren må fortsatt engasjere dem selv. Ingen stabsdata hardkodes her.
function getStarterSquadStaffCandidates(staff) {
  if (!isStarterSquadActive()) return [];
  return selectStarterStaffCandidates(staff);
}

// Draft-pool: grunnsjiktet av klubbspillere (under NAME_TIER_MIN). De store
// navnene og landslagsspillerne er bevisst utenfor – de samles i History Go.
const NAME_TIER_MIN = 90;

function getDraftPoolPlayers() {
  const players = Array.isArray(state.players) ? state.players : [];
  const clubIds = new Set();
  (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : []).forEach((place) => {
    if (isNationalArenaPlace(place)) return;
    (Array.isArray(place?.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (unlock && isPlayerUnlockType(unlock.type) && typeof unlock.targetId === "string") {
        clubIds.add(unlock.targetId);
      }
    });
  });
  return players
    .filter((player) => clubIds.has(player.id) && Number(player.classHeight) < NAME_TIER_MIN)
    .sort((a, b) => {
      const order = { GK: 0, CB: 1, LB: 2, RB: 3, WB: 4, DM: 5, CM: 6, AM: 7, LW: 8, RW: 9, ST: 10 };
      const ap = order[(a.naturalPositions || [])[0]] ?? 99;
      const bp = order[(b.naturalPositions || [])[0]] ?? 99;
      if (ap !== bp) return ap - bp;
      return String(a.name).localeCompare(String(b.name), "no");
    });
}

// Landslagsmodus skal kunne spilles uten History Go-progresjon, på samme måte
// som klubblaget har en spillbar starttropp. Grunnpoolen er nasjonens jevne
// klubbspillere (under NAME_TIER_MIN) – landslagsstjernene fra Ullevaal og
// Maracanã er fortsatt noe du må samle. Uttaket blir dermed en reell jobb:
// grunnstammen er der, forskjellen gjør du ved å samle.
function getNationalBasePlayers() {
  const players = Array.isArray(state.players) ? state.players : [];
  const clubIds = new Set();
  (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : []).forEach((place) => {
    if (isNationalArenaPlace(place)) return;
    (Array.isArray(place?.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (unlock && isPlayerUnlockType(unlock.type) && typeof unlock.targetId === "string") {
        clubIds.add(unlock.targetId);
      }
    });
  });
  return players.filter(
    (player) => player && clubIds.has(player.id) && Number(player.classHeight) < NAME_TIER_MIN
  );
}

function getNationalBasePlayerIds(nationality) {
  const nation = typeof nationality === "string" ? nationality.trim() : "";
  if (!nation) return [];
  return getNationalBasePlayers()
    .filter((player) => String(player.nationality || "").trim() === nation)
    .map((player) => player.id);
}

// Aktiver auto-troppen. Samme lagringsmodell som før (teamMerits.localStart med
// unlockSource local_start), men uten koordinater eller valgt sted.
function activateStarterSquad(chosenPlayerIds = null, metadata = null) {
  if (!state.teamMerits) {
    state.localStartMessage = "Kunne ikke fylle troppen fordi lagprogresjonen ikke er tilgjengelig.";
    renderApp();
    return;
  }

  // Draften sender spillerens eget utvalg; ellers bygges en balansert tropp.
  const playerIds = Array.isArray(chosenPlayerIds) && chosenPlayerIds.length
    ? chosenPlayerIds.slice(0, REQUIRED_SQUAD_SIZE)
    : getStarterSquadPlayerIds(REQUIRED_SQUAD_SIZE);
  if (!playerIds.length) {
    state.localStartMessage = "Fant ingen spillere å fylle troppen med.";
    renderApp();
    return;
  }

  state.teamMerits.localStart = normalizeLocalStart({
    enabled: true,
    source: "auto_squad",
    latitude: null,
    longitude: null,
    chosenPlaceId: null,
    chosenPlaceName: null,
    clubId: typeof metadata?.clubId === "string" ? metadata.clubId : null,
    poolVersion: typeof metadata?.poolVersion === "string" ? metadata.poolVersion : null,
    generatedFrom: metadata?.generatedFrom === "club_pool" ? "club_pool" : null,
    repairedAt: null,
    playerIds,
    createdAt: new Date().toISOString()
  });
  state.teamMerits.playerPoolSquadVersion = 1;
  state.teamMerits.squadPlayerIds = [...playerIds];
  state.localStartMessage = "";
  saveTeamMerits();
  invalidateAvailability();
  sanitizeLineupForUnlockedPlayers();
  fillEmptyLineupSlots(true);
  renderApp();
}

function clearLocalStartSquad() {
  if (!state.teamMerits) {
    return;
  }
  state.teamMerits.localStart = normalizeLocalStart(null);
  state.teamMerits.playerPoolSquadVersion = 0;
  state.teamMerits.squadPlayerIds = [];
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
  const candidatePlayerIds = new Set();
  const unlockedPlayerIds = new Set();
  const playerPoolIds = new Set();
  const legacyPlayablePlayerIds = new Set();
  const playerSourceById = new Map();
  const explicitStaffIds = new Set();
  // Klubbspillere vs landslagsspillere: en landslagsarena (Ullevaal, Maracanã)
  // gir deg IKKE spillere til klubblaget – ellers kunne ett besøk på Ullevaal
  // sikre hele Norges beste. Spilleren blir speidet/synlig, men kan bare
  // signeres hvis du også har besøkt et KLUBBanlegg som har ham/henne.
  const nationalOnlyPlayerIds = new Set();
  // Quiz-porten: for steder som kommer fra EKTE History Go-progresjon holder det
  // ikke å ha vært der – du må ha tatt quizen for å kunne signere spillerne.
  // `null` = ingen læringslogg tilgjengelig => porten håndheves ikke.
  const quizCompletedPlaceIds = getHistoryGoQuizCompletedPlaceIds();
  const quizGateActive = quizCompletedPlaceIds !== null;
  const quizPendingPlayerIds = new Set();
  placeUnlocks.forEach((place) => {
    const nationalArena = isNationalArenaPlace(place);
    // Kun ekte History Go-steder kvalifiserer for quiz-porten. Manager-/demo-
    // steder (og auto-troppen) er upåvirket, så spillet står aldri fast.
    const needsQuiz =
      quizGateActive && historyGoPlaceIds.has(place.placeId) && !quizCompletedPlaceIds.has(place.placeId);
    (Array.isArray(place.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (!unlock || !unlock.targetId) {
        return;
      }
      if (isPlayerUnlockType(unlock.type)) {
        if (nationalArena) {
          nationalOnlyPlayerIds.add(unlock.targetId);
          return;
        }
        if (needsQuiz) {
          quizPendingPlayerIds.add(unlock.targetId);
          return;
        }
        candidatePlayerIds.add(unlock.targetId);
        const sources = playerSourceById.get(unlock.targetId) || { placeIds: new Set(), localStart: false };
        sources.placeIds.add(place.placeId);
        playerSourceById.set(unlock.targetId, sources);
      } else if (isStaffUnlockType(unlock.type)) {
        explicitStaffIds.add(unlock.targetId);
      }
    });
  });
  // Speidet på landslagsarena, men signerbar via klubbanlegg: da er den
  // allerede i unlockedPlayerIds og skal ikke telles som «kun landslag».
  // Samme for quiz: er spilleren signerbar fra et annet sted, er den ikke ventende.
  candidatePlayerIds.forEach((playerId) => {
    nationalOnlyPlayerIds.delete(playerId);
    quizPendingPlayerIds.delete(playerId);
    playerPoolIds.add(playerId);
  });

  // Legacy recruitment-state is read only to reproduce the previously
  // playable squad during the one-time player-pool migration below.
  const recruitmentState = normalizeRecruitmentState(state.teamMerits);
  recruitmentState.recruitedPlayerIds.forEach((playerId) => {
    if (candidatePlayerIds.has(playerId)) {
      legacyPlayablePlayerIds.add(playerId);
    }
  });

  // Et stadionbesøk åpner HELE den eksplisitte klubbpoolen. Dette kan ikke
  // overlates til place-unlocks alene: clubAffiliations og sourcePlaceIds er
  // bevisst to forskjellige relasjoner, og framtidige klubbspillere kan derfor
  // tilhøre poolen uten å ha stadionet som eget oppdagelsessted.
  const takeoverClubForPool = getTakeoverClub();
  if (takeoverClubForPool && !isNationalModeActive()) {
    const clubAccess = getClubSquadAccess(takeoverClubForPool);
    if (clubAccess?.mode === "heritage") {
      const groundPlaceId = takeoverClubForPool.homePlaceId || null;
      (clubAccess.clubPoolIds || []).forEach((playerId) => {
        playerPoolIds.add(playerId);
        legacyPlayablePlayerIds.add(playerId);
        const sources = playerSourceById.get(playerId) || { placeIds: new Set(), localStart: false };
        if (groundPlaceId) sources.placeIds.add(groundPlaceId);
        playerSourceById.set(playerId, sources);
      });
    }
  }

  // Starttroppen er et spillbarhetsgulv. For en overtatt klubb kommer gulvet
  // ALLTID fra klubbens egen pool; den globale startertroppen er bare fallback
  // for egenopprettet klubb. Dermed kan en tom/eldre klubb-save aldri snike inn
  // tilfeldige spillere fra andre klubber.
  const localStartPlayerIds = getLocalStartPlayerIds();
  if (!localStartPlayerIds.length && !isNationalModeActive()) {
    const takeoverClub = getTakeoverClub();
    const fallbackPlayerIds = takeoverClub
      ? (getClubSquadAccess(takeoverClub)?.baseSquad || [])
      : getStarterSquadPlayerIds(REQUIRED_SQUAD_SIZE);
    fallbackPlayerIds.forEach((playerId) => {
      playerPoolIds.add(playerId);
      legacyPlayablePlayerIds.add(playerId);
      const sources = playerSourceById.get(playerId) || { placeIds: new Set(), localStart: false };
      sources.localStart = true;
      playerSourceById.set(playerId, sources);
    });
  }

  // Lokal start utvider bare spillerpoolen. Den åpner ingen steder og skriver
  // aldri til History Go-progresjonen (visited_places/groundhopper-state).
  localStartPlayerIds.forEach((playerId) => {
    playerPoolIds.add(playerId);
    legacyPlayablePlayerIds.add(playerId);
    const sources = playerSourceById.get(playerId) || { placeIds: new Set(), localStart: false };
    sources.localStart = true;
    playerSourceById.set(playerId, sources);
  });

  const players = Array.isArray(state.players) ? state.players : [];
  const playersById = new Map(players.filter((player) => player && player.id).map((player) => [player.id, player]));

  // Landslagsmodus: her ER landslagsspillerne poenget. De speidede spillerne
  // fra landslagsarena blir tilgjengelige, men HELE troppen filtreres på den
  // valgte nasjonen – du kan ikke ta ut en brasilianer på Norges landslag.
  // Klubblagets tropp røres ikke; modusene har hver sin sesjon.
  if (isNationalModeActive()) {
    nationalOnlyPlayerIds.forEach((playerId) => playerPoolIds.add(playerId));
    nationalOnlyPlayerIds.clear();
    const nationality = getNationalTeamNationality();
    if (nationality) {
      // Grunnstammen er alltid tilgjengelig, ellers ville en ny manager stått
      // med et tomt landslag og ingen vei videre.
      getNationalBasePlayerIds(nationality).forEach((playerId) => playerPoolIds.add(playerId));
      [...playerPoolIds].forEach((playerId) => {
        if (playersById.get(playerId)?.nationality !== nationality) playerPoolIds.delete(playerId);
      });
    }
    playerPoolIds.forEach((playerId) => unlockedPlayerIds.add(playerId));
  } else {
    // Player pool -> squad v1: old saves keep exactly the players the previous
    // runtime exposed. New pool discoveries remain alternatives until the
    // manager explicitly selects them for the squad.
    if (state.teamMerits) {
      const migration = migrateLegacyPlayerPoolSquadState(state.teamMerits, [...legacyPlayablePlayerIds]);
      if (migration.migrated) {
        state.teamMerits.playerPoolSquadVersion = migration.merits.playerPoolSquadVersion;
        state.teamMerits.squadPlayerIds = migration.merits.squadPlayerIds;
        saveTeamMerits();
      }
    }
    const squadState = normalizePlayerPoolSquadState(state.teamMerits);
    buildSelectedSquadPlayerIds({
      squadPlayerIds: squadState.squadPlayerIds,
      eligiblePoolPlayerIds: [...playerPoolIds]
    }).forEach((playerId) => unlockedPlayerIds.add(playerId));
  }

  const playerPoolPlayers = [];
  playerPoolIds.forEach((playerId) => {
    const player = playersById.get(playerId);
    if (player) {
      playerPoolPlayers.push(player);
    } else {
      console.warn(`Spillerpool peker på ukjent spiller-id: ${playerId} (ignoreres).`);
      playerPoolIds.delete(playerId);
      unlockedPlayerIds.delete(playerId);
    }
  });

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
  const normallyUnlockedStaff = staff.filter((member) => {
    if (!member || !member.id) {
      return false;
    }
    const sources = Array.isArray(member.sourcePlaceIds) ? member.sourcePlaceIds : [];
    return sources.some((placeId) => unlockedPlaceIds.has(placeId)) || explicitStaffIds.has(member.id);
  });
  // Auto-troppen (starttropp uten History Go) gir også et minimum av
  // stabskandidater, slik at «Velg stab» er mulig uten samling. Stedene legges
  // aldri i unlockedPlaceIds eller History Go-lagring, og manageren må fortsatt
  // engasjere personene selv. Erstatter den gamle stedsanker-baserte kilden.
  const starterStaff = getStarterSquadStaffCandidates(staff);
  const staffById = new Map([...normallyUnlockedStaff, ...starterStaff].map((member) => [member.id, member]));
  const unlockedStaff = [...staffById.values()];

  // 4) Formasjonstilgjengelighet: unlockRules.json + formation.unlockLinks
  // vurdert mot samlingen (steder, spillere, stab, badges).
  const collectedPlayerIds = new Set([...candidatePlayerIds, ...getLocalStartPlayerIds()]);
  const collectedPools = {
    unlockedPlaceIds,
    unlockedPlayerIds: collectedPlayerIds,
    unlockedStaffIds: new Set(unlockedStaff.map((member) => member.id)),
    earnedBadgeIds: new Set(Array.isArray(state.teamMerits?.earnedBadgeIds) ? state.teamMerits.earnedBadgeIds : [])
  };

  // Alle formasjoner er spillbare (unlockedFormations = alle). History Go styrer
  // bare hva som er SAMLET/oppdaget (collectedFormations) — brukt til
  // samlingstelleren og bibliotekets kunnskapslinje, ikke som spillås.
  const unlockedFormations = [];
  const collectedFormations = [];
  const lockedFormations = [];
  const formationStatusById = new Map();
  (Array.isArray(state.formations) ? state.formations : []).forEach((formation) => {
    const status = evaluateFormationUnlock(formation, collectedPools);
    formationStatusById.set(formation.id, status);
    unlockedFormations.push(formation);
    (status.collected ? collectedFormations : lockedFormations).push(formation);
  });

  // 5) Roster readiness (15-spillerkravet) fra opplåste spillere + lineup.
  const rosterReadiness = computeRosterReadiness(unlockedPlayers);

  return {
    historyGoPlaceIds,
    managerPlaceIds: new Set([...unlockedPlaceIds].filter((placeId) => !historyGoPlaceIds.has(placeId))),
    unlockedPlaceIds,
    placeSourceById,
    placeUnlocks,
    candidatePlayerIds,
    playerPoolPlayers,
    playerPoolIds,
    unlockedPlayers,
    unlockedPlayerIds,
    nationalOnlyPlayerIds,
    quizPendingPlayerIds,
    playerSourceById,
    unlockedStaff,
    unlockedStaffIds: collectedPools.unlockedStaffIds,
    unlockedFormations,
    collectedFormations,
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
// Formasjoner er managerens taktiske verktøy, ikke samleobjekter: ALLE er
// alltid spillbare (`unlocked: true`). Det History Go styrer er hva du har
// SAMLET/oppdaget (`collected`) — den historiske opplåsingslinjen vises i
// formasjonsbiblioteket som kunnskap, ikke som en lås. Spillere og
// støtteapparat samles fortsatt via History Go; formasjoner gjør det ikke.
function evaluateFormationUnlock(formation, pools) {
  if (!formation || !formation.id) {
    return { unlocked: true, collected: true, tier: null, reason: "Åpent system.", satisfiedBy: null };
  }

  const rules = Array.isArray(state.hgUnlockRules?.rules) ? state.hgUnlockRules.rules : [];
  const rule =
    rules.find((item) => item && item.appliesTo === "formation" && item.formationId === formation.id) || null;
  const tier = rule?.tier || null;
  const links = Array.isArray(formation.unlockLinks) ? formation.unlockLinks : [];

  // Grunntilgang: start-/early-tier er managerens basissystemer (alltid «samlet»).
  if (tier && FORMATION_BASELINE_TIERS.has(tier)) {
    return { unlocked: true, collected: true, tier, reason: "Grunnsystem (start-/tidligformasjon).", satisfiedBy: null };
  }

  // Ingen registrert regel og ingen unlockLinks: åpent system.
  if (!rule && !links.length) {
    return { unlocked: true, collected: true, tier, reason: "Åpent system uten egen historisk kilde.", satisfiedBy: null };
  }

  if (rule && isUnlockRequiresSatisfied(rule.requires, pools)) {
    return {
      unlocked: true,
      collected: true,
      tier,
      reason: "Samlet via History Go.",
      satisfiedBy: findSatisfiedUnlockRequirement(rule.requires, pools)
    };
  }

  const satisfiedLink = links.find((link) => isUnlockRequirementSatisfied(link, pools));
  if (satisfiedLink) {
    return {
      unlocked: true,
      collected: true,
      tier,
      reason: "Samlet via History Go.",
      satisfiedBy: satisfiedLink.ref ? satisfiedLink : null
    };
  }

  // Ikke samlet i History Go ennå — men fortsatt fritt spillbar som taktisk valg.
  return { unlocked: true, collected: false, tier, reason: buildFormationUnlockNote(formation), satisfiedBy: null };
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

// Troppsspillere: starttroppen + eksplisitt rekrutterte kandidater som fortsatt
// har en gyldig klubb-/quiz-kilde. Kandidattilgang alene gjør ikke spilleren spillbar.
function getUnlockedPlayers() {
  return getAvailability().unlockedPlayers;
}

// Min spillerpool: alle spillerne samlingen og klubbtilgangen gjør valgbare.
// Kamp, trening og oppstilling leser fortsatt bare getUnlockedPlayers(), altså
// den eksplisitt valgte troppen.
function getPlayerPoolPlayers() {
  return getAvailability().playerPoolPlayers;
}

// Landslagsarena? Stedsrollen i football_unlocks.json skiller allerede
// landslagsarenaer (national_arena_/national_stadium_) fra klubbanlegg.
// Spillere herfra er landslagsspillere: speidet, men ikke signerbare til
// klubblaget. Ingen sted-id-er hardkodes her – kun rollen leses.
function isNationalArenaPlace(place) {
  const role = typeof place?.placeRole === "string" ? place.placeRole : "";
  return role.includes("national");
}

// Er en formasjon tilgjengelig som aktiv managerformasjon?
function isFormationUnlocked(formationId) {
  if (!formationId) {
    return false;
  }
  const status = getAvailability().formationStatusById.get(formationId);
  return status ? status.unlocked : true;
}

// Samlebelønning for formasjoner: ALLE formasjoner er fritt spillbare, men et
// system du har samlet/oppdaget via History Go setter seg raskere — laget og
// trenerteamet kjenner allerede systemets historie og idé. Dette er gulroten
// for å samle, i stedet for en lås: et ikke-samlet system er like spillbart,
// det tar bare litt lengre tid å lære inn.
const COLLECTED_FORMATION_FAMILIARITY_BONUS = 1;

function isFormationCollected(formationId) {
  if (!formationId) {
    return false;
  }
  return Boolean(getAvailability().formationStatusById.get(formationId)?.collected);
}

// Ekstra tilvenning per treningsuke/kamp for samlede formasjoner (0 ellers).
function getCollectedFormationFamiliarityBonus(formationId) {
  return isFormationCollected(formationId) ? COLLECTED_FORMATION_FAMILIARITY_BONUS : 0;
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
    const localStart = normalizeLocalStart(state.teamMerits?.localStart);
    const poolClub = localStart.clubId
      ? (state.leaguePyramid?.clubs || []).find((club) => club.id === localStart.clubId)
      : null;
    result.push({
      placeId: null,
      placeName: poolClub ? poolClub.name + " · grunntropp" : "Lokal starttropp",
      source: localStart.generatedFrom === "club_pool" ? "club_pool" : "local_start"
    });
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
  const hired = getUnlockedStaff().filter((member) => hiredIds.has(member.id));
  return decorateHiredStaffWithAssignments(hired);
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

// Avanser badge-uke: øk uketeller, gi hver aktiv progresjon +1 uke, tildel
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
      // +1 til +4 per uke basert på taktisk læringsfart, pluss samlebonus for
      // formasjoner du har oppdaget via History Go (raskere tilvenning).
      const gain = 1 + Math.round((learn / 100) * 3) + getCollectedFormationFamiliarityBonus(formation.id);
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

// ---------------------------------------------------------------------------
// Svake sider
//
// Identifiseres ut av spillerdataene (rollens `requires` + posisjonens krav,
// minus spillerens `strengths`). Memoisert per spiller: listen er ren funksjon
// av data som ikke endrer seg i en økt, og den bygges i hver render.
// ---------------------------------------------------------------------------
const weaknessCache = new Map();

function getPlayerWeaknesses(player) {
  const id = player?.id;
  if (!id) return [];
  if (weaknessCache.has(id)) return weaknessCache.get(id);
  const list = identifyPlayerWeaknesses(player, {
    roles: state.roles,
    catalogue: state.weaknessCatalogue
  });
  weaknessCache.set(id, list);
  return list;
}

function getWeaknessProgressStore() {
  return state.teamMerits?.weaknessProgress && typeof state.teamMerits.weaknessProgress === "object"
    ? state.teamMerits.weaknessProgress
    : {};
}

// Hva svakhetsarbeidet er verdt i denne elleveren: én liten bonus per spiller
// som står i en rolle han har trent seg til. Trent, men ikke brukt, gir null —
// og det sies rett ut i stedet for å skjules.
function getLineupWeaknessWork(teamFit) {
  return summarizeLineupWeaknessWork(getWeaknessProgressStore(), teamFit?.assignments, {
    roles: state.roles,
    catalogue: state.weaknessCatalogue
  });
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
// ---------------------------------------------------------------------------
// Spillerstatistikk: sesongens mål, målgivende og kamper
// Motoren (`football-player-stats.js`) er ren; her ligger bare akkumuleringen
// og lagringen, per modus som alt annet.
// ---------------------------------------------------------------------------

const PLAYER_STATS_KEY = "hgfm.playerSeasonStats.v1";
const PLAYER_CONDITION_KEY = "hgfm.playerCondition.v1";

// ---------------------------------------------------------------------------
// Spillerform og slitasje: troppen mellom kampene
// Motoren (`football-player-condition.js`) er ren; her ligger akkumuleringen,
// lagringen og hvile-steget når uka ruller.
// ---------------------------------------------------------------------------

function normalizePlayerCondition(value) {
  return Array.isArray(value) ? value.filter((entry) => entry?.playerId) : [];
}

function loadPlayerCondition() {
  try {
    return normalizePlayerCondition(JSON.parse(localStorage.getItem(PLAYER_CONDITION_KEY) || "null"));
  } catch (error) {
    console.error("Kunne ikke lese spillerform", error);
    return [];
  }
}

function savePlayerCondition() {
  try {
    localStorage.setItem(PLAYER_CONDITION_KEY, JSON.stringify(normalizePlayerCondition(state.playerCondition)));
  } catch (error) {
    console.error("Kunne ikke lagre spillerform", error);
  }
}

function getPlayerCondition() {
  return normalizePlayerCondition(state.playerCondition);
}

// Hvor hardt kampplanen tok på beina. Kampplanene bærer sin egen `intensity`;
// uten en valgt plan er den nøytral.
// Kampplanenes `intensity` i data/football_tactics.json går fra 30 til 100 —
// IKKE fra 0.6 til 1.6. Den gamle koden klampet tallet direkte inn i
// [0.6, 1.6], så ENHVER kampplan ble maksimal intensitet: hver kamp la på 1.6
// ganger normal belastning. Det er hele grunnen til at skadene eksploderte.
//
// 60 er nøytralt. En lav blokk (30) koster ~0.82, alt frem (100) ~1.24.
function getMatchIntensityFactor() {
  const raw = getTactic()?.intensity;
  const byLevel = { lav: 0.85, moderat: 1, hoy: 1.15, "høy": 1.15, ekstrem: 1.25 };
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(0.8, Math.min(1.3, 1 + (raw - 60) / 100 * 0.6));
  }
  return byLevel[String(raw).toLowerCase()] || 1;
}

// Etter kampen: belastning fra minuttene, form fra det som skjedde, og
// skaderisiko fra belastning som har fått stå. Idempotent på matchId.
function registerMatchInPlayerCondition(lastMatch) {
  const played = Array.isArray(lastMatch?.playerStats?.appearances) ? lastMatch.playerStats.appearances : [];
  if (played.length === 0) return;
  const matchId = String(lastMatch.id || "");
  if (matchId && Array.isArray(state.playerConditionMatchIds) && state.playerConditionMatchIds.includes(matchId)) return;

  state.playerCondition = applyMatchToConditions(getPlayerCondition(), {
    played,
    goals: lastMatch.playerStats?.goals || [],
    outcome: lastMatch.outcome,
    intensity: getMatchIntensityFactor()
  });
  state.playerConditionMatchIds = [...(state.playerConditionMatchIds || []), matchId].slice(-60);
  savePlayerCondition();
}

// Uka ruller: laget hviler. Hvor mye avhenger av treningsuka du valgte —
// restitusjon henter mer enn en pressuke.
// Treningsuka avgjør hvor mye laget henter inn igjen. Belastningen fra fokuset
// er et tall mellom −4 (restitusjonspreget) og +6 (press) i treningsmotoren.
//
// Den gamle koden lette etter `fatigueLoad`/`intensity` på fokus-objektet —
// felter som ikke finnes — og falt alltid tilbake til nøytralt. Treningsvalget
// gjorde altså ingenting for restitusjonen.
// Uka gjøres opp i den rekkefølgen den faktisk skjer:
//
//   1. LAGET hviler — hvor mye avgjøres av ukas RAMME (treningsprogrammet), med
//      fokuset som modulering. Tidligere leste denne kun fokuset, mens
//      programmets egne `fatigueLoad`-tall (6–19 for en hel uke) lå ubrukt. Ukas
//      faktiske arbeidsmengde var altså mekanisk uten virkning — samme klasse
//      feil som resten av skalafeilene i CLAUDE.md.
//   2. ENKELTSPILLERNE følges opp — egen restitusjon legger seg OPPÅ lagets
//      hvile, rolletrening bygger fortrolighet, opptrening korter ned skader.
function applyWeeklyPlayerRecovery() {
  const trainingIntensity = calculateWeeklyTrainingIntensity({
    program: getSelectedTrainingProgramComposition(),
    focusId: state.weeklyTrainingFocus?.focusId || null
  });
  state.playerCondition = applyWeeklyRecovery(getPlayerCondition(), {
    trainingIntensity,
    recoveryBonus: calculateFacilityEffects(state.teamMerits?.facilities).weeklyRecoveryBonus
  });
  savePlayerCondition();
  applyIndividualTrainingWeek();
}

// Snittet av startelleverens slitasje, som en liten lagstyrke-penalty.
// Klampet i motoren til maks −6: den avgjør aldri en kamp alene.
function getSquadFatiguePenalty(teamFit) {
  const conditions = getPlayerCondition();
  if (conditions.length === 0) return 0;
  const starters = (Array.isArray(teamFit?.assignments) ? teamFit.assignments : [])
    .map((assignment) => assignment?.player?.id)
    .filter(Boolean);
  if (starters.length === 0) return 0;
  const average = starters.reduce((sum, id) => sum + fatigueFactorFor(conditionFor(conditions, id)), 0) / starters.length;
  // `fatigueFactorFor` går fra 1.0 (uthvilt) til 0.78 (utkjørt). Motoren klamper
  // straffen til [0, 6], så mappingen må treffe NØYAKTIG det området.
  //
  // Første forsøk regnet `(1 - snitt) * 90`, som gir 18 ved full utmattelse.
  // Da lå straffen fast på taket fra og med load 70: en sliten tropp og en
  // utkjørt tropp ble behandlet likt, og gradvisheten forsvant nettopp der den
  // betyr mest. Samme feil som kampplanenes intensitet — klampen gjorde jobben
  // som mappingen skulle gjort.
  const spenn = 1 - 0.78;
  return Math.round(Math.min(1, (1 - average) / spenn) * 6 * 10) / 10;
}

// Friskheten per spiller, slik kampmotoren og innbyttemotoren trenger den.
function getFreshnessByPlayerId() {
  const map = {};
  getPlayerCondition().forEach((entry) => { map[entry.playerId] = freshnessFor(entry); });
  return map;
}


function normalizePlayerSeasonStats(value) {
  if (!value || typeof value !== "object") return { rows: [], matchIds: [] };
  return {
    rows: Array.isArray(value.rows) ? value.rows : [],
    matchIds: Array.isArray(value.matchIds) ? value.matchIds : []
  };
}

function loadPlayerSeasonStats() {
  try {
    return normalizePlayerSeasonStats(JSON.parse(localStorage.getItem(PLAYER_STATS_KEY) || "null"));
  } catch (error) {
    console.error("Kunne ikke lese spillerstatistikk", error);
    return { rows: [], matchIds: [] };
  }
}

function savePlayerSeasonStats() {
  try {
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(normalizePlayerSeasonStats(state.playerSeasonStats)));
  } catch (error) {
    console.error("Kunne ikke lagre spillerstatistikk", error);
  }
}

function registerMatchInPlayerStats(lastMatch) {
  const matchStats = lastMatch?.playerStats;
  if (!matchStats) return;
  const current = normalizePlayerSeasonStats(state.playerSeasonStats);
  const matchId = String(lastMatch.id || "");
  if (matchId && current.matchIds.includes(matchId)) return;

  state.playerSeasonStats = {
    rows: applyMatchPlayerStats(current.rows, matchStats),
    matchIds: matchId ? [...current.matchIds, matchId] : current.matchIds
  };
  savePlayerSeasonStats();
}

function saveMatchdayState() {
  if (!shouldWriteLegacyLeagueStorage()) return;
  try {
    localStorage.setItem(MATCHDAY_STATE_KEY, JSON.stringify(state.matchday));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Kampklar-status: én autoritativ port for alle flater og handlere. Den rene
// motoren eier status, blokkeringer, rekkefølge og canStartMatch. App-laget
// oversetter bare eksisterende state til et rent inputobjekt.
function getMatchdayReadiness(teamFit) {
  const roster = getAvailability().rosterReadiness || {};
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const selectedMode = state.gameStartState?.selectedMode || state.modeEnvelope?.activeMode || null;
  const hasPlayableMatch = isLeagueModeActive()
    ? isLeagueSeasonActive()
    : isScenarioModeActive()
      ? state.miniSeason?.status === "active"
      : isNationalModeActive()
        ? isTournamentActive()
        : false;

  // clubWeekMatchdayGate.isBlocked betyr at kampdagfasen VENTER på kampen før
  // uka kan gå videre. Det er derfor ikke et forbud mot avspark. Kampstart er
  // blokkert når klubben står i en annen fase enn kampdag.
  const clubWeekPhase = state.clubWeekState?.phase || null;
  const clubWeekBlocked = Boolean(
    selectedMode === "league" && clubWeekPhase && clubWeekPhase !== "matchday"
  );

  return evaluateMatchdayReadiness({
    dataLoaded: Boolean(teamFit),
    starterAssignments: assignments.map((item) => ({
      playerId: item.player?.id || null,
      roleId: item.role?.id || null
    })),
    duplicatePlayerIds: (Array.isArray(teamFit?.duplicatePlayers) ? teamFit.duplicatePlayers : [])
      .map((player) => player?.id)
      .filter(Boolean),
    unlockedPlayerCount: roster.unlockedCount,
    benchCount: roster.benchCount,
    expectedStarters: REQUIRED_STARTERS,
    minimumBench: REQUIRED_BENCH,
    minimumSquadSize: REQUIRED_SQUAD_SIZE,
    hasTrainingChoice:
      Boolean(state.weeklyTrainingProgram?.programId) || Boolean(state.weeklyTrainingFocus?.focusId),
    selectedMode,
    hasPlayableMatch,
    leagueSeasonActive: !isLeagueModeActive() || isLeagueSeasonActive(),
    clubWeekBlocked,
    clubWeekReason: clubWeekBlocked
      ? `Klubbuka står i «${CLUB_WEEK_PHASE_LABELS[clubWeekPhase] || clubWeekPhase}». Gå videre til kampdag.`
      : "",
    matchInProgress: Boolean(state.matchday?.session)
  });
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
// «Se kampanalyse» forsvinner når rapporten er sett.
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
  const readiness = getMatchdayReadiness(teamFit);

  // Den samme autoritative porten som driver status, knapp og Neste handling
  // vokter også selve handleren. Alternative UI-veier kan dermed ikke omgå den.
  if (!readiness.canStartMatch) {
    if (elements.matchdayReadiness) {
      elements.matchdayReadiness.dataset.ready = "false";
      elements.matchdayReadiness.dataset.status = readiness.status;
      elements.matchdayReadiness.textContent = readiness.summary;
    }
    renderApp();
    return;
  }

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
  if (!getMatchdayReadiness(teamFit).canStartMatch || (!state.weeklyTrainingProgram?.programId && !state.weeklyTrainingFocus?.focusId)) {
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
    lastMatchWeaknessMetric: state.matchday?.lastMatch?.exposedWeaknessMetric || null,
    // Samsvar mellom ukas ramme og ukas tema: lå fokuset inne i treningsprogrammet
    // (+1), eller trente laget én ting mens kampplanen krevde en annen (−1)?
    coherenceBonus: evaluateProgramFocusCoherence(
      getSelectedTrainingProgramComposition(),
      state.weeklyTrainingFocus?.focusId || null
    ).metricBonusDelta
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
    // Benken er ikke lenger pynt: de fire spillerne spillet krever av deg kan
    // faktisk komme inn. Motoren regner passformen deres mot hver av de elleve
    // plassene ved avspark.
    benchPlayers: getAvailability().rosterReadiness?.benchCandidates || [],
    roles: state.roles,
    // Slitasje: en tropp som er kjørt hardt leverer mindre, og en spiller som
    // startet sliten er tom tidligere.
    conditionPenalty: getSquadFatiguePenalty(teamFit),
    conditionByPlayerId: getFreshnessByPlayerId(),
    // Role Familiarity Engine v1: liten, klampet kampstyrke-bonus for kontinuitet
    // i rollene. Beregnet utenfor fit-motoren og matet inn additivt.
    roleFamiliarityBonus: getLineupFamiliaritySummary(teamFit).bonus,
    // Svakhetstrening betaler kun når spilleren står i rollen han trente seg til.
    weaknessWorkBonus: getLineupWeaknessWork(teamFit).bonus
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
  // Første periode: fra avspark til første hendelse. Kampen har en stilling
  // allerede før du tar ditt første grep — akkurat som en ekte kamp.
  state.matchday.session = advanceMatchClock(session);
  // Kampen starter fra 0 og spilles av minutt for minutt.
  state.matchday.session.liveMinute = 0;
  saveMatchdayState();
  renderApp();
  startMatchLive();
}

// Ta et managergrep for gjeldende hendelse: vurder valget mot sesjonens
// snapshots, lagre beslutningen med konsekvens, og gå videre til neste
// hendelse — eller avslutt kampen og bygg sluttrapporten.
function chooseMatchdayDecision(optionId) {
  ensureMatchdayState();
  // `let`: motstanderens tilpasning gir en NY sesjon (motorene muterer ikke),
  // og resten av funksjonen må jobbe videre på den.
  let session = state.matchday.session;
  const eventIndex = getSessionEventIndex(session);

  if (session === null || eventIndex === null) {
    return;
  }

  const event = session.events[eventIndex];
  const option = (event.options || []).find((candidate) => candidate.id === optionId);

  if (!option) {
    return;
  }

  let matchJustFinished = false;
  let startNextPeriodPlayback = false;
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

  // Grepet inn i minuttloggen, så kampen leses som én sammenhengende fortelling.
  state.matchday.session = logMatchMoment(session, {
    type: "decision",
    side: "for",
    detail: `Ditt grep: ${option.label}`
  });
  session = state.matchday.session;

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
    // Spill ferdig perioden fram til neste hendelse. Grepet du nettopp tok
    // gjelder for den — derfor teller tidlige grep i flere perioder enn sene.
    const periodStart = currentPeriodEndMinute(session);
    session = advanceMatchClock(session);
    // Neste periode spilles av fra der den forrige sluttet.
    session.liveMinute = periodStart;
    state.matchday.session = session;
    // Motstanderen svarer på kampbildet — nå den ekte stillingen. Skyver de
    // laget opp eller trekker de seg ned, er ikke planen din like god lenger.
    const adapted = applyOpponentAdaptation(session);
    if (adapted !== session) {
      state.matchday.session = adapted;
      session = adapted;
    }
    startNextPeriodPlayback = true;
  } else {
    // Siste periode: fra siste hendelse til full tid.
    session = advanceMatchClock(session);
    session.liveMinute = 90;
    state.matchday.session = session;
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
    // Spillerstatistikk: legg kampens kamper, mål og målgivende til sesongen.
    // Idempotent på matchId, så reload/dobbeltkall aldri teller dobbelt.
    registerMatchInPlayerStats(state.matchday.lastMatch);
    // Bruken får konsekvenser: belastning, form og skaderisiko bæres videre.
    registerMatchInPlayerCondition(state.matchday.lastMatch);
    // Role Familiarity Engine v1: bygg spillernes rolle-fortrolighet ved riktig
    // bruk (forvitre litt ved feilbruk). Startelleveren er låst gjennom sesjonen,
    // så gjeldende teamFit speiler laget som spilte. Kjøres én gang per kamp
    // (denne grenen treffes bare når siste hendelse er besvart).
    recordRoleFamiliarityFromMatch(getTeamFit());
    state.matchday.session = null;
    matchJustFinished = true;
  }

  saveMatchdayState();
  renderApp();
  // Neste periode spilles av med det samme, så kampen føles sammenhengende.
  if (startNextPeriodPlayback) startMatchLive();
  // Club Week Orchestrator v1.1: spilt kamp nudger uka til Oppsummering-fasen
  // (gate-sikkert — kampdag→oppsummering krever nettopp en spilt kamp). Selve
  // uke-rullen skjer fortsatt via «Til managerkontoret».
  if (matchJustFinished) {
    syncClubWeekPhaseToProgress().catch(console.error);
  }
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
    // Samlebonus: et system oppdaget via History Go setter seg raskere også
    // gjennom kamp.
    const collectedBonus = getCollectedFormationFamiliarityBonus(consequences.formationId);
    const nextValue = Math.max(0, Math.min(100, Math.round(startValue + consequences.familiarityGain + collectedBonus)));
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
  // Nullstilling stopper også klokka.
  stopMatchLive();
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

function normalizeGameStartState(value) {
  const selectedMode = ["league", "national", "scenario", "training"].includes(value?.selectedMode) ? value.selectedMode : null;
  return {
    selectedMode,
    activeLeagueSaveId: typeof value?.activeLeagueSaveId === "string" ? value.activeLeagueSaveId : undefined,
    activeScenarioId: typeof value?.activeScenarioId === "string" ? value.activeScenarioId : undefined,
    leagueSeasonStatus: typeof value?.leagueSeasonStatus === "string" ? value.leagueSeasonStatus : undefined,
    clubName: typeof value?.clubName === "string" ? value.clubName : undefined,
  // Tok manageren over en etablert klubb? Da eier klubben nivået, tradisjonen
  // og styrets forventning — men aldri troppen.
  takeoverClubId: typeof value?.takeoverClubId === "string" ? value.takeoverClubId : undefined,
    managerName: typeof value?.managerName === "string" ? value.managerName : undefined,
    leagueName: typeof value?.leagueName === "string" ? value.leagueName : undefined,
    seasonLabel: typeof value?.seasonLabel === "string" ? value.seasonLabel : undefined,
    boardExpectation: typeof value?.boardExpectation === "string" ? value.boardExpectation : undefined,
    seasonObjective: typeof value?.seasonObjective === "string" ? value.seasonObjective : undefined,
    createdAt: typeof value?.createdAt === "string" ? value.createdAt : undefined
  };
}

function loadGameStartState() {
  try {
    return normalizeGameStartState(JSON.parse(localStorage.getItem(GAME_START_STATE_KEY)));
  } catch (error) {
    return normalizeGameStartState(null);
  }
}

function saveGameStartState() {
  try {
    localStorage.setItem(GAME_START_STATE_KEY, JSON.stringify(normalizeGameStartState(state.gameStartState)));
  } catch (error) {
    // Valg av spillmodus er UI-state og må ikke stoppe appen i privat modus.
  }
}

function selectGameMode(mode, extras = {}) {
  if (state.modeEnvelope) {
    state.modeEnvelope = switchModeSession(state.modeEnvelope, state, mode);
    persistModeEnvelope(localStorage, state.modeEnvelope);
  }
  // Mode is owned by modeEnvelope. gameStartState keeps league/scenario
  // metadata for backward compatibility, without discarding the league save.
  state.gameStartState = normalizeGameStartState({ ...state.gameStartState, selectedMode: mode, ...extras });
  saveGameStartState();
}

function isScenarioModeActive() {
  return state.modeEnvelope?.activeMode === "scenario";
}

function isLeagueModeActive() {
  return state.modeEnvelope?.activeMode === "league";
}

// ---------------------------------------------------------------------------
// Landslagsmodus: du tar over et landslag i stedet for en klubb. Troppen er
// spillerne du har SAMLET fra den nasjonen – inkludert landslagsarena-spillerne
// (Ullevaal/Maracanã) som klubblaget aldri får signere. Egen modus-sesjon, så
// klubbsaven aldri påvirkes.
// ---------------------------------------------------------------------------

function getNationalTeamState() {
  const raw = state.nationalTeam;
  return {
    nationality: typeof raw?.nationality === "string" && raw.nationality.trim() ? raw.nationality.trim() : null,
    squadPlayerIds: Array.isArray(raw?.squadPlayerIds) ? raw.squadPlayerIds.filter((id) => typeof id === "string") : []
  };
}

function getNationalTeamNationality() {
  return getNationalTeamState().nationality;
}

// Hvilke spillere har du samlet, uavhengig av klubb/landslag-skillet OG av
// hvilken nasjon som er valgt nå? Leses fra de opplåste stedene direkte, ikke
// fra den nasjonsfiltrerte spillerlista – ellers ville nasjonsvelgeren bare
// vist nasjonen du allerede har valgt.
function getCollectedPlayersForNations() {
  const unlockedPlaceIds = getAvailability().unlockedPlaceIds;
  const byId = new Map((Array.isArray(state.players) ? state.players : []).map((p) => [p.id, p]));
  const ids = new Set(getLocalStartPlayerIds());
  (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : []).forEach((place) => {
    if (!place || !unlockedPlaceIds.has(place.placeId)) return;
    (Array.isArray(place.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (unlock && isPlayerUnlockType(unlock.type) && unlock.targetId) ids.add(unlock.targetId);
    });
  });
  return [...ids].map((id) => byId.get(id)).filter(Boolean);
}

// Nasjoner du kan lede. Troppen er grunnstammen (nasjonens jevne klubbspillere,
// alltid tilgjengelig) pluss spillerne du faktisk har samlet – inkludert
// landslagsstjernene som klubblaget ditt aldri får signere. `collected` telles
// separat, så det synes hva samlingen din tilfører.
function getAvailableNations() {
  const nations = new Map();
  const entry = (nation) => {
    if (!nations.has(nation)) nations.set(nation, { ids: new Set(), collected: new Set() });
    return nations.get(nation);
  };
  getNationalBasePlayers().forEach((player) => {
    const nation = typeof player.nationality === "string" ? player.nationality.trim() : "";
    if (!nation) return;
    entry(nation).ids.add(player.id);
  });
  getCollectedPlayersForNations().forEach((player) => {
    const nation = typeof player.nationality === "string" ? player.nationality.trim() : "";
    if (!nation) return;
    const record = …72077 tokens truncated…epId = syncTrainingWorkspace(
    document.querySelector("#trainingWorkspace"),
    state.openTrainingStepId
  );
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
  const orderedFocuses = [
    ...TRAINING_FOCUSES.filter((focus) => recommendation.focusIds.includes(focus.id)),
    ...TRAINING_FOCUSES.filter((focus) => !recommendation.focusIds.includes(focus.id))
  ];
  orderedFocuses.forEach((focus, index) => {
    const support = calculateTrainingStaffSupport({ focusId: focus.id, coachContext: getCoachContext() });
    const isSelected = selected?.id === focus.id;
    const isRecommended = recommendation.focusIds.includes(focus.id);
    const card = document.createElement("article");
    card.className = "weekly-training-card";
    card.dataset.support = support.level;
    if (isSelected) card.classList.add("is-selected");
    if (isRecommended) card.classList.add("is-recommended");

    const groupLabel = document.createElement("p");
    groupLabel.className = "training-choice-card-label";
    groupLabel.textContent = isRecommended && index === 0 ? "Anbefalt nå" : "Andre trygge valg";
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
    card.append(groupLabel, heading, description, effect, meta, button);
    options.append(card);
  });
  return recommendation;
}

// Suggested Setups v1: forklarende oppsettforslag (formasjon, kampplan) i
// Taktikk-fanen. Bygger på samme motorer som resten av appen (teamFit,
// formasjonskunnskap, motstander, coachContext) og degraderer trygt.
// Forslagene er additive: de låser ikke spilleren, men forklarer
// standardforståelsen slik at egne kontekstuelle valg kan slå dem.
// Treningsuke-gruppen fra createSuggestedSetups() rendres bevisst ikke her —
// Trening-fanens weekly-training-panel har allerede sin egen "Anbefalt nå"-
// merking integrert i selve valget, og en egen liste ville duplisert den.
const SUGGESTED_SETUP_GROUPS = [
  { type: "formation", label: "Formasjon" },
  { type: "match_plan", label: "Kampplan" }
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
  const container = elements.suggestedSetupsTactics;
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
  if (canSelect) card.classList.add("is-selectable");

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
    renderTrainingProgramContext({ recommendation: null, programs: [], selectedProgram: null });
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
  renderTrainingProgramContext({ recommendation: null, programs: visiblePrograms, selectedProgram });

  visiblePrograms.forEach((program, index) => {
    const sectionLabel = document.createElement("p");
    sectionLabel.className = "training-program-section-label";
    sectionLabel.textContent = index === 0 ? "Anbefalt nå" : index === 1 ? "Andre trygge valg" : "Dypere treningsprogram / historikk";
    container.append(sectionLabel);
    container.append(
      buildTrainingProgramCard(program, {
        isSelected: program.id === selectedProgramId,
        locked,
        opponentName: opponent?.name || null
      })
    );
  });
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
    const row = document.createElement("article");
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
  const panel = statusEl?.closest(".mini-season-panel") || overview?.closest(".mini-season-panel") || null;
  if (panel) panel.hidden = !isScenarioModeActive();
  if (!isScenarioModeActive()) {
    if (overview) overview.textContent = "";
    return;
  }

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

// League Loop v0.2: ligasesong-panelet på Oversikt. Samme motor og
// visningshjelpere som prøveperioden, men liga-presentasjon: auto-startet
// sesong, terminliste (neste kamp), tabell, form, resultater og styredom ved
// sesongslutt. Vises KUN i ligamodus; prøveperiodepanelet er fortsatt
// scenario-isolert i renderMiniSeason.
function renderLeagueSeason() {
  const panel = elements.leagueSeasonPanel;
  if (!panel) return;

  panel.hidden = !isLeagueModeActive();
  if (!isLeagueModeActive()) {
    if (elements.seasonCommand) elements.seasonCommand.textContent = "";
    if (elements.leagueSeasonOverview) elements.leagueSeasonOverview.textContent = "";
    return;
  }

  ensureLeagueSeason();

  const season = state.leagueSeason;
  const statusEl = elements.leagueSeasonStatus;
  const overview = elements.leagueSeasonOverview;
  const newSeasonButton = elements.startNewLeagueSeasonButton;
  const table = season ? createLeagueTable(season) : [];
  const managerRow = table.find((row) => row.isManager);
  const nextMatch = season?.status === "active" ? getNextLeagueOpponent(season) : null;
  const scene = createSeasonSceneModel({
    season,
    table,
    nextMatch,
    boardExpectation: getLeagueSaveModel().boardExpectation
  });

  renderSeasonCommand(elements.seasonCommand, scene, {
    onOpenMatch: () => activateTab("kamp"),
    onOpenTeam: () => activateTab("tactics")
  });

  if (newSeasonButton) {
    newSeasonButton.hidden = season?.status !== "completed";
  }

  if (statusEl) {
    if (!season) {
      statusEl.textContent = "Sesongkontrollen åpner når før-sesongen er bekreftet: klubbanker, tropp, stab, ellever, formasjon og trening.";
    } else if (season.status === "completed") {
      statusEl.textContent = `${table[0]?.club || "Ligamesteren"} er seriemester. ${managerRow?.club || "Managerklubben"} endte på ${managerRow?.position || "–"}. plass med ${managerRow?.points || 0} poeng.`;
    } else {
      statusEl.textContent = `${scene.statusLabel} · ${managerRow?.position || "–"}. plass · ${managerRow?.points || 0} poeng · styrets mål: ${scene.boardExpectation}`;
    }
  }

  if (!overview) return;
  overview.textContent = "";
  if (!season) return;
  renderSeasonLeagueOverview(overview, scene, season);
}

// Finn aktiv kunnskapsanbefaling i gjeldende viewModel, eller null hvis ingen er valgt
// eller det valgte kortet ikke finnes lenger. Kun UI/state, ingen engine-effekt.
function getActiveKnowledgeRecommendation(viewModel) {
  if (!viewModel || !state.activeKnowledgeFocusId) return null;
  return viewModel.knowledgeRecommendations.find(
    (item) => item.principleId === state.activeKnowledgeFocusId
  ) || null;
}

// Kunnskapsuke-tellere leses fra state (ikke fra viewModel) og hører derfor
// hjemme i den synkrone render-stien, ikke bak den async TS-broen. Ellers
// sluttet de å oppdatere seg når dist/ ikke var bygget.
function renderTrainingWeekCounters() {
  if (elements.trainingWeekStatus) {
    elements.trainingWeekStatus.textContent = `Kunnskapsuke ${state.trainingWeek}`;
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
        suggestedSession: item.suggestedSession,
        weakPointCode: item.area
      }));

  const trainingItems = [
    ...(activeKnowledge ? [{
      type: "knowledge_focus",
      principleId: activeKnowledge.principleId,
      text: `Valgt ukesøkt: ${activeKnowledge.title} — ${activeKnowledge.trainingSession}`
    }] : []),
    ...teamFitFocus.map((item) => {
      const trainingText = getFootballBookSurfaceText("training", {
        weakPoints: item.weakPointCode ? [item.weakPointCode] : [],
        trainingAreas: [item.areaText],
      });
      return {
        type: "engine_training",
        text: `${item.areaText}: ${trainingText || item.suggestedSession}`
      };
    })
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

  // Samme motorkall, to visninger: den dype rapporten (modal) og Analyse-fanen.
  const roleChangeTargets = [elements.managerRoleChanges, elements.analyseRoleChanges].filter(Boolean);
  const weakPointTargets = [elements.managerWeakPoints, elements.analyseWeakPoints].filter(Boolean);

  if (roleChangeTargets.length > 0 && engine?.recommendRoleChangesFromTeamFit && teamFit) {
    const recommendations = engine
      .recommendRoleChangesFromTeamFit(teamFit, { tactic: getTactic(), roles: state.roles })
      .filter((recommendation) => recommendation.status !== "keep_role")
      .sort((a, b) => (b.candidates[0]?.improvement ?? 0) - (a.candidates[0]?.improvement ?? 0));

    roleChangeTargets.forEach((target) => renderTextList(
      target,
      recommendations,
      (recommendation) => recommendation.label,
      "Ingen tydelige rollebytter akkurat nå. Rollebruken bør i hovedsak beholdes.",
    ));
  }

  if (weakPointTargets.length > 0 && engine?.analyzeWeakPointsFromTeamFit && teamFit) {
    const weakPoints = engine.analyzeWeakPointsFromTeamFit(teamFit);

    weakPointTargets.forEach((target) => renderTextList(
      target,
      weakPoints,
      (weakPoint) => {
        const assistantText = getFootballBookSurfaceText("assistant", {
          weakPoints: [weakPoint.code],
          relatedTags: [weakPoint.categoryText],
        });
        return assistantText
          ? `${weakPoint.categoryText}: ${weakPoint.label} — ${assistantText}`
          : `${weakPoint.categoryText}: ${weakPoint.label} — ${weakPoint.suggestedAction}`;
      },
      "Ingen tydelige svakheter i denne vurderingen.",
    ));
  }
}

// Sesongdommen og merittlista på Statistikk. Dommen vises bare når sesongen
// faktisk er ferdig; merittlista står alltid, som karrieren din.
function renderSeasonReview() {
  const panel = elements.seasonReviewPanel;
  const review = state.seasonReview || null;

  if (panel) {
    panel.hidden = !isLeagueModeActive() || !review;
    if (review && !panel.hidden) {
      panel.dataset.verdict = review.verdict;
      if (elements.seasonReviewVerdict) {
        elements.seasonReviewVerdict.textContent = review.sacked
          ? "Sesongdom · sparket"
          : review.warning
            ? "Sesongdom · advarsel"
            : `Sesongdom · ${review.verdictLabel}`;
      }
      if (elements.seasonReviewHeadline) elements.seasonReviewHeadline.textContent = review.headline;
      if (elements.seasonReviewBoard) {
        const trend = review.boardTrustDelta >= 0 ? `+${review.boardTrustDelta}` : `${review.boardTrustDelta}`;
        elements.seasonReviewBoard.textContent = `${review.boardMessage} Styretillit ${trend} (nå ${review.boardTrustAfter}).`;
      }
      renderTextList(elements.seasonReviewReasons, review.reasons, (line) => line, "");
      renderTextList(elements.seasonReviewHighlights, review.highlights, (line) => line, "");
    }
  }

  const archive = getSeasonArchive();
  const summary = summarizeSeasonHistory(archive);
  if (elements.seasonArchiveSummary) {
    const target = isLeagueModeActive() && state.leagueSeason?.status === "active" ? getSeasonTarget() : null;
    elements.seasonArchiveSummary.textContent = target
      ? `${summary.headline} Denne sesongen: ${target.description}`
      : summary.headline;
  }

  const container = elements.seasonArchiveTable;
  if (!container) return;
  container.textContent = "";
  if (archive.length === 0) return;

  const table = document.createElement("table");
  table.className = "stats-table";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Sesong", "Plass", "P", "Mål", "Dom", "Toppscorer"].forEach((label) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    headRow.append(th);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  [...archive].reverse().forEach((entry) => {
    const row = document.createElement("tr");
    if (entry.sacked) row.className = "is-sacked";
    else if (entry.warning) row.className = "is-warning";
    const cells = [
      String(entry.seasonNumber),
      `${entry.position}.`,
      String(entry.points),
      `${entry.goalsFor}–${entry.goalsAgainst}`,
      entry.verdictLabel || "",
      entry.topScorer ? `${entry.topScorer.name} (${entry.topScorer.goals})` : "–"
    ];
    cells.forEach((value, index) => {
      const cell = document.createElement(index === 0 ? "th" : "td");
      if (index === 0) cell.scope = "row";
      cell.textContent = value;
      row.append(cell);
    });
    body.append(row);
  });

  table.append(head, body);
  container.append(table);
}

// Scenariolista, bygget fra data. Hvert kort forklarer seg selv: hva epoken er,
// hva utfordringen består i, og hva du skal lære av den — ikke bare et navn og
// en «Start»-knapp.
function renderScenarioList() {
  const list = elements.scenarioList;
  if (!list) return;

  const scenarios = Array.isArray(state.scenarios) ? state.scenarios : [];
  list.textContent = "";

  if (scenarios.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Scenariokatalogen kunne ikke lastes. Ligaspill og landslag virker som normalt.";
    list.append(empty);
    return;
  }

  const activeId = state.gameStartState?.activeScenarioId || null;

  scenarios.forEach((scenario) => {
    const info = describeScenario(scenario);
    const card = document.createElement("article");
    card.className = `scenario-card${info.id === activeId ? " is-active" : ""}`;

    const era = document.createElement("span");
    era.textContent = `${info.era} · ${info.matchCount} kamper`;

    const name = document.createElement("strong");
    name.textContent = info.name;

    const subtitle = document.createElement("small");
    subtitle.textContent = info.subtitle;

    const lede = document.createElement("p");
    lede.className = "muted-text";
    lede.textContent = info.lede;

    const challenge = document.createElement("p");
    challenge.className = "scenario-challenge";
    challenge.textContent = info.challenge;

    const learn = document.createElement("p");
    learn.className = "scenario-learning muted-text";
    learn.textContent = `Du lærer: ${info.learningFocus}`;

    const opponents = document.createElement("p");
    opponents.className = "scenario-opponents muted-text";
    opponents.textContent = `${info.isOrdered ? "I rekkefølge" : "Motstandere"}: ${info.opponentNames.join(" · ")}`;

    const action = document.createElement("button");
    action.type = "button";
    action.className = "primary-action-button";
    action.textContent = info.id === activeId ? "Aktivt scenario" : "Start scenario";
    action.disabled = info.id === activeId;
    if (info.id !== activeId) {
      action.addEventListener("click", () => startScenario(info.id));
    }

    card.append(era, name, subtitle, lede, challenge, learn, opponents, action);
    list.append(card);
  });
}

// Start et scenario: låser motstanderne til scenarioets utvalg og setter i gang
// den separate femkampersøkta. Ligaspillet røres ikke.
function startScenario(scenarioId) {
  const scenario = getScenario(state.scenarios, scenarioId);
  if (!scenario) return;
  selectGameMode("scenario", { activeScenarioId: scenario.id });
  startMiniSeason();
  activateTab("dashboard");
}

// Troppens tilstand på Trening-flata: hvem er sliten, hvem er skadet, og hvem
// bør hviles. Formuleringene peker alltid på BRUKEN — en sliten spiller er ikke
// en dårlig spiller, han er en spiller manageren har brukt hardt.
function renderSquadCondition() {
  const conditions = getPlayerCondition();
  const summary = summarizeSquadCondition(conditions);

  if (elements.squadConditionSummary) {
    // Etter sommerferien er alle uthvilte fordi kalenderen sa det — ikke fordi
    // manageren roterte. Å rose ham for det ville vært en liten løgn.
    const playedThisSeason = conditions.some((entry) => Number(entry.matchesPlayed) > 0);
    elements.squadConditionSummary.textContent = summary.tracked === 0
      ? "Ingen kamper spilt ennå — troppen er uthvilt."
      : !playedThisSeason
        ? `Troppen er uthvilt etter oppholdet. Belastningen bygger seg opp igjen fra første kamp.`
        : summary.injuredCount === 0 && summary.tiredCount === 0
          ? `${summary.tracked} spillere fulgt. Ingen slitne, ingen skadde — du har rotert godt.`
          : `${summary.tiredCount} sliten${summary.tiredCount === 1 ? "" : "e"}, ${summary.injuredCount} skadd${summary.injuredCount === 1 ? "" : "e"}. Treningsuka du velger avgjør hvor mye laget henter inn igjen.`;
  }

  const list = elements.squadConditionList;
  if (!list) return;
  list.textContent = "";

  const injured = conditions.filter((entry) => isInjured(entry));
  const rest = playersNeedingRest(conditions);

  if (injured.length === 0 && rest.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted-text";
    empty.textContent = summary.tracked === 0
      ? "Spill en kamp, så følger belastning, form og skaderisiko troppen videre."
      : "Ingen som trenger avlastning akkurat nå.";
    list.append(empty);
    return;
  }

  injured.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "is-injured";
    const who = document.createElement("strong");
    who.textContent = entry.name || entry.playerId;
    const why = document.createElement("span");
    why.textContent = describeCondition(entry);
    item.append(who, why);
    list.append(item);
  });

  rest.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "is-tired";
    const who = document.createElement("strong");
    who.textContent = entry.name || entry.playerId;
    const why = document.createElement("span");
    why.textContent = entry.advice;
    item.append(who, why);
    list.append(item);
  });
}

// Statistikk-fanen: sesongens tall. Tabellen og terminlista rendres av sine
// egne funksjoner (renderLeagueSeasonPanel / renderMiniSeason) — de flyttet bare
// hit fra en popup på Kontor. Dette er spillerdelen.
let playerStatsSort = "goals";

function renderPlayerStats() {
  const rows = Array.isArray(state.playerSeasonStats?.rows) ? state.playerSeasonStats.rows : [];
  const summary = summarizePlayerStats(rows);

  // Plassering og styremål lå i «Klubben din»-boksen på Kontor. De hører her,
  // ved siden av tabellen de leses av.
  if (elements.statsStanding) {
    let standing = "Ikke startet";
    if (isLeagueSeasonActive() && state.leagueSeason) {
      const table = createLeagueTable(state.leagueSeason);
      const managerRow = Array.isArray(table) ? table.find((row) => row.isManager) : null;
      if (managerRow) standing = `${managerRow.position}. plass · ${managerRow.points} poeng`;
    }
    elements.statsStanding.textContent = standing;
  }
  if (elements.statsBoardGoal) elements.statsBoardGoal.textContent = getLeagueSaveModel().boardExpectation;

  if (elements.statsMatches) elements.statsMatches.textContent = String(summary.matches);
  if (elements.statsGoals) elements.statsGoals.textContent = String(summary.totalGoals);
  if (elements.statsAssists) elements.statsAssists.textContent = String(summary.totalAssists);
  if (elements.statsTopScorer) {
    elements.statsTopScorer.textContent = summary.topScorer
      ? `${summary.topScorer.name} (${summary.topScorer.goals})`
      : "–";
  }
  if (elements.statsSummary) {
    elements.statsSummary.textContent = summary.matches === 0
      ? "Ingen kamper spilt ennå. Statistikken fylles etter hvert som du spiller."
      : summary.topAssist
        ? `${summary.matches} kamper spilt. ${summary.topScorer?.name || "Ingen"} leder scoringslista, ${summary.topAssist.name} leder på målgivende.`
        : `${summary.matches} kamper spilt.`;
  }

  const container = elements.playerStatsTable;
  if (!container) return;
  container.textContent = "";

  if (rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Ingen spillerstatistikk ennå. Spill en kamp, så føres kamper, mål og målgivende her.";
    container.append(empty);
    return;
  }

  const table = document.createElement("table");
  table.className = "stats-table";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["#", "Spiller", "Pos", "K", "Min", "M", "A", "M+A"].forEach((label) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    headRow.append(th);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  rankPlayerStats(rows, { sortBy: playerStatsSort }).forEach((row, index) => {
    const tr = document.createElement("tr");
    const cells = [
      String(index + 1),
      row.name,
      row.position || "–",
      String(row.appearances),
      String(row.minutes ?? row.appearances * 90),
      String(row.goals),
      String(row.assists),
      String(row.points)
    ];
    cells.forEach((value, cellIndex) => {
      const cell = document.createElement(cellIndex === 1 ? "th" : "td");
      if (cellIndex === 1) cell.scope = "row";
      cell.textContent = value;
      tr.append(cell);
    });
    body.append(tr);
  });

  table.append(head, body);
  container.append(table);
}

function initPlayerStatsSort() {
  document.querySelectorAll("[data-stats-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      playerStatsSort = button.dataset.statsSort || "goals";
      document.querySelectorAll("[data-stats-sort]").forEach((other) => {
        other.classList.toggle("is-active", other === button);
      });
      renderPlayerStats();
    });
  });
}

// Analyse-fanen: ettertanken etter kampen. Kamprapporten er den samme som på
// Kamp-flaten — Analyse er stedet du går tilbake til den, ikke en ny beregning.
function renderAnalyse() {
  const container = elements.analyseMatchReport;
  if (!container) return;

  container.textContent = "";

  const lastMatch = state.matchday?.lastMatch || null;
  if (!lastMatch) {
    const empty = document.createElement("p");
    empty.className = "matchday-empty muted-text";
    empty.textContent = "Ingen kamp spilt ennå. Spill en kamp under Kamp, så ligger hele forklaringen her etterpå.";
    container.append(empty);
    return;
  }

  renderMatchdayReport(container, lastMatch);
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
// Hver klubbukefase hører til en flate i menyen. Uten denne koblingen var
// ukerytmen i Kontor bare en stripe med ord.
const CLUB_WEEK_PHASE_TABS = Object.freeze({
  analysis: "analyse",
  inbox: "inbox",
  training: "trening",
  match_prep: "tactics",
  matchday: "kamp",
  review: "statistikk"
});

const CLUB_WEEK_PHASE_TAB_LABELS = Object.freeze({
  analyse: "Analyse",
  inbox: "Assistentråd",
  trening: "Trening",
  tactics: "Taktikk",
  kamp: "Kamp",
  statistikk: "Statistikk"
});

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
    // Fasene skal SENDE deg et sted. Ukerytmen sto som ren pynt i Kontor: den
    // fortalte hvor du var i uka, men å trykke på den gjorde ingenting — og da
    // er den bare et skilt uten dør. Hver fase har en flate der arbeidet
    // faktisk gjøres; nå er steget knappen dit.
    const target = CLUB_WEEK_PHASE_TABS[entry.phase];
    const label = document.createElement(target ? "button" : "span");
    label.className = "club-week-step-label";
    label.textContent = entry.label;
    if (target) {
      label.type = "button";
      label.dataset.tabTarget = target;
      label.title = entry.guidance
        ? `${entry.guidance} — åpne ${CLUB_WEEK_PHASE_TAB_LABELS[target] || target}`
        : `Åpne ${CLUB_WEEK_PHASE_TAB_LABELS[target] || target}`;
      label.addEventListener("click", () => activateTab(target));
    } else if (entry.guidance) {
      label.title = entry.guidance;
    }
    item.append(label);
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

  // Faseporten forklares her, men kan bare utføres via «Neste handling».
  if (elements.clubWeekGateHint) {
    const gate = getClubWeekMatchdayGate();
    elements.clubWeekGateHint.textContent = gate.isBlocked
      ? gate.reason
      : "Neste grep styres av «Neste handling».";
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
  acknowledgeInboxThisWeek();

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

  // Valgfri uke-vindusgating (Innboks-datavask v2): en melding kan bindes til et
  // ukevindu med minWeek/maxWeek. Onboarding-meldinger pinnes f.eks. til uke 1
  // (maxWeek: 1) så de ikke dukker opp igjen senere. Uten feltene er meldingen
  // ukenøytral, som før.
  const week = Number(state.clubWeekState?.week) || 1;
  if (Number.isFinite(message.minWeek) && week < message.minWeek) {
    return false;
  }
  if (Number.isFinite(message.maxWeek) && week > message.maxWeek) {
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

// Innboks-kuratering v2: hver uke skal «Viktig nå» være FÅ, relevante signaler
// — ikke hele katalogen på én gang. De statiske trådene er kun fase-gatet, så
// uten kuratering ville alle fase-tråder dukket opp hver uke. Første uke er ett
// tydelig onboarding-signal; senere uker løftes et lite prioritert utvalg. Delt
// regel for visning (renderInboxThreads) og telleverk (puls, «Neste handling»),
// slik at flaten aldri krever mer lesing enn den viser.
function getInboxWeeklyCap() {
  return (Number(state.clubWeekState?.week) || 1) === 1 ? 1 : 3;
}

// Har spilleren kvittert ut ukas innbokssignal? Settes eksplisitt per uke når en
// tråd leses/besvares (acknowledgeInboxThisWeek). Rulles automatisk ut når uka
// bytter, slik at ferske signaler løftes hver ny uke — i motsetning til den
// globale lest-historikken, som ellers ville «kvittert ut» alle senere uker.
function hasAcknowledgedInboxThisWeek() {
  return Number(state.inboxAcknowledgedWeek) === (Number(state.clubWeekState?.week) || 1);
}

function loadInboxAcknowledgedWeek() {
  try {
    const raw = Number(localStorage.getItem(INBOX_ACK_WEEK_KEY));
    return Number.isFinite(raw) && raw > 0 ? Math.trunc(raw) : 0;
  } catch (error) {
    return 0;
  }
}

function acknowledgeInboxThisWeek() {
  const week = Number(state.clubWeekState?.week) || 1;
  state.inboxAcknowledgedWeek = week;
  try {
    localStorage.setItem(INBOX_ACK_WEEK_KEY, String(week));
  } catch (error) {
    // Privat modus e.l.: kuratering fungerer fortsatt innen økta.
  }
  // Club Week Orchestrator v1.1: håndtert innboks nudger uka til Trening-fasen,
  // så toppstripa speiler det spilleren nettopp gjorde. Gate-sikkert; fire-and-
  // forget siden kalleren allerede rendrer.
  syncClubWeekPhaseToProgress().catch(console.error);
}

// Uleste tråder som faktisk KREVER oppmerksomhet nå: opptil ukas kvote, og null
// så snart spilleren har kvittert ut uka. Resten ligger som «kan leses senere»
// og sperrer aldri veien til trening eller kamp.
function getInboxAttentionCount() {
  if (hasAcknowledgedInboxThisWeek()) return 0;
  const total = getActiveInboxThreads().length + getUnreadInboxEventCount(getInboxState());
  return Math.min(getInboxWeeklyCap(), total);
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

function inboxThreadRequiresReply(threadGroup) {
  return Boolean(threadGroup?.messages?.some((message) => {
    const messageId = message?.id;
    return typeof messageId === "string"
      && getChoicesForMessage(messageId).length > 0
      && !getSelectedChoiceForMessage(messageId);
  }));
}

function getInboxThreadPriorityScore(threadGroup) {
  const subject = `${threadGroup?.thread?.subject || ""} ${threadGroup?.latestMessage?.title || ""}`.toLowerCase();
  let score = 0;
  if (inboxThreadRequiresReply(threadGroup)) score += 30;
  if (/assistent|kampnotat|trening|taktisk|fysio|belast|slitasje|garderobe|moral|styre/.test(subject)) score += 20;
  score += Math.min(10, threadGroup?.unreadMessages?.length || 0);
  return score;
}

function updateInboxSignalGate({ visibleEventActive, visibleActiveThreads }) {
  // Teller TRÅDER (ikke enkeltmeldinger), i tråd med etiketten «Uleste tråder»,
  // og følger samme ukekvote som pulsen og «Neste handling». «Krever svar»
  // teller kun tråder som faktisk vises nå, så tallet aldri peker på tråder
  // spilleren ikke ser.
  const unreadCount = getInboxAttentionCount();
  // Avsendere som venter på et svar akkurat nå — brukt både til «Krever svar»-
  // tallet og til å navngi hvem som venter i statuslinjen.
  const replySenders = [
    ...visibleEventActive
      .filter((thread) => thread.status !== "resolved" && thread.choices?.length)
      .map((thread) => thread.sender || INBOX_EVENT_SENDER_ROLES[thread.type] || "Klubben"),
    ...visibleActiveThreads
      .filter(inboxThreadRequiresReply)
      .map((threadGroup) => threadGroup.sender?.name || threadGroup.latestMessage?.from || "Klubbkontoret")
  ];
  const requiresReplyCount = replySenders.length;

  if (elements.inboxSignalUnread) elements.inboxSignalUnread.textContent = String(unreadCount);
  // «Krever svar» peker på avsenderen som venter, ikke bare et tall.
  if (elements.inboxSignalReplies) {
    elements.inboxSignalReplies.textContent = requiresReplyCount === 0
      ? "0"
      : requiresReplyCount === 1
        ? `1 · ${replySenders[0]}`
        : `${requiresReplyCount} · ${formatSenderList(replySenders)}`;
  }
  if (elements.inboxSignalStatus) {
    const visibleCount = visibleEventActive.length + visibleActiveThreads.length;
    if (unreadCount <= 0) {
      elements.inboxSignalStatus.textContent = "Ingen kritiske signaler nå";
    } else if (requiresReplyCount > 0) {
      elements.inboxSignalStatus.textContent =
        `${formatSenderList(replySenders)} venter på et svar før du går til trening.`;
    } else {
      elements.inboxSignalStatus.textContent =
        `${visibleCount === 1 ? "Ett tydelig signal" : `${visibleCount} viktige signaler`} er nok før du går til trening.`;
    }
  }
}

// Kort norsk oppramsing av avsendere: «Styret», «Styret og Fysio», «Styret,
// Fysio og Lagkaptein». Dedupliserer så samme avsender ikke gjentas.
function formatSenderList(senders) {
  const unique = [...new Set(senders.filter(Boolean))];
  if (unique.length === 0) return "Ingen";
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} og ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")} og ${unique[unique.length - 1]}`;
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
      acknowledgeInboxThisWeek();
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
  acknowledgeInboxThisWeek();
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
  acknowledgeInboxThisWeek();
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
  // thread.sender er allerede en lesbar avsenderetikett («Assistenttrener»,
  // «Styret», «Lagkaptein»). Type/kategori vises i egen tag under, så vi dropper
  // det gamle «Rolle: Avsender»-prefikset som doblet etiketten
  // («Assistenttrener: Assistenttrener», «Styret: Styret»).
  from.textContent = thread.sender || INBOX_EVENT_SENDER_ROLES[thread.type] || "Klubben";

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

// Render Innboks som en beslutningsflate: én aktiv sak i fokus, resten i en
// kort kø og levert/løst innhold i historikken. Samme tråd- og valgmodeller som
// før; dette endrer bare prioritering og presentasjon.
function createInboxCandidate(kind, payload) {
  if (kind === "event") {
    return {
      kind,
      payload,
      id: payload.id,
      title: payload.title || "Ny sak",
      sender: payload.sender || INBOX_EVENT_SENDER_ROLES[payload.type] || "Klubbkontoret",
      requiresReply: payload.status !== "resolved" && Array.isArray(payload.choices) && payload.choices.length > 0
    };
  }
  return {
    kind,
    payload,
    id: getThreadGroupId(payload),
    title: payload.latestMessage?.title || payload.thread?.subject || "Ny tråd",
    sender: payload.sender?.name || payload.latestMessage?.from || "Klubbkontoret",
    requiresReply: inboxThreadRequiresReply(payload)
  };
}

function appendInboxCandidate(container, candidate, { open = false, showReadButton = false, archived = false } = {}) {
  if (!container || !candidate) return;
  if (candidate.kind === "event") {
    container.append(createInboxEventThreadCard(candidate.payload, { open, archived }));
    return;
  }
  container.append(createInboxThreadCard(candidate.payload, { open, showReadButton }));
}

function renderInboxThreads() {
  const focusContainer = elements.inboxThreadList;
  const queueContainer = elements.inboxQueueList;
  const archiveContainer = elements.inboxThreadArchive;
  const inboxState = getInboxState();
  const eventActive = getActiveInboxEventThreads(inboxState);
  const eventArchived = getArchivedInboxEventThreads(inboxState);
  const activeThreads = getActiveInboxThreads();

  const priorityWeight = { urgent: 4, critical: 4, high: 3, medium: 2, low: 1 };
  const sortedEventActive = [...eventActive].sort((a, b) => ((priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1)));
  const sortedActiveThreads = [...activeThreads].sort((a, b) => getInboxThreadPriorityScore(b) - getInboxThreadPriorityScore(a));
  const allCandidates = [
    ...sortedEventActive.map((thread) => createInboxCandidate("event", thread)),
    ...sortedActiveThreads.map((threadGroup) => createInboxCandidate("static", threadGroup))
  ].filter((candidate) => candidate.id);

  const cap = getInboxWeeklyCap();
  const signalHandled = hasAcknowledgedInboxThisWeek();
  const attentionCandidates = signalHandled ? [] : allCandidates.slice(0, cap);
  const selectedCandidate = allCandidates.find((candidate) => candidate.id === state.openInboxThreadId) || null;
  const focusCandidate = selectedCandidate || attentionCandidates[0] || null;
  const queueCandidates = allCandidates.filter((candidate) => candidate.id !== focusCandidate?.id).slice(0, 6);

  const visibleEventActive = attentionCandidates.filter((candidate) => candidate.kind === "event").map((candidate) => candidate.payload);
  const visibleActiveThreads = attentionCandidates.filter((candidate) => candidate.kind === "static").map((candidate) => candidate.payload);
  updateInboxSignalGate({ eventActive, activeThreads, visibleEventActive, visibleActiveThreads });

  if (focusContainer) {
    focusContainer.textContent = "";
    if (focusCandidate) {
      appendInboxCandidate(focusContainer, focusCandidate, { open: true, showReadButton: true });
      if (elements.inboxFocusTitle) elements.inboxFocusTitle.textContent = focusCandidate.title;
      if (elements.inboxFocusStatus) {
        elements.inboxFocusStatus.textContent = focusCandidate.requiresReply ? `${focusCandidate.sender} venter på svar` : `${focusCandidate.sender} ber om oppmerksomhet`;
        elements.inboxFocusStatus.dataset.tone = focusCandidate.requiresReply ? "attention" : "neutral";
      }
    } else {
      const title = signalHandled ? "Ukas signal er håndtert" : "Innboksen er rolig";
      focusContainer.append(createMessageCard({
        from: "Klubbkontoret",
        tag: "Ingen aktiv sak",
        title,
        body: signalHandled
          ? `Du har håndtert ukas viktigste signal. Neste steg er ${state.weeklyTrainingProgram?.programId || state.weeklyTrainingFocus?.focusId ? "kampdagen" : "å velge treningsuke"}.`
          : "Det er ingen aktive uleste tråder akkurat nå."
      }, true));
      if (elements.inboxFocusTitle) elements.inboxFocusTitle.textContent = title;
      if (elements.inboxFocusStatus) {
        elements.inboxFocusStatus.textContent = "Ingen beslutning venter";
        elements.inboxFocusStatus.dataset.tone = "positive";
      }
    }
  }

  if (queueContainer) {
    queueContainer.textContent = "";
    queueCandidates.forEach((candidate) => appendInboxCandidate(queueContainer, candidate, { open: false, showReadButton: false }));
  }
  if (elements.inboxQueuePanel) elements.inboxQueuePanel.hidden = queueCandidates.length === 0;
  if (elements.inboxQueueCount) elements.inboxQueueCount.textContent = String(queueCandidates.length);

  if (archiveContainer) {
    archiveContainer.textContent = "";
    queueCandidates.forEach((candidate) => appendInboxCandidate(archiveContainer, candidate, {
      open: candidate.id === state.openInboxThreadId,
      showReadButton: false,
      archived: candidate.kind === "event"
    }));
    eventArchived.slice(-12).forEach((thread) => archiveContainer.append(createInboxEventThreadCard(thread, { archived: true, open: thread.id === state.openInboxThreadId })));
    const archivedThreads = getArchivedInboxThreads();
    archivedThreads.slice(0, 12).forEach((threadGroup) => archiveContainer.append(createInboxThreadCard(threadGroup, { showReadButton: false, open: getThreadGroupId(threadGroup) === state.openInboxThreadId })));
    if (!queueCandidates.length && !eventArchived.length && !archivedThreads.length) {
      archiveContainer.append(createMessageCard({ from: "Klubbkontoret", tag: "Historikk", title: "Ingen trådhistorikk ennå", body: "Leste, besvarte og arkiverte saker dukker opp her." }, true));
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
  const players = getPlayerPoolPlayers();

  if (elements.unlockedPlayersStatus) {
    // Landslagsspillere speidet på en landslagsarena (Ullevaal/Maracanã) kan
    // ikke signeres til klubblaget – si det tydelig i stedet for å la
    // spilleren lure på hvorfor besøket «ikke ga noe».
    const snapshot = getAvailability();
    const scouted = snapshot.nationalOnlyPlayerIds?.size || 0;
    const scoutedNote = scouted > 0
      ? ` ${scouted} landslagsspiller${scouted === 1 ? "" : "e"} er speidet på landslagsarena – de kan bare signeres via et klubbanlegg.`
      : "";
    // Quiz-porten: besøkt stedet, men ikke tatt quizen ennå.
    const pending = snapshot.quizPendingPlayerIds?.size || 0;
    const pendingNote = pending > 0
      ? ` ${pending} spiller${pending === 1 ? "" : "e"} venter på at du tar quizen på stedet i History Go.`
      : "";
    if (players.length > 0) {
      elements.unlockedPlayersStatus.textContent = `Min spillerpool: ${players.length} spillere du kan velge til troppen.${pendingNote}${scoutedNote}`;
    } else {
      elements.unlockedPlayersStatus.textContent =
        `Ingen klubbspillere ennå. Besøk/synk et klubbanlegg (Intility, Lerkendal, Brann, Aspmyra, Åråsen, Aker eller Nadderud).${pendingNote}${scoutedNote}`;
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

    if (Number.isFinite(player.classHeight)) {
      appendUnlockMeta(card, `Overall: ${player.classHeight}`);
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
    renderUnlockEmpty(list, "Ingen utviklingsprogrammer er innen rekkevidde ennå.");
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

  // Tallet i utviklingsflatas hero. Settes her, der badgene faktisk telles.
  if (elements.progressionBadgeCount) {
    elements.progressionBadgeCount.textContent = String(badges.length);
  }

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

// Badge-uke-status og aktive badge-progresjoner i History Go-fanen.
function renderHgTrainingWeek() {
  if (elements.hgTrainingWeekStatus) {
    const week = Number.isInteger(state.teamMerits?.activeTrainingWeek)
      ? state.teamMerits.activeTrainingWeek
      : 1;
    elements.hgTrainingWeekStatus.textContent = `Utviklingsuke ${week}`;
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

  appendIdentityRecommendation(card, "Utviklingsprogrammer", Array.from(programNames));
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
  const readiness = getAvailability().rosterReadiness;
  const shouldShowChoices = !localStart.enabled && !readiness.hasEnoughUnlocked;
  const shouldShowReady = readiness.hasEnoughUnlocked;

  if (elements.startModePanel) {
    elements.startModePanel.hidden = !localStart.enabled && !shouldShowChoices && !shouldShowReady;
  }
  if (elements.startModeChoices) {
    elements.startModeChoices.hidden = !shouldShowChoices;
  }
  if (elements.startModeRosterNeed) {
    elements.startModeRosterNeed.textContent =
      `Du trenger ${REQUIRED_SQUAD_SIZE} spillere for å starte managerløkken: ` +
      `${REQUIRED_STARTERS} startere + ${REQUIRED_BENCH} benk. ` +
      `Akkurat nå har du ${readiness.unlockedCount}/${REQUIRED_SQUAD_SIZE}.`;
  }
  if (elements.activeLocalStart) {
    elements.activeLocalStart.hidden = !localStart.enabled;
  }
  if (elements.playableSquadReady) {
    elements.playableSquadReady.hidden = !shouldShowReady;
  }

  elements.localStartStatus.textContent = state.localStartMessage ||
    (localStart.enabled
      ? `Starttropp aktiv: ${localStart.playerIds.length} spillere.`
      : shouldShowReady
        ? "Troppen er spillbar. Neste steg er Lag & taktikk."
        : "Velg hvordan managerkarrieren skal starte.");

  if (elements.clearLocalStart) {
    elements.clearLocalStart.disabled = !localStart.enabled;
  }
}

// Din fotballsamling: oppsummering av hva samlingen gir laget akkurat nå.
// Leser kun availability-snapshotet (getAvailability) – steder, spillere, stab,
// ulåste formasjoner og roster readiness. Beregner ingen egne unlocks.
function renderCollectionSummary(teamFit) {
  if (!elements.collectionPlacesCount) {
    return;
  }

  const snapshot = getAvailability();
  const readiness = snapshot.rosterReadiness;
  const matchdayReadiness = getMatchdayReadiness(teamFit);

  elements.collectionPlacesCount.textContent = String(snapshot.unlockedPlaceIds.size);
  if (elements.collectionPlayersCount) {
    elements.collectionPlayersCount.textContent = String(snapshot.playerPoolPlayers.length);
  }
  if (elements.collectionStaffCount) {
    elements.collectionStaffCount.textContent = String(snapshot.unlockedStaff.length);
  }
  if (elements.collectionFormationsCount) {
    // Alle formasjoner er spillbare; telleren viser hvor mange du har SAMLET/
    // oppdaget via History Go (discovery), ikke hvor mange som er spillbare.
    elements.collectionFormationsCount.textContent =
      `${snapshot.collectedFormations.length}/${state.formations.length}`;
  }

  if (elements.collectionMatchdayBadge) {
    elements.collectionMatchdayBadge.dataset.ready = matchdayReadiness.canStartMatch ? "true" : "false";
    elements.collectionMatchdayBadge.dataset.status = matchdayReadiness.status;
    elements.collectionMatchdayBadge.textContent = matchdayReadiness.status === "in_progress"
      ? "Kamp pågår"
      : matchdayReadiness.canStartMatch
        ? "Kampklar"
        : "Ikke kampklar";
    elements.collectionMatchdayBadge.title = matchdayReadiness.summary;
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
      nextStep = "Troppen er spillbar. Neste steg: Lag & taktikk.";
    }
    elements.collectionNextStep.textContent = nextStep;
  }
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
function getSquadSetupGateState(teamFit) {
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const readiness = getAvailability().rosterReadiness;
  const missingRole = assignments.find((item) => item.player && !item.role) || null;
  const emptySlot = assignments.find((item) => !item.player || !item.role) || null;
  const misused = assignments.find((item) => item.player && item.fit?.status === "feilbrukt") || null;
  const duplicateIds = new Set((teamFit?.duplicatePlayers || []).map((player) => player.id));
  const duplicate = assignments.find((item) => item.player && duplicateIds.has(item.player.id)) || null;
  const duplicateCount = Array.isArray(teamFit?.duplicatePlayers) ? teamFit.duplicatePlayers.length : 0;
  const misusedCount = assignments.filter((item) => item.player && item.fit?.status === "feilbrukt").length;
  const completeStarters = Number(teamFit?.completeCount) || 0;

  // Ingen spillere låst opp ennå: «Fyll neste ledige plass» er en død handling
  // (det finnes ingen å sette inn). Led i stedet manageren dit troppen faktisk
  // skaffes — History Go-startmodus (bruk samlingen, velg startsted eller finn
  // nærmeste spillere). Uten dette møter en fersk spiller en tom bane med en
  // knapp som ikke gjør noe.
  if (readiness.unlockedCount === 0) {
    return {
      title: "Skaff en starttropp",
      hint: "Du har ingen spillere ennå. Skaff en spillbar tropp i History Go — bruk samlingen din, velg et offentlig startsted eller finn de nærmeste spillerne.",
      actionLabel: "Skaff spillere i History Go",
      action: () => activateTab("historygo"),
      tone: "needs-work",
      completeStarters,
      benchCount: readiness.benchCount,
      rolesOk: !missingRole,
      misusedCount,
      duplicateCount
    };
  }

  if (emptySlot) {
    return {
      title: completeStarters > 0 ? "Fyll neste ledige plass" : "Sett opp laget",
      hint: `Startelleveren mangler ${Math.max(0, (teamFit?.totalSlots || REQUIRED_STARTERS) - completeStarters)} plass${(teamFit?.totalSlots || REQUIRED_STARTERS) - completeStarters === 1 ? "" : "er"}. Velg spiller og rolle — alle spillere er gode nok når treneren forstår bruken.`,
      actionLabel: "Fyll neste ledige plass",
      action: fillNextEmptySlotAction(emptySlot.slot.slotId),
      tone: "needs-work",
      completeStarters,
      benchCount: readiness.benchCount,
      rolesOk: !missingRole,
      misusedCount,
      duplicateCount
    };
  }

  if (!readiness.hasEnoughBench) {
    return {
      title: "Legg minst 4 spillere på benken",
      hint: `Benk ${Math.min(readiness.benchCount, REQUIRED_BENCH)}/${REQUIRED_BENCH}. La minst ${readiness.missingBench} opplåst spiller stå utenfor startelleveren som kampklar reserve.`,
      actionLabel: "Vis benken",
      action: () => elements.rosterReadinessNote?.scrollIntoView({ behavior: "smooth", block: "center" }),
      tone: "needs-work",
      completeStarters,
      benchCount: readiness.benchCount,
      rolesOk: !missingRole,
      misusedCount,
      duplicateCount
    };
  }

  if (misused) {
    return {
      title: `Rett rolle/posisjon for ${misused.player.name}`,
      hint: `${misused.player.name} har feil rolle i ${misused.slot.label}. Juster bruken — spilleren passer bedre når rollen stemmer med styrkene.`,
      actionLabel: "Rett rolle/posisjon",
      action: selectSlotDecision(misused.slot.slotId),
      tone: "needs-work",
      completeStarters,
      benchCount: readiness.benchCount,
      rolesOk: !missingRole,
      misusedCount,
      duplicateCount
    };
  }

  if (duplicate) {
    return {
      title: `Rett dobbeltbruk av ${duplicate.player.name}`,
      hint: `${duplicate.player.name} står på flere plasser. Velg en annen spiller slik at laget får balanse.`,
      actionLabel: "Rett dobbeltbruk",
      action: selectSlotDecision(duplicate.slot.slotId),
      tone: "needs-work",
      completeStarters,
      benchCount: readiness.benchCount,
      rolesOk: !missingRole,
      misusedCount,
      duplicateCount
    };
  }

  return {
    title: "Troppen er klar",
    hint: "Startelleveren og benken er klare. Laget blir først kampklart når trening, terminliste og klubbuke også er klare.",
    actionLabel: "Gå til Innboks",
    action: () => activateTab("inbox"),
    tone: "ready",
    completeStarters,
    benchCount: readiness.benchCount,
    rolesOk: true,
    misusedCount,
    duplicateCount
  };
}

function renderSquadSetupGate(teamFit) {
  if (!elements.squadSetupGate) return;
  const state = getSquadSetupGateState(teamFit);
  elements.squadSetupGate.dataset.ready = state.tone === "ready" ? "true" : "false";
  if (elements.squadSetupGateTitle) elements.squadSetupGateTitle.textContent = state.title;
  if (elements.squadSetupGateHint) elements.squadSetupGateHint.textContent = state.hint;
  if (elements.squadGateStarters) elements.squadGateStarters.textContent = `${Math.min(state.completeStarters, REQUIRED_STARTERS)}/${REQUIRED_STARTERS}`;
  if (elements.squadGateBench) elements.squadGateBench.textContent = `${Math.min(state.benchCount, REQUIRED_BENCH)}/${REQUIRED_BENCH}`;
  if (elements.squadGateRoles) {
    elements.squadGateRoles.textContent = state.rolesOk ? "OK" : "Trenger valg";
    elements.squadGateRoles.dataset.tone = state.rolesOk ? "ok" : "warn";
  }
  if (elements.squadGateMisuse) {
    elements.squadGateMisuse.textContent = state.misusedCount === 0 ? "0" : String(state.misusedCount);
    elements.squadGateMisuse.dataset.tone = state.misusedCount === 0 ? "ok" : "warn";
  }
  if (elements.squadGateDuplicates) {
    elements.squadGateDuplicates.textContent = state.duplicateCount === 0 ? "0" : String(state.duplicateCount);
    elements.squadGateDuplicates.dataset.tone = state.duplicateCount === 0 ? "ok" : "warn";
  }
  if (elements.squadSetupGateAction) {
    elements.squadSetupGateAction.textContent = state.actionLabel;
    elements.squadSetupGateAction.disabled = typeof state.action !== "function";
    elements.squadSetupGateAction.onclick = typeof state.action === "function" ? state.action : null;
  }
}

function renderRosterReadiness() {
  const readiness = getAvailability().rosterReadiness;

  if (elements.rosterReadyCount) {
    elements.rosterReadyCount.textContent = `${readiness.unlockedCount}/${REQUIRED_SQUAD_SIZE}`;
  }
  if (elements.rosterUnlockedCount) {
    elements.rosterUnlockedCount.textContent = `${readiness.unlockedCount}/${REQUIRED_SQUAD_SIZE}`;
  }
  if (elements.rosterReadyStatus) {
    elements.rosterReadyStatus.textContent = readiness.isReady ? "Troppen er klar" : "Troppen mangler spillere";
  }

  if (elements.rosterReadinessBadge) {
    elements.rosterReadinessBadge.textContent = readiness.isReady ? "Tropp klar" : "Tropp ikke klar";
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
      ? "Troppen er klar: 11 på banen og minst 4 på benken. Kampklarhet krever også trening, aktiv kamp og riktig klubbukefase."
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
    empty.textContent = "Ingen kampklare benkespillere ennå. Hent flere spillere via History Go eller lokal starttropp.";
    list.append(empty);
    return;
  }

  players.slice(0, Math.max(REQUIRED_BENCH, 8)).forEach((player, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = index < REQUIRED_BENCH ? "bench-player-card is-registered" : "bench-player-card";
    card.addEventListener("click", () => setSelectedSlotPlayer(player.id));

    const name = document.createElement("strong");
    name.textContent = player.name || player.id;

    const meta = document.createElement("span");
    const positions = Array.isArray(player.naturalPositions) ? player.naturalPositions.join(", ") : "–";
    meta.textContent = `${positions} · ${index < REQUIRED_BENCH ? "Benk" : "Reserve"}`;

    card.append(name, meta);

    // Tilstanden hører hjemme DER du velger laget. Skjult slitasje er en felle,
    // ikke en avveining.
    const condition = conditionFor(getPlayerCondition(), player.id);
    if (isInjured(condition) || freshnessFor(condition) < 100) {
      const state_ = document.createElement("small");
      state_.className = `player-condition${isInjured(condition) ? " is-injured" : freshnessFor(condition) < 55 ? " is-tired" : ""}`;
      state_.textContent = describeCondition(condition);
      card.append(state_);
    }

    list.append(card);
  });
}

function renderApp() {
  // Fersk availability-beregning per render: én runtime-kilde for unlocks,
  // formasjonstilgjengelighet og roster readiness.
  invalidateAvailability();

  const teamFit = getTeamFit();

  // League Loop v0.2: sørg for at ligasesongen er startet FØR panelene leser
  // den, slik at «Neste kamp» i statuskortet og terminlista er i takt allerede
  // på renderen der troppen blir kampklar (ikke først på neste render).
  ensureLeagueSeason();

  renderControls();
  renderTeamSummary(teamFit);
  renderLineup(teamFit);
  renderDirectLineupEditor();
  renderSquadSetupGate(teamFit);
  renderRosterReadiness();
  renderTacticalSystemPanel();
  renderSidePanel(teamFit);
  renderLeagueOnboarding(teamFit);
  renderNextActionStrip(teamFit);
  renderDecisionCards(teamFit);
  renderSuggestedSetups(teamFit);
  renderContextPanel();
  renderReport(teamFit);
  renderBadgeEffects(teamFit);
  renderMatchday(teamFit);
  renderMiniSeason();
  renderLeagueSeason();
  renderWeeklyTrainingFocus(teamFit);
  renderTrainingProgramCompositions(teamFit);
  // Ukens plan må rendres ETTER programkomposisjonene: de setter valgt-tilstand
  // og kontekstboksene som planen leser.
  renderIndividualTraining();
  renderPlayerWeaknesses(teamFit);
  renderWeeklyTrainingPlan();

  renderTrainingWeekCounters();
  renderManagerEngineBridge(teamFit);
  renderManagerDetailFromTeamFit(teamFit);
  renderAnalyse();
  renderPlayerStats();
  renderSquadCondition();
  renderScenarioList();
  renderSeasonReview();
  renderClubWeek().catch(console.error);
  refreshInboxEvents(teamFit);
  renderInboxThreads();
  renderDepartments();
  renderOfficeScene(teamFit);

  // History Go-unlocks (v1): sted → person → ekspertise → program → badge → lagklasse.
  renderHistoryGoSyncStatus();
  renderCollectionSummary(teamFit);
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
  renderGameModeStatus(teamFit);
  renderModeIsolation();

  // Persist only the active namespace. Visiting a secondary mode therefore
  // cannot overwrite the league snapshot, even though all modes reuse the
  // same lineup, training, matchday and mini-season engines in memory.
  if (state.modeEnvelope) {
    state.modeEnvelope.sessions[state.modeEnvelope.activeMode] = captureModeSession(state);
    try { state.modeEnvelope = persistModeEnvelope(localStorage, state.modeEnvelope); } catch (_) { /* memory-only */ }
  }
}

function bindEvents() {
  bindFormationAndTacticControls();
  bindTrainingWorkspaceControls();
  bindTrainingAndKnowledgeControls();
  bindTeamMeritsControls();
  bindLocalStartControls();
  bindHistoryGoSyncControls();
  bindMatchdayControls();
  bindGameModeControls();
  bindModals();
  bindSettings();
  bindFormationLibraryApply();
  bindOnboardingClub();
}

// «Velg troppen din» (draft): spilleren setter sammen sin egen starttropp fra
// grunnsjiktet av klubbspillere. Erstatter auto-fyll som hovedvei — men
// «Fyll resten» sikrer at ingen står fast. De store navnene er ikke i poolen;
// de samles i History Go.
function bindSquadDraft() {
  const poolEl = document.querySelector("#draftPool");
  const countEl = document.querySelector("#draftCount");
  const posEl = document.querySelector("#draftPositions");
  const confirmButton = document.querySelector("#draftConfirm");
  const fillButton = document.querySelector("#draftFillRest");
  if (!poolEl) return;

  const selected = new Set();

  const renderDraft = () => {
    const pool = getDraftPoolPlayers();
    if (countEl) countEl.textContent = `${selected.size}/${REQUIRED_SQUAD_SIZE} valgt`;
    if (posEl) {
      const counts = {};
      pool.forEach((player) => {
        if (!selected.has(player.id)) return;
        (player.naturalPositions || []).slice(0, 1).forEach((pos) => {
          counts[pos] = (counts[pos] || 0) + 1;
        });
      });
      const summary = Object.entries(counts).map(([pos, n]) => `${pos} ${n}`).join(" · ");
      posEl.textContent = summary || "Dekk keeper, forsvar, midtbane og angrep.";
    }
    if (confirmButton) confirmButton.disabled = selected.size !== REQUIRED_SQUAD_SIZE;

    poolEl.replaceChildren();
    pool.forEach((player) => {
      const isOn = selected.has(player.id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = `draft-card${isOn ? " is-selected" : ""}`;
      card.setAttribute("aria-pressed", isOn ? "true" : "false");
      const pos = document.createElement("span");
      pos.className = "draft-card-pos";
      pos.textContent = (player.naturalPositions || [])[0] || "–";
      const name = document.createElement("strong");
      name.textContent = player.name;
      const meta = document.createElement("small");
      meta.textContent = `${player.classHeight} · ${(player.preferredRoles || []).slice(0, 2).join(", ")}`;
      card.append(pos, name, meta);
      card.addEventListener("click", () => {
        if (selected.has(player.id)) selected.delete(player.id);
        else if (selected.size < REQUIRED_SQUAD_SIZE) selected.add(player.id);
        renderDraft();
      });
      poolEl.append(card);
    });
  };

  // Åpning: nullstill valget og bygg poolen på nytt.
  document.querySelector("#autoFillSquad")?.addEventListener("click", () => {
    selected.clear();
    renderDraft();
  });

  fillButton?.addEventListener("click", () => {
    // Fyll resten med posisjonsbalanserte kandidater, så ingen står fast.
    getStarterSquadPlayerIds(REQUIRED_SQUAD_SIZE).forEach((playerId) => {
      if (selected.size < REQUIRED_SQUAD_SIZE) selected.add(playerId);
    });
    renderDraft();
  });

  confirmButton?.addEventListener("click", () => {
    if (selected.size !== REQUIRED_SQUAD_SIZE) return;
    activateStarterSquad([...selected]);
    document.querySelectorAll(".modal-overlay:not([hidden])").forEach((m) => { m.hidden = true; });
    document.body.classList.remove("has-modal-open");
  });
}

// Onboarding steg 2: opprett klubben (navn + valgfritt managernavn). Setter
// klubbidentiteten eksplisitt i gameStartState og starter ligaspillet.
function bindOnboardingClub() {
  const nameInput = document.querySelector("#onboardingClubName");
  const managerInput = document.querySelector("#onboardingManagerName");
  const errorEl = document.querySelector("#onboardingClubNameError");
  const createButton = document.querySelector("#onboardingCreateClub");
  const backButton = document.querySelector("#onboardingClubBack");

  backButton?.addEventListener("click", () => {
    if (errorEl) errorEl.hidden = true;
    showOnboardingModeStep();
  });

  // To veier inn: lag din egen klubb, eller ta over en som finnes. Klubblista
  // er DATA — den bygges av football-club-selection.js fra pyramiden, aldri
  // hardkodet i markupen.
  const ownTab = document.querySelector("#onboardingClubModeOwn");
  const takeoverTab = document.querySelector("#onboardingClubModeTakeover");
  const ownPanel = document.querySelector("#onboardingOwnClubPanel");
  const takeoverPanel = document.querySelector("#onboardingTakeoverPanel");
  const listEl = document.querySelector("#onboardingClubList");
  const searchEl = document.querySelector("#onboardingClubSearch");
  const summaryEl = document.querySelector("#onboardingClubSummary");
  let takeoverMode = false;
  let selectedClubId = null;

  const renderClubList = () => {
    if (!listEl) return;
    const query = String(searchEl?.value || "").trim().toLowerCase();
    const groups = listSelectableClubs({
      clubs: state.leaguePyramid?.clubs || [],
      tiers: state.leaguePyramid?.tiers || [],
      profiles: state.leagueClubProfiles || {}
    });
    listEl.textContent = "";
    let shown = 0;
    for (const group of groups) {
      const matches = group.clubs.filter((club) => !query
        || club.name.toLowerCase().includes(query)
        || String(club.city || "").toLowerCase().includes(query)
        || group.tierName.toLowerCase().includes(query));
      if (matches.length === 0) continue;
      const heading = document.createElement("p");
      heading.className = "club-takeover-tier";
      heading.textContent = group.tierName;
      listEl.append(heading);
      for (const club of matches) {
        const option = document.createElement("button");
        option.type = "button";
        option.className = `club-takeover-option${club.id === selectedClubId ? " is-selected" : ""}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", club.id === selectedClubId ? "true" : "false");
        option.dataset.clubId = club.id;
        const title = document.createElement("strong");
        title.textContent = club.name;
        const detail = document.createElement("small");
        detail.textContent = [club.ground, club.shortLabel, club.expectationLabel ? `styret: ${club.expectationLabel.toLowerCase()}` : null]
          .filter(Boolean).join(" · ");
        option.append(title, detail);
        listEl.append(option);
        shown += 1;
      }
    }
    if (shown === 0) {
      const empty = document.createElement("p");
      empty.className = "club-takeover-tier";
      empty.textContent = (state.leaguePyramid?.clubs || []).length
        ? "Ingen klubber passer søket."
        : "Klubblista er ikke lastet ennå.";
      listEl.append(empty);
    }
  };

  const renderClubSummary = () => {
    if (!summaryEl) return;
    const club = (state.leaguePyramid?.clubs || []).find((entry) => entry.id === selectedClubId);
    const tier = (state.leaguePyramid?.tiers || []).find((entry) => entry.id === club?.tier);
    const summary = club && tier
      ? describeClubSelection({ club, tier, allClubs: state.leaguePyramid?.clubs || [], profile: state.leagueClubProfiles[club.id] || null })
      : null;
    summaryEl.hidden = !summary;
    summaryEl.textContent = "";
    if (!summary) return;
    const heading = document.createElement("strong");
    heading.textContent = `${summary.clubName} — ${summary.tierName}`;
    summaryEl.append(heading);
    if (summary.styleName) {
      const style = document.createElement("p");
      style.className = "muted-text";
      style.textContent = `${summary.styleName}${summary.era ? ` (${summary.era})` : ""}. ${summary.styleDescription || ""}`.trim();
      summaryEl.append(style);
    }
    const inherits = document.createElement("ul");
    for (const line of summary.inherits) {
      const item = document.createElement("li");
      item.textContent = line;
      inherits.append(item);
    }
    summaryEl.append(inherits);
    // Det viktigste å si tydelig FØR valget: hva du faktisk får av spillere.
    // Har du vært på klubbens bane, er klubbens historiske navn dine å velge
    // blant. Har du ikke det, får du en grunntropp og må samle resten selv.
    const access = getClubSquadAccess(club);
    const warning = document.createElement("p");
    warning.className = "muted-text club-takeover-warning";
    warning.textContent = access
      ? `${access.headline} ${access.detail}`
      : `Du arver ikke: ${summary.doesNotInherit[0]}`;
    summaryEl.append(warning);
    if (access?.heritage?.length) {
      const names = document.createElement("p");
      names.className = "muted-text club-takeover-warning";
      names.textContent = `Klubbens spillere: ${access.heritage.map((entry) => entry.name).join(", ")}.`;
      summaryEl.append(names);
    }
  };

  const setTakeoverMode = (next) => {
    takeoverMode = next;
    ownTab?.classList.toggle("is-active", !next);
    takeoverTab?.classList.toggle("is-active", next);
    ownTab?.setAttribute("aria-selected", next ? "false" : "true");
    takeoverTab?.setAttribute("aria-selected", next ? "true" : "false");
    if (ownPanel) ownPanel.hidden = next;
    if (takeoverPanel) takeoverPanel.hidden = !next;
    if (errorEl) errorEl.hidden = true;
    if (next) { renderClubList(); renderClubSummary(); }
  };

  ownTab?.addEventListener("click", () => setTakeoverMode(false));
  takeoverTab?.addEventListener("click", () => setTakeoverMode(true));
  searchEl?.addEventListener("input", renderClubList);
  listEl?.addEventListener("click", (event) => {
    const option = event.target.closest(".club-takeover-option");
    if (!option) return;
    selectedClubId = option.dataset.clubId;
    renderClubList();
    renderClubSummary();
    // Oppsummeringen skyver «Start klubben» under skjermkanten på en telefon
    // (målt: knappen havnet på y=1255 i et 930px vindu). Kortet SCROLLER, så
    // det er ingen blindvei — men den som nettopp valgte klubb skal slippe å
    // lete etter knappen.
    document.querySelector("#onboardingCreateClub")?.scrollIntoView({ block: "nearest" });
  });

  const createClub = () => {
    const managerName = String(managerInput?.value || "").trim();

    if (takeoverMode) {
      const club = (state.leaguePyramid?.clubs || []).find((entry) => entry.id === selectedClubId);
      if (!club) {
        if (errorEl) { errorEl.hidden = false; errorEl.textContent = "Velg en klubb å ta over."; }
        return;
      }
      if (errorEl) errorEl.hidden = true;
      state.modeChooserOpen = false;
      state.onboarded = true;
      saveOnboarded();
      selectGameMode("league", {
        clubName: club.name,
        takeoverClubId: club.id,
        ...(managerName ? { managerName } : {})
      });
      // Har du ikke vært på klubbens bane, får du grunntroppen med én gang —
      // ellers ville klubbvalget etterlatt deg uten spillere i det hele tatt.
      // Har du vært der, er klubbens spillere allerede tilgjengelige gjennom
      // den vanlige samlingen, og du velger dem selv.
      const access = getClubSquadAccess(club);
      const alreadyHasSquad = (state.teamMerits?.localStart?.playerIds || []).length > 0;
      if (access?.mode === "base" && access.baseSquad.length && !alreadyHasSquad) {
        activateStarterSquad(access.baseSquad, {
          clubId: club.id,
          poolVersion: access.version,
          generatedFrom: "club_pool"
        });
      }
      showOnboardingModeStep();
      activateRecommendedLeagueTab(getTeamFit());
      renderApp();
      return;
    }

    const clubName = String(nameInput?.value || "").trim();
    if (!clubName) {
      if (errorEl) { errorEl.hidden = false; errorEl.textContent = "Skriv inn et klubbnavn."; }
      nameInput?.focus();
      return;
    }
    if (errorEl) errorEl.hidden = true;
    state.modeChooserOpen = false;
    state.onboarded = true;
    saveOnboarded();
    selectGameMode("league", managerName ? { clubName, managerName } : { clubName });
    showOnboardingModeStep();
    activateRecommendedLeagueTab(getTeamFit());
    renderApp();
  };

  createButton?.addEventListener("click", createClub);
  nameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") createClub();
  });
}

// Formasjonsbibliotek → spillbart valg: «Bruk denne formasjonen» i biblioteket
// (hg-formation-library.js) sender en CustomEvent. Her settes lagets formasjon
// (samme selectedFormationId som formationSelect på Lag) og vi går til Lag.
// Samme unlock-gating som dropdownen: en låst formasjon tas ikke i bruk.
function bindFormationLibraryApply() {
  window.addEventListener("hgfm:apply-formation", (event) => {
    const formationId = event.detail?.formationId;
    if (!formationId) return;
    const statusEl = document.getElementById("hgfmApplyStatus");
    // Spillbar = formasjonen finnes som et aktivt (ikke deaktivert) valg i
    // formationSelect på Lag. Biblioteket viser alle 46 historiske systemer, men
    // bare de spillbare kan settes på laget. Ikke bytt lag i stillhet ellers.
    const option = elements.formationSelect?.querySelector(`option[value="${formationId}"]`);
    const playable = Boolean(option) && !option.disabled;
    if (!playable) {
      if (statusEl) {
        statusEl.textContent = `«${event.detail?.name || "Formasjonen"}» er ikke spillbar for laget ennå — låses opp via History Go-progresjon.`;
        statusEl.dataset.tone = "warn";
      }
      return;
    }
    state.selectedFormationId = formationId;
    seedLineupForFormation();
    ensurePositionsForFormation();
    if (statusEl) statusEl.textContent = "";
    activateTab("tactics");
    renderApp();
  });
}

// Manuell lagring: fanger gjeldende modus-sesong og persisterer envelope +
// gameStartState + onboarded. (Alt lagres også automatisk på slutten av
// renderApp; dette er den eksplisitte «Lagre»-knappen i innstillinger.)
function persistAllState() {
  try {
    if (state.modeEnvelope) {
      state.modeEnvelope.sessions[state.modeEnvelope.activeMode] = captureModeSession(state);
      state.modeEnvelope = persistModeEnvelope(localStorage, state.modeEnvelope);
    }
    saveGameStartState();
    saveOnboarded();
  } catch (_) { /* privat modus – kjører videre i minnet */ }
}

// «Start på nytt»: nullstiller HELE managerspillet (tropp, oppsett, sesong,
// Club Week, innboks, badges, onboarding). Rører ALDRI ekte History
// Go-progresjon (visited_places / hg_groundhopper_stats_v1), jf. CLAUDE.md.
function resetGame() {
  try {
    const preserve = new Set([
      HISTORY_GO_VISITED_PLACES_KEY,
      HISTORY_GO_GROUNDHOPPER_STATS_KEY
    ]);
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    keys.forEach((key) => { if (!preserve.has(key)) localStorage.removeItem(key); });
  } catch (_) { /* privat modus */ }
  location.reload();
}

// Innstillinger-popup: tannhjulet i headeren åpner modalen (via data-modal-open);
// her bindes handlingene inni.
function bindSettings() {
  const modal = document.querySelector("#modalSettings");
  if (!modal) return;
  const statusEl = document.querySelector("#settingsStatus");
  const confirmEl = document.querySelector("#settingsResetConfirm");
  const closeSettings = () => {
    modal.hidden = true;
    document.body.classList.remove("has-modal-open");
    if (confirmEl) confirmEl.hidden = true;
    if (statusEl) statusEl.hidden = true;
  };
  // Nullstill bekreftelses-/status-tilstand hver gang popupen åpnes.
  document.querySelector("#settingsButton")?.addEventListener("click", () => {
    if (confirmEl) confirmEl.hidden = true;
    if (statusEl) statusEl.hidden = true;
  });
  modal.addEventListener("click", (event) => {
    const button = event.target.closest("[data-settings-action]");
    if (!button) return;
    switch (button.dataset.settingsAction) {
      case "mode":
        closeSettings();
        state.modeChooserOpen = true;
        activateTab("dashboard");
        renderApp();
        break;
      case "formations":
        closeSettings();
        activateTab("hgfmLibrary");
        break;
      case "save":
        persistAllState();
        if (statusEl) { statusEl.textContent = "Spillet er lagret."; statusEl.hidden = false; }
        break;
      case "reset":
        if (confirmEl) confirmEl.hidden = false;
        break;
      case "reset-cancel":
        if (confirmEl) confirmEl.hidden = true;
        break;
      case "reset-confirm":
        resetGame();
        break;
    }
  });
}

// Popup/modal-system: generisk, hendelsesdelegert håndtering. Åpne med et
// element som har data-modal-open="modalId", lukk med data-modal-close,
// backdrop-klikk eller Esc. Bindes én gang på document, så renderApp aldri
// dobbeltbinder.
function bindModals() {
  let lastModalOpener = null;
  const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const closeAll = ({ restoreFocus = true } = {}) => {
    document.querySelectorAll(".modal-overlay:not([hidden])").forEach((m) => { m.hidden = true; });
    document.body.classList.remove("has-modal-open");
    if (restoreFocus && lastModalOpener?.isConnected) lastModalOpener.focus();
  };
  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-modal-open]");
    if (opener) {
      const modal = document.getElementById(opener.getAttribute("data-modal-open"));
      if (modal) {
        closeAll({ restoreFocus: false });
        lastModalOpener = opener;
        modal.hidden = false;
        document.body.classList.add("has-modal-open");
        modal.querySelector(".modal-close, [data-modal-close]")?.focus();
      }
      return;
    }
    if (event.target.closest("[data-modal-close]")) { closeAll(); return; }
    // Backdrop: klikk direkte på overlay (ikke på .modal inni).
    if (event.target.classList?.contains("modal-overlay")) { closeAll(); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
    if (event.key !== "Tab") return;
    const modal = document.querySelector(".modal-overlay:not([hidden])");
    if (!modal) return;
    const focusable = [...modal.querySelectorAll(focusableSelector)].filter((node) => node.getClientRects().length > 0);
    if (focusable.length === 0) {
      event.preventDefault();
      modal.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function bindFormationAndTacticControls() {
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
}

function bindTrainingWorkspaceControls() {
  const workspace = document.querySelector("#trainingWorkspace");
  workspace?.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-training-step-toggle]");
    const step = toggle?.closest(".training-workspace-step");
    if (!step?.id) return;
    state.openTrainingStepId = step.id;
    syncTrainingWorkspace(workspace, state.openTrainingStepId);
  });
}

function bindTrainingAndKnowledgeControls() {
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

  // History Go-progresjon: avanser badge-uke og nullstill lagstate.
  if (elements.advanceHgTrainingWeek) {
    elements.advanceHgTrainingWeek.addEventListener("click", () => {
      advanceHgTrainingWeek();
    });
  }
}

function bindTeamMeritsControls() {
  if (elements.resetHgTeamMerits) {
    elements.resetHgTeamMerits.addEventListener("click", () => {
      resetTeamMerits();
    });
  }
}

function bindLocalStartControls() {
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
      // Fyll tomme plasser fra samlingen slik at banen ikke står tom etterpå.
      fillEmptyLineupSlots(true);
      renderApp();
    });
  }

  bindSquadDraft();

  if (elements.clearLocalStart) {
    elements.clearLocalStart.addEventListener("click", clearLocalStartSquad);
  }
}

function bindHistoryGoSyncControls() {
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

  // Same-window recruitment: Speiding skriver den samme teamMerits-nøkkelen og
  // ber kjernen lese den på nytt. Ingen parallell troppsstate eller sidecache.
  window.addEventListener("hgfm:team-merits-changed", () => {
    state.teamMerits = loadTeamMerits(teamMeritsSeed);
    saveTeamMerits();
    invalidateAvailability();
    sanitizeLineupForUnlockedPlayers();
    sanitizeSelectedFormation();
    renderApp();
  });

  // Cross-tab/vindu: History Go skriver progresjon i localStorage; storage-
  // eventet dekker endringer fra andre vinduer/faner. key === null betyr clear().
  window.addEventListener("storage", (event) => {
    if (
      !event.key ||
      event.key === HISTORY_GO_VISITED_PLACES_KEY ||
      event.key === HISTORY_GO_GROUNDHOPPER_STATS_KEY ||
      event.key === TEAM_MERITS_KEY
    ) {
      refreshAvailabilityFromHistoryGo();
    }
  });
}

function bindMatchdayControls() {
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
}

function bindGameModeControls() {
  // Mini Season v0.1: start ny prøveperiode / nullstill kun mini-sesong-state.
  if (elements.startMiniSeasonButton) {
    elements.startMiniSeasonButton.addEventListener("click", () => {
      startMiniSeason();
    });
  }

  const assistantByStartMode = {
    league: "Start i ligaspill: skaff tropp, sett startellever, velg trening og spill neste ligakamp.",
    scenario: "Velg et scenario for å spille en kort historisk eller taktisk utfordring.",
    national: "Ta over et landslag: troppen er spillerne du har samlet fra nasjonen – også landslagsstjernene.",
    training: "Lær fotball: bla i formasjonsbiblioteket, epoke for epoke. Egen modul – den rører ikke klubben din."
  };

  function setStartModeAssistant(mode) {
    if (!elements.firstTimeAssistant) return;
    elements.firstTimeAssistant.textContent = assistantByStartMode[mode] || assistantByStartMode.league;
  }

  elements.modeChoiceCards.forEach((card) => {
    card.addEventListener("mouseenter", () => setStartModeAssistant(card.dataset.startMode));
    card.addEventListener("focus", () => setStartModeAssistant(card.dataset.startMode));
    card.addEventListener("click", () => {
      const mode = card.dataset.startMode;
      setStartModeAssistant(mode);
      // Ligaspill uten klubb ennå: gå til steg 2 (opprett klubben) i stedet for
      // å hoppe rett inn. Klubbidentiteten lages her – den avledes ikke av et sted.
      if (mode === "league" && !getSavedClubName()) {
        showOnboardingClubStep();
        return;
      }
      state.modeChooserOpen = false;
      state.onboarded = true;
      saveOnboarded();
      if (mode === "league") {
        selectGameMode("league", {});
        activateRecommendedLeagueTab(getTeamFit());
        renderApp();
        return;
      }
      if (mode === "scenario") {
        selectGameMode("scenario", { activeScenarioId: undefined });
        activateTab("scenarios");
        renderApp();
        return;
      }
      if (mode === "national") {
        selectGameMode("national", {});
        activateTab("dashboard");
        renderApp();
        return;
      }
      if (mode === "training") {
        // Fotballvitenskap er IKKE lagets treningsuke. Den sendte deg tidligere
        // rett inn i Trening-fanen, som gjorde en «uavhengig læremodul» til en
        // gjenvei inn i spillet. Nå åpner den formasjonsbiblioteket.
        selectGameMode("training", {});
        activateTab("hgfmLibrary");
        renderApp();
      }
    });
  });

  if (elements.startNewLeagueSeasonButton) {
    elements.startNewLeagueSeasonButton.addEventListener("click", () => {
      startNewLeagueSeason();
    });
  }

  if (elements.resetMiniSeasonButton) {
    elements.resetMiniSeasonButton.addEventListener("click", () => {
      resetMiniSeason();
    });
  }

  document.querySelector("#returnToLeagueButton")?.addEventListener("click", () => {
    selectGameMode("league");
    activateRecommendedLeagueTab(getTeamFit());
    renderApp();
  });
  // Trekk laget fra mesterskapet. Merittlista beholdes; bare den pågående
  // turneringen avsluttes, slik at du kan melde på igjen.
  document.querySelector("#tournamentAbandon")?.addEventListener("click", () => {
    if (!isNationalModeActive()) return;
    abandonTournament();
  });
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
    // Ny uke = hvile. Uten dette bygde belastningen seg opp for alltid.
    applyWeeklyPlayerRecovery();
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

// Marker riktig fane som aktiv ut fra hvilken seksjon som faktisk er synlig.
//
// Kontorets avdelinger (Speiding, Stabskontor, Assistentråd, Klubbrom, Styret)
// har ingen egen fane — de åpnes FRA Kontor. Uten dette sto hele menyen
// umarkert når du var inne i en avdeling: innhold på skjermen, men ingenting i
// menyen som sa hvor du var. `data-tab-parent` på seksjonen sier hvilken fane
// som eier flaten. Har flaten sin egen SYNLIGE fane (formasjonsbiblioteket i
// Fotballvitenskap), vinner den.
function highlightActiveTab() {
  // Underfanestripa må oppdateres i samme øyeblikk som en flate byttes, ikke
  // bare ved neste renderApp() — ellers henger den igjen på forrige flate.
  renderSubtabs();
  const activeSection = document.querySelector("[data-tab-section]:not([hidden])");
  const target = activeSection?.dataset.tabSection;
  if (!target) return;

  const buttons = Array.from(document.querySelectorAll(".nav-tab[data-tab-target], .app-subtab[data-tab-target]"));
  const ownTab = buttons.find(
    (button) => button.dataset.tabTarget === target && button.classList.contains("nav-tab") && !button.hidden
  );
  const highlighted = ownTab ? target : activeSection.dataset.tabParent || target;

  buttons.forEach((button) => {
    const isActive = button.classList.contains("nav-tab")
      ? button.dataset.tabTarget === highlighted
      : button.dataset.tabTarget === target;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

// Underfaner. ÉN stripe for hele appen: hver knapp bærer `data-subnav-parent`
// med hovedfanen den hører til, og her vises bare gruppa som hører til flata du
// står på. Får en ny hovedfane underinndeling, er det bare markup — ingen ny
// stripe, og ingen ny rad i body-gridet (den fella har alt kostet oss én gang).
//
// Hvilken knapp som lyser settes av highlightActiveTab(), som allerede merker
// alle [data-tab-target] etter den åpne seksjonen.
function renderSubtabs() {
  const subnav = elements.appSubnav;
  if (!subnav) return;

  const activeSection = document.querySelector("[data-tab-section]:not([hidden])");
  const target = activeSection?.dataset.tabSection;
  // En underflate peker på forelderen sin; en hovedflate er sin egen forelder.
  const parent = activeSection?.dataset.tabParent || target;
  const group = Array.from(subnav.querySelectorAll(`.app-subtab[data-subnav-parent="${parent}"]`));

  // Stripa skal bare stå der når du faktisk er på én av flatene den lister.
  // Formasjonsbiblioteket har `data-tab-parent="tactics"` (så Taktikk lyser i
  // hovedmenyen), men er ikke én av Taktikks tre underfaner — da sto stripa der
  // med ingenting markert, som om valget var borte. Biblioteket har sin egen
  // «← Tilbake til Taktikk».
  const onGroupSurface = group.some((button) => button.dataset.tabTarget === target);
  subnav.hidden = group.length === 0 || !onGroupSurface;
  if (subnav.hidden) return;

  const mode = state.modeEnvelope?.activeMode || "league";
  const leagueMode = mode === "league";

  subnav.querySelectorAll(".app-subtab").forEach((button) => {
    if (button.dataset.subnavParent !== parent) {
      button.hidden = true;
      return;
    }
    const section = document.querySelector(`[data-tab-section="${button.dataset.tabTarget}"]`);
    // En underfane til en flate som ikke finnes i denne modusen skal ikke stå
    // der og love noe. Kontorets speidings-/utviklingsflater er ligaflater.
    const sectionModes = String(section?.dataset.navSectionModes || "").split(/\s+/).filter(Boolean);
    const allowed = sectionModes.length === 0 ? true : sectionModes.includes(mode);
    const officeOnlyInLeague = parent === "dashboard" && !leagueMode && button.dataset.tabTarget !== "dashboard";
    button.hidden = !allowed || officeOnlyInLeague;
  });

  // Med mange underfaner på en telefonbredde kan den aktive ligge utenfor
  // synsfeltet — da ser stripa ut som om ingenting er valgt. `inline: nearest`
  // ruller bare stripa vannrett, aldri siden.
  const active = subnav.querySelector(`.app-subtab[data-tab-target="${target}"]`);
  if (active && !active.hidden) {
    active.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

// Aktiver en fane programmatisk: brukes av fane-knappene og av "Neste
// beslutninger" som navigerer brukeren til riktig avdeling.
function activateTab(target) {
  // Forlater du kampflaten, skal klokka stoppe. Ellers ville en usynlig timer
  // fortsatt tikke og skrive til en sesjon ingen ser.
  if (target !== "kamp") stopMatchLive();
  const sections = Array.from(document.querySelectorAll("[data-tab-section]"));

  sections.forEach((section) => {
    section.hidden = section.dataset.tabSection !== target;
  });

  highlightActiveTab();

  // Å åpne Kamp-flaten regnes som at manageren har sett kamprapporten — da
  // forsvinner «Se kampanalyse» fra Neste handling-stripa. Stille persistens;
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
      // «Senere»-flater er deaktiverte og skal aldri bytte fane. Disabled-knapper
      // sender normalt ikke click, men aria-disabled gjør det – så vi vokter her
      // slik at ingen kontorflate blir en aktiv blindvei.
      if (button.disabled || button.getAttribute("aria-disabled") === "true") return;
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

async function loadStartupData() {
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
    individualTrainingData,
    playerWeaknessesData,
    attributesData,
    leagueClubProfilesData,
    clubsData,
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
    hgFormationKnowledgeData,
    tournamentsData,
    scenariosData
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
    loadFootballBookKnowledgePrinciples().then((data) => data || loadJson(DATA_PATHS.knowledgePrinciples).catch(() => null)),
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
    // Individuell trening: katalogen er valgfri på samme måte som resten —
    // uten den faller flata tilbake til en tom, men gyldig, sporliste.
    loadJson(DATA_PATHS.individualTraining).catch(() => null),
    loadJson(DATA_PATHS.playerWeaknesses).catch(() => null),
    loadJson(DATA_PATHS.attributes).catch(() => null),
    loadJson(DATA_PATHS.leagueClubProfiles).catch(() => null),
    loadJson(DATA_PATHS.clubs).catch(() => null),
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
    loadJson(DATA_PATHS.hgFormationKnowledge).catch(() => null),
    // Mesterskapsdata er valgfri: mangler den, spilles landslagsmodus som
    // enkeltkamper i stedet for EM/VM. Ingen blindvei.
    loadJson(DATA_PATHS.tournaments).catch(() => null),
    // Scenariokatalogen er valgfri: mangler den, viser flata det i stedet for
    // å krasje modusen.
    loadJson(DATA_PATHS.scenarios).catch(() => null)
  ]);

  state.players = playersData.players || [];
  state.scenarios = normalizeScenarios(scenariosData);
  state.tournamentDefinitions = Array.isArray(tournamentsData?.tournaments) ? tournamentsData.tournaments : [];
  state.tournamentNations = Array.isArray(tournamentsData?.nations) ? tournamentsData.nations : [];
  state.playerArchetypes = playerArchetypesData?.archetypes || [];
  state.roles = rolesData.roles;
  state.tactics = tacticsData.tactics;

  // ---------------------------------------------------------------------
  // Ferdighetsprofilene. Utledes ÉN gang her, av data som allerede står i
  // spillerfila, og henges på spiller- og rolleobjektene så motorene slipper
  // å tre katalogen gjennom hver eneste kallkjede.
  //
  // `role.requiredSkills` er rollens krav som faktisk er FERDIGHETER. Resten
  // av `requires` er forhold systemet må gi spilleren (`space_behind`), og de
  // eies av lag- og relasjonsmotorene. Å blande dem ville gjort en systemsvikt
  // om til en spillersvakhet — stikk i strid med kjerneprinsippet.
  // ---------------------------------------------------------------------
  state.attributeCatalogue = normalizeAttributeCatalogue(attributesData);
  for (const role of state.roles) {
    role.requiredSkills = splitRoleRequirements(state.attributeCatalogue, role).skills;
  }
  const attributeIndex = derivePlayerAttributeIndex(state.players, {
    catalogue: state.attributeCatalogue,
    roles: state.roles
  });
  state.attributeScaling = attributeIndex.scaling;
  for (const player of state.players) {
    player.attributes = attributeIndex.profiles[player.id] || null;
  }

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
  // Individuell trening: katalogen normaliseres av motoren, som degraderer til
  // en tom, gyldig struktur hvis filen mangler.
  state.individualTrainingCatalogue = normalizeIndividualTrainingCatalogue(individualTrainingData);
  // Svakhetsfila eier bare TRENINGEN av ferdighetene nå; vokabularet og
  // posisjonskravene kommer fra ferdighetskatalogen. Slås sammen her, så
  // svakhetsmotoren beholder sin egen signatur.
  state.weaknessCatalogue = normalizeWeaknessCatalogue({
    ...(playerWeaknessesData || {}),
    attributes: attributesData?.attributes || [],
    positionDemands: attributesData?.positionDemands || {}
  });
  // Keyet på clubId. Mangler fila, faller ligamotstanderen tilbake til de
  // generiske profilene — spillet står ikke.
  state.leagueClubProfiles = Object.fromEntries(
    (Array.isArray(leagueClubProfilesData?.profiles) ? leagueClubProfilesData.profiles : [])
      .filter((profile) => profile && typeof profile.clubId === "string")
      .map((profile) => [profile.clubId, profile])
  );
  // Seriepyramiden. Uten fila står spillet fortsatt, men da finnes det ingen
  // nivåer å rykke opp eller ned mellom.
  state.leaguePyramid = {
    tiers: Array.isArray(clubsData?.tiers) ? clubsData.tiers : [],
    clubs: Array.isArray(clubsData?.clubs) ? clubsData.clubs : []
  };
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
}

// Hydrerer resten av state.* fra localStorage (formasjon-/taktikkvalg, trening,
// innboks, kampdag, mini-sesong, first-time-playthrough). Må kjøre etter
// loadStartupData(): getAvailability() under leser state.unlocks/state.teamMerits,
// som først er satt der.
async function hydratePersistedUiState() {
  // Et nytt ligaspill starter eksplisitt i en moderne 4-2-3-1. Et lagret
  // modus-snapshot legges på etterpå i hydrateModeSessions(), og beholder dermed
  // eksisterende formasjon. Katalogrekkefølgen er bare siste fallback.
  const availableFormations = getAvailability().unlockedFormations.length
    ? getAvailability().unlockedFormations
    : state.formations;
  state.selectedFormationId = selectDefaultFormation({
    mode: "league",
    availableFormations
  });
  state.selectedTacticId = selectDefaultMatchPlan({
    availableMatchPlans: state.tactics
  });
  state.trainingWeek = loadTrainingWeek();
  state.activeKnowledgeFocusId = loadActiveKnowledgeFocus();
  state.completedKnowledgeFocusIds = loadCompletedKnowledgeFocusIds();
  state.readInboxMessageIds = loadReadInboxMessageIds();
  state.deliveredInboxMessageIds = loadDeliveredInboxMessageIds();
  state.inboxAcknowledgedWeek = loadInboxAcknowledgedWeek();
  // Innboks-svarvalg (v1): valgkatalog fra manifest + brukerens lagrede valg.
  // loadClubInboxChoices kaster aldri – appen fungerer uten valg-manifest.
  state.clubInboxChoices = await loadClubInboxChoices();
  state.selectedInboxChoices = loadSelectedInboxChoices();
  // Innboks-trådsvar (v1): reply-katalog fra manifest. loadClubInboxReplies
  // kaster aldri – appen fungerer uten reply-manifest.
  state.clubInboxReplies = await loadClubInboxReplies();
  // Kampdag (v1): hent siste spilte kamp fra localStorage.
  state.matchday = loadMatchdayState();
  // Spillerstatistikk (v1): sesongens mål, målgivende og kamper per spiller.
  state.playerSeasonStats = loadPlayerSeasonStats();
  // Spillerform og slitasje (v1): troppens tilstand mellom kampene.
  state.playerCondition = loadPlayerCondition();
  // Merittlista: sesongene som er spilt ferdig.
  state.seasonArchive = loadSeasonArchive();
  // Mini Season v0.1: hent eventuell prøveperiode fra localStorage. Korrupt
  // eller manglende state gir null (= ingen prøveperiode startet).
  state.miniSeason = loadMiniSeason();
  state.leagueSeason = loadLeagueSeason();
  // Kvalifiseringen må overleve en omlasting — ellers ville en halvspilt
  // opprykkskvalifisering forsvinne og sesongen rulle videre uten den.
  state.leaguePlayoff = loadLeaguePlayoff();
  state.gameStartState = loadGameStartState();
  state.firstTimePlaythrough = loadFirstTimePlaythrough();
  state.onboarded = loadOnboarded();
}

function hydrateModeSessions() {
  state.modeEnvelope = migrateModeSessions(localStorage);
  state.modeEnvelope.sessions.league = {
    ...captureModeSession(state),
    ...state.modeEnvelope.sessions.league
  };
  const mode = state.modeEnvelope.activeMode;
  // The migration may only contain the old league snapshot. Secondary modes
  // are lazily cloned from it, never the other way around.
  if (mode !== "league" && !state.modeEnvelope.sessions[mode]) {
    state.modeEnvelope = resetSecondarySession(state.modeEnvelope, state, mode);
  } else {
    applyModeSession(state, state.modeEnvelope.sessions[mode]);
  }
  state.gameStartState = normalizeGameStartState({ ...state.gameStartState, selectedMode: mode });
  // Availability er klubb- og modusavhengig. hydratePersistedUiState() kan ha
  // fylt cachen før gameStartState og aktiv modussnapshot var ferdig hydrert;
  // nullstill den her før startelleveren seedes mot feil spillerpool.
  invalidateAvailability();
  persistModeEnvelope(localStorage, state.modeEnvelope);
  saveGameStartState();
}

function runStartupValidation() {
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
}

async function bootstrapClubWeekState() {
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
  // Krever at katalogen er lastet (over) — lagrede tildelinger saneres mot den.
  state.individualTraining = loadIndividualTraining();
  syncWeeklyTrainingFocusToClubWeek();
  state.clubWeekFeedback = loadClubWeekFeedback();
  state.clubWeekEventLog = loadClubWeekEventLog();
}

function finalizeStartupLineup() {
  seedLineupForFormation();
  // Saner lineup etter at players/unlocks/teamMerits er lastet og synket, slik
  // at gamle valg ikke omgår unlock-regelen.
  sanitizeLineupForUnlockedPlayers();
  // Vern: skulle valgt formasjon likevel være låst, fall tilbake til første
  // tilgjengelige formasjon.
  sanitizeSelectedFormation();
  ensurePositionsForFormation();
}


async function loadFootballBookKnowledgePrinciples() {
  const index = await loadJson(DATA_PATHS.footballBookKnowledgeIndex).catch(() => null);
  if (!Array.isArray(index?.files)) {
    return null;
  }

  const parts = await Promise.all(
    index.files.map((path) => loadJson(path).catch(() => null))
  );

  const principles = parts.flatMap((part) => Array.isArray(part?.principles) ? part.principles : []);

  if (principles.length === 0) {
    return null;
  }

  return { principles };
}

async function init() {
  initTabs();
  initPlayerStatsSort();
  // Start lasting av TS-motoren parallelt med datafilene. Vi venter på den før
  // første render, slik at manager-detalj-panelet kan bygges synkront i
  // renderApp i stedet for å skrive seg inn en tikk senere (ingen blink).
  const managerEngineReady = preloadManagerEngine();

  try {
    await loadStartupData();
    await hydratePersistedUiState();
    runStartupValidation();
    await bootstrapClubWeekState();
    hydrateModeSessions();
    finalizeStartupLineup();
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

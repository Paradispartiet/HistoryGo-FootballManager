import { FOOTBALL_POSITIONS } from "./football-fit-engine.js";
import "./ui/manager-shell-elements.js";
import { createMatchFlowSnapshot } from "./ui/manager-shell-view.js";
import { createClubIdentityView, renderClubIdentity } from "./ui/manager-club-identity.js";
import { getTrainingWorkspaceTarget, syncTrainingWorkspace } from "./ui/training-workspace-view.js";
import { compactPlayerName, describeTacticalFit } from "./ui/manager-lineup-presentation.js";
import { createMatchdaySceneModel } from "./ui/manager-matchday-presentation.js";
import { createSeasonSceneModel, renderSeasonCommand, renderSeasonLeagueOverview } from "./ui/manager-season-presentation.js";
import { createOfficeSceneModel, renderOfficeCommand } from "./ui/manager-office-presentation.js";
import { createManagerTrainingSceneModel, renderManagerTrainingCommand } from "./ui/manager-training-presentation.js";
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
import { resolveClubSquadAccess, listClubHeritagePlayers } from "./football-club-squad.js";
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
const REQUIRED_STAFF_SIZE = 3;

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
  facilityOverallValue: document.querySelector("#facilityOverallValue"),
  facilityTrainingLevel: document.querySelector("#facilityTrainingLevel"),
  facilityTrainingStatus: document.querySelector("#facilityTrainingStatus"),
  facilityStadiumLevel: document.querySelector("#facilityStadiumLevel"),
  facilityStadiumStatus: document.querySelector("#facilityStadiumStatus"),
  facilityAcademyLevel: document.querySelector("#facilityAcademyLevel"),
  facilityAcademyStatus: document.querySelector("#facilityAcademyStatus"),
  facilityMedicalLevel: document.querySelector("#facilityMedicalLevel"),
  facilityMedicalStatus: document.querySelector("#facilityMedicalStatus"),
  marketMediaValue: document.querySelector("#marketMediaValue"),
  marketReputationNote: document.querySelector("#marketReputationNote"),
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
    hiredStaffIds: Array.isArray(base.hiredStaffIds) ? base.hiredStaffIds : [],
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
  return localStart.enabled ? localStart.playerIds : [];
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
function getStarterSquadStaffCandidates(staff, limit = REQUIRED_STAFF_SIZE) {
  if (!isStarterSquadActive()) return [];
  const list = Array.isArray(staff) ? staff.filter((member) => member && member.id) : [];
  return [...list]
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .slice(0, Math.max(0, limit));
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
function activateStarterSquad(chosenPlayerIds = null) {
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
    playerIds,
    createdAt: new Date().toISOString()
  });
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
        unlockedPlayerIds.add(unlock.targetId);
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
  unlockedPlayerIds.forEach((playerId) => {
    nationalOnlyPlayerIds.delete(playerId);
    quizPendingPlayerIds.delete(playerId);
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

  // Landslagsmodus: her ER landslagsspillerne poenget. De speidede spillerne
  // fra landslagsarena blir tilgjengelige, men HELE troppen filtreres på den
  // valgte nasjonen – du kan ikke ta ut en brasilianer på Norges landslag.
  // Klubblagets tropp røres ikke; modusene har hver sin sesjon.
  if (isNationalModeActive()) {
    nationalOnlyPlayerIds.forEach((playerId) => unlockedPlayerIds.add(playerId));
    nationalOnlyPlayerIds.clear();
    const nationality = getNationalTeamNationality();
    if (nationality) {
      // Grunnstammen er alltid tilgjengelig, ellers ville en ny manager stått
      // med et tomt landslag og ingen vei videre.
      getNationalBasePlayerIds(nationality).forEach((playerId) => unlockedPlayerIds.add(playerId));
      [...unlockedPlayerIds].forEach((playerId) => {
        if (playersById.get(playerId)?.nationality !== nationality) unlockedPlayerIds.delete(playerId);
      });
    }
  }

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
  const starterStaff = getStarterSquadStaffCandidates(staff, REQUIRED_STAFF_SIZE + 2);
  const staffById = new Map([...normallyUnlockedStaff, ...starterStaff].map((member) => [member.id, member]));
  const unlockedStaff = [...staffById.values()];

  // 4) Formasjonstilgjengelighet: unlockRules.json + formation.unlockLinks
  // vurdert mot samlingen (steder, spillere, stab, badges).
  const collectedPools = {
    unlockedPlaceIds,
    unlockedPlayerIds,
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

// Opplåste spillere: ekte spillere fra state.players som er pekt på av et
// player_candidate-unlock på et opplåst sted.
function getUnlockedPlayers() {
  return getAvailability().unlockedPlayers;
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
  state.playerCondition = applyWeeklyRecovery(getPlayerCondition(), { trainingIntensity });
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
    const record = entry(nation);
    record.ids.add(player.id);
    record.collected.add(player.id);
  });
  return [...nations.entries()]
    .map(([nationality, record]) => ({
      nationality,
      count: record.ids.size,
      collected: record.collected.size,
      playable: record.ids.size >= REQUIRED_SQUAD_SIZE
    }))
    .sort((a, b) => b.count - a.count || a.nationality.localeCompare(b.nationality, "no"));
}

// Velg nasjon å lede. Nullstiller troppen, siden spillerpoolen endres — og et
// pågående mesterskap, siden det tilhørte den forrige nasjonen.
function selectNationalTeamNation(nationality) {
  const nation = typeof nationality === "string" ? nationality.trim() : "";
  if (!nation) return;
  const previous = getNationalTeamNationality();
  state.nationalTeam = { nationality: nation, squadPlayerIds: [] };
  if (previous !== nation) state.tournament = null;
  invalidateAvailability();
  sanitizeLineupForUnlockedPlayers();
  fillEmptyLineupSlots(true);
  renderApp();
}

// ---------------------------------------------------------------------------
// Mesterskap (EM/VM). Motoren bor i football-tournament.js; her bor bare
// koblingen til app-state, lagring og UI. Ingen nasjoner, mesterskap eller
// motstandere hardkodes — alt leses fra data/football_tournaments.json.
// ---------------------------------------------------------------------------
function getActiveTournament() {
  return normalizeTournamentState(state.tournament);
}

function isTournamentActive() {
  const tournament = getActiveTournament();
  return Boolean(tournament && tournament.status === "active");
}

// Hvilke mesterskap kan nasjonen din melde seg på? Tom liste betyr at
// mesterskapsdataen mangler — da spilles landslagsmodus som enkeltkamper.
function getAvailableTournaments() {
  const nationality = getNationalTeamNationality();
  if (!nationality) return [];
  return getEligibleTournaments(
    state.tournamentDefinitions || [],
    state.tournamentNations || [],
    nationality
  );
}

// Seed: nasjon + mesterskap + antall tidligere mesterskap. Deterministisk, men
// et nytt mesterskap gir en ny trekning.
function buildTournamentSeed(tournamentId, nationality) {
  const previous = (state.tournamentHistory || []).length;
  return `${tournamentId}-${slugifyNationSeed(nationality)}-${previous + 1}`;
}

function slugifyNationSeed(nationality) {
  return String(nationality || "nasjon")
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-");
}

function startTournament(tournamentId) {
  const nationality = getNationalTeamNationality();
  if (!nationality) return;
  const definition = getAvailableTournaments().find((entry) => entry.id === tournamentId);
  if (!definition) return;
  const source = (state.tournamentDefinitions || []).find((entry) => entry.id === tournamentId) || definition;
  try {
    state.tournament = createTournament({
      definition: source,
      nations: state.tournamentNations || [],
      managerNationality: nationality,
      seed: buildTournamentSeed(tournamentId, nationality)
    });
  } catch (error) {
    console.warn(`Kunne ikke starte mesterskap: ${error.message}`);
    state.tournament = null;
    return;
  }
  const opponent = getTournamentNextOpponent(state.tournament);
  addClubWeekEvent({
    id: `tournament-start-${state.tournament.seed}`,
    week: state.clubWeekState?.week || 1,
    phase: "matchday",
    phaseLabel: state.tournament.name,
    message: opponent
      ? `${state.tournament.fullName} er i gang. Første kamp: ${opponent.nationality}.`
      : `${state.tournament.fullName} er i gang.`
  });
  persistTournament();
  renderApp();
}

function abandonTournament() {
  state.tournament = null;
  persistTournament();
  renderApp();
}

function persistTournament() {
  // Mesterskapet bor i modus-sesjonen (landslagsmodus), ikke i en egen
  // legacy-nøkkel: det skal aldri kunne lekke inn i klubblagringen.
  if (!state.modeEnvelope) return;
  state.modeEnvelope.sessions[state.modeEnvelope.activeMode] = captureModeSession(state);
  try {
    state.modeEnvelope = persistModeEnvelope(localStorage, state.modeEnvelope);
  } catch (_) { /* memory-only fallback */ }
}

// Neste motstander i mesterskapet som en full motstanderprofil kampdagen kan
// bruke. Nasjonen er identiteten; stilen er den historiske arketypen den spiller
// med — samme kontrakt som de øvrige motstanderne.
function getTournamentMatchdayOpponent() {
  const tournament = getActiveTournament();
  if (!tournament) return null;
  const next = getTournamentNextOpponent(tournament);
  if (!next) return null;
  const profile =
    getHistoricalOpponentProfile(next.styleProfileId) ||
    OPPONENT_PROFILES.find((candidate) => candidate.id === next.styleProfileId) ||
    OPPONENT_PROFILES[0];
  if (!profile) return null;
  return {
    ...profile,
    id: `tournament-${next.id}`,
    // Navnet er nasjonen, ikke «nasjon — steg»: displayName brukes inne i
    // kampbriefens setninger, og et steg midt i en setning ble uleselig
    // («Italia — Gruppespill · Gruppe A truet i overgang»).
    name: next.nationality,
    displayName: next.nationality,
    strength: next.strength,
    homeAway: next.homeAway,
    // Utslagskamp er alltid en «må vinne»-ramme; gruppespill tåler et poeng.
    boardExpectation: next.knockout ? "win" : "avoid_loss",
    narrativeHook: next.narrativeHook,
    tournamentStage: next.stage,
    tournamentStageLabel: next.stageLabel
  };
}

// Registrer et fullført kampresultat i mesterskapet. Idempotent via motoren:
// er kampen allerede registrert, returnerer den samme state.
function registerMatchInTournament(lastMatch) {
  if (!isNationalModeActive() || !isTournamentActive() || !lastMatch) return;
  const before = state.tournament;
  const updated = applyTournamentMatchResult(before, lastMatch);
  if (updated === before) return;
  state.tournament = updated;

  const summary = summarizeTournament(updated);
  if (updated.status === "completed") {
    // Forbundet gjør opp. Merittlista fantes fra før, men ingen hadde en mening
    // om den: å ryke i gruppa med Brasil og å nå semifinalen med Norge sto som
    // samme slags linje.
    const nation = (Array.isArray(state.tournamentNations) ? state.tournamentNations : [])
      .find((entry) => entry.nationality === updated.managerNationality) || null;
    const verdict = createFederationVerdict({
      tournament: updated,
      summary,
      expectation: deriveFederationExpectation({
        strength: Number(nation?.strength) || 70,
        knockoutStages: updated.knockoutStages
      }),
      previousVerdicts: (Array.isArray(state.tournamentHistory) ? state.tournamentHistory : [])
        .map((entry) => entry.verdict ? entry : null)
        .filter(Boolean),
      federationTrust: Number(state.federationTrust) || 50
    });
    if (verdict) {
      state.federationVerdict = verdict;
      state.federationTrust = verdict.trustAfter;
    }

    state.tournamentHistory = [
      ...(Array.isArray(state.tournamentHistory) ? state.tournamentHistory : []),
      {
        tournamentId: updated.tournamentId,
        name: updated.name,
        nationality: updated.managerNationality,
        placement: updated.outcome?.placement || "Ferdig",
        champion: updated.outcome?.champion || null,
        played: summary.played,
        won: summary.won,
        drawn: summary.drawn,
        lost: summary.lost,
        ...(createFederationArchiveEntry(verdict) || {})
      }
    ];
  }
  (updated.log || []).slice(-1).forEach((message, index) => {
    addClubWeekEvent({
      id: `tournament-${updated.seed}-${updated.stage}-${index}`,
      week: state.clubWeekState?.week || 1,
      phase: "matchday",
      phaseLabel: updated.name,
      message
    });
  });
  persistTournament();
}

function isNationalModeActive() {
  return state.modeEnvelope?.activeMode === "national";
}

function isTrainingModeActive() {
  return state.modeEnvelope?.activeMode === "training";
}

function shouldWriteLegacyLeagueStorage() {
  return !state.modeEnvelope || isLeagueModeActive();
}

function isLeagueSeasonActive() {
  return isLeagueModeActive() &&
    Boolean(state.gameStartState?.activeLeagueSaveId) &&
    state.gameStartState?.leagueSeasonStatus === "active" &&
    state.leagueSeason?.status === "active";
}

function getLeagueStatusLabel(status = state.gameStartState?.leagueSeasonStatus, season = state.leagueSeason) {
  if (status === "completed" || season?.status === "completed") return "Fullført sesong";
  if (status === "active" && season?.status === "active") return "Aktiv sesong";
  return "Før sesong";
}

// Klubbnavnet er noe spilleren setter selv i onboardingen. Faller tilbake på et
// nøytralt midlertidig navn hvis klubben ikke er opprettet ennå — aldri avledet
// av et History Go-sted (stedsanker er faset ut som identitetskilde).
function getTemporaryClubName() {
  const raw = state.gameStartState?.clubName;
  if (typeof raw === "string" && raw.trim()) return { name: raw.trim(), temporary: false };
  return { name: "Ny klubb", temporary: true };
}

function getLeagueSaveModel() {
  const season = state.leagueSeason;
  // Klubbidentiteten kommer fra klubben spilleren opprettet (onboarding), ikke
  // fra et History Go-sted. Stedsanker er faset ut som identitetskilde.
  const club = getTemporaryClubName();
  const status = getLeagueStatusLabel(state.gameStartState?.leagueSeasonStatus, season);
  return {
    activeLeagueSaveId: state.gameStartState?.activeLeagueSaveId || null,
    leagueSeasonStatus: status,
    clubName: club.name,
    temporaryClubName: club.temporary,
    managerName: state.gameStartState?.managerName || "",
    leagueName: state.gameStartState?.leagueName || "HG Liga",
    seasonLabel: state.gameStartState?.seasonLabel || "Sesong 1",
    boardExpectation: state.gameStartState?.boardExpectation || season?.boardExpectation || "Styret vil se en tydelig klubbidentitet og et kampklart lag.",
    seasonObjective: state.gameStartState?.seasonObjective || season?.seasonGoal || "Fullfør før-sesong og gjør klubben klar for serieåpning.",
    createdAt: state.gameStartState?.createdAt || null
  };
}

function createLeagueSaveExtras() {
  const model = getLeagueSaveModel();
  return {
    activeLeagueSaveId: model.activeLeagueSaveId || `league_save_${Date.now()}`,
    leagueSeasonStatus: "active",
    clubName: model.clubName,
    leagueName: model.leagueName,
    seasonLabel: model.seasonLabel,
    boardExpectation: model.boardExpectation,
    seasonObjective: model.seasonObjective,
    createdAt: model.createdAt || new Date().toISOString()
  };
}

function clearLeagueSaveState() {
  state.gameStartState = normalizeGameStartState({ selectedMode: state.gameStartState?.selectedMode || null });
}

function activateLeagueOnboardingTarget(step) {
  const targetByStep = {
    klubb: { tab: "dashboard", selector: ".manager-portal", openClubStep: true },
    spillere: { tab: "historygo", selector: "#unlockedPlayersList" },
    // Staben flyttet fra en popup på Speiding til Stab & drift-flata. Ruta
    // pekte på et element inne i en LUKKET modal, så «scroll hit» gjorde
    // ingenting — steget så ut som en blindvei.
    stab: { tab: "admin", selector: "#availableStaffList" },
    ellever: { tab: "tactics", selector: "#formationSelect" },
    formasjon: { tab: "tactics", selector: "#formationSelect" },
    trening: { tab: "trening", selector: "#weeklyTrainingOptions" },
    sesong: { tab: "dashboard", selector: "#leagueSeasonPanel", startSeason: true }
  };
  const target = targetByStep[step?.id] || { tab: step?.tab || "dashboard" };
  if (target.startSeason) startLeagueSeasonFromOnboarding();
  // Mangler klubben navn, åpner vi klubb-opprettelsen i startskjermen.
  if (target.openClubStep && !getSavedClubName()) {
    state.modeChooserOpen = true;
    renderApp();
    showOnboardingClubStep();
    return;
  }
  activateTab(target.tab);
  if (target.selector) {
    window.requestAnimationFrame(() => document.querySelector(target.selector)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }
}

function activateRecommendedLeagueTab(teamFit = null) {
  const rosterReadiness = getAvailability().rosterReadiness;
  if (!rosterReadiness.hasEnoughUnlocked) {
    activateTab("historygo");
    return;
  }
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const filled = assignments.filter((item) => item.player).length;
  if (!teamFit || filled < 11 || !rosterReadiness.hasEnoughBench) {
    activateTab("tactics");
    return;
  }
  if (!state.weeklyTrainingProgram?.programId && !state.weeklyTrainingFocus?.focusId) {
    activateTab("trening");
    return;
  }
  activateTab("kamp");
}

function loadFirstTimePlaythrough() {
  try {
    return normalizeFirstTimePlaythrough(JSON.parse(localStorage.getItem(FIRST_TIME_PLAYTHROUGH_KEY)));
  } catch (error) {
    return normalizeFirstTimePlaythrough(null);
  }
}

function saveFirstTimePlaythrough() {
  if (!shouldWriteLegacyLeagueStorage()) return;
  try {
    localStorage.setItem(FIRST_TIME_PLAYTHROUGH_KEY, JSON.stringify(normalizeFirstTimePlaythrough(state.firstTimePlaythrough)));
  } catch (error) {
    // UI-progresjon kan feile i privat modus uten å stoppe førsteuka.
  }
}

function isFirstTimePlaythroughActive() {
  return isScenarioModeActive() &&
    state.gameStartState?.activeScenarioId === AJAX_TOTAL_FOOTBALL_SCENARIO_ID &&
    !state.firstTimePlaythrough?.completed;
}

function getFirstTimeOpponentProfile() {
  return getHistoricalOpponentProfile(FIRST_TIME_OPPONENT_ID) ||
    HISTORICAL_OPPONENT_PROFILES.find((profile) => /ajax|total/i.test(`${profile.id} ${profile.displayName} ${profile.archetypeName}`)) ||
    HISTORICAL_OPPONENT_PROFILES[0] ||
    null;
}

function buildFirstTimeNextActionState(teamFit, readiness = null) {
  const ft = normalizeFirstTimePlaythrough(state.firstTimePlaythrough);
  if (!isFirstTimePlaythroughActive() || ft.completed) return { active: false, started: ft.started, completed: Boolean(ft.completed) };
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
    hasReadInbox: getInboxAttentionCount() === 0,
    hasPlayedFirstMatch: firstMatchPlayed,
    hasSeenReport: reportSeen,
    opponentName: opponent?.displayName || "Ajax 1971–73 — Totalfotball",
    readiness: readiness || (teamFit ? getMatchdayReadiness(teamFit) : { isReady: false })
  };
}


function getLeagueOnboardingSteps(teamFit) {
  const availability = getAvailability();
  const roster = availability.rosterReadiness || {};
  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const filled = assignments.filter((item) => item.player).length;
  const bench = Math.max(0, Number(roster.unlockedCount || 0) - filled);
  // Klubbidentitet = klubben du opprettet i onboardingen (navn), ikke et
  // stedsanker. Stedsanker er faset ut som identitetskilde.
  const hasClubIdentity = Boolean(getSavedClubName()) || (isLeagueSeasonActive() && Boolean(state.gameStartState?.activeLeagueSaveId));
  const hiredStaff = getHiredStaff().length;
  const hasFormation = Boolean(state.selectedFormationId);
  const hasTraining = Boolean(state.weeklyTrainingProgram?.programId || state.weeklyTrainingFocus?.focusId);
  const leagueActive = isLeagueSeasonActive();
  return [
    { id: "klubb", title: "Opprett klubben", done: hasClubIdentity, detail: hasClubIdentity ? `Klubben er opprettet: ${getTemporaryClubName().name}.` : "Gi klubben et navn i startskjermen før laget behandles som en aktiv ligaklubb.", tab: "dashboard" },
    { id: "spillere", title: "Hent spillere", done: Number(roster.unlockedCount || 0) >= REQUIRED_SQUAD_SIZE, detail: `${Number(roster.unlockedCount || 0)}/${REQUIRED_SQUAD_SIZE} spillere tilgjengelig. Bruk samling, nærområde, klubblink eller auto-fyll.`, tab: "historygo" },
    { id: "stab", title: "Velg stab", done: hiredStaff >= REQUIRED_STAFF_SIZE, detail: `${hiredStaff}/${REQUIRED_STAFF_SIZE} stabsmedlemmer valgt. Tilgjengelig stab teller først når du faktisk engasjerer dem.`, tab: "historygo" },
    { id: "ellever", title: "Sett førsteellever og benk", done: filled >= REQUIRED_STARTERS && bench >= REQUIRED_BENCH, detail: `Startellever ${Math.min(filled, REQUIRED_STARTERS)}/${REQUIRED_STARTERS} · benk ${Math.min(bench, REQUIRED_BENCH)}/${REQUIRED_BENCH}.`, tab: "tactics" },
    { id: "formasjon", title: "Velg formasjon", done: hasFormation, detail: hasFormation ? "Formasjonen er valgt og forklares på taktikkbrettet." : "Velg en spillbar formasjon før treningsuka låses inn.", tab: "tactics" },
    { id: "trening", title: "Velg trening", done: hasTraining, detail: hasTraining ? "Ukas treningsprogram er valgt." : "Velg treningsfokus eller program slik at laget går inn i serieåpningen med en plan.", tab: "trening" },
    { id: "sesong", title: "Start sesongen", done: leagueActive, detail: leagueActive ? "League-save, terminliste og tabell er aktive." : "Opprett league-save og terminliste når alle før-sesongsgrepene er klare.", tab: "dashboard" }
  ];
}

function isLeaguePreseasonReady(teamFit) {
  const steps = getLeagueOnboardingSteps(teamFit);
  return steps.filter((step) => step.id !== "sesong").every((step) => step.done);
}

function renderLeagueOnboarding(teamFit) {
  const panel = elements.leagueOnboardingPanel;
  const list = elements.leagueOnboardingSteps;
  if (!panel || !list) return;
  const active = isLeagueModeActive();
  const steps = getLeagueOnboardingSteps(teamFit);
  const complete = steps.filter((step) => step.done).length;
  const done = complete === steps.length;
  panel.hidden = !active || done;
  if (panel.hidden) return;
  const next = steps.find((step) => !step.done) || steps[steps.length - 1];
  if (elements.leagueOnboardingLead) {
    elements.leagueOnboardingLead.textContent = `Før seriestart: ${complete}/${steps.length} managergrep klare. Neste steg: ${next.title.toLowerCase()}.`;
  }
  list.replaceChildren();
  steps.forEach((step, index) => {
    const item = document.createElement("li");
    item.className = step.done ? "is-done" : "";
    // Hvert steg er en knapp til flata steget faktisk skjer på. Et steg som
    // bare beskriver seg selv er et skilt uten dør — samme feil som klubbukas
    // fasestripe hadde.
    const button = document.createElement("button");
    button.type = "button";
    button.className = "league-onboarding-step";
    const number = document.createElement("span");
    number.textContent = step.done ? "✓" : String(index + 1);
    const body = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = step.title;
    const detail = document.createElement("small");
    detail.textContent = step.detail;
    body.append(title, detail);
    button.append(number, body);
    button.addEventListener("click", () => activateLeagueOnboardingTarget(step));
    item.append(button);
    list.append(item);
  });
}

// Klubbnavnet spilleren selv har satt (tom => klubb ikke opprettet ennå).
function getSavedClubName() {
  const raw = state.gameStartState?.clubName;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "";
}

// Onboarding steg 2: vis klubb-opprettelsen, skjul modusvalget.
function showOnboardingClubStep() {
  const chooser = elements.firstTimePlaythroughCard;
  const clubStep = document.querySelector("#onboardingClubStep");
  if (chooser) chooser.hidden = true;
  if (clubStep) {
    clubStep.hidden = false;
    document.querySelector("#onboardingClubName")?.focus();
  }
}

// Tilbake til modusvalget fra klubb-steget.
function showOnboardingModeStep() {
  const chooser = elements.firstTimePlaythroughCard;
  const clubStep = document.querySelector("#onboardingClubStep");
  if (clubStep) clubStep.hidden = true;
  if (chooser) chooser.hidden = false;
}

function loadOnboarded() {
  try { return localStorage.getItem(ONBOARDED_KEY) === "1"; } catch (_) { return false; }
}

function saveOnboarded() {
  try { localStorage.setItem(ONBOARDED_KEY, state.onboarded ? "1" : "0"); } catch (_) { /* privat modus */ }
}

// Onboarding v2: egen startskjerm styres uavhengig av spillflaten. Den vises til
// spilleren har valgt modus (`onboarded`), og igjen når «Bytt modus» åpner den.
function renderOnboardingScreen() {
  const screen = elements.onboardingScreen;
  if (!screen) return;
  screen.hidden = state.onboarded && !state.modeChooserOpen;
  document.body.classList.toggle("is-onboarding", !screen.hidden);
  // Startskjermen åpner alltid på modusvalget; klubb-steget vises kun når
  // ligaspill velges uten at en klubb er opprettet.
  if (screen.hidden) showOnboardingModeStep();
}

// Landslagspanelet: nasjonsvalg + troppsoppsummering. Kun i landslagsmodus.
function renderNationalTeamPanel() {
  const panel = document.querySelector("#nationalTeamPanel");
  if (!panel) return;
  panel.hidden = !isNationalModeActive();
  if (panel.hidden) return;

  const nations = getAvailableNations();
  const chosen = getNationalTeamNationality();
  const listEl = document.querySelector("#nationalNationList");
  const titleEl = document.querySelector("#nationalTeamTitle");
  const leadEl = document.querySelector("#nationalTeamLead");
  const statusEl = document.querySelector("#nationalTeamStatus");
  const summaryEl = document.querySelector("#nationalSquadSummary");

  if (titleEl) titleEl.textContent = chosen ? `${chosen}s landslag` : "Velg nasjon";
  if (statusEl) statusEl.textContent = chosen ? "Nasjon valgt" : "Ingen nasjon valgt";

  if (listEl) {
    listEl.replaceChildren();
    if (!nations.length) {
      const empty = document.createElement("p");
      empty.className = "muted-text";
      empty.textContent = "Ingen nasjoner er tilgjengelige ennå. Besøk fotballsteder i History Go – landslagsarenaer som Ullevaal gir landslagsspillerne.";
      listEl.append(empty);
    }
    nations.forEach((nation) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `nation-card${nation.nationality === chosen ? " is-selected" : ""}${nation.playable ? "" : " is-locked"}`;
      button.disabled = !nation.playable;
      const name = document.createElement("strong");
      name.textContent = nation.nationality;
      const meta = document.createElement("small");
      meta.textContent = nation.playable
        ? `${nation.count} spillere å velge blant · ${nation.collected} samlet i History Go`
        : `${nation.count}/${REQUIRED_SQUAD_SIZE} spillere – samle flere fra ${nation.nationality}`;
      button.append(name, meta);
      button.addEventListener("click", () => selectNationalTeamNation(nation.nationality));
      listEl.append(button);
    });
  }

  if (leadEl) {
    leadEl.textContent = chosen
      ? "Troppen er nasjonens grunnstamme pluss spillerne du har samlet – også landslagsstjernene du aldri får signere til klubblaget."
      : "Grunnstammen får du gratis. Stjernene samler du i History Go.";
  }

  if (summaryEl) {
    summaryEl.hidden = !chosen;
    if (chosen) {
      const squad = getUnlockedPlayers();
      const best = [...squad].sort((a, b) => (Number(b.classHeight) || 0) - (Number(a.classHeight) || 0))[0];
      const set = (id, text) => { const el = document.querySelector(id); if (el) el.textContent = text; };
      set("#nationalSquadNation", chosen);
      set("#nationalSquadCount", String(squad.length));
      set("#nationalSquadBest", best ? `${best.name} (${best.classHeight})` : "–");
      set("#nationalSquadNext", squad.length >= REQUIRED_STARTERS ? "Sett laget på Lag" : "Samle flere spillere");
    }
  }
}

// Mesterskapspanelet: enten påmelding (EM/VM), eller den aktive turneringen med
// gruppetabell, bracket og neste motstander. Merittlista står under.
function renderTournamentPanel() {
  const panel = document.querySelector("#tournamentPanel");
  if (!panel) return;
  const nationality = getNationalTeamNationality();
  panel.hidden = !isNationalModeActive() || !nationality;
  if (panel.hidden) return;

  const set = (id, text) => { const el = document.querySelector(id); if (el) el.textContent = text; };
  const tournament = getActiveTournament();
  const choicesEl = document.querySelector("#tournamentChoices");
  const activeEl = document.querySelector("#tournamentActive");
  const historyEl = document.querySelector("#tournamentHistory");

  // Forbundets dom over det siste fullførte mesterskapet.
  const verdictEl = document.querySelector("#federationVerdict");
  if (verdictEl) {
    const verdict = state.federationVerdict || null;
    verdictEl.hidden = !verdict;
    if (verdict) {
      verdictEl.dataset.verdict = verdict.verdict;
      set("#federationVerdictLabel", verdict.sacked
        ? "Forbundets dom · avskjediget"
        : verdict.warning
          ? "Forbundets dom · advarsel"
          : `Forbundets dom · ${verdict.verdictLabel}`);
      set("#federationVerdictHeadline", verdict.headline);
      const trend = verdict.trustDelta >= 0 ? `+${verdict.trustDelta}` : `${verdict.trustDelta}`;
      set("#federationVerdictMessage", `${verdict.federationMessage} Forbundets tillit ${trend} (nå ${verdict.trustAfter}).`);
      renderTextList(document.querySelector("#federationVerdictReasons"), verdict.reasons, (line) => line, "");
    }
  }

  const history = Array.isArray(state.tournamentHistory) ? state.tournamentHistory : [];
  if (historyEl) {
    historyEl.hidden = history.length === 0;
    const list = document.querySelector("#tournamentHistoryList");
    if (list) {
      list.replaceChildren();
      history.slice().reverse().forEach((entry) => {
        const item = document.createElement("li");
        const name = document.createElement("strong");
        name.textContent = `${entry.name} · ${entry.nationality}`;
        const placement = document.createElement("span");
        placement.textContent = entry.verdictLabel
          ? `${entry.placement} · ${entry.won}-${entry.drawn}-${entry.lost} · ${entry.verdictLabel}`
          : `${entry.placement} · ${entry.won}-${entry.drawn}-${entry.lost}`;
        item.append(name, placement);
        list.append(item);
      });
    }
  }

  // Ingen aktiv turnering: vis påmelding.
  if (!tournament || tournament.status !== "active") {
    if (activeEl) activeEl.hidden = true;
    set("#tournamentTitle", "Meld på til mesterskap");
    set("#tournamentStatus", "Ikke påmeldt");
    const available = getAvailableTournaments();
    set("#tournamentLead", available.length
      ? `${nationality} kan melde seg på. Gruppespill først, så utslagsrunder – ett tap for mye og du er ute.`
      : "Mesterskapsdata mangler. Landslagsmodus spilles som enkeltkamper inntil videre.");
    if (choicesEl) {
      choicesEl.hidden = false;
      choicesEl.replaceChildren();
      available.forEach((definition) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tournament-choice";
        const title = document.createElement("strong");
        title.textContent = definition.fullName;
        const meta = document.createElement("small");
        meta.textContent = `${definition.teamCount} nasjoner · ${definition.groupCount} grupper · ${definition.managerMatches} kamper`;
        const frame = document.createElement("span");
        frame.className = "tournament-choice-frame";
        frame.textContent = definition.learningFrame || definition.summary;
        button.append(title, meta, frame);
        button.addEventListener("click", () => startTournament(definition.id));
        choicesEl.append(button);
      });
    }
    return;
  }

  // Aktiv turnering.
  if (choicesEl) choicesEl.hidden = true;
  if (activeEl) activeEl.hidden = false;
  const summary = summarizeTournament(tournament);
  set("#tournamentTitle", `${tournament.fullName} · ${nationality}`);
  set("#tournamentStatus", summary.stageLabel);
  set("#tournamentLead", tournament.learningFrame || tournament.summary);
  set("#tournamentStage", summary.groupName && tournament.stage === "group"
    ? `${summary.stageLabel} · ${summary.groupName}`
    : summary.stageLabel);
  set("#tournamentNextOpponent", summary.nextOpponent
    ? `${summary.nextOpponent.nationality} (${summary.nextOpponent.homeAway === "home" ? "hjemme" : "borte"})`
    : "–");
  set("#tournamentRecord", `${summary.played} kamper · ${summary.won}-${summary.drawn}-${summary.lost}`);
  set("#tournamentGoals", `${summary.goalsFor}–${summary.goalsAgainst}`);
  const hookEl = document.querySelector("#tournamentNextHook");
  if (hookEl) {
    const next = getTournamentNextOpponent(tournament);
    hookEl.textContent = next ? next.narrativeHook : "";
  }

  const managerTeam = getTournamentTeam(tournament, tournament.managerTeamId);
  set("#tournamentGroupTitle", summary.groupName || "Gruppe");
  const tableBody = document.querySelector("#tournamentGroupTable");
  if (tableBody) {
    tableBody.replaceChildren();
    createTournamentGroupTable(tournament, managerTeam?.groupId).forEach((row) => {
      const tr = document.createElement("tr");
      if (row.isManager) tr.className = "is-manager";
      [
        String(row.position),
        row.nationality,
        String(row.played),
        row.goalDifference > 0 ? `+${row.goalDifference}` : String(row.goalDifference),
        String(row.points)
      ].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      });
      tableBody.append(tr);
    });
  }

  const bracketEl = document.querySelector("#tournamentBracket");
  if (bracketEl) {
    bracketEl.replaceChildren();
    const bracket = createTournamentBracket(tournament).filter((stage) => stage.matches.length > 0);
    bracket.forEach((stage) => {
      const block = document.createElement("div");
      block.className = "tournament-bracket-stage";
      const heading = document.createElement("h4");
      heading.textContent = stage.label;
      block.append(heading);
      stage.matches.forEach((match) => {
        const line = document.createElement("p");
        line.className = `tournament-bracket-match${match.involvesManager ? " is-manager" : ""}`;
        const score = match.score
          ? `${match.score}${match.penalties ? ` (str. ${match.penalties})` : ""}`
          : "ikke spilt";
        line.textContent = `${match.home} – ${match.away} · ${score}`;
        block.append(line);
      });
      bracketEl.append(block);
    });
  }
}

// Klubben du leder står i toppen, over alt du gjør. Utenfor ligamodus står den
// generiske tittelen, slik at landslag og Fotballvitenskap ikke later som de er
// klubben din.
function renderHeaderClubIdentity() {
  const name = elements.headerClubName;
  const manager = elements.headerClubManager;
  if (!name || !manager) return;

  const identityRoot = document.querySelector("#clubIdentityHeader");

  if (!isLeagueModeActive() || !getSavedClubName()) {
    name.textContent = "HG Football Manager";
    manager.textContent = "Treneren avgjør. Les klubbens puls, bygg laget på banen og ta de neste beslutningene.";
    renderClubIdentity(identityRoot, createClubIdentityView({
      clubName: "HG Football Manager",
      clubId: "hgfm",
      leagueName: "Managerkontoret"
    }));
    return;
  }

  const model = getLeagueSaveModel();
  const takeover = getTakeoverClub();
  renderClubIdentity(identityRoot, createClubIdentityView({
    clubName: model.clubName,
    clubId: takeover?.id || model.activeLeagueSaveId || model.clubName,
    ground: takeover?.ground || `${model.clubName} stadion`,
    city: takeover?.city || null,
    leagueName: model.leagueName,
    temporary: model.temporaryClubName
  }));
  manager.textContent = model.managerName
    ? `${model.managerName} · ${model.leagueName} · ${model.leagueSeasonStatus}`
    : `${model.leagueName} · ${model.leagueSeasonStatus}`;
}

// «Klubben din» og «Spillmodus» er borte fra Kontor: to bokser som gjentok tall
// managerportalen, klubbuka og footeren allerede viste, og som skjøv de faktiske
// handlingene nedover. Modusbyttet ligger i Innstillinger, der det hører hjemme.
// Det som var ekte her — portalens neste kamp og assistentrådets status — lever
// videre.
function renderGameModeStatus(teamFit) {
  renderOnboardingScreen();
  renderHeaderClubIdentity();
  // Managerkontoret rendres av renderOfficeScene() etter at innboksen og
  // kontekstsignalene er oppdatert. Denne funksjonen eier nå bare modus- og
  // headerstatus, slik at samme informasjon ikke skrives i to presentasjoner.
  void teamFit;
}

function renderOfficeScene(teamFit) {
  const container = elements.officeCommand;
  if (!container) return;
  if (!isLeagueModeActive() || !isLeagueSeasonActive()) {
    container.textContent = "";
    return;
  }

  const assignments = Array.isArray(teamFit?.assignments) ? teamFit.assignments : [];
  const lineupCount = assignments.filter((entry) => entry.player).length;
  const rosterReadiness = getAvailability().rosterReadiness || {};
  const nextActions = computeManagerNextActions(teamFit);
  const readiness = getMatchdayReadiness(teamFit);
  const season = state.leagueSeason;
  const table = season ? createLeagueTable(season) : [];
  const standing = table.find((row) => row.isManager) || null;
  const nextOpponent = season?.status === "active" ? getNextLeagueOpponent(season) : null;
  const seasonScene = createSeasonSceneModel({ season, table, nextMatch: nextOpponent, boardExpectation: getLeagueSaveModel().boardExpectation });

  const model = createOfficeSceneModel({
    clubName: getSavedClubName() || "Managerklubben",
    clubWeekState: state.clubWeekState,
    phaseLabel: state.clubWeekState ? CLUB_WEEK_PHASE_LABELS[state.clubWeekState.phase] || state.clubWeekState.phase : "Oppsett",
    nextActions,
    nextMatch: seasonScene.nextMatch,
    lineupCount,
    rosterCount: Number(rosterReadiness.unlockedCount) || 0,
    trainingSelected: Boolean(state.weeklyTrainingProgram?.programId || state.weeklyTrainingFocus?.focusId),
    inboxAttentionCount: getInboxAttentionCount(),
    inboxFocusTitle: elements.inboxFocusTitle?.textContent || "Innboksen er rolig",
    readiness,
    teamStatus: elements.teamStatus?.textContent || "Laget er ikke vurdert ennå.",
    assistantSignal: elements.contextHeadline?.textContent || nextActions[0]?.hint || "Les klubbens signaler før neste grep.",
    standing,
    lastMatch: state.matchday?.lastMatch || null,
    boardTrust: state.clubWeekState?.boardTrust,
    playerMorale: state.clubWeekState?.playerMorale,
    mediaPressure: state.clubWeekState?.mediaPressure
  });

  renderOfficeCommand(container, model, { onOpenArea: (target) => activateTab(target) });
}

function renderModeIsolation() {
  const mode = state.modeEnvelope?.activeMode || "league";
  document.documentElement.dataset.activeMode = mode;
  const leagueMode = mode === "league";
  // Før-sesong-fokus: så lenge ligasesongen ikke er aktiv ennå (før-sesong)
  // skal Oversikt ha ÉN tydelig vei videre — før-sesong-sjekklista, klubbkortet
  // og footerens «Neste handling». De rene in-season-/kampflatene lekker inn som
  // en vegg av konkurrerende «neste»-kort før laget er bygd og terminlista
  // finnes: managerportalen («Neste kamp: låst», «Neste beslutning»),
  // off-pitch-signalene og «Flere åpne beslutninger». De er premature nå og
  // kommer tilbake automatisk når sesongen er aktiv.
  const leaguePreseason = leagueMode && !isLeagueSeasonActive();
  document.querySelectorAll("[data-league-only]").forEach((node) => { node.hidden = !leagueMode; });
  document.querySelectorAll(".club-topbar, #clubWeekFeedback, .club-week-event-log-panel")
    .forEach((node) => { node.hidden = !leagueMode; });
  document.querySelectorAll(".office-command-panel, .office-depth, #offPitchSignalCard, .decision-strip")
    .forEach((node) => { node.hidden = !leagueMode || leaguePreseason; });
  // Kontor: knapperaden med dype popup-er hører til ligamodus; «Flere
  // beslutninger» er fortsatt prematur i før-sesong.
  document.querySelectorAll(".kontor-deep-actions")
    .forEach((node) => { node.hidden = !leagueMode; });
  document.querySelectorAll(".kontor-deep-decisions")
    .forEach((node) => { node.hidden = !leagueMode || leaguePreseason; });
  if (mode !== "league") {
    document.querySelectorAll(".league-season-panel, .league-onboarding-panel, .league-club-card")
      .forEach((node) => { node.hidden = true; });
  }
  if (mode !== "national") {
    document.querySelectorAll(".national-team-panel").forEach((node) => { node.hidden = true; });
  }
  // Menyen skal si sannheten om hvilken modus du er i. Hver nav-fane (og noen
  // få flater) bærer `data-nav-modes` med modiene den hører hjemme i:
  // Scenario-fanen finnes bare i scenariomodus, Fotballvitenskap bare i sin
  // egen modul. Å la alle fanene stå framme i alle modi var halve grunnen til
  // at navigasjonen føltes tilfeldig.
  applyModeScopedNav(mode);

  const bar = document.querySelector("#secondaryModeBar");
  if (bar) {
    bar.hidden = mode === "league";
    const title = bar.querySelector("#secondaryModeTitle");
    const hint = bar.querySelector("#secondaryModeHint");
    const barTitle = { scenario: "Scenario", national: "Landslag", training: "Fotballvitenskap" };
    if (title) title.textContent = barTitle[mode] || "Fotballvitenskap";
    if (hint) {
      if (mode === "scenario") {
        const active = getScenario(state.scenarios, state.gameStartState?.activeScenarioId);
        hint.textContent = active ? `${active.name} · spill neste scenariokamp` : "Velg scenario";
      } else if (mode === "national") {
        hint.textContent = getNationalTeamNationality()
          ? `${getNationalTeamNationality()}s landslag · ta ut troppen`
          : "Velg nasjon";
      } else {
        hint.textContent = "Lær fotball · formasjonsbiblioteket epoke for epoke · ingenting her rører klubben din";
      }
    }
  }
}

// Vis bare de nav-fanene som hører til den aktive modusen, og sørg for at den
// aktive fanen faktisk er en av dem. Uten det siste kunne en modusbytte etterlate
// deg stående på en flate hvis fane nettopp forsvant fra menyen — synlig innhold
// uten en meny som forklarer hvor du er.
function applyModeScopedNav(mode) {
  const scoped = Array.from(document.querySelectorAll("[data-nav-modes]"));
  scoped.forEach((node) => {
    node.hidden = !String(node.dataset.navModes || "").split(/\s+/).includes(mode);
  });

  const allowedTabs = new Set(
    scoped
      .filter((node) => !node.hidden && node.dataset.tabTarget)
      .map((node) => node.dataset.tabTarget)
  );
  if (allowedTabs.size === 0) return;

  const activeSection = document.querySelector("[data-tab-section]:not([hidden])");
  const activeTarget = activeSection?.dataset.tabSection;
  if (!activeTarget) return;

  // Kontorets avdelinger har ingen egen fane og skal aldri tvinges bort.
  const activeTab = document.querySelector(`.nav-tab[data-tab-target="${activeTarget}"]`);
  if (!activeTab) return;

  // `data-nav-section-modes` skiller «hvor fanen vises» fra «hvor flaten er
  // lovlig». Formasjonsbiblioteket har bare fane i Fotballvitenskap, men åpnes
  // som oppslagsverk fra Taktikk i spillet — da skal du få bli der.
  const sectionModes = String(activeTab.dataset.navSectionModes || activeTab.dataset.navModes || "").split(/\s+/);
  if (!sectionModes.includes(mode)) {
    activateTab(allowedTabs.has("dashboard") ? "dashboard" : [...allowedTabs][0]);
    return;
  }

  // Synligheten kan nettopp ha endret seg (biblioteket får egen fane i
  // Fotballvitenskap), så markeringen må regnes om etterpå.
  highlightActiveTab();
}

function renderFirstTimePlaythrough(teamFit) {
  renderNationalTeamPanel();
  renderTournamentPanel();
  renderGameModeStatus(teamFit);
  const card = elements.firstTimePlaythroughCard;
  if (!card || card.hidden) return;
  const ft = buildFirstTimeNextActionState(teamFit);
  if (!ft.active) {
    if (elements.firstTimeAssistant) {
      elements.firstTimeAssistant.textContent = "Start i ligaspill: skaff tropp, sett startellever, velg trening og spill neste ligakamp.";
    }
    return;
  }
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

function loadLeagueSeason() {
  try { return normalizeLeagueSeason(JSON.parse(localStorage.getItem(LEAGUE_SEASON_KEY))); }
  catch (_) { return null; }
}

function saveLeagueSeason() {
  try {
    if (state.leagueSeason) localStorage.setItem(LEAGUE_SEASON_KEY, JSON.stringify(state.leagueSeason));
    else localStorage.removeItem(LEAGUE_SEASON_KEY);
  } catch (_) { /* memory-only fallback */ }
}

function loadLeaguePlayoff() {
  try { return normalizeLeaguePlayoff(JSON.parse(localStorage.getItem(LEAGUE_PLAYOFF_KEY))); }
  catch (_) { return null; }
}

function saveLeaguePlayoff() {
  try {
    if (state.leaguePlayoff) localStorage.setItem(LEAGUE_PLAYOFF_KEY, JSON.stringify(state.leaguePlayoff));
    else localStorage.removeItem(LEAGUE_PLAYOFF_KEY);
  } catch (_) { /* memory-only fallback */ }
}

// Sesongen endte på en kvalifiseringsplass: sett opp kampene. Idempotent på
// sesongnummer, så en omlasting aldri lager kvalifiseringen på nytt.
function ensureLeaguePlayoff() {
  const season = state.leagueSeason;
  if (!season || season.status !== "completed") return;
  if (state.leaguePlayoff) return;
  if (!isPlayoffPending(season)) return;

  const outcome = resolveLeagueOutcome(season);
  const playoff = createLeaguePlayoff({
    outcome: { ...outcome, seasonNumber: season.seasonNumber },
    managerClub: season.clubs.find((club) => club.id === season.managerClubId),
    allClubs: state.leaguePyramid?.clubs || [],
    tiers: state.leaguePyramid?.tiers || [],
    seed: `${season.seed}-kval-${season.seasonNumber}`
  });
  if (!playoff) return;

  state.leaguePlayoff = playoff;
  saveLeaguePlayoff();
  const described = describePlayoff(playoff);
  addClubWeekEvent({
    id: `kval-${season.seasonNumber}`,
    week: state.clubWeekState?.week ?? "?",
    phase: "matchday",
    phaseLabel: "Kvalifisering",
    message: `${outcome.position}. plass ga kvalifisering. ${described.headline} mot ${described.opponentName}.`
  });
}

// Kvalifiseringen er spilt ferdig: gi utfallet videre og rydd den bort.
function consumeLeaguePlayoffResolution() {
  const playoff = state.leaguePlayoff;
  if (!playoff || playoff.status === "active") return null;
  return resolveLeaguePlayoff(playoff);
}

// Manager-kontekst som mini-sesongen leser (off-pitch + Club Week-verdier). Den
// brukes til å avlede sesongmål/styreforventning og til kontekstuell vurdering.
// Leser kun manager-state — aldri History Go-progresjon.
function getMiniSeasonContext() {
  const base = {
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

  // Et scenario er nettopp et UTVALG av disse motstanderne, med sin egen
  // fortelling. Uten dette møtte alle scenarioer det samme feltet, og
  // «Kontringens kunst» var ikke annerledes enn «Pressets tiår».
  const scenario = getScenario(state.scenarios, state.gameStartState?.activeScenarioId);
  if (isScenarioModeActive() && scenario) {
    return createScenarioMiniSeasonContext(scenario, base) || base;
  }
  return base;
}

// Lagre gjeldende mini-sesong. Stille no-op hvis lagring feiler (privat modus).
function saveMiniSeason() {
  if (!shouldWriteLegacyLeagueStorage()) return;
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

  const rosterReadiness = getAvailability().rosterReadiness;
  if (!rosterReadiness.hasEnoughUnlocked) {
    activateTab("historygo");
    return;
  }
  if (!rosterReadiness.isReady) {
    activateTab("tactics");
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

// League Loop v0.2: i ligamodus ER sesongen terminlista. Den opprettes først
// når før-sesongsgaten har eksplisitt aktivert en league-save, med samme rene
// motor som prøveperioden — men uten scenario-sideeffekter (rører aldri
// firstTimePlaythrough). Aktiv/fullført sesong røres ikke.
function ensureLeagueSeason() {
  if (!isLeagueModeActive() || state.leagueSeason || !state.gameStartState?.activeLeagueSaveId) {
    return;
  }
  if (state.gameStartState?.leagueSeasonStatus !== "active") {
    return;
  }
  if (!isLeaguePreseasonReady(getTeamFit())) {
    return;
  }

  const start = getLeagueStartTier();
  const managerClub = buildManagerClubForSeason(start.tier);
  if (!managerClub) return;
  state.leagueSeason = createLeagueSeason({
    managerClub,
    opponents: start.opponents,
    tier: start.tier,
    seed: `${state.gameStartState.activeLeagueSaveId}-season-1`
  });
  saveLeagueSeason();

  const rounds = state.leagueSeason.competition.rounds;
  const matches = state.leagueSeason.fixtures.reduce((sum, entry) => sum + entry.matches.length, 0);
  addClubWeekEvent({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    week: state.clubWeekState?.week ?? "?",
    phase: state.clubWeekState?.phase || "analysis",
    phaseLabel: "Ligasesong",
    message: `${start.tier.name} er i gang: ${rounds} serierunder og ${matches} kamper står på terminlista.`
  });
}

// Nivået manageren starter på, og motstanderne der. Uten pyramiden faller vi
// tilbake på motorens standardnivå — men da uten klubber, så sesongen kastes
// heller enn å bli spilt mot ingen. Derfor: pyramiden er kilden.
//
// Tok manageren over en etablert klubb, starter han der KLUBBEN står — tar du
// over Skeid, begynner du i 2. divisjon. Det er ikke en straff, det er hvor
// klubben er.
function getLeagueStartTier() {
  return resolveStartTier({
    takeoverClub: getTakeoverClub(),
    tiers: state.leaguePyramid?.tiers || [],
    clubs: state.leaguePyramid?.clubs || []
  }) || { tier: DEFAULT_LEAGUE_TIER, group: null, opponents: [] };
}

// Hva klubbvalget gir deg av spillere: klubbens historiske navn hvis du har vært
// på banen, ellers en automatisk grunntropp og en oppfordring om å samle.
//
// Motoren LESER History Go-progresjonen (besøkte steder) — den skriver aldri.
function getClubSquadAccess(club) {
  if (!club) return null;
  // Kun klubbspillere er kandidater til grunntroppen: landslagsarenaene
  // (Ullevaal, Maracanã) er noe du samler, ikke noe du får utdelt.
  const candidateIds = new Set();
  (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : []).forEach((place) => {
    if (isNationalArenaPlace(place)) return;
    (Array.isArray(place?.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (unlock && isPlayerUnlockType(unlock.type) && typeof unlock.targetId === "string") {
        candidateIds.add(unlock.targetId);
      }
    });
  });
  return resolveClubSquadAccess({
    club,
    players: Array.isArray(state.players) ? state.players : [],
    unlockedPlaceIds: getHistoryGoCollectedSportPlaceIds(),
    candidateIds,
    squadSize: REQUIRED_SQUAD_SIZE
  });
}

// Den etablerte klubben manageren tok over, eller null når klubben er egenlaget.
function getTakeoverClub() {
  const id = state.gameStartState?.takeoverClubId;
  if (!id) return null;
  return (state.leaguePyramid?.clubs || []).find((club) => club.id === id) || null;
}

// Managerklubben slik ligamotoren vil ha den: enten den etablerte klubben, eller
// den egenopprettede.
function buildManagerClubForSeason(tier) {
  const takeover = getTakeoverClub();
  if (takeover) {
    return createManagerClubFromSelection({
      club: takeover,
      profile: state.leagueClubProfiles[takeover.id] || null,
      managerName: state.gameStartState?.managerName || ""
    });
  }
  return createOwnManagerClub({
    clubName: getTemporaryClubName().name,
    saveId: state.gameStartState.activeLeagueSaveId,
    tier,
    managerName: state.gameStartState?.managerName || ""
  });
}

// Styrets forventning første sesong. En egenopprettet klubb har ingen historie
// og får det tålmodige målet; tar du over en storklubb, arver du styret dens.
function getClubExpectation() {
  const takeover = getTakeoverClub();
  if (!takeover) return null;
  const tier = (state.leaguePyramid?.tiers || []).find((entry) => entry.id === takeover.tier);
  return tier ? deriveClubExpectation(takeover, state.leaguePyramid?.clubs || [], tier) : null;
}

// Etter fullført ligasesong: legg den bak deg og start neste. Rører kun
// mini-sesong-state — aldri History Go-unlocks, merits eller Club Week.
function startLeagueSeasonFromOnboarding() {
  if (!isLeagueModeActive() || state.leagueSeason?.status === "active") {
    return;
  }
  if (!isLeaguePreseasonReady(getTeamFit())) {
    return;
  }
  state.gameStartState = normalizeGameStartState({ ...state.gameStartState, ...createLeagueSaveExtras() });
  saveGameStartState();
  ensureLeagueSeason();
  renderApp();
}

const SEASON_ARCHIVE_KEY = "hgfm.seasonArchive.v1";

// ---------------------------------------------------------------------------
// Sesongdom og merittliste
// Motoren (`football-season-review.js`) er ren; her ligger lagringen, koblingen
// til styretilliten og sesongrullen.
// ---------------------------------------------------------------------------

function normalizeSeasonArchive(value) {
  return Array.isArray(value) ? value.filter((entry) => Number.isFinite(Number(entry?.seasonNumber))) : [];
}

function loadSeasonArchive() {
  try {
    return normalizeSeasonArchive(JSON.parse(localStorage.getItem(SEASON_ARCHIVE_KEY) || "null"));
  } catch (error) {
    console.error("Kunne ikke lese merittlista", error);
    return [];
  }
}

function saveSeasonArchive() {
  try {
    localStorage.setItem(SEASON_ARCHIVE_KEY, JSON.stringify(normalizeSeasonArchive(state.seasonArchive)));
  } catch (error) {
    console.error("Kunne ikke lagre merittlista", error);
  }
}

function getSeasonArchive() {
  return normalizeSeasonArchive(state.seasonArchive);
}

// Målet styret setter for inneværende sesong: en tabellplass, avledet av der du
// endte sist. Brukes både til dommen og til å vise forventningen underveis.
function getSeasonTarget() {
  const archive = getSeasonArchive();
  const previous = archive[archive.length - 1] || null;
  return deriveSeasonTarget({
    clubCount: state.leagueSeason?.clubs?.length || 8,
    seasonNumber: Number(state.leagueSeason?.seasonNumber) || 1,
    previousPosition: previous ? Number(previous.position) : null,
    // Tok du over en etablert klubb, arver du styrets forventning fra dag én.
    clubExpectation: getClubExpectation()
  });
}

// Spilte manageren klubbens fotball? Bare aktuelt for en overtatt klubb — en
// egenopprettet klubb har ingen tradisjon å svikte.
//
// Dommen er en STYREDOM, ikke en motor: den rører aldri en kamp, en spiller
// eller en score. Uten den var «Styret venter at du spiller klubbens fotball»
// i onboardingen et løfte ingenting leste.
function getClubTraditionVerdict() {
  const takeover = getTakeoverClub();
  if (!takeover) return null;
  const clubProfile = state.leagueClubProfiles[takeover.id] || null;
  const formation = state.formations?.find((entry) => entry.id === state.selectedFormationId) || null;
  const knowledge = state.formationKnowledgeById[state.selectedFormationId] || null;
  if (!clubProfile || !knowledge?.parameterProfile) return null;

  const profiles = Object.values(state.leagueClubProfiles || {});
  return judgeClubTradition({
    clubProfile,
    formationProfile: knowledge.parameterProfile,
    formationName: formation?.name || knowledge.displayName || "systemet ditt",
    thresholds: buildTraditionThresholds(profiles),
    profiles,
    // Dommen måles mot det som er OPPNÅELIG for klubben — ellers ville 44 av 60
    // klubber aldri kunne nå toppdommen uansett hva manageren valgte.
    formationProfiles: Object.values(state.formationKnowledgeById || {})
      .map((entry) => entry?.parameterProfile)
      .filter(Boolean)
  });
}

// Sesongen er ferdig: bygg dommen, flytt styretilliten og arkiver sesongen.
// Idempotent på sesongnummer, så reload aldri dømmer samme sesong to ganger.
function registerSeasonReview(season) {
  if (!season || season.status !== "completed") return;
  const seasonNumber = Number(season.seasonNumber) || 1;
  if (getSeasonArchive().some((entry) => Number(entry.seasonNumber) === seasonNumber)) return;

  const review = createSeasonReview({
    season,
    table: createLeagueTable(season),
    target: getSeasonTarget(),
    playerStats: state.playerSeasonStats?.rows || [],
    previousReviews: getSeasonArchive(),
    boardTrust: Number(getOffPitchState()?.boardTrust) || 50,
    // Overtok du en klubb, dømmer styret også på om du spilte klubbens fotball.
    tradition: getClubTraditionVerdict()
  });
  if (!review) return;

  state.seasonReview = review;
  state.seasonArchive = appendSeasonArchive(getSeasonArchive(), createSeasonArchiveEntry(review, {
    playerStats: state.playerSeasonStats?.rows || []
  }));
  saveSeasonArchive();

  addClubWeekEvent({
    id: `season-review-${seasonNumber}`,
    week: state.clubWeekState?.week ?? "?",
    phase: "review",
    phaseLabel: "Sesongslutt",
    message: `${review.headline} ${review.boardMessage}`
  });
}

function startNewLeagueSeason() {
  if (!isLeagueModeActive() || state.leagueSeason?.status === "active") {
    return;
  }
  // Står kvalifiseringen uspilt, er sesongen ikke ferdig avgjort. Å rulle videre
  // her ville sluppet manageren forbi kampene som avgjør nivået hans.
  ensureLeaguePlayoff();
  if (state.leaguePlayoff?.status === "active") {
    return;
  }
  // Sørg for at sesongen som avsluttes faktisk er dømt og arkivert før vi
  // ruller videre — ellers ville en sesong kunne forsvinne uten spor.
  registerSeasonReview(state.leagueSeason);

  state.gameStartState = normalizeGameStartState({ ...state.gameStartState, ...createLeagueSaveExtras() });
  saveGameStartState();

  // Ny sesong = ny statistikk. Uten dette bar toppscorerlista på fjorårets mål
  // i det uendelige, og «kamper spilt» ble et karrieretall forkledd som en
  // sesong.
  state.playerSeasonStats = { rows: [], matchIds: [] };
  savePlayerSeasonStats();

  // Sommerferie: troppen hviler ut mellom sesongene.
  state.playerCondition = applySummerBreak(getPlayerCondition());
  state.playerConditionMatchIds = [];
  savePlayerCondition();

  // Dommen er lest; den nye sesongen starter uten den hengende over seg.
  state.seasonReview = null;

  // Pyramiden inn: uten den blir neste sesong samme nivå med samme klubber,
  // og opp-/nedrykket manageren nettopp spilte for skjer ikke.
  const playoffResolution = consumeLeaguePlayoffResolution();
  state.leagueSeason = state.leagueSeason
    ? startNextLeagueSeason(state.leagueSeason, {
      allClubs: state.leaguePyramid?.clubs || null,
      tiers: state.leaguePyramid?.tiers || null,
      playoffResolution
    })
    : null;
  // Kvalifiseringen er brukt opp; den skal ikke henge igjen i neste sesong.
  state.leaguePlayoff = null;
  saveLeaguePlayoff();
  saveLeagueSeason();
  if (!state.leagueSeason) ensureLeagueSeason();
  renderApp();
}

// Neste planlagte motstander som full motstanderprofil, eller null når ingen
// mini-sesong er aktiv (da beholder kampdagen dagens tilfeldige motstander).
function getMiniSeasonNextOpponent() {
  // Landslagsmodus med aktivt mesterskap: terminlisten er turneringens.
  if (isNationalModeActive()) {
    return getTournamentMatchdayOpponent();
  }
  if (isLeagueModeActive()) {
    // Kvalifiseringen går foran serien: er den aktiv, er DEN kampen som skal
    // spilles. Uten dette ville kvalifiseringsplassen vært en plass uten kamper.
    const playoffOpponent = getPlayoffMatchdayOpponent(state.leaguePlayoff);
    if (playoffOpponent) {
      const playoffProfile = state.leagueClubProfiles[playoffOpponent.id] || null;
      const playoffBase = playoffProfile || OPPONENT_PROFILES[0];
      return {
        ...playoffBase,
        id: playoffOpponent.id,
        name: playoffOpponent.name,
        displayName: playoffOpponent.name,
        strength: playoffOpponent.strength,
        homeAway: playoffOpponent.homeAway,
        ground: playoffOpponent.ground,
        archetypeName: playoffProfile?.styleName || playoffBase.archetypeName || null,
        isClubProfile: Boolean(playoffProfile),
        isPlayoff: true,
        playoffRoundName: playoffOpponent.playoffRoundName
      };
    }
    const opponent = getNextLeagueOpponent(state.leagueSeason);
    if (!opponent) return null;
    // Klubben eier identitet og nivå; profilen eier fotballen.
    //
    // Her lette koden før etter klubb-id-en (`molde`, `brann` …) blant de fem
    // GENERISKE profilene, som heter `high_press_opponent` og lignende. Den
    // kunne aldri treffe, så `|| OPPONENT_PROFILES[0]` slo inn hver gang: alle
    // fjorten serierunder ble spilt mot samme profil med byttet navnelapp.
    //
    // Profilene er tegnet på klubbenes EGEN spilletradisjon, ikke på historiske
    // arketyper. Arketypene hører til scenarioer og mesterskap — møter du dem
    // fjorten ganger i serien, slutter de å være noe.
    const clubProfile = state.leagueClubProfiles[opponent.id] || null;
    const base = clubProfile || OPPONENT_PROFILES[0];
    return {
      ...base,
      id: opponent.id,
      name: opponent.name,
      displayName: opponent.name,
      // Klubbens egen styrke gjelder — profilen leverer stilen, ikke nivået.
      strength: opponent.strength,
      homeAway: opponent.homeAway,
      ground: opponent.ground,
      tacticalIdentity: opponent.tacticalIdentity,
      // Kampbriefen leser `archetypeName`; for en klubb er det spillestilen
      // hennes, ikke en historisk arketyp.
      archetypeName: clubProfile?.styleName || base.archetypeName || null,
      isClubProfile: Boolean(clubProfile)
    };
  }
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
  if (isNationalModeActive()) {
    registerMatchInTournament(lastMatch);
    return;
  }
  // Kvalifiseringen først: er den aktiv, er det den som skal ha resultatet.
  if (isLeagueModeActive() && state.leaguePlayoff?.status === "active" && lastMatch) {
    const updatedPlayoff = completePlayoffLeg(state.leaguePlayoff, lastMatch);
    if (updatedPlayoff !== state.leaguePlayoff) {
      state.leaguePlayoff = updatedPlayoff;
      saveLeaguePlayoff();
      const described = describePlayoff(updatedPlayoff);
      addClubWeekEvent({
        id: `kval-${state.leagueSeason?.seasonNumber ?? "x"}-${updatedPlayoff.currentRoundIndex}-${updatedPlayoff.rounds[updatedPlayoff.currentRoundIndex]?.legs.filter((leg) => leg.status === "completed").length ?? 0}`,
        week: state.clubWeekState?.week ?? "?",
        phase: "matchday",
        phaseLabel: "Kvalifisering",
        message: `${described.headline} ${described.detail}`
      });
      window.dispatchEvent(new Event("updateProfile"));
    }
    return;
  }
  if (isLeagueModeActive() && state.leagueSeason?.status === "active" && lastMatch) {
    const previousRound = state.leagueSeason.currentRound;
    const updated = completeLeagueRound(state.leagueSeason, lastMatch);
    if (updated !== state.leagueSeason) {
      state.leagueSeason = updated;
      if (updated.status === "completed") {
        state.gameStartState.leagueSeasonStatus = "completed";
        // Styret gjør opp regnskapet. Før sa statuslinja bare hvem som ble
        // seriemester — forventningen de satte da klubben ble opprettet ble
        // aldri målt mot noe.
        registerSeasonReview(updated);
        // Endte sesongen på en kvalifiseringsplass, skal kampene spilles før
        // noen ny sesong kan starte.
        ensureLeaguePlayoff();
      }
      saveLeagueSeason(); saveGameStartState();
      addClubWeekEvent({ id: `league-r${previousRound}`, week: previousRound, phase: "matchday", phaseLabel: "Ligaspill", message: `Serierunde ${previousRound} er ferdig. Alle fire resultater er registrert.` });
      window.dispatchEvent(new Event("updateProfile"));
    }
    return;
  }
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
  if (isLeagueModeActive()) return;
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
  // Siste nivå er bevisst «hvem som helst som er ledig». Krever formasjonen
  // flere av en posisjon enn troppen har (f.eks. 1-1-8), ville et hardt filter
  // etterlate tomme plasser og en blindvei: manageren fikk beskjed om å fylle
  // dem, men ingen kunne fylles. Feilbruk er lov – det er nettopp det spillet
  // handler om: motoren merker plassen som feilbrukt og forklarer hvorfor,
  // i stedet for å blokkere. Manageren kan alltid bytte selv.
  // Skadde spillere holdes utenfor de tre første nivåene, men IKKE det siste.
  // Har skadene tømt troppen, må elleveren fortsatt kunne fylles — ellers er en
  // skade en blindvei i stedet for et problem å løse. Å spille en skadet mann
  // er da managerens valg, og flaten sier det.
  const injured = injuredPlayerIds(getPlayerCondition());
  const fit = (candidate) => !injured.has(candidate.id);
  const tiers = [
    (candidate) => fit(candidate) && candidate.naturalPositions.includes(slot.position),
    (candidate) => fit(candidate) && candidate.usablePositions.includes(slot.position),
    (candidate) => fit(candidate) && !candidate.poorFits.includes(slot.position),
    (candidate) => fit(candidate),
    () => true
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

// Fyll tomme plasser i startelleveren automatisk fra opplåste spillere. Dette
// gjør «Fyll neste ledige plass»-knappen til en ekte handling i stedet for bare
// å velge plassen (den gamle oppførselen var et løftebrudd: knappen «fylte»
// ingenting). En plass uten spiller får beste ledige spiller + standardrolle; en
// plass med spiller men uten rolle får standardrollen. Manageren kan alltid
// endre valget etterpå — dette er et startpunkt, ikke en fasit.
//
// `fillAll = false` fyller kun neste ledige plass (og velger den, så editoren
// øverst peker på den). `fillAll = true` fyller alle ledige plasser i én omgang.
// Returnerer antall plasser som ble fylt. Er ingen spillere ledige, gjøres
// ingenting her — kalleren faller tilbake til å bare velge plassen.
function fillEmptyLineupSlots(fillAll = false) {
  const formation = getFormation();
  if (!formation) {
    return 0;
  }

  const availablePlayers = getUnlockedPlayers();
  let filled = 0;
  let firstFilledSlotId = null;

  for (const slot of formation.slots) {
    const slotState = state.lineup[slot.slotId] || { playerId: null, roleId: null };

    // Har plassen allerede spiller, men mangler rolle: sett standardrollen.
    if (slotState.playerId) {
      if (!slotState.roleId) {
        const player = availablePlayers.find((item) => item.id === slotState.playerId) || null;
        state.lineup[slot.slotId] = { playerId: slotState.playerId, roleId: getDefaultRoleForPlayer(player, slot) };
        filled += 1;
        if (!firstFilledSlotId) firstFilledSlotId = slot.slotId;
        if (!fillAll) break;
      }
      continue;
    }

    // Tom plass: finn beste ledige spiller (respekterer naturlig posisjon først).
    const usedPlayerIds = getUsedPlayerIds(slot.slotId);
    const player = findBestAvailablePlayerForSlot(slot, usedPlayerIds, availablePlayers);
    if (!player) {
      continue;
    }

    state.lineup[slot.slotId] = { playerId: player.id, roleId: getDefaultRoleForPlayer(player, slot) };
    filled += 1;
    if (!firstFilledSlotId) firstFilledSlotId = slot.slotId;
    if (!fillAll) break;
  }

  if (filled > 0) {
    if (firstFilledSlotId) state.selectedSlotId = firstFilledSlotId;
    invalidateAvailability();
  }

  return filled;
}

// Handling bak «Fyll neste ledige plass»-knappen: fyll neste tomme plass hvis
// mulig, ellers pek manageren på plassen (og troppen mangler da spillere —
// «Neste beslutninger» guider videre til History Go-samlingen).
function fillNextEmptySlotAction(slotId) {
  return () => {
    const filled = fillEmptyLineupSlots(false);
    if (filled === 0) {
      // Ingen ledige spillere å fylle med: velg plassen så editoren øverst vises.
      state.selectedSlotId = slotId;
    }
    activateTab("tactics");
    renderApp();
  };
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
    return withCurrentPitchLayout(JSON.parse(localStorage.getItem(POSITIONS_KEY)));
  } catch (error) {
    return {};
  }
}

// Forkast koordinatsett fra en eldre banelayout. Returnerer alltid et objekt
// stemplet med gjeldende layoutversjon.
function withCurrentPitchLayout(value) {
  const isObject = Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (!isObject || value[PITCH_LAYOUT_FIELD] !== PITCH_LAYOUT_VERSION) {
    return { [PITCH_LAYOUT_FIELD]: PITCH_LAYOUT_VERSION };
  }
  return value;
}

function saveStoredPositions(all) {
  if (!shouldWriteLegacyLeagueStorage()) return;
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
  if (!shouldWriteLegacyLeagueStorage()) return;
  try {
    localStorage.setItem(ACTIVE_KNOWLEDGE_FOCUS_KEY, principleId);
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

function clearActiveKnowledgeFocus() {
  if (!shouldWriteLegacyLeagueStorage()) return;
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
  if (!shouldWriteLegacyLeagueStorage()) return;
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
  if (!shouldWriteLegacyLeagueStorage()) return;
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
  // Valgt trening nudger uka til Kampplan-fasen (gate-sikkert).
  syncClubWeekPhaseToProgress().catch(console.error);
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
  if (!shouldWriteLegacyLeagueStorage()) return;
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
  // Valgt treningsprogram nudger uka til Kampplan-fasen (gate-sikkert).
  syncClubWeekPhaseToProgress().catch(console.error);
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
  if (!shouldWriteLegacyLeagueStorage()) return;
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
  if (!shouldWriteLegacyLeagueStorage()) return;
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

// Club Week Orchestrator v1.1: hvilken fase spillerens FAKTISKE fremdrift denne
// uka tilsier. Ren avlesning av state (ingen ny motor): spilt kamp → Oppsummering,
// valgt trening → Kampplan, håndtert innboks → Trening. Null når ingen handling
// ennå tilsier en fremrykning (da styrer «Neste fase»-knappen manuelt).
function clubWeekPhaseTargetFromProgress() {
  const week = Number(state.clubWeekState?.week) || 1;
  if (state.matchday?.lastMatch?.playedInClubWeek === week) return "review";
  if (state.weeklyTrainingProgram?.programId || state.weeklyTrainingFocus?.focusId) return "match_prep";
  if (hasAcknowledgedInboxThisWeek()) return "training";
  return null;
}

// Rull klubbukens fase FRAMOVER til den fasen spillerens handlinger tilsier, via
// den eksisterende fasemotoren (advanceClubWeekPhaseAction). Gate-sikker
// (kampdag→oppsummering krever spilt kamp, som nettopp er oppfylt når
// target=review), går aldri bakover, ruller aldri over til ny uke (stopper på
// review), og er idempotent når fasen alt er på/forbi målet. Orkestrering, ikke
// en ny motor — samme transitions/konsekvenser som «Neste fase»-knappen.
async function syncClubWeekPhaseToProgress() {
  if (!state.clubWeekState) return;
  const target = clubWeekPhaseTargetFromProgress();
  if (!target) return;
  const targetIdx = CLUB_WEEK_PHASE_IDS.indexOf(target);
  if (targetIdx < 0) return;

  for (let i = 0; i < CLUB_WEEK_PHASE_IDS.length; i++) {
    const before = state.clubWeekState;
    const currentIdx = CLUB_WEEK_PHASE_IDS.indexOf(before?.phase);
    if (currentIdx < 0 || currentIdx >= targetIdx) break;
    if (getClubWeekMatchdayGate().isBlocked) break;
    await advanceClubWeekPhaseAction();
    // Stopp hvis fasen ikke beveget seg eller uka rullet over (sikkerhetsnett).
    if (state.clubWeekState === before || state.clubWeekState?.week !== before.week) break;
  }
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
  if (!shouldWriteLegacyLeagueStorage()) return;
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
    // Samme regel som adapteren: bare linjer med ekte breddespillere strekkes
    // ut til sidelinja. Ellers ville et sentralt par (to spisser, to stoppere)
    // havnet på 14 % og 86 % – ute på vingen.
    const xs = lineXPositions(slots.map((slot) => slot.position));

    slots.forEach((slot, index) => {
      positions[slot.slotId] = { x: xs[index], y };
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

  // Sesjonen (modus-konvolutten) kan bære et koordinatsett fra en eldre
  // banelayout. Er stempelet borte eller utdatert, forkastes settet her – ellers
  // ville et lagret spill beholdt den gamle, feilaktige plasseringen.
  if (state.slotPositions && state.slotPositions[PITCH_LAYOUT_FIELD] !== PITCH_LAYOUT_VERSION) {
    state.slotPositions = {};
  }

  const all = loadStoredPositions();
  const defaults = computeDefaultPositions(formation);
  const stored = all[formation.id] || {};

  const merged = {};

  formation.slots.forEach((slot) => {
    merged[slot.slotId] = stored[slot.slotId] || defaults[slot.slotId];
  });

  merged[PITCH_LAYOUT_FIELD] = PITCH_LAYOUT_VERSION;
  all[formation.id] = merged;
  all[PITCH_LAYOUT_FIELD] = PITCH_LAYOUT_VERSION;
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
    if (item.tooltipText) {
      title.title = item.tooltipText;
    }

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

    if (item.handbookText) {
      const handbook = document.createElement("details");
      handbook.className = "knowledge-handbook";
      const handbookSummary = document.createElement("summary");
      handbookSummary.textContent = "Mer forklaring";
      const handbookText = document.createElement("p");
      handbookText.textContent = item.handbookText;
      handbook.append(handbookSummary, handbookText);
      card.append(handbook);
    }

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

  // Kampplanens formasjonsarv sto tidligere i selve navnet («Bredt og hurtig
  // 4-3-3»), og fikk kampplanvelgeren til å se ut som en formasjonsvelger nummer
  // to — med et tall som motsa den valgte formasjonen. Arven hører hjemme som en
  // opplysning under valget, ikke i navnet.
  const originHint = document.querySelector("#tacticOriginHint");
  if (originHint) {
    const tactic = getTactic();
    const origin = typeof tactic?.formation === "string" ? tactic.formation.trim() : "";
    originHint.textContent = origin ? `Fra ${origin}-tradisjonen` : "";
    originHint.hidden = !origin;
  }
}

// Hvor stor plass har én brikke på banen? Det avhenger av formasjonen, ikke av
// skjermen: en 4-4-2 har fire på bredeste rad og 24 % mellom radene, mens en
// 1-1-8 har åtte på rad. Med én fast brikkestørrelse la de tette formasjonene
// brikkene oppå hverandre.
//
// Bredden regnes ut eksakt (vi kjenner avstanden mellom naboene). Høyden kan vi
// ikke regne oss fram til: brikkas innhold har minstestørrelser i piksler, så på
// en liten bane blir den relativt høyere enn matematikken tilsier. Derfor MÅLER
// vi den etterpå — se fitPitchDensity().
const PITCH_DENSITY_STEPS = ["lav", "middels", "hoy"];
const PITCH_ROW_CLEARANCE = 2;
// Under denne bredden får ikke bunnraden plass i brikka.
const PITCH_NARROW_CHIP_PX = 70;

function getPitchRowGeometry(formation) {
  const slots = Array.isArray(formation?.slots) ? formation.slots : [];
  const rows = new Map();
  slots.forEach((slot) => {
    const point = state.slotPositions[slot.slotId] || { x: slot.x, y: slot.y };
    const y = Math.round(Number(point?.y ?? 50));
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(Number(point?.x ?? 50));
  });

  let minGapX = 100;
  rows.forEach((xs) => {
    const sorted = [...xs].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i += 1) {
      minGapX = Math.min(minGapX, sorted[i] - sorted[i - 1]);
    }
  });

  const ys = [...rows.keys()].sort((a, b) => a - b);
  let minGapY = 100;
  for (let i = 1; i < ys.length; i += 1) {
    minGapY = Math.min(minGapY, ys[i] - ys[i - 1]);
  }

  return { minGapX, minGapY };
}

function applyPitchDensity(formation) {
  const pitch = elements.lineupSlots;
  if (!pitch) return;
  const { minGapX } = getPitchRowGeometry(formation);
  // 92 % av avstanden gir litt luft mellom naboene; 21 cqw er taket.
  pitch.style.setProperty("--chip-w", `${Math.min(21, minGapX * 0.92)}cqw`);
  // Start åpent. fitPitchDensity() strammer inn hvis brikkene faktisk ikke får
  // plass i høyden.
  pitch.dataset.density = PITCH_DENSITY_STEPS[0];
}

// Velg det mest informative tetthetsnivået brikkene faktisk får plass til.
// «lav» viser navn og rolle, «middels» dropper rollen, «hoy» viser bare token,
// posisjon og matchScore. Fullt navn ligger uansett i aria-label og sidepanelet.
function fitPitchDensity(formation) {
  const pitch = elements.lineupSlots;
  if (!pitch) return;
  const chip = pitch.querySelector(".player-chip");
  if (!chip) return;
  const box = pitch.getBoundingClientRect();
  if (!(box.height > 0)) return;

  const { minGapX, minGapY } = getPitchRowGeometry(formation);
  const gapPx = (minGapY / 100) * box.height;

  // Smal brikke: bunnraden (posisjon + matchScore) har en minstebredde i
  // piksler og RANT UT av brikka når den ble smal nok — brikkene så ut til å
  // kollidere selv om boksene ikke gjorde det. Da faller posisjonsmerket bort;
  // det står uansett i sidepanelet og er gitt av plassen på banen.
  const chipWidthPx = (minGapX / 100) * box.width * 0.92;
  pitch.dataset.narrow = chipWidthPx < PITCH_NARROW_CHIP_PX ? "true" : "false";

  // Litt luft mellom radene: uten margin ble «akkurat like høy som avstanden»
  // godtatt, og avrunding ga én piksel overlapp.
  const budget = gapPx - PITCH_ROW_CLEARANCE;

  for (const step of PITCH_DENSITY_STEPS) {
    pitch.dataset.density = step;
    // Måler faktisk høyde etter at nivået er satt — minstestørrelsene i piksler
    // gjør at den ikke kan regnes ut på forhånd.
    if (chip.getBoundingClientRect().height <= budget) return;
  }
  // Selv det tetteste nivået kan være for høyt på en veldig liten skjerm.
  // Da står vi igjen med «hoy» — bedre litt trangt enn uleselig.
}

function renderLineup(teamFit) {
  const formation = getFormation();

  elements.lineupSlots.innerHTML = "";
  elements.formationTitle.textContent = formation?.name || "Formasjon";

  if (!formation || !teamFit) {
    return;
  }

  applyPitchDensity(formation);

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
    const chipName = compactPlayerName(playerName);
    const roleName = assignment?.role?.name || "Ingen rolle";
    const fitView = describeTacticalFit(assignment?.fit);
    chip.dataset.fitTone = fitView.tone;
    chip.innerHTML = `
      <span class="chip-name">${escapeHtml(chipName)}</span>
      <span class="chip-role">${escapeHtml(roleName)}</span>
      <span class="chip-foot">
        <span class="chip-pos">${escapeHtml(slot.position)}</span>
        <span class="chip-fit" data-tone="${escapeHtml(fitView.tone)}">${escapeHtml(fitView.shortLabel)}</span>
      </span>
    `;

    chip.setAttribute(
      "aria-label",
      `${slot.label}: ${playerName}. ${fitView.label}. Dra for å flytte, klikk for å velge.`
    );

    attachChipDrag(chip, slot.slotId);

    elements.lineupSlots.append(chip);
  });

  // Brikkene er i DOM-en nå, så høyden kan måles og tetthetsnivået strammes inn.
  fitPitchDensity(formation);
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
      // Slipp over en annen brikke = bytt spiller/rolle mellom plassene. Dette
      // er raskere og mer manageraktig enn å åpne to nedtrekkslister.
      const swapTarget = Array.from(elements.lineupSlots.querySelectorAll(".player-chip"))
        .filter((candidate) => candidate !== chip)
        .find((candidate) => {
          const rect = candidate.getBoundingClientRect();
          return event.clientX >= rect.left && event.clientX <= rect.right
            && event.clientY >= rect.top && event.clientY <= rect.bottom;
        });
      const targetSlotId = swapTarget?.dataset.slotId || null;
      if (targetSlotId && targetSlotId !== slotId) {
        const sourceAssignment = state.lineup[slotId] || { playerId: null, roleId: null };
        const targetAssignment = state.lineup[targetSlotId] || { playerId: null, roleId: null };
        state.lineup[slotId] = targetAssignment;
        state.lineup[targetSlotId] = sourceAssignment;
        state.selectedSlotId = targetSlotId;
        renderApp();
        return;
      }

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

function setSelectedSlotPlayer(nextPlayerId) {
  const slot = getSelectedSlot();
  if (!slot) return;

  const player = state.players.find((item) => item.id === nextPlayerId) || null;
  const currentRoleId = state.lineup[slot.slotId]?.roleId || null;
  const currentRole = state.roles.find((role) => role.id === currentRoleId);
  state.lineup[slot.slotId] = {
    playerId: nextPlayerId || null,
    roleId: currentRole?.validPositions.includes(slot.position)
      ? currentRoleId
      : getDefaultRoleForPlayer(player, slot)
  };
  renderApp();
}

function setSelectedSlotRole(nextRoleId) {
  const slot = getSelectedSlot();
  if (!slot) return;
  state.lineup[slot.slotId] = {
    playerId: state.lineup[slot.slotId]?.playerId || null,
    roleId: nextRoleId || null
  };
  renderApp();
}

function renderDirectLineupEditor() {
  const playerHost = elements.lineupPlayerChoices;
  const roleHost = elements.lineupRoleChoices;
  const slot = getSelectedSlot();
  if (!playerHost || !roleHost || !slot) return;

  const slotState = state.lineup[slot.slotId] || { playerId: null, roleId: null };
  const usedPlayerIds = getUsedPlayerIds(slot.slotId);
  const available = getUnlockedPlayers();
  const current = available.find((player) => player.id === slotState.playerId);
  const choices = [current, ...available.filter((player) => player.id !== current?.id)]
    .filter(Boolean)
    .slice(0, 16);

  playerHost.replaceChildren();
  choices.forEach((player) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lineup-player-card${player.id === slotState.playerId ? " is-selected" : ""}`;
    button.disabled = usedPlayerIds.has(player.id);
    const positions = Array.isArray(player.naturalPositions) ? player.naturalPositions.join(" / ") : "–";
    button.innerHTML = `<strong>${player.name || player.id}</strong><span>${positions}</span>`;
    button.addEventListener("click", () => setSelectedSlotPlayer(player.id));
    playerHost.append(button);
  });

  roleHost.replaceChildren();
  state.roles.filter((role) => role.validPositions.includes(slot.position)).forEach((role) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `lineup-role-chip${role.id === slotState.roleId ? " is-selected" : ""}`;
    button.textContent = role.name;
    button.addEventListener("click", () => setSelectedSlotRole(role.id));
    roleHost.append(button);
  });
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
  elements.selectedSlotTitle.textContent = `${slot.label} · ${slot.position}`;
  // Valget gjøres kun med spillerkort og rolleknapper ved banen.
  // Sidepanelet forklarer den samme staten uten et parallelt skjema.

  if (assignment?.fit) {
    const fitView = describeTacticalFit(assignment.fit);
    elements.selectedMatchScore.textContent = fitView.label;
    elements.selectedMatchScore.dataset.tone = fitView.tone;
    elements.selectedFitStatus.textContent = assignment?.role?.name
      ? `${assignment.role.name} · ${slot.position}`
      : `Rolle ikke valgt · ${slot.position}`;
    elements.selectedFitExplanation.textContent = fitView.explanation;
  } else {
    elements.selectedMatchScore.textContent = "Ikke vurdert";
    elements.selectedMatchScore.dataset.tone = "empty";
    elements.selectedFitStatus.textContent = "Ufullstendig plass";
    elements.selectedFitExplanation.textContent = "Velg både spiller og rolle for å se hvordan rollekravene passer spillerprofilen.";
  }

  // Additivt historisk rollefit-hint: forklarer om valgt rolle passer det valgte
  // historiske systemet. Erstatter ikke lagfit-motoren over.
  renderHistoricalRoleHint(slot, slotState);
  renderRoleLearningCard({ slot, slotState, assignment, teamFit });

  // Dynamisk sidepanel: spillerprofil når plassen har en spiller, ellers en
  // kort henvisning til Oversikt. Selve handlingene (spiller-/rollevalg) vises alltid.
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
      elements.sidePanelKicker.textContent = "Velg en plass";
    }
    if (elements.sideProfile) {
      elements.sideProfile.hidden = true;
    }
    if (elements.sideDecisions) {
      elements.sideDecisions.hidden = false;
    }
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
  const roleFitView = describeTacticalFit({ matchScore: vm.fitScore, status: vm.fitLabel });

  elements.roleLearningCard.hidden = false;
  elements.roleLearningCard.innerHTML = `
    <div class="role-learning-head">
      <div>
        <p class="eyebrow">Rolleforståelse</p>
        <h4>${escapeHtml(vm.playerName)} som ${escapeHtml(vm.roleName)}</h4>
      </div>
      <span class="role-learning-badge" data-status="${escapeHtml(roleFitView.tone)}">${escapeHtml(roleFitView.label)}</span>
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

// Ferdighetsprofilen i sidepanelet.
//
// Den viser SPILLERENS egne sterkeste ferdigheter, sortert etter hva han faktisk
// er god til — ikke etter hva plassen han tilfeldigvis står på krever. Ødegaard
// har 20 i spilleforståelse enten han står som tier eller er feilplassert som
// midtstopper, og profilen skal si det samme begge steder.
//
// Under den kommer det plassen krever OG han mangler, som konkrete ferdigheter
// med tall. Det forklarer feilbruk uten å felle en samlet dom: «CB krever
// hodespill, han har 6» er et faktum om en ferdighet. «Ødegaard som CB = 46» er
// en rating, og en fornærmelse.
//
// Hver verdi viser dessuten HVOR den kom fra. `belagt` betyr at kilden faktisk
// sa det om denne spilleren; `utledet` betyr at spillet har regnet seg fram.
// Dette er 367 ekte, navngitte fotballspillere, og forskjellen mellom hva vi vet
// og hva vi antar skal stå i klartekst.
const ATTRIBUTE_SOURCE_LABEL = {
  belagt: "belagt i kilden",
  posisjon: "fra posisjonen han spiller",
  rolle: "fra rollene hans",
  utledet: "utledet"
};
const PROFILE_TOP_SKILLS = 8;

function appendAttributeRow(list, entry, { muted = false } = {}) {
  const item = document.createElement("li");
  item.className = "attribute-row";
  item.dataset.source = entry.source || "utledet";
  if (muted) item.dataset.demand = "mangler";
  item.title = `${entry.name}: ${entry.value} av 20 — ${ATTRIBUTE_SOURCE_LABEL[entry.source] || entry.source || "utledet"}.`;

  const name = document.createElement("span");
  name.className = "attribute-name";
  name.textContent = entry.name;

  const bar = document.createElement("span");
  bar.className = "attribute-bar";
  const fill = document.createElement("span");
  fill.className = "attribute-bar-fill";
  fill.style.width = `${Math.round((entry.value / 20) * 100)}%`;
  bar.appendChild(fill);

  const number = document.createElement("strong");
  number.className = "attribute-value";
  number.textContent = entry.value;

  item.append(name, bar, number);
  list.appendChild(item);
}

function renderPlayerAttributes(player, position) {
  const section = elements.profileAttributes;
  const list = elements.profileAttributeList;
  if (!section || !list) return;

  const profile = player?.attributes;
  if (!profile) {
    section.hidden = true;
    return;
  }

  list.innerHTML = "";
  // Dette er han. Alltid det samme, uansett hvor han står.
  for (const entry of profile.top.slice(0, PROFILE_TOP_SKILLS)) {
    appendAttributeRow(list, entry);
  }

  // ... og det han er svakest på. En FM-profil viser begge ender: uten den
  // nedre er det ikke en profil, bare en liste over høydepunkter. At en tier
  // takler lite er like mye informasjon som at han ser pasningen.
  const weakest = profile.weak.slice(0, 4);
  if (weakest.length) {
    const heading = document.createElement("li");
    heading.className = "attribute-subhead";
    heading.textContent = "Svakest";
    list.appendChild(heading);
    for (const entry of weakest) appendAttributeRow(list, entry, { muted: true });
  }

  // Og hva plassen krever som han ikke har. Bare ferdigheter, bare tall.
  const demands = position
    ? describePositionDemands(profile, position, state.attributeCatalogue)
    : null;
  const shownIds = new Set([
    ...profile.top.slice(0, PROFILE_TOP_SKILLS).map((entry) => entry.id),
    ...weakest.map((entry) => entry.id)
  ]);
  const gaps = (demands?.missing || []).filter((entry) => !shownIds.has(entry.id)).slice(0, 4);
  if (gaps.length) {
    const heading = document.createElement("li");
    heading.className = "attribute-subhead";
    heading.textContent = `${position} krever også`;
    list.appendChild(heading);
    for (const entry of gaps) {
      appendAttributeRow(list, { ...entry, source: profile.provenance[entry.id] }, { muted: true });
    }
  }

  if (elements.profileAttributeNote) {
    const base = `${profile.sourcedCount} av ferdighetene er belagt i kilden, resten er utledet av posisjon, roller og arketype.`;
    elements.profileAttributeNote.textContent = gaps.length
      ? `Sterkeste ferdigheter først. ${position} krever i tillegg ${gaps.map((entry) => entry.name.toLowerCase()).join(", ")} — se om systemet ditt dekker det. ${base}`
      : `Sterkeste ferdigheter først. ${base}`;
  }
  section.hidden = list.childElementCount === 0;
}

// Fyll spillerprofilen i sidepanelet: rating, navn, posisjoner, samlet History
// Go-sted, styrker og behov. Taktisk samsvar settes allerede over (fit-boksen).
function renderPlayerProfile(player, slot) {
  // Sirkelen viser spillerens STERKESTE FERDIGHET, ikke en samlet score.
  // Her sto det tidligere en posisjonsvektet klasse, og den var `overall` på
  // nytt: den ga Ødegaard 46 som midtstopper — en posisjon han aldri skal
  // spille — og gjorde et tall om til en dom over spilleren. Ferdighetene ER
  // scoren, så det er en av dem som står her.
  const signature = player.attributes?.top?.[0] || null;
  const ratingPosition = slot?.position || player.naturalPositions?.[0] || null;
  if (elements.profileSignature) {
    elements.profileSignature.textContent = signature ? signature.name : "";
    elements.profileSignature.hidden = !signature;
  }
  renderPlayerAttributes(player, ratingPosition);
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

// Kort tilgangstekst for én formasjon. Alle formasjoner er spillbare; teksten
// forklarer bare History Go-samlestatusen: "Samlet via sted: Highbury" for
// oppdagede systemer, og "Fritt spillbart. Samles i History Go via …" for de du
// ennå ikke har oppdaget. Kun visning – ingen unlock-beregning.
function buildFormationAccessText(formation) {
  const status = formation ? getAvailability().formationStatusById.get(formation.id) : null;

  if (!status) {
    return "";
  }

  // Samlede systemer setter seg raskere – si det, slik at samlebelønningen er
  // synlig og forklart i stedet for skjult i motoren.
  const fasterNote = "Laget kjenner systemet – raskere taktisk tilvenning.";

  if (status.satisfiedBy) {
    const source = describeUnlockRequirementShort(status.satisfiedBy);
    return source ? `Samlet via ${source}. ${fasterNote}` : `${status.reason} ${fasterNote}`;
  }
  if (status.tier && FORMATION_BASELINE_TIERS.has(status.tier)) {
    return `Grunnsystem (start-/tidligformasjon). ${fasterNote}`;
  }
  if (status.collected) {
    return `${status.reason} ${fasterNote}`;
  }

  const requirements = getFormationUnlockRequirements(formation)
    .map((requirement) => describeUnlockRequirementShort(requirement))
    .filter(Boolean);

  return requirements.length
    ? `Fritt spillbart, men tar lengre tid å lære inn. Samle det i History Go via ${requirements.slice(0, 3).join(" eller ")} for raskere tilvenning.`
    : "Fritt spillbart historisk system.";
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

  const tacticKnowledge = getTacticalKnowledgeForTactic(getTactic()).slice(0, 3);
  if (tacticKnowledge.length) {
    const knowledgeBlock = document.createElement("div");
    knowledgeBlock.className = "tactic-system-block";
    const knowledgeLabel = document.createElement("p");
    knowledgeLabel.className = "tactic-system-block-label";
    knowledgeLabel.textContent = "Assistentens taktikkforklaring";
    knowledgeBlock.append(knowledgeLabel);
    tacticKnowledge.forEach((item) => {
      const note = document.createElement("p");
      note.className = "muted-text";
      note.textContent = `${item.title}: ${item.explanation} Spillerkrav: ${item.requirements.join(", ")}.`;
      knowledgeBlock.append(note);
    });
    panel.append(knowledgeBlock);
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

  // 1) Tomme plasser i startelleveren. Fyller alle ledige plasser i ett klikk
  //    når det finnes spillere; ellers velges plassen (troppen mangler spillere).
  const emptySlots = assignments.filter((item) => !item.player);
  if (emptySlots.length) {
    const hasPlayersToPlace = getUnlockedPlayers().length > 0;
    decisions.push({
      tag: "Lag",
      title: emptySlots.length === 1 ? "Fyll én tom plass" : `Fyll ${emptySlots.length} tomme plasser`,
      detail: `Startelleveren mangler ${emptySlots.length} av ${teamFit.totalSlots} spillere.`,
      action: hasPlayersToPlace
        ? () => {
            fillEmptyLineupSlots(true);
            activateTab("tactics");
            renderApp();
          }
        : selectSlotDecision(emptySlots[0].slot.slotId)
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
  if (getMatchdayReadiness(teamFit).canStartMatch && !state.matchday?.session) {
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
  const unreadThreads = getInboxAttentionCount();
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

// Bygg ett beslutningselement. baseClass "decision-card" gir statuskort.
// Beslutninger uten handling rendres som ikke-klikkbare kort.
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
  const readiness = getMatchdayReadiness(teamFit);
  const gate = getClubWeekMatchdayGate();
  const clubWeekState = state.clubWeekState || null;

  const leaguePreseasonStep = isLeagueModeActive() && !isLeagueSeasonActive()
    ? getLeagueOnboardingSteps(teamFit).find((step) => !step.done) || null
    : null;
  return {
    selectedMode: state.gameStartState?.selectedMode || null,
    hasSession: Boolean(state.matchday?.session),
    opponentName: state.matchday?.session?.opponent?.name || null,
    roster: {
      enoughUnlocked: Boolean(rosterReadiness.hasEnoughUnlocked),
      enoughBench: Boolean(rosterReadiness.hasEnoughBench),
      unlockedCount: rosterReadiness.unlockedCount
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
    matchdayReadiness: readiness,
    matchdayReady: Boolean(readiness.canStartMatch),
    unreadThreads: getInboxAttentionCount(),
    hasUnseenReport: hasUnseenMatchReport(),
    miniSeasonActive: isScenarioModeActive() && state.miniSeason?.status === "active" || isLeagueModeActive() && state.leagueSeason?.status === "active",
    leagueModeActive: isLeagueModeActive(),
    leagueSeasonActive: isLeagueSeasonActive(),
    leaguePreseasonReady: isLeagueModeActive() ? isLeaguePreseasonReady(teamFit) : true,
    leaguePreseasonStep,
    scenarioModeActive: isScenarioModeActive(),
    nationalModeActive: isNationalModeActive(),
    nationalNationChosen: Boolean(getNationalTeamNationality()),
    nationalTournamentActive: isNationalModeActive() && isTournamentActive(),
    nationalTournamentAvailable: isNationalModeActive() && getAvailableTournaments().length > 0,
    firstTime: isFirstTimePlaythroughActive() ? buildFirstTimeNextActionState(teamFit, readiness) : null,
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
    case NEXT_ACTION_TYPES.LEAGUE_SEASON:
      return () => startLeagueSeasonFromOnboarding();
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

// Render "Neste handling" i manager-footeren: én kompakt primærhandling
// + opptil to sekundære steg. Faseteksten viser hvor i uka treneren er.
// Alt er utledet av computeManagerNextActions.
function renderNextActionStrip(teamFit) {
  const primaryButton = elements.nextActionPrimary;
  const secondaryContainer = elements.nextActionSecondary;
  if (!primaryButton || !secondaryContainer) {
    return;
  }

  // Fotballvitenskap er en læremodul, ikke en manageruke. «Neste handling:
  // skaff spillbar tropp» i bunnen motsa flatens eget løfte om at ingenting her
  // rører klubben din — og pekte på en flate modusen ikke engang har meny til.
  // Vi skjuler bare stripa — resten av funksjonen kjører videre, siden den også
  // driver onboarding-skjermen og modusstatusen.
  if (elements.nextActionStrip) {
    elements.nextActionStrip.hidden = isTrainingModeActive();
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
  primaryButton.setAttribute("aria-label", `${primary.tag}: ${primary.title}. ${primary.hint}`);
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
    // Tråder som krever oppmerksomhet nå (i første uke: ett tydelig signal).
    elements.inboxPulseCount.textContent = String(getInboxAttentionCount());
  }

  if (elements.adminSquadCount) {
    elements.adminSquadCount.textContent = String(getUnlockedPlayers().length);
  }

  if (elements.adminStaffCount) {
    const count = getHiredStaff().length;
    elements.adminStaffCount.textContent = `${count} ${count === 1 ? "ansatt" : "ansatte"}`;
  }

  renderAdminRoom();
  renderFacilities();

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

  renderMarketRoom();

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

  renderBoardRoom();
}

// Styret v1: den fyldige styreflaten. Leser klubbstate direkte
// (styretillit, klubbverdier, ukerytme) — ingen ny motor, ingen History
// Go-progresjon. I scenario-modus vises også prøveperiodens styreforventning.
// Fasiliteter v1: ekte, lesbar kontorflate — ingen ny motor. Anleggsstanden
// avledes av verdier som allerede finnes (treningskultur, medietrykk, opplåste
// spillere, engasjert stab), på samme måte som Styret og Klubbrom leser klubben.
function renderFacilities() {
  const club = state.clubWeekState || {};
  const bandFromScore = (value, t2, t3) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return { level: 0, label: "Nivå –", tone: "neutral" };
    if (n >= t3) return { level: 3, label: "Nivå 3", tone: "good" };
    if (n >= t2) return { level: 2, label: "Nivå 2", tone: "neutral" };
    return { level: 1, label: "Nivå 1", tone: "warn" };
  };
  const bandFromCount = (count, t1, t2, t3) => {
    if (count >= t3) return { level: 3, label: "Nivå 3", tone: "good" };
    if (count >= t2) return { level: 2, label: "Nivå 2", tone: "neutral" };
    if (count >= t1) return { level: 1, label: "Nivå 1", tone: "warn" };
    return { level: 0, label: "Nivå –", tone: "neutral" };
  };
  const apply = (levelEl, statusEl, band, text) => {
    if (levelEl) { levelEl.textContent = band.label; levelEl.dataset.tone = band.tone; }
    if (statusEl) statusEl.textContent = text;
  };

  const culture = Number(club.trainingCulture);
  const training = bandFromScore(culture, 45, 65);
  apply(elements.facilityTrainingLevel, elements.facilityTrainingStatus, training,
    !Number.isFinite(culture) ? "Treningskulturen er ikke lest ennå."
      : culture >= 65 ? `Sterk treningskultur (${culture}) – anlegget driver rask utvikling.`
        : culture <= 40 ? `Svak treningskultur (${culture}) – anlegget holder laget så vidt i gang.`
          : `Treningskultur ${culture} – solid grunnlag for utvikling.`);

  const media = Number(club.mediaPressure);
  const stadium = bandFromScore(media, 45, 65);
  apply(elements.facilityStadiumLevel, elements.facilityStadiumStatus, stadium,
    !Number.isFinite(media) ? "Medietrykket er ikke lest ennå."
      : media >= 65 ? `Stor kampdagsramme – medietrykket (${media}) fyller stadion.`
        : media <= 40 ? `Rolig ramme – lavt medietrykk (${media}).`
          : `Medietrykk ${media} – jevn kampdagsstemning.`);

  const players = getUnlockedPlayers().length;
  const academy = bandFromCount(players, 1, 8, 15);
  apply(elements.facilityAcademyLevel, elements.facilityAcademyStatus, academy,
    players === 0 ? "Ingen spillere hentet inn ennå – besøk steder i History Go."
      : `${players} klassespillere i samlingen mater akademiet.`);

  const staff = getHiredStaff().length;
  const medical = bandFromCount(staff, 1, 1, 3);
  apply(elements.facilityMedicalLevel, elements.facilityMedicalStatus, medical,
    staff === 0 ? "Ingen stab engasjert – begrenset skadeforebygging."
      : `${staff} i staben støtter restitusjon og skadeforebygging.`);

  if (elements.facilityOverallValue) {
    const levels = [training, stadium, academy, medical].map((b) => b.level);
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    elements.facilityOverallValue.textContent = avg >= 2.5 ? "Sterk" : avg >= 1.5 ? "Solid" : avg > 0 ? "Grunnleggende" : "–";
  }
}

function renderBoardRoom() {
  const club = state.clubWeekState;

  // Styrets forventning: avledet av tilliten akkurat nå. Kort, kontekstuell
  // retning — ikke en fasit, men det styret ser etter denne uka.
  if (elements.boardExpectationNote) {
    const miniExpectation = isScenarioModeActive() && state.miniSeason?.boardExpectation
      ? state.miniSeason.boardExpectation
      : null;
    if (miniExpectation) {
      elements.boardExpectationNote.textContent = `Prøveperioden: ${miniExpectation}`;
    } else {
      const trust = Number(club?.boardTrust);
      elements.boardExpectationNote.textContent = !Number.isFinite(trust)
        ? "Styret venter at du bygger laget og viser en tydelig retning."
        : trust >= 65
          ? "Styret forventer at du holder retningen og bygger videre på det som virker."
          : trust <= 35
            ? "Styret forventer tydelige grep og resultater som snur trenden."
            : "Styret forventer jevn framgang: sett laget, tren målrettet og vinn kampene du bør vinne.";
    }
  }

  // Klubbens temperatur: styrets lesning av klubbverdiene, som lesbare signaler
  // med retning (høy/lav) i stedet for rå tall alene.
  if (elements.boardClubMetrics) {
    elements.boardClubMetrics.innerHTML = "";
    const metrics = [
      { label: "Moral", value: club?.playerMorale, highGood: true },
      { label: "Taktisk klarhet", value: club?.tacticalClarity, highGood: true },
      { label: "Treningskultur", value: club?.trainingCulture, highGood: true },
      { label: "Medietrykk", value: club?.mediaPressure, highGood: false }
    ];
    for (const metric of metrics) {
      const value = Number(metric.value);
      const li = document.createElement("li");
      li.className = "board-metric";
      const name = document.createElement("span");
      name.className = "board-metric-label";
      name.textContent = metric.label;
      const num = document.createElement("strong");
      num.className = "board-metric-value";
      if (Number.isFinite(value)) {
        num.textContent = String(value);
        const strong = metric.highGood ? value >= 60 : value <= 40;
        const weak = metric.highGood ? value <= 40 : value >= 60;
        num.dataset.tone = strong ? "good" : weak ? "warn" : "neutral";
      } else {
        num.textContent = "–";
        num.dataset.tone = "neutral";
      }
      li.append(name, num);
      elements.boardClubMetrics.append(li);
    }
  }

  // Ukerytme: hvor i klubbuka styret ser laget akkurat nå.
  if (elements.boardWeekNote) {
    const week = Number(club?.week) || 1;
    const phaseLabel = club ? CLUB_WEEK_PHASE_LABELS[club.phase] || club.phase : "Oppsett";
    elements.boardWeekNote.textContent = `Uke ${week} · ${phaseLabel} — styret følger utviklingen.`;
  }
}

// Marked v1: markedsavdelingen. Leser klubbstate direkte (medietrykk, moral,
// styretillit) og presenterer omdømme, fanstemning og sponsorinteresse som
// lesbare kvalitative signaler — ingen ny motor, ingen tall som ikke finnes.
function renderMarketRoom() {
  const club = state.clubWeekState;
  const media = Number(club?.mediaPressure);
  const morale = Number(club?.playerMorale);
  const trust = Number(club?.boardTrust);

  // Kommersielle signaler: de klubbverdiene som faktisk driver marked/omdømme.
  if (elements.marketSignals) {
    elements.marketSignals.innerHTML = "";
    const signals = [
      { label: "Medietrykk", value: media, highGood: false },
      { label: "Moral", value: morale, highGood: true },
      { label: "Styretillit", value: trust, highGood: true }
    ];
    for (const signal of signals) {
      const value = Number(signal.value);
      const li = document.createElement("li");
      li.className = "board-metric";
      const name = document.createElement("span");
      name.className = "board-metric-label";
      name.textContent = signal.label;
      const num = document.createElement("strong");
      num.className = "board-metric-value";
      if (Number.isFinite(value)) {
        num.textContent = String(value);
        const strong = signal.highGood ? value >= 60 : value <= 40;
        const weak = signal.highGood ? value <= 40 : value >= 60;
        num.dataset.tone = strong ? "good" : weak ? "warn" : "neutral";
      } else {
        num.textContent = "–";
        num.dataset.tone = "neutral";
      }
      li.append(name, num);
      elements.marketSignals.append(li);
    }
  }

  // Fanstemning: avledet av moral og medietrykk. En lesbar temperatur, ikke et
  // oppmøtetall — oppmøte-/lojalitetsmotor finnes ikke ennå.
  if (elements.marketFanMood) {
    if (!Number.isFinite(morale) && !Number.isFinite(media)) {
      elements.marketFanMood.textContent = "Fanstemningen leses av moral og medietrykk.";
    } else if (Number.isFinite(media) && media >= 65) {
      elements.marketFanMood.textContent = "Medietrykket smitter over på tribunen. Fansen er utålmodige.";
    } else if (Number.isFinite(morale) && morale >= 60) {
      elements.marketFanMood.textContent = "Fansen er med laget. Stemningen på tribunen er god.";
    } else if (Number.isFinite(morale) && morale <= 40) {
      elements.marketFanMood.textContent = "Lav moral demper stemningen. Fansen venter på et løft.";
    } else {
      elements.marketFanMood.textContent = "Fanstemningen er avventende — resultatene avgjør temperaturen.";
    }
  }

  // Sponsorinteresse: følger omdømmet (styretillit + medietrykk). Kvalitativ,
  // konkrete avtaler kobles på senere (ærlig merket i UI).
  if (elements.marketSponsorNote) {
    const calm = !Number.isFinite(media) || media < 65;
    if (Number.isFinite(trust) && trust >= 65 && calm) {
      elements.marketSponsorNote.textContent = "Omdømmet er attraktivt. Sponsorinteressen er stigende.";
    } else if ((Number.isFinite(trust) && trust <= 35) || (Number.isFinite(media) && media >= 65)) {
      elements.marketSponsorNote.textContent = "Uro rundt klubben demper sponsorinteressen.";
    } else {
      elements.marketSponsorNote.textContent = "Sponsorinteressen er stabil og følger resultatene.";
    }
  }
}

// Admin v1: administrasjonen — den operative driften rundt laget. Leser
// tropp-/stab-state direkte (rosterReadiness, hired staff). Ingen ny motor og
// ingen økonomital som ikke finnes; budsjett/kontrakter er ærlig senere.
function renderAdminRoom() {
  const roster = getAvailability().rosterReadiness || {};
  const staffCount = getHiredStaff().length;

  if (elements.adminDriftMetrics) {
    elements.adminDriftMetrics.innerHTML = "";
    const metrics = [
      { label: "Spillere i stall", value: roster.unlockedCount, threshold: REQUIRED_SQUAD_SIZE },
      { label: "Startellever satt", value: roster.starterCount, threshold: REQUIRED_STARTERS },
      { label: "Benk", value: roster.benchCount, threshold: REQUIRED_BENCH },
      { label: "Stab engasjert", value: staffCount, threshold: 1 }
    ];
    for (const metric of metrics) {
      const value = Number(metric.value);
      const li = document.createElement("li");
      li.className = "board-metric";
      const name = document.createElement("span");
      name.className = "board-metric-label";
      name.textContent = metric.label;
      const num = document.createElement("strong");
      num.className = "board-metric-value";
      if (Number.isFinite(value)) {
        num.textContent = `${value}/${metric.threshold}`;
        num.dataset.tone = value >= metric.threshold ? "good" : value <= 0 ? "warn" : "neutral";
      } else {
        num.textContent = `–/${metric.threshold}`;
        num.dataset.tone = "warn";
      }
      li.append(name, num);
      elements.adminDriftMetrics.append(li);
    }
  }

  if (elements.adminStaffNote) {
    elements.adminStaffNote.textContent = staffCount > 0
      ? "Staben støtter treningsuka og kampdagen."
      : "Ingen stab engasjert ennå — stab hentes inn via History Go-progresjon.";
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


function getFootballBookSurfaceText(surface, { weakPoints = [], trainingAreas = [], relatedTags = [], phase = null } = {}) {
  const engine = getLoadedManagerEngine();
  if (!engine?.getFootballBookGameText || !Array.isArray(state.knowledgePrinciples)) {
    return null;
  }

  const matches = engine.getFootballBookGameText({
    principles: state.knowledgePrinciples,
    weakPoints,
    trainingAreas,
    relatedTags,
    phase,
    surface,
    maxResults: 1,
  });

  return matches[0]?.text || null;
}

function getTeamFitWeakPointsForBook(teamFit) {
  const engine = getLoadedManagerEngine();
  if (!engine?.analyzeWeakPointsFromTeamFit || !teamFit) {
    return [];
  }
  return engine.analyzeWeakPointsFromTeamFit(teamFit);
}

function renderReport(teamFit) {
  if (!teamFit) {
    return;
  }

  const reportWeakPoints = getTeamFitWeakPointsForBook(teamFit);
  const reportBookText = getFootballBookSurfaceText("matchReport", {
    weakPoints: reportWeakPoints.map((weakPoint) => weakPoint.code),
  });
  elements.reportSummary.textContent = reportBookText
    ? `${teamFit.report.summary} Fotballboka: ${reportBookText}`
    : teamFit.report.summary;
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
    // Panelet stod nesten tomt med bare én linje. Vis heller lagscoren uten
    // badge-bonus (en konkret referanse) + hvordan badges tjenes opp, så
    // kolonnen er informativ i stedet for død plass.
    if (Number.isFinite(teamFit?.baseTeamScore)) {
      const base = document.createElement("p");
      base.className = "badge-effect-meta";
      base.textContent = `Lagscore uten badge-bonus: ${teamFit.baseTeamScore}`;
      panel.append(base);
    }
    const empty = document.createElement("p");
    empty.className = "badge-effect-empty";
    empty.textContent =
      "Ingen badge-effekter aktive ennå. Tren spillerne og fullfør treningsbadges via History Go — opptjente badges gir små, additive bonuser til lagets taktiske metrics her.";
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

// Kampklar-status i kampdagpanelet. Status, tekst og disabled-verdi kommer fra
// samme readiness-resultat; ingen parallelle trening-/troppsbetingelser her.
function renderMatchdayReadiness(teamFit) {
  const el = elements.matchdayReadiness;
  const readiness = getMatchdayReadiness(teamFit);
  const session = state.matchday?.session || null;

  if (el) {
    el.dataset.ready = readiness.canStartMatch ? "true" : "false";
    el.dataset.status = readiness.status;
    if (readiness.status === "in_progress") {
      el.textContent = `Kamp pågår mot ${session?.opponent?.name || "ukjent motstander"}. Ta managergrepene under.`;
    } else if (readiness.status === "ready") {
      el.textContent = "Kampklar: startelleveren, troppen, treningsuka og kampporten er klare.";
    } else if (readiness.status === "loading") {
      el.textContent = readiness.summary;
    } else {
      el.textContent = `Ikke kampklar: ${readiness.primaryBlocker?.message || readiness.summary}`;
    }
  }

  if (elements.playMatchdayButton) {
    elements.playMatchdayButton.disabled = !readiness.canStartMatch;
    elements.playMatchdayButton.setAttribute(
      "aria-describedby",
      elements.matchdayReadiness?.id || "matchdayReadiness"
    );
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

function getWeeklyTrainingChoiceLabel() {
  if (state.weeklyTrainingProgram?.programId) {
    const program = (Array.isArray(state.trainingPrograms) ? state.trainingPrograms : [])
      .find((item) => item?.id === state.weeklyTrainingProgram.programId);
    return program?.name || state.weeklyTrainingProgram.programId;
  }
  const focus = getTrainingFocus(state.weeklyTrainingFocus?.focusId);
  return focus?.name || null;
}

function getMatchdayOpponentBrief(session) {
  // Under en aktiv sesjon vises den faktiske motstanderen; ellers evt. neste
  // mini-sesong-motstander. En vanlig ligakamp trekker en historisk stil-
  // motstander ved avspark (pickHistoricalOpponentProfile), så vi kan ikke
  // navngi den på forhånd — vær ærlig i stedet for å love en generisk motstander
  // spilleren aldri møter.
  const opponent = session?.opponent || getMiniSeasonNextOpponent();
  if (!opponent) {
    return "Historisk stil-motstander · trekkes ved avspark";
  }
  const parts = [opponent.name || "Ikke valgt"];
  if (opponent.style) parts.push(opponent.style);
  if (opponent.archetypeName) parts.push(opponent.archetypeName);
  return parts.join(" · ");
}

function getLastInboxSignalText() {
  const thread = getActiveInboxThreads()[0];
  if (thread?.thread?.subject) return thread.thread.subject;
  if (thread?.thread?.title) return thread.thread.title;
  if (thread?.latestMessage?.subject) return thread.latestMessage.subject;
  if (thread?.latestMessage?.title) return thread.latestMessage.title;
  return "Ingen uleste signaler — innboksen blokkerer ikke kampforberedelsen.";
}

function appendMatchdayNavButton(parent, label, tab) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "matchday-nav-button";
  button.textContent = label;
  button.addEventListener("click", () => {
    activateTab(tab);
    renderApp();
  });
  parent.append(button);
}

function renderMatchdayGate(container, teamFit) {
  const readiness = getMatchdayReadiness(teamFit);
  const session = state.matchday?.session || null;
  const lastMatch = state.matchday?.lastMatch || null;
  const formation = session?.formationSnapshot || getFormation() || {};
  const tactic = session?.tacticSnapshot || getTactic() || {};
  const primary = session
    ? "Fortsett kampen"
    : lastMatch
      ? (hasUnseenMatchReport() ? "Se kampanalyse" : "Forbered neste kamp")
      : readiness.canStartMatch
        ? "Spill kamp"
        : "Fullfør forberedelser";

  const showingFinishedReport = Boolean(lastMatch) && !session;
  if (showingFinishedReport && readiness.canStartMatch) return;

  const scene = createMatchdaySceneModel({
    teamName: session?.teamName || getTemporaryClubName().name,
    opponentBrief: getMatchdayOpponentBrief(session),
    formationName: formation.name,
    tacticName: tactic.name,
    trainingLabel: getWeeklyTrainingChoiceLabel(),
    lastSignal: getLastInboxSignalText(),
    primaryAction: primary,
    readiness
  });

  const gate = document.createElement("article");
  gate.className = "matchday-command";
  gate.dataset.status = scene.statusTone;
  gate.innerHTML = `
    <header class="matchday-command-head">
      <div>
        <p class="eyebrow">Kampkommando</p>
        <h3>${escapeHtml(scene.primaryAction)}</h3>
      </div>
      <span class="matchday-command-status" data-tone="${escapeHtml(scene.statusTone)}">${escapeHtml(scene.statusLabel)}</span>
    </header>
    <div class="matchday-versus" aria-label="Neste kamp">
      <section class="matchday-team is-home">
        <span class="matchday-team-side">Hjemme</span>
        <strong>${escapeHtml(scene.teamName)}</strong>
        <small>Managerens lag</small>
      </section>
      <div class="matchday-kickoff" data-tone="${escapeHtml(scene.statusTone)}">
        <span>${escapeHtml(scene.kickoffLabel)}</span>
        <strong>VS</strong>
        <small>Kampdag</small>
      </div>
      <section class="matchday-team is-away">
        <span class="matchday-team-side">Motstander</span>
        <strong>${escapeHtml(scene.opponentName)}</strong>
        <small>${escapeHtml(scene.opponentContext)}</small>
      </section>
    </div>
    <div class="matchday-command-plan">
      <article><span>Formasjon og kampplan</span><strong>${escapeHtml(scene.planLabel)}</strong></article>
      <article><span>Treningsuke</span><strong>${escapeHtml(scene.trainingLabel)}</strong></article>
      <article><span>Siste signal</span><strong>${escapeHtml(scene.signalLabel)}</strong></article>
    </div>
    <p class="matchday-command-summary">${escapeHtml(scene.summary)}</p>
  `;

  if (!scene.canStart && readiness.status !== "in_progress") {
    const blockerSection = document.createElement("section");
    blockerSection.className = "matchday-command-blockers";
    const heading = document.createElement("div");
    heading.className = "matchday-command-blockers-head";
    heading.innerHTML = `<span>Neste krav</span><strong>${scene.blockers.length}</strong>`;
    blockerSection.append(heading);

    const list = document.createElement("ol");
    scene.blockers.forEach((blocker, index) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${index + 1}</span><p>${escapeHtml(blocker.message)}</p>`;
      list.append(item);
    });
    blockerSection.append(list);

    const actions = document.createElement("div");
    actions.className = "matchday-gate-actions";
    const targets = new Set(scene.blockers.map((item) => item.target));
    if (targets.has("historygo")) appendMatchdayNavButton(actions, "Åpne samlingen", "historygo");
    if (targets.has("tactics")) appendMatchdayNavButton(actions, "Gå til laguttak", "tactics");
    if (targets.has("trening")) appendMatchdayNavButton(actions, "Planlegg trening", "trening");
    if (targets.has("statistikk")) appendMatchdayNavButton(actions, "Åpne sesongen", "statistikk");
    if (targets.has("dashboard")) appendMatchdayNavButton(actions, "Gå til kontoret", "dashboard");
    if (actions.childElementCount) blockerSection.append(actions);
    gate.append(blockerSection);
  }

  container.append(gate);
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
    // En ligaklubb spiller SIN EGEN stil; en scenario-/mesterskapsmotstander er
    // en historisk arketyp. Overskriften må si hvilken av delene du møter —
    // ellers ser det ut som Molde ER en historisk skole.
    appendMatchdaySubheading(card, opponent.isClubProfile ? "Klubbens spillestil" : "Historisk stil-motstander");
    const histLines = [];
    if (opponent.archetypeName) histLines.push(`${opponent.isClubProfile ? "Spillestil" : "Arketyp"}: ${opponent.archetypeName}`);
    if (opponent.era) histLines.push(`${opponent.isClubProfile ? "Tradisjon" : "Epoke"}: ${opponent.era}`);
    if (opponent.tacticalSchool) histLines.push(`Taktisk skole: ${opponent.tacticalSchool}`);
    if (opponent.inPossessionShape) histLines.push(`Med ball: ${opponent.inPossessionShape}`);
    if (opponent.outOfPossessionShape) histLines.push(`Uten ball: ${opponent.outOfPossessionShape}`);
    (Array.isArray(opponent.keyBattles) ? opponent.keyBattles : []).slice(0, 2).forEach((line) => {
      histLines.push(`Nøkkelduell: ${line}`);
    });
    (Array.isArray(opponent.managerHints) ? opponent.managerHints : []).slice(0, 2).forEach((line) => {
      histLines.push(`Managerhint: ${line}`);
    });
    if (opponent.historicalNote) histLines.push(`${opponent.isClubProfile ? "Tradisjon" : "Historisk"}: ${opponent.historicalNote}`);
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
  kickoff.textContent = "Spill kamp";
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

  // Stillingen. Kampen har en resultattavle nå, og den er det første manageren
  // skal se — alt annet (kampplan, motstanderens grep) leses i lys av den.
  // Egen beholder, så live-avspillingen kan oppdatere bare denne per minutt.
  const liveView = document.createElement("div");
  liveView.className = "matchday-live-view";
  appendMatchScoreboard(liveView, session);
  card.append(liveView);

  // Tidligere grep med kort konsekvens.
  appendMatchdayDecisionLog(card, session.decisions, "Grep så langt");

  const event = session.events[eventIndex];

  // Har motstanderen justert seg, er det den viktigste nye opplysningen i
  // kampen: planen din måles nå mot noe annet enn den gjorde ved avspark.
  const adjustments = Array.isArray(session.opponentAdjustments) ? session.opponentAdjustments : [];
  const lastAdjustment = adjustments[adjustments.length - 1] || null;
  if (lastAdjustment) {
    const alert = document.createElement("p");
    alert.className = "matchday-opponent-shift";
    alert.textContent = `${lastAdjustment.label}: ${lastAdjustment.note}`;
    card.append(alert);
  }

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

  // Beslutningen står for tur når perioden er spilt av. Å kunne gripe inn i et
  // minutt du ennå ikke har sett ville gjort avspillingen meningsløs.
  const periodSeen = Number(session.liveMinute) >= currentPeriodEndMinute(session);

  const options = document.createElement("div");
  options.className = "matchday-decision-options";
  (event.options || []).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "matchday-decision-button";
    button.textContent = option.label;
    button.disabled = !periodSeen;
    button.addEventListener("click", () => {
      chooseMatchdayDecision(option.id);
    });
    options.append(button);
  });
  eventCard.append(options);

  card.append(eventCard);
  const continueHint = document.createElement("p");
  continueHint.className = "matchday-meta";
  continueHint.textContent = periodSeen
    ? "Fortsett kampen ved å velge ett managergrep over."
    : "Kampen pågår. Grepet åpner når perioden er spilt — eller hopp til pausen.";
  card.append(continueHint);

  // Kampplanen kan byttes midt i kampen. Den står under grepene fordi den er
  // det større taktiske valget, ikke et alternativ til hendelsen foran deg.
  appendMatchPlanSwitcher(card, session);
  appendMatchSubstitutions(card, session);
  container.append(card);
}

// Hva motstanderen gjorde med kampen. Uten dette ser det ut som om planen din
// «sluttet å virke» av seg selv.
// Byttene i sluttrapporten: hva omstillingen kostet og ga, som planbyttene.
function appendSubstitutionLog(parent, lastMatch) {
  const subs = Array.isArray(lastMatch?.substitutions) ? lastMatch.substitutions : [];
  if (!subs.length) return;

  appendMatchdaySubheading(parent, "Dine bytter");
  subs.forEach((entry) => {
    const item = document.createElement("div");
    item.className = `matchday-decision-entry is-${entry.tone || "neutral"}`;
    const title = document.createElement("p");
    title.className = "matchday-decision-title";
    title.textContent = `${entry.minute}' ${entry.outName} → ${entry.inName} (${entry.roleName || entry.position})`;
    const detail = document.createElement("p");
    detail.className = "matchday-decision-detail";
    detail.textContent = (entry.reasons || []).join(" ");
    item.append(title, detail);
    parent.append(item);
  });
}

function appendOpponentAdjustmentLog(parent, lastMatch) {
  const adjustments = Array.isArray(lastMatch?.opponentAdjustments) ? lastMatch.opponentAdjustments : [];
  if (!adjustments.length) return;

  appendMatchdaySubheading(parent, "Motstanderens grep");
  adjustments.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "matchday-decision-entry";
    const title = document.createElement("p");
    title.className = "matchday-decision-title";
    title.textContent = entry.label || "Motstanderen justerte seg";
    const detail = document.createElement("p");
    detail.className = "matchday-decision-detail";
    detail.textContent = entry.note || "";
    item.append(title, detail);
    parent.append(item);
  });
}

// Planbyttene i sluttrapporten: hva omstillingen kostet, og hva den ga.
// Byttet er en beslutning på linje med managergrepene, og skal leses som det.
function appendMatchPlanChangeLog(parent, lastMatch) {
  const changes = Array.isArray(lastMatch?.planChanges) ? lastMatch.planChanges : [];
  if (!changes.length) return;

  appendMatchdaySubheading(parent, "Kampplan underveis");

  changes.forEach((change) => {
    const entry = document.createElement("div");
    entry.className = `matchday-decision-entry is-${change.tone || "neutral"}`;

    const title = document.createElement("p");
    title.className = "matchday-decision-title";
    title.textContent = `${change.fromPlanName || "Start"} → ${change.toPlanName}`;
    entry.append(title);

    const detail = document.createElement("p");
    detail.className = "matchday-decision-detail";
    const clarity = Number(change.effects?.tacticalClarityDelta) || 0;
    const cost = clarity < 0 ? ` Omstillingen kostet ${Math.abs(clarity).toFixed(2)} taktisk klarhet.` : "";
    detail.textContent = `${change.feedback || ""}${cost}`;
    entry.append(detail);

    parent.append(entry);
  });
}

// ---------------------------------------------------------------------------
// Live-avspilling. Perioden er ferdig AVGJORT i motoren i det øyeblikket den
// spilles — det må den være, for utfallet henger på grepet du nettopp tok.
// Det som skjer her er at kampen AVDEKKES minutt for minutt, så manageren ser
// den utspille seg i stedet for å få fire tall servert.
//
// Klokka stopper når perioden er ferdig avdekket: da står beslutningen for tur.
// ---------------------------------------------------------------------------
const MATCH_LIVE_SPEEDS = [
  { id: "rolig", label: "Rolig", msPerMinute: 260 },
  { id: "normal", label: "Normal", msPerMinute: 130 },
  { id: "rask", label: "Rask", msPerMinute: 45 }
];

let matchLiveTimer = null;

function getMatchLiveSpeed() {
  return MATCH_LIVE_SPEEDS.find((speed) => speed.id === state.matchLiveSpeedId) || MATCH_LIVE_SPEEDS[1];
}

// Hvor langt ut i kampen perioden som nettopp ble spilt rekker.
function currentPeriodEndMinute(session) {
  const timeline = Array.isArray(session?.timeline) ? session.timeline : [];
  const last = timeline[timeline.length - 1];
  return last?.range?.to ?? last?.minute ?? 0;
}

function isMatchLiveRunning() {
  return matchLiveTimer !== null;
}

function stopMatchLive() {
  if (matchLiveTimer !== null) {
    clearInterval(matchLiveTimer);
    matchLiveTimer = null;
  }
}

// Start avdekkingen av perioden som nettopp ble spilt.
function startMatchLive() {
  stopMatchLive();
  const session = state.matchday?.session;
  if (!session || session.phase === "resolved") return;
  const target = currentPeriodEndMinute(session);
  if (Number(session.liveMinute) >= target) {
    renderMatchLive();
    return;
  }
  const { msPerMinute } = getMatchLiveSpeed();
  matchLiveTimer = setInterval(() => {
    const live = state.matchday?.session;
    if (!live) { stopMatchLive(); return; }
    const end = currentPeriodEndMinute(live);
    live.liveMinute = Math.min(end, Number(live.liveMinute || 0) + 1);
    if (live.liveMinute >= end) {
      stopMatchLive();
      saveMatchdayState();
      // Perioden er sett: nå skal beslutningen fram, så hele kortet tegnes på nytt.
      renderApp();
      return;
    }
    renderMatchLive();
  }, msPerMinute);
  renderMatchLive();
}

// Hopp til slutten av perioden. Manageren skal aldri måtte vente på klokka.
function skipMatchLive() {
  stopMatchLive();
  const session = state.matchday?.session;
  if (!session) return;
  session.liveMinute = currentPeriodEndMinute(session);
  saveMatchdayState();
  renderApp();
}

function toggleMatchLive() {
  if (isMatchLiveRunning()) {
    stopMatchLive();
    renderApp();
    return;
  }
  startMatchLive();
}

function setMatchLiveSpeed(speedId) {
  state.matchLiveSpeedId = speedId;
  if (isMatchLiveRunning()) startMatchLive();
  else renderApp();
}

// Oppdater KUN kampbildet mellom minuttene. renderApp() på hvert minutt ville
// bygget hele skjermen på nytt og gjort avspillingen hakkete.
function renderMatchLive() {
  const session = state.matchday?.session;
  // Klasse, ikke id: beholderen lages av JS og finnes ikke i index.html.
  const host = document.querySelector(".matchday-live-view");
  if (!session || !host) return;
  host.replaceChildren();
  appendMatchScoreboard(host, session);
}

// Stillingen slik den står i det minuttet som er avdekket.
function visibleScore(session) {
  const visible = visibleMinuteLog(session);
  const last = [...visible].reverse().find((entry) => entry.scoreAfter);
  if (last) return { ...last.scoreAfter };
  // Ingenting avdekket ennå: kampen står 0-0 til første hendelse spilles av.
  const live = Number(session?.liveMinute);
  if (Number.isFinite(live) && live > 0) return { for: 0, against: 0 };
  return session?.score || { for: 0, against: 0 };
}

// Hvilke minutter er avdekket? Er kampen ferdig, vises alt.
function visibleMinuteLog(session) {
  const log = Array.isArray(session?.minuteLog) ? session.minuteLog : [];
  // En FERDIG kamp (`lastMatch`) har ikke klokke: den bærer `outcome`, ikke
  // `liveMinute`. Uten dette falt hele loggen bort i sluttrapporten, og
  // overskriften «Kampen minutt for minutt» sto igjen med ingenting under seg.
  // Avdekkingsregelen gjelder bare mens kampen faktisk spilles av.
  if (session?.outcome || session?.phase === "resolved") return log;
  const live = Number(session?.liveMinute);
  if (!Number.isFinite(live) || live <= 0) return [];
  return log.filter((entry) => Number(entry.minute) <= live);
}

// Resultattavla med tidslinje: stillingen nå, og når målene falt.
function appendMatchScoreboard(parent, session) {
  const timeline = Array.isArray(session.timeline) ? session.timeline : [];
  // Stillingen skal følge AVSPILLINGEN, ikke fasiten. Viste vi sluttstillingen
  // fra første minutt, avslørte tavla målet før du rakk å se det falle.
  const score = visibleScore(session);

  const board = document.createElement("div");
  board.className = "matchday-scoreboard";

  const line = document.createElement("p");
  line.className = "matchday-score";
  const diff = Number(score.for) - Number(score.against);
  line.dataset.state = diff > 0 ? "leading" : diff < 0 ? "behind" : "level";
  line.textContent = `${session.teamName || "Ditt lag"} ${score.for} – ${score.against} ${session.opponent?.name || "Motstander"}`;
  board.append(line);

  // Kampklokka. Under avspilling teller den, og stopper når perioden er sett.
  const live = Number(session.liveMinute) || 0;
  const periodEnd = currentPeriodEndMinute(session);
  const played = timeline[timeline.length - 1];
  if (played) {
    const clock = document.createElement("p");
    clock.className = "matchday-clock";
    const running = isMatchLiveRunning();
    clock.textContent = live > 0 && live < periodEnd
      ? `${live}' — kampen pågår`
      : `${live || played.minute}' · ${played.note}`;
    // Notaten oppsummerer perioden, og skal bare stå når perioden ER sett.
    if (running) clock.dataset.running = "true";
    board.append(clock);
  }

  parent.append(board);
  appendMatchFlow(parent, session);
  appendMatchLiveControls(parent, session);
  appendMatchMinuteLog(parent, session);
}

function appendMatchFlow(parent, session) {
  const snapshot = createMatchFlowSnapshot(session, visibleMinuteLog(session));
  const panel = document.createElement("section");
  panel.className = "match-flow";
  panel.setAttribute("aria-label", "Kampbilde og momentum");

  const head = document.createElement("div");
  head.className = "match-flow-head";
  const title = document.createElement("strong");
  title.textContent = "Kampbildet";
  const momentum = document.createElement("span");
  momentum.className = "match-flow-momentum";
  momentum.dataset.tone = snapshot.tone;
  momentum.textContent = snapshot.momentum;
  head.append(title, momentum);

  const zones = document.createElement("div");
  zones.className = "match-flow-zones";
  zones.innerHTML = `
    <span class="is-defensive" style="--zone-share:${snapshot.defensiveShare}%"><small>Egen tredel</small></span>
    <span class="is-neutral" style="--zone-share:${snapshot.neutralShare}%"><small>Midtbane</small></span>
    <span class="is-attacking" style="--zone-share:${snapshot.attackingShare}%"><small>Siste tredel</small></span>
  `;

  const hint = document.createElement("p");
  hint.className = "match-flow-hint";
  hint.textContent = snapshot.minute > 0
    ? `Basert på sjanser og mål som er avdekket til ${snapshot.minute}. minutt.`
    : "Kampbildet formes når sjanser og mål avdekkes.";
  panel.append(head, zones, hint);
  parent.append(panel);
}

// Kontrollene for avspillingen: pause, hastighet og «hopp til slutten».
// Manageren skal aldri måtte vente på klokka for å ta et grep.
function appendMatchLiveControls(parent, session) {
  if (session.phase === "resolved") return;
  const periodEnd = currentPeriodEndMinute(session);
  const live = Number(session.liveMinute) || 0;
  if (periodEnd <= 0) return;

  const bar = document.createElement("div");
  bar.className = "matchday-live-controls";

  if (live < periodEnd) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "matchday-live-button";
    toggle.textContent = isMatchLiveRunning() ? "Pause" : "Spill av";
    toggle.addEventListener("click", toggleMatchLive);
    bar.append(toggle);

    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "matchday-live-button is-secondary";
    skip.textContent = "Hopp til pausen";
    skip.addEventListener("click", skipMatchLive);
    bar.append(skip);
  }

  const speeds = document.createElement("div");
  speeds.className = "matchday-live-speeds";
  MATCH_LIVE_SPEEDS.forEach((speed) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `matchday-live-speed${getMatchLiveSpeed().id === speed.id ? " is-active" : ""}`;
    button.textContent = speed.label;
    button.addEventListener("click", () => setMatchLiveSpeed(speed.id));
    speeds.append(button);
  });
  bar.append(speeds);

  parent.append(bar);
}

// Kampen minutt for minutt: hver sjanse, hvert mål, hvert grep — i ett spor.
// Perioder ga fire tall; dette er kampen slik den faktisk ble spilt.
const MINUTE_LOG_TYPE_LABELS = {
  goal: "MÅL",
  chance: "Sjanse",
  decision: "Grep",
  plan: "Kampplan",
  opponent: "Motstander",
  substitution: "Innbytte"
};

function appendMatchMinuteLog(parent, session) {
  // Bare minuttene som faktisk er spilt av. Under avspilling vokser loggen
  // mens du ser på; er kampen ferdig, vises hele kampen.
  const log = visibleMinuteLog(session);
  if (!log.length) return;

  const wrap = document.createElement("details");
  wrap.className = "matchday-minutes";
  // Åpen som standard: kampen er det manageren vil se.
  wrap.open = state.matchMinuteLogOpen !== false;
  wrap.addEventListener("toggle", () => { state.matchMinuteLogOpen = wrap.open; });

  const summary = document.createElement("summary");
  const goals = log.filter((entry) => entry.type === "goal").length;
  const chances = log.filter((entry) => entry.type === "chance").length;
  summary.textContent = `Kampen minutt for minutt · ${goals} mål, ${chances} sjanser`;
  wrap.append(summary);

  const list = document.createElement("ol");
  list.className = "matchday-minute-list";
  // Nyeste nederst, som en ekte kamplogg.
  [...log].sort((a, b) => a.minute - b.minute).forEach((entry) => {
    const item = document.createElement("li");
    item.className = `matchday-minute is-${entry.type} is-${entry.side}`;

    const minute = document.createElement("span");
    minute.className = "matchday-minute-clock";
    minute.textContent = `${entry.minute}'`;

    const body = document.createElement("span");
    body.className = "matchday-minute-text";
    if (entry.type === "goal") {
      // Målene tilhører noen nå. Egne mål har en scorer og som regel en
      // målgivende; motstanderens har det ikke — vi kjenner ikke troppen deres.
      const who = entry.side === "for"
        ? entry.scorer
          ? entry.assist ? `Mål: ${entry.scorer} (${entry.assist})` : `Mål: ${entry.scorer}`
          : "Mål for laget"
        : "Mål imot";
      body.textContent = `${who} — ${entry.scoreAfter.for}–${entry.scoreAfter.against}`;
    } else if (entry.type === "substitution") {
      body.textContent = `Innbytte: ${entry.detail || ""}`;
    } else if (entry.type === "chance") {
      const who = entry.side === "for" ? "Sjanse" : "Sjanse imot";
      body.textContent = `${who}: ${entry.detail}`;
    } else {
      body.textContent = entry.detail || MINUTE_LOG_TYPE_LABELS[entry.type] || "";
    }

    item.append(minute, body);
    list.append(item);
  });
  wrap.append(list);
  parent.append(wrap);
}

// Bytt kampplan underveis. Viser kampbildet slik det leses nå, gjeldende plan,
// og planene rangert etter hva som passer situasjonen — med prisen synlig.
function appendMatchPlanSwitcher(card, session) {
  const plans = Array.isArray(state.tactics) ? state.tactics : [];
  if (!plans.length) return;

  const currentId = session.activePlanSnapshot?.id || session.selectedTacticId || null;
  const currentPlan = plans.find((plan) => plan.id === currentId) || null;
  const gameState = readGameState(session);

  const wrap = document.createElement("details");
  wrap.className = "match-plan-switcher";
  wrap.open = Boolean(state.matchPlanSwitcherOpen);
  wrap.addEventListener("toggle", () => { state.matchPlanSwitcherOpen = wrap.open; });

  const summary = document.createElement("summary");
  const standing = gameState.scoreKnown
    ? `${gameState.label} ${gameState.score.for}–${gameState.score.against}`
    : gameState.label;
  summary.textContent = `Kampplan: ${currentPlan?.name || "ikke valgt"} · ${standing}`;
  wrap.append(summary);

  const lead = document.createElement("p");
  lead.className = "muted-text match-plan-lead";
  const matchupNow = session.planMatchup?.verdict;
  const matchupNote = matchupNow && matchupNow !== "nøytral"
    ? ` Slik de spiller nå, er planen din ${matchupNow} mot dem.`
    : "";
  lead.textContent = `${currentPlan?.intent ? currentPlan.intent + " " : ""}${matchupNote} Et bytte koster omstilling – laget må finne formen på nytt.`.trim();
  wrap.append(lead);

  const changes = Array.isArray(session.planChanges) ? session.planChanges : [];
  if (changes.length) {
    const log = document.createElement("ul");
    log.className = "match-plan-log";
    changes.forEach((change) => {
      const item = document.createElement("li");
      item.className = `is-${change.tone || "neutral"}`;
      const head = document.createElement("strong");
      head.textContent = `${change.fromPlanName || "Start"} → ${change.toPlanName}`;
      const why = document.createElement("span");
      why.textContent = change.feedback || "";
      item.append(head, why);
      log.append(item);
    });
    wrap.append(log);
  }

  const list = document.createElement("div");
  list.className = "match-plan-options";
  const ranked = rankPlansForSituation(plans, {
    currentPlan,
    gameState: gameState.state,
    opponent: session.opponent
  });

  ranked.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `match-plan-option${entry.isCurrent ? " is-current" : ""}${entry.fitsGameState ? " is-fitting" : ""}`;
    button.disabled = entry.isCurrent;

    const name = document.createElement("strong");
    name.textContent = entry.plan.name;
    const intent = document.createElement("small");
    intent.textContent = entry.plan.intent;

    const meta = document.createElement("span");
    meta.className = "match-plan-meta";
    const bits = [];
    if (entry.isCurrent) bits.push("Aktiv nå");
    else bits.push(entry.fitsGameState ? "Passer bildet" : "For et annet bilde");
    if (!entry.isCurrent) {
      bits.push(entry.distance >= 55 ? "stor omstilling" : entry.distance >= 25 ? "merkbar omstilling" : "liten omstilling");
    }
    if (entry.matchupVerdict !== "nøytral") bits.push(`${entry.matchupVerdict} mot dem`);
    meta.textContent = bits.join(" · ");

    button.append(name, intent, meta);
    if (!entry.isCurrent) {
      button.addEventListener("click", () => switchMatchPlanDuringMatch(entry.plan.id));
    }
    list.append(button);
  });
  wrap.append(list);
  card.append(wrap);
}

// Innbytte underveis. Benken har alltid vært et krav (fire spillere før du får
// spille) uten å være en mulighet — de kom aldri inn. Her er de.
//
// Flyten er to steg, som på ekte: velg hvem som skal AV, så ser du hvem på
// benken som passer den plassen best. Rangeringen er råd, ikke automatikk.
function appendMatchSubstitutions(card, session) {
  const { bench, onPitch, remaining } = availableSubstitutions(session);
  if (!Array.isArray(onPitch) || onPitch.length === 0) return;

  const wrap = document.createElement("details");
  wrap.className = "match-subs";
  wrap.open = Boolean(state.matchSubsOpen);
  wrap.addEventListener("toggle", () => { state.matchSubsOpen = wrap.open; });

  const summary = document.createElement("summary");
  summary.textContent = `Innbytte · ${remaining} av ${MAX_SUBSTITUTIONS} igjen`;
  wrap.append(summary);

  const done = Array.isArray(session.substitutions) ? session.substitutions : [];
  if (done.length) {
    const log = document.createElement("ul");
    log.className = "match-subs-log";
    done.forEach((entry) => {
      const item = document.createElement("li");
      item.className = `is-${entry.tone || "neutral"}`;
      const head = document.createElement("strong");
      head.textContent = `${entry.minute}' ${entry.outName} → ${entry.inName}`;
      const why = document.createElement("span");
      why.textContent = entry.reasons?.[0] || "";
      item.append(head, why);
      log.append(item);
    });
    wrap.append(log);
  }

  if (remaining <= 0) {
    const spent = document.createElement("p");
    spent.className = "muted-text";
    spent.textContent = "Byttekvoten er brukt opp. Laget du har på banen er laget du avslutter med.";
    wrap.append(spent);
    card.append(wrap);
    return;
  }
  if (bench.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Ingen på benken som kan komme inn.";
    wrap.append(empty);
    card.append(wrap);
    return;
  }

  // Steg 1: hvem går av?
  const outRow = document.createElement("div");
  outRow.className = "match-subs-out";
  const outLabel = document.createElement("p");
  outLabel.className = "muted-text";
  outLabel.textContent = "Hvem går av?";
  outRow.append(outLabel);

  const outList = document.createElement("div");
  outList.className = "match-subs-options";
  onPitch.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `match-subs-player${state.matchSubOutId === entry.playerId ? " is-current" : ""}`;
    const name = document.createElement("strong");
    name.textContent = entry.name;
    const meta = document.createElement("small");
    meta.textContent = `${entry.position} · ${entry.roleName || "rolle"} · passform ${entry.matchScore}`;
    button.append(name, meta);
    button.addEventListener("click", () => {
      state.matchSubOutId = state.matchSubOutId === entry.playerId ? null : entry.playerId;
      state.matchSubsOpen = true;
      renderApp();
    });
    outList.append(button);
  });
  outRow.append(outList);
  wrap.append(outRow);

  // Steg 2: hvem kommer inn på nettopp den plassen?
  if (state.matchSubOutId && onPitch.some((entry) => entry.playerId === state.matchSubOutId)) {
    const gameState = readGameState(session);
    const ranked = rankSubstitutionsForSlot({
      session,
      outPlayerId: state.matchSubOutId,
      minute: currentPeriodEndMinute(session),
      gameState: gameState.state
    });

    const inLabel = document.createElement("p");
    inLabel.className = "muted-text";
    const out = onPitch.find((entry) => entry.playerId === state.matchSubOutId);
    inLabel.textContent = `Hvem inn som ${out?.roleName || out?.position}? Passformen gjelder PLASSEN – ikke spillerens klasse.`;
    wrap.append(inLabel);

    const inList = document.createElement("div");
    inList.className = "match-subs-options";
    ranked.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `match-subs-player${entry.improvement > 0.05 ? " is-fitting" : ""}`;
      const name = document.createElement("strong");
      name.textContent = entry.inName;
      const meta = document.createElement("small");
      const arrow = entry.fitDelta > 0 ? `+${entry.fitDelta}` : `${entry.fitDelta}`;
      meta.textContent = `passform ${entry.matchScoreAfter} (${arrow}) · ${entry.reasons[0] || ""}`;
      button.append(name, meta);
      button.addEventListener("click", () => makeSubstitution(state.matchSubOutId, entry.inPlayerId));
      inList.append(button);
    });
    wrap.append(inList);
  }

  card.append(wrap);
}

// Utfør byttet på den aktive kampsesjonen.
function makeSubstitution(outPlayerId, inPlayerId) {
  const session = state.matchday?.session;
  if (!session || session.phase === "resolved") return;
  const gameState = readGameState(session);
  const next = applyMatchdaySubstitution(session, {
    outPlayerId,
    inPlayerId,
    minute: currentPeriodEndMinute(session),
    gameState: gameState.state
  });
  if (next === session) return;
  state.matchday.session = next;
  state.matchSubOutId = null;
  saveMatchdayState();
  renderApp();
}

// Utfør planbyttet på den aktive kampsesjonen.
function switchMatchPlanDuringMatch(planId) {
  const session = state.matchday?.session;
  if (!session || session.phase === "resolved") return;
  const plan = (Array.isArray(state.tactics) ? state.tactics : []).find((item) => item.id === planId);
  if (!plan) return;
  const next = applyMatchPlanChange(session, plan, { opponent: session.opponent });
  if (next === session) return;
  state.matchday.session = next;
  // Kampplanen utenfor kampen følger med, slik at neste kamp starter der du
  // faktisk endte opp — ikke på planen du forlot. Valget lagres av
  // modus-sesjonen i renderApp, som all annen oppsettstate.
  state.selectedTacticId = planId;
  saveMatchdayState();
  renderApp();
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

  const nextWeekButton = document.createElement("button");
  nextWeekButton.type = "button";
  nextWeekButton.className = "matchday-next-week-button";
  nextWeekButton.textContent = "Til managerkontoret";
  nextWeekButton.addEventListener("click", async () => {
    markMatchReportSeen();
    // Kampen er spilt og rapporten lest: rull ukas gjenværende faser helt til
    // ny uke, uansett hvilken fase kampen ble spilt i. Kampdag-porten er åpen
    // (kampen finnes), så løkka terminerer alltid; grensen er et sikkerhetsnett.
    const currentWeek = state.clubWeekState?.week;
    for (let i = 0; i <= CLUB_WEEK_PHASE_IDS.length; i++) {
      if (state.clubWeekState?.week !== currentWeek) break;
      if (getClubWeekMatchdayGate().isBlocked) break;
      await advanceClubWeekPhaseAction();
    }
    activateTab("dashboard");
    renderApp();
  });
  card.append(nextWeekButton);

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
  appendMatchPlanChangeLog(body, lastMatch);
  appendSubstitutionLog(body, lastMatch);
  appendOpponentAdjustmentLog(body, lastMatch);
  if (Array.isArray(lastMatch?.minuteLog) && lastMatch.minuteLog.length) {
    appendMatchdaySubheading(body, "Kampen minutt for minutt");
    appendMatchMinuteLog(body, lastMatch);
  }

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
  renderMatchdayGate(container, teamFit);

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

// Tabell (light league): HG-laget mot rivaler. Deterministisk. Overskriften er
// kontekstavhengig (prøveperiode vs ligasesong) siden samme motor og render
// deles av begge modiene.
function renderMiniSeasonTable(parent, table, caption = "Prøveperiode-tabell") {
  if (!table || !Array.isArray(table.rows) || table.rows.length === 0) {
    return;
  }

  appendMatchdaySubheading(parent, caption);
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


function trainingChoiceRiskFromProgram(program) {
  if (!program) return "Middels";
  const sessions = Array.isArray(program.sessions) ? program.sessions : [];
  const high = sessions.filter((session) => session.intensity === "high").length;
  const risks = Array.isArray(program.risks) ? program.risks.length : 0;
  if (high >= 2 || risks >= 3) return "Høy";
  if (high === 0 && risks <= 1) return "Lav";
  return "Middels";
}

function getRoleById(roleId) {
  return (Array.isArray(state.roles) ? state.roles : []).find((role) => role?.id === roleId) || null;
}

// ---------------------------------------------------------------------------
// Individuell trening: steg 4 i uka
//
// Lagsøkta treffer alle elleve likt. Her gjør manageren noe med ÉN spiller.
// Ingen av sporene rører `overall` — de bygger rollefortrolighet, henter inn
// belastning, skjerper form eller trener en skadet mann tilbake. Motoren ligger
// i football-individual-training.js; app.js eier lagring og flate.
// ---------------------------------------------------------------------------

// Hvilke roller det gir mening å trene for denne spilleren: den han skal spille
// på lørdag først, så rollene han allerede foretrekker. Listen er aldri tom for
// en spiller med data — å tilby rolletrening uten en eneste rolle ville vært en
// blindvei.
function getIndividualRoleCandidates(player, plannedRoleId) {
  const ids = [plannedRoleId, ...(Array.isArray(player?.preferredRoles) ? player.preferredRoles : [])].filter(Boolean);
  const roles = [...new Set(ids)].map((id) => getRoleById(id)).filter(Boolean);
  return roles.length > 0 ? roles : (Array.isArray(state.roles) ? state.roles.slice(0, 6) : []);
}

// Kapasiteten er 1 + relevant stab (maks 5). Alltid minst én plass, ellers
// ville flata vært en blindvei for en manager uten stab.
function getIndividualTrainingCapacity() {
  const categories = (getCoachContext()?.activeStaff || [])
    .map((member) => member?.category)
    .filter(Boolean);
  return calculateIndividualCapacity(state.individualTrainingCatalogue, { staffCategories: categories });
}

// Ukas tildelinger. Ruller automatisk når Club Week bytter uke — individuell
// oppfølging er en ukesbeslutning, ikke en permanent innstilling.
function getIndividualAssignments() {
  const week = Number(state.clubWeekState?.week) || 1;
  if (Number(state.individualTraining?.week) !== week) return [];
  return Array.isArray(state.individualTraining?.assignments) ? state.individualTraining.assignments : [];
}

function loadIndividualTraining() {
  try {
    const raw = JSON.parse(localStorage.getItem(INDIVIDUAL_TRAINING_KEY) || "null");
    if (!raw || typeof raw !== "object") return { week: null, assignments: [] };
    const sanitized = sanitizeIndividualAssignments(raw.assignments, {
      catalogue: state.individualTrainingCatalogue,
      capacity: 11
    });
    const week = Number(raw.week);
    return { week: Number.isInteger(week) ? week : null, assignments: sanitized.assignments };
  } catch (error) {
    return { week: null, assignments: [] };
  }
}

function saveIndividualTraining() {
  if (!shouldWriteLegacyLeagueStorage()) return;
  try {
    localStorage.setItem(
      INDIVIDUAL_TRAINING_KEY,
      JSON.stringify(state.individualTraining || { week: null, assignments: [] })
    );
  } catch (error) {
    // Privat modus e.l.: appen fortsetter uten persistens.
  }
}

function setIndividualAssignment(playerId, trackId, roleId = null, attributeId = null) {
  const week = Number(state.clubWeekState?.week) || 1;
  const current = getIndividualAssignments().filter((entry) => entry.playerId !== playerId);
  const next = trackId ? [...current, { playerId, trackId, roleId, attributeId }] : current;
  const sanitized = sanitizeIndividualAssignments(next, {
    catalogue: state.individualTrainingCatalogue,
    capacity: getIndividualTrainingCapacity(),
    week
  });
  state.individualTraining = { week, assignments: sanitized.assignments };
  saveIndividualTraining();
  renderApp();
}

// Hvem spiller hvilken rolle på lørdag? Å trene rollen han faktisk skal spille
// gir full uttelling — læringen festes av repetisjonen i kamp.
function getPlannedRoleByPlayerId() {
  const map = {};
  getLineupRoleUsageEntries(getTeamFit()).forEach((entry) => {
    map[entry.playerId] = entry.roleId;
  });
  return map;
}

// Uka gjøres opp: belastning/form/skade til tilstandsmotoren, rollefortrolighet
// til fortrolighetsmotoren. Kalles fra applyWeeklyPlayerRecovery, etter lagets
// hvile — egen restitusjon skal legge seg OPPÅ den, ikke bli spist av den.
function applyIndividualTrainingWeek() {
  const assignments = getIndividualAssignments();
  if (assignments.length === 0) return [];

  const conditions = getPlayerCondition();
  const conditionsById = {};
  conditions.forEach((entry) => { conditionsById[entry.playerId] = entry; });
  const playersById = {};
  getUnlockedPlayers().forEach((player) => { playersById[player.id] = player; });

  const resolved = resolveIndividualTrainingWeek({
    catalogue: state.individualTrainingCatalogue,
    assignments,
    playersById,
    conditionsById,
    staffCategories: (getCoachContext()?.activeStaff || []).map((member) => member?.category).filter(Boolean),
    playsRoleThisWeek: getPlannedRoleByPlayerId(),
    weaknessesByPlayerId: Object.fromEntries(
      assignments.map((assignment) => [assignment.playerId, getPlayerWeaknesses(playersById[assignment.playerId])])
    )
  });

  state.playerCondition = applyIndividualTrainingEffects(conditions, resolved);
  savePlayerCondition();

  if (state.teamMerits && resolved.familiarityGains.length > 0) {
    state.teamMerits.roleFamiliarity = applyTrainingRoleGrowth(getRoleFamiliarityStore(), resolved.familiarityGains);
    saveTeamMerits();
  }

  // Svakhetstrening: individuell-trening-motoren leverer MÅL, ikke tall. Hvor
  // fort en svak side flytter seg eies av svakhetsmotoren — posisjonering går
  // fort, akselerasjon nesten ikke.
  if (state.teamMerits && resolved.weaknessTargets.length > 0) {
    const gains = resolved.weaknessTargets.map((target) => ({
      playerId: target.playerId,
      attributeId: target.attributeId,
      growth: weeklyWeaknessGrowth(state.weaknessCatalogue, target.attributeId, target.staffFactor)
    }));
    state.teamMerits.weaknessProgress = applyWeaknessTraining(getWeaknessProgressStore(), gains);
    saveTeamMerits();
  }

  return resolved.reports;
}

// Troppens svake sider, med framgangen på hver. Flata sier eksplisitt når et
// ferdig arbeid ligger ubrukt — å trene noe du aldri tar i bruk er en av de få
// måtene å kaste bort en uke på, og det skal ikke være skjult.
function renderPlayerWeaknesses(teamFit) {
  const list = elements.weaknessList;
  if (!list) return;

  const work = getLineupWeaknessWork(teamFit);
  if (elements.weaknessWorkSummary) {
    const idle = work.idleWork.length > 0
      ? ` ${work.idleWork.length} ferdig arbeid ligger ubrukt — sett spilleren i en rolle som krever det.`
      : "";
    elements.weaknessWorkSummary.textContent = `${work.headline}${idle}`;
    elements.weaknessWorkSummary.dataset.selected = work.bonus > 0 ? "true" : "false";
  }

  list.textContent = "";
  const store = getWeaknessProgressStore();
  const players = getUnlockedPlayers();

  if (players.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Hent spillere først, så tegner vi profilene deres.";
    list.append(empty);
    return;
  }

  players.forEach((player) => {
    const weaknesses = getPlayerWeaknesses(player);
    const card = document.createElement("article");
    card.className = "weakness-card";

    const title = document.createElement("h5");
    title.textContent = player.name || player.id;
    card.append(title);

    if (weaknesses.length === 0) {
      const none = document.createElement("p");
      none.className = "muted-text";
      none.textContent = "Ingen svake sider innenfor rekkevidde — styrkene hans dekker det posisjonene krever.";
      card.append(none);
      list.append(card);
      return;
    }

    const rows = document.createElement("ul");
    rows.className = "weakness-rows";
    weaknesses.forEach((weakness) => {
      const progress = describeWeaknessProgress(getWeaknessProgress(store, player.id, weakness.attributeId));
      const row = document.createElement("li");
      row.dataset.level = progress.level;

      const label = document.createElement("strong");
      label.textContent = weakness.label;
      const meta = document.createElement("span");
      meta.textContent = `${weakness.category} · ${weakness.difficulty} å trene · ${progress.label}`;
      const bar = document.createElement("div");
      bar.className = "weakness-bar";
      const fill = document.createElement("i");
      fill.style.width = `${progress.value}%`;
      bar.append(fill);

      row.append(label, meta, bar);
      // Hvilke dører den stenger. Er det ingen rolle i rekkevidde, kommer kravet
      // fra selve posisjonen — da sier vi det i stedet for å la linja stå tom.
      const bites = document.createElement("span");
      bites.className = "weakness-bites";
      bites.textContent = weakness.bitesInRoles.length > 0
        ? `Stenger: ${weakness.bitesInRoles.slice(0, 3).map((role) => role.name).join(", ")}`
        : weakness.note || "Kreves av posisjonen han spiller.";
      row.append(bites);
      rows.append(row);
    });
    card.append(rows);
    list.append(card);
  });
}

function renderIndividualTraining() {
  const capacity = getIndividualTrainingCapacity();
  const assignments = getIndividualAssignments();
  const catalogue = state.individualTrainingCatalogue;
  const summary = summarizeIndividualTraining({ catalogue, assignments, capacity });

  if (elements.individualTrainingCapacity) {
    elements.individualTrainingCapacity.textContent = `${summary.headline} ${catalogue?.capacity?.note || ""}`.trim();
    elements.individualTrainingCapacity.dataset.selected = summary.used > 0 ? "true" : "false";
  }

  const conditions = getPlayerCondition();
  const players = getUnlockedPlayers();
  const plannedRoles = getPlannedRoleByPlayerId();

  const chosen = elements.individualTrainingAssignments;
  if (chosen) {
    chosen.textContent = "";
    if (assignments.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted-text";
      empty.textContent = "Ingen spillere følges opp individuelt denne uka.";
      chosen.append(empty);
    }
    assignments.forEach((assignment) => {
      const track = getIndividualTrack(catalogue, assignment.trackId);
      const player = players.find((item) => item.id === assignment.playerId) || null;
      if (!track) return;
      const card = document.createElement("article");
      card.className = "individual-training-card is-selected";

      const title = document.createElement("h5");
      title.textContent = `${player?.name || assignment.playerId} · ${track.name}`;
      const note = document.createElement("p");
      note.className = "muted-text";
      const role = assignment.roleId ? getRoleById(assignment.roleId) : null;
      const attribute = assignment.attributeId ? getWeaknessAttribute(state.weaknessCatalogue, assignment.attributeId) : null;
      if (attribute) {
        const progress = describeWeaknessProgress(
          getWeaknessProgress(getWeaknessProgressStore(), assignment.playerId, assignment.attributeId)
        );
        note.textContent = `${attribute.weaknessLabel} → ${attribute.name}. ${progress.label} (${progress.value}/100). ${progress.hint}`;
      } else if (role) {
        note.textContent = `Lærer rollen ${role.name}. ${plannedRoles[assignment.playerId] === assignment.roleId ? "Han spiller den på lørdag — læringen festes." : "Han spiller den ikke denne uka, så læringen fester seg saktere."}`;
      } else {
        note.textContent = track.effectText;
      }
      const risk = document.createElement("p");
      risk.className = "individual-training-risk";
      risk.textContent = track.riskText;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "individual-training-remove";
      remove.textContent = "Avslutt oppfølging";
      remove.addEventListener("click", () => setIndividualAssignment(assignment.playerId, null));

      card.append(title, note, risk, remove);
      chosen.append(card);
    });
  }

  const picker = elements.individualTrainingPicker;
  if (!picker) return;
  picker.textContent = "";

  if (assignments.length >= capacity) {
    const full = document.createElement("p");
    full.className = "muted-text";
    full.textContent = "Alle plassene er brukt. Avslutt en oppfølging for å flytte den til en annen spiller — eller hent inn mer stab for å få flere plasser.";
    picker.append(full);
    return;
  }

  const assignedIds = new Set(assignments.map((entry) => entry.playerId));
  // Sorter dem som trenger noe av deg først: skadde, så slitne, så resten.
  const ranked = players
    .filter((player) => !assignedIds.has(player.id))
    .map((player) => ({ player, condition: conditionFor(conditions, player.id) }))
    .sort((a, b) => {
      const score = (entry) => (isInjured(entry.condition) ? 0 : freshnessFor(entry.condition));
      return score(a) - score(b);
    })
    .slice(0, 8);

  if (ranked.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted-text";
    empty.textContent = "Ingen ledige spillere å følge opp.";
    picker.append(empty);
    return;
  }

  ranked.forEach(({ player, condition }) => {
    const card = document.createElement("article");
    card.className = "individual-training-card";

    const title = document.createElement("h5");
    title.textContent = player.name || player.id;
    const status = document.createElement("p");
    status.className = "muted-text";
    status.textContent = describeCondition(condition);
    card.append(title, status);

    // Svake sider er ikke en dom over spilleren — de er svaret på «hvor koster
    // det noe å bruke ham?». Derfor står de synlig på kortet der du velger hva
    // han skal jobbe med, ikke gjemt bak en forklaring.
    const weaknesses = getPlayerWeaknesses(player);
    const weaknessLine = document.createElement("p");
    weaknessLine.className = "individual-training-weaknesses";
    weaknessLine.textContent = weaknesses.length > 0
      ? `Svake sider: ${weaknesses.map((weakness) => weakness.label.toLowerCase()).join(" · ")}`
      : "Ingen svake sider innenfor rekkevidde.";
    card.append(weaknessLine);

    const weaknessSelect = document.createElement("select");
    weaknessSelect.className = "individual-training-role";
    weaknessSelect.setAttribute("aria-label", `Svak side å jobbe med for ${player.name || player.id}`);
    weaknesses.forEach((weakness) => {
      const progress = getWeaknessProgress(getWeaknessProgressStore(), player.id, weakness.attributeId);
      const option = document.createElement("option");
      option.value = weakness.attributeId;
      option.textContent = `${weakness.label} — ${weakness.difficulty}${progress > 0 ? ` (${progress}/100)` : ""}`;
      weaknessSelect.append(option);
    });
    if (weaknesses.length > 0) card.append(weaknessSelect);

    // Rolletrening trenger et mål. Valget er managerens: rollen han skal spille
    // på lørdag, eller en han skal lære til senere.
    const roleCandidates = getIndividualRoleCandidates(player, plannedRoles[player.id] || null);
    const roleSelect = document.createElement("select");
    roleSelect.className = "individual-training-role";
    roleSelect.setAttribute("aria-label", `Rolle å trene for ${player.name || player.id}`);
    roleCandidates.forEach((role) => {
      const option = document.createElement("option");
      option.value = role.id;
      option.textContent = role.id === plannedRoles[player.id] ? `${role.name} (spiller den på lørdag)` : role.name;
      roleSelect.append(option);
    });
    if (roleCandidates.length > 0) card.append(roleSelect);

    const options = document.createElement("div");
    options.className = "individual-training-tracks";
    (catalogue?.tracks || []).forEach((track) => {
      const roleId = track.requires === "role" ? (roleSelect.value || roleCandidates[0]?.id || null) : null;
      const attributeId = track.requires === "weakness"
        ? (weaknessSelect.value || weaknesses[0]?.attributeId || null)
        : null;
      const check = evaluateIndividualAssignment({ track, player, condition, roleId, attributeId, weaknesses });
      const button = document.createElement("button");
      button.type = "button";
      button.className = "individual-training-track";
      button.textContent = track.name;
      button.title = `${track.shortDescription} ${check.valid ? track.effectText : check.reason}`;
      button.disabled = !check.valid;
      if (check.valid) {
        button.addEventListener("click", () => setIndividualAssignment(
          player.id,
          track.id,
          track.requires === "role" ? (roleSelect.value || roleCandidates[0]?.id || null) : null,
          track.requires === "weakness" ? (weaknessSelect.value || weaknesses[0]?.attributeId || null) : null
        ));
      }
      options.append(button);
    });
    card.append(options);
    picker.append(card);
  });
}

// Signal/anbefaling/risiko hører hjemme der du velger RAMMEN — i
// programpopupen. De sto tidligere på selve Trening-flata, som en fjerde boks
// ved siden av tre andre; det var en del av grunnen til at flata leste som en
// vegg uten rekkefølge.
function renderTrainingProgramContext({ recommendation, programs, selectedProgram }) {
  const recommendedProgram = programs[0] || null;
  const recommendedFocus = recommendation?.focusIds?.[0] ? getTrainingFocus(recommendation.focusIds[0]) : null;
  const recommendedLabel = recommendedProgram?.title || recommendedFocus?.name || "Trygt basisfokus";
  const signal = selectedProgram?.recommendedBecause?.[0]
    || recommendedProgram?.recommendedBecause?.[0]
    || recommendation?.reason
    || summarizeOffPitchContext(getOffPitchState()).headline;
  const risk = selectedProgram ? trainingChoiceRiskFromProgram(selectedProgram) : trainingChoiceRiskFromProgram(recommendedProgram);

  if (elements.trainingChoiceSignal) elements.trainingChoiceSignal.textContent = signal;
  if (elements.trainingChoiceRecommended) elements.trainingChoiceRecommended.textContent = recommendedLabel;
  if (elements.trainingChoiceRisk) elements.trainingChoiceRisk.textContent = risk;
  if (elements.trainingProgramLoadValue) {
    const load = describeWeeklyLoad(
      calculateWeeklyTrainingIntensity({
        program: selectedProgram || recommendedProgram,
        focusId: state.weeklyTrainingFocus?.focusId || null
      })
    );
    elements.trainingProgramLoadValue.textContent = selectedProgram
      ? load.label
      : `${load.label} (hvis du velger anbefalt)`;
  }
}

// ---------------------------------------------------------------------------
// Ukens plan: den ene flata som gjør rekkefølgen tydelig
// ---------------------------------------------------------------------------

// Ukas valgte program som en full komposisjon. Rammen (økter, belastning,
// relaterte fokus) er kontekstuavhengig, så et tomt kontekstobjekt holder — vi
// bruker den kun til belastning og samsvar, ikke til poeng.
function getSelectedTrainingProgramComposition() {
  const programId = state.weeklyTrainingProgram?.programId;
  if (!programId) return null;
  return getTrainingProgramCompositionById(programId, {});
}

function getWeeklyTrainingPlan() {
  return createWeeklyTrainingPlan({
    week: Number(state.clubWeekState?.week) || 1,
    inboxRead: hasAcknowledgedInboxThisWeek(),
    program: getSelectedTrainingProgramComposition(),
    focusId: state.weeklyTrainingFocus?.focusId || null,
    individualSummary: summarizeIndividualTraining({
      catalogue: state.individualTrainingCatalogue,
      assignments: getIndividualAssignments(),
      capacity: getIndividualTrainingCapacity()
    }),
    conditionSummary: null
  });
}

function focusTrainingWorkspace(legacyModalId) {
  const targetId = getTrainingWorkspaceTarget(legacyModalId);
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) return;
  state.openTrainingStepId = targetId;
  activateTab("trening");
  requestAnimationFrame(() => {
    syncTrainingWorkspace(document.querySelector("#trainingWorkspace"), state.openTrainingStepId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.focus({ preventScroll: true });
  });
}

function openManagerTrainingTarget(target) {
  if (target === "inbox" || target === "kamp") {
    activateTab(target);
    return;
  }
  if (target === "details") {
    if (elements.trainingDepth) {
      elements.trainingDepth.open = true;
      elements.trainingDepth.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }
  const step = typeof target === "string" ? document.getElementById(target) : null;
  if (!step) return;
  state.openTrainingStepId = step.id;
  activateTab("trening");
  requestAnimationFrame(() => {
    syncTrainingWorkspace(document.querySelector("#trainingWorkspace"), state.openTrainingStepId);
    step.scrollIntoView({ behavior: "smooth", block: "start" });
    step.focus({ preventScroll: true });
  });
}

function renderManagerTrainingScene(plan) {
  if (!elements.trainingCommand) return;
  const conditionSummary = summarizeSquadCondition(getPlayerCondition());
  const individualSummary = summarizeIndividualTraining({
    catalogue: state.individualTrainingCatalogue,
    assignments: getIndividualAssignments(),
    capacity: getIndividualTrainingCapacity()
  });
  const offPitchSummary = summarizeOffPitchContext(getOffPitchState());
  const selectedProgram = getSelectedTrainingProgramComposition();
  const selectedFocus = getTrainingFocus(state.weeklyTrainingFocus?.focusId || null);
  const model = createManagerTrainingSceneModel({
    week: Number(state.clubWeekState?.week) || 1,
    phase: state.clubWeekState?.phase || "training",
    opponent: getMiniSeasonNextOpponent(),
    plan,
    assistantSignal: elements.trainingChoiceSignal?.textContent || offPitchSummary.headline,
    assistantDetail: plan?.coherence?.note || offPitchSummary.headline,
    conditionSummary,
    selectedProgram,
    selectedFocus,
    individualSummary
  });
  renderManagerTrainingCommand(elements.trainingCommand, model, { onOpenTarget: openManagerTrainingTarget });
}

function renderWeeklyTrainingPlan() {
  if (!elements.trainingChoiceGate) return;
  const plan = getWeeklyTrainingPlan();

  if (elements.trainingPlanHeadline) elements.trainingPlanHeadline.textContent = plan.headline;
  if (elements.trainingPlanCoherence) {
    elements.trainingPlanCoherence.textContent = plan.coherence.note;
    elements.trainingPlanCoherence.dataset.level = plan.coherence.level;
  }
  if (elements.trainingPlanLoad) {
    elements.trainingPlanLoad.textContent = `${plan.load.label} · intensitet ${plan.intensity}`;
    elements.trainingPlanLoad.dataset.level = plan.load.level;
  }
  if (elements.trainingChoiceStatus) {
    elements.trainingChoiceStatus.textContent = plan.ready ? "Treningsuke valgt" : "Ikke valgt";
    elements.trainingChoiceStatus.dataset.selected = plan.ready ? "true" : "false";
  }
  if (elements.trainingGoMatch) elements.trainingGoMatch.hidden = !plan.ready;

  const list = elements.trainingPlanSteps;
  if (list) {
    list.textContent = "";
    plan.steps.forEach((step) => {
      const item = document.createElement("li");
      item.className = "training-plan-step";
      item.dataset.done = step.done ? "true" : "false";
      if (step.id === plan.nextStepId) item.classList.add("is-next");

      const head = document.createElement("div");
      head.className = "training-plan-step-head";
      const title = document.createElement("h3");
      title.textContent = `${step.order}. ${step.title}`;
      const status = document.createElement("span");
      status.className = "training-plan-step-status";
      status.textContent = step.status;
      head.append(title, status);

      const role = document.createElement("p");
      role.className = "training-plan-step-role";
      role.textContent = step.role;

      const detail = document.createElement("p");
      detail.className = "training-plan-step-detail";
      detail.textContent = step.detail;

      const action = document.createElement("button");
      action.type = "button";
      action.className = "training-plan-step-action";
      action.textContent = step.done ? "Endre" : "Velg";
      if (step.modal) {
        action.addEventListener("click", () => focusTrainingWorkspace(step.modal));
      } else {
        action.addEventListener("click", () => activateTab(step.target));
      }

      item.append(head, role, detail, action);
      list.append(item);
    });
  }

  if (elements.trainingPlanNext) {
    const next = plan.steps.find((step) => step.id === plan.nextStepId) || null;
    elements.trainingPlanNext.hidden = false;
    if (next) {
      elements.trainingPlanNext.textContent = `Neste: ${next.title.toLowerCase()}`;
      elements.trainingPlanNext.onclick = () => {
        if (next.modal) {
          focusTrainingWorkspace(next.modal);
        } else {
          activateTab(next.target);
        }
      };
    } else {
      elements.trainingPlanNext.textContent = "Uka er planlagt — gå til Kamp";
      elements.trainingPlanNext.onclick = () => activateTab("kamp");
    }
  }

  renderManagerTrainingScene(plan);

  state.openTrainingStepId = syncTrainingWorkspace(
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
  const players = getUnlockedPlayers();

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
      elements.unlockedPlayersStatus.textContent = `Klubbspillere du kan bruke: ${players.length}.${pendingNote}${scoutedNote}`;
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
    elements.collectionPlayersCount.textContent = String(snapshot.unlockedPlayers.length);
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
        activateStarterSquad(access.baseSquad);
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

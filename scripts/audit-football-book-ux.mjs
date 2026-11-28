// scripts/audit-football-book-ux.mjs
// QA for Fotballboka game-text surfaces: relevant matches only, concise help, and safe fallback.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getFootballBookGameText } from "../dist/index.js";
import { buildClubBookChapters } from "../src/football-book-club-chapters.js";
import { THEORY_CHAPTERS } from "../src/football-book-theory.js";
import { SCHOOL_CHAPTERS } from "../src/football-book-schools.js";
import { ROLE_CHAPTERS } from "../src/football-book-roles.js";
import { PHASE_CHAPTERS } from "../src/football-book-phases.js";
import { SET_PIECE_CHAPTERS } from "../src/football-book-set-pieces.js";
import { TRAINING_CHAPTERS } from "../src/football-book-training.js";
import { recordMatchRoleUsage, getRoleFamiliarity } from "../src/football-role-familiarity-engine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const indexPath = join(root, "data", "football_book_knowledge_principles.json");

const scenarios = [
  { code: "pressing_coherence_weak", trainingArea: "Press" },
  { code: "defensive_balance_weak", trainingArea: "Restforsvar" },
  { code: "attacking_balance_weak", trainingArea: "Angrepsstruktur" },
  { code: "midfield_control_weak", trainingArea: "Midtbanekontroll" },
  { code: "average_role_fit_weak", trainingArea: "Rolleforståelse" },
];

const actionWords = ["tren", "juster", "bruk", "velg", "flytt", "gi", "gjør", "sørg", "koble", "start", "avklar", "reduser", "øk", "hold", "la "];
const errors = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function loadPrinciples() {
  const index = readJson(indexPath);
  return index.files.flatMap((file) => readJson(join(root, file)).principles || []);
}

function words(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean);
}

function hasAction(text) {
  const normalized = String(text || "").toLowerCase();
  return actionWords.some((word) => normalized.includes(word));
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

const principles = loadPrinciples();

for (const scenario of scenarios) {
  const base = { principles, weakPoints: [scenario.code], maxResults: 1 };
  const assistant = getFootballBookGameText({ ...base, surface: "assistant" })[0];
  check(assistant, `${scenario.code}: assistant mangler Fotballboka-match`);
  if (assistant) {
    check(assistant.matchType === "weakPoint", `${scenario.code}: assistant matcher ${assistant.matchType}, ikke weakPoint`);
    check(words(assistant.text).length <= 28, `${scenario.code}: assistantText er for lang (${words(assistant.text).length} ord)`);
    check(hasAction(assistant.text), `${scenario.code}: assistantText peker ikke tydelig til neste handling`);
  }

  const training = getFootballBookGameText({
    principles,
    weakPoints: [scenario.code],
    trainingAreas: [scenario.trainingArea],
    surface: "training",
    maxResults: 1,
  })[0];
  check(training, `${scenario.code}: training mangler Fotballboka-match`);
  if (training) {
    check(["weakPoint", "trainingArea"].includes(training.matchType), `${scenario.code}: training matcher uventet ${training.matchType}`);
    check(words(training.text).length <= 34, `${scenario.code}: trainingText er for lang (${words(training.text).length} ord)`);
    check(hasAction(training.text), `${scenario.code}: trainingText forklarer ikke anvendbar økt`);
  }

  const report = getFootballBookGameText({ ...base, surface: "matchReport" })[0];
  check(report, `${scenario.code}: matchReport mangler Fotballboka-match`);
  if (report) {
    check(report.matchType === "weakPoint", `${scenario.code}: matchReport matcher ${report.matchType}, ikke weakPoint`);
    check(words(report.text).length <= 34, `${scenario.code}: matchReportText er for lang (${words(report.text).length} ord)`);
  }

  const tooltip = getFootballBookGameText({ ...base, surface: "tooltip" })[0];
  check(tooltip, `${scenario.code}: tooltip mangler Fotballboka-match`);
  if (tooltip) {
    check(words(tooltip.text).length <= 18, `${scenario.code}: tooltipText er for lang (${words(tooltip.text).length} ord)`);
  }

  const handbook = getFootballBookGameText({ ...base, surface: "handbook", maxResults: 2 });
  check(handbook.length > 0 && handbook.length <= 2, `${scenario.code}: handbook skal være sekundær og begrenset`);
}

const noMatchBase = {
  principles,
  weakPoints: ["no_matching_weak_point"],
  trainingAreas: ["Restforsvar"],
  relatedTags: ["tilfeldig teori"],
  maxResults: 1,
};
for (const surface of ["assistant", "training", "matchReport", "tooltip", "handbook"]) {
  const matches = getFootballBookGameText({ ...noMatchBase, surface });
  check(matches.length === 0, `no_matching_weak_point: ${surface} viser Fotballboka-tekst uten match`);
}

const mismatchedTraining = getFootballBookGameText({
  principles,
  weakPoints: ["pressing_coherence_weak"],
  trainingAreas: ["Keeper"],
  surface: "training",
  maxResults: 1,
});
check(
  mismatchedTraining.length === 0,
  "training: viser Fotballboka-tekst når weakPoint og eksisterende training area peker i ulike retninger",
);

const clubChapters=buildClubBookChapters(readJson(join(root,"data","football_league_club_profiles.json")).profiles);
check(clubChapters.length===12,"Fotballboka mangler kildebelagte klubbkapitler");
for(const chapter of clubChapters){check(Boolean(chapter.historicalNote&&chapter.interpretation&&chapter.sources.length),chapter.name+": mangler kilde eller forklaring");}
for(const [id,count] of [["rosenborg",2],["brann",2],["valerenga",2],["molde",1],["lillestrom",3],["bodo_glimt",2],["stromsgodset",2],["hodd",1],["asane",1],["viking",3],["stabak",3],["tromso",4]])check(clubChapters.find(c=>c.id===id)?.diagrams.length===count,id+": diagrammer mangler");
check(clubChapters.reduce((sum,c)=>sum+c.diagrams.length,0)===26,"Fotballboka mangler illustrasjoner");
for(const chapter of clubChapters)for(const d of chapter.diagrams){check(Boolean(d.title&&d.note),chapter.name+": mangler figurtekst");if(d.kind==="pitch"){check(d.players.every(([x,y,label,side])=>[x,y].every(n=>Number.isFinite(n)&&n>=0&&n<=100)&&label&&["a","d"].includes(side)),chapter.name+": ugyldig spillerposisjon");check(d.arrows.every(a=>a.length===4&&a.every(n=>Number.isFinite(n)&&n>=0&&n<=100)),chapter.name+": ugyldig pil");}}
const bookHtml=readFileSync(join(root,"index.html"),"utf8");
check(bookHtml.includes('id="footballBookClubChapters"')&&bookHtml.includes('src="src/football-book-club-chapters.js"'),"Klubbkapitler ikke tilgjengelige i spillet");
check(THEORY_CHAPTERS.length===7,"Teorikapitler mangler");
const defenceDetails=THEORY_CHAPTERS.find(c=>c.id==="press_cover_shift")?.sourceDetails||[];
check(defenceDetails.map(d=>d.id).join(",")==="first_defender,steering,marking,blocking,cover,duels,back_to_goal,interception","Originalmanusets forsvarsteknikk mangler");
for(const d of defenceDetails)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": mangler fagtekst eller kilde");
const detailRenderer=readFileSync(join(root,"src","football-book-club-chapters.js"),"utf8");
check(detailRenderer.includes("chapter.sourceDetails||[]")&&detailRenderer.includes("c.sourceDetails||[]"),"Originalstoff må kunne leses og søkes i boka");
check(new Set(THEORY_CHAPTERS.map(c=>c.id)).size===THEORY_CHAPTERS.length,"Duplikate teorikapitler");
for(const c of THEORY_CHAPTERS){
  check(Boolean(c.title&&c.concept&&c.dilemma&&c.manager&&c.practice),c.id+": ufullstendig teorikapittel");
  check(c.principles.length>0&&c.principles.every(id=>principles.some(p=>p.id===id)),c.id+": ukjent kunnskapsprinsipp");
  check(c.clubs.length>0&&c.clubs.every(id=>clubChapters.some(p=>p.id===id)),c.id+": ukjent klubbeksempel");
  check(c.diagrams.length>0&&c.diagrams.every(d=>d.title&&d.note),c.id+": mangler illustrasjoner");
}
check(THEORY_CHAPTERS.reduce((n,c)=>n+c.diagrams.length,0)===12,"Teorifigurer mangler");
check(bookHtml.includes('id="footballBookTheory"'),"Teoridelen er ikke tilgjengelig i spillet");
check(SCHOOL_CHAPTERS.length===6,"Fotballskoler mangler");
for(const [id,expected] of Object.entries({"formations":["portrait_pozzo","portrait_chapman","portrait_tuchel","portrait_ferguson"],"gegenpress":["portrait_rangnick"],"catenaccio":["portrait_mourinho"],"third_man":["portrait_wenger"],"transition_attack":["portrait_ranieri"]})){
  const sections=[...THEORY_CHAPTERS,...SCHOOL_CHAPTERS,...PHASE_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Faglig tillegg – ")&&d.source.includes("https://"),key+": trenerarkitekt-case mangler");}
}
for(const [id,expected] of Object.entries({"keepers":["portrait_keeper_depth","portrait_keeper_angles","portrait_keeper_saves","portrait_keeper_distribution"],"link_strikers":["portrait_hidegkuti"],"finishing_press":["portrait_puskas"],"six_regista":["portrait_scanning"],"ten_creator":["portrait_creative"],"total_football":["portrait_cruyff_michels"],"catenaccio":["portrait_herrera"],"gegenpress":["portrait_klopp"],"positional_play":["portrait_guardiola_ederson"]})){
  const sections=[...ROLE_CHAPTERS,...SCHOOL_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": personcase mangler");}
}
for(const [id,expected] of Object.entries({"total_football":["culture_art_results","culture_adorno","culture_eco","culture_gadamer","culture_aristotle","culture_synthesis"],"catenaccio":["culture_pragmatism"],"individual_development":["culture_habitus_field","culture_symbolic_capital","culture_access_class"],"exercise_constraints":["culture_material_conditions"],"formations":["culture_elias","culture_regional_examples"],"relationism":["culture_identity"],"collective_training":["culture_socrates"]})){
  const sections=[...THEORY_CHAPTERS,...SCHOOL_CHAPTERS,...TRAINING_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": originalmanusets kultur og filosofi mangler");}
}
for(const [id,expected] of Object.entries({"formations":["history_chaos","history_combination","history_rules","history_continent","history_wm","history_brazil","history_women"],"false_nine_inverted_back":["history_hungary"],"total_football":["history_total","history_collective_cognition"],"catenaccio":["history_catenaccio"],"positional_play":["history_cruyff_barca","history_keeper"],"gegenpress":["history_intensity"]})){
  const sections=[...THEORY_CHAPTERS,...SCHOOL_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": originalmanusets fotballhistorie mangler");}
}
check(new Set(SCHOOL_CHAPTERS.map(c=>c.id)).size===SCHOOL_CHAPTERS.length,"Duplikate fotballskoler");
for(const c of SCHOOL_CHAPTERS){
  check(Boolean(c.title&&c.era&&c.concept&&c.dilemma&&c.manager&&c.practice),c.id+": ufullstendig skole");
  check(c.principles.length>0&&c.principles.every(id=>principles.some(p=>p.id===id)),c.id+": ukjent kunnskapsprinsipp");
  check(c.clubs.length>0&&c.clubs.every(id=>clubChapters.some(p=>p.id===id)),c.id+": ukjent klubbeksempel");
  check(c.sources.length>=2&&c.sources.every(s=>s.title&&/^https:\/\//.test(s.url)),c.id+": manglende kilde");
  check(c.diagrams.length>0&&c.diagrams.every(d=>d.title&&d.note),c.id+": mangler illustrasjon");
  for(const d of c.diagrams)if(d.kind==="pitch"){
    check(d.players.every(([x,y,label,side])=>[x,y].every(n=>Number.isFinite(n)&&n>=0&&n<=100)&&label&&["a","d"].includes(side)),c.id+": ugyldig spillerposisjon");
    check(d.arrows.every(a=>a.length===4&&a.every(n=>Number.isFinite(n)&&n>=0&&n<=100)),c.id+": ugyldig pil");
  }
}
check(SCHOOL_CHAPTERS.reduce((n,c)=>n+c.diagrams.length,0)===8,"Skolefigurer mangler");
check(bookHtml.includes('id="footballBookSchools"'),"Fotballskoler ikke tilgjengelige i spillet");
const canonicalRoles=readJson(join(root,"data","football_roles.json")).roles;
const bookRoleIds=ROLE_CHAPTERS.flatMap(c=>c.roles.map(r=>r.id));
check(ROLE_CHAPTERS.length===9,"Rollekapitler mangler");
for(const [id,expected] of Object.entries({"keepers":["keeper_positioning","keeper_saves","keeper_distribution","portrait_keeper_depth","portrait_keeper_angles","portrait_keeper_saves","portrait_keeper_distribution"],"centre_backs":["centre_back_defence","centre_back_attack"],"fullbacks":["fullback_defence","fullback_attack","wingback_corridor"],"six_regista":["central_midfield_defence","central_midfield_attack","portrait_scanning"],"eight_press":["eight_defence","eight_attack"],"ten_creator":["supporting_forward","portrait_creative"],"wingers":["winger_defence","winger_attack"],"link_strikers":["meeting_forward","portrait_hidegkuti"],"finishing_press":["striker_defence","striker_attack","portrait_puskas"]})){
  const sections=(ROLE_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[]).filter(d=>d.source.startsWith("Fotballdokumentet v1.pdf"));
  check(sections.map(d=>d.id).join(",")===expected.join(","),id+": originalmanusets posisjonelle arbeidsoppgaver mangler");
  for(const d of sections)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": mangler fagtekst eller kilde");
}
check(new Set(bookRoleIds).size===bookRoleIds.length,"Duplikate roller i Fotballboka");
check(bookRoleIds.length===canonicalRoles.length&&canonicalRoles.every(r=>bookRoleIds.includes(r.id)),"Fotballboka dekker ikke alle kanoniske roller");
for(const c of ROLE_CHAPTERS){
  check(Boolean(c.title&&c.concept&&c.dilemma&&c.manager&&c.practice),c.id+": ufullstendig rollekapittel");
  check(c.principles.every(id=>principles.some(p=>p.id===id)),c.id+": ukjent kunnskapsprinsipp");
  check(c.clubs.every(id=>clubChapters.some(p=>p.id===id)),c.id+": ukjent klubbeksempel");
  check(c.roles.every(r=>r.description&&canonicalRoles.some(p=>p.id===r.id)),c.id+": ukjent rolle");
  check(c.diagrams.length>0&&c.diagrams.every(d=>d.title&&d.note&&d.kind==="pitch"),c.id+": mangler rollefigur");
  for(const d of c.diagrams){
    check(d.players.every(([x,y,label,side])=>[x,y].every(n=>Number.isFinite(n)&&n>=0&&n<=100)&&label&&["a","d"].includes(side)),c.id+": ugyldig spillerposisjon");
    check(d.arrows.every(a=>a.length===4&&a.every(n=>Number.isFinite(n)&&n>=0&&n<=100)),c.id+": ugyldig pil");
  }
}
check(ROLE_CHAPTERS.reduce((n,c)=>n+c.diagrams.length,0)===11,"Rollefigurer mangler");
check(bookHtml.includes('id="footballBookRoles"'),"Rollekapitlene ikke tilgjengelige i spillet");
check(PHASE_CHAPTERS.length===4,"Kampfasene mangler");
const attackDetails=PHASE_CHAPTERS.find(c=>c.id==="in_possession")?.sourceDetails||[];
check(attackDetails.map(d=>d.id).join(",")==="attack_principles,carrying,dribbling,cuts,receiving,turning,passing,passing_types,shooting,heading,finishing,one_on_one,perception,open_body,reading_game,passing_timing,penetration,crossing,possession_cycle,established_model,corridor_to_centre,centre_to_corridor,signal_triangle","Originalmanusets individuelle, relasjonelle og kollektive angrepsferdigheter mangler");
for(const [id,expected] of Object.entries({"third_man":["support_angles","passing_shadow","run_patterns","build_up_patterns"],"overloads_space":["space_timing","two_against_one"],"overlap_underlap":["support_runs"]})){
  const ds=(THEORY_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[]).filter(d=>d.source.startsWith("Fotballdokumentet v1.pdf"));
  check(ds.map(d=>d.id).join(",")===expected.join(","),id+": relasjonelle angrepsferdigheter mangler");
  for(const d of ds)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": mangler fagtekst eller kilde");
}
for(const d of attackDetails)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": mangler fagtekst eller kilde");
check(new Set(PHASE_CHAPTERS.map(c=>c.id)).size===4,"Duplikate kampfaser");
for(const [id,expected] of Object.entries({"out_of_possession":["press_height","lock_press","press_triggers","pump_and_drop","marking_models"],"transition_attack":["counter_signal","counter_3v3","counter_4v2","counter_width_clearance","first_after_win"],"transition_defend":["recalibrate"],"formations":["proactive_reactive","formation_choices","history_chaos","history_combination","history_rules","history_continent","history_wm","history_brazil","history_women","culture_elias","culture_regional_examples"],"rest_defence":["risk_balance"]})){
  const sections=([...PHASE_CHAPTERS,...THEORY_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[]).filter(d=>d.source.startsWith("Fotballdokumentet v1.pdf"));
  check(sections.map(d=>d.id).join(",")===expected.join(","),id+": originalmanusets spillmodell mangler");
  for(const d of sections)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": mangler fagtekst eller kilde");
}
for(const c of PHASE_CHAPTERS){
  check(Boolean(c.title&&c.concept&&c.dilemma&&c.manager&&c.practice),c.id+": ufullstendig fasekapittel");
  check(c.principles.every(id=>principles.some(p=>p.id===id)),c.id+": ukjent kunnskapsprinsipp");
  check(c.clubs.every(id=>clubChapters.some(p=>p.id===id)),c.id+": ukjent klubbeksempel");
  check(c.diagrams.length===2&&c.diagrams.every(d=>d.title&&d.note),c.id+": mangler fasefigur");
  for(const ref of c.engineRefs){check(readFileSync(join(root,ref.file),"utf8").includes("function "+ref.symbol+"("),c.id+": mangler referert motormekanikk "+ref.symbol);}
  for(const d of c.diagrams)if(d.kind==="pitch"){
    check(d.players.every(([x,y,label,side])=>[x,y].every(n=>Number.isFinite(n)&&n>=0&&n<=100)&&label&&["a","d"].includes(side)),c.id+": ugyldig spillerposisjon");
    check(d.arrows.every(a=>a.length===4&&a.every(n=>Number.isFinite(n)&&n>=0&&n<=100)),c.id+": ugyldig pil");
  }
}
check(bookHtml.includes('id="footballBookPhases"'),"Kampfasene ikke tilgjengelige i spillet");
check(SET_PIECE_CHAPTERS.length===5,"Dødballkapitler mangler");
for(const [id,expected] of Object.entries({"link_strikers":["portrait_bergkamp"],"ten_creator":["portrait_de_bruyne","portrait_messi"],"wingers":["portrait_okocha","portrait_neymar"],"finishing_press":["portrait_van_basten","portrait_shearer","portrait_haaland"],"third_man":["portrait_bergkamp_henry_debruyne_haaland"]})){
  const sections=[...ROLE_CHAPTERS,...THEORY_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Faglig tillegg – ")&&d.source.includes("https://"),key+": teknisk personcase mangler");}
}
for(const [id,expected] of Object.entries({"ten_creator":["portrait_tom_lund"],"eight_press":["portrait_leonhardsen"],"finishing_press":["portrait_strandli","portrait_meazza_eusebio"],"wingers":["portrait_mathews_garrincha"],"formations":["portrait_meredith_mcgregor"],"link_strikers":["portrait_pele"],"free_kicks":["portrait_juninho_beckham_pirlo"],"transition_attack":["portrait_drillo"]})){
  const sections=[...ROLE_CHAPTERS,...THEORY_CHAPTERS,...SET_PIECE_CHAPTERS,...PHASE_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Faglig tillegg – ")&&d.source.includes("https://"),key+": faglig personcase mangler");}
}
for(const [id,expected] of Object.entries({"attacking_corners":["corner_low_delivery","corner_disguise"],"free_kicks":["free_kick_targets","penalty_kicker","penalty_keeper"],"throw_ins":["restart_lock"],"marking_blocks":["corner_defence_posts","restart_organize"],"second_ball_security":["offensive_marking_restart","clearance_counter_restart"]})){
  const sections=(SET_PIECE_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[]).filter(d=>d.source.startsWith("Fotballdokumentet v1.pdf"));
  check(JSON.stringify(sections.map(d=>d.id))===JSON.stringify(expected),id+": dødballavsnittene fra originalmanuset mangler");
  for(const d of sections)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": kilde mangler");
}
check(new Set(SET_PIECE_CHAPTERS.map(c=>c.id)).size===5,"Duplikate dødballkapitler");
for(const c of SET_PIECE_CHAPTERS){
  check(Boolean(c.title&&c.concept&&c.dilemma&&c.manager&&c.practice),c.id+": ufullstendig kapittel");
  check(c.principles.every(id=>principles.some(p=>p.id===id)),c.id+": ukjent kunnskapsprinsipp");
  check(c.clubs.every(id=>clubChapters.some(p=>p.id===id)),c.id+": ukjent klubbeksempel");
  check(c.sources.length>=2&&c.sources.every(s=>s.title&&s.url.startsWith("https://")),c.id+": manglende kilde");
  for(const ref of c.engineRefs||[]){check(readFileSync(join(root,ref.file),"utf8").includes("function "+ref.symbol+"("),c.id+": ukjent mekanikk");}
  check(c.diagrams.length>0&&c.diagrams.every(d=>d.title&&d.note),c.id+": mangler illustrasjoner");
  for(const d of c.diagrams)if(d.kind==="pitch"){
    check(d.players.every(([x,y,label,side])=>[x,y].every(n=>Number.isFinite(n)&&n>=0&&n<=100)&&label&&["a","d"].includes(side)),c.id+": ugyldig spillerposisjon");
    check(d.arrows.every(a=>a.length===4&&a.every(n=>Number.isFinite(n)&&n>=0&&n<=100)),c.id+": ugyldig pil");
  }
}
check(SET_PIECE_CHAPTERS.reduce((n,c)=>n+c.diagrams.length,0)===9,"Dødballfigurer mangler");
check(bookHtml.includes('id="footballBookSetPieces"'),"Dødballer ikke tilgjengelige i spillet");
check(TRAINING_CHAPTERS.length===6,"Treningskapitler mangler");
for(const [id,expected] of Object.entries({"exercise_constraints":["onenote_cone_gate","onenote_waiting_groups"],"coaching_transfer":["onenote_ball_path","onenote_free_play"],"individual_development":["onenote_motivation_conversation"],"gegenpress":["onenote_selective_press"],"positional_play":["onenote_structure_break","onenote_rhythm_space"],"collective_training":["onenote_shared_perception"],"training_problem":["onenote_data_analysis"]})){
  const sections=[...TRAINING_CHAPTERS,...SCHOOL_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("OneNote – ")&&d.source.includes("0x"),key+": OneNote-kildeanker mangler");}
}
for(const [id,expected] of Object.entries({"link_strikers":["portrait_di_stefano"],"centre_backs":["portrait_beckenbauer"],"collective_training":["portrait_keane_deschamps","portrait_weah_romario_civic"],"marking_blocks":["portrait_ramos"],"ten_creator":["portrait_zico_baggio_zola"],"free_kicks":["portrait_rivelino"],"finishing_press":["portrait_romario","portrait_kanu_ravanelli"],"eight_press":["portrait_yaya_toure","portrait_nakata_park"],"wingers":["portrait_son","portrait_gamst_gronkjaer"]})){
  const sections=[...ROLE_CHAPTERS,...TRAINING_CHAPTERS,...SET_PIECE_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Faglig tillegg – ")&&d.source.includes("https://"),key+": kultur- og spillerprofil mangler");}
}
for(const [id,expected] of Object.entries({"finishing_press":["portrait_henry","portrait_ronaldo_nazario","portrait_cristiano_heading"],"wingers":["portrait_mbappe"],"link_strikers":["portrait_drogba_lukaku"],"eight_press":["portrait_kante","portrait_matthaus","portrait_modric"],"six_regista":["portrait_makelele"],"fullbacks":["portrait_lahm"],"centre_backs":["portrait_maldini"],"individual_development":["portrait_zlatan_longevity","portrait_physical_role_comparison"]})){
  const sections=[...ROLE_CHAPTERS,...TRAINING_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Faglig tillegg – ")&&d.source.includes("https://"),key+": fysisk eller allrounder-case mangler");}
}
for(const [id,expected] of Object.entries({"individual_development":["mental_motivation","mental_relative_success","mental_self_efficacy","mental_imagery_practice","mental_attention","mental_self_talk"],"coaching_transfer":["mental_arousal","mental_preparation","mental_effort","mental_reflection"],"collective_training":["mental_team_cohesion","mental_winning"],"exercise_constraints":["mental_pressure_practice","mental_reset_practice"]})){
  const sections=TRAINING_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Faglig tillegg – ")&&d.source.includes("https://"),key+": mental treningsfordypning eller kildeavgrensning mangler");}
}
for(const [id,expected] of Object.entries({"individual_development":["phys_energy","phys_endurance","phys_strength","phys_power","phys_mobility","phys_proprio"],"load_recovery":["phys_acceleration","phys_speed_session","phys_injury_prevention","phys_monitoring","phys_recovery"],"exercise_constraints":["phys_play_snipp","phys_play_soldat","phys_play_number","phys_play_pair"]})){
  const sections=TRAINING_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Faglig tillegg – "),key+": fysiologifordypning eller tydelig kildeavgrensning mangler");}
}
for(const [id,expected] of Object.entries({"individual_development":["mental_development_outline","confidence_finishing","mental_images","goals_effort_outline"],"coaching_transfer":["mental_reset","mental_match_climate","style_psychology"],"collective_training":["team_spirit_outline"]})){
  const sections=TRAINING_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": originalmanusets mentale aspekt mangler");}
}
for(const [id,expected] of Object.entries({"individual_development":["physical_resources","motor_learning","neuromuscular_control","balance_proprioception"],"load_recovery":["speed_training_outline","speed_play_outline"]})){
  const sections=TRAINING_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": originalmanusets fysiologi eller sportsvitenskap mangler");}
}
for(const [id,expected] of Object.entries({"exercise_constraints":["constraints_led","rondo_practice","duel_practice","scanning_practice","restriction_practice"],"coaching_transfer":["play_practice","guided_discovery","contextual_technique"],"individual_development":["early_specialization","learning_environment"],"collective_training":["possession_counter_practice"],"load_recovery":["training_periodization"]})){
  const sections=TRAINING_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": originalmanusets treningsmetodikk mangler");}
}
for(const [id,expected] of Object.entries({"training_problem":["analysis_before_after","analysis_01_possession","analysis_02_support","analysis_03_communication","analysis_04_delay","analysis_05_penetration","analysis_06_concentration","analysis_07_width","analysis_08_movement","analysis_09_balance","opponent_attack","opponent_defence"],"coaching_transfer":["match_periodization","match_balance_choices","match_adjustments"]})){
  const sections=TRAINING_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": originalmanusets kampanalyse eller kampstrategi mangler");}
}
const numberedAnalysis=(TRAINING_CHAPTERS.find(c=>c.id==="training_problem")?.sourceDetails||[]).filter(d=>/^analysis_0[1-9]_/.test(d.id));
check(numberedAnalysis.length===9&&numberedAnalysis.every((d,i)=>d.title.startsWith((i+1)+". ")), "Originalmanusets ni nummererte analyseprinsipper må beholdes i rekkefølge");
for(const [id,expected] of Object.entries({"coaching_transfer":["communication_purpose","communication_timing","feedback_culture"],"collective_training":["defensive_language","offensive_language","communication_relations"]})){
  const sections=TRAINING_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  for(const key of expected){const d=sections.find(x=>x.id===key);check(d?.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),key+": originalmanusets kommunikasjon mangler");}
}
const languageDetails=TRAINING_CHAPTERS.find(c=>c.id==="collective_training")?.sourceDetails||[];
for(const [id,commands] of Object.entries({"defensive_language":["Pump ut","Gå i sikring","Støt opp","Fall av","Aktivt press","Har du han"],"offensive_language":["Mann i rygg","Vri spillet","Start løp","Vend om","Vend opp","Jeg er i støtte"]})){
  const detail=languageDetails.find(d=>d.id===id);
  for(const command of commands)check(detail?.text.includes(command),id+": mangler "+command);
}
check(new Set(TRAINING_CHAPTERS.map(c=>c.id)).size===6,"Duplikate treningskapitler");
for(const c of TRAINING_CHAPTERS){
  check(Boolean(c.title&&c.concept&&c.dilemma&&c.manager&&c.practice),c.id+": ufullstendig kapittel");
  check(c.principles.length>0&&c.principles.every(id=>principles.some(p=>p.id===id)),c.id+": ukjent kunnskapsprinsipp");
  check(c.clubs.length>0&&c.clubs.every(id=>clubChapters.some(p=>p.id===id)),c.id+": ukjent klubbeksempel");
  check(c.engineRefs.length>0,c.id+": manglende motorkobling");
  for(const ref of c.engineRefs)check(readFileSync(join(root,ref.file),"utf8").includes("function "+ref.symbol+"("),c.id+": ukjent mekanikk "+ref.symbol);
  check(c.diagrams.length>0&&c.diagrams.every(d=>d.title&&d.note),c.id+": mangler illustrasjon");
  for(const d of c.diagrams)if(d.kind==="pitch"){
    check(d.players.every(([x,y,label,side])=>[x,y].every(n=>Number.isFinite(n)&&n>=0&&n<=100)&&label&&["a","d"].includes(side)),c.id+": ugyldig spillerposisjon");
    check(d.arrows.every(a=>a.length===4&&a.every(n=>Number.isFinite(n)&&n>=0&&n<=100)),c.id+": ugyldig pil");
  }
}
check(TRAINING_CHAPTERS.reduce((n,c)=>n+c.diagrams.length,0)===9,"Treningsfigurer mangler");
check(bookHtml.includes('id="footballBookTraining"'),"Treningsmetodikk ikke tilgjengelig i spillet");
const roleGraph=TRAINING_CHAPTERS.find(c=>c.id==="individual_development").diagrams.find(d=>d.kind==="bars");
for(const [i,status] of ["perfekt","god","brukbar"].entries()){
  let store={};for(let match=0;match<5;match++)store=recordMatchRoleUsage(store,[{playerId:"book-example",roleId:"balancing_six",status}]);
  const value=getRoleFamiliarity(store,"book-example","balancing_six");
  check(roleGraph.rows[i][1]===value&&roleGraph.rows[i][2]===100-value,"Fortrolighetsgraf avviker fra eksisterende motor");
}
console.log("Fotballboka UX QA Audit");
console.log(`Principles: ${principles.length}`);
console.log(`Scenarios: ${scenarios.map((scenario) => scenario.code).join(", ")}, no_matching_weak_point`);

if (errors.length) {
  console.error("Errors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OK");

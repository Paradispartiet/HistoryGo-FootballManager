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
for(const [id,expected] of Object.entries({"keepers":["keeper_positioning","keeper_saves","keeper_distribution"],"centre_backs":["centre_back_defence","centre_back_attack"],"fullbacks":["fullback_defence","fullback_attack","wingback_corridor"],"six_regista":["central_midfield_defence","central_midfield_attack"],"eight_press":["eight_defence","eight_attack"],"ten_creator":["supporting_forward"],"wingers":["winger_defence","winger_attack"],"link_strikers":["meeting_forward"],"finishing_press":["striker_defence","striker_attack"]})){
  const sections=ROLE_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
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
  const ds=THEORY_CHAPTERS.find(c=>c.id===id)?.sourceDetails||[];
  check(ds.map(d=>d.id).join(",")===expected.join(","),id+": relasjonelle angrepsferdigheter mangler");
  for(const d of ds)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": mangler fagtekst eller kilde");
}
for(const d of attackDetails)check(d.title&&d.text.length>100&&d.source.startsWith("Fotballdokumentet v1.pdf"),d.id+": mangler fagtekst eller kilde");
check(new Set(PHASE_CHAPTERS.map(c=>c.id)).size===4,"Duplikate kampfaser");
for(const [id,expected] of Object.entries({"out_of_possession":["press_height","lock_press","press_triggers","pump_and_drop","marking_models"],"transition_attack":["counter_signal","counter_3v3","counter_4v2","counter_width_clearance","first_after_win"],"transition_defend":["recalibrate"],"formations":["proactive_reactive","formation_choices"],"rest_defence":["risk_balance"]})){
  const sections=[...PHASE_CHAPTERS,...THEORY_CHAPTERS].find(c=>c.id===id)?.sourceDetails||[];
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

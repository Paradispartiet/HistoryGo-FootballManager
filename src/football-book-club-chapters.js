// Fotballboka: editorial club chapters on the existing knowledge surface.
// Historical descriptions and sources are read from the canonical club
// profiles. Illustrations are didactic diagrams, never reconstructed tracking.
export const CLUB_DIAGRAMS = {
  viking: [
    {title:"Overlapping og innlegg", note:"Kantspilleren binder backen; en offensiv back kommer rundt. Stopperne må holde dybde, mens kantstøtten følger løpet.", kind:"pitch",
      players:[[25,22,"Kant","a"],[13,10,"Back","a"],[42,22,"Back","d"],[70,42,"Stopper","d"],[55,60,"Spiss","a"]], arrows:[[13,10,62,10],[25,22,42,22],[62,10,75,54]]},
    {title:"Kortpasninger og tredjemann",note:"Første mottaker legger av; en annen spiller angriper rommet bak pressleddet. Ett forsvarsledd kan ikke dekke begge oppgaver alene.",kind:"pitch",
      players:[[15,55,"Ballfører","a"],[40,37,"Støtte","a"],[48,48,"Press","d"],[34,70,"Tredjemann","a"],[74,47,"Sikring","d"]],arrows:[[15,55,40,37],[40,37,34,70],[34,70,82,65]]},
    {title:"Endret angrepsprioritering",note:"Etter to avvergede angrep av samme type kan motstanderen prioritere den andre utveien. Dette er motorens valgvekter, ikke historisk statistikk.",kind:"bars", rows:[["Normal",60,40],["Overlapping stoppet",30,70],["Kortpasninger stoppet",85,15]],legend:["Overlapping","Kortpasning"]}
  ],
  stabak: [
    {title:"Tre samtidige romtrusler",note:"Alanzinho utfordrer ute, Gunnarsson møter mellom leddene, Nannskog truer bakrommet og Andersson kommer fra midtbanen.",kind:"pitch",players:[[29,15,"Alanzinho","a"],[47,45,"Gunnarsson","a"],[62,62,"Nannskog","a"],[25,79,"Andersson","a"],[64,21,"Back","d"],[64,42,"Stopper","d"],[64,80,"Stopper","d"]],arrows:[[29,15,54,24],[47,45,81,62],[62,62,86,62],[25,79,78,83]]},
    {title:"Driblingen åpner rom for andre",note:"En dribling kan trekke sentral sikring mot kanten. Da kan et sent midtbaneløp utnytte rommet; et balanserende anker reduserer risikoen.",kind:"pitch",players:[[23,18,"Dribler","a"],[40,22,"Back","d"],[60,48,"Sikring","d"],[23,76,"Midtbane","a"],[77,45,"Stopper","d"],[77,77,"Stopper","d"]],arrows:[[23,18,54,13],[60,48,48,25],[23,76,61,63]]},
    {title:"Spissparets motsatte bevegelser",note:"Gunnarsson møter og forsøker gjennomspillet; Nannskog starter i bakrom. Press på pasningsspilleren og dybdesikring er separate oppgaver.",kind:"pitch",players:[[47,37,"Gunnarsson","a"],[60,65,"Nannskog","a"],[29,51,"Press","d"],[68,24,"Back","d"],[68,47,"Stopper","d"],[68,81,"Stopper","d"]],arrows:[[47,37,30,28],[30,28,86,65],[60,65,86,65]]}
  ],
  tromso: [
    {title:"Gjenvinning: gjennombrudd eller behold ballen",note:"Høgmo 2011: vurder rommet bak ballen før tidlig fremoverpasning. Et godt restforsvar kan få motstanderen til å beholde ballen.",kind:"flow",start:"Gjenvinning",decision:"Vurder restforsvaret",branches:["Åpent rom → raskt gjennombrudd","God sikring → behold ballen"]},
    {title:"Dobbel midtbaneskjerm",note:"Høgmo 2011: to dype midtbanespillere beskytter stopperne. Spill rundt skjermen med bredde eller bruk en separat tredjemann sentralt.",kind:"pitch",players:[[18,20,"Kant","a"],[32,12,"Back","a"],[23,49,"Midtbane","a"],[44,53,"Spiss","a"],[35,76,"Tredjemann","a"],[59,34,"Skjerm","d"],[59,66,"Skjerm","d"],[78,34,"Stopper","d"],[78,66,"Stopper","d"]],arrows:[[32,12,73,12],[23,49,44,53],[44,53,35,76],[35,76,72,83]]},
    {title:"Keeper som ekstra stopper",note:"Helstrup 2023: keeper og tre stoppere i situasjonsavhengig bakre firer, høye vingbacker. Presset må dekke både sentral utvei og bakrom.",kind:"pitch",players:[[12,18,"Stopper","a"],[12,42,"Keeper","a"],[12,64,"Stopper","a"],[12,86,"Stopper","a"],[50,12,"Vingback","a"],[50,88,"Vingback","a"],[51,51,"Midtbane","a"],[34,25,"Press","d"],[34,51,"Press","d"],[34,76,"Press","d"]],arrows:[[12,42,51,51],[51,51,74,62],[12,42,82,29]]},
    {title:"Vingbacker og falsk nier",note:"Helstrup 2023: høye vingbacker binder breddeforsvaret, Erlien møter mellom leddene, og andre løper fra dypere posisjoner. Dekk tre rom med separate spillere.",kind:"pitch",players:[[58,14,"Vingback","a"],[58,86,"Vingback","a"],[50,47,"Erlien","a"],[33,32,"Indreløper","a"],[33,68,"Indreløper","a"],[70,14,"Back","d"],[70,86,"Back","d"],[70,37,"Stopper","d"],[70,63,"Stopper","d"],[42,51,"Skjerm","d"]],arrows:[[50,47,36,47],[33,32,87,35],[33,68,87,65]]}
  ]
};
const NAMES={rosenborg:"Rosenborg",brann:"Brann",valerenga:"Vålerenga",molde:"Molde",viking:"Viking",lillestrom:"Lillestrøm",tromso:"Tromsø",bodo_glimt:"Bodø/Glimt",stromsgodset:"Strømsgodset",stabak:"Stabæk",hodd:"Hødd",asane:"Åsane"};
const ORDER=["rosenborg","brann","bodo_glimt","valerenga","stromsgodset","molde","lillestrom","viking","stabak","tromso","hodd","asane"];
export function buildClubBookChapters(profiles){
  const byId=new Map((Array.isArray(profiles)?profiles:[]).map(p=>[p.clubId,p]));
  return ORDER.map(id=>byId.get(id)).filter(p=>p?.tacticalBehaviourEvidence).map(p=>({
    id:p.clubId,name:NAMES[p.clubId]||p.clubId,title:p.styleName,era:p.era,
    historicalNote:p.historicalNote,interpretation:p.tacticalBehaviourEvidence.interpretation,
    scope:p.tacticalBehaviourEvidence.scope,shapes:[p.inPossessionShape,p.outOfPossessionShape],
    hints:p.managerHints||[],strengths:p.strengths||[],sources:p.tacticalBehaviourEvidence.sources||[],
    diagrams:CLUB_DIAGRAMS[p.clubId]||[]
  }));
}
function el(tag,text,cls){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;}
const NS="http://www.w3.org/2000/svg";
function svg(tag,attrs,text){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!=null)e.textContent=text;return e;}
function pitch(diagram){
  const s=svg("svg",{viewBox:"0 0 400 260",role:"img","aria-label":diagram.title+". "+diagram.note});
  s.append(svg("rect",{x:4,y:4,width:392,height:252,rx:8,fill:"#355e46"}),svg("rect",{x:12,y:12,width:376,height:236,fill:"none",stroke:"#cbdacf"}),svg("path",{d:"M388 64H330V196H388 M388 103H367V157H388 M200 12V248",fill:"none",stroke:"#cbdacf",opacity:0.6}));
  const x=n=>12+n*3.76,y=n=>12+n*2.36;
  for(const [a,b,c,d] of diagram.arrows){
    const x1=x(a),y1=y(b),x2=x(c),y2=y(d),ang=Math.atan2(y2-y1,x2-x1);
    s.append(svg("line",{x1,y1,x2,y2,stroke:"#ffdc79","stroke-width":2.5,"stroke-dasharray":"6 4"}),svg("path",{d:"M"+x2+" "+y2+" L"+(x2-11*Math.cos(ang-0.45))+" "+(y2-11*Math.sin(ang-0.45))+" L"+(x2-11*Math.cos(ang+0.45))+" "+(y2-11*Math.sin(ang+0.45))+" Z",fill:"#ffdc79"}));
  }
  for(const [a,b,label,side] of diagram.players){
    s.append(svg("circle",{cx:x(a),cy:y(b),r:9,fill:side==="a"?"#2446a1":"#eeeeee",stroke:side==="a"?"#fff":"#b93a3a","stroke-width":1.8}),
      svg("text",{x:x(a),y:y(b)+20,"font-size":10,"text-anchor":"middle",fill:"#fff",stroke:"#355e46","stroke-width":2,"paint-order":"stroke"},label));
  }
  return s;
}
function figure(d){
  const f=el("figure",null,"club-book-figure");f.append(el("h5",d.title));
  if(d.kind==="pitch"){f.append(pitch(d),el("p","Blå: angripere · lyse: forsvarere · stiplet: mulig pasning eller løp","muted-text"));}
  else if(d.kind==="bars"){
    for(const [name,a,b] of d.rows){const bar=el("div",null,"club-book-bar");bar.setAttribute("role","img");bar.setAttribute("aria-label",name+": "+a+" prosent overlapping, "+b+" prosent kortpasning");for(const [value,cls] of [[a,"club-book-bar-a"],[b,"club-book-bar-b"]]){const seg=el("span",value+" %",cls);seg.style.width=value+"%";bar.append(seg);}f.append(el("p",name),bar);}
    f.append(el("p",d.legend.join(" / "),"muted-text"));
  }else{const flow=el("div",null,"club-book-flow");flow.append(el("strong",d.start),el("span","↓"),el("strong",d.decision));const branches=el("div",null,"club-book-branches");for(const b of d.branches)branches.append(el("span",b));flow.append(branches);f.append(flow);}
  f.append(el("figcaption",d.note));return f;
}
function chapterCard(c){
  const section=el("details",null,"club-book-chapter");
  section.append(el("summary",c.name+" – "+c.title),el("p",c.era,"muted-text"),el("p",c.historicalNote),
    el("h5","Spillemåte"),el("p",c.shapes[0]),el("p",c.shapes[1]),el("h5","Taktisk forklaring"),el("p",c.interpretation));
  for(const d of c.diagrams)section.append(figure(d));
  section.append(el("h5","Managerens motspill"));const ul=el("ul");for(const hint of c.hints)ul.append(el("li",hint));section.append(ul,el("p",c.scope,"muted-text"),el("h5","Registrerte kilder"));
  const sources=el("ul");for(const source of c.sources){const li=el("li");let href;try{const u=new URL(source.url);if(["http:","https:"].includes(u.protocol))href=u.href;}catch{}if(href){const link=el("a",source.title||source.publisher||href);link.href=href;link.target="_blank";link.rel="noopener noreferrer";li.append(link);}else li.append(el("span",source.title||source.publisher||"Kilde"));if(source.locator)li.append(el("p",source.locator));sources.append(li);}section.append(sources);return section;
}
async function init(){
  const root=document.getElementById("footballBookClubChapters");if(!root)return;
  const list=root.querySelector(".club-book-list"),status=root.querySelector(".club-book-status"),search=root.querySelector("input");
  try{
    const response=await fetch(new URL("../data/football_league_club_profiles.json",import.meta.url));if(!response.ok)throw Error("HTTP "+response.status);
    const chapters=buildClubBookChapters((await response.json()).profiles);
    const cards=chapters.map(c=>({c,node:chapterCard(c)}));list.append(...cards.map(x=>x.node));
    const filter=()=>{const q=search.value.trim().toLocaleLowerCase("nb");let count=0;for(const {c,node} of cards){node.hidden=!(c.name+" "+c.title+" "+c.era).toLocaleLowerCase("nb").includes(q);if(!node.hidden)count++;}status.textContent=count+" av "+chapters.length+" klubbkapitler";};
    search.addEventListener("input",filter);filter();
  }catch{status.textContent="Klubbkapitlene kunne ikke lastes. Åpne spillet på nytt for å prøve igjen.";}
}
if(typeof document!=="undefined")init();

// Fotballboka: editorial club chapters on the existing knowledge surface.
// Historical descriptions and sources are read from the canonical club
// profiles. Illustrations are didactic diagrams, never reconstructed tracking.
import { THEORY_CHAPTERS } from "./football-book-theory.js";
import { SCHOOL_CHAPTERS } from "./football-book-schools.js";
import { ROLE_CHAPTERS } from "./football-book-roles.js";
import { PHASE_CHAPTERS } from "./football-book-phases.js";
import { SET_PIECE_CHAPTERS } from "./football-book-set-pieces.js";
import { TRAINING_CHAPTERS } from "./football-book-training.js";
export const CLUB_DIAGRAMS = {
  rosenborg: [
    {
      "title": "4-3-3: tre koordinerte bevegelser",
      "note": "Eggens gjennombruddspill: én møter, en annen truer bakrommet, indreløperen følger opp. Løp uten ball skaper pasningsvinkler, også når første pasning ikke spilles.",
      "kind": "pitch",
      "players": [
        [
          22,
          50,
          "Sekser",
          "a"
        ],
        [
          39,
          22,
          "Kant",
          "a"
        ],
        [
          39,
          72,
          "Indreløper",
          "a"
        ],
        [
          58,
          48,
          "Spiss",
          "a"
        ],
        [
          68,
          24,
          "Back",
          "d"
        ],
        [
          68,
          48,
          "Stopper",
          "d"
        ],
        [
          68,
          74,
          "Stopper",
          "d"
        ]
      ],
      "arrows": [
        [
          58,
          48,
          43,
          48
        ],
        [
          39,
          22,
          86,
          25
        ],
        [
          39,
          72,
          83,
          63
        ],
        [
          22,
          50,
          43,
          48
        ]
      ]
    },
    {
      "title": "Kollektivt press og sentral sikring",
      "note": "Førstepresseren styrer ballen, neste ledd dekker sentrale pasninger, og resten av laget flytter sammen. Ikke la én spiller jage uten støtte.",
      "kind": "pitch",
      "players": [
        [
          29,
          50,
          "Ballfører",
          "a"
        ],
        [
          53,
          30,
          "Støtte",
          "a"
        ],
        [
          53,
          70,
          "Støtte",
          "a"
        ],
        [
          43,
          49,
          "Spiss",
          "d"
        ],
        [
          64,
          35,
          "Indreløper",
          "d"
        ],
        [
          64,
          65,
          "Indreløper",
          "d"
        ],
        [
          83,
          50,
          "Sekser",
          "d"
        ]
      ],
      "arrows": [
        [
          43,
          49,
          34,
          50
        ],
        [
          64,
          35,
          53,
          39
        ],
        [
          64,
          65,
          53,
          61
        ]
      ]
    }
  ],
  brann: [
    {
      "title": "Hornelands smale pressledd",
      "note": "Kantene trekker inn, spissen skjermer ankeret, midtbane og forsvar flytter sammen. Utfordringen for ballførende lag er å finne en utvei uten å tvinge pasningen sentralt.",
      "kind": "pitch",
      "players": [
        [
          15,
          50,
          "Stopper",
          "a"
        ],
        [
          42,
          50,
          "Anker",
          "a"
        ],
        [
          22,
          14,
          "Back",
          "a"
        ],
        [
          22,
          86,
          "Back",
          "a"
        ],
        [
          31,
          50,
          "Spiss",
          "d"
        ],
        [
          40,
          28,
          "Kant",
          "d"
        ],
        [
          40,
          72,
          "Kant",
          "d"
        ],
        [
          65,
          39,
          "Midtbane",
          "d"
        ],
        [
          65,
          61,
          "Midtbane",
          "d"
        ]
      ],
      "arrows": [
        [
          31,
          50,
          22,
          50
        ],
        [
          40,
          28,
          33,
          39
        ],
        [
          40,
          72,
          33,
          61
        ],
        [
          65,
          39,
          52,
          43
        ],
        [
          65,
          61,
          52,
          57
        ]
      ]
    },
    {
      "title": "Ballnært gjenvinningspress",
      "note": "Etter balltap presses nærmeste ballfører mens støttespillerne stenger de nærmeste utveiene. Hvis gjenvinningen mislykkes, må restforsvaret kontrollere neste rom. Ingen fast andreballrute er belagt.",
      "kind": "flow",
      "start": "Balltap",
      "decision": "Nærmeste presser + støtte",
      "branches": [
        "Pasningsrom stengt → gjenvinning",
        "Press passert → restforsvar"
      ]
    }
  ],
  valerenga: [
    {
      "title": "Bengtssons soneforsvar: press og forskyvning",
      "note": "Førstepresseren utfordrer ballfører, neste forsvarer sikrer, og de øvrige flytter mot ballside. En rask spillvending utfordrer avstandene. Ikke en påstand om fast presshøyde.",
      "kind": "pitch",
      "players": [
        [
          22,
          25,
          "Ballfører",
          "a"
        ],
        [
          19,
          78,
          "Motsatt kant",
          "a"
        ],
        [
          39,
          24,
          "1F",
          "d"
        ],
        [
          53,
          39,
          "2F",
          "d"
        ],
        [
          55,
          63,
          "3F",
          "d"
        ],
        [
          77,
          26,
          "Back",
          "d"
        ],
        [
          77,
          52,
          "Stopper",
          "d"
        ],
        [
          77,
          78,
          "Back",
          "d"
        ]
      ],
      "arrows": [
        [
          39,
          24,
          30,
          25
        ],
        [
          53,
          39,
          43,
          32
        ],
        [
          55,
          63,
          44,
          52
        ],
        [
          22,
          25,
          19,
          78
        ]
      ]
    },
    {
      "title": "Lengre pasning og støtteløp",
      "note": "Mottakerens første berøring og støttespillernes bevegelser er forskjellige oppgaver. Hold dybden med stopperne og steng neste pasning. Kildene fastslår ikke et fast utspill mot høyt press.",
      "kind": "pitch",
      "players": [
        [
          13,
          48,
          "Ballfører",
          "a"
        ],
        [
          58,
          39,
          "Mottaker",
          "a"
        ],
        [
          39,
          72,
          "Støtte",
          "a"
        ],
        [
          68,
          35,
          "Stopper",
          "d"
        ],
        [
          68,
          62,
          "Stopper",
          "d"
        ],
        [
          50,
          70,
          "Sikring",
          "d"
        ]
      ],
      "arrows": [
        [
          13,
          48,
          58,
          39
        ],
        [
          39,
          72,
          69,
          80
        ],
        [
          58,
          39,
          69,
          80
        ]
      ]
    }
  ],
  molde: [
    {
      "title": "Dyp støttepasning og spillvending",
      "note": "Cupfinalen 2022 viser hvordan Molde samlet spillet på én side, fant en dyp støtte og vendte til en bred vingback. Figuren viser prinsippet, ikke kampens eksakte flanke eller posisjoner.",
      "kind": "pitch",
      "players": [
        [
          35,
          20,
          "Ballfører",
          "a"
        ],
        [
          21,
          43,
          "Dyp støtte",
          "a"
        ],
        [
          59,
          18,
          "Støtte",
          "a"
        ],
        [
          66,
          86,
          "Vingback",
          "a"
        ],
        [
          45,
          25,
          "Press",
          "d"
        ],
        [
          48,
          45,
          "Press",
          "d"
        ],
        [
          70,
          52,
          "Sikring",
          "d"
        ]
      ],
      "arrows": [
        [
          35,
          20,
          21,
          43
        ],
        [
          21,
          43,
          66,
          86
        ],
        [
          66,
          86,
          85,
          65
        ]
      ]
    }
  ],
  lillestrom: [
    {
      "title": "Førsteball og andreball",
      "note": "Et direkte oppspill kan vinnes i første duell eller gjennom kontroll av nedfallet. Stopperen trenger støtte fra midtbanen; en vunnet luftduell avslutter ikke automatisk situasjonen.",
      "kind": "pitch",
      "players": [
        [
          12,
          45,
          "Oppspill",
          "a"
        ],
        [
          56,
          39,
          "Mottaker",
          "a"
        ],
        [
          60,
          44,
          "Stopper",
          "d"
        ],
        [
          43,
          68,
          "Støtte",
          "a"
        ],
        [
          48,
          74,
          "Sekser",
          "d"
        ],
        [
          76,
          54,
          "Sikring",
          "d"
        ]
      ],
      "arrows": [
        [
          12,
          45,
          56,
          39
        ],
        [
          56,
          39,
          48,
          66
        ],
        [
          43,
          68,
          48,
          66
        ]
      ]
    },
    {
      "title": "Dødball: levering, duell og returrom",
      "note": "Lunds levering mot sterke hodespillere er historisk belagt. Sikre både første duell og returrom. Figuren viser en mulig dødball, ikke en fast innøvd variant.",
      "kind": "pitch",
      "players": [
        [
          95,
          9,
          "Server",
          "a"
        ],
        [
          75,
          40,
          "Hodespiller",
          "a"
        ],
        [
          79,
          64,
          "Hodespiller",
          "a"
        ],
        [
          58,
          56,
          "Retur",
          "a"
        ],
        [
          84,
          38,
          "Stopper",
          "d"
        ],
        [
          85,
          64,
          "Stopper",
          "d"
        ],
        [
          66,
          64,
          "Sikring",
          "d"
        ]
      ],
      "arrows": [
        [
          95,
          9,
          78,
          42
        ],
        [
          79,
          64,
          87,
          55
        ],
        [
          75,
          40,
          58,
          56
        ]
      ]
    },
    {
      "title": "Individuell kreativitet",
      "note": "Tom Lunds dribling og overblikk viser at direkte spill og individuell teknikk kan eksistere i samme klubbtradisjon. Press med én forsvarer og behold sikringen bak.",
      "kind": "pitch",
      "players": [
        [
          25,
          45,
          "Kreatør",
          "a"
        ],
        [
          42,
          45,
          "1F",
          "d"
        ],
        [
          58,
          56,
          "Sikring",
          "d"
        ],
        [
          45,
          78,
          "Medspiller",
          "a"
        ],
        [
          78,
          35,
          "Stopper",
          "d"
        ]
      ],
      "arrows": [
        [
          25,
          45,
          48,
          35
        ],
        [
          48,
          35,
          65,
          76
        ],
        [
          45,
          78,
          78,
          79
        ]
      ]
    }
  ],
  bodo_glimt: [
    {
      "title": "Tredjemann frigjør sekseren",
      "note": "Indreløperen blir mellomledd til sekseren bak første pressledd. Førstepress og dekning av avlegget må være koordinert.",
      "kind": "pitch",
      "players": [
        [
          15,
          38,
          "Stopper",
          "a"
        ],
        [
          42,
          26,
          "Indreløper",
          "a"
        ],
        [
          49,
          55,
          "Sekser",
          "a"
        ],
        [
          32,
          40,
          "Press",
          "d"
        ],
        [
          39,
          63,
          "Press",
          "d"
        ],
        [
          72,
          49,
          "Sikring",
          "d"
        ]
      ],
      "arrows": [
        [
          15,
          38,
          42,
          26
        ],
        [
          42,
          26,
          49,
          55
        ],
        [
          49,
          55,
          77,
          67
        ]
      ]
    },
    {
      "title": "Motsatt back som utvei",
      "note": "Når presset samles på én side, kan ballen vendes til motsatt back. Motoren velger bare en svakere utvei når sikringsforskjellen kan verifiseres; dette er ikke observert rutevalg.",
      "kind": "pitch",
      "players": [
        [
          21,
          20,
          "Back",
          "a"
        ],
        [
          35,
          32,
          "Støtte",
          "a"
        ],
        [
          15,
          52,
          "Stopper",
          "a"
        ],
        [
          35,
          86,
          "Motsatt back",
          "a"
        ],
        [
          43,
          20,
          "Press",
          "d"
        ],
        [
          46,
          40,
          "Press",
          "d"
        ],
        [
          65,
          60,
          "Sikring",
          "d"
        ]
      ],
      "arrows": [
        [
          21,
          20,
          15,
          52
        ],
        [
          15,
          52,
          35,
          86
        ],
        [
          35,
          86,
          80,
          86
        ]
      ]
    }
  ],
  stromsgodset: [
    {
      "title": "Sentral vending, tidlig innlegg og boksløp",
      "note": "Deilas lag kunne vende raskt fra midtbanen til kant og få flere løp inn i boksen. Sikre motsatt kant før vendingen og marker løpene, ikke bare ballen.",
      "kind": "pitch",
      "players": [
        [
          28,
          52,
          "Vendingsledd",
          "a"
        ],
        [
          57,
          12,
          "Kant",
          "a"
        ],
        [
          44,
          34,
          "Løper",
          "a"
        ],
        [
          49,
          56,
          "Spiss",
          "a"
        ],
        [
          45,
          79,
          "Løper",
          "a"
        ],
        [
          75,
          32,
          "Back",
          "d"
        ],
        [
          75,
          53,
          "Stopper",
          "d"
        ],
        [
          75,
          76,
          "Stopper",
          "d"
        ]
      ],
      "arrows": [
        [
          28,
          52,
          57,
          12
        ],
        [
          57,
          12,
          84,
          56
        ],
        [
          44,
          34,
          84,
          36
        ],
        [
          49,
          56,
          87,
          55
        ],
        [
          45,
          79,
          82,
          77
        ]
      ]
    },
    {
      "title": "Brutt innlegg: rom for kontring",
      "note": "Mange boksløp kan svekke retursikringen. Hvis innlegget brytes, avgjør kontroll over første utpasning og rommet bak angrepet om kontringen kan utvikles.",
      "kind": "flow",
      "start": "Innlegg avverget",
      "decision": "Kontroll over returballen?",
      "branches": [
        "Angrepslaget sikrer → ny etablering",
        "Forsvarerne sikrer → mulig kontring"
      ]
    }
  ],
  hodd: [
    {
      "title": "Hødds lave blokk i cupfinalen 2012",
      "note": "Sandal gikk ned til venstre for Aursnes og Nilsen; laget kunne forskyve samlet, mens Nilsen skjermet sentralt. Dette støtter bredde- og sentraldekning, ikke en påstand om sikker boksdekning.",
      "kind": "pitch",
      "players": [
        [
          20,
          22,
          "Kant",
          "a"
        ],
        [
          28,
          50,
          "Ballfører",
          "a"
        ],
        [
          18,
          80,
          "Kant",
          "a"
        ],
        [
          52,
          26,
          "Sandal",
          "d"
        ],
        [
          55,
          48,
          "Nilsen",
          "d"
        ],
        [
          52,
          74,
          "Aursnes",
          "d"
        ],
        [
          74,
          19,
          "Back",
          "d"
        ],
        [
          74,
          41,
          "Stopper",
          "d"
        ],
        [
          74,
          63,
          "Stopper",
          "d"
        ],
        [
          74,
          85,
          "Back",
          "d"
        ]
      ],
      "arrows": [
        [
          52,
          26,
          43,
          23
        ],
        [
          55,
          48,
          49,
          40
        ],
        [
          52,
          74,
          45,
          62
        ]
      ]
    }
  ],
  asane: [
    {
      "title": "Kompakt sentral blokk",
      "note": "Kampreferatet mot Kongsvinger dokumenterer en periode med lavt, kompakt forsvar. Prøv å flytte blokken før sentral pasning; bredde- og boksdekning er ikke bekreftet av denne kilden.",
      "kind": "pitch",
      "players": [
        [
          22,
          45,
          "Ballfører",
          "a"
        ],
        [
          29,
          15,
          "Kant",
          "a"
        ],
        [
          29,
          85,
          "Kant",
          "a"
        ],
        [
          49,
          50,
          "Mottaker",
          "a"
        ],
        [
          58,
          33,
          "Skjerm",
          "d"
        ],
        [
          58,
          50,
          "Skjerm",
          "d"
        ],
        [
          58,
          67,
          "Skjerm",
          "d"
        ],
        [
          77,
          32,
          "Forsvar",
          "d"
        ],
        [
          77,
          50,
          "Forsvar",
          "d"
        ],
        [
          77,
          68,
          "Forsvar",
          "d"
        ]
      ],
      "arrows": [
        [
          22,
          45,
          29,
          15
        ],
        [
          29,
          15,
          49,
          28
        ],
        [
          22,
          45,
          49,
          50
        ]
      ]
    }
  ],
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
    for(const [name,a,b] of d.rows){const bar=el("div",null,"club-book-bar");bar.setAttribute("role","img");bar.setAttribute("aria-label",name+": "+a+" prosent "+d.legend[0]+", "+b+" prosent "+d.legend[1]);for(const [value,cls] of [[a,"club-book-bar-a"],[b,"club-book-bar-b"]]){const seg=el("span",value+" %",cls);seg.style.width=value+"%";bar.append(seg);}f.append(el("p",name),bar);}
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
// Search chapter prose and subheadings; ignore source URL noise in the global search.
const normalizeBookSearch=value=>String(value??"").normalize("NFKD").replace(/\p{M}/gu,"").toLocaleLowerCase("nb").replace(/·/g,"").replace(/ø/g,"o").replace(/æ/g,"ae");
export function searchFootballBookEntries(entries,query){
  const terms=normalizeBookSearch(query).trim().split(/\s+/).filter(Boolean);
  if(!terms.length)return [];
  const hits=[];
  for(const entry of entries){
    const c=entry.c;
    const base=normalizeBookSearch([c.name,c.title,c.era,c.concept,c.dilemma,c.manager,c.practice,c.historicalNote,c.interpretation,...(c.shapes||[]),...(c.hints||[]),...(c.strengths||[]),...(c.roles||[]).map(x=>x.description)].filter(Boolean).join(" "));
    const details=(c.sourceDetails||[]).map(d=>({d,text:normalizeBookSearch(d.title+" "+d.text)}));
    const matching=details.filter(x=>terms.every(t=>(normalizeBookSearch(c.title)+" "+x.text).includes(t))).map(x=>x.d);
    if(matching.length||terms.every(t=>base.includes(t)))hits.push({...entry,matching});
  }
  return hits;
}
const bookEntries=[];
function jumpToBookEntry(entry,detailId){
  const {root,node}=entry;
  root.open=true;
  const input=root.querySelector("input");
  if(input&&input.value){input.value="";input.dispatchEvent(new Event("input"));}
  node.open=true;
  const target=detailId?node.querySelector('[data-book-detail="'+detailId+'"]'):node.querySelector("summary");
  if(!target)return;
  target.scrollIntoView({block:"start"});
  target.focus({preventScroll:true});
}
function initWholeBookSearch(){
  const root=document.getElementById("footballBookSearch");if(!root)return;
  const input=root.querySelector("input"),status=root.querySelector(".book-search-status"),results=root.querySelector(".book-search-results"),nav=root.querySelector(".book-section-nav");
  for(const panel of new Set(bookEntries.map(e=>e.root))){
    const button=el("button",panel.querySelector("summary").textContent.replace(/^Fotballboka – /,""));button.type="button";
    button.addEventListener("click",()=>{panel.open=true;panel.querySelector("summary").scrollIntoView({block:"start"});panel.querySelector("summary").focus({preventScroll:true});});
    nav.append(button);
  }
  const render=()=>{
    results.replaceChildren();
    if(!input.value.trim()){status.textContent=bookEntries.length+" kapitler · søk etter emne, spiller eller trener";return;}
    const hits=searchFootballBookEntries(bookEntries,input.value);
    status.textContent=hits.length+" av "+bookEntries.length+" kapitler";
    for(const entry of hits){
      const li=el("li"),button=el("button",(entry.c.name?entry.c.name+" – ":"")+entry.c.title,"book-search-result");button.type="button";
      button.append(el("small",entry.label+(entry.matching.length?" · "+entry.matching.length+" fagavsnitt":"")));
      button.addEventListener("click",()=>jumpToBookEntry(entry,entry.matching[0]?.id));li.append(button);
      // More specific hits stay accessible without overwhelming broad searches.
      if(entry.matching.length){
        const matches=el("details",null,"book-search-matches");
        matches.append(el("summary",entry.matching.length===1?"Gå til fagavsnitt":"Vis "+entry.matching.length+" fagavsnitt"));
        const list=el("ul");for(const detail of entry.matching){const item=el("li"),b=el("button",detail.title);b.type="button";b.addEventListener("click",()=>jumpToBookEntry(entry,detail.id));item.append(b);list.append(item);}matches.append(list);li.append(matches);
      }
      results.append(li);
    }
    if(!hits.length)status.textContent+=" · Prøv et annet søkeord.";
  };
  input.addEventListener("input",render);render();
}
function theoryCard(chapter,principles,clubs,roles=[]){
  const section=el("details",null,"club-book-chapter");
  section.append(el("summary",chapter.title));if(chapter.era)section.append(el("p",chapter.era,"muted-text"));section.append(el("h5","Prinsippet"),el("p",chapter.concept));
  const details=chapter.sourceDetails||[];
  if(details.length>3){
    const toc=el("details",null,"book-chapter-toc"),links=el("ul");
    toc.append(el("summary","Innhold · "+details.length+" fagavsnitt"));
    for(const detail of details){const li=el("li"),button=el("button",detail.title);button.type="button";button.addEventListener("click",()=>{const heading=section.querySelector('[data-book-detail="'+detail.id+'"]');heading.scrollIntoView({block:"start"});heading.focus({preventScroll:true});});li.append(button);links.append(li);}
    toc.append(links);section.append(toc);
  }
  for(const detail of chapter.sourceDetails||[]){
    const heading=el("h5",detail.title);heading.dataset.bookDetail=detail.id;heading.tabIndex=-1;
    const source=el("details",null,"book-detail-source");
    source.append(el("summary","Kilde"),el("p",detail.source,"muted-text"));
    section.append(heading,el("p",detail.text),source);
  }
  if(chapter.roles?.length){
    section.append(el("h5","Rollene i spillet"));
    const roleList=el("ul");
    for(const entry of chapter.roles){
      const definition=roles.find(r=>r.id===entry.id);
      const li=el("li");li.append(el("strong",definition?.name||entry.id),el("p",entry.description));
      if(definition?.validPositions?.length)li.append(el("p","Spillets posisjoner: "+definition.validPositions.join(", "),"muted-text"));
      roleList.append(li);
    }
    section.append(roleList);
  }
  for(const d of chapter.diagrams)section.append(figure(d));
  section.append(el("h5","Taktisk dilemma"),el("p",chapter.dilemma),el("h5","I spillet"),el("p",chapter.manager),el("h5","Treningsøvelse"),el("p",chapter.practice),el("h5","Klubbeksempler"));
  const examples=el("ul");for(const id of chapter.clubs){const c=clubs.find(c=>c.id===id);if(!c)continue;const button=el("button",c.name+" – "+c.title);button.type="button";button.addEventListener("click",()=>{const root=document.getElementById("footballBookClubChapters"),node=document.getElementById("club-book-"+id);if(!root||!node)return;root.open=true;const input=root.querySelector("input");if(input){input.value="";input.dispatchEvent(new Event("input"));}node.open=true;node.scrollIntoView({block:"start"});node.querySelector("summary")?.focus({preventScroll:true});});const li=el("li");li.append(button);examples.append(li);}
  section.append(examples,el("h5","Grunnlag i Fotballboka"));
  const list=el("ul");for(const id of chapter.principles){const p=principles.find(p=>p.id===id);if(!p)continue;const li=el("li");li.append(el("strong",p.title),el("p",p.handbookText));list.append(li);}section.append(list);if(chapter.sources?.length){section.append(el("h5","Kilder"));const sourceList=el("ul");for(const source of chapter.sources){const li=el("li"),link=el("a",source.title);link.href=source.url;link.target="_blank";link.rel="noopener noreferrer";li.append(link);sourceList.append(li);}section.append(sourceList);}return section;
}
async function initTheory(clubs){
  const root=document.getElementById("footballBookTheory");if(!root)return;
  const list=root.querySelector(".club-book-list"),status=root.querySelector(".club-book-status"),search=root.querySelector("input");
  let principles=[];
  try{const base=new URL("../",import.meta.url);const response=await fetch(new URL("data/football_book_knowledge_principles.json",base));if(!response.ok)throw Error("book index");const index=await response.json();principles=(await Promise.all(index.files.map(async path=>{const r=await fetch(new URL(path,base));if(!r.ok)throw Error(path);return (await r.json()).principles||[];}))).flat();}
  catch{status.textContent="Grunntekstene kunne ikke lastes. Teorikapitlene er fortsatt tilgjengelige.";}
  let roles=[];
  try{const response=await fetch(new URL("../data/football_roles.json",import.meta.url));if(!response.ok)throw Error("roles");roles=(await response.json()).roles||[];}catch{}
  const renderSection=(root,chapters,label)=>{
    if(!root)return;
    const list=root.querySelector(".club-book-list"),status=root.querySelector(".club-book-status"),search=root.querySelector("input");
    const cards=chapters.map(c=>({c,node:theoryCard(c,principles,clubs,roles),root,label}));list.append(...cards.map(x=>x.node));bookEntries.push(...cards);
    const filter=()=>{const q=search.value.trim().toLocaleLowerCase("nb");let count=0;for(const {c,node} of cards){node.hidden=!(c.title+" "+(c.era||"")+" "+c.concept+" "+c.dilemma+" "+(c.sourceDetails||[]).map(detail=>detail.title+" "+detail.text+" "+detail.source).join(" ")+" "+(c.roles||[]).map(entry=>(roles.find(r=>r.id===entry.id)?.name||entry.id)+" "+entry.description).join(" ")).toLocaleLowerCase("nb").includes(q);if(!node.hidden)count++;}status.textContent=count+" av "+cards.length+" "+label+(!principles.length?" · grunntekster utilgjengelige":"");};
    search.addEventListener("input",filter);filter();
  };
  renderSection(root,THEORY_CHAPTERS,"teorikapitler");
  renderSection(document.getElementById("footballBookSchools"),SCHOOL_CHAPTERS,"fotballskoler");
  renderSection(document.getElementById("footballBookRoles"),ROLE_CHAPTERS,"rollekapitler");
  renderSection(document.getElementById("footballBookPhases"),PHASE_CHAPTERS,"kampfaser");
  renderSection(document.getElementById("footballBookSetPieces"),SET_PIECE_CHAPTERS,"dødballkapitler");
  renderSection(document.getElementById("footballBookTraining"),TRAINING_CHAPTERS,"treningskapitler");
}
async function init(){
  const root=document.getElementById("footballBookClubChapters");if(!root)return;
  const list=root.querySelector(".club-book-list"),status=root.querySelector(".club-book-status"),search=root.querySelector("input");
  try{
    const response=await fetch(new URL("../data/football_league_club_profiles.json",import.meta.url));if(!response.ok)throw Error("HTTP "+response.status);
    const chapters=buildClubBookChapters((await response.json()).profiles);
    const cards=chapters.map(c=>({c,node:chapterCard(c),root,label:"klubbkapitler"}));for(const {c,node} of cards)node.id="club-book-"+c.id;list.append(...cards.map(x=>x.node));bookEntries.push(...cards);
    const filter=()=>{const q=search.value.trim().toLocaleLowerCase("nb");let count=0;for(const {c,node} of cards){node.hidden=!(c.name+" "+c.title+" "+c.era).toLocaleLowerCase("nb").includes(q);if(!node.hidden)count++;}status.textContent=count+" av "+chapters.length+" klubbkapitler";};
    search.addEventListener("input",filter);filter();
    await initTheory(chapters);
  }catch{status.textContent="Klubbkapitlene kunne ikke lastes. Åpne spillet på nytt for å prøve igjen.";await initTheory([]);}
  initWholeBookSearch();
}
if(typeof document!=="undefined")init();

# P2 · Bjarg — kildepass uten import

**Utfall: ingen import. Kilden bærer fire A-lagsnavn, ett av dem med posisjon.**
Bjarg blir stående `pending`.

Kilden er lest i sin helhet, ikke stikkprøvet: alle 66 artiklene på
`bjargsinhistorie.no` er hentet ned og gjennomgått, sammen med Wikipedia,
klubbsiden og forbundets klubb- og lagside. Dette dokumentet finnes for at ingen
skal lese de 66 artiklene på nytt for å komme til samme svar.

---

## Hvorfor rangeringen var feil

`docs/P2_KILDELISTE_AVDELING1.md` satte Bjarg **først av åtte** med «best
strukturelle utsikter», og begrunnelsen var at klubben som den eneste har et
helt nettsted viet sin egen historie — «akkurat sjangeren som gir dekning».

Slutningen holdt ikke, og det er verdt å vite hvorfor, siden den samme
slutningen ligger under rangeringen av de sju andre.

`bjargsinhistorie.no` er **66 årsrapporter for hele idrettslaget**, ikke en
fotballhistorikk. Hver artikkel går gjennom turngruppen, håndballgruppen,
friidrettsgruppen og fotballgruppen etter tur. Sjangeren er
organisasjonsberetning: den navngir **formenn, trenere, dommere,
økonomiutvalg, anleggsdrift og kretslagsuttak**, og omtaler lagene kollektivt.
En A-lagssesong beskrives som «sesongen ble meget skuffende for A-laget», ikke
med hvem som spilte.

Målt på hele fotballstoffet, som er 66 000 tegn fra 38 av artiklene:

| | Antall |
|---|---:|
| Personnavn i fotballseksjonene | ~50 |
| … trenere | 9 |
| … formenn, ledere, dommere, utvalg, anleggsdrift | 24 |
| … aldersbestemt eller kretslag for gutter/jenter | 8 |
| … kvinnelag | 2 |
| **… A-lagsspillere** | **4** |
| **… A-lagsspillere med posisjon fra kilden** | **1** |

Et eget historienettsted er altså ikke i seg selv et løfte om spillerdekning.
Det avgjørende er det samme som P1 slo fast for de tjueto arvene: **sjangeren,
ikke lengden.** En organisasjonsberetning beskriver klubben; en portrettartikkel
beskriver en spiller.

Nettstedet har fem portrettartikler. Fire av dem handler om **friidrett og
håndball** — «Kreativ stavhopper» (stavsprang), «Lars`n» (friidrettskretsting),
«Arnulf Holm/Siggen Bernsen» (håndballens historie i Bjarg), «Lars-Ytre Arna».
Den femte, «Bjarging ble verdensmester», er den eneste som beskriver en
fotballspiller — og den er egentlig om terningspillet balut.

---

## De fire

Ingen av dem finnes i katalogen fra før; en import ville gitt fire nye profiler
og null krysskoblinger.

### Frank Berentsen — eneste med posisjon

> «Han var en solid både håndball- og fotballspiller og gjorde det godt som
> **midtstopper** på Bjargs fotballag i mange sesonger. Etter sin aktive
> karriere hadde han også en kortere periode som trener for a-laget, sammen med
> Torgeir Hauge.»
> — *Bjarging ble verdensmester*, 1978

Midtstopper er `CB`. A-lagstilhørigheten er belagt to ganger i samme setning:
han spilte på laget i mange sesonger, og trente a-laget *etter* den aktive
karrieren. Torgeir Hauge er nevnt kun som medtrener og er ikke en spiller.

### Rolf Birger Pedersen — spillende trener, ingen posisjon

> «Bjarg har engasjert tidligere Brannspiller og landslagsspiller Rolf Birger
> Pedersen for kommende sesong.» — *Årsrapport 1972*
>
> «Rolf Birger Pedersen ble spillende strener. […] Pedersen ledet laget på en
> glimrende måte.» — *Årsrapport 1973*

Spillende trener er A-lagsspill. Kilden gir ingen posisjon. Brann-fortiden er
hans karriere et annet sted og hører ikke til Bjarg-arven; katalogen har ingen
profil med dette navnet, så det er ingen krysskobling å gjøre.

### Kjell Jensen — ingen posisjon

> «Kjell Jensen, også fra Brann, kom også til Bjarg. Disse to ble
> nøkkelpersonene i laget.» — *Årsrapport 1973*

Svakest belagt av de fire. Kilden sier at han kom til klubben og ble
nøkkelperson «i laget», i et avsnitt som utelukkende handler om å redde
A-laget fra nedrykk, men den sier ikke ordrett at han spilte. Den ville blitt
importert som A-lagsspiller med dette forbeholdet skrevet ned.

### Stig Arve Vangsnes — ingen posisjon

> «Av enkeltspillere bør nevnes: Stig Arve Vangsnes. Han har spilt på
> guttelaget, juniorlaget **og A-laget i 4. divisjon**.» — *Årsrapport 1980*

Den mest eksplisitte A-lagspåstanden i hele kilden. Gutte- og juniorlaget
nevnes i samme setning og er ikke A-lagsrepresentasjon, men A-laget står der
uttrykkelig.

---

## Hvorfor det ikke ble importert

En klubb trenger **15 profiler med kildebelagt posisjon** for å være overtakbar.
Grensa gjelder de spillbare, ikke de dokumenterte: `sync-club-affiliations.mjs`
utleder `playerPoolStatus` som `playable >= MIN_POOL`, og
`resolveClubSquadAccess` melder klubben `unavailable` når poolen er mindre enn
troppen på femten. Bjarg har fire dokumenterte og **én** spillbar, så klubben
faller på begge målene.

Importen mynter samtidig et permanent `homePlaceId` og oppretter stedet.
`pending` sier det som er sant: arven er ikke gjort.

De fire står derfor her, med sitat og årstall, klare til å bli importert den
dagen en kilde tar poolen over femten.

---

## Banenavnet er bekreftet, ikke endret

Katalogen har **Stavollen kunstgress**. Det ble satt 23.08.2026 mot
tredjepartskilder (no.wikipedia, footballgroundmap, playmakerstats, Fanaposten).
Det er nå bekreftet mot klubbens egen kilde og mot Wikipedias infoboks:

- klubbens historienettsted bruker både «Stavollen Idrettspark» om anlegget og
  «Stavollen Kunstgress» om banen;
- `en.wikipedia.org/wiki/IL_Bjarg` har `ground = Stavollen Kunstgress`,
  kapasitet 1 200;
- forbundets klubbside oppgir besøksadresse «Stavollen, Skeieveien».

Anlegget rommer altså banen, og begge navn er klubbens egne. Katalogverdien står
urørt. **Bjarg arena**, meldt i mars 2026, er fortsatt et framtidig prosjekt og
skal ikke erstatte Stavollen; skifter hjemmebanen, er det et nytt sted.

---

## Kilder, lest 24.08.2026

| Kilde | URL | Ga |
|---|---|---|
| Bjarg sin historie, 66 artikler 1945–2018 | https://www.bjargsinhistorie.no | 4 A-lagsnavn, 1 posisjon |
| Wikipedia (en) | https://en.wikipedia.org/wiki/IL_Bjarg | banenavn, kapasitet, sesongtabell — **ingen spillernavn** |
| Klubbsiden | https://bjarg.net/om-il-bjarg/ · https://bjarg.net/fotball/ | ingen troppsliste tilgjengelig |
| Forbundet, klubb | https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=780 | stiftet 15.07.1947, besøksadresse Stavollen |
| Forbundet, Bjarg Menn Senior A | https://www.fotball.no/fotballdata/lag/hjem/?fiksId=24 | JS-rendret, ingen troppsliste i utlevert HTML |

---

## Hva dette betyr for de sju andre

Rangeringen i `P2_KILDELISTE_AVDELING1.md` er bygget på hvilke *typer* sider som
finnes per klubb, ikke på hva sidene inneholder. Bjarg sto øverst og ga fire
navn. Rangeringen bør derfor leses som en søkerekkefølge og ikke som en
forventning, på samme måte som banenavnmønsteret ble ført som søkeliste og ikke
som vakt.

Det som skiller en kilde som gir dekning fra en som ikke gjør det, er om den
omtaler **enkeltspillere** — en adelskalender som Eidsvold Turns, en
portrettserie som Romerikes Blads «Klubblegende», en historikk med kampantall
som Brattvågs. Kvik Halden står nå som det beste gjenværende sporet i avdeling
1: cupmester 1918 og cupfinaler 1915 og 1922 er meritter som pleier å bli
skrevet om med navn.

# Klubbvalg

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Klubbvalget følger den samme regelen: **klubben avgjør ingen kamp.** Den setter
hvor du starter og hva styret måler deg mot — ikke hvordan spillerne dine gjør
det på banen. Det er fortsatt rollen, posisjonen, taktikken og relasjonene.

## To veier inn

Onboardingens klubbsteg har to faner:

- **Lag din egen** — skriv et navn. Ingen historie, ingen arvet stil, og et
  tålmodig styre som venter øvre halvdel første sesong. Du starter i Eliteserien.
- **Ta over en klubb** — velg blant alle **60** klubbene i pyramiden, søkbart på
  navn, by og divisjon.

Lista er **data** (`data/football_clubs.json` + spillestilprofilene) og bygges av
`listSelectableClubs()`. Ingen klubb står i markupen — `sim:club-selection`
avviser det eksplisitt.

## Hva du arver — og hva du ikke arver

Tar du over en klubb, arver du **tre** ting:

1. **Identitet** — navn, bane, by.
2. **Nivå** — der klubben faktisk står. Tar du over Skeid, begynner du i
   2. divisjon avdeling 2. Det er ikke en straff, det er hvor klubben er.
3. **Tradisjon og forventning** — klubbens spillestil blir din, og styret måler
   deg mot den.

Du arver **ikke troppen**. Spillerne kommer fortsatt fra samlingen din — ellers
ville klubbvalget omgått hele kjernesløyfen (Sted → Person → Ekspertise →
Trening → Badge → Lagklasse). Det står i oppsummeringen **før** du velger, og
vakten krever at det står der.

## Forventningen er der det koster

Styrets krav første sesong kommer fra klubbens **standing i sin egen divisjon** —
ikke fra spillerne dine, og ikke fra et vanskelighetsvalg.

| Klubb | Nivå | Styrets krav | Mål |
|---|---|---|---|
| Bodø/Glimt | Eliteserien | Seriegull | topp 1 |
| Rosenborg | Eliteserien | Topp 3 | topp 3 |
| KFUM Oslo | Eliteserien | Sikker plass | topp 13 |
| Odd | OBOS-ligaen | Opprykk | topp 3 |
| Skeid | 2. divisjon | Opprykk | topp 2 |
| Bjarg | 2. divisjon | Sikker plass | topp 11 |
| *Egen klubb* | Eliteserien | *ingen historie* | topp 8 |

Det er den ekte vanskelighetsdialen: å ta over Bodø/Glimt er hardere enn å lage
sin egen klubb, fordi styret ikke godtar en mellomsesong. Fra **sesong to** måles
du mot deg selv igjen — klubbforventningen er et startpunkt, ikke et tak.

## Vaktene

`sim:club-selection` (262 sjekker):

- alle 60 klubbene kan velges, gruppert etter nivå, sterkeste først
- ingen klubb er hardkodet i `index.html`
- forventningene **sprer seg** (6 ulike krav, 3 pressnivåer) — en forventning som
  er lik for alle er ingen forventning, samme måling som styleTraits-spredningen
- på hvert nivå har den sterkeste klubben hardere krav enn den svakeste
- målet får plass i tabellen for hver eneste klubb
- egen klubb beholder det tålmodige målet; klubbmålet er hardere/mykere der det skal
- **nivået måles, ikke leses**: `resolveStartTier()` ligger i motoren nettopp
  fordi den lå i `app.js` først, der en vakt bare kunne lete etter et
  funksjonsnavn — og en slik vakt består selv om nivået ignoreres. Bitetesten
  gikk gjennom på første forsøk, og det var vakten som var for svak, ikke koden
  som var riktig
- oppsummeringen sier hva du arver, og at troppen ikke følger med

`audit:dead-ends` stadium 28: klubblista har tak-høyde og scroller selv, og
onboardingflata scroller. Målt i et 930px vindu havnet «Start klubben» på y=1255
da lista og oppsummeringen kom til. Kortet scroller, så det er ingen blindvei —
men uten tak-høyden ville 60 klubber dyttet knappen vilkårlig langt ned, og
valget ville blitt en flate du ikke kommer videre fra.

## Ikke gjort

**Klubbens historiske tropp.** Å ta over Rosenborg gir deg klubben, ikke Eggens
lag. Det er en egen og mye større datajobb: ~15 ekte fotballspillere per klubb,
hver med posisjoner, roller og styrker — og svakhetsmotoren utleder svake sider
fra nettopp de feltene, med regelen om at den *aldri* skal finne på påstander om
en ekte spiller.

## Tradisjonen måles nå

Klubbvalget lovet noe spillet ikke holdt. Onboardingen sa «Tradisjon: Godfoten.
Styret venter at du spiller klubbens fotball» — og `inheritedStyleName` ble satt
og **aldri lest av noe**. Et løfte uten dekning, og ingenting feilet.

`src/football-club-tradition.js` måler det. Både klubbens tradisjon og hver av de
46 formasjonene er allerede beskrevet på **de samme ni aksene**
(`parameterProfile`: presshøyde, forsvarslinje, bredde, ballbesittelse, tempo,
omstilling, restforsvar, pressform, risiko). Klubbens akser utledes av
`styleTraits` og `matchupStyles` som allerede fantes — ingenting er funnet på.

Treff på en akse = 2 poeng, nabo = 1, motsatt ende = 0.

### Tersiler, ikke faste grenser

Aksene har vidt forskjellige spenn: `pressIntensity` går 25–82, `intensity` går
52–85. Én fast grense (45/60) ville dyttet `tempo` til **54 av 60 klubber i «høy»**
— målt, ikke antatt. Terskelverdiene er derfor **tersiler regnet ut av korpuset**.
Vakten krever at hver akse bruker alle tre bøttene og at ingen bøtte tar mer enn
70 %.

### Dommen må kunne oppnås

Første utgave målte mot 100 %. Målt mot de 46 formasjonene kunne da **44 av 60
klubber aldri nå toppdommen**, uansett hva manageren valgte — biblioteket har
ingen perfekt kopi av hver klubbs tradisjon, og manageren ble straffet for det.

En dom ingen kan få er ingen dom. Nå måles den mot klubbens **oppnåelige spenn**:
100 % betyr «du valgte det beste systemet denne klubben faktisk kan spilles med».
Vakten krever at hver klubb kan nå både topp- og bunndommen.

| Klubb + system | Dom |
|---|---|
| Godfoten + Possession 4-3-3 | Klubbens fotball (100 %) |
| Godfoten + Catenaccio 5-3-2 | Fremmed for klubben (0 %) |
| Åråsen-kynisme + Classic 4-4-2 | Klubbens fotball (100 %) |

Kontrollert som fotball: ingen ballbesittende klubb får en lav blokk som sitt
beste system, og ingen lavblokk-klubb får et høypressystem.

### Den rører aldri en kamp

Dette er en **styredom**, på linje med sesongdommen — den legger én linje til
styrets begrunnelse og ingenting mer. Den leser ikke `overall`, ikke
`matchScore`, ikke `finalStrength`, og hver forklaring peker på et **systemvalg**:

> «forsvarslinje: klubben spiller «high», Catenaccio 5-3-2 gir «deep». Det er et
> systemvalg, ikke en spillersvakhet.»

Vakten krever at forklaringene aldri skylder på spillerne, og at sesongdommen er
**bit-identisk** for en egenopprettet klubb — den har ingen tradisjon å svikte.

`sim:club-tradition`: 1189 sjekker. Fem vakter bittestet, og bitetest 2
reproduserte nøyaktig feilen første utgave hadde.

## Klubbens spillere ligger på banen

Å ta over Rosenborg deler **ikke** ut Eggens lag. Du kan heller ikke plukke en
bestemt historisk utgave av klubben. Det du får, avhenger av én ting: **har du
vært på Lerkendal?**

| | Du får |
|---|---|
| **Har vært på banen** | Klubbens historiske spillere er dine å velge blant. Du plukker selv hvem du bygger laget rundt. |
| **Har ikke vært der** | En automatisk grunntropp, og klubbens spillere åpner seg når du besøker banen. |

Det er kjernesløyfen brukt **på** klubbovertakelsen i stedet for å omgå den —
samme form som landslagsmodus, der nasjonens grunntropp er bunnen og samlingen
er oppsiden.

Ingen ny gate er funnet opp: spillerne var allerede knyttet til steder gjennom
`sourcePlaceIds`, og `computeAvailability()` gatet dem allerede på besøkte
steder. Det som manglet var koblingen **klubb → bane** (`homePlaceId`) og en
grunntropp så et klubbvalg aldri blir en blindvei.

| Klubb | Bane | Historiske spillere |
|---|---|---:|
| Rosenborg | Lerkendal | 8 |
| Bodø/Glimt | Aspmyra | 6 |
| Molde | Aker stadion | 6 |
| Brann | Brann Stadion | 4 |
| Vålerenga | Intility Arena | 3 |
| Lillestrøm | Åråsen | 3 |
| Stabæk | Nadderud | 3 |

De øvrige 52 klubbene har ingen bane i History Go ennå. Profilen sier det rett
ut i stedet for å late som — du får grunntroppen og samler videre.

### Grunntroppen er et gulv, ikke en snarvei

- Den inneholder **aldri** klubbens egne historiske spillere. Gjorde den det,
  ville gaten vært pynt: du fikk Brattbakk uten å gå til Lerkendal.
- Den deler aldri ut landslagsarena-spillere (Ullevaal, Maracanã) — én visit
  skal ikke sikre en nasjons beste.
- Den plukker de **jevneste**, ikke toppsjiktet. Målt: 86,8 i snitt mot et
  poolsnitt på 88,5; snur man sorteringen havner den på 90,0.

Den siste målingen avslørte en for svak vakt. Første grense var «≤ snitt + 1»,
og en bitetest som snudde sorteringen gikk **rett gjennom**. Terskelen måtte
ligge mellom de to målte verdiene, ikke i nærheten av den ene.

### Motoren rører aldri progresjonen

`football-club-squad.js` **leser** besøkte steder som en liste inn og skriver
aldri til `visited_places` eller `hg_groundhopper_stats_v1`. Vakten sjekker at
navnene ikke engang forekommer i kilden.

`sim:club-squad`: 172 sjekker, seks vakter bittestet. Verifisert i nettleser i
begge tilstander — der oppdaget jeg at `visited_places` er et **objekt**, ikke en
array, så den første testen min leste ingenting og ga samme svar i begge
tilfeller.

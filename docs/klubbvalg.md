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

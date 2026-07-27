# Statistikk

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Sesongtallene lå spredt: ligatabellen bak en popup-knapp på Kontor,
prøveperioden som et kort nede i dashbordet — altså ikke der du ville lett etter
dem. Nå har de en egen fane, sist i menyen: **Statistikk**.

Den inneholder:

- **Sesongsammendrag** — kamper, mål, målgivende, toppscorer, tabellplassering
  og styrets forventning.
- **Spillerstatistikk** — mål, målgivende og kamper per spiller, sorterbar på
  mål, målgivende eller poeng (M+A).
- **Ligatabell og terminliste** — flyttet hit fra popup-en på Kontor.
- **Prøveperiode** — de fem kampene for styret, flyttet hit fra dashbordet.

## Hvem scoret?

Kampmotoren har alltid produsert sjanser og mål, men **målene tilhørte ingen**.
`src/football-player-stats.js` gir dem en scorer og som regel en målgivende.

Kjerneprinsippet gjelder også her: **det er ikke `overall` som avgjør.** Motoren
leser aldri feltet i det hele tatt — `sim:player-stats` sjekker det eksplisitt.
Sannsynligheten bygges av tre ting:

1. **Posisjonen spilleren står i.** En spiss veier 3.6, en midtstopper 0.5, en
   keeper 0.02. Målgivende følger et annet mønster: kantene og tieren legger
   flest fram, spissen færre enn han scorer.
2. **Rollen manageren ga ham.** To identiske sentrale midtbanespillere skiller
   lag på rollen: en `box_to_box` scorer mer enn en `regista`, og registaen
   legger fram flere enn han.
3. **Hvor godt han passer der** (`fit.matchScore`). Passformen løfter eller
   demper mellom 0.6 og 1.4, men snur aldri bildet — en midtstopper blir ikke
   toppscorer av å passe perfekt.

Alle rolle-id-ene er hentet fra `data/football_roles.json`. En vekt for en rolle
som ikke finnes ville vært dekorasjon: den ser ut som en taktisk detalj, men gir
null utslag — samme fellen `audit:tactics` fant blant kampplantaggene.

### Feilbruk gir statistikk, ikke tomrom

En feilbrukt spiss scorer mindre enn en riktig brukt — men han er ikke utradert.
Setter du åtte spisser i en 1-1-8, får du fortsatt en scoringsliste, og
midtstopperen din kan havne på den. Motoren nekter aldri å produsere tall fordi
manageren gjorde noe rart; den lar konsekvensen bli synlig.

## Hvordan tallene blir til

```
buildChances(xG)            → sjanser
  ↳ sjanse blir mål         → attributeGoal(lineupSnapshot)   → scorer + assist
     ↳ minuttloggen          får scorer/assist
     ↳ finalizeMatchdaySession → lastMatch.playerStats
        ↳ registerMatchInPlayerStats → sesongtabellen
```

`lineupSnapshot` bygges fra `teamFit` én gang ved avspark, så kampmotoren slipper
å bære hele `teamFit` inn i lagringen. Elleveren som *spilte* er derfor den som
krediteres, selv om du bytter oppsett etterpå.

Motstanderens mål attribueres ikke — vi kjenner ikke deres tropp, og å dikte opp
navn ville vært å påstå data vi ikke har.

En kamp som avsluttes uten at klokka har gått (eldre lagring, motoren brukt
direkte) attribuerer sluttresultatets mål i `finalizeMatchdaySession` i stedet.
Ellers ville en kamp med mål gitt en tom scoringsliste.

Akkumuleringen er **idempotent på `matchId`**: reload eller dobbeltkall teller
aldri samme kamp to ganger.

## Isolert per modus

`playerSeasonStats` er et sesjonsfelt i mode-konvolutten som alt annet. En
scenario- eller landslagsøkt starter med tom scoringsliste og arver aldri
klubbens. Vaktet av `sim:mode-isolation`.

## Rangering

Sortert kolonne først, så **færrest kamper** — den som leverer like mye på færre
kamper står høyest. Poengsummen bryter til slutt, og navnet holder rekkefølgen
deterministisk.

Kampene måtte bryte før poengsummen: ellers rykket en spiller med mange
målgivende forbi en som hadde scoret like mye på under halvparten av kampene, på
en liste som sier «mål».

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:player-stats` | 42 sjekker: attribusjon, at posisjon/rolle/passform betyr noe, at motoren aldri leser `overall`, at feilbruk fortsatt gir tall, aggregering, idempotens, rangering og sammendrag |
| `npm run audit:dead-ends` (steg 18) | Statistikk er en egen fane med ekte innhold, tabellen er ute av popup-en, motoren er wiret, statistikken er modus-isolert, klubbuka navigerer, og de to boksene er borte fra Kontor |
| `npm run audit:flow` (steg 12) | klubbidentiteten står i toppen, plassering og styremål på Statistikk |

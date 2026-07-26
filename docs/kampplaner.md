# Kampplaner

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Kampplanen er **strategi**, ikke en rangering. Ingen plan er best i seg selv —
den passer eller passer ikke til spillerne dine, motstanderens stil og
kampbildet. Og den kan byttes midt i kampen, med en pris.

## Katalogen

18 planer i seks familier (`data/football_tactics.json`, skjema
`historygo-football-manager.tactics.v2`):

| Familie | Hva den prøver | Planer |
|---|---|---|
| **Kontroll** | Ha ballen, styr tempoet, bryt dem ned tålmodig | Sentralt possession-spill, Tålmodig oppbygging, Posisjonsspill med overtall |
| **Press** | Vinn ballen høyt og angrip før de er organisert | Høyt press, Gjenvinningspress, Midtbanepress |
| **Kontring** | Gi dem ballen, hold formen, straff dem i overgangen | Direkte kontringer, Lav blokk og overganger, Dyp blokk og lang utløsning |
| **Direkte** | Kort vei fram, andreballer, press på siste linje | Direkte spill og andreballer, Spill på målspissen |
| **Bredde** | Strekk dem i bredden, angrip kanalene og boksen | Bredt og hurtig, Innlegg og boksnærvær, Overlapp og kanaler |
| **Kampsituasjon** | Planer for et bilde som har endret seg | Lukk kampen, Jag utligningen, Ro ned tempoet, Alt frem |

Hver plan bærer sin egen forklaring: `intent` (hva den prøver å oppnå),
`strengths`, `risks`, `gameStates` (når den gir mening) og `intensity` (hva den
koster i beina). Ingenting av dette er hardkodet i `app.js`.

`formation` er planens **formasjonsarv**, ikke et krav. Den vises som «Fra
4-3-3-tradisjonen» under valget — en opplysning, ikke en motsigelse av
formasjonen du faktisk spiller.

Kampsituasjonsfamilien er de reaktive planene. De er med i katalogen fra start,
men familiens egen `risk` sier det rett ut: *starter du kampen der, gir du fra
deg initiativet.*

## Bytte underveis

Kampplanen kan byttes mellom hendelsene i en kamp. Byttet er **aldri gratis**:

```
omstillingskostnad = spranget × (1 + friksjon) × senhet
```

- **Spranget** (`planDistance`) er avstanden mellom planene langs fem akser:
  press, tempo, bredde, forsvarslinje og oppbygging. Lukk kampen → Alt frem er
  det største spranget som finnes; Tålmodig oppbygging → Sentralt
  possession-spill er nesten ingenting.
- **Friksjonen** kommer fra treneren. Høy `coachUnderstanding` og
  `formationFamiliarity` gjør omstillingen billigere — den som forstår systemet
  sitt kan endre det.
- **Senhet**: jo færre hendelser igjen, jo mindre tid har laget på å finne seg
  til rette. Et bytte i sluttminuttene koster mest.

Kostnaden trekkes fra taktisk klarhet og legger på risiko. Treffer planen
kampbildet og motstanderens stil, henter du det inn igjen — og mer til.

Byttene bærer **samme effektform som managergrepene**
(`{ eventScoreDelta, xgDeltaFor, xgDeltaAgainst, momentumDelta, riskDelta,
tacticalClarityDelta }`), så `finalizeMatchdaySession` summerer dem i samme
regnestykke. Et bytte er en beslutning, ikke en knapp ved siden av spillet.

## Kampbildet

Kampmodellen har ingen løpende resultattavle — målene rulles fra xG ved
kampslutt. «Kampbildet» leses derfor av **kampens gang**: momentum fra grepene
så langt.

| Momentum | Bilde |
|---|---|
| ≥ +2 | Du styrer bildet |
| −2 … +2 | Jevnt |
| ≤ −2 | Du er under |

Det er ærligere enn å finne på en resultattavle, og det er den lesningen en
manager faktisk gjør: har vi tak i kampen eller ikke?

## Mot motstanderen

Planen vurderes mot motstanderens `styleTraits` — de samme tallene de
historiske arketypene allerede bærer, ingen ny motstanderdata:

- Press mot kort oppbygging → gunstig
- Høy egen linje mot et omstillingslag → risikabel
- Fart mot en høy motstanderlinje → gunstig
- Bredde mot en kompakt blokk → gunstig
- Rolig oppbygging mot et aggressivt press → risikabel

Dette er forklaring, ikke fasit. En plan som er «gunstig mot dem» kan fortsatt
straffe deg hvis troppen ikke passer den — taggene scorer mot spillernes
`likesTactics`/`dislikesTactics` som før.

## Taggene må bety noe

`audit:tactics` krever at hver tag i en kampplan finnes i spillerdataen. En tag
ingen spiller har en mening om er dekorasjon: den ser ut som en taktisk detalj,
men gir null utslag. Auditen fant fire slike (`close_support`, `space_behind`,
`protected_box`, `medium_or_low_line`), og de ble gitt mening ved å legge dem
til hos spillere hvis profil allerede impliserte dem — en kombinasjonsspiller
vil ha støtte nær seg, en løper vil ha rom bak.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:match-plan` | 19 sjekker: familier, avstand, omstillingskostnad, kampbilde, matchup, bytte i sesjon, effekt på resultatet |
| `npm run audit:tactics` | dataskjema, at hver plan forklarer seg, at ingen plan passer alt, at taggene treffer spillerdataen |
| `npm run audit:flow` (steg 16) | motoren er ren, byttet er wiret i kampflyten og summeres i resultatet |

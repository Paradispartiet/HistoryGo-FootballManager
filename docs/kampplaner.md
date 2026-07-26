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

Planen du **velger** måles mot motstanderen fra avspark — den teller i xG
(`planEdge`), ikke bare hvis du tilfeldigvis bytter underveis. Før var
planvalget gratis så lenge du lot det stå.

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

## Motstanderen svarer

Motstanderen sitter ikke stille. Ser de at kampen glipper, **skyver de laget
opp** (høyere linje, mer press); leder de bildet, **trekker de seg ned**
(dypere blokk, kontring som plan). Justeringen skjer én gang per type, den
vises i kampen, og den står i sluttrapporten under «Motstanderens grep».

Da regnes planens matchup om mot det de faktisk gjør nå. Rolig oppbygging som
var trygg mot en passiv motstander er ikke like trygg når de plutselig presser.
**Det er dette som gjør at kampen må leses på nytt** i stedet for å velges
riktig én gang.

Justeringen er deterministisk og forklart — ingen skjult motstanderintelligens.

## Å rette opp en kamp som glipper

Et planbytte belønnes for **forbedringen**, ikke for å «passe». Motoren regner
ut hvor godt den gamle og den nye planen passer situasjonen (`scorePlanNow`:
kampbildet veier tyngst, motstanderens stil kommer i tillegg) og belønner
differansen.

Oppå det kommer en **redningsbonus** som skalerer med hvor dypt i trøbbel du er:
jo mer kampen glipper, jo mer er den riktige lesningen verdt. Et konkret
eksempel, med momentum −4 mot et kontringslag:

| Grep | Forbedring | Netto (momentum + klarhet) |
|---|---|---|
| Jag utligningen (riktig) | +0.90 | **+2.45** |
| Midtbanepress (nøytralt) | 0 | −0.15 |
| Lukk kampen (feil) | 0 | −0.32 |

Og motsatt: bytter du bort en plan som passet bedre, er `improvement` negativ og
grepet straffes — selv om den nye planen «ser riktig ut» isolert sett.

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
| `npm run sim:match-plan` | 28 sjekker: familier, avstand, omstillingskostnad, kampbilde, matchup fra avspark, motstanderens justeringer, redningsbelønning, effekt på resultatet |
| `npm run audit:tactics` | dataskjema, at hver plan forklarer seg, at ingen plan passer alt, at taggene treffer spillerdataen |
| `npm run audit:flow` (steg 16) | motoren er ren, byttet er wiret i kampflyten og summeres i resultatet |

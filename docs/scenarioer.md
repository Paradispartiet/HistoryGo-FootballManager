# Scenarioer

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Scenarioer var en hel spillmodus med **ett** innhold. Overskriften lovet
«valgfrie historiske og taktiske utfordringer» i flertall, og under den lå ett
kort: Ajax 1971–73, hardkodet i `index.html` med en id i `app.js`.

Nå er de seks, og de kommer fra `data/football_scenarios.json` som alt annet
innhold i spillet.

## Katalogen

| Scenario | Epoke | Hva du lærer |
|---|---|---|
| **Totalfotball** | 1971–1974 | Hvordan en høy linje skaper både trussel og sårbarhet |
| **Muren** | 1965–2017 | Bredde, tålmodighet og restforsvar mot en kompakt blokk |
| **Pressets tiår** | 1988–2023 | Oppbygging under press: når kort spill er mot, og når det bare er risiko |
| **Kontringens kunst** | 1965–2016 | Hva som må stå igjen bak ballen mens resten angriper |
| **De uovervinnelige** | 1953–2004 | Balanse: kontroll og trussel samtidig, i stedet for å velge én |
| **Taktikkens historie** | 1953–2012 | Hvorfor taktikk utvikler seg — hvert system svarer på det forrige |

Ingen ny motstanderdata. Scenarioene velger blant de **tolv historiske
arketypene** som allerede finnes i `football-historical-opponent-profiles.js` —
de er taktiske skoler, ikke roboter. Et scenario bestemmer bare hvilke fem du
møter, og noen ganger i hvilken rekkefølge.

`audit:scenarios` krever at **alle tolv arketypene brukes i minst ett scenario**.
En arketyp ingen møter er data uten spill i.

## Kortene forklarer seg

Et scenario uten læringsfokus er bare fem kamper mot tilfeldige lag. Hvert kort
bærer derfor epoke, ingress, utfordring, hva du lærer, og hvem du møter:

```
1971–1974 · 5 KAMPER
Totalfotball
Ajax 1971–73 og arven etter dem

Høy linje, høyt press og spillere som bytter posisjon hele tiden. Rommet bak
dem finnes — spørsmålet er om laget ditt kan nå det før de vinner ballen
tilbake.

▎Fem lag som alle vil ha ballen og presse deg høyt. Du må velge: møte dem i
▎deres eget spill, eller angripe rommet de legger igjen.

Du lærer: Hvordan en høy linje skaper både trussel og sårbarhet, og hva
rotasjon gjør med markeringsansvaret ditt.

Motstandere: Ajax 1971–73 · Nederland 1974 · Barcelona 2008–12 ·
Man City 2022–23 · Brasil 1970
```

Auditen krever at feltene finnes og at ingressen faktisk er en setning, ikke en
etikett.

## Rekkefølgen kan være selve poenget

De fleste scenarioer lar mini-sesongmotoren sortere motstanderne etter styrke,
som før. Men **«Taktikkens historie» er en kronologi**: den dype nieren →
den kreative 4-2-4 → totalfotballen → sonepresset → posisjonsspillet, i den
rekkefølgen de faktisk kom. Hvert system er et svar på problemet det forrige
skapte, og da ville en styrkesortering ødelagt fortellingen.

`opponentOrder` i dataen slår derfor av sorteringen for det scenarioet.

## En bug rekkefølgen avslørte

Med bare ett scenario og hele arketypebiblioteket som pool var det usynlig: den
valgte førstemotstanderen **overstyrte bare runde 1**, mens resten av
terminlista fortsatte fra `waved[1]`. Da forsvant `waved[0]` helt, og
førstemotstanderen dukket opp igjen senere.

Med fem motstandere og fem kamper ble det åpenbart. «Kontringens kunst» spilte
**Leicester to ganger og Inter aldri** — et scenario som lovet fem motstandere
leverte fire.

Førstemotstanderen løftes nå til fronten av rekkefølgen i stedet for å erstatte
en plass i den. `sim:scenarios` krever at alle fem spilles nøyaktig én gang.

## Scenarioene er faktisk forskjellige

Fem scenarioer med samme motstandere er ett scenario med fem navn. To vakter
holder dem fra hverandre:

- `audit:scenarios` — ingen to scenarioer deler alle fem motstanderne
- `sim:scenarios` — ingen to scenarioer gir identisk kampprogram

Fra en faktisk gjennomkjøring i nettleseren:

```
Taktikkens historie   Ungarn 1953 → Brasil 1970 → Ajax 1971 → Milan 1988 → Barcelona 2008
Kontringens kunst     Leicester → Inter → Liverpool → Chelsea → Brasil 1970
Muren                 Inter → Milan 1988 → Leicester → Arsenal → Chelsea
```

## Isolasjon

Scenarioer er en egen modus fra forsiden (se `docs/meny.md`), med sin egen
femkampers mini-sesong. Ligaspillet røres aldri: `sim:mode-isolation` vokter
det, og form/slitasje følger heller ikke med inn — det er en annen tropp og en
annen kalender.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run audit:scenarios` | 70 sjekker: skjema, at hvert scenario forklarer seg, at hver motstander-id finnes som arketyp, fem unike motstandere per scenario, at scenarioene er ulike, at alle arketyper er i bruk, og at katalogen faktisk driver flata |
| `npm run sim:scenarios` | 92 sjekker: normalisering, terminlista formes av scenarioet, alle fem spilles én gang, fast rekkefølge, determinisme, kortene, renhet |
| `npm run audit:dead-ends` (steg 21) | katalogen har flere enn ett, ingen kort er hardkodet i HTML, hvert scenario kan startes, og lista rendres fra render-løypa |

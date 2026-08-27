# P2 · avdeling 2 — sju klubber importert fra registeret

**Sju av åtte gjenstående klubber i 2. divisjon avdeling 2 har fått arv. Bare
Tromsdalen står igjen.**

| Klubb | Dokumentert | Spillbar | Krysskoblinger |
|---|---:|---:|---:|
| Follo | 35 | 35 | 2 |
| Rana | 28 | 28 | 2 |
| Junkeren | 27 | 27 | 0 |
| Trygg/Lade | 25 | 25 | 0 |
| Stjørdals-Blink | 24 | 24 | 0 |
| Lørenskog | 24 | 24 | 1 |
| Eidsvold Turn | 21 | 21 | 1 |
| ~~Tromsdalen~~ | — | — | — |

Ingen av de sju har historikkposter. Poolene er rene troppspooler.

---

## Kilden

Samme som avdeling 1: **NFFs lagside**,
`fotball.no/fotballdata/lag/hjem/?fiksId=N`. Siden er server-rendret, og
spillerne står gruppert under **Keeper · Forsvar · Midtbane · Angrep** —
nøyaktig oppløsningen `positionGroup` bruker. «Keeper» blir en presis `GK`; de
tre andre bæres i `usablePositions` med `positionSource: "gruppe"`. Se
`docs/P2_IMPORT_V1.md`.

Laget er identifisert mot **tabellen for 2. divisjon avdeling 2**
(`turnering/tabell/?fiksId=206008`), ikke mot klubbenes egne laglister. Det er
den kontrollen som i avdeling 1 avslørte at Sandviken hadde B-laget og Eik
breddeklubbens lag.

**Draktnummer er lest og forkastet**, av samme grunn som i avdeling 1: at nummer
1 pleier å være keeper er en konvensjon, ikke en kilde.

---

## Hva `P2_KILDELISTE_AVDELING2.md` forventet

Kildelista pekte på fire redaksjonelle spor: **Eidsvold Turns adelskalender**
(Brattvåg-formen, navn med kampantall), **Stjørdals-Blinks klubbarkiv**,
**Trygg/Lades historikkside** og **Lørenskog** via Romerikes Blads
«Klubblegende»-serie.

**Ingen av dem var nødvendig.** Registeret landet alle sju uten dem.

**Alle fire ble lest 26.08.2026, og ingen av dem ga dybden heller.** De oppgir
ikke posisjon, Romerikes Blads bildetekst er transkribert med feil, og de ti
«legendene» presenteres i video. Ingen av navnene deres er importert. Dybden
kom fra **no.wikipedias klubbkategorier**, som gir posisjon i infoboksen og en
datert karrieretabell — se `docs/P2_WIKIPEDIA_DYBDEPASS.md`. Fem av de sju
klubbene i denne avdelingen fikk til sammen 124 navn til der, og Tromsdalen —
den ene som sto igjen — ble landet med 79.

Det er samme todeling som avdeling 1 endte på: **redaksjonelle kilder gir dybde,
registeret gir bredde.** En pool trenger bredden.

---

## Sammenslåingene er ikke løst, bare ikke utløst

Kildelista advarte om at tre av klubbene er sammenslåinger med flere
forgjengere — Stjørdals-Blink (1956), Trygg/Lade (1986) og Rana (2017) — og at
Follo er en paraply for fem lag fra 2000. «Kilden må si hvilken enhet en spiller
representerte.»

Det spørsmålet er **ikke besvart her, det er ikke stilt**. En dagens tropp
representerer dagens klubb, uten tvetydighet. Advarselen gjelder fortsatt, og
den slår inn i det øyeblikket noen importerer historiske navn fra
forgjengerklubbene.

---

## Identitet

Seks navn i troppene finnes i katalogen fra før, alle med lagdel som stemmer med
katalogens posisjon. De er **krysskoblet**, ikke ført inn som nye profiler:

| Navn | Klubb | Katalogen |
|---|---|---|
| Theo Aksnes Olsen | Rana | `theo_aksnes_olsen` |
| Adrian Olsen Teigen | Rana | `adrian_olsen_teigen` |
| Leon Dahlstrøm | Lørenskog | `leon_dahlstrom` |
| Lucas Kolstad | Eidsvold Turn | `lucas_kolstad` |
| Henrik Hagen | Follo | `henrik_hagen` |
| Otman Khris | Follo | `otman_khris` |

**Henrik Hagen er verdt en merknad.** Han ble *utelatt* fra Kvik Halden-importen,
fordi Kviks tropp førte ham som midtbane mens katalogen har `CB`/`DM`. Follos
NFF-tropp fører ham som **forsvar**, som stemmer. Motsigelsen lå altså i
Kvik-kilden, ikke i katalogen — og utelatelsen der var riktig.

`audit:attributes` flagget tre nær-duplikate navn, og alle tre er ekte
forskjellige menn:

| Nytt navn | Katalogen | Hva som skiller dem |
|---|---|---|
| Nils Gunnar Barstad Eggen (Stjørdals-Blink) | Nils Arne Eggen, Rosenborg/Vålerenga | epoken: Eggen er historisk, den andre står i dagens tropp |
| Nikolai Aas (Rana, forsvar) | Nicolai Aas, `AM`/`RW`/`ST` | lagdelen |
| Johan Rickard Andersson (Eidsvold Turn, forsvar) | Johan Andersson, `AM`/`CM`/`RW` | lagdelen |

---

## Banenavnene er kontrollert, ingen rettet

Fire ble rettet i et tidligere pass (TUIL Arena, Rolvsrud stadion,
Nordlandshallen, Sandskogan stadion). De fire øvrige er nå kontrollert mot
kilde og står:

- **Sagbakken** — `Sagbakken stadion` i Mo i Rana, åpnet 2009, kapasitet ~1 600;
- **Myhrer stadion** — «er Eidsvold Turns hjemmebane», kapasitet ca. 3 000;
- **Ski stadion** — ført slik i Follos egen infoboks;
- **Lade idrettsanlegg** — «også kalt Lade idrettspark», på Lade i Trondheim.
  Wikipedias klubbartikkel nevner *Obosbanen*, som er sponsornavnet på én bane i
  anlegget; den generiske formen er den stabile, samme regel som Lysekloster
  FRAMO.

---

## Tromsdalen, som ikke landet

`Tromsdalen Menn Senior A` er identifisert gjennom ligatabellen og har **9
registrerte spillere**: 3 forsvar, 3 midtbane, 3 angrep, og ingen keeper. Seks
under grensa.

Klubben lander den dagen troppen passerer femten, eller en klubbkilde navngir
spillere med posisjon. Registeret oppdateres hver sesong, så det første er det
mest sannsynlige — og en tropp uten registrert keeper tyder på at
registreringen er ufullstendig, ikke at klubben mangler spillere.

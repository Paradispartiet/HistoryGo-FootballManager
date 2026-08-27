# P2 · Sotra — den siste klubben

**15 dokumenterte, 15 spillbare. Klubben er `ready`, og katalogen står på 60 av 60.**

Sotra sto igjen etter både registerpasset og Wikipedia-dybdepasset, med 12
registrerte spillere mot grensa på femten. Den ble ikke landet av en ny kilde,
men av tre navn fra klubbartikkelen og **NFFs personside**, som avgjorde de to
navnekollisjonene som ellers ville stoppet importen.

---

## Sotra er ikke Nest-Sotra, og ikke Øygarden

Wikipedia har to kategorier som ser ut som klubbens: `Fotballspillere for
Nest-Sotra` (61 artikler) og `Fotballspillere for Øygarden FK` (35). **Ingen av
dem er Sotras**, og å importere dem ville vært den største enkeltfeilen i hele
P2-arbeidet.

| Klubb | Stiftet | |
|---|---|---|
| **Sotra Sportsklubb** | 1945 som Idrettslaget Øygard | ble til i 2009 ved sammenslåing av Foldnes IL, Brattholmen IL og IL Øygard |
| Idrettslaget Nest-Sotra | 1968 | fortsatte som breddeklubb etter 2019 |
| Øygarden FK | overtok Nest-Sotras OBOS-lisens etter 2019 | konkurs i juni 2022 |

Tre juridiske enheter, ikke én slekt. Navnelikheten er en felle, og det er
nøyaktig den sammenslåingsfellen `docs/arbeidsliste.md` har advart mot siden
avdeling 2: **kilden må si hvilken enhet en spiller representerte.** Her sier
den at Nest-Sotras og Øygardens spillere ikke er Sotras.

## Kildene

| Kilde | Ga |
|---|---|
| **NFFs lagside** (`fiksId=508`, laget funnet via ligatabellen 206007) | 12 registrerte: 1 keeper, 5 forsvar, 2 midtbane, 4 angrep |
| **Wikipedia, `Sotra SK` → «Kjente utøvere»** | 4 navn, hvert kontrollert mot spillerens egen artikkel |
| **NFFs personside** (`person/profil/?fiksId=N`) | hele klubbhistorikken for to menn, og dermed avgjørelsen på to navnekollisjoner |

**«Kjente utøvere» er ikke en tropp.** Lista har fire navn, og ett av dem —
**Knut Tørum** — nevner ikke Sotra i sin egen artikkel i det hele tatt; han er
en Bergens-trener med Brann som eneste klubb i infoboksen, og Sotra SK ble
stiftet i 2009 da han var 38. Samme feil som Lørenskog IFs liste gjorde med
Henning Berg. Han er utelatt.

De tre andre har Sotra i seniorkarrieren, og alle tre er datert etter 2009, så
sammenslåingsspørsmålet er ikke stilt:

- **Kristoffer Zachariassen** — Sotra 2012, midtbanespiller, senere Sarpsborg 08,
  Rosenborg og Ferencváros. Krysskobling.
- **Steffen Lie Skålevik** — Sotra 2010–2011 (og ungdomsklubb), angrepsspiller.
  **Ny profil** — han står ikke i katalogen fra før, enda karrieren går via
  Brann, Start, Sarpsborg 08, Sogndal og Åsane.
- **Alexander Dang** — Sotra 2015–2016, angrepsspiller, i katalogen under
  Lysekloster. Krysskobling.

---

## Personsiden avgjorde de to som sto igjen

Importen stoppet på to navn, og begge var **katalogens Åsane-profiler**:

| Kildefila | Katalogen | |
|---|---|---|
| Håvard Arefjord Foldnes | «Håvard Foldnes» (`havard_foldnes`) | mellomnavn-varianten |
| Erlend Hellevik Larsen | `erlend_hellevik_larsen` | eksakt navn |

Begge Åsane-profilene er `source: utledet` og har posisjonene `["CB","DM"]` —
**et sett 19 av Åsanes 76 profiler deler.** Det er en mal, ikke en lest
posisjon, så posisjonen kunne ikke brukes til å skille noen fra noen. Uten
annet belegg ville regelen sagt *utelat*, og Sotra ville blitt stående
`pending` på 13.

**NFFs personside gir hele klubbhistorikken** — hver sesong mannen har vært
registrert, med klubb, også ungdomsår og andrelag. Der Wikipedia gir et utvalg
og en klubbhistorikk gir en periode, gir registeret alt, og en klubb som ikke
står der har mannen ikke spilt for.

- **Erlend Hellevik Larsen** (fiksId 3142691): Nest-Sotra 2018–19, **Åsane
  2021–22**, Sotra 2024–. Samme mann.
- **Håvard Arefjord Foldnes** (fiksId 2760762): Brann 2014–18, Fyllingsdalen
  2019, Sotra 2020–2026 — og **Åsane 2** i 2021.

Foldnes er verdt å stoppe ved, fordi den nesten gikk galt. Første gjennomlesning
av siden fant Brann, Fyllingsdalen og Sotra, og *ikke* Åsane — som ville gjort
dem til to menn, gitt ham et klubbsuffiks, og skrevet en identitetspåstand som
er feil. Det står `Åsane 2` i tabellen. **Andrelaget er samme klubb**, samme
avgjørelse som `Levanger 2` fikk i Wikipedia-passet.

Begge er derfor krysskoblinger, og det er de to som tok Sotra fra 13 til 15.

`parseCareer` og `careerClubs` i `scripts/nff-squad.mjs` gjør siden til et
verktøy, og `audit:nff-squad` låser den mot Foldnes' egen sesongtabell — med
`Åsane 2` som den ene raden testen sier ikke får forsvinne. Parseren slår
**ikke** sammen andrelag og A-lag: det er en avgjørelse den som leser tar, ikke
en verdi et skript kan velge.

---

## Banen

`homePlaceId` er permanent, så valget hører til denne importen.

Klubbartikkelen sier at A-laget «holder til på **Straume Idrettspark**, og
spiller sine kamper på **Sotra stadion**». Anlegget består av to 11-er
kunstgressbaner (Sotra stadion og Straumebanen), en kunstgressbane til,
flerbrukshallen Sotra Arena og en overbygd bane.

**Straume idrettspark er valgt** — anlegget, ikke den enkelte banen. Det er
verdien katalogen alt har, det er navnet en besøkende finner, og det er samme
oppløsning som de andre klubbenes steder. At kampene spilles på Sotra stadion
inne i anlegget er notert her, slik at en senere avgjørelse har opplysningen
uten å måtte lese kilden på nytt.

## Grensen

15 spillbare er **nøyaktig** grensa. Det er den minste ferdige poolen i
katalogen, og den tåler ingen korreksjon nedover: faller ett navn, faller
klubben tilbake til `pending`. Ingen av de 11 nye profilene bærer styrker,
arketyper, rollepreferanser eller taktiske preferanser — en troppsliste belegger
A-lagstilhørighet og lagdel, ingenting mer.

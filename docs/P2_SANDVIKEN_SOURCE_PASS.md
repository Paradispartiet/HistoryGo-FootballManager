# P2 · Sandviken — importert

**31 dokumenterte klubbprofiler, 31 spillbare. Klubben er `ready` og kan overtas.**

| | |
|---|---:|
| Dokumenterte klubbprofiler | 31 |
| Spillbare (posisjon eller lagdel) | 31 |
| Historikkposter | 0 |
| Nye canonical profiler | 29 |
| Krysskoblinger | 2 |

Troppen fra NFF: 32 spillere: 3 keepere, 9 forsvar, 10 midtbane og 10 angrep — én av dem utelatt, se under.

---

## Kilden: NFFs lagside

Norges Fotballforbund publiserer troppen for hvert registrert lag, og den er
**server-rendret** — den ligger i HTML-en og krever ingen nettleser. Spillerne
står gruppert under fire overskrifter: **Keeper, Forsvar, Midtbane, Angrep**.

Det er nøyaktig oppløsningen importens `positionGroup` bruker, og nøyaktig
oppløsningen motorens `SQUAD_GROUPS` er bygget på. «Keeper» er en presis
posisjon (`GK`); de tre andre er lagdeler og bæres i `usablePositions` med
`positionSource: "gruppe"`. Se `docs/P2_IMPORT_V1.md`.

Laget er identifisert mot **ligatabellen** for 2. divisjon avdeling 1, ikke mot
klubbsidens lagliste. Det er ikke en formalitet: klubbenes lagoversikter blander
A-lag, rekruttlag og 7er-lag, og to av de åtte klubbene ville fått feil lag uten
den kontrollen.

**Draktnummer er ikke importert.** At nummer 1 pleier å være keeper er en
konvensjon, ikke en kilde, og lagdelen sier allerede det draktnummeret ville
antydet — bare belagt.

---

## Sjangerfella, og hvorfor NFF-kilden går klar av den

`P2_KILDELISTE_AVDELING1.md` advarte: «Klubbens dokumenterte historie handler i
stor grad om **kvinnefotball** — pionérklubb, norgesmester 1995, seriegull i
Toppserien 2021, og kvinnelaget ble en del av SK Brann fra 2022. En import som
leser «Sandvikens historie» uten å skille lag, vil trekke kvinnelagets spillere
inn i en herrelagspool.»

Advarselen er bekreftet i full bredde. Wikipedia-artikkelen er på 14 600 tegn
den lengste av de åtte klubbartiklene, og den handler nesten utelukkende om
kvinnefotball. Herrelaget får én setning: «De har også et herrelag i fotball som
spiller i 2. divisjon i 2025.» **Null herrespillere er navngitt.**

NFF-kilden løser dette strukturelt, ikke ved skjønn: laget er identifisert som
`Sandviken Menn Senior A` gjennom ligatabellen for 2. divisjon avdeling 1.
Kvinnelaget er en annen enhet med en annen lag-id, og kan ikke havne i poolen.

**Det tok to forsøk.** Første oppslag traff `Sandviken Menn Senior B` — B-laget
— som ga 10 spillere. Ligatabellen ga riktig lag med 32. Det er grunnen til at
lagvalget går gjennom tabellen og ikke gjennom klubbens egen lagliste.

## Ingen historikk importert

Klubbsiden har en jubileumsbok fra 2020 og et digitalt arkiv. Ingen av dem er
lest. De er sjangeren som gir dekning, men klubbens dokumenterte historie er
kvinnefotball, så de må leses med lagskillet i hånd. Sandviken har derfor null
historikkposter — alt i poolen er dagens A-lagstropp.

## Ett navn utelatt på uavklart identitet

`audit:attributes` flagget **Herman Stakset** (NFF: angrep) mot katalogens
`herman_stang_stakset` (`ST`, Levanger). Samme lagdel, ingen individkilde som
skiller dem. Han er **utelatt**; Sandviken når 31 spillbare uten ham.

**Joakim Aasen** og **David Sissoko** er derimot krysskoblet — begge står som
angrep hos NFF og har `ST` i katalogen, fra henholdsvis Åsane- og
Notodden-arven. Ingen motsigelse.

---

## Kilder, lest 24.08.2026

Kildene står i `data/heritage-sources/sandviken.source.json`, med URL og hentedato
per kilde. `audit:club-heritage` fryser tallene over; `audit:import-club-heritage`
måler at importformen ikke driver.

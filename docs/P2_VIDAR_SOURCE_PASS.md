# P2 · Vidar — importert

**26 dokumenterte klubbprofiler, 26 spillbare. Klubben er `ready` og kan overtas.**

| | |
|---|---:|
| Dokumenterte klubbprofiler | 26 |
| Spillbare (posisjon eller lagdel) | 26 |
| Historikkposter | 0 |
| Nye canonical profiler | 24 |
| Krysskoblinger | 2 |

Troppen fra NFF: 25 spillere: 4 keepere, 5 forsvar, 12 midtbane og 4 angrep — én av dem utelatt, se under.

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

## To klubbrekorder, begge navngitt

> «Flest A-kamper for Vidar har keeper **Egil Klinkenberg**, som spilte 510
> kamper i perioden 1966–1991. **Jan Fjetland** er mestscorende med 289 mål.»
> — *no.wikipedia.org/wiki/Fotballklubben Vidar*

Klinkenberg er den best belagte enkeltprofilen i hele avdelingen: navn,
posisjon (keeper → `GK`), kampantall og periode. Han finnes ikke i katalogen fra
før og er en ny profil.

**Jan Fjetland er krysskoblet, og det er den svakeste koblingen i dette
passet.** Katalogen har `jan_fjetland` med `CM` fra Viking-arven. Vidar-kilden
gir ham ingen posisjon, så det er **ingen motsigelse** å felle koblingen på —
og Vidar og Viking er begge Stavanger-klubber, så en spiller som går mellom dem
er nærliggende. Men grunnlaget er navnelikhet og by, ikke en individkilde som
navngir begge klubbene. Den står notert her fordi den bør kontrolleres hvis en
Vidar-kilde med karrieredetaljer dukker opp.

Kampantallet og målantallet er **ikke** importert som noe annet enn kontekst. Et
kampantall belegger A-lagstilhørighet og ingenting mer — samme grense som
Brattvåg-kilden, der 546 kamper heller ikke ble en ferdighet.

## Banen står urørt

Wikipedia skriver «Lassa idrettsanlegg», katalogen har «Lassa idrettspark».
Begge er generiske former av samme sted, og katalogverdien ble satt 23.08.2026
mot klubbens **egen** anleggsside, som veier tyngre enn Wikipedias formulering.
Den forrige rettingen — bort fra «Midjord», som er **en annen klubbs bane** —
står.

## Ett navn utelatt på uavklart identitet

`audit:attributes` flagget **Adrian Bergersen** (NFF: midtbane) mot katalogens
`adrian_amundsen_bergersen` (`RW`/`ST`/`AM`, Egersund). `AM` overlapper
midtbanen, så lagdelen skiller dem ikke, og NFFs personprofil fører bare aktive
roller. Vidar og Egersund ligger begge i Rogaland, som gjør sammenblanding
nærliggende og nettopp derfor farlig.

Han er **utelatt**. Vidar når 26 spillbare uten ham.

---

## Kilder, lest 24.08.2026

Kildene står i `data/heritage-sources/vidar.source.json`, med URL og hentedato
per kilde. `audit:club-heritage` fryser tallene over; `audit:import-club-heritage`
måler at importformen ikke driver.

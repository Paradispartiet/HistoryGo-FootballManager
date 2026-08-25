# P2 · Lysekloster — importert

**16 dokumenterte klubbprofiler, 16 spillbare. Klubben er `ready` og kan overtas.**

| | |
|---|---:|
| Dokumenterte klubbprofiler | 16 |
| Spillbare (posisjon eller lagdel) | 16 |
| Historikkposter | 0 |
| Nye canonical profiler | 15 |
| Krysskoblinger | 1 |

Troppen fra NFF: 18 spillere: 2 keepere, 7 forsvar, 4 midtbane og 5 angrep — to av dem utelatt, se under.

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

## Den tynneste kilden av de åtte, og likevel nok

`P2_KILDELISTE_AVDELING1.md` satte Lysekloster **sist av åtte**: «søket fant
ingen klubbhistorikk i det hele tatt — bare dagens tropp, tabeller og
kampdata». Det stemte. Klubbartikkelen på Wikipedia forteller om opprykkene fra
6. divisjon i 2009 til 2. divisjon i 2015 og navngir ingen spiller.

Wikipedia har i tillegg en troppsmal, `Mal:Lysekloster Idrettslag
spillerstall`, med 18 navn for 2026-sesongen — **men uten posisjoner**, bare
draktnummer. Den er derfor ikke brukt.

At klubben likevel lander, er hele poenget med NFF-kilden: en klubb uten
historikk har fortsatt et registrert A-lag, og lagdelen gjør det spillbart.
Lysekloster har null historikkposter — alt som står i poolen er dagens tropp.

## Banen står urørt

Katalogen har «Lysekloster idrettspark». Wikipedia skriver «Lysekloster FRAMO
Idrettspark», åpnet 2008. **Framo er sponsoren**, og klubbfila slår fast at
sponsornavn skifter oftere enn klubbene — den generiske formen er den stabile.

## To navn utelatt på uavklart identitet

`audit:attributes` flagger navnepar som skiller seg med ett navneledd — regelen
som fant «Rune Jarstein» ved siden av «Rune Almenning Jarstein». To av
Lyseklosters spillere traff den:

| NFF-troppen | Katalogen fra før |
|---|---|
| Tommy Rivaldo Svendsen (forsvar) | Tommy Svendsen, `CB`/`DM`/`CM`, Skeid |
| Jonas Eide Vågen (forsvar) | Jonas Vågen, `CB`/`DM`, Åsane |

**Begge par er samme lagdel**, så det finnes ikke noe skille å begrunne to menn
med — og NFFs personprofiler fører bare aktive roller, ingen historikk, så de
avgjør det ikke. Å slå sammen to dokumenterte klubbkarrierer er den ene feilen
som ikke kan angres; å påstå at de *er* to menn er like ubelagt.

De to er derfor **utelatt**. Da påstår katalogen ingenting, og paret finnes ikke
å registrere. Lysekloster når 16 spillbare uten dem.

**Ola Lerheim Olsen** er derimot krysskoblet: NFF fører ham i angrep, katalogen
har `ola_lerheim_olsen` med `ST` fra Hodd-arven. Samme lagdel, ingen motsigelse.

---

## Kilder, lest 24.08.2026

Kildene står i `data/heritage-sources/lysekloster.source.json`, med URL og hentedato
per kilde. `audit:club-heritage` fryser tallene over; `audit:import-club-heritage`
måler at importformen ikke driver.

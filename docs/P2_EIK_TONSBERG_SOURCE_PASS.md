# P2 · Eik Tønsberg — importert

**25 dokumenterte klubbprofiler, 25 spillbare. Klubben er `ready` og kan overtas.**

| | |
|---|---:|
| Dokumenterte klubbprofiler | 25 |
| Spillbare (posisjon eller lagdel) | 25 |
| Historikkposter | 0 |
| Nye canonical profiler | 21 |
| Krysskoblinger | 4 |

Troppen fra NFF: 21 spillere: 2 keepere, 10 forsvar, 8 midtbane og 1 angrep.

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

## Fire navn fra klubbartikkelen, alle krysskoblinger

Wikipedias klubbartikkel løser fella `P2_KILDELISTE_AVDELING1.md` flagget. Søket
hadde gitt åtte navn i én liste som «players **and coaches**», uten å si hvem
som var hva. Artikkelen skiller dem selv:

> «Nils Johan Semb var trener i perioden 1988–91.
> Kjente spillere som har hatt kortere klubbopphold, er blant annet Erik Solér,
> Ronny Johnsen, Jan Frode Nornes, **keeperen** Erik Thorstvedt og **treneren**
> Morten Sanne Melvold.»

Fire spillere, to uttrykkelig merkede trenere. Alle fire spillerne finnes i
katalogen fra før med sine egne arver — Solér (Lillestrøm), Ronny Johnsen
(Lillestrøm, Lyn, Vålerenga), Nornes (Odd) og Thorstvedt (Viking) — så de er
krysskoblinger, ikke nye profiler. Hver av dem beholder sin egen arv;
`sourcePlaceIds` er urørt.

## Banen: avgjørelsen som sto åpen

`homePlaceId` er permanent, og kildelista lot Eik stå med vilje fordi klubben
har to kandidater. Kilden avgjorde det:

> «Tønsberg gressbane er et fotballstadion i Tønsberg. Det brukes som hjemmebane
> av FK Eik Tønsberg 871 […] og Tønsberg FK, og tidligere også av FK Tønsberg.
> Det blei åpna i 1937, og blei seinere ombygd og gjenåpna 16. mai 2003.
> Stadionet har i dag en tilskuerkapasitet på 5 600, hvorav 3 820 er
> sitteplasser.»
> — *no.wikipedia.org/wiki/Tønsberg gressbane*

Klubbartikkelens infoboks fører samme bane. **Delingen med Tønsberg FK er
bekreftet, ikke bortforklart** — den endrer ikke hvilken bane som *er* Eiks
hjemmebane, og det er det `homePlaceId` peker på. Eik Idrettsanlegg finnes
fortsatt, men er treningsanlegget. Katalogen hadde «Eik stadion», som ikke
finnes som anleggsnavn.

Klubbens identitet er også avklart: FK Eik Tønsberg 871 ble stiftet 1. januar
2020 ved en sammenslåing av *Eik Tønsberg IF* og *FK Tønsberg*. Den «egne FK
Tønsberg» søket returnerte er altså den ene halvdelen av dagens klubb.

---

## Kilder, lest 24.08.2026

Kildene står i `data/heritage-sources/eik_tonsberg.source.json`, med URL og hentedato
per kilde. `audit:club-heritage` fryser tallene over; `audit:import-club-heritage`
måler at importformen ikke driver.

# P2 · Træff — importert

**23 dokumenterte klubbprofiler, 23 spillbare. Klubben er `ready` og kan overtas.**

| | |
|---|---:|
| Dokumenterte klubbprofiler | 23 |
| Spillbare (posisjon eller lagdel) | 23 |
| Historikkposter | 0 |
| Nye canonical profiler | 21 |
| Krysskoblinger | 2 |

Troppen fra NFF: 24 spillere: 2 keepere, 6 forsvar, 9 midtbane og 7 angrep — én av dem utelatt, se under.

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

## Banen var feil i katalogen

Katalogen hadde **«Molde idrettspark»**. Det er naboanlegget.

> «Reknesbanen er en fotballstadion som ligger sentralt i Molde, ved Træffhuset,
> Idrettsparken, Idrettens hus og Museumsområdet. Banen er hjemmebanen til Træff
> og Molde 2. […] Tidligere het banen Træffbanen og var da en grusbane.»
> Kunstgress, kapasitet 1 500 (300 sitteplasser), bygget 2008.
> — *no.wikipedia.org/wiki/Reknesbanen*

Wikipedias klubbartikkel fører samme navn i infoboksen. **Fella kildelista
flagget var reell, men hang på feil bane:** delingen med Moldes andrelag gjelder
Reknesbanen, ikke idrettsparken. Molde har alt arv i katalogen
(`aker_stadion`), og ingen av navnene i Træffs tropp kolliderer med den.

## Én utelatt på motsigelse

**Petter Eichler Jensen** står som keeper i NFFs Træff-tropp, men katalogen har
`petter_eichler_jensen` med `CB`, `CM` og `DM` fra Mjøndalen-arven. Keeper mot
utespiller er den hardeste motsigelsen som finnes i denne katalogen — den samme
koherensregelen P3 innførte. Enten er det to menn, eller så tar én av kildene
feil. `homePlaceId`-tilknytningen er permanent, så koblingen er ikke gjort.

Træff når 23 spillbare uten ham.

## «Spillere med bakgrunn i Træff» er ikke importert

Klubbartikkelen har en liste med ni navn under den overskriften: Christian
Gauseth, Fredrik Solberg, Tina Wulf Eikeland, Tommy Eide Møster, Kai Røberg,
Bernt Hulsker, Simon Markeng, Jahn Ove Wiik og Øyvind Gram.

«Med bakgrunn i» er en **utviklingspåstand**, ikke en A-lagspåstand — samme
grense importregelen trekker mot rekruttlag og ren registrering. Lista blander
dessuten kvinne- og herrefotball. Ingen av de ni er importert.

## Vegard Forren: samme mann, og kilden sier det

`audit:attributes` flagget «Vegard Valgermo Forren» mot katalogens «Vegard
Forren» (Molde, `CB`/`DM`). Wikipedia avgjør det:

> «**Vegard Valgermo Forren** (født 1988) er en norsk fotballspiller som er
> **spillende assistenttrener for Træff**.»

Samme mann. Han er derfor krysskoblet og ikke ført inn som en ny profil — som
ville gitt Moldes landslagsstopper to halve karrierer i katalogen. Klubbens
Wikipedia-infoboks fører ham også som assistenttrener, men *spillende* er det
ordet som gjør ham til en spiller i denne poolen.

---

## Kilder, lest 24.08.2026

Kildene står i `data/heritage-sources/traff.source.json`, med URL og hentedato
per kilde. `audit:club-heritage` fryser tallene over; `audit:import-club-heritage`
måler at importformen ikke driver.

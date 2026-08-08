# Manager Club Operations v1

> **Produktstatus 08.08.2026:** Informasjonsarkitekturen i denne filen kan fortsatt være relevant, men den tidligere antakelsen om at klubbdrift først og fremst skal bestå av fasilitetsnivåer, fiktiv økonomi og spilleravtaler er ikke lenger canonical. Se `PRODUCT_PRINCIPLES_CLUB_SIMULATION.md`. Klubbdrift skal først og fremst la brukeren gå inn i klubbens faktiske arbeidsmiljøer og forstå hva trenerteam, medisinsk apparat, analyse, materialforvaltning og andre funksjoner gjør. Eksisterende runtime er ikke fjernet av denne dokumentasjonsendringen.

## Ny overordnet retning for Klubbdrift

`Klubbdrift` skal være inngangen til en **utforskbar klubb**, ikke en samling abstrakte oppgraderingssystemer.

Eksempler:

- **Treningsanlegg** skal vise hvilke fasiliteter og hvilket utstyr klubben faktisk disponerer, hvordan materialforvalteren arbeider, hvordan en øvelse settes opp, og hvordan klubbens trenertradisjon påvirker treningshverdagen.
- **Medisinsk apparat** skal vise hvordan skader identifiseres, behandles og forebygges, hvem som har ansvar, hvordan rehabilitering planlegges og hvordan retur til trening/kamp vurderes.
- **Analyse** skal lære brukeren hvordan video, observasjon, kampdata og taktiske mønstre brukes.
- **Stab** skal vise funksjonene og arbeidsprosessene til de ulike rollene, ikke bare gi passive bonuser.
- **Økonomi** er ikke obligatorisk kjernemekanikk. Hvis økonomi brukes senere, skal den lære hvordan faktisk klubbøkonomi og administrasjon fungerer, ikke være en vilkårlig valuta som begrenser historiske spillere.

Denne retningen har prioritet over de eldre v1-detaljene nedenfor.

## Formål

Klubb skal ikke være et eget hovedområde ved siden av Kontor. For manageren er styret, innboksen, stab, fasiliteter, marked, speiding og klubbutvikling deler av det samme managerkontoret.

Denne versjonen rydder derfor informasjonsarkitekturen til fire hovedområder:

**Kontor · Lag · Kamp · Stats**

`Klubb` fjernes som egen hovedfane. Klubbdriften ligger under Kontor.

## Kontor

Kontor er stedet for alt managerarbeid som ikke skjer direkte på banen eller i kamp:

- **Innboks** — standardinngangen i ligaspill og stedet for ukas viktigste beskjed/sak.
- **Klubbdrift** — styret og seks operative klubbområder.
- **Speiding** — spillere, stab og ressurser fra History Go.
- **Oppstartshjelp** — før-sesong-sjekklista og den gamle oversikts-/klubbukeinformasjonen. Dette er hjelp, ikke førstesiden.

Den tidligere synlige **Oversikt**-underfanen fjernes i ligaspill. Når manageren trykker Kontor, åpnes Innboks.

### Klubbdrift

Klubbdrift samler seks eksisterende funksjoner:

1. **Styret** — forventning og styretillit.
2. **Speiding** — spillere, stab og ressurser fra History Go.
3. **Klubbutvikling** — ekspertise, utviklingsprogrammer, badges og lagklasse.
4. **Fasiliteter** — treningsanlegg, medisinsk avdeling og analyseavdeling.
5. **Stab & drift** — stall, tilgjengelig/engasjert stab samt klubbøkonomi og spilleravtaler.
6. **Marked** — omdømme, fans og sponsorinteresse som kvalitative signaler.

Utvikling, Fasiliteter, Stab & drift og Marked er dypflater. De trenger ikke konkurrere som likeverdige hovedfaner; de åpnes fra Klubbdrift og beholder Kontor som tydelig hovedområde.

## Stats

Den tidligere hovedfanen **Sesong** heter **Stats**.

Stats samler ligatabell, full terminliste/resultater, plassering/poeng, målforskjell/form, spillerstatistikk, sesongdom og merittliste. Full tabell og terminliste skal være åpne på Stats-flaten, ikke gjemt som en egen navigasjonsdestinasjon.

## Orientering

Et fast `Du er her`-signal viser den aktive arbeidsflaten, for eksempel:

- `Kontor · Innboks`
- `Kontor · Klubbdrift · Fasiliteter`
- `Lag · Trening`
- `Kamp · Analyse`
- `Stats`

«Neste handling» omtales som **Forslag til neste steg** og viser hvilken arbeidsflate handlingen åpner. Sekundære konkurrerende snarveier skjules, slik at footeren ikke blir en teleportmeny.

## Autoritative kilder i den tekniske v1-implementasjonen

Klubbdriften leser eksisterende managerstate og to små, eksplisitte save-lag i samme canonical `hgfm.teamMerits.v1`:

- `clubWeekState.boardTrust`
- `clubWeekState.playerMorale`
- `clubWeekState.tacticalClarity`
- `clubWeekState.trainingCulture`
- `clubWeekState.mediaPressure`
- eksisterende roster-readiness og tilgjengelige spillere
- eksisterende engasjert/tilgjengelig stab
- eksisterende History Go-steder, ekspertise, utviklingsprogrammer, badges og lagklasse
- eksisterende ligasesong, tabell, terminliste og spillerstatistikk
- `facilities` for v1-anleggsnivåer
- `clubEconomy` for v1-HGFM-klubbmidler, lønnsramme og rekrutteringsavtaler

Mode Isolation-snapshotet speiler samme `teamMerits`; det opprettes ingen parallell økonomisave.

## Kontrakter og klubbøkonomi — historisk v1-implementasjon

`Stab & drift → Økonomi & kontrakter` er i dagens runtime en live managerflate.

Den viser:

- klubbmidler;
- brukt og tilgjengelig lønnsramme;
- fast kostnad for grunntroppen;
- aktive rekrutteringsavtaler;
- kontraktslengde og standardisert lønnsbelastning;
- eksplisitt `Forny` når én sesong gjenstår;
- eksplisitt `Frigi` for hentede spillere.

Dette beskriver **implementert v1**, ikke målet for videre produktutvikling. Fiktive kontrakter og økonomiske sperrer på historiske spillere skal vurderes for fjerning eller ombygging.

## Viktige grenser

- `PRODUCT_PRINCIPLES_CLUB_SIMULATION.md` er overordnet ved produktkonflikt.
- Facilities Upgrades v1 og Economy/Contracts v1 skal ikke brukes som presedens for nye systemer.
- History Go forblir autoritativ kilde til spilleroppdagelse/unlocks.
- Virkelige klubbpåstander om fasiliteter, utstyr, medisinsk praksis eller treningsarbeid skal kildebelegges.
- Ingen ny `Neste`-/`Fortsett`-motor skal konkurrere med `Forslag til neste steg`.

## Permanente porter fra v1

- `audit:manager-shell-v3`
- `audit:manager-club-scene-v1`
- `audit:manager-club-operations-v1`
- `sim:manager-club-scene-v1`
- `sim:manager-club-operations-v1`
- Manager Shell browser-vakt for hovedområder, Kontor → Innboks, Oppstartshjelp, Stats, orientering, mobil overflow og WCAG
- Klubbdrift browser-vakt for operative funksjoner og dypflater

Porter som spesifikt låser fasilitetsnivåer eller fiktiv spillerøkonomi må vurderes sammen med runtime-oppryddingen når disse systemene bygges om.

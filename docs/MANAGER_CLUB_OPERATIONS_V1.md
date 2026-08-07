# Manager Club Operations v1

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

## Autoritative kilder

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
- `facilities` for varige anleggsnivåer
- `clubEconomy` for HGFM-klubbmidler, lønnsramme og rekrutteringsavtaler

Mode Isolation-snapshotet speiler samme `teamMerits`; det opprettes ingen parallell økonomisave.

## Kontrakter og klubbøkonomi

`Stab & drift → Økonomi & kontrakter` er fra Kontrakter og klubbøkonomi v1 en live managerflate.

Den viser:

- klubbmidler;
- brukt og tilgjengelig lønnsramme;
- fast kostnad for grunntroppen;
- aktive rekrutteringsavtaler;
- kontraktslengde og standardisert lønnsbelastning;
- eksplisitt `Forny` når én sesong gjenstår;
- eksplisitt `Frigi` for hentede spillere.

En ny rekruttering må ha både signeringsmidler og ledig lønnsramme. Avtaler teller ned ved faktisk sesongskifte; en utløpt rekrutteringsavtale fjerner spilleren fra `recruitedPlayerIds`. Ny sesong tilfører en nivåbasert HGFM-sesongramme.

Alle økonomitall er **spill-/balansetall**, ikke påstander om ekte klubbøkonomi, overgangssummer, lønninger eller kontrakter. Prisene bruker ikke skjult Overall eller oppdiktet markedsverdi.

## Viktige grenser

- Facilities Upgrades v1 lagrer nivå 1–3 for trening, medisinsk og analyse, med ett managerstyrt valg per klubbuke.
- Kontrakter og klubbøkonomi v1 lagrer klubbmidler, lønnsramme og rekrutteringsavtaler i samme `teamMerits`; starttroppen ligger innenfor en fast grunnramme og får ikke individuelle utløpsavtaler i v1.
- Marked viser temperatur og interesse, men oppretter ingen sponsoravtaler.
- Ingen nye localStorage-nøkler eller History Go-unlocks for fasiliteter eller økonomi.
- Ingen agent, budrunde, individuell lønnsforhandling eller historiske økonomipåstander.
- Ingen endringer i kamp-, trening- eller konsekvensmotorene. Recruitment-state forblir eier av kandidat/troppsmedlemskap; økonomien porter handlingen og eier avtalen.

## Permanente porter

- `audit:manager-shell-v3`
- `audit:manager-club-scene-v1`
- `audit:manager-club-operations-v1`
- `sim:manager-club-scene-v1`
- `sim:manager-club-operations-v1`
- Manager Shell browser-vakt for hovedområder, Kontor → Innboks, Oppstartshjelp, Stats, orientering, mobil overflow og WCAG
- Klubbdrift browser-vakt for operative funksjoner og dypflater
- økonomi-/kontraktsregresjon for signering, lønnsramme, fornyelse, utløp og release

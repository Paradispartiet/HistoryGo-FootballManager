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

Klubbdrift samler seks eksisterende funksjoner uten å introdusere nye motorer:

1. **Styret** — forventning og styretillit.
2. **Speiding** — spillere, stab og ressurser fra History Go.
3. **Klubbutvikling** — ekspertise, utviklingsprogrammer, badges og lagklasse.
4. **Fasiliteter** — treningsanlegg, stadion, akademi og medisinsk avdeling.
5. **Stab & drift** — stall, tilgjengelig stab og engasjert stab.
6. **Marked** — omdømme, fans og sponsorinteresse som kvalitative signaler.

Utvikling, Fasiliteter, Stab & drift og Marked er dypflater. De trenger ikke konkurrere som likeverdige hovedfaner; de åpnes fra Klubbdrift og beholder Kontor som tydelig hovedområde.

## Stats

Den tidligere hovedfanen **Sesong** heter **Stats**.

Stats samler:

- ligatabell
- full terminliste og resultater
- plassering og poeng
- målforskjell og form
- kamper, mål og målgivende
- toppscorer
- spillerstatistikk
- sesongdom
- merittliste

Full tabell og terminliste skal være åpne på Stats-flaten, ikke gjemt som en egen navigasjonsdestinasjon.

## Orientering

Et fast `Du er her`-signal viser den aktive arbeidsflaten, for eksempel:

- `Kontor · Innboks`
- `Kontor · Klubbdrift · Fasiliteter`
- `Lag · Trening`
- `Kamp · Analyse`
- `Stats`

«Neste handling» omtales som **Forslag til neste steg** og viser hvilken arbeidsflate handlingen åpner. Sekundære konkurrerende snarveier skjules, slik at footeren ikke blir en teleportmeny.

## Autoritative kilder

Klubbdriftens øvrige områder leser fortsatt eksisterende tilstand. Fasiliteter har fra Facilities Upgrades v1 en liten, eksplisitt save-modell i eksisterende `teamMerits`:

- `clubWeekState.boardTrust`
- `clubWeekState.playerMorale`
- `clubWeekState.tacticalClarity`
- `clubWeekState.trainingCulture`
- `clubWeekState.mediaPressure`
- eksisterende roster-readiness og tilgjengelige spillere
- eksisterende engasjert/tilgjengelig stab
- eksisterende History Go-steder, ekspertise, utviklingsprogrammer, badges og lagklasse
- eksisterende ligasesong, tabell, terminliste og spillerstatistikk

De eksisterende rendererne og motorene fortsetter å eie data og konsekvenser. UI-lagene eier bare hierarki, tekst, orientering og navigasjon.

## Viktige grenser

- Fasilitetsnivåene er ikke lenger avledet fra medietrykk/spillerantall. Facilities Upgrades v1 lagrer nivå 1–3 for trening, medisinsk og analyse i eksisterende `teamMerits`, med ett managerstyrt valg per klubbuke.
- Marked viser temperatur og interesse, men oppretter ingen sponsoravtaler.
- Stab & drift viser eksisterende stab og stall, men oppretter ingen økonomi-, lønns- eller kontraktsmotor.
- Ingen nye localStorage-nøkler eller History Go-unlocks. Fasilitetsstate er et nytt felt i eksisterende `hgfm.teamMerits.v1`.
- Ingen endringer i kamp-, trening-, liga-, availability- eller konsekvensmotorer.

## Permanente porter

- `audit:manager-shell-v3`
- `audit:manager-club-scene-v1`
- `audit:manager-club-operations-v1`
- `sim:manager-club-scene-v1`
- `sim:manager-club-operations-v1`
- Manager Shell browser-vakt for fire hovedområder, Kontor → Innboks, Oppstartshjelp, Stats, orientering, mobil overflow og WCAG
- Klubbdrift browser-vakt for seks operative funksjoner og dypflater

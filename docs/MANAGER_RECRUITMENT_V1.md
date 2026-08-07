# Rekruttering v1

## Formål

Rekruttering v1 gjør `Speiding → Rekrutterbare` operativ uten å eie en parallell overgangsmodell.

Den viktige forskjellen er:

```text
History Go-tilgang = kandidat
Hent til troppen = troppsmedlem
```

Et besøk/opplåsing gir dermed ikke automatisk en spiller plass i klubbtroppen. Kandidaten må hentes eksplisitt fra Speiding før spilleren kan brukes i oppstilling, trening og kamp.

Fra **Kontrakter og klubbøkonomi v1** er selve rekrutteringshandlingen i tillegg portet av klubbens HGFM-spilløkonomi. Recruitment-modulen eier fortsatt bare kandidat → troppsmedlem; økonomi-/kontraktsmodulen eier kostnad, lønnsramme og avtale.

## Starttroppen er fortsatt gulvet

Rekruttering v1 fjerner ikke den eksisterende spillbare starttroppen. Når ingen eksplisitt `localStart.playerIds` er lagret, bruker spillet den eksisterende deterministiske, balanserte 15-spillers auto-troppen fra grunnsjiktet av klubbspillere. Landslagsstjerner og toppsjiktet holdes fortsatt utenfor dette gulvet.

Dermed er troppsmodellen:

```text
starttropp + eksplisitt hentede kvalifiserte kandidater med aktiv avtale = klubbens tropp
```

Starttroppen er ikke en History Go-signering og skal ikke måtte hentes på nytt i Speiding. Den ligger innenfor klubbens faste grunnramme i økonomi v1 og får ikke individuelle utløpskontrakter i denne versjonen.

## State

Rekrutterte spilleres troppsmedlemskap bor i den eksisterende managerstaten:

```text
hgfm.teamMerits.v1
```

Rekrutteringsfeltene er:

```json
{
  "recruitmentVersion": 1,
  "recruitedPlayerIds": []
}
```

Kontrakter og klubbøkonomi bor i samme canonical objekt under `clubEconomy`. Det finnes ingen egen recruitment-/transfer-/economy-localStorage og ingen parallell spillerpool.

Troppen består av:

1. eksisterende starttropp / `localStart.playerIds`;
2. eksplisitt rekrutterte spiller-ID-er som fortsatt har en gyldig kandidattilgang og aktiv HGFM-avtale.

## History Go-porten gjelder fortsatt

`Hent til troppen` kan ikke brukes til å omgå eksisterende availability-regler.

- En ren landslagsarena gir ikke en klubbspiller.
- Når læringsloggen finnes, må quiz-porten være oppfylt på ekte History Go-steder.
- En rekruttert ID uten gyldig kandidattilgang blir ikke gjort spillbar av recruitment-state alene.
- Starttroppen er et separat spillbarhetsgulv og åpner ingen History Go-steder.
- Økonomisk handlingsrom skaper aldri kandidattilgang; det kan bare godkjenne eller blokkere en allerede kvalifisert kandidat.

## Eksisterende saves

Før Rekruttering v1 ble alle kvalifiserte `player_candidate`-spillere automatisk tilgjengelige i troppen. Gamle saves migreres derfor én gang:

- kvalifiserte kandidater som allerede var spillbare kopieres til `recruitedPlayerIds`;
- `recruitmentVersion` settes til `1`;
- senere kandidater må hentes eksplisitt.

Når Kontrakter og klubbøkonomi v1 møter en allerede rekruttert spiller uten avtale, opprettes en overgangsavtale for eldre save uten retrospektiv signeringskostnad eller lønnsbelastning. Ved senere fornyelse går spilleren over på den ordinære HGFM-standardavtalen.

## UI

`Speiding → Rekrutterbare` viser:

- spiller;
- posisjon;
- roller;
- tilgangskilde;
- status `Kandidat` eller `Tropp`;
- handlingen `Hent til troppen` når spilleren ikke allerede er i troppen.

Starttroppsspillere markeres som allerede i troppen og får ikke en falsk rekrutteringshandling.

Når klubbkasse eller lønnsramme ikke tillater standardavtalen, blokkeres `Hent til troppen` før recruitment-state endres og Speiding forklarer hvorfor. Ved godkjent rekruttering opprettes avtalen i samme handling og Speiding, Lag og kjernens availability oppdateres i samme nettleserøkt.

Spillerprofilen er fortsatt den delte profilen fra Lag. Profilklikk rekrutterer aldri spilleren.

## Avgrensning etter økonomi v1

Rekruttering har nå standardiserte HGFM-spillkostnader og kontrakter, men fortsatt:

- ingen historiske/virkelige overgangssummer;
- ingen historiske/virkelige spillerlønninger;
- ingen oppdiktet markedsverdi;
- ingen agent;
- ingen budrunde;
- ingen individuell lønnsforhandling;
- ingen skjult Overall-verdi som prisdriver.

De økonomiske tallene er save-/balansetall for HGFM og må aldri presenteres som fakta om ekte personer eller klubber.

## Navigasjon og progresjon

Rekruttering er en funksjon under **Speiding**. Hovedmenyen forblir:

```text
Kontor · Lag · Speiding · Kamp · Stats
```

Rekrutteringen får ingen `Neste`, `Fortsett` eller egen arbeidsflyt. **`Forslag til neste steg` forblir den ene autoritative progresjonsveiviseren.**

## Permanente porter

CI låser rekrutteringsgrunnlaget med:

- ren recruitment-state-simulering, inkludert 15-spillers startgulv;
- statisk arkitektur-/produkt-audit;
- Chromium-test av kandidat → hent → tropp i samme økt;
- økonomi-/kontraktsregresjon som låser kostnadsporten uten å endre History Go-tilgangen;
- 390 px mobiltest;
- WCAG 2 A/AA-test.

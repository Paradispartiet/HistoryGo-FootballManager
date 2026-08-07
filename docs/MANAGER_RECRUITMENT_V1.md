# Rekruttering v1

## Formål

Rekruttering v1 gjør `Speiding → Rekrutterbare` operativ uten å innføre en parallell overgangsøkonomi.

Den viktige nye forskjellen er:

```text
History Go-tilgang = kandidat
Hent til troppen = troppsmedlem
```

Et besøk/opplåsing gir dermed ikke lenger automatisk en spiller plass i klubbtroppen. Kandidaten må hentes eksplisitt fra Speiding før spilleren kan brukes i oppstilling, trening og kamp.

## Starttroppen er fortsatt gulvet

Rekruttering v1 fjerner ikke den eksisterende spillbare starttroppen. Når ingen eksplisitt `localStart.playerIds` er lagret, bruker spillet den eksisterende deterministiske, balanserte 15-spillers auto-troppen fra grunnsjiktet av klubbspillere. Landslagsstjerner og toppsjiktet holdes fortsatt utenfor dette gulvet.

Dermed er troppsmodellen:

```text
starttropp + eksplisitt hentede kvalifiserte kandidater = klubbens tropp
```

Starttroppen er ikke en History Go-signering og skal ikke måtte hentes på nytt i Speiding.

## State

Rekrutterte spilleres troppsmedlemskap bor i den eksisterende managerstaten:

```text
hgfm.teamMerits.v1
```

Feltene er:

```json
{
  "recruitmentVersion": 1,
  "recruitedPlayerIds": []
}
```

Det finnes ingen egen recruitment-/transfer-localStorage og ingen parallell spillerpool.

Troppen består av:

1. eksisterende starttropp / `localStart.playerIds`;
2. eksplisitt rekrutterte spiller-ID-er som fortsatt har en gyldig kandidattilgang.

## History Go-porten gjelder fortsatt

`Hent til troppen` kan ikke brukes til å omgå eksisterende availability-regler.

- En ren landslagsarena gir ikke en klubbspiller.
- Når læringsloggen finnes, må quiz-porten være oppfylt på ekte History Go-steder.
- En rekruttert ID uten gyldig kandidattilgang blir ikke gjort spillbar av recruitment-state alene.
- Starttroppen er et separat spillbarhetsgulv og åpner ingen History Go-steder.

## Eksisterende saves

Før v1 ble alle kvalifiserte `player_candidate`-spillere automatisk tilgjengelige i troppen. Gamle saves migreres derfor én gang:

- kvalifiserte kandidater som allerede var spillbare kopieres til `recruitedPlayerIds`;
- `recruitmentVersion` settes til `1`;
- senere kandidater må hentes eksplisitt.

Nye saves seedes med `recruitmentVersion: 1` og tom `recruitedPlayerIds`. De beholder starttroppen, men får ikke automatisk alle History Go-kandidater i troppen.

## UI

`Speiding → Rekrutterbare` viser:

- spiller;
- posisjon;
- roller;
- tilgangskilde;
- status `Kandidat` eller `Tropp`;
- handlingen `Hent til troppen` når spilleren ikke allerede er i troppen.

Starttroppsspillere markeres som allerede i troppen og får ikke en falsk rekrutteringshandling.

Etter rekruttering oppdateres både Speiding, Lag-spillerlisten og kjernens availability i samme nettleserøkt.

Spillerprofilen er fortsatt den delte profilen fra Lag. Profilklikk rekrutterer aldri spilleren.

## Bevisst utenfor v1

V1 har:

- ingen overgangssum;
- ingen lønn;
- ingen kontraktslengde;
- ingen forhandling;
- ingen agent;
- ingen budrunde;
- ingen oppdiktet markedsverdi;
- ingen ny Overall-verdi.

Slike systemer må eventuelt bygges senere når de har egen data- og spillmodell. Rekruttering v1 skal først etablere den korrekte grunnrelasjonen mellom kandidat og tropp.

## Navigasjon og progresjon

Rekruttering er en funksjon under **Speiding**. Hovedmenyen forblir:

```text
Kontor · Lag · Speiding · Kamp · Stats
```

Rekrutteringen får ingen `Neste`, `Fortsett` eller egen arbeidsflyt. **`Forslag til neste steg` forblir den ene autoritative progresjonsveiviseren.**

## Permanente porter

CI låser v1 med:

- ren recruitment-state-simulering, inkludert 15-spillers startgulv;
- statisk arkitektur-/produkt-audit;
- Chromium-test av kandidat → hent → tropp i samme økt;
- 390 px mobiltest;
- WCAG 2 A/AA-test.

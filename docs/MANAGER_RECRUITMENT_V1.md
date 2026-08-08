# Rekruttering v1

## Formål

Rekruttering v1 gjør `Speiding → Rekrutterbare` operativ uten en parallell overgangsmodell.

Den canonical forskjellen er:

```text
History Go-tilgang = kandidat
Hent til troppen = troppsmedlem
```

Et besøk/opplåsing gir dermed ikke automatisk en spiller plass i klubbtroppen. Kandidaten må hentes eksplisitt fra Speiding før spilleren kan brukes i oppstilling, trening og kamp.

**Pass 7 har fjernet den tidligere økonomi-/kontrakt- og overgangsvinduporten.** En kvalifisert History Go-kandidat skal ikke kunne blokkeres av oppdiktet klubbkasse, lønnsramme, kontrakt eller overgangsvindu.

## Starttroppen er fortsatt gulvet

Rekruttering v1 fjerner ikke den eksisterende spillbare starttroppen. Når ingen eksplisitt `localStart.playerIds` er lagret, bruker spillet den eksisterende deterministiske, balanserte 15-spillers auto-troppen fra grunnsjiktet av klubbspillere. Landslagsstjerner og toppsjiktet holdes fortsatt utenfor dette gulvet.

Troppsmodellen er dermed:

```text
starttropp + eksplisitt hentede kvalifiserte History Go-kandidater = klubbens tropp
```

Starttroppen er ikke en History Go-signering og skal ikke måtte hentes på nytt i Speiding.

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

Det finnes ingen egen recruitment-, transfer- eller economy-localStorage og ingen parallell spillerpool. Pass 7 migrerer dessuten gamle `clubEconomy`- og `transferMarket`-felter ut av `teamMerits`.

Troppen består av:

1. eksisterende starttropp / `localStart.playerIds`;
2. eksplisitt rekrutterte spiller-ID-er som fortsatt har gyldig kandidattilgang.

## History Go-porten gjelder fortsatt

`Hent til troppen` kan ikke brukes til å omgå eksisterende availability-regler.

- En ren landslagsarena gir ikke en klubbspiller.
- Når læringsloggen finnes, må quiz-porten være oppfylt på ekte History Go-steder.
- En rekruttert ID uten gyldig kandidattilgang blir ikke gjort spillbar av recruitment-state alene.
- Starttroppen er et separat spillbarhetsgulv og åpner ingen History Go-steder.
- Penger, kontrakter eller overgangsvinduer skaper eller blokkerer ikke kandidattilgang.

## Eksisterende saves

Før Rekruttering v1 ble alle kvalifiserte `player_candidate`-spillere automatisk tilgjengelige i troppen. Gamle saves migreres derfor én gang:

- kvalifiserte kandidater som allerede var spillbare kopieres til `recruitedPlayerIds`;
- `recruitmentVersion` settes til `1`;
- senere kandidater må hentes eksplisitt.

Pass 7 gjør en separat, idempotent opprydding av saves som fortsatt har de senere avviste feltene `facilities`, `clubEconomy` og `transferMarket`. `recruitedPlayerIds` og øvrige canonical meritter beholdes. Se `MANAGER_LEGACY_CLEANUP_V1.md`.

## UI

`Speiding → Rekrutterbare` viser:

- spiller;
- posisjon;
- roller;
- tilgangskilde;
- status `Kandidat` eller `Tropp`;
- handlingen `Hent til troppen` når spilleren ikke allerede er i troppen.

Starttroppsspillere markeres som allerede i troppen og får ikke en falsk rekrutteringshandling.

Når en kvalifisert kandidat hentes, oppdateres Speiding, Lag og kjernens availability i samme nettleserøkt. Det finnes ingen skjult lønns-, kontrakt- eller overgangsvindusgate foran handlingen.

Spillerprofilen er fortsatt den delte profilen fra Lag. Profilklikk rekrutterer aldri spilleren.

## Avgrensning

Rekruttering har fortsatt:

- ingen historiske/virkelige overgangssummer;
- ingen historiske/virkelige spillerlønninger;
- ingen oppdiktet markedsverdi;
- ingen agent;
- ingen budrunde;
- ingen individuell lønnsforhandling;
- ingen skjult Overall-verdi som prisdriver.

History Go avgjør hvem brukeren har oppdaget. HG Football Manager lærer brukeren hvordan spilleren kan brukes i tropp, rolle, taktikk, trening og kamp.

## Navigasjon og progresjon

Rekruttering er en funksjon under **Speiding**. Hovedmenyen forblir:

```text
Kontor · Lag · Speiding · Kamp · Stats
```

Rekrutteringen får ingen `Neste`, `Fortsett` eller egen progresjonsflyt. Kalenderen og de relevante arbeidsflatene viser hva som må gjøres i den aktuelle manageruka.

## Permanente porter

CI låser rekrutteringsgrunnlaget med:

- ren recruitment-state-simulering, inkludert 15-spillers startgulv;
- statisk arkitektur-/produkt-audit;
- Chromium-test av kandidat → hent → tropp i samme økt;
- Pass 7-regresjon som beviser at økonomi-/kontrakt-/overgangsgater ikke kan blokkere `data-recruit-player`;
- 390 px mobiltest;
- WCAG 2 A/AA-test.

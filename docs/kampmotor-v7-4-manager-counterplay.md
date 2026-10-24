# Kampmotor v7.4 – managers taktiske motgrep

## Formål

V7.3 forklarte endringer mellom motstanderens forfatterstyrte angrepsutveier,
men manageren manglet et direkte, spillbart svar. V7.4 legger et konkret
**Motgrep mot utspill** under kampens eksisterende taktiske kontroller.
Ingen ny kampflate, ingen nye spillerprofiler eller nye angrepsruter.

## Spillflyt

1. Spillet må først ha simulert og avdekket en fullført pressfase der en
   **verifisert tilgjengelig** motstanderutvei faktisk ble gjennomført.
   Gjenvunnet press teller ikke.
2. Manageren åpner `Motgrep mot utspill` etter at fasen er sett.
   Bare utveier med kjent relevant spillerrolle, positivt kildebasert
   sikringsbidrag hos minst én alternativ rute og ledig sikringskapasitet
   kan prioriteres.
3. Manageren velger én korridor som laget skal prioritere neste periode.
   Grepet lagres i den eksisterende kampsesjonen og minuttloggen.
4. Kampmotoren vurderer alle tidligere forfatterstyrte utveier på nytt
   mot de aktuelle elleve spillerne og omfordelt sikring.
5. Motstanderen kan velge en annen svakere verifisert rute.
   Replay viser valgt rute, sikringsendringer og den konkrete
   omfordelingen i `managerCounter` under `opponentRouteAdaptation`.

## Modellregler

`causalManagerPressCounterVersion: 1` slås bare på for **nye kamper**.
Eldre lagringer uten flagget viderefører v7.3 helt uendret.

Et managersvar kan flytte **inntil 0,017 sannsynlighetspoeng** fra ett
allerede inntjent, dokumentert rutesikringsbidrag til et annet.
Denne verdien er en kalibreringsparameter i spillmodellen, ikke en
registrering av faktiske spillerbevegelser.

Den valgte korridoren kan aldri få mer enn eksisterende 0,03-tak,
og donor kan aldri gå under null. Summen av de verifiserte
rutesikringsbidragene forblir uendret, og intet ekstra xG opprettes.
Bare det **ene** eksisterende sikringsutfallet avgjør risikoen.
Motstanderens rutevalg bruker fortsatt terskelen 0,008; like
alternativer behandles som uavklart.

Eksplisitt forfattede utveier, tidslinjer og kampforløp beholder
forrang. Manglende, uavklarte eller historisk udokumenterte
rolledata gir ingen gratis beskyttelse. Grepet kan ikke gjentas
mot samme observasjon. En senere dokumentert pressfase åpner
muligheten for nytt grep.

En beregnet omfordeling er ikke dokumentert motstanderspeiding;
replay merker det som en managerbeslutning og modellert motreaksjon.

## Test og kontroll

`npm run sim:v7-4-manager-counter` kontrollerer:
- riktig oppdagelse av gjennomført og sett pressfase
- kildebaserte gyldige managergrep og avvisning av uverifiserte grep
- lik samlet sikring før og etter omfordeling
- faktisk rutebytte under lik motstander og identiske tilfeldige trekk
- resultatendring innenfor én eksisterende containment-port, uten ny xG
- deterministisk lagring, gamle kamper, førstegangsvalidering
- blokkert gjentakelse før en ny pressfase er gjennomført

Status for v7.4 må baseres på fullført GitHub Actions, inkludert
motorregresjoner, TypeScript og nettleserkontroller.

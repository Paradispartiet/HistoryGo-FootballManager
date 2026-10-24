# Kampmotor v7.2 – valg mellom dokumenterte utspill

## Omfang

v7.1 kunne velge den svakeste dokumenterte flanken for et kjent sideskift.
v7.2 lar motstanderen sammenligne **minst to eksplisitt oppgitte, tilgjengelige**
utveier fra vårt press: `third_man`, `switch_play` og `direct`.

Ingen av utveiene utledes fra formasjon, spillernes ratings eller generisk
besittelse. Spillet krever `pressEscape: "supported"`, et forfattet sett
`pressEscapeCandidateRoutes`, policyen
`pressEscapeRoutePolicy: "weakest_verified_cover"`, og v7.2-opt-in
`causalOpponentRouteAdaptationVersion: 1`.

Eksempel for en *simulert og eksplisitt forfattet* motstander:

```js
tacticalBehaviour: {
  pressEscape: "supported",
  pressEscapeRoutePolicy: "weakest_verified_cover",
  pressEscapeCandidateRoutes: ["third_man", "direct"]
}
```

Dette betyr kun at scenarioet **forutsetter** at disse to utveiene finnes;
det er ikke registrert historisk posisjonssporing.

## Valgport

1. Hvert alternativ må være kjent og unikt; listen må ha to eller tre elementer.
2. Begge lagets relevante forsvarsroller må kunne evalueres med den ordinære
   `defensiveReplyForPressExit`; ukjent dekning på ett alternativ stopper
   hele valget.
3. Hvis sideskift inngår, kreves også en verifisert svak flanke med v7.1-reglene.
4. Velg ruten med **lavest dokumentert eksisterende sikringsbonus**.
   Forskjellen mot nest svakeste rute må være minst 0,008
   sannsynlighetspoeng – ellers er resultatet uavklart.
5. En eksplisitt enkeltutvei (`pressEscapeRoute`) har alltid prioritet.
   Eksplisitt tidslinje, en ansettelse av et bestemt mål eller historisk
   kampscenario blir aldri remappet av denne mekanismen.

Grensen 0,008 er en spillmodellterskel, ikke en empirisk måling.

## Managerens motsvar

`lineupSnapshot` og dagens taktiske profil evalueres for hver ny kampfase.
Et innbytte eller en dokumentert endring i rollepassform kan endre hvor
motstanderen helst spiller seg ut.

Det er fortsatt **ett** pressutfall, **ett** sikringsutfall og **én** tilhørende
xG-konsekvens. v7.2 beregner *ikke* et ekstra taktisk tillegg for rutebytte.
Den bruker uendret `routeCoverEvidence` og dens eksisterende tak på 0,03.

## Lagring, omstilling og forklaring

Kun nye kamper får opt-in-flagget. Ved en ordinær motstanderreaksjon kan
spillet videreføre en allerede forfattet alternativliste **bare** når
oppdatert `pressEscape` bekrefter en støttet utvei. Gamle lagringer uten
v7.2-flagget bruker tidligere motor.

Replay registrerer de evaluerte rutene, eksisterende sikringsjustering,
valgt utvei og simulert basis i `opponentRouteAdaptation` og gir en norsk
forklaring i `cause`. Den historisk forfattede `opponentEscapeRoute`
blir fortsatt `unknown` når scenarioet bare hadde alternativer.
`resolvedEscapePathway` er motorens valgte simulerte utvei.

## Regresjon

`npm run sim:v7-2-outlet-selection` tester blant annet:
- sentrum mot dybde, og treveis valg inkludert side
- bytte av en spiller med nye, verifiserte rolledata
- like utveier, uverifisert spiller, manglende ruter og isolert utvei
- enkeltutvei/tidslinje har prioritet over automatisk valg
- ett sikringsutfall, identisk RNG, ingen ekstra xG
- replay/lagring og ekte motstanderreaksjon med legacy-fallback

**Begrensning:** dette er en kuratert v7.2-simulering, ikke selvstendig
motstanderspeiding. Automatisk kildebelagt rutegjenkjenning eller
bevegelsesdata er ikke innført.

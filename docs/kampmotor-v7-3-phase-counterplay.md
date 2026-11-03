# Kampmotor v7.3 – fasevis motspill og dokumentert managersvar

## Hva som er endret

V7.2 valgte den svakeste verifiserte utveien blant eksplisitt tilgjengelige
`third_man`, `switch_play` og `direct`. V7.3 beholder nøyaktig samme
rutepolicy, pressterksel, sikringsport og xG-konsekvens. Tillegget er en
**fasevis sammenligning** av det spillet allerede har simulert.

Når en ny kampfase oppstår, kan motoren nå sammenligne den valgte utveien
mot siste **gjennomførte** pressbrudd i kampens `timeline`. Hver tilgjengelig
rute får en avgrenset evidenssnapshot med de faktisk kjente forsvarsspillerne:
`playerId`, posisjon, rolle og beregnet `matchScore`. Endringer i
rolledekning og eksisterende sikringsjustering beskrives som modellens
faktiske grunnlag. Et press som vant ballen, teller ikke som et gjennomført
motstanderutspill.

Nye kamper aktiverer `causalOpponentSequenceVersion: 1`. Gamle lagringer
uten flagget får samme v7.2-svar som før, uten nye snapshots.

## Et managersvar over flere perioder

1. Motstanderen får minst to **forfatterstyrte** mulige utveier.
2. Første pressfase gir en beregnet rute og kjent spillerdekning.
3. Manageren kan bruke eksisterende planbytte/innbytte/rolleendring.
4. Neste fase evaluerer den aktuelle elleveren med den samme v7.2-regelen.
5. Replay viser `first_executed_route`, `held_route` eller `switched_route`,
   sammen med tidligere rute, ny rute, tidligere/ny dekning og rollen til
   de involverte spillerne.
6. Dersom presset gjenvinnes, merkes ruten `press_regained`; den føres ikke
   som brukt av motstanderen.

Dette er en simuleringsforklaring av faktisk modellinput. Det er **ikke**
en påstand om historisk observerte løp, sanntids speiding eller en fri AI.

## Sikkerhetsgrenser i modellen

- Ingen rute oppstår av høye lagratings eller manglende observasjoner.
- Eksplisitt `pressEscapeRoute`, tidslinje og forfattet handlingssekvens
  har fortsatt forrang. Tvetydig eller likeverdig rolledekning gir ikke
  et nytt rutevalg.
- V7.3 tilfører **ingen** sannsynlighetsjustering og **ingen** ekstra xG.
  V7.2s ene sikringsport, maks 0,03 bonus og tidligere terskler består.
- Et managersvar blir ikke tildelt som bevist årsak til rutebyttet;
  replay sier kun hva som er endret mellom de simulerte fasene.
- V7.3 sammenligner bare allerede lagrede presstilfeller med eget
  eksplisitt spillergrunnlag, ikke eldre faser med mangelfull evidens.

## Test

`npm run sim:v7-3-phase-counterplay` tester første fase, holdt rute,
rutebytte etter endret spillerdekning, kontrollerte individuelle profiler,
gjeninnlasting, uendrede xG-verdier, utveiprioritet, uavklarte valg og
pressgjenvinning. Testen kjøres sammen med v7, v7.1 og v7.2 i ordinær CI.

**Avgrensning:** Dette er en første v7.3-leveranse for fasevis, forklarbar
motstanderreaksjon. Selvstendige spillerspesifikke motstandersignaler,
forfatterstyrt flerfase atferd utover eksisterende fase- og rutevalg og
fullt taktisk aksjonsreplay krever separat modell- og datagrunnlag.

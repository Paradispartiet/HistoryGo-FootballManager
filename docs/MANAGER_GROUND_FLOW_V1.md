# Manager grunnflyt v1

Denne endringen etablerer to små, rene beslutningsmoduler som autoritative kilder for managerflyten.

## Standardformasjon

`src/football-default-formation.js` velger formasjon uten DOM eller lagringstilgang:

1. Gyldig lagret formasjon beholdes.
2. Eksplisitt modus-/scenarioformasjon beholdes.
3. Nytt ligaspill velger `modern_4231`.
4. Deretter `modern_433`.
5. Første tilgjengelige formasjon er siste fallback.

Standard kampplan er `central_possession_4231` når ingen gyldig lagret kampplan finnes.

## Kampklarhet

`src/football-matchday-readiness.js` returnerer `loading`, `blocked`, `ready` eller `in_progress`, i tillegg til `canStartMatch`, sorterte blokkeringer og en handlingsrettet oppsummering.

Blokkeringene prioriteres stabilt: startellever, dobbeltbruk, benk, troppsstørrelse, trening, sesong/terminliste og klubbuke. Kampstatus, kampknapp, Neste handling, Samling-merke og selve kampstarteren bruker samme resultat.

Klubbukens eksisterende `matchdayGate.isBlocked` betyr at kampdagfasen venter på at kampen spilles før uka kan gå videre. Den brukes derfor ikke som et avsparkforbud. Readiness blokkerer i stedet avspark når ligaspillet står i en annen klubbukefase enn kampdag.

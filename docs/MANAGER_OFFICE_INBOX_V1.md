# Managerkontor og Assistentråd v1

Denne leveransen gjør Kontor og Assistentråd til tydelige managerflater uten å bygge nye motorer eller flytte eierskap til spilltilstanden.

## Kontorets hierarki

Kontoret skal hjelpe manageren å forstå uka før detaljene åpnes. Den aktive ligasesongen viser derfor:

1. **Ukas hovedsak** – den eksisterende autoritative neste handlingens tittel og forklaring, vist som situasjonsforståelse og ikke som en ny handlingsknapp.
2. **Neste kamp** – motstander, hjemme/borte og arena når terminlisten har en aktiv kamp.
3. **Fire operative statuser** – oppstilling, trening, assistentråd og kampklarhet.
4. **Assistentens signal** – den viktigste eksisterende kontekstmeldingen eller innbokssaken.
5. **Sesong og klubbpuls** – siste resultat, tabellstatus og kvalitative signaler fra styre, garderobe og media.
6. **Klubbukas dybde** – full fase, parametere, historikk og sekundære handlinger bak ett eksplisitt detaljnivå.

Den faste footeren er fortsatt eneste sted som utfører `football-next-action.js` sin primærhandling. Kontoret forklarer den samme tilstanden, men lager ingen konkurrerende «Neste handling».

## Assistentråd

Assistentråden behandles som et beslutningsrom, ikke en flat e-postliste:

- én aktiv sak ligger i fokus;
- den valgte saken beholder avsender, forklaring og eksisterende svarvalg;
- uleste signaler, ventende svar og fase vises inline ved saken;
- andre åpne saker ligger i en egen kø;
- et køvalg flyttes til fokus uten å endre hendelses- eller svarmotoren;
- avsluttede og arkiverte saker ligger i Historikk.

## Motorgrenser

Følgende eksisterende systemer er fortsatt sannhetskilder:

- `football-next-action.js` eier neste handling;
- kampklarhetsmodulen eier om kamp kan startes;
- `football-inbox-events.js` og `club_inbox_*` eier saker, svar og konsekvenser;
- Club Week og off-pitch-parametrene eier fase, moral, styre, medier og taktisk klarhet;
- ligamotoren eier terminliste, resultater og tabell.

`src/ui/manager-office-presentation.js` er bare et rent presentasjonslag. `src/app.js` binder modellen til de eksisterende state- og navigasjonsflatene.

## Testkontrakt

- ren simulering låser prioritet, fire statuskort, assistentsignal, neste kamp og kvalitative klubbverdier;
- scene-audit krever egen presentasjonsmodul, én primærhandling, fokus/kø/historikk og permanent CI-kobling;
- nettlesertest kontrollerer kontorhierarki, direkte navigasjon, én fokussak, køpromotering, mobil overflow og WCAG 2 A/AA;
- eksisterende motor- og flyttester skal bestå uendret.

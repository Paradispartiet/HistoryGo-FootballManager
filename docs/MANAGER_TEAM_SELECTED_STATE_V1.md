# Lag – valgt tilstand og valgdrawer v1

Pass 2 i Kontor + Lag-redesignet etablerer én permanent UI-regel for **Oppstilling, Tropp, Trening og Systemet**:

> Hovedflaten viser den faktiske valgte tilstanden. Alternativene skal fortsatt være fullt tilgjengelige, men de åpnes først når manageren ber om å endre noe.

Dette betyr **ikke** at alternativer fjernes eller gjøres utilgjengelige. De flyttes ut av hovedscenen til én felles popup/drawer-kontrakt.

## Felles valgdrawer

`src/ui/manager-team-choice-drawer-v1.js` eier bare presentasjon og DOM-plassering. Den introduserer ingen ny spillmotor og ingen ny lagring.

På desktop åpnes alternativene som en drawer fra høyre. På mobil/tablet brukes samme komponent som et bottom sheet. Den har:

- modal dialogsemantikk;
- Escape for å lukke;
- fokusfelle;
- fokusretur til knappen som åpnet menyen;
- én `Ferdig`-handling;
- de eksisterende kontrollene flyttet midlertidig inn i menyen og tilbake på samme DOM-plass når den lukkes.

Det siste er viktig: eksisterende event handlers, state og motorer fortsetter å eie valgene.

## Oppstilling

Hovedflaten skal først og fremst være fotballbanen og den valgte elleveren.

Permanent på hovedflaten vises:

- valgt formasjon;
- valgt kampplan;
- banen;
- valgt spiller og rolle for aktiv plass.

Følgende alternativer ligger i valgdrawer:

- alle tilgjengelige formasjoner;
- alle tilgjengelige kampplaner;
- alle tilgjengelige spillere for valgt plass;
- alle tilgjengelige roller for valgt plass.

`Endre formasjon`, `Endre kampplan` og `Endre spiller eller rolle` åpner disse kontrollene. De eksisterende `formationSelect`, `tacticSelect`, `lineupPlayerChoices` og `lineupRoleChoices` brukes fortsatt som sannhetskilder og handlingsflater.

## Tropp

Troppsflaten viser den faktiske troppen. Søk, filter og sortering er visningsverktøy, ikke alternative spillvalg, og beholdes derfor på hovedflaten.

Flaten skal ikke begynne å vise hele History Go-samlingen som en permanent alternativliste. Laguttaksalternativer håndteres fra Oppstillingens valgdrawer.

## Trening

Pass 2 gjør ikke den fulle treningsredesignen; den kommer i Pass 3. Men allerede nå flyttes selve alternativlistene ut av hovedflaten:

- treningsprogrammer → `Endre program`;
- treningsfokus → `Endre fokus`;
- individuell picker → `Endre oppfølging`.

Hovedflaten viser de gjeldende treningsvalgene og den faktiske oppfølgingen. De eksisterende treningsmotorene og state-nøklene endres ikke.

## Systemet

Systemet viser det systemet laget faktisk spiller med og beholder det eksisterende kunnskapsinnholdet.

`Endre system` åpner de samme eksisterende formasjons- og kampplankontrollene i den felles valgdraweren. Vi lager ikke et nytt taktikkvalg ved siden av `formationSelect` og `tacticSelect`.

## Motorgrenser

Pass 2 introduserer:

- ingen ny taktikkmotor;
- ingen ny laguttaksmotor;
- ingen ny treningsmotor;
- ingen ny spillerpool;
- ingen ny localStorage-nøkkel;
- ingen ny progresjonsfunksjon.

History Go/availability bestemmer fortsatt hvilke spillere som finnes. Eksisterende formasjon-, rolle-, kampplan- og treningssystemer eier fortsatt alle valg og konsekvenser.

## Permanent UI-kontrakt

Senere managerflater skal følge samme regel:

1. Vis valgt og aktuelt innhold først.
2. Ikke rendér alle alternativer permanent under hovedobjektet.
3. `Endre` eller en tilsvarende eksplisitt handling åpner alternativene.
4. Alternativene skal være komplette, ikke redusert til et skjult delutvalg.
5. Når et valg er gjort, oppdateres hovedflaten til den nye faktiske tilstanden.
6. Mobil skal ikke få horisontal sideoverflow.

Pass 3 og Pass 4 kan dermed bygge videre på samme valgdrawer i stedet for å lage egne modaler for program, fokus, spiller, rolle, formasjon og taktikk.

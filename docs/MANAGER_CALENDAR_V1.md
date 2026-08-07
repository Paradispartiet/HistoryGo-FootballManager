# Kalender og ekte manageruke v1

Kalender v1 gir HG Football Manager en tydelig tidsstruktur uten å innføre en ny progresjonsmotor.

## Prinsipp

**Club Week er fortsatt sannhetskilden for uke og fase.** Kalenderen leser denne staten og projiserer den på en vanlig manageruke fra mandag til søndag.

`Forslag til neste steg` er fortsatt den **eneste progresjonsveiviseren**. Kalenderen har derfor ingen «Neste dag», «Fortsett», «Neste fase» eller annen knapp som flytter spillet framover.

Kalenderen svarer bare på tre spørsmål:

1. Hvilken uke og dag er vi på?
2. Hva har allerede skjedd denne uka?
3. Hva ligger senere i uka?

## Plassering

Kalenderen ligger under **Kontor → Kalender**.

Den er ikke et sjette hovedområde. Hovedmenyen forblir:

**Kontor · Lag · Speiding · Kamp · Stats**

Kontor har nå fire synlige arbeidsflater:

**Innboks · Kalender · Klubbdrift · Oppstartshjelp**

## Ukerytme

Den eksisterende seksfasemodellen blir presentert som syv dager:

| Dag | Eksisterende fase | Arbeid |
|---|---|---|
| Mandag | `analysis` | Analyse og restitusjon |
| Tirsdag | `inbox` | Innboks og klubbdrift |
| Onsdag | `training` | Treningsarbeid |
| Torsdag | `training` | Trening og individuell oppfølging |
| Fredag | `match_prep` | Kampforberedelse |
| Lørdag | `matchday` | Kampdag |
| Søndag | `review` | Etterkamp og oppsummering |

Torsdag er med vilje en videreføring av den eksisterende treningsfasen. V1 lager ikke en ny daglig progresjonsstate bare for å kunne telle syv faser.

## Dynamisk innhold

Kalenderen gjenbruker eksisterende data:

- `teamMerits.clubWeekState` for uke og fase;
- eksisterende ligasesong for neste motstander, hjemme/borte og runde;
- eksisterende treningsvalg for om ukas treningsarbeid er satt;
- eksisterende kampstate for siste resultat;
- eksisterende kampklar-status for ellever og benk.

Ingen av disse dataene skrives eller endres av kalenderen.

## Visning

Hver dag har:

- ukedag;
- arbeidsoppgave;
- kort forklaring;
- eierflate, for eksempel `Lag · Trening` eller `Kamp`;
- status: **Ferdig**, **I dag** eller **Kommer**.

På desktop vises uka som en kalenderstripe. På mobil blir den en vertikal dagliste uten horisontal scrolling.

## Motorgrenser

Kalender v1 introduserer:

- ingen ny uke-engine;
- ingen ny fase-engine;
- ingen ny kalenderlagring;
- ingen automatisk navigasjon;
- ingen ny «Neste»-funksjon;
- ingen endring i kamp-, trenings-, inbox-, liga- eller konsekvensmotorene.

`src/football-manager-calendar.js` er en ren projeksjon/view-model. `src/ui/manager-calendar-workspace-v1.js` eier bare DOM-presentasjonen under Kontor.

## Regresjonsvern

Permanent simulering låser fase → ukedag, syvdagersuka, kamp på lørdag, etterkamp på søndag og ny uke på mandag.

Browser-vakten låser:

- Kalender som Kontor-underfane;
- syv dager;
- riktig aktuell dag;
- ingen progresjonsknapp i kalenderen;
- uendret femområdes hovedmeny;
- mobil uten horisontal overflow;
- WCAG 2 A/AA med axe.

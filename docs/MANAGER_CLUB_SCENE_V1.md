# Manager Club Scene v1

Denne leveransen gjør Klubb/Mer til ett samlet klubbkontor. Den bygger ingen ny styre-, speider-, stabs-, økonomi-, fasilitets- eller utviklingsmotor. Eksisterende klubbstate og History Go-progresjon er fortsatt sannhetskildene.

## Scenens hierarki

Klubb/Mer åpner på **Klubboversikt**, ikke på en isolert styreside. Første skjerm viser:

1. klubbnavn, uke og aktiv klubbukefase;
2. styrets forventning;
3. klubbens viktigste operative oppgave;
4. fire klikkbare funksjonsstatuser: Styret, Speiding, Stab & drift og Klubbutvikling;
5. støtteapparatets identitet og viktigste gap;
6. langsiktig utviklingsstatus;
7. klubbpuls for styretillit, moral, taktisk klarhet, treningskultur og medietrykk.

Styrets fulle vurdering og klubbverdier ligger i ett foldet dybdenivå. Speiding, Klubbutvikling og Stab & drift beholder egne underfaner og eksisterende funksjoner.

## Arbeidsflyt

```text
Klubb/Mer → Klubboversikt
→ forstå styrets forventning og klubbens viktigste oppgave
→ åpne riktig funksjon
→ Speiding / Stab & drift / Klubbutvikling
→ tilbake til Klubboversikt
```

Den lokale klubboppgaven erstatter ikke den globale `Neste handling`. Den hjelper manageren å drive klubbens varige funksjoner uten å skape en parallell ukeprogresjon.

## Prioriteringsregel

Oversikten velger én lokal klubboppgave deterministisk:

1. lav styretillit løftes som risiko;
2. ufullstendig kampstall peker til Speiding;
3. manglende eller smal stab peker til Stab & drift;
4. manglende ekspertise peker til Speiding;
5. tilgjengelig ekspertise uten aktiv progresjon peker til Klubbutvikling;
6. når driften er stabil, peker oversikten til styrets vurdering og videre oppfølging.

## Motorgrenser

Følgende eksisterende systemer er sannhetskilder:

- Club Week-state eier styretillit, moral, taktisk klarhet, treningskultur og medietrykk;
- availability-snapshotet eier kampstall, opplåste spillere, steder og stab;
- `football-staff-identity-engine.js` eier støtteapparatets identitet, styrker og gap;
- `teamMerits` eier ekspertise, aktive utviklingsprogresjoner, badges og lagklasser;
- eksisterende Speiding-, Stab & drift- og Klubbutvikling-flater eier handlingene;
- `football-next-action.js` eier fortsatt managerukas autoritative progresjon.

`src/ui/manager-club-presentation.js` er et rent presentasjonslag. Det mottar ferdig utledet tilstand, velger én lokal prioritet og binder statuskortene til eksisterende underfaner.

## Bevisst skjulte funksjoner

Fasiliteter og Marked/Klubbrom er fortsatt `data-shell-hidden`. De kan lese kvalitative signaler, men har ikke nok reelle managerhandlinger til å være hovednavigasjon. Økonomi, kontrakter, sponsoravtaler og anleggsinvesteringer skal ikke eksponeres før de har faktiske spillfunksjoner og konsekvenser.

## Testkontrakt

- ren simulering kontrollerer ny klubb, kampklar klubb og etablert klubb;
- scene-audit krever kommandoflate, foldet styredybde, fire operative funksjoner og uendrede motorgrenser;
- Playwright kontrollerer hierarki, navigasjon til eksisterende flater, mobil overflow og WCAG 2 A/AA;
- eksisterende klubb-, styre-, History Go-, stabs-, utviklings-, flyt- og lagringstester skal fortsatt bestå.

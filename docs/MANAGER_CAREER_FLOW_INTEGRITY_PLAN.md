# Manager Career Flow Integrity

> Status: **AKTIV KONSOLIDERINGSFASE**  
> Startet: 11.09.2026  
> Canonical mål: gjør den eksisterende managerkarrieren sammenhengende og pålitelig før nye hovedsystemer bygges.

## Hvorfor denne fasen finnes

Produksjonsbuilden er spilt som Rosenborg-manager gjennom klubbvalg, før-sesong, trening, stab, motstanderanalyse, kampforberedelse, Rosenborg–Fredrikstad og etterkamp. Gjennomspillingen viste at kjernesystemene allerede er sterke, men at progresjonen mellom dem kan hoppe, route feil eller vise stale state.

Dette er derfor en **konsolideringsfase**, ikke et nytt feature-roadmap.

## Produktregel

Ingen nye store managersystemer prioriteres før en ren ligasave kan spilles sammenhengende uten manuell state-reparasjon.

Følgende fryses i denne fasen:

- systematiske spiller-source-depth-runder i 2. divisjon;
- nye økonomi-, kontrakt-, agent- eller overgangssystemer;
- nye nivåer i seriepyramiden;
- nye parallelle kamp-, trenings-, analyse- eller progresjonsmotorer;
- nye hovedfaner.

2. divisjon regnes som tilstrekkelig dekket ved minst **to kildebelagte styrkeprofiler per klubb**. Videre spillerresearch gjøres bare selektivt når en konkret profil har høy produktverdi.

## Autoritativ manageruke

Den eneste canonicale ukeprogresjonen i ligaspill er:

```text
Analyse
→ Innboks
→ Trening
→ Kampforberedelse
→ Kampdag
→ Etterkamp
→ ny uke / Analyse
```

Kalenderen projiserer denne staten. Kalenderen er ikke en parallell tidsmotor.

Ingen arbeidsflate får hoppe over mellomliggende faser bare fordi brukeren åpner flaten eller gjør et valg utenfor riktig fase.

## P0 — før-sesong må være isolert fra Club Week

Før seriestart er klubbopprettelse, spillerpool, stab, ellever, formasjon og treningsvalg **preseason/onboarding-state**.

Krav:

- valg i før-sesong skal ikke flytte `clubWeekState.phase`;
- før-sesong skal ikke skrive Club Week-konsekvenser;
- før-sesongstrening skal ikke markeres som «brukt denne uka» før den faktiske treningsfasen;
- automatisk startnavigasjon skal følge onboarding-rekkefølgen og ikke sende manageren til Trening før manglende Stab;
- sesongen starter canonicalt i uke 1 / `analysis`.

## P0 — én kontrollert faseovergang om gangen

Automatisk synk fra faktisk arbeid får bare fullføre **den fasen brukeren står i**.

Eksempler:

- et treningsvalg kan fullføre `training → match_prep` når current phase faktisk er `training`;
- en ferdig kamp kan fullføre `matchday → review` når current phase faktisk er `matchday`;
- et treningsvalg fra `analysis` eller `inbox` får aldri gå gjennom flere faser i en løkke.

Alle andre fasebytter må skje gjennom den canonicale arbeidsflyten.

## P0 — fredag til lørdag og søndag til ny uke

To konkrete gjennomspillingsfunn skal bort:

1. «Fullfør forberedelsene» må ikke bare navigere til Kalender når state fortsatt står i `match_prep`.
2. «Planlegg neste treningsuke» må ikke åpne Trening mens state fortsatt står i `review`.

Ferdigkrav:

- komplett kampforberedelse gjør `matchday` canonical;
- ferdig etterkamp gjør `week + 1 / analysis` canonical;
- samme uke-/faseverdi vises i Kalender, footer, trening, Kamp og Stats.

## P0 — én sann presentasjonsstate

Samme faktum kan ikke ha to forskjellige verdier på samme skjerm.

Konkret skal følgende reproduksjoner bort:

- kampforberedelse viser `0/11`, `0/4`, ingen formasjon og ingen kampplan samtidig som samme side viser `11/11`, `4/4`, valgt formasjon og valgt kampplan;
- trening viser «Velg treningsprogram» samtidig som programmet er valgt;
- kampheader viser feil neste motstander/runde mens terminlisten viser korrekt fixture.

Readiness, opponent, round, lineup og training skal leses fra én canonical modell per render.

## P1 — routing

CTA-teksten skal åpne stedet hvor arbeidet faktisk utføres.

Første kjente feil:

- mailen «Bygg kampforberedelsen» skal åpne **Kontor → Klubben → Analyse** for nærmeste fixture, ikke bare Lag → Oppstilling.

Alle sentrale CTA-er gjennomgås etter samme kontrakt.

## P1 — støtteapparat som innholdsflate

Stabsystemet fungerer teknisk, men placeholder-profiler bryter klubbillusjonen.

Prioritet etter P0:

1. Eliteserien;
2. OBOS;
3. øvrige klubber bare ved konkret behov.

En etablert toppklubb skal kunne fullføre før-sesong uten at manageren tvinges til å velge åpenbare prototypeprofiler fra andre klubbmiljøer.

## Permanente bevis

Denne fasen skal ikke lukkes med bare en grønn unit-/audit-suite.

### Browser E2E

Minst én Playwright-test skal starte uten ferdig `clubWeekState`-snarvei og drive samme save via faktiske brukerhandlinger.

Minimumskontrakt:

1. velg Ligaspill;
2. ta over etablert klubb;
3. preseason-valg endrer ikke uke/fase;
4. start sesongen;
5. uke 1 starter i `analysis`;
6. mellomliggende faser kan ikke hoppes;
7. kampforberedelse leder til `matchday`;
8. kampen registreres én gang;
9. etterkamp leder til uke 2 / `analysis`.

### Produkt-playthrough

Etter P0/P1 skal produksjonsbuilden spilles uten state-seeding gjennom minst 10 sammenhengende serierunder.

For hver runde vurderes:

- forståelig neste handling;
- tidsbruk/friksjon;
- taktisk variasjon;
- motstandervariasjon;
- treningens reelle betydning;
- kampgrep og feedback;
- inbox-repetisjon;
- form, slitasje og rotasjon;
- stale eller motstridende state;
- dead ends.

Deretter gjennomføres full sesongkontroll til sesongdom og sesong 2.

## Sluttkriterium

Fasen er ferdig når følgende kan gjøres fra blank produksjonsbuild uten manuell localStorage/state-reparasjon:

```text
Ta over Rosenborg
→ fullfør før-sesong
→ start Eliteserien
→ spill Fredrikstad
→ les etterkamp
→ gå til uke 2
→ spill Sandefjord
→ fortsett samme canonicale løkke i minst 10 runder
```

Først etter dette velges neste produktområde fra faktisk spilling.

# Menyen

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Samme krav gjelder huset spilleren står i: **du skal kunne lære deg det.** En meny som sender deg et annet sted enn navnet sitt sier, er en blindvei med innhold i.

## Canonical hovedmeny

Ligaspillet har fem hovedområder, i denne rekkefølgen:

```
Kontor · Lag · Speiding · Kamp · Stats
```

Dette er navigasjonskontrakten. Nye funksjoner skal plasseres under disse områdene før det vurderes en ny hovedfane.

- **Kontor** – innboks, kalender, klubbdrift og oppstartshjelp.
- **Lag** – oppstilling, tropp, trening og systemkunnskap.
- **Speiding** – rekrutterbare spillere og andre klubbers mulige/HG-koblede spillerpool.
- **Kamp** – kampdag og etterkampanalyse.
- **Stats** – tabell, terminliste og spillerstatistikk.

`Forslag til neste steg` i footeren er fortsatt den **ene autoritative progresjonsveiviseren**. Hovedområder og underfaner organiserer innhold; de bygger ikke egne Neste-systemer.

## Kontor

Kontor åpner på **Innboks** i ligaspill. Synlige underflater er:

```
Innboks · Kalender · Klubbdrift · Oppstartshjelp
```

### Kalender

Kalender er tidslinjen for den eksisterende manageruka. Den viser Club Week-fasene som mandag–søndag:

```
Mandag analyse
Tirsdag innboks
Onsdag trening
Torsdag trening / individuell oppfølging
Fredag kampforberedelse
Lørdag kamp
Søndag etterkamp
```

Kalenderen har ingen «Neste dag» eller «Fortsett»-knapp. Den sier hva som er ferdig, hva som skjer nå og hva som kommer senere; `Forslag til neste steg` er fortsatt eneste veiviser. Torsdag er samme eksisterende `training`-fase som onsdag, ikke en ny progresjonsstate.

Klubbdrift eier de varige klubbfunksjonene: styre, utvikling, stab/drift, fasiliteter og marked. Disse er ikke egne hovedområder.

**Speiding ligger ikke under Kontor.** Spillerjakt er en gjentakende manageroppgave med egne sammenligningslister og er derfor på hovednivå.

## Lag

Lag har:

```
Oppstilling · Tropp · Trening · Systemet
```

- **Oppstilling** – bane, formasjon, kampplan, eksplisitt spiller-/rollevalg og benk.
- **Tropp** – valgt klubbtropp først; hele spillerpoolen ligger bak `Endre tropp`.
- **Trening** – ukas treningsarbeid.
- **Systemet** – formasjonskunnskap og taktisk fordypning.

Spillernavnet åpner spillerprofil. Profilklikk endrer aldri laguttaket; det krever en eksplisitt `Velg`/`Sett inn`-handling.

## Speiding

Speiding har to underflater:

```
Min spillerpool · Andre klubber
```

### Min spillerpool

En tett spillerliste over spillere manageren har samlet gjennom History Go- og klubbtilgang, pluss starttroppen. Modellen er:

```
History Go-samling → Min spillerpool → valgt tropp
```

En spiller kan sammenlignes og åpnes i profilen uten å være valgt til troppen. `Velg inn` og `Ta ut` oppdaterer eksisterende `teamMerits`-state; spilleren blir liggende i Min spillerpool selv når vedkommende tas ut.

Det finnes ingen egen overgangsøkonomi i denne flaten. Ingen lønn, kontrakt eller overgangssum diktes når datasettet ikke eier informasjonen.

### Andre klubber

En tett klubbliste over de øvrige klubbene i ligapyramiden. Når en klubb åpnes, vises spillerne HG-dataene knytter til klubbens `homePlaceId` gjennom spillerens `sourcePlaceIds` og eventuell `clubStatus`.

Dette er **mulige/historiske klubbtilknytninger i HG-dataene, ikke en påstått live stall**. Klubbtilknytning alene gir ikke tilgang; History Go- og klubbtilgangen avgjør Min spillerpool.

Begge listene åpner den samme spillerprofilen som Lag bruker.

## Kamp

Kamp har:

```
Kampdag · Analyse
```

Kampdag eier kampforberedelse og selve kampen. Analyse eier etterkamp og forklaringen av hva som skjedde.

## Stats

Stats samler tabell, terminliste, sesongstatus og spillerstatistikk på ett sted. Det skal ikke bygges separate dashboardkopier av de samme tallene andre steder.

## Én underfanestripe

Appen har én `nav.app-subnav`. Knappene bærer `data-subnav-parent`, og bare gruppen som hører til aktivt hovedområde vises.

Det gjelder Kontor, Lag, Speiding og Kamp. Kalender er en Kontor-underfane i den samme stripen, ikke et nytt navigasjonslag.

## Ingen funksjon to steder

Husregelen er:

- én hovedinngang til en funksjon;
- eventuelle snarveier må ha en tydelig lokal grunn og må ikke kopiere hovedmenyen;
- samme label skal ikke sende til forskjellige flater;
- ingen popup skal være en skjult kopi av hovednavigasjonen;
- dyp informasjon skal ligge bak drill-down, ikke som en ny vegg av kort;
- en tidsvisning skal ikke bli en parallell progresjonsmotor;
- kandidattilgang skal ikke være en skjult synonym for troppsmedlemskap.

## Moduser

Hver hovedfane bærer `data-nav-modes` for modiene den faktisk gjelder. Speiding, Rekruttering v1 og Kalender v1 er ligaspill-funksjoner. Scenarioer og Fotballvitenskap beholder sine egne modusgrenser og skal ikke gjøre ligamenyen større.

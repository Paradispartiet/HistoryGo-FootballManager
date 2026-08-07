# Menyen

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Samme krav gjelder huset spilleren står i: **du skal kunne lære deg det.** En meny som sender deg et annet sted enn navnet sitt sier, er en blindvei med innhold i.

## Canonical hovedmeny

Ligaspillet har fem hovedområder, i denne rekkefølgen:

```
Kontor · Lag · Speiding · Kamp · Stats
```

Dette er navigasjonskontrakten. Nye funksjoner skal plasseres under disse områdene før det vurderes en ny hovedfane.

- **Kontor** – innboks, klubbdrift og oppstartshjelp.
- **Lag** – oppstilling, tropp, trening og systemkunnskap.
- **Speiding** – rekrutterbare spillere og andre klubbers mulige/HG-koblede spillerpool.
- **Kamp** – kampdag og etterkampanalyse.
- **Stats** – tabell, terminliste og spillerstatistikk.

`Forslag til neste steg` i footeren er fortsatt den **ene autoritative progresjonsveiviseren**. Hovedområder og underfaner organiserer innhold; de bygger ikke egne Neste-systemer.

## Kontor

Kontor åpner på **Innboks** i ligaspill. Synlige underflater er:

```
Innboks · Klubbdrift · Oppstartshjelp
```

Klubbdrift eier de varige klubbfunksjonene: styre, utvikling, stab/drift, fasiliteter og marked. Disse er ikke egne hovedområder.

**Speiding ligger ikke lenger under Kontor.** Spillerjakt er en gjentakende manageroppgave med egne sammenligningslister og er derfor løftet til hovednivå.

## Lag

Lag har:

```
Oppstilling · Tropp & benk · Trening · Systemet
```

- **Oppstilling** – bane, formasjon, kampplan, eksplisitt spiller-/rollevalg og benk.
- **Tropp & benk** – tett spillerliste for å sammenligne mange.
- **Trening** – ukas treningsarbeid.
- **Systemet** – formasjonskunnskap og taktisk fordypning.

Spillernavnet åpner spillerprofil. Profilklikk endrer aldri laguttaket; det krever en eksplisitt `Velg`/`Sett inn`-handling.

## Speiding

Speiding har to underflater:

```
Rekrutterbare · Andre klubber
```

### Rekrutterbare

En tett spillerliste over kandidater manageren allerede har tilgang til gjennom eksisterende History Go-opplåsinger eller starttropp. Listen brukes til sammenligning; spillerprofilen brukes til dybde.

### Andre klubber

En tett klubbliste over de øvrige klubbene i ligapyramiden. Når en klubb åpnes, vises spillerne HG-dataene knytter til klubbens `homePlaceId` gjennom spillerens `sourcePlaceIds` og eventuell `clubStatus`.

Dette er **mulige/historiske klubbtilknytninger i HG-dataene, ikke en påstått live stall**. Ingen lønn, kontrakt eller overgangssum diktes når datasettet ikke eier informasjonen.

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

Det gjelder nå Kontor, Lag, Speiding og Kamp. Én stripe er viktig fordi body-gridet har eksplisitte rader; flere parallelle undernav ville igjen kunne overlappe hovedmeny eller spillflate.

## Ingen funksjon to steder

Husregelen er:

- én hovedinngang til en funksjon;
- eventuelle snarveier må ha en tydelig lokal grunn og må ikke kopiere hovedmenyen;
- samme label skal ikke sende til forskjellige flater;
- ingen popup skal være en skjult kopi av hovednavigasjonen;
- dyp informasjon skal ligge bak drill-down, ikke som en ny vegg av kort.

## Moduser

Hver hovedfane bærer `data-nav-modes` for modiene den faktisk gjelder. **Speiding v1 er ligaspill-funksjon**. Scenarioer og Fotballvitenskap beholder sine egne modusgrenser og skal ikke gjøre ligamenyen større.

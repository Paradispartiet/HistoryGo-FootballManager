# Fotballæring i managerløkken v1

## Produktmål

HG Football Manager skal først og fremst lære manageren **hvordan fotball fungerer**. Spillere kommer fra History Go / klubbens egen spillerpool; spillet skal ikke drives av et vanlig overgangs- og økonomispill.

Denne versjonen gjør den eksisterende managerløkken pedagogisk sammenhengende:

**Oppstilling → rolle → system → trening → kamp → etterkamp → ny forståelse.**

## Ingen ny motor

`manager-football-learning-loop-v1.js` er et presentasjons- og forklaringslag. Det oppretter ingen ny taktikkmotor, treningsmotor, kampmotor, progresjon, scoring eller lagring. Det leser de eksisterende flatene og `football_roles.json`.

## 1. Rolleforståelse og relasjoner

`Lær om rollen` beholder kravene fra den eksisterende rollekatalogen, men viser i tillegg **hvorfor to roller kan fungere sammen**, hvilken rom-/balanserisiko relasjonen har, og hva manageren konkret bør se etter.

Eksempel: `Bred dribler + Overlappende back` kan skape to-mot-en, men hvis begge fyller samme brede kanal samtidig kan de blokkere hverandres rom og svekke restforsvaret. Timing og sikring er derfor en del av forklaringen.

## 2. Trening med fotballgrunn

Treningsdagen viser ikke bare valgt program. Den forklarer:

- fotballprinsippet programmet trener;
- hvorfor øvelsen er relevant som kampatferd;
- hva manageren bør se etter i neste kamp.

Det eksisterende treningsprogrammet er fortsatt sannhetskilden. Læringslaget endrer ingen treningseffekt.

## 3. Kampplan som intensjon og kompromiss

Systemet har allerede parametrene press, forsvarslinje, oppbygging og bredde samt dokumenterte styrker/risikoer. Læringslaget samler dette til:

- **intensjon** — hva laget prøver å få til;
- **kompromiss** — hva kampplanen samtidig gjør sårbart;
- **observerbar kampatferd** — hva manageren faktisk skal se etter når kampen spilles.

## 4. Etterkamp: bare registrerte signaler

Etterkampen kobler bare teori til taktiske faktorer som den eksisterende kampforklaringen faktisk har registrert. Hvert signal får et fotballprinsipp og et konkret spørsmål manageren kan ta med seg videre.

Hvis kampforklaringen ikke har et tydelig taktisk signal, sier flaten eksplisitt dette og **dikter ikke et læringspoeng**.

## Permanente grenser

- ingen Overall eller ny totalscore;
- ingen ny «Neste»-funksjon;
- ingen kjøp/salg, lønn eller kontraktssystem;
- ingen ny localStorage-key;
- ingen ny taktikk-/trening-/kampmotor;
- eksisterende History Go-spillerpool, rolledata, taktikk, trening og kampanalyse forblir autoritative.

# Fotballæring i managerløkken v2

## Produktmål

HG Football Manager skal først og fremst lære manageren **hvordan fotball fungerer**. Spillere kommer fra History Go / klubbens egen spillerpool; spillet skal ikke drives av et vanlig overgangs- og økonomispill.

Denne versjonen gjør den eksisterende managerløkken pedagogisk sammenhengende:

**Oppstilling → rolle → system → trening → kamp → etterkamp → ny forståelse.**

## Ingen ny motor eller lagringsnøkkel

`manager-football-learning-loop-v1.js` er fortsatt et presentasjons- og forklaringslag. Det oppretter ingen ny taktikkmotor, treningsmotor, kampmotor, progresjon, scoring eller lagringsnøkkel. Den konkrete treningshypotesen lagres i den eksisterende aktive `hgfm.modeSessions.v1`-sesjonen.

## 1. Rolleforståelse og relasjoner

`Lær om rollen` beholder kravene fra den eksisterende rollekatalogen, men leser nå også den **faktiske valgte elleveren**. Når et dokumentert rollepar finnes blant de ti medspillerne, navngis begge spillerne, plassene og rollene, og begge spillerplassene markeres på banen. Bare plasser med eksisterende spiller-ID regnes som del av elleveren; `Tom plass` kan aldri presenteres eller markeres som en medspiller. Manageren får dermed se **hvem** relasjonen gjelder, ikke bare hvilke abstrakte rolletagger som kan passe sammen.

Hvis den kuraterte komplementærrollen ikke finnes i dagens ellever, sier flaten dette eksplisitt. Det er ikke en dom om at oppstillingen er feil; det betyr bare at rollekatalogen ikke har et dokumentert rollepar å forklare i akkurat denne elleveren. Systemet finner ikke på en relasjon mellom to virkelige spillere.

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

## 5. Trening → kamp → etterkamp

Det valgte treningsarbeidet følger nå samme observasjonsspørsmål gjennom hele managerløkken:

1. **Trening** lagrer managerens valgte areal, spillerbalanse, retning og touchregel som en konkret hypotese.
2. **Kampforberedelse** viser det samme oppsettet, intensjonen og ett konkret observasjonsspørsmål.
3. **Kampen** viser et observasjonsøyeblikk når en faktisk motorhendelse berører samme problem. Manageren bruker fortsatt et eksisterende kampgrep, og konsekvensen kommer fra kampmotoren. En forklaring legges bare til når motorens `trainingImpact` registrerer koblingen.
4. **Etterkamp** skiller mellom managerens intensjon, registrerte taktiske bevis, kampmotorens treningsdom og det som fortsatt er usikkert.
5. **Neste uke** kan manageren eksplisitt ta problemet med videre. Trening åpnes da med et forslag, men program og fokus velges aldri automatisk.

Læringslaget sier ikke at en øvelse «virket» bare fordi et beslektet ord finnes i rapporten. Kampmotorens treningsrapport er fasit for registrert effekt. Den taktiske evalueringen brukes som konkret bevismateriale når samme problemområde finnes, og fravær av et slikt signal forklares eksplisitt i stedet for å fylles med en oppdiktet kamphendelse.

Øvelsesverkstedets valg lagres nå som en lesbar hypotese, ikke som en effekt. Etterkampen hevder derfor aldri at areal, overtall, retning eller touchregel forårsaket resultatet. Den sammenligner intensjonen med signalene som faktisk finnes og markerer eksplisitt usikkerhet.

## Permanente grenser

- ingen Overall eller ny totalscore;
- ingen ny «Neste»-funksjon;
- ingen kjøp/salg, lønn eller kontraktssystem;
- ingen ny localStorage-key;
- ingen ny taktikk-/trening-/kampmotor;
- eksisterende History Go-spillerpool, rolledata, taktikk, trening og kampanalyse forblir autoritative.

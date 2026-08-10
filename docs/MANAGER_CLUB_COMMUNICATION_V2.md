# Klubbkommunikasjon v2

> **Videreført 10.08.2026:** `MANAGER_CLUB_COMMUNICATION_V3.md` er canonical for dagens mailkvalitet og presise arbeidslenker. Dette dokumentet bevarer v2-overgangen fra parallell innboks til konkrete kalenderhendelser.

Klubbkommunikasjon v2 gjør mail til en del av managerens faktiske arbeidsuke. Kalenderen viser ikke lenger én generisk «melding fra klubben» og åpner ikke et tilfeldig skjult innbokskort. Hver mail er en bestemt hendelse med stabil ID, avsender, tidspunkt, emne og innhold.

## Produktkontrakt

En nyttig klubbmail følger læringssløyfen:

```text
situasjon → handling → konsekvens → forklaring
```

Mailen skal derfor svare på fire spørsmål:

1. Hva har faktisk skjedd eller hva er registrert nå?
2. Hvilket eksisterende managerarbeid peker dette mot?
3. Hva må manageren observere eller ta stilling til?
4. Hvor kan sammenhengen undersøkes i spillet?

Eksempler er en navngitt belastet spiller før onsdagens økt, den lagrede hypotesen og risikoen mot fredagens faktiske motstander, eller siste resultat før mandagens analyse. Generiske læreboktekster skal ikke erstatte tilgjengelig state.

## Plassering i arbeidsuka

Mail er kalenderhendelser, ikke en parallell hovedflate:

- mandag: kamp-/ukeanalyse;
- tirsdag: inntil tre kuraterte signaler fra eksisterende innboksmodeller;
- onsdag: medisinsk vurdering og trenerteamets oppfølging;
- fredag: motstanderbrief og pressebrief;
- søndag: etterkamp når en kamp er registrert.

Kalenderen viser bare mailer fram til den aktuelle Club Week-dagen. Å velge en annen kalenderdag flytter ikke tid eller fase.

## Sannhetskilder

`src/football-club-communication.js` er et rent presentasjonslag. Det leser:

- `clubWeekState` for uke, fase og kvalitativt mediebilde;
- ligasesongen for faktisk neste motstander;
- kampstate for siste motstander og resultat;
- valgt treningsprogram og fokus;
- `playerCondition` for navngitt skade og kampbelastning;
- lagret motstanderhypotese, motgrep, risiko og observasjonspunkt;
- den ansatte staben for faktisk avsendernavn;
- eksisterende statiske innboksmeldinger og `football-inbox-events.js` for etablerte svarvalg.

Ingen rå skjulte måltall vises i mailteksten.

## Interaksjon

Et klikk åpner alltid mailen som tilhører den klikkede hendelsens ID. Drawer-et bygger et maildokument med avsender, brødtekst, registrerte fakta, eventuelle svar og én relevant lenke til en eksisterende arbeidsflate.

Lesestatus gjelder bare denne mailen. Lesing:

- flytter ikke Club Week-fasen;
- kvitterer ikke ut resten av ukas mailer;
- gir ingen score, effekt eller bonus;
- skriver bare til den eksisterende lesestatusen.

Når en eldre innbokssak har svarvalg, sendes valget fortsatt gjennom den eksisterende statiske valglogikken eller `football-inbox-events.js`. Klubbkommunikasjonen beregner ikke konsekvensen på nytt.

## State- og motorgrense

V2 introduserer ingen ny localStorage-nøkkel, mailmotor, kalenderstate, treningsscore eller konsekvensmotor. Den oppretter heller ikke en ny «Neste»-progresjon.

Eksisterende state for leste melding-ID-er, valgte svar og dynamiske innbokstråder gjenbrukes. Kalenderen og klubbkommunikasjonsmodellen kan bygges deterministisk fra samme input uten å mutere input.

## Permanente porter

Audit, simulering og browservern låser blant annet:

- faktiske navn, motstander, resultat, treningsvalg og analyseplan i relevante mailer;
- stabile mail-ID-er og kronologisk plassering;
- at klikket mail og åpnet mail har samme ID;
- at to forskjellige mailer åpner forskjellig innhold;
- at én lest mail ikke flytter fase eller skjuler de andre;
- at eksisterende svarvalg beholder sin opprinnelige motor;
- ingen ny save-state eller skjult score;
- tastatur, mobil og WCAG 2 A/AA.

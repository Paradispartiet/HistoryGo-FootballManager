# Klubbkommunikasjon v3

Klubbkommunikasjon v3 gjør hver mail til en inngang til managerarbeid, ikke bare en forklaring etter at valget er tatt.

## Dokumentkontrakt

Hver kuraterte mail har:

1. konkret avsender, tidspunkt, emne og registrert situasjon;
2. brødtekst og eksisterende fakta fra save-staten;
3. **Situasjonen**, **Hva det betyr**, **Managerspørsmålet** og **Se etter**;
4. minst to presise arbeidslenker når to relevante steg finnes.

Lenkene bruker det eksisterende SPA-skallet. De åpner riktig hoved- eller underflate og flytter tastaturfokus til et konkret, synlig mål. Eksempler er kontrollen for individuell oppfølging, belastningssignalet på treningsdagen, kampforberedelsen, lagets system og etterkampanalysen. Skjulte legacy-steg er ikke gyldige lenkemål.

## Fotballfaglig kvalitet

Mailen skal binde sammen:

```text
situasjon → betydning → managerspørsmål → observerbar atferd → arbeidsflate
```

Den skal ikke avslutte resonnementet for manageren. Den skal beskrive hva staten faktisk viser, skille observasjon fra antakelse og gi et spørsmål som kan prøves i trening eller kamp.

## Sannhetskilder og grenser

`src/football-club-communication.js` er fortsatt et deterministisk presentasjonslag over eksisterende kamp, terminliste, trening, condition, analyseplan, stab og innbokssignaler.

V3 introduserer:

- ingen ny localStorage-nøkkel;
- ingen ny mail-, trenings-, kamp- eller konsekvensmotor;
- ingen ny score eller skjult bonus;
- ingen progresjon ved lesing eller lenkeklikk.

Eksisterende svarvalg sendes fortsatt til sin opprinnelige innboksmotor. Lesestatus bruker eksisterende save-state.

## Permanente porter

Audit, simulering og browservern låser:

- fireleddet managerveiledning i kuraterte og eldre signaler;
- minst to gyldige og dedupliserte arbeidslenker i kuraterte mailer;
- presise `focusId`-mål;
- faktisk navigasjon og fokus i browser;
- uendret fase og øvrige mailer etter lesing;
- mobil uten overflow og WCAG 2 A/AA.

`MANAGER_CLUB_COMMUNICATION_V2.md` beskriver den historiske overgangen fra parallell innboks til kalenderhendelser. Dette dokumentet er canonical for den synlige mailopplevelsen.

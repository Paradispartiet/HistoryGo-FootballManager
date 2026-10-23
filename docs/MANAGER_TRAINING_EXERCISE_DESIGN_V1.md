# Treningsøvelser og øvelsesdesign v1

## Formål

HG Football Manager skal ikke bare forklare et treningsprogram etter at manageren har valgt det. Manageren skal kunne åpne en konkret økt og undersøke **hvordan organiseringen av øvelsen endrer hva spillerne faktisk må gjøre**.

V1 bygger derfor et læringsverksted direkte på de fire eksisterende øktene under `Lag → Trening`.

```text
valgt treningsprogram
→ konkret økt
→ åpne øvelsesdesign
→ endre rammer
→ se hva rammene fremhever eller svekker
→ coachingpunkter og manager-spørsmål
```

Dette er samme læringsprinsipp som produktkontrakten:

```text
situasjon → handling → konsekvens/forklaring → dypere forståelse
```

## Ingen ny treningsmotor

`src/football-training-exercise-design.js` er et rent lærings- og forklaringslag.

Det:

- leser navnet på den eksisterende økta;
- gjenkjenner et fotballfaglig øvelsesområde;
- foreslår et mulig grunnoppsett;
- forklarer konsekvensen av fire organiseringsvalg;
- gir coachingpunkter og ett spørsmål treneren bør observere på feltet.

Det endrer **ikke**:

- valgt treningsprogram;
- ukens treningsfokus;
- `fatigueLoad`;
- skaderisiko;
- off-pitch-effekter;
- kampbonus;
- spillerverdier;
- rollefortrolighet;
- progresjon;
- localStorage eller annen save-state.

Øvelsesvalgene er derfor et læringsverksted, ikke en skjult ny bonusmotor.

## De fire organiseringsvalgene

Hver økt kan undersøkes gjennom de samme fire grunnspørsmålene.

### 1. Areal

- lite område;
- middels område;
- stort område.

Arealet endrer blant annet avstander, tid på ballen, løpslengder og hvor tett beslutningspresset blir.

### 2. Spillerbalanse

- likhet;
- overtall med ball;
- overtall uten ball.

Overtall med ball gir flere vellykkede repetisjoner og støttevinkler. Overtall uten ball gjør løsningen vanskeligere og kan skjerpe orientering og risikovurdering. Ingen av delene er universelt «best».

### 3. Retning

- mot mål / målsone;
- posisjonsspill;
- omstilling ved balltap.

Retningen avgjør om øvelsen først og fremst fremhever framdrift, ballflyt eller selve overgangen mellom angrep og forsvar.

### 4. Touchregel

- frie touch;
- maks tre touch;
- maks to touch.

Touchbegrensning kan øke kravene til orientering og beslutningshastighet, men kan også gjøre øvelsen kunstig dersom føring, dribling eller pauser faktisk er en del av fotballproblemet.

## Fotballfaglige øvelsesområder

V1 gjenkjenner eksisterende økter innen blant annet:

- restforsvar og omstilling;
- press og gjenvinning;
- oppbygging og pasningsspill;
- bredde, overlapp og innlegg;
- avslutning;
- restitusjon og skadeforebygging;
- rolleforståelse og lagstruktur;
- fysisk arbeid i fotballkontekst.

Ukjente økttitler får en trygg generell modell: definer én konkret kampatferd og kontroller om reglene faktisk tvinger fram denne handlingen.

## UI

De fire øktene på `Treningsdag` er klikkbare når et reelt treningsprogram er valgt.

Mus, Enter og mellomrom åpner en modal øvelsesflate med:

1. øktens fotballmål;
2. et mulig grunnoppsett;
3. de fire organiseringsvalgene;
4. dynamiske forklaringer på hva som endres;
5. øktspesifikk vurdering;
6. coachingpunkter;
7. ett manager-spørsmål som kan observeres på feltet.

Hvis treningsprogram ennå ikke er valgt, er de fire plassholderøktene ikke interaktive. Manageren sendes ikke inn i et oppdiktet øvelsesoppsett uten en faktisk økt som utgangspunkt.

## Praktisk feltplanlegger i spillet

Øvelsesverkstedet begynner nå med **Sett opp økta**: en skjematisk bane, markerte spillere/stasjoner, forslag til materiell og en kort operativ oppsettsliste. Feltvisningen reagerer umiddelbart på de samme fire valgene (areal, spillerbalanse, retning og touch); den forklarende teorien ligger samlet i en sammenleggbar del.

- Areal illustreres med eksempelmål på 20 × 16, 32 × 24 eller 48 × 36 meter. Dette er **veiledende øvelseseksempler**, ikke dokumenterte anleggsmål for navngitte klubber.
- Spillerbalanse vises som 4 mot 4, 5 mot 4 eller 4 mot 5, der antall og vester/ball-lag er tydelige. Ingen nye spillere hentes eller låses opp.
- Retning avgjør om målsonene synes, og om oppsettsinstruksjonen handler om angrep, posisjonsspill eller omstilling.
- Touchregel er eksplisitt del av instruksjonen treneren skal gi.
- Et typisk restitusjonsoppsett vises som fire kontrollerte stasjoner framfor konkurransespill. Når manageren velger overgangsspill, vises spillformatet og eksisterende faglige advarsel om at intensiteten kan bli feil for restitusjon.

Dette er en **interaktiv plan for organisering av økten** og benytter `createTrainingExerciseFieldSetup` i den eksisterende øvelsesdesignmodulen. Eksempeltallene er ikke nye motorparametere. De endrer ikke program, fatigue, skadefare, kampbonus eller progresjon.

Hver av de **fire øktene** kan nå lagre sitt eget oppsett. Oppsettene bor i `trainingExerciseHypothesis.sessionPlans` innenfor den allerede eksisterende aktive modussesjonen `hgfm.modeSessions.v1`; ingen ny `localStorage`-nøkkel eller ny treningsmotor introduseres. Rotverdien `trainingExerciseHypothesis` er fortsatt **sist lagrede økt**, slik at gammel kampledelse og etterkampanalyse får samme enkle hypotesesnapshot som før. Eldre saves med bare én hypotese leses fortsatt. Ved uke-/programbytte blandes ikke gamle øvelser inn i den nye uka.

Treningsdagen viser eksplisitt hvilke av de fire øktene som har lagret oppsett. Dette er en treningsplanlegger og tilhørende observasjonshypoteser, ikke ny belastningsberegning.

## Produktgrense

V1 er bevisst pedagogisk før den blir mekanisk.

Senere kan vi vurdere om enkelte øvelsesvalg skal påvirke den eksisterende treningsmotoren, men da må påvirkningen gå gjennom dagens treningsdata og belastningsmodell. Vi skal ikke lage en separat «øvelsesscore» eller en ny progresjonsmotor ved siden av treningsuka.

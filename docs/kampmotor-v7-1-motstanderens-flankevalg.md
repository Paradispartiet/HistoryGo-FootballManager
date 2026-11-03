# Kampmotor v7.1 – motstanderens dokumenterte flankevalg

Den eksisterende v7-motoren må først ha en kjent utvei fra presset.
Denne leveransen gir **sideskift** en betinget, synlig målkorridor i kamp.
Motstanderen kan velge den **verifiserbart svakere** av vår venstre/høyre
backside – aldri utlede GPS-posisjoner, løpstider eller skjulte evner.

## Aktivering

- En spesifikk `pressEscapeRoute: "switch_play"` må allerede finnes.
  En generell `pressEscape: "supported"` er **ikke** bevis for et sideskift.
- Authorert policy `pressEscapeTargetPolicy: "weakest_verified_flank"` kan
  brukes i scenarioer uten en eksplisitt målflanke.
- **Nye kamper** har `causalOpponentFlankAdaptationVersion: 1`.
  Når motstanderen gjør sin eksisterende reaksjon (`push_up`/`sit_back`),
  kan den bevare en på forhånd kjent sideskiftvei og aktivere policyen
  dersom de oppdaterte måltallene faktisk støtter press-escape-signalet.
  Gamle kamp-lagringer uten flagget beholder gamle regler.
- Har scenariodesigneren allerede valgt venstre/høyre, vinner det alltid.
  Også en motstridende/ugyldig authorert målflanke blokkerer automatisk
  gjetting. En spesifisert tidslinje omplasseres aldri til ny korridor.

## Hva som er avgjørende

To kjente backer kreves, én på hver flanke, med verifisert matchfit, rolle
og minst ti kjente spillere totalt. Mangler noe, er flankevalget **ukjent**.

1. Er bare én back registrert som `support_fullback`, velger motstanderen
   den andre, udekkede flanken.
2. Er begge registrert i sikringsrollen, velges den med minst
   **fem poeng lavere** dokumentert rollepassform.
3. Like/tilnærmet like sider, uverifiserte spillere eller begge uten
   relevant sikringsrolle gir **intet automatisk valg**.

Fem poeng er en avgrenset spillmodellterskel, ikke et empirisk funn.
Selve flankevalget gir ingen bonus: den allerede implementerte v6/v7-porten
beregner sikringsbidraget én gang (maks 0,03); xG forblir knyttet til ett
utfall. Det finnes ingen ekstra fart-, press- eller målbonus.

## Managerens svar og replay

Sikringen leses fra gjeldende `lineupSnapshot` for hver kampperiode.
En reell endring i backens rollepassform (f.eks. etter et innbytte) kan
derfor endre hvilken flanke som er svakest. Tidligere perioder muteres
ikke. I `counterplay.opponentAdaptation` lagres valgt flanke, årsak og
simuleringsgrunnlag; `cause` forklarer angrepsvalget på norsk.

En **simulert** målflanke står i `simulatedTargetFlank`, ikke
`documentedTargetFlank`, slik at replay ikke forveksler strategi med en
historisk observert hendelse. Ved ukjent evidens blir ingen flanke utledet.

## Testing og begrensninger

`npm run sim:v7-opponent-adaptation` er lagt til full GitHub CI.

Testen dekker begge flanker, rollebrudd, ulike rollepassformsvurderinger,
managerens endrede ellever, fast RNG og kampstatus, prioritet til eksplisitt
scouting, manglende data, gamle lagringer og faktiske justeringshendelser.

Denne første v7.1-bolken gjelder **kjente sideskift**, ikke automatisk
valg mellom samtlige sentrale/dype/offensive løpsmønstre. Full motstander-AI
uten forfatterstyrt rutebevis og bevegelsesdata ville gi fiktiv innsikt.
Neste fase er kildeforankret valg mellom flere dokumenterte utveier,
med kontroll av kostnad ved managergrep.

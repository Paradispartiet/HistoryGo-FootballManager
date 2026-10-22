# Kampmotor v6 – spiller, rolle og formasjon (22. oktober 2026)

## Mål og evidensgrense

PR #493 verifiserte 18 kanoniske kampplaner mot 12 modellerte motstanderstiler med varierende syntetisk rollepassform. PR #494 fjernet generisk taktikkbonus fra udokumenterte lagmetrikker. Denne testbolken følger opp [oppgave #495](https://github.com/Paradispartiet/HistoryGo-FootballManager/issues/495) og kontrollerer flere ledd i selve spillmodellen samtidig.

Testen benytter **virkelige kanoniske formasjoner og rolledefinisjoner fra spilldataene**, og selve produksjonsfunksjonene `calculateTeamFit`, `calculateMatchStrength`, `evaluatePlanVsOpponent`, `createMatchdaySession` og `advanceMatchClock`. De navngitte spillerne er **syntetiske kontrollspillere** med eksplisitt isolerte ferdighetssignaler. De er ikke historiske fotballspillere. Verdien `belagt` i en testfixture betyr kontrollert input for proveniensmekanismen, ikke påstand om en ekte spillers dokumenterte egenskaper.

## Sammenligninger

1. **Samme ellever og 4-3-3, ulike roller:** nøkterne backroller og balanserende sekser mot begge backer på overlapp, offensiv sekser og mer aktive pressroller. Bredde/press må kunne bedres samtidig som restforsvaret svekkes. Det kontrolleres på ekte lagmetrikker, ikke håndkonstruert `matchScore`.
2. **Ulik kanonisk formasjon:** 4-3-3 sammenholdes med 3-4-3 med vingbacker; ekstra bredde må ikke automatisk være ensbetydende med bedre restforsvar.
3. **Samme spillerplass/rolle, ulike dokumenterte signaler:** en ballspillende stopper versus en hurtig/lesesterk stopper i et høylinjesystem. Førstnevnte skal styrke oppbygging, sistnevnte sikring i restforsvaret. Ingen universell totalbonus.
4. **18 kampplaner × 12 motstanderarchetyper × 3 kanoniske lagoppsett** = 648 kontrollerte simuleringer gjennom den virkelige lagfit- og kampmotorstien. Resultatrapporten skiller taktisk matchup, realisert v6-fase og xG; måler følsomhet uten å kreve at alle individuelle sammenligninger blir forskjellige.
5. Når en v6-fase aktiveres, skal dens ene terminalutfall stemme med xG-endringen og den statiske matchup-bonusen være slått av. Manglende v6-forutsetninger bruker normal fallback.

## Falsifisering og grenser

Kjør `npm run sim:v6-lineup-sensitivity`. Testen feiler hvis faktiske rolleendringer ikke får noen taktisk effekt over matrisen, om de modellerte fordelene og risikoene feilaktig går samme vei i de isolerte kontrollene, om historiske motstanderprofiler eller lagdata muteres, eller om xG-kreditt kan stables for samme v6-hendelse.

**Dette er fortsatt programvareverifikasjon.** Simulerte kontrollspillere kan ikke dokumentere historisk korrekt styrke for navngitte fotballspillere, og 648 interne tester er ikke ekstern kalibrering. Neste trinn for den fulle oppgave #495 er å kjøre et kildeauditert utvalg faktiske spillerprofiler og teste flere motgrepskjeder med uavhengige, annoterte kampdata før eventuelle empiriske påstander.

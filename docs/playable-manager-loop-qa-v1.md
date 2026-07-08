# Playable Manager Loop QA v1

Status: målrettet QA-pass for reisen fra første start til kampdag. Dette er ikke en ny motor eller redesign; endringene er små copy-, routing- og blindvei-fikser oppå eksisterende ligaspill, tropp, taktikkrom og kampdag.

## Hva fungerte i flyten

- Første skjerm peker nå tydelig på **Ligaspill** som hovedspill, mens **Scenarioer** og **Treningsrom** er sekundære valg. Kortene er direkte klikkbare.
- Managerkontoret samler klubb, neste kamp, assistentråd og prioritert neste handling, slik at spilleren ser hvor de er i uka.
- Taktikkrommet har grønn bane som hovedflate, med startellever, rollevalg, benk og konkrete readiness-signaler.
- Kampdag forklarer hva som mangler før avspark, viser motstander/kampplan når kampen er klar, og gir resultat, analyse og neste-uke-råd etter kamp.

## Hvor brukeren kunne stoppe opp

- Etter en kamp ble spilleren værende på kampflaten etter at rapporten var lest og uka rullet videre. Det gjorde neste prioritet mindre tydelig.
- Noen labels var fortsatt tekniske eller generiske, blant annet «league-save», «Åpen», «kampmotor/motstanderprofil» og tom benk uten tydelig fotballforklaring.
- Etter kamp brukte Next Action fortsatt «Se kamprapporten» og «Gå til neste uke», som forklarte mindre godt hva manageren faktisk skulle gjøre.

## Dead ends som ble fikset

- Rapportknappen etter kamp sender nå spilleren tilbake til **Managerkontoret** etter at rapporten er markert lest og klubbuka er rullet videre.
- Etter-kamp-prioriteten bruker tydeligere managertekst: **Se kampanalyse** og **Forbered neste kamp**.
- Tropp-/benkstatus bruker fotballspråk: **Klar for kamp**, **Mangler spillere** og forklaring om å hente kampklare benkespillere.
- Før-sesong-copy sier **ligaspill** i stedet for teknisk «league-save».

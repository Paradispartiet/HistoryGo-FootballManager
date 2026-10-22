# Kampmotor v6 – sikring ved pressgjennombrudd og sideskift

Oppdatert 22. oktober 2026. Dette er en modellspesifikasjon, **ikke** empirisk estimerte sannsynligheter eller opptak av observerte spillerbevegelser.

## Fotballfaglig grunnlag

England Football beskriver press, sikring og balanse som **samordnede handlinger**. Nærmeste spiller presser; støtteledd sikrer rommet og spillerne lengst unna balanserer laget. Når spillet vendes, må forsvarerne forskyve seg samlet, ikke forsøke å dekke hele bredden hver for seg. Retning, timing og avstand til medspillere er avgjørende.

- [How to defend like England: roles and responsibilities](https://learn.northeurope.englandfootball.com/articles-and-resources/coaching/resources/2022/How-to-defend-like-England-roles-and-responsibilities)
- [Pressing and covering: cover and recover](https://learn.englandfootball.com/sessions/resources/2026/Pressing-and-covering-session-cover-and-recover)
- [What are the principles of football?](https://learn.westeurope.englandfootball.com/articles-and-resources/coaching/resources/2022/What-are-the-principles-of-football)

Disse prinsippene begrunner *hvilke mekanismer* motoren prøver å representere, **ikke** den konkrete numeriske koeffisienten.

## Kontrakten i dagens beregning

1. **Første pressledd:** Press, spillerfit, motstand og dokumentert utvei avgjør sannsynligheten for å vinne ballen. Sidespesifikk sikring må aldri endre dette leddet.
2. **Presset brytes:** Restforsvar, balanse, spillerfit og trussel gir basen for å begrense angrepet.
3. **Relevant rollepar:** For dokumentert `third_man` kreves balanserende sekser og pressende indreløper. For `direct` kreves minst to stoppere og balanserende sekser. For `switch_play` kreves backen som faktisk er på den **dokumenterte** målsiden, eller begge støttebackene hvis målsiden er ukjent.
4. **Kvalitet:** Bare dokumentert rollefit fra den beregnede elleveren kan gi en ekstra justering. Maksimalt 0,03 i fase to, og null ved utilstrekkelig grunnlag.
5. **Utfall:** Ett terminalt forløp tildeler xG én gang. Ingen separat xG-verdi til sikring, lagdel eller spiller.

### Dokumentert målside

Kun for `tacticalBehaviour.pressEscapeRoute = "switch_play"` kan `tacticalBehaviour.pressEscapeTargetFlank` være `"left"` eller `"right"`. Verdien er angrepsmålsiden sett fra **lagets egen defensive venstre/høyre**. En slik verdi må være eksplisitt levert av scenarioet; motoren utleder den ikke fra hvilket lag som spiller, initial formasjon, rolleetikett eller ukjent observasjon.

- **Ukjent/ugyldig målside:** Konservativ sikringskontroll på begge sider, som i #502. Ingen oppdiktet sidespesifikk fordel.
- **Kjent høyreside:** Beregnet støtteback på høyre side kan gi relevant sikring; avansert høyreback kan ikke.
- **Kjent venstreside:** Speilvendt.
- **Observerte isolasjonsdata:** `pressEscape = "isolated"` overstyrer eldre opplysninger om utvei og målside; ingen ekstra spesialistsikring.

`counterplay.documentedTargetFlank`, `counterplay.defensiveReply.evidence.documentedTargetFlank` og `evidence.documentedTargetFlank` dokumenterer hva modellen faktisk brukte. Tom verdi betyr at målsiden ikke er kjent.

## Regresjoner

`sim:own-press-v6` tester identisk ellever og terningkast med én opptrukket back, men to forskjellige dokumenterte målsider. Bare korrekt side får rollen sin registrert; et kontrollert sannsynlighetsintervall skal vippe `contained` ↔ `escaped`.

`sim:v6-lineup-sensitivity` kjører den faktiske spillerfit → lagfit → kampdag-kjeden med syntetiske kontrollspillere. Den validerer 4-3-3, 4-2-3-1, 4-4-2 og 3-4-3, tre utveier, to rollefit-nivåer, konservativ ukjent målside, kjent asymmetrisk målside og kontroll mot dobbel xG.

## Avgrensning og neste hypotese

Dette er **rolle- og retningsspesifikk** sikring, ikke posisjonssporing i sanntid. For realistisk forskyvning må motoren i en senere versjon ha kildebelagt informasjon om ballside, faktisk avstand, bevegelsestid, pressutløser, antall støtteledd og forflytning over tid. Uten slike data skal motoren ikke utgi rolleetiketter for å være koordinater.

Koeffisienten og grensene er testbare spilldesignhypoteser, ikke empirisk kalibrert effekt fra kampdata.

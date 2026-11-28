# Fotballboka → taktisk gameplay: dekningsregister v1

Utgangspunkt: publisert Fotballboka, commit `d382816ad602efefb9a64f6125c9d94df0c32321`. Dette er en sporbar arbeidsliste, ikke påstand om ferdig dekning. Alle 287 `sourceDetails` har én rad i [registeret](football-book-tactical-coverage.json). Hvert avsnitt kan omfatte flere prinsipper. De 12 historiske klubbkapitlene og basistekstene er en senere separat kontroll.

## Første bolk: etablert angrep

- pending: 254
- partial: 22
- explanatory: 3
- unverified: 8

Undersøkt oppspillsmotor, kompakt blokk, kreative gjennombrudd, kontrollfase, kanoniske sekvenser, rolleforbindelser og integrasjonen i `football-matchday-engine.js`. Denne motoren velger én spesialistfase per periode før xG; overgang etter brutt oppspill erstatter foreløpig risiko. Ukjent motstanderdekning skal ikke behandles som verifisert. Tall i motoren er spillmodellheuristikker, ikke målte historiske sannsynligheter.

Eksisterende testskript om høyt press og kompakt blokk har eksplisitte asserts for fremgang, motgrep, ukjente data og xG. De ble inspisert, ikke kjørt i denne revisjonen. Ingen avsnitt betegnes som fullt dekket eller definitivt manglende før avgrenset mekanikk og relevante testløp er bekreftet. `unverified` betyr at evidens ikke er etablert, ikke at funksjonen er bevist fraværende.

## Prioritert angrepsarbeid

1. Møtende spiller / opp–tilbake–gjennom: undersøk utveivalg (avlegg, vending, stuss, støtte) mot kjent pasningsdekning, med eksisterende tredjemannskjede som grunnlag.
2. Signalpasning og gjenskaping av bredde: kartlegg eksisterende planvalg før eventuell utvidelse.
3. Førsteberøring og orientering: kartlegg eksisterende spillerattributter og mottak under press; ikke konstruer data.
4. Innlegg og avslutning: gjennomgå faktisk avslutnings- og keepermotor, og skill boksadgang fra skuddteknikk.

Neste bolk: etablert forsvar, deretter overganger og dødballer; roller, trening, historie og kultur etterpå. Ingen nye xG-bonuser, nye motorer, eller endring i bokas innhold. Tester skal bevise samme inngangsdata med endret relevant motgrep/rolle gir forventet konsekvens, manglende data er nøytrale, og det ikke oppstår dobbel xG-attribusjon. Første mekanikk velges etter motorkontroll.

## Bolk 2 – etablert forsvar

13 avsnitt i `press_cover_shift` og `out_of_possession` kontrollert mot egen pressmotor, motstanderens soneforskyvning, forsvar mot overlapp/innlegg og løpsmønster. 12 delvis dekket, ett uavklart (markeringsmodeller). Samlet vurdert 46/287.

### Viktige funn

- Egen pressmotor har allerede frontpress, midtbanefelle og gjenvinningspress med separate gjenvinnings- og sikringsporter. Restforsvar evalueres ved brutt press; sluttutfall prises én gang.
- Eksplisitte forsvarsoppgaver kan ha tidsfrister, geometriske bevegelsesankere og dokumenterte individuelle reaksjonsegenskaper. `sourcedDefensiveTaskTiming` begrenser besparelse til 0,25 sekunder per oppgave. Disse er spillmodellheuristikker for avgrensede situasjoner, ikke målte fysiske verdier eller generell posisjonssimulering.
- Motstanderens overlapper, innlegg og tre-romsangrep har ulike forsvarsporter. En dedikert skjermspiller kan påvirke risikoen for at sentral dekning trekkes ut. Dette er ikke det samme som å ha generelle 1F–2F–3F-posisjoner i alle situasjoner.
- Prioriter forsinkelse kontra aktivt press betinget av sikring, deretter eksplisitte signaler/pressrytme og dynamisk pumping. Fullt markeringsvalg må undersøkes videre. Kunnskapslaget har forklaringer som ikke nødvendigvis er motorvalg.

Kildene er bokas eksisterende fagavsnitt og de kontrollerte motorfunksjonene. Testskriptets assertions for egne presskjeder og dokumenterte reaksjonsegenskaper er inspisert, ikke kjørt i denne bolken. Ingen motorendring eller nye xG-verdier. Neste bolk: offensive og defensive overganger, inkludert restforsvar. Deretter dødballer.

## Bolk 3 – offensive og defensive overganger, restforsvar

Ni avsnitt i `transition_attack`, `transition_defend` og `rest_defence`: fem delvis dekket, to uavklarte (konkrete 3v3- og 4v2-mønstre), to forklarende personcase. Samlet vurdert 55/287.

- Balltap i oppspill mot høyt press har allerede en kausal overgang: første fremoverpasning kan brytes, og dersom den lykkes, vurderes stopper og midtbanedekning. Tre terminale utfall: gjenvunnet, inneholdt eller kontring. Sluttutfallet erstatter tidligere risiko i `football-matchday-engine.js`; ingen dobbeltprising.
- Den eksisterende motstanderfasen `resolveOpponentSelectiveTransition` kan eksplisitt velge å beholde ballen ved lite gjennombruddsvindu. Den er bundet til verifisert XI og dokumentert motstandermønster, ikke en generell beslutning for alle egne ballvinninger.
- Egen gjenvunnet andreball har allerede en avgrenset sentral frigjøring med alternativ bredde ved kjent motpress. Etter avverget innlegg finnes en egen frigjøringskjede med riktig tempo og tre komplementære roller. Egen gjenvinning kan også mistes igjen mot dokumentert kollektivt motpress.
- `resolveTacticalPossession` beskriver et allerede priset managerutfall; forklarende trinn er ikke nye ballhendelser eller ekstra xG. Dette er ikke bevis for en generell 3v3- eller 4v2-modell.
- Prioriter en felles beslutning om egen første handling etter dokumentert ballvinning, først der relevant rom- og motspillgrunnlag finnes. Deretter konkrete lokale overtall og rekalibrering. Ingen ny parallell fase, ingen påtvunget 15-sekunders kontring eller universell 5–7-sekunders gjenvinningsregel. Manglende data skal ikke gi en ny bonus eller straff.

Eksisterende overgangs- og kontrolltesters assertions er inspisert, ikke kjørt på nytt i denne bolken. Ingen motorendring. Neste bolk: dødballer, inkludert eget og motstanders angrep, leveringsvarianter og andreball.

## Bolk 4 – dødballer

13 fagavsnitt i fem dødballkapitler vurdert: fem delvis dekket, fem uavklarte, tre forklarende spillerportretter. Samlet vurdert 68/287.

- `resolveOpponentSetPiece` har tre terminalutfall: første kontakt for motstander (+0,08 xG mot), andreball (+0,04) eller avverget (-0,03). Dette er avgrensede spillheuristikker, ikke empiriske sannsynligheter. Keeper/stoppere inngår i første port, midtbaneskjerm og restforsvar i andre. Etter klarering er første port eksplisitt utelatt. Én trekning og ett terminalt faseutfall. Kampmotorens dødballfase har prioritet fremfor andre spesialistfaser.
- Eksisterende managerhendelser har valg om disiplin, tett markering, kompakt boks, presse ut og rask kontring. De er generiske beslutninger; de beviser ikke egen, detaljert dødballorganisering. `getTacticalKnowledgeForTactic` omtaler korte cornere ved possession/structured_build_up; det er et forklaringslag, ikke et cornerleveringsvalg.
- Undersøkt `football_tactics.json`, `football-tactical-sequences.js`, `football-matchday-engine.js`, `football-player-stats.js`, `football-tactical-knowledge.js` og dødballspesialistfasen. Ingen dokumentert egen valgbare nærstolpe/bakre stolpe/kortcorner-varianter, separate frisparkleveringer, straffesparkduell eller offensiv innkasttrekant i disse filene. Dette er ikke en uttømmende negativ søkekontroll av hele repoet. Status er derfor unverified, ikke missing.
- Prioriter verifisert dødballhendelse og enkel, konkret oppgavefordeling for begge lag, før leveringsvarianter og sekundære utveier. Viderefør første kontakt → nedfall → eventuell kontrollert overgang uten dobbel xG. Før keeper-/straffesparkvalg må eksisterende data og regelgrunnlag verifiseres. Ingen personnavnbonus, ulovlig sperring eller fast straffesparkfordel basert på manusets preferanser.

Ingen motorendring, ingen ny sjanseberegning. Ingen eksterne kilde-URL-er i boka verifisert i denne bolken. Neste bolk: spillerroller og relasjoner, deretter trening og spillerutvikling, historie og kultur. Basistekst og klubbkapitler kartlegges separat.

## Bolk 5 – spillerroller, individuelle ferdigheter og relasjoner

Alle 27 rolle-ID-er i bokas ni rollekapitler er sammenlignet mot `data/football_roles.json`: identisk ID-sett, ingen nye eller dupliserte roller. 76 fagavsnitt vurdert: 17 delvis dekket, 1 uavklart, 58 forklarende spillerportretter og tematiske personcase. Samlet vurdert 144/287.

- `calculatePlayerMatchFit` vurderer rolle, posisjon og taktikk; `calculateTeamFit` bruker også rolleforbindelser og begrensede bidrag fra dokumenterte individuelle styrker. Eksisterende test `simulate-sourced-player-team-fit.mjs` sammenligner en pasningssterk stopper med en hurtig, spillforståelsessterk stopper, kontrollerer TS/JS-paritet og ulik oppbyggings-/restforsvarsscore. Testens assertions er inspisert, ikke kjørt i denne bolken. Rollefit er ikke en selvstendig beslutningsmotor.
- Relasjonsmotoren har blant annet kant + overlapp, møtende spiss + dybdeløper, regista + dybdeløper, keeper + ballspillende forsvar, og pressende spiss + pressende midtbane. Den registrerer også manglende komplementære roller og kontinuitet. Den leser ikke kontinuerlige posisjoner for disse relasjonene. Rollefortrolighet er allerede en separat, begrenset utviklingsmekanikk.
- Mål og assists fordeles etter at sjansegeneratoren har produsert mål. `attributeGoal` vekter rolle/posisjon/fit, men dette er ikke bevis for at avslutterens skuddteknikk eller keeperens konkrete redning avgjorde hendelsen. Keeperens boksdekning har mekanikk i dødballfasen, mens grep/parering/blokk/returvalg er uavklart.
- Spillerportretter og OneNote-personcase klassifisert som pedagogiske observasjoner; de overlapper generiske handlingsprinsipper. Ingen ny historisk spillerdata, automatisk personbonus eller ekstern kildeverifisering. Dette er en gjennomgang av den publiserte bokteksten, ikke ny kontroll av originalarkivets komplette kildeinnhold.
- Første kandidat til motorutvidelse er den møtende spissens utveivalg: bygge videre på eksisterende tredjemann/avlegg, med verifiserte alternative mottakere og motspill. Deretter individuell førsteberøring/orientering og forsvarsvalg. Hold samme kampfase, ikke dobbel xG eller ny generell rating.

Ingen motorendringer eller nye rolle-ID-er. Neste bolk: treningsmetodikk, spillerutvikling, fysiologi og psykologi. Deretter fotballskoler, historie og kultur. Klubbkapitler og basistekst er fortsatt separat arbeid.

## Bolk 6 – trening, spillerutvikling, fysiologi og psykologi

Alle 102 fagavsnitt i de seks treningskapitlene vurdert: 48 delvis dekket, 24 uavklarte og 30 forklarende. Samlet vurdert 246/287.

### Det avgjørende skillet: treningsvalg kontra læringshypotese

- `evaluateTrainingDecisionSupport` påvirker relevante managerbeslutninger i kamp (scorebonus, risikodemping), med stabsstøtte. `resolveIndividualTrainingWeek` gir faktiske spilltilstandseffekter for belastning, form, rehab, rollefortrolighet og svakhetsmål. Svakhetsarbeid er separat progresjon, ikke generell attributtøkning.
- `evaluateTrainingExerciseDesign` og `createTrainingExerciseHypothesis` gir valg av rom, antall, retning og touch. Koden sier eksplisitt at oppsettet ikke påvirker lagret treningsbelastning, kampbonus, spillerverdier eller progresjon. Ikke tell dette som kausal treningsmekanikk. Den nye prioriterte koblingen er øvelsesbetingelse → avgrenset oppgavesuksess → eksisterende, relevant progresjon, med kjent underlag og uten dobbel bonus.
- `applyMatchLoad`, `applyWeeklyRecovery` og programintensitet håndterer abstrakt belastning, friskhet og skade/tilgjengelighet. `applyMatchForm` er midlertidig form knyttet til kamp og mål/assist. Off-pitch-programmet oppdaterer aggregerte signaler som selvtillit, kohesjon og taktisk klarhet. Ingen av disse er bevis for individuell fysiologisk måling, diagnostikk, søvn, puls, eller mestringstro. Rehabiliteringslaget er pedagogisk. Ingen nye medisinske eller psykologiske parametre.
- Motstanderanalyse, lagets svakheter, kampforklaring og treningsfokus er koblet. Manusets ni analysepunkter vurdert separat. Ikke presenter xG som tracking, xT, pasningsnettverk eller romkontroll. Individuell kommunikasjon, oppmerksomhet og felles persepsjon krever konkret hendelsesgrunnlag.
- Frade, Seirul·lo, Verheijen, Eggen og Dreier har overlappende mekanikker i eksisterende system, men ikke dokumentert full metodisk simulering. Knytt treningsprinsipp til faktisk fotballhandling, ikke trenernavnbonus. Øvelseseksempler, historiske, sosiologiske og ufullstendige disposisjoner beholdes som fagstoff der egen regel ikke er hensiktsmessig.

Kontroll av kildekode og utvalgte testassertions, ikke ny testkjøring. Eksterne kilde-URL-er er ikke kontrollert. Ingen motorendringer, ingen nye spillerverdier. Neste bolk: resterende 41 fagavsnitt i fotballskoler og formasjonsteori/historie/kultur. Basistekst og 12 klubbkapitler fortsatt separat kontroll.

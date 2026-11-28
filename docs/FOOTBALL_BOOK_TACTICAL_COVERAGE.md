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

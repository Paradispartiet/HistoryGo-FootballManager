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

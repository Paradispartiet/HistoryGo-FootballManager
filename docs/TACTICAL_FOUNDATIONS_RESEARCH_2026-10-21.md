# Taktisk grunnlag v2 – kilder, mekanismer og spill/motspill

Oppdatert 21. oktober 2026. Omfatter samtlige **18 kampplaner**.

## Hva som er faglig kildebelagt – og hva som er spilldesign

FIFA Training Centre og England Football Learning beskriver prinsipper for tredjemann, sideskifte, koordinert press, kompakt defensiv organisering, kollektiv gjenvinning, kontring og pressgjennombrudd. De fastsetter **ikke** numeriske terskler som 60, 78 eller 81. Tersklene i spillet er **eksplisitte designheuristikker**; ingen kilde beviser at én bestemt plan alltid slår en annen. Historiske motstanderprofiler er også en pedagogisk modell, ikke full optisk tracking.

Motspill må forklare mekanismen. En høy verdi i `tacticalComplexity` sier ingenting om et lag faktisk stenger en sekser, dobler en kant eller bryter gjenvinningspress. Seks slike direkte motgrep er derfor erstattet med de mer relevante, eksisterende motstanderfeltene `pressIntensity`, `pressResistance`, `defensiveStructure` og `possessionControl`. Disse verdiene er fortsatt **proxyer** for et konkret mønster, ikke hendelser vi vet fant sted.

### Grunnprinsipper og fagkilder

- **fifaThird**: [FIFA – Third-player combinations](https://www.fifatrainingcentre.com/en/game/game-analysis/in-possession/third-player-combinations.php)
- **fifaSwitch**: [FIFA – Switch of play](https://www.fifatrainingcentre.com/en/game/game-analysis/in-possession/switch-of-play.php)
- **fifaPress**: [FIFA – High press](https://www.fifatrainingcentre.com/en/game/game-analysis/out-of-possession/high-press.php)
- **fifaBlock**: [FIFA – Team organisation out of possession](https://www.fifatrainingcentre.com/en/game/game-analysis/out-of-possession/team-organisation--out-of-possession-.php)
- **fifaCounter**: [FIFA – The counter-attack](https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-attacking/the-counter-attack.php)
- **fifaEscape**: [FIFA – Passing the press](https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-attacking/passing-the-press.php)
- **fifaLoss**: [FIFA – The reaction to losing the ball](https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-defending/the-reaction-to-losing-the-ball.php)
- **faPrinciples**: [England Football – The principles of football](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/What-are-the-principles-of-football)
- **faBehind**: [The FA – Defending space in behind](https://www.thefa.com/bootroom/resources/coaching/how-to-defend-like-england-space-in-behind)
- **faWide**: [The FA – Defending wide spaces](https://www.thefa.com/bootroom/resources/coaching/how-to-defend-like-england-space-in-wide-areas)

## Fotballfaglig modell

1. **Angrep**: penetrasjon, skape rom, bevegelse, støtte og kreativitet. Tredjemann og sideskifte trenger ledige pasningsvinkler og samtidige løp.
2. **Forsvar**: forsinke, kompakthet, dekning/balanse, press og tilbakeholdenhet. Hver spiller som presser åpner et rom som noen må dekke.
3. **Overgang til angrep**: vinne ball, første fremoverspill, samtidige løp, kvalitativ siste handling.
4. **Overgang til forsvar**: første press eller umiddelbar gjenvinning, stenge neste pasning, sikre bak ball og falle tilbake dersom presset passeres.
5. **Kontrafaktisk lesning**: et taktisk grep er bare godt hvis lagets faktiske roller og formasjon støtter det, motstanderens relevante stil er kartlagt og motgrepet ikke allerede nøytraliserer fordelen.

## Samlet gjennomgang av alle 18 planer

Dette er kausale hypoteser knyttet til de fire konkrete bevegelsene i `src/football-tactical-sequences.js`. Kodeverdiene forblir bevisst moderate (maks én samlet kjedefordel), slik at teksten ikke blir en garanti om mål eller seier.

| Kampplan | Fase | Hvorfor trekkene kan virke sammen | Konkret motgrep | Hva kan bryte egen plan |
|---|---|---|---|---|
| Sentralt possession-spill | in_possession | Første pasning lokker presset. Avlegget og tredjemann skaper ledig mellomrom for neste løp. | Aggressivt press alene stenger ikke automatisk tier og sekser; det krever samtidige avstander og dekning. | Når tredjemanns pasning brytes og spissen blir isolert, mister kombinasjonen retningen. |
| Tålmodig oppbygging | in_possession | Keeper og sekser gir ulike vinkler slik at laget kan passere et høyt press og komme ut på rettvendt spiller. | Motstanderen må presse koordinert og fjerne både første støtte og returen, ikke bare løpe fort. | Uten pressresistent mottaker blir rolige korte pasninger en invitasjon til balltap nær eget mål. |
| Posisjonsspill med overtall | in_possession | Overtall på én side trekker forsvar, så vendes ballen til en fri kant og en tredje løper. | Defensiv organisering og kollektiv forskyvning kan fjerne mottakeren, men kan åpne motsatt halvrom. | Vending uten fri pasningslegger eller bred mottaker øker balltaps- og kontringsrisiko. |
| Høyt press | out_of_possession | Spissen styrer første pasning, midtbanen stenger støtte, vingback presser og bakre ledd sikrer rom. | En pressresistent mottaker kan bryte leddet, særlig når et fremoverspill finner rom bak den høye vingbacken. | Løper bare førsteforsvarer, åpner midten og bakrommet selv om presset virker intenst. |
| Gjenvinningspress | transition_defend | Før balltap organiseres sikringen. Ved balltap presser nærmeste, øvrige dekker første utpasning og vinner retur. | Et rettvendt pasningsledd under press og et samtidig utløp kan passere gjenvinningspresset. | Enspillerpress uten støtte kan bli overspilt og etterlate et større rom enn før balltap. |
| Midtbanepress | out_of_possession | Første ledd inviterer sentral pasning, midtbanen skjermer mottaker og presset starter på et kontrollert signal. | En motstander som tåler press og kan vende gjennom tredje mann kan spille forbi fellen. | For sen kollektiv forskyvning lar den første mottakeren vende opp uten press. |
| Direkte kontringer | transition_attack | Et kompakt lag vinner ballen, første pasning går forbi fremste motspiller og to løpere deler bakrommet. | En organisert bakerste sikring kan forsinke eller stanse den første vertikale pasningen. | Lav gjenvinningskvalitet eller forsinket løp lar motstanderen omstille før rommet angripes. |
| Lav blokk og overganger | transition_attack | Den tette blokken hindrer sentrale gjennombrudd, ballvinner finner støtte og spiss/vingback starter koordinert motrom. | Motstanderens gode restforsvar kan stoppe første kontring uten å ofre eget posisjonsspill. | En isolert spiss og for lange avstander gjør at ballen kommer rett tilbake. |
| Dyp blokk og lang utløsning | transition_attack | En tett boks gir duellrom, klareringer blir kontrollert andreball og et avlegg gir neste fremoverspill. | Motstanderen kan kontrollere nedfallsrommet med en organisert sikring og hente opp alle lange baller. | Direkte klarering uten mottak, duellstøtte og vinner av andreball gir vedvarende trykk imot. |
| Direkte spill og andreballer | transition_attack | Lang ball passerer første pressledd, omkringliggende midtbane sikrer nedfallsrommet og neste pasning finner åpent rom. | Kompakt bakre lagdel med organisert midtbane kan vinne den første andreballen. | Uten dokumentert duellkvalitet og støtte kan direkte spill bli gjentatte tap av ball. |
| Spill på målspissen | in_possession | Tidlig pasning finner festepunkt, avlegg til møtende spiller frigjør en tredje løper. | Dobling på mottaksspissen kan redusere tid til avlegg, men kan samtidig åpne rom for en rettvendt mottaker på den andre siden. | En spiss med riktig rolle, men uten dokumentert mottaks-/duellbelegg, skal ikke automatisk få høy kvalitetsbonus. |
| Bredt og hurtig | in_possession | Ballfører trekker laget til en side, vending frigjør én-mot-én ute og samtidige boksløp gir flere valg. | Kollektiv sidesikring og riktig støtte fra egen back kan forsvare én-mot-én uten å blottlegge midten. | En isolert kantspiller uten støtte kan bli låst mot linja, og motstanderen kan bryte angrepet før boksen er bemannet. |
| Innlegg og boksnærvær | in_possession | Bredde og overlapp skaper innleggsrom, ulike løp fyller boksen og et ledd sikrer returen. | Strukturert bokssikring og første-duell kan avskjære innlegget og vinne klareringen. | Mange innlegg er ikke lik mange gode sjanser hvis boksløp og duellevne mangler. |
| Overlapp og kanaler | in_possession | Kant binder back, overlapp skaper overtall, tredjemann finner halvrom og sekser sikrer tap. | Sterke motstander-overganger kan utnytte området som en høy back forlater, spesielt dersom motsatt back også går i angrep. | To høye backer uten retursikring kan åpne begge sider samtidig, slik at én presis utpasning blir til et numerisk overtak imot. |
| Lukk kampen | out_of_possession | Laget reduserer avstander, styrer spillet bredt og gjenvinner løse baller uten å bryte form. | En rettvendt fri mann mellom leddene kan trekke ut stopper og åpne neste rom. | Å senke blokken garanterer ikke færre sjanser; press uten utgang gir vedvarende angrepsbølger imot. |
| Jag utligningen | transition_defend | Høyt lagpress reduserer motstanderens ro, sideskifte frigjør rom og flere spillere angriper neste boks. | En presis kontring bak begge høye backer kan snu sluttpresset til en stor sjanse imot. | Press som ikke omfatter sikringsleddet kan være mer risikabelt enn å beholde balansen. |
| Ro ned tempoet | in_possession | To støttelinjer og keeper gir en trygg vei forbi et aggressivt press, så laget kan eie neste fase. | Koordinert press som dekker begge returer kan tvinge feilpasning i eget område. | Lavt tempo uten frie mottakere betyr ikke kontroll; det gir motstanderpresset tid. |
| Alt frem | transition_defend | Fremre ledd presser samlet, bredde skaper flere pasningsvalg og én sekser forsøker å sikre returen. | En rettvendt mottaker som finner løpet bak høyt forsvar kan utnytte store overgangsrom. | Alle fremme uten støtte gir høyere risiko og garanterer ikke flere gode avslutninger. |

## Åpne begrensninger

- `defensiveStructure`, `pressResistance` og `possessionControl` er grove taktiske proxyer; de beskriver ikke nøyaktige spillerposisjoner i hver kampsekvens.
- Spillerens dokumenterte `strengths` kan ikke erstattes med en stereotypi fra spillerens rolle. Spesielt direkte spill og innlegg må ikke tilskrives heading, duellkraft eller innleggskvalitet uten kilder.
- Fire trekk er undervisningssekvenser, **ikke** fire separate xG-bonuser. En enkelt motstandersikring kan bryte en hel kjede, men responsen må fortsatt vurderes mot faktisk ellever og omstillingskostnad.
- Den eksisterende 18×12-matrisen av historiske arketyper er testdekning, ikke vitenskapelig kalibrering. Valider designterskler mot faktiske kampobservasjoner før de omtales som prediktive.

## Dynamisk motspill v3 – første beslutningssekvenser

Ved **simulert** motstanderjustering `push_up` eller `sit_back` kan det nå legges
`tacticalBehaviour` på den aktive kampmotstanderen med eksplisitt:
pressretning, koordinering, dekning av pasningsvei, blokkavstander og
restforsvar. Om presset faktisk er kollektivt og hvilken dekning det har, avgjøres bare når eksisterende motstanderdata har tilstrekkelige struktur- og avstandsproxyer. Å heve blokken alene er **ikke** nok til å anta godt organisert press. Manglende data beholder «ukjent» fremfor å påstå et konkret mønster. Dette er **beslutningsheuristikker i spillet**, ikke observerte
koordinater eller kildebelagte beskrivelser av historiske lag.

Første avgrensede vertikale implementering gjelder fire angrepsplaner:

- `patient_build_up`: kollektiv sentral dekning kan stanse pasningen til
  fri sekser/tredjemann; høyt **individuelt** førstetrykk uten pasningsdekning
  skal ikke i seg selv blokkere kjeden.
- `central_possession_4231`: sentralt avlegg og tredje løp krever en
  tilgjengelig pasningslinje; blokkering av sentral forbindelse bryter kjeden.
- `direct_counter_442` og `low_block_transition_541`: motstanders
  restforsvar må faktisk beskytte første vertikale pasning og bakrommet.
  Høy forsvarslinje er ikke ensbetydende med at rommet er ubeskyttet.

**Resultatregelen** er uendret: ett fullført mønster kan gi maksimalt én
betinget `edgeDelta` (ikke fire bonuser), og ved stanset kjede blir
`edgeDelta=0`. Eksisterende avhengigheter til valgte roller, formasjon
og seks taktiske lagmetrikker beholdes; svak lagdekning kan ikke oppveies
med et nytt motstandertrekk. En eksplisitt, aktuell pasningsdekning teller
mer enn en generell stil-proxy ved evaluering av disse fire mønstrene.
Gamle lagringer uten `tacticalBehaviour` beholder v2-evalueringen.

Hvert modellert forsøk viser fire sammenhengende trinn, hvor forsøket
kan bli avskåret, hvordan dette kan skape balltapsrisiko og hva manageren
må observere. Modellen simulerer **ikke** individuelle spillernes faktiske
XY-bevegelser; dette krever en egen romlig motor og validert bevegelsesmodell.

Tallmessig kalibrering gjenstår: disse endringene bruker eksisterende
kampplanscore og videreføres derfor til kampens kommende xG-perioder via
`planMatchup.edge`, uten separate nye xG-påslag for hvert trinn.
Et tapt kombinasjonsforsøk utløser ennå ikke en egen stokastisk
balltapshendelse. Videre arbeid bør modellere hendelsesutfall og kalibrere
konsekvensene med reproducerbare simuleringer og ekstern kampobservasjon.


### Full modellmatrise for alle 18 kampplaner

De fire første v3-kjedene er nå supplert med 14 ulike,
mekanismespesifikke vurderinger. Disse evalueres i den **samme**
`evaluateTacticalSequences`-funksjonen og bruker de eksisterende
kampplanenes fire steg, eget lagfit og ett begrenset kjederesultat.

| Modellert motspill | Kampplaner | Avgjørende relasjon |
|---|---|---|
| Kollektiv sidesikring | `positional_overloads`, `wide_fast_433` | Vendingen må nå en fri mottaker før blokken er flyttet |
| Utspillsstøtte mot press | `high_press_343`, `counter_press_recovery`, `midfield_press_trap` | Førstepress, støtte-/returpasning og sikring må ses sammen |
| Andreballsikring | `deep_block_long_release`, `direct_second_balls` | Første duell og spillerne rundt nedfallsrommet danner én kjede |
| Duell- og boksdekning | `target_man_focus`, `crossing_box_presence` | Avlegg eller innlegg må få en faktisk mottaker |
| Kontringsutløp | `overlap_channels`, `chase_the_equaliser`, `all_out_attack` | Frigjort kontringsmottaker skaper risiko bak et oppflyttet lag |
| Tilgang til mellomrom | `see_out_the_game` | Rettvendt mottaker mellom ledd kan åpne et nytt rom |
| Returpasning under press | `slow_it_down` | Støttelinjer må være frie samtidig for å roe oppbyggingen |

For å redusere oppdiktet sikkerhet brukes **to bekreftede numeriske
innganger per mulig simulert motgrep**, for eksempel
`defensiveStructure` + `defensiveCompactness` for sidesikring,
eller `transitionThreat` + `pressResistance` for kontringsutløp.
Verdiene er **simuleringsproxyer**, ikke visuell kamptracking eller
dokumentasjon på at en navngitt historisk spiller utførte bevegelsen.
Et enkelt høyt pressignal eller en ukjent verdi kan derfor **ikke**
konkludere med et gjennomført motgrep. Når signalet ikke kan bestemmes,
videreføres v2-vurderingen uten en oppdiktet dynamisk hendelse.

I kampens planvelger kan manageren nå lese hvilket ledd som eventuelt
stanses, risikoen ved å fortsette og hva som bør observeres. Visningen
hevder ikke at de fire bevegelsene allerede har skjedd i kampen.

Relevant ytterligere trenerfaglig bakgrunn:
[England Football Learning – Pressing session: press, cover and balance](https://learn.englandfootball.com/sessions/resources/2025/Pressing-session-press-cover-and-balance)
og [What is pressing in football](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/what-is-pressing-in-football).
Disse beskriver støtte, dekning og balanse bak førsteforsvarer;
**ingen av dem dokumenterer spillets terskler eller xG-koeffisienter**.

**Fremdeles gjenstående:** eksplisitte hendelsesutfall for balltap,
gjenvinning, første overgangspasning og avslutning; posisjons-/avstandsdata;
og kalibrering av prosent-/xG-effekter mot uavhengige kampobservasjoner.
Denne leveransen gir modellert beslutningssekvens, ikke fysisk
tracking av elleve spillere.


### v4 – kampmomenter knyttet til faktiske simulerte sjanser

Den eksisterende kampklokken og xG-modellen skaper allerede sjanser,
avslutninger og mål i perioder. v4 kobler **høyst én** dynamisk
taktisk spill–motspill-kjede til en **allerede simulert** sjanse i hver
periode, når motstanderens kjent/modellerte justering faktisk gir et
`liveExchange`-resultat med en kompatibel planfase.

- Velkjørt oppbygging kan forklare et gjennombrudd; vellykket press og
  motpress kan forklare gjenvinning; en velfundert overgang kan forklare
  en kontringssjanse.
- Når motspillet avskjærer kjeden, kan en **eksisterende sjanse imot**
  illustrere balltap, press brutt eller stoppet kontring.
- Én hendelse har én tidsplassering og én xG-kvalitet. Ingen nye
  sjanser, scoringer, tilfeldige kast eller numeriske xG-justeringer
  opprettes ved merkingen.
- Minuttloggen viser en utfoldbar, presist forklart firetrinns
  *modellert* hendelseskjede. Merket vedvarer til sluttrapporten og
  følger sesjonen gjennom vanlig lagring.

En koblet sjanse er en **forklaringshypotese** om sannsynlig kampforløp,
ikke bekreftet sporing av en historisk spillers posisjon, takling,
balltap eller pasning. Manglende motstanderdata eller lagdekning
gir ingen taktisk annotasjon. En motstandertilpasning og de
eksisterende rollekravene må være representert i aktiv `planMatchup`.

Dette er en mellomleveranse: den eksisterende xG- og sjansemotoren
har allerede vurdert taktikken. Neste nivå er hendelsesbasert
posisjonsmodell som faktisk bestemmer pressledd, klareringer,
ballgjenvinninger og sluttprodukt **før** sjansene blir beregnet,
med systematisk kalibrering mot kampdata. Man må da unngå å
legge effektene oppå eksisterende taktisk `edge` en gang til.

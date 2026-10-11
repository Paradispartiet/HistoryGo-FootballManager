# Aalesund FK — kvalitetsrevisjon av spillerbelegg (11.10.2026)

## Hvorfor revisjonen var nødvendig

Tidligere ble en konkret kamphandling (for eksempel én heading, et innlegg eller et frispark) ofte omgjort til en varig `strengths`-egenskap. Motoren behandler imidlertid en direkte `strengths`-oppføring som kildebelagt spillerstyrke og gir den høyere attributtvekt enn posisjon/rolle. Det er en logisk forskjell mellom «han scoret med hodet i én kamp» og «hodespill kjennetegnet spilleren».

**Før revisjonen:** 46 av 69 Aalesund-eksklusive profiler hadde styrketoken; 37 av 46 hadde bare ett token. Det var en dekningsmåling, ikke 46 vitenskapelig kvalifiserte spillerbeskrivelser.

**Etter revisjonen:** 14 profiler beholder attributter for mer vedvarende / generelt beskrevne kvaliteter. 32 profiler har kildebelagte enkelthendelser i `P1_NEW_EVENT_ONLY`, med den gamle tokenkoden lagret som `legacyTokens`. 23 profiler har fortsatt ikke kvalifiserende P1-belegg. **14 + 32 + 23 = 69.** Event-postene forblir tilgjengelige som historiske kamphendelser og gir ingen direkte attributtløft.

## Kildekrav

| Beviskategori | Kan gi `strengths`? | Eksempel |
| --- | --- | --- |
| `single_match_event` | Nei | Et enkelt innslag, mål, frispark, innlegg eller takling i ett kampreferat |
| `direct_appraisal` | Ja, snevert | Navngitt trener eller relevant fagperson omtaler spillerens spillestil eller typiske ferdighet |
| `historical_appraisal` | Ja, snevert | Klubbhistorikk omtaler et kjent, gjenkjennelig trekk, ikke bare et tilfeldig mål |
| `editorial_appraisal` | Ja, snevert | Fagredaksjon beskriver spillerens gjentakende rolle, ferdigheter og bruk i laget |
| `period_appraisal` | Ja, snevert | Vurdering av spillerens oppgaver eller egenskaper gjennom en sesong/periode |
| `season_statistics` | Ja, med forbehold | Relevante sesongtall beskriver et faktisk ferdighetsmønster, ikke bare én scoring |

Flere enkelthendelser fra **samme kamp** er normalt fremdeles `single_match_event`. Belegg for fysisk styrke, spillelesning, lederskap, gjennombruddspasninger, posisjonering eller avslutningskvalitet skal aldri genereres kun fra målscoring, posisjon, spillerminutter, kroppsbygning eller antatt arketype. `position`, `role` og `archetype` produserer fortsatt modellutledede verdier, men disse må **ikke** omtales som kildebelagte spillerstyrker.

## Tre profiler revidert med sterkere kilder

1. **Tor Hogne Aarøy:** `heading` støttes av fotballfaglig omtale. [Aftenposten, 03.05.2008](https://www.aftenposten.no/sport/fotball/i/LA6GMq/det-stemmer-for-aaroey) beskriver i tillegg den møtende spissrollen, oppspill langs bakken og avleveringer til midtbanespillere. Dette støtter også `hold_up_play` og `combination_play`. Den tidligere treneruttalelsen om luftspill er bevart under `supportingSources`.
2. **Michael Barrantes:** [VG-lupen 2014](https://www.vg.no/spesial/2014/vglupen/viewteam/?lag=Aalesund&plassering=8) beskriver en presis ballfordeler med særskilt overblikk som styrte angrepsspillet. `vision` og `simple_passing` erstatter den gamle styrkepåstanden om generelle dødballer, som bare var begrunnet med ett kampreferat. Det eldre cornerbelegget beholdes som supplerende kilde.
3. **Fredrik Ulvestad:** [VG-lupen 2014](https://www.vg.no/spesial/2014/vglupen/viewteam/?lag=Aalesund&plassering=8) omtaler ham som straffesparkekspert. I dagens attributtvokabular støtter dette `set_pieces` **bare som straffesparkkompetanse** – ikke automatisk frispark eller cornere. Innlegget og avslutningen i en enkelt Stabæk-kamp er beholdt som supplerende hendelseskilde, ikke som `crossing` og `finishing`-styrker.

De øvrige 11 bevarte kvalitetspostene har sine egne vurderingskilder og en eksplisitt `evidenceKind` samt `playingStyle`. Disse er ikke ment som komplette scoutingrapporter: bare støttede trekk er markert.

## Datakontrakt og kontroll

- `P1_NEW_DOCUMENTED`: bare godkjente varige attributter; Aalesund-poster krever `evidenceKind` og `playingStyle`.
- `P1_NEW_EVENT_ONLY`: kilde, historisk beskrivelse og `legacyTokens`; **ingen `strengths`**.
- `getP1NewSourceRecord`: returnerer `DOKUMENTERT`, `HENDELSE`, `DELVIS` eller `THIN-SOURCE`; `HENDELSE` har `strengths: []`.
- P1-overlay og attributtmotor: hendelser blir ikke `belagt` og skal ikke gi de seks råpoengene for direkte registrert styrke.
- `scripts/audit-p1-source-claims.mjs`: kontrollerer disjunkte ID-er, kilder, event-type, stilbelegg, attributtoner og korpusintegritet.
- `scripts/audit-eliteserien-player-strength-coverage.mjs`: rapporterer `eventSourceUrl`, `eventClaim` og `eventLegacyTokens` separat fra `sourceUrl` for dokumenterte styrker.
- Full CI, ikke lett spiller-CI, kreves ved denne semantiske overgangen.

**Avgrensning:** Aalesund er metodisk pilot. Det er ikke gitt at andre klubbers P1/P2/source-depth-poster oppfyller denne strengere kvalitetsstandarden; de må senere vurderes hver for seg. Motor, posisjoner og råkatalog er uendret. Datalaget har bevisst redusert antall direkte spillerstyrker der grunnlaget var for svakt.


## Andre kildepass – 11.10.2026: taktisk dybde, ikke ny attributtinflasjon

Den første revisjonens 14 + 32 + 23 beskriver **status ved første gjennomgang** og beholdes som historisk sammenligningsgrunnlag. Dette kildepasset gir **15 dokumenterte varige profiler + 31 dokumenterte enkelthendelsesprofiler + 23 uten kvalifiserende styrkekilde = 69**. Alle 46 allerede kildeundersøkte spiller-ID-er er fortsatt bevart.

| Spiller | Etter andre kildepass | Spesifikt nytt belegg |
| --- | --- | --- |
| Kristian Hemmingsen Lonebu | `finishing, heading, work_rate` | Hovedtrener Kjetil Rekdal kalte ham hardtarbeidende med målteft; Sindre Eid konkretiserte avslutninger med begge bein og hodet. Trening i feltposisjonering og løp er **ikke** tolket som mestrede ferdigheter. |
| Fredrik Ulvestad | `work_rate, set_pieces` | Rekdal omtalte ham som en hybrid av ballvinner og offensiv playmaker; analyser beskriver løpssterk indreløper. Straffesparkbelegg beholdes som avgrenset dødballstyrke. |
| Sten Grytebust | `shot_stopping, command_of_area` | Landslagskeeper Jon Knudsen vurderte ham som bevegelig og god i feltet og på streken, VG som sterk skuddstopper med god kommunikasjon. Verken ballfordeling eller bred lederskapsevne er utledet. |
| Michael Barrantes | `vision, passing_range, chance_creation` | Rekdals offensive playmaker-rolle, VGs vurdering av særlig presis ballfordeling, samt en konkret langpasning som skapte mål dokumentert av Dagbladet. En enkelt langpasning ville ikke vært nok alene. `simple_passing` er erstattet med mer presise attributter. |
| Tor Hogne Aarøy | `heading, hold_up_play, combination_play` | Ingen nye styrketoken, men mer detaljert historisk skille mellom oppspillspunkt, møtende spiss og skiftet fra langballspill til mer Barrantes-basert spill. |
| Mikkel Kirkeskov | `tackling, crossing, set_pieces` | Ingen nye styrketoken. 2016-statistikken er presisert med **flest** vunnede taklinger i ligaen (84), **nest flest** vellykkede innlegg (61) og to direkte frisparksmål. Det gir ikke grunnlag for å finne på overlappinger eller spillelesning. |
| Aron Elís Þrándarson | `dribbling` (fra `HENDELSE` til `DOKUMENTERT`) | VG oppgir **38 av 49** vellykkede driblinger i 2016, over en sesong; 16 av hans 23 starter var på venstre kant, resten som spiss eller hengende spiss. Den gamle enkeltheadingen fra 2019 oppbevares som supplerende historisk kilde, men skaper ingen heading-styrke. |

### Nye eller styrkede kilder

- [AaFK, Lonebus første proffkontrakt (2024)](https://www.aafk.no/nyheter/forste-proffkontrakt-for-lokal-spiss)
- [BT, Rekdal om Aalesunds midtbaneroller (2012)](https://www.bt.no/sport/i/op67BV/rekdal-aapner-for-to-nye-spisser)
- [BT, løpssterke Aalesund-indreløpere (2014)](https://www.bt.no/sport/i/XgbgPb/aafk-vil-savne-hamed-allah)
- [BT, Ulvestads løpskraft og straffespark (2020)](https://www.bt.no/sport/i/41z7eG/stor-presentasjon-dette-er-det-norske-noedlandslaget)
- [Aftenposten, Jon Knudsen om Grytebusts feltarbeid (2011)](https://www.aftenposten.no/sport/fotball/i/4qLd1G/rekdal-norges-neste-landslagskeeper)
- [VG-lupen, Aalesund 2014](https://www.vg.no/spesial/2014/vglupen/viewteam/?lag=Aalesund&plassering=8)
- [Nettavisen, Rekdal om skiftet fra Aarøy-stil til Barrantes (2011)](https://www.nettavisen.no/artikkel/kan-godt-hende-vi-driter-oss-ut/s/12-95-3267654)
- [Dagbladet, Barrantes' lange målgivende oppspill (2013)](https://www.dagbladet.no/sport/maldrama-da-aalesund-tok-sin-tredje-strake-seier/62942066)
- [VG-lupen, Aalesund 2017 (sesongtall fra 2016)](https://www.vg.no/spesial/2017/vglupen/?plassering=12)

### Metodisk presisering

Dette er **bare registreringer der kilden dokumenterer konkrete spilleegenskaper**. Rollebeskrivelser, trenernes historiske valg og observasjoner om opplæring brukes til å gjøre `playingStyle` mer nyansert, men løftes ikke automatisk til `strengths`. Avslutninger i én kamp, statistikk over mål eller bare posisjonsnavn gir fortsatt ingen nye ferdigheter. `P1_NEW_DOCUMENTED` og `P1_NEW_EVENT_ONLY` er gjensidig utelukkende.


## Tredje kildepass – 11.10.2026: Friðjónssons oppspill og Hamdallahs kildegrense

Denne gjennomgangen tar for seg **Hólmbert Aron Friðjónsson** og **Abderrazak Hamdallah**. Etter kildepasset er AaFK-fordelingen **16 varige profiler + 30 historiske hendelsesprofiler + 23 profiler uten kvalifiserende belegg = 69 eksklusive identiteter**. Verken spilleridentitet, posisjon eller klubbtilhørighet er endret.

### Hólmbert Aron Friðjónsson – fra `HENDELSE` til `DOKUMENTERT`

Eurosport-ekspert Joacim Jonsson beskrev før 2020-sesongen Friðjónsson som Aalesunds X-faktor med spesielt hodespill, fysisk tilstedeværelse og evne til å fungere som oppspillspunkt som holder i ballen. Dette er et konkret, spillerrettet **redaksjonelt vurderingsbelegg** for `heading` og `hold_up_play`, ikke bare én målsituasjon.

- [Eurosport, Joacim Jonssons AaFK-analyse](https://www.eurosport.no/fotball/joacims-blogg/2020/dette-mangler-bohinen-trodde-han-skulle-ha-en-litt-bedre-stall_sto7690243/story.shtml)
- [OBOS-ligaen, Årets spiller i 2018](https://www.obos-ligaen.no/nyheter/fridjonsson-kares-til-arets-spiller-i-obos-ligaen): 19 mål gjennom sesongen og NTBs spillerbørspris, **kontekst** om betydningen i laget – ikke et selvstendig ferdighetsbelegg
- [AaFK, heading i treningskamp mot Hødd](https://www.aafk.no/nyheter/malrikt-da-aalesund-slo-hodd): konkret kamphendelse som er bevart i `supportingSources`, ikke som separat `HENDELSE`-identitet

`strength` er **ikke** automatisk tilordnet. Ekspertens uttrykk om ekstrem fysikk beskriver samlet fysisk tilstedeværelse, men gir ikke en måling eller individuell presis vurdering av ren styrke eller duellkraft. Han får heller ikke `finishing` bare på grunnlag av antall scoringer.

### Abderrazak Hamdallah – beholdt som `HENDELSE`

- [NFF, toppscorerlisten for Tippeligaen 2013](https://www.fotball.no/fotballdata/turnering/hjem/?fiksId=134365&underside=tabellen): 15 seriemål, andreplass bak Frode Johnsen (16)
- [FBref, Aalesund 2013](https://fbref.com/en/players/fe73f8c6/): 27 kamper, 25 starter, 15 ligamål og fem målgivende pasninger (FBrefs registrering)
- [Bergens Tidende, 14.05.2013](https://www.bt.no/sport/i/e8JlxM/derfor-loesnet-det-for-hamdallah-naa): spillerens egen beskrivelse av manglende kommunikasjon om hvor han ønsket ballen, dialog med Jan Jönsson og hat trick i én kamp. Han krevde et straffespark, men Jönsson presiserte at **Ulvestad var lagets utpekte straffeskytter**.
- [AaFK, Viking-referatet](https://www.aafk.no/nyheter/hamed-allahs-store-kveld): heading og avslutninger i én kamp. Den opprinnelige `HENDELSE`-posten er bevart.

Dette dokumenterer produksjon, spissrolle og utfordringer med samhandling i **2013-sesongen**, men ikke med nødvendig presisjon et varig særtrekk som `heading`, `box_presence`, `finishing`, `runs_behind` eller `set_pieces`. En scoring på straffe kan særlig **ikke** overstyre trenerens opplysning om hvem som var fast straffeskytter.

**Metode:** Et gjentakende prestasjonsmål kan være relevant bakgrunn, men et kildebelegg for en navngitt ferdighet må fortsatt være direkte og avgrenset. Neste pass på Hamdallah krever en kvalifisert individuell spillestilsvurdering eller flere sammenlignbare, konkrete observationsdata. Ingen egenskap tilføyes på gjetning.


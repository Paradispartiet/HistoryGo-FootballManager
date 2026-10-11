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

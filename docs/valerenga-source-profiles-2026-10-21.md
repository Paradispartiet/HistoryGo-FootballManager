# Vålerenga – individuelt kildepass (21.10.2026)

**Formål:** Gjøre eksisterende P1-profiler mer taktisk særpregede uten oppdiktede tall eller ferdigheter utledet fra posisjon, mål, meritter eller generelt omdømme. Den eksklusive arven `intility_arena` har fortsatt 66 spilleridentiteter.

## Godkjente spillerprofiler

| Spiller | Akseptert styrke | Kildetype og gyldighetsgrense |
| --- | --- | --- |
| André Muri | `heading`, `positioning` | [Lars Tjærnås i Aftenposten 11.04.2011](https://www.aftenposten.no/sport/meninger/i/wPRdMG/tjaernaas-blogg-droemmelag-uten-prica) vurderer ham individuelt som dominerende i luften og godt plassert ved innlegg. Gjelder Vålerenga-perioden. Inkluderer **ikke** antatt `duels` på bakken eller pasnings-/fartsvurderinger. |
| Fegor Ogude | `strength`, `duels` | [Lars Tjærnås, 11.04.2011](https://www.aftenposten.no/sport/meninger/i/wPRdMG/tjaernaas-blogg-droemmelag-uten-prica) beskriver ekstraordinær fysisk styrke og nærkampsegenskaper i Vålerenga. [Samtidig spillerportrett i Nettavisen](https://www.nettavisen.no/13-fegor-ogude/s/12-95-2973623) støtter identitet og klubbtilhørighet, men brukes ikke til å øke attributtlisten. |
| Aki Riihilahti | `work_rate`, `tackling` | [Reuters 13.05.2017, gjengitt av Indian Express](https://indianexpress.com/article/sports/football/crystal-palace-will-beat-hull-to-survive-says-former-player-aki-riihilahti-4654473/lite/), omtaler løpskraft og taklingsevne fra **Crystal Palace-perioden 2001–2006**, som kom etter Vålerenga-perioden 1999–2000. [Crystal Palace-historikk](https://www.cpfc.co.uk/news/features/palace-in-europe-former-selhurst-star-on-why-he-pushed-for-conference-league/) bekrefter periodetilknytning. Ingen påstand om direkte observasjon fra Vålerenga-spill eller felles periode-ratings. |

## Kildekrav og status

- Før denne PR-en: **13/66** med dokumenterte styrker; **53/66** uten.
- Etter denne PR-en: **16/66** (24,2 %) med dokumenterte individuelle ferdigheter; **50/66** uten.
- P1-fordelingen i eksisterende metode: **16 DOKUMENTERT, 5 DELVIS, 45 THIN-SOURCE**.
- Den nedre sikkerhetsgrensen for manglende styrker strammes til `intility_arena: 0.77`, etter `takRegel(50/66)`.
- Spiller-ID, klubbtilhørighet, epoke, råkatalog, posisjoner, andre klubber, kampmotor og tallratinger forblir urørt.
- Flere tokens godkjennes bare ved individuelt kvalifisert kildevurdering. Enkeltkamp, karrierestatistikk, klubbhistorie eller spillratings fra andre dataspill er ikke tilstrekkelig.

**Videre produksjon:** Undersøk ytterligere individuelle beskrivelser i førstehånds trener-/lagkameratintervjuer, kvalitativ sportsjournalistikk eller seriøse retrospektive kilder, med tydelige år og eventuelle klubbperiodeforbehold. Ikke fyll restgruppen automatisk.

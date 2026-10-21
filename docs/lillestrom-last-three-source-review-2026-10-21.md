# Lillestrøm – siste kildekontroll (21.10.2026)

**Omfang:** 24 eksklusive profiler i P1-arven (`araasen_stadion`). Alle 24 identiteter er kontrollert mot `data/football_players.json` og dokumenterte overlegg i `src/football-player-source-claims-p1.js`.

**Utgangsstatus:** 21/24 med dokumenterte individuelle styrker. De tre gjenstående var `emille_baron`, `ole_dyrstad` og `andre_krogsaeter`. Råfilens tomme `strengths`-felter er tilsiktet: kildeoverlegg materialiseres ved runtime.

| Spiller | Kildegjennomgang | Konklusjon |
| --- | --- | --- |
| Ole Dyrstad | [LSK, intervju med lagkamerat Bård Bjerkeland, 1.12.2017](https://www.lsk.no/nyheter/bard-bjerkeland-jeg-fikk-kjeft-av-kjerrringa-til-mini) beskriver Dyrstad individuelt i omtalen av «ledere og spillere som tok tak». [LSK 13.6.2022](https://www.lsk.no/nyheter/lehne-og-dyrstad-kommer-vorspiel-pa-lillestrom-torv-for-klassikeren-mot-rbk) bekrefter at han var kaptein på seriemesterlaget i 1989. | **`leadership`**. Grunnlaget er lagkameratens vurdering, ikke kapteinsstatus alene. «Godt hode» gir ikke automatisk `game_reading`; posisjonen gir ikke `tackling` eller `heading`. |
| Emille Baron | [Dagbladet 10.7.2000](https://www.dagbladet.no/sport/horribelt/65618727) gjengir trener Arne Erlandsens vurdering av ham som en stadig bedre og stabil keeper med stort potensial; [Dagbladets historiske spillerutvalg](https://www.dagbladet.no/sport/her-er-tidenes-50-beste-utlendinger-i-tippeligaen/66469973) omtaler talentet. | **Fortsatt uten spesifikt ferdighetstoken.** Generell stabilitet, talent og posisjon gir ikke belegg for `shot_stopping`, `reflexes` eller feltarbeid. |
| André Krogsæter | [LSKs historiske kampomtale](https://www.lsk.no/nyheter/statistikk-fra-fagerli-fire-strake-seire-mot-kongsvinger) og [cuphistorie](https://www.lsk.no/nyheter/statistikk-fra-fagerli-28-3-pa-rolvsrud) bekrefter enestående cupscoringer i 1985. [Kampreferat fra 1981](https://kanari-fansen.no/wiki/index.php/Treningskamper_1981) beskriver ett innlegg. | **Fortsatt uten spesifikt ferdighetstoken.** Målstatistikk er ikke dokumentasjon for varig `finishing`; én innleggssituasjon gir ikke `crossing`. |

**Ny status etter denne kildebolken:** 22/24 dokumenterte individuelle styrkeprofiler (91,7 %), to DELVIS og ingen THIN-SOURCE. De to gjenstående har kildehistorikk og skal ikke gis kunstige egenskaper for å nå 100 %.

**Endringsavgrensning:** Bare Dyrstads kildeoverlegg og P1-dekningstelling er endret. Ingen spilleridentiteter, stillinger, spiller-/lagstatistikk, tallratinger, råkatalog eller kampmotor er endret. Fortsett kun ved ny individuelt kvalitativ kildedokumentasjon.

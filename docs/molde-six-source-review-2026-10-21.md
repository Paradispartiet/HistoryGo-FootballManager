# Molde – kildekontroll av seks åpne profiler (21.10.2026)

## Riktig dekningsgrunnlag

54 eksklusive Aker-profiler. Råkatalog pluss source-depth alene viser 45 profiler med registrerte styrker, men dette **undervurderer dekningen**: P2 har allerede selvstendige, kildebelagte SNL-profiler for Petter Rudi, Trond Andersen og Arne Legernes. Disse må ikke dupliseres i source-depth. Etter alle tre lagene (P1, P2 og source-depth) har Molde **48/54 (88,9 %)** før dette arbeidet.

## Ett nytt, kildebelagt resultat

| Profil | Dokumentasjon | Beslutning |
| --- | --- | --- |
| Eiður Guðjohnsen | [Bergens Tidende / Romsdals Budstikke 5.3.2016](https://www.bt.no/sport/i/2G8AxB/spisskollegaen-gudjohnsen-er-en-glimrende-signering) gjengir lagkamerat Fredrik Gulbrandsens samtidige vurdering fra Molde: «flink til å holde på ballen, finne posisjoner og spille gjennom andre». [Moldes offisielle adelskalender](https://www.moldefk.no/om-klubben/var-historie/adelskalendere-i-mfk/antall-offisielle-kamper-totalt-1934-2024-numerisk) bekrefter at Gudjohnsen spilte offisielle kamper for Molde i 2016. | `hold_up_play`, `positioning` og `final_pass`. Ingen `pace`, `stamina`, `finishing` eller tallratinger. Den tidligere **utledede** klubbtilknytningen blir kildebekreftet uten å endre spiller-ID, posisjon eller klubbliste. |

## De øvrige fem uten presis, varig styrkedokumentasjon

| Spiller | Kildegrense |
| --- | --- |
| Bjarki Gunnlaugsson | [Moldes 1997-arkiv](https://www.moldefk.no/om-klubben/var-historie/1990-1999/1997-host) viser konkrete kampaksjoner og scoringer, men ingen bred, varig beskrivelse av én bestemt ferdighetsstyrke. |
| Knut Bjørnå | [Moldes 1969-arkiv](https://www.moldefk.no/om-klubben/var-historie/1960-1969/1969) beskriver en fremragende enkeltkamp og innsats over flere kamper, men gir ikke sikkert, vedvarende belegg for `stamina`, `work_rate` eller `long_shots`. |
| Stål Kapstø Bjørkly | [Moldes 1979-spillerstall](https://www.moldefk.no/om-klubben/var-historie/1970-1979/1979) bekrefter spillerstatus uten individuell ferdighetsbeskrivelse. |
| Tor Gunnar Hagbø | [Moldes offisielle 1983-historikk](https://www.moldefk.no/om-klubben/var-historie/1980-1989/1983) omtaler Hagbø som beste forsvarsspiller i flere kamper og beskriver eksplisitt «solid stopperspill» mot Aalesund. [NFFs kampoversikt 20.05.1984](https://www.fotball.no/fotballdata/kamp/?fiksId=3463294) har Inge Bratteteig i mål og Hagbø blant utespillerne. Dette er tilstrekkelig grunnlag for `CB` (stopper), ikke `GK`. Råkatalogens keepermal erstattes med nøytral stopperrolle uten alternative posisjoner, fiktive styrker, taktiske preferanser eller tallratinger. Spillerens identitet, klubb og klasse beholdes. |
| Berdon Sønderland | [Moldes 1993-arkiv](https://www.moldefk.no/om-klubben/var-historie/1990-1999/1993) beskriver flere kamper og utvikling, men ingen varig individuelt særpreget styrke. |

**Etter dokumentert Gudjohnsen-profil:** 49/54 (90,7 %) med minst én kildebelagt effektiv styrke; fem med utilstrekkelig dokumentasjon. Ingen konstruerte ratinger.

**Kildeintegritet:** Source-depth-koden krever `clubAffiliations[].source === "belagt"`. Den store `data/football_players.json` oppdateres derfor gjennom den avgrensede, idempotente migreringen `scripts/sync-molde-eidur-affiliation.mjs`, fordi ordinær connector-opplasting av 4,6 MB ikke fungerer. Kun én affiliasjonskilde endres; verken råstyrker, spillposisjoner eller andre spillere påvirkes.

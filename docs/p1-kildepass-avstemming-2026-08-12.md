# P1-kildepass — ferdig avstemming 12.08.2026

P1-avstemmingen er ferdig. Nevneren er frosset, de 13 nye passene er kildeklassifisert, de fem tidligere passene er tatt inn i samme kontrollkontrakt, og source-claim-laget er koblet til attributtmotoren.

## Frosset kontrakt

- **18 arver / 936 eksklusive profiler** totalt.
- **5 tidligere pass / 235 profiler:** Vålerenga, Brann, Bodø/Glimt, Viking og Lillestrøm.
- **13 nye pass / 701 profiler.**
- En profil tilhører P1 for en arv bare når canonical `football_players.json` har `sourcePlaceIds.length === 1` og den ene ID-en er arvens sted.
- Canonical spiller-ID og `sourcePlaceIds` vinner over navnebasert deduplisering og eldre klubbpoolfiler.

## Nye pass — låst populasjon

| Arv | Eksklusive profiler | Status |
|---|---:|---|
| Fredrikstad | 70 | LÅST |
| Skeid | 70 | LÅST |
| Aalesund | 69 | LÅST |
| Odd | 68 | LÅST |
| Start | 60 | LÅST |
| Moss | 58 | LÅST |
| Lyn | 55 | LÅST |
| Tromsø | 53 | LÅST |
| KFUM | 46 | LÅST |
| Bryne | 41 | LÅST |
| Sandefjord | 41 | LÅST |
| Stabæk | 41 | LÅST |
| Kristiansund | 29 | LÅST |
| **Sum** | **701** | **LÅST** |

## Stabæk 41/41

Det siste identitetsavviket var `kjell_roar_kaasa`. Canonical-profilen er delt mellom Intility Arena, Nadderud og Gjemselund og skal derfor ikke inn i Stabæks eksklusive P1-nevner. `antonio_nusa` var allerede bekreftet delt og står også utenfor.

`christer_basma` på Nadderud og `ole_christer_basma` på Lerkendal er separate canonical-ID-er og beholdes som to profiler.

## Andre identitetsfunn

- **Fredrikstad:** `cristian_gamboa` og `hans_jorgen_deunk` er delte profiler og står utenfor den eksklusive nevneren.
- **Odd:** `sverre_andersen` og `sverre_andersen_odd` er to forskjellige canonical-profiler; Odd-profilen er med.
- **Aalesund:** `sondre_fet` og `fredrik_klock` er delte og står utenfor.
- **Lyn:** Jørgen Juve og Arne Brustad er delte; `jan_julle_berg` er egen Bislett-only profil og er med.
- **Sandefjord:** `kristoffer_normann_hansen` er delt og står utenfor.

## Kilderesultat

De 13 nye passene: **17 DOKUMENTERT · 0 DELVIS · 684 THIN-SOURCE = 701**.

Samlet med de fem tidligere passene: **45 DOKUMENTERT · 15 DELVIS · 876 THIN-SOURCE = 936**.

Dette er bevisst konservativt. Manglende beskrivende kilde er et sluttresultat, ikke et hull som skal fylles med posisjonsmaler, merittslutninger eller plausible styrker.

## Importform

P1 materialiseres gjennom `src/football-player-source-claims-p1.js`. Laget skaper ikke medlemskap; det anvender kun kildeverifiserte ferdighetsclaims etter at canonical identitet og én-stedsregelen er kontrollert. For nye P1-profiler som ikke er DOKUMENTERT blir `strengths` eksplisitt tom.

Tre tidligere godkjente claims manglet i rå spillerdata og er kildeverifisert som supplements i samme lag: Kenneth Storvik, Tom Lund og Alf «Kaka» Martinsen.

Se `docs/P1_SOURCE_CLAIMS.md` for full kontrakt og statusfordeling.

## Permanent kontroll

`node scripts/audit-p1-source-claims.mjs` er den nye P1-porten. Den krever eksakte 936/936, 701/701 og 235/235 nevnerverdier, unike canonical-ID-er, kilder per eksplisitt claim, gyldig ferdighetsvokabular og Stabæk-regresjonene. Den kjører i CI før `sim:player-attributes` og de øvrige motorsimuleringene.

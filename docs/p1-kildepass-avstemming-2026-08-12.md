# P1-kildepass — avstemmingscheckpoint 12.08.2026

Dette checkpointet bevarer statusen i P1-avstemmingen før kilde-/claim-passene ferdigstilles og importeres. Det markerer **ikke** P1 som ferdig.

## Kontrakt

- Hele avstemmingssettet: **936 profiler over 18 arver**.
- **5 eksisterende P1-pass** er identifisert og avstemt: Vålerenga, Brann, Bodø/Glimt, Viking og Lillestrøm.
- **13 nye pass** skal samlet dekke **701 eksklusive profiler**.
- En profil tilhører P1 for en arv bare når canonical `football_players.json` har `sourcePlaceIds.length === 1` for profilen.
- Profiler med flere `sourcePlaceIds` skal ikke med i den eksklusive P1-nevneren.
- Canonical spiller-ID og `sourcePlaceIds` vinner over navnebasert deduplisering og eldre klubbpoolfiler.

## Nye pass — populasjonsstatus

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
| Stabæk | 41 | **IKKE LÅST — ett identitetsavvik gjenstår** |
| Kristiansund | 29 | LÅST |

De 12 låste populasjonene utgjør **660 profiler**. Stabæks målnevner på 41 gir samlet **701** når den siste identitetsavstemmingen er løst.

## Viktige identitetsfunn fra avstemmingen

Avstemmingen viste at navnekryss mellom klubbpooler ikke er tilstrekkelig. Ikke-klubbarver og separate canonical-ID-er med like navn må kontrolleres direkte.

- **Fredrikstad 70/70:** `cristian_gamboa` er delt mellom Fredrikstad og Rosenborg, og `hans_jorgen_deunk` mellom Fredrikstad og Moss. Begge skal ut av Fredrikstads eksklusive P1-nevner.
- **Odd 68/68:** Sverre Andersen er to forskjellige canonical-profiler: `sverre_andersen` på Viking og `sverre_andersen_odd` på Odd. Odd-profilen skal derfor med.
- **Aalesund 69/69:** `sondre_fet` er delt mellom Aspmyra og Color Line, og `fredrik_klock` mellom Color Line og Høddvoll. Begge skal ut.
- **Lyn 55/55:** Jørgen Juve og Arne Brustad har flere `sourcePlaceIds` og skal ut, mens `jan_julle_berg` er en egen canonical-ID med bare Bislett og skal med.
- **Sandefjord 41/41:** `kristoffer_normann_hansen` er delt mellom Jotun Arena og Jessheim stadion og skal ut.
- **Stabæk:** Antonio Nusa er bekreftet delt mot Ekebergsletta/Ullevaal/Nadderud og skal ut. Én ytterligere canonical delt profil må fortsatt identifiseres for å reprodusere målnevneren 41. `christer_basma` og `ole_christer_basma` er separate canonical-ID-er og må ikke slås sammen bare på navn.

## Kontrollregel videre

Før et kilde-/claim-pass kan få PASS:

1. Kandidatsettet må filtreres direkte mot canonical `sourcePlaceIds`.
2. Nevneren må treffe arbeidslistas eksakte mål for arven.
3. Navnelikhet alene kan aldri brukes til å slå sammen profiler.
4. Delt profil (`sourcePlaceIds.length > 1`) skal ikke inn i det eksklusive P1-passet.
5. Først etter at populasjonen er låst, ferdigstilles kilde-/claim-vurderingen.

## Neste arbeid

1. Løs det siste Stabæk-avviket og lås **41/41**.
2. Bekreft dermed komplett **701/701** for de 13 nye passene.
3. Ferdigstill de 13 kilde-/claim-passene sammen med de fem eksisterende til ett komplett **18-arvers P1-sett / 936 profiler**.
4. Importer først når passene er komplett kontrollert; dette checkpointet innebærer ingen spillerdataendring.

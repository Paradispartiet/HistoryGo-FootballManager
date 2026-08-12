# P1 — kildeclaims for klubbkatalogen

P1 er ferdigstilt 12.08.2026. Målet er ikke å gi alle historiske spillere en komplett ferdighetsprofil, men å sikre at hver ferdighet som faktisk brukes av spillet kan spores til en beskrivende individkilde.

## Frosset nevner

P1-settet består av **936 eksklusive profiler over 18 arver**. Medlemskap utledes alltid fra canonical `data/football_players.json`:

- spilleren må ha nøyaktig én `sourcePlaceId`;
- denne ID-en må være arvens sted;
- canonical spiller-ID vinner over navnelikhet og eldre klubbpoolfiler;
- en delt profil (`sourcePlaceIds.length > 1`) er aldri med i den eksklusive nevneren.

De fem tidligere passene utgjør **235 profiler**. De 13 nye passene utgjør **701 profiler**.

| Arv | Eksklusive | DOKUMENTERT | DELVIS | THIN-SOURCE |
|---|---:|---:|---:|---:|
| Vålerenga | 66 | 13 | 5 | 48 |
| Brann | 47 | 5 | 2 | 40 |
| Bodø/Glimt | 47 | 4 | 3 | 40 |
| Viking | 51 | 4 | 2 | 45 |
| Lillestrøm | 24 | 2 | 3 | 19 |
| Fredrikstad | 70 | 4 | 0 | 66 |
| Skeid | 70 | 1 | 0 | 69 |
| Aalesund | 69 | 1 | 0 | 68 |
| Odd | 68 | 1 | 0 | 67 |
| Start | 60 | 1 | 0 | 59 |
| Moss | 58 | 1 | 0 | 57 |
| Lyn | 55 | 1 | 0 | 54 |
| Tromsø | 53 | 2 | 0 | 51 |
| KFUM | 46 | 4 | 0 | 42 |
| Bryne | 41 | 0 | 0 | 41 |
| Sandefjord | 41 | 1 | 0 | 40 |
| Stabæk | 41 | 0 | 0 | 41 |
| Kristiansund | 29 | 0 | 0 | 29 |
| **Sum** | **936** | **45** | **15** | **876** |

De 13 nye passene alene ender på **17 DOKUMENTERT · 0 DELVIS · 684 THIN-SOURCE = 701**. Lav dekning er et gyldig resultat når kildene ikke beskriver individuelle ferdigheter.

## Statuskontrakt

- **DOKUMENTERT:** en konkret individkilde beskriver en gjenbrukbar fotballferdighet. Bare de eksplisitt beskrevne kvalitetene mappes til eksisterende ferdighetsvokabular.
- **DELVIS:** karriere eller rolle er dokumentert i det tidligere passet, men ingen gjenbrukbar ferdighetsclaim bæres. `strengths` skal være tom.
- **THIN-SOURCE:** ingen akseptert beskrivende individkilde ble funnet i passet. `strengths` skal være tom.

Kamper, mål, trofeer, landskamper, posisjon, kapteinsbind eller klubbstatus er ikke i seg selv ferdighetsbevis. Ingen svakhet konstrueres fra fravær, posisjon, alder, epoke eller nivå.

## Source-overlay

`src/football-player-source-claims-p1.js` er det kildebårne P1-laget. Det skaper aldri spiller- eller klubbmedlemskap. For de 13 nye arvene erstatter det den tomme post-konverteringsbaselinen med den eksplisitte claimlisten; alle øvrige profiler forblir tomme.

De fem tidligere P1-passene er fortsatt proveniens for allerede godkjente claims. Auditen fant tre claims som var godkjent i passene, men ikke materialisert i rå spillerdata: Kenneth Storvik (Viking), Tom Lund og Alf «Kaka» Martinsen (Lillestrøm). Disse tre ligger derfor som eksplisitte, kildeverifiserte supplements i samme registry.

Attributtmotoren anvender overlayen før `derivePlayerAttributes`, `buildAttributeScaling` og `derivePlayerAttributeIndex`. `football_players.json` beholdes som canonical identitets- og medlemskatalog og trenger ikke dupliseres eller omskrives for P1.

## Stabæk-avstemmingen

Stabæk er låst på **41/41**. To delte profiler skal uttrykkelig stå utenfor:

- `antonio_nusa` — flere steder, inkludert Nadderud;
- `kjell_roar_kaasa` — Intility Arena + Nadderud + Gjemselund.

`christer_basma` er en egen Nadderud-only canonical profil. `ole_christer_basma` er en separat Lerkendal-profil. Navnelikhet skal ikke slå dem sammen.

## Permanent audit

`node scripts/audit-p1-source-claims.mjs` kontrollerer blant annet:

- 18/18 arver og eksakte nevnerverdier;
- 936/936 unike profiler, med 701 nye + 235 tidligere;
- ingen profil utenfor canonical én-steds-populasjon;
- kilde og konkret claim for hver eksplisitt DOKUMENTERT-post;
- bare gyldige ferdighetstokens;
- tomme lister for DELVIS/THIN-SOURCE i de nye passene;
- forventet fordeling 45/15/876;
- Stabæk-regresjonene for Nusa, Kaasa og Basma-identitetene.

Auditen kjøres i CI før motorsimuleringene. `sim:player-attributes` kjører deretter på det samme effektive source-claim-laget som spillet bruker.

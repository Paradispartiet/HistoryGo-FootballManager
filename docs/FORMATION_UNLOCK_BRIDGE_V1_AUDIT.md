# Formation Unlock Bridge v1 — mapping-audit

## Runtime-kontrakt

`src/app.js` behandler `start` og `early` som baseline-tier og åpner dem uten at et konkret krav må være oppfylt. For øvrige tier kan runtime evaluere krav med en konkret `ref` for disse kildene:

- Stedspoolen: `history_go_place`, `sport_place`, `football_stadium`, `football_club`, `groundhopper_place`.
- Spillerpoolen: `collected_player`.
- Stabspoolen: `collected_manager`, `collected_staff`.
- Badgepoolen: `football_badge`.

`football_story` og `football_lexicon_entry` har ingen runtime-pool ennå. Krav uten `ref` er ikke verifiserbare. Formasjonenes eldre `unlockLinks` kan inneholde en `ref`, men en slik ref låser bare opp noe dersom ID-en faktisk finnes i den tilsvarende availability-poolen.

## Eksisterende konkrete ID-er

- Steder: `kfum_arena`, `bislett_stadion`, `ullevaal_stadion`, `intility_arena`, `gressbanen`, `ekebergsletta`.
- Spillere: spillerkatalogen inneholder norske historiske og moderne spillere, men ingen sikker Arsenal/Highbury-, Pozzo-, Aranycsapat-, Brasil 1958-, Inter/San Siro-, Ajax/Cruyff- eller tilsvarende formasjonsspesifikk kobling.
- Stab: `jorgen_isnes` har eksplisitt `pressing_structure` og `rest_defense`; `bislett_speed_specialist` har eksplisitt `physical_preparation`, `stamina_training` og `load_management`.
- Badges: team-merits bruker `earnedBadgeIds`, og badgekatalogen har blant annet `high_press_*` og `rest_defense_*`. Ingen badge ble lagt inn som ny formasjonsvei i v1 fordi de eksisterende reglene for de trygge koblingene allerede beskriver stabskunnskap direkte.

## Regel-for-regel audit

| formationId | Tier | Dagens krav før v1 | Evaluerbar før v1? | Manglende konkret ref | Trygg eksisterende ref | Endring/anbefaling |
|---|---|---|---|---|---|---|
| `modern_4231` | start | `history_go_place` / startformasjon | Ja, via baseline-tier | Stedskravet mangler ref, men er ikke nødvendig for baseline | Ingen nødvendig | Ingen endring |
| `modern_433` | early | `history_go_place` / startformasjon eller `football_lexicon_entry` | Ja, via baseline-tier | Begge temakrav mangler ref | Ingen nødvendig | Ingen endring |
| `classic_442` | early | `football_club` / klassisk klubbfotball eller leksikon | Ja, via baseline-tier | Begge temakrav mangler ref | Ingen nødvendig | Ingen endring |
| `pyramid_235` | standard | Tidlig britisk klubb, fotballstory eller viktoriansk bane | Nei | Alle krav mangler ref | Ingen. `gressbanen` er historisk norsk, ikke en dokumentert britisk/viktoriansk kilde | Behold tematisk; trenger britisk klubb-/ground-/story-data |
| `scottish_combination_235` | standard | Skotsk klubb eller pasningsstory | Nei | Alle krav mangler ref | Ingen | Behold tematisk; trenger skotsk pionerdata |
| `wm_3223` | standard | Arsenal, Highbury eller Herbert Chapman | Nei | Alle krav mangler ref | Ingen | Behold tematisk; trenger Arsenal/Highbury/Chapman-data |
| `metodo_2323` | standard | Italiensk metodo-klubb eller Pozzo-skolen | Nei | Alle krav mangler ref | Ingen | Behold tematisk; trenger italiensk klubb-/trenerdata |
| `hungarian_mm_3232` | standard | Dyp nier eller Aranycsapat-story | Nei | Alle krav mangler ref | Ingen. Repoets linking-nine-profiler dokumenterer ikke Hidegkuti/Aranycsapat | Behold tematisk; trenger Ungarn 1953-data |
| `brazil_424` | standard | Maracanã, Brasil 1958-spiller eller brasiliansk klubb | Nei | Alle krav mangler ref | Ingen | Behold tematisk; trenger brasiliansk stadion-/klubb-/spillerdata |
| `catenaccio_1432` | standard | Inter, San Siro eller Herrera | Nei | Alle krav mangler ref | Ingen | Behold tematisk; trenger Inter/San Siro/Herrera-data |
| `libero_352` | standard | Libero-stab **og** libero-spiller eller story | Nei | Alle krav mangler ref | Ingen. Eksisterende stoppere er ikke eksplisitt modellert som libero-kilder | Behold tematisk; trenger libero-spiller/-staff og eventuelt story-data |
| `total_433` | advanced | Ajax, Amsterdam, Michels eller Cruyff | Nei | Alle krav mangler ref | Ingen | Behold tematisk; trenger Ajax/Amsterdam/Michels/Cruyff-data |
| `gegen_4222` | advanced | Presskunnskap **og** fysisk kapasitet fra stab | Nei | Begge stabskrav manglet ref | `jorgen_isnes` og `bislett_speed_specialist` | Legg refs på de to eksisterende, eksplisitte kompetanseprofilene |
| `positional_325` | advanced | Posisjonsspill-manager eller avansert taktikk-stab | Nei | Begge krav mangler ref | Ingen stab har eksplisitt posisjonsspill/avansert taktikk i data | Behold tematisk |
| `box_midfield_3223` | advanced | Avansert taktikk-stab eller box-midfield-leksikon | Nei | Begge krav mangler ref | Ingen | Behold tematisk; trenger eksplisitt taktikkstaff eller leksikon-runtime |
| `modern_3241` | advanced | Avansert taktikk-stab | Nei | Kravet mangler ref | Ingen | Behold tematisk |
| `modern_rest_235` | advanced | Restforsvar-stab eller restforsvar-leksikon | Nei | Begge krav manglet ref | `jorgen_isnes` har eksplisitt `rest_defense` | Legg ref på stabskravet; behold leksikonkravet tematisk |

## Resultat etter v1

Konkrete, runtime-evaluerbare formasjoner:

- `gegen_4222`: krever både tilgjengelig `jorgen_isnes` og tilgjengelig `bislett_speed_specialist`. Dette bevarer regelens `allOf`-prinsipp om både presskunnskap og fysisk kapasitet.
- `modern_rest_235`: kan låses opp av tilgjengelig `jorgen_isnes`, som allerede har eksplisitt `rest_defense` i staff-data.

Baseline-formasjonene `modern_4231`, `modern_433` og `classic_442` forblir tilgjengelige via `start`/`early`. Alle øvrige standard-/advanced-regler over forblir tematiske og låste inntil repoet har en sann History Go-kilde som matcher temaet.

## Neste datasteg

1. Legg til ekte History Go-steder eller samlekilder for Highbury/Arsenal, skotske og tidlige britiske grounds, San Siro/Inter, Maracanã/brasiliansk fotball og Ajax/Amsterdam.
2. Legg til historisk dokumenterte spiller-/trenerobjekter først når de finnes som ordinære katalogdata, for eksempel Chapman, Pozzo, Hidegkuti/Aranycsapat, Herrera, Michels og Cruyff.
3. Etabler runtime-pooler for `football_story` og `football_lexicon_entry` før deres eksisterende refs kan bli reelle opplåsingskilder.
4. Vurder senere eksplisitte badgekrav bare når designet bestemmer hvilket badge-nivå som representerer nok kunnskap; ikke anta dette i data v1.

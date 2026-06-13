# Formasjonsdokumentasjon (læringslaget)

Dette er **dokumentasjons-/læringslaget** i Formation Knowledge Engine (se README-seksjonen *HG Football Manager som læringsspill*). Mens motoren bruker det spillbare datalaget, er disse filene det spilleren leser og lærer av.

To lag per formasjon:

- **Spillbart datalag** – `data/hgFootball/formations.json` (faseformasjoner, roller, `matchEngineEffects`) + `data/hgFootball/formationKnowledge.json` (`strongAgainst`/`weakAgainst`, `requiredConditions`, `tacticalRisks`, `parameterProfile`, `trainingLinks`).
- **Dokumentasjonslag** – filene her: taktisk idé, historisk bakgrunn, styrker/svakheter, rammebetingelser, spillertyper, hvilke motstandere systemet slår/sliter mot, fallgruver, parameterprofil og treningskoblinger.

Hver `doc`-sti i `formationKnowledge.json` peker hit, og `audit:hg-formation-knowledge` advarer hvis en doc-fil mangler.

## Dekkede formasjoner

| Epoke | Formasjon | Fil |
| --- | --- | --- |
| Victoriansk | Pyramiden 2-3-5 | [`pyramid_235.md`](pyramid_235.md) |
| Mellomkrigstid | Metodo 2-3-2-3 | [`metodo_2323.md`](metodo_2323.md) |
| Mellomkrigstid | WM 3-2-2-3 | [`wm_3223.md`](wm_3223.md) |
| Tidlig moderne | Brasiliansk 4-2-4 | [`brazil_424.md`](brazil_424.md) |
| 1960-tall | Catenaccio 5-3-2 | [`catenaccio_532.md`](catenaccio_532.md) |
| 1980–90-tall | Libero 3-5-2 | [`libero_352.md`](libero_352.md) |
| 1970-tall | Totalfotball 4-3-3 | [`total_433.md`](total_433.md) |
| 1980–2000-tall | Klassisk 4-4-2 | [`classic_442.md`](classic_442.md) |
| 2000-tall | Moderne 4-2-3-1 | [`modern_4231.md`](modern_4231.md) |
| Moderne | Press-4-3-3 | [`modern_433.md`](modern_433.md) |
| Moderne | Possession-4-3-3 | [`possession_433.md`](possession_433.md) |
| Moderne | Gegenpressing 4-2-2-2 | [`gegen_4222.md`](gegen_4222.md) |
| Moderne | Conte 3-4-3 | [`conte_343.md`](conte_343.md) |
| Moderne | Posisjonelt 3-2-5 | [`positional_325.md`](positional_325.md) |

De øvrige formasjonene i `formations.json` har spillbart datalag, men venter fortsatt på kunnskaps-/dokumentasjonslag. Auditen lister dem som dekningsgap (advarsel, ikke feil) – laget er additivt og kan utvides formasjon for formasjon.

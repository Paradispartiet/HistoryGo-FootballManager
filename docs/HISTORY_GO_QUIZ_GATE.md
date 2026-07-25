# History Go → Football Manager: quiz-porten

**Besøk gjør spilleren speidet. Quiz gjør spilleren signerbar.**

Football Manager **leser** History Go-progresjon; den skriver aldri til den.

## Verifisert kilde

Kontrakten er lest ut av History Go-repoet (`Paradispartiet/History-Go`), ikke
gjettet:

| Fakta | Kilde i History Go |
|---|---|
| Nøkkel `hg_learning_log_v1` er «eneste sannhet: quiz + observasjoner» | `js/quizzes.js` (`HG_LEARNING_LOG_KEY`) |
| Quiz-hendelser er `quiz_perfect`, `quiz_set_complete`, `quiz_legacy` | `js/learningLog.js` → `isQuizEvent()` |
| Raden bærer stedets id i `parentTargetId` | `js/quizzes.js` (`parentTargetId: tid`), `tests/knowledge-v2-model.test.js` (`parentTargetId: "torggata"`) |
| `quiz_progress` er progresjon **per kategori**, ikke per sted | `js/quizzes.js` (`QUIZ_PROGRESS_KEY // progresjon per kategori`) |

Derfor brukes **`hg_learning_log_v1`** – ikke `quiz_progress` – til
sted-spesifikk gating: bare læringsloggen vet *hvilket sted* quizen gjaldt.

### Radform vi leser

```json
{
  "type": "quiz_set_complete",
  "categoryId": "by",
  "targetId": "<sammensatt set-id>",
  "parentTargetId": "<placeId>",
  "setId": "..."
}
```

Vi leser `parentTargetId` (stedets id), og tolererer i tillegg `targetId` ved å
klippe av sammensatt suffiks (`::` / `__`).

## Regelen i Football Manager

1. **Landslagsarena** (`placeRole` inneholder `national`): gir aldri spillere til
   klubblaget – uavhengig av quiz. De er speidet, og må signeres via et
   klubbanlegg.
2. **Klubbanlegg fra ekte History Go-progresjon**: spillerne er *ventende* til
   quizen på stedet er tatt. UI-en sier det eksplisitt.
3. **Manager-/demosteder og auto-/draft-troppen**: upåvirket av quiz-porten, så
   spillet aldri står fast uten History Go.

## Sikring mot blindvei (viktig)

`getHistoryGoQuizCompletedPlaceIds()` returnerer **`null`** når
`hg_learning_log_v1` mangler eller er ulesbar. Da håndheves porten **ikke**.

Uten dette ville en spiller som har besøkt steder – men kjører en History
Go-versjon uten læringslogg – blitt låst ute av spillere hen umulig kunne låst
opp. Verifisert oppførsel:

| Situasjon | Resultat |
|---|---|
| Besøkt sted, ingen læringslogg | Spillerne er signerbare (porten av) |
| Besøkt sted, logg finnes, quiz tatt annet sted | 0 signerbare + «venter på at du tar quizen» |
| Besøkt sted + quiz tatt der | Spillerne er signerbare |

## Regel ved endring

Endres nøkkelen eller hendelsestypene i History Go, må denne fila og
`HISTORY_GO_QUIZ_EVENT_TYPES` i `src/app.js` oppdateres sammen. History Go sin
egen `README/README.md` sier: «Ikke endre localStorage-keys uten migrering.»

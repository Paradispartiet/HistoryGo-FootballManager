# Football Knowledge Integration

HG Football Manager skal kunne ta inn ny fotballkunnskap uten å lage nye parallelle systemer. Denne standarden gjelder for Fotballboka-importen og for senere notater, bilder, bokstoff og taktisk teori.

## Fast regel

Eksisterende taktikkmotor, kampflyt, spillerroller, treningsflyt og unlock-logikk er source of truth. Ny fotballkunnskap skal først inn som kunnskapslag: forklaring, tooltip, assistentfeedback, kampanalyse, treningsforklaring, rollekrav, docs og boktekst.

Ny kunnskap skal ikke automatisk bli:

- ny taktikkmotor
- nytt separat pressystem
- nytt formasjonsbibliotek som dupliserer eksisterende data
- nye hovedmenyer uten spillkobling
- en ren tekstbank som ikke brukes av spillet

## Kanonisk kilde for denne importen

`Fotballboka.pages` er valgt som kanonisk kilde for football knowledge import.

`Fotballteori.one` skal ikke importeres parallelt i denne runden. Den overlapper tematisk og fungerer som arbeidsmappe/råbank, mens `Fotballboka.pages` er den ryddigere bok-/manusversjonen.

Kildepolicyen ligger i `data/football_book_source_manifest.json`.

## Pipeline

All ny fotballkunnskap skal gå gjennom samme løype:

1. **Source** — registrer hvilken kilde stoffet kommer fra.
2. **Extract** — del stoffet opp i konkrete prinsipper, ikke én lang tekstblob.
3. **Normalize** — skriv hvert prinsipp i samme dataform.
4. **Map** — koble prinsippet til eksisterende weak points, training areas, tags, roller, taktikkvalg eller kampanalyse.
5. **Surface** — bruk det i managerhåndbok, assistentfeedback, kampanalyse, trening, tooltips eller docs.
6. **Validate** — kjør audit og sjekk at ingen ny motor eller døde menyer er laget.

## Dataform

Runtime-prinsipper ligger i `data/football_knowledge_principles.json` og følger eksisterende schema:

- `id`
- `title`
- `category`
- `phase`
- `summary`
- `appliesToWeakPoints`
- `appliesToTrainingAreas`
- `relatedTags`
- `coachAdvice`
- `trainingSession`

Ikke legg ekstra source-felt direkte inn i denne filen før audit/schema er utvidet. Bruk heller en separat manifestfil for kilde og importdekning.

## Mapping-regel

Et prinsipp er ikke ferdig importert før det kan svare på minst ett av disse spørsmålene:

- Hvilken eksisterende svakhet forklarer dette?
- Hvilket eksisterende treningsområde peker det mot?
- Hvilken eksisterende taktisk situasjon gjør det mer forståelig?
- Hvilken assistentfeedback kan det skape?
- Hvilken del av Botballboka eller managerhåndboka kan bruke teksten?

Hvis svaret er uklart, skal stoffet ligge i docs/manus, ikke i gameplay-data.

## Fotballboka-import v1

Denne importen legger til prinsipper fra `Fotballboka.pages` innen:

- historisk utvikling og formasjoner
- WM, catenaccio og totalfotball
- kombinasjonsspill vs. isolert dribling
- teknikk under press
- keeperkommunikasjon
- 1F, 2F og 3F
- presshøyder og risikobalanse
- angrepsmønstre og timing
- kommunikasjon og kampklima
- trening/pedagogikk
- fysiologi
- psykologi
- fotballkultur og spillestil

Disse prinsippene utvider forklaringslaget. De endrer ikke taktikkmotoren.

## Guardrail for fremtidige imports

Når ny teori skal inn, gjør dette først:

```txt
Finn eksisterende mekanikk → map teorien dit → skriv forklaring → valider audit → først deretter vurder om spillet faktisk mangler mekanikk.
```

Ny mekanikk skal bare lages hvis eksisterende motor ikke kan uttrykke prinsippet i det hele tatt. Standardvalget er alltid kunnskapslag, ikke systembygging.

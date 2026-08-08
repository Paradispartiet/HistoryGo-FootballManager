# Football Knowledge Integration

> **Overordnet produktkontrakt:** Les `PRODUCT_PRINCIPLES_CLUB_SIMULATION.md` sammen med denne filen. Fotballkunnskap skal ikke bare forklares ved siden av spillet; der det er naturlig skal den brukes til å bygge **utforskbare og handlingsbaserte simuleringer av faktisk klubbdrift**. Treningsanlegg, medisinsk apparat, analyse, stab og andre klubbfunksjoner skal derfor modelleres etter hva mennesker, rom, utstyr og arbeidsprosesser faktisk gjør — ikke som abstrakte nivåer eller prosentbonuser.

HG Football Manager skal kunne ta inn ny fotballkunnskap uten å lage nye parallelle systemer. Denne standarden gjelder for Fotballboka-importen og for senere notater, bilder, bokstoff og taktisk teori.

## Fast regel

Eksisterende taktikkmotor, kampflyt, spillerroller, treningsflyt og unlock-logikk er source of truth. Ny fotballkunnskap skal først inn som kunnskapslag: forklaring, tooltip, assistentfeedback, kampanalyse, treningsforklaring, rollekrav, docs og boktekst.

Ny kunnskap skal ikke automatisk bli:

- ny taktikkmotor
- nytt separat pressystem
- nytt formasjonsbibliotek som dupliserer eksisterende data
- nye hovedmenyer uten spillkobling
- en ren tekstbank som ikke brukes av spillet

Når kunnskapen beskriver en faktisk arbeidsprosess i klubben, kan den derimot bli en **simulert handling i eksisterende klubbflate**. Eksempel: kunnskap om treningsdesign kan brukes når brukeren setter opp areal, spillertall, regler og coachingpunkter i en øvelse; kunnskap om skadehåndtering kan brukes når det medisinske apparatet vurderer symptomer, belastning, rehabilitering og retur til spill.

## Kanonisk kilde for denne importen

`Fotballboka.pages` er valgt som kanonisk kilde for football knowledge import.

`Fotballteori.one` skal ikke importeres parallelt i denne runden. Den overlapper tematisk og fungerer som arbeidsmappe/råbank, mens `Fotballboka.pages` er den ryddigere bok-/manusversjonen.

Kildepolicyen ligger i `data/football_book_source_manifest.json`.

## Pipeline

All ny fotballkunnskap skal gå gjennom samme løype:

1. **Source** — registrer hvilken kilde stoffet kommer fra.
2. **Extract** — del stoffet opp i konkrete prinsipper, ikke én lang tekstblob.
3. **Normalize** — skriv hvert prinsipp i samme dataform.
4. **Map** — koble prinsippet til eksisterende weak points, training areas, tags, roller, taktikkvalg, kampanalyse eller en dokumentert klubbprosess.
5. **Surface** — bruk det i managerhåndbok, assistentfeedback, kampanalyse, trening, tooltips, klubbrom eller docs.
6. **Simulate when appropriate** — dersom kunnskapen beskriver noe brukeren faktisk kan gjøre eller observere i en klubb, vurder en handlingsbasert simulering fremfor ren tekst.
7. **Validate** — kjør audit og sjekk at ingen unødvendig parallellmotor eller døde menyer er laget.

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
- Hvilken konkret arbeidsprosess i klubben kan det forklare eller simulere?
- Hvilken del av Fotballboka eller managerhåndboka kan bruke teksten?

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

Disse prinsippene utvider forklaringslaget. De endrer ikke taktikkmotoren uten at eksisterende motor faktisk mangler en nødvendig mekanikk.

## Guardrail for fremtidige imports

Når ny teori skal inn, gjør dette først:

```txt
Finn eksisterende mekanikk eller klubbprosess
→ map teorien dit
→ gjør kunnskapen forståelig gjennom forklaring eller handling
→ valider audit
→ først deretter vurder om spillet faktisk mangler mekanikk
```

Ny mekanikk skal bare lages hvis eksisterende motor eller klubbflate ikke kan uttrykke prinsippet i det hele tatt. Standardvalget er kunnskapslag og læringssimulering, ikke systembygging for systembyggingens skyld.

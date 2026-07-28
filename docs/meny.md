# Menyen

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Samme krav gjelder huset spilleren står i: **du skal kunne lære deg det.** En
meny som sender deg et annet sted enn navnet sitt sier, er ikke et smaksspørsmål
— det er en blindvei med innhold i.

## Hva som var galt

Tre av sju hovedfaner løy om hvor de sendte deg:

| Etikett | Åpnet faktisk |
|---|---|
| Stab | Assistentråd (innboksen) |
| Klubb | Trening |
| Analyse | Scenarioer |

Samtidig lå «Stab» og «Klubb» **også** i en nedtrekksmeny bak «Kontor», der de
pekte på *helt andre* flater (`admin` og `market`). To knapper med samme navn og
ulikt mål: da hjelper det ikke at hver enkelt flate finnes, for du kan ikke
bygge en modell av huset.

## Hovedmenyen: manageruka

Menyen følger nå rekkefølgen en manageruke faktisk går i:

```
Kontor → Trening → Taktikk → Kamp → Analyse → Statistikk
```

- **Kontor** — der du sitter. Ikke én lang side, men **åtte flater i
  underfaner** (se under).
- **Trening** — ukas treningsprogram og fotballkunnskapen som hører til laget.
- **Taktikk** — formasjon, kampplan, brikker, roller, benk. Formasjons­biblioteket
  er et oppslagsverk du åpner herfra.
- **Kamp** — kampdagen: brief, grep, klokke, live stilling.
- **Analyse** — ettertanken: kamprapporten, rollebytter å vurdere, svake punkter,
  og inngangen til den dype rapporten.
- **Statistikk** — tallene: ligatabell, terminliste og hvem som leverer (mål,
  målgivende, kamper). Se `docs/statistikk.md`.

**Speiding** ligger på Kontor, ikke som egen fane — det er jo det du gjør fra
kontoret. Det samme gjelder **Stab**. Nedtrekksmenyen som duplikerte navnene er
borte.

## Kontor har underfaner

Kontoret var en scrollevegg: managerportalen, en rutenett-vegg med seks
avdelingskort, klubbuke-stripa og off-pitch-signalene under hverandre — og
avdelingene nådde du bare ved å scrolle ned til kortene og trykke.

Nå er kontorarbeidet delt i flater med hver sin jobb, i en underfanestripe rett
under hovedmenyen:

```
Oversikt · Assistentråd · Speiding · Klubbutvikling · Stab & drift · Fasiliteter · Klubbrom · Styret
```

| Underfane | Jobb |
|---|---|
| **Oversikt** | hva nå: neste kamp, ukas beslutning, klubbuka, signalene |
| **Assistentråd** | innboksen — signalene du leser før du velger trening |
| **Speiding** | samlingen din: spillere, stab og steder fra History Go |
| **Klubbutvikling** | kjeden fra sted til lagklasse (se under) |
| **Stab & drift** | stabskontoret og kampklar tropp |
| **Fasiliteter** | anleggene — merket «Senere» og deaktivert |
| **Klubbrom** | fans, sponsorer, omdømme |
| **Styret** | styretillit og forventninger |

Rekkefølgen er kontorets egen logikk: *hva nå → signaler → hente inn → utvikle →
apparatet → anlegg → kommersielt → eierne.*

Stripa vises **bare** når du står på en kontorflate. Kortveggen er borte —
underfanene gjør den jobben bedre, og med ett trykk i stedet for to.

### En felle i app-rammen, nå vaktet

`body` er et grid med **eksplisitt tildelte rader**. Underfanestripa er et
`<nav>`, og regelen som ga hovedmenyen rad 2 var en bar `body > nav` — så stripa
arvet samme rad og ble tegnet oppå hovedmenyen. Skjermområdet forsvant.

Det er andre gang samme felle slår til (første gang flyttet en skjult modus-linje
alle radene). `audit:dead-ends` steg 16 krever nå at antall rader stemmer med
antall ramme-deler, at ingen selektor treffer to av dem, og at hver meny har sin
egen rad.

## Klubbutvikling: én kjede, ikke fire ting

Popupen het «Ekspertise · Trening · Badges · Lagklasse» og var seks flate lister
etter hverandre. Den så ut som fire urelaterte systemer stablet i én skuff.

Det er den ikke — det er **ett kjede**, det samme som står i CLAUDE.md:

```
Sted → Person → Ekspertise → Utviklingsprogram → Badge → Lagklasse
```

Flata viser nå kjeden, og hvert ledd er nummerert som steget det er. Det som
manglet var ikke innhold, men sammenhengen.

Ett navn måtte også bort: «Treningsprogrammer» het det samme som lagets
treningsuke, men er noe helt annet — flerukers progresjoner som tjener badges.
De heter nå **utviklingsprogrammer**, og «badge-uke» heter **utviklingsuke**, så
ordet *trening* bare betyr én ting i appen: det laget gjør denne uka.

«Nullstill klubbutvikling» sto midt i flata. Det er verktøy, ikke spill, og
ligger nå i Innstillinger sammen med de andre nullstillingene.

### Avdelinger markerer fanen sin

Kontorets avdelinger har ingen egen fane. Uten hjelp sto derfor hele menyen
umarkert når du var inne i Speiding eller Stabskontor — innhold på skjermen, men
ingenting som sa hvor du var. `data-tab-parent` på seksjonen sier hvilken fane
som eier flaten, og `highlightActiveTab()` i `app.js` markerer den.

## Modusene eier hver sin meny

Hver nav-fane bærer `data-nav-modes` med modiene den hører hjemme i.
`applyModeScopedNav(mode)` (kalt fra `renderModeIsolation`) viser og skjuler dem.

| Modus | Meny |
|---|---|
| Ligaspill | Kontor · Trening · Taktikk · Kamp · Analyse · Statistikk |
| Landslag | Kontor · Trening · Taktikk · Kamp · Analyse · Statistikk |
| Scenario | + Scenario |
| Fotballvitenskap | Fotballvitenskap (alene) |

**Scenarioer er en egen modus fra forsiden**, ikke en fane inne i ligaspillet.
Den lå tidligere bak etiketten «Analyse», som både skjulte scenarioene og stjal
navnet fra analysen.

`data-nav-section-modes` skiller «hvor fanen vises» fra «hvor flaten er lovlig»:
formasjonsbiblioteket har bare fane i Fotballvitenskap, men åpnes som oppslagsverk
fra Taktikk i spillet — da skal du få bli der, med «← Tilbake til Taktikk».

## Fotballvitenskap

Het tidligere **Treningsrom** og sendte deg rett inn i lagets treningsuke —
altså inn i spillet den påsto å stå utenfor. Nå er den det den sier den er: et
sted å lære fotball, uavhengig av spillet. Den åpner formasjonsbiblioteket, har
sin egen ene fane, og «Neste handling»-stripa i bunnen skjules — en læremodul
skal ikke mase om å skaffe spillbar tropp.

Modusen beholder id-en `training` i `src/football-mode-sessions.js`, slik at
lagrede konvolutter fortsatt leses. Det er bare et lagringsnavn; ingenting i
UI-et heter Treningsrom lenger.

## Flatene ruller, de krymper ikke

En feil av samme familie som den kollapsede app-rammen, ett nivå ned:

`.app-shell > .tab-section` er `height: 100%` + `display: flex; flex-direction:
column` + `overflow-y: auto`. I en kolonne-flexboks med fast høyde har hvert barn
`flex-shrink: 1` som standard — så når innholdet var høyere enn skjermen, ble
panelene **klemt sammen** i stedet for at flata rullet. Verst på avdelingene:
`.dept-hero` har `overflow: hidden` og falt til 38 piksler, bare padding. Igjen
sto en tynn stripe med en eyebrow; overskrift, ingress, tellere og knapper var
borte.

Ingen feilmelding. Ingenting manglet i DOM-en — elementene lå der, med riktige
mål, utenfor en skjult overflow. Bare et blikk på skjermen avslørte det.

Rettelsen er én regel: `.app-shell > .tab-section > * { flex: 0 0 auto; }`.

## Vakter

`npm run audit:dead-ends` steg 17 låser menykontrakten:

- hovedmenyen i ligaspill er nøyaktig Kontor → Trening → Taktikk → Kamp → Analyse → Statistikk
- ingen navigasjonsetikett finnes to steder med ulikt mål
- hver nav-fane bærer `data-nav-modes`, og `app.js` håndhever dem
- Scenario-fanen finnes bare i scenariomodus; Scenarioer er et modusvalg på forsiden
- Fotballvitenskap-fanen finnes bare i sin egen modus, heter ikke Treningsrom,
  og åpner formasjonsbiblioteket — ikke Trening
- Kontorets avdelinger inneholder speiding, stab, klubb og styret
- den duplikate kontor-nedtrekksmenyen finnes ikke

Steg 16 dekker i tillegg at faneflatas barn ikke krymper.

Auditen ser også på **avdelingskortene**, ikke bare `.nav-tab`. Kortene er nå den
ekte veien inn til avdelingene; så lenge vakta bare kikket på hovedmenyen, kunne
en «Senere»-flate stå åpen som et fullt klikkbart kort.

## Kontor er kontoret, ikke et dashbord

To bokser gjentok tall som allerede sto i managerportalen, klubbuka og footeren,
og skjøv de faktiske handlingene nedover:

- **«Klubben din»** — klubbnavn, manager, liga, tabellplassering, styremål og
  «neste managergrep». Identiteten hører i **toppen**, over alt du gjør; den skal
  ikke presenteres på nytt hver gang du kommer innom Kontor. Plassering og
  styrets forventning hører på **Statistikk**, ved siden av tabellen de leses av.
- **«Spillmodus»** — hvilken modus du er i, pluss sju statuslinjer. Modusen står
  allerede i modusstripa når den er noe annet enn ligaspill, og modusbyttet
  ligger i **Innstillinger**, der teksten alltid har lovet det.

**Klubbuka** ble stående — men fasene er nå knapper. Ukerytmen fortalte hvor du
var i uka uten å ta deg dit; et skilt uten dør. Hver fase åpner flaten der
arbeidet faktisk gjøres:

| Fase | Åpner |
|---|---|
| Analyse | Analyse |
| Innboks | Assistentråd |
| Trening | Trening |
| Kampplan | Taktikk |
| Kampdag | Kamp |
| Oppsummering | Statistikk |

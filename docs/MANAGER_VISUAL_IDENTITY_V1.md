# Manager Visual Identity v1 — Pass 6

## Formål

Pass 6 er den visuelle delen av **Kontor + Lag redesign v1**. Det endrer ikke spillmotor, save-state eller progresjon. Målet er at HG Football Manager skal oppleves som en fotballklubb og en serie konkrete arbeidssteder — ikke som ett langt dashboard av like mørke kort.

Canonical UI-kontrakt:

> Vis den faktiske situasjonen først. Vis bare informasjon som er relevant nå. Vis valgte verdier på hovedflaten. Vis alternativer når brukeren ber om å endre noe. La kalenderen eie tiden og progresjonen. La klubbens mennesker og rom forklare fotballarbeidet. Ikke lag et dashboard når vi kan simulere situasjonen.

## Tre visuelle nivåer

### 1. Hovedscene

Dette er det brukeren faktisk arbeider i:

- Kalenderens arbeidsdag og tidslinje
- klubborganisasjonen og rommene
- taktikkbanen
- speiderlisten
- kampdagen
- tabell/terminliste/statistikk

Hovedscenen skal være den klart største og sterkeste formen på skjermen. Den trenger ikke en ekstra kort-ramme rundt seg.

### 2. Inspektør

Sekundær arbeidsinformasjon som forklarer eller endrer hovedscenen:

- valgt spiller og rolle
- assistent-/apparatforklaring
- motstander
- romdrawer
- valgdrawer

Inspektøren kan skilles med én kant, et mørkere lerret eller en drawer. Den skal ikke konkurrere med hovedscenen.

### 3. Sekundær informasjon

Tall, historikk, detaljer, metadata og forklaringer vises primært som:

- tabellrader
- tidslinjer
- statuslinjer
- definisjonslister
- kompakte tekstrader

Ikke som et nytt kort per måling.

## Klubbidentitet

Eksisterende `manager-club-identity.js` er fortsatt sannhetskilden for HGFM-presentasjonsfarger og det egenproduserte HGFM-skjoldet. Dette laget påvirker ikke motor eller data.

Klubbfargen brukes som:

- aktiv navigasjonsmarkør
- scenelinje
- fokusmarkør
- valgt rad/valgt tilstand
- subtil bakgrunnsglød
- identitet i klubbheaderen

Klubbfargen skal **ikke** brukes som heldekkende bakgrunn eller som tekstfarge der kontrast blir usikker. Vi bruker ikke offisielle klubbemblemer eller påstår at HGFM-fargetonene er offisielle merkevareverdier.

## De fem hovedområdene skal se forskjellige ut

### Kontor

Karakter: kalender, arbeidsdag og tidslinje.

- kronologisk leseretning
- tid som tydelig venstre kolonne
- klubb-/områdeaksent på aktiv dag og hendelser som krever oppmerksomhet
- færre panelkanter

### Lag

Karakter: feltarbeid og taktisk arbeidsrom.

- banen er hovedobjektet
- inspektør som sidefelt, ikke parallelt dashboard
- spiller-/benklister som arbeidsrader
- grønn fotballtone blandes forsiktig med klubbidentiteten

### Speiding

Karakter: arbeidsliste og observasjon.

- tabell/listelesing prioriteres
- valgt klubb/rad markeres uten å bli et kortgalleri
- klubbfarge + dempet blågrå arbeidskarakter

### Kamp

Karakter: kampdag/stadion.

- sterkere kontrast enn resten av appen
- kampflaten får egen scene og tydelig toppmarkør
- klubbidentiteten er sterkest på hjemmelaget
- kampflyt presenteres som felt/statuslinje, ikke kortstabel

### Stats

Karakter: dokument, tabell og arkiv.

- tabulære tall
- tabell- og terminlister prioriteres framfor metrikkskort
- managerklubbens rad markeres med klubbidentiteten

## Navigasjon

Ligaspill har fem stabile hovedområder:

**Kontor · Lag · Speiding · Kamp · Stats**

Gridet skal bruke det faktiske antallet synlige hovedområder. På 390 px skal navnene fortsatt være lesbare; vi skal ikke løse plassproblem ved å redusere dem til mikroskrift eller ellipser.

Underfaner er lokal innholdsfortegnelse. De skal derfor presenteres som en enkel linje/underline-kontroll, ikke som en ny rad av like kort.

## Typografi

- sceneoverskrifter har et tydelig komprimert/displaypreg og større størrelse
- `h2` skal visuelt dominere sekundærtekst
- `h3` er inspektør-/delseksjonsnivå
- eyebrow brukes som liten orientering, ikke som hovedinformasjon
- metadata og tabelltall skal være kompakte og stabile

Ingen ekstern fontavhengighet innføres. Systemfont-stack brukes som fallback.

## Teknisk grense

`manager-visual-identity-v1.js` gjør bare tre ting:

1. registrerer hvilken eksisterende `[data-tab-section]` som er synlig;
2. setter `data-manager-area`, `data-manager-surface` og `data-manager-scene-kind` på `html/body`;
3. setter antall synlige hovedfaner som CSS-token.

Modulen:

- skriver ikke `localStorage` eller `sessionStorage`;
- oppretter ingen ny motor;
- gjør ingen nettverkskall;
- endrer ikke Club Week, kamp, trening, rekruttering eller save-state.

## Mobil/tablet-kontrakt

Pass 6 må permanent verifisere:

- fem lesbare hovedfaner ved 390 px i ligaspill;
- ingen horisontal global overflow ved 390, 768 eller 1280 px;
- drawers/bottom sheets beholder tidligere kontrakter;
- hovedscenen forblir visuelt sterkere enn sekundær informasjon;
- WCAG A/AA har ingen alvorlige eller kritiske brudd.

## Avgrensning mot Pass 7

Pass 6 skal ikke slette legacy-CSS eller forkastet runtime bare fordi det visuelle laget ikke lenger viser det. Permanent kode- og save-opprydding gjøres i **Pass 7**, etter at de nye flatene er stabile.

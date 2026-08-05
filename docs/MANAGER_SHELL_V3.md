# Manager Shell v3

Manager Shell v3 gjør HG Football Manager til et tydelig managerspill uten å
endre motorene eller den lagrede spilltilstanden.

## Hovedstruktur

Spillet har fem stabile hovedområder:

1. **Kontor** – oversikt, assistentråd og den ene autoritative neste handlingen.
2. **Lag** – oppstilling, tropp/benk, trening og systemkunnskap.
3. **Kamp** – kampdag og kampanalyse.
4. **Sesong** – tabell, terminliste, spillerstatistikk og sesongdom.
5. **Klubb / Mer** – styret, speiding, klubbutvikling og stab/drift.

På mobil ligger de fem områdene i en fast bunnmeny. Den siste inngangen heter
«Mer» i mobilpresentasjonen, men åpner Klubb-området. Uferdig økonomi, marked og
fasiliteter er skjult fra navigasjonen til de har en faktisk spillfunksjon.

## Autoritativ handling

`football-next-action.js` er fortsatt kilden til neste handling. Skallet viser
én primær handling i den faste footeren. Den tidligere «Neste fase»-knappen,
portalduplikatet og onboardingens ekstra primærknapp er fjernet. Portal- og
statusflater forklarer tilstanden, men utfører ikke samme neste handling.

## Laguttak

Oppstilling er en direkte arbeidsflate:

- banen, spillerkortene, rollevalgene og benken vises sammen;
- en spiller settes inn ved å velge plass og trykke spillerkortet;
- rollen velges med synlige rolle-chips;
- et benkekort setter spilleren inn på valgt plass;
- en spillerbrikke som slippes over en annen bytter de to spillerne;
- en spillerbrikke som slippes på ledig gress beholder den frie plasseringen;
- samlet `overall` og numerisk lagfit-sirkel vises ikke som konkurrerende
  spillsannheter;
- de gamle spiller- og rolle-selectene er fjernet; spillerkort og rolleknapper
  er den eneste uttaksflaten.

Motorene for availability, roller, rollefit, relasjoner, formasjon og historisk
fit er uendret.

## Trening

Trening eies av Lag. Program, ukefokus og individuell trening ligger inline i
én arbeidsflate, med nøyaktig ett utvidet arbeidssteg om gangen. Den eksisterende
planmotoren beholder sin firetrinnsrekkefølge og peker nå til inline-stegene i
stedet for tre modaler. Svake sider, managerinnsikt og fotballkunnskap er fortsatt
fordypningsflater.

## Klubbidentitet og hierarki

Klubb-ID, navn og bane fra eksisterende klubbdata driver et generert klubbskjold,
en stabil klubbfarge og en stadionlinje i headeren. Skjoldet er en
presentasjonsidentitet, ikke en påstand om å være klubbens offisielle logo.
Antallet generiske `.panel`-containere i `index.html` er redusert fra 59 til 27;
de viktigste flatene er nå scener og skillelinjer i stedet for like kortbokser.

## Kampdag

Kampdag bruker hele arbeidsbredden. Den eksisterende kampmotoren beholder
kampklokke, minuttlogg, managergrep, planbytter, motstanderjusteringer og
innbyttere. Presentasjonsmodulen bygger i tillegg et kvalitativt kampbilde med
egen tredel, midtbane, siste tredel og momentum basert på hendelsene som er
avdekket så langt. Visualiseringen beregner ikke kampresultatet.

## Kodegrenser

- `src/ui/manager-shell-elements.js` eier header- og footer-markuppen.
- `src/ui/manager-club-identity.js` eier klubbens visuelle identitet.
- `src/ui/training-workspace-view.js` eier accordion-presentasjonen i trening.
- `src/ui/manager-shell-view.js` inneholder kampdagens rene presentasjonsavledning.
- `src/ui/manager-shell-v3.css` og `manager-shell-foundation.css` eier skallet,
  identiteten og responsive arbeidsflater.
- `src/app.js` binder eksisterende state og motorresultater til DOM-en.
- `style.css` beholder eldre komponentstiler til videre, kontrollert opprydding.

## Regresjonsvern

De eksisterende auditene og simuleringene dekker motor- og flytkontraktene.
`tests/browser/manager-shell-v3.spec.js` låser fem visuelle nettleserscener:

1. fem hovedområder;
2. bane, direkte laguttak og benk innenfor arbeidsflaten;
3. inline trening uten kjernemodaler;
4. fullbredde kampdag;
5. fast mobilmeny uten horisontal lekkasje.

Testpakken kjører ved 390, 768 og 1280 piksler, kontrollerer horisontal overflow,
at primærhandlingen er synlig uten scrolling, WCAG 2 A/AA med axe, modalens
tastatur-/fokusfelle og fem screenshot-baserte differansetester.

CI installerer Chromium og kjører `npm run test:browser` etter hele den
eksisterende verifikasjonssuiten.

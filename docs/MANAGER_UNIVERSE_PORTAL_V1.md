# Football Manager – Universe Portal v1

## Formål

Første implementasjon av den godkjente mørke/lilla designretningen: **Hjem og Innboks** i eget responsivt grensesnitt, pluss felles visuell overflate for de øvrige managersidene. Dette er en første produksjonsbolk, ikke en påstand om at alle mockup-detaljer er ferdig implementert.

## Autoritativ kilde og overgang til gamle arbeidsflater

- Portalens klubbnavn, uke og neste motstander kommer fra den eksisterende spill- og kalenderpresentasjonen.
- Meldinger leses fra `createClubCommunicationTimeline` via samme `hgfm:request-club-communication-context` som managerkalenderen bruker.
- «Les og svar i kalenderen» åpner **eksakt** melding via `#managerCalendarDays` og `#managerCalendarTimeline`. Bare originalkalenderen eier lesekvittering, svarvalg og konsekvens.
- Hjem- og Innboks-knappene ligger i headeren ved siden av eksisterende manager-navigasjon. De fem hovedområdene og kalenderens progresjonsmotor er uendret.
- Spillerens save-data, tropp, kampmotor, fasevalg, klubbutvikling og økonomi endres ikke av denne visuelle bolken.

## Mobil og iPad

- Desktop/liggende iPad: panelbasert portal og tredelt innboks.
- Stående iPad: to kolonner i oversikten og komprimert innboks.
- Telefon: én kolonne med store handlinger, filtre og kort uten horisontal sidelekkasje.
- Redusert bevegelse, tastaturfokus og minimum 44px berøringsmål på handlingene.

## Test

- `tests/browser/manager-universe-portal-v1.spec.js`: portaldata, navigation til taktikk, riktig canonical meldings-ID, mobil og uendret femområdes navigasjon.
- Eksisterende CI må fortsette å være grønn før merge.
- Krever visuell iPad Safari-kontroll før publiseringsgodkjenning.

## Videre visuell leveranse

Neste bolk: mer presis tropp- og taktikkpresentasjon, så kampdag, speiding, klubbdrift, økonomi og ansatte. Alle tall og funksjoner skal fortsatt komme fra eksisterende sannhetskilder, ikke fra mockup-data.

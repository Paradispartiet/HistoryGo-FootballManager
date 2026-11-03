# Football Manager – Hjem som startskjerm v2

## Omfang

Dette er en avgrenset navigasjonsforbedring av det publiserte designet fra PR #530. **Hjem** blir første synlige spillside for en aktiv ligalagring. Kalenderen blir fortsatt initialisert av den eksisterende manager-uke-modulen og forblir den eneste kilden for dato, fase, hendelser, lesestatus, svar og progresjon.

### Navigasjon

- Når ligaspillet starter, oppretter Kalender den aktuelle manageruka som før. Etter initialiseringen sendes `hgfm:league-calendar-startup-ready` (kun en UI-hendelse), og Hjem overtar *visningen*.
- Hjem-knappen åpner portalen. Innboks-knappen åpner de faktiske klubbmailene. Klikk på **Kontor** åpner fortsatt Kalender. Les/svar går via den kanoniske kalenderdraweren.
- Ingen nye data eller `localStorage`-nøkler. Ingen automatisk ukeavansering eller endring i startellever.
- Et brukerinitiert navigasjonsvalg under oppstart får forrang; den forsinkede startskjermhendelsen skal ikke flytte brukeren tilbake til Hjem.
- Uten aktiv ligalagring forblir førstegangsvelkomst og de andre spillmodiene uendret.

### iPad og mobil

- Hjem og Innboks testes i 768×1024, 834×1194 og 1194×834, inkludert minimum 44 px trykkmål og fravær av global horisontal overflow.
- `manager-portal-landing-ipad-v1.spec.js` kjøres i Chromium og i WebKit-prosjektet sammen med taktikkregresjonen.
- WebKit-automatiseringen er ikke det samme som fysisk test i Safari på iPad. Visuell og berøringsmessig sluttkontroll på faktisk iPad gjenstår.

## Testport

- Kontor åpner alltid Kalender, og manageruka har den samme dagen etter turen Hjem → Kalender → Hjem.
- Innboks viser klubbens reelle meldinger, åpner eksakt melding via kalenderdraweren og endrer ikke uke/fase ved visningsnavigasjon.
- Tidligere kalender-, kamp-, taktikk- og navigasjonstester må være grønne før merge.

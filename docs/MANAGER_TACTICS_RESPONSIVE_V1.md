# Responsivt taktikkbrett – PR #529

## Autoritet og redigering

- `#lineupSlots` er fortsatt den **eneste spillbare/redigerbare banen**. Spilleruttak, bytter, lagring og profilhandlinger forblir hos eksisterende `app.js`.
- Benken flyttes som original DOM-node under tavlene, uten kopiering av knapper eller hendelseslyttere.
- Startelleverlisten leser navn, posisjon, rolle og kvalitativ fit fra originalens spillerbrikker.
- Ikke legg til overall-rating eller oppdiktede stjerner.

## Fasevisning fra ekte kildedata

- `src/ui/manager-tactics-phase-projection.js` leser formasjonen gjennom de eksisterende feltene `inPossessionShape` og `outOfPossessionShape` i `data/hgFootball/formations.json`.
- Fasepanelet kan vise **Med ball** og **Uten ball** fra valgt system. Eksempel: `modern_4231` er 2-4-3-1 med ball og 4-4-1-1 uten ball. Feltverdiene kommer fra formasjonsbiblioteket, ikke hardkodede UI-antakelser.
- Spillerne fordeles til fasestrukturens slot-koordinater gjennom en deterministisk minimumsavstandsfordeling. Dette er en **illustrasjon av faseformen**, ikke spillernes faktiske løp, nye individuelle rolleordre eller utfall av kampmotoren. Det opplyses direkte i grensesnittet.
- Fasediagrammet er alltid skrivebeskyttet. Originalens laguttak, profil, kampplan, formasjon og save-state endres ikke av å bytte diagram.
- Hvis data mangler eller faseformen ikke kan tegnes, viser vi eksplisitt grunnformasjonen som fallback, ikke en oppdiktet fase. Ingen ny lagringsnøkkel eller parallell taktikkmotor.
- Det historiske biblioteket er fortsatt kilden til faseformasjonene; kampmotoren har egne eksisterende mekanismer og blir ikke endret her.

## Spillerbrikker og drakter

- Draktsilhuetter tegnes i CSS over eksisterende spillerbrikker, også på den skrivebeskyttede fasebanen.
- Keeperen får egen gul farge, og ledige plasser nøytral grå. Øvrige farger er generiske, ikke en påstand om klubbens virkelige drakt.
- Ingen nye spillerbilder, falske spillernumre, lagret drakttilstand eller endringer i hvordan brukeren flytter spillerne.

## Responsiv flyt

- Liggende iPad og desktop, fra 980 px: tre paneler — spillbart laguttak, fasevisning, startellever — med original benk nedenfor.
- Stående mobil: store faner for **Laguttak**, **Taktiske faser** og **Spillere**. Inne på fasepanelet velges **Med ball** eller **Uten ball**.
- Liggende mobil, fra 640 px: bane og spillerliste side om side, med fasepanelet som valgbar bane.
- Ingen tvungen skjermorientering, skalering som gjør skriften uleselig, eller duplisering av originalt laguttak.

## Verifikasjon før merge

- Browser: `tests/browser/manager-tactics-responsive-v1.spec.js`, inkludert autentiske faseverdier og bytte av formasjon.
- Kjør eksisterende lineup-, drawer-, manager-shell- og CI-regresjoner.
- Kontroller visuelt i faktisk iPad Safari, stående og liggende, og mobil i begge retninger.
- Behold PR som utkast til testene og visuell kontroll er godkjent.

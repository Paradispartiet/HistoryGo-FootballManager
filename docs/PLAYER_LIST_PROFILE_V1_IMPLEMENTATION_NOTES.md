# Spillerliste og spillerprofil v1 — implementation notes

Dette dokumentet er en kort implementasjonslås for UI-passet.

- Lag har én kompakt statuslinje, ikke et eget navigerende kommandopanel.
- `Forslag til neste steg` er fortsatt eneste progresjonsveiviser.
- Tropp er en tett, filtrerbar liste for sammenligning.
- Spillerprofil er en separat drill-down for én spiller.
- Profilklikk endrer aldri laguttaket; laguttak krever eksplisitt `Velg`/`Sett inn`.
- Eksisterende spiller-, ferdighets-, condition-, rollefortrolighets- og statistikkdata gjenbrukes.
- Ingen Overall-kolonne eller ny samlet spillerverdi introduseres.
- Mobil bryter tabellen til kompakte rader og gjør profilen fullskjerm.

Permanent verifikasjon eies av eksisterende `audit:manager-squad-tactics-scene-v2`, simuleringen og browser-testen som er oppdatert til den nye kontrakten.

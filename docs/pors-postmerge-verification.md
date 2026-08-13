# Pors · post-merge-verifisering

Pors-passet ble squash-merget i PR #211 med merge-SHA `ef1bfd579f684ff6a0e2fc19b3fc8f8a97d3b64a`.

Data-, motor-, flyt- og Pages-portene var grønne. Den siste PR-kjøringen hadde likevel **143 beståtte og 3 feilende nettlesertester**. Alle tre feilene lå i tropps- og spillerprofilflaten.

## Rotårsak

Troppslisten kunne rendres før den autoritative `squadPlayerIds`-tilstanden var hydrert. Når troppen senere ble oppdatert, observeren oppdaterte bare den kompakte lagstatusen. Tabellen kunne derfor beholde en foreldet fallback-liste, mens søk og profiloppslag allerede leste den nye troppen.

## Retting

- Sesjonscachen erstattes når autoritativ tropp finnes.
- Global fallback tømmes når en lokal starttropp er tilgjengelig.
- Både status og spillerliste rendres på nytt ved troppshydrering.
- En allerede synlig spillerad kan åpne profilen read-only selv om hydrering skjer i samme øyeblikk.
- Laguttak, rekruttering, klubbmedlemskap og spillerdata endres ikke.

## Låst Pors-kontrakt

- 63 eksplisitte Pors-tilknytninger.
- 58 nye `pors_stadion`-profiler.
- Fem canonical krysskoblinger uten omskriving av eldre `sourcePlaceIds`.
- 63 duplikatfrie stadion-unlocks.
- P1-nevneren forblir 936/936.

Kontrakten kontrolleres av de eksisterende klubb-, attributt-, tropps- og P1-auditene sammen med nettleserregresjonen i `manager-squad-tactics-scene-v2.spec.js`.

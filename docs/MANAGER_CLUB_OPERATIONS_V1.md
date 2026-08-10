# Manager Club Operations v1

## Canonical struktur

Klubbdrift er en del av **Kontor**, mens Speiding er et eget hovedområde:

**Kontor · Lag · Speiding · Kamp · Stats**

Kontor åpner Kalender. `Kontor → Klubben` åpner den utforskbare klubborganisasjonen. Kalenderen eier tid og neste arbeidssteg; Klubben eier mennesker, rom og varige fagområder.

## Levende klubbrom

- Trenerteam og Administrasjon bruker den eksisterende stabs- og troppsstate.
- Treningsanlegg peker til det faktiske treningsarbeidet uten nivåer eller oppgraderingsbonus.
- Medisinsk apparat bruker eksisterende condition, skade, belastning og individuell oppfølging.
- Analyse bruker terminliste, motstanderprofil, taktikk og kampanalyse.
- Styret bruker eksisterende Club Week-signaler.
- Stadion og hjemmebane bruker canonical klubbdata.
- Klubbutvikling bruker den eksisterende History Go-progresjonen.

## Fysisk fjernet runtime

Fasilitetsnivåer, fiktiv klubbøkonomi, spillerkontrakter, overgangsmarked og det gamle skjulte klubb-dashboardet er ikke parallelle flater. Markup, CSS, presentasjonsmoduler, motorintegrasjoner og skjulte bonuser er fysisk slettet.

Save-migreringen for `facilities`, `clubEconomy` og `transferMarket` beholdes for eldre lagringer. Den er kompatibilitet, ikke et levende spillsystem.

## Grenser

- History Go er autoritativ kilde til spilleroppdagelse.
- Ingen sponsoravtaler eller fiktive overgangsregler opprettes.
- Ingen nye localStorage-nøkler opprettes av klubborganisasjonen.
- Ingen ny klubb-, uke-, trening-, condition- eller kampmotor opprettes.
- Reelle klubbpåstander om anlegg og praksis skal komme fra dokumenterte data.

## Regresjonsvern

`audit:manager-club-operations-v1`, `audit:manager-club-organization-v1`, `sim:manager-club-organization-v1` og klubborganisasjonens Playwright-tester krever canonical navigasjon, fysisk fravær av legacy-flatene, mobil layout og WCAG A/AA uten alvorlige feil.

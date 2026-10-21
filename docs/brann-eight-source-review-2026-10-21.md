# Brann: kildegrense for åtte åpne ferdighetsprofiler (21.10.2026)

Mål: avslutte kildesøk uten å produsere kunstige egenskaper. Av 47 eksklusive Brann-profiler er nå 40 dokumenterte etter Alexanders kildebolk i PR #460; 2 DELVIS og 5 THIN-SOURCE. Posisjon, klubbstatus, kamptall og målstatistikk er ikke i seg selv et gyldig belegg for varige motorattributter.

| Spiller | Verifisert kildemateriale og faglig begrensning |
| --- | --- |
| Alexander Nagelsett Olsen | [SNL](https://snl.no/Alexander_Nagelsett_Olsen) bekrefter identitet og historikk. [Den kildehenvisende biografien](https://no.wikipedia.org/wiki/Alexander_Olsen) beskriver konkret driblekunst og viser til eldre fagvurderinger. PR #460 har derfor gitt ham kun `dribbling` som kildebelagt styrke. Originalverkene er ikke direkte kontrollert, så sikkerheten er begrenset til sekundærvurderingen. |
| Oddvar Hansen | [Branns offisielle spillerhistorie](https://historie.brann.no/spillere/oddvar-hansen) og [æresmedlemmer](https://historie.brann.no/aeresmedlemmer/) dokumenterer karrieren, ikke konkrete styrketoken. |
| Bjarne Johnsen | [Branns æresmedlemmer](https://historie.brann.no/aeresmedlemmer/) dokumenterer NM-titler og landskamper, ikke avslutningsteknikk. |
| Roald Paulsen | [Branns 1957-tekst](https://historie.brann.no/sesonger/1957/) omtaler mange scoringer, men er ikke et presist belegg for `finishing`. |
| Leif Amundsen | [Branns offisielle historie](https://historie.brann.no/spillere/leif-amundsen/) fastslår ytre venstre; ingen individuelt dokumentert dribling, innlegg eller hurtighet. `LW`-rettelsen beholdes. |
| Bjørn Oddmar Andersen | [Pressehistorisk forskning, s. 82](https://medietidsskrift.no/wp-content/uploads/2022/12/Pressehistoriske-skrifter-nr.-10_2008.pdf) gjengir en samtidig trener-/scoutvurdering fra VG 18. mai 1961, men gjelder én landskamp. [Branns 1963-stall](https://historie.brann.no/sesonger/1963/spillerstall) dokumenterer klubbtilknytningen, ikke en varig styrke. |
| Jan Erik Osland | [Branns offisielle spillerhistorie](https://historie.brann.no/spillere/jan-erik-osland/) dokumenterer angriperrollen, ikke `finishing`. Den kildebelagte `ST`-korrigeringen beholdes. |
| Per-Ove Ludvigsen | [Branns spillerhistorie](https://historie.brann.no/spillere/per-ove-ludvigsen) omtaler spill både i forsvar og angrep, men ingen bestemt ferdighetsstyrke. |

**Konklusjon:** Én av de åtte fikk et snevert kildebelagt token i PR #460 (`dribbling`); sju mangler fortsatt dokumenterte individuelle styrker. Ingen andre tokens er lagt til i denne bolken. Kildetilgang er undersøkt og gapet eksplisitt dokumentert. Bare ny, konkret kvalitativ dokumentasjon fra spillernes aktive perioder eller en pålitelig spillerfaglig retrospektiv vurdering kan oppgradere profilen.

**Datakonsistens:** PR #459 rettet `LW` / `RB` (+`WB`) / `ST` i P1 runtime. Råkatalogen manglet ennå korrigeringene. `node scripts/sync-brann-raw-roles.mjs --write` synkroniserer kun de kildebelagte P1-rollefeltene for Leif Amundsen, Hans Brandtun og Jan Erik Osland. Ingen styrker, spillere, klubber, kampmotor eller prestasjonstall endres. Kjøres kun gjennom kontrollert commit.

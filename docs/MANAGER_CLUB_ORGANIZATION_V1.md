# Manager Club Organization v1

## Formål

Pass 5 gjør **Kontor → Klubben** til en utforskbar klubborganisasjon i stedet for et dashboard av ratings, fasilitetsnivåer og FM-lignende økonomisystemer.

Kalenderen eier fortsatt tiden. Klubben eier stedet, menneskene og de varige fagområdene rundt laget.

## Navigasjonskontrakt

Den dynamiske Speiding-flaten bruker allerede den gamle `Klubb`-knappen i hovednavigasjonen. Pass 5 oppretter derfor ingen ny hovedfane.

I normal ligasave ligger klubborganisasjonen under Kontor:

`Kalender · Klubben`

`board`-seksjonen blir en Kontor-underflate og presenteres som **Klubben**. De gamle dype underfanene `Klubbutvikling` og `Stab & drift` er ikke permanent synlige som en tab-vegg. De åpnes fra organisasjonen når manageren faktisk går inn i det aktuelle rommet.

## Organisasjonen

Hovedflaten er en katalog over mennesker og rom, ikke en samling statuskort.

### Fotballavdelingen

- **Trenerteam** – viser de stabsprofilene som faktisk er engasjert i klubbens save.
- **Treningsanlegg** – stedet for dokumenterte fysiske anleggsdata. Klubbdataene har foreløpig ikke treningsfelt, styrkerom, behandlingsrom eller utstyr; derfor vises ingen oppdiktede nivåer eller bonuser.
- **Medisinsk apparat** – bruker eksisterende spillercondition, belastning, skade og individuell oppfølging. Når save-staten har et reelt signal, åpner rommet et beslutningsverksted for kriteriebasert opptrening og retur til spill. Ingen separat medisinsk rating.
- **Analyse** – åpner et spillbart motstanderforberedelsesverksted for den faktiske terminlisten og peker videre til aktivt system og kampanalyse. Motstanderprofilen, taktikkmotoren og kampanalysen er fortsatt sannhetskildene.

### Klubben

- **Styret** – forventning og aktuelt signal presenteres som kommunikasjon fra styret, ikke som permanent 0–100-dashboard.
- **Administrasjon** – tropp og støtteapparat. Fiktive lønninger, kontraktlengder, overgangssummer og kjøp/salg er ute av live IA.
- **Stadion og hjemmebane** – navn, by og History Go-kobling kommer fra `data/football_clubs.json`.
- **Klubbutvikling** – beholder den eksisterende History Go-kjeden `Sted → Person → Ekspertise → Utviklingsprogram → Badge → Lagklasse`.
- **Akademi** vises bare dersom canonical klubbdata faktisk dokumenterer et akademi. Pass 5 finner ikke på et.

## Alternativer og arbeid

Klubbrom åpnes i drawer/bottom sheet fra hovedflaten. Det holder hovedscenen ryddig samtidig som informasjonen er tilgjengelig.

Når et rom har en eksisterende arbeidsflate, gjenbrukes den:

- Trenerteam/Administrasjon → eksisterende `admin`-flate;
- Klubbutvikling → eksisterende `progression`-flate;
- Treningsanlegg → `Lag · Trening` der managerens faktiske treningsarbeid skjer;
- Medisinsk apparat → beslutningsverkstedet i rommet og eksisterende **Individuell oppfølging** under `Lag · Trening`;
- Analyse → `Systemet` og eksisterende kampanalyse.

Dype arbeidsflater får eksplisitt retur til Klubben. De blir ikke nye permanente underfaner.

## Rejected live IA

Pass 5 fjernet følgende fra normal klubbnavigasjon og hovedflate:

- fasilitetsnivå 1–3 og oppgraderingsknapper;
- fiktiv spillerøkonomi og lønnsenheter;
- fiktive flerårskontrakter på historiske spillere;
- overgangsvinduer, overgangsbud og kjøp/salg;
- kommersielt `Marked` som egen managerflate;
- permanent klubbpuls med rå 0–100-målere.

**Pass 7 og den endelige runtime-oppryddingen er gjennomført:** økonomi-/kontrakt-, overgangs- og fasilitetsmotorene er permanent fjernet fra runtime. Gamle `facilities`, `clubEconomy` og `transferMarket`-felter migreres fortsatt trygt ut av eksisterende saves. Statiske flater, kompatibilitetsfasader og skjulte bonuser er fysisk slettet. Se `MANAGER_LEGACY_CLEANUP_V1.md`.

## Datagrenser

Følgende kilder er autoritative:

- `data/football_clubs.json` for klubb, by, hjemmebane, nivå og History Go-sted;
- `data/football_staff.json` + `teamMerits.hiredStaffIds` for aktivt støtteapparat;
- eksisterende trening/condition for belastning, skade og oppfølging;
- eksisterende taktikk- og kampanalyse for Analyse-rommet;
- eksisterende History Go-progresjon for Klubbutvikling;
- Club Week og innboks for styre-/klubbsignaler.

`manager-club-organization-v1.js` er bare presentasjon og navigasjon. Den oppretter ingen ny klubbmotor, ingen ny progresjonsmotor og ingen ny localStorage-nøkkel.

## Medisinsk beslutningsverksted og rehabiliteringsforløp v2

`Kontor → Klubben → Medisinsk apparat` lar manageren arbeide med et faktisk condition-signal gjennom:

```text
aktiv modussnapshot
→ hva vet vi / hva mangler vi
→ velg neste medisinske arbeidssteg
→ faglig konsekvens og forklaring
→ eksisterende individuell opptrening
→ tilpasset trening
→ delvis og full lagtrening
→ eksplisitt kampklarhetsvurdering
→ sammenlign planlagte og faktiske kampminutter
```

Den skadde spilleren med lengst registrert fravær prioriteres. Hvis ingen er skadet, brukes spilleren med høyest belastning over condition-motorens tretthetsgrense. Når aktiv save-/modussnapshot ikke har et slikt signal, opprettes ingen oppdiktet pasient.

Verkstedet lærer forskjellen mellom full retur nå, retur styrt av ukeestimat alene og kriteriebasert opptrening med ny funksjonsvurdering. Retur til fotball må vurderes mot symptomer, funksjon, styrke/bevegelighet, løp og sprint, spillerens trygghet og en delt beslutning mellom relevante fagpersoner, trener og spiller. Det finnes ikke ett validert enkeltkriterium som alene avgjør trygg retur.

`football-medical-decision-learning.js` er et rent læringslag. Det diagnostiserer ingen skade og endrer aldri skade, belastning, form, tilgjengelighet eller kampklarhet. UI-et leser `playerCondition` fra den aktive `hgfm.modeSessions.v1`-sesjonen og bruker `hgfm.playerCondition.v1` bare som migreringsfallback. Det skriver ingen state, oppretter ingen ny lagringsnøkkel, score eller skjult effekt, og sender anbefalt oppfølging til den eksisterende **Individuell oppfølging**-flaten.

V2 gjør returen synlig som fem trinn:

1. individuell rehabilitering;
2. tilpasset fotballtrening;
3. delvis lagtrening;
4. full lagtrening;
5. kampklarhetsvurdering.

Manageren velger forsiktig, kriteriestyrt eller raskere tilbakeføring. Valget er en dokumentert arbeidsmåte, ikke en ny rehabiliteringsbonus. `playerCondition` avgjør fortsatt om spilleren er markert skadet og hvilken belastning som er registrert; eksisterende individuell trening avgjør om **Opptrening** er valgt. Managerens plan lagres som `medicalRehabilitationPlan` i den aktive `hgfm.modeSessions.v1`-sesjonen. Det opprettes ingen ny localStorage-nøkkel.

Når skadeflagget er borte, skiller forløpet mellom treningsklar og kampklar. Manageren må velge **ute**, **benk med begrensede minutter** eller **start**. Etter neste kamp sammenlignes denne intensjonen med de faktiske minuttene i kampresultatet og det nåværende condition-signalet. Systemet sier eksplisitt at sammenhengen ikke alene beviser at rehabiliteringsvalget forårsaket utfallet.

Faggrunnlaget er:

- [London International Consensus and Delphi study on hamstring injuries, part 3](https://bjsm.bmj.com/content/57/5/278) — individuell rehabilitering, progresjon etter symptomer/kapasitet, smertefri sprint og kampkrav som sluttmål;
- [Return to play criteria after hamstring muscle injury in professional football](https://bjsm.bmj.com/content/51/16/1221) — funksjon, styrke, bevegelighet, smerte og spillerens trygghet;
- [Return to play after hamstring injuries in football: a worldwide Delphi procedure](https://pubmed.ncbi.nlm.nih.gov/28360143/) — smertefri undersøkelse/funksjon, feltprøver, medisinsk klarering og delt beslutning.

Kildene brukes til generelle læringsprinsipper. Verkstedet gir ikke medisinske råd til virkelige personer.

## UI-regel

Klubborganisasjonen følger den permanente redesignregelen:

> Vis den faktiske organisasjonen først. Åpne et rom når manageren vil fordype seg. Ikke lag et dashboard når vi kan simulere en klubb.

## Analyseavdelingen og motstanderforberedelse v1

`Kontor → Klubben → Analyse` gjør analyse til et arbeidssteg før kamp:

```text
terminfestet motstander
→ registrerte profil- og matchup-signaler
→ velg ett analysespørsmål
→ formuler en arbeidshypotese
→ velg et motgrep i eksisterende trening, oppstilling eller system
→ bestem hva som skal observeres i kampen
→ les samme plan i kampbrief og etterkamp
```

Manageren kan undersøke gjenværende kamper i den faktiske ligaterminlisten. Bare planen som matcher nærmeste `fixtureId` teller som gjennomført motstanderforberedelse i den eksisterende autoritative kampklarheten. En plan for en senere kamp kan lagres, men åpner ikke den nærmeste kampen.

Profilen kommer fra `football_league_club_profiles.json` sammen med klubbidentiteten og styrken fra ligasesongen. Formasjons-matchupen kommer fra den eksisterende Formation Knowledge Engine. Verkstedet finner ikke på videoer, enkeltkamphendelser eller nåtidsform som datagrunnlaget ikke inneholder.

Planen lagres som `opponentAnalysisPlan` i den aktive `hgfm.modeSessions.v1`-sesjonen. Det opprettes ingen ny localStorage-nøkkel. Planen inneholder fixture, motstander, fokus, hypotese, registrerte bevis, valgt motgrep, risiko og observasjonspunkt. Den er et lesbart arbeids- og readiness-steg; den gir ingen kampstyrke, xG, spillerverdi, analysekvalitetsscore eller skjult bonus.

Rådene er faglige standardvalg, aldri fasit. Manageren kan velge et annet motgrep dersom konteksten tilsier det, og etterkampen skal brukes til å vurdere hypotesen mot registrerte kampsignaler — ikke til å hevde at analysen «var riktig» bare fordi resultatet ble godt.

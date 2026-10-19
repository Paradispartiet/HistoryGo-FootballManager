# Eliteserien: spillerkvalitet og dekningsregister (fase A)

Dette er en **read-only produksjonsaudit**, ikke et nytt spillersystem. Den
leser canonical katalog, klubbpool og eksisterende P1-, P2- og source-depth-
registre, og bruker det samme kildeoverlegget som spillermotoren.

## Kjøring

Fra repo-roten:

- **--check**: beregn og kontroller rapporten, skriv oversikt over alle 16 klubber.
- **--csv**: én rad per klubbtilknytning, inkludert spiller-ID, posisjoner,
  kilde, registrerte/effektive styrker, prioritet, spillbarhet og grunntropp.
  Kan omdirigeres til en CSV-fil for kildearbeid.
- **--json** (eller uten flagg): strukturert JSON med klubb-/posisjonsdekning
  og alle spillerader.

Kjør for eksempel:

    node scripts/audit-eliteserien-player-strength-coverage.mjs --check
    node scripts/audit-eliteserien-player-strength-coverage.mjs --csv > /tmp/player-coverage.csv

Skriptet skriver **aldri** tilbake til spillerkatalog, kilderegistre eller
klubbdata. Kommandoene er deterministiske for den aktuelle commiten. For
før-/ettersammenligning brukes to bestemte commit-SHA-er. Det finnes ingen
tvungen 100 %-kvote.

## Telleregler

- **Nevner:** hver eksplisitt klubbtilknytning (clubAffiliations) i
  Eliteserien. En spiller med flere dokumenterte tilknytninger telles
  i flere klubbpooler, men bare én gang i uniqueAffiliatedPlayers.
- **Med styrker:** effectiveStrengths har minst ett token etter samme
  overlay-rekkefølge som runtime: P1 → P2 → source-depth.
- rawStrengths kommer direkte fra spillerkatalogen. catalogue_raw betyr
  at det **ikke** er angitt en individuell claim-URL i P1/P2/depth for
  disse styrkene. Dekning er derfor ikke det samme som kontrollert
  kildeproveniens. Begge målene vises.
- p1Heritage og p1Status følger P1-eierskapet også når styrkelisten er
  tom. P1-eide profiler skal behandles i P1-laget.
- P2_SNL_owned behandles bare innenfor eksisterende SNL-kontrakt.
  source_depth_eligible gjelder bare profiler uten P1/P2-eierskap,
  uten råstyrker og med belagt tilknytning til den aktuelle klubben.
- Spillbarhet avgjøres med listPlayableClubPoolPlayers.
  inNoVisitBaseSquad beregnes med resolveClubSquadAccess, uten
  stadionbesøk, med samme nasjonale kandidatfilter som eksisterende
  simulate-club-squad-audit. Dette er managerens **automatiske
  grunntropp**, ikke en historisk førsteellever.
- byPrimaryPosition bruker første naturlige posisjon, ellers første
  brukbare posisjon, ellers UNPROFILED; hver tilknytning telles én gang.
  Hele posisjonslisten finnes i spilleradene.

## Forskningsprioritet

Prioriteten må aldri automatisk generere eller estimere styrker:

1. **high_base_squad**: spillbar, uten styrker og i automatisk grunntropp.
2. **medium_playable_pool**: spillbar, uten styrker, øvrig klubbpool.
3. **needs_position_evidence**: uten styrker og uten dokumentert spillbar
   posisjon. Posisjonen må dokumenteres separat før manageruttak er mulig.
4. **covered**: har allerede en registrert effektiv styrke. Disse kan fortsatt
   ha svak proveniens og dermed trenge egen kildekontroll.

Sandefjord og Aalesund er piloter for skillet mellom varige ferdighetsbeskrivelser og enkelthendelser. Bruk CSV-rapportens klubbfilter og kontroller hver konkret ferdighetspåstand mot kildehierarkiet. Et manglende funn skal aldri erstattes med antatt spillestil, klubbstatus, meritter, classHeight eller målstatistikk.

## Avgrensning

Auditen endrer ingen spilleridentiteter, klubbtilknytninger, posisjoner,
styrker, kampmotor eller skjulte totalscorer. CI validerer registerets
integritet, ikke et måltall for antall ferdighetsbeskrivelser.

## Sandefjord: kvalitetsrevisjon 19.10.2026

Revisjonen gjelder Sandefjords 41 eksklusive Jotun-profiler i P1. Før passet
hadde 40 profiler `DOKUMENTERT`-status, men flere av disse var basert på
en enkelt kampsekvens: én redning, én heading, ett frispark eller én dribling.
Aalesunds allerede innførte kildekrav brukes også her, uten å endre
spilleridentiteter, posisjoner, klubbtilknytning eller historiens kamphendelser.

| Kildekategori | Sandefjord etter revisjon | Hvordan spillet bruker den |
| --- | ---: | --- |
| DOKUMENTERT: varig spillerstyrke | 19 | Kan gi direkte attributtløft |
| HENDELSE: én konkret kampsekvens | 19 | Historisk belegg bevart, ingen direkte attributtløft |
| DELVIS: sekundær omtale uten verifisert original | 2 | Uavklart; ingen direkte attributtløft |
| THIN-SOURCE | 1 | Modellerte posisjons-/rolleverdier, ingen oppdiktet kilde |
| **Unike profiler** | **41** | Samme identiteter som før |

De 19 kampsekvensene beholder opprinnelig kilde, spiller-ID og tidligere
ferdighetstoken under `P1_NEW_EVENT_ONLY`. To Wikipedia-gjengivelser
(Enric Vallès og Thomas Eftedal) står i `P1_NEW_PARTIAL` til originalkilde
kan kontrolleres. De 19 varige styrkeprofilene har nå både `evidenceKind`
og kildeforankret `playingStyle`.

**Ny taktisk dybde, ikke flere antakelser:** Filip Ottosson har nå
`passing_range`, `game_reading` og `tempo_control` i tillegg til de
tre tidligere styrkene. Sandefjords trenerbeskrivelse fra 2022 beskriver
lange/korte presise pasninger, overblikk og spilleforståelse; klubbomtalen
fra mars 2024 beskriver bevisst valg mellom lange og korte pasninger.
Kilder: [signeringsomtale 2022](https://www.sandefjordfotball.no/nyheter/filip-ottosson-har-signert-for-sf)
og [klubbvurdering mars 2024](https://www.sandefjordfotball.no/nyheter/bunnsolid-generalprove-i-skien).

`scripts/audit-p1-source-claims.mjs` kontrollerer identitetsdekning og
at en tidligere engangshendelse (Jacob Storeviks reaksjonsredning) ikke lenger
er en kildebelagt ferdighet. Den sammenligner dessuten den faktiske
`calculateRoleFit`-funksjonen for Ottosson før og etter de nye, kildebelagte
ferdighetene, med øvrige preferanser holdt konstante.

Dette er en **kvalitetsforbedring med lavere antall dokumenterte styrker**,
ikke et mål om å nå en prosentkvote. Neste bolker prioriterer bredde mellom
spillertyper i de øvrige Eliteserie-klubbene og deretter OBOS-ligaen; en
enkelthendelse skal ikke brukes for å få dekningsprosenten til å se bedre ut.


## KFUM Oslo: individuell rollespredning 19.10.2026

En ny kildebasert produksjonsbolk tar utgangspunkt i KFUMs egen
[historiske vurdering av 50 tidligere A-lagsspillere](https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere).
Der skiller klubbens redaksjon mellom ulike spillertyper med navngitte og
konkrete ferdigheter. **26 tidligere udokumenterte P1-profiler** er tilført
`strengths`, `evidenceKind: historical_appraisal` og individuell
`playingStyle` uten å endre ID, posisjon eller spillernivå. KFUM har nå
**30 kildebelagte profiler i sin eksklusive P1-populasjon på 46**; de
øvrige er ikke fylt med modellgenererte styrker.

Utvalget er bevisst differensiert:

- Pasningssterke midtbanetyper: Robin Rasch har overblikk og trygg
  pasningsbruk; Ståle Andersen har i tillegg dokumentert langpasningsrekkevidde.
- Forsvarsvalg: Jørgen Hammer har tidlige brudd, luftstyrke og autoritet;
  Thomas Sæther har balanse, fart og én-mot-én-forsvar; John Rasmussen har
  fysisk styrke og hodespill.
- Hurtighet og bakrom: Cato Valøy er beskrevet som en hurtig bakromsspiller;
  Dennis Obengs profil kombinerer fart, driblinger og duellstyrke.
- Keeperroller: Kenneth Rakvåg er særlig reaksjonsrask; Stian De Wahl har
  dokumentert evne til å bygge opp spillet med føttene; Arnstein Langnes
  har ballfordeling og lederskap.

Kilden beskriver fotballstilen til disse spillerne over tid, ikke en
enkeltstående scoring. Den brukes ikke til å anslå upubliserte tall i
1–20-skalaen. Den permanente P1-auditen beskytter identiteter og
kildemetadata, og bruker eksisterende `calculatePlayerMatchFit` til å
sammenligne to midtbanespillere i **samme posisjon og rolle** med de øvrige
forholdene holdt konstant. Ulik kildebelagt pasningskompetanse må gi en
målbar forskjell i både `roleFit` og `matchScore`.

**Videre avgrensning:** Dette beviser forskjell i individuell kampfit,
ikke at hele kampsimuleringen allerede modellerer alle konsekvenser av
spillerspesifikke kvaliteter. Full lag- og kampkonsekvens må testes separat
før realistisk laguttak betegnes ferdig.


## Start, Tromsø og Fredrikstad: nye spillerprofiler 19.10.2026

Denne produksjonsbolken tilfører **12 varige, individuelt dokumenterte
styrkeprofiler** uten endringer i spilleridentiteter, posisjoner, ratingregler
eller kampmotor. Spillerne har historisk kilde, `evidenceKind:
historical_appraisal`, individuell `playingStyle` og avgrenset(e)
`strengths`. Ingen nye negative ferdighetsdommer genereres.

| Klubb | Antall nye | Fotballfaglige kontraster |
| --- | ---: | --- |
| Tromsø | 5 | Espejords pasning/dueller, Christensens løpskraft/skudd, Ingebrigtsens dribling/fart, Solstads taklinger og Flems strafferedninger |
| Fredrikstad | 5 | Piirojas luftdueller, Ringbergs målteft/ledelse, Rambergs arbeidskapasitet, Wests hurtighet og Borges' kildebelagte luftspill |
| Start | 2 | Johnsens hodespill fra back og Strandlis spenstige luftdueller som spiss |

Kildegrunnlaget er kontrollert på spiller- og periode-nivå:

- **Tromsø:** `statistikk.til.no/spiller/` sine biografier for
  Torfinn Ingebrigtsen, Bjarte Flem, Lars Espejord, Nils Solstad og
  Roar Christensen. Disse inneholder konkrete, gjennomgående
  spillestilbeskrivelser. Trond Johansen er ikke inkludert i dette
  P1-passet fordi hans historiske spilleridentitet har mer enn ett
  kilde-/stedstilknytningspunkt og dermed ikke tilhører eksklusiv P1.
- **Fredrikstad:** FFKsupporters historiske spillerbiografier for Raio
  Piiroja, Markus Ringberg og Hans Erik Ramberg, samt redaksjonelle
  lagvurderinger av Brian West (2004) og Celso Borges (2010).
- **Start:** Aftenpostens fagvurdering av Marius Johnsen fra 2005 og
  Dagbladets vurdering av Frank Strandlis spillertype. Kildene knytter
  egenskapene til virkelige spillerperioder, uten å projisere alle
  ferdigheter fra en enkelt kamp eller statistikk alene.

### Kontroll av reell beslutningsforskjell

Den eksisterende `calculatePlayerMatchFit` brukes for en isolert
sammenligning med identisk CM-posisjon, holding_midfielder-rolle og
taktikk. Lars Espejord får `roleFit 47` / `matchScore 80`,
Roar Christensen får `roleFit 42` / `matchScore 79`.
Forskjellen bæres av de kildebelagte ferdighetene – ikke
`classHeight`, posisjon, rollepreferanser eller ny samlet spillerverdi.
En permanent test i `audit-p1-source-claims.mjs` verner dette
som en endringsrelevant kontroll.

Dette er dokumentasjon av **individuell rolle-/kampfit**, ikke enda et
bevis på at samme egenskapsforskjeller flytter alle lagmetrikkene eller
hele kampsimuleringen. Det er et videre, separat kvalitetsmål.

Kildeavgrensning: FFK-omtalen beskriver Borges som hodesterk og med tungt skudd, men den gir ikke tilstrekkelig belegg for `long_shots` som presise avslutninger fra distanse. Derfor er bare `heading` ført som varig attributt; skuddkraften står i kildebeskrivelsen uten en oppdiktet ferdighet.


## Fra dokumentert spillerprofil til faktisk lag- og kampeffekt (19.10.2026)

Kildearbeidet for 38 nye profiler avdekket at eksisterende
`calculateTeamFit` i stor grad rangerte lagets oppbygging, bredde,
dybde, press og restforsvar fra **rollenavn**, også etter at spilleren i
rollen ble byttet. Den individuelle `calculatePlayerMatchFit` ble
påvirket, men de seks lagdimensjonene trengte å kunne skille spillere
med ulikt dokumentert særpreg.

Den etablerte lagfit-motoren leser nå **bare direkte dokumenterte**
ferdighetsmarkører som allerede er gitt
`attributes.provenance[token] === "belagt"` av den eksisterende
attributtmotoren, og krever samtidig at samme token finnes i
spillerens `strengths`. Ukjent, utledet eller manglende proveniens
gir nøyaktig null tillegg – ikke negativ spillervurdering.

Tillegget gjelder **de eksisterende** lagdimensjonene og er konservativt
(maks +6 i én dimensjon):

- Pasningsrekkefølge/overblikk hos dyp playmaker og ballspillende
  stopper gir oppbyggingsstøtte.
- Dokumentert hurtighet/spilleforståelse hos midtstopper gir sikring
  av bakrom bare når laget faktisk spiller med `high_line`.
- Arbeidsinnsats hos pressroller bidrar i presset, og dokumenterte
  bakromsløp gir en mer reell dybdetrussel.
- Dokumentert innlegg/dribling teller i bredderoller; en sikrende
  midtbanespillers posisjonering støtter balanse og restforsvar.

Den eksisterende lagrapporten forklarer opptil to slike bidrag med
spillerens navn. Ingen ny overall-rating, fremtidig markedsverdi,
ny kampmotor eller fiktiv ferdighet er innført.

**Reproduserbar målrettet test:**
`npm run sim:sourced-player-team-fit`. Sammenligner to syntetiske
kildeprofiler i *samme midtstopperrolle*, med identisk komplett ellever,
taktikk og formasjon. Den pasningssterke stopperen skal forbedre
`buildUpScore`; den hurtige stopperen skal forbedre
`restDefenseScore` med høy linje. Forskjellene må overleve
historisk formasjonsfit og være synlige i kampmotorens
`tacticalProfile`. Testen krever samtidig at utledede/ukjente
ferdigheter er nøytrale og at hurtighet ikke gir bakromsbonus
under lavere forsvarslinje.

Dette beviser at selve **kampens taktiske input** endres når det
byttes spiller. Det er ikke et bevis på at en enkelt spiller alltid
skal endre kampresultat, xG eller vinnersannsynlighet dramatisk:
kamputfall er sammensatt, og ferdighetsbidragene er bevisst begrenset.

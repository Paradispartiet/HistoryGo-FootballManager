# Ligaklubbene spiller seg selv

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Det samme gjelder motstanderen: spørsmålet er om du forstår **hva de gjør**.

## Feilen: fjorten runder mot samme lag

Oppslaget som skulle hente motstanderprofilen lette etter **klubb-id-en**
(`molde`, `brann` …) blant de fem *generiske* profilene, som heter
`high_press_opponent`, `low_block_opponent` og lignende:

```js
const base = OPPONENT_PROFILES.find((p) => p.id === opponent.id) || OPPONENT_PROFILES[0];
```

En klubb-id kan aldri finnes der. Fallbacken slo derfor inn **hver eneste gang**:
alle fjorten serierunder ble spilt mot `high_press_opponent`, med bare navn og
styrke byttet ut. Ingen feilmelding, ingen rød vakt — bare en sesong der
motstanderen aldri endret seg.

Samme klasse som skalafeilene i CLAUDE.md: koden så riktig ut på begge sider av
grensesnittet, og bare en **måling** kunne avsløre det.

## Rettingen som var feil

Første forsøk ga klubbene **historiske arketyper**: Molde som Barcelona 2008–12,
Rosenborg som Ajax '71. Det fikset bugen og var likevel galt:

- **Kategorifeil.** Styrketallet sa 78 mens etiketten sa «du møter Barcelona».
  De to påstandene motsier hverandre.
- **Det brant opp arketypene.** De tolv skolene er det du spiller *scenarioer*
  for. Møter du Ajax '71 to ganger i året i serien, slutter de å være en
  begivenhet og blir tapet.
- **Det visket ut skillet mellom modusene.** Scenario = møt historien.
  Liga = bygg klubben din.

Feilen i resonnementet var å hoppe fra «arketypene er det beste vi har» til
«altså bør de brukes overalt».

## Nå: klubbenes egen tradisjon

Klubben eier **identitet og nivå** (`data/football_clubs.json`).
Profilen eier **fotballen**
(`data/football_league_club_profiles.json`), tegnet på hvordan klubben
tradisjonelt har spilt.

Serien har nå 16 klubber, slik den faktisk spilles — se `docs/seriepyramiden.md`
for nivåene og opp-/nedrykket. Alle 16 har profil.

### De sju første (skrevet fra hukommelse, så rettet)

| Klubb | Spillestil | Hva du møter |
|---|---|---|
| Rosenborg | Godfoten | bredt 4-3-3, kantene bryter gjennom, høye backer — rom bak sidene |
| Molde | Romsdalsk struktur | tålmodig posisjonsspill i halvrommene som går fort i det du glipper |
| Lillestrøm | Åråsen-kynisme | langt fram mot targetspissen, krig om andreballen, dødballer |
| Brann | Fotballrepublikken | aggressivt høypress i 4-3-3, vertikalt rett etter gjenvinning |
| Vålerenga | Bohemene | offensivt og dynamisk, midtbanen med i angrepet, konstant trykk |
| Viking | Siddis-disiplin | 5-3-2 med korte avstander mellom leddene, direkte når ballen vinnes |
| Tromsø | Nordlyset | 3-5-2, rolig oppbygging med tre stoppere, bredde fra vingbackene |

Profilene er **stiliserte karakteristikker av spilletradisjon** — ikke påstander
om dagens tropp eller trener. Det står i datafilas `note`.

### v2: slått opp i stedet for husket

Første utgave av profilene var skrevet fra hukommelse, og fire av sju var skjeve.
Lillestrøm ble rettet først: utgaven het «Kanarifuglene» og beskrev raske
vendinger og teknisk kombinasjonsspill, lest av 70-/80-tallslaget. LSK-tradisjonen
er kynisk og fysisk — langt fram, dueller over hele banen, dødballer.

Så ble de seks andre slått opp:

- **Vålerenga** var skrevet som et duell- og langballslag, altså nesten samme lag
  som Lillestrøm. Kallenavnet **Bohemene** kom av fargerike spillertyper og en
  *offensiv* spillestil: farlige angrep og konstant press på motstanderen,
  angrep som går gjennom midtbanen med hurtig ballsirkulasjon. Viljen fra Oslos
  østkant er ekte, men tradisjonen er offensiv fotball, ikke kynisk fotball.
- **Tromsø** var skrevet som en lav, smal blokk. Det er nesten motsatt av TIL:
  cupgullene i 1986 og 1996 og 3-2 mot Chelsea i snødrevet i 1997 ble tatt med
  mot, og den moderne klubben spiller 3-5-2 med rolig besittelse, kontrollert
  framrykk og et av ligaens mest gjennomarbeidede etablerte angrep.
- **Brann** var «direkte kantspill». Temperamentet og hjemmebanen stemmer, men
  den moderne signaturen er et *system*: aggressivt høypress i 4-3-3, backene
  høyt opp i pressleddet, og en plan om å tvinge motstanderen til å slå langt i
  midten der Brann er sterkest.
- **Viking** var en lav blokk med langt framspill. Nærmere sannheten er et
  innøvd apparat: Kjell Schou-Andreassen bygde de fire strake seriegullene på
  daglig trening, detaljer, innøvde bevegelsesmønstre og hurtige, offensive
  backer, og den moderne klubben har samme signatur — koordinerte ledd, korte
  avstander, regulert aggressivitet, kontroll i halvrommene.
- **Rosenborg** og **Molde** sto seg. RBK fikk lagt til at 4-3-3-en kom etter
  Eggens møte med Rinus Michels og at det er kantspillerne som bryter gjennom;
  Molde fikk halvrommene og de høye, brede backene inn i beskrivelsen.

### De ni andre

| Klubb | Spillestil | Grunnlag | Hva du møter |
|---|---|---|---|
| Bodø/Glimt | Glimt-modellen | tradisjon 2020–2024 | 60 % ball og rotasjoner — men en smal, sentral 4-4-2-blokk uten ball |
| Fredrikstad | Wienerstil | tradisjon 1938–1961 | korte pasninger langs bakken, hentet fra østerriksk fotball |
| Start | Sørlandsprofesjonalitet | tradisjon 1978–1980 | ingen finesse, bare bedre forberedt enn deg i nitti minutter |
| Aalesund | Sunnmørsk kontring | tradisjon 2009–2011 | kompakt femmer som straffer det ene øyeblikket du åpner deg |
| Sarpsborg 08 | Sarpsborg-strukturen | tradisjon 2015–2019 | organisert 5-3-2, hurtig i det kampen snur |
| KFUM Oslo | Ekebergsjansen | klubbkarakter | ungt høypress som ikke har råd til å spille redd |
| Kristiansund | Nordmørstrass | klubbkarakter | smal lav blokk; du får ballen, ikke rommene |
| Sandefjord | Vestfold-pragmatisme | klubbkarakter | passiv blokk, langt fram, alt på dødball |
| HamKam | Briskeby-bredde | klubbkarakter | rolig blokk som venter, og innlegg fra begge sider |

Fire av dem har **ingen storhetstid og ingen taktisk tradisjon å slå opp** — de
har aldri vunnet noe. Da er det ærligere å beskrive hva klubben faktisk *er* enn
å dikte opp en tradisjon, og `styleBasis: "klubbkarakter"` sier det i dataene.
Vakten krever at profilteksten sier det også, så en leser kan skille et oppslag
fra en påstand.

Fredrikstad er funnet i denne runden: ni seriegull mellom 1938 og 1961, og en
stil som faktisk har navn — «wienerstil», adoptert etter at klubben ble
fascinert av østerrikske lag på besøk. Korte pasninger langs bakken i en norsk
fotballkultur som ellers slo langt.

### Regelen når kilden er tynn: gå til storhetstiden

Norske klubbers *taktiske* tradisjon er dårligere dokumentert enn europeiske
storlags. Når kilden ikke rekker, er regelen å ta utgangspunkt i **storhetstiden
— den da klubben faktisk vant**, ikke i et generelt inntrykk av klubben. Det er
nettopp det generelle inntrykket som lot Vålerenga og Lillestrøm gli sammen til
det samme duellslaget.

Derfor må `era` navngi et konkret årstall. «tradisjon» er ikke en epoke, det er
en unnvikelse, og `sim:league-season` avviser den nå. Lillestrøm sto med
«tradisjon» og har fått 1976–1989 (fire seriegull); Brann har fått 1961–1963.

Brann er den ene der de to reglene peker hver sin vei, og det står i profilen:
storhetstiden er Oddvar Hansens seriegull i 1961/62 og 1963 med Roald «Kniksen»
Jensen foran 15 000 på Stadion — mens den dokumenterte *taktikken* tilhører
pressutgaven fra 2022. Profilen bruker den moderne fotballen og lar Kniksen-arven
forklare hvorfor klubben er slik: publikum og enkeltspilleren avgjør.

Konsekvens for tokenene: `target_man_direct` er LSKs signatur alene,
`aggressive_man_press` er Branns, `two_striker_press` er Vålerengas, og
`three_at_back` er Tromsøs. Ingen ligaklubb er lenger en ren lav blokk — Viking
med `compact_532` + `narrow_442` er det nærmeste du kommer.

Kampbriefen sier hvilken av delene du møter: «Klubbens spillestil» for en
ligaklubb, «Historisk stil-motstander» for en arketyp i scenario eller
mesterskap. Ellers ville det sett ut som Molde *er* en historisk skole.

Målt over en hel sesong: **15 ulike spillestiler**, hver møtt hjemme og borte, og
**alle 16** spillestil-tokens i vokabularet i bruk. Ingen to klubber har samme
matchupStyles-sett — ulikt navn er ikke nok, det er fingeravtrykket motorene
leser som må være unikt.

## Kildekontroll: høyt press og pasningsdekning (2026-11-26)

Kampmotorens v6-pressfase kan bruke kollektivt press og sentral eller bred
pasningsdekning. Pressintensitet, soneforsvar, mann-mann-press og dekning
av en bestemt pasningslinje er ulike observasjoner. Ukjent dekning skal
forbli nøytral; den er ikke bevis på en åpen pasningslinje. Kildene
beskriver historiske spillestiler, ikke målinger ved avspark.

Av 60 ligaprofiler er det 12 som oppfyller eksisterende pressfasevilkår
(har high_press-token, eller eksplisitt intensitet >= 70 og høy linje >= 62).
I utkastkjeden har Brann (2024), Rosenborg (1994–1999) og Strømsgodset
(2011–2014) kildebelagt kollektivt/sentralt mønster i profilene.

| Klubb | Kildestatus | Beslutning |
|---|---|---|
| Start | Gullperioden 1978–1980 bekreftet, presis pressretning ikke funnet | Ingen nye motorfelt |
| KFUM | Moesgaards 2025-utgave: høyt mann-mann-press, kompakt 5-4-1 i lav blokk | Ingen sentral/bred dekning avledet; ulike presshøyder må holdes adskilt |
| Vålerenga | Bengtssons 1983–1984-utgave: soneforsvar, ballførerpress, disiplin | Ingen bestemt dekning avledet; bohemprofilen bør senere skille epokene tydeligere |

### Kilder og avgrensninger

- [Starts klubbhistorie 1975–1984](https://www.ikstart.no/start-historien/historie-fra-1905/Om-IKStart-i-perioden-1975-1984):
  13 baklengsmål i 22 seriekamper i 1978; 52–26 i 1980. Resultatene
  sier ikke hvordan presset var organisert.
- [RBKweb, trenerens KFUM-vurdering i 2025](https://www.rbkweb.no/vis/17939):
  Alfred Johansson skiller høyt mann-mann-press fra kompakt lav 5-4-1.
  Ingen bestemt pasningsretning oppgitt.
- [Journalen, Slik vil Kåffa holde plassen](https://journalen.oslomet.no/nb/2024/01/slik-vil-kaffa-holde-plassen):
  Johannes Moesgaard beskriver overgangen fra 4-3-3 til 3-4-3 i 2023.
  Formasjonsvalget alene beviser ikke pasningsdekning.
- [Vålerengas klubbhistorie](https://www.vif-fotball.no/om-klubben/var-stolte-histore-ny):
  Bengtssons soneforsvar, ballførerpress og disiplin beskrives som et
  brudd med tidligere fotball.
- [Store norske leksikon, Vålerenga Fotball](https://snl.no/V%C3%A5lerenga_Fotball):
  bekrefter gullene i 1983 og 1984 under Bengtsson og den systematiske
  spilltradisjonen hos etterfølgeren. Ingen bestemt pasningsretning.

### Gjennomgang av de siste seks pressprofilene

| Klubb | Kildestatus | Beslutning |
|---|---|---|
| Sogndal | Klubbens spillkonsept i 2016: høyt press og gjenvinning | Dekning ukjent |
| Strømmen | Trenerintervju 2026: intensitet, defensiv soliditet, hurtige kontringer; endrede pressdetaljer | Dekning ukjent |
| Sandviken | Gjenpublisert kampreferat mot Sotra: press og gjenvinning på midtbanen; svakere kilde, ikke fastlagt høypressmønster | Dekning ukjent |
| Bjarg | PlayIQ 2026: høyt mann-mann-press, gjenvinning; direkte treneruttalelser og pasningsdata | Dekning ukjent; mann-mann-prinsipp gir ikke i seg selv sentral eller bred dekning |
| Grorud | Treneruttalelser 2023 og 2025: gjenvinning i høyt press, dokumentert gjenvinning nær motstanderens boks mot Stjørdals-Blink | Dekning ukjent |
| Lørenskog | Seniorfotballens sportsplan: høyt press for å vinne ball, lavt press for å beskytte mål | Dekning ukjent; treningsmål er ikke observasjon av fast kampmønster |

Kildene:

- [Sogndal Fotball, God jul frå Sogndal Fotball, 25.12.2016](https://www.sogndalfotball.no/nyheiter/god-jul-fra-sogndal-fotball): klubbens leder beskriver spillkonsept og intensitet.
- [Vårt Strømmen, sesongstart 2026](https://vartstrommen.no/strommen-if-fotball-sesongstart-i-obos-ligaen-april-2026/): Jens Wedeborg beskriver intensitet, defensiv soliditet og kontringer; ikke pressretning.
- [IL Sandviken herrer, gjenpubliserte klubbinnlegg](https://www.findglocal.com/NO/Bergen/1577245285884792/IL-Sandviken-herrer): kampreferat mot Sotra. Sekundær gjenpublisering; ikke brukt til motoreffekt.
- [PlayIQ, Bjarg: A Football Fairytale in the Making?](https://www.playiq.no/insights/bjarg-a-football-fairytale-in-the-making): 2026, treneruttalelser og beskrivelse av mann-mann-press. Motstandernes pasningstreff var 73 %, 7,1 prosentpoeng lavere enn i øvrige kamper. Analyseleverandøren samarbeider med klubben; dette er ikke en uavhengig evaluering eller en måling av bestemte pasningsrom.
- [Grorud IL, Abel Tjomsland er vår nye nummer 8, 23.12.2023](https://www.grorud-il.no/nyheter/abel-tjomsland-er-var-nye-nummer-8): trenerens beskrivelse av spillerens gjenvinningsferdigheter.
- [Akers Avis Groruddalen, Tap i Trondheim](https://groruddalen.no/sport/tap-i-trondheim-en-skuffa-gjeng-som-satt-pa-flyplassen/): treneren beskriver en konkret høy gjenvinning og overgangsmuligheter i 2025.
- [Lørenskog IF, Spillfasene i LIF](https://lorenskogif.no/klubben/sportsplan-1/seniorfotball/spilldelene-i-lif): seniorplanens to pressfaser og periodisering.

**Sluttstatus for første kildegjennomgang:** 12 av 12 aktuelle profiler
undersøkt, tre med aktivert sentral dekning i utkastkjeden, ni uten
tilstrekkelig belegg for sentral eller bred dekning. Dette er ikke en
påstand om at de ni lagene mangler pasningsdekning i virkeligheten.
Neste kildebehov er konkret videoanalyse av pasningsrom, eller en
trenerbeskrivelse av pressretning i den relevante perioden. Ingen ny
mekanikk eller endring i sannsynligheter følger av dokumentasjonen alene.

## Kildekontroll: kompakt forsvar

Motorens lavblokkfase krever kompaktitet >= 72 og forsvarslinje <= 55.
22 av 60 eksisterende ligaprofiler oppfyller dette. Tre uavhengige
dekningsfelt kan brukes: centralCover, wideCover og boxCover.
En formasjon, lav presshøyde eller defensiv soliditet alene beviser
ikke kollektiv dekning av et bestemt angrepsrom.

| Klubb | Kildegrunnlag | Beslutning |
|---|---|---|
| Hødd | Cupfinalen 2012, samtidig analyse av forskyvning i 4-5-1 | Sentral og bred kollektiv dekning aktivert i #592; boksdekning ukjent |
| Kristiansund | Michelsen 2017–2022: kollektiv bakre firer og organisert midtbane i 2019, variabel presshøyde i 2020, kompakt lag mot Start i 2020 | Ingen spesifikk dekning aktivert; 4-4-2 er ikke dokumentert som fast formasjon |
| Aalesund | Rekdal 2011: to dype midtbanespillere i 4-2-1-3 mot Brann, en femte forsvarer satt inn sent mot Start | Sentral sikring i eget angrep er ikke det samme som sentral dekning i etablert lav blokk; ingen nye felt |
| Viking | Analyse av 2023/24 beskriver samordnede høypressfeller og gode automatismer mot høyt press | Ikke belegg for lavblokkdekning. Relevant ved senere arbeid med pressEscape |
| Sarpsborg 08 | Bakke i 2018 ønsket to sentrale midtbanespillere med kapasitet til å dekke rom og forskyve mot Dynamo Kyiv; i 2017 stilte laget med bakre firer mot Rubin Kazan | Plan før kamp er ikke observert lavblokkdekning. Ingen nye felt. Fast 5-3-2 bør undersøkes |

### Kilder

- [Kristiansund, Eurosport 2019 – vurdering av KBK og Michelsen](https://www.eurosport.no/fotball/eliteserien/2019/joacims-analyse-her-er-dommen-over-kbk-og-taktiker-michelsen_sto7384144/story.shtml): forsvars- og midtbaneleddenes kollektive struktur.
- [Eurosport 2020 – tabelltips](https://www.eurosport.no/fotball/eliteserien/2020/her-er-eurosports-tabelltips-molde-ned-fra-tronen-og-odd-i-nedrykksstrid_sto7776226/story.shtml): høyt og lavt press, direkte etter gjenvinning.
- [Start, kampreferat 2020](https://www.ikstart.no/start-historien/sesongoversikter/sesongen-2020/runde-13-2020-kristiansund-start-3-2): kompakt KBK-lag og overgang etter sentralt balltap.
- [Kristiansund, Seier mot Sandefjord](https://www.kristiansundbk.no/nyheter/seier-mot-sandefjord): Michelsen om defensivt fundament; 3-5-2 i denne treningskampen.
- [Fotballanalyse 2011 – Brann 1–2 Aalesund](https://fotballanalyse.wordpress.com/2011/11/06/brann-1-2-aalesund-rekdal-og-barrantes-pa-internasjonalt-niva/): to dype midtbanespillere, kantpress og restforsvar i 4-2-1-3.
- [Stavanger Aftenblad, Rekdal etter Start–AaFK 2011](https://www.aftenbladet.no/sport/i/ng5bbd/rekdal-kvittet-oss-med-noe-daukjoett): sen overgang til fem forsvarere.
- [Total Football Analysis, Viking 2023/24](https://totalfootballanalysis.com/article/viking-fk-the-key-tactical-points-that-see-them-top-of-the-eliteserien-scout-report-tactical-analysis): avsnittene om høyt press og oppbygging mot press. Ikke en lavblokkanalyse.
- [Sarpsborg 08, før Dynamo Kyiv 10.02.2018](https://www.sarpsborg08.no/nyheter/for-dynamo-kiev-utvik-fra-start): trenerens plan for sentral midtbane og forskyvning.
- [Sarpsborg 08, Rubin Kazan 21.02.2017](https://www.sarpsborg08.no/nyheter/god-gjennomkjoring-mot-rubin-kazan): lagoppstilling med bakre firer.

### Andre bolk

| Klubb | Kildegrunnlag | Beslutning |
|---|---|---|
| Jerv | Sandstø 2026: senket kantene for bedre sentral kontroll og lå samlet lavere mot slutten mot Bjarg. | Konkret spor, men ikke belegg for samme dekning i 2022-profilen. |
| Kongsvinger | Klubbhistorien bekrefter sølvåret 1992. | Ingen spesifikk romdekning dokumentert i profilens periode. |
| Mjøndalen | Eurosport 2020: godt organisert i lavt press i 2019, tidvis svært dypt, varierende formasjoner. | Ingen spesifikk dekning aktivert. |
| Raufoss | Sandnes Ulf 2020: endret presshøyde og mer kompakt etter pause. | Ingen spesifikk dekning aktivert. |
| Åsane | Klubbens kampreferat mot Kongsvinger i 2026: kompakt og tidvis lavt forsvar som stengte sentrale åpninger. | Konkret sentraldekning i en navngitt kamp; kandidat for kildebelagt modell innenfor profilens åpne periode 2015–. |

Kilder:
- [Jerv, Dro i land sterk seier mot Bjarg på hjemmebane, 10.05.2026](https://www.fkjerv.no/nyheter/dro-i-land-sterk-seier-mot-bjarg-pa-hjemmebane): trenerens forklaring på kantjustering og sentral kontroll.
- [Kongsvinger, 17 år i toppen](https://www.kil.no/om-klubben/lagetfradedypeskoger/17-ar-i-toppen): sølvsesongen 1992.
- [Eurosport, tabelltips 2020](https://www.eurosport.no/fotball/eliteserien/2020/her-er-eurosports-tabelltips-molde-ned-fra-tronen-og-odd-i-nedrykksstrid_sto7776226/story.shtml): Mjøndalen, treneravsnittet.
- [Sandnes Ulf, Viktig seier mot Raufoss, 28.08.2020](https://www.sandnesulf.no/nyheter/viktig-seier-mot-raufoss): endring i presshøyde og kompaktitet.
- [Åsane, Ledet til pause, men måtte reise tomhendt hjem](https://www.asanefotball.no/nyheter/ledet-til-pause-men-matte-reise-tomhendt-hjem): første omgang mot Kongsvinger, lavt forsvar og sentral romdekning.

### Tredje bolk

| Klubb | Kildegrunnlag | Beslutning |
|---|---|---|
| Moss | Gullspillernes tilbakeblikk bekrefter Eggens innøvde 4-3-3 i 1986–1987. | Eksakt 5-3-2 uten ball er ikke dokumentert; ingen spesifikk lavblokkdekning. |
| Bryne | Klubbhistorien bekrefter storhetstiden og cupgullet 1987. | Ingen spesifikk dekning i relevant periode. |
| Haugesund | VG-lupen 2018 beskriver 4-4-2 som tradisjonelt system, men Horneland varierte formasjonen. | Ingen bestemt kollektiv romdekning fastslått. |
| Ranheim | 2019-analyse bekrefter Maalens tydelige spillidé; klubbens videobaserte taktikkhjørne 2023 beskriver sentrale pasningslinjer ved defensive overganger. | Senere epoke og annen fase enn etablert lav blokk; ingen nye felt. |

Kilder:
- [Bergens Tidende, Moss-heltene om Eggen](https://www.bt.no/sport/i/y4y9je/moss-heltene-om-eggen-snudde-byen-paa-hodet): Bachke om 4-3-3-drillingen.
- [Bryne FK, Historie](https://www.brynefk.no/om-stadion/om-klubben/historie): storhetstid og cupgull.
- [VG-lupen 2018, Haugesund](https://www.vg.no/spesial/2018/vglupen/?plassering=14): tradisjonell 4-4-2, men variasjon under Horneland.
- [Eurosport, Ranheim-analyse 2019](https://www.eurosport.no/fotball/eliteserien/2019/joacims-ranheim-analyse_sto7171681/story.shtml): Maalens spillidé.
- [Ranheim, Taktikkhjørnet – Ranheim på bedringens vei?](https://www.ranheimfotball.no/nyheter/taktikkhjornet-ranheim-pa-bedringens-vei): 2023-eksempler på defensiv overgang, ikke dokumentasjon av 2017–2019-lavblokk.

Status: 14 av 22 undersøkt. Hødds spesifikke dekning er merget i #592;
Åsanes sentraldekning er implementert i utkast #594. De øvrige tolv
undersøkte profilene beholder ukjent spesifikk dekning. Åtte gjenstår:
Notodden, Brattvåg, Lysekloster, Hønefoss, Follo, Tromsdalen, Rana og
Junkeren. Ingen nye motorfelt eller tall endres i denne dokumentasjons-PR-en.

## Vakten

`sim:league-season` går gjennom en **hel sesong** og krever:

- hver klubb har en profil med styleName, minst 2 matchupStyles, 8 styleTraits,
  nøkkelduell og managerhint
- ingen profil peker på en historisk arketyp (`archetypeId` er forbudt)
- ingen profil setter `strength` — nivået eies av klubben
- ingen to klubber deler spillestil
- ingen to klubber deler **matchupStyles** — ulikt navn er ikke nok, det er
  fingeravtrykket motorene leser som må være unikt
- hvert matchupStyles-token finnes i formasjonskunnskapens vokabular; en
  skrivefeil scorer stille null i stedet for å si fra
- etiketten i klubblista (`tacticalIdentity`) beskriver **samme fotball** som
  profilen; Lillestrøm sto lenge med «raske vendinger» i lista mens profilen sa
  langball og dueller, og spilleren ser etiketten først
- sesongen byr på nøyaktig 7 stiler, hver møtt to ganger
- app.js slår opp **klubbprofilen**, ikke klubb-id blant de generiske
- kampbriefen skiller klubbstil fra historisk arketyp

De tre siste er de som fanger hver sin utgave av feilen: den opprinnelige
bugen, arketyp-rettingen, og presentasjonen. De tre nye fanger *sameness*: at
klubbene bare later som de er forskjellige.

## Én ting til, ikke fikset

Terminlista gir seks hjemmekamper på rad, så seks bortekamper. Ekte dobbel
serie alternerer. Egen sak.

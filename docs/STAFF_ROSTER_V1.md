# Rollebasert førstelagsstab v1

Før seriestart må manageren **dekke rollebehovet i klubbens startersett**. For en dokumentert overtatt klubb utledes dette behovet fra de kildebelagte profilene som er merket med klubbens id i `starterClubIds`. Antallet og rollefordelingen er derfor klubbspesifikk; kompatibel allerede-engasjert History Go-stab kan fylle samme rolle uten at en bestemt person-id blir obligatorisk.

`data/hgFootball/staffRoles.json` beskriver **maksimal aktiv kapasitet per rolle** (`maxActive`): én assistent, opptil tre trenere, én fysio og én keepertrener. Dette er ikke et universelt minstekrav. #172 tolket denne kapasitetsmatrisen som et obligatorisk 1+3+1+1-minimum; det var en modellfeil. Den opprinnelige før-sesongregelen fra #143 beholdes: stab må velges eksplisitt før sesongen starter.

Modellen bruker eksisterende stabsdata og coach-context; den er ikke en parallell stabsmotor. `hiredStaffIds` i `hgfm.teamMerits.v1` forblir lagringens sannhetskilde. `football-staff-roster.js` fordeler engasjerte personer deterministisk på kompatible aktive rolleplasser, og samme person kan ikke fylle to plasser. Rollefordelingen brukes for kapasitet og coach-context, ikke for å dikte et minimumsantall ansatte.

Ansettelsesgrensen vurderer den effektive tildelte rollen mot `maxActive`. En dokumentert assistent som også kan brukes som coach kan derfor fylle en ledig coach-kapasitet uten at kildens `staffType` omskrives.

Ukurerte klubber får fortsatt seks tydelig merkede placeholder-profiler i 1+3+1+1-form som et nøytralt spillbarhetsgulv. Placeholderne er fallback, ikke en påstand om klubbens virkelige organisering. History Go-opplåst stab fortsetter å komme fra eksisterende stedskoblinger.

## Klubbspesifikke startersett

`starterClubIds` betyr medlemskap i et dokumentert startersett for en etablert klubb. `selectStarterStaffCandidates(staff, clubId)` bruker det dokumenterte settet når klubben har et slikt sett, også når det består av færre enn seks personer. `summarizeStarterStaffReadiness(...)` utleder deretter rollebehovet fra dette settet og lar enhver kompatibel engasjert staff-profil dekke rollen. Hvis klubben ikke har et dokumentert sett ennå, brukes hele det generiske placeholder-gulvet. Nye `starterClubIds` skal derfor først legges inn når kildene er gode nok til at settet kan behandles som klubbens starterstab; enkeltstående løse funn skal ikke merkes som startersett.

Rosenborg er første kuraterte klubbsett. A-lagsstaben er hentet fra Rosenborg Ballklubs offisielle oversikt, oppdatert 11.08.2026: `https://www.rbk.no/om-rbk/ansatte/a-lag-menn`. Alexander Lund Hansens keepertrenerprofil har i tillegg klubbens egen profilsak som provenance. Dataene bruker bare dokumenterte roller; taktiske ekspertiser legges ikke til uten særskilt kilde.

Brann er andre dokumenterte klubbsett. Seks starterprofiler er hentet fra klubbens løpende A-lagsoversikt på `https://www.brann.no/lag`: Morten Kalvenes og Erik Huseklepp (assistenttrenere), Hassan El Fakiri (toppspillerutvikler), Helge Haugen (fysisk trener), Robert Dyvik (fysio) og Dan Riisnes (keepertrener). Bare rolleinformasjon som står eksplisitt hos klubben er materialisert.

Fredrikstad er tredje dokumenterte klubbsett. Klubbens offisielle A-lagsoversikt på `https://www.fredrikstadfk.no/lag` dokumenterer Andreas Jenssen (assistenttrener), Kevin Nicol (førstelagstrener), Aleksander Bakken (toppspillerutvikler), Torvald Berthelsen (fysisk trener), Håkon Wæhler (fysioterapeut) og Samuel Dirscher (keepertrener). Bare disse eksplisitte rollene er materialisert.

Vålerenga er fjerde dokumenterte klubbsett. Klubbens offisielle støtteapparat på `https://www.vif-fotball.no/lag/a-laget/a-lag-stotteapparat` dokumenterer Vetle Kristoffer Rygh (assistenttrener), Knut Rønningene (førstelagstrener), Aaron Horne (fysisk trener), Martin Flesland (fysisk trener / fysioterapeut), Carl Fredrik Birkemo (fysioterapeut) og Lukasz Jarosinski (keepertrener). Hovedtrener Johannes Moesgaard brukes ikke som starterstaff fordi manageren eier hovedtrenerrollen.

Lillestrøm er femte dokumenterte klubbsett. Klubbens offisielle A-lagsoversikt på `https://www.lsk.no/lag` dokumenterer Eirik Mæland (assistenttrener), Frode Kippe (toppspillerutvikler), Martin Jakobsen (fysisk trener), Geir Kåsene (fysisk trener/fysioterapeut), Sondre Sjøgren Jakobsen (fysioterapeut) og Bartosz Deregowski (keepertrener). Hovedtrener Hans Erik Ødegaard brukes ikke som starterstaff fordi manageren eier hovedtrenerrollen.

Sarpsborg 08 er sjette dokumenterte klubbsett. Klubbens offisielle A-lagsoversikt på `https://www.sarpsborg08.no/lag` dokumenterer Sander Nyland (assistenttrener), Dag Tore Bergerud (toppspillerutvikler), Halvor Elverhøi (fysisk ansvarlig), Filipe Monteiro (fysisk trener), Abel Viana (fysioterapeut) og John Alvbåge (keepertrener). Hovedtrener Even Sel brukes ikke som starterstaff fordi manageren eier hovedtrenerrollen.

Start er sjuende dokumenterte klubbsett. Klubbens offisielle A-lagsoversikt på `https://www.ikstart.no/lag` dokumenterer Joey Hardarson (assistenttrener), Kristoffer Vangen Lysgård (trener A-lag/analyse), Roger Risholt (toppspillerutvikler), Kristian Gjøstøl (fysisk trener), Jørgen Rostrup (fysio) og Alexander Aaser (keepertrener). Hovedtrener Azar Karadas brukes ikke som starterstaff fordi manageren eier hovedtrenerrollen.

Molde er åttende dokumenterte klubbsett. Klubbens offisielle A-lagsoversikt på `https://www.moldefk.no/lag` dokumenterer Martin Falk (First Team Coach), Rune Bolseth (trener), Christian Thorbjørnsen (Coach/Fitness Coach), Andreas Ranvik (fysioterapeut) og Per Magne Misund (keepertrener). Marius Bøes assistentrolle er eksplisitt dokumentert i klubbens egen sak `https://www.moldefk.no/nyheter/marius-boe-blir-ny-assistenttrener`. Hovedtrener Sindre Tjelmeland brukes ikke som starterstaff fordi manageren eier hovedtrenerrollen.

Tromsø er niende dokumenterte klubbsett. Klubbens offisielle A-lagsoversikt på `https://www.til.no/lag` dokumenterer Marius Jacobsen og Ola Rismo som trenere, Sigurd Pedersen som fysisk trener, Tom-Erik Richardsen som fysioterapeut og Eirik Sørensen som keepertrener. Lars Gunnar Johnsen er eksplisitt dokumentert som toppspillerutvikler/assistenttrener i klubbens ansatteoversikt på `https://www.til.no/om-klubben/ansatte/sporten`. Hovedtrener Jørgen Vik brukes ikke som starterstaff fordi manageren eier hovedtrenerrollen.

Aalesund er tiende dokumenterte klubbsett og første permanente fempersonersbevis for den korrigerte staff-kontrakten. Klubbens offisielle ansatteoversikt på `https://www.aafk.no/om-klubben/ansatte-i-aafk` dokumenterer Geir Frigård og Tor Hogne Aarøy som assistenttrenere. A-lagsoversikten på `https://www.aafk.no/lag` dokumenterer Sindre Eid som toppspillerutvikler, Fredrick Pettersen som fysioterapeut og Odd Einar Hatløy som keepertrener. Settet dekker derfor fem starterroller og blir før-sesongklart ved 5/5; den ledige tredje trenerkapasiteten er ikke et krav om en sjette person.

HamKam er ellevte dokumenterte klubbsett og andre permanente fempersonersbevis. Klubbens offisielle herrestab dokumenterer Lars Brotangen som assistenttrener, Håkon T. Kristiansen som toppspillerutvikler og Yngve Sandbuløkken som keepertrener. Jacob Mollatts 2026-forlengelse dokumenterer at han holder i det fysiske arbeidet på A-laget, og Magnus Jordet-Nilsen er dokumentert som fysioterapeut også i 2026. Settet blir derfor før-sesongklart ved 5/5 og fyller 5/6 aktiv rollekapasitet uten oppdiktet ekstra trener.

Kristiansund er tolvte dokumenterte klubbsett og tredje permanente fempersonersbevis. Klubbens offisielle A-lagsoversikt på `https://www.kristiansundbk.no/lag` dokumenterer Karl Oskar Fjørtoft som assistenttrener, Andreas Eines Hopmark som toppspillerutvikler, Eirik Andersen som fysisk trener, Eirik Rundberg som fysioterapeut og Conny Månsson som keepertrener/materialforvalter. Hovedtrener Amund Skiri inngår ikke fordi manageren eier hovedtrenerrollen. Settet blir derfor før-sesongklart ved 5/5 og fyller 5/6 aktiv rollekapasitet uten oppdiktet ekstra trener.

Sandefjord er trettende dokumenterte klubbsett og fjerde permanente fempersonersbevis. Klubbens offisielle A-lagsoversikt på `https://www.sandefjordfotball.no/lag` dokumenterer Per Verner Rønning som assistenttrener, Henrik Gustavsen som toppspillerutvikler, Arnor Snær Gudmundsson som fysisk trener, Ola Olsen som fysioterapeut og Jordi Cumelles Comas som keepertrener. Hovedtrener Andreas Tegström inngår ikke fordi manageren eier hovedtrenerrollen. Ytterligere medisinsk personell, analyseansvarlig og keepertreneransvarlig fyller ikke kunstige trenerplasser. Dokumentert starterstab er dermed 5/5 og før-sesongklar; maksimal aktiv kapasitet er fortsatt 5/6.

Viking er fjortende dokumenterte klubbsett og første permanente firepersonersbevis. Klubbens offisielle A-lagsoversikt på `https://www.vikingfotball.no/lag` dokumenterer Stig Vik Nedrebø som assistenttrener og analyseansvarlig, Rune Repvik som toppspillerutvikler, Halvard Øen Grova som fysioterapeut og Jason Wyn-Jones som keepertrener. Hovedtrenerne Bjarte Lunde Aarsheim og Morten Jensen er utelatt fordi spilleren selv er manager. Andre fysioterapeuter, mentaltrener og lege legges ikke til for å fylle en rolle som ikke er dokumentert. Settet er dermed før-sesongklart ved 4/4 og har 4/6 aktiv rollekapasitet; dette er ikke et krav om å ansette to ekstra personer.

KFUM Oslo er femtende dokumenterte klubbsett og andre permanente firepersonersbevis. Klubbens offisielle A-lagsoversikt på `https://www.kaaffa.no/lag` dokumenterer Thomas Holm og Moa Dajani som assistenttrenere, Fredrik Talsnes som fysioterapeut og Kamil Olsztynski som keepertrener. Hovedtrener Jørgen Isnes utelates fordi spilleren har managerrollen. De to assistentene kan dekke én assistentplass og én trenerkapasitet, uten at deres kildebelagte `staffType` omskrives. Andre fysioterapeuter, oppmenn og sportslige ledere blir ikke brukt for å fylle tomme trenerplasser. Før-sesongkravet er 4/4 dokumenterte starterroller og maksimal aktiv kapasitet 4/6.

`Kontor → Klubbdrift → Stab & drift` viser aktiv rollebruk som kapasitet, for eksempel `2/3 maks` trenere. Selve før-sesongstatusen viser hvor mange av startersettets rolleplasser som er dekket, for eksempel `5/5 starterstab`. En ledig kapasitet er derfor ikke automatisk en manglende ansatt.

## Eliteserien-kø og ferdigdefinisjon

`npm run audit:eliteserien-staff-coverage` måler hvilke av de 16 klubbene i 2026-snapshotet som har et dokumentert klubbspesifikt startersett. Et dokumentert sett må være uten placeholders, være eksplisitt koblet med `starterClubIds`, ha kilde og være rollekompatibelt med eksisterende staff-motor.

Klubber uten dokumentert sett bruker fortsatt seks-personers fallback. Klubber med dokumentert sett bruker sitt faktiske sett, uavhengig av om dette fyller alle seks kapasitetsslots.

Dette gjør produksjonsrekkefølgen fortsatt klubbvis: dokumenter ett reelt startersett, materialiser bare kildebelagte roller, og gå deretter videre. Ingen personer skal legges til bare for å fylle 1+3+1+1.


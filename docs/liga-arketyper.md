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

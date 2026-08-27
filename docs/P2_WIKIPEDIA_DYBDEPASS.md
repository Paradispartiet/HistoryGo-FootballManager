# P2 · dybdepasset — Wikipedia som troppskilde

**Sju klubber fikk 214 navn til, og Tromsdalen ble den 59. overtakbare.**

De fjorten P2-klubbene ble landet på NFFs lagside. Registeret ga *bredde*:
tjue til tretti navn med lagdel, hentet fra én sesong, og ingen fortid bak dem.
Kildelista pekte på fire redaksjonelle spor som skulle gi *dybde* — Eidsvold
Turns adelskalender, Stjørdals-Blinks klubbarkiv, Trygg/Lades historikkside og
Romerikes Blads «Klubblegende»-serie. Alle fire er lest. **Ikke ett av navnene deres er importert her**, og
begrunnelsen står nederst i dokumentet.

Dybden lå et helt annet sted.

---

## Kilden: Wikipedias klubbkategorier

no.wikipedia fører en kategori per klubb — `Kategori:Fotballspillere for
Tromsdalen UIL` — og hver artikkel har en infoboks med **posisjon** og en
**karrieretabell** med år, klubb og kamper. Det er nøyaktig de to feltene en
klubbpool trenger.

```
Kategori:Fotballspillere for Tromsdalen UIL      92 artikler
Kategori:Fotballspillere for IL Stjørdals-Blink  65
Kategori:Fotballspillere for IL Sandviken        56
Kategori:Fotballspillere for Eidsvold Turn       54
Kategori:Fotballspillere for Lørenskog IF        41
Kategori:Fotballspillere for Lysekloster IL      13
Kategori:Fotballspillere for SK Trygg/Lade        7
Kategori:Fotballspillere for Rana FK              5
```

333 kategorioppføringer — 326 unike artikler — ble hentet og lest enkeltvis. **Kategorien er ikke kilden —
artikkelen er.** Bare de 265 som har klubben i sin egen **senior**karriere er
tatt med.

## Kategorien lyver, artikkelen retter

Tre feilkilder, alle funnet ved å lese artiklene i stedet for å stole på lista:

**Kategorien plasserer folk som aldri spilte der.** Lørenskog IFs egen
Wikipedia-artikkel fører **Henning Berg** og **Abdisalam Ibrahim** blant
«Kjente spillere», og begge står i klubbkategorien. Bergs egen artikkel sier
det motsatte: «Til tross for at han bodde på Lørenskog spilte han fotball fra
lilleputt-stadiet i Oslo-klubben KFUM», og seniorkarrieren begynner i KFUM.
Ibrahims klubbliste går Fjellhamar → Manchester City og nevner ikke Lørenskog.
En «kjente spillere»-liste betyr ofte *kjente folk herfra*, ikke *spilte her*.

**Kategorien skiller ikke herrelaget fra kvinnelaget.** `IL Sandviken` er på
Wikipedia nesten utelukkende **kvinnelaget** — det som ble Branns kvinnelag i
2022. 31 av 32 treff er kvinner, blant dem Lise Klaveness, Guro Bergsvand og
Elisabeth Terland. Katalogens `sandviken` er herreklubben i 2. divisjon.
**Sandviken er derfor utelatt fra passet i sin helhet.** Én kjønnsscreening
kjøres over alle klubbene; Tromsdalens June Pedersen er den eneste andre.

**Kategorien tar med ungdomsspillere.** Fem av Trygg/Lades sju — Odin Thiago
Holm, Anders Børset, Dennis Gaustad, Brage Kvithyld, Elias Slørdal — har
klubben som *ungdomsklubb*, ikke som seniorklubb. En klubbpool er A-lagets
historie. De faller på seniorkravet.

---

## Oversettelsen

`Posisjon` i infoboksen er ikke katalogens vokabular. Oversettelsen er tatt av
et menneske, én gang, og skrevet ned — importskriptet nekter fortsatt å gjette:

| Wikipedia | Katalogen | |
|---|---|---|
| Målvakt, Keeper | `GK` | presis |
| Spiss | `ST` | presis |
| Midtstopper, Midtforsvar | `CB` | presis |
| Høyreving | `RW` | presis |
| Forsvar, Forsvarsspiller, **Back** | `forsvar` | lagdel |
| Midtbane(spiller), Sentral midtbane(spiller), Defensiv midtbane/Indreløper | `midtbane` | lagdel |
| Angrep(sspiller), Spiss/Ving, Kant(spiller) | `angrep` | lagdel |

**«Back» er ført som lagdel og ikke som tre naturlige posisjoner.** En back er
ikke midtstopper, så `forsvar` er strengt tatt for vidt. Men lagdelen havner i
`usablePositions` (positionFit **78**, «kan brukes der»), ikke i
`naturalPositions` (**96**, «passer godt»), og det er nøyaktig forskjellen
mellom å si at han *kan* stilles som stopper og at han *er* en. Alternativet —
`["LB","RB","WB"]` som naturlige — ville påstått at han passer godt på alle
tre sider, som kilden ikke sier. Samme resonnement gjelder «Kant».

**Verdier som spenner over to lagdeler er ingen posisjon.** «Forsvar/Midtbane»,
«Back, midtbanespiller», «Venstre back, venstre midtbane» — skjemaet har ingen
form for «forsvar ELLER midtbane», og å velge en av dem er å gjette. De blir
historikkposter: profilen bevares, banen åpner den ikke.

**Epoken.** Kilden daterer hvert opphold, men trekker ingen grense. 1990 er
valgt, målt på **siste år i klubben**, fordi `eraProfiles` i
`football_attributes.json` er en påstand om nettopp forskjellen mellom
systematisert moderne fotball og det som var før. Tre navn uten ett eneste
årstall er utelatt.

**Styrker er ikke lest inn.** En infoboks er en karrieretabell — år, klubb,
kamper — og beskriver ikke hvordan mannen spilte. `tuil_arena` står derfor på
1.01 i `KJENT_UDOKUMENTERT`, som de tretten registerklubbene.

---

## Identitet: 90 krysskoblinger avgjort av kilden selv

En mann med Wikipedia-artikkel har som regel spilt høyere opp, og katalogen har
ham fra før. Importen stoppet på **95 navnekollisjoner**, og hver av dem er en
avgjørelse kilden må ta.

Avgjørelsen er mekanisk, men beviset er kildens: **artikkelens seniorklubber
sammenlignet med katalogprofilens klubbtilknytninger.** Overlapper de, har
kilden selv sagt at det er samme mann — samme belegg som «tidligere
Brannspiller» ga for Bjargs Rolf Birger Pedersen. 90 av 95 gikk opp:

- **John Carew** → Lørenskog. Artikkelen: A-lagsdebut som 16-åring i 1995,
  solgt til Vålerenga før 1997, videre til Rosenborg og Valencia. Katalogen har
  ham på nøyaktig Vålerenga og Rosenborg.
- **Svein Bakke** → Eidsvold Turn. Romerikes Blad: «bærebjelken i Sogndals
  voldsomme opptur». Katalogen har ham på Sogndal.
- **Stian Ringstad** → Eidsvold Turn. Wikipedia: Turn 2004–08, Lillestrøm,
  Braga, Strømsgodset, Ull/Kisa, Turn igjen 2023. Katalogen: Strømsgodset og
  Ull/Kisa.

**Fem er utelatt fordi kilden ikke binder dem sammen** — ingen felles klubb, og
der posisjonen er kjent er den samme lagdelen: Sigurd Prestmo, Marius
Bustgaard Larsen, Matias Aadnøy, Adan Hussein, Sander Werni. Begge utveiene er
en påstand kilden ikke bærer: å slå dem sammen sier at det er én mann, å gi den
nye et klubbsuffiks (som `mathias_engebretsen_kvik`) sier at det er to.
Utelatelse påstår ingenting.

Sigurd Prestmo er den nærmeste på å bli splittet. Wikipedias er
angrepsspiller født 2006 med Trygg/Lade i både ungdoms- og seniorkarrieren;
katalogens er midtbanespiller for Moss. Ulik lagdel og ulik klubb er nøyaktig
belegget Mathias Engebretsen ble splittet på. Forskjellen er at Moss-profilen
selv står som `utledet` — å påstå to menn på styrken av en modellert profil er
en påstand for mye.

---

## Tre hull i importverktøyet, funnet av passet

**En krysskobling til en mann som alt står i arven ble talt to ganger.**
`--suppler` hoppet over en *ny profil* hvis navn alt sto i arven, men en
krysskobling gikk rett gjennom og ga `clubAffiliations` med samme klubb to
steder — som `sync-club-affiliations` og `sim:club-squad` begge feller ved
neste kjøring, altså et sted som ikke peker tilbake på importen. Åtte profiler
traff dette. Behandles nå som gjensyn, slik at en kildefil kan kjøres om igjen
uten å endre katalogen.

**Mellomnavn-sjekken så bare i arven.** Regelen som ble skrevet etter Brattvågs
«Iver Krogh Hagen» sammenlignet den nye raden mot *denne klubbens* profiler.
Wikipedia-passet viste at det var for smalt: «Joachim Olufsen» skulle inn i
Stjørdals-Blink mens `joachim_erlend_olufsen` sto under Rana — ingen felles
arv, ingen eksaktnavn-treff, og importen ville laget mannen på nytt. Sjekken
gjelder nå hele katalogen, som eksaktnavn-sjekken alltid har gjort, og fanget
**13 flere** duplikater.

**Wikipedia-titler bærer en tvetydiggjører.** «Markus Nygård
(fotballspiller)», «Elias Solberg (f. 2004)» — parentesen hører til
artikkelen, ikke til mannen. Ført rått ble id-en `elias_solberg_f_2004`, og
eksaktnavn-sjekken så ikke at «Elias Solberg» alt sto i katalogen. Sju navn
traff dette; de strippes nå før navnet blir en id. (Katalogens egne parenteser
— `Tore Pedersen (RBK)` — er noe annet: et bevisst skille, satt av et menneske.)

---

## Resultatet

| Klubb | Dokumentert | Spillbar | Tilført | Krysskoblet |
|---|---:|---:|---:|---:|
| **Tromsdalen** | 0 → **79** | 0 → **72** | 79 | 23 |
| Stjørdals-Blink | 24 → **78** | 24 → **68** | 54 | 24 |
| Lørenskog | 24 → **58** | 24 → **54** | 34 | 13 |
| Eidsvold Turn | 21 → **54** | 21 → **52** | 33 | 16 |
| Lysekloster | 16 → **27** | 16 → **27** | 11 | 5 |
| Rana | 28 → **30** | 28 → **30** | 2 | 3 |
| Trygg/Lade | 25 → **26** | 25 → **26** | 1 | 1 |

**Tromsdalen sto `pending` med 9 registrerte spillere og ingen bane.** Den var
en av de to klubbene passet før dette ikke kunne lande. Med 72 spillbare er den
`ready`, og `tuil_arena` er banen. **59 av 60 klubber har nå arv; bare Sotra
står igjen.**

Legg merke til at gevinsten er størst der registeret ga minst historie og
Wikipedia mest: Tromsdalen og Stjørdals-Blink har lange OBOS-perioder bak seg
og dermed mange artikler. Rana og Trygg/Lade har fem og sju, og fikk to og ett
navn. **Kildens sjanger avgjør fortsatt hva en klubb kan få**, og det er ikke
noe et verktøy kan rette opp.

---

## De fire redaksjonelle sporene, for ordens skyld

De ble lest før Wikipedia-kategoriene, og de er grunnen til at passet ble
skrevet om.

| Kilde | Ga |
|---|---|
| **Eidsvold Turns adelskalender** (`etf-fotball.no/…/adelskalender`) | **3 navn** med kampantall og periode: Jon Erik Økland (360 kamper, 2008–2022, 104 mål), Terje Røsrud (298, 1994–2007), Jørgen Neumann (295, 1983–1996, 87 mål). Ingen posisjon. Lenken til «komplett adelskalender» peker på `etf.fotballportalen.no`, som ikke lenger finnes. |
| **Stjørdals-Blinks klubbarkiv** (`blink-fotball.no/klubbarkiv/`) | **null navn.** Sida er klubbhistorikk i prosa og en divisjonsliste. Den bekrefter derimot banehistorikken: Øverlands Minde fra 1958, Blinkbanen 2012, Sandskogan fra 2020 — som rettelsen av banenavnet bygget på. |
| **Trygg/Lades historikkside** (`trygglade.no/historikk-og-tilbakeblikk`) | En rik år-for-år-krønike, men navnene er nesten utelukkende **formenn**. Fire menn er navngitt som fotballspillere: Steinar Hegge (toppscorer 1962, 19 mål), Karl Erik Romul (gullballen 1964), Jan-Petter Albertsen og Torbjørn Westad (begge juniornivå 1968). Ingen posisjon, og de to siste er ikke A-lag. |
| **Romerikes Blads «Klubblegende»** (`rb.no/klubblegende/…`) | Den beste av de fire: bildeteksten til opprykkslaget fra 2001 navngir **26 spillere**, og artikkelen gir John Carew som Lørenskogs moderklubbsønn. Men ingen posisjoner, og de ti «største legendene» presenteres i **video** — navnene finnes ikke i tekst. Serien har også en Eidsvold Turn-artikkel som gir Per Brogeland og Kai Sjøberg «på topp» i 1974-laget og Svein Bakke som «sentral». |

**Ingen av dem er importert, og det er en avgjørelse, ikke en forglemmelse.**
Tre grunner, én per kilde:

- **Ingen av dem oppgir posisjon.** Hvert navn ville blitt en historikkpost —
  bevart i klubbpoolen, men banen åpner det ikke. Det er en gyldig form (Pors
  har 47, Brattvåg 63), men den flytter ingen klubb.
- **RBs bildetekst er transkribert med feil.** «Bak fra venstre: … Bjørn Haug
  Stefan Amundsen, …» mangler et komma, og samme avsnitt har
  «Bakken,Lorenzo» og «Yilmaz,LarsLøkstad». Et navn ført feil blir en profil
  som ikke finnes, og den er vanskeligere å oppdage enn en som mangler.
- **Flere av de 26 kolliderer med katalogen** — Kai Arild Lund og Espen Olsen
  sto der fra før — og hver kollisjon må avgjøres mot en kilde som her ikke
  sier noe om identitet. (Espen Olsen ble senere avgjort av Wikipedia:
  HamKam og Strømmen står i begge.)

Til sammenligning ga én Wikipedia-kategori for Tromsdalen 79 navn *med*
posisjon. Konklusjonen er den samme som i avdeling 1, én etasje opp:
**redaksjonelle kilder gir dybde per navn, registre og oppslagsverk gir navn.**
En klubbpool trenger navn først.

Sporene er ikke tømt. RBs ti legender ligger i video, adelskalenderens
komplette liste lå på et domene som ikke lenger svarer, og `web.archive.org`
er ikke tilgjengelig fra dette utviklingsmiljøet (`archive.org` står ikke i
nettpolicyen). Alt fire kildene faktisk ga står i tabellen over, slik at neste
pass slipper å lese dem på nytt for å finne ut det samme.

## Hva passet IKKE gjør

**En supplering kan legge til menn, men ikke skjerpe dem som alt står der.**
Seks profiler kom inn med NFFs register uten posisjon eller med lagdel, og har
nå en Wikipedia-artikkel med presis posisjon — men de hoppes over som gjensyn.
Å la en supplering skrive om en eksisterende profil er en annen operasjon enn
å fylle på, og den er ikke bygget.

**Sotra står igjen.** 12 registrerte spillere, ingen Wikipedia-kategori. Den
trenger enten at troppen i registeret vokser eller en klubbkilde som navngir
spillere med posisjon.

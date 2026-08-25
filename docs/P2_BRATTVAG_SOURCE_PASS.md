# P2 · Brattvåg

Brattvåg er andre merge-enhet i P2-katalogpasset for 2. divisjon, og følger
Pors-formen punkt for punkt.

## Canonical nevner

- 81 kildebårne Brattvåg-profiler i klubbpoolen.
- 79 nye canonical spillerprofiler.
- 2 krysskoblinger til eksisterende profiler: Sivert Solli og Ulrik Valderhaug
  Syversen.
- Klubbmedlemskap materialiseres i `clubAffiliations`. En krysskobling får ikke
  omskrevet eldre `sourcePlaceIds` bare for å bli medlem av Brattvåg, så den
  frosne P1-nevneren står uendret på 936/936.

## Kildekontrakt

Kilden er to lister, og ingenting annet:

| Liste | Innhold | Følge |
|---|---|---|
| Historikk | 63 navn med kampantall, 546 ned til 143 | historikkposter |
| Tropp | 18 navn med posisjon | spillbare |

**Et kampantall er individuelt og dokumentert, men det er ikke en ferdighet.**
Det er tilgjengelighet, og det eneste det belegger er A-lagstilhørighet — det
inklusjonskriteriet Jerv-passet trakk opp. Der stopper det. Ingen styrke, ingen
arketype, ingen rollepreferanse og ingen taktisk preferanse utledes av at en
mann spilte 546 kamper. `audit:club-heritage` krever alle fire feltene tomme
på alle 79 nye profiler, nettopp fordi kampantallet er den ene opplysningen
Pors ikke hadde og derfor den ene fristelsen dette passet har.

Kilden har heller ingen årstall. `eraSource` er derfor `utledet` på alle 79 —
epoken er lest av at en liste er historikk og den andre er dagens tropp, ikke av
en datering — og `classSource` er `utledet` på samme grunnlag som hos Pors.
Provenienskolonnen er det eneste som faktisk lar seg måle her, og vakten låser
den.

De 79 nye eksklusive profilene står 79/79 uten dokumenterte ferdighetsclaims.
`brattvag_stadion` er derfor registrert som 100 % `THIN-SOURCE` i
representativitetsvakten (`KJENT_UDOKUMENTERT` 1,01). Det er en ratchet for
kildegjeld, ikke tillatelse til å modellere: tallet skal bare kunne synke når
individuelle ferdighetskilder faktisk dokumenteres.

## Identitetsavgjørelser

To navn i kilden fantes fra før i katalogen, og begge er koblet på i stedet for
å bli nye profiler. Begge koblinger er påstander, og de står navngitt her fordi
en kobling som ikke er skrevet ned aldri blir etterprøvd.

**Sivert Solli** — Ranheim-profil (`extra_arena`) med RW/ST/AM, Brattvåg-troppen
fører ham som LW/RW. Eksakt navnetreff, overlappende posisjon, vanlig
karrierevei. Ingenting motsier koblingen, og den hører dermed til katalogens
største uverifiserbare klasse: eksakte navnetreff koblet fordi ingenting
motsier dem.

**Ulrik Syversen = Ulrik Valderhaug Syversen** — det eksakte navneoppslaget
kunne aldri sett denne; det var nær-duplikatvakten som fant den. Katalogens
profil er Aalesund-stopper (`color_line_stadion`, CB, moderne), Brattvågs
troppsnavn er CB og moderne. Alt konvergerer, og **Valderhaug er et sted i
Haram** — samme kommune som Brattvåg — så mellomnavnet peker *mot* koblingen.

Det avgjørende er likevel et annet: **en troppsliste som utelater et mellomnavn
påstår ikke at mannen ikke har ett.** Å splitte her ville vært å finne opp en
forskjell ut av en forkortelse. Den dyre feilen katalogen har gjort før —
Finn-Magnus Johannessen mot Finn «Jagge» Johannessen — ble funnet fordi kildene
*motsa* hverandre, to menn på hver sin side av samme kamp. Her motsier ingenting
noe.

**Bjarne Flem er ikke Bjarte Flem.** Flem er et av de vanligste navnene i Haram,
og klubbens egen liste fører fire av dem (Bård, Egil, Hans Inge og Bjarne). Én
bokstav skiller Bjarne fra Tromsøs keeper Bjarte, og de to står i hver sin
klubbkilde med hver sin posisjon. Paret er ført som permanent gjennomgått i
`audit:attributes`.

## Spillbarhetsgrense

De 81 Brattvåg-navnene er én dokumentert historikkatalog, men ikke én automatisk
spillbar tropp.

- **18** profiler har dokumentert posisjon og er spillbare.
- **63** profiler uten dokumentert posisjon beholdes som historikkposter.
- `brattvag_stadion` åpner bare de 18 spillbare profilene.
- Stadionbesøket konstruerer aldri posisjoner, roller, styrker eller taktisk fit.
- Senere kildebelegg kan flytte en historikkpost inn i den spillbare poolen uten
  ny identitet.

## Regresjonskrav

Brattvåg-passet skal ikke endre P1: `audit-p1-source-claims.mjs` skal fortsatt
treffe 936/936 eksklusive profiler og den låste statusfordelingen
45 DOKUMENTERT · 15 DELVIS · 876 THIN-SOURCE.

`audit:club-heritage` låser 81/18/63-grensen, de to krysskoblingene, at de 79
nye profilene er tomme på alle fire modellerbare felt, og stadion-unlocken.
Vakten er felles for alle P2-arver — én rad per klubb — så neste klubb er en
rad, ikke en ny fil.

---

## Supplering 24.08.2026 — NFFs 2026-tropp

Klubbhistorikken over daterer seg ikke selv, og profilene den ga bærer derfor
`eraSource: "utledet"`. **20 navn fra NFFs lagside** (`fiksId=138`, hentet
24.08.2026) er nå lagt oppå med `import-club-heritage --suppler`, og de er
datert: `eraSource: "belagt"`. Arven bærer med det to generasjoner, og det er
den første i katalogen som gjør det.

| | Før | Etter |
|---|---:|---:|
| Dokumenterte | 81 | **93** |
| Spillbare | 18 | **30** |
| Historikkposter | 63 | **63** |

**Åtte av de tjue sto i arven fra før** og ble hoppet over som gjensyn — samme
mann, samme klubb, ett år senere. To av dem stoppet importen først, og det var
riktig av den: `Iver Hagen` mot `Iver Krogh Hagen` og `John Norvik` mot
`John Ruud Norvik` er ikke to menn, det er ett navn med og uten mellomnavn.
Skriptet har nå en egen stopp for nettopp den formen, med begge navnene i
meldingen, i stedet for å lage en dublett.

De tolv nye er 3 keepere og 9 med lagdel (`positionSource: "gruppe"`).

`audit:club-heritage` godtar nå en liste med `eraSource` for en arv, og
`audit:import-club-heritage` rekonstruerer Brattvåg som historien faktisk gikk:
én vanlig import, så én supplering. Det er den eneste måten suppleringsmodusen
måles mot ekte katalogdata på.

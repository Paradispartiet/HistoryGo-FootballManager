# Arbeidsliste — klubbkatalogen

Skrevet 11.08.2026, etter at alle 22 modellerte arver ble konvertert til
source-only. Tallene er målt mot dataene, ikke anslått, og hvert punkt sier
hvordan det måles på nytt.

---

## P0 — to vakter er i ferd med å felle neste endring

Begge er målt, begge ligger mellom en ærlig katalog og et bitt, og begge har
nesten ingen klaring igjen. De feller neste import eller konvertering uansett
hvor riktig den er.

| Vakt | Ærlig | Grense | Klaring | Bitt |
|---|---:|---:|---:|---:|
| Unike styrke-sett, korpus | 43,19 % | 43,00 | **0,19 poeng** | 41,75 % (malimport 100) |
| Toppbøtter | 44,30 % | 45,00 | 0,70 poeng | 48,65 % (flat grunnlinje) |

**Handling:** ikke flytt dem preventivt. Rutinen er fast og skal følges når de
fyrer: mål *begge* endepunktene på nytt, sett grensa mellom dem, aldri under
bittet — og sjekk først at målet fortsatt er **monotont i feilen**. Er det ikke
det, skal vakten skrives om eller legges ned, slik profil-unikheten og medianen
ble.

Den korpusbrede styrke-sett-vakten er den mest utsatte, og den er verdt et
ekstra blikk: den er korpusbred, og fire slike er allerede lagt ned eller
omskrevet. Den ble beholdt fordi den *er* monoton. Neste gang den fyrer, prøv
monotoniteten på nytt før grensa flyttes.

---

## P1 — 1244 spillere har ingen dokumentasjon i det hele tatt

Konverteringen fjernet 1951 ukildede påstander. Den la ikke til noe. Resultatet
er at **22 arver står på 0 % dokumentasjonsdekning**:

| Arv | Eksklusive spillere uten styrker |
|---|---:|
| Haugesund/Haugar/Djerv | 87 |
| Strømsgodset | 84 |
| Rosenborg | 83 |
| Fredrikstad, Skeid | 70 hver |
| Odd, Aalesund | 68–69 |
| Vålerenga | 66 |
| Start | 60 |
| Moss | 58 |
| Lyn | 55 |
| Molde | 54 |
| Tromsø | 53 |
| Viking | 51 |
| Brann, Bodø/Glimt | 47 hver |
| KFUM | 46 |
| Bryne, Sandefjord, Stabæk | 41 hver |
| Kristiansund | 29 |
| Lillestrøm | 24 |

Til sammenlikning har de best dekkede v2-arvene 86 % (Sandnes Ulf) og 77 %
(Hødd). Katalogen som helhet: **470 av 2756 spillere (17 %) har dokumenterte
styrker**.

**Handling:** kildefiler med *individuelle* ferdighetspåstander per spiller —
sitater fra klubben, kampomtaler, trenerutsagn. Det er samme sjanger som Kjelsås
(siterer treneren), Arendal (kampomtaler) og Grorud (spillerportretter), og
målingen fra fem-klubbrunden gjelder fortsatt: **det er hvor mye kilden siterer
som avgjør dekningen**, ikke hvor lang den er.

Prioriter etter størrelse × synlighet: Rosenborg, Vålerenga, Molde, Brann og
Bodø/Glimt er Eliteserie-klubber spilleren møter oftest.

**Måles med:** `sim:player-attributes` → `perArvStyrkesett.median` skal opp fra
63 %, og dekningstabellen over regnes ut med et par linjer mot
`sourcePlaceIds.length === 1`.

---

## P2 — 18 klubber uten arv, alle i 2. divisjon

**Avdeling 1 (10):** Pors · Brattvåg · Eik Tønsberg · Vidar · Kvik Halden ·
Sandviken · Lysekloster · Sotra · Træff · Bjarg

**Avdeling 2 (8):** Tromsdalen · Stjørdals-Blink · Rana · Junkeren · Lørenskog ·
Eidsvold Turn · Follo · Trygg/Lade

Ingen av dem er en blindvei i dag: alle 60 klubber har ligaprofil og spilles som
motstandere med sin egen fotball, og `pending` holder dem bare ute av
overtakelseslista. Nivå 3 har 10 overtakbare klubber av 28, og **avdeling 1 er
den tynneste flaten i spillet med 4 av 14**.

**Handling:** v2-kildefiler i samme form som de siste 16 importene. Hver klubb
trenger også en `placeId` (alle har `ground` uten), og importen lager stedet.

**Rekkefølge:** avdeling 1 først — den er tynnest.

---

## P3 — restpunkter fra de to auditene

- **Filrydding utenfor repoet.** Sperrelista i sluttauditen (gamle
  `*_utvidede_*`-filer, ASCII-duplikatet av Hønefoss, den ene av to Jerv-kopier,
  gamle `Notodden.md` og `Honefoss.md`). Ingenting av dette bor i repoet, men
  det avgjør hva som kan bli importert ved en feiltakelse.
- **Rolf Halvorsen** (Strømsgodset, 274 kamper) står utenfor katalogen fordi
  kilden gir ham «Uavklart historisk hovedposisjon». Han kommer inn den dagen en
  kilde plasserer ham. Samme gjelder Brynes 1928-lag (17 navn) og tre
  Moss-profiler.
- **Fellesnavn uten motsigelse** er katalogens største uverifiserbare klasse:
  eksakte navnetreff koblet fordi ingenting motsier dem. Den vokser med hver
  arv. Ingen handling nå — men den bør ikke oppdages på nytt som en overraskelse.

---

## Slik måles status

```bash
npm run sim:player-attributes   # modellerteArver, toppbøtter, perArvStyrkesett
npm run sim:club-squad          # arvetabellen i docs/klubbvalg.md mot dataene
node scripts/sync-club-affiliations.mjs   # ready/pending per klubb
```

`modellerteArver.arver` skal være **0**. Går den opp, er en arv importert med
utfylte felt, og da er gjelden tilbake.

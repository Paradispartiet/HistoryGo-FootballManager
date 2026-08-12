# Arbeidsliste — klubbkatalogen

Skrevet 11.08.2026, etter at alle 22 modellerte arver ble konvertert til
source-only. Tallene er målt mot dataene, ikke anslått, og hvert punkt sier
hvordan det måles på nytt.

---

## P0 — GJORT (11.08.2026)

Begge vaktene er behandlet, og de svarte forskjellig på monotonitetsprøven:

- **Toppbøtter** var ikke bare feil satt, den var feil form. Tallet SYNKER med
  en malimport (44,30 → 42,73 ved 600 spillere), så terskelen har aldri kunnet
  fange feilen. Erstattet av en relativ vakt: posisjonsvektingen må bidra minst
  1,5 poeng mindre klumping enn en flat grunnlinje. Begge endepunktene regnes ut
  hver kjøring, så den kan ikke bli utdatert. Verifisert isolert.
- **Unike styrke-sett** er monoton (43,19 → 37,02 → 27,40 → 19,72) og ble
  remålt: grensa fra 0,43 til **0,40**, 3,2 poeng klaring hver vei.

Se `docs/klubbvalg.md` for målingene. Regelen som nå har avgjort fire vakter:
**sjekk om målet er monotont i feilen før grensa flyttes** — og hvis det ikke er
det, skriv om eller legg ned.

## P1 — dekningen bygges tilbake, én arv om gangen (8 av 22 gjort)

Konverteringen fjernet 1951 ukildede påstander. Den la ikke til noe, og etterlot
22 arver på 0 % dokumentasjonsdekning. Kildepasset er svaret: hver eksklusive
profil leses på nytt mot en faktisk kilde, og passet skiller tre tilstander.
Bare den første gir styrker.

| Kildestatus | Betyr | Resultat |
|---|---|---|
| DOKUMENTERT | en kilde beskriver mannen | styrker legges tilbake |
| DELVIS | karriere og rolle er dokumentert | tom liste — en rolle er ingen ferdighet |
| THIN-SOURCE | ingen beskrivende kilde funnet | tom liste |

| Arv | Eksklusive | Uten styrker | Dekning |
|---|---:|---:|---:|
| **Haugesund/Haugar/Djerv** | 87 | 50 | **43 %** |
| **Strømsgodset** | 84 | 63 | **25 %** |
| **Molde** | 54 | 41 | **24 %** |
| **Rosenborg** | 83 | 66 | **20 %** |
| **Vålerenga** | 66 | 53 | **20 %** |
| **Brann** | 47 | 42 | **11 %** |
| **Bodø/Glimt** | 47 | 43 | **9 %** |
| **Viking** | 51 | 48 | **6 %** |
| Fredrikstad, Skeid | 70 hver | 70 | 0 % |
| Aalesund | 69 | 69 | 0 % |
| Odd | 68 | 68 | 0 % |
| Start | 60 | 60 | 0 % |
| Moss | 58 | 58 | 0 % |
| Lyn | 55 | 55 | 0 % |
| Tromsø | 53 | 53 | 0 % |
| KFUM | 46 | 46 | 0 % |
| Bryne, Sandefjord, Stabæk | 41 hver | 41 | 0 % |
| Kristiansund | 29 | 29 | 0 % |
| Lillestrøm | 24 | 24 | 0 % |

Til sammenlikning har de best dekkede v2-arvene 86 % (Sandnes Ulf) og 77 %
(Hødd). Katalogen som helhet: **592 av 2756 spillere (21,5 %) har dokumenterte
styrker**, opp fra 470 (17 %) rett etter konverteringen.

Rangeringen gjentar aksen alle de tynne kildene har vist: **det er hvor mye
kilden siterer som avgjør dekningen, ikke hvor lang den er.** Rosenborg har mest
dokumentasjon av alle 42 klubbene og lav dekning — mesteparten handler om
meritter og kampmengde, som er produksjon og karriere, ikke ferdigheter.
Vålerenga ligger på samme nivå fordi nyhetsarkivet siterer trenere ved navn,
mens Viking og Bodø/Glimt faller til 6–9 % fordi passene der i hovedsak fant
Store norske leksikon og klubbens spillersider — leksikonet beskriver bare de
aller største, spillersidene fører kampdata. Det er en forskjell i
**kildesjanger**, ikke i klubbstørrelse.

**Handling for de 14 som står igjen:** kildefiler med *individuelle*
ferdighetspåstander per spiller — sitater fra klubben, kampomtaler,
trenerutsagn. Samme sjanger som Kjelsås (siterer treneren), Arendal
(kampomtaler) og Grorud (spillerportretter).

Prioriter etter størrelse × synlighet: Lillestrøm, Tromsø, Odd, Sandefjord,
Kristiansund og KFUM er Eliteserie-klubber spilleren møter oftest; Fredrikstad
og Skeid har de største gjenstående poolene.

**Måles med:** `sim:player-attributes` → takene i `KJENT_UDOKUMENTERT` for de
åtte arvene er målt NED fra 1,01 (0,59 · 0,76 · 0,77 · 0,80 · 0,81 · 0,90 ·
0,92 · 0,95) og skal fortsette nedover. Dekningstabellen over regnes ut med et
par linjer mot `sourcePlaceIds.length === 1`.

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

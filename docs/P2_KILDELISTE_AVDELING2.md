# P2 · kildeliste for de åtte gjenstående i avdeling 2

> **Lest 26.08.2026, og konklusjonen står ikke.** Alle fire de redaksjonelle
> sporene under — adelskalenderen, klubbarkivet, historikksida og
> «Klubblegende»-serien — er lest. Til sammen ga de ingen navn som kunne
> importeres: de oppgir ikke posisjon, og Romerikes Blads bildetekst er
> transkribert med feil. Dybden kom fra **no.wikipedias klubbkategorier** i
> stedet. Se `docs/P2_WIKIPEDIA_DYBDEPASS.md` for hva hver av de fire faktisk
> inneholdt, slik at ingen trenger å lese dem på nytt for å finne det samme.


**Dette dokumentet er et FINNEVERKTØY, ikke en kilde.** Innholdet er satt sammen
av websøk, og et søketreff er en oppsummerers parafrase av en side ingen her har
åpnet. Ingenting herfra skal importeres som en påstand — listen sier hvor
kildene *finnes*, slik at noen kan hente dem. Alt merket «lead» er ukontrollert.

Nettverkspolicyen i utviklingsmiljøet blokkerer alle eksterne verter, så sidene
må hentes utenfra. Se `docs/P2_KILDELISTE_AVDELING1.md` for samme kartlegging av
den andre avdelingen.

---

## Rangert etter forventet utbytte

Aksen er den samme: **det avgjørende er hvor mye kilden siterer, ikke hvor lang
den er.**

| # | Klubb | Bane | Beste kildespor | Forventning |
|---|---|---|---|---|
| 1 | **Eidsvold Turn** | Myhrer stadion | **egen adelskalender** | Brattvåg-formen, best i avdelingen |
| 2 | **Stjørdals-Blink** | Sandskogan stadion | **eget klubbarkiv** | rikt, men fire ganger flyttet bane |
| 3 | **Trygg/Lade** | Lade idrettsanlegg | egen historikkside | sammenslåing 1986 |
| 4 | **Lørenskog** | Rolvsrud stadion | RBs «Klubblegende»-serie | portrettsjanger = dekning |
| 5 | **Follo** | Ski stadion | cupfinalen 2010 | ung klubb, én stor sesong |
| 6 | **Rana** | Sagbakken | klubbside | sammenslåing 2017 |
| 7 | **Tromsdalen** | TUIL Arena | forbundsdata | tynt |
| 8 | **Junkeren** | Nordlandshallen | forbundsdata | tynnest |

---

## Fire banenavn var gale, og er rettet

Samme mønster som i avdeling 1, og det er verdt å se formen: **et banenavn som
er klubbnavnet med «stadion» eller «kunstgress» påhengt, er nesten alltid en
generatorrest og ikke et virkelig anleggsnavn.**

| Klubb | Sto som | Heter | Feiltype |
|---|---|---|---|
| Tromsdalen | Tromsdalen kunstgress | **TUIL Arena** | generatorrest |
| Lørenskog | Lørenskog stadion | **Rolvsrud stadion** | generatorrest |
| Junkeren | Bodø Spektrum kunstgress | **Nordlandshallen** | feil anlegg i samme by |
| Stjørdals-Blink | Øverlands Minde | **Sandskogan stadion** | utdatert med to hjemmebaner |

- **TUIL Arena** — klubbeid kunstgress, åpnet 1983, 3 200 plasser. Bekreftet av
  klubbens egen anleggsside, no./en.wikipedia, NFFs anleggsregister,
  Transfermarkt og Nordic Stadiums. Alfheim er Tromsø ILs bane, ikke Tromsdalens.
- **Rolvsrud stadion** — Ole Reistads vei 2, kommunalt driftet, åpnet 1950.
  Klubbens egen klubbhåndbok har egen side for den, og NFFs anleggsregister
  fører den. Bane 2 heter **John Carew-banen**, og Carew ligger alt i katalogen
  (Ullevaal + Intility) — en åpenbar krysskoblingskandidat om en Lørenskog-arv
  kommer.
- **Nordlandshallen** — 11-er kunstgress, 101 × 66 m, kommunalt driftet. NFFs
  register fører den med fem baneoppføringer, og klubben bruker den til både
  senior- og aldersbestemt fotball. Bodø Spektrum er et annet anlegg i samme by.
- **Sandskogan stadion** — Øverlands Minde var hjemmebane **fra 1958**, deretter
  Nye Blinkbanen fra 2012, og Sandskogan fra sesongstart 2020. Katalogen bar
  altså en bane klubben forlot for over ti år siden. Navnet er ført
  **sponsorfritt**: anlegget har hett «M.U.S. Stadion Sandskogan» og fra 2025
  «Tverås Stadion Sandskogan», og klubbfila slår selv fast at «banenavn følger
  sponsorer og skifter oftere enn klubbene gjør».

Fire banenavn var allerede riktige og er urørt: Myhrer stadion, Ski stadion,
Lade idrettsanlegg og Sagbakken.

**Ingen ligaprofil måtte rettes.** Vidar-feilen i avdeling 1 hadde forplantet seg
til `styleName` og `tacticalSchool`, så alle åtte profilene her er kontrollert.
De henter navnet fra klubben, ikke fra banen, og geografien stemmer: «Nabo til
TIL», «Bodøs andre klubb», «Cupfinalisten fra Ski», «Bydelsklubb i Trondheim».

---

## Per klubb

### Eidsvold Turn (`eidsvold_turn`)

- **Adelskalender:** https://etf-fotball.no/seniorgruppa/menn-2-div/na-er-turns-adelskalender-oppdatert
- Klubbside: https://etf-fotball.no/klubben · banekart: http://www.etf-fotball.no/klubben/banekart-myhrer-stadion
- Wikipedia: https://en.wikipedia.org/wiki/Eidsvold_TF
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=1753

**Den beste kilden i hele avdelingen.** En adelskalender er navn med kampantall
per mann — nøyaktig Brattvåg-formen, som gir historikkposter med dokumentert
A-lagstilhørighet.

**Advarsel fra Kongsvinger-passet:** en adelskalender bærer sitt eget
publiseringsår, og det er ikke et karriereår. Kongsvinger-importen daterte en
sølvvinner fra 1992 som `modern` fordi publiseringsåret 2023 ble lest som hans.
Strip publiseringsåret før epoken utledes.

*Leads, ukontrollerte:* stiftet som Eidsvold IL 29.04.1910, navn Eidsvold TF fra
1912, Myhrer ervervet 1916. 2.-plass i gamle 2. divisjon 1974; cupens 4. runde
mot Rosenborg på Myhrer i 1973 med ~5 000 tilskuere. Nyere eliteseriespillere
nevnt: Martin Trøen (Sogndal), Stian Ringstad (LSK), Frode Bjørnevik (HamKam) —
alle tre klubbene har arv i katalogen, så det er krysskoblingskandidater.
Kari Reynheim oppgis med 53 landskamper for Færøyene; **kilden må si hvilket lag
og hvilket kjønn** før noe importeres — samme felle som Sandviken i avdeling 1.

### Stjørdals-Blink (`stjordals_blink`)

- **Klubbarkiv:** https://blink-fotball.no/klubbarkiv/
- Klubbside: https://blink-fotball.no/ · https://blink-fotball.no/innledning/
- Anlegg: https://blink-fotball.no/m-u-s-sandskogan-stadion/
- Wikipedia: https://no.wikipedia.org/wiki/Idrettslaget_Stjørdals-Blink
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=1627

Et **klubbarkiv** er den sjangeren som gir mest, på linje med Bjargs
historienettsted i avdeling 1.

**Sammenslåing 1956** av Stjørdal idrettslag (tidligere Stjørdal
arbeideridrettslag) og Idrettslaget Blink. Kilden må si hvilken enhet en spiller
representerte, som hos Sotra og Rana.

Klubbsidene har egne dame- og herresider, så laget lar seg skille — bruk
https://blink-fotball.no/a-laget/ mot https://blink-fotball.no/damelaget/.

### Trygg/Lade (`trygg_lade`)

- **Historikkside:** https://www.trygglade.no/historikk-og-tilbakeblikk
- Klubbside: https://www.trygglade.no/sk-trygg-lade
- Wikipedia: https://en.wikipedia.org/wiki/SK_Trygg/Lade
- Forbundet, anlegg: https://www.fotball.no/fotballdata/anlegg/hjem/?fiksId=12222

**Sammenslåing 04.02.1986** av SK Tryggkameratene (stiftet 15.05.1910, holdt til
på Buran) og Lade IL (stiftet 13.06.1963). To forgjengere med hver sin epoke, og
navnet er sammensatt av begge — kilden må si hvilken.

### Lørenskog (`lorenskog`)

- Klubbside: https://lorenskogif.no/klubben/om-klubben
- Anlegg: https://lorenskogif.no/klubbhandbok/anlegg/rolvsrud-stadion/rolvsrud-stadion
- **Romerikes Blad, «Klubblegende»-serien:** https://www.rb.no/klubblegende/klubblegende-lorenskog/lorenskog-if/stabilt-i-27-ar-ett-jubelar/s/5-43-248417
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=130

**«Klubblegende» er portrettsjanger**, og portretter er det som faktisk gir
dokumenterte styrker — jf. Grorud og Vålerenga. Verdt å lete etter flere deler i
serien.

*Leads, ukontrollerte:* stiftet 17.04.1929; opprykk 1988; 25 av 27 sesonger på
nivå 3 etterpå. ~950 aktive spillere.

### Follo (`follo`)

- Klubbside: https://follofk.spond.club/om_oss
- Wikipedia: https://en.wikipedia.org/wiki/Follo_FK
- worldfootball: https://worldfootball.net/teams/follo-fk

**Ung klubb med én stor sesong.** Stiftet 29.09.2000 som paraply for
fotballavdelingene i fem lokale lag — Ås IL, Oppegård IL, Langhus IL, Ski IL og
Nordby IL. Cupfinalen i 2010 er den store historien: Lillestrøm slått 4–2 i
3. runde og Rosenborg 3–2 i semifinalen.

**Cupfinalelaget er fristelsen.** Merittregelen gjelder: en tittel eller en
finaleplass tilhører laget, ikke mannen, og «var med i cupfinalelaget 2010» blir
aldri en ferdighet. Sarpsborg-passet viste hva den kartleggingen gjør i skala.

### Rana (`rana`)

- Klubbside: https://www.ranafk.no/om-klubben/
- Wikipedia: https://en.wikipedia.org/wiki/Rana_FK
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=3262

**Stiftet 04.12.2017** som sammenslåing av Mo IL og fotballavdelingen i IL
Stålkameratene. Klubben er altså yngre enn historien den forvalter: Mo IL spilte
NM-semifinale mot Vålerenga på gamle Sagbakken i september 1980 foran over
10 000. Kilden må si hvilken enhet en spiller representerte.

Sagbakken stadion sto ferdig august 2009, kapasitet 1 200, kommunalt eid.

### Tromsdalen (`tromsdalen`)

- Klubbside/anlegg: https://tuilfotball.no/anlegg
- Wikipedia: https://en.wikipedia.org/wiki/Tromsdalen_UIL · https://en.wikipedia.org/wiki/TUIL_Arena
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=3033

*Leads, ukontrollerte:* Tromsdalen UIL stiftet 1938, seksjoner for fotball,
friidrett, ski og turn.

Søket fant ingen klubbhistorikk med spillernavn. Blir troppslista den beste
kilden, er Brattvåg-formen riktig utfall.

### Junkeren (`junkeren`)

- Wikipedia: https://en.wikipedia.org/wiki/IK_Junkeren
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=1299
- Anlegg: https://www.fotball.no/fotballdata/anlegg/hjem/?fiksId=3303

Klubbens fulle navn er **IK Junkeren**, stiftet 1958. Katalogen bruker kortformen
som ellers, det er greit.

**Én identitetsfelle er alt synlig:** søket oppgir klubbens trener som **Thor
Mikalsen**, og katalogen har en Thor Mikalsen i Bodø/Glimt-poolen. Samme navn,
samme by. Det er nøyaktig restklassen `audit:attributes` teller — koblet på
navnet alene — og en trener er dessuten ikke en spiller. Ikke koble uten kilde.

Søket fant ingen klubbhistorikk. Tynnest i avdelingen.

---

## Tre tier-avvik, ingen rørt

Søket oppgir **Junkeren**, **Lørenskog** og **Trygg/Lade** i 3. divisjon, mens
katalogen har dem i 2. divisjon avdeling 2. Det er samme spørsmål som Vidar i
avdeling 1, og samme svar: `data/football_clubs.json` er uttrykkelig et
**2026-øyeblikksbilde**, opp- og nedrykk i spillet flytter klubber uten at fila
endres, og `audit:clubs` krever fjorten lag i hver avdeling. Å ta en klubb ut
krever at noen bestemmer hvem som skal inn. Det er en designavgjørelse om
pyramidens sammensetning, ikke en datakorreksjon.

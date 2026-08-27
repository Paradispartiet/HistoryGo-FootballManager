# P2 · Kvik Halden — importert

**41 dokumenterte A-lagsnavn, 23 spillbare. Klubben er `ready` og kan overtas.**

Passet stoppet først på ett spørsmål som ikke var avgjort før: teller en kilde
som sier «forsvar» som posisjon? Svaret ble **ja, men oppløsningen skal stå i
dataene** — se «Lagdel som posisjon» under. Med dagens praksis alene, bare
presise posisjoner, ville Kvik Halden fått 9 spillbare og forblitt `pending`.

| | |
|---|---:|
| Dokumenterte klubbprofiler | 41 |
| Spillbare (posisjon eller lagdel) | 23 |
| Historikkposter | 18 |
| Nye canonical profiler | 39 |
| Krysskoblinger | 2 |
| Utelatt på motsigelse | 3 |

---

## Hva kildene ga

| Kilde | Navn | Med presis posisjon |
|---|---:|---:|
| Klubbens egen historikk, årstallsliste 1906–2020 | 12 | 0 |
| Wikipedia, bildetekst cupfinalen 1918 | 11 | 0 |
| Wikipedia, A-lagstroppen per 27.07.2023 | 24 | 3 |
| Wikipedia, individuelle spillerartikler | — | 1 |
| SNL | 1 | 0 |
| **Union, uten dubletter** | **44** | **9** |

Fire navn går igjen mellom 1918-laget og landslagslista (Helgesen, Puck, Arne
Andersen, Flinth). Fem finnes i katalogen fra før og er krysskoblinger, ikke nye
profiler.

### De historiske: 20 navn, ingen posisjon

Klubbens egen historieside fører opp landslagsuttak år for år, og det er
A-lagsrepresentasjon: mennene spilte for Kvik da de ble uttatt.

> «1916: … Første landslagsspillere, Wilhelm Strand og Yngvar Tørnros.»
> «1917: … Johnny Helgesen og Peder Puck spiller på landslaget.»
> «1924: … Arne Andersen og Alf Flinth spiller på landslaget.»
> «1928: … Robert Danielsen og Johnny Helgesen spiller på landslaget.»
> «1934: … Roy Fosdahl og Thorleif Svendsen spiller på landslaget.»
> — *kvikhaldenfk.spond.club/historien*

I tillegg navngir Wikipedia hele cupvinnerlaget fra 1918 i en bildetekst: Peder
Puck, Alf Flinth, Thomas Andresen, Johan Svendsen, Ole Paulsen, Otto Klein,
Fritz Karlsen, Arne Andersen, Johnny Helgesen, Ole Poulsbo og Hartvig Olavesen.
Rekkefølgen er «fra venstre» i et fotografi og sier **ingenting om posisjon** —
den skal ikke leses som en oppstilling.

Wilhelm Nilsen, Arne Johansen og Alf Johansen kommer fra landslagsårene
1922–1926. Raymond Kvisvik kom i 2009 («skriver under på en treårskontrakt med
Kvik Halden»).

**Oscar Krabseth og Karl August Andersen er ikke spillere.** Krabseth satt i
Forbundsstyret og ble visepresident; Andersen dømte cupfinalen i 1923 og en
landskamp i 1928. Klubbens stiftelsesstyre fra 1906 — Edvard Sem jr., Oscar
Carling, Marinius Ramstad, Ole Dahl, Johan Veden Larsen — er tillitsvalgte, og
kilden sier ikke at de spilte.

### Den ene med presis posisjon fra en individkilde

> `posisjon = Centerforward` · `klubb1 = Kvik Halden` · `år1 = 1915–1933`
> · landslag 1917–1928, 22 landskamper (7 mål)
> — *no.wikipedia.org/wiki/Johnny_Helgesen*

Centerforward er `ST`. Dette er også den eneste profilen i hele passet der en
individkilde beskriver spilleren, altså den eneste kandidaten til et
P1-claim — og artikkelen gir ingen ferdighetsbeskrivelse, bare posisjon og tall.

### 2023-troppen: 24 navn, men posisjonen er en gruppe

Wikipedia fører A-lagstroppen per 27. juli 2023, med kilde til klubbens egen
troppsside. Posisjonskodene er `K` (3), `F` (8), `MB` (8) og `A` (5) — keeper,
forsvar, midtbane, angrep.

`K` er entydig `GK`. **De tre andre er grupper, ikke posisjoner.** «Forsvar» kan
være CB, LB, RB eller WB, og kilden sier ikke hvilken.

---

## Lagdel som posisjon

Motorens egen troppsmodell er bygget på nøyaktig fire lagdeler (`SQUAD_GROUPS` i
`src/football-club-squad.js`: 2 GK, 5 forsvar, 5 midtbane, 3 angrep). Kildens
presisjon treffer altså motorens strukturelle presisjon eksakt. Men
`naturalPositions` er et felt for posisjoner, ikke for lagdeler.

**Løsningen ble ikke å skrive lagdelen som naturlige posisjoner.**
`calculatePositionFit` gir **96** for en naturlig posisjon og **78** for en
brukbar. «Forsvar» ført som fire naturlige posisjoner ville påstått at mannen
passer *godt* som både midtstopper, høyreback og venstreback — en allsidighet
ingen kilde har hevdet. Ført som **brukbare** sier den at han kan brukes der,
som er det kilden faktisk sier.

En lagdel importeres derfor slik:

```json
{ "name": "Ole Strømsborg", "positionGroup": "forsvar", "era": "modern" }
```

```json
"naturalPositions": [],
"usablePositions": ["CB", "LB", "RB", "WB"],
"positionSource": "gruppe",
"warningWhenMisused": "Kilden oppgir bare lagdel (forsvar), ikke posisjon. …"
```

`positionSource: "gruppe"` gjør oppløsningen målbar. Et senere kildepass kan
skjerpe profilen uten å gjette, og ingen kan tro at oppløsningen er finere enn
den er. Presise posisjoner bærer ikke feltet.

**Keeper er ikke en lagdel.** «Keeper» og `GK` er samme oppløsning, så en
troppsliste som sier keeper gir en presis posisjon. Importen avviser
`positionGroup: "keeper"`.

`audit:import-club-heritage` håndhever begge veier, på hele katalogen: en profil
kan ikke bære `positionSource` uten å ha en hel lagdel i `usablePositions`, og
den kan ikke bære en hel lagdel uten merket. Grov oppløsning skal ikke kunne se
presis ut.

### Hva som ble spillbart

| Kilde | Oppløsning | Antall |
|---|---|---:|
| Johnny Helgesen, egen artikkel | `ST`, presis | 1 |
| Troppen 2023, `K` | `GK`, presis | 3 |
| Troppen 2023, `F` | lagdel forsvar | 8 |
| Troppen 2023, `MB` | lagdel midtbane | 5 |
| Troppen 2023, `A` | lagdel angrep | 4 |
| Krysskoblinger med posisjon fra før | presis | 2 |
| **Sum spillbare** | | **23** |

De 18 øvrige — cupvinnerlaget fra 1918 og landslagsspillerne fra 1916–1934 — er
historikkposter. De står i klubbpoolen, men banen åpner dem ikke, fordi ingen
kilde sier hvor på banen de spilte. Bildeteksten til cupfinalen lister laget
«fra venstre» i et fotografi, og det er ingen oppstilling.

---

## To ting kildelista ikke hadde flagget

### Kvik Halden er en sammenslåing fra 1997

> «I 1997 fikk klubben sitt nåværende navn etter at Fotballklubben Kvik og
> Halden Fotballklubb slo seg sammen og ble til Kvik Halden Fotballklubb.»

Cupgullet i 1918 og cupfinalene i 1915 og 1922 ble tatt av **FK Kvik**, ikke av
Kvik Halden. Alle de tjue historiske navnene tilhører FK Kvik-perioden. Det er
samme problem som Sotra (tre forgjengere fra 2009), og kildelista flagget det
for Sotra, Sandviken, Eik og Træff — men ikke for Kvik Halden.

Wikipedia legger til at sammenslåingen var omstridt, og at noen mener FK Kvik i
praksis overtok Halden FK. **Ingen navn fra Halden FK-siden er funnet**, så
spørsmålet om hvordan de to forgjengerne skal skilles er ikke utløst av dette
passet — men det vil bli det hvis en Halden FK-kilde dukker opp.

### Navnekollisjonene er reelle, og de traff

Seks av de tjue historiske navnene har en artikkel på no.wikipedia. **Tre av dem
er en annen person:**

| Navn | Artikkelen handler om |
|---|---|
| Arne Johansen | en skøyteløper (1927–2013, Arbeidernes SK, OL-bronse 1952) |
| Johan Svendsen | komponisten (1840–1911) |
| Thomas Andresen | en dansk ordfører i Aabenraa (f. 1964) |

Bare Johnny Helgesen, Arne Andersen og Raymond Kvisvik er den rette mannen.
Dette er P3-klassen «fellesnavn uten motsigelse» i praksis, og grunnen til at
`import-club-heritage` stopper på ethvert navn som finnes i katalogen fra før.

**Og én motsigelse til, i selve troppen:** katalogen har `mathias_engebretsen`
med `naturalPositions: ["GK"]`, mens Wikipedias Kvik-tropp fører Mathias
Engebretsen som `MB` — midtbane. Enten er det to forskjellige menn, eller så tar
én av kildene feil. Krysskoblingen skal ikke gjøres før det er avklart.

---

## Krysskoblinger: to gjort, tre utelatt

Fem av de 44 navnene finnes i katalogen fra før. **Fire av dem har en
posisjonsmotsigelse mellom 2023-troppen og katalogen**, og en krysskobling er en
navngitt påstand om at det er samme mann. Bare de to som er bekreftet av sin egen
individkilde er koblet.

| Navn | Katalogen | Troppen 2023 | Avgjørelse |
|---|---|---|---|
| Raymond Kvisvik | `raymond_kvisvik`, LW/RW | — (2009-signering) | **koblet** — egen artikkel: Kvik Halden 2009–2011, 34 kamper |
| Fabian Stensrud Ness | `fabian_stensrud_ness`, ST | `A` angrep | **koblet** — samme lagdel, ingen motsigelse; egen artikkel nevner Kvik |
| Marius Ophaug | `marius_ophaug`, ST/RW | `MB` midtbane | **utelatt** — motsier hverandre, og navnet er ikke lenket i troppen |
| Mathias Engebretsen | `mathias_engebretsen`, GK | `MB` midtbane | **utelatt** — keeper mot midtbanespiller er den hardeste motsigelsen |
| Henrik Hagen | `henrik_hagen`, CB | `MB` midtbane | **utelatt** — motsier hverandre; artikkelen nevner ikke Kvik |

De tre utelatte er ikke avvist som spillere. De er avventet: enten er det to
menn med samme navn, eller så tar én av kildene feil om posisjonen, og
`homePlaceId`-tilknytningen er permanent. Klubbens egen troppsside vil avgjøre
det når den blir tilgjengelig — Wikipedias troppsliste siterer den, men den lot
seg ikke hente.

Kvik Halden når 23 spillbare uten dem, altså godt over de femten som kreves, så
avventingen koster ingenting nå.

---

## Kilder, lest 24.08.2026

| Kilde | URL | Ga |
|---|---|---|
| Klubbens historikk | https://kvikhaldenfk.spond.club/historien | 12 navn via landslagsuttak, sammenslåingen 1997, årstallsliste |
| Wikipedia (no) | https://no.wikipedia.org/wiki/Kvik_Halden_Fotballklubb | 1918-laget (11 navn), 2023-troppen (24 navn, gruppeposisjon) |
| Wikipedia (en) | https://en.wikipedia.org/wiki/Kvik_Halden_FK | meritter, sammenslåingen, banenavn |
| Wikipedia, individuelle | Johnny Helgesen, Arne Andersen, Raymond Kvisvik m.fl. | 1 presis posisjon, 3 feilperson-treff |
| SNL | https://snl.no/Kvik_Halden_Fotballklubb | stubb: «Kjent spiller: Johnny Helgesen» |
| Klubbsiden | https://kvikhalden.no/ · /stjernelag | ingen troppsside tilgjengelig; «Stjernelag» er et inkluderende tilbud, ikke et all-time-lag |
| Forbundet | https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=3 | JS-rendret, blokkerer proxyen |

**Banenavnet står urørt.** Katalogen har «Halden stadion»; både no. og
en.wikipedia fører `Halden Stadion` som hjemmebane, kapasitet 5 000 (4 000
sitteplasser), åpnet 1927 ifølge klubbens egen årstallsliste.

---

## Supplering 24.08.2026 — NFFs 2026-tropp

**Notatet over om forbundet er feil, og feilen kostet seks klubber.** Tabellen
sier at fotball.no er «JS-rendret, blokkerer proxyen». Det stemmer for
*klubbsiden*. **Lagsiden er server-rendret**, og der ligger hele troppen
gruppert under Keeper · Forsvar · Midtbane · Angrep — nøyaktig oppløsningen
`positionGroup` er bygget for. `curl` holder. `scripts/nff-squad.mjs` gjør
jobben nå, så neste sesong slipper å finne veien på nytt.

**21 navn fra lagsiden** (`fiksId=139`, hentet 24.08.2026) er lagt til med
`import-club-heritage --suppler`:

| | Før | Etter |
|---|---:|---:|
| Dokumenterte | 41 | **56** |
| Spillbare | 23 | **38** |
| Historikkposter | 18 | **18** |

Seks av de 21 sto i arven fra før — 2023-troppen fra Wikipedia og 2026-troppen
fra registeret overlapper — og ble hoppet over som gjensyn. De 15 nye er
2 keepere og 13 med lagdel.

Ett navn måtte avgjøres: **Mathias Engebretsen** finnes i katalogen som
Sarpsborgs keeper. Kvik Haldens er midtbanespiller. Ulik lagdel og ulik klubb er
to menn, ikke én, så han er ført som `mathias_engebretsen_kvik` etter mønsteret
fra `tore_pedersen_rbk` og `sverre_andersen_odd`, og navneparet er registrert
permanent i `REVIEWED_NAME_PAIRS` med den begrunnelsen.

# P2 · Kvik Halden — kildepass, stoppet på én avgjørelse

**44 dokumenterte A-lagsnavn er funnet. Om klubben blir spillbar avhenger av
ett spørsmål som ikke er avgjort før: teller en kilde som sier «forsvar» som
posisjon?**

Med dagens praksis — bare presise posisjoner — er 9 av de 44 spillbare, og
klubben når ikke de 15 som kreves. Godtas gruppenivå, blir omtrent 25 spillbare
og Kvik Halden lander som tredje ferdige P2-arv.

Spørsmålet gjelder ikke bare Kvik. Det avgjør formen på alle de fjorten
gjenstående klubbene, og det er derfor det ikke er avgjort her.

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

## Avgjørelsen

Motorens egen troppsmodell er bygget på nøyaktig disse fire gruppene
(`SQUAD_GROUPS` i `src/football-club-squad.js`: 2 GK, 5 forsvar, 5 midtbane,
3 angrep). Kildens presisjon treffer altså motorens strukturelle presisjon
eksakt. Men `naturalPositions` er et felt for posisjoner, ikke for grupper.

**Alternativ A — bare presise posisjoner (dagens praksis).**
Pors og Brattvåg brukte utelukkende presise, oftest enkeltverdier. «Forsvar»
blir da ingen posisjon, og profilen blir en historikkpost.
Resultat: **9 spillbare av 44. Kvik Halden når ikke 15 og forblir `pending`.**

**Alternativ B — gruppen skrives som gruppens posisjoner.**
`F` blir `["CB","LB","RB","WB"]`. Det påstår ikke mer enn kilden sier — «han
spilte i forsvaret» — og motoren kan stille laget.
Resultat: **~25 spillbare. Kvik Halden lander.**
Innvendingen: `naturalPositions` mater `positionFit`. Fire naturlige posisjoner
påstår en allsidighet kilden ikke hevder, og en venstreback ville blitt regnet
som like naturlig midtstopper. Presisjonsforskjellen ville dessuten vært usynlig
for den som leser dataene senere.

**Alternativ C — som B, men presisjonen gjøres synlig i dataene**, for eksempel
med et eget felt som sier at posisjonen er lest på gruppenivå. Da kan en vakt
skille de to klassene, og et senere kildepass kan skjerpe dem uten å gjette.
Dette er en schemaendring og hører til en beslutning, ikke til en import.

Ingen av dem er en verdi importen kan velge. Valget avgjør formen på de fjorten
gjenstående klubbene, ikke bare denne.

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

## Krysskoblinger: fem, alle med posisjon fra før

| Navn | Profil i katalogen | Posisjon | Arv |
|---|---|---|---|
| Raymond Kvisvik | `raymond_kvisvik` | LW, RW (usable AM) | brann, fredrikstad, moss, sarpsborg08 |
| Marius Ophaug | `marius_ophaug` | ST (usable RW) | ull_kisa |
| Fabian Stensrud Ness | `fabian_stensrud_ness` | ST | arendal |
| Mathias Engebretsen | `mathias_engebretsen` | GK | sarpsborg08 — **motsier troppen, se over** |
| Henrik Hagen | `henrik_hagen` | CB (usable DM) | skeid |

Bare Kvisvik er bekreftet som samme mann av en individkilde (hans egen artikkel
fører Kvik Halden 2009–2011, 34 kamper, 6 mål). De fire andre er navnetreff mot
2023-troppen og må bekreftes mot klubbens egen troppsside før de kobles.

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

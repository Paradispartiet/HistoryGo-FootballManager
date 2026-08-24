# P2 · kildeliste for de åtte gjenstående i avdeling 1

**Dette dokumentet er et FINNEVERKTØY, ikke en kilde.** Innholdet er satt sammen
av websøk, og et søketreff er en oppsummerers parafrase av en side ingen her har
åpnet — altså ett lag lenger fra kilden enn de 22 arvene som ble konvertert bort
nettopp fordi de var redaksjonelt modellerte. Ingenting herfra skal importeres
som en påstand. Listen sier hvor kildene *finnes*, slik at noen kan hente dem.

Alt som står som «lead» under er et navn eller et tall søket nevnte, og det er
ikke kontrollert mot noe. Det hører hjemme i en søkestreng, ikke i katalogen.

Nettverkspolicyen i utviklingsmiljøet blokket først alle eksterne verter. Den er
nå åpnet (24.08.2026), så sidene kan leses direkte herfra.

**Rangeringen under er en søkerekkefølge, ikke en forventning.** Den er bygget
på hvilke *typer* sider som finnes per klubb, ikke på hva sidene inneholder.
Bjarg sto øverst og ga fire navn da kilden faktisk ble lest — se
`docs/P2_BJARG_SOURCE_PASS.md`. Les den før du stoler på en rad her.

---

## Rangert etter forventet utbytte

Aksen er den samme som alle de tynne arvene har vist: **det avgjørende er hvor
mye kilden siterer, ikke hvor lang den er.** En klubb med egen historieside som
omtaler enkeltspillere gir dekning; en klubb som bare har troppslister og
tabeller gir navn og posisjon og ingenting mer — som Brattvåg.

| # | Klubb | Bane i katalogen | Beste kildespor | Forventning |
|---|---|---|---|---|
| ~~1~~ | ~~**Bjarg**~~ | Stavollen kunstgress | egen historieside | **LEST 24.08.2026: 4 navn, 1 posisjon — ingen import** |
| ~~2~~ | ~~**Kvik Halden**~~ | Halden stadion | klubbens historikk + Wikipedia | **LEST 24.08.2026: 44 navn, 9 med presis posisjon — venter på én avgjørelse** |
| 3 | **Eik Tønsberg** | Eik stadion ⚠️ | klubbens historieside | eliteserieperiode 1983–85 |
| 4 | **Sotra** | Straume idrettspark | klubbside, tre forgjengere | krever avklaring først |
| 5 | **Sandviken** | Stemmemyren | SNL + klubbside | krever avklaring først |
| 6 | **Vidar** | Lassa idrettspark | Aftenbladets emneside | tynt |
| 7 | **Træff** | Molde idrettspark | forbundsdata | tynt |
| 8 | **Lysekloster** | Lysekloster idrettspark | forbundsdata | tynnest — søket fant ingen historikk |

---

## Per klubb

### Bjarg (`bjarg`) — FERDIG LEST, IKKE IMPORTERT

**Kilden er lest i sin helhet 24.08.2026. Utfallet står i
`docs/P2_BJARG_SOURCE_PASS.md`: fire A-lagsnavn, ett av dem med posisjon, og
ingen import — fire profiler gjør ikke klubben overtakbar.** Resten av dette
avsnittet er bevart som det sto, fordi antakelsen i det er selve lærdommen.

- **Egen historieside:** https://www.bjargsinhistorie.no — et helt nettsted viet
  klubbens historie. Dette er den eneste av de åtte som har det, og det er
  akkurat sjangeren som gir dekning.
  **Det stemte ikke.** Nettstedet er 66 årsrapporter for *hele* idrettslaget —
  turn, håndball, friidrett og fotball i samme artikkel — og sjangeren er
  organisasjonsberetning. Den navngir formenn, trenere, dommere og
  kretslagsuttak, og omtaler lagene kollektivt. Av rundt femti personnavn i
  fotballstoffet er fire A-lagsspillere. De fem portrettartiklene på stedet
  handler om friidrett og håndball, med ett unntak.
- Klubbside: https://bjarg.net/om-il-bjarg/ · https://bjarg.net/fotball/
- Wikipedia: https://en.wikipedia.org/wiki/IL_Bjarg
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=780

**Banenavnet er rettet** (23.08.2026): katalogen hadde «Bjarg kunstgress», som
ikke er et virkelig anleggsnavn men klubbnavnet med «kunstgress» påhengt. Banen
heter **Stavollen kunstgress**, bekreftet av fire uavhengige treff — egen
artikkel på no.wikipedia, footballgroundmap, playmakerstats og Fanaposten — og
den ligger i Fana ved Stend jordbruksskole. Bjarghallen er en *innendørs*
flerbrukshall på 40 × 20 m, altså ikke fotballbanen.

**Én ting å følge med på:** klubben meldte i mars 2026 om et nytt anlegg kalt
**Bjarg arena**. Det er et framtidig prosjekt, ikke dagens bane, så `placeId`
skal lages fra Stavollen. Skifter hjemmebanen senere, er det et nytt sted — ikke
et omdøpt.

*Lead, ukontrollert:* stiftet 1947 i Fana; opprykk fra 3. divisjon i 2025-sesongen.

### Kvik Halden (`kvik_halden`)

- SNL: https://snl.no/Kvik_Halden_Fotballklubb
- Klubbside: https://www.kvikhalden.no/ · historikk: https://kvikhaldenfk.spond.club/historien
- Wikipedia: https://en.wikipedia.org/wiki/Kvik_Halden_FK
- Forbundet, personer: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=3&underside=personer

**Kilden er lest 24.08.2026 — se `docs/P2_KVIK_HALDEN_SOURCE_PASS.md`.** 44
dokumenterte A-lagsnavn ble funnet, men bare 9 med presis posisjon, og det
kreves 15 for at klubben skal bli spillbar. Passet stoppet på ett spørsmål som
ikke er avgjort før: teller en kilde som sier «forsvar» som posisjon? Svaret
avgjør formen på alle de fjorten gjenstående klubbene.

**Kildelista overså at klubben er en sammenslåing.** FK Kvik og Halden
Fotballklubb ble slått sammen i 1997. Cupgullet i 1918 og begge cupfinalene ble
tatt av **FK Kvik**, og alle de tjue historiske navnene tilhører den perioden —
samme problem som Sotra, som listen flagget.

Dette er den klart tyngste historiske arven av de åtte: cupmester 1918 (mot
Brann i finalen), cupfinaler 1915 og 1922 (begge tapt mot Odd), og landslags-
spillere på 1910- og 20-tallet.

**Merk krysskoblingsrisiko:** Brann og Odd har alt arv i katalogen, så en
Kvik-import vil kunne møte navn som finnes fra før. Samme regel som Pors og
Brattvåg — krysskobling, ikke ny profil, og hver kobling navngis.

~~*Lead, ukontrollert:* Robert Danielsen og Johnny Helgesen (landslag).~~
**Kontrollert:** begge stemmer. Klubbens egen årstallsliste fører Danielsen på
landslaget i 1928 og Helgesen i 1917–1928. Helgesen er den eneste profilen i
hele passet med presis posisjon fra en individkilde — `Centerforward`.

### Eik Tønsberg (`eik_tonsberg`)

- Klubbens historieside: https://fkeiktonsberg.no/klubben/historie
- Klubbside: https://fkeiktonsberg.no/
- SNL: https://snl.no/Eik_Tønsberg
- Wikipedia: https://en.wikipedia.org/wiki/FK_Eik_Tønsberg
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=491

**Identiteten har skiftet navn tre ganger** — Eik IF (1928) → Eik-Tønsberg
(1989) → FK Eik Tønsberg 871 (2020) — og søket returnerte i tillegg en egen
**FK Tønsberg** som er noe annet. Kilden må si hvilken enhet den beskriver.

**Banenavnet er galt, men jeg har IKKE rettet det — valget krever en avgjørelse
jeg ikke kan ta.** «Eik stadion» finnes ikke som anleggsnavn. Klubben har to
baner, og de er ulike svar på hvert sitt spørsmål:

- **Eik Idrettsanlegg** (Jutulveien 13) er klubbens *eget* anlegg — to
  kunstgress, ett gressbane, én stor gresslette.
- **Tønsberg gressbane** (kapasitet 5 600) er der *seniorlagene faktisk spiller
  hjemmekampene*, byens største stadion.

`homePlaceId` er banen en groundhopper må ha besøkt for å åpne klubbens
historiske spillere, så spørsmålet er hvilken av de to som *er* Eiks bane i den
forstand. Og Tønsberg gressbane er trolig delt med andre klubber — samme
problem som Haugesund stadion med tre klubber. Å mynte en permanent `placeId` på
feil av dem er ikke noe man angrer billig, så avgjørelsen hører til importen,
med kilden i hånd.

**Den viktigste fella her er allerede synlig.** Søket ga åtte navn i én liste
som «players **and coaches**», uten å si hvem som er hva: Arne Natland, Geir
Johansen, Kåre Bjørnsgård, Ronny Johnsen, Erik Solér, Jan Halvor Halvorsen,
Nils Johan Semb, Erik Thorstvedt. Fire av dem ligger alt i katalogen fra andre
arver (Ronny Johnsen, Erik Solér, Jan Halvor Halvorsen, Erik Thorstvedt). En
import på det grunnlaget ville påstått at åtte menn *spilte* for Eik. Kilden må
skille spiller fra trener.

### Sotra (`sotra`)

- Klubbside: https://www.sotrask.no/fotball/ · anlegg: https://www.sotrask.no/straume-idrettspark/
- Wikipedia: https://en.wikipedia.org/wiki/Sotra_SK
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=884

**Klubben er en sammenslåing fra 2009** av IL Øygard (stiftet 1945), Foldnes IL
og Brattholmen IL. En «klubbhistorie» spenner derfor over fire enheter, og
kilden må si hvilken en spiller representerte. Det er samme problem som
Haugesund stadion (tre klubber, én bane) sett fra motsatt kant, og der ble
løsningen å holde klubbene fra hverandre i kilden.

**Banenavnet er IKKE endret.** Katalogen har «Straume idrettspark», søket skriver
«Straume Sotra Stadion». Begge finnes, og idrettsparken ser ut til å være
anlegget som inneholder stadion — katalogverdien er altså mindre presis, ikke
gal. Klubbfila sier selv at «banenavn følger sponsorer og skifter oftere enn
klubbene gjør», så den generiske formen er den stabile. Bekreft mot klubbens egen
anleggsside når `placeId` lages.

### Sandviken (`sandviken`)

- SNL: https://snl.no/Sandviken_-_idrettslag
- Klubbside: https://ilsandviken.no/klubben
- Wikipedia: https://en.wikipedia.org/wiki/IL_Sandviken
- Forbundet, herrelag: https://www.fotball.no/fotballdata/lag/hjem/?fiksId=744

**Alvorlig sjangerfelle.** Klubbens dokumenterte historie handler i stor grad om
**kvinnefotball** — pionérklubb, norgesmester 1995, seriegull i Toppserien 2021,
og kvinnelaget ble en del av SK Brann fra 2022. En import som leser «Sandvikens
historie» uten å skille lag, vil trekke kvinnelagets spillere inn i en
herrelagspool. Kilden må si hvilket lag den beskriver, ellers importeres ingen.

*Lead, ukontrollert:* stiftet 29. juni 1945.

### Vidar (`vidar`)

- Aftenbladets emneside: https://www.aftenbladet.no/tag/vidar-fk
- Wikipedia: https://en.wikipedia.org/wiki/FK_Vidar
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=698

**Banen er rettet** (23.08.2026), og feilen var ikke en unøyaktighet — den var
en annen klubbs bane. Katalogen hadde «Midjord», som er et eget Stavanger-anlegg
med kapasitet 1 000 og ikke Vidars. Vidar holder til på **Lassa idrettspark**
(Rektor Oldens gate 31), bekreftet av klubbens egen anleggsside, no./en.wikipedia,
footballgroundmap og adresseoppslag. Stavanger stadion har vært midlertidig bane
mens Lassa oppgraderes.

Feilen hadde forplantet seg til **ligaprofilen**, som er det som avgjør hvordan
klubben faktisk spiller: `styleName` het «Midjord-nærhet» og `tacticalSchool`
«Bydelsklubb på Storhaug» — Storhaug er der Midjord ligger, ikke Lassa. Begge er
rettet til «Lassa-nærhet» og «Bydelsklubb i Stavanger». Distriktet er bevisst
holdt nøytralt i stedet for å bytte én ugjettet bydel med en annen.

Selve fotballen er ikke rørt. Profilen sier selv at den er *klubbkarakter, ikke
en spilletradisjon slått opp i historien*, så «kort spill i trange rom, slik det
spilles på et lite anlegg» er en oppdiktet karakter og ikke en kildepåstand — men
begrunnelsen lener seg på et lite anlegg, og Lassa oppgis med kapasitet 5 000.
Det er en designavgjørelse, ikke en datafeil, og står derfor urørt.

**Divisjonen er IKKE rettet.** Søket sier Vidar spiller i 3. divisjon, mens
katalogen har dem i 2. divisjon avdeling 1. `data/football_clubs.json` er
uttrykkelig et **øyeblikksbilde av 2026-sesongen**, og opp- og nedrykk i spillet
flytter klubber mellom nivåene uten at fila endres. Å ta Vidar ut av avdeling 1
ville tømt en plass i en avdeling `audit:clubs` krever fjorten lag i, og krevd at
noen bestemte hvem som skulle inn i stedet. Det er en designavgjørelse om
pyramidens sammensetning, ikke en korreksjon, og den hører til deg.

*Lead, ukontrollert:* stiftet 18. april 1906; første kamp mot Stavanger IF
15. august 1906.

### Træff (`traff`)

- Klubbside: https://traeff.no/fotball
- Wikipedia: https://en.wikipedia.org/wiki/SK_Træff
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=986

Søket fant nesten bare Molde FK når man søker på Træff, fordi klubbene deler
Molde idrettspark. **Banen deles med Molde FKs rekrutt- og utviklingslag og med
IL Molde-Olymp**, så en import må holde Træffs egne A-lagsspillere fra Moldes —
og Molde har alt arv i katalogen (`aker_stadion`).

*Lead, ukontrollert:* stiftet 1. oktober 1924.

### Lysekloster (`lysekloster`)

- Klubbside/forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=872
- Instagram: https://www.instagram.com/lyseklosterofficial/

**Banenavnet er IKKE endret.** Katalogen har «Lysekloster idrettspark», søket
skriver «Lysekloster Framo Idrettsplass». Framo er en sponsor, og klubbfila slår
fast at sponsornavn skifter oftere enn klubbene — den generiske formen er derfor
den riktige å bære i katalogen.

**Søket fant ingen klubbhistorikk i det hele tatt** — bare dagens tropp, tabeller
og kampdata. Det er den tynneste av de åtte, og hvis den beste kilden er en
troppsliste, blir resultatet Brattvåg-formen: navn og posisjon der kilden gir
den, alt annet tomt. Det er et gyldig utfall.

---

## Hva importen trenger fra hver kilde

Uansett klubb er kravet det samme, og `audit:club-heritage` håndhever det:

1. **Navn på A-lagsspillere.** Rekruttlag, juniorlag, «klubb 2» og ren
   registrering er ikke A-lagsrepresentasjon — den ene grensa den ellers
   inkluderende definisjonen trekker.
2. **Posisjon der kilden gir den.** Uten posisjon blir profilen en
   historikkpost: den står i klubbpoolen, men banen åpner den ikke.
3. **Årstall om de finnes** — avgjør `eraSource` (`belagt` som Pors, `utledet`
   som Brattvåg).
4. **Ingenting annet.** Styrker, arketyper, rollepreferanser og taktiske
   preferanser skal stå tomme med mindre kilden beskriver spilleren
   individuelt, og da hører claimet hjemme i P1-overlayet med `claim` og
   `source`, ikke i råfila.

---

## En ledetråd som IKKE lar seg automatisere

Seks av seksten banenavn viste seg gale, og fire av dem hadde samme form:
klubbnavnet med «stadion» eller «kunstgress» påhengt. Det ser ut som en
generatorsignatur man kan skrive en vakt på. **Det er det ikke**, og det er målt.

Mønsteret «klubbnavn + generisk ord» treffer **16 av de 60 klubbene**, og minst
tolv av dem er helt riktige, virkelige navn: Brann Stadion, Fredrikstad stadion,
Haugesund stadion, Bryne stadion, Notodden stadion, Levanger stadion, Grorud
idrettspark, Sarpsborg stadion, Strømmen stadion, Raufoss Arena, Egersund Arena,
KFUM Arena, Pors stadion, Brattvåg stadion. Norske klubber kalles ofte opp etter
stedet, og banen med dem.

Én av de seksten er gal (Eik), og én er sponsorfri form av et sponset navn
(Lysekloster). En vakt på mønsteret ville altså gitt fjorten falske positive av
seksten.

**Det som skiller de gale fra de riktige er ikke formen på navnet, men om banen
har et eget lokalt navn** — Stavollen, TUIL Arena, Rolvsrud, Nordlandshallen,
Lassa. Det kan bare avgjøres mot en kilde, én klubb om gangen. Mønsteret er
derfor en søkeliste, ikke en regel, og det er grunnen til at det ikke er lagt
inn som en sjekk.
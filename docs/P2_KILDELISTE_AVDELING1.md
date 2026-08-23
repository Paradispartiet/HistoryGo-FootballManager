# P2 · kildeliste for de åtte gjenstående i avdeling 1

**Dette dokumentet er et FINNEVERKTØY, ikke en kilde.** Innholdet er satt sammen
av websøk, og et søketreff er en oppsummerers parafrase av en side ingen her har
åpnet — altså ett lag lenger fra kilden enn de 22 arvene som ble konvertert bort
nettopp fordi de var redaksjonelt modellerte. Ingenting herfra skal importeres
som en påstand. Listen sier hvor kildene *finnes*, slik at noen kan hente dem.

Alt som står som «lead» under er et navn eller et tall søket nevnte, og det er
ikke kontrollert mot noe. Det hører hjemme i en søkestreng, ikke i katalogen.

Nettverkspolicyen i utviklingsmiljøet blokkerer alle eksterne verter, så sidene
må hentes utenfra.

---

## Rangert etter forventet utbytte

Aksen er den samme som alle de tynne arvene har vist: **det avgjørende er hvor
mye kilden siterer, ikke hvor lang den er.** En klubb med egen historieside som
omtaler enkeltspillere gir dekning; en klubb som bare har troppslister og
tabeller gir navn og posisjon og ingenting mer — som Brattvåg.

| # | Klubb | Bane i katalogen | Beste kildespor | Forventning |
|---|---|---|---|---|
| 1 | **Bjarg** | Bjarg kunstgress | egen historieside | best strukturelle utsikter |
| 2 | **Kvik Halden** | Halden stadion | SNL + cupmeritter 1915–22 | ekte historisk arv |
| 3 | **Eik Tønsberg** | Eik stadion | klubbens historieside | eliteserieperiode 1983–85 |
| 4 | **Sotra** | Straume idrettspark | klubbside, tre forgjengere | krever avklaring først |
| 5 | **Sandviken** | Stemmemyren | SNL + klubbside | krever avklaring først |
| 6 | **Vidar** | Midjord | Aftenbladets emneside | banen må avklares |
| 7 | **Træff** | Molde idrettspark | forbundsdata | tynt |
| 8 | **Lysekloster** | Lysekloster idrettspark | forbundsdata | tynnest — søket fant ingen historikk |

---

## Per klubb

### Bjarg (`bjarg`)

- **Egen historieside:** https://www.bjargsinhistorie.no — et helt nettsted viet
  klubbens historie. Dette er den eneste av de åtte som har det, og det er
  akkurat sjangeren som gir dekning.
- Klubbside: https://bjarg.net/om-il-bjarg/ · https://bjarg.net/fotball/
- Wikipedia: https://en.wikipedia.org/wiki/IL_Bjarg
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=780

**Banenavnet bør kontrolleres.** Katalogen har «Bjarg kunstgress». Søket peker på
**Stavollen idrettspark** som hjemmebanen, og på Bjarghallen som en *innendørs*
flerbrukshall (40 × 20 m) — altså ikke en fotballbane. Avklar før `placeId`
lages.

*Lead, ukontrollert:* stiftet 1947 i Fana; opprykk fra 3. divisjon i 2025-sesongen.

### Kvik Halden (`kvik_halden`)

- SNL: https://snl.no/Kvik_Halden_Fotballklubb
- Klubbside: https://www.kvikhalden.no/ · historikk: https://kvikhaldenfk.spond.club/historien
- Wikipedia: https://en.wikipedia.org/wiki/Kvik_Halden_FK
- Forbundet, personer: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=3&underside=personer

Dette er den klart tyngste historiske arven av de åtte: cupmester 1918 (mot
Brann i finalen), cupfinaler 1915 og 1922 (begge tapt mot Odd), og landslags-
spillere på 1910- og 20-tallet.

**Merk krysskoblingsrisiko:** Brann og Odd har alt arv i katalogen, så en
Kvik-import vil kunne møte navn som finnes fra før. Samme regel som Pors og
Brattvåg — krysskobling, ikke ny profil, og hver kobling navngis.

*Lead, ukontrollert:* Robert Danielsen og Johnny Helgesen (landslag).

### Eik Tønsberg (`eik_tonsberg`)

- Klubbens historieside: https://fkeiktonsberg.no/klubben/historie
- Klubbside: https://fkeiktonsberg.no/
- SNL: https://snl.no/Eik_Tønsberg
- Wikipedia: https://en.wikipedia.org/wiki/FK_Eik_Tønsberg
- Forbundet: https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=491

**Identiteten har skiftet navn tre ganger** — Eik IF (1928) → Eik-Tønsberg
(1989) → FK Eik Tønsberg 871 (2020) — og søket returnerte i tillegg en egen
**FK Tønsberg** som er noe annet. Kilden må si hvilken enhet den beskriver.

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

Katalogen har banen som «Straume idrettspark»; søket skriver «Straume Sotra
Stadion». Avklar før `placeId`.

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

**To avvik mot katalogen, begge må avklares.** Katalogen har banen «Midjord»;
søket sier hjemmebanen er **Lassa idrettspark**, med Stavanger stadion som
midlertidig bane mens Lassa oppgraderes. Og katalogen plasserer Vidar i
2. divisjon avdeling 1, mens søket sier 3. divisjon. Det siste kan være
sesongdrift i pyramiden vår og bør sjekkes mot `data/football_clubs.json`
uansett import.

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

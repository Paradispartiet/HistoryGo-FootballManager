# Kampplaner

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Kampplanen er **strategi**, ikke en rangering. Ingen plan er best i seg selv —
den passer eller passer ikke til spillerne dine, motstanderens stil og
kampbildet. Og den kan byttes midt i kampen, med en pris.

## Katalogen

18 planer i seks familier (`data/football_tactics.json`, skjema
`historygo-football-manager.tactics.v2`):

| Familie | Hva den prøver | Planer |
|---|---|---|
| **Kontroll** | Ha ballen, styr tempoet, bryt dem ned tålmodig | Sentralt possession-spill, Tålmodig oppbygging, Posisjonsspill med overtall |
| **Press** | Vinn ballen høyt og angrip før de er organisert | Høyt press, Gjenvinningspress, Midtbanepress |
| **Kontring** | Gi dem ballen, hold formen, straff dem i overgangen | Direkte kontringer, Lav blokk og overganger, Dyp blokk og lang utløsning |
| **Direkte** | Kort vei fram, andreballer, press på siste linje | Direkte spill og andreballer, Spill på målspissen |
| **Bredde** | Strekk dem i bredden, angrip kanalene og boksen | Bredt og hurtig, Innlegg og boksnærvær, Overlapp og kanaler |
| **Kampsituasjon** | Planer for et bilde som har endret seg | Lukk kampen, Jag utligningen, Ro ned tempoet, Alt frem |

Hver plan bærer sin egen forklaring: `intent` (hva den prøver å oppnå),
`strengths`, `risks`, `gameStates` (når den gir mening) og `intensity` (hva den
koster i beina). Ingenting av dette er hardkodet i `app.js`.

`formation` er planens **formasjonsarv**, ikke et krav. Den vises som «Fra
4-3-3-tradisjonen» under valget — en opplysning, ikke en motsigelse av
formasjonen du faktisk spiller.

Kampsituasjonsfamilien er de reaktive planene. De er med i katalogen fra start,
men familiens egen `risk` sier det rett ut: *starter du kampen der, gir du fra
deg initiativet.*

## Bytte underveis

Kampplanen kan byttes mellom hendelsene i en kamp. Byttet er **aldri gratis**:

```
omstillingskostnad = spranget × (1 + friksjon) × senhet
```

- **Spranget** (`planDistance`) er avstanden mellom planene langs fem akser:
  press, tempo, bredde, forsvarslinje og oppbygging. Lukk kampen → Alt frem er
  det største spranget som finnes; Tålmodig oppbygging → Sentralt
  possession-spill er nesten ingenting.
- **Friksjonen** kommer fra treneren. Høy `coachUnderstanding` og
  `formationFamiliarity` gjør omstillingen billigere — den som forstår systemet
  sitt kan endre det.
- **Senhet**: jo færre hendelser igjen, jo mindre tid har laget på å finne seg
  til rette. Et bytte i sluttminuttene koster mest.

Kostnaden trekkes fra taktisk klarhet og legger på risiko. Treffer planen
kampbildet og motstanderens stil, henter du det inn igjen — og mer til.

Byttene bærer **samme effektform som managergrepene**
(`{ eventScoreDelta, xgDeltaFor, xgDeltaAgainst, momentumDelta, riskDelta,
tacticalClarityDelta }`), så `finalizeMatchdaySession` summerer dem i samme
regnestykke. Et bytte er en beslutning, ikke en knapp ved siden av spillet.

## Kampbildet og den løpende stillingen

Kampen spilles **periode for periode**. Med tre hendelser gir det fire perioder:
avspark → hendelse 1, mellom hendelsene, og fra siste hendelse til full tid.
Hver periode avgjør sine egne mål fra xG-raten *slik den er akkurat da* — så et
grep eller planbytte tidlig i kampen virker gjennom flere perioder enn et sent.

### Minutt for minutt

xG-en blir ikke til mål direkte. Den blir først til **enkeltsjanser** — mer xG
gir både flere og bedre sjanser — og målene faller ut av dem. En sjanse som
ikke går inn blir forklart: *reddet av keeper, i stolpen, blokkert, utenfor*.

Managergrepene, planbyttene og motstanderens justeringer ligger i det **samme
sporet**, så kampen leses som én fortelling:

```
 7'  Sjanse: i stolpen
16'  Sjanse imot: reddet av keeper
23'  Ditt grep: Senk presset og gjør midten kompakt
30'  Mål for laget — 1–0
38'  Sjanse imot: i stolpen
45'  De skyver laget opp
46'  Kampplan: Sentralt possession-spill → Direkte kontringer
47'  Ditt grep: Bygg roligere gjennom presset
83'  Mål imot — 1–1
```

Skjer flere ting rundt samme pause, forskyves de ett minutt hver — ellers
klumpet hele pausen seg på samme minutt og rekkefølgen ble uleselig.

### Live

Kampen **spilles av mens du ser på**. Klokka teller, sjansene dukker opp
etter hvert som minuttene går, og stillingen oppdaterer seg når målet faller.

Perioden er ferdig avgjort i motoren i det øyeblikket den spilles — det må den
være, siden utfallet henger på grepet du nettopp tok. Det som skjer i UI-et er
at kampen **avdekkes** minutt for minutt. Motoren forblir ren og deterministisk;
avspillingen er ren visning.

To regler følger av det:

- **Stillingen følger avspillingen, ikke fasiten.** Viste tavla sluttstillingen
  fra første minutt, avslørte den målet før du rakk å se det falle.
- **Grepet åpner først når perioden er spilt av.** Å kunne gripe inn i et
  minutt du ennå ikke har sett ville gjort avspillingen meningsløs.

Du styrer tempoet (Rolig / Normal / Rask), kan pause, og kan hoppe rett til
pausen — manageren skal aldri måtte vente på klokka. En refresh midt i kampen
beholder stillingen og loggen, med klokka på pause.

Forlater du kampflaten eller nullstiller, stoppes klokka. En usynlig timer som
tikker videre ville skrevet til en sesjon ingen ser.

**Sluttresultatet ER stillingen du så** — å rulle et nytt resultat ved
kampslutt ville gjort den løpende stillingen til en løgn.

Kampbildet leser stillingen når den finnes:

| Situasjon | Bilde |
|---|---|
| Du leder på mål | Du leder |
| Du ligger under på mål | Du ligger under |
| Likt, momentum ≥ +2 | Jevnt – du har taket |
| Likt, momentum ≤ −2 | Jevnt – de har taket |
| Likt ellers | Jevnt |

Etiketten skal aldri motsi tavla den står ved siden av: «Du leder» ved 1–1 var
en direkte løgn, og er nå «Jevnt – du har taket».

En kamp som avsluttes uten at klokka har gått (eldre lagring, motoren brukt
direkte) faller tilbake til det gamle sluttkastet, så ingenting mister et
resultat.


## Spill og motspill: handlinger, ikke taktiske fasiter

Fotball er ikke stein–saks–papir. En formasjon er et utgangspunkt for rom og
avstander, **ikke** en automatisk seier over en annen. Kampplanene spiller
sammen med lagets formasjon, faktiske rollefordeling, samspill og kildebelagte
egenskaper. En motstander kan svare på et firetrekksmønster; manageren må da
lese kampen på nytt og finne et nytt svar.

Det nye taktiske laget har én eksempelkjede for **alle 18 kampplaner**.
Hver kjede viser fire **sammenhengende handlinger**, et mulig motgrep og
managerens mot-mottrekk. Modellen aktiverer bare kjeden når det er et
reelt taktisk signal i motstanderprofilen; den gir høyst **+1 matchup-edge**
når egne eksisterende lagmetrikker gir tilstrekkelig rolle- og formasjonsstøtte.
Når motstanderprofilen viser et dekkende motgrep, nøytraliseres akkurat den
kjedefordelen. **Ukjent motgrep gir heller ingen bonus:** manglende speiding er
ikke bevis for at en mottaktikk ikke finnes. Allerede modellerte trusler ved høy linje, svak restforsvars-
struktur og dårlig oppbygging under press fortsetter å koste.

**Viktig begrensning:** Dette er taktiske *hypoteser*, ikke en hendelses-
simulator som følger hver pasning individuelt. Fire bevegelser er ikke fire
gratis bonuser. Lagmetrikker måler det eksisterende systemet; en ikke-
dokumentert spiller får ingen ny kildebelagt ferdighet av mønsteret.
Et motsvar beskriver hva en manager kan gjøre, men gir ikke en automatisk
ny bonus før han endrer formasjon, roller eller kampplan i spillet.

### Fullstendig taktisk handlingsbibliotek

| Plan | Familie | Firetrekksmønster | Kritiske lagmetrikker | Mulig motgrep |
|---|---|---|---|---|
| Sentralt possession-spill | kontroll | Sentralt overtall | buildUpScore, depthScore | Stenger sentral sekser og tier |
| Tålmodig oppbygging | kontroll | Spille fri tredjemann | buildUpScore, balanceScore | Låser keeper og sekser samtidig |
| Posisjonsspill med overtall | kontroll | Overtall og isolasjon | buildUpScore, widthScore | Forskyver kompakt mot begge sider |
| Høyt press | press | Koordinert pressfelle | pressScore, balanceScore, restDefenseScore | Spiller direkte bak vingback |
| Gjenvinningspress | press | Gjenvinning før overgang | pressScore, restDefenseScore | Vender seg forbi pressleddet |
| Midtbanepress | press | Fange pasningen i midten | pressScore, balanceScore | Vender ut til motsatt back |
| Direkte kontringer | kontring | Lokk høyt og angrip bak | depthScore, balanceScore | Lar bakerste stopper falle av |
| Lav blokk og overganger | kontring | Fra lav blokk til overgang | restDefenseScore, depthScore | Sikrer bak ballen med flere spillere |
| Dyp blokk og lang utløsning | kontring | Forsvar og andreball | restDefenseScore, balanceScore, depthScore | Dekker nedfallsrommet godt |
| Direkte spill og andreballer | direkte | Forbi press og vinn nedfallsrom | balanceScore, depthScore | Pakker rommet rundt andreballen |
| Spill på målspissen | direkte | Festepunkt og tredje løp | balanceScore, depthScore | Dobler på mottaksspiss |
| Bredt og hurtig | bredde | Isoler kant ved sideskifte | widthScore, depthScore | Dobler opp mot kantspilleren |
| Innlegg og boksnærvær | bredde | Åpne bredde, fylle boks | widthScore, depthScore, balanceScore | Vinner første innlegg og rydder unna |
| Overlapp og kanaler | bredde | Overlapp med kontrollert sikring | widthScore, restDefenseScore | Kontrer bak høy vingback |
| Lukk kampen | kampsituasjon | Stenge midten ved ledelse | restDefenseScore, balanceScore | Sender en ekstra løper mellom leddene |
| Jag utligningen | kampsituasjon | Koordinert slutttrykk | pressScore, widthScore, depthScore | Kontrer mot to høye backer |
| Ro ned tempoet | kampsituasjon | Rytmebrudd og trygg vending | buildUpScore, balanceScore | Mannmarker begge pasningsstøtter |
| Alt frem | kampsituasjon | Risiko med kontrollert retur | pressScore, widthScore, depthScore | Spiller lang kontring bak fremste ledd |

### De fire handlingene, motgrepet og svaret

#### Sentralt possession-spill — Sentralt overtall

**Spillet:** 1) Trekk stopperpresset mot ballen; 2) Bind sekser med støttespiller; 3) Finn tredjemann i mellomrommet; 4) Løp inn bak deres neste ledd.

**Motspillet:** Stenger sentral sekser og tier. **Ditt neste svar:** Vend via motsatt back og angrip halvrom.

Aktivering: motstanderens `defensiveCompactness` minst 65;
eget lag: `buildUpScore` minst 63, `depthScore` minst 58.
Kontramønster: `pressIntensity` minst 78.

#### Tålmodig oppbygging — Spille fri tredjemann

**Spillet:** 1) Inviter frem første pressledd; 2) Bruk keeper som pasningsstøtte; 3) Spill gjennom ledig sekser; 4) Gå frem med overtall bak presset.

**Motspillet:** Låser keeper og sekser samtidig. **Ditt neste svar:** Spill kontrollert lengre til bred støtte.

Aktivering: motstanderens `pressIntensity` minst 70;
eget lag: `buildUpScore` minst 67, `balanceScore` minst 62.
Kontramønster: `tacticalComplexity` minst 79.

#### Posisjonsspill med overtall — Overtall og isolasjon

**Spillet:** 1) Samle spillere til ballside; 2) Bind deres back med indreløper; 3) Vend gjennom tredjemann; 4) Isoler kantspiller på svak side.

**Motspillet:** Forskyver kompakt mot begge sider. **Ditt neste svar:** Angrip halvrommet der midtbanen forlot posisjon.

Aktivering: motstanderens `defensiveCompactness` minst 64;
eget lag: `buildUpScore` minst 65, `widthScore` minst 63.
Kontramønster: `tacticalComplexity` minst 80.

#### Høyt press — Koordinert pressfelle

**Spillet:** 1) Styr første pasning ut mot kant; 2) Steng returen til keeper; 3) Press med back og spiss samtidig; 4) Sikre bakrom og vinn andreball.

**Motspillet:** Spiller direkte bak vingback. **Ditt neste svar:** Senk presshøyde og la sekser sikre.

Aktivering: motstanderens `shortBuildUp` minst 65;
eget lag: `pressScore` minst 65, `balanceScore` minst 60, `restDefenseScore` minst 59.
Kontramønster: `pressResistance` minst 79.

#### Gjenvinningspress — Gjenvinning før overgang

**Spillet:** 1) Sikre bak ball før angrep; 2) Press umiddelbart etter balltap; 3) Steng første fremoverpasning; 4) Vinn andreball og angrip igjen.

**Motspillet:** Vender seg forbi pressleddet. **Ditt neste svar:** Avbryt presset og organiser blokk.

Aktivering: motstanderens `transitionThreat` minst 66;
eget lag: `pressScore` minst 65, `restDefenseScore` minst 62.
Kontramønster: `pressResistance` minst 78.

#### Midtbanepress — Fange pasningen i midten

**Spillet:** 1) La stoppere føre ballen frem; 2) Skjerm den sentrale mottakeren; 3) Press pasningen gjennom midten; 4) Vend direkte etter gjenvinning.

**Motspillet:** Vender ut til motsatt back. **Ditt neste svar:** Skyv midtblokken samlet mot ny ballside.

Aktivering: motstanderens `possessionControl` minst 65;
eget lag: `pressScore` minst 59, `balanceScore` minst 62.
Kontramønster: `tacticalComplexity` minst 78.

#### Direkte kontringer — Lokk høyt og angrip bak

**Spillet:** 1) Stå kompakt i to ledd; 2) Vinn ballen sentralt; 3) Slipp pasningen forbi høy back; 4) La to spisser angripe ulike rom.

**Motspillet:** Lar bakerste stopper falle av. **Ditt neste svar:** Bruk avlegg til innløpende midtbane.

Aktivering: motstanderens `highLine` minst 64;
eget lag: `depthScore` minst 64, `balanceScore` minst 58.
Kontramønster: `defensiveStructure` minst 81.

#### Lav blokk og overganger — Fra lav blokk til overgang

**Spillet:** 1) Beskytt rommet foran egen boks; 2) Tving angrepet ut mot kanten; 3) Vinn ballen med støtte for første pasning; 4) Slipp spiss og vingback raskt frem.

**Motspillet:** Sikrer bak ballen med flere spillere. **Ditt neste svar:** Flytt laget frem som enhet før neste utløsning.

Aktivering: motstanderens `possessionControl` minst 67;
eget lag: `restDefenseScore` minst 66, `depthScore` minst 59.
Kontramønster: `defensiveStructure` minst 80.

#### Dyp blokk og lang utløsning — Forsvar og andreball

**Spillet:** 1) Forsvar boks og første innlegg; 2) Vinn første eller andre ball; 3) Spill tidlig mot spissen; 4) Støtt avlegget med midtbaneløp.

**Motspillet:** Dekker nedfallsrommet godt. **Ditt neste svar:** Spill via vingback før lengre ball.

Aktivering: motstanderens `highLine` minst 64;
eget lag: `restDefenseScore` minst 63, `balanceScore` minst 61, `depthScore` minst 58.
Kontramønster: `defensiveStructure` minst 81.

#### Direkte spill og andreballer — Forbi press og vinn nedfallsrom

**Spillet:** 1) Lokke første pressledd; 2) Slå langt bak presslinjen; 3) Samle midtbanen rundt første duell; 4) Vinn andreball og angrip neste rom.

**Motspillet:** Pakker rommet rundt andreballen. **Ditt neste svar:** Spill kort via tredjemann før langpasningen.

Aktivering: motstanderens `pressIntensity` minst 68;
eget lag: `balanceScore` minst 62, `depthScore` minst 60.
Kontramønster: `defensiveCompactness` minst 78.

#### Spill på målspissen — Festepunkt og tredje løp

**Spillet:** 1) Finn spissens føtter eller kropp; 2) Gi nær støtte ved første duell; 3) Legg av til møtende indreløper; 4) Slipp løper rundt stoppere.

**Motspillet:** Dobler på mottaksspiss. **Ditt neste svar:** Flytt første pasning ut i halvrom.

Aktivering: motstanderens `pressIntensity` minst 65;
eget lag: `balanceScore` minst 62, `depthScore` minst 57.
Kontramønster: `defensiveStructure` minst 79.

#### Bredt og hurtig — Isoler kant ved sideskifte

**Spillet:** 1) Bind sekser med sentral støtte; 2) Dra backen inn mot ballen; 3) Vend tidlig til bred kantspiller; 4) Angrip én mot én med boksløp.

**Motspillet:** Dobler opp mot kantspilleren. **Ditt neste svar:** Bruk underlapp eller bytt side igjen.

Aktivering: motstanderens `defensiveCompactness` minst 64;
eget lag: `widthScore` minst 65, `depthScore` minst 61.
Kontramønster: `tacticalComplexity` minst 80.

#### Innlegg og boksnærvær — Åpne bredde, fylle boks

**Spillet:** 1) Trekk blokk mot første side; 2) Skap to mot én på kanten; 3) Fyll boks med ulike løpsbaner; 4) Sikre andreball ved boksgrensen.

**Motspillet:** Vinner første innlegg og rydder unna. **Ditt neste svar:** Spill bakover til lavt innlegg.

Aktivering: motstanderens `defensiveCompactness` minst 63;
eget lag: `widthScore` minst 65, `depthScore` minst 59, `balanceScore` minst 57.
Kontramønster: `defensiveStructure` minst 80.

#### Overlapp og kanaler — Overlapp med kontrollert sikring

**Spillet:** 1) Trekk back innover via kant; 2) Start overlapp rundt motstanderback; 3) Finn tredjemann i halvrommet; 4) Slå innlegg med sekser som sikring.

**Motspillet:** Kontrer bak høy vingback. **Ditt neste svar:** Senk motsatt back og la sekser sikre.

Aktivering: motstanderens `defensiveCompactness` minst 62;
eget lag: `widthScore` minst 64, `restDefenseScore` minst 61.
Kontramønster: `transitionThreat` minst 78.

#### Lukk kampen — Stenge midten ved ledelse

**Spillet:** 1) Senk risiko ved egne balltap; 2) Hold midtbane tett på bakre ledd; 3) Styr motstander til siden; 4) Vinn returer og hold ballen.

**Motspillet:** Sender en ekstra løper mellom leddene. **Ditt neste svar:** Flytt sekser mot løper og behold kontringsutgang.

Aktivering: motstanderens `pressIntensity` minst 70;
eget lag: `restDefenseScore` minst 68, `balanceScore` minst 67.
Kontramønster: `tacticalComplexity` minst 81.

#### Jag utligningen — Koordinert slutttrykk

**Spillet:** 1) Løft hele pressleddet sammen; 2) Steng første kant med back og ving; 3) Vend raskt til motsatt side; 4) Angrip boks med spiss og indreløper.

**Motspillet:** Kontrer mot to høye backer. **Ditt neste svar:** Hold sekser igjen og send én back frem.

Aktivering: motstanderens `defensiveCompactness` minst 64;
eget lag: `pressScore` minst 65, `widthScore` minst 63, `depthScore` minst 59.
Kontramønster: `transitionThreat` minst 79.

#### Ro ned tempoet — Rytmebrudd og trygg vending

**Spillet:** 1) Gi ballfører to støttelinjer; 2) Lokke motstanderpresset frem; 3) Vend via keeper og sekser; 4) Behold ballen bak presset.

**Motspillet:** Mannmarker begge pasningsstøtter. **Ditt neste svar:** Søk tredjemann lengre frem.

Aktivering: motstanderens `pressIntensity` minst 68;
eget lag: `buildUpScore` minst 67, `balanceScore` minst 64.
Kontramønster: `tacticalComplexity` minst 80.

#### Alt frem — Risiko med kontrollert retur

**Spillet:** 1) Press kollektivt svært høyt; 2) Hold én back bred og én som sikring; 3) Spill tidlig til fri kanal; 4) Fyll boks og sikre returen.

**Motspillet:** Spiller lang kontring bak fremste ledd. **Ditt neste svar:** Trekk sekser ned eller senk presset.

Aktivering: motstanderens `defensiveCompactness` minst 64;
eget lag: `pressScore` minst 69, `widthScore` minst 67, `depthScore` minst 63.
Kontramønster: `transitionThreat` minst 75.

### Faglige referanser

- [England Football Learning – What is pressing in football](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/what-is-pressing-in-football) – pressutløsere, felles bevegelse og motspill
- [FourFourTwo – The high press: football tactics explained](https://www.fourfourtwo.com/features/the-high-press-football-tactics-explained) – press som kollektivt grep og bakromsrisiko
- [Total Football Analysis – Training effective defensive transitions](https://totalfootballanalysis.com/article/tactical-theory-training-effective-defensive-transitions-tactical-analysis-tactics) – restforsvar, avstander og overganger
- [Domisports – Third-man combinations & overloads](https://domisports.com/training/guide/fussball-pro-1-third-man-overloads) – overtall, tredjemann og sideskifte


## Mot motstanderen

Planen du **velger** måles mot motstanderen fra avspark — den teller i xG
(`planEdge`), ikke bare hvis du tilfeldigvis bytter underveis. Før var
planvalget gratis så lenge du lot det stå.

Planen vurderes mot motstanderens `styleTraits` — de samme tallene de
historiske arketypene allerede bærer, ingen ny motstanderdata:

- Press mot kort oppbygging → mulig gunstig, **bare med pressroller og lagstøtte**
- Høy egen linje mot et omstillingslag → risikabel (også når laget presser godt)
- Fart mot en høy motstanderlinje → mulig gunstig, **bare med dybdedekning**
- Bredde mot en kompakt blokk → mulig gunstig, **bare med reelle bredderoller**
- Rolig oppbygging mot aggressivt press → risikabel, men gode støttelinjer
  kan åpne en mer kompleks firetrekkskjede

Dette er forklaring, ikke fasit. En plan som er «gunstig mot dem» kan fortsatt
straffe deg hvis troppen ikke passer den — taggene scorer mot spillernes
`likesTactics`/`dislikesTactics` som før.

## Motstanderen svarer

Motstanderen sitter ikke stille. Ser de at kampen glipper, **skyver de laget
opp** (høyere linje, mer press); leder de bildet, **trekker de seg ned**
(dypere blokk, kontring som plan). Justeringen skjer én gang per type, den
vises i kampen, og den står i sluttrapporten under «Motstanderens grep».

Da regnes planens matchup om mot det de faktisk gjør nå. Rolig oppbygging som
var trygg mot en passiv motstander er ikke like trygg når de plutselig presser.
**Det er dette som gjør at kampen må leses på nytt** i stedet for å velges
riktig én gang.

Justeringen er deterministisk og forklart — ingen skjult motstanderintelligens.

## Å rette opp en kamp som glipper

Et planbytte belønnes for **forbedringen**, ikke for å «passe». Motoren regner
ut hvor godt den gamle og den nye planen passer situasjonen (`scorePlanNow`:
kampbildet veier tyngst, motstanderens stil kommer i tillegg) og belønner
differansen.

Oppå det kommer en **redningsbonus** som skalerer med hvor dypt i trøbbel du er:
jo mer kampen glipper, jo mer er den riktige lesningen verdt. Et konkret
eksempel, med momentum −4 mot et kontringslag:

| Grep | Forbedring | Netto (momentum + klarhet) |
|---|---|---|
| Jag utligningen (riktig) | +0.90 | **+2.45** |
| Midtbanepress (nøytralt) | 0 | −0.15 |
| Lukk kampen (feil) | 0 | −0.32 |

Og motsatt: bytter du bort en plan som passet bedre, er `improvement` negativ og
grepet straffes — selv om den nye planen «ser riktig ut» isolert sett.

## Taggene må bety noe

`audit:tactics` krever at hver tag i en kampplan finnes i spillerdataen. En tag
ingen spiller har en mening om er dekorasjon: den ser ut som en taktisk detalj,
men gir null utslag. Auditen fant fire slike (`close_support`, `space_behind`,
`protected_box`, `medium_or_low_line`), og de ble gitt mening ved å legge dem
til hos spillere hvis profil allerede impliserte dem — en kombinasjonsspiller
vil ha støtte nær seg, en løper vil ha rom bak.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:match-plan` | 50 sjekker: minutt-for-minutt-logg, kampklokke og løpende stilling, familier, avstand, omstillingskostnad, kampbilde, matchup fra avspark, motstanderens justeringer, redningsbelønning, effekt på resultatet |
| `npm run audit:tactics` | dataskjema, at hver plan forklarer seg, at ingen plan passer alt, at taggene treffer spillerdataen |
| `npm run audit:flow` (steg 16) | motoren er ren, byttet er wiret i kampflyten og summeres i resultatet |

## I analyseavdelingen: vis hele spillkjeden

Det operative kampforberedelsesrommet viser nå for **valgt taktikk** de fire
sammenhengende handlingene, hvilke av de eksisterende lagmetrikker som faktisk
støtter dem, mulige motgrep fra motstanderen og managerens neste svar. Dette
hentes fra **samme** `evaluatePlanVsOpponent` og
`evaluateTacticalSequences` som styrer kampens xG, ikke fra et parallelt
poengsystem. Spillerbidrag vises bare som «kildebelagt» når det eksisterende
provenienssystemet allerede har dokumentert dem. Manglende informasjon om
motstander eller egne ferdigheter er et usikkerhetssignal, ikke bevis på
svakhet. Et taktisk mønster som får motspill, gir ingen ekstra kjedebonus.
Alle 18 mønstrene er testet mot støttende ellever, manglende rolledimensjon,
kontrert mønster og ufullstendig speiding.


## Operativt nytt svar etter motspillet

Hvert av de 18 mønstrene har et kontrollert `responsePlanId` som peker på en
annen, eksisterende kampplan. Når et motgrep faktisk er modellert som aktivt,
viser analyseavdelingen et **mulig alternativ** og lar manageren gå direkte
til Lag · Oppstilling for å vurdere det. **Alternativet gir ingen bonus før
manageren faktisk endrer oppsettet**, og heller ikke da er utfallet garantert.

Hvert lagledd viser de aktuelle, identifiserte **spillerrollene** som kan støtte
lagdimensjonen. Disse holdes atskilt fra individuelt **kildebelagte ferdigheter**.
En spiller i en relevant rolle er ikke automatisk dokumentert god til den;
ukjent kildegrunnlag må fortsatt behandles som ukjent.


## Kvalitetskontroll av de foreslåtte mottrekkene

En `responsePlanId` er en **mulig ny kampplan**, ikke en garanti. Analyseavdelingen
viser nå også en forhåndssjekk for **alle 18** foreslåtte svar:

- de lagdimensjonene alternativets egen firetrekkskjede faktisk krever;
- om dagens ellever foreløpig dekker disse kravene eller mangler bestemte lagledd;
- om samme motstander også blokkerer det alternative mønsteret, eller om relevant
  motstanderforutsetning/motgrep ennå er ukjent;
- den alternative kampplanens egen risiko.

Forhåndssjekken bruker eksisterende `evaluateTacticalSequences`, ingen ny
individuell rating og ingen ekstra xG-bonus. Den viser **dagens** lagmetrikker
med dagens taktikk; et faktisk taktikkbytte krever ny teamFit-beregning,
rolle-/formasjonsvurdering og omstillingskostnad. Et foreslått alternativ som
ikke kan gjennomføres, skal fremstå som **manglende dekning**, ikke som automatisk
bedre. `sim:match-plan` kontrollerer alle 18 alternativene mot komplett,
mangelfullt og ufullstendig lag, utilstrekkelig speiding og manglende katalognavn.


## Midtkampbytte må endre faktisk taktisk lagprofil

Når manageren bytter kampplan, holder det ikke å vurdere ny plan mot den gamle
planens press-, bredde-, dybde- og oppbyggingsprofil. Spillet beregner nå
`teamFit` for **den samme startelleveren og de samme rollene** både under
nåværende og foreslått plan, og overfører endringen i seks lagdimensjoner til
den aktive kampsesjonen: `balanceScore`, `widthScore`, `depthScore`,
`buildUpScore`, `pressScore`, `restDefenseScore`. Beregningen bruker en
**differanse**, slik at allerede registrert trening og innbytterbidrag i
kampsnapshotet ikke viskes ut. Omstillingsgevinsten vurderer gammel plan med
gammel taktisk dekning og ny plan med ny dekning.

Tidligere spilte minutter og lagrede øyeblikksbilder omskrives ikke. Gamle
sesjoner og direkte motorkall uten begge sammenlignbare lagoppslag beholder
gammel profil; motoren dikter ikke opp nye spillerferdigheter. Taktikkens
mønsterbonus gis ikke uten faktisk dekning. En kampplanendring bytter ikke
automatisk roller, spillere eller formasjon; slike justeringer må gjøres av
manageren. Ved innbytte bygger den eksisterende innbyttermotoren videre på
aktivt kampsnapshot, ikke på et nytt sluttresultat fra avspark.

Kampplanens `gameStates`, `family` og `intent` lagres nå også i kampens
start- og endringssnapshots. Tidligere lagrede sesjoner fikk mangelfulle
`gameStates` og kunne derfor bli behandlet som om den gamle taktikken var
feil i enhver kampsituasjon, noe som ga en ubegrunnet `+0,9` i planforbedring.
Appen slår opp den kanoniske gamle kampplanen når den finnes, slik at også
eldre sesjoner vurderes med riktig kontekst ved første taktikkbytte.

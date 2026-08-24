# P2 · de seks gjenstående i avdeling 1, målt

**Ingen av de seks kan landes på tilgjengelige kilder.** Wikipedia er lest for
alle, klubbsidene for fem. To banenavn er rettet, og Eik Tønsbergs
`homePlaceId`-spørsmål — som sto uttrykkelig åpent — er besvart.

Dette dokumentet finnes for at ingen skal lese de samme kildene på nytt for å
komme til samme svar.

---

## Målingen

| Klubb | A-lagsnavn funnet | Med posisjon eller lagdel | Kan lande? |
|---|---:|---:|---|
| Lysekloster | 18 | 0 | nei — troppsmalen har ingen posisjoner |
| Træff | 9 | 0 | nei — «med bakgrunn i», ikke A-lagsspill |
| Eik Tønsberg | 4 | 1 | nei — alle er korte opphold |
| Vidar | 2 | 1 | nei |
| Sotra | 2 | 0 | nei |
| Sandviken | 0 | 0 | nei — artikkelen er kvinnefotball |

Grensa er **15 profiler med kildebelagt posisjon eller lagdel**. Ingen kommer i
nærheten.

**Kvik Halden var unntaket, ikke regelen.** Den landet fordi Wikipedia førte en
A-lagstropp med lagdel. Ingen av de seks har en slik troppsliste: fem har ingen
i det hele tatt, og Lysekloster har en uten posisjoner. Det er den ene
egenskapen som skiller en klubb som kan landes fra en som ikke kan, og den er
billig å måle — søk etter `Spillerstall` i klubbens Wikipedia-artikkel før du
åpner noe annet.

---

## To banenavn rettet

### Træff: «Molde idrettspark» → **Reknesbanen**

Katalogen hadde feil anlegg. Reknesbanen har egen artikkel og er entydig:

> «Reknesbanen er en fotballstadion som ligger sentralt i Molde, ved Træffhuset,
> Idrettsparken, Idrettens hus og Museumsområdet. Banen er hjemmebanen til Træff
> og Molde 2. […] Tidligere het banen Træffbanen og var da en grusbane.»
> Kunstgress, undervarme, kapasitet 1 500 (300 sitteplasser), bygget 2008.

Idrettsparken er altså **nabo**anlegget, ikke Træffs bane. Wikipedias
klubbartikkel fører samme navn i infoboksen.

**Dette oppløser en felle kildelista hadde flagget**, men flyttet den ikke:
listen skrev at Træff «deler bane med Molde FKs rekruttlag og med IL
Molde-Olymp» på Molde idrettspark. Delingen er reell — Reknesbanen er hjemmebane
for **Træff og Molde 2** — men den gjelder en annen bane enn den katalogen
hadde. En import må fortsatt holde Træffs egne A-lagsspillere fra Moldes, og
Molde har alt arv i katalogen (`aker_stadion`).

### Eik Tønsberg: «Eik stadion» → **Tønsberg gressbane**

`docs/P2_KILDELISTE_AVDELING1.md` lot dette stå med vilje: «Eik stadion» finnes
ikke, klubben har to kandidater, og `homePlaceId` er permanent, så avgjørelsen
«hører til importen, med kilden i hånd». **Kilden er nå i hånd.**

> «Tønsberg gressbane er et fotballstadion i Tønsberg. Det brukes som hjemmebane
> av FK Eik Tønsberg 871 som spiller i PostNord-ligaen og Tønsberg FK, og
> tidligere også av FK Tønsberg. Det blei åpna i 1937, og blei seinere ombygd og
> gjenåpna 16. mai 2003. Stadionet har i dag en tilskuerkapasitet på 5 600,
> hvorav 3 820 er sitteplasser. […] Banedekket er kunstgress.»
> — *no.wikipedia.org/wiki/Tønsberg gressbane*

Klubbartikkelens infoboks fører samme bane. **Delingen er bekreftet, ikke
bortforklart:** banen brukes også av Tønsberg FK, akkurat den bekymringen
kildelista hadde. Det endrer ikke hvilken bane som *er* Eiks hjemmebane, og det
er det `homePlaceId` skal peke på.

Eik Idrettsanlegg finnes fortsatt — klubbens egen side fører «Eik
Idrettsanlegg» og «Gressbanen» som to ulike anlegg under *Anlegg og klubbhuset*
— men det er treningsanlegget, ikke hjemmebanen.

Merk at banen heter «gressbane» og har **kunstgress**. Navnet er historisk.

### Ikke rettet: Vidar

Wikipedias Vidar-artikkel skriver «Lassa idrettsanlegg», katalogen har «Lassa
idrettspark». Begge er generiske former av samme sted, og katalogverdien ble
satt 23.08.2026 mot klubbens **egen** anleggsside, som veier tyngre enn
Wikipedias formulering. Samme vurdering som Sotra, der «Straume idrettspark»
står selv om søket skrev «Straume Sotra Stadion». Urørt.

---

## Per klubb

### Eik Tønsberg — 4 navn, 1 med posisjon

Klubbartikkelen løser fella kildelista flagget. Søket hadde gitt åtte navn i én
liste som «players **and coaches**», uten å si hvem som var hva. Artikkelen
skiller dem:

> «[[Nils Johan Semb]] var trener i perioden 1988–91.
> Kjente spillere som har hatt kortere klubbopphold, er blant annet Erik Solér,
> Ronny Johnsen, Jan Frode Nornes, **keeperen** Erik Thorstvedt og **treneren**
> Morten Sanne Melvold.»

Fire spillere, én av dem med posisjon (Thorstvedt, keeper → `GK`). To trenere,
uttrykkelig merket. Alle fire spillerne er «kortere klubbopphold», og flere
finnes i katalogen fra før, så en import ville i hovedsak blitt krysskoblinger.

**Identiteten er også avklart.** Klubben er stiftet 1. januar 2020 som en
sammenslåing av *Eik Tønsberg IF* og *FK Tønsberg* — den «egne FK Tønsberg» som
søket returnerte og kildelista ikke kunne plassere, er altså den ene halvdelen
av dagens klubb, ikke noe annet.

Arven er ekte: hovedserien fra 1957, bronsefinale og tredjeplass i landet i
1960, og tre sesonger på øverste nivå 1983–85. Men artikkelen navngir ingen fra
den perioden.

### Vidar — 2 navn, 1 med posisjon

> «Flest A-kamper for Vidar har keeper **Egil Klinkenberg**, som spilte 510
> kamper i perioden 1966–1991. **Jan Fjetland** er mestscorende med 289 mål.»

De to sterkest belagte enkeltprofilene i hele avdelingen: begge med tall, den
ene med posisjon. Men to er to.

### Sandviken — 0 navn

Fella kildelista flagget er bekreftet i full bredde. Artikkelen er på
14 600 tegn den lengste av de seks, og **den handler om kvinnefotball**:
pionérklubb, NM fra 1978, seriegull 2021, og overgangen til SK Brann Kvinner i
2021. Herrelaget får én setning: «De har også et herrelag i fotball som spiller
i 2. divisjon i 2025.»

Ingen herrespillere er navngitt. En import som leste «Sandvikens historie» uten
å skille lag ville trukket kvinnelagets spillere inn i en herrepool — nøyaktig
det listen advarte mot.

### Lysekloster — 18 navn, 0 posisjoner

Den eneste av de seks med en troppsmal på Wikipedia,
`Mal:Lysekloster Idrettslag spillerstall`, oppdatert for 2026-sesongen. Den
fører 18 spillere med draktnummer og navn, **og ingenting mer**. Ingen posisjon,
ingen lagdel.

Draktnummer er ikke posisjon. At nummer 1 pleier å være keeper er en konvensjon,
ikke en kilde, og den slutningen er nøyaktig den formen for gjetting katalogen
er bygget for å unngå.

Klubbartikkelen har ingen spillerhistorikk — bare opprykkene fra 6. divisjon i
2009 til 2. divisjon i 2015. Banen er bekreftet: «Lysekloster FRAMO
Idrettspark», åpnet 2008. Framo er sponsoren, og katalogens sponsorfrie form
står.

### Sotra — 2 navn

> «== Kjente utøvere == · Knut Tørum, fotball · Kristoffer Zachariassen, fotball»

Begge er fotballspillere, men «kjent utøver» sier ikke at de spilte på Sotras
A-lag, og Sotra er en sammenslåing fra 2009 av Øygard (1945), Foldnes IL og
Brattholmen IL — kilden må si hvilken enhet en spiller representerte. To navn
uten den avklaringen er uansett for lite.

Banen er bekreftet: A-laget «holder til på Straume Idrettspark, og spiller sine
kamper på Sotra stadion». Idrettsparken rommer Sotra stadion og Straumebanen.
Katalogens «Straume idrettspark» er den stabile, generiske formen og står urørt.

### Træff — 9 navn, ingen bekreftet som A-lagsspill

Artikkelen har en liste under overskriften **«Spillere med bakgrunn i Træff»**:
Christian Gauseth, Fredrik Solberg, Tina Wulf Eikeland, Tommy Eide Møster, Kai
Røberg, Bernt Hulsker, Simon Markeng, Jahn Ove Wiik og Øyvind Gram.

«Med bakgrunn i» er en **utviklingspåstand**, ikke en A-lagspåstand — den samme
grensa importregelen trekker mot rekruttlag og ren registrering. Lista blander
dessuten kvinne- og herrefotball (Tina Wulf Eikeland). Hver av de ni må
kontrolleres mot sin egen kilde før noen av dem kan importeres, og flere av dem
er kjente spillere som allerede finnes i katalogen med andre arver.

---

## Kilder, lest 24.08.2026

| Kilde | Ga |
|---|---|
| `no.wikipedia.org`, seks klubbartikler | navn, banenavn, sammenslåinger — ingen troppslister |
| `Mal:Lysekloster Idrettslag spillerstall` | 18 navn, 0 posisjoner |
| `no.wikipedia.org/wiki/Tønsberg gressbane` | Eiks hjemmebane, kapasitet, deling med Tønsberg FK |
| `no.wikipedia.org/wiki/Reknesbanen` | Træffs hjemmebane, deling med Molde 2 |
| `fkeiktonsberg.no`, `traeff.no`, `sotrask.no`, `ilsandviken.no` | navigasjon; A-lagssidene er JS-lastet og ga ingen tropp |
| `lysekloster.no` | 404 |

Klubbsidene kjører samme CMS som Kvik Haldens, der troppssiden heller ikke lot
seg hente. **Der ligger den beste gjenværende muligheten for alle seks**: en
A-lagsside med posisjoner ville landet flere av dem på lagdel-formen, slik den
landet Kvik. Den krever en nettleser som nettstedet slipper gjennom.

Sandviken har i tillegg to spor ingen har åpnet: *IL Sandvikens jubileumsbok fra
2020* og et *Digitalt Arkiv* på klubbsiden. Begge er sjangeren som gir dekning —
men klubbens dokumenterte historie er kvinnefotball, så de må leses med
lagskillet i hånd.

# P2 · avdeling 1 — 13 av 14 klubber har arv

**Dette dokumentet konkluderte først med at ingen av de seks gjenstående kunne
landes. Den konklusjonen var feil, og feilen er verdt mer enn resultatet.**

Målingen leste klubbenes *redaksjonelle* kilder — historiesider, Wikipedia-
artikler, SNL, jubileumsbøker — og fant fire A-lagsnavn hos Bjarg, ni hos Træff,
null hos Sandviken. Riktig målt, men feil spørsmål. **Ingen av dem var kilden
som landet klubbene.**

---

## Kilden som fantes hele tiden

Norges Fotballforbund publiserer troppen for hvert registrerte lag på
`fotball.no/fotballdata/lag/hjem/?fiksId=N`. Siden er **server-rendret** — den
ligger i HTML-en og krever ingen nettleser — og spillerne står gruppert under
fire overskrifter:

> **Keeper · Forsvar · Midtbane · Angrep**

Det er nøyaktig oppløsningen `positionGroup` bruker, og nøyaktig oppløsningen
motorens `SQUAD_GROUPS` er bygget på. Kvik Halden landet på en Wikipedia-tropp
med de samme fire kodene; her finnes den samme troppen for **hver eneste klubb**,
fra klubbens egen registrering hos forbundet.

Sju klubber ble lest ut som `pending` på redaksjonelle kilder. Seks av dem
landet på registeret.

| Klubb | Redaksjonelle navn | NFF-troppen | Importert |
|---|---:|---:|---:|
| Sandviken | 0 | 32 | **31** |
| Bjarg | 4 | 28 | **32** |
| Vidar | 2 | 25 | **26** |
| Træff | 9 | 24 | **23** |
| Eik Tønsberg | 4 | 21 | **25** |
| Lysekloster | 18 (uten posisjon) | 18 | **16** |
| Sotra | 2 | 12 | — |

**Avdeling 1 har nå arv i 13 av 14 klubber.** Bare Sotra står igjen: deres
registrerte A-lagstropp har 12 spillere, tre under grensa.

---

## Hva som gikk galt i den første målingen

Feilen var ikke i lesingen, den var i **spørsmålet**. Passet spurte «hva
forteller klubben om sin egen historie?» og målte det nøye. Det riktige
spørsmålet var «hvem er registrert på A-laget nå?».

De to kildetypene svarer på hver sin ting, og bare den ene gir en pool:

- **Redaksjonelle kilder gir dybde.** Bjargs fire navn med sitat og årstall,
  Vidars klubbrekorder (510 kamper, 289 mål), Kviks cupvinnerlag fra 1918,
  Eiks fire spillere med korte opphold. De er arven.
- **Registeret gir bredde.** Tjue til tretti navn med lagdel, for hver klubb,
  oppdatert hver sesong. Det er poolen.

En klubb trenger femten spillbare. Redaksjonelle kilder ga femten hos **null** av
de åtte klubbene i avdelingen. Registeret ga det hos sju av åtte.

Lærdommen er den samme som P1 endte på, men snudd: **sjangeren avgjør — og for
en spillbar pool er sjangeren et register, ikke en fortelling.**

---

## Lagvalget går gjennom ligatabellen

Klubbenes lagoversikter hos NFF blander A-lag, rekruttlag, andrelag og
7er-lag — Bjarg har 84 registrerte lag, Sotra 79. Å plukke «det som ser ut som
A-laget» er en gjetning.

Laget er derfor identifisert mot **tabellen for 2. divisjon avdeling 1**
(`turnering/tabell/?fiksId=206007`), som lenker det laget klubben faktisk
stiller i divisjonen. Det er ikke en formalitet:

- **Sandviken** ga først 10 spillere fra `Sandviken Menn Senior B` — B-laget.
  Riktig lag, `Menn Senior A`, har 32.
- **Eik Tønsberg** ga først 10 fra `FK Eik Tønsberg Menn 1` under breddeklubben
  AIL. Riktig lag er `FK Eik Tønsberg 871 Menn Senior A` med 21.

To av åtte ville fått feil tropp uten den kontrollen.

---

## Identitet: seks nær-duplikate navn, seks ulike svar

`audit:attributes` flagger navnepar som skiller seg med ett navneledd. De seks
NFF-troppene utløste seks slike par, og vakten avgjorde **tre av dem mot
importen**:

| Nytt navn | Katalogen fra før | Avgjørelse |
|---|---|---|
| Rolf Birger Pedersen (Bjarg) | Rolf Birger «Pesen» Pedersen, Brann | **krysskoblet** — Bjarg-kilden sier «tidligere Brannspiller» |
| Vegard Valgermo Forren (Træff) | Vegard Forren, Molde | **krysskoblet** — Wikipedia: «spillende assistenttrener for Træff» |
| Alexander Alnæs Pedersen (Bjarg) | Alexander Pedersen, Lyn | to menn — angrepsspiller mot keeper |
| Tommy Rivaldo Svendsen (Lysekloster) | Tommy Svendsen, Skeid | **utelatt** — samme lagdel, ingen kilde |
| Jonas Eide Vågen (Lysekloster) | Jonas Vågen, Åsane | **utelatt** — samme lagdel, ingen kilde |
| Adrian Bergersen (Vidar) | Adrian Amundsen Bergersen, Egersund | **utelatt** — samme lagdel, ingen kilde |
| Herman Stakset (Sandviken) | Herman Stang Stakset, Levanger | **utelatt** — samme lagdel, ingen kilde |

De fire utelatte er ikke avvist som spillere. Der lagdelen er den samme finnes
det ikke noe skille å begrunne to menn med, og NFFs personprofiler fører bare
aktive roller. Å slå sammen to dokumenterte klubbkarrierer er den ene feilen som
ikke kan angres; å påstå at de *er* to menn er like ubelagt. Utelatelse påstår
ingenting.

I tillegg er **Petter Eichler Jensen** (Træff) utelatt på en hard motsigelse:
NFF fører ham som keeper, katalogen som `CB`/`CM`/`DM` fra Mjøndalen-arven.

---

## Draktnummer er ikke importert

NFF fører draktnummer for de fleste. At nummer 1 pleier å være keeper er en
konvensjon, ikke en kilde — og lagdelen sier allerede det draktnummeret ville
antydet, bare belagt. Nummeret er derfor lest og forkastet.

---

## To banenavn rettet underveis

**Træff** sto som «Molde idrettspark». Det er naboanlegget; banen heter
**Reknesbanen** og er hjemmebane for Træff og Molde 2. Fella kildelista flagget
var reell, men hang på feil bane.

**Eik Tønsberg** sto uttrykkelig åpen fordi `homePlaceId` er permanent og
klubben har to kandidater. Både klubbartikkelens infoboks og banens egen
artikkel fører **Tønsberg gressbane** som hjemmebane, kapasitet 5 600, åpnet
1937 og ombygd 2003. Delingen med Tønsberg FK er bekreftet, ikke bortforklart.

**Vidar** er ikke rettet: Wikipedia skriver «Lassa idrettsanlegg», katalogen har
«Lassa idrettspark», og katalogverdien ble satt mot klubbens egen anleggsside.

---

## Sotra, som ikke landet

`Sotra Menn Senior 1` er identifisert gjennom ligatabellen og har **12
registrerte spillere**: 1 keeper, 5 forsvar, 2 midtbane, 4 angrep. Tre under
grensa.

Klubbartikkelen navngir to «kjente utøvere», Knut Tørum og Kristoffer
Zachariassen, men «kjent utøver» sier ikke at de spilte på Sotras A-lag — og
Sotra er en sammenslåing fra 2009 av Øygard (1945), Foldnes IL og Brattholmen
IL, så kilden må si hvilken enhet en spiller representerte.

Én av dem, **Erlend Hellevik Larsen**, kolliderer dessuten med katalogens
`erlend_hellevik_larsen` (`CB`/`DM`, Åsane) mens NFF fører ham i angrep — en
motsigelse som uansett måtte avklares.

Sotra lander den dagen troppen passerer femten, eller en klubbkilde navngir
spillere med posisjon. Registeret oppdateres hver sesong, så det første er det
mest sannsynlige.

---

## Verktøyet

`fotball.no` er server-rendret, så `curl` holder. Person- og turneringssidene er
det ikke, og nettleseren i dette miljøet når ikke agent-proxyen direkte
(`ERR_CONNECTION_RESET`). Løsningen som virker er å la Playwright avskjære hver
forespørsel og hente den med Node sin `fetch` under `NODE_USE_ENV_PROXY=1` —
nettleseren kjører da uten eget nett, og alt går gjennom en transport som
fungerer.

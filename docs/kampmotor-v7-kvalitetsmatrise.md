# Kampmotor v7 – deterministisk kvalitetsmatrise (24. oktober 2026)

Denne bolken kvalitetssikrer **den eksisterende** individuelle defensive
reaksjonsberegningen fra PR #521. Den endrer ikke kampmotorens koeffisienter,
sjanser eller xG.

## Testdekning

Kommando: `npm run sim:v7-defensive-matrix`. Den er også del av
`Simuleringer (motorer ende-til-ende)` i ordinær CI.

Matrisen har **120 deterministiske celler**:

- Fire angrepskorridorer: tredjemann sentralt, sideskift mot venstre, sideskift
  mot høyre og direkte ball i bakrom.
- Tre frister per korridor: tidlig handlingsfrist, knapp sluttfrist og
  frist ved slutten av hele sekvensen.
- Ti spillerprofiler: uten dokumentert styrke, fart, posisjonering,
  forventning/anticipation, spilleforståelse, defensiv lesning, kombinert
  fart+posisjonering+spilleforståelse, ubelagt påstand og to
  duellferdigheter som ikke skal gi bonus ved ren forflytning.
- Kontrafaktiske spillerbytter med **samme** taktikk, rolletilpasning,
  motstander, tidssekvens og sannsynlighetstrekk. Dette skal gi 24 tilfeller
  der en dokumentert styrke vipper en knapp tidsfrist.
- To ekstra samspillsscenarier kontrollerer at en avløser rekker / ikke
  rekker et faktisk tospillers sikringsbytte. De øvrige oppgavene er i tide;
  derfor er det overtakelsen, ikke en skjult lagbonus, som gjør forskjellen.

## Hva som skal være sant

1. Kildebelagt og relevant styrke gir aldri **senere** ankomst. Ikke-relevant
   eller udokumentert styrke er nøytral.
2. Samlet tidseffekt er høyst **0,25 sekunder per definert oppgave**,
   ikke 0,25 sekunder per ferdighet. Modellen gir ikke en automatisk bonus
   for alle defensive handlinger.
3. Første press-sannsynlighet og eksisterende rollepassform endres ikke ved
   bytte av én spiller. Den eksisterende sikringsporten kan beholdes eller
   falle bort, aldri gi mer enn sin nåværende maksimale justering 0,03.
4. Samme RNG ved en knapp frist gir reproducerbar `contained` for den
   kildebelagte forsvareren og `escaped` for den udokumenterte.
5. Replays forklarer om sikringen er i tide, for sen eller om et sikringsbytte
   svikter. Ingen ekstra xG-hendelse oppstår.

## Begrensninger

Dette er **konstruerte, eksplisitt forfattede spillesituasjoner**, ikke
fotballspillernes GPS- eller trackingdata. V7 behandler ferdigheter binært
(dokumentert / ikke dokumentert), ikke som kalibrerte skårer for «svak» og
«sterk». Testen beviser kausal følsomhet og interne grenser, ikke at tidene
er empirisk korrekt kalibrert mot virkelige fotballkamper.

Samarbeidstesten dekker dagens eksplisitte sikringsbytte mellom to forsvarere;
den innfører ikke en egen relasjons- eller kjemibonus. Motstanderens valgte
angrepskorridor er forhåndsdokumentert. Dynamisk motstanderscouting og
automatisk utnyttelse av svakeste korridor kommer i en **senere** bolk.

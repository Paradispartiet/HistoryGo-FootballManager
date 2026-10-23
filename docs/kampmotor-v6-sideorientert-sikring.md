# Kampmotor v6 – sikring ved pressgjennombrudd og sideskift

Oppdatert 22. oktober 2026. Dette er en modellspesifikasjon, **ikke** empirisk estimerte sannsynligheter eller opptak av observerte spillerbevegelser.

## Fotballfaglig grunnlag

England Football beskriver press, sikring og balanse som **samordnede handlinger**. Nærmeste spiller presser; støtteledd sikrer rommet og spillerne lengst unna balanserer laget. Når spillet vendes, må forsvarerne forskyve seg samlet, ikke forsøke å dekke hele bredden hver for seg. Retning, timing og avstand til medspillere er avgjørende.

- [How to defend like England: roles and responsibilities](https://learn.northeurope.englandfootball.com/articles-and-resources/coaching/resources/2022/How-to-defend-like-England-roles-and-responsibilities)
- [Pressing and covering: cover and recover](https://learn.englandfootball.com/sessions/resources/2026/Pressing-and-covering-session-cover-and-recover)
- [What are the principles of football?](https://learn.westeurope.englandfootball.com/articles-and-resources/coaching/resources/2022/What-are-the-principles-of-football)

Disse prinsippene begrunner *hvilke mekanismer* motoren prøver å representere, **ikke** den konkrete numeriske koeffisienten.

## Kontrakten i dagens beregning

1. **Første pressledd:** Press, spillerfit, motstand og dokumentert utvei avgjør sannsynligheten for å vinne ballen. Sidespesifikk sikring må aldri endre dette leddet.
2. **Presset brytes:** Restforsvar, balanse, spillerfit og trussel gir basen for å begrense angrepet.
3. **Relevant rollepar:** For dokumentert `third_man` kreves balanserende sekser og pressende indreløper. For `direct` kreves minst to stoppere og balanserende sekser. For `switch_play` kreves backen som faktisk er på den **dokumenterte** målsiden, eller begge støttebackene hvis målsiden er ukjent.
4. **Kvalitet:** Bare dokumentert rollefit fra den beregnede elleveren kan gi en ekstra justering. Maksimalt 0,03 i fase to, og null ved utilstrekkelig grunnlag.
5. **Utfall:** Ett terminalt forløp tildeler xG én gang. Ingen separat xG-verdi til sikring, lagdel eller spiller.

### Dokumentert målside

Kun for `tacticalBehaviour.pressEscapeRoute = "switch_play"` kan `tacticalBehaviour.pressEscapeTargetFlank` være `"left"` eller `"right"`. Verdien er angrepsmålsiden sett fra **lagets egen defensive venstre/høyre**. En slik verdi må være eksplisitt levert av scenarioet; motoren utleder den ikke fra hvilket lag som spiller, initial formasjon, rolleetikett eller ukjent observasjon.

- **Ukjent/ugyldig målside:** Konservativ sikringskontroll på begge sider, som i #502. Ingen oppdiktet sidespesifikk fordel.
- **Kjent høyreside:** Beregnet støtteback på høyre side kan gi relevant sikring; avansert høyreback kan ikke.
- **Kjent venstreside:** Speilvendt.
- **Observerte isolasjonsdata:** `pressEscape = "isolated"` overstyrer eldre opplysninger om utvei og målside; ingen ekstra spesialistsikring.

`counterplay.documentedTargetFlank`, `counterplay.defensiveReply.evidence.documentedTargetFlank` og `evidence.documentedTargetFlank` dokumenterer hva modellen faktisk brukte. Tom verdi betyr at målsiden ikke er kjent.

## Regresjoner

`sim:own-press-v6` tester identisk ellever og terningkast med én opptrukket back, men to forskjellige dokumenterte målsider. Bare korrekt side får rollen sin registrert; et kontrollert sannsynlighetsintervall skal vippe `contained` ↔ `escaped`.

`sim:v6-lineup-sensitivity` kjører den faktiske spillerfit → lagfit → kampdag-kjeden med syntetiske kontrollspillere. Den validerer 4-3-3, 4-2-3-1, 4-4-2 og 3-4-3, tre utveier, to rollefit-nivåer, konservativ ukjent målside, kjent asymmetrisk målside og kontroll mot dobbel xG.

## Avgrensning og neste hypotese

Dette er **rolle- og retningsspesifikk** sikring, ikke posisjonssporing i sanntid. For realistisk forskyvning må motoren i en senere versjon ha kildebelagt informasjon om ballside, faktisk avstand, bevegelsestid, pressutløser, antall støtteledd og forflytning over tid. Uten slike data skal motoren ikke utgi rolleetiketter for å være koordinater.

Koeffisienten og grensene er testbare spilldesignhypoteser, ikke empirisk kalibrert effekt fra kampdata.


## Dokumentert reaksjons- og forskyvningsvindu (neste fase)

En forsvarer kan ha riktig sikringsrolle, men likevel komme for sent til rommet når motstanderen har spilt gjennom første press. Dette bygger på *covering* (riktig avstand/vinkel før gjennombruddet) og *recovering* (forflytning tilbake etter gjennombruddet). FIFA og England Football fremhever at forsinkelse av ballføreren og organisert returløp gir lagkameratene nødvendig tid til å sikre rommene.

- [England Football: What is covering and recovering? (2023)](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2023/What-is-covering-and-recovering)
- [FIFA Training Centre: Abdallah Idrissi – Recovering shape in defensive transitions (2022)](https://www.fifatrainingcentre.com/en/practice/elite-sessions/transition-to-defending/defensive-transitions.php)
- [England Football: How to defend like England – transition](https://www.thefa.com/bootroom/resources/coaching/how-to-defend-like-england-transition)

**Datakontrakt:** Dette er frivillig, eksplisitt scenariodata, ikke automatiske tidsestimater. Når `pressEscapeRoute` er en støttet `third_man`, `switch_play` eller `direct`-rute, kan scenarioet oppgi:

```js
tacticalBehaviour: {
  pressEscapeRoute: "third_man",
  pressEscapeTiming: {
    basis: "authored_scenario",
    route: "third_man",
    attackWindowSeconds: 3.0,
    defenderArrivalSecondsByPlayerId: {
      "known-balancing-six-id": 2.1,
      "known-pressing-midfielder-id": 2.5
    }
  }
}
```

* **Tilgjengelig tid** starter når første press er brutt og slutter når motstanderens neste angrepshandling når den eksponerte korridoren. Det er *scenariopåstander*, ikke målinger fra en tracker.
* **Sikringens ankomsttid** må gis eksplisitt for **hver** relevant spiller-ID i det aktuelle defensive rolleparet. Vi bruker den senest ankomne av spillerne som må samarbeide. Ukjent eller ugyldig verdi, feil rute, feil datagrunnlag eller manglende spiller-ID gir tilstanden `invalid_or_incomplete`; hele pressberegningen forblir ellers som før.
* **Innenfor tidsvinduet:** Eksisterende rollebasert sikringsbonus beholdes; ingen tidsbonus legges til.
* **For sent:** Bare den eksisterende spesialistjusteringen (maks 3 prosentpoeng) faller bort. Lagets beregnede `restDefenseScore` og `balanceScore` forblir intakt.
* **Uten tidspunkt:** Oppførselen fra #503 beholdes nøyaktig. Ukjente data fortolkes verken som rask eller treg respons.
* **Ingen dobbeltelling:** Ingen endring i første pressfase, ingen ekstra xG for en sen spiller eller den gjenstående samhandlingskjeden.

`evidence.routeCoverTiming` og `counterplay.defensiveReply.coverTiming` lagrer `status` (`not_provided`, `invalid_or_incomplete`, `in_time`, `late` eller `not_applicable`), `basis`, tilgjengelig tid, seneste ankomst og differansen. Dette er **beregnet scenarioutfall**, ikke observert løpshastighet eller romlig posisjon.

**Testbar antakelse:** Den svakeste/seneste nødvendige deltakeren styrer om en koordinert spesialistkjede blir klar før angrepet. Den binære tidsporten er spilldesign, ikke empirisk kalibrert sannsynlighet. En framtidig dynamisk modell må kjenne faktiske spillerposisjoner, hastighet, pasningstidspunkter og motstanderens valg før den kan erstatte dette med simulerte bevegelser.


## Fireleddets tidslinje i aktiv kampsimulering

Når første press er brutt, kan kampens eksisterende `opponent.tacticalBehaviour`
levere et eksplisitt sekvensforløp i `pressEscapeActionSequence`. Denne går
gjennom den **samme** `resolveOwnPressAgainstOpponent`-kjeden som allerede
kjøres av `advanceMatchClock`. Den lager ingen ekstra sjanse eller xG.

```js
pressEscapeRoute: "third_man",
pressEscapeActionSequence: {
  basis: "authored_action_sequence",
  route: "third_man",
  actions: [
    { id: "receive", durationSeconds: 0.7 },
    { id: "layoff", durationSeconds: 0.5 },
    { id: "third_runner", durationSeconds: 0.7 },
    { id: "through_pass", durationSeconds: 1.2 }
  ],
  defenderResponsesByPlayerId: {
    "known-six-id": {
      triggerActionId: "receive",
      recognitionDelaySeconds: 0.4, coverMoveSeconds: 2.1
    },
    "known-midfielder-id": {
      triggerActionId: "layoff",
      recognitionDelaySeconds: 0.4, coverMoveSeconds: 1.9
    }
  }
}
```

Tidsbudsjettet fra gjennombrudd i første press til neste farlige korridor
er summen av de fire offensive handlingsvarighetene. Ankomsttiden for en
relevant forsvarer er *forløpt tid frem til eget navngitte press-/sikringssignal
+ gjenkjenningsforsinkelse + bevegelses-/sikringstid*. Uten
`triggerActionId` regnes tiden fra starten av første angrepshandling.
Ukjent signal gir `invalid_or_incomplete`. Seneste av de nødvendige
spillerne bestemmer om spesialistdekningen er på plass.
Dette er en **diskret, forfattet hendelsestidslinje**, ikke kontinuerlig
bevegelsessimulering. Verdiene over er kun demonstrasjonsdata.

Rute-ID-er må stemme med alle fire handlings-ID-ene, i fast rekkefølge:
`third_man`: receive, layoff, third_runner, through_pass;
`switch_play`: receive, release, switch_pass, wide_attack;
`direct`: receive, direct_ball, first_touch, support_run.

Ukjent, ikke-endelig, negativ eller manglende forsvarstid, manglende spiller-ID,
feil rute eller ugyldige offensive varigheter gir `invalid_or_incomplete`
uten effekt på den gamle sikringsbonusen. Ingen sekvens gir `not_provided`.
Dersom begge feltene finnes, brukes den opprinnelige
`pressEscapeTiming` for kompatibilitet med eksisterende save/scenario.
Målrettede tester dekker en ellever gjennom produksjonsfit, forskjellig
utfall med samme trekning, ugyldige sekvenser og uforandret xG-regnskap.

**Nåværende evidensgrense:** Verken gjenkjenningstid, pasningstid eller
forsvarernes forflytning er avledet automatisk fra ferdigheter, sprint,
pressposisjon eller kampens faktiske koordinater. Følgelig kan tidslinjen
bare påvirke spill ved eksplisitt scenariodata. Før automatisk generering
må vi etablere spillerferdigheter med kjent proveniens, startrom og
pressutløser og validere en modell mot uavhengig annoterte sekvenser.


### Pressignal og reaksjonsforsinkelse

`triggerActionId` kan eksplisitt peke på ett av de fire handlingsleddene.
En sekser kan reagere når første pasning tas imot, mens en indreløper
først gjenkjenner tredjemannsløpet. Vi summerer da tidligere handlingers
varighet før hans gjenkjennings- og løpstider. Ingen forsvarer får
automatisk «spå» et senere løp, og tidsforsinkelsen gir verken
selvstendig xG eller nye tilfeldige hendelser. Produksjons-XI og syntetiske
regresjonstester sammenlikner identiske lag/trekninger med tidlig og sen
reaksjonsutløser.

Det er fortsatt ikke GPS-posisjoner, fysisk fart eller maskinlært
reaksjonstid: trigger og varighet må oppgis eksplisitt.


## Kildebelagt reaksjonsferdighet uten oppdiktede sekunder

Kampens spiller-snapshot bærer nå `sourcedRecoverySkills`: bare
`anticipation`, `game_reading` og `defensive_reading` med **direkte
`belagt` proveniens og samsvarende faktisk styrketoken**. Det samme feltet
oppdateres for benkespillere, innbyttere og taktikkbytte når rosterkildene
foreligger. En tidligere spillers ferdighet må aldri arves av innbytteren.

Et scenarioutkast kan angi to **forfattede reaksjonsutløsere** for en konkret
forsvarer:

```js
sourcedCue: {
  skill: "anticipation",
  earlyActionId: "receive",
  defaultActionId: "layoff"
}
```

Bare når spilleren i den aktive elleveren har direkte belagt ferdighet,
brukes den tidlige reaksjonsutløseren. Uten kilde forblir scenariets
uttrykkelige standardutløser gjeldende. Begge grenene bruker scenarioets
allerede fastsatte `recognitionDelaySeconds` og `coverMoveSeconds`:
**ferdigheter omregnes ikke til fysisk løpstid**. Et felt med både
`sourcedCue` og `triggerActionId`, ugyldig skill-ID, omvendt
tidsrekkefølge eller ukjent handlings-ID er ugyldig og gir nøytral
fallback. Det legges ikke på en separat attributtbonus eller xG.

Dette er et kildebevisst *taktisk cue-valg*, ikke kalibrert reaksjonshastighet.
Det bør testes videre mot reelle klipp før automatiserte tidspunkt eller
distanser introduseres.


## Geometrisk sikringsvindu – eksplisitt scenariomodell

Kampmotoren kan nå beregne **forflytningstid** fra start- og sikringspunkt,
i stedet for å kreve at hele `coverMoveSeconds` skrives inn. Dette er en
alternativ form av det samme forfattede `pressEscapeActionSequence`, **ikke**
automatisk rekonstruksjon av lagets posisjoner.

```js
pitchDimensionsMeters: { widthMeters: 68, lengthMeters: 105 },
defenderResponsesByPlayerId: {
  "documented-defender-id": {
    triggerActionId: "receive",
    recognitionDelaySeconds: 0.4,
    coverMovement: {
      basis: "authored_pitch_geometry",
      startMeters: { x: 20, y: 50 },
      coverMeters: { x: 26, y: 50 },
      averageSpeedMetersPerSecond: 4
    }
  }
}
```

`x` går på tvers av banen (0 til banebredden), `y` langs banen
(0 til lengden), begge i meter fra **samme forsvarsperspektiv**.
Banemål må oppgis og ligge innenfor IFABs dimensjoner:
45–90 m bredde og 90–120 m lengde.
https://www.theifab.com/laws/latest/the-field-of-play/

Regneregel: Forflytningstid = euklidsk rettlinjedistanse fra
`startMeters` til `coverMeters` delt på scenarioets **eksplisitt
forfattede gjennomsnittlige forflytningsfart**.
Ankomsttid = tid før spillerens utløser + reaksjonsforsinkelse
+ forflytningstid. Dette er en **nedre idealisert distansebane**, ikke
virkelig sprintbane gjennom pressende spillere. Scenariobruker må
oppgi start-/sikringspunkter og forflytningsfart; modellen utleder
aldri spillerfart fra generisk rating, rolle, formasjon eller ferdigheter.
Fartsgrenser (0,5–10 m/s) er inputvalidering, ikke en målt
hastighetsfordeling. Reelle spillerdata mangler fortsatt presise
posisjoner og hastigheter.

`coverMoveSeconds` er fortsatt et gyldig alternativ i eldre
scenarier, og kan brukes av andre forsvarere i samme angrepsforløp.
Det er ikke lov å gi både sekundtall og geometri for samme forsvarer.
Ugyldig banestørrelse, utenfor-banen-koordinater, ugyldig fart,
manglende punkter eller ankomst over 20 sekunder er nøytralt
`invalid_or_incomplete` i hele spesialistkjeden.
`evidence.routeCoverTiming.movementModel` skiller mellom
`authored_pitch_geometry`, `authored_move_seconds` og
`mixed_authored_responses`. Verken første pressfase,
grunnsikring eller xG-betaling endres.

**Fotballfaglig motivasjon:** FIFA beskriver nærmeste press, medspilleres
dekning, laget som en kompakt struktur og returløp i direkte sammenheng.
Den konkrete formelen, grensene og scenariotidene er spilldesign,
ikke tall utledet fra FIFA eller validert kamptracking.

- https://www.fifatrainingcentre.com/en/practice/elite-sessions/transition-to-defending/defensive-transitions.php
- https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/zonal-defending/developing-defensive-coordination-in-small-groups.php


## Rutespesifikke sikringskorridorer (valgfri scenariokontrakt)

Et nytt valgfritt felt `spatialLane` knytter den *forfattede*
geometriske sikringen til **den samme motspillruten**:

```js
spatialLane: {
  basis: "authored_route_lane",
  route: "switch_play",
  channel: "far_side_wide",
  coordinateFrame: "defending_goal_y0_right_xmax",
  targetFlank: "right"
}
```

Dette er modellens **normerte soner**, ikke målte spillerposisjoner:

- **Tredjemann (`third_man`)**: `central_between_lines`, sikringspunkter
  i midtre halvdel av banebredden (25–75 %).
- **Sideskift (`switch_play`)**: `far_side_wide`, sikringspunkter i ytterste
  fjerdedel på korrekt navngitte kant, sett fra forsvarets perspektiv.
  `targetFlank` må stemme med motstanderens dokumenterte
  `pressEscapeTargetFlank`, og den tilhørende backen må være rollevaliderte.
- **Direkte bak presset (`direct`)**: `depth_behind_press`, sikringspunkter
  på forsvarets egen banehalvdel, målt fra forsvarsmålet ved `y=0`.

Alle nødvendige forsvarere må ha gyldige forfattede
`coverMovement`-punkter i riktig sone; en ren ferdig sekundverdi kan
ikke bekrefte en *romlig* korridor. Ugyldig rutemerking, uavklart/motstridende kant,
feil koordinatramme og manglende eller ugyldig måleinput gir
`invalid_or_incomplete` (nøytral gammel dekning). En **gyldig forfattet
målposisjon utenfor riktig korridor** gir derimot `wrong_corridor`:
spesialistdekningen tapes, også om spilleren rekker målet i tide.
Det er en kjent taktisk feilplassering, ikke manglende informasjon. Resultatet viser bekreftet kanal i
`evidence.routeCoverTiming.spatialLane`. Uten `spatialLane` er den
tidligere sekund-/geometrimodellen helt uendret.

En back som er langt unna *riktig* kant kan derfor komme for sent,
selv når han har riktig rolle. En spiller som løper til feil side
kan ikke påberope seg koordinert spesialistsikring. Dette påvirker
fortsatt **bare** den tidligere avgrensede spesialistjusteringen –
det skaper ingen ny pressbonus eller ekstra xG.

**Viktig evidensgrense:** 25/75 %-grensene er en eksplisitt,
diskret **spillregel** for scenarioenes koordinatbruk, ikke
empirisk dokumenterte presslinjer eller påstander om faktiske
spillerposisjoner. Tak på spillernes fart og tid fra forrige
leveranse er uendret. Testene varierer både riktig/feil sone
og ankomsttid under samme ellever og RNG.


## Ulike sikringsfrister før ulike angrepshandlinger

En forsvarer kan måtte dekke rommet **før en tidligere handling**
i motstanderens fireleddede angrep starter. Dette kan nå angis i den
enkelte spillers `defenderResponsesByPlayerId`:

```js
{
  triggerActionId: "receive",
  recognitionDelaySeconds: 0.4,
  coverMoveSeconds: 1.0,
  mustCoverByActionId: "through_pass"
}
```

`mustCoverByActionId` er en valgfri navngitt frist. Den må vise til en
handling i **samme rute**, og betyr *før starten* av denne handlingen.
For eksempel må sikring før `third_runner` rekke frem før løpetrinnet
begynner; en stopper som bare må sikre foran `through_pass` får den
lengre fristen. Fristen beregnes ved å summere alle *foregående*
handlingers eksplisitte `durationSeconds`. Uten feltet gjelder den
tidligere fristen ved **slutten** av hele angrepet.

Den svakeste individuelle **tidsmarginen** er styrende, også dersom
andre forsvarere ankommer tidlig. `marginSeconds` representerer derfor
minste av (spillerens frist – spillerens ankomst).
Ved individuelle handlingsfrister viser evidensen også
`deadlineModel: "per_defender_action_start"`,
`criticalDefenderId` og `criticalDeadlineSeconds`.

Dette virker samtidig med `sourcedCue` og forfattet geometri /
`spatialLane`, men angir **ingen automatisk utledede frister**.
Samme pressannsynlighet og terminale xG-regnskap beholdes.
Ukjent handlings-ID gir `invalid_or_incomplete` og ingen påstått
taktisk svakhet. Testene skiller mellom tidsvinduer før
avlegg, tredjemannsløp, sideskift, breddeangrep, førsteberøring
og støttebevegelse i dokumenterte scenarioer.


## Sammenhengende defensivt svar i ett angrep

Én navngitt forsvarer kan nå ha en `defensiveActionChain` i stedet for én
`recognitionDelaySeconds` + `coverMoveSeconds`. Dette er en **alternativ
representasjon**, ikke en ekstra modifikator. Hvert ledd må ha en gyldig
`taskId`, `triggerActionId`, eksplisitt `recognitionDelaySeconds` og
`coverMoveSeconds`. Oppgavene følger angrepets rekkefølge. Neste ledd
kan starte tidligst når BÅDE signalet er kommet og forrige defensive
handling faktisk er fullført.

Eksempel for én sekser mot tredjemann:

```js
{
  defensiveActionChain: [
    { taskId: "screen_layoff", triggerActionId: "receive",
      recognitionDelaySeconds: 0.1, coverMoveSeconds: 0.4 },
    { taskId: "follow_third_runner", triggerActionId: "layoff",
      recognitionDelaySeconds: 0.1, coverMoveSeconds: 0.2 },
    { taskId: "drop_for_through_pass", triggerActionId: "third_runner",
      recognitionDelaySeconds: 0.1, coverMoveSeconds: 0.3 }
  ]
}
```

Oppgavene gjelder de tre motveiene:

| Angrepsrute | Defensive omstillinger i rekkefølge |
| --- | --- |
| Tredjemann | skjerme avlegg → følge tredjemann → falle for gjennomspill |
| Sideskift | forsinke vending → flytte til fjernside → holde breddekorridor |
| Direkte | falle bak press → utfordre førsteberøring → sikre støtteløp |

Hvert oppgavenavn gir én eksplisitt frist: starten av den tilknyttede
angrepshandlingen. Modellen evaluerer **laveste tidsmargin på tvers av
ALLE ledd og spesialister**. En spiller som kommer frem til siste rom i
tide, men tidligere ikke stoppet avlegget, har ikke gjennomført
sikringskjeden. `routeCoverTiming.defensiveTransitions` viser oppgaven,
signalet, fristen, sluttidspunktet og om dette leddet var i tide.
`criticalTaskId` identifiserer svikten som faktisk avgjorde vurderingen.

Modellen krever eksplisitte scenariosekunder, ikke oppdiktede trackingdata.
Den kombinerer **ikke** en sekvens med `spatialLane`, fordi eksakte
romoverganger da måtte ha dokumentert geometri for hvert enkelt ledd.
Ugyldige, omvendte eller overlappende kontrakter regnes som **ukjent**
slik at eksisterende rollebasert sikring ikke feilaktig straffes.
Gammel enkeltsikring og historiske kamper beholder sine verdier.
Kun den tidligere koordineringskomponenten (maks 0,03) kan falle bort:
press-sannsynlighet og ett terminalt xG-utfall er uendret.

Simuleringene kontrollerer tredjemann, begge sider av sideskift og
direkte utspill, inkludert tilfeller der sluttposisjonen er identisk,
men første defensive oppgave kom for sent.


## Overlevering mellom to forsvarere i samme angrep

Valgfritt `defenderCoverHandoff` på den eksplisitte
`pressEscapeActionSequence` beskriver når én forsvarer forlater sin
sikringskorridor for en **navngitt neste oppgave**, og en annen
forsvarer må ha overtatt **før den første starter bevegelsen**.
Eksempel:

```js
{
  fromDefenderId: "holder",
  toDefenderId: "coverer",
  releaseTaskId: "follow_third_runner",
  coveredChannel: "central_between_lines"
}
```

I scenarioet over går sekseren fra å skjerme avlegget til å følge
tredjemann. En midtbanekollega må rekke inn i den forlatte korridoren.
Det beregnes som:

`handoffMargin = tidspunktet første forsvarer starter sin neste bevegelse
  - tidspunktet avløseren ankommer`.

Kilden til tidspunktet er den allerede verifiserte
`defensiveActionChain` for den som forlater rommet, og det allerede
beregnede ankomsttidspunktet for avløseren. Avløseren må være en annen
reell spiller i den eksisterende rollebaserte sikringsgruppen; han kan
ikke samtidig kjøre en ubekreftet, separat oppgavekjede. Det opprettes
ingen ekstra taktisk bonus. Negativ margin **fjerner kun eksisterende
sikringsbidrag** – samme ene terminale sjanse og xG-regnskap beholdes.

`routeCoverTiming.coverHandoff` viser hvem som overlot/kom inn,
frigjøringstid, ankomsttid og tidsmargin. Hvis dette er svakeste ledd,
viser `criticalHandoff` hvem som brøt den sammenhengende sikringen.
Ukjente spillere, feil korridor eller en ikke-eksisterende / første
oppgave kan ikke gi et påstått handoff-tap; kontrakten er da ugyldig
og den gamle rollebaserte sikringen forblir nøytral.

For sideskift kreves **eksplisitt kjent målflanke** og minst to faktisk
identifiserte, relevante forsvarere på den flanken. Et generelt
sideskift med to backer på hver sin side gir ikke belegg for en
sikringsutveksling. Eksisterende én-back-situasjoner for høyre/venstre
avvises derfor som handoff-scenarier uten å straffe forsvaret.

Dette er fremdeles en stilisert, forfattet simulering, ikke et utsagn
om reell tracking, dokumenterte fotballhendelser eller kalibrerte
prosentverdier.


## Forklaring av sikringsforløpet i kampreplay

`counterplay.defensiveReply.coverTimingExplanation` er en ny, kompakt
forklaringskontrakt med `kind`, `label` og `description`. Den
benytter **bare allerede validerte** tids- og korridorresultater:

- `in_time`: nødvendige defensive handlinger (og eventuelt bytte) i tide.
- `late_task`: navngitt defensiv oppgave ble for sen.
- `late_handoff`: avløseren nådde rommet etter at første forsvarer dro.
- `late_recovery`: en spesialist var for sent fremme uten navngitt oppgave.
- `wrong_corridor`: spilleren nådde frem, men feil sikringsrom.
- `unknown`: tid mangler, eller data er ugyldige; **ingen** konklusjon
  om at en forsvarer har sviktet.

Forklaringen følger eksisterende `counterplay` inn i kampens
`tacticalMoment` når en sjanse knyttes til pressforløpet. Den
endrer **ikke** sannsynligheter, taktikkbonuser, xG, valg av spiller,
eller allerede lagrede kampdata. Dette er ikke live tracking og
kan ikke brukes til å hevde at en bestemt virkelig spiller gjorde feil.


## Visning på kampdagen

Den eksisterende **Kampen minutt for minutt → Spill og motspill**-utvidelsen
viser en kort `Sikring:`-forklaring når sjansens
`tacticalMoment.counterplay.defensiveReply.coverTimingExplanation` har
en kjent status. Forklaringen ligger inne i hendelsen og åpnes av
manageren; den lager ikke nye hendelser eller en ny analysefane.

- Varsel om sen handling, manglende sikringsbytte og feil korridor
  skilles fra vellykket sikring.
- Ufullstendige data vises som `Uavklart sikringsforløp`, **ikke**
  som et påstått tabbeøyeblikk.
- Eldre kampdata uten en forklaringskontrakt beholder den gamle
  kamploggen uten tomt kort.
- Responsiv visning og tre tilfeller testes i
  `tests/browser/manager-matchday-scene-v1.spec.js`.
- Ingen spillertracking, xG-endringer eller flere sjanser blir
  konstruert av presentasjonslaget.

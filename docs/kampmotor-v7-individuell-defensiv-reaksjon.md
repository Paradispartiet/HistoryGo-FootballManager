# Kampmotor v7 – individuell defensiv reaksjon (24. oktober 2026)

## Hva som er implementert

Første v7-bolk bygger direkte på den ene sikringsporten i v6. Gitt et **eksplisitt simulert firetrinns angrepsforløp** kan en forsvarer med kildebelagt individuell styrke bruke kortere tid på å orientere seg og nå sikringsoppgaven. Dette kan avgjøre om et avtalefestet sikringsbytte lykkes.

Det er **ingen ny press-, sjanse- eller xG-bonus**. Reaksjonen påvirker *bare* fristmarginen som avgjør om den eksisterende, opptjente sikringsfordelen beholdes. Ingen frist / ingen authored action sequence = ingen ny tidsvirkning.

## Proveniens og bevissperrer

- Ferdigheten må finnes både i `player.strengths` og som `player.attributes.provenance[skill] === "belagt"`. Ubelagt, manglende eller ugyldig ferdighet gir **null** effekt. Ingen vurdering utledes fra `classHeight`, rolle-ID eller totalscore.
- `pace` påvirker forflytningstid; `positioning` forkorter nødvendig bevegelse; `anticipation`, `game_reading` eller `defensive_reading` forkorter reaksjonstid. `marking` og `tackling` brukes bare ved en relevant duell-/markeringsoppgave.
- Dette er **balanseringshypoteser i spillmodellen**, ikke estimater av en historisk spillers meter/sekund eller tracking. Maksimalt samlet tidsfradrag er 0,25 sekunder per defensiv oppgave. Tallene må kalibreres med en bredere simulering før andre mekanismer bygges ut.
- Ferdigheter bæres fra avspark til kampens snapshot, og ved innbytte overføres kun **innbytterens** dokumenterte ferdigheter. De arves ikke fra den som tas av. Ny taktikk gjenberegner kildebevis.

## Kontrafaktisk test

`node scripts/simulate-own-press-v6.mjs` spiller samme formasjon, roller, motstander, angrepstempo og tilfeldige trekk med én utbyttet spesialist. Den nye spilleren når sikringsfristen; den uspesialiserte når den ikke. Testen bekrefter også at første press-sannsynlighet ikke endres av den nye tidsberegningen, at kildekrav og nullscenarier forblir nøytrale, og at dette ikke skaper flere xG-hendelser. Aksept krever at den eksisterende v6-regresjonen fortsatt er grønn.

## Ikke del av denne PR-en

Dette er **ikke** en generell spillerreaksjonsmotor for kamper uten beskrevet handlingssekvens. Det finnes ingen autentiske posisjons- eller løpsmålinger å generere tider fra. Dynamisk motstandertilpasning, vektede samspillrelasjoner og bred kvalitetsmatrise for formasjoner/stiltyper hører til etterfølgende leveranser. Neste kvalitetstest bør gå på tvers av kildebelagte og ukjente ferdigheter, formasjoner, korridorer og motstandermodeller med identisk RNG, og fange opp urimelige deterministiske utfall.

// P1 source-claim registry.
//
// The registry never creates membership. P1 membership is derived from the
// canonical player's single sourcePlaceId. The 13 new passes default to
// THIN-SOURCE; only the explicit records below may add strengths.

export const P1_SOURCE_CLAIMS_VERSION = "historygo-football-manager.p1-source-claims.v1";

export const P1_HERITAGES = Object.freeze([
  { key: "valerenga", placeId: "intility_arena", expectedExclusive: 66, generation: "existing", expectedDocumented: 13, expectedPartial: 5, expectedThin: 48, sourcePass: "Valerenga_66_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "brann", placeId: "brann_stadion", expectedExclusive: 47, generation: "existing", expectedDocumented: 35, expectedPartial: 2, expectedThin: 10, sourcePass: "SK_Brann_47_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "bodo_glimt", placeId: "aspmyra_stadion", expectedExclusive: 47, generation: "existing", expectedDocumented: 16, expectedPartial: 3, expectedThin: 28, sourcePass: "Bodo_Glimt_47_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "viking", placeId: "lyse_arena", expectedExclusive: 51, generation: "existing", expectedDocumented: 21, expectedPartial: 2, expectedThin: 28, sourcePass: "Viking_FK_51_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "lillestrom", placeId: "araasen_stadion", expectedExclusive: 24, generation: "existing", expectedDocumented: 21, expectedPartial: 3, expectedThin: 0, sourcePass: "Lillestrom_SK_24_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },

  { key: "fredrikstad", placeId: "fredrikstad_stadion", expectedExclusive: 70, generation: "new" },
  { key: "skeid", placeId: "nordre_asen", expectedExclusive: 70, generation: "new" },
  { key: "aalesund", placeId: "color_line_stadion", expectedExclusive: 69, generation: "new" },
  { key: "odd", placeId: "skagerak_arena", expectedExclusive: 68, generation: "new" },
  { key: "start", placeId: "sor_arena", expectedExclusive: 60, generation: "new" },
  { key: "moss", placeId: "mellos_stadion", expectedExclusive: 58, generation: "new" },
  { key: "lyn", placeId: "bislett_stadion", expectedExclusive: 55, generation: "new" },
  { key: "tromso", placeId: "romssa_arena", expectedExclusive: 53, generation: "new" },
  { key: "kfum", placeId: "kfum_arena", expectedExclusive: 46, generation: "new" },
  { key: "bryne", placeId: "bryne_stadion", expectedExclusive: 41, generation: "new" },
  { key: "sandefjord", placeId: "jotun_arena", expectedExclusive: 41, generation: "new" },
  { key: "stabak", placeId: "nadderud_stadion", expectedExclusive: 41, generation: "new" },
  { key: "kristiansund", placeId: "nordmore_stadion", expectedExclusive: 29, generation: "new" }
]);

const documented = [
  // Odd: source-verified U21-era defensive profile retained from superseded PR #441.
  {
    playerId: "fredrik_semb_berge",
    placeId: "skagerak_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Duellsterk midtstopper som omtales som rolig og trygg i forsvarsspillet.",
    strengths: ["duels", "composure"],
    claim: "Fotballskribent Simen Stamsø Møllers samtidige U21-EM-presentasjon i juni 2013 beskriver Odd-spiller Semb Berge som «en duellsterk midtstopper som spiller med en imponerende trygghet». Det dokumenterer duellstyrke og ro (composure), men ikke udokumentert fart eller ballfordeling.",
    source: "https://materazzia.blogspot.com/2013/06/u21-em-en-presentasjon-av-norges-tropp.html"
  },
  // Odd 2026-10-20: samtidige individuelle scoutingbeskrivelser fra 2009.
  {
    "playerId": "torgeir_borven",
    "placeId": "skagerak_arena",
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Ung Odd-spiss med presis avslutningsteknikk og øye for offensive muligheter, beskrevet av agenten som fulgte ham i 2008–2009.",
    "strengths": [
      "finishing",
      "vision"
    ],
    "claim": "Agent Vegar Raknes' individuelle spillerfaglige vurdering gjengitt av Aftenposten i 2009 sier om 18 år gamle Torgeir Børven: «godt blikk og god avslutningsteknikk» og «en typisk målscorer». Dette gir samtidige, periodetydelige belegg for vision og finishing. Vurderingen brukes ikke som udokumentert moden karriererating.",
    "source": "https://www.aftenposten.no/sport/fotball/i/jd32Qn/politimann-og-fotballagent"
  },
  {
    "playerId": "magnus_lekven",
    "placeId": "skagerak_arena",
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Teknisk Odd-midtbanespiller med presis førsteberøring og dokumentert oversikt over offensive pasningsmuligheter.",
    "strengths": [
      "first_touch",
      "vision"
    ],
    "claim": "I Vegar Raknes' individuelle scoutingvurdering av Magnus Lekven fra 2009 heter det «strålende ballberøringer, eminent blikk for spillet». Dette underbygger first_touch og vision hos Lekven i Odd-perioden. Ingen kamptall, markedsvurdering eller senere karriere utledes til andre tokens.",
    "source": "https://www.aftenposten.no/sport/fotball/i/jd32Qn/politimann-og-fotballagent"
  },
  // Odd 2026-10-20: eksplisitte historiske og faglige spillerbeskrivelser.
  {
    "playerId": "fredrik_oldrup_jensen",
    "placeId": "skagerak_arena",
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Styrende defensiv midtbanespiller med god pasningsfot, overblikk og evne til å kontrollere rytmen i spillet.",
    "strengths": [
      "simple_passing",
      "game_reading",
      "tempo_control"
    ],
    "claim": "Vålerengas signeringsomtale 2020 sier at Oldrup Jensen selv foretrekker å «ha ball og styre spillet». Sportslig leder trekker uttrykkelig frem «gode spilleforståelse, gode pasningsfot og robuste fysikk» som begrunnelse for signeringen. Dette dokumenterer pasningssikkerhet, spillets forståelse og tempokontroll, men ikke en tallrating eller individuelle forsvarsferdigheter. Beskrivelsen er etter Odd-perioden, men gjelder den samme spilleren.",
    "source": "https://www.vif-fotball.no/nyheter/fredrik-oldrup-jensen-klar-for-valerenga"
  },
  {
    "playerId": "steffen_hagen",
    "placeId": "skagerak_arena",
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Samlende lagspiller med dokumentert ansvar for veiledning, standarder og mentalitet i Odd-troppen.",
    "strengths": [
      "leadership"
    ],
    "claim": "Odds klubbomtale 2025 beskriver Hagen som veileder i spillergruppen og gjengir trener Knut Rønningenes vurdering «han er en veileder som setter standarder både på og utenfor banen». Hagen selv forklarer hvordan han bidrar overfor yngre spillere. Dette er individuelt dokumentert lederskap, ikke lederegenskap utledet av kapteinsbind eller antall kamper.",
    "source": "https://www.odd.no/nyheter/steffen-hagen-forlenger"
  },
  {
    "playerId": "jone_samuelsen",
    "placeId": "skagerak_arena",
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Utholdende og svært løpssterk midtbanespiller, beskrevet i klubbens historiske portrett som Odds evighetsmaskin.",
    "strengths": [
      "stamina"
    ],
    "claim": "Odds digitale museum beskriver Samuelsen fra spillerperioden i Odd som Odds «evighetsmaskin» på midtbanen. Metaforen brukes av klubbhistorikken om vedvarende løpskapasitet og begrunner bare stamina; Guinness-heading, priser og antall kamper gir ingen egne ferdighetstoken.",
    "source": "https://statistikk.odd.no/st%C3%B8tteapparat/317360e9-85bd-42c1-b601-99948c09aed9"
  },
  // Odd 2026-10-19: individuell innleggsferdighet, ikke målstatistikk.
  {
    "playerId": "elbasan_rashani",
    "placeId": "skagerak_arena",
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Venstrekant med spesielt god innleggsfot, ifølge Vardens spillerfaglige 2014-vurdering.",
    "strengths": [
      "crossing"
    ],
    "claim": "I Bergens Tidendes talentsak gjengir Vardens Nils Tore Olsen at Elbasan Rashani er «målfarlig venstreving» som «har en god innleggsfot». Dette dokumenterer innlegg, men ingen konstruert 1–20-verdi eller ekstra ferdighet utledet fra målfarlighet.",
    "source": "https://www.bt.no/sport/i/JoQAm7/se-opp-for-disse-talentene"
  },
  {
    playerId: "per_kristoffersen",
    placeId: "fredrikstad_stadion",
    strengths: ["dribbling", "finishing", "positioning"],
    claim: "Store norske leksikon describes Kristoffersen as technically gifted, strong at dribbling, dangerous in front of goal and strong in his positioning.",
    source: "https://snl.no/Per_Kristoffersen"
  },
  {
    playerId: "arne_pedersen",
    placeId: "fredrikstad_stadion",
    strengths: ["final_pass", "finishing", "leadership", "stamina"],
    claim: "Store norske leksikon describes Pedersen as a playmaker who supplied assists, finished well, organised the team, took leadership responsibility and had strong endurance.",
    source: "https://snl.no/Arne_Pedersen_-_fotballspiller"
  },
  {
    playerId: "roar_johansen",
    placeId: "fredrikstad_stadion",
    strengths: ["strength", "stamina"],
    claim: "Store norske leksikon describes Johansen as physically strong and a constructive full-back with great running capacity.",
    source: "https://snl.no/Roar_Johansen"
  },
  {
    playerId: "arne_borresen",
    placeId: "fredrikstad_stadion",
    strengths: ["pace", "stamina"],
    claim: "Store norske leksikon describes Børresen as a strategist with great pace and work capacity.",
    source: "https://snl.no/Arne_B%C3%B8rresen"
  },
  {
    playerId: "harald_hennum",
    placeId: "nordre_asen",
    strengths: ["pace"],
    claim: "Store norske leksikon explicitly describes Hennum as a fast attacker with an energetic and mobile style.",
    source: "https://snl.no/Harald_Hennum"
  },
  {
    playerId: "frank_mathiesen",
    placeId: "color_line_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Historisk keeperomtale fremhever spektakulære redninger, spenst og rekkevidde.",
    strengths: ["shot_stopping", "jumping"],
    claim: "Aalesund's historical archive remembers Mathiesen for spectacular saves, enormous spring and exceptional reach on seemingly unreachable balls.",
    source: "https://www.aafk.no/historisk-arkiv/nyheter/da-fotballfeberen-brot-ut"
  },
  {
    playerId: "einar_jeja_gundersen",
    placeId: "skagerak_arena",
    strengths: ["heading"],
    claim: "Odd's club history describes Gundersen as an exceptional header of the ball who dominated the air and scored repeatedly with his head.",
    source: "https://www.odd.no/nyheter/hodespilleren"
  },
  {
    playerId: "svein_mathisen",
    placeId: "sor_arena",
    strengths: ["dribbling", "set_pieces", "final_pass"],
    claim: "Start's memorial texts explicitly describe Mathisen's unmatched dribbling, corner delivery and exquisite passing.",
    source: "https://www.ikstart.no/start-historien/sesongoversikter/sesongen-2011/start-legenden"
  },
  {
    playerId: "einar_jan_aas",
    placeId: "mellos_stadion",
    strengths: ["positioning", "pace"],
    claim: "Store norske leksikon describes Aas as a positionally secure and fast centre-back.",
    source: "https://snl.no/Einar_Jan_Aas"
  },
  {
    playerId: "magnar_isaksen",
    placeId: "bislett_stadion",
    strengths: ["stamina", "finishing", "final_pass"],
    claim: "Store norske leksikon describes Isaksen as having great work capacity, being a good finisher and an even better provider of defence-opening through passes.",
    source: "https://snl.no/Magnar_Isaksen"
  },
  {
    playerId: "petter_kykkeliky_jensen",
    placeId: "romssa_arena",
    strengths: ["pace", "dribbling"],
    claim: "Tromsø's historical player text calls Jensen fast and technically strong, and repeatedly identifies him as the club's dribble king.",
    source: "https://statistikk.til.no/spiller/petter-jensen"
  },
  {
    playerId: "ole_andreas_nilsen",
    placeId: "romssa_arena",
    strengths: ["dribbling"],
    claim: "Tromsø's player biography describes Nilsen as technically exceptionally gifted with a broad repertoire of feints.",
    source: "https://statistikk.til.no/spiller/ole-andreas-nilsen"
  },
  {
    playerId: "stian_sortevik",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Ballsterk og fotballklok midtbanespiller med overblikk og evne til å styre offensivt kombinasjonsspill.",
    strengths: ["strength", "vision"],
    claim: "KFUM's all-time player feature describes Sortevik's extreme ball control, understanding, strength and overview; only directly mappable catalogue skills are retained.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "klaus_odden",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Teknisk og fysisk allsidig spiller med særegen balanse, kraftige skudd og defensive taklinger.",
    strengths: ["balance", "long_shots", "tackling"],
    claim: "KFUM's all-time player feature explicitly describes Odden's exceptional balance, heavy shot and strong tackles.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "eivind_arnevag",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Spiss med spesielt gode tekniske og taktiske avslutningsferdigheter i og rundt målområdet.",
    strengths: ["finishing"],
    claim: "KFUM's all-time player feature explicitly describes Arnevåg as an extremely skilled finisher.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "christoffer_dahl",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Elegant, kreativ midtbanespiller med lange løp, aggressive taklinger og sterk tilstedeværelse i luftrommet.",
    strengths: ["tackling", "duels", "stamina", "long_shots"],
    claim: "KFUM's all-time player feature describes Dahl as very strong at running, capable of forceful tackles and strong aerial duels, with notable shooting range.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "william_kurtovic",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Trenerens vurdering fremhever spesielt spillets forståelse. Pasningsteknikk tilskrives ikke uten en mer presis beskrivelse.",
    strengths: ["game_reading"],
    claim: "Sandefjord head coach Martí Cifuentes explicitly described Kurtovic as having good game understanding; generic 'technically good' wording is not converted into an invented technique token.",
    source: "https://www.sandefjordfotball.no/nyheter/ny-toarskontrakt-for-kurtovic"
  },

  // --- SNL-passet, 26.08.2026 -------------------------------------------------
  // Store norske leksikons taksonomi «Norske fotballspillere» ble lest i sin
  // helhet (305 biografier, 171 navn katalogen alt har). Elleve av dem hører til
  // en NY P1-arv og bærer en ferdighetspåstand. `claim` siterer kilden ordrett
  // her, i motsetning til postene over — en påstand som kan kontrolleres uten å
  // åpne kilden er verdt mer enn et sammendrag.
  {
    playerId: "bjorn_borgen",
    placeId: "fredrikstad_stadion",
    strengths: ["first_touch", "dribbling", "pace", "finishing"],
    claim: "«Bjørn Borgen var en teknisk briljant, fintesterk, rask og målfarlig ving …»",
    source: "https://snl.no/Bj%C3%B8rn_Borgen"
  },
  {
    playerId: "christer_basma",
    placeId: "nadderud_stadion",
    strengths: ["pace", "decisions", "simple_passing", "positioning"],
    claim: "«Basma kunne spille både offensivt og defensivt, og hadde først og fremst fordel av sin hurtighet. Han var også kjent for sine kloke valg, pasningsfot og plasseringsevne.»",
    source: "https://snl.no/Christer_Basma"
  },
  {
    playerId: "erik_johansen",
    placeId: "nordre_asen",
    strengths: ["game_reading", "first_touch", "simple_passing", "long_shots"],
    claim: "«Johansen var en fotballklok, ikke spesielt rask, men teknisk god offensiv spiller, pasningssikker og med en god skuddfot.»",
    source: "https://snl.no/Erik_Johansen"
  },
  {
    playerId: "espen_ruud",
    placeId: "skagerak_arena",
    strengths: ["finishing", "simple_passing", "set_pieces"],
    claim: "«Espen Ruud var en målfarlig og pasningssikker back, som blant annet har scoret en del mål på dødball for klubblagene sine.»",
    source: "https://snl.no/Espen_Ruud"
  },
  {
    playerId: "finn_gundersen",
    placeId: "nordre_asen",
    strengths: ["long_shots", "finishing"],
    claim: "«Som fotballspiller var Finn Gundersen en skuddsterk angrepsspiller …»",
    source: "https://snl.no/Finn_Gundersen"
  },
  {
    playerId: "fredrik_stromstad",
    placeId: "sor_arena",
    strengths: ["work_rate", "stamina", "first_touch", "final_pass", "late_runs"],
    claim: "«Strømstad var en hardtarbeidende og løpssterk midtbanespiller med gode tekniske ferdigheter, blant annet med gode gjennombruddspasninger og evne til å score mål på løp inn i motstanderens straffefelt.»",
    source: "https://snl.no/Fredrik_Str%C3%B8mstad"
  },
  {
    playerId: "gunnar_andersen",
    placeId: "bislett_stadion",
    strengths: ["first_touch", "strength", "simple_passing", "heading", "leadership"],
    claim: "«Gunnar Andersen var en teknisk god og robust spiller med en god pasningsfot og hodestyrke, men ikke så rask. Han var en sympatisk ledertype, kaptein både i klubb- og landslaget, og med evne til å inspirere andre til å yte noe ekstra.»",
    source: "https://snl.no/Gunnar_Andersen_-_idrettsut%C3%B8ver"
  },
  {
    playerId: "oivind_holmsen",
    placeId: "bislett_stadion",
    strengths: ["pace", "strength", "passing_range"],
    claim: "«Som spiller var Holmsen stor og atletisk, men med en hurtighet som overgikk norske og nordiske spillere på denne tiden. … spilte han mer på kraft enn teknikk, men hadde et godt tilslag og var pasningssikker, spesielt når det gjaldt langpasninger.»",
    source: "https://snl.no/%C3%98ivind_Holmsen"
  },
  {
    playerId: "ragnar_larsen",
    placeId: "skagerak_arena",
    strengths: ["stamina", "work_rate", "determination", "flair", "leadership"],
    claim: "«Han var også svært treningsvillig med god kondisjon, innsatsvilje og kreativitet, og ble blant annet kalt «en hardtarbeidende kriger på banen». … den som holdt laget sammen og gikk foran som leder og kaptein.»",
    source: "https://snl.no/Ragnar_Larsen"
  },
  {
    playerId: "tom_hogli",
    placeId: "romssa_arena",
    strengths: ["first_touch", "tackling", "overlapping_runs", "game_reading", "crossing"],
    claim: "«Høgli var en ballsikker og taklingssterk høyreback, som ofte gikk på offensive løp. Han var også flink til å lese spillet og slo gode innlegg.»",
    source: "https://snl.no/Tom_H%C3%B8gli"
  },
  {
    playerId: "trond_pedersen",
    placeId: "sor_arena",
    strengths: ["pace", "overlapping_runs"],
    claim: "«Han var en offensiv og rask back som spilte hele 277 førstedivisjonskamper.»",
    source: "https://snl.no/Trond_Pedersen"
  },

  // --- Brattvåg source-depth, 10.09.2026 ------------------------------------
  // Ulrik eies av Aalesund-P1-identiteten, men samme canonical profil er
  // kildebelagt tilknyttet Brattvåg. Klubbens egen avskjedstekst beskriver
  // eksplisitt lederrollen; ingen øvrige egenskaper utledes fra fysikk,
  // balltrygghet, kamper eller mål.
  {
    playerId: "ulrik_valderhaug_syversen",
    placeId: "color_line_stadion",
    evidenceKind: "direct_appraisal",
    playingStyle: "Brattvåg omtaler ansvarstaking og tydelig lederrolle; øvrig ferdighetsprofil er ikke dokumentert.",
    strengths: ["leadership"],
    claim: "«Han har teke stort ansvar, vore ein leiar i laget»",
    source: "https://brattvag-il.no/herrelag/herrelaget/takk-for-no-ulrik"
  },
  // --- Aalesund 11.10.2026: official club archive and match reports --------
  {
    playerId: "herman_ekeberg",
    placeId: "color_line_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Skuddfinten beskrives som et personlig kjennetegn i AaFKs historiske omtale.",
    strengths: ["dribbling"],
    claim: "AaFKs historiske 2002-gjennomgang beskriver at Herman Ekeberg «gjorde skuddfinta til sin egen». Den konkret omtalte ballfinten bærer dribbling; mål og antall kamper gir ingen tilleggsegenskaper.",
    source: "https://www.aafk.no/historisk-arkiv/nyheter/da-fotballfeberen-brot-ut"
  },
  {
    playerId: "trond_fredriksen",
    placeId: "color_line_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Klubbens historiske tekst fremhever en gjennomgående stor arbeidsinnsats.",
    strengths: ["work_rate"],
    claim: "AaFKs historiske gjennomgang beskriver at Trond Fredriksen «la alltid ned en formidabel innsats». Kun arbeidsinnsats føres; omtalen av skuddfot tilordnes ikke et spesifikt skuddtoken.",
    source: "https://www.aafk.no/historisk-arkiv/nyheter/da-fotballfeberen-brot-ut"
  },
  {
    playerId: "pal_stadsnes",
    placeId: "color_line_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Venstrefoten og farlige hjørnespark fremheves som særpreg i historisk klubbomtale.",
    strengths: ["set_pieces"],
    claim: "AaFK beskriver Pål Stadsnes som særlig farlig på hjørnespark med venstrefoten. Kun dødballferdigheter føres.",
    source: "https://www.aafk.no/historisk-arkiv/nyheter/da-fotballfeberen-brot-ut"
  },
  {
    playerId: "kristian_hemmingsen_lonebu",
    placeId: "color_line_stadion",
    evidenceKind: "direct_appraisal",
    playingStyle: "Målrettet spissprofil: avslutter ifølge akademileder Sindre Eid godt med begge bein og hodet, mens Kjetil Rekdal beskriver ham som hardtarbeidende og med teft i scoringsposisjoner. Lonebu forteller at han har fått veiledning i feltposisjonering, bakromsløp og møtende bevegelser av Tor Hogne Aarøy; dette dokumenterer opplæring, ikke automatisk mestrede løpsegenskaper.",
    strengths: ["finishing", "heading", "work_rate"],
    claim: "AaFKs kontraktpresentasjon 03.12.2024 gjengir hovedtrener Kjetil Rekdals konkrete vurdering av Lonebu som en hardtarbeidende spiss med målteft, og utvikler Sindre Eids vurdering av avslutningsevne med begge bein og hodet. Lonebu opplyser selv at Aarøy har gitt ham tips om løp i bakrom, møtende bevegelser og posisjonering i feltet; tipsene registreres ikke som varige styrker.",
    source: "https://www.aafk.no/nyheter/forste-proffkontrakt-for-lokal-spiss",
    supportingSources: ["https://www.aafk.no/nyheter/lonebu-har-signert-ny-kontrakt"]
  },

  // --- Sandefjord, 09.10.2026: documented P1 skill -----------------------
  // Source explicitly calls Moen Foss "hurtig". Other descriptive words
  // (e.g. "sterk i hodet") do not justify additional attribute tokens.
  {
    playerId: "sander_moen_foss",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Klubbens spillerprofil beskriver hurtighet som et vedvarende kjennetegn hos forsvareren, uten å fastslå øvrige ferdigheter.",
    strengths: ["pace"],
    claim: "Sandefjord Fotball beskriver Sander Moen Foss som hurtig: «En forsvarsspiller som er sterk i hodet, kan bruke begge bein og er hurtig.» Kun eksplisitt hurtighet føres som styrke.",
    source: "https://www.sandefjordfotball.no/nyheter/moen-foss-forlenger-skal-ta-mer-ansvar"
  },
  // --- Sandefjord, 09.10.2026: official match report ---------------------
  // --- Sandefjord 05.02.2022: source-verifiable individual skill -----------
  {
    playerId: "mohamed_ofkir",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Trenerens spilleromtale trekker frem uforutsigbar ballbehandling, ikke et enkeltstående dribletrekk.",
    strengths: ["flair"],
    claim: "Trener Hans Erik Ødegaard beskriver Ofkir: «Han virket livlig – og er uforutsigbar med ballen i beina.» Kun uforutsigbarheten er tatt som evidens for flair.",
    source: "https://www.sandefjordfotball.no/nyheter/odegaard-det-aller-beste-er-at-sesongen-er-i-gang"
  },
  // --- Sandefjord 10.10.2026: five source-backed P1 base-squad players ----
  {
    playerId: "jakob_maslo_dunsby",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Spilleren fremhever egne én-mot-én-offensive egenskaper og presspillet, som ulike taktiske bidrag.",
    strengths: ["one_vs_one", "pressing"],
    claim: "Dunsby om eget spill: «Jeg har kanskje min største styrke i en-mot-en offensivt. Også mener jeg at presspillet også fungerer bra for meg.»",
    source: "https://www.sandefjordfotball.no/nyheter/jakob-dunsby-blir-sf-spiller-ut-sesongen-2023"
  },
  {
    playerId: "orjan_royrane",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Spilleragentens omtale fremhever løpshurtighet. Et generelt teknikkadjektiv blir ikke flere spesifikke ferdigheter.",
    strengths: ["pace"],
    claim: "Spilleragent Thomas Raknes i BT: «En hurtig og meget god teknisk spiller»; bare hurtigheten er ført.",
    source: "https://www.bt.no/sport/i/1nBXjB/politimann-og-fotballagent"
  },
  {
    playerId: "vetle_walle_egeli",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Klubbens presentasjon beskriver trygg pasningsbruk; verken langpasninger eller tempoledelse er eksplisitt fastslått.",
    strengths: ["simple_passing"],
    claim: "Sandefjord Fotball om Egeli: «en unggutt med god pasningsfot og trygg med ballen». Bare den eksplisitte pasningsferdigheten føres.",
    source: "https://www.sandefjordfotball.no/nyheter/syv-debutanter-mot-odd"
  },
  // --- Sandefjord 10.10.2026: verified remaining base-squad claims ----------
  {
    playerId: "hjalmar_johansen",
    placeId: "jotun_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Historisk spilleromtale beskriver en naturlig leder i spillergruppen, uavhengig av scoringstall og posisjon.",
    strengths: ["leadership"],
    claim: "FFK-historikken beskriver Johansen: «Han var en naturlig leder for resten av spillergruppa». Dette belegger leadership, ikke en uverifisert angrepsferdighet.",
    source: "https://ffksupporter.net/spillere/hjalmar_johansen/"
  },
  // --- Sandefjord 10.10.2026: contemporary press and club history -----------
  {
    playerId: "cheikhou_dieng",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "VGs sesongvurdering beskriver en hurtig kant som gjerne utfordrer med ballen, med to tydelige ferdigheter.",
    strengths: ["pace", "dribbling"],
    claim: "VG-lupen 2015 beskriver Sandefjords kantspiller: «Che har bra fart og dribler gjerne». VGs analyse av laget bekrefter særskilt hurtigheten. Kun fart og observert driblestil er ført.",
    source: "https://www.vg.no/spesial/2015/vglupen/viewteam/?plassering=8"
  },
  // --- Sandefjord: four sourced historical/modern club profiles, 10.10.2026 ---
  {
    playerId: "filip_ottosson",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Trener og klubbomtale beskriver presise pasninger over ulike distanser, overblikk, spilleforståelse og bevisst valg av angrepstempo.",
    strengths: ["simple_passing", "passing_range", "vision", "game_reading", "tempo_control", "duels"],
    claim: "Sandefjord-trener Hans Erik Ødegaard beskriver Filip Ottossons presise korte/lange pasninger, gode overblikk og spilleforståelse, og trøkk i nærduellene. Kun disse eksplisitte kvalitetene føres. Sandefjords klubbomtale fra mars 2024 beskriver også hans gjentakende avveininger mellom lange og korte pasninger ut fra situasjonen; det støtter tempo_control. De tre ekstra ferdighetene er basert på vedvarende trener- og klubbomtale, ikke på én målgivende pasning.",
    source: "https://www.sandefjordfotball.no/nyheter/filip-ottosson-har-signert-for-sf",
    supportingSources: ["https://www.sandefjordfotball.no/nyheter/bunnsolid-generalprove-i-skien"]
  },
  {
    playerId: "danilo_al_saed",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Klubbens presentasjon og treneruttalelse beskriver hurtighet, én-mot-én-spill og press som tydelige kjennetegn.",
    strengths: ["pace", "one_vs_one", "pressing"],
    claim: "Sandefjord Fotballs presentasjon 23.12.2022 beskriver Al-Saed som hurtig. Trener Hans Erik Ødegaard fremhever at han er god én mot én, utfordrer motstandere og er god i presspillet. Ingen øvrige egenskaper utledes.",
    source: "https://www.sandefjordfotball.no/nyheter/danilo-andres-al-saed-klar-for-sandefjord-fotball"
  },
  // --- Sandefjord 2020: contemporary press scouting report -----------------
  {
    playerId: "rufo",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Eurosports vurdering beskriver Rufo som et kreativt samlingspunkt som ser løsninger og setter medspillere opp.",
    strengths: ["vision"],
    claim: "Eurosports 2020-tabelltips omtaler Rufo som Sandefjords kreative midtpunkt og sier at han er «flink til å gjøre andre gode» og ofte skaper uventede offensive løsninger. Bare offensivt overblikk/vision føres.",
    source: "https://www.eurosport.no/fotball/eliteserien/2020/her-er-eurosports-tabelltips-molde-ned-fra-tronen-og-odd-i-nedrykksstrid_sto7776226/story.shtml"
  },
  // --- Sandefjord: contemporary reports + 2026 individual scouting ---------
  {
    playerId: "victor_demba_bindia",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Fotballekspertens forhåndsvurdering sammenligner eksplisitt Bindias hurtighet med andre aktuelle spillere.",
    strengths: ["pace"],
    claim: "Lars Tjærnås beskriver Bindias fart i Aftenposten 17.03.2015: «han har større fart enn de andre aktuelle der» i stopperrollen. Antall kamper og løpemengde brukes ikke som ekstra styrker.",
    source: "https://www.aftenposten.no/sport/fotball/i/JonOGR/sorry-sandefjord-tjaernaas-tipper-dere-paa-jumboplass"
  },
  {
    playerId: "eirik_lamoy",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Fotballekspertens forhåndsvurdering omtaler uttrykkelig Lamøys hurtighet på kanten i lagets kontekst.",
    strengths: ["pace"],
    claim: "Lars Tjærnås vurderer Sandefjords venstrekant Eirik Lamøy som «nesten like hurtige» som Cheikhou Dieng i Aftenposten 17.03.2015. Bare hurtighet er dokumentert.",
    source: "https://www.aftenposten.no/sport/fotball/i/JonOGR/sorry-sandefjord-tjaernaas-tipper-dere-paa-jumboplass"
  },
  {
    playerId: "zinedin_smajlovic",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Rabonapods klubbguide beskriver duellkraft, hurtighet og én-mot-én-arbeid som særtrekk ved midtstopperen.",
    strengths: ["duels", "pace", "one_vs_one"],
    claim: "Rabona klubbguide 06.03.2026 beskriver midtstopper Zinedin Smajlović som «kompromissløs i duellspillet, hurtig, sterk én mot én». Bare dueller, fart og én-mot-én-spill føres.",
    source: "https://rabonapod.no/2026/03/06/klubbguiden-2026-nr-9/"
  },
  // --- Sandefjord 10.10.2026: primary/contemporary individual reports -------
  {
    playerId: "birger_madsen",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Trenerens spilleromtale beskriver hurtighet, duellkraft og ansvarsevne hos midtstopperen som varige kvaliteter.",
    strengths: ["pace", "duels", "leadership"],
    claim: "Ved overgangen fra Sandefjord til Vålerenga i 2009 beskrev trener Martin Andresen Birger Madsen som en rask midtstopper, duellsterk og en naturlig ledertype, og viste til kapteinsrollen i Sandefjord. Kun de tre eksplisitte egenskapene føres.",
    source: "https://www.dagbladet.no/sport/rask-og-ikke-sa-gammel/65270220"
  },
  {
    playerId: "samuel_isaksen",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Fotballekspertens lagvurdering omtaler løpshurtighet som en konkret individuell kvalitet, ikke en kampsekvens.",
    strengths: ["pace"],
    claim: "Lars Tjærnås' samtidige forhåndsvurdering av Sandefjord før Eliteserien 2009 nevner Samuel Isaksen blant lagets «spillere med stor fart». Kun eksplisitt dokumentert hurtighet føres.",
    source: "https://www.aftenposten.no/sport/fotball/i/zGMwBb/slik-spiller-eliteserielagene"
  },
  // --- Sandefjord 10.10.2026: five further historical source claims ---------
  {
    playerId: "tijan_jaiteh",
    placeId: "jotun_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Samtidig fagkommentar beskriver den defensive spillestilen med duellstyrke og fart.",
    strengths: ["duels", "pace"],
    claim: "Samtidig fagkommentar om Sandnes Ulf i Dagsavisen 2014 omtaler Tijan Jaiteh som en spiller som «er duellsterk og har bra tempo». Kun eksplisitt duellspill og fart føres.",
    source: "https://www.dagsavisen.no/nyheter/kommentarhva-er-galt-med-sandnes-ulf/8378838"
  },
  {
    playerId: "jon_midttun_lie",
    placeId: "jotun_arena",
    evidenceKind: "direct_appraisal",
    playingStyle: "Trenerens omtale identifiserer spilleren som en av lagets gode servere ved dødballer.",
    strengths: ["set_pieces"],
    claim: "Starts assistenttrener Bård Wiggen fremhevet i Aftenposten 2005 Jon Midttun Lie som en av lagets «gode servere» på dødball, og klubben bekrefter hans overgang fra Sandefjord til Start. Kun dødballutførelse føres.",
    source: "https://www.aftenposten.no/sport/fotball/i/Vb4KmV/vil-bli-doedballspesialister"
  },
  {
    playerId: "ebrima_sohna",
    placeId: "jotun_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Retrospektiv fotballomtale beskriver arbeidsinnsats, taklinger og bryting av pasninger som spillerens typiske innsats.",
    strengths: ["work_rate", "tackling", "interceptions"],
    claim: "Foroyaa 07.05.2020 beskriver Ebrima Sohna individuelt med «workaholic approach, tackles and interceptions» og som spesialist på duellpreget fotball. Arbeidsinnsats, taklinger og brudd føres som work_rate, tackling og interceptions; pasningsspill, teknikk og generell fysikk utledes ikke.",
    source: "https://foroyaa.net/14-years-after-conquering-africa-bare-truth-of-what-became-of-the-2005-baby-scorpions/"
  },
  {
    playerId: "tor_hogne_aaroy",
    placeId: "color_line_stadion",
    evidenceKind: "direct_appraisal",
    playingStyle: "Høyreist oppspillspunkt med dokumentert luftstyrke og møtende linkspill: Aarøy beskrev i 2008 hvordan han tok imot lave oppspill, la igjen ballen til framstormende midtbanespillere og la til rette for Diego Silva. Rekdal beskrev i 2011 hvordan AaFK senere flyttet tyngdepunktet fra den gamle langball-orienterte Aarøy-stilen til mer spill gjennom Barrantes. Dette er taktisk rollehistorie, ikke et tegn på høy fart eller generell teknisk overlegenhet.",
    strengths: ["heading", "hold_up_play", "combination_play"],
    claim: "Aftenposten 03.05.2008 dokumenterer Tor Hogne Aarøys møtende rolle langs bakken, avleveringer til midtbanespillere og hans arbeid som tilrettelegger for Diego Silva. Motstandertrener Knut Tørum og spiss Ole Martin Årst fremhevet hans luftspill i 2010. Kjetil Rekdal beskrev senere at Aalesund gikk bort fra en mer langballorientert Aarøy-stil da klubben ville spille mer gjennom Barrantes. Dette underbygger heading, hold_up_play og combination_play – med en tydelig taktisk kontekst.",
    source: "https://www.aftenposten.no/sport/fotball/i/LA6GMq/det-stemmer-for-aaroey",
    supportingSources: ["https://www.aftenbladet.no/sport/i/ng5JjJ/toerum-maa-ikke-la-oss-blende-av-aaroey", "https://www.nettavisen.no/artikkel/kan-godt-hende-vi-driter-oss-ut/s/12-95-3267654"]
  },
  {
    playerId: "sten_grytebust",
    placeId: "color_line_stadion",
    evidenceKind: "direct_appraisal",
    playingStyle: "Bevegelig målvakt med dokumenterte reaksjonsredninger, god håndtering både på streken og i feltet og tydelig kommunikasjon med forsvaret. Landslagskeeper Jon Knudsen fremhevet feltarbeidet og bevegelsen, VG vurderte kommunikasjonen positivt i 2014, og AaFK-trener Christian Johnsen beskrev senere hans rolle som pådriver i treningsarbeidet. Ingen kilde gir grunnlag for ballfordeling eller én samlet keepertotal.",
    strengths: ["shot_stopping", "command_of_area"],
    claim: "Aftenposten 14.06.2011 beskriver flere svært gode redninger, samtidig som landslagskeeper Jon Knudsen vurderte Sten Grytebust som bevegelig og god i feltet og på streken. VG-lupen 2014 vurderte ham som en sterk skuddstopper som kommuniserte godt. Det dokumenterer shot_stopping og, snevert tolket, command_of_area (feltarbeid), men ikke keeperens distribusjon, langpasninger eller taktiske lederskap generelt.",
    source: "https://www.aftenposten.no/sport/fotball/i/4qLd1G/rekdal-norges-neste-landslagskeeper",
    supportingSources: ["https://www.vg.no/spesial/2014/vglupen/viewteam/?lag=Aalesund&plassering=8", "https://www.aafk.no/nyheter/en-julegave-fra-oss-til-dere"]
  },
  {
    playerId: "michael_barrantes",
    placeId: "color_line_stadion",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Offensiv ballfordeler som helst opererte bak spissen, men også kunne starte fra høyre og trekke inn. Trener Kjetil Rekdal kalte ham en perfekt offensiv playmaker og la lagets ballspill mer gjennom Barrantes etter at Aarøy dro. VG fremhevet presis pasningsfordeling og spilleoversikt; Dagbladet dokumenterte et gjennombruddsskapende langt pasningsoppspill. Rollen varierer med form og medspillere.",
    strengths: ["vision", "passing_range", "chance_creation"],
    claim: "Kjetil Rekdal beskrev i 2012 Michael Barrantes som perfekt i rollen som offensiv playmaker; Aalesund dreide også spillestilen fra lange oppspill mot Aarøy til mer spill gjennom Barrantes. VGs 2014-vurdering omtaler ham som en av seriens mest presise ballfordelere med særlig overblikk, og at han trivdes best bak spissen. Dagbladet dokumenterte en konkret lang, målgivende pasning mot Hønefoss i 2013. Samlet støtter dette vision, passing_range og chance_creation; enkeltpasningen alene ville ikke kvalifisert som varig attributt.",
    source: "https://www.bt.no/sport/i/op67BV/rekdal-aapner-for-to-nye-spisser",
    supportingSources: ["https://www.vg.no/spesial/2014/vglupen/viewteam/?lag=Aalesund&plassering=8", "https://www.nettavisen.no/artikkel/kan-godt-hende-vi-driter-oss-ut/s/12-95-3267654", "https://www.dagbladet.no/sport/maldrama-da-aalesund-tok-sin-tredje-strake-seier/62942066"]
  },
  {
    playerId: "leke_james",
    placeId: "color_line_stadion",
    evidenceKind: "period_appraisal",
    playingStyle: "Tok mye av lagets defensive grovarbeid i deler av sesongen, noe som påvirket overskuddet i angrep.",
    strengths: [
      "work_rate"
    ],
    claim: "Trener Trond Fredriksen fortalte 07.07.2015 at Leke James tidligere i sesongen hadde tatt mye av den defensive grovjobben og trengte å fordele arbeidsoppgavene for å være uthvilt i angrep; James bekreftet selv at han jobbet mye for laget. Fører work_rate, ikke finishing eller stamina.",
    source: "https://www.bt.no/sport/i/e8J8Al/leke-james-jeg-har-vaert-frustrert"
  },
  // --- Aalesund, 11.10.2026: independently checked club and match sources ---
  {
    playerId: "joakim_austnes",
    placeId: "color_line_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Fotrapp kantspiller som ble omtalt som en fryktet dribler.",
    strengths: ["pace", "dribbling"],
    claim: "AaFKs omtale 8. juni 2021 kaller Joakim Austnes en fotrapp driblefant og fryktet kantspiller. Det dokumenterer konkret hurtighet og dribling; verken mål eller rolle brukes som indirekte styrkebelegg.",
    source: "https://www.aafk.no/nyheter/manedens-spiller-i-fotspora-til-jokke"
  },

  // --- Aalesund, 11.10.2026: contemporary reports / quantified skill evidence ---
  {
    playerId: "fredrik_ulvestad",
    placeId: "color_line_stadion",
    evidenceKind: "direct_appraisal",
    playingStyle: "Løpsterk indreløper som kombinerte ballgjenvinning med offensive midtbaneoppgaver. Kjetil Rekdal beskrev ham som en mellomting mellom Aalesunds ballvinner og deres offensive playmaker. Samtidige analyser beskriver ham som en av lagets tydelige løpere fra indreløperposisjon; den dokumenterte straffesparkkompetansen er et separat teknisk særtrekk.",
    strengths: ["work_rate", "set_pieces"],
    claim: "Trener Kjetil Rekdal uttalte i 2012 at Fredrik Ulvestad var en blanding av Jason Morrison (ballvinner) og Michael Barrantes (offensiv playmaker), uten å tilskrive ham en bestemt dribling, takling eller sistepasning. En egen 2014-analyse beskriver Ulvestad og Orry Larsen som løpssterke indreløpere. Bergens Tidendes landslagspresentasjon fra 2020 beskriver Ulvestad uttrykkelig som løpssterk og målfarlig, også en trygg straffeskytter. Derfor føres work_rate og set_pieces, med sistnevnte begrenset til straffespark.",
    source: "https://www.bt.no/sport/i/op67BV/rekdal-aapner-for-to-nye-spisser",
    supportingSources: ["https://www.bt.no/sport/i/XgbgPb/aafk-vil-savne-hamed-allah", "https://www.bt.no/sport/i/41z7eG/stor-presentasjon-dette-er-det-norske-noedlandslaget", "https://www.vg.no/spesial/2014/vglupen/viewteam/?lag=Aalesund&plassering=8"]
  },
  {
    playerId: "mikkel_kirkeskov",
    placeId: "color_line_stadion",
    evidenceKind: "season_statistics",
    playingStyle: "Venstreback med målt, høy aktivitet i ballvinnende taklinger og levering av innlegg: i Eliteserien 2016 vant han 84 taklinger (flest) og traff med 61 innlegg (nest flest), ifølge VG. To direkte frisparksmål viser en konkret dødballspesialitet. Statistikken viser ikke automatisk overblikk, overlappinger eller generell defensiv spillelesning.",
    strengths: ["tackling", "crossing", "set_pieces"],
    claim: "VG-lupen før 2017-sesongen dokumenterer at Mikkel Kirkeskov vant 84 taklinger i 2016 (flest i Eliteserien), traff på 61 innlegg (nest flest), og scoret to ganger direkte på frispark. Dette er sesongfordelte målinger av tackling og crossing, samt konkret belegg for set_pieces. Det er ikke kildegrunnlag for overlapping_runs, vision eller defensive_reading bare fordi han spilte venstreback.",
    source: "https://www.vg.no/spesial/2017/vglupen/?plassering=12"
  },
  {
    playerId: "robert_sandnes",
    placeId: "color_line_stadion",
    evidenceKind: "direct_appraisal",
    playingStyle: "Klubbens spilleromtale fremhever energi og arbeidsinnsats, uten å dokumentere tekniske styrker.",
    strengths: ["work_rate"],
    claim: "Aalesunds FKs spillerpresentasjon «Sunnmøres stolthet del 1» 09.04.2018 omtaler Robert Sandnes eksplisitt som «den energiske og hardtarbeidende ålesunderen». Dette støtter bare work_rate, ikke hurtighet eller tekniske egenskaper.",
    source: "https://www.aafk.no/nyheter/sunnmores-stolthet-del-1"
  },
  // --- Aalesund 11.10.2026: official match reports and contemporary press ---
  // Archived one-off actions are below in P1_NEW_EVENT_ONLY.
  // --- Aalesund 11.10.2026: independently verified player-specific acts ---

  {
    playerId: "aron_elis_randarson",
    placeId: "color_line_stadion",
    evidenceKind: "season_statistics",
    playingStyle: "Fleksibel venstrekant, spiss og hengende spiss med målbar, gjentatt suksess i driblinger: VG oppga 38 vellykkede forsøk av 49 i 2016-sesongen. Fordelingen mellom 16 starter på venstre kant og resten i angrepsroller beskriver bruken, ikke en egen ferdighet. En enkelt heading i 2019 beholdes som historisk kamphendelse, ikke attributtgrunnlag.",
    strengths: ["dribbling"],
    claim: "VG-lupen 2017 beskriver at Aron Elís Þrándarson i 2016 lyktes med 38 av 49 avdriblinger over sesongen; dette er 77,6 prosent og et direkte sesongbasert belegg for dribbling. Han startet 23 kamper, 16 som venstrekant og resten som spiss/hengende spiss. AaFKs referat fra Sogndal-kampen 04.05.2019 dokumenterer én heading og oppbevares kun som supplerende hendelse, ikke som heading-styrke.",
    source: "https://www.vg.no/spesial/2017/vglupen/?plassering=12",
    supportingSources: ["https://www.aafk.no/nyheter/for-en-snuoperasjon-sogndal"]
  },

  {
    playerId: "holmbert_aron_fridjonsson",
    placeId: "color_line_stadion",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Fysisk dominerende midtspiss og oppspillspunkt med fremhevet hodespill. Ekspert Joacim Jonsson beskrev før 2020-sesongen hvordan Friðjónsson kunne ta imot og holde på ballen når AaFK skulle styre kampen eller avlaste forsvaret. Hans 2018-pris som årets OBOS-liga-spiller gir sesonghistorisk kontekst, ikke ekstra ferdighetsattributter.",
    strengths: ["heading", "hold_up_play"],
    claim: "Eurosports ekspert Joacim Jonsson fremhevet i sin AaFK-vurdering før 2020-sesongen Friðjónssons ekstreme fysikk, hodespill og funksjon som oppspillspunkt som kunne holde i ballen. Dette er en individuell, gjentakende rolle- og ferdighetsvurdering som direkte bærer heading og hold_up_play. OBOS-ligaens dokumentasjon av prisen som årets spiller i 2018 støtter betydningen for laget, men brukes ikke alene til å tilskrive flere ferdigheter. En heading i treningskampen mot Hødd beholdes som historisk hendelseskilde.",
    source: "https://www.eurosport.no/fotball/joacims-blogg/2020/dette-mangler-bohinen-trodde-han-skulle-ha-en-litt-bedre-stall_sto7690243/story.shtml",
    supportingSources: ["https://www.obos-ligaen.no/nyheter/fridjonsson-kares-til-arets-spiller-i-obos-ligaen", "https://www.aafk.no/nyheter/malrikt-da-aalesund-slo-hodd"]
  },
  // KFUM: 26 klubbhistoriske, spillerindividuelle styrkeprofiler.
  {
    playerId: "robin_rasch",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En spillfordeler med godt overblikk og presis pasningsbruk som kan styre lagets offensive oppbygging.",
    strengths: ["vision","simple_passing"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En spillfordeler med godt overblikk og presis pasningsbruk som kan styre lagets offensive oppbygging.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "jorgen_hammer",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En midtstopper som bryter foran angriperne, er sterk i luftrommet og opptrer med autoritet.",
    strengths: ["interceptions","heading","leadership"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En midtstopper som bryter foran angriperne, er sterk i luftrommet og opptrer med autoritet.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "erlend_skaga",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En fotballklok spiller med høy fart og raske bevegelser med ballen på små flater.",
    strengths: ["pace","game_reading","agility"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En fotballklok spiller med høy fart og raske bevegelser med ballen på små flater.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "torstein_andersen_aase",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En kraftfull spiss med overblikk og særskilt evne til å komme i avslutningsposisjon.",
    strengths: ["strength","vision","box_presence"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En kraftfull spiss med overblikk og særskilt evne til å komme i avslutningsposisjon.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "thomas_saether",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En balansert og hurtig midtstopper med særlig gode defensive ferdigheter i én-mot-én-situasjoner.",
    strengths: ["balance","one_vs_one","pace"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En balansert og hurtig midtstopper med særlig gode defensive ferdigheter i én-mot-én-situasjoner.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "eivind_saether",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En oppofrende og aggressiv kapteinstype som også utmerker seg i hodespillet.",
    strengths: ["aggression","bravery","leadership","heading"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En oppofrende og aggressiv kapteinstype som også utmerker seg i hodespillet.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "hakon_haga",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En drivende ballfører som samtidig har overblikk og evne til å sette medspillere i spill.",
    strengths: ["ball_carrying","vision"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En drivende ballfører som samtidig har overblikk og evne til å sette medspillere i spill.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "john_rasmussen",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En robust og samlende midtstopper med stor luftstyrke og tydelig lederautoritet.",
    strengths: ["strength","heading","leadership"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En robust og samlende midtstopper med stor luftstyrke og tydelig lederautoritet.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "dennis_obeng",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En hurtig, driblesterk og fysisk krevende angrepsspiller som truer forsvarere på flere måter.",
    strengths: ["pace","dribbling","duels"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En hurtig, driblesterk og fysisk krevende angrepsspiller som truer forsvarere på flere måter.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "conrad_aslund",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En fysisk røff spiss med god balanse, som kan holde på ballen under press.",
    strengths: ["strength","balance"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En fysisk røff spiss med god balanse, som kan holde på ballen under press.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "sindre_ek",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En kantspiller som utmerker seg med vedvarende løpskapasitet og arbeidsradius.",
    strengths: ["stamina"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En kantspiller som utmerker seg med vedvarende løpskapasitet og arbeidsradius.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "pal_pernes",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En sterk avslutter som også er kjent for effektive skudd fra distanse.",
    strengths: ["finishing","long_shots"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En sterk avslutter som også er kjent for effektive skudd fra distanse.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "stale_andersen",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En ballsentral med balanse og overblikk som kan flytte spillet med presise langpasninger.",
    strengths: ["vision","balance","passing_range"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En ballsentral med balanse og overblikk som kan flytte spillet med presise langpasninger.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "jon_andre_saether",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En spiss som dokumentert binder sammen angrepsspillet, uten at målstatistikken brukes som ferdighetsbevis.",
    strengths: ["combination_play"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En spiss som dokumentert binder sammen angrepsspillet, uten at målstatistikken brukes som ferdighetsbevis.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "christian_dymbe",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En hurtig og kontant midtstopper som kan håndtere løpsdueller bak forsvaret.",
    strengths: ["pace"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En hurtig og kontant midtstopper som kan håndtere løpsdueller bak forsvaret.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "cato_valoy",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En ekstremt rask angriper som bruker tempoet til gjentatte løp bak forsvarslinjen.",
    strengths: ["pace","runs_behind"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En ekstremt rask angriper som bruker tempoet til gjentatte løp bak forsvarslinjen.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "knut_lie",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En teknisk midtbanespiller med god ballbehandling på små flater og gode avslutninger.",
    strengths: ["first_touch","finishing"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En teknisk midtbanespiller med god ballbehandling på små flater og gode avslutninger.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "nicolai_bonke_hagen",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En instinktiv dribler og ballfører som skaper offensive muligheter med egne gjennombrudd.",
    strengths: ["dribbling","ball_carrying","chance_creation"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En instinktiv dribler og ballfører som skaper offensive muligheter med egne gjennombrudd.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "rune_hansen",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En teknisk trygg ballspiller som beholder ro og kontroll i pressede situasjoner.",
    strengths: ["first_touch","composure"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En teknisk trygg ballspiller som beholder ro og kontroll i pressede situasjoner.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "bjorn_frode_torp",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En svært hurtig og klok midtstopper som kan lese spillet og gripe inn tidlig.",
    strengths: ["pace","game_reading"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En svært hurtig og klok midtstopper som kan lese spillet og gripe inn tidlig.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "ivar_stromsmo",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En lynrask dribler med dokumentert evne til lange, direkte sprintdrag.",
    strengths: ["pace","dribbling"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En lynrask dribler med dokumentert evne til lange, direkte sprintdrag.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "marius_brevig",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En back med gjennomgående god fysisk kapasitet gjennom en lengre karriereperiode.",
    strengths: ["stamina"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En back med gjennomgående god fysisk kapasitet gjennom en lengre karriereperiode.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "oyvind_monn_iversen",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En klok midtbanespiller med tydelig driblekompetanse fra klubbens storhetstid.",
    strengths: ["dribbling","game_reading"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En klok midtbanespiller med tydelig driblekompetanse fra klubbens storhetstid.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "kenneth_rakvaag",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En keeper med spesielt god reaksjonsevne i redningssituasjoner.",
    strengths: ["reflexes"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En keeper med spesielt god reaksjonsevne i redningssituasjoner.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "stian_dewahl",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En keeper som skiller seg ut gjennom fotarbeid og presis oppbygging bakfra.",
    strengths: ["distribution"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En keeper som skiller seg ut gjennom fotarbeid og presis oppbygging bakfra.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  {
    playerId: "arnstein_langnes",
    placeId: "kfum_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "En keeper med fint balltilslag og en tydelig samlende lederrolle.",
    strengths: ["distribution","leadership"],
    claim: "KFUMs kåring av klubbens 50 beste spillere beskriver: En keeper med fint balltilslag og en tydelig samlende lederrolle.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere"
  },
  // Eliteserien: Start, Tromsø og Fredrikstad · 19.10.2026.
  {
    playerId: "torfinn_ingebrigtsen",
    placeId: "romssa_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Hurtig og driblesterk angriper med målteft og stor evne til å utfordre forsvarslinjen.",
    strengths: ["pace","dribbling","finishing"],
    claim: "TILs spillerbiografi beskriver Ingebrigtsens fart, karakteristiske driblinger og vedvarende rolle som måltyv i klubbhistorien.",
    source: "https://statistikk.til.no/spiller/torfinn-ingebrigtsen"
  },
  {
    playerId: "bjarte_flem",
    placeId: "romssa_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Keeper med særskilt historisk dokumentert evne til å stoppe straffespark.",
    strengths: ["shot_stopping"],
    claim: "TILs spillerbiografi omtaler strafferedningsevnen som et fast særtrekk ved Flem gjennom keeperkarrieren. Påstanden gjelder skuddredning, ikke beregnede reflekser.",
    source: "https://statistikk.til.no/spiller/bjarte-flem"
  },
  {
    playerId: "lars_espejord",
    placeId: "romssa_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Komplett, duellsterk og pasningssikker sentral midtbanespiller med godt spillblikk.",
    strengths: ["simple_passing","game_reading","tackling","jumping","duels"],
    claim: "TILs spillerbiografi beskriver Espejord som pasningssikker, fotballklok, taklingssterk og spenstig, og som vinner av dueller både på bakken og i høyden.",
    source: "https://statistikk.til.no/spiller/lars-espejord"
  },
  {
    playerId: "nils_solstad",
    placeId: "romssa_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Uredd og solid lagspiller med kompromissløs taklingsevne fra backplass.",
    strengths: ["tackling","bravery","teamwork"],
    claim: "TILs spillerbiografi beskriver hundre prosents innsats i taklinger, fryktløshet overfor store motstandere og at han var en solid lagspiller. Ett cupfinaleskudd er ikke nok til å tilskrive langskudd.",
    source: "https://statistikk.til.no/spiller/nils-solstad"
  },
  {
    playerId: "roar_christensen",
    placeId: "romssa_arena",
    evidenceKind: "historical_appraisal",
    playingStyle: "Løpssterk, klok midtbanespiller med kjent langskuddstrussel.",
    strengths: ["work_rate","game_reading","long_shots","teamwork"],
    claim: "TILs biografi fremhever Christensen som en arbeidshest med god spilleforståelse, som lagspiller og med gjentatte kraftfulle mål fra lang avstand.",
    source: "https://statistikk.til.no/spiller/roar-christensen"
  },
  {
    playerId: "raio_piiroja",
    placeId: "fredrikstad_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Luftsterk duellstopper som også er farlig i offensive dødballer.",
    strengths: ["heading","duels"],
    claim: "FFK-arkivets biografi omtaler Piirojas luftdominans gjentatte ganger gjennom en mangeårig stopperkarriere, med 2006-finalen som et illustrerende eksempel, ikke som eneste belegg.",
    source: "https://ffksupporter.net/spillere/raio_piiroja/"
  },
  {
    playerId: "markus_ringberg",
    placeId: "fredrikstad_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Produktiv avslutter som tok ansvar og ledet laget gjennom vanskelig sesongfase.",
    strengths: ["finishing","leadership"],
    claim: "FFKs biografi dokumenterer målteft og gjentatte toppscorerprestasjoner på flere nivåer samt en eksplisitt lederrolle da klubben strevde høsten 2004.",
    source: "https://ffksupporter.net/spillere/markus_ringberg/"
  },
  {
    playerId: "hans_erik_ramberg",
    placeId: "fredrikstad_stadion",
    evidenceKind: "historical_appraisal",
    playingStyle: "Hardtarbeidende midtbanespiller med stor løpskapasitet og defensive bidrag.",
    strengths: ["stamina","work_rate"],
    claim: "FFKs historiske biografi fremhever Rambergs løpsstyrke som et varig trekk, og redaksjonell 2010-analyse beskriver førsteforsvarsarbeidet hans.",
    source: "https://ffksupporter.net/spillere/hans_erik_ramberg/"
  },
  {
    playerId: "brian_west",
    placeId: "fredrikstad_stadion",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Særlig hurtig kantspiller som gir en direkte kontrings- og bakromsdimensjon.",
    strengths: ["pace"],
    claim: "FFKs redaksjonelle sesongforhåndsvurdering i 2004 karakteriserer West som ekstremt rask og beskriver hvordan hurtigheten kunne utfordre venstrebackene.",
    source: "https://ffksupporter.net/nyheter/290-tabelltips-13-plass-fredrikstad/"
  },
  {
    playerId: "celso_borges",
    placeId: "fredrikstad_stadion",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Luftsterk offensiv midtbanespiller. Kilden beskriver også skuddkraft, men ikke dokumentert langskuddpresisjon.",
    strengths: ["heading"],
    claim: "FFKsupporters forhåndsanalyse i 2010 beskriver Borges som hodesterk og med et tungt skudd. Hodespill kan registreres som styrke, men skuddkraft uten dokumentert distanse eller presisjon gir ikke automatisk long_shots.",
    source: "https://ffksupporter.net/nyheter/1911-1-plass-fredrikstad-fk/"
  },
  {
    playerId: "marius_johnsen",
    placeId: "sor_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Back med særskilt dokumentert luftstyrke og hodespill.",
    strengths: ["heading"],
    claim: "Aftenpostens 2005-analyse omtaler hodespillet til Starts Marius Johnsen som en spisskompetanse i europeisk toppklasse. Kraftig venstrefot brukes ikke til å anta langskuddpresisjon.",
    source: "https://www.aftenposten.no/article/ap-dOJppj"
  },
  {
    playerId: "frank_strandli",
    placeId: "sor_arena",
    evidenceKind: "editorial_appraisal",
    playingStyle: "Kraftig, spenstig oppspillsspiss som vinner mye i lufta.",
    strengths: ["heading","jumping","duels"],
    claim: "Dagbladets spillerkåring beskriver Strandli som spenstig og sterk i lufta; samtidige kampvurderinger dokumenterer høy vunnet duellandel og det samme kjennetegnet.",
    source: "https://www.dagbladet.no/sport/norges-50-beste-fotballspillere/65451136"
  },

];

export const P1_NEW_DOCUMENTED = Object.freeze(documented.map((entry) => Object.freeze({
  ...entry,
  strengths: Object.freeze([...entry.strengths])
})));

// The following AaFK citations establish actions in particular matches, not stable
// individual strengths. They are retained for history/provenance but MUST NOT
// lift attributes. legacyTokens record only the old (withdrawn) strength tags.
const eventOnly = [
  // Sandefjord: 19 konkrete kampsekvenser beholdes uten attributtoner.
  {
    playerId: "jacob_storevik",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["reflexes"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Sandefjord Fotball beskriver i kamprapporten mot Odd at Jacob Storevik «viste ... stor reaksjonsevne» ved en redning fra kort hold. reaksjonsevne dokumenteres.",
    source: "https://www.sandefjordfotball.no/nyheter/stor-stemning-men-mallost-i-derbyfesten"
  },
  {
    playerId: "andre_sodlund",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["dribbling"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. NTBs kampreferat beskriver at Sødlund «fintet seg gjennom Sogndal-forsvaret» før en scoring. Den observerte driblingsteknikken føres.",
    source: "https://www.dagbladet.no/sport/hjemmeseier-etter-overtidsdrama-i-sogndal/67656716"
  },
  {
    playerId: "frode_fredriksen",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Starts egen sesonghistorikk fra 1999 beskriver hvordan Fredriksens skrå frispark fra høyre gikk direkte i mål mot Byåsen. den dokumenterte dødballutførelsen føres.",
    source: "https://www.ikstart.no/start-historien/sesongoversikter/sesongen-1999/sesongen-1999-var"
  },
  {
    playerId: "andreas_tegstrom",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["dribbling"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Dagbladets samtidige referat fra Sandefjord–Viking 24.09.2006 beskriver at Tegström driblet seg over halve banen før han scoret; han bekreftet selv at han også slo en tunnel. dribling føres.",
    source: "https://www.dagbladet.no/sport/mitt-fineste-mal-noensinne/66255977"
  },
  {
    playerId: "stefan_ingi_sigurdarson",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Sandefjord Fotballs referat fra Kristiansund 17.08.2025 beskriver at Sigurdarson headet inn et innlegg fra Patoulidis ved bakerste stolpe. denne dokumenterte hodeferdigheten føres.",
    source: "https://www.sandefjordfotball.no/nyheter/det-endte-med-arets-forste-uavgjort-i-kristiansund"
  },
  {
    playerId: "erik_mjelde",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Samtidig kampreferat fra Sandefjord–Tromsø 05.07.2015: «Erik Mjelde et frispark fra 18 meter rett i mål». Denne direkte dødballscoringen bærer kun set_pieces.",
    source: "https://www.bt.no/sport/i/dOwdXO/innbytteren-reddet-tromsoe-paa-overtid"
  },
  {
    playerId: "carlos_grossmuller",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["vision"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. VG Lives samtidige kampkommentar fra Sandefjord–Aalesund 01.10.2017 fremhever Carlos Grossmüllers «overblikk og en pasningsfot som går utenpå de fleste andre utpå her». eksplisitt overblikk (vision) føres, ingen antatt pasningsrekkevidde.",
    source: "https://vglive.vg.no/fotball/sandefjord-aalesund/6581/rapport"
  },
  {
    playerId: "kari_arkivuo",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["dribbling","crossing"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Nettavisens kampreferat fra Aalesund–Sandefjord 2007 skildrer Arkivuos kontring ned venstrekanten: han passerte/lurte to navngitte forsvarere og leverte et innlegg som Adriano Muñoz scoret på. dribling og innlegg (crossing) føres.",
    source: "https://www.nettavisen.no/sport/min-beste-opplevelse/s/12-95-1253762"
  },
  {
    playerId: "sander_risan_mork",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["finishing"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Brann Fotballs kampreferat 12.04.2026 sier at Sander Risan Mørk «plasserte et godt skudd i hjørnet» som avgjorde 0–1-kampen. den dokumenterte avslutningen (finishing) føres.",
    source: "https://www.brann.no/nyheter/tap-pa-stadion"
  },
  {
    playerId: "pau_morer",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["dribbling"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Sandefjord Fotballs eget kampreferat fra Molde 2017 beskriver at Pau Morer «driblet seg forbi en rekke Molde-spillere på lekkert vis inne i feltet». eksplisitt dribling føres, ikke duellstyrke fra én ballvinning.",
    source: "https://www.sandefjordfotball.no/nyheter/et-fyrverkeri-av-en-fotballkamp"
  },
  {
    playerId: "tom_helge_jacobsen",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Dagbladets samtidige divisjonsreferat fra Sandefjord–Haugesund 2001 beskriver en «glimrende heading» fra Tom Helge Jacobsen etter innlegg av Jon Midttun Lie. Bare dokumentert hodespill føres.",
    source: "https://www.dagbladet.no/sport/1-divisjonsbors---26-runde/65752444"
  },
  {
    playerId: "alexander_gabrielsen",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Samtidig Aftenbladet-referat fra Viking–Brann 26.03.2006 beskriver Alexander Gabrielsens målheading etter hjørnespark, som Brann-keeper Håkon Opdal ikke kunne avverge. Spilleren er identitetskontrollert mot NFFs karriereregister med senere Sandefjord-opphold. hodespill føres.",
    source: "https://www.aftenbladet.no/sport/i/K3B4AG/opdal-min-feil"
  },
  {
    playerId: "martin_jensen",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Aftenpostens samtidige Sandefjord–Brann-referat 16.03.2009 beskriver et godt frispark slått av Martin Jensen, videre stusset av Espen Nystuen, i angrepet som endte med Erik Mjeldes 1–0-mål. Bare den konkret dokumenterte frisparkleveransen føres som set_pieces; ingen andre pasningsegenskaper utledes.",
    source: "https://www.aftenposten.no/sport/fotball/i/lAMa4y/brann-ble-ydmyket"
  },
  {
    playerId: "panajotis_dimitriadis",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Bergens Tidendes samtidige kampreferat 28.10.2012 om Sandefjord–Bryne 2–0 beskriver hvordan Panajotis Dimitriadis møtte hjørnesparket først med hodet og styrte det i lengste hjørne til 2–0. dokumentert heading føres; resultat og målstatistikk gir ingen øvrige styrker.",
    source: "https://www.bt.no/sport/i/kJ3amL/kniven-paa-strupen-for-bryne-etter-nytt-tap"
  },
  {
    playerId: "peter_skov_jensen",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["shot_stopping"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Aftenpostens samtidige referat fra Rosenborg–Sandefjord 23.09.2007 beskriver at Peter Skov-Jensen bokset unna et frispark fra Marek Sapara og fistet et skudd fra Mikael Dorsin over mål. de konkrete redningene føres som shot_stopping; ingen generell rangering eller reaksjonsevne utledes.",
    source: "https://www.aftenposten.no/sport/fotball/i/50j0kO/komfortabelt"
  },
  {
    playerId: "marc_vales",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Molde FK beskriver i sitt kampreferat fra Molde–Sandefjord 0–1 i 2020 at Marc Vales headet inn Sandefjords mål etter en corner fra Vidar Ari Jónsson i det sjette minuttet. heading føres; ingen andre tekniske egenskaper utledes.",
    source: "https://www.moldefk.no/om-klubben/var-historie/2020-2023/2020/eliteserien-2020/ni-mann-med-2-pa-borsen"
  },
  {
    playerId: "daniel_seland_karlsbakk",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Norges Fotballforbunds kampreferat fra G19-kampen mot Serbia 07.06.2022 sier at Daniel Seland Karlsbakk headet inn Norges 2–3-redusering i det 82. minutt. dokumentert heading føres; handlingen fant sted på landslaget, men gjelder samme spiller.",
    source: "https://www.fotball.no/landslag/norge-gutter-19/2022/g19---vi-er-veldig-skuffa-over-at-vi-ikke-klarte-det/"
  },
  {
    playerId: "jan_fredrik_bjorntvedt",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. VG 07.07.2002 dokumenterer vinnermålet i Sandefjord–Tromsø 3–2: «to minutter på overtid headet Jan Fredrik Bjørntvedt 3-2 etter et innøvd frispark». Bare det eksplisitt dokumenterte hodespillet føres; ingen øvrige egenskaper utledes fra målet.",
    source: "https://www.vg.no/sport/i/L00QR4/foerste-serietap-for-tromsoe"
  },
  {
    playerId: "christer_reppesgard_hansen",
    placeId: "jotun_arena",
    evidenceKind: "single_match_event",
    legacyTokens: ["passing_range"],
    claim: "Historisk kampsekvens, ikke belegg for varig spilleregenskap. Dagsavisens samtidige Sandnes Ulf–Strømmen-referat 28.10.2020 beskriver en presis spillvending fra Reppesgård Hansen til kantspiller Jonsson: «Reppersgård Hansen vender spillet strålende til Jonsson». Dette bærer bare passing_range (vending av spillet); ingen generell oversikt, fart eller andre pasningsstyrker utledes fra enkelthendelsen.",
    source: "https://www.dagsavisen.no/sport/sandnes-ulf-kan-skyte-seg-tilbake-pa-kvalikplass/7113489"
  },

  {
    playerId: "jorgen_hatlehol",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["crossing"],
    claim: "AaFKs kampreferat fra Strømmen-kampen 11.08.2019 beskriver et knallhardt innlegg fra Jørgen Hatlehol som Pape Habib Gueye headet i mål.",
    source: "https://www.aafk.no/nyheter/seiersrekka-fortsatte"
  },
  {
    playerId: "pape_habib_gueye",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "AaFKs kampreferat mot Strømmen 11.08.2019 beskriver at Pape Habib Gueye møtte Hatlehols innlegg og dunket ballen i mål med hodet.",
    source: "https://www.aafk.no/nyheter/seiersrekka-fortsatte"
  },
  {
    playerId: "sigurd_haugen",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "AaFKs referat fra 6–2 mot Grorud 15.09.2021 beskriver at Sigurd Haugen scoret sitt andre mål med hodet etter innlegg fra Isak Dybvik Määttä.",
    source: "https://www.aafk.no/nyheter/storseier_AaFK_Grorud"
  },
  {
    playerId: "oddbjorn_lie",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["crossing"],
    claim: "AaFKs Skeid-referat fra 2019 beskriver at Oddbjørn Lie slo et «strøkent innlegg» som Hólmbert Friðjónsson headet i mål.",
    source: "https://www.aafk.no/nyheter/islandsk-festkveld"
  },
  {
    playerId: "markus_karlsbakk",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["finishing"],
    claim: "AaFKs 2.-lagsreferat 25.08.2018 beskriver at Markus Karlsbakk scoret 3–0 med en elegant lobb over keeperen.",
    source: "https://www.aafk.no/nyheter/atte-seire-pa-rad"
  },
  {
    playerId: "daniel_arnefjord",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Bergens Tidendes samtidige referat fra Aalesund–Start 21.04.2014 dokumenterer at Daniel Arnefjord møtte Michael Barrantes' frispark og headet fra sju meter i mål.",
    source: "https://www.bt.no/sport/i/50G0xK/start-straffet-tafatt-aalesund"
  },
  {
    playerId: "anders_lindegaard",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["shot_stopping"],
    claim: "Sunnmørspostens samtidige Rosenborg–Aalesund-omtale publisert 26.10.2009 beskriver flere sterke reaksjonsredninger fra Anders Lindegaard, spesielt at han slo et hardt, lavt skudd fra Rade Prica til corner.",
    source: "https://www.aftenbladet.no/sport/i/pL64G6/lindegaard-med-frysninger"
  },
  {
    playerId: "peter_orry_larsen",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["long_shots"],
    claim: "Sunnmørspostens kampreferat publisert 03.04.2016 beskriver at Peter Orry Larsen scoret med et hardt og velplassert skudd fra rundt 18 meter mot Brann.",
    source: "https://www.aftenbladet.no/sport/i/p6J0LV/scoring-fattig-troest-for-orry-larsen-hadde-smakt-bedre-med-seier"
  },
  {
    playerId: "andreas_lie",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["shot_stopping"],
    claim: "Aalesunds FKs samtidige kampreferat fra 2017 mot Tromsø beskriver at Andreas Lie avverget et tidlig frispark og senere beveget seg godt på streken for å slå Gjermund Åsens frispark på vei mot krysset unna.",
    source: "https://www.aafk.no/nyheter/solid-snuoperasjon-gir-tre-poeng"
  },
  {
    playerId: "enar_jaager",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Stavanger Aftenblads samtidige Aalesund–Rosenborg-referat 27.04.2012 beskriver at Enar Jääger slo et frispark fra midtbanen inn i feltet som Lars Fuhre styrte i mål.",
    source: "https://www.aftenbladet.no/sport/i/L0yMKx/dramaet-i-aalesund-endte-uavgjort"
  },
  {
    playerId: "magnus_sylling_olsen",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["finishing"],
    claim: "Rosenborgs historiske kampreferat om avslutningen på Tippeligaen 2010 beskriver at Magnus Sylling Olsen kom gjennom fra venstresiden og banket ballen kontant i mål i siste ordinære minutt.",
    source: "https://www.rbk.no/nyheter/rbk-ubeseiret-i-2010"
  },
  {
    playerId: "abderrazak_hamdallah",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading", "finishing"],
    claim: "AaFKs historiske Viking-referat (kamp 25. oktober 2013) beskriver en kontrollert heading etter Phillips' innlegg, en senere presis avslutning og et kontant skudd fra 16 meter.",
    source: "https://www.aafk.no/nyheter/hamed-allahs-store-kveld"
  },
  {
    playerId: "demar_phillips",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["crossing"],
    claim: "AaFKs historiske Viking-referat beskriver Demar Phillips som slo et presist innlegg til Abderrazak Hamdallahs kontrollerte heading 25. oktober 2013.",
    source: "https://www.aafk.no/nyheter/hamed-allahs-store-kveld"
  },
  {
    playerId: "eirik_hoseth",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "Dagbladets samtidige referat fra Aalesund–Hødd 20. juli 2001 beskriver Eirik Hoseth som headet inn returen etter et reddet skudd fra Paulo dos Santos.",
    source: "https://www.dagbladet.no/sport/1-divisjon-20-juli/65740469"
  },
  {
    playerId: "erling_yttis_ytterland",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Dagbladets samtidige Aalesund–Hødd-referat 20. juli 2001 beskriver en presis corner fra Erling Ytterland som Tor Hogne Aarøy headet i mål.",
    source: "https://www.dagbladet.no/sport/1-divisjon-20-juli/65740469"
  },
  {
    playerId: "amund_skiri",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Aftenpostens samtidige Aalesund–Lillestrøm-referat i 2003 beskriver et langt frispark fra Amund Skiri rett i beina på Eirik Hoseth, som avsluttet i mål.",
    source: "https://www.aftenposten.no/sport/fotball/i/2G9KMy/hoseths-blinkskudd"
  },
  {
    playerId: "bjorn_erik_melland",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "AaFKs historiske omtale av stadionåpningen mot Odd 16. april 2005 beskriver at Bjørn Erik Melland headet et hjørnespark ut i feltet, før Lasse Olsen senere satte ballen i mål.",
    source: "https://www.aafk.no/historisk-arkiv/nyheter/vare-baner-color-line-stadion"
  },
  {
    playerId: "sander_post",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading", "finishing"],
    claim: "Stavanger Aftenblads cupreferat fra Tornado/Måløy–Aalesund 11.05.2011 beskriver at Sander Post stusset Solomon Okoronkwo gjennom til mål og vant flere luftdueller; han satte selv ballen i mål etter å ha blitt spilt gjennom.",
    source: "https://www.aftenbladet.no/sport/i/XwGmK7/ingen-cupbombe-detonert-i-maaloey"
  },
  {
    playerId: "daniel_leo_gretarsson",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "AaFKs samtidige Strømmen-referat 11.08.2019 beskriver at Daníel Leó Grétarsson steg høyest på en corner og nikket inn 1–0.",
    source: "https://www.aafk.no/nyheter/seiersrekka-fortsatte"
  },
  {
    playerId: "john_kitolano",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["crossing"],
    claim: "AaFKs referat fra AaFK 2–Florø 12.10.2022 beskriver at Bjørn Martin Kristensen scoret etter innlegg fra John Kitolano i det 53. minutt.",
    source: "https://www.aafk.no/nyheter/aafk-2-sikret-opprykket"
  },
  {
    playerId: "tero_mantyla",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "AaFKs treningskampreferat mot Hødd publisert 27.01.2017 beskriver at Tero Mäntylä var riktig plassert på corner og headet inn 4–0.",
    source: "https://www.aafk.no/nyheter/knuste-hodd-pa-color-line-stadion"
  },
  {
    playerId: "diego_silva",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["dribbling", "crossing"],
    claim: "Bergens Tidendes samtidige referat fra AaFK–Viking 28.02.2010 beskriver at Diego Silva ved flere anledninger rundlurte Vikings back Christian Landu Landu.",
    source: "https://www.bt.no/sport/i/K3yPQ4/aalesund-naermest-seieren-mot-viking"
  },
  {
    playerId: "david_fallman",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "AaFKs kampreferat mot Sandnes Ulf 24.10.2021 beskriver at David Fällman møtte David Kristjan Olafssons innlegg og headet inn 2–1 etter 51 minutter.",
    source: "https://www.aafk.no/nyheter/holdt-til-uavgjort-av-sandnes-ulf"
  },
  {
    playerId: "edvard_skagestad",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["tackling"],
    claim: "VG Lives samtidige referat fra AaFK–Strømsgodset 2–1 beskriver ved 59 minutter at Edvard Skagestad taklet til seg ballen i duell med Iver Fossum.",
    source: "https://vglive.vg.no/kamp/aalesund-str%C3%B8msgodset/145384/rapport"
  },
  {
    playerId: "henrik_molvaer_melland",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["finishing"],
    claim: "Lyns samtidige kampreferat fra Aalesund–Lyn 22.10.2025 beskriver at Henrik Molvær Melland avsluttet hurtig på returen etter Elias Heggland Myrlids stolpeskudd, og avgjorde kampen 2–1 i det 89. minutt.",
    source: "https://www.lyn1896.no/nyheter/tung-avslutning-pa-color-line--tapte-i-siste-minutt"
  },
  {
    playerId: "paulo_dos_santos",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Bergens Tidendes samtidige AaFK–Fredrikstad-referat 29.05.2005 beskriver at Paulo dos Santos skrudde et frispark fra cirka 16 meter direkte i mål, og at han selv forklarte hvordan han utnyttet keeperens posisjon.",
    source: "https://www.bt.no/sport/i/Opr4WE/aarsbeste-av-aafk"
  },
  {
    playerId: "simen_vatne_haram",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["heading"],
    claim: "AaFKs cupreferat mot HamKam 20.05.2025 beskriver at Simen Vatne Haram møtte Kristoffer Nessøs presise innlegg på bakerste stolpe og headet sikkert i mål til 2–1.",
    source: "https://www.aafk.no/nyheter/kvartfinalen-er-sikret"
  },
  {
    playerId: "elias_heggland_myrlid",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["dribbling", "finishing"],
    claim: "AaFKs cupreferat fra Langevåg 2026 beskriver at Elias Heggland Myrlid fintet bort to motspillere før han satte ballen kontrollert i mål etter ni minutter.",
    source: "https://www.aafk.no/nyheter/aafk-videre-i-nm-etter-cupfest-i-langevagen"
  },
  {
    playerId: "hakon_butli_hammer",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["long_shots"],
    claim: "Dagsavisens samtidige rapport fra Aalesund–Tromsø høsten 2023 beskriver at Håkon Butli Hammer banket til fra distanse og scoret med et skudd som overrasket keeper Jakob Haugaard.",
    source: "https://www.dagsavisen.no/sport/tabelljumbo-aalesund-slo-medaljejagende-tromso/6917197"
  },
  {
    playerId: "frode_fagermo",
    placeId: "color_line_stadion",
    evidenceKind: "single_match_event",
    legacyTokens: ["set_pieces"],
    claim: "Dagbladets samtidige 1. divisjonsbørs 30.04.2001 beskriver at Aalesund utlignet mot L/F Hønefoss etter ett av Frode Fagermos lange innkast, som Sandø banket i mål.",
    source: "https://www.dagbladet.no/sport/1-divisjonsbors---2-runde/65710337"
  }
];

export const P1_NEW_EVENT_ONLY = Object.freeze(eventOnly.map((entry) => Object.freeze({
  ...entry,
  legacyTokens: Object.freeze([...entry.legacyTokens])
})));

// DELVIS is reserved for a source actually inspected in this pass that documents
// career/role but carries no reusable skill claim. The source-safe v2 pool files
// alone do not upgrade a profile from THIN-SOURCE; the earlier five pass files
// retain their own already-audited DELVIS identities.
// Sandefjord: to biografiske sekundærkilder trenger originalverifisering.
export const P1_NEW_PARTIAL = Object.freeze([
  {
    playerId: "enric_valles",
    placeId: "jotun_arena",
    strengths: [],
    claim: "Sekundær biografisk gjengivelse av en mulig ferdighet. Originalt spillerintervju er ikke kontrollert direkte, og gir derfor ikke kvalifisert varig styrke.",
    source: "https://en.wikipedia.org/wiki/Enric_Vall%C3%A8s"
  },
  {
    playerId: "thomas_eftedal",
    placeId: "jotun_arena",
    strengths: [],
    claim: "Sekundær biografisk gjengivelse av en mulig ferdighet. Originalt spillerintervju er ikke kontrollert direkte, og gir derfor ikke kvalifisert varig styrke.",
    source: "https://en.wikipedia.org/wiki/Thomas_Eftedal"
  },
].map((entry) => Object.freeze({ ...entry, strengths: Object.freeze([...entry.strengths]) })));

const existingSupplements = [
  // 2026-10-21: three source-bounded Brann-era historical profiles.
  {
    "playerId": "jan_knudsen",
    "placeId": "brann_stadion",
    "strengths": [
      "shot_stopping"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Brann-keeper som gjennom 1970-årene gjentatte ganger reddet laget med godt keeperspill.",
    "claim": "I Aftenpostens retrospektive portrett av Jan Knudsen fra 22. desember 2018 beskriver Anders Pamer ham som Branns glimrende keeper fra 1970-tallet og omtaler at han reddet Brann mange ganger. Dette er en generalisert vurdering av keeperspillet over tid, ikke en enkelt redning i én kamp. Kun shot_stopping registreres; artikkelen dokumenterer ikke spesifikt reflexes, distribution eller command_of_area.",
    "source": "https://www.aftenposten.no/sport/fotball/i/Vbxdv4/jan-knudsen-reddet-brann-mange-ganger-men-det-var-ingen-som-kunne-redde-ham"
  },
  {
    "playerId": "neil_macleod",
    "placeId": "brann_stadion",
    "strengths": [
      "leadership"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Langvarig Brann-kaptein og lederskikkelse på midtbanen i slutten av 1970-årene og begynnelsen av 1980-årene.",
    "claim": "Aftenpostens historiske vurdering av Brann-kapteiner fra 2015 rangerer Neil MacLeod som nummer syv blant klubbens fremtredende kapteiner. Branns egen 1982-beretning identifiserer ham samtidig som kaptein i cupfinalen. Kombinasjonen av en særskilt retrospektiv vurdering av hans kapteinsinnsats og dokumentert kapteinsrolle støtter leadership i Brann-perioden, ikke pasninger, finishing eller andre tekniske tokens.",
    "source": "https://www.aftenposten.no/sport/meninger/i/AdGWX5/martin-paa-kaptein-toppen"
  },
  {
    "playerId": "kjell_rune_pedersen",
    "placeId": "brann_stadion",
    "strengths": [
      "leadership"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Sentral midtbaneorganisator i Branns opprykks- og cupvinnersesong 1982.",
    "claim": "Branns offisielle sesonghistorikk, som bygger på Atle Nielsens jubileumsbok fra 2008, omtaler den tilbakevendte Kjell Rune Pedersen uttrykkelig som «midtbanegeneral» i 1982. Den individualiserte lederrollen gir et smalt belegg for leadership i akkurat denne Brann-sesongen, men ikke for passing_range, game_reading eller tempo_control; kamptall og mål brukes ikke som kvalitetsbevis.",
    "source": "https://historie.brann.no/sesonger/1982/"
  },

  // 2026-10-21: deliberately narrow historical profiles, distinct source eras.
  {
    "playerId": "odd_oppedal",
    "placeId": "brann_stadion",
    "strengths": [
      "leadership"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Samlende og respektert leder på Branns midtbane i seriegullårene; ferdighetsbeskrivelsen skilles fra generelt teknikk-skryt.",
    "claim": "Bergens Tidendes minneartikkel 30. mai 2018 siterer tidligere Brann-spiller Helge Karlsen, som beskriver Odd Oppedal som kaptein på klubbens stjernelag, og tidligere Brann-formann Harald Andersen, som husker ham som et «samlingspunkt på banen». Til sammen gir disse uavhengige historiske vurderingene belegg for leadership i Brann-perioden rundt 1961/62 og 1963. Den omtalte eminente teknikken gir ikke automatisk first_touch, dribbling eller passing_range; fravær av fart brukes ikke som numerisk minusverdi.",
    "source": "https://www.bt.no/sport/i/kJEmBa/brann-legende-odd-oppedal-er-doed"
  },
  {
    "playerId": "jan_halvor_halvorsen",
    "placeId": "brann_stadion",
    "strengths": [
      "duels"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Fysisk robust og effektiv i direkte forsvarsdueller, beskrevet konkret fra senere AGF-periode.",
    "claim": "AGF Legendernes historiske spillerportrett beskriver Jan Halvor Halvorsen som en solid norsk forsvarsklippe og forteller at de to tekniske B 1903-angriperne Michael og Martin Johansen hadde svært vanskelig for å komme forbi ham i den danske cupfinalen 1992. Dette gir et begrenset, eksplisitt epokemerket belegg for duels hos spilleren i AGF-perioden 1992–94, etter Brann-oppholdet. Kilden viser hans tidligere to sesonger i Brann, men den tilskrives ikke Brann-perioden og støtter ikke automatisk tackling, pace eller heading.",
    "source": "https://agflegenderne.dk/jan-halvor-halvorsen/"
  },

  // 2026-10-21: teammate-based source appraisal (Brann 2004) for Roy Wassberg.
  {
    "playerId": "roy_wassberg",
    "placeId": "brann_stadion",
    "strengths": [
      "game_reading",
      "composure",
      "leadership"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Rolig, spilleklok og samlende Brann-veteran. Lagkamerater fremhevet evnen til å lese spillet fremfor å måtte takle og hans ledende støtte til yngre spillere.",
    "claim": "I supporterbladet Den 12. mann 3/2004, s. 31, vurderer yngre Brann-lagkamerater Erlend Storesund og Arve Walde Roy Wassbergs spill i Brann-perioden 1989–1993 og 1998–2004. De beskriver «en helt spesiell ro på banen», at han «sjelden [behøver] takle» fordi han er «så god til å lese spillet», og at han oppmuntret, ga råd og var en «typisk lederskikkelse». Dette er direkte personlig belegg for game_reading, composure og leadership. Omtalen brukes ikke til tackling, pace eller konstruerte tallratinger.",
    "source": "https://www.fanzine.no/filer/pdf/d12m0304.pdf"
  },

  // 2026-10-21: three historically supported Brann player styles; no aggregate ratings.
  {
    "playerId": "bjarni_sigurdsson",
    "placeId": "brann_stadion",
    "strengths": [
      "shot_stopping",
      "command_of_area"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Sterk på streken og trygg i feltarbeidet, ifølge en historisk vurdering av Brann-perioden.",
    "claim": "Aftenpostens historiske førsteellever over islendinger i norsk fotball (1. september 2011) beskriver Bjarni Sigurðsson som Brann-keeper med gode ferdigheter på streken og trygghet i feltet, og med få tabber. Dette gir individuell, Brann-periodebasert dekning for shot_stopping og command_of_area. Det gis ikke reflexes eller distribution fra landskamper eller prisomtale.",
    "source": "https://www.aftenposten.no/sport/fotball/i/MRPX15/norges-favorittgjester"
  },
  {
    "playerId": "roger_helland",
    "placeId": "brann_stadion",
    "strengths": [
      "work_rate",
      "teamwork"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Arbeidsvillig og lagorientert forsvarsspiller, særskilt omtalt i supporterintervju med spilleren.",
    "claim": "I supporterbladet Den 12. mann 3/2008, s. 34–35, beskriver Daniel Nygård Roger Hellands Brann-år 1993–1999 som kjennetegnet av innsats og arbeidsvilje samt lojalitet mot lagkameratene. Dette gir periodetydelig belegg for work_rate og teamwork, ikke duellstyrke, heading eller numeriske ferdighetsverdier. Branns eget spillerarkiv understøtter hans lagorienterte rolle.",
    "source": "https://www.fanzine.no/filer/pdf/d12m0308.pdf",
    "supportingSources": [
      "https://historie.brann.no/spillere/roger-helland/"
    ]
  },
  {
    "playerId": "bjorn_tronstad",
    "placeId": "brann_stadion",
    "strengths": [
      "finishing"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Målfarlig Brann-angriper gjennom flere sesonger på 1970-tallet, dokumentert i klubbhistorien.",
    "claim": "Branns historiske spillerportrett sier uttrykkelig at Bjørn Tronstad fra 1974 utviklet seg til en fast og «målfarlig angriper» over påfølgende sesonger. Det dokumenterer målteft/finishing som varig individuelt særpreg. Oppgitte mål per kamp, enkeltscoringer og Bill Elliotts generelle ros blir ikke brukt til å utlede ekstra tokens eller tallrating.",
    "source": "https://historie.brann.no/spillere/bjoern-tronstad/"
  },

  // 2026-10-20: contemporary Brann season appraisal (2010), same source-first pass.
  {
    "playerId": "zsolt_korcsmar",
    "placeId": "brann_stadion",
    "strengths": [
      "duels"
    ],
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Duellsterk midtstopper i Branns 2010-sesong, beskrevet av samtidige sportsjournalister.",
    "claim": "Aftenpostens sesongvise spillerkarakterbok fra 2010 vurderer Zsolt Korcsmár etter ni Brann-kamper, omtaler ham som bestemann i Brann-forsvaret etter låneovergangen og sier eksplisitt at han var «sterk i duellspillet». Dette gir begrenset, periodeavgrenset individuelt belegg for duels. Artikkelen nevner samtidig utfordringer med tempo; den brukes ikke til å tildele fart, markering, heading, stabilitet eller tallrating.",
    "source": "https://www.aftenposten.no/sport/fotball/i/70q5b9/branns-karakterbok"
  },
  // 2026-10-20: two carefully delimited historical Brann skill profiles.
  {
    "playerId": "tore_nordtvedt",
    "placeId": "brann_stadion",
    "strengths": [
      "overlapping_runs",
      "crossing",
      "stamina",
      "marking"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Offensiv og utholdende høyreback med gjentatte løp fremover, presise innlegg og tett oppfølging av motspiller på returløp.",
    "claim": "Branns historiske spillerprofil beskriver Tore Nordtvedts Brann-periode 1963–1979: nærmest hver gang Brann vant ballen, løp han frem langs høyresiden og slo presise innlegg. Klubben fremhever også kondisjon, rask retur til forsvarsposisjon og at han fulgte motstandervingen tett og utrettelig. Dette støtter overlapping_runs, crossing, stamina og marking. Kamptall, antatte taklingsferdigheter og numeriske ratinger brukes ikke som belegg.",
    "source": "https://historie.brann.no/spillere/tore-nordtvedt"
  },
  {
    "playerId": "atle_helleso",
    "placeId": "brann_stadion",
    "strengths": [
      "simple_passing"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Pasningssikker midtbanespiller etter en historisk og uttrykkelig anekdotisk Brann-omtale.",
    "claim": "Bergens Tidende 20. juni 2018 omtaler Atle Hellesø med den retrospektive og uttrykkelig anekdotiske formuleringen «Noen sier han aldri slo en pasning feil». Dette er et historisk vitnesbyrd om pasningssikkerhet, ikke målbar feilprosent eller dokumentasjon for lange pasninger, spilleforståelse eller tempoledelse. Derfor tilføres bare simple_passing uten konstruert tallrating.",
    "source": "https://www.bt.no/nyheter/lokalt/i/wEQ31d/en-gudbenaadet-spiller"
  },

  // 2026-10-20: Three further source-backed exclusive Lillestrøm profiles; no positional inference.
  {
    "playerId": "frank_gronlund",
    "placeId": "araasen_stadion",
    "strengths": [
      "strength"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Fysisk kraftspiller i Lillestrøm-perioden; klubbens retrospektive intervju fremhever den kraftfulle spillertypen.",
    "claim": "Lillestrøms God Fugl-intervju publisert 29. november 2017 omtaler Frank Grønlund, som spilte for LSK i 1970–1983, som en storvokst kraftspiller. Dette gir begrenset, individuelt belegg for strength. Beskrivelsen gir ikke grunnlag for taklinger, hodespill, pasningskvalitet, duellstatistikk eller tallrating.",
    "source": "https://www.lsk.no/nyheter/frank-gronlund-giganten-som-fikk-kong-olav-til-a-le"
  },
  {
    "playerId": "joar_vaadal",
    "placeId": "araasen_stadion",
    "strengths": [
      "heading",
      "strength"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Hodesterk, fysisk robust targetspiss, særskilt beskrevet i retrospektiv spilleromtale.",
    "claim": "Bergens Tidendes retrospektive utvalg publisert 8. september 2015 beskriver Joar Vaadal i Lillestrøm som en «hodesterk muskelbunt» og «typisk targetspiss». Den eksplisitte beskrivelsen støtter heading og strength; rollen alene brukes ikke til å tildele hold_up_play, scoringstall brukes ikke som belegg for finishing, og ingen numeriske verdier utledes.",
    "source": "https://www.bt.no/sport/i/dOwArB/paa-dette-droemmelaget-faar-landslagssjef-hoegmo-plass-som-spiller"
  },
  {
    "playerId": "arne_amundsen",
    "placeId": "araasen_stadion",
    "strengths": [
      "game_reading"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Taktisk klok og stødig keeper i Lillestrøm, med særlig gode vurderinger av spillet.",
    "claim": "I Aftenbladets omtale 8. september 2014 gjengis Tom Lunds tidligere vurdering av LSK-keeper Arne Amundsen som stødig, effektiv og «desidert best taktisk» blant keepere Lund hadde spilt med. Dette gir individuelt belegg for game_reading. Omtalen dokumenterer ikke særskilt reaksjonshurtighet, grepsteknikk, skuddredninger eller distribusjon.",
    "source": "https://www.aftenbladet.no/sport/i/m6GJp4/norsk-keeperlegende-doede-braatt"
  },

  // 2026-10-20: two directly sourced canonical exclusive heritage profiles.
  {
    "playerId": "erik_soler",
    "placeId": "araasen_stadion",
    "strengths": [
      "tackling",
      "teamwork"
    ],
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Taklingssterk ballvinner som spilte enkelt for Tom Lund og beskrev seg selv som en støttespiller for laget.",
    "claim": "I Lillestrøms God Fugl-intervju publisert 16. oktober 2018 forteller Erik Solér selv om sine første LSK-år at han taklet, vant ballen og spilte den videre til Tom Lund som en tjenestegutt for ham. Dette gir direkte, epokespesifikt belegg for tackling og teamwork. Det etablerer ikke særskilt pasningspresisjon, løpskraft eller numeriske ferdighetsverdier.",
    "source": "https://www.lsk.no/nyheter/god-fugl-soler-ble-forsokt-hentet-med-donald-blad-som-betaling"
  },
  {
    "playerId": "erlend_hanstveit",
    "placeId": "brann_stadion",
    "strengths": [
      "strength",
      "pace"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Fysisk sterk og hurtig forsvarsspiller med offensive initiativ, slik Branns egen spillerhistorie beskriver ham.",
    "claim": "SK Branns historiske spillerprofil beskriver Erlend Hanstveit som høy og sterk med god fart og initiativ framover i banen. strength og pace er direkte beskrivende, varige kvaliteter i Brann-perioden. Offensive initiativ bevares som tekst, uten å utlede spesifikke overlappsløp, dribling eller pasningsegenskaper.",
    "source": "https://historie.brann.no/spillere/erlend-hanstveit"
  },


  // 2026-10-20: Five source-verified Lillestrøm profiles; canonical exclusive identities only.
  {
    "playerId": "runar_kristinsson",
    "placeId": "araasen_stadion",
    "strengths": [
      "vision",
      "flair",
      "duels"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Kreativ og spilleklok ballfordeler med konkret omtalt duellstyrke i Lillestrøm-perioden.",
    "claim": "Kanari-Fansens Lillestrøm-profil beskriver Kristinsson i LSK-årene som en briljant ballfordeler med enorm spilleforståelse og senere en svært god duellspiller, og omtaler ham som kreativ. Disse vurderingene støtter vision, flair og duels, uten numeriske ratinger eller pasningspresisjon utledet av målstatistikk.",
    "source": "https://www.kanari-fansen.no/wiki/index.php/Runar_Kristinsson",
    "supportingSources": [
      "https://www.lokalfotballen.blog/2017/11/18/mitt-favorittlag-anders-eriksen-like-gode-pa-banen-som-pa-banketten/"
    ]
  },
  {
    "playerId": "kjetil_osvold",
    "placeId": "araasen_stadion",
    "strengths": [
      "first_touch"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Teknisk finslepen midtbanespiller; individuell teknikk fremheves i retrospektiv omtale av LSK-karrieren.",
    "claim": "Nettavisens spillerintervju fra mars 2007 beskriver Osvold som viden kjent for finslepen teknikk og omtaler hans Lillestrøm-år. Den generelle teknikkbeskrivelsen representeres konservativt av motorens first_touch-kategori, ikke som dokumentasjon for spesifikke driblinger, skudd eller pasningsrekkevidde. En enkelt tunnel mot Maradona brukes ikke som varig ferdighetsbevis.",
    "source": "https://www.nettavisen.no/sport/hva-gjor-du-na-kjetil-osvold/s/12-95-911542"
  },
  {
    "playerId": "bard_bjerkeland",
    "placeId": "araasen_stadion",
    "strengths": [
      "duels"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Kompromissløs og fysisk tøff midtstopper i Lillestrøm, med duellspill som særpreg.",
    "claim": "Lillestrøms historiske intervju publisert desember 2017 omtaler Bjerkeland som en kompromissløs og tøff stopper og gjengir VGs samtidskarakteristikk av ham som kompromissløs. Dette støtter duels som spillestil. En enkelt omtalt takling mot Mini er ikke alene grunnlag for et permanent tackling-token; generell eleganse mappes heller ikke til oppdiktede ferdigheter.",
    "source": "https://www.lsk.no/nyheter/bard-bjerkeland-jeg-fikk-kjeft-av-kjerrringa-til-mini"
  },
  {
    "playerId": "nosa_igiebor",
    "placeId": "araasen_stadion",
    "strengths": [
      "flair"
    ],
    "evidenceKind": "editorial_appraisal",
    "playingStyle": "Dristig og kreativ midtbanespiller som tok risiko med pasningene sine i Lillestrøm-perioden.",
    "claim": "En fotballfaglig Aftenbladet-kommentar fra 7. juni 2010 skiller eksplisitt mellom Eziyodawes driblinger og Igiebors dristige pasninger, og fremhever Igiebors kreative innflytelse. Dette underbygger kreativ risikovilje (flair), men ikke bestemte nivåer på pasningspresisjon, dribling eller hurtighet, som omtales kollektivt for to spillere.",
    "source": "https://www.aftenbladet.no/sport/i/oRdyRW/droemmen-om-en-bragd"
  },
  {
    "playerId": "rune_richardsen",
    "placeId": "araasen_stadion",
    "strengths": [
      "vision",
      "stamina",
      "duels"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Spilleklok, løpssterk og duellsterk midtbanespiller beskrevet av en tidligere medspiller i en senere klubbperiode.",
    "claim": "Tidligere medspiller Per Kristian Melby omtaler Richardsens spilleforståelse, løpskraft og duellstyrke i en publisert ellever i 2023. Vurderingen gjelder AFSK-sammenheng og er ikke en samtidig analyse av Lillestrøm-perioden; vision, stamina og duels knyttes derfor til samme spiller uten å konstruere epokespesifikke tall eller bruke rolle/mål som ferdighetsbevis.",
    "source": "https://www.lokalfotballen.blog/2023/10/24/mitt-favorittlag-per-kristian-melby-aktive-bade-pa-banen-og-lordagskvelden/"
  },


  // 2026-10-20: Ny kildebolk etter PR #448: 2 Lillestrøm og 9 Brann.
  {
    "playerId": "torgeir_bjarmann",
    "placeId": "araasen_stadion",
    "strengths": [
      "duels",
      "game_reading",
      "teamwork"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Duellsterk Lillestrøm-kaptein med taktiske og tekniske kvaliteter som løftet lagkamerater.",
    "claim": "Dagbladets vurdering fra 2001 beskriver Bjarmann som tøff i dueller med en særlig kombinasjon av taktiske, tekniske og sosiale ferdigheter, og peker på at medspillere ble bedre rundt ham. duels, game_reading og teamwork er avgrensede ferdighetsbegreper; kapteinsbindet alene brukes ikke som bevis.",
    "source": "https://www.dagbladet.no/sport/en-komplett-kaptein/65763943"
  },
  {
    "playerId": "espen_sogard",
    "placeId": "araasen_stadion",
    "strengths": [
      "work_rate",
      "stamina",
      "duels"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Hardtarbeidende, løpssterk midtbanespiller med særpreg i duellspillet.",
    "claim": "Individuelle Dagbladet-vurderinger fra 2002 og 2003 beskriver Søgård som hardtarbeidende og løpssterk og fremhever duellstyrken. work_rate, stamina og duels er avgrensede beskrivelser, ikke posisjonsgjetninger.",
    "source": "https://www.dagbladet.no/sport/norges-50-beste-fotballspillere/65797347"
  },
  {
    "playerId": "helge_karlsen",
    "placeId": "brann_stadion",
    "strengths": [
      "pace",
      "positioning",
      "tackling"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Hurtig forsvarer med god plasseringsevne og presise taklinger.",
    "claim": "Branns historiske profil beskriver fart, plasseringsevne og presise taklinger fra hans Brann-år. Dette begrunner bare pace, positioning og tackling.",
    "source": "https://historie.brann.no/spillere/helge-karlsen/"
  },
  {
    "playerId": "birkir_mar_saevarsson",
    "placeId": "brann_stadion",
    "strengths": [
      "pace",
      "ball_carrying"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Hurtig back som utviklet ballkontrollen gjennom Brann-perioden.",
    "claim": "Branns historiske profil kaller Sævarsson hurtig og beskriver bedret ballkontroll rundt 2011. pace og ball_carrying er konservative kvalitetsbegreper, uten å hevde spesifikk dribleferdighet.",
    "source": "https://historie.brann.no/spillere/birkir-mar-saevarsson/"
  },
  {
    "playerId": "olafur_orn_bjarnason",
    "placeId": "brann_stadion",
    "strengths": [
      "strength",
      "heading"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Fysisk tøff forsvarer med dokumentert god luftstyrke.",
    "claim": "Branns historiske profil omtaler Bjarnason som fysisk tøff og god i luften. strength og heading er direkte avledet fra denne individbeskrivelsen, ikke fra posisjon.",
    "source": "https://historie.brann.no/spillere/olafur-oern-bjarnason/"
  },
  {
    "playerId": "geirmund_brendesaeter",
    "placeId": "brann_stadion",
    "strengths": [
      "duels",
      "pace"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Tøff, fysisk back med stor fart.",
    "claim": "Branns historiske profil fremhever Brendesæters hardhet og fart. duels og pace er konservative ferdighetskategorier, uten ubegrunnede taklings-/pasningsclaims.",
    "source": "https://historie.brann.no/spillere/geirmund-brendesaeter"
  },
  {
    "playerId": "charlie_miller",
    "placeId": "brann_stadion",
    "strengths": [
      "first_touch",
      "vision",
      "simple_passing"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Teknisk sterk midtbanespiller med spilleblikk og gode pasninger.",
    "claim": "En samtidig omtale fra juli 2004 trekker frem Millers teknikk, spilleblikk og pasningskvalitet. first_touch er en forsiktig kategorisering av teknikk, simple_passing en konservativ pasningskategori. Kilden gjelder en tidlig vurdering, ikke et tallnivå.",
    "source": "https://www.aftenbladet.no/sport/i/zLRQ7v/branns-nye-midtbanesjef"
  },
  {
    "playerId": "cato_guntveit",
    "placeId": "brann_stadion",
    "strengths": [
      "vision",
      "off_ball_runs",
      "leadership"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Spilleklok Brann-spiller med gode løp uten ball og dokumentert lederskap.",
    "claim": "Branns historiske profil beskriver Guntveits svært gode spilleforståelse og våkne løp som strekker motstanderforsvaret. Klubben omtaler ham også som en god leder i 2004. Ferdighetene følger disse direkte utsagnene.",
    "source": "https://historie.brann.no/spillere/cato-guntveit/"
  },
  {
    "playerId": "egil_austbo",
    "placeId": "brann_stadion",
    "strengths": [
      "work_rate",
      "leadership"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Hardtarbeidende midtbanespiller med dokumenterte lederegenskaper.",
    "claim": "Branns historiske spillerprofil fremhever Austbøs arbeidsinnsats og lederegenskaper. Ingen kvaliteter er utledet fra posisjon eller kampstatistikk.",
    "source": "https://historie.brann.no/spillere/egil-austboe/"
  },
  {
    "playerId": "petter_furuseth_olsen",
    "placeId": "brann_stadion",
    "strengths": [
      "acceleration",
      "runs_behind"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Kvikk, gjennombruddsvillig spiller med kraftfullt skudd med begge bein.",
    "claim": "Dagbladets individuelle vurdering i 2002 beskriver Furuseth Olsen som kvikk, gjennombruddsvillig og skuddsterk med begge bein. acceleration og runs_behind er forsiktige kategorier. Skuddstyrke og tobeinthet omtales i teksten, men skaper ingen oppdiktet long_shots- eller finishing-egenskap.",
    "source": "https://www.dagbladet.no/sport/norges-50-beste-fotballspillere/65797347"
  },
  {
    "playerId": "armann_bjornsson",
    "placeId": "brann_stadion",
    "strengths": [
      "pace",
      "strength",
      "heading"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Rask, sterk angrepsspiller som var god i luftdueller.",
    "claim": "Branns historiske profil beskriver Björnsson som rask, sterk og god i luften gjennom Brann-oppholdene. pace, strength og heading føres uten å utlede ferdigheter fra målstatistikk.",
    "source": "https://historie.brann.no/spillere/armann-bjoernsson"
  },

  // 2026-10-20: Lillestrøm (7) og Brann (4), individuelle, epokeavgrensede vurderinger.
  {
    "playerId": "frode_kippe",
    "placeId": "araasen_stadion",
    "strengths": [
      "pace",
      "duels"
    ],
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Hurtig og duellsterk midtstopper, slik LSK-trener Tom Nordlie beskrev ham i 2007.",
    "claim": "Lillestrøm-trener Tom Nordlie beskrev 10. september 2007 Frode Kippe som «veldig hurtig og duellsterk». Dette gir direkte, samtidig trenerbelegg for pace og duels, ikke heading eller pasningsferdigheter utledet av posisjonen.",
    "source": "https://www.aftenposten.no/sport/fotball/i/jdOy3q/ber-kippe-vurdere-landslags-nei"
  },
  {
    "playerId": "mathis_bolly",
    "placeId": "araasen_stadion",
    "strengths": [
      "pace"
    ],
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Ekstremt hurtig angrepsspiller; farten fremheves av LSKs sportssjef.",
    "claim": "Lillestrøms sportssjef Simon Mesfin omtalte ved returen i september 2023 Bollys «ekstreme hurtighet» og hans tidligere LSK-periode. Det belegger pace, men gir ikke grunnlag for avslutnings- eller dribleferdigheter fra treningshøydepunkter.",
    "source": "https://www.lsk.no/nyheter/mathis-bolly-har-glitret-pa-trening-signerte-lsk-avtale-ut-sesongen"
  },
  {
    "playerId": "robert_koren",
    "placeId": "araasen_stadion",
    "strengths": [
      "flair"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Kreativ og uforutsigbar midtbanespiller i Lillestrøm-perioden.",
    "claim": "Aftenpostens overgangsvurdering fra februar 2004 beskriver Robert Koren ved starten av LSK-oppholdet som «en kreativ og spennende midtbanemann». Dette støtter kreativ utfoldelse (flair); kilden dokumenterer ikke presist hvilken pasningstype eller avslutningsferdighet han var best på.",
    "source": "https://www.aftenposten.no/norge/i/RGM2x/lsk-er-overgangsvinneren"
  },
  {
    "playerId": "michael_mifsud",
    "placeId": "araasen_stadion",
    "strengths": [
      "pace",
      "strength",
      "finishing"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Lynrask og fysisk sterk Lillestrøm-spiss som også ble beskrevet som god foran mål; farten er dokumentert i Coventry-perioden.",
    "claim": "Dagbladet beskrev i 2014 Mifsud under LSK-perioden 2005–2007 som lynrask, fysisk sterk og god foran mål, hvilket støtter pace, strength og finishing. Den eldre Coventry-kilden bekrefter fart i en annen periode og gir ikke grunnlag for LSK-ratinger.",
    "source": "https://skybluearchive.com/player/michael-mifsud/",
    "supportingSources": [
      "https://www.dagbladet.no/sport/dette-hurtigtoget-er-forrens-storste-bekymring-for-motet-med-malta/60966175"
    ]
  },
  {
    "playerId": "uwe_rosler",
    "placeId": "araasen_stadion",
    "strengths": [
      "heading",
      "finishing"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Kraftfull spisstype med dokumentert luftstyrke og gode avslutninger fra Manchester City-perioden.",
    "claim": "Manchester Citys historiske spillerportrett beskriver Uwe Rösler som en typisk nummer ni som var «great in the air» og «a great finisher». Dette gir individuelt belegg for heading og finishing, men den omtalte perioden er 1990-tallet i City, før Lillestrøm-oppholdet.",
    "source": "https://www.mancity.com/features/uwerosler/"
  },
  {
    "playerId": "hei_ar_helguson",
    "placeId": "araasen_stadion",
    "strengths": [
      "heading"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Luftsterk spiss; hodespillet dokumentert i senere Premier League-periode.",
    "claim": "The Guardian 20. august 2006 gjengir at Manchester United vurderte Heiðar Helguson og Brian McBride som Fulhams konkrete lufttrussel. Dette er et spillerrettet belegg for hodespill hos Helguson, men gjelder Fulham-perioden og ikke direkte en enkelt LSK-kamp.",
    "source": "https://www.theguardian.com/football/2006/aug/20/newsstory.sport7"
  },
  {
    "playerId": "anthony_ujah",
    "placeId": "araasen_stadion",
    "strengths": [
      "pace",
      "strength",
      "heading",
      "work_rate"
    ],
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Rask, kraftfull og hodeduellsterk spiss med høy arbeidsinnsats.",
    "claim": "Werder Bremens sportsledelse beskrev ved signeringen 5. mai 2015 Ujah som «schneller», med «viel Wucht», «sehr fleißig» og «sehr kopfballstark». Direkte speidervurdering dokumenterer pace, strength, work_rate og heading. Siden kilden er fire år etter LSK-overgangen i 2011, gis ingen epokespesifikke tall.",
    "source": "https://www.werder.de/news/maenner/2014-2015/ujah-pm"
  },
  {
    "playerId": "robbie_winters",
    "placeId": "brann_stadion",
    "strengths": [
      "work_rate",
      "final_pass"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Hardtarbeidende, bevegelig angrepsspiller som ofte spilte frem lagkamerater.",
    "claim": "Bergens Tidendes historiske gjennomgang fra januar 2016 beskriver Winters som intelligent og «hardtarbeidende», sjelden stillestående og en angriper som ofte satte opp lagkameratene. Dette støtter work_rate og final_pass, men målstatistikken benyttes ikke som bevis for finishing.",
    "source": "https://www.bt.no/nyheter/brif/i/9qoR5/her-er-listen-over-branns-stoerste-maalsniker"
  },
  {
    "playerId": "paul_scharner",
    "placeId": "brann_stadion",
    "strengths": [
      "heading",
      "composure"
    ],
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Luftsterk og balltrygg midtstopper i Brann, vurdert direkte av Mons Ivar Mjelde.",
    "claim": "Brann-trener Mons Ivar Mjelde om Scharners stopperprestasjon 26. august 2005: «konge i luften» og «trygg med ballen». Dette underbygger heading og ro med ball (composure), men ikke automatisk pasningsrekkevidde eller hurtighet.",
    "source": "https://www.aftenbladet.no/sport/i/Rx3JQ8/har-funnet-midt-stopperen"
  },
  {
    "playerId": "rodolph_austin",
    "placeId": "brann_stadion",
    "strengths": [
      "strength",
      "jumping",
      "pace",
      "simple_passing"
    ],
    "evidenceKind": "direct_appraisal",
    "playingStyle": "Fysisk sterk, spenstig og hurtig midtbanespiller med få feilpasninger.",
    "claim": "Brann-trener Mons Ivar Mjelde vurderte i september 2008 Rodolph Austin som «sterk, spenstig og hurtig» og fremhevet at han slo få feilpasninger. Samtidig trenervurdering begrunner strength, jumping, pace og simple_passing. Ingen taklings- eller aggresjonstoken utledes fra senere røde kort.",
    "source": "https://www.bt.no/sport/i/JoJMyR/jeg-er-en-kriger"
  },
  {
    "playerId": "claus_lundekvam",
    "placeId": "brann_stadion",
    "strengths": [
      "composure",
      "first_touch"
    ],
    "evidenceKind": "historical_appraisal",
    "playingStyle": "Balltrygg midtstopper med ro dokumentert fra Southampton og slepen teknikk fra Brann-perioden.",
    "claim": "Branns historiske profil omtaler slepen teknikk som Lundekvams særpreg i Brann-perioden 1993–1996, forsiktig representert ved first_touch. En separat historisk vurdering fra Southampton-karrieren fremhever roen med ballen, composure. Ulike perioder blandes ikke til en numerisk rating.",
    "source": "https://materazzia.blogspot.com/2011/01/",
    "supportingSources": [
      "https://historie.brann.no/spillere/claus-lundekvam"
    ]
  },

  // Further source-verified 2026 batch: four Glimt and two Viking individual styles.
  {
    "playerId": "hakon_evjen",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "flair",
      "determination"
    ],
    "claim": "Bodø/Glimts retrospektiv fra januar 2024 omtaler Evjens 2019-uttrykk som «lekende teknikk», mens klubbens spillerutvikler i september 2019 fremhevet hans «drive og en passion som kanskje er høyere enn gjennomsnittet». Dette belegger kreativ, leken ballbehandling og sterk personlig drivkraft i Glimt-perioden, ikke konkrete pasnings-/avslutningsratings avledet fra scoringer.",
    "source": "https://www.glimt.no/nyheter/hakon-er-hjemme-igjen--det-her-eller-ingenting",
    "supportingSources": [
      "https://www.glimt.no/nyheter/uten-cato-ville-jeg-ikke-vaert-her"
    ]
  },
  {
    "playerId": "nino_zugelj",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "pace",
      "dribbling",
      "simple_passing"
    ],
    "claim": "I Glimts presentasjon 1. august 2022 beskrives Žugelj som «en rask spiller» og han sier selv: «Jeg liker å drible, er en god pasningsspiller». Dette er en direkte, men selvrapportert, vurdering ved overgangstidspunktet; registrerer fart, dribling og pasningsspill uten å anta skuddpresisjon bare fordi spilleren liker å skyte.",
    "source": "https://www.glimt.no/nyheter/nino-zugelj-klar-for-glimt"
  },
  {
    "playerId": "kasper_junker",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "pace"
    ],
    "claim": "Glimt-trener Kjetil Knutsen beskriver forskjellen mellom Erik Botheim og Kasper Junker i en analyse av overgangssommeren 2021: «Han har ikke helt den farten Junker har» om Botheim. Det er en eksplisitt individuell trenerkomparasjon som belegger Junkers hurtighet, ikke evigvarende form eller finishing-rating basert på målstatistikk.",
    "source": "https://www.eurosport.no/fotball/eliteserien/2020/det-store-glimt-sporsmalet-slik-skal-95-malpoeng-erstattes_sto8307901/story.shtml"
  },
  {
    "playerId": "fredrik_sjovold",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "pace",
      "late_runs"
    ],
    "claim": "Fotballskribent Martin Haddows gjennomgang av eliteserielagene i april 2026 omtaler Sjøvold som «a high-energy right-sided defender» som «seperates quickly from opponents with his pace and timing of runs», og beskriver sene løp i høyre korridor. En tidsavgrenset ekstern speidervurdering dokumenterer hurtighet og sene offensive løp, ikke generell styrke, defensiv duellkraft eller et tallnivå.",
    "source": "https://medium.com/@martinhaddow87/-f13fdd781a04"
  },
  {
    "playerId": "peter_ijeh",
    "placeId": "lyse_arena",
    "strengths": [
      "strength",
      "pace",
      "finishing",
      "first_touch"
    ],
    "claim": "Vikings påtroppende spiss Peter Ijeh ble sommeren 2006 vurdert av sin tidligere Malmö-trener Tom Prahl: «Han er veldig kraftfull og en utpreget målscorer. Han har bra teknikk, er sterk og rask». Sitatet underbygger fysikk, fart, målavslutning og teknikk som etablert spillertype, men kommer fra tiden før Viking-overgangen; førstetouch er en konservativ teknisk kategorisering og ingen numerisk ferdighetsverdi.",
    "source": "https://www.dagsavisen.no/nyheter/ijeh-inn-kovacs-ut/7507435"
  },
  {
    "playerId": "toni_kuivasto",
    "placeId": "lyse_arena",
    "strengths": [
      "strength",
      "pace",
      "heading",
      "simple_passing"
    ],
    "claim": "Viking-trener Benny Lennartsson vurderte Toni Kuivasto i februar 2001 som «fysisk sterk, rask og en brukbar pasningslegger når enkle løsninger blir valgt» og «en sterk hodespiller». Dette er en direkte, samtidig treneranalyse fra Viking-perioden med belegg for styrke, fart, heading og enkelt pasningsspill, ikke lederkvaliteter; treneren sier tvert imot at Kuivasto ikke er samme ledertype som forgjengeren Tihinen.",
    "source": "https://www.aftenbladet.no/lokalt/i/a3KBd/viking-en-mellomlanding"
  },
  // Glimt/Viking 2026-10-20: specific retrospective skills from official club, UEFA and press accounts.
  {
    "playerId": "marius_lode",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "simple_passing",
      "passing_range",
      "pace",
      "leadership"
    ],
    "claim": "Ved signeringen for Sarpsborg 08 i juli 2026 oppsummerer Marius Lode sin egen etablerte spillertype som «rolig med ball i beina» og en som liker å «finne de små lukene ute på banen». Sportssjef Hampus Andersson beskriver Lode som «en solid ballspiller som kan tre gjennom ledd», «en trygg og god pasningsspiller som også har bra fart i beina» og med «gode lederegenskaper». Dette dokumenterer pasningssikkerhet, gjennombruddspasninger, fart og lederskap på karrierenivå; vurderingen er fra tiden etter Glimt og ikke en særskilt påstand om 2020-form eller numeriske ratings.",
    "source": "https://www.sarpsborg08.no/nyheter/marius-lode-er-klar-for-sarpsborg-08"
  },
  {
    "playerId": "alfons_sampsted",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "natural_fitness"
    ],
    "claim": "Bodø/Glimts klubbintervju 12. april 2022 beskriver Sampsteds restitusjon etter tøffe kamper: «Islendingen har for vane å ikke slite spesielt lenge med tunge bein etter en kamp». Spillerens egen uttalelse er «jeg er ikke mer sliten enn vanlig etter kamp» etter 90 tøffe minutter. Dette gir et snevert periodebelagt grunnlag for restitusjon/natural_fitness, men ikke hurtighet, innlegg eller ubegrunnet utholdenhetsrating.",
    "source": "https://www.glimt.no/nyheter/alfons-gleder-seg--atmosfaeren-er-fantastisk"
  },
  {
    "playerId": "kasper_hogh",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "hold_up_play",
      "strength"
    ],
    "claim": "UEFAs gjennomgang av Bodø/Glimt før Champions League 2025/26 beskriver Høgh som «A classic No9 with strong hold-up play and a powerful physical presence». Det gir direkte spillerfaglig belegg for oppspillspunkt/ballholding og fysisk styrke i Glimt-perioden; scoringstallene i artikkelen brukes ikke som belegg for finishing eller tallrating.",
    "source": "https://www.uefa.com/uefachampionsleague/news/029d-1ea2e7e3e5d8-c5227ee0ab3c-1000--meet-the-2025-26-champions-league-league-phase-teams/"
  },
  {
    "playerId": "magnus_svensson",
    "placeId": "lyse_arena",
    "strengths": [
      "stamina"
    ],
    "claim": "Aftenpostens historiske omtale av Magnus Svenssons Viking-år kaller ham «Duracell-kaninen» og «midtbaneterrieren», og beskriver en karakteristisk energisk midtbanestil fra 1998-sesongen. Dette gir kildebelegg for vedvarende løpskapasitet (stamina), men ikke dribleferdigheter eller en antatt numerisk presis defensiv rating.",
    "source": "https://www.aftenposten.no/sport/fotball/i/1njMxW/turbo-svensson-mitt-beste-aar-var-i-viking"
  },
  // Bodø/Glimt: recurring goalkeeper abilities described by a teammate in 2025.
  {
    "playerId": "nikita_haikin",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "shot_stopping",
      "distribution"
    ],
    "claim": "I Nettavisens evaluering av Haikins Glimt-prestasjoner i 2025 sier lagkamerat Daniel Bassi: «Han er helt vanvittig på strek, og ekstremt god med beina i tillegg». Lagkameratens gjentatte erfaring fra Glimt-perioden dokumenterer strekredninger og ballferdigheter i oppbyggingen, ikke en numerisk keeperrating.",
    "source": "https://www.nettavisen.no/sport/nikita-haikin-vil-bli-norsk-statsborger-jobber-med-advokater/s/5-95-2625111"
  },
  // Bodø/Glimt and Viking, 2026-10-20: enduring source-based playing styles.
  {
    "playerId": "ulrik_saltnes",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "late_runs",
      "box_presence"
    ],
    "claim": "Fotballanalytiker Tarjei Smågesjø beskriver Saltnes' gjentatte 2020-mønster som indreløper: «når Glimt fikk løftet angrepene sine langt inne på motstanders halvdel plasserte han seg som en spiss»; videre beskrives intelligente løp inn i boksen. Dette er periodedokumentasjon av sene offensive løp og tilstedeværelse i boksen, ikke en tallrating utledet fra målantall.",
    "source": "https://smgesj.substack.com/p/en-intelligent-lper"
  },
  {
    "playerId": "fredrik_andre_bjorkan",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "overlapping_runs",
      "game_reading"
    ],
    "claim": "UEFAs taktiske observatører beskriver Bjørkans gjentatte smarte pasnings- og bevegelsesmønstre mot Ajax i 2024: «Bjørkan constantly broke through the press». UEFAs Tottenham-analyse i 2025 trekker spesifikt frem en «unselfish overlap» som gjør rom for Jens Petter Hauge. Samlet underbygger kampuavhengig taktisk observasjon overlappende løp og spillets forståelse, ikke automatisk drible- eller fartsrating.",
    "source": "https://www.uefa.com/uefaconferenceleague/news/028a-1a3224f4367a-2a968054a13c-1000--swissquote-match-analysis-ajax-and-bodo-glimt-s-dramatic/",
    "supportingSources": [
      "https://www.uefa.com/uefachampionsleague/news/029e-1edad93db147-4fb49a772fee-1000--in-the-zone-how-bodo-glimt-gave-tottenham-a-scare/"
    ]
  },
  {
    "playerId": "albert_gronbaek",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "first_touch",
      "finishing",
      "late_runs"
    ],
    "claim": "NTBs gjennomgang av hele 2023-sesongen beskriver Grønbæks «flotte nærteknikk og presise skuddfot» og at han er «god til å time løpene sine inn i 16-meteren». Dette belegger ballmottak/nærteknikk, avslutningspresisjon og gjentatte sene boksløp, ikke en ferdighetsverdi basert på mål eller en enkelt hendelse.",
    "source": "https://kommunikasjon.ntb.no/pressemelding/18031377/bodoglimt-spiller-albert-gronbaek-til-topps-pa-ntb-borsen?lang=no&publisherId=7"
  },
  {
    "playerId": "sverre_andersen",
    "placeId": "lyse_arena",
    "strengths": [
      "shot_stopping",
      "command_of_area"
    ],
    "claim": "Store norske leksikons særskilte avsnitt «Spillestil» omtaler Sverre Andersen som «en stødig keeper, god både på streken og i feltet». Den historiske vurderingen underbygger redninger på strek og trygghet/feltarbeid, ikke en beregnet refleksverdi eller distribusjonsferdighet.",
    "source": "https://snl.no/Sverre_Andersen"
  },
  {
    "playerId": "bjarte_lunde_aarsheim",
    "placeId": "lyse_arena",
    "strengths": [
      "duels",
      "stamina"
    ],
    "claim": "Vikings historiske portrett av Lunde Aarsheims 2000-sesong beskriver den gjentatte arbeidsmåten: «Han trødde til i duellene. Løp, løp og løp.» Dette er eksplisitt individuelt belegg for duellkraft og løpskapasitet; balltryggheten som også nevnes brukes ikke til å konstruere et mer spesifikt teknikk-token.",
    "source": "https://www.vikingfotball.no/nyheter/for-kampen-odd-viking"
  },
  {
    "playerId": "sondre_bjorshol",
    "placeId": "lyse_arena",
    "strengths": [
      "overlapping_runs"
    ],
    "claim": "Åsane-trener Mons Ivar Mjelde beskrev Bjørshols etablerte offensive backrolle i 2017: «Vi ønsker offensive backer som kommer med i angrep» og «sånne som Sondre får frem sine sterke sider». Dette dokumenterer offensivt løpsmønster fra en tidligere klubbperiode, ikke en uavhengig vurdering av Viking-periodens presisjon eller fart.",
    "source": "https://www.asanefotball.no/nyheter/burde-ha-slatt-fredrikstad"
  },
  // Viking og Bodø/Glimt 2026-10-20: individuelle, periodetydelige kilder.
  {
    "playerId": "svein_kvia",
    "placeId": "lyse_arena",
    "strengths": [
      "simple_passing",
      "game_reading"
    ],
    "claim": "NTBs minneomtale av Svein Kvia, publisert hos Aftenposten 2005, trekker fram som hans varige kjennetegn «gode pasninger, fin teknikk og evnen til å lese spillet». Direkte ferdighetsbelegg for simple_passing og game_reading; uttrykket «fin teknikk» er for generelt til å rettferdiggjøre et ekstra first_touch-token uten mer presis kilde.",
    "source": "https://www.aftenposten.no/sport/fotball/i/AdGLnq/svein-kvia-er-doed"
  },
  {
    "playerId": "mathias_normann",
    "placeId": "aspmyra_stadion",
    "strengths": [
      "vision",
      "chance_creation"
    ],
    "claim": "Avisa Nordlands Freddy Toresen beskriver 17-årige Mathias Normann før 2014-sesongen i en spillerfaglig talentsak: «enormt blikk for spillet» og «voldsomt kreativ». Det begrunner vision og chance_creation i hans tidlige Glimt-profil, ikke senere prestasjonsrating eller defensiv arbeidskapasitet.",
    "source": "https://www.aftenbladet.no/sport/i/aw255E/se-opp-for-disse-talentene"
  },
  // Viking 2026-10-20: kildebelagt avslutningsprofil, historisk karrieretid eksplisitt.
  {
    "playerId": "egil_ostenstad",
    "placeId": "lyse_arena",
    "strengths": [
      "finishing"
    ],
    "claim": "VG-sportens historiske toppspillerliste beskriver Egil Østenstad som en spiller med «et suverent scoringsinstinkt». Formuleringen gjelder hans Southampton-periode etter Viking, og gir bare en karrierebelagt individuell målteft/finishing, ikke særskilt dokumentasjon av Viking-perioden, heading eller numerisk nivå.",
    "source": "https://www.vg.no/spesial/2016/topp100-sport-historisk/"
  },
  // Viking 2026-10-19: kildebaserte, kontrasterende spillertyper.
  {
    "playerId": "erik_nevland",
    "placeId": "lyse_arena",
    "strengths": [
      "work_rate",
      "teamwork",
      "off_ball_runs"
    ],
    "claim": "Viking gjengir Nevlands egen beskrivelse av «drittløpene» han tok for å skape rom for medspillerne, blant annet tunge løp mot første stolpe uten å få ballen. Beskrivelsen gjelder målrettet bevegelse uten ball og lagarbeid, ikke en utledet score ut fra målstatistikk.",
    "source": "https://www.vikingfotball.no/nyheter/tidligere-storscorere-i-ny-podcast--det-a-bomme-pa-sjanser-er-viktig-for-a-utvikle-deg-som-malscorer"
  },
  {
    "playerId": "trygve_johannessen",
    "placeId": "lyse_arena",
    "strengths": [
      "box_finishing"
    ],
    "claim": "Bjarne Berntsen beskrev i Aftenbladet Johannessen og Nevland som «Helt ulike spisstyper» og sa om Trygve: «Han var konge innenfor 16-meteren». Dette er en varig sammenlignende spissvurdering som underbygger avslutninger i boksen, ikke automatisk langskudd fra omtalen av tungt skudd.",
    "source": "https://www.aftenbladet.no/lokalt/i/1V4vJ/klubbens-siste-toppscorer-tror-paa-nevland"
  },
  {
    "playerId": "bjarne_berntsen",
    "placeId": "lyse_arena",
    "strengths": [
      "leadership"
    ],
    "claim": "Vikings historiske artikkel om 1970-tallslaget sier uttrykkelig «Bjarne Berntsen var allerede en lederskikkelse». Det gir belegg for ledende rolle i spillergruppen, uten å slutte fra senere verv som trener/sportsleder.",
    "source": "https://www.vikingfotball.no/nyheter/da-viking-tok-gull-gull-og-gull"
  },
  {
    "playerId": "erik_johannessen",
    "placeId": "lyse_arena",
    "strengths": [
      "shot_stopping"
    ],
    "claim": "Viking omtaler 1970-tallslagets målvakt Erik Johannessen «med de stilige redningene» og lar en tidligere spiller kalle ham «en fantastisk keeper». Den kombinerte historiske vurderingen dokumenterer redningskvalitet, men ikke refleksrating eller ballfordeling.",
    "source": "https://www.vikingfotball.no/nyheter/da-viking-tok-gull-gull-og-gull"
  },
  {
    "playerId": "joe_bell",
    "placeId": "lyse_arena",
    "strengths": [
      "simple_passing",
      "vision",
      "tempo_control"
    ],
    "claim": "Danske Campo gjengir TV 2s fagvurdering av Bells Viking-sesong 2024: «Bell er chefen centralt på banen. Han dirigerer, er pasningssikker» og beskriver ham som kreativ når Viking angriper. Dette dokumenterer pasningssikkerhet, overblikk og styring av spillet, ikke numeriske ferdighetsverdier.",
    "source": "https://campo.dk/2024/12/28/medie-kaarer-norges-bedste-kasseret-broendby-duo-er-med/"
  },
  {
    "playerId": "edvin_austbo",
    "placeId": "lyse_arena",
    "strengths": [
      "dribbling",
      "movement"
    ],
    "claim": "NFF Rogaland gjengir Vikings utviklingssjef Mats Ullerengs konkrete beskrivelse fra 2019: «Edvin kan skape ubalanse hos motstander med bevegelse, dribling og pasning». De to direkte navngitte ferdighetene føres som dribbling og movement. Kilden beskriver ungdomsperioden, ikke en ny vurdering av seniornivået.",
    "source": "https://www.fotball.no/kretser/rogaland/landslagskolen/2019/bli-kjent-med-spillerne-som-skal-pa-talentleir/"
  },
  {
    "playerId": "hannu_tihinen",
    "placeId": "lyse_arena",
    "strengths": [
      "heading"
    ],
    "claim": "Aftenbladets Viking-referat fra juni 2001 sier om stopperduoen Tihinen/Kuivasto: «regjerer totalt i lufta» og beskriver at Tihinen gjentatte ganger header unna. West Ham-omtaler fra samme periode beskriver ham også som dominerende i luften. Bare hodespill/aerialevnen føres; enstaka taklinger brukes ikke som varig styrke.",
    "source": "https://www.aftenbladet.no/lokalt/i/o9KL0/viking-til-topps-vant-3-0"
  },
  {
    playerId: "kenneth_storvik",
    placeId: "lyse_arena",
    strengths: ["dribbling", "one_vs_one"],
    claim: "Viking describes Storvik as a major technician who repeatedly ran defenders ragged during seven seasons at the club.",
    source: "https://www.vikingfotball.no/former-players/storvik-kenneth"
  },
  {
    playerId: "tom_lund",
    placeId: "araasen_stadion",
    strengths: ["vision"],
    claim: "Lillestrøm's memorial profile describes Lund as a player with rare technique and overview; only the directly mappable overview claim is retained as vision.",
    source: "https://www.lsk.no/nyheter/tusen-takk-for-alt-tommy"
  },
  {
    playerId: "alf_kaka_martinsen",
    placeId: "araasen_stadion",
    strengths: ["acceleration"],
    claim: "Store norske leksikon describes Martinsen as known for a change of pace, a low centre of gravity and quick steps that let him accelerate toward goal.",
    source: "https://snl.no/Alf_Martinsen"
  },

  // --- SNL-passet, 26.08.2026 -------------------------------------------------
  // Seks navn fra samme gjennomlesning hører til en EKSISTERENDE P1-arv.
  // `expectedDocumented` i P1_HERITAGES er flyttet tilsvarende: Brann 5 → 8,
  // Viking 4 → 6, Lillestrøm 2 → 3, og `expectedThin` ned med det samme.
  // Nevneren står urørt — det er dekningen som har flyttet seg, ikke arven.
  {
    playerId: "finn_berstad",
    placeId: "brann_stadion",
    strengths: ["first_touch", "finishing", "passing_range", "game_reading", "leadership"],
    claim: "«Berstad var en allsidig spiller, teknisk god og målfarlig med en utmerket pasningsfot. … endte til slutt opp som en taktisk klok back med gode defensive ferdigheter. … han den ubestridte lederen og kapteinen på klubblaget.»",
    source: "https://snl.no/Finn_Berstad"
  },
  {
    playerId: "gunnar_halle",
    placeId: "araasen_stadion",
    strengths: ["work_rate", "tackling"],
    claim: "«Gunnar Halle var en hardtarbeidende og taklingssterk back med gode defensive og offensive kvaliteter.»",
    source: "https://snl.no/Gunnar_Halle"
  },
  {
    playerId: "olav_nilsen",
    placeId: "lyse_arena",
    strengths: ["strength", "finishing", "first_touch", "game_reading", "tackling", "heading"],
    claim: "«Olav Nilsen var en fysisk sterk, målfarlig og teknisk glimrende midtbanespiller med et stort repertoar. I tillegg var han fotballklok, taklingssterk, god på hodet …»",
    source: "https://snl.no/Olav_Nilsen"
  },
  {
    playerId: "sigbjorn_slinning",
    placeId: "lyse_arena",
    strengths: ["work_rate", "pace", "tackling", "determination", "overlapping_runs"],
    claim: "«Slinning var en energisk, hurtig, kompromissløs og taklingssterk spiller med et ukuelig pågangsmot og vinnerinstinkt. … kjent for sine offensive raids og defensive løp langs sidelinjen …»",
    source: "https://snl.no/Sigbj%C3%B8rn_Slinning"
  },
  {
    playerId: "tore_pedersen",
    placeId: "brann_stadion",
    strengths: ["pace", "tackling", "heading", "game_reading", "positioning", "interceptions"],
    claim: "«Tore Pedersens fremste egenskaper var hurtigheten og taklingsevnen. Han var også god med hodet, hadde god spilleforståelse, plasseringsevne og evne til å bryte motstanderens pasningsspill.»",
    source: "https://snl.no/Tore_Pedersen"
  },
  {
    playerId: "trygve_andersen",
    placeId: "brann_stadion",
    strengths: ["strength", "duels", "tackling", "interceptions", "aggression"],
    claim: "«Andersen var en storvokst og robust spiller, duell- og taklingssterk, flink til å gjenvinne ballen og med en pågående spillestil.»",
    source: "https://snl.no/Trygve_Andersen"
  },

  // --- Bjarg source-depth, 10.09.2026 ----------------------------------------
  // Én canonical spiller kan gi dybde i flere klubbpooler når tilknytningene
  // allerede er kildebelagt. Pesen er Brann-P1-profil og samtidig krysskoblet
  // til Bjarg; derfor hører styrkeclaimet hjemme her, ikke i P2.
  {
    playerId: "rolf_birger_pesen_pedersen",
    placeId: "brann_stadion",
    strengths: ["teamwork", "long_shots"],
    claim: "Branns offisielle historie beskriver Pesen som mer lagspiller enn individualist og sier at det harde skuddet hans ble beryktet.",
    source: "https://historie.brann.no/spillere/rolf-birger-pedersen/"
  },
];

export const P1_EXISTING_SUPPLEMENTS = Object.freeze(existingSupplements.map((entry) => Object.freeze({
  ...entry,
  strengths: Object.freeze([...entry.strengths])
})));

const NEW_PLACE_IDS = new Set(P1_HERITAGES.filter((entry) => entry.generation === "new").map((entry) => entry.placeId));
const DOCUMENTED_BY_ID = new Map(P1_NEW_DOCUMENTED.map((entry) => [entry.playerId, entry]));
const PARTIAL_BY_ID = new Map(P1_NEW_PARTIAL.map((entry) => [entry.playerId, entry]));
const EVENT_ONLY_BY_ID = new Map(P1_NEW_EVENT_ONLY.map((entry) => [entry.playerId, entry]));
const EXISTING_SUPPLEMENT_BY_ID = new Map(P1_EXISTING_SUPPLEMENTS.map((entry) => [entry.playerId, entry]));

export function getP1HeritageForPlayer(player) {
  const sourcePlaceIds = Array.isArray(player?.sourcePlaceIds) ? player.sourcePlaceIds : [];
  if (sourcePlaceIds.length !== 1) return null;
  return P1_HERITAGES.find((entry) => entry.placeId === sourcePlaceIds[0]) || null;
}

export function getP1NewSourceRecord(player) {
  const heritage = getP1HeritageForPlayer(player);
  if (!heritage || heritage.generation !== "new") return null;
  const documentedRecord = DOCUMENTED_BY_ID.get(player.id);
  if (documentedRecord) return { status: "DOKUMENTERT", ...documentedRecord };
  const eventRecord = EVENT_ONLY_BY_ID.get(player.id);
  if (eventRecord) return { status: "HENDELSE", ...eventRecord, strengths: [] };
  const partialRecord = PARTIAL_BY_ID.get(player.id);
  if (partialRecord) return { status: "DELVIS", ...partialRecord, strengths: [] };
  return {
    playerId: player.id,
    placeId: heritage.placeId,
    status: "THIN-SOURCE",
    strengths: [],
    claim: "No accepted descriptive individual source was found in this P1 pass.",
    source: null
  };
}

export function applyP1SourceClaimsToPlayer(player) {
  const heritage = getP1HeritageForPlayer(player);
  if (!heritage) return player;
  if (NEW_PLACE_IDS.has(heritage.placeId)) {
    const record = getP1NewSourceRecord(player);
    return { ...player, strengths: [...record.strengths] };
  }
  const supplement = EXISTING_SUPPLEMENT_BY_ID.get(player.id);
  if (supplement && supplement.placeId === heritage.placeId) {
    return { ...player, strengths: [...supplement.strengths] };
  }
  return player;
}

export function applyP1SourceClaims(players) {
  return (Array.isArray(players) ? players : []).map(applyP1SourceClaimsToPlayer);
}

// Backwards-compatible names used while the P1 branch was built audit-first.
export const applyP1NewSourceClaimsToPlayer = applyP1SourceClaimsToPlayer;
export const applyP1NewSourceClaims = applyP1SourceClaims;

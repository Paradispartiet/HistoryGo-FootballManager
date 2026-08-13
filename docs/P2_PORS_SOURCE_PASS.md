# P2 · Pors

Pors er første merge-enhet i P2-katalogpasset for 2. divisjon.

## Canonical nevner

- 63 kildebårne Pors-profiler i klubbhistorikken.
- 58 nye canonical spillerprofiler.
- 5 verifiserte krysskoblinger til eksisterende profiler: Einar Rossbach, Fredrik Nordkvelle, Erik Pedersen, Tor Arne Sannerholt og Christer Fjellstad.
- Klubbmedlemskap materialiseres i `clubAffiliations`; en krysskobling får ikke omskrevet eldre `sourcePlaceIds` bare for å bli medlem av Pors. Dermed forblir den frosne P1-nevneren uendret.

## Kildekontrakt

Primærkilden er Pors' egen klubbhistorie (`https://porsfotball.no/historie`). Utvalget dekker eksplisitt navngitte A-lagsspillere, 1969-opprykkslaget, det ubeseirede opprykkslaget fra 1988 og opprykksstallen fra 2003. Juniornavn uten eksplisitt seniorbelegg importeres ikke.

Spillerposisjon legges bare inn når den kan belegges. Profiler uten belagt posisjon får ingen konstruerte posisjonsdata, individuelle styrker eller posisjonsavledede svakheter. Svakhetsvakten krever derfor null avledede svakheter for uløst posisjon, men fortsatt minst én for alle posisjonsavklarte profiler.

De 58 nye eksklusive Pors-profilene står 58/58 uten dokumenterte ferdighetsclaims. `pors_stadion` er derfor eksplisitt registrert som 100 % `THIN-SOURCE` i representativitetsvakten. Det er en ratchet for kildegjeld, ikke tillatelse til å modellere egenskaper: tallet skal bare kunne synke når individuelle ferdighetskilder faktisk dokumenteres.

## Spillbarhetsgrense

De 63 dokumenterte navnene er én klubbhistorikk, men ikke én automatisk spillbar tropp.

- **16 profiler** har minst én dokumentert naturlig eller brukbar posisjon og inngår i managerens klubbpool, grunntropp, oppstilling, trening og kamp.
- **47 profiler** mangler dokumentert posisjon. De beholdes som canonical historikkposter og kan senere aktiveres uten ny identitet når posisjonsbelegg finnes.
- Stadionbesøket åpner bare den spillbare delmengden. Det konstruerer aldri posisjon, rolle, styrke, svakhet eller taktisk fit for historikkpostene.
- `listClubPoolPlayers` er komplett dokumentert historikk. `listPlayableClubPoolPlayers` er den simuleringsklare delmengden.

## Identitetsavgjørelser

Einar «Jeja» Gundersen og Einar «Jeisen» Gundersen er to forskjellige personer og står som permanent gjennomgått navnepar. Pors-sidens «Tore Arne Sannerholt» er verifisert som canonical Tor Arne Sannerholt og krysskobles i stedet for å bli en ny profil.

## Regresjonskrav

Pors-passet skal ikke endre P1: `audit-p1-source-claims.mjs` skal fortsatt treffe 936/936 eksklusive profiler og den låste statusfordelingen 45 DOKUMENTERT · 15 DELVIS · 876 THIN-SOURCE.

Full CI skal i tillegg bevise at klubbpoolmotoren, save-reparasjonen, troppsflaten og nettleserflyten fortsatt er grønne når bare de 16 kildeposisjonerte Pors-profilene er valgbare.

# Rollebasert førstelagsstab v1

Før seriestart trenger klubben **1 assistenttrener, 3 trenere, 1 fysio og 1 keepertrener**. Dette følger den eksisterende kontrakten i `data/hgFootball/staffRoles.json` og erstatter den gamle tellingen av tre vilkårlige stabsmedlemmer.

Modellen bruker eksisterende stabsdata og coach-context; den er ikke en parallell stabsmotor. `hiredStaffIds` i `hgfm.teamMerits.v1` forblir lagringens sannhetskilde. `football-staff-roster.js` fordeler de engasjerte personene deterministisk på kompatible rolleplasser, og samme person kan ikke fylle to plasser. De tildelte rollene sendes videre til eksisterende coach-context.

Ansettelsesgrensen vurderer den **effektive tildelte førstelagsrollen**, ikke bare kildens `staffType`. En person som dokumentert er assistenttrener, men også har `canBeHiredAs: ["coach"]`, kan derfor fylle én av de tre trenerplassene når rosterfordelingen velger det. Kildens rolle omskrives aldri; dette er bare aktiv bruk i managerens 1+3+1+1-stab.

Ukurerte klubber får seks tydelig merkede plassholderprofiler som et nøytralt spillbarhetsgulv. Plassholderne har `isPlaceholder` og `needsResearch` og er ikke påstander om virkelige personer. History Go-opplåst stab fortsetter å komme fra eksisterende stedskoblinger.

## Klubbspesifikke startersett

`starterClubIds` kan knytte en dokumentert staff-profil til én eller flere etablerte klubber. `selectStarterStaffCandidates(staff, clubId)` bruker et klubbspesifikt sett bare når det alene dekker hele 1+3+1+1-kontrakten. Hvis klubbsettet er ufullstendig, brukes det ikke delvis; systemet faller tilbake til det generiske placeholder-gulvet. Dermed blir onboarding aldri avhengig av halvkuraterte data.

Rosenborg er første kuraterte klubbsett. A-lagsstaben er hentet fra Rosenborg Ballklubs offisielle oversikt, oppdatert 11.08.2026: `https://www.rbk.no/om-rbk/ansatte/a-lag-menn`. Alexander Lund Hansens keepertrenerprofil har i tillegg klubbens egen profilsak som provenance. Dataene bruker bare dokumenterte roller; taktiske ekspertiser legges ikke til uten særskilt kilde.

`Kontor → Klubbdrift → Stab & drift` viser rolledekningen som `1/1`, `3/3`, `1/1` og `1/1`. Før-sesongsgaten blir først komplett når alle fire rollefamiliene er dekket; seks personer med feil rollefordeling kan derfor ikke passere. Administrasjon bruker samme seks-personers krav, slik at «Stab engasjert» aldri kan vise `6/1`.

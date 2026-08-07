# Rollebasert førstelagsstab v1

Før seriestart trenger klubben **1 assistenttrener, 3 trenere, 1 fysio og 1 keepertrener**. Dette følger den eksisterende kontrakten i `data/hgFootball/staffRoles.json` og erstatter den gamle tellingen av tre vilkårlige stabsmedlemmer.

Modellen bruker eksisterende stabsdata og coach-context; den er ikke en parallell stabsmotor. `hiredStaffIds` i `hgfm.teamMerits.v1` forblir lagringens sannhetskilde. `football-staff-roster.js` fordeler de engasjerte personene deterministisk på kompatible rolleplasser, og samme person kan ikke fylle to plasser. De tildelte rollene sendes videre til eksisterende coach-context.

Nye saves får seks tydelig merkede plassholderprofiler som et nøytralt spillbarhetsgulv. Plassholderne har `isPlaceholder` og `needsResearch` og er ikke påstander om virkelige personer. History Go-opplåst stab fortsetter å komme fra eksisterende stedskoblinger.

`Kontor → Klubbdrift → Stab & drift` viser rolledekningen som `1/1`, `3/3`, `1/1` og `1/1`. Før-sesongsgaten blir først komplett når alle fire rollefamiliene er dekket; seks personer med feil rollefordeling kan derfor ikke passere.

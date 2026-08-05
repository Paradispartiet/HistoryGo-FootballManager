# Kampdag og laguttak som hovedscener v1

Denne designrunden gjør de to viktigste sportslige arbeidsflatene tydeligere uten å endre kamp-, fit-, trening-, lagrings- eller History Go-motorene.

## Laguttak

- Banen får større fysisk plass og tydeligere ledd.
- Spillerbrikkene viser lesbare, kompakte navn og kvalitativ rollebruk i stedet for en dominerende poengsum.
- Sidepanelet bruker språk som «svært godt samsvar», «godt samsvar», «usikkert samsvar» og «feil rolle».
- Den underliggende `matchScore` beholdes i motoren, men er ikke lenger den visuelle fasiten.

## Kampdag

- Førkampflaten bygges som en kampkommando med hjemmelag, motstander, avsparkstatus, kampplan, trening og siste signal.
- Readiness-modulen fra Manager grunnflyt v1 er fortsatt eneste sannhet for om avspark er mulig.
- Blokkeringer vises som konkrete neste krav med direkte veier til riktig arbeidsflate.
- Den eksisterende livekampen, kampklokka, kampbildet og managergrepene beholdes.

## Testkontrakt

Nettlesertestene låser nå visuell hierarki, kvalitativ rollebruk, større bane, mobil laguttak, mobil kampdag og en aktiv kampflate. Ingen ny spillmotor eller avhengighet er lagt til.

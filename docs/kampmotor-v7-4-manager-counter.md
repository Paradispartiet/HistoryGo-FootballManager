# Kampmotor v7.4 – taktiske motgrep mot kjente utspill

Når motstanderen har gjennomført et pressbrudd som er synlig i den ferdig
avspilte kampfasen, får manageren et taktisk valg: prioritere én av de
eksplisitt forfatterdefinerte og bekreftede angrepsrutene.

Kommandoen finnes bak «Motgrep mot utspill» i kampvisningen, ved siden av
planbytter og innbytter. Det er maksimalt én kommando per avspilt fase.

Motgrepet flytter en eksisterende sikringsjustering fra en annen rute
til prioritert rute. Overføringen er nullsum og begrenses til 0,017;
vanlig cap 0,03 gjelder fortsatt. Motstanderen revurderer deretter de
kjente rutene etter v7.2-policyen. På denne måten kan managerens valg
faktisk føre til ny angrepsrute og endret eksisterende sikringsutfall,
uten å legge på en ny xG-effekt eller generere ekstra sjanser.

Krav: `causalManagerPressCounterVersion: 1` for nye kamper, v7.2/7.3
evidensflagg, ferdig avspilt periode, én tidligere gjennomført
pressutvei, minst to verifiserte ruter og kjent spillerdekning.
Ukjente data, uavspilte perioder, pressgjenvinninger og eksplisitte
enkeltutveier gir ingen kommando. Tidligere lagringer beholder
uendret spillmodell.

`npm run sim:v7-4-manager-counter` tester valgbetingelser,
sikrings-nullsum, ekte rutebytte, deterministisk lagring, uendret
pressterksel og terminal xG, samt fallback ved uavklarte data.

Modellen hevder ikke å ha historisk spillertracking, fri KI eller
selvstendig motstanderspeiding.

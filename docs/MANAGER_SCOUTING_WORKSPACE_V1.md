# Speiding workspace v1

Speiding er et eget hovedområde med to flater:

## Min spillerpool

Første flate viser spillerne History Go-samlingen og starttilgangen gjør valgbare. Den bruker samme canonical `squadPlayerIds` som **Lag → Tropp**:

```text
History Go-samling → Min spillerpool → valgt tropp
```

Spillere kan undersøkes i den delte spillerprofilen uten at profilklikk endrer troppen. **Velg inn** og **Ta ut** er eksplisitte handlinger. En spiller som tas ut blir liggende i Min spillerpool.

Tilgangen følger eksisterende regler:

- klubbspillere kommer fra `player_candidate`-opplåsinger eller klubbens tilgjengelige pool;
- nasjonalarenaer gir ikke klubbtilgang;
- quiz-porten gjelder når en ekte History Go-læringslogg finnes;
- lokal starttropp og klubbens grunntropp bevarer spillbarhetsgulvet.

Ingen egen recruitment-, transfer- eller economy-localStorage opprettes.

## Andre klubber

Andre klubber viser dokumenterte klubbtilknytninger fra canonical spillerdata. Dette er mulige og historiske klubbforbindelser, ikke en påstand om klubbens live 2026-stall.

Klubbtilknytning alene flytter ingen spiller til Min spillerpool eller troppen. History Go- og klubbtilgangen er fortsatt porten.

## Mobil og tilgjengelighet

Listene fungerer ved 390 px uten sideveis dokument-overflow. Interaktive elementer er tastaturbetjente, drawer/dialog har navn og fokusmarkering, og browserpakken kjører WCAG 2 A/AA.

# Kontrakter og klubbøkonomi v1

> **Produktstatus 08.08.2026:** Denne filen dokumenterer en eksisterende teknisk v1-implementasjon, men fiktive spillerkontrakter, lønnsenheter og kontraktsutløp er **ikke lenger canonical produktretning**. Spillermaterialet består blant annet av historiske spillere uten nødvendigvis definert alder eller én felles tidskontekst. `PRODUCT_PRINCIPLES_CLUB_SIMULATION.md` er overordnet: økonomi skal bare brukes når den lærer brukeren hvordan faktisk klubbdrift fungerer, og History Go skal ikke underordnes et kunstig kjøp/salg-/kontraktssystem. Runtime-koden er ikke fjernet av denne dokumentasjonsendringen.

## Formål

HG Football Manager trenger økonomiske konsekvenser for at rekruttering og troppsbygging skal være managerbeslutninger, men spillet skal ikke dikte virkelige lønninger, overgangssummer eller kontrakter om ekte personer og klubber.

V1 innfører derfor en tydelig **HGFM-spilløkonomi**. Tallene er balanseverdier i save-spillet og presenteres aldri som historiske eller faktiske økonomidata.

## Canonical state

Økonomien bor i det eksisterende managerobjektet:

```text
hgfm.teamMerits.v1
```

under:

```json
{
  "clubEconomy": {
    "version": 1,
    "balance": 80,
    "wageBudget": 54,
    "lastSettledSeason": 1,
    "contracts": {},
    "ledger": []
  }
}
```

Mode Isolation speiler samme `teamMerits` inn i league-snapshotet. Det finnes ingen egen economy-/contract-localStorage og ingen parallell troppsstate.

## Nivårammer

V1 bruker standardiserte, transparente HGFM-rammer per serienivå:

| Nivå | Startmidler | Lønnsramme | Ny sesong |
| --- | ---: | ---: | ---: |
| Eliteserien | 100 | 60 | +40 |
| OBOS-ligaen | 80 | 54 | +30 |
| 2. divisjon | 60 | 48 | +24 |

Dette er **ikke kroner** og **ikke virkelige klubbbudsjetter**. De er spillenheter som gjør nivåforskjeller og prioriteringer lesbare.

## Grunntropp

Den eksisterende starttroppen beholdes som spillbarhetsgulv. Hver spiller i grunntroppen bruker to lønnsenheter innenfor klubbens ramme, men får ikke individuell utløpskontrakt i v1.

Dette unngår at økonomilaget bryter den eksisterende troppsmodellen der starttroppen alltid skal være tilgjengelig.

## Ny rekruttering

En kvalifisert History Go-kandidat kan fortsatt bare hentes gjennom **Speiding → Rekrutterbare**.

Standardavtalen er:

- 10 klubbmidler ved signering;
- 3 lønnsenheter;
- 2 sesonger.

`Hent til troppen` blokkeres **før** recruitment-state endres hvis klubben mangler signeringsmidler eller lønnsrom. Økonomi skaper aldri kandidattilgang og omgår aldri History Go-/quiz-portene.

Ved godkjent handling skjer kandidat → tropp og kontraktsregistrering i samme managerhandling.

## Fornyelse

Når én sesong gjenstår kan manageren velge **Forny**.

Standardfornyelsen er:

- 6 klubbmidler;
- 3 lønnsenheter;
- ny varighet på 2 sesonger.

Fornyelse blokkeres ved manglende klubbmidler eller lønnsrom.

## Utløp og release

Ved faktisk ligasesongskifte:

1. klubbens nivåbaserte sesongramme legges til;
2. rekrutteringsavtaler teller ned én sesong;
3. avtaler som når null utløper;
4. spilleren fjernes fra `recruitedPlayerIds` og dermed fra klubbens spillbare tropp.

Manageren kan også velge **Frigi**. Det avslutter avtalen og frigjør lønnsrom, uten refusjon av tidligere signeringskostnad.

## Eksisterende saves

Spillere som allerede ligger i `recruitedPlayerIds` når økonomi v1 introduseres får en kompatibilitetsavtale:

- 2 sesonger;
- 0 ny signeringskostnad;
- 0 retrospektiv lønnsbelastning.

Dette hindrer at en gammel save blir økonomisk ødelagt av en ny funksjon. Ved neste fornyelse går spilleren over på ordinær HGFM-standardavtale.

## UI

Økonomien ligger under:

```text
Kontor → Klubbdrift → Stab & drift → Økonomi & kontrakter
```

Flaten viser:

- klubbmidler;
- brukt/total lønnsramme;
- ledig lønnsrom;
- grunntroppens faste ramme;
- aktive rekrutteringsavtaler;
- sesonger igjen;
- lønnsenheter;
- Forny / Frigi.

Dette skaper ikke en ny hovedfane eller en ny `Neste`-funksjon. `Forslag til neste steg` forblir den eneste progresjonsveiviseren.

## Bevisste grenser i v1

V1 har ikke:

- virkelige eller historiske lønninger;
- virkelige eller historiske overgangssummer;
- markedsverdi;
- skjult Overall som prisdriver;
- individuelle lønnsforhandlinger;
- agenter;
- budrunder mellom klubber;
- salgssummer;
- sponsoravtaler;
- detaljert resultat-/balanseregnskap.

Dette kan utvides senere hvis systemet får egne, ærlige spillmodeller. V1 skal først etablere den grunnleggende managerlogikken: **du kan ikke hente og beholde spillere uten økonomiske valg.**

## Regresjonskrav

Permanente tester skal låse at:

- korrekt tier-preset brukes;
- 15-spillers grunntropp belaster lønnsrammen uten utløpskontrakter;
- signering trekker midler og lønnsrom;
- utilstrekkelig klubbkasse/lønnsramme blokkerer rekruttering før troppsstate endres;
- fornyelse koster midler og setter ny varighet;
- utløp fjerner rekruttert spiller;
- release fjerner spilleren og frigjør lønnsrom;
- eldre saves migreres uten retroaktiv kostnad;
- league Mode Isolation-snapshotet får samme economy-state;
- Stab & drift viser økonomien på desktop og mobil uten horisontal sideoverflow.

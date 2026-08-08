# Overgangsmarked v2

> **Produktstatus 08.08.2026:** Denne filen dokumenterer en eksisterende teknisk v2-implementasjon, men et klassisk kjøp/salg-marked er **ikke lenger canonical produktretning**. History Go skal være den autoritative inngangen til historiske spillere, og managerdelen skal lære brukeren å forstå og bruke dem — ikke gjøre dem til tilfeldige markedsobjekter. Se `PRODUCT_PRINCIPLES_CLUB_SIMULATION.md`. Runtime-koden er ikke fjernet av denne dokumentasjonsendringen.

## Formål

Overgangsmarked v2 bygger videre på Rekruttering v1 og Kontrakter og klubbøkonomi v1. Målet er at troppsbygging skal ha en reell utgående side: manageren kan gjøre egne rekrutterte spillere tilgjengelige, motta bud fra andre ligaklubber og velge om klubben skal selge.

Systemet lager ikke en ny spillerpool, en ny økonomimotor eller en ny hovedfane. Det bruker eksisterende `recruitedPlayerIds`, `clubEconomy`, ligasesongen og klubbene som allerede deltar i serien.

## Canonical state

Markedet bor i samme eksisterende managerstate:

```text
hgfm.teamMerits.v1
```

under:

```json
{
  "transferMarket": {
    "version": 2,
    "listedPlayerIds": [],
    "offers": {},
    "closedOfferKeys": [],
    "history": [],
    "lastSeenWindowKey": "s1:opening"
  }
}
```

Det opprettes ingen `hgfm.transfer.*`- eller `hgfm.market.*`-localStorage. Mode Isolation speiler fortsatt hele `teamMerits` som ett canonical save-objekt.

## Overgangsvinduer

V2 bruker to tydelige **HGFM-spillvinduer**, utledet fra den eksisterende ligasesongen:

- åpningsvindu: runde 1–4;
- midtsesongvindu: tre runder fra starten av andre halvdel av serien;
- øvrige runder: vinduet er stengt.

For en 30-runders serie betyr det runde 1–4 og 16–18. For andre serieformater beregnes midtsesongvinduet fra faktisk antall runder.

Dette er en spillmekanisk tidsstruktur, ikke en påstand om virkelige norske overgangsdatoer.

Både ny rekruttering og spillersalg blokkeres utenfor et åpent HGFM-vindu.

## Hvem kan selges

V2 beskytter den eksisterende starttroppen som **spillbarhetsgulv**. Bare spillere manageren selv har hentet og som derfor finnes i både:

- `recruitedPlayerIds`;
- `clubEconomy.contracts`;

kan legges ut for salg.

Dette er bevisst. Starttroppen kan senere få en egen, trygg kontrakts-/avgangsmodell, men Overgangsmarked v2 skal ikke rive bort spillbarhetsgulvet eller lage skjulte unntak i dagens troppsmodell.

## Listing og bud

Når manageren trykker **Gjør tilgjengelig** i et åpent vindu:

1. spilleren legges i `listedPlayerIds`;
2. markedet velger deterministisk en annen klubb fra den faktiske ligasesongen;
3. klubben sender ett HGFM-spillbud i dette vinduet;
4. manageren kan godta eller avslå.

Et avslått bud genereres ikke på nytt i samme vindu. Spilleren kan tas av markedet. Ved et senere vindu kan ny interesse oppstå.

## Budbeløp

Budbeløpet bruker bare den eksisterende HGFM-avtalen:

```text
8 + (sesonger igjen × 2) + lønnsenheter
```

Eksempel: en ordinær 2-sesongers rekrutteringsavtale med 3 lønnsenheter gir et bud på 15 klubbmidler.

Dette er **HGFM-spillverdier**. Budene er ikke historiske overgangssummer, markedsverdier eller estimater av hva ekte personer er eller var verdt. Motoren bruker ingen skjult Overall, ingen `classHeight`, ingen alder og ingen oppdiktet markedspris.

## Godta bud

Et godkjent salg er én atomisk managerhandling:

- spilleren fjernes fra `recruitedPlayerIds`;
- spillerens HGFM-kontrakt fjernes;
- lønnsrommet blir ledig gjennom eksisterende økonomisammendrag;
- budbeløpet legges til `clubEconomy.balance`;
- økonomiledgeren får `transfer_sale`;
- transferhistorikken får `sold`;
- spilleren fjernes fra listing og aktive bud.

Dermed kan ikke en spiller bli solgt økonomisk og samtidig ligge igjen som spillbar troppsspiller.

## Avslå bud

Ved avslag:

- spilleren blir i troppen;
- kontrakten og klubbøkonomien endres ikke;
- budet fjernes;
- samme spiller får ikke et nytt automatisk bud i samme vindu;
- avslaget lagres i transferhistorikken.

## UI

Markedet ligger under den eksisterende managerflaten:

```text
Kontor → Klubbdrift → Stab & drift → Økonomi & kontrakter → Overgangsmarked
```

Flaten viser:

- om vinduet er åpent eller stengt;
- når neste vindu åpner;
- rekrutterte spillere som kan selges;
- kontraktslengde og lønnsbelastning;
- listingstatus;
- klubb som byr;
- HGFM-budbeløp;
- `Godta bud`, `Avslå` og `Ta av markedet`.

Det opprettes ingen ny hovedfane og ingen ny `Neste`- eller `Fortsett`-veiviser. `Forslag til neste steg` forblir den ene autoritative progresjonsveiviseren.

## Avgrensning

Overgangsmarked v2 har ikke:

- faktiske/historiske overgangsdatoer;
- historiske overgangssummer;
- markedsverdier;
- individuell prisforhandling;
- motbud;
- agentforhandlinger;
- salg av starttroppen;
- AI-klubbers fullstendige troppsøkonomi;
- kjøp av ikke-History-Go-kvalifiserte spillere.

Dette er første reelle toveis overgangslag: **History Go-kandidat → økonomisk signering → kontrakt → mulig listing → bud → salg**.

## Permanente porter

Regresjoner skal bevise at:

- åpnings-, midtsesong- og stengt vindu beregnes riktig;
- ny rekruttering blokkeres når vinduet er stengt;
- starttroppen ikke kan selges;
- listing skaper et bud fra en annen ligaklubb;
- budbeløpet er kontraktsbasert og uten Overall/classHeight;
- avslag ikke skaper nytt bud i samme vindu;
- salg fjerner spiller og kontrakt og øker klubbkassen i samme handling;
- Mode Isolation får samme `teamMerits`;
- flaten fungerer på 390 px uten global horisontal overflow.

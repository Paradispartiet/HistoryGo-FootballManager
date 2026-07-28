# Svake sider

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Det står ikke i motsetning til at alle spillere har svake sider — det er
**grunnen til at de har noe å si**.

Haaland var lenge svak med ryggen mot mål. Hoftun spilte ikke laget opp bakfra.
Thorstvedt var utrygg med ballen i beina, som alle keepere i hans generasjon.
Det gjorde dem ikke dårligere. Det gjorde at de måtte brukes **riktig**.

En svak side er altså ikke en dom over spilleren. Den er svaret på spørsmålet
*«hvorfor koster det noe å bruke ham her?»* — og dermed selve begrunnelsen for
at posisjon, rolle og taktikk betyr mer enn `overall`. Uten dem er `poorFits`
bare en påstand; med dem er den forklart.

## Tre regler holder dette unna et ratingspill

1. **En svak side trekker aldri fra.** Ikke fra `overall`, ikke fra
   `matchScore`. Fit-motoren leser dem ikke engang. Det eneste tallet de kan
   produsere er en **bonus**, og bare når manageren har gjort noe.
2. **De er identifisert, ikke oppfunnet.** Svakhetene utledes av data som
   allerede lå i spillerfila: kravene rollen og posisjonen stiller
   (`role.requires`, `positionDemands`), minus spillerens egne `strengths`.
   Ingen spiller får en påstand som ikke allerede sto der.
3. **Trening åpner dører, den hever ikke klasse.** En spiller som har jobbet med
   førstetouchen kan brukes i roller som krever den. Klassen hans er urørt.

## Hvordan de identifiseres

```
KRAVENE HAN MØTER                        det han har
  posisjonens krav      (vekt 3)   ──┐
  rollenes requires     (vekt 2)   ──┼──  MINUS  strengths  =  SVAKE SIDER
  … roller han foretrekker (vekt 1)──┘          (og beslektede)
```

Rekkevidden er hans **egne** posisjoner (naturlige + brukbare) — ikke
`poorFits`. Første utgave rangerte over `poorFits` også, og da fikk keeperen
«løper lite uten ball» som trenbar svakhet, fordi spiss lå der. En svakhet i en
posisjon han uansett ikke skal spille er støy, ikke en dør verdt å åpne.

`coveredBy` fanger at vokabularet overlapper: Hegerberg har `box_finishing`, så
det ville vært feil å melde henne svak på `finishing`. Keeperen har
`shot_stopping`, så «treg på refleksredningene» er ikke hans problem.

Resultatet, målt over alle 56 spillerne: **ingen står uten svake sider**, 25
ulike svakheter er i bruk, og den vanligste dekker under halvparten av troppen.
Alt dette er låst av `sim:player-weaknesses`, ikke antatt.

Eksempler ut av ekte data:

| Spiller | Svake sider | Hva de stenger |
|---|---|---|
| Erling Haaland | ustø første touch · svak med ryggen mot mål · spiller lite med de rundt seg | Møtende spiss, Falsk nier, Targetspiss |
| Erik Hoftun | har ikke den lange pasningen · stresser under press · leser ikke faren tidlig nok | Ballspillende stopper, Libero, Regista |
| Erik Thorstvedt | utrygg med ballen i beina · ustø første touch · har ikke den lange pasningen | Sweeperkeeper |

## Å trene dem

**Svakhetstrening** er et spor i den individuelle treningen
(`docs/trening.md`, steg 4). Du velger én spiller og én av *hans* svake sider —
du kan ikke trene bort noe han ikke sliter med, og et avvist valg sier hvorfor.

Takten avhenger av hvor trenbar egenskapen er, ikke av spilleren:

| Vanskelighet | Per uke | Uker til «merkbart bedre» | Eksempler |
|---|---|---|---|
| lett | 9 | 6 | posisjonering, innlegg, sene løp |
| moderat | 6 | 9 | førstetouch, hodespill, utholdenhet |
| hard | 3 | 17 | akselerasjon, spilleforståelse, reflekser |

Fysikk og instinkt flytter seg sakte; posisjonering er rent trenerarbeid. Det er
truere til fotballen enn en jevn kurve ville vært, og det gjør valget ekte: en
hard svakhet koster deg en halv sesong med individuell oppfølging.

Stab øker takten. Sporet koster litt beinarbeid (belastning +2), så
svakhetstrening er ikke gratis.

## Uttellingen kommer først når du bruker ham der

Dette er hele poenget, og regelen er streng med vilje:

> Arbeidet betaler **bare** når spilleren står i en rolle som krever nettopp det
> han har trent på.

Trener du Haalands førstetouch og lar ham stå som ren boksspiss, får du
ingenting — og flata sier det rett ut: *«1 ferdig arbeid ligger ubrukt — sett
spilleren i en rolle som krever det.»* Ubrukt arbeid skjules ikke.

Bonusen er liten og klampet (maks **+4** på kampstyrken, på linje med
lagklasse- og fortrolighetsbonusen). Den avgjør aldri en kamp. Den belønner at
manageren gjorde et stykke arbeid **og deretter brukte det**.

## Hvor du ser det

- **Trening → Svake sider** viser hele troppen: hver spillers tre svake sider,
  hvor trenbare de er, framgangen på hver, og hvilke roller de stenger.
- **Trening → Individuell trening** viser dem på kortet der du velger hva
  spilleren skal jobbe med.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:player-weaknesses` | katalogen, at **alle** spillere har svake sider, at identifiseringen aldri motsier spillerdataene, treningstakten, at uttellingen kun kommer ved bruk — og steg 6: at ingenting av dette er et ratingspill |
| `npm run audit:dead-ends` (steg 26) | motoren er ren og leser aldri `overall`, uttellingen er en bonus og aldri et fratrekk, ubrukt arbeid skjules ikke, et avvist valg har en grunn, og flata sier at dette ikke er en dom |
| `npm run sim:individual-training` | svakhetstrening som spor, og **rekkefølge-vakten**: ukesoppgjøret må kjøre før den nye uka settes, ellers forsvinner tildelingene helt stille |

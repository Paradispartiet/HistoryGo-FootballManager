# Manager Legacy Cleanup v1

Pass 7 avslutter redesignløpet ved å fjerne de tidligere FM-lignende systemene som Pass 5 tok ut av live IA, men som fremdeles lå i runtime og save-state.

## Canonical resultat

Følgende er ikke lenger managersystemer i HG Football Manager:

- nivåbaserte fasiliteter (`facilities`);
- fiktiv klubbøkonomi og spillerkontrakter (`clubEconomy`);
- overgangsvinduer, bud og kjøp/salg (`transferMarket`).

History Go eier fortsatt spilleroppdagelsen. En spiller som er gjort tilgjengelig gjennom History Go skal ikke blokkeres av et oppdiktet lønnsbudsjett eller overgangsvindu, og skal ikke forsvinne fordi en fiktiv kontrakt utløper.

## Save-migrering

Migreringen er bevisst liten og idempotent. Den bruker ingen ny lagringsnøkkel og skriver bare tilbake til de to eksisterende canonical beholderne:

- `hgfm.teamMerits.v1`;
- `hgfm.modeSessions.v1`.

Fra `teamMerits` fjernes bare tre felter:

```text
facilities
clubEconomy
transferMarket
```

Alle andre meritter beholdes: rekrutterte spillere, opplåste steder og ekspertiser, engasjert stab, badges, rolle-/formasjonstilvenning, lokal start, kalender-/kamp-/treningsstate og øvrig eksisterende state.

Mode-envelope migreres på samme måte for hver sesjon som har `teamMerits`. Å kjøre migreringen en gang til skal gi `changed: false` og identisk resultat.

## Runtime

Økonomi- og overgangsmodulene lastes ikke lenger av managerskallet. Dermed forsvinner også de skjulte capture-listenerne som tidligere kunne blokkere `[data-recruit-player]` selv om økonomi- og markedsflatene var skjult.

De gamle økonomi-, kontrakt- og overgangsmotorene og deres UI/CSS er slettet permanent.

### Endelig fasilitetsopprydding

De midlertidige kompatibilitetsfasadene for fasiliteter er nå fysisk slettet. `src/app.js`, trening og spillercondition har ingen fasilitetsimport, nivåstate, oppgraderingskall eller skjulte bonuser. `Kontor → Klubben → Treningsanlegg / Medisinsk apparat` og den eksisterende treningsmodellen er de eneste produktretningene for disse områdene.

Save-migreringen beholdes med vilje. Den er nødvendig for å åpne eldre lagringer trygt, men oppretter ingen runtime-funksjon og ingen ny lagringsnøkkel.

## DOM og navigasjon

Legacy-noder for fasiliteter, marked og økonomi er fysisk slettet fra HTML. Oppstartskoden migrerer bare gamle lagringer og manipulerer ikke lenger DOM for å skjule eller fjerne gamle flater.

Dette endrer ikke den canonical strukturen:

**Kontor · Lag · Speiding · Kamp · Stats**

og endrer ikke Kalender som eier av synlig uke-/dagskontekst.

## Ikke berørt

Pass 7 endrer ikke:

- Club Week eller Kalender;
- laguttak, roller, formasjon eller valgdrawer;
- treningsdag eller treningsmotor;
- kampforberedelse, kampdag eller kampmotor;
- spillercondition;
- History Go-opplåsinger og rekrutteringsmotor;
- stabsroster;
- klubborganisasjonen fra Pass 5;
- det visuelle systemet fra Pass 6.

## Regresjonsvern

Pass 7 har egne porter som krever at:

1. migreringen fjerner nøyaktig de tre legacy-feltene og er idempotent;
2. canonical meritter overlever migreringen;
3. alle mode-session snapshots migreres;
4. fasilitetsfasader, statisk markup og motorintegrasjoner er fysisk slettet;
5. managerskallet ikke importerer økonomi-/overgangsmodulene;
6. canonical merits-seed ikke inneholder legacy-feltene;
7. browseren ikke får economy/market/facilities-workspaces eller navigasjonsflater;
8. et `[data-recruit-player]`-klikk ikke blir `preventDefault()` av skjulte økonomi-/markedsregler;
9. 390 px fortsatt er uten global overflow og WCAG A/AA serious/critical-feil.

// Importverktøyet målt mot de to importene vi allerede vet er riktige.
//
// Et skript som skriver profiler inn i katalogen er farligere enn et som leser
// den: en stille endring i formen ville lagt seg i alle kommende arver på én
// gang. Vakten her fjerner en ferdig arv fra katalogen i minnet, bygger
// kildefila på nytt fra de samme profilene, og krever at `planImport`
// gjenskaper arven — profilene felt for felt, banens unlocks, klubbraden og
// hver krysskobling.
//
// Fasiten hentes fra katalogen slik den er, ikke fra en kopi skrevet av her.
// Endrer profilformen seg, endrer fasiten seg med, og vakten måler fortsatt
// det den skal: at importen produserer nøyaktig det katalogen inneholder, ikke
// det den inneholdt i august 2026.
//
// Begge arvene er med fordi de er ulike på det ene punktet som betyr noe for
// formen: Pors daterer seg selv (`eraSource: belagt`), Brattvåg har ikke ett
// eneste årstall (`utledet`).
//
// Deretter kreves det at hvert avslag faktisk slår til. Et importverktøy som
// stopper på tvetydighet er bare verdt noe hvis stoppene virker.
import assert from "node:assert/strict";
import fs from "node:fs";
import { planImport, applyImport, slugify } from "./import-club-heritage.mjs";

const les = (fil) => JSON.parse(fs.readFileSync(new URL(`../data/${fil}`, import.meta.url), "utf8"));
const kopi = (verdi) => JSON.parse(JSON.stringify(verdi));

// Fra gruppens posisjoner tilbake til lagdelen den kom fra.
const TIL_LAGDEL = {
  "CB,LB,RB,WB": "forsvar",
  "DM,CM,AM": "midtbane",
  "ST,LW,RW": "angrep"
};

const alleKlubber = les("football_clubs.json").clubs;
const alleSpillere = les("football_players.json").players;
const alleSteder = les("football_unlocks.json").placeUnlocks;

// Én rad per ferdig arv, samme form som ARVER i audit-club-heritage.
//
// `ordlydsavvik` er ikke en toleranse skrudd opp til det som passet. Den er en
// MÅLING av noe som står i katalogen fra før: ti av Pors' elleve profiler med
// kildebelagt posisjon bærer historikkpostens advarsel, som sier at posisjonen
// IKKE er kildebelagt. Feltet motsier `naturalPositions`, som banen og
// `audit:club-heritage` begge behandler som kildebelagt — spillbar er 16, ikke
// 6. Brattvåg har null slike. Tallet er festet her, ikke godtatt: går det opp,
// har en ny import kopiert feilen; går det ned, er de ryddet.
const ARVER = [
  {
    clubId: "brattvag",
    clubName: "Brattvåg",
    placeId: "brattvag_stadion",
    // To generasjoner: den udaterte klubbhistorikken som landet arven, og NFFs
    // daterte 2026-tropp som senere supplerte den.
    eraSource: ["utledet", "belagt"],
    doc: "docs/P2_BRATTVAG_SOURCE_PASS.md",
    krysskoblet: ["sivert_solli", "ulrik_valderhaug_syversen"],
    ordlydsavvik: 0
  },
  {
    clubId: "pors",
    clubName: "Pors",
    placeId: "pors_stadion",
    eraSource: "belagt",
    doc: "docs/P2_PORS_SOURCE_PASS.md",
    krysskoblet: ["einar_rossbach", "fredrik_nordkvelle", "erik_pedersen", "tor_arne_sannerholt", "christer_fjellstad", "redon_pllana"],
    ordlydsavvik: 10
  }
];

const rapport = [];

for (const arv of ARVER) {
  const merke = arv.clubId;

  const fasitProfiler = alleSpillere.filter((p) => (p.sourcePlaceIds || []).includes(arv.placeId));
  const fasitSted = alleSteder.find((e) => e.placeId === arv.placeId);
  const fasitKlubb = alleKlubber.find((c) => c.id === arv.clubId);

  assert.ok(fasitProfiler.length > 0, `${merke}: fasiten mangler profiler`);
  assert.ok(fasitSted, `${merke}: fasiten mangler stedet i unlock-katalogen`);
  assert.ok(fasitKlubb, `${merke}: fasiten mangler klubbraden`);

  // En arv kan være bygget av FLERE importer. Brattvåg ble landet på en udatert
  // klubbhistorikk og senere supplert med NFFs daterte 2026-tropp, og de to
  // generasjonene bærer hver sin `eraSource`. Rekonstruksjonen gjør derfor det
  // samme som historien gjorde: én vanlig import, så én supplering — og det er
  // den eneste måten å måle suppleringsmodusen mot ekte katalogdata på.
  const generasjoner = Array.isArray(arv.eraSource) ? arv.eraSource : [arv.eraSource];

  // `nationality` er med fordi importen ikke lenger oppfinner den. Feltet sto
  // som `kilde.nationality || "Norge"` og gjorde hver importert spiller norsk;
  // nå settes det bare når kilden sier det. Rekonstruksjonen er en kildefil, og
  // en kildefil som skal gjenskape en profil med nasjonalitet må oppgi den.
  const somRad = (p) => ({
    name: p.name,
    ...(p.nationality ? { nationality: p.nationality } : {}),
    ...(p.positionSource === "gruppe"
      // En profil med `positionSource: "gruppe"` kom inn som en LAGDEL, ikke som
      // posisjoner. Rekonstruksjonen må gi den tilbake på samme form, ellers ville
      // fasiten bli bygget fra `naturalPositions` — som er tom for dem.
      ? { positionGroup: TIL_LAGDEL[p.usablePositions.join(",")] }
      : { positions: p.naturalPositions }),
    era: p.era
  });

  const byggKilde = (eraSource, profiler, krysskoblet) => ({
    clubId: arv.clubId,
    clubName: arv.clubName,
    placeId: arv.placeId,
    placeName: fasitSted.placeName,
    placeNotes: fasitSted.notes,
    eraSource,
    doc: arv.doc,
    sources: [{ url: "https://example.invalid/fasit", hentet: "2026-08-12", beskrivelse: "fasit rekonstruert av vakten" }],
    players: [
      ...profiler.map(somRad),
      ...krysskoblet.map((id) => {
        const e = alleSpillere.find((p) => p.id === id);
        assert.ok(e, `${merke}: fasiten mangler krysskoblingen ${id}`);
        return { name: e.name, crossLink: true, existingId: id, era: "modern" };
      })
    ]
  });

  // Alle krysskoblingene legges i første generasjon. De er navngitte påstander
  // om identitet, ikke om epoke, så hvilken import de kom med endrer ingenting
  // i det ferdige resultatet.
  const kilde = byggKilde(
    generasjoner[0],
    fasitProfiler.filter((p) => p.eraSource === generasjoner[0]),
    arv.krysskoblet
  );

  // Katalogen slik den så ut RETT FØR importen.
  const førKlubber = kopi(alleKlubber);
  const førSpillere = kopi(alleSpillere).filter((p) => !(p.sourcePlaceIds || []).includes(arv.placeId));
  const førSteder = kopi(alleSteder).filter((e) => e.placeId !== arv.placeId);
  for (const id of arv.krysskoblet) {
    const p = førSpillere.find((x) => x.id === id);
    p.clubAffiliations = (p.clubAffiliations || []).filter((a) => a.clubId !== arv.clubId);
  }
  const førKlubb = førKlubber.find((c) => c.id === arv.clubId);
  delete førKlubb.homePlaceId;
  førKlubb.playerPoolSize = 0;
  førKlubb.playablePlayerPoolSize = 0;
  førKlubb.playerPoolStatus = "pending";

  const plan = planImport({ kilde, clubs: førKlubber, players: førSpillere, placeUnlocks: førSteder });
  assert.deepEqual(plan.feil, [], `${merke}: reproduksjonen skal ikke stoppe på noen avklaring`);
  applyImport({ plan, kilde, clubs: førKlubber, players: førSpillere, placeUnlocks: førSteder });

  // Så suppleringene, én per senere generasjon.
  for (const era of generasjoner.slice(1)) {
    const senere = byggKilde(era, fasitProfiler.filter((p) => p.eraSource === era), []);
    const pluss = planImport({
      kilde: senere, clubs: førKlubber, players: førSpillere, placeUnlocks: førSteder, modus: "suppler"
    });
    assert.deepEqual(pluss.feil, [], `${merke}: suppleringen (${era}) skal ikke stoppe`);
    applyImport({ plan: pluss, kilde: senere, clubs: førKlubber, players: førSpillere, placeUnlocks: førSteder });
  }

  const førKlubbEtter = førKlubber.find((c) => c.id === arv.clubId);
  assert.equal(førKlubbEtter.playerPoolSize, fasitKlubb.playerPoolSize, `${merke}: playerPoolSize`);
  assert.equal(førKlubbEtter.playablePlayerPoolSize, fasitKlubb.playablePlayerPoolSize, `${merke}: playablePlayerPoolSize`);

  // Profilene, felt for felt.
  const bygdPåId = new Map(
    førSpillere.filter((p) => (p.sourcePlaceIds || []).includes(arv.placeId)).map((p) => [p.id, p])
  );
  assert.equal(bygdPåId.size, fasitProfiler.length, `${merke}: antall gjenskapte profiler`);

  let ordlydsavvik = 0;
  for (const fasit of fasitProfiler) {
    const bygd = bygdPåId.get(fasit.id);
    assert.ok(bygd, `${merke}/${fasit.id}: importen gjenskapte ikke profilen`);
    if (bygd.warningWhenMisused !== fasit.warningWhenMisused) {
      // Bare denne ene forskjellen er kjent. Alt annet skal være likt, og
      // sammenligningen under fanger det.
      ordlydsavvik += 1;
      assert.ok((fasit.naturalPositions || []).length > 0,
        `${merke}/${fasit.id}: ordlyd avviker på en profil UTEN posisjon — det er en ny feil, ikke den kjente`);
    }
    // `clubAffiliations` sammenlignes bare på ARVENS EGEN klubb. En senere
    // import kan krysskoble seg til en profil denne arven eier — Brattvågs
    // Fredrik Vinje fikk Stjørdals-Blink av Wikipedia-passet — og den raden er
    // ikke Brattvåg-importens ansvar og finnes ikke i kildefila den bygges av.
    // Rekkefølgen og formen på arvens egen rad måles fortsatt felt for felt.
    const egen = (p) => ({
      ...p,
      warningWhenMisused: null,
      clubAffiliations: (p.clubAffiliations || []).filter((a) => a.clubId === arv.clubId)
    });
    assert.deepEqual(egen(bygd), egen(fasit),
      `${merke}/${fasit.id}: profilen avviker fra katalogen`);
  }
  assert.equal(ordlydsavvik, arv.ordlydsavvik,
    `${merke}: antall profiler der katalogens advarsel motsier den kildebelagte posisjonen`);

  // Banen åpner nøyaktig de samme profilene.
  const bygdSted = førSteder.find((e) => e.placeId === arv.placeId);
  assert.deepEqual(
    bygdSted.unlocks.map((u) => u.targetId).sort(),
    fasitSted.unlocks.map((u) => u.targetId).sort(),
    `${merke}: banen åpner ikke de samme profilene`
  );
  assert.equal(bygdSted.placeRole, fasitSted.placeRole, `${merke}: placeRole`);

  // Klubbraden. `deepEqual` og ikke tekstsammenligning: nøkkelrekkefølgen er
  // ikke canonical — pors og brattvag har homePlaceId på hver sin plass.
  assert.deepEqual(førKlubb, fasitKlubb, `${merke}: klubbraden avviker fra katalogen`);

  // Krysskoblingene beholder sin egen arv, og rekkefølgen holder seg innenfor
  // det `sync-club-affiliations.mjs` krever.
  for (const id of arv.krysskoblet) {
    assert.deepEqual(
      førSpillere.find((p) => p.id === id),
      alleSpillere.find((p) => p.id === id),
      `${merke}/${id}: krysskoblingen avviker fra katalogen`
    );
  }

  rapport.push({
    klubb: arv.clubId,
    profiler: fasitProfiler.length,
    baneåpner: fasitSted.unlocks.length,
    krysskoblet: arv.krysskoblet.length,
    eraSource: arv.eraSource,  // rekonstruksjonens felles verdi, se under
    ordlydsavvik
  });
}

// ---------------------------------------------------------------------------
// Avslagene. Hvert punkt er en avgjørelse kilden må ta.
// ---------------------------------------------------------------------------
const PRØVEKLUBB = "brattvag";
const PRØVESTED = "brattvag_stadion";

const grunnlag = () => ({
  clubs: kopi(alleKlubber).map((c) => (c.id === PRØVEKLUBB
    ? { ...c, homePlaceId: undefined, playerPoolStatus: "pending", playerPoolSize: 0, playablePlayerPoolSize: 0 }
    : c)),
  players: kopi(alleSpillere).filter((p) => !(p.sourcePlaceIds || []).includes(PRØVESTED)),
  placeUnlocks: kopi(alleSteder).filter((e) => e.placeId !== PRØVESTED)
});

const basis = {
  clubId: PRØVEKLUBB,
  placeId: PRØVESTED,
  placeName: "Brattvåg stadion",
  eraSource: "utledet",
  doc: "docs/P2_BRATTVAG_SOURCE_PASS.md",
  sources: [{ url: "https://example.invalid/x", hentet: "2026-08-12" }],
  players: [{ name: "Testolav Testesen", positions: ["CM"], era: "modern" }]
};

let avslag = 0;
function krevAvslag(navn, endring, mønster, grunnlagsendring = () => {}) {
  const g = grunnlag();
  grunnlagsendring(g);
  const resultat = planImport({ kilde: { ...basis, ...endring }, ...g });
  assert.ok(resultat.feil.length > 0, `${navn}: importen skulle ha stoppet`);
  assert.ok(
    resultat.feil.some((f) => mønster.test(f)),
    `${navn}: stoppet, men ikke på riktig grunn — fikk ${JSON.stringify(resultat.feil)}`
  );
  // Et avslag skal ikke etterlate en halvferdig plan.
  assert.equal(resultat.profiler, undefined, `${navn}: et avslag skal ikke returnere profiler`);
  avslag += 1;
}

krevAvslag("ukjent posisjon",
  { players: [{ name: "Testolav Testesen", positions: ["SPISS"], era: "modern" }] },
  /ukjent posisjon/);

krevAvslag("keeper som utespiller",
  { players: [{ name: "Testolav Testesen", positions: ["GK", "CM"], era: "modern" }] },
  /GK står sammen med utespillerposisjon/);

krevAvslag("styrke uten kilde",
  { players: [{ name: "Testolav Testesen", positions: ["CM"], era: "modern", strengths: ["heading"] }] },
  /kan ikke settes av en import/);

krevAvslag("arketype uten kilde",
  { players: [{ name: "Testolav Testesen", positions: ["CM"], era: "modern", archetypeIds: ["dribbler"] }] },
  /kan ikke settes av en import/);

krevAvslag("navnekollisjon uten avgjørelse",
  { players: [{ name: alleSpillere[0].name, positions: ["CM"], era: "modern" }] },
  /finnes allerede i katalogen/);

krevAvslag("krysskobling uten navngitt profil",
  { players: [{ name: "Testolav Testesen", crossLink: true, era: "modern" }] },
  /uten `existingId`/);

krevAvslag("krysskobling til en profil som ikke finnes",
  { players: [{ name: "Testolav Testesen", crossLink: true, existingId: "finnes_ikke", era: "modern" }] },
  /finnes ikke i katalogen/);

krevAvslag("epoke mangler",
  { players: [{ name: "Testolav Testesen", positions: ["CM"] }] },
  /`era` må være/);

krevAvslag("ingen kilde oppgitt",
  { sources: [] },
  /må navngi minst én faktisk lest kilde/);

krevAvslag("kilde uten hentedato",
  { sources: [{ url: "https://example.invalid/x" }] },
  /hentet.*ÅÅÅÅ-MM-DD/);

krevAvslag("samme navn to ganger i fila",
  { players: [
    { name: "Testolav Testesen", positions: ["CM"], era: "modern" },
    { name: "Testolav Testesen", positions: ["CB"], era: "modern" }
  ] },
  /allerede brukt av/);

krevAvslag("tom spillerliste", { players: [] }, /er tom/);

krevAvslag("klubben finnes ikke", { clubId: "finnes_ikke" }, /finnes ikke i football_clubs\.json/);

krevAvslag("ferdig arv overskrives", {}, /allerede som `ready`/,
  (g) => { g.clubs.find((c) => c.id === PRØVEKLUBB).playerPoolStatus = "ready"; });

krevAvslag("homePlaceId byttes", {}, /homePlaceId er permanent/,
  (g) => { g.clubs.find((c) => c.id === PRØVEKLUBB).homePlaceId = "en_annen_bane"; });

krevAvslag("stedet finnes fra før", {}, /finnes allerede i unlock-katalogen/,
  (g) => { g.placeUnlocks.push({ placeId: PRØVESTED, placeName: "x", unlocks: [] }); });

// ---------------------------------------------------------------------------
// playerPoolStatus er utledet, ikke valgt
//
// `sync-club-affiliations.mjs` regner status som `playable >= 15` og håndhever
// den i CI. En import som satte «ready» ubetinget ville felt den vakten for
// enhver klubb med for få spillbare — og påstått at en pool som ikke kan stille
// et lag er ferdig. De to ferdige arvene har 16 og 18 spillbare og skal bli
// «ready»; en liten import skal bli «pending» og si fra.
// ---------------------------------------------------------------------------
{
  const liten = {
    ...basis,
    players: [
      { name: "Testolav Testesen", positions: ["CM"], era: "modern" },
      { name: "Testkåre Prøvesen", positions: ["GK"], era: "modern" },
      { name: "Testarne Uten Posisjon", era: "modern" }
    ]
  };
  const r = planImport({ kilde: liten, ...grunnlag() });
  assert.deepEqual(r.feil, [], "en liten import er et gyldig utfall, ikke en feil");
  assert.equal(r.clubPatch.playerPoolStatus, "pending",
    "under femten spillbare skal gi `pending`, ikke `ready`");
  assert.ok(r.advarsler.some((a) => /trengs 15 for en spillbar pool|trengs 15/.test(a)),
    `en for liten pool skal si fra i klartekst — fikk ${JSON.stringify(r.advarsler)}`);
  assert.equal(r.rapport.spillbar, 2, "spillbare telles av posisjon, ikke av antall profiler");
  assert.equal(r.rapport.dokumentert, 3, "dokumenterte teller alle profilene");
}

// Og motsatt: de to ferdige arvene skal fortsatt bli «ready».
for (const arv of ARVER) {
  const rad = rapport.find((r) => r.klubb === arv.clubId);
  assert.ok(rad.baneåpner >= 15, `${arv.clubId}: en ferdig arv skal ha minst femten spillbare`);
}

// ---------------------------------------------------------------------------
// Gruppeposisjoner
//
// En kilde som sier «forsvar» sier mindre enn en posisjon og mer enn ingenting.
// Den skrives til `usablePositions`, ikke `naturalPositions`, fordi
// `calculatePositionFit` gir 96 for en naturlig posisjon og 78 for en brukbar —
// fire naturlige ville påstått at mannen passer GODT som både midtstopper og
// begge backer. `positionSource: "gruppe"` gjør oppløsningen målbar.
// ---------------------------------------------------------------------------
const GRUPPESETT = {
  forsvar: ["CB", "LB", "RB", "WB"],
  midtbane: ["DM", "CM", "AM"],
  angrep: ["ST", "LW", "RW"]
};

for (const [gruppe, sett] of Object.entries(GRUPPESETT)) {
  const r = planImport({
    kilde: { ...basis, players: [{ name: "Testolav Testesen", positionGroup: gruppe, era: "modern" }] },
    ...grunnlag()
  });
  assert.deepEqual(r.feil, [], `${gruppe}: skal være en gyldig lagdel`);
  const p = r.profiler[0];
  assert.deepEqual(p.naturalPositions, [], `${gruppe}: en lagdel er ingen naturlig posisjon`);
  assert.deepEqual(p.usablePositions, sett, `${gruppe}: lagdelen skal skrives som brukbare posisjoner`);
  assert.equal(p.positionSource, "gruppe", `${gruppe}: oppløsningen skal stå i dataene`);
  assert.match(p.warningWhenMisused, /bare lagdel/, `${gruppe}: advarselen skal si at posisjonen ikke er kjent`);
  assert.equal(r.rapport.spillbar, 1, `${gruppe}: en lagdel gjør profilen spillbar`);
}

// En presis posisjon bærer ikke merket.
{
  const r = planImport({
    kilde: { ...basis, players: [{ name: "Testolav Testesen", positions: ["CB"], era: "modern" }] },
    ...grunnlag()
  });
  assert.equal(r.profiler[0].positionSource, undefined, "en presis posisjon skal ikke merkes som gruppe");
  assert.deepEqual(r.profiler[0].naturalPositions, ["CB"], "en presis posisjon er naturlig");
}

krevAvslag("ukjent lagdel",
  { players: [{ name: "Testolav Testesen", positionGroup: "backrekka", era: "modern" }] },
  /ukjent lagdel/);

krevAvslag("keeper ført som lagdel",
  { players: [{ name: "Testolav Testesen", positionGroup: "keeper", era: "modern" }] },
  /ukjent lagdel/);

krevAvslag("både posisjon og lagdel",
  { players: [{ name: "Testolav Testesen", positions: ["CB"], positionGroup: "forsvar", era: "modern" }] },
  /ikke begge/);

// Og regelen håndheves på katalogen som helhet: ingen profil kan bære en grov
// oppløsning uten å si det, og ingen kan si det uten å ha den.
{
  const gyldigeSett = new Set(Object.values(GRUPPESETT).map((s) => s.join(",")));
  let merket = 0;
  for (const p of alleSpillere) {
    const sett = (p.usablePositions || []).join(",");
    if (p.positionSource !== undefined) {
      merket += 1;
      assert.equal(p.positionSource, "gruppe",
        `${p.id}: positionSource kan bare være "gruppe" — fikk ${JSON.stringify(p.positionSource)}`);
      assert.deepEqual(p.naturalPositions || [], [],
        `${p.id}: en gruppeposisjon er ingen naturlig posisjon`);
      assert.ok(gyldigeSett.has(sett),
        `${p.id}: merket som gruppe, men usablePositions er ikke en hel lagdel (${sett})`);
    } else if (gyldigeSett.has(sett) && (p.naturalPositions || []).length === 0) {
      assert.fail(`${p.id}: bærer en hel lagdel i usablePositions uten \`positionSource: "gruppe"\` — grov oppløsning skal ikke kunne se presis ut`);
    }
  }
  console.error(`# profiler med gruppeoppløsning i katalogen: ${merket}`);
}

// ---------------------------------------------------------------------------
// Supplering: fyll på en ferdig arv
//
// En arv er ikke ferdig for godt. Registeret oppdateres hver sesong, og en
// klubb som ble landet på historiske navn skal kunne få dagens tropp uten at
// noen redigerer katalogen for hånd. Modusen speilvender tre av reglene, og det
// er nettopp speilvendingen som må måles: en supplering skal ALDRI kunne
// opprette en arv, og en ny import skal aldri kunne skrive inn i en.
// ---------------------------------------------------------------------------
{
  const kilde = {
    ...basis,
    players: [
      { name: "Testolav Testesen", positions: ["CM"], era: "modern" },
      { name: "Testkåre Prøvesen", positionGroup: "forsvar", era: "modern" }
    ]
  };
  const g = {
    clubs: kopi(alleKlubber),
    players: kopi(alleSpillere),
    placeUnlocks: kopi(alleSteder)
  };
  const r = planImport({ kilde, ...g, modus: "suppler" });
  assert.deepEqual(r.feil, [], "supplering av en ferdig arv skal gå gjennom");

  const brattvag = alleKlubber.find((c) => c.id === PRØVEKLUBB);
  assert.equal(r.rapport.tilfort, 2, "tilført av denne kjøringen");
  assert.equal(r.rapport.dokumentert, brattvag.playerPoolSize + 2, "dokumentert er arvens TOTAL");
  assert.equal(r.rapport.spillbar, brattvag.playablePlayerPoolSize + 2, "spillbar er arvens TOTAL");
  assert.equal(r.clubPatch.playerPoolStatus, "ready", "arven forblir ready");
  assert.ok(r.place.leggTilUnlocks, "stedet skal patches, ikke opprettes");
  assert.equal(r.place.placeName, undefined, "en supplering skriver ikke om stedets navn");
  assert.equal(r.place.leggTilUnlocks.length, 2, "bare de nye spillbare legges til");

  // Anvendt: stedet beholder sine gamle unlocks OG får de nye.
  const førAntall = alleSteder.find((e) => e.placeId === PRØVESTED).unlocks.length;
  applyImport({ plan: r, kilde, clubs: g.clubs, players: g.players, placeUnlocks: g.placeUnlocks });
  const etter = g.placeUnlocks.find((e) => e.placeId === PRØVESTED);
  assert.equal(etter.unlocks.length, førAntall + 2, "banen skal åpne både de gamle og de nye");
  assert.equal(g.placeUnlocks.filter((e) => e.placeId === PRØVESTED).length, 1,
    "stedet skal ikke bli lagt inn en gang til");
}

// En spiller som ALT står i arven er ikke en kollisjon i supplerings-modus —
// kilden er den samme troppen en sesong senere. Men hva som skjer med ham
// avhenger av hva kilden sier om posisjonen hans, og de tre utfallene er
// ULIKE påstander:
//
//   * kilden sier ingenting nytt        → gjensyn, han hoppes over
//   * han står uten posisjon, kilden gir én → SKJERPING, han blir spillbar
//   * de sier ulikt                     → STOPP, to kilder om samme mann
//
// Uten det tredje ville en supplering stille skrevet over en posisjon; uten
// det andre ville en historikkpost blitt liggende ikke-spillbar selv om en
// datert tropp navnga lagdelen hans.
{
  const medPosisjon = alleSpillere.find((p) => (p.clubAffiliations || [])
    .some((a) => a.clubId === PRØVEKLUBB)
    && [...(p.naturalPositions || []), ...(p.usablePositions || [])].length > 0);
  assert.ok(medPosisjon, "fant ingen profil med posisjon i prøvearven");

  // 1. Uten ny posisjon: gjensyn.
  {
    const r = planImport({
      kilde: { ...basis, players: [
        { name: medPosisjon.name, era: "modern" },
        { name: "Testolav Testesen", positions: ["CM"], era: "modern" }
      ] },
      clubs: kopi(alleKlubber), players: kopi(alleSpillere), placeUnlocks: kopi(alleSteder),
      modus: "suppler"
    });
    assert.deepEqual(r.feil, [], `et gjensyn uten ny posisjon skal ikke stoppe — fikk ${JSON.stringify(r.feil)}`);
    assert.equal(r.rapport.gjensyn, 1, "gjensynet skal telles");
    assert.equal(r.rapport.skjerpet, 0, "ingenting å skjerpe");
    assert.equal(r.rapport.tilfort, 1, "bare den nye er tilført");
    assert.equal(r.profiler.length, 1, "gjensynet skal ikke bli en ny profil");
  }

  // 2. Motstridende posisjon: stopp. Skriptet KAN ikke avgjøre hvilken kilde
  //    som gjelder, og en supplering skriver aldri over en posisjon.
  {
    const har = [...(medPosisjon.naturalPositions || []), ...(medPosisjon.usablePositions || [])];
    const annen = ["forsvar", "midtbane", "angrep"].find((g) => {
      const sett = { forsvar: ["CB", "LB", "RB", "WB"], midtbane: ["DM", "CM", "AM"], angrep: ["ST", "LW", "RW"] }[g];
      return sett.length !== har.length || !sett.every((x) => har.includes(x));
    });
    const r = planImport({
      kilde: { ...basis, players: [{ name: medPosisjon.name, positionGroup: annen, era: "modern" }] },
      clubs: kopi(alleKlubber), players: kopi(alleSpillere), placeUnlocks: kopi(alleSteder),
      modus: "suppler"
    });
    assert.ok(r.feil.some((f) => /To kilder sier ulikt om samme mann/.test(f)),
      `en motstridende posisjon skal stoppe importen — fikk ${JSON.stringify(r.feil)}`);
    assert.equal(r.profiler, undefined, "et avslag skal ikke returnere profiler");
  }

  // 3. Historikkpost som får sin første posisjon: skjerping. Han blir spillbar,
  //    telles i poolen OG legges inn i banens unlocks — ellers ville arven stå
  //    med flere spillbare enn banen åpner.
  {
    const utenPosisjon = alleSpillere.find((p) => (p.clubAffiliations || [])
      .some((a) => a.clubId === PRØVEKLUBB)
      && [...(p.naturalPositions || []), ...(p.usablePositions || [])].length === 0);
    assert.ok(utenPosisjon, "fant ingen historikkpost i prøvearven");
    const g = { clubs: kopi(alleKlubber), players: kopi(alleSpillere), placeUnlocks: kopi(alleSteder) };
    const kilde = { ...basis, players: [{ name: utenPosisjon.name, positionGroup: "midtbane", era: "modern" }] };
    const r = planImport({ kilde, ...g, modus: "suppler" });
    assert.deepEqual(r.feil, [], `en skjerping skal ikke stoppe — fikk ${JSON.stringify(r.feil)}`);
    assert.equal(r.rapport.skjerpet, 1, "skjerpingen skal telles");
    assert.equal(r.rapport.tilfort, 0, "en skjerping tilfører ingen ny profil");
    assert.ok(r.place.leggTilUnlocks.includes(utenPosisjon.id), "den skjerpede skal åpnes av banen");

    applyImport({ plan: r, kilde, clubs: g.clubs, players: g.players, placeUnlocks: g.placeUnlocks });
    const etter = g.players.find((p) => p.id === utenPosisjon.id);
    assert.deepEqual(etter.usablePositions, ["DM", "CM", "AM"], "lagdelen skal skrives til usablePositions");
    assert.deepEqual(etter.naturalPositions, [], "en lagdel er ingen naturlig posisjon");
    assert.equal(etter.positionSource, "gruppe", "oppløsningen skal stå i dataene");
    assert.equal(etter.era, utenPosisjon.era, "en skjerping rører ikke epoken");
    assert.deepEqual(etter.sourcePlaceIds, utenPosisjon.sourcePlaceIds, "en skjerping rører ikke arven");
  }
}

// Speilvendingene: hver modus avviser den andres tilstand.
krevAvslag("ny import på en ferdig arv", {}, /Bruk --suppler/,
  (g) => { g.clubs.find((c) => c.id === PRØVEKLUBB).playerPoolStatus = "ready"; });

{
  const r = planImport({
    kilde: basis, ...grunnlag(), modus: "suppler"
  });
  assert.ok(r.feil.some((f) => /ingen arv å supplere|står ikke som `ready`/.test(f)),
    `supplering av en pending klubb skal avvises — fikk ${JSON.stringify(r.feil)}`);
}

{
  const g = { clubs: kopi(alleKlubber), players: kopi(alleSpillere), placeUnlocks: kopi(alleSteder) };
  g.clubs.find((c) => c.id === PRØVEKLUBB).homePlaceId = "en_annen_bane";
  const r = planImport({ kilde: basis, ...g, modus: "suppler" });
  assert.ok(r.feil.some((f) => /kan ikke flytte banen/.test(f)),
    "en supplering skal ikke kunne flytte homePlaceId");
}


// ---------------------------------------------------------------------------
// Nasjonalitet oppfinnes ikke
//
// Feltet sto som `kilde.nationality || "Norge"`, og siden ingen kildefil oppga
// det, ble hver eneste importerte spiller norsk. En troppsliste dokumenterer at
// mannen er REGISTRERT i norsk seriesystem, ikke hvilket land han spiller for.
// `getNationalBasePlayerIds` i app.js velger landslagsspillere på nøyaktig
// likhet, så feilen gjorde Gambias Jibril Bojang, Tunisias Sebastian Tounekti,
// Robin Bjørnholm-Jatta og Trinidad og Tobagos Nicklas Frenderup valgbare for
// Norge — og utilgjengelige for sine egne land. Alle fire er rettet i katalogen.
// ---------------------------------------------------------------------------
{
  const g = grunnlag();
  const r = planImport({
    kilde: { ...basis, players: [
      { name: "Testolav Testesen", positions: ["CM"], era: "modern" },
      { name: "Testkåre Prøvesen", positions: ["CB"], era: "modern", nationality: "Gambia" }
    ] },
    ...g
  });
  assert.deepEqual(r.feil, [], "nasjonalitet per spiller er gyldig");
  const uten = r.profiler.find((p) => p.id === "testolav_testesen");
  const med = r.profiler.find((p) => p.id === "testkare_provesen");
  assert.ok(!Object.hasOwn(uten, "nationality"),
    "en kilde som ikke sier nasjonalitet skal ikke gi profilen én — «Norge» er en påstand, ikke en standardverdi");
  assert.equal(med.nationality, "Gambia", "nasjonalitet fra kildefila skal skrives");

  // Hele fila kan sette den, for en kilde som faktisk oppgir det.
  const helFil = planImport({
    kilde: { ...basis, nationality: "Island", players: [{ name: "Testolav Testesen", positions: ["CM"], era: "modern" }] },
    ...grunnlag()
  });
  assert.equal(helFil.profiler[0].nationality, "Island", "nasjonalitet for hele fila skal skrives");
}

// ---------------------------------------------------------------------------
// Slugen tåler bokstaver Unicode ikke dekomponerer
//
// NFD splitter «é» i e + aksent, men «ł» er én egen bokstav uten aksent å
// skille ut, og falt gjennom til understrek. `Paweł Chrupałła` ble
// `pawe_chrupa_a` — og siden samme slug er navnekollisjonsnøkkelen, ville en
// senere kilde med ASCII-stavemåten ikke funnet ham og laget en dublett med
// halv karriere.
// ---------------------------------------------------------------------------
for (const [navn, forventet] of [
  ["Paweł Chrupałła", "pawel_chrupalla"],
  ["Pawel Chrupalla", "pawel_chrupalla"],
  ["Ægir Þórsson", "aegir_thorsson"],
  ["Nikola Đurđić", "nikola_durdic"]
]) {
  assert.equal(slugify(navn), forventet, `id-form for «${navn}»`);
}
assert.ok(!alleSpillere.some((p) => /_[a-z]?_[a-z]?_$|__/.test(p.id)),
  "ingen profil i katalogen skal ha en id med tapte bokstaver");

// ---------------------------------------------------------------------------
// Id-formen, mot navn som faktisk står i katalogen
// ---------------------------------------------------------------------------
for (const [navn, forventet] of [
  ["Kåre Bergstrøm", "kare_bergstrom"],
  ["Ole Gunnar Solskjær", "ole_gunnar_solskjaer"],
  ["Jarl-André Storbæk", "jarl_andre_storbaek"],
  ["Asbjørn Marthinsen", "asbjorn_marthinsen"],
  ["Einar «Jeisen» Gundersen", "einar_jeisen_gundersen"]
]) {
  assert.equal(slugify(navn), forventet, `id-form for «${navn}»`);
}

console.log(JSON.stringify({ ok: true, reprodusert: rapport, avslagVerifisert: avslag }, null, 2));

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
    eraSource: "utledet",
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
    krysskoblet: ["einar_rossbach", "fredrik_nordkvelle", "erik_pedersen", "tor_arne_sannerholt", "christer_fjellstad"],
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

  // Kildefila slik et menneske ville fylt den ut med kilden i hånd.
  const kilde = {
    clubId: arv.clubId,
    clubName: arv.clubName,
    placeId: arv.placeId,
    placeName: fasitSted.placeName,
    placeNotes: fasitSted.notes,
    eraSource: arv.eraSource,
    doc: arv.doc,
    sources: [{ url: "https://example.invalid/fasit", hentet: "2026-08-12", beskrivelse: "fasit rekonstruert av vakten" }],
    players: [
      ...fasitProfiler.map((p) => ({ name: p.name, positions: p.naturalPositions, era: p.era })),
      ...arv.krysskoblet.map((id) => {
        const e = alleSpillere.find((p) => p.id === id);
        assert.ok(e, `${merke}: fasiten mangler krysskoblingen ${id}`);
        return { name: e.name, crossLink: true, existingId: id, era: "modern" };
      })
    ]
  };

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
  assert.equal(plan.rapport.dokumentert, fasitKlubb.playerPoolSize, `${merke}: playerPoolSize`);
  assert.equal(plan.rapport.spillbar, fasitKlubb.playablePlayerPoolSize, `${merke}: playablePlayerPoolSize`);
  assert.equal(plan.rapport.nye, fasitProfiler.length, `${merke}: antall nye profiler`);
  assert.deepEqual(plan.rapport.krysskoblet, arv.krysskoblet, `${merke}: krysskoblinger`);

  applyImport({ plan, kilde, clubs: førKlubber, players: førSpillere, placeUnlocks: førSteder });

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
    assert.deepEqual(
      { ...bygd, warningWhenMisused: null },
      { ...fasit, warningWhenMisused: null },
      `${merke}/${fasit.id}: profilen avviker fra katalogen`
    );
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
    eraSource: arv.eraSource,
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

// P2-import, mekanisk — kilden avgjør, skriptet regner.
//
// Pors og Brattvåg ble ført inn for hånd, én klubb om gangen. Med fjorten
// klubber igjen er håndarbeidet selv risikoen: hver import gjentar de samme
// tjue avgjørelsene, og en av dem blir før eller siden gjort annerledes enn
// forrige gang uten at noen ser det. `audit:club-heritage` ble samlet til én
// tabellstyrt vakt av nøyaktig den grunnen; dette er samme grep på veien inn.
//
// Skriptet DIKTER INGENTING. Det leser en kildefil som et menneske har fylt ut
// med en kilde i hånd, og oversetter den til canonical form. Alt som ikke står
// i kildefila blir tomt, og alt som er tvetydig stopper importen i stedet for å
// bli gjettet:
//
//   * ukjent posisjon                     → stopp
//   * GK sammen med utespillerposisjon    → stopp (koherensregelen fra P3)
//   * navn som finnes i katalogen fra før → stopp, med mindre kildefila
//     uttrykkelig navngir krysskoblingen med `existingId`
//   * styrker, arketyper, rollepreferanser, taktiske preferanser
//                                         → skrives aldri, uansett hva fila sier
//
// Kjøring:
//   node scripts/import-club-heritage.mjs data/heritage-sources/bjarg.source.json
//   node scripts/import-club-heritage.mjs <fil> --write
//
// Uten `--write` skriver skriptet ingenting og rapporterer bare hva importen
// ville gjort, inkludert den ferdige raden til `ARVER` i audit-club-heritage.
//
// `planImport` er ren: den leser kataloger som argumenter og rører ingen fil.
// Det er den `audit:import-club-heritage` måler mot Brattvåg-fasiten.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Posisjonene motoren kjenner. Lista er SQUAD_GROUPS i src/football-club-squad.js
// flatet ut, og den er lukket med vilje: en kilde som sier «spiss» må oversettes
// av mennesket som leser den, ikke av en synonymtabell her.
const GK = "GK";
const UTESPILLER = ["CB", "LB", "RB", "WB", "DM", "CM", "AM", "ST", "LW", "RW"];
const POSISJONER = new Set([GK, ...UTESPILLER]);

// Grensa for en spillbar pool. Speiler MIN_POOL i sync-club-affiliations.mjs,
// som er den som faktisk utleder playerPoolStatus og håndhever den i CI.
const MIN_POOL = 15;

// ---------------------------------------------------------------------------
// Gruppeposisjoner
//
// Noen kilder — typisk en troppsliste — sier «forsvar» og ikke «midtstopper».
// Det er mindre enn en posisjon, men mer enn ingenting, og det er nøyaktig den
// oppløsningen motorens egen troppsmodell er bygget på (SQUAD_GROUPS i
// src/football-club-squad.js).
//
// Gruppen skrives derfor til `usablePositions` og IKKE til `naturalPositions`,
// og det er ikke en detalj. `calculatePositionFit` gir 96 for en naturlig
// posisjon og 78 for en brukbar. «Forsvar» ført som fire naturlige posisjoner
// ville påstått at mannen passer GODT som både midtstopper, høyre- og
// venstreback — en allsidighet ingen kilde har hevdet. Ført som brukbare sier
// den at han kan brukes der, som er det kilden faktisk sier.
//
// `positionSource: "gruppe"` gjør forskjellen målbar i dataene, slik at et
// senere kildepass kan skjerpe dem uten å gjette, og slik at ingen tror
// oppløsningen er finere enn den er. Presise posisjoner bærer ikke feltet.
const GRUPPEPOSISJONER = Object.freeze({
  forsvar: ["CB", "LB", "RB", "WB"],
  midtbane: ["DM", "CM", "AM"],
  angrep: ["ST", "LW", "RW"]
});
// Keeper er IKKE en gruppe: «keeper» og `GK` er samme oppløsning, så en
// troppsliste som sier keeper gir en presis posisjon.

const EPOKER = new Set(["historical", "modern"]);
const ERA_SOURCE = new Set(["belagt", "utledet"]);

// Feltene som aldri fylles av en import. De hører til P1-overlayet, der hvert
// claim bærer sin egen `claim` og `source`.
const ALDRI_FRA_IMPORT = [
  "strengths", "archetypeIds", "archetypes", "preferredRoles",
  "likesTactics", "dislikesTactics", "needs", "poorFits"
];

// ---------------------------------------------------------------------------
// Id-form. Reglene er lest av katalogen slik den står: æ→ae, ø→o, å→a, øvrige
// diakritiske tegn strippes, alt annet enn a–z og siffer blir understrek.
// Anførselstegn rundt kallenavn fjernes, men kallenavnet selv beholdes — det er
// formen de to siste P2-importene brukte (einar_jeisen_gundersen).
// ---------------------------------------------------------------------------
export function slugify(navn) {
  return String(navn)
    .replace(/[«»"'']/g, "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Navnesammenligning for kollisjonssøk. Samme normalisering som id-en, slik at
// «Kåre Bergstrøm» og «Kare Bergstrom» treffer hverandre.
const navnenokkel = (navn) => slugify(navn);

// Samme fornavn, samme etternavn, ett navneledd i forskjell — «Rune Jarstein»
// mot «Rune Almenning Jarstein». Regelen er den samme som `audit:attributes`
// bruker, og den er tatt hit fordi den fanger noe importen ellers gjør galt:
// et register staver ofte navnet fyldigere enn en klubbhistorikk, så en
// supplering kan legge inn en mann som ALT står i arven, bare med mellomnavn.
// Eksaktsøket ser ham ikke, og resultatet er to halve karrierer.
function erMellomnavnVariant(a, b) {
  const [kort, lang] = a.length <= b.length ? [a, b] : [b, a];
  if (lang.length - kort.length !== 1 || kort.length < 2) return false;
  return kort[0] === lang[0] && kort[kort.length - 1] === lang[lang.length - 1];
}
const navneledd = (navn) => navnenokkel(navn).split("_").filter(Boolean);

// ---------------------------------------------------------------------------
// Bygg én canonical profil. Formen er lest av Pors- og Brattvåg-profilene.
// ---------------------------------------------------------------------------
function byggProfil(rad, kilde) {
  const gruppe = rad.gruppe ? GRUPPEPOSISJONER[rad.gruppe] : null;
  const harPosisjon = rad.posisjoner.length > 0 || Boolean(gruppe);
  return {
    id: rad.id,
    name: rad.navn,
    nationality: kilde.nationality || "Norge",
    era: rad.era,
    eraSource: kilde.eraSource,
    sourcePlaceIds: [kilde.placeId],
    classHeight: 79,
    classSource: "utledet",
    naturalPositions: gruppe ? [] : rad.posisjoner,
    usablePositions: gruppe ? [...gruppe] : [],
    ...(gruppe ? { positionSource: "gruppe" } : {}),
    poorFits: [],
    archetypeIds: [],
    archetypes: [],
    strengths: [],
    needs: [],
    preferredRoles: [],
    likesTactics: [],
    dislikesTactics: [],
    warningWhenMisused: gruppe
      ? `Kilden oppgir bare lagdel (${rad.gruppe}), ikke posisjon. Ingen individuelle styrker er lagt til uten kildebelegg.`
      : harPosisjon
        ? "Ingen individuelle styrker er lagt til uten kildebelegg."
        : `Posisjon og individuelle styrker er ikke kildebelagt i ${kilde.clubName || kilde.clubId}-historikken.`,
    clubStatus: { [kilde.placeId]: "club_profile" },
    clubStatusSource: { [kilde.placeId]: "belagt" },
    clubAffiliations: [
      { clubId: kilde.clubId, relation: "played_for", status: "club_profile", source: "belagt" }
    ]
  };
}

// ---------------------------------------------------------------------------
// Ren planlegging. Ingen fil leses eller skrives her; alt kommer inn som data
// og alt som er uavklart kommer ut som en linje i `feil`.
// ---------------------------------------------------------------------------
export function planImport({
  kilde, clubs = [], players = [], placeUnlocks = [], docExists = () => true, modus = "ny"
} = {}) {
  const suppler = modus === "suppler";
  const feil = [];
  const advarsler = [];
  const stopp = (melding) => feil.push(melding);

  // -- kildefila som helhet --
  for (const felt of ["clubId", "placeId", "placeName", "eraSource", "doc"]) {
    if (typeof kilde?.[felt] !== "string" || !kilde[felt].trim()) {
      stopp(`kildefil: \`${felt}\` mangler eller er tom`);
    }
  }
  if (!ERA_SOURCE.has(kilde?.eraSource)) {
    stopp(`kildefil: \`eraSource\` må være "belagt" eller "utledet", ikke ${JSON.stringify(kilde?.eraSource)}`);
  }
  if (!Array.isArray(kilde?.sources) || kilde.sources.length === 0) {
    stopp("kildefil: `sources` må navngi minst én faktisk lest kilde");
  } else {
    kilde.sources.forEach((s, i) => {
      if (!s || typeof s.url !== "string" || !s.url.trim()) stopp(`kildefil: sources[${i}].url mangler`);
      if (!s || typeof s.hentet !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s.hentet)) {
        stopp(`kildefil: sources[${i}].hentet må være en dato på formen ÅÅÅÅ-MM-DD`);
      }
    });
  }
  if (!Array.isArray(kilde?.players) || kilde.players.length === 0) {
    stopp("kildefil: `players` er tom — det er ingen import");
  }

  // -- katalogtilstand --
  const club = clubs.find((c) => c.id === kilde?.clubId) || null;
  if (!club) {
    stopp(`klubben \`${kilde?.clubId}\` finnes ikke i football_clubs.json`);
  } else if (suppler) {
    // Supplering fyller PÅ en ferdig arv. Den skal aldri kunne opprette en, og
    // aldri kunne mynte et nytt homePlaceId — begge deler ville vært en ny
    // import forkledd som en påfylling.
    if (club.playerPoolStatus !== "ready") {
      stopp(`klubben \`${kilde.clubId}\` står ikke som \`ready\` — det finnes ingen arv å supplere. Kjør en vanlig import.`);
    }
    if (club.homePlaceId !== kilde.placeId) {
      stopp(`klubben har homePlaceId \`${club.homePlaceId}\`, kildefila sier \`${kilde.placeId}\` — en supplering kan ikke flytte banen`);
    }
  } else {
    if (club.playerPoolStatus === "ready") {
      stopp(`klubben \`${kilde.clubId}\` står allerede som \`ready\` — en ny import ville skrevet over en ferdig arv. Bruk --suppler for å fylle på.`);
    }
    if (club.homePlaceId && club.homePlaceId !== kilde.placeId) {
      stopp(`klubben har allerede homePlaceId \`${club.homePlaceId}\`, kildefila sier \`${kilde.placeId}\` — homePlaceId er permanent og byttes ikke av en import`);
    }
  }
  const stedFinnes = placeUnlocks.some((e) => e.placeId === kilde?.placeId);
  if (suppler && !stedFinnes) {
    stopp(`stedet \`${kilde.placeId}\` finnes ikke i unlock-katalogen — det er ingen arv å supplere`);
  }
  if (!suppler && stedFinnes) {
    stopp(`stedet \`${kilde.placeId}\` finnes allerede i unlock-katalogen`);
  }
  if (kilde?.doc && !docExists(kilde.doc)) {
    advarsler.push(`kildepass-dokumentet \`${kilde.doc}\` finnes ikke ennå — det må skrives før importen merges`);
  }

  // -- hver rad, uten å reparere noe --
  const sette = new Map();
  const rader = [];
  (kilde?.players || []).forEach((rad, i) => {
    const merke = `players[${i}]`;
    if (!rad || typeof rad.name !== "string" || !rad.name.trim()) {
      stopp(`${merke}: \`name\` mangler`);
      return;
    }
    const navn = rad.name.trim();
    const id = slugify(navn);
    if (!id) {
      stopp(`${merke}: «${navn}» gir tom id`);
      return;
    }

    for (const felt of ALDRI_FRA_IMPORT) {
      if (Array.isArray(rad[felt]) && rad[felt].length > 0) {
        stopp(`${merke} (${navn}): \`${felt}\` kan ikke settes av en import — claimet hører til P1-overlayet med \`claim\` og \`source\``);
      }
    }

    const posisjoner = Array.isArray(rad.positions) ? rad.positions : [];
    for (const pos of posisjoner) {
      if (!POSISJONER.has(pos)) {
        stopp(`${merke} (${navn}): ukjent posisjon ${JSON.stringify(pos)} — kilden må oversettes av den som leser den`);
      }
    }
    // Koherensregelen fra P3: en keeper er en sperre i posisjonslista, ikke én
    // av elleve verdier. Uten den gir usablePositions positionFit 78, og
    // motoren ville stilt en navngitt keeper på midtbanen uten å flagge det.
    if (posisjoner.includes(GK) && posisjoner.some((p) => UTESPILLER.includes(p))) {
      stopp(`${merke} (${navn}): GK står sammen med utespillerposisjon — en kilde som sier begge deler beskriver to menn eller er lest feil`);
    }

    // Gruppeposisjon. Enten sier kilden hvilken posisjon mannen spilte, eller
    // bare hvilken lagdel — aldri begge, for da er det to ulike påstander og
    // kilden må si hvilken som gjelder.
    const gruppe = typeof rad.positionGroup === "string" ? rad.positionGroup.trim() : null;
    if (gruppe && !Object.hasOwn(GRUPPEPOSISJONER, gruppe)) {
      stopp(`${merke} (${navn}): ukjent lagdel ${JSON.stringify(gruppe)} — gyldige er ${Object.keys(GRUPPEPOSISJONER).join(", ")}. En kilde som sier «keeper» gir en presis posisjon (GK), ikke en lagdel`);
    }
    if (gruppe && posisjoner.length > 0) {
      stopp(`${merke} (${navn}): både \`positions\` og \`positionGroup\` er satt — kilden sier enten posisjon eller lagdel, ikke begge`);
    }

    const era = rad.era ?? kilde.defaultEra ?? null;
    if (!era || !EPOKER.has(era)) {
      stopp(`${merke} (${navn}): \`era\` må være "historical" eller "modern"`);
    }

    if (sette.has(id)) {
      stopp(`${merke} (${navn}): id \`${id}\` er allerede brukt av «${sette.get(id)}» i samme fil`);
      return;
    }
    sette.set(id, navn);

    rader.push({
      id,
      navn,
      posisjoner,
      gruppe,
      era,
      krysskobling: rad.crossLink === true,
      existingId: typeof rad.existingId === "string" ? rad.existingId.trim() : null
    });
  });

  // -- kollisjoner. En kollisjon er ikke en feil i seg selv; den er en
  //    avgjørelse, og avgjørelsen skal stå navngitt i kildefila. --
  const påId = new Map(players.map((p) => [p.id, p]));
  const påNavn = new Map();
  for (const p of players) {
    const nøkkel = navnenokkel(p.name);
    if (!påNavn.has(nøkkel)) påNavn.set(nøkkel, []);
    påNavn.get(nøkkel).push(p);
  }

  const nye = [];
  const krysskoblinger = [];
  const gjensyn = [];
  const iArven = suppler
    ? players.filter((p) => (p.clubAffiliations || []).some((a) => a.clubId === kilde.clubId))
    : [];
  for (const rad of rader) {
    if (rad.krysskobling) {
      if (!rad.existingId) {
        stopp(`${rad.navn}: merket \`crossLink\` uten \`existingId\` — hver kobling skal navngis`);
        continue;
      }
      const eksisterende = påId.get(rad.existingId);
      if (!eksisterende) {
        stopp(`${rad.navn}: \`existingId\` \`${rad.existingId}\` finnes ikke i katalogen`);
        continue;
      }
      // En krysskobling til en mann som ALT står i arven er ikke en ny
      // påstand — den er den samme påstanden en gang til. Uten dette ble han
      // talt to ganger og fikk `clubAffiliations` med samme klubb to steder,
      // som `sync-club-affiliations` og `sim:club-squad` begge feller ved
      // neste kjøring — altså et sted som ikke peker tilbake på importen.
      // Åtte profiler traff dette i Wikipedia-passet. Behandles som gjensyn,
      // slik at en kildefil kan kjøres om igjen uten å endre katalogen.
      if ((eksisterende.clubAffiliations || []).some((a) => a.clubId === kilde.clubId)) {
        gjensyn.push({ navn: rad.navn, id: eksisterende.id });
        continue;
      }
      krysskoblinger.push({ ...rad, eksisterende });
      continue;
    }

    const treff = påNavn.get(navnenokkel(rad.navn)) || [];

    // I supplerings-modus er en spiller som ALT står i arven ikke en kollisjon,
    // men et gjensyn: kilden er den samme troppen en sesong senere. Han hoppes
    // over og telles, slik at rapporten sier hvor mye av troppen som var ny.
    const alleredeIArven = treff.filter((p) => (p.clubAffiliations || [])
      .some((a) => a.clubId === kilde.clubId));
    if (suppler && alleredeIArven.length > 0) {
      gjensyn.push({ navn: rad.navn, id: alleredeIArven[0].id });
      continue;
    }

    // Mellomnavnvarianten stopper importen i stedet for å bli hoppet over.
    // Skriptet KAN ikke avgjøre om «Iver Krogh Hagen» er «Iver Hagen» med
    // mellomnavn eller en annen mann — men det kan nekte å gjette, og det er
    // forskjellen på to halve karrierer og én hel.
    //
    // Sjekken gjelder HELE KATALOGEN, ikke bare denne arven. Første utgave så
    // bare i arven, fordi feilen ble funnet der. Wikipedia-passet viste hvorfor
    // det var for smalt: «Joachim Olufsen» skulle inn i Stjørdals-Blink, mens
    // `joachim_erlend_olufsen` sto under Rana — ingen felles arv, ingen
    // navnetreff, og importen ville laget mannen på nytt. Eksaktnavn-sjekken
    // under har alltid vært katalogomfattende; denne skal være det samme.
    {
      const ledd = navneledd(rad.navn);
      const nesten = players.filter((p) => erMellomnavnVariant(ledd, navneledd(p.name)));
      if (nesten.length > 0) {
        const iDenneArven = nesten.some((p) => (p.clubAffiliations || [])
          .some((a) => a.clubId === kilde.clubId));
        stopp(
          `${rad.navn}: katalogen har allerede ${nesten.map((p) => `«${p.name}» (\`${p.id}\`)`).join(", ")}, `
          + "som skiller seg med ett navneledd. "
          + (iDenneArven
            ? "Er det samme mann, utelat raden — han står der alt. "
            : "Er det samme mann, sett `crossLink: true` og `existingId`. ")
          + "Er det to menn, må navnet få et skille, slik `tore_pedersen_rbk` og `sverre_andersen_odd` har."
        );
        continue;
      }
    }

    if (treff.length > 0) {
      stopp(
        `${rad.navn}: finnes allerede i katalogen som ${treff.map((p) => `\`${p.id}\``).join(", ")}. `
        + "Er det samme mann, sett `crossLink: true` og `existingId`; er det en navnebror, "
        + "må kilden si det og navnet trenger et skille."
      );
      continue;
    }
    if (påId.has(rad.id)) {
      stopp(`${rad.navn}: id \`${rad.id}\` er opptatt av en profil med et annet navn`);
      continue;
    }
    nye.push(rad);
  }

  if (feil.length > 0) return { feil, advarsler };

  // -- resultatet --
  const profiler = nye.map((rad) => byggProfil(rad, kilde));
  // Spillbar = har en posisjon motoren kan stille ham i, enten naturlig eller
  // brukbar. Det er samme regel som `isSimulationReadyPlayer`, og den er grunnen
  // til at en gruppeposisjon i `usablePositions` faktisk gjør profilen valgbar.
  const spillbare = profiler
    .filter((p) => p.naturalPositions.length > 0 || p.usablePositions.length > 0)
    .map((p) => p.id);

  // Krysskoblede profiler teller med i klubbpoolen, og de som har posisjon fra
  // før er også spillbare der. Banen åpner poolen, så de hører med i unlocks.
  const krysskobletSpillbare = krysskoblinger
    .filter(({ eksisterende }) =>
      [...(eksisterende.naturalPositions || []), ...(eksisterende.usablePositions || [])].length > 0)
    .map(({ eksisterende }) => eksisterende.id);

  const alleSpillbare = [...spillbare, ...krysskobletSpillbare].sort();
  const tilfort = profiler.length + krysskoblinger.length;

  // I supplerings-modus er tallene arvens TOTAL, ikke det denne kjøringen la
  // til. De regnes fra katalogen, ikke fra kildefila, slik at de blir de samme
  // som `sync-club-affiliations` og `audit:club-heritage` kommer fram til.
  const iArvenFraFor = players.filter((p) => (p.clubAffiliations || [])
    .some((a) => a.clubId === kilde.clubId));
  const spillbarFraFor = iArvenFraFor.filter((p) =>
    [...(p.naturalPositions || []), ...(p.usablePositions || [])].length > 0);
  const dokumentert = suppler ? iArvenFraFor.length + tilfort : tilfort;
  const spillbarTotalt = suppler ? spillbarFraFor.length + alleSpillbare.length : alleSpillbare.length;
  // `nye` i ARVER-raden er profilene arven eier ALENE, målt på sourcePlaceIds —
  // og `krysskoblet` er resten. Begge må derfor telle det som alt står der.
  const eksklusiveFraFor = suppler
    ? iArvenFraFor.filter((p) => (p.sourcePlaceIds || []).includes(kilde.placeId)).length
    : 0;
  const krysskobletFraFor = suppler
    ? iArvenFraFor.filter((p) => !(p.sourcePlaceIds || []).includes(kilde.placeId)).map((p) => p.id).sort()
    : [];

  // Ikke en feil — en import med for få spillbare er et gyldig utfall, og
  // klubben blir stående `pending`. Men det skal stå i klartekst, ikke oppdages
  // først når noen lurer på hvorfor klubben ikke kan overtas.
  if (spillbarTotalt < MIN_POOL) {
    advarsler.push(
      `bare ${spillbarTotalt} av ${dokumentert} profiler har kildebelagt posisjon. `
      + `Det trengs ${MIN_POOL} for en spillbar pool, så klubben blir stående \`pending\` `
      + "og kan ikke overtas. Importen er fortsatt gyldig — profilene bevares som historikkposter."
    );
  }

  // En supplering OPPRETTER ikke stedet — det finnes, og notatet der er skrevet
  // av den opprinnelige importen. Den legger bare til unlocks for de nye
  // spillbare profilene.
  const place = suppler
    ? { placeId: kilde.placeId, leggTilUnlocks: alleSpillbare }
    : {
      placeId: kilde.placeId,
      placeName: kilde.placeName,
      placeRole: "historical_club_ground_source",
      notes: kilde.placeNotes
        || `Klubbanlegg: ${club.name}s hjemmebane. ${dokumentert} dokumenterte klubbprofiler bevares i historikkatalogen; banen åpner bare de ${alleSpillbare.length} profilene som har kildebelagt posisjon og derfor kan brukes i simuleringen.`,
      unlocks: alleSpillbare.map((id) => ({ type: "player_candidate", targetId: id }))
    };

  return {
    feil,
    advarsler,
    profiler,
    krysskoblinger,
    place,
    clubPatch: {
      homePlaceId: kilde.placeId,
      playerPoolSize: dokumentert,
      playablePlayerPoolSize: spillbarTotalt,
      // `playerPoolStatus` er UTLEDET, ikke valgt: `sync-club-affiliations.mjs`
      // regner den som `playable >= MIN_POOL` og kjører i CI som drift-sjekk.
      // En import som satte «ready» ubetinget ville felt den vakten for enhver
      // klubb med under femten spillbare — og påstått at en pool som ikke kan
      // stille et lag er ferdig.
      playerPoolStatus: spillbarTotalt >= MIN_POOL ? "ready" : "pending"
    },
    rapport: {
      klubb: kilde.clubId,
      sted: kilde.placeId,
      // Alle fire tallene er ARVENS totaler, slik `audit:club-heritage` regner
      // dem — ikke det denne kjøringen la til. `tilfort` og `gjensyn` sier hva
      // kjøringen selv gjorde.
      dokumentert,
      spillbar: spillbarTotalt,
      historikkposter: dokumentert - spillbarTotalt,
      nye: eksklusiveFraFor + profiler.length,
      krysskoblet: [...krysskobletFraFor, ...krysskoblinger.map((k) => k.existingId)],
      eraSource: kilde.eraSource,
      kilder: kilde.sources.length,
      ...(suppler ? { tilfort, gjensyn: gjensyn.length } : {})
    }
  };
}

// ---------------------------------------------------------------------------
// Anvend planen på kataloger i minnet. Skilt fra `planImport` slik at en
// tørrkjøring aldri kan komme til å mutere noe.
// ---------------------------------------------------------------------------
export function applyImport({ plan, kilde, clubs, players, placeUnlocks }) {
  players.push(...plan.profiler);
  for (const { existingId } of plan.krysskoblinger) {
    const mål = players.find((p) => p.id === existingId);
    mål.clubAffiliations = mål.clubAffiliations || [];
    if (!mål.clubAffiliations.some((a) => a.clubId === kilde.clubId)) {
      mål.clubAffiliations.push({ clubId: kilde.clubId, relation: "played_for", status: "club_profile", source: "belagt" });
      // Rekkefølgen eies av `sync-club-affiliations.mjs`, som sorterer
      // alfabetisk på clubId og kjører i CI som en drift-sjekk. En krysskobling
      // lagt bakerst ville felt den sjekken ved neste import, ikke ved denne.
      mål.clubAffiliations.sort((a, b) => a.clubId.localeCompare(b.clubId));
    }
    // `sourcePlaceIds` røres ikke: krysskoblingen beholder sin egen arv, slik
    // at den frosne P1-nevneren står urørt.
  }
  if (plan.place.leggTilUnlocks) {
    // Supplering: stedet finnes, og bare de nye spillbare legges til. Lista
    // sorteres etter innsetting, slik at `audit:club-heritage` kan sammenligne
    // banens unlocks med den spillbare poolen uten å bry seg om rekkefølgen.
    const sted = placeUnlocks.find((e) => e.placeId === plan.place.placeId);
    const fra_for = new Set(sted.unlocks.map((u) => u.targetId));
    for (const id of plan.place.leggTilUnlocks) {
      if (!fra_for.has(id)) sted.unlocks.push({ type: "player_candidate", targetId: id });
    }
    sted.unlocks.sort((a, b) => a.targetId.localeCompare(b.targetId));
  } else {
    placeUnlocks.push(plan.place);
  }
  Object.assign(clubs.find((c) => c.id === kilde.clubId), plan.clubPatch);
}

export function arverRad(kilde, rapport) {
  return `  {
    clubId: ${JSON.stringify(kilde.clubId)},
    placeId: ${JSON.stringify(kilde.placeId)},
    dokumentert: ${rapport.dokumentert},
    spillbar: ${rapport.spillbar},
    nye: ${rapport.nye},
    krysskoblet: ${JSON.stringify(rapport.krysskoblet)},
    eraSource: ${JSON.stringify(kilde.eraSource)},
    doc: ${JSON.stringify(kilde.doc)}
  },`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  const skriv = args.includes("--write");
  const modus = args.includes("--suppler") ? "suppler" : "ny";
  const filsti = args.find((a) => !a.startsWith("--"));
  if (!filsti) {
    console.error(`Bruk: node scripts/import-club-heritage.mjs <kildefil.json> [--suppler] [--write]

  (uten flagg)  ny arv: klubben må være \`pending\` og stedet må ikke finnes
  --suppler     fyll på en ferdig arv: klubben må være \`ready\`, stedet må finnes,
                og spillere som alt står i arven hoppes over`);
    process.exit(1);
  }

  const absolutt = path.resolve(filsti);
  if (!fs.existsSync(absolutt)) {
    console.error(`Kildefil finnes ikke: ${absolutt}`);
    process.exit(1);
  }
  let kilde;
  try {
    kilde = JSON.parse(fs.readFileSync(absolutt, "utf8"));
  } catch (error) {
    console.error(`Kildefila er ikke gyldig JSON: ${error.message}`);
    process.exit(1);
  }

  const klubbfil = path.join(ROOT, "data/football_clubs.json");
  const spillerfil = path.join(ROOT, "data/football_players.json");
  const unlockfil = path.join(ROOT, "data/football_unlocks.json");

  const klubbdata = JSON.parse(fs.readFileSync(klubbfil, "utf8"));
  const spillerdata = JSON.parse(fs.readFileSync(spillerfil, "utf8"));
  const unlockdata = JSON.parse(fs.readFileSync(unlockfil, "utf8"));

  const plan = planImport({
    kilde,
    clubs: klubbdata.clubs,
    players: spillerdata.players,
    placeUnlocks: unlockdata.placeUnlocks,
    docExists: (doc) => fs.existsSync(path.join(ROOT, doc)),
    modus
  });

  if (plan.feil.length > 0) {
    console.error(`\nImporten er stoppet av ${plan.feil.length} avklaring${plan.feil.length === 1 ? "" : "er"}:\n`);
    for (const f of plan.feil) console.error(`  · ${f}`);
    console.error("\nIngenting er skrevet. Hvert punkt over er en avgjørelse kilden må ta, ikke en verdi skriptet kan velge.\n");
    process.exit(1);
  }

  console.log(JSON.stringify(plan.rapport, null, 2));

  if (plan.advarsler.length > 0) {
    console.log("\nÅ rydde før merge:");
    for (const a of plan.advarsler) console.log(`  · ${a}`);
  }

  console.log("\nRaden som skal inn i ARVER i scripts/audit-club-heritage.mjs:\n");
  console.log(arverRad(kilde, plan.rapport));

  if (!skriv) {
    console.log("\nTørrkjøring — ingenting er skrevet. Kjør på nytt med --write når raden og tallene stemmer.\n");
    return;
  }

  applyImport({
    plan, kilde,
    clubs: klubbdata.clubs,
    players: spillerdata.players,
    placeUnlocks: unlockdata.placeUnlocks
  });

  fs.writeFileSync(spillerfil, `${JSON.stringify(spillerdata, null, 2)}\n`);
  fs.writeFileSync(unlockfil, `${JSON.stringify(unlockdata, null, 2)}\n`);
  fs.writeFileSync(klubbfil, `${JSON.stringify(klubbdata, null, 2)}\n`);

  console.log("\nSkrevet. Legg raden over inn i ARVER og kjør `npm run audit:club-heritage`.\n");
}

if (import.meta.url === `file://${process.argv[1]}`) main();

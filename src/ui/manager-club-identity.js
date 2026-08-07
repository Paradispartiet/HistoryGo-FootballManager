// ============================================================================
// Autentisk klubbidentitet v1
//
// Dette er HGFM sitt VISUELLE identitetslag for de etablerte klubbene i
// data/football_clubs.json. Stadion, by, nivå og klubbnavn eies fortsatt av den
// canonical klubbfila. Her ligger kun presentasjonsdata som ikke skal påvirke
// motor, progresjon eller lagring.
//
// `primary` følger klubbens registrerte/gjenkjennelige hjemmedraktfarge. Hexene
// er HGFM-skjermtoner, ikke offisielle merkevareverdier. `secondary`, `motif` og
// `frame` er HGFM-grafikk for å skape egne klubbskjold uten å kopiere offisielle
// logoer eller emblemer.
// ============================================================================

const DEFAULT_VISUAL_IDENTITY = Object.freeze({
  primary: "#f5f7f6",
  secondary: "#171b19",
  motif: "band",
  frame: "shield"
});

export const CLUB_VISUAL_IDENTITIES = Object.freeze({
  bodo_glimt: Object.freeze({ primary: "#f1d62b", secondary: "#11151b", motif: "bars", frame: "shield" }),
  viking: Object.freeze({ primary: "#17365f", secondary: "#f6f7f8", motif: "band", frame: "shield" }),
  brann: Object.freeze({ primary: "#c51f30", secondary: "#f6f7f8", motif: "split", frame: "badge" }),
  molde: Object.freeze({ primary: "#3d8ed0", secondary: "#f6f7f8", motif: "band", frame: "shield" }),
  rosenborg: Object.freeze({ primary: "#f4f4f1", secondary: "#151719", motif: "bars", frame: "badge" }),
  tromso: Object.freeze({ primary: "#c82032", secondary: "#f6f7f8", motif: "split", frame: "shield" }),
  fredrikstad: Object.freeze({ primary: "#d3202d", secondary: "#f6f7f8", motif: "band", frame: "badge" }),
  valerenga: Object.freeze({ primary: "#24539a", secondary: "#cf2435", motif: "split", frame: "shield" }),
  lillestrom: Object.freeze({ primary: "#f0d226", secondary: "#151719", motif: "bars", frame: "badge" }),
  sarpsborg08: Object.freeze({ primary: "#2d6eb5", secondary: "#f6f7f8", motif: "band", frame: "shield" }),
  kristiansund: Object.freeze({ primary: "#233f76", secondary: "#f6f7f8", motif: "split", frame: "badge" }),
  start: Object.freeze({ primary: "#efd321", secondary: "#16191d", motif: "chevron", frame: "shield" }),
  aalesund: Object.freeze({ primary: "#e36f25", secondary: "#214b7d", motif: "split", frame: "badge" }),
  hamkam: Object.freeze({ primary: "#23824a", secondary: "#f6f7f8", motif: "bars", frame: "shield" }),
  sandefjord: Object.freeze({ primary: "#27528e", secondary: "#cf2937", motif: "split", frame: "badge" }),
  kfum: Object.freeze({ primary: "#f4f4f1", secondary: "#c92335", motif: "bars", frame: "shield" }),
  odd: Object.freeze({ primary: "#f4f4f1", secondary: "#151719", motif: "split", frame: "shield" }),
  stromsgodset: Object.freeze({ primary: "#24466f", secondary: "#f6f7f8", motif: "band", frame: "badge" }),
  haugesund: Object.freeze({ primary: "#f4f4f1", secondary: "#275796", motif: "split", frame: "shield" }),
  stabak: Object.freeze({ primary: "#24579a", secondary: "#151719", motif: "bars", frame: "badge" }),
  lyn: Object.freeze({ primary: "#cf2533", secondary: "#f6f7f8", motif: "band", frame: "shield" }),
  sogndal: Object.freeze({ primary: "#f4f4f1", secondary: "#151719", motif: "band", frame: "badge" }),
  ranheim: Object.freeze({ primary: "#2e63a8", secondary: "#f6f7f8", motif: "bars", frame: "shield" }),
  bryne: Object.freeze({ primary: "#ca2533", secondary: "#f6f7f8", motif: "split", frame: "badge" }),
  egersund: Object.freeze({ primary: "#efce29", secondary: "#16191d", motif: "bars", frame: "shield" }),
  asane: Object.freeze({ primary: "#e6752b", secondary: "#16191d", motif: "band", frame: "badge" }),
  raufoss: Object.freeze({ primary: "#efd227", secondary: "#16191d", motif: "split", frame: "shield" }),
  kongsvinger: Object.freeze({ primary: "#cf2533", secondary: "#f6f7f8", motif: "bars", frame: "badge" }),
  hodd: Object.freeze({ primary: "#3269ad", secondary: "#f6f7f8", motif: "band", frame: "shield" }),
  moss: Object.freeze({ primary: "#efd126", secondary: "#16191d", motif: "chevron", frame: "badge" }),
  sandnes_ulf: Object.freeze({ primary: "#73b9e6", secondary: "#f6f7f8", motif: "band", frame: "shield" }),
  strommen: Object.freeze({ primary: "#7f848b", secondary: "#f6f7f8", motif: "split", frame: "badge" }),
  arendal: Object.freeze({ primary: "#f4f4f1", secondary: "#245b96", motif: "band", frame: "shield" }),
  jerv: Object.freeze({ primary: "#efd126", secondary: "#29548d", motif: "split", frame: "badge" }),
  notodden: Object.freeze({ primary: "#2b61a7", secondary: "#f6f7f8", motif: "bars", frame: "shield" }),
  mjondalen: Object.freeze({ primary: "#6d4a36", secondary: "#f6f7f8", motif: "band", frame: "badge" }),
  pors: Object.freeze({ primary: "#2e64a6", secondary: "#f6f7f8", motif: "split", frame: "shield" }),
  brattvag: Object.freeze({ primary: "#efd126", secondary: "#1f4b7a", motif: "chevron", frame: "badge" }),
  eik_tonsberg: Object.freeze({ primary: "#f4f4f1", secondary: "#16191d", motif: "bars", frame: "shield" }),
  vidar: Object.freeze({ primary: "#cf2533", secondary: "#f6f7f8", motif: "band", frame: "badge" }),
  kvik_halden: Object.freeze({ primary: "#ce2835", secondary: "#f6f7f8", motif: "bars", frame: "shield" }),
  sandviken: Object.freeze({ primary: "#f4f4f1", secondary: "#343a42", motif: "split", frame: "badge" }),
  lysekloster: Object.freeze({ primary: "#f4f4f1", secondary: "#16191d", motif: "band", frame: "shield" }),
  sotra: Object.freeze({ primary: "#2e64a6", secondary: "#f6f7f8", motif: "bars", frame: "badge" }),
  traff: Object.freeze({ primary: "#f4f4f1", secondary: "#2c7a4d", motif: "split", frame: "shield" }),
  bjarg: Object.freeze({ primary: "#2f66a8", secondary: "#f6f7f8", motif: "band", frame: "badge" }),
  skeid: Object.freeze({ primary: "#cf2533", secondary: "#294c83", motif: "split", frame: "shield" }),
  honefoss: Object.freeze({ primary: "#f4f4f1", secondary: "#2c7a4d", motif: "band", frame: "badge" }),
  ull_kisa: Object.freeze({ primary: "#efd126", secondary: "#397349", motif: "chevron", frame: "shield" }),
  levanger: Object.freeze({ primary: "#f4f4f1", secondary: "#c92a37", motif: "split", frame: "badge" }),
  kjelsas: Object.freeze({ primary: "#2f63a7", secondary: "#f6f7f8", motif: "bars", frame: "shield" }),
  grorud: Object.freeze({ primary: "#efd126", secondary: "#28558b", motif: "band", frame: "badge" }),
  tromsdalen: Object.freeze({ primary: "#2e63a8", secondary: "#c92b3a", motif: "split", frame: "shield" }),
  stjordals_blink: Object.freeze({ primary: "#ca2937", secondary: "#16191d", motif: "bars", frame: "badge" }),
  rana: Object.freeze({ primary: "#20395f", secondary: "#f6f7f8", motif: "band", frame: "shield" }),
  junkeren: Object.freeze({ primary: "#f4f4f1", secondary: "#2f64a6", motif: "split", frame: "badge" }),
  lorenskog: Object.freeze({ primary: "#2f61a0", secondary: "#c92b3a", motif: "band", frame: "shield" }),
  eidsvold_turn: Object.freeze({ primary: "#2d63a5", secondary: "#f6f7f8", motif: "bars", frame: "badge" }),
  follo: Object.freeze({ primary: "#7bc2e9", secondary: "#f6f7f8", motif: "split", frame: "shield" }),
  trygg_lade: Object.freeze({ primary: "#f4f4f1", secondary: "#343a42", motif: "band", frame: "badge" }),
});

const SVG_NS = "http://www.w3.org/2000/svg";

function ensureClubIdentityStylesheet() {
  if (typeof document === "undefined" || document.getElementById("manager-club-identity-v1-style")) return;
  const link = document.createElement("link");
  link.id = "manager-club-identity-v1-style";
  link.rel = "stylesheet";
  link.href = new URL("./manager-club-identity-v1.css", import.meta.url).href;
  document.head.append(link);
}

function initials(name) {
  const words = String(name || "HG").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "HG";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

export function getClubVisualIdentity(clubId) {
  const identity = CLUB_VISUAL_IDENTITIES[String(clubId || "")] || DEFAULT_VISUAL_IDENTITY;
  return { ...identity, isEstablished: Boolean(CLUB_VISUAL_IDENTITIES[String(clubId || "")]) };
}

function framePath(frame) {
  if (frame === "badge") return "M32 3 57 12v30c0 14-9 23-25 30C16 65 7 56 7 42V12Z";
  return "M7 5h50v36c0 15-9 25-25 31C16 66 7 56 7 41Z";
}

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function appendMotif(svg, motif, secondary) {
  if (motif === "bars") {
    [20, 32, 44].forEach((x) => svg.append(svgNode("path", {
      d: `M${x} 12v40`,
      stroke: secondary,
      "stroke-width": "6",
      "stroke-linecap": "round",
      opacity: "0.92"
    })));
    return;
  }
  if (motif === "split") {
    svg.append(svgNode("path", {
      d: "M32 7h22v34c0 11-6 19-22 26Z",
      fill: secondary,
      opacity: "0.92"
    }));
    return;
  }
  if (motif === "chevron") {
    svg.append(svgNode("path", {
      d: "M13 25 32 42 51 25",
      fill: "none",
      stroke: secondary,
      "stroke-width": "8",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      opacity: "0.94"
    }));
    return;
  }
  svg.append(svgNode("path", {
    d: "M10 28h44v13H10Z",
    fill: secondary,
    opacity: "0.92"
  }));
}

function createCrest(view) {
  const svg = svgNode("svg", {
    viewBox: "0 0 64 76",
    role: "img",
    "aria-label": `HGFM-klubbskjold for ${view.rawName}`,
    focusable: "false"
  });
  svg.classList.add("hgfm-club-crest");

  const frame = framePath(view.crest.frame);
  svg.append(svgNode("path", {
    d: frame,
    fill: view.accent,
    stroke: "rgba(255,255,255,.84)",
    "stroke-width": "2"
  }));
  appendMotif(svg, view.crest.motif, view.secondary);

  const monogram = svgNode("text", {
    x: "32",
    y: "39",
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    fill: "#fff",
    stroke: "rgba(0,0,0,.7)",
    "stroke-width": "3",
    "paint-order": "stroke",
    "font-size": "17",
    "font-weight": "1000",
    "letter-spacing": "1"
  });
  monogram.textContent = view.monogram;
  svg.append(monogram);

  const signature = svgNode("text", {
    x: "32",
    y: "59",
    "text-anchor": "middle",
    fill: "#fff",
    stroke: "rgba(0,0,0,.55)",
    "stroke-width": "2",
    "paint-order": "stroke",
    "font-size": "5.5",
    "font-weight": "900",
    "letter-spacing": "1.4"
  });
  signature.textContent = "HGFM";
  svg.append(signature);
  return svg;
}

export function createClubIdentityView({ clubName, clubId, ground, city, leagueName, temporary = false } = {}) {
  const visual = getClubVisualIdentity(clubId);
  const location = [ground, city].filter(Boolean).join(" · ");
  const rawName = String(clubName || "HG Football Manager");
  return {
    rawName,
    name: temporary ? `${rawName} (midlertidig navn)` : rawName,
    monogram: initials(rawName),
    accent: visual.primary,
    secondary: visual.secondary,
    crest: { frame: visual.frame, motif: visual.motif },
    isEstablished: visual.isEstablished,
    groundLine: location || leagueName || "",
    ariaLabel: `${rawName} klubbidentitet`
  };
}

export function renderClubIdentity(root, view) {
  if (!root || !view) return;
  ensureClubIdentityStylesheet();
  const targets = [document.documentElement, document.body, root].filter(Boolean);
  targets.forEach((target) => {
    target.style.setProperty("--club-accent", view.accent);
    target.style.setProperty("--club-secondary", view.secondary);
  });
  if (document.body) {
    document.body.dataset.clubIdentity = view.isEstablished ? "established" : "custom";
  }

  root.setAttribute("aria-label", view.ariaLabel);
  const mark = root.querySelector("#headerClubMark");
  const name = root.querySelector("#headerClubName");
  const ground = root.querySelector("#headerClubGround");
  if (mark) {
    mark.replaceChildren(createCrest(view));
    mark.dataset.clubIdentity = view.isEstablished ? "established" : "custom";
  }
  if (name) name.textContent = view.name;
  if (ground) {
    ground.textContent = view.groundLine;
    ground.hidden = !view.groundLine;
  }
}

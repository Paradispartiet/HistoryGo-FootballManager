const CLUB_PALETTES = Object.freeze([
  ["#f5f7f6", "#171b19"],
  ["#56d98a", "#07150d"],
  ["#7fb4ff", "#07101d"],
  ["#f07d7d", "#1d0808"],
  ["#d7b765", "#171205"],
  ["#b597f6", "#110a1d"]
]);

function stableIndex(value, size) {
  let hash = 0;
  for (const char of String(value || "hgfm")) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return hash % size;
}
function initials(name) {
  const words = String(name || "HG").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "HG";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

export function createClubIdentityView({ clubName, clubId, ground, city, leagueName, temporary = false } = {}) {
  const [accent, ink] = CLUB_PALETTES[stableIndex(clubId || clubName, CLUB_PALETTES.length)];
  const location = [ground, city].filter(Boolean).join(" · ");
  return {
    name: temporary ? `${clubName} (midlertidig navn)` : clubName,
    monogram: initials(clubName),
    accent,
    ink,
    groundLine: location || leagueName || "",
    ariaLabel: `${clubName} klubbidentitet`
  };
}

export function renderClubIdentity(root, view) {
  if (!root || !view) return;
  root.style.setProperty("--club-accent", view.accent);
  root.style.setProperty("--club-ink", view.ink);
  root.setAttribute("aria-label", view.ariaLabel);
  const mark = root.querySelector("#headerClubMark");
  const name = root.querySelector("#headerClubName");
  const ground = root.querySelector("#headerClubGround");
  if (mark) mark.textContent = view.monogram;
  if (name) name.textContent = view.name;
  if (ground) {
    ground.textContent = view.groundLine;
    ground.hidden = !view.groundLine;
  }
}

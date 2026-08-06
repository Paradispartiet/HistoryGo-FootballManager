import "./manager-squad-tactics-scene-v2.js";

// ============================================================================
// Lineup presentation helpers — qualitative manager language, no hidden overall.
// Pure functions: no DOM, state or engine ownership.
// ============================================================================

const FIT_BANDS = Object.freeze([
  { minimum: 90, label: "Svært godt samsvar", shortLabel: "Svært god", tone: "excellent" },
  { minimum: 75, label: "Godt samsvar", shortLabel: "God", tone: "good" },
  { minimum: 60, label: "Brukbart samsvar", shortLabel: "Brukbar", tone: "workable" },
  { minimum: 45, label: "Usikkert samsvar", shortLabel: "Usikker", tone: "risk" },
  { minimum: 0, label: "Feil rolle", shortLabel: "Feil", tone: "misused" }
]);

export function describeTacticalFit(fit = {}) {
  const numericScore = Number(fit?.matchScore);
  const hasScore = Number.isFinite(numericScore);
  const normalizedStatus = String(fit?.status || "").trim().toLowerCase();

  if (!hasScore) {
    return {
      label: "Ikke vurdert",
      shortLabel: "Åpen",
      tone: "empty",
      explanation: fit?.explanation || "Velg spiller og rolle for å vurdere rollebruken."
    };
  }

  const band = normalizedStatus.includes("feil")
    ? FIT_BANDS.at(-1)
    : FIT_BANDS.find((entry) => numericScore >= entry.minimum) || FIT_BANDS.at(-1);

  return {
    label: band.label,
    shortLabel: band.shortLabel,
    tone: band.tone,
    explanation: fit?.explanation || "Rollekravene vurderes mot spillerens dokumenterte profil."
  };
}

export function compactPlayerName(name) {
  const parts = String(name || "Tom plass").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(" ") || "Tom plass";
  return `${parts[0][0]}. ${parts.at(-1)}`;
}

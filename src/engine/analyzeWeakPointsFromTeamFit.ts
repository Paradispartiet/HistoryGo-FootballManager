// src/engine/analyzeWeakPointsFromTeamFit.ts
//
// Svakhetsanalyse avledet fra det LIVE teamFit-objektet (calculateTeamFit), slik
// at manager-detalj-panelets svakheter bygger på NØYAKTIG de samme metrikkene og
// vurderingene som headline (scorepanel + rapport + ellever). Den strukturerte
// analyzeWeakPoints (calculateTeamBalance/finalFit) finnes fortsatt for
// dashboard-pipeline-/sample-stien, men driver ikke lenger UI.
//
// Gir kategoriserte svakheter med alvorsgrad og et konkret treningsgrep – mer
// handlingsrettet enn rapportens prosatekst, og garantert konsistent med tallene
// som vises.

import type { TeamFit } from "./calculateTeamFit.js";

export type TeamFitWeakPointSeverity = "low" | "medium" | "high";

export type TeamFitWeakPoint = {
  code: string;
  categoryText: string;
  severity: TeamFitWeakPointSeverity;
  score: number;
  label: string;
  suggestedAction: string;
  relatedPlayerIds: string[];
};

const HIGH_WEAKNESS_LIMIT = 55;
const MEDIUM_WEAKNESS_LIMIT = 65;
const LOW_WEAKNESS_LIMIT = 72;

function getSeverity(score: number): TeamFitWeakPointSeverity {
  if (score < HIGH_WEAKNESS_LIMIT) {
    return "high";
  }
  if (score < MEDIUM_WEAKNESS_LIMIT) {
    return "medium";
  }
  return "low";
}

const SEVERITY_RANK: Record<TeamFitWeakPointSeverity, number> = { high: 3, medium: 2, low: 1 };

// Metrikk-drevne svakheter: kategori, kort etikett og konkret treningsgrep.
// Speiler vokabularet i den strukturerte analyzeWeakPoints, men sourcet fra
// teamFit.metrics.
const METRIC_WEAKNESSES: {
  code: string;
  metric: keyof TeamFit["metrics"];
  categoryText: string;
  label: string;
  suggestedAction: string;
}[] = [
  {
    code: "role_fit_weak",
    metric: "roleFitAverage",
    categoryText: "Rollefit",
    label: "Samlet rollefit er svak.",
    suggestedAction: "Se på de svakeste rollene og test alternative roller i samme posisjon.",
  },
  {
    code: "team_balance_weak",
    metric: "balanceScore",
    categoryText: "Lagbalanse",
    label: "Lagbalansen er svak.",
    suggestedAction: "Vurder en balanserende sekser eller tydeligere sikring bak friere roller.",
  },
  {
    code: "attack_weak",
    metric: "depthScore",
    categoryText: "Angrep",
    label: "Dybde-/angrepstrusselen er svak.",
    suggestedAction: "Sørg for minst én rolle som angriper bakrom, og koble skaper til løp.",
  },
  {
    code: "rest_defense_weak",
    metric: "restDefenseScore",
    categoryText: "Restforsvar",
    label: "Restforsvaret er sårbart.",
    suggestedAction: "Legg inn tydeligere sikring eller hold én back-side lavere ved angrep.",
  },
  {
    code: "build_up_weak",
    metric: "buildUpScore",
    categoryText: "Oppbygging",
    label: "Oppbyggingen er svak.",
    suggestedAction: "Legg inn dyp playmaker, ballspillende stopper eller sweeperkeeper.",
  },
  {
    code: "pressing_weak",
    metric: "pressScore",
    categoryText: "Press",
    label: "Presset henger dårlig sammen.",
    suggestedAction: "Senk presshøyden, eller legg inn flere roller som faktisk kan presse.",
  },
  {
    code: "width_weak",
    metric: "widthScore",
    categoryText: "Bredde",
    label: "Breddestrukturen er svak.",
    suggestedAction: "Bruk bred kant/overlappende back, eller velg en smalere taktikk.",
  },
  {
    code: "relationships_weak",
    metric: "relationshipScore",
    categoryText: "Relasjoner",
    label: "Rolle-relasjonene støtter ikke laget godt nok.",
    suggestedAction: "Gi nøkkelrollene medspillerne de trenger (løp, bredde, sikring, service).",
  },
];

export function analyzeWeakPointsFromTeamFit(
  teamFit: Pick<TeamFit, "metrics" | "completeCount" | "totalSlots" | "assignments" | "duplicatePlayers">,
): TeamFitWeakPoint[] {
  const weakPoints: TeamFitWeakPoint[] = [];

  // Fullføring.
  if (teamFit.completeCount < teamFit.totalSlots) {
    weakPoints.push({
      code: "incomplete_setup",
      categoryText: "Fullføring",
      severity: "high",
      score: 0,
      label: "Startelleveren er ikke komplett.",
      suggestedAction: `Fyll de resterende ${teamFit.totalSlots - teamFit.completeCount} plassene før vurderingen er pålitelig.`,
      relatedPlayerIds: [],
    });
  }

  // Metrikk-drevne svakheter.
  for (const definition of METRIC_WEAKNESSES) {
    const score = teamFit.metrics[definition.metric];
    if (typeof score === "number" && score > 0 && score < LOW_WEAKNESS_LIMIT) {
      weakPoints.push({
        code: definition.code,
        categoryText: definition.categoryText,
        severity: getSeverity(score),
        score,
        label: definition.label,
        suggestedAction: definition.suggestedAction,
        relatedPlayerIds: [],
      });
    }
  }

  // Feilbrukte spillere (samme fit-status som elleveren viser).
  const misused = teamFit.assignments.filter(
    (assignment) => assignment.isComplete && assignment.fit?.status === "feilbrukt",
  );
  if (misused.length > 0) {
    weakPoints.push({
      code: "misused_players",
      categoryText: "Feilbruk",
      severity: "high",
      score: 0,
      label:
        misused.length === 1
          ? "Én spiller er feilbrukt i oppsettet."
          : `${misused.length} spillere er feilbrukt i oppsettet.`,
      suggestedAction: "Endre rolle, posisjon eller taktikk så spillernes styrker kommer frem – feilbruk er en trenerfeil, ikke spillerfeil.",
      relatedPlayerIds: misused.map((assignment) => assignment.player?.id).filter((id): id is string => Boolean(id)),
    });
  }

  // Duplikatspillere.
  if (teamFit.duplicatePlayers.length > 0) {
    weakPoints.push({
      code: "duplicate_players",
      categoryText: "Duplikater",
      severity: "high",
      score: 0,
      label: "Samme spiller er brukt flere steder.",
      suggestedAction: "Hver spiller bør bare brukes én gang i elleveren.",
      relatedPlayerIds: teamFit.duplicatePlayers.map((player) => player.id).filter(Boolean),
    });
  }

  return weakPoints.sort((a, b) => {
    const severityDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    return severityDiff !== 0 ? severityDiff : a.score - b.score;
  });
}

// src/engine/createTrainingFocus.ts

import type {
  Score100,
} from "../domain/footballTypes.js";

import type {
  TeamSetupEvaluation,
} from "./evaluateTeamSetup.js";

import type {
  WeakPoint,
  WeakPointAnalysis,
  WeakPointCategory,
  WeakPointSeverity,
} from "./analyzeWeakPoints.js";

import { analyzeWeakPoints } from "./analyzeWeakPoints.js";

export type TrainingFocusArea =
  | "rolleforståelse"
  | "press"
  | "bredde"
  | "restforsvar"
  | "midtbanekontroll"
  | "angrepsstruktur"
  | "risikobalanse"
  | "lagstruktur"
  | "fullføring";

export type TrainingFocusIntensity =
  | "low"
  | "medium"
  | "high";

export type TrainingFocusItem = {
  code: string;
  area: TrainingFocusArea;
  intensity: TrainingFocusIntensity;
  priority: number;
  label: string;
  rationale: string;
  suggestedSession: string;
  relatedWeakPointCodes: string[];
  relatedPlayerIds: string[];
};

export type TrainingFocusPlan = {
  teamId: string;
  tacticId: string;

  focusItems: TrainingFocusItem[];

  primaryFocus: TrainingFocusItem | null;

  weeklyPlan: TrainingFocusItem[];

  summary: string;
};

const MAX_WEEKLY_FOCUS_ITEMS = 3;

function intensityFromSeverity(severity: WeakPointSeverity): TrainingFocusIntensity {
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function priorityFromSeverity(severity: WeakPointSeverity): number {
  if (severity === "high") return 1;
  if (severity === "medium") return 2;
  return 3;
}

function areaFromCategory(category: WeakPointCategory): TrainingFocusArea {
  if (category === "completion") return "fullføring";
  if (category === "role_fit") return "rolleforståelse";
  if (category === "pressing") return "press";
  if (category === "width") return "bredde";
  if (category === "defence") return "restforsvar";
  if (category === "midfield") return "midtbanekontroll";
  if (category === "attack") return "angrepsstruktur";
  if (category === "risk") return "risikobalanse";

  return "lagstruktur";
}

function sessionFromArea(area: TrainingFocusArea): string {
  if (area === "rolleforståelse") {
    return "Rolleøkt: gå gjennom hver spillers oppgaver i posisjon, med fokus på hva rollen skal gi laget.";
  }

  if (area === "press") {
    return "Pressøkt: tren på pressutløsere, avstander mellom ledd og når laget skal støte eller falle.";
  }

  if (area === "bredde") {
    return "Breddeøkt: tren på kantbruk, back-/vingrelasjoner og når laget skal holde bredde eller søke innover.";
  }

  if (area === "restforsvar") {
    return "Restforsvarsøkt: tren på sikring bak ballen, balanse ved backløp og posisjonering ved balltap.";
  }

  if (area === "midtbanekontroll") {
    return "Midtbaneøkt: tren på tempo, støttevinkler, sentral kontroll og hvem som skal styre spillet.";
  }

  if (area === "angrepsstruktur") {
    return "Angrepsøkt: tren på forholdet mellom skaper, romangriper og avslutter.";
  }

  if (area === "risikobalanse") {
    return "Risikobalanseøkt: tren på når laget kan ta risiko, og hvem som må holde igjen.";
  }

  if (area === "fullføring") {
    return "Oppsettøkt: fullfør elleveren og kontroller at alle roller peker til gyldige spillere.";
  }

  return "Strukturøkt: tren på lagdeler, avstander og hvordan rollene henger sammen.";
}

function labelFromArea(area: TrainingFocusArea): string {
  if (area === "rolleforståelse") return "Tren rolleforståelse.";
  if (area === "press") return "Tren press-sammenheng.";
  if (area === "bredde") return "Tren breddestruktur.";
  if (area === "restforsvar") return "Tren restforsvar og sikring.";
  if (area === "midtbanekontroll") return "Tren midtbanekontroll.";
  if (area === "angrepsstruktur") return "Tren angrepsstruktur.";
  if (area === "risikobalanse") return "Tren risikobalanse.";
  if (area === "fullføring") return "Fullfør lagoppsettet.";

  return "Tren lagstruktur.";
}

function focusCodeFromWeakPoint(weakPoint: WeakPoint): string {
  return `training_focus_${weakPoint.category}_${weakPoint.code}`;
}

function toTrainingFocusItem(weakPoint: WeakPoint): TrainingFocusItem {
  const area = areaFromCategory(weakPoint.category);

  return {
    code: focusCodeFromWeakPoint(weakPoint),
    area,
    intensity: intensityFromSeverity(weakPoint.severity),
    priority: priorityFromSeverity(weakPoint.severity),
    label: labelFromArea(area),
    rationale: weakPoint.rationale,
    suggestedSession: sessionFromArea(area),
    relatedWeakPointCodes: [weakPoint.code],
    relatedPlayerIds: weakPoint.relatedPlayerIds,
  };
}

function mergeFocusItems(items: TrainingFocusItem[]): TrainingFocusItem[] {
  const byArea = new Map<TrainingFocusArea, TrainingFocusItem>();

  for (const item of items) {
    const existing = byArea.get(item.area);

    if (!existing) {
      byArea.set(item.area, item);
      continue;
    }

    const merged: TrainingFocusItem = {
      ...existing,
      intensity: existing.priority <= item.priority ? existing.intensity : item.intensity,
      priority: Math.min(existing.priority, item.priority),
      rationale: `${existing.rationale} ${item.rationale}`,
      relatedWeakPointCodes: [
        ...new Set([
          ...existing.relatedWeakPointCodes,
          ...item.relatedWeakPointCodes,
        ]),
      ],
      relatedPlayerIds: [
        ...new Set([
          ...existing.relatedPlayerIds,
          ...item.relatedPlayerIds,
        ]),
      ],
    };

    byArea.set(item.area, merged);
  }

  return [...byArea.values()];
}

function sortFocusItems(items: TrainingFocusItem[]): TrainingFocusItem[] {
  return [...items].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    return b.relatedWeakPointCodes.length - a.relatedWeakPointCodes.length;
  });
}

function buildSummary(
  analysis: WeakPointAnalysis,
  focusItems: TrainingFocusItem[],
  setupScore: Score100,
): string {
  if (focusItems.length === 0) {
    return "Treningsplanen finner ingen tydelige prioriterte svakheter. Behold grunnstrukturen og bruk øktene til finjustering.";
  }

  const primary = focusItems[0];

  if (!primary) {
    return "Treningsplanen finner ingen tydelige prioriterte svakheter.";
  }

  if (analysis.highPriorityWeakPoints.length > 0) {
    return `Første treningsfokus bør være ${primary.area}. Setup-score er ${setupScore}, og laget har alvorlige svakheter som bør løses før finjustering.`;
  }

  if (analysis.mediumPriorityWeakPoints.length > 0) {
    return `Første treningsfokus bør være ${primary.area}. Laget fungerer, men treningen bør rette seg mot de tydeligste strukturelle svakhetene.`;
  }

  return `Første treningsfokus bør være ${primary.area}. Oppsettet er relativt stabilt, så treningen kan brukes til å forsterke detaljer.`;
}

export function createTrainingFocus(evaluation: TeamSetupEvaluation): TrainingFocusPlan {
  const analysis = analyzeWeakPoints(evaluation);

  const rawFocusItems = analysis.weakPoints.map(toTrainingFocusItem);
  const focusItems = sortFocusItems(mergeFocusItems(rawFocusItems));
  const weeklyPlan = focusItems.slice(0, MAX_WEEKLY_FOCUS_ITEMS);

  return {
    teamId: evaluation.teamId,
    tacticId: evaluation.tacticId,

    focusItems,

    primaryFocus: focusItems[0] ?? null,

    weeklyPlan,

    summary: buildSummary(
      analysis,
      focusItems,
      evaluation.setupScore,
    ),
  };
}

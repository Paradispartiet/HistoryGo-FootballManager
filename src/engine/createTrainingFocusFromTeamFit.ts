// src/engine/createTrainingFocusFromTeamFit.ts
//
// Treningsfokus avledet fra teamFit-svakhetene (analyzeWeakPointsFromTeamFit),
// slik at de foreslåtte øktene matcher NØYAKTIG de svakhetene manager-detalj-
// panelet ellers viser. Erstatter den strukturerte createTrainingFocus som
// UI-kilde for "engine_training"-øktene; den strukturerte finnes fortsatt for
// dashboard-pipeline-/sample-stien.

import type { TeamFit } from "./calculateTeamFit.js";
import { analyzeWeakPointsFromTeamFit, type TeamFitWeakPoint } from "./analyzeWeakPointsFromTeamFit.js";

export type TeamFitTrainingFocusItem = {
  areaText: string;
  suggestedSession: string;
  weakPointCode: string;
};

const MAX_FOCUS_ITEMS = 3;

// Svakhets-kode → treningsområde + økttekst (samme vokabular som den
// strukturerte createTrainingFocus).
const CODE_TO_FOCUS: Record<string, TeamFitTrainingFocusItem> = {
  incomplete_setup: {
    weakPointCode: "incomplete_setup",
    areaText: "Fullføring",
    suggestedSession: "Oppsettøkt: fullfør elleveren og kontroller at alle roller peker til gyldige spillere.",
  },
  role_fit_weak: {
    weakPointCode: "role_fit_weak",
    areaText: "Rolleforståelse",
    suggestedSession: "Rolleøkt: gå gjennom hver spillers oppgaver i posisjon, med fokus på hva rollen skal gi laget.",
  },
  misused_players: {
    weakPointCode: "misused_players",
    areaText: "Rolleforståelse",
    suggestedSession: "Rolleøkt: flytt feilbrukte spillere mot roller/posisjoner som får frem styrkene deres.",
  },
  team_balance_weak: {
    weakPointCode: "team_balance_weak",
    areaText: "Lagstruktur",
    suggestedSession: "Strukturøkt: tren på lagdeler, avstander og hvordan rollene henger sammen.",
  },
  relationships_weak: {
    weakPointCode: "relationships_weak",
    areaText: "Lagstruktur",
    suggestedSession: "Relasjonsøkt: tren på at nøkkelrollene får medspillerne de trenger (løp, bredde, sikring, service).",
  },
  duplicate_players: {
    weakPointCode: "duplicate_players",
    areaText: "Lagstruktur",
    suggestedSession: "Oppsettøkt: fordel spillerne slik at hver spiller bare brukes én gang.",
  },
  attack_weak: {
    weakPointCode: "attack_weak",
    areaText: "Angrepsstruktur",
    suggestedSession: "Angrepsøkt: tren på forholdet mellom skaper, romangriper og avslutter.",
  },
  rest_defense_weak: {
    weakPointCode: "rest_defense_weak",
    areaText: "Restforsvar",
    suggestedSession: "Restforsvarsøkt: tren på sikring bak ballen, balanse ved backløp og posisjonering ved balltap.",
  },
  build_up_weak: {
    weakPointCode: "build_up_weak",
    areaText: "Midtbanekontroll",
    suggestedSession: "Midtbaneøkt: tren på tempo, støttevinkler, sentral kontroll og hvem som skal styre spillet.",
  },
  pressing_weak: {
    weakPointCode: "pressing_weak",
    areaText: "Press",
    suggestedSession: "Pressøkt: tren på pressutløsere, avstander mellom ledd og når laget skal støte eller falle.",
  },
  width_weak: {
    weakPointCode: "width_weak",
    areaText: "Bredde",
    suggestedSession: "Breddeøkt: tren på kantbruk, back-/vingrelasjoner og når laget skal holde bredde eller søke innover.",
  },
};

export function createTrainingFocusFromTeamFit(
  teamFit: Parameters<typeof analyzeWeakPointsFromTeamFit>[0],
): TeamFitTrainingFocusItem[] {
  const weakPoints: TeamFitWeakPoint[] = analyzeWeakPointsFromTeamFit(teamFit);
  const items: TeamFitTrainingFocusItem[] = [];
  const seenAreas = new Set<string>();

  for (const weakPoint of weakPoints) {
    const focus = CODE_TO_FOCUS[weakPoint.code];
    if (!focus || seenAreas.has(focus.areaText)) {
      continue;
    }
    seenAreas.add(focus.areaText);
    items.push(focus);
    if (items.length >= MAX_FOCUS_ITEMS) {
      break;
    }
  }

  return items;
}

// src/engine/createLegacyManagerAppState.ts

import type {
  Role,
  Tactic,
  Team,
} from "../domain/footballTypes.js";

import type {
  ManagerAppState,
} from "./createManagerAppState.js";

import type {
  AdaptLegacyTacticInput,
  AdaptLegacyTeamInput,
  LegacyFootballFormation,
  LegacyFootballPlayer,
  LegacyFootballRole,
  LegacyFootballTactic,
  LegacyLineup,
} from "./adaptLegacyFootballData.js";

import type {
  FootballKnowledgePrinciple,
} from "../domain/footballKnowledgeTypes.js";

import {
  adaptLegacyRoles,
  adaptLegacyTactic,
  adaptLegacyTeam,
} from "./adaptLegacyFootballData.js";

import { createManagerAppState } from "./createManagerAppState.js";

export type LegacyManagerAppStateInput = {
  teamId: string;
  teamName: string;

  players: LegacyFootballPlayer[];
  roles: LegacyFootballRole[];

  tactic: LegacyFootballTactic;
  formation: LegacyFootballFormation;
  lineup: LegacyLineup;

  knowledgePrinciples?: FootballKnowledgePrinciple[];
};

export type LegacyManagerAppState = {
  teamId: string;
  tacticId: string;

  adaptedTeam: Team;
  adaptedRoles: Role[];
  adaptedTactic: Tactic;

  appState: ManagerAppState;

  summary: string;
};

function buildAdaptTeamInput(input: LegacyManagerAppStateInput): AdaptLegacyTeamInput {
  return {
    teamId: input.teamId,
    teamName: input.teamName,
    players: input.players,
  };
}

function buildAdaptTacticInput(input: LegacyManagerAppStateInput): AdaptLegacyTacticInput {
  return {
    tactic: input.tactic,
    formation: input.formation,
    lineup: input.lineup,
  };
}

function buildSummary(appState: ManagerAppState): string {
  if (appState.status === "incomplete") {
    return "Legacy-data er adaptert, men startelleveren er ikke komplett.";
  }

  if (appState.status === "has_critical_issues") {
    return "Legacy-data er adaptert, og manager-motoren finner kritiske problemer i oppsettet.";
  }

  if (appState.status === "has_warnings") {
    return "Legacy-data er adaptert, og manager-motoren finner tydelige forbedringspunkter.";
  }

  return "Legacy-data er adaptert, og manager-motoren vurderer oppsettet som klart.";
}

export function createLegacyManagerAppState(
  input: LegacyManagerAppStateInput,
): LegacyManagerAppState {
  const adaptedTeam = adaptLegacyTeam(buildAdaptTeamInput(input));
  const adaptedRoles = adaptLegacyRoles(input.roles);
  const adaptedTactic = adaptLegacyTactic(buildAdaptTacticInput(input));

  const appState = createManagerAppState({
    team: adaptedTeam,
    tactic: adaptedTactic,
    roles: adaptedRoles,
    knowledgePrinciples: input.knowledgePrinciples ?? [],
  });

  return {
    teamId: adaptedTeam.id,
    tacticId: adaptedTactic.id,

    adaptedTeam,
    adaptedRoles,
    adaptedTactic,

    appState,

    summary: buildSummary(appState),
  };
}

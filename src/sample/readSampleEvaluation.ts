// src/sample/readSampleEvaluation.ts

import type { FitReason, PlayerRoleFitResult } from "../domain/footballTypes.js";
import type { TeamSetupEvaluation } from "../engine/evaluateTeamSetup.js";

import { sampleEvaluation } from "./elite433Sample.js";

export type ReadableFitSummary = {
  playerId: string;
  roleId: string;
  position: string;
  finalFit: number;
  attributeFit: number;
  traitFit: number;
  positionFit: number;
  tacticFit: number;
  keyReasons: string[];
};

export type ReadableTeamBalance = {
  finalBalance: number;
  attackingBalance: number;
  defensiveBalance: number;
  midfieldControl: number;
  pressingCoherence: number;
  widthBalance: number;
  riskBalance: number;
  keyReasons: string[];
};

export type ReadableSampleEvaluation = {
  teamId: string;
  tacticId: string;

  isComplete: boolean;
  setupScore: number;
  summary: string;

  validAssignmentCount: number;
  totalAssignmentCount: number;

  strengths: string[];
  issues: string[];

  teamBalance: ReadableTeamBalance;

  bestFits: ReadableFitSummary[];
  worstFits: ReadableFitSummary[];
};

function getKeyReasons(reasons: FitReason[], limit = 3): string[] {
  return [...reasons]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, limit)
    .map((reason) => reason.label);
}

function toReadableFitSummary(result: PlayerRoleFitResult): ReadableFitSummary {
  return {
    playerId: result.playerId,
    roleId: result.roleId,
    position: result.position,

    finalFit: result.finalFit,
    attributeFit: result.attributeFit,
    traitFit: result.traitFit,
    positionFit: result.positionFit,
    tacticFit: result.tacticFit,

    keyReasons: getKeyReasons(result.reasons),
  };
}

export function readSampleEvaluation(
  evaluation: TeamSetupEvaluation = sampleEvaluation,
): ReadableSampleEvaluation {
  return {
    teamId: evaluation.teamId,
    tacticId: evaluation.tacticId,

    isComplete: evaluation.isComplete,
    setupScore: evaluation.setupScore,
    summary: evaluation.summary,

    validAssignmentCount: evaluation.validAssignmentCount,
    totalAssignmentCount: evaluation.totalAssignmentCount,

    strengths: evaluation.strengths,
    issues: evaluation.issues.map((issue) => issue.label),

    teamBalance: {
      finalBalance: evaluation.teamBalance.finalBalance,
      attackingBalance: evaluation.teamBalance.attackingBalance,
      defensiveBalance: evaluation.teamBalance.defensiveBalance,
      midfieldControl: evaluation.teamBalance.midfieldControl,
      pressingCoherence: evaluation.teamBalance.pressingCoherence,
      widthBalance: evaluation.teamBalance.widthBalance,
      riskBalance: evaluation.teamBalance.riskBalance,
      keyReasons: getKeyReasons(evaluation.teamBalance.reasons, 5),
    },

    bestFits: evaluation.bestFits.map(toReadableFitSummary),
    worstFits: evaluation.worstFits.map(toReadableFitSummary),
  };
}

export const readableSampleEvaluation = readSampleEvaluation();

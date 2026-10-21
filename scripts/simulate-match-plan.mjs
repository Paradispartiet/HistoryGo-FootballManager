// Simulering: kampplaner som strategi, og bytte av plan midt i kampen.
//
// Kampplanen var én av fem, valgt før avspark og låst der. Nå er den 18 planer
// i seks familier, og den kan byttes underveis — med en pris. Denne vakta
// kjører den rene motoren og sjekker at prisen faktisk finnes, at den avhenger
// av hvor stort spranget er og hvor godt treneren forstår systemet, og at
// byttet ender opp i kampresultatet. Exit 1 ved brudd.

import assert from "node:assert/strict";
import { TACTICAL_SEQUENCES, evaluateTacticalSequences } from "../src/football-tactical-sequences.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  GAME_STATES,
  MATCH_PLAN_VERSION,
  applyOpponentAdjustment,
  deriveOpponentAdjustment,
  scorePlanNow,
  calculateSwitchCost,
  createPlanChange,
  evaluatePlanForGameState,
  evaluatePlanVsOpponent,
  normalizeMatchPlan,
  planDistance,
  rankPlansForSituation,
  readGameState
} from "../src/football-match-plan.js";
import {
  advanceMatchClock,
  logMatchMoment,
  applyMatchPlanChange,
  applyOpponentAdaptation,
  createMatchdaySession,
  projectMatchPlanTacticalProfile,
  finalizeMatchdaySession,
  getMatchdayGameState
} from "../src/football-matchday-engine.js";
import { getHistoricalOpponentProfile, getHistoricalOpponentProfileIds } from "../src/football-historical-opponent-profiles.js";
import { buildOpponentTacticalOpportunities, buildOpponentTacticalSequences, createOpponentAnalysisWorkspace } from "../src/football-opponent-analysis.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "data/football_tactics.json"), "utf8"));
const plans = data.tactics;
const byId = new Map(plans.map((p) => [p.id, p]));

const checks = [];
function check(label, run) {
  run();
  checks.push(label);
  console.log(`  ok   ${label}`);
}

console.log("Kampplan v1 — strategi og bytte underveis\n");

// ---------------------------------------------------------------------------
check("kampens 18 planvalg bruker planens EGEN rollefit og samme profil som faktisk bytte", () => {
  const opponent = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  const currentPlan = byId.get("patient_build_up");
  const highPressPlan = byId.get("counter_press_recovery");
  const sessionProfile = {
    pressScore: 40, widthScore: 64, depthScore: 68, balanceScore: 68,
    buildUpScore: 72, restDefenseScore: 65, relationshipScore: 73
  };
  const oldFit = { metrics: {
    pressScore: 45, widthScore: 64, depthScore: 68, balanceScore: 68,
    buildUpScore: 72, restDefenseScore: 65
  } };
  const newFit = { metrics: { ...oldFit.metrics, pressScore: 78, buildUpScore: 62 } };
  const projected = projectMatchPlanTacticalProfile(sessionProfile, oldFit, newFit);
  assert.equal(projected.pressScore, 73, "current match condition offset must survive");
  assert.equal(projected.buildUpScore, 62);
  assert.equal(sessionProfile.pressScore, 40, "projection must not mutate original session");
  assert.equal(oldFit.metrics.pressScore, 45, "team fit must remain read-only");
  assert.equal(projectMatchPlanTacticalProfile(sessionProfile, null, newFit), sessionProfile,
    "legacy/unknown team-fit must not create an invented rating");
  const allPreviews = Object.fromEntries(plans.map((plan) =>
    [plan.id, plan.id === highPressPlan.id ? projected : sessionProfile]));
  const ranked = rankPlansForSituation(plans, {
    currentPlan, gameState: "level", opponent, tacticalProfile: sessionProfile,
    tacticalProfilesByPlan: allPreviews
  });
  assert.equal(ranked.length, 18);
  const highEntry = ranked.find(({plan}) => plan.id === highPressPlan.id);
  const actuallySupported = evaluatePlanVsOpponent(highPressPlan, opponent,
    { tacticalProfile: projected });
  const oldIncorrect = evaluatePlanVsOpponent(highPressPlan, opponent,
    { tacticalProfile: sessionProfile });
  assert.equal(highEntry.matchupEdge, actuallySupported.edge);
  // In-match preview must match the ACTUAL pure engine switch, including
  // any sourced substitution corrections the engine applies to the active XI.
  const liveSession = createMatchdaySession({
    teamFit: {
      teamScore: 72, completeCount: 11, totalSlots: 11,
      metrics: { ...sessionProfile }, assignments: []
    },
    formation: { id: "modern_433", name: "4-3-3", slots: [] },
    tactic: currentPlan, opponent
  });
  const oldSessionJson = JSON.stringify(liveSession);
  const preview = applyMatchPlanChange(liveSession, highPressPlan, {
    currentTeamFit: oldFit, nextTeamFit: newFit, currentPlanData: currentPlan,
    players: [], roles: []
  });
  assert.equal(JSON.stringify(liveSession), oldSessionJson,
    "preview must NEVER mutate or consume the live session");
  const dryRank = rankPlansForSituation(plans, {
    currentPlan, gameState: "level", opponent,
    tacticalProfile: liveSession.teamFitSnapshot.tacticalProfile,
    tacticalProfilesByPlan: { [highPressPlan.id]: preview.teamFitSnapshot.tacticalProfile }
  });
  assert.equal(dryRank.find(({ plan }) => plan.id === highPressPlan.id).matchupEdge,
    preview.planMatchup.edge,
    "same proposed plan must have same tactical edge in list and real match engine");

  assert.equal(highEntry.sequenceStatus, actuallySupported.sequences?.[0]?.status || null);
  assert.ok(highEntry.matchupEdge > oldIncorrect.edge,
    "an old tactic's low press must not hide a new tactic's genuine press fit");

  const inverse = projectMatchPlanTacticalProfile(projected, newFit, oldFit);
  assert.deepEqual(inverse, sessionProfile,
    "switching back must not accumulate phantom benefits");
  const atLimit = projectMatchPlanTacticalProfile(
    { ...sessionProfile, pressScore: 97 }, oldFit, newFit);
  assert.equal(atLimit.pressScore, 100, "team signals must stay within 0..100");
});

check("alle 18 taktikker har betinget fire-trekks spill, motspill og svar", () => {
  assert.equal(TACTICAL_SEQUENCES.length, plans.length);
  for (const chain of TACTICAL_SEQUENCES) {
    const plan = byId.get(chain.tacticId);
    assert.ok(plan, `ukjent plan ${chain.tacticId}`);
    assert.equal(chain.moves.length, 4, `fire trekk i ${chain.tacticId}`);
    const opponent = { styleTraits: {
      [chain.opponentCondition.trait]: chain.opponentCondition.min,
      [chain.counterCondition.trait]: chain.counterCondition.min - 1
    } };
    // Defensive structure and press resistance may be top-level.
    opponent[chain.counterCondition.trait] = chain.counterCondition.min - 1;
    const ready = Object.fromEntries(Object.keys(chain.requires).map((key) => [key, 90]));
    const supporting = evaluateTacticalSequences(chain.tacticId, opponent, ready)[0];
    assert.equal(supporting?.status, "advantage", `${chain.tacticId}: viable interaction`);
    assert.equal(supporting.edgeDelta, 1, "four moves must grant just one bounded advantage");
    const missingKey = Object.keys(chain.requires)[0];
    const missing = evaluateTacticalSequences(chain.tacticId, opponent,
      { ...ready, [missingKey]: 25 })[0];
    assert.equal(missing?.status, "unsupported", `${chain.tacticId}: role deficiency`);
    assert.equal(missing.edgeDelta, 0);
    const counteredOpponent = { ...opponent, styleTraits: { ...opponent.styleTraits,
      [chain.counterCondition.trait]: chain.counterCondition.min },
      [chain.counterCondition.trait]: chain.counterCondition.min };
    const countered = evaluateTacticalSequences(chain.tacticId, counteredOpponent, ready)[0];
    assert.equal(countered?.status, "countered", `${chain.tacticId}: genuine opposition reply`);
    assert.equal(countered.edgeDelta, 0, `${chain.tacticId}: counter must neutralize pattern`);
    const unscouted = {
      styleTraits: { [chain.opponentCondition.trait]: chain.opponentCondition.min }
    };
    const unverified = evaluateTacticalSequences(chain.tacticId, unscouted, ready)[0];
    assert.equal(unverified?.status, "unknown_counter",
      `${chain.tacticId}: unscouted opponent counter cannot be treated as harmless`);
    assert.equal(unverified.edgeDelta, 0,
      `${chain.tacticId}: no bonus without a known opponent response`);
    const unscoutedIntegrated = evaluatePlanVsOpponent(plan, unscouted, { tacticalProfile: ready });
    assert.ok(unscoutedIntegrated.notes.some((note) => note.includes("motgrep er ikke undersøkt")),
      `${chain.tacticId}: unknown scouting must not be described as poor player quality`);
    assert.equal(unscoutedIntegrated.sequences[0]?.status, "unknown_counter");
    const integrated = evaluatePlanVsOpponent(plan, opponent, { tacticalProfile: ready });
    assert.equal(integrated.sequences?.[0]?.edgeDelta, 1);
    const integratedCounter = evaluatePlanVsOpponent(plan, counteredOpponent, { tacticalProfile: ready });
    assert.equal(integratedCounter.sequences?.[0]?.edgeDelta, 0);
    assert.ok(typeof countered.response === "string" && countered.response.length > 16);
  }
});


// Reproducibility and falsification, not a claim of external empirical validity.
// This covers EVERY authored plan × EVERY published historic learning opponent.
// The opponent trait scales and tactical thresholds are curator/engine values,
// NOT observed event-tracking estimates or empirically calibrated coefficients.
check("18 × alle historiske motstandere: full faktor- og motgrepsmatrise", () => {
  const opponentIds = getHistoricalOpponentProfileIds();
  assert.ok(opponentIds.length >= 10, "historical archetype test set unexpectedly shrank");
  const fullSupport = {
    pressScore: 95, balanceScore: 95, restDefenseScore: 95,
    buildUpScore: 95, depthScore: 95, widthScore: 95
  };
  const summary = [];
  for (const sequence of TACTICAL_SEQUENCES) {
    const statusCounts = {
      not_exposed: 0, unknown_counter: 0, countered: 0, advantage: 0
    };
    for (const opponentId of opponentIds) {
      const opponent = getHistoricalOpponentProfile(opponentId);
      assert.ok(opponent, opponentId);
      const before = JSON.stringify(opponent);
      const metricsBefore = JSON.stringify(fullSupport);
      const activation = evaluateTacticalSequences(sequence.tacticId, opponent, fullSupport);
      const current = activation[0] || null;
      if (!current) {
        statusCounts.not_exposed += 1;
      } else {
        assert.ok(["advantage", "countered", "unknown_counter"].includes(current.status),
          sequence.tacticId + " / " + opponentId + ": unexpected full-support status " + current.status);
        statusCounts[current.status] += 1;
        const expected = current.status === "advantage" ? 1 : 0;
        assert.equal(current.edgeDelta, expected);
        const integrated = evaluatePlanVsOpponent(byId.get(sequence.tacticId), opponent,
          { tacticalProfile: fullSupport });
        assert.equal(integrated.sequences.length, 1,
          "match engine must call the same one authoritative tactical sequence");
        assert.equal(integrated.sequences[0].edgeDelta, expected);
        assert.deepEqual(activation,
          evaluateTacticalSequences(sequence.tacticId, opponent, fullSupport),
          "same tactical input must always produce identical output");
      }
      assert.equal(JSON.stringify(opponent), before, "evaluation mutated historical opponent");
      assert.equal(JSON.stringify(fullSupport), metricsBefore, "evaluation mutated lineup metrics");
    }
    assert.equal(Object.values(statusCounts).reduce((a,b) => a+b, 0), opponentIds.length);
    summary.push({ name: sequence.tacticId, ...statusCounts });
  }
  assert.equal(summary.length, plans.length);
  assert.ok(summary.some(s => s.advantage > 0), "no tactical plan works against any modeled opponent");
  assert.ok(summary.some(s => s.countered > 0), "no modeled historical opponent can block a sequence");
  console.log("  18-plan validation matrix (historical STYLE ARCHETYPES, not observed matches):");
  summary.forEach(s => console.log(
    "  " + s.name.padEnd(29) +
    " exposed-but-countered=" + s.countered +
    " advantage=" + s.advantage +
    " unknown-counter=" + s.unknown_counter +
    " no-trigger=" + s.not_exposed
  ));
});

check("18 taktikker: grenseverdier, ufullstendige profiler og falsifiserende endringer", () => {
  const fullSupport = {
    pressScore: 95, balanceScore: 95, restDefenseScore: 95,
    buildUpScore: 95, depthScore: 95, widthScore: 95
  };
  for (const chain of TACTICAL_SEQUENCES) {
    const t = chain.opponentCondition.trait, k = chain.counterCondition.trait;
    assert.notEqual(t, k, "a vulnerability cannot also be its own countermeasure");
    const opponent = {
      id: "synthetic_"+chain.tacticId,
      styleTraits: { [t]: chain.opponentCondition.min, [k]: chain.counterCondition.min-1 },
      [k]: chain.counterCondition.min-1
    };
    const run = (enemy, metrics) =>
      evaluateTacticalSequences(chain.tacticId, enemy, metrics)[0] || null;
    assert.equal(run(opponent, fullSupport)?.status, "advantage");
    assert.equal(run(opponent, fullSupport)?.edgeDelta, 1);
    const dormant = {...opponent, styleTraits: {
      ...opponent.styleTraits, [t]: chain.opponentCondition.min-1
    }};
    assert.equal(run(dormant, fullSupport), null,
      chain.tacticId+": opportunity absent below trigger threshold");
    for (const [metric, minimum] of Object.entries(chain.requires)) {
      const failed = run(opponent, {...fullSupport, [metric]: minimum-1});
      assert.equal(failed?.status, "unsupported",
        chain.tacticId+": a single missing tactical role should break the chain ("+metric+")");
      assert.equal(failed?.edgeDelta, 0);
      assert.equal(run(opponent, {...fullSupport, [metric]: minimum})?.edgeDelta, 1,
        chain.tacticId+": threshold boundary should be inclusive");
      assert.equal(run(opponent, {...fullSupport, [metric]: Number.NaN})?.edgeDelta, 0);
    }
    const activeCounter = {...opponent, [k]: chain.counterCondition.min, styleTraits: {
      ...opponent.styleTraits, [k]: chain.counterCondition.min
    }};
    assert.equal(run(activeCounter, fullSupport)?.status, "countered");
    assert.equal(run(activeCounter, fullSupport)?.edgeDelta, 0);
    const unscouted = {...opponent, styleTraits:{[t]:chain.opponentCondition.min}};
    delete unscouted[k];
    assert.equal(run(unscouted, fullSupport)?.status, "unknown_counter");
    assert.equal(run(unscouted, fullSupport)?.edgeDelta, 0,
      chain.tacticId+": not observing a counter is NOT evidence that no counter exists");
    assert.deepEqual(evaluateTacticalSequences(chain.tacticId, null, fullSupport), [],
      chain.tacticId+": no invented exploit for unsourced generic opponent");
    assert.deepEqual(evaluateTacticalSequences(chain.tacticId, opponent, null), [],
      chain.tacticId+": no exploit without a real tactical snapshot");
  }
});

check("alle 18 taktiske spillkjeder forklares i analyseavdelingen uten oppdiktede fordeler", () => {
  assert.equal(TACTICAL_SEQUENCES.length, plans.length);
  for (const pattern of TACTICAL_SEQUENCES) {
    const tactic = byId.get(pattern.tacticId);
    const teamMetrics = Object.fromEntries(Object.entries(pattern.requires)
      .map(([key, value]) => [key, value + 5]));
    const teamFit = {
      completeCount: 11, totalSlots: 11, metrics: teamMetrics,
      sourcedSkillTendencies: {}, assignments: []
    };
    const counterMetric = pattern.counterCondition.trait;
    const styleTraits = {
      [pattern.opponentCondition.trait]: pattern.opponentCondition.min,
      [counterMetric]: pattern.counterCondition.min - 1
    };
    const opponent = {
      id: "fixture_" + pattern.tacticId, styleTraits,
      [counterMetric]: pattern.counterCondition.min - 1
    };
    const make = (enemy, squad = teamFit) =>
      buildOpponentTacticalSequences({ opponent: enemy, tactic, teamFit: squad })[0];
    const ready = make(opponent);
    assert.equal(ready.title, pattern.title);
    assert.deepEqual(ready.moves, pattern.moves);
    assert.equal(ready.moves.length, 4);
    assert.equal(ready.status, "advantage");
    assert.equal(ready.edgeDelta, 1);
    assert.equal(ready.checks.length, Object.keys(pattern.requires).length);
    assert.ok(ready.checks.every((x) => x.status === "ready"));
    assert.equal(ready.response, pattern.response);
    assert.equal(ready.counter, pattern.counter);
    assert.ok(byId.has(pattern.responsePlanId) && pattern.responsePlanId !== pattern.tacticId,
      "counter-response must name a real distinct selectable plan: " + pattern.tacticId);
    const explanation = buildOpponentTacticalSequences({
      opponent, tactic, teamFit: {
        ...teamFit,
        assignments: [{
          isComplete: true,
          player: { id: "role_A", name: "Rollespiller" },
          role: { id: "balancing_six", name: "Balanserende sekser" }
        }]
      },
      tactics: plans
    })[0];
    assert.equal(explanation.responsePlanId, pattern.responsePlanId);
    assert.equal(explanation.responsePlanName, byId.get(pattern.responsePlanId).name);
    const roleMetric = explanation.checks.find((entry) =>
      ["balanceScore","restDefenseScore"].includes(entry.metric));
    if (roleMetric) {
      assert.ok(roleMetric.supportingRoles.some((entry) =>
        entry.player === "Rollespiller" && entry.role === "Balanserende sekser"),
        "active role and player must be surfaced separately from source-claimed skills");
    }
    const countered = make({ ...opponent,
      styleTraits: { ...styleTraits, [counterMetric]: pattern.counterCondition.min },
      [counterMetric]: pattern.counterCondition.min });
    assert.equal(countered.status, "countered");
    assert.equal(countered.edgeDelta, 0);
    const weakMetric = Object.keys(pattern.requires)[0];
    const unsupported = make(opponent, { ...teamFit,
      metrics: { ...teamMetrics, [weakMetric]: pattern.requires[weakMetric] - 1 }
    });
    assert.equal(unsupported.status, "unsupported");
    assert.ok(unsupported.checks.some((check) => check.status === "gap"));
    const unknown = make({ ...opponent, styleTraits: { [pattern.opponentCondition.trait]: pattern.opponentCondition.min },
      [counterMetric]: undefined });
    assert.equal(unknown.status, "unknown_counter");
    assert.equal(unknown.edgeDelta, 0);
    const unscouted = make({ id: "unscouted" });
    assert.equal(unscouted.status, "unknown_opponent");
    const incomplete = make(opponent, { ...teamFit, completeCount: 9 });
    assert.equal(incomplete.status, "incomplete");
    const created = createOpponentAnalysisWorkspace({
      fixture: { fixtureId: "fixture_" + pattern.tacticId, opponent },
      tactic, formation: { name: "4-3-3" }, teamFit
    });
    assert.equal(created.tacticalSequences?.[0]?.status, "advantage");
  }
});


check("18 taktikker: skill ukjent motstander, ukjent lag, kjent svakhet og kjent motspill", () => {
  for (const pattern of TACTICAL_SEQUENCES) {
    const tactic = byId.get(pattern.tacticId);
    const trigger = pattern.opponentCondition;
    const counter = pattern.counterCondition;
    const metrics = Object.fromEntries(Object.entries(pattern.requires)
      .map(([metric, value]) => [metric, value + 5]));
    const teamFit = {
      completeCount: 11, totalSlots: 11, metrics,
      assignments: [], sourcedSkillTendencies: {}
    };
    const opponent = { id: "verified_" + pattern.tacticId,
      styleTraits: { [trigger.trait]: trigger.min, [counter.trait]: counter.min - 1 },
      [counter.trait]: counter.min - 1 };
    const read = (enemy, fit) => buildOpponentTacticalSequences({
      opponent: enemy, tactic, teamFit: fit, tactics: plans
    })[0];
    assert.equal(read(opponent, teamFit).status, "advantage",
      pattern.tacticId + ": full knowledge and correct roles");
    const missingTrigger = {
      ...opponent, styleTraits: { [counter.trait]: counter.min - 1 }
    };
    assert.equal(read(missingTrigger, teamFit).status, "unknown_opponent",
      pattern.tacticId + ": unscouted vulnerability must NOT mean no vulnerability");
    const knownSafe = { ...opponent, styleTraits: {
      ...opponent.styleTraits, [trigger.trait]: trigger.min - 1
    }};
    assert.equal(read(knownSafe, teamFit).status, "not_exposed",
      pattern.tacticId + ": observed safe opponent is a real negative");
    assert.equal(read(opponent, null).status, "unknown_team",
      pattern.tacticId + ": unknown lineup must NOT be diagnosed as weak");
    const absent = Object.keys(pattern.requires)[0];
    const partial = { ...teamFit, metrics: { ...metrics } };
    delete partial.metrics[absent];
    assert.equal(read(opponent, partial).status, "unknown_team",
      pattern.tacticId + ": missing metric is not a failed individual skill");
    assert.equal(evaluateTacticalSequences(tactic.id, opponent, partial.metrics)[0]?.status,
      "unknown_team", pattern.tacticId + ": raw engine and analysis agree on missing team data");
    assert.equal(evaluateTacticalSequences(tactic.id, opponent, partial.metrics)[0]?.edgeDelta, 0,
      pattern.tacticId + ": uncertainty can never generate a bonus");
    const actuallyWeak = { ...teamFit, metrics: { ...metrics,
      [absent]: pattern.requires[absent] - 1 }};
    assert.equal(read(opponent, actuallyWeak).status, "unsupported",
      pattern.tacticId + ": measured weakness must differ from missing measurement");
  }
});

check("18 taktikker: alternative motplaner krever kartlagt sårbarhet og kjent lagfit", () => {
  for (const pattern of TACTICAL_SEQUENCES) {
    const tactic = byId.get(pattern.tacticId);
    const responsePattern = TACTICAL_SEQUENCES.find(entry => entry.tacticId === pattern.responsePlanId);
    const counterValue = pattern.counterCondition.min;
    const opponent = { id: "verified_" + pattern.tacticId, styleTraits: {
      [pattern.opponentCondition.trait]: pattern.opponentCondition.min,
      [pattern.counterCondition.trait]: counterValue,
      [responsePattern.opponentCondition.trait]: responsePattern.opponentCondition.min
    }};
    const all = {pressScore:95,balanceScore:95,restDefenseScore:95,
      buildUpScore:95,depthScore:95,widthScore:95};
    const fit = { completeCount:11,totalSlots:11,metrics:all,
      assignments:[],sourcedSkillTendencies:{} };
    const check = (enemy, alternateFit) => buildOpponentTacticalSequences({
      opponent: enemy, tactic, teamFit: fit, responseTeamFit: alternateFit,
      tactics: plans
    })[0].responsePreview.status;
    const unknown = { ...opponent, styleTraits: { ...opponent.styleTraits } };
    delete unknown.styleTraits[responsePattern.opponentCondition.trait];
    if (responsePattern.opponentCondition.trait !== pattern.opponentCondition.trait
        && responsePattern.opponentCondition.trait !== pattern.counterCondition.trait) {
      assert.equal(check(unknown, fit), "unknown_opponent",
        pattern.tacticId + ": the proposed response trigger must be independently scouted");
    }
    const partial = { ...fit, metrics: { ...all } };
    delete partial.metrics[Object.keys(responsePattern.requires)[0]];
    assert.equal(check(opponent, partial), "unknown_team",
      pattern.tacticId + ": unknown alternative-plan fit is not a tactical weakness");
  }
});

check("motsvar får egne lagmetrikker etter taktikkbytte, ikke den gamle planens dekning", () => {
  const pattern = TACTICAL_SEQUENCES.find((entry) => entry.tacticId === "high_press_343");
  const oldPlan = byId.get(pattern.tacticId);
  const newPlan = byId.get(pattern.responsePlanId);
  const responsePattern = TACTICAL_SEQUENCES.find((entry) => entry.tacticId === newPlan.id);
  const values = {
    [pattern.opponentCondition.trait]: pattern.opponentCondition.min,
    [pattern.counterCondition.trait]: pattern.counterCondition.min,
    [responsePattern.opponentCondition.trait]: responsePattern.opponentCondition.min,
    [responsePattern.counterCondition.trait]: responsePattern.counterCondition.min - 1
  };
  const opponent = { id: "opponent", styleTraits: { ...values }, ...values };
  const ready = {
    pressScore: 95, balanceScore: 95, restDefenseScore: 95,
    buildUpScore: 95, depthScore: 95, widthScore: 95
  };
  const missingMetric = Object.keys(responsePattern.requires)[0];
  const oldTeamFit = {
    completeCount: 11, totalSlots: 11, metrics: { ...ready },
    assignments: [], sourcedSkillTendencies: {}
  };
  const newTeamFit = {
    ...oldTeamFit, metrics: { ...ready, [missingMetric]: 30 }
  };
  const inspect = (responseTeamFit) => buildOpponentTacticalSequences({
    opponent, tactic: oldPlan, teamFit: oldTeamFit,
    responseTeamFit, tactics: plans
  })[0].responsePreview;
  const oldPreview = inspect();
  const proposedPreview = inspect(newTeamFit);
  assert.equal(oldPreview.basis, "current_plan");
  assert.equal(oldPreview.requirements.find((r) => r.metric === missingMetric).value, 95);
  assert.equal(proposedPreview.basis, "proposed_plan");
  assert.equal(proposedPreview.requirements.find((r) => r.metric === missingMetric).value, 30);
  assert.equal(proposedPreview.status, "unsupported",
    "response must not be marked viable if recomputed proposed tactic loses a required role metric");
  assert.equal(oldPreview.status, "advantage");
  assert.equal(oldTeamFit.metrics[missingMetric], 95, "must not mutate the original team fit");
  assert.equal(newTeamFit.metrics[missingMetric], 30, "must not mutate proposed team fit");
  const workshop = createOpponentAnalysisWorkspace({
    fixture: { fixtureId: "match_1", opponent },
    tactic: oldPlan, teamFit: oldTeamFit, responseTeamFit: newTeamFit,
    tactics: plans
  });
  assert.equal(workshop.tacticalSequences[0].responsePreview.status, "unsupported");
  const corrected = inspect({ ...newTeamFit, metrics: { ...ready } });
  assert.equal(corrected.status, "advantage");
  assert.equal(corrected.basis, "proposed_plan");
});

check("alle 18 foreslåtte motgrep har etterprøvbar foreløpig lagkontroll", () => {
  assert.equal(TACTICAL_SEQUENCES.length, plans.length);
  for (const pattern of TACTICAL_SEQUENCES) {
    const tactic = byId.get(pattern.tacticId);
    const alternative = byId.get(pattern.responsePlanId);
    const responsePattern = TACTICAL_SEQUENCES.find((item) =>
      item.tacticId === alternative.id);
    assert.ok(responsePattern, pattern.tacticId + ": missing alternative pattern");

    const required = Object.fromEntries(Object.entries(responsePattern.requires)
      .map(([metric, minimum]) => [metric, minimum + 5]));
    const allKnown = {
      [pattern.opponentCondition.trait]: pattern.opponentCondition.min,
      [pattern.counterCondition.trait]: pattern.counterCondition.min,
      [responsePattern.opponentCondition.trait]: responsePattern.opponentCondition.min,
      [responsePattern.counterCondition.trait]: responsePattern.counterCondition.min - 1
    };
    // If the same trait drives both plan triggers, the last written value may
    // change the original trigger; assessment remains cautious in that case.
    const enemy = {
      id: "test_" + pattern.tacticId,
      styleTraits: allKnown,
      [pattern.counterCondition.trait]: pattern.counterCondition.min,
      [responsePattern.counterCondition.trait]: responsePattern.counterCondition.min - 1
    };
    const team = {
      completeCount: 11, totalSlots: 11,
      metrics: required, assignments: [], sourcedSkillTendencies: {}
    };
    const get = (enemyValue, teamValue, catalog = plans) =>
      buildOpponentTacticalSequences({
        opponent: enemyValue, tactic, teamFit: teamValue, tactics: catalog
      })[0];
    const preview = get(enemy, team).responsePreview;
    assert.ok(preview, pattern.tacticId + ": no response assessment");
    assert.equal(preview.requirements.length,
      Object.keys(responsePattern.requires).length);
    assert.ok(preview.requirements.every((entry) => entry.status === "ready"));
    assert.ok(preview.explanation.length > 10);
    assert.equal(preview.risk, alternative.risks[0]);
    assert.ok(["advantage", "countered", "not_exposed", "unknown_counter"].includes(preview.status),
      pattern.tacticId + ": must state whether alternative has a real opening");

    const metric = Object.keys(responsePattern.requires)[0];
    const weakTeam = {
      ...team, metrics: { ...required, [metric]: responsePattern.requires[metric] - 1 }
    };
    const weakness = get(enemy, weakTeam).responsePreview;
    assert.equal(weakness.requirements.find(x => x.metric === metric).status, "gap");
    if (preview.status === "advantage" || preview.status === "countered") {
      assert.equal(weakness.status, "unsupported",
        pattern.tacticId + ": cannot recommend an unplayable alternative");
    }
    const unknownEnemy = get({ id: "no_scouting" }, team).responsePreview;
    assert.equal(unknownEnemy.status, "unknown_opponent");
    const incomplete = get(enemy, { ...team, completeCount: 8 }).responsePreview;
    assert.equal(incomplete.status, "incomplete");
    const missingCatalog = get(enemy, team, []).responsePreview;
    assert.equal(missingCatalog.status, "unavailable");
    // Producing advice alone changes neither xG nor saved state.
    const snapshot = JSON.stringify({ enemy, team, tactic });
    get(enemy, team);
    assert.equal(JSON.stringify({ enemy, team, tactic }), snapshot);
  }
});

check("rangering bruker reell taktisk rolledekning", () => {
  const p = byId.get("positional_overloads");
  const opponent = { defensiveStructure: 50, styleTraits: { defensiveCompactness: 68 } };
  const fits = rankPlansForSituation([p], {
    opponent, gameState: "level",
    tacticalProfile: { buildUpScore: 75, widthScore: 74 }
  })[0];
  const lacks = rankPlansForSituation([p], {
    opponent, gameState: "level",
    tacticalProfile: { buildUpScore: 30, widthScore: 25 }
  })[0];
  assert.equal(fits.sequenceStatus, "advantage");
  assert.equal(lacks.sequenceStatus, "unsupported");
  assert.ok(fits.matchupEdge > lacks.matchupEdge);
});

check("katalogen er utvidet og organisert i familier", () => {
  assert.equal(data.schema, "historygo-football-manager.tactics.v2");
  assert.ok(plans.length >= 15, `bare ${plans.length} kampplaner`);
  assert.ok(Array.isArray(data.families) && data.families.length >= 5);
  const familyIds = new Set(data.families.map((f) => f.id));
  plans.forEach((plan) => {
    assert.ok(familyIds.has(plan.family), `${plan.id} peker på ukjent familie ${plan.family}`);
  });
  // Hver familie må ha minst to planer, ellers er den ikke en familie.
  data.families.forEach((family) => {
    const count = plans.filter((p) => p.family === family.id).length;
    assert.ok(count >= 2, `${family.id} har bare ${count} plan(er)`);
  });
});

check("hver plan forklarer seg selv (intensjon, styrker, risiko)", () => {
  plans.forEach((plan) => {
    assert.ok(plan.intent && plan.intent.length > 15, `${plan.id} mangler intensjon`);
    assert.ok(plan.strengths?.length >= 2, `${plan.id} mangler styrker`);
    assert.ok(plan.risks?.length >= 2, `${plan.id} mangler risiko`);
    assert.ok(plan.gameStates?.length >= 1, `${plan.id} sier ikke når den passer`);
    plan.gameStates.forEach((state) => assert.ok(GAME_STATES.includes(state), `${plan.id}: ukjent ${state}`));
  });
});

check("ingen plan passer alle kampbilder alene", () => {
  // Én plan som «alltid passer» ville gjort valget meningsløst.
  const universal = plans.filter((plan) => plan.gameStates.length === GAME_STATES.length);
  assert.ok(universal.length <= 1, `for mange universalplaner: ${universal.map((p) => p.id).join(", ")}`);
  // Og hvert kampbilde må ha flere planer å velge mellom.
  GAME_STATES.forEach((state) => {
    const count = plans.filter((plan) => plan.gameStates.includes(state)).length;
    assert.ok(count >= 3, `bare ${count} planer for ${state}`);
  });
});

// ---------------------------------------------------------------------------
check("avstanden mellom planer speiler hvor stort spranget er", () => {
  const seeOut = byId.get("see_out_the_game");
  const allOut = byId.get("all_out_attack");
  const patient = byId.get("patient_build_up");
  assert.equal(planDistance(seeOut, seeOut), 0);
  // Lukk kampen -> Alt frem er det største spranget som finnes.
  const extreme = planDistance(seeOut, allOut);
  const mild = planDistance(patient, byId.get("central_possession_4231"));
  assert.ok(extreme > 60, `for kort avstand på ytterpunktene: ${extreme}`);
  assert.ok(mild < extreme, `${mild} skal være mindre enn ${extreme}`);
});

check("bytte koster taktisk klarhet — og et stort bytte koster mer", () => {
  const coach = { coachUnderstanding: 50, formationFamiliarity: 50 };
  const small = calculateSwitchCost({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("central_possession_4231"),
    coachSnapshot: coach,
    eventsRemaining: 2
  });
  const big = calculateSwitchCost({
    fromPlan: byId.get("see_out_the_game"),
    toPlan: byId.get("all_out_attack"),
    coachSnapshot: coach,
    eventsRemaining: 2
  });
  assert.ok(small.clarityCost < 0, "et bytte må koste noe");
  assert.ok(big.clarityCost < small.clarityCost, "stort sprang må koste mer enn lite");
  assert.ok(big.riskCost > small.riskCost);
  // Samme plan koster ingenting.
  const none = calculateSwitchCost({
    fromPlan: byId.get("high_press_343"),
    toPlan: byId.get("high_press_343"),
    coachSnapshot: coach
  });
  assert.equal(none.clarityCost, 0);
  assert.equal(none.settled, true);
});

check("treneren som forstår systemet betaler mindre for omstillingen", () => {
  const args = { fromPlan: byId.get("see_out_the_game"), toPlan: byId.get("all_out_attack"), eventsRemaining: 2 };
  const clueless = calculateSwitchCost({ ...args, coachSnapshot: { coachUnderstanding: 10, formationFamiliarity: 10 } });
  const sharp = calculateSwitchCost({ ...args, coachSnapshot: { coachUnderstanding: 95, formationFamiliarity: 95 } });
  assert.ok(sharp.clarityCost > clueless.clarityCost,
    `god trener (${sharp.clarityCost}) må betale mindre enn dårlig (${clueless.clarityCost})`);
});

check("sent bytte koster mer enn tidlig bytte", () => {
  const args = {
    fromPlan: byId.get("central_possession_4231"),
    toPlan: byId.get("all_out_attack"),
    coachSnapshot: { coachUnderstanding: 50, formationFamiliarity: 50 }
  };
  const early = calculateSwitchCost({ ...args, eventsRemaining: 3 });
  const late = calculateSwitchCost({ ...args, eventsRemaining: 0 });
  assert.ok(late.clarityCost < early.clarityCost,
    `sent (${late.clarityCost}) må koste mer enn tidlig (${early.clarityCost})`);
});

// ---------------------------------------------------------------------------
check("kampbildet leses av grepene, ikke av en resultattavle", () => {
  const flat = readGameState({ decisions: [] });
  assert.equal(flat.state, "level");
  const good = readGameState({ decisions: [{ effects: { momentumDelta: 3 } }] });
  assert.equal(good.state, "leading");
  const bad = readGameState({ decisions: [{ effects: { momentumDelta: -3 } }] });
  assert.equal(bad.state, "behind");
});

check("18 planer har kildebelagt mekanisme, risiko og konkret motgrep", () => {
  assert.equal(TACTICAL_SEQUENCES.length, 18);
  const vague = TACTICAL_SEQUENCES.filter(entry =>
    entry.counterCondition.trait === "tacticalComplexity");
  assert.ok(TACTICAL_SEQUENCES.every(entry =>
    entry.opponentCondition.trait !== entry.counterCondition.trait),
    "a known opponent trigger must not simultaneously define its counter; retain unknown scouting status");
  assert.deepEqual(vague, [], "a generic tactical-complexity score cannot establish a specific counter");
  const sources = new Set();
  for (const entry of TACTICAL_SEQUENCES) {
    assert.ok(entry.mechanism.length >= 75);
    assert.ok(entry.counterLogic.length >= 75);
    assert.ok(entry.failureMode.length >= 75);
    assert.ok(entry.observation.length >= 75);
    entry.principleSourceIds.forEach(id => sources.add(id));
    const originalPlan = byId.get(entry.tacticId);
    assert.equal(originalPlan?.coachingFocus, entry.observation);
  }
  assert.ok(sources.size >= 7, "coverage must span different phases, not one generic coaching page");
  const scouting = buildOpponentTacticalSequences({
    opponent: getHistoricalOpponentProfile("barcelona_2008_12_positional_play"),
    tactic: byId.get("central_possession_4231"),
    teamFit: { completeCount: 11, totalSlots: 11,
      metrics: { pressScore: 70, balanceScore: 70, buildUpScore: 70, depthScore: 70 },
      sourcedSkillTendencies: {}, assignments: [] }, tactics: plans
  });
  assert.ok(scouting[0].principleSources.length >= 2,
    "manager should be able to inspect the coaching references behind tactical advice");
});

check("en plan for et annet kampbilde blir sagt ifra om", () => {
  const seeOut = evaluatePlanForGameState(byId.get("see_out_the_game"), "behind");
  assert.equal(seeOut.fits, false);
  assert.ok(seeOut.note.includes("Lukk kampen"));
  assert.ok(seeOut.momentumDelta < 0);
  const chase = evaluatePlanForGameState(byId.get("chase_the_equaliser"), "behind");
  assert.equal(chase.fits, true);
  assert.ok(chase.momentumDelta > 0);
});

check("planen vurderes mot motstanderens historiske stil", () => {
  // Barcelona 2008-12 bygger kort — press skal lønne seg mot dem.
  const possessionSide = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  assert.ok(possessionSide, "fant ikke motstanderprofilen");
  const press = evaluatePlanVsOpponent(byId.get("counter_press_recovery"), possessionSide);
  assert.ok(press.edge > 0, "press mot kort oppbygging må være gunstig");
  assert.ok(press.notes.length > 0);

  // Leicester 2015-16 lever på omstilling — en høy linje mot dem er dyrt.
  const counterSide = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const highLine = evaluatePlanVsOpponent(byId.get("all_out_attack"), counterSide);
  assert.ok(highLine.edge <= 0, "høy linje mot kontringslag skal ikke belønnes");
});


// Same tactical plan and same opponent, but a different ACTUAL team snapshot:
// a tactical weakness cannot be exploited without matching player roles,
// sourced strengths, relationships and formation-fit metrics.
check("motstandersvakheter krever faktisk rolle-, egenskaps- og formasjonsdekning", () => {
  const possession = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  const plan = byId.get("counter_press_recovery");
  const pressStrength = evaluatePlanVsOpponent(plan, possession,
    { tacticalProfile: { pressScore: 74, depthScore: 75, widthScore: 75 } });
  const pressWeakness = evaluatePlanVsOpponent(plan, possession,
    { tacticalProfile: { pressScore: 35, depthScore: 75, widthScore: 75 } });
  assert.ok(pressStrength.edge > pressWeakness.edge,
    "strong press in real tactical snapshot must exploit short buildup more");
  assert.ok(pressWeakness.notes.some(note => note.includes("pressroller")),
    "a failed exploit must identify missing tactical support, not blame player talent");
  assert.equal(evaluatePlanVsOpponent(plan, possession).edge,
    evaluatePlanVsOpponent(plan, possession, { tacticalProfile: {} }).edge,
    "unknown role metrics must preserve legacy pre-match matchup semantics");

  const highLine = getHistoricalOpponentProfile("milan_1988_90_sacchi");
  const fast = byId.get("all_out_attack");
  const depthReady = evaluatePlanVsOpponent(fast, highLine,
    { tacticalProfile: { depthScore: 72, widthScore: 75, pressScore: 75 } });
  const depthMissing = evaluatePlanVsOpponent(fast, highLine,
    { tacticalProfile: { depthScore: 33, widthScore: 75, pressScore: 75 } });
  assert.ok(depthReady.edge > depthMissing.edge,
    "high defensive line must only yield bonus if runner roles provide actual depth");
  assert.ok(depthMissing.notes.some(note => note.includes("dybdetrussel")));

  // Isolate wing overload before the opponent's separate high-quality
  // defensive counter: otherwise 'width beats compactness' is a false rule.
  const compact = {
    ...getHistoricalOpponentProfile("inter_1960s_catenaccio"),
    defensiveStructure: 74
  };
  const wide = { ...byId.get("all_out_attack"), width: "wide" };
  const stretched = evaluatePlanVsOpponent(wide, compact,
    { tacticalProfile: { depthScore: 75, widthScore: 74, pressScore: 75 } });
  const narrow = evaluatePlanVsOpponent(wide, compact,
    { tacticalProfile: { depthScore: 75, widthScore: 34, pressScore: 75 } });
  assert.ok(stretched.edge > narrow.edge,
    "formation and wide role supply must unlock compact-block exploit");
  assert.ok(narrow.notes.some(note => note.includes("bredderoller")));
});

check("den samme matchup-forskjellen når kampmotorens xG", () => {
  const rival = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  const start = (pressScore) => createMatchdaySession({
    teamFit: {
      teamScore: 72, completeCount: 11, totalSlots: 11,
      metrics: {
        balanceScore: 70, widthScore: 70, depthScore: 70,
        buildUpScore: 70, pressScore, restDefenseScore: 70
      },
      assignments: []
    },
    formation: { id: "modern_433", name: "Modern 4-3-3", slots: [] },
    tactic: byId.get("counter_press_recovery"),
    opponent: rival
  });
  const strong = start(72);
  const weak = start(32);
  assert.ok(strong.planMatchup.edge > weak.planMatchup.edge,
    "kickoff must evaluate actual role/formation-derived tactical profile");
  // Compare only the plan-specific advantage; raw press metrics also affect xG.
  const neutralMetrics = { ...weak.teamFitSnapshot.tacticalProfile,
    pressScore: strong.teamFitSnapshot.tacticalProfile.pressScore };
  const controlledWeak = {
    ...weak, teamFitSnapshot: { ...weak.teamFitSnapshot, tacticalProfile: neutralMetrics }
  };
  const strongXg = finalizeMatchdaySession(strong).expectedGoals;
  const unsupportedXg = finalizeMatchdaySession(controlledWeak).expectedGoals;
  assert.ok(strongXg.for > unsupportedXg.for,
    "source-supported exploit must flow into actual chance generation rather than UI copy");
  assert.ok(strongXg.against < unsupportedXg.against,
    "counterpress exploitation must also reduce opponent chances");
});

check("fire samvirkende trekk kan nøytraliseres av ett motgrep", () => {
  const originalOpponent = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  const pressPlan = byId.get("counter_press_recovery");
  const ready = {
    pressScore: 74, balanceScore: 75, restDefenseScore: 70,
    depthScore: 69, widthScore: 66, buildUpScore: 67
  };
  const coordinated = evaluatePlanVsOpponent(pressPlan, originalOpponent,
    { tacticalProfile: ready });
  const chain = coordinated.combinations.find((entry) => entry.id === "coordinated_press_chain");
  assert.equal(chain.factors.length, 4, "press combination requires four separate tactical links");
  assert.ok(chain.factors.every((factor) => factor.status === "ready"));
  assert.equal(chain.status, "ready");
  assert.equal(chain.counter.status, "inactive");

  // One missing midfield balancing component removes the extra synergy,
  // but the separate first-line press can still work.
  const oneMissing = evaluatePlanVsOpponent(pressPlan, originalOpponent,
    { tacticalProfile: { ...ready, balanceScore: 39 } });
  assert.ok(coordinated.edge > oneMissing.edge,
    "four cooperating role units must beat the same press with one broken link");
  assert.equal(oneMissing.combinations[0].status, "partial");
  assert.equal(oneMissing.combinations[0].readyCount, 3);

  // One opponent trait is allowed to defeat the complete four-part mechanism.
  const oneCounter = { ...originalOpponent, pressResistance: 92 };
  const countered = evaluatePlanVsOpponent(pressPlan, oneCounter,
    { tacticalProfile: ready });
  assert.ok(countered.edge < oneMissing.edge,
    "single press-resistant escape must defeat even the complete four-part pressing chain");
  assert.equal(countered.combinations[0].status, "countered");
  assert.equal(countered.combinations[0].counter.status, "active");
  assert.ok(countered.notes.some((note) => note.includes("bryter den samlede fordelen")));

  // Missing source/context is UNKNOWN, not a made-up missing talent claim.
  const unknown = evaluatePlanVsOpponent(pressPlan, originalOpponent,
    { tacticalProfile: { pressScore: 74 } }).combinations[0];
  assert.equal(unknown.status, "unknown");
  assert.equal(unknown.readyCount, 1);
  const noScouting = evaluatePlanVsOpponent(pressPlan,
    { styleTraits: { shortBuildUp: 80 } }, { tacticalProfile: ready });
  const noScoutingCombo = noScouting.combinations.find((x) => x.id === "coordinated_press_chain");
  assert.equal(noScoutingCombo.status, "unknown_counter");
  assert.ok(noScouting.notes.some((note) => note.includes("ikke undersøkt")));
  const scouted = evaluatePlanVsOpponent(pressPlan,
    { styleTraits: { shortBuildUp: 80, pressIntensity: 30 }, pressResistance: 30 },
    { tacticalProfile: ready });
  assert.ok(scouted.edge > noScouting.edge, "undocumented opponent counter cannot yield synergy");


  // The same composition and single counter alter match chances, not merely text.
  const session = (opponent) => createMatchdaySession({
    teamFit: {
      teamScore: 72, completeCount: 11, totalSlots: 11,
      metrics: { ...ready, relationshipScore: 70 }, assignments: []
    },
    formation: { id: "modern_433", name: "Modern 4-3-3", slots: [] },
    tactic: pressPlan, opponent
  });
  const live = session(originalOpponent);
  const blocked = session(oneCounter);
  assert.ok(live.planMatchup.edge > blocked.planMatchup.edge);
  const liveExpected = finalizeMatchdaySession(live).expectedGoals;
  const blockedExpected = finalizeMatchdaySession(blocked).expectedGoals;
  assert.ok(liveExpected.for > blockedExpected.for,
    "four-part attack that survives the counter must generate more expected goals");
  assert.ok(liveExpected.against < blockedExpected.against,
    "blocked pressing chain must also expose more opposition chances");
  const analysis = buildOpponentTacticalOpportunities({
    opponent: oneCounter, tactic: pressPlan,
    teamFit: {
      completeCount: 11, totalSlots: 11, metrics: ready,
      assignments: [], sourcedSkillTendencies: {}
    }
  });
  assert.equal(analysis.find((entry) => entry.id === "press_build_up").readiness, "countered");
  assert.equal(analysis.find((entry) => entry.id === "press_build_up").combinations[0].factors.length, 4);
});

check("analyseavdelingen kobler motstandersvakhet til faktiske roller og kildebelegg", () => {
  const opponent = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  const tactic = byId.get("counter_press_recovery");
  const ready = {
    completeCount: 11, totalSlots: 11,
    metrics: { pressScore: 74, depthScore: 68, widthScore: 62 },
    sourcedSkillTendencies: {
      pressScore: { bonus: 4, players: ["Kildebelagt press-spiller"] }
    },
    assignments: [{
      isComplete: true,
      player: { id: "press_1", name: "Kildebelagt press-spiller" },
      role: { id: "pressing_forward", name: "Pressende spiss" }
    }]
  };
  const supported = buildOpponentTacticalOpportunities({ opponent, tactic, teamFit: ready });
  const press = supported.find((entry) => entry.id === "press_build_up");
  assert.ok(press, "Barcelona style must expose short-build-up press");
  assert.equal(press.readiness, "ready");
  assert.equal(press.metricValue, 74);
  assert.deepEqual(press.documentedPlayers, ["Kildebelagt press-spiller"]);
  assert.deepEqual(press.supportingRoles.map(entry => entry.role), ["Pressende spiss"]);

  const noCoverage = buildOpponentTacticalOpportunities({
    opponent, tactic,
    teamFit: {
      ...ready,
      metrics: { ...ready.metrics, pressScore: 30 },
      sourcedSkillTendencies: {},
      assignments: []
    }
  }).find((entry) => entry.id === "press_build_up");
  assert.equal(noCoverage.readiness, "gap");
  assert.deepEqual(noCoverage.documentedPlayers, []);
  assert.deepEqual(noCoverage.supportingRoles, []);

  assert.deepEqual(buildOpponentTacticalOpportunities({
    opponent: { id: "generic", name: "Ukjent" }, tactic, teamFit: ready
  }), [], "generic club must not receive invented opponent vulnerabilities");

  const incomplete = buildOpponentTacticalOpportunities({
    opponent, tactic, teamFit: { ...ready, completeCount: 8 }
  }).find((entry) => entry.id === "press_build_up");
  assert.equal(incomplete.readiness, "incomplete");

  const workshop = createOpponentAnalysisWorkspace({
    fixture: { fixtureId: "round_1", opponent },
    formation: { name: "4-3-3" }, tactic, teamFit: ready
  });
  assert.equal(workshop.tacticalOpportunities[0].id, "press_build_up");
  assert.equal(workshop.tacticalOpportunities[0].readiness, "ready");
  assert.equal(workshop.ownPlan.formation, "4-3-3");
});

check("planlista sorteres etter hva som passer situasjonen", () => {
  const ranked = rankPlansForSituation(plans, {
    currentPlan: byId.get("central_possession_4231"),
    gameState: "behind",
    opponent: getHistoricalOpponentProfile("inter_1960s_catenaccio")
  });
  assert.equal(ranked.length, plans.length);
  assert.equal(ranked[0].isCurrent, true, "gjeldende plan skal stå først");
  const rest = ranked.slice(1);
  const firstMismatch = rest.findIndex((entry) => !entry.fitsGameState);
  if (firstMismatch >= 0) {
    rest.slice(firstMismatch).forEach((entry) => {
      assert.equal(entry.fitsGameState, false, "planer som passer bildet må stå før dem som ikke gjør det");
    });
  }
});

// ---------------------------------------------------------------------------
// Hele veien gjennom en kamp.
function buildSession(planId) {
  return createMatchdaySession({
    // Merk nøklene: motoren leser `*Score` (balanceScore, widthScore, ...).
    // Med `balance`/`width` ble hele metrikkbildet 0 og xG klemt i bunn.
    teamFit: {
      teamScore: 72,
      completeCount: 11,
      totalSlots: 11,
      metrics: {
        balanceScore: 70, widthScore: 68, depthScore: 66,
        buildUpScore: 71, pressScore: 69, restDefenseScore: 67
      },
      assignments: []
    },
    formation: { id: "modern_433", name: "Modern 4-3-3", slots: [] },
    tactic: byId.get(planId),
    opponent: getHistoricalOpponentProfile("milan_1988_90_sacchi"),
    coachContext: { coachUnderstanding: 60, formationFamiliarity: 55, tacticalLearningSpeed: 50, roleFitClarity: 55 }
  });
}

check("en ny sesjon starter med planen du valgte, og uten bytter", () => {
  const session = buildSession("central_possession_4231");
  assert.equal(session.selectedTacticId, "central_possession_4231");
  assert.deepEqual(session.planChanges, []);
  assert.equal(getMatchdayGameState(session).state, "level");
});

check("planbytte registreres på sesjonen uten å mutere den gamle", () => {
  const before = buildSession("central_possession_4231");
  const snapshot = JSON.stringify(before);
  const after = applyMatchPlanChange(before, byId.get("chase_the_equaliser"));
  assert.equal(JSON.stringify(before), snapshot, "motoren skal ikke mutere sesjonen den fikk");
  assert.equal(after.planChanges.length, 1);
  assert.equal(after.selectedTacticId, "chase_the_equaliser");
  assert.equal(after.activePlanSnapshot.id, "chase_the_equaliser");
  const change = after.planChanges[0];
  assert.equal(change.fromPlanId, "central_possession_4231");
  assert.equal(change.toPlanId, "chase_the_equaliser");
  assert.ok(change.distance > 0);
  assert.ok(change.feedback.length > 10, "byttet må forklare seg");
  assert.ok(change.effects.tacticalClarityDelta < 0, "omstillingen må koste klarhet");
});

check("bytte til samme plan gjør ingenting", () => {
  const session = buildSession("high_press_343");
  const same = applyMatchPlanChange(session, byId.get("high_press_343"));
  assert.equal(same, session);
  assert.equal(same.planChanges.length, 0);
});

check("planbytte regner om seks taktiske lagdimensjoner før neste kampperiode", () => {
  const original = buildSession("patient_build_up");
  assert.deepEqual(original.tacticSnapshot.gameStates,
    byId.get("patient_build_up").gameStates,
    "kickoff must persist the tactic's intended match states");
  const previous = structuredClone(original.teamFitSnapshot.tacticalProfile);
  const currentTeamFit = { metrics: {
    balanceScore: 68, widthScore: 68, depthScore: 62,
    buildUpScore: 77, pressScore: 55, restDefenseScore: 72
  } };
  const nextTeamFit = { metrics: {
    balanceScore: 60, widthScore: 80, depthScore: 76,
    buildUpScore: 60, pressScore: 86, restDefenseScore: 58
  } };
  const nextPlan = byId.get("counter_press_recovery");
  const switched = applyMatchPlanChange(original, nextPlan, {
    currentTeamFit, nextTeamFit
  });
  const expected = { ...previous };
  Object.keys(currentTeamFit.metrics).forEach((key) => {
    expected[key] = Math.max(0, Math.min(100,
      previous[key] + nextTeamFit.metrics[key] - currentTeamFit.metrics[key]));
  });
  assert.deepEqual(switched.teamFitSnapshot.tacticalProfile, expected);
  assert.deepEqual(original.teamFitSnapshot.tacticalProfile, previous,
    "tactic change must not mutate a previously played period or save");
  assert.equal(switched.planMatchup.edge,
    evaluatePlanVsOpponent(nextPlan, switched.opponent, {
      tacticalProfile: expected
    }).edge);
  const beforeScore = scorePlanNow(byId.get("patient_build_up"), {
    gameState: "level", opponent: original.opponent, tacticalProfile: previous
  });
  const afterScore = scorePlanNow(nextPlan, {
    gameState: "level", opponent: original.opponent, tacticalProfile: expected
  });
  const improvement = Math.round((afterScore - beforeScore)) / 100;
  assert.equal(switched.planChanges[0].improvement, improvement,
    "switch improvement must use old plan+old role fit vs new plan+new role fit");

  assert.deepEqual(switched.activePlanSnapshot.gameStates, nextPlan.gameStates,
    "follow-up plan change must keep full game-state information");
  // Historic saves may lack gameStates. The app supplies the current canonical
  // plan so the first switch after restore cannot gain 0.9 fake improvement.
  const oldSave = {
    ...original,
    tacticSnapshot: { ...original.tacticSnapshot, gameStates: undefined }
  };
  const resumed = applyMatchPlanChange(oldSave, nextPlan, {
    currentTeamFit, nextTeamFit,
    currentPlanData: byId.get("patient_build_up")
  });
  assert.equal(resumed.planChanges[0].improvement,
    switched.planChanges[0].improvement,
    "restored old sessions must not receive a free tactical improvement");

  // Existing stored matches or direct engine consumers without new inputs
  // keep the legacy snapshot rather than hallucinating missing role scores.
  const legacy = applyMatchPlanChange(original, nextPlan);
  assert.deepEqual(legacy.teamFitSnapshot.tacticalProfile, previous);

  // A second tactical change is relative to the current on-field profile,
  // so flipping back does not stack a bogus permanent tactical bonus.
  const restored = applyMatchPlanChange(switched, byId.get("patient_build_up"), {
    currentTeamFit: nextTeamFit, nextTeamFit: currentTeamFit
  });
  assert.deepEqual(restored.teamFitSnapshot.tacticalProfile, previous);

  const played = advanceMatchClock(original);
  const revised = applyMatchPlanChange(played, nextPlan, {
    currentTeamFit, nextTeamFit
  });
  assert.deepEqual(revised.timeline, played.timeline,
    "tactic switch may not rewrite historical match periods");
});

check("flere bytter i samme kamp stables", () => {
  let session = buildSession("central_possession_4231");
  session = applyMatchPlanChange(session, byId.get("high_press_343"));
  session = applyMatchPlanChange(session, byId.get("see_out_the_game"));
  assert.equal(session.planChanges.length, 2);
  assert.equal(session.planChanges[0].toPlanId, "high_press_343");
  assert.equal(session.planChanges[1].fromPlanId, "high_press_343");
  assert.equal(session.planChanges[1].toPlanId, "see_out_the_game");
});

check("byttet havner i kampresultatet og i rapporten", () => {
  const plain = finalizeMatchdaySession(buildSession("central_possession_4231"));
  const switched = finalizeMatchdaySession(
    applyMatchPlanChange(buildSession("central_possession_4231"), byId.get("all_out_attack"))
  );
  assert.equal(plain.planChanges.length, 0);
  assert.equal(switched.planChanges.length, 1);
  assert.equal(switched.activePlanSnapshot.id, "all_out_attack");
  // Omstillingen må faktisk endre regnestykket, ikke bare stå i loggen.
  assert.notDeepEqual(plain.decisionTotals, switched.decisionTotals);
  assert.ok(switched.decisionTotals.tacticalClarityDelta < 0);
});

check("en ferdigspilt kamp tar ikke imot flere planbytter", () => {
  const session = { ...buildSession("high_press_343"), phase: "resolved" };
  const after = applyMatchPlanChange(session, byId.get("see_out_the_game"));
  assert.equal(after, session);
});

check("motoren er deterministisk", () => {
  const a = applyMatchPlanChange(buildSession("central_possession_4231"), byId.get("all_out_attack"));
  const b = applyMatchPlanChange(buildSession("central_possession_4231"), byId.get("all_out_attack"));
  assert.equal(JSON.stringify(a.planChanges), JSON.stringify(b.planChanges));
});

check("planene normaliseres trygt", () => {
  assert.equal(normalizeMatchPlan(null), null);
  const safe = normalizeMatchPlan({ id: "x" });
  assert.equal(safe.intensity, 60);
  assert.deepEqual(safe.gameStates, []);
  assert.ok(MATCH_PLAN_VERSION.startsWith("historygo-football-manager."));
});


// ---------------------------------------------------------------------------
// Tre spørsmål som avdekket ekte hull: står planen i forhold til motstanderen,
// svarer motstanderen, og lønner det seg å rette opp et dårlig kampbilde?
// ---------------------------------------------------------------------------
check("planen du VELGER teller mot motstanderen fra avspark", () => {
  // Før: matchupen mot motstanderen slo bare inn hvis du tilfeldigvis byttet
  // plan underveis. Lot du planen stå, var valget gratis.
  const shortBuildUpSide = getHistoricalOpponentProfile("barcelona_2008_12_positional_play");
  const build = (planId) => createMatchdaySession({
    teamFit: {
      teamScore: 72, completeCount: 11, totalSlots: 11,
      metrics: { balanceScore: 70, widthScore: 68, depthScore: 66, buildUpScore: 71, pressScore: 69, restDefenseScore: 67 },
      assignments: []
    },
    formation: { id: "modern_433", name: "Modern 4-3-3", slots: [] },
    tactic: byId.get(planId),
    opponent: shortBuildUpSide,
    coachContext: { coachUnderstanding: 60, formationFamiliarity: 55 }
  });

  const pressing = build("counter_press_recovery");
  assert.equal(pressing.tacticSnapshot.defensiveLine,
    byId.get("counter_press_recovery").defensiveLine,
    "defensive line must survive saved tactic snapshot and opponent adaptation");
  assert.ok(pressing.planMatchup, "sesjonen må bære planens matchup");
  assert.ok(pressing.planMatchup.edge > 0, "press mot kort oppbygging må være gunstig");

  const pressResult = finalizeMatchdaySession(pressing);
  const patientResult = finalizeMatchdaySession(build("patient_build_up"));
  assert.notDeepEqual(pressResult.expectedGoals, patientResult.expectedGoals,
    "planvalget må gi utslag i xG uten at man bytter");
  assert.ok(pressResult.expectedGoals.for > patientResult.expectedGoals.for,
    "planen som treffer motstanderen må gi mer trussel");
  assert.ok(pressResult.expectedGoals.against < patientResult.expectedGoals.against);
});

check("motstanderen svarer på kampbildet", () => {
  assert.equal(deriveOpponentAdjustment("level"), null, "et jevnt bilde gir ingen grunn til å justere");
  const pushUp = deriveOpponentAdjustment("leading");
  assert.equal(pushUp.id, "push_up", "styrer du bildet, må de ta sjansen");
  const sitBack = deriveOpponentAdjustment("behind");
  assert.equal(sitBack.id, "sit_back", "leder de, sikrer de det de har");
  // Samme justering skjer bare én gang.
  assert.equal(deriveOpponentAdjustment("leading", { alreadyAdjusted: ["push_up"] }), null);
});

check("justeringen endrer motstanderen uten å mutere profilen", () => {
  const base = getHistoricalOpponentProfile("inter_1960s_catenaccio");
  const before = JSON.stringify(base);
  const shifted = applyOpponentAdjustment(base, deriveOpponentAdjustment("leading"));
  assert.equal(JSON.stringify(base), before, "motstanderprofilen skal ikke muteres");
  assert.ok(shifted.styleTraits.pressIntensity > base.styleTraits.pressIntensity);
  assert.ok(shifted.styleTraits.highLine > base.styleTraits.highLine);
  assert.equal(shifted.adjustmentId, "push_up");
});

check("planen din måles på nytt når motstanderen har justert seg", () => {
  const session = buildSession("patient_build_up");
  // Kampen glipper for dem: momentum i din favør.
  const leading = { ...session, decisions: [{ effects: { momentumDelta: 3 } }] };
  const adapted = applyOpponentAdaptation(leading);
  assert.notEqual(adapted, leading, "bildet gir grunn til justering");
  assert.equal(adapted.opponentAdjustments.length, 1);
  assert.ok(adapted.opponentAdjustments[0].note.length > 20, "justeringen må forklares");
  // Rolig oppbygging mot et lag som nå presser høyt er dyrere enn før.
  assert.ok(adapted.planMatchup.edge <= leading.planMatchup.edge,
    "planen skal ikke bli bedre av at de presser hardere mot den");
  // Og den skjer bare én gang per type.
  assert.equal(applyOpponentAdaptation(adapted), adapted);
});

check("å rette opp et dårlig kampbilde lønner seg", () => {
  const opponent = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const struggling = {
    decisions: [{ effects: { momentumDelta: -4, riskDelta: 2 } }],
    coachSnapshot: { coachUnderstanding: 60, formationFamiliarity: 55 },
    opponent,
    events: [1, 2, 3]
  };
  const rescue = createPlanChange({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("chase_the_equaliser"),
    session: struggling, opponent, eventsRemaining: 2
  });
  const wrong = createPlanChange({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("see_out_the_game"),
    session: struggling, opponent, eventsRemaining: 2
  });

  assert.ok(rescue.improvement > 0, "riktig grep må registreres som en forbedring");
  assert.equal(rescue.tone, "positive");
  const rescueNet = rescue.effects.momentumDelta + rescue.effects.tacticalClarityDelta;
  const wrongNet = wrong.effects.momentumDelta + wrong.effects.tacticalClarityDelta;
  assert.ok(rescueNet > 0, `redningen må lønne seg netto (fikk ${rescueNet})`);
  assert.ok(rescueNet > wrongNet, "riktig grep må slå feil grep");
  assert.ok(rescue.rescueBonus > 0, "dyp trøbbel skal gi en redningsbonus");
});

check("samme grep er verdt mer når kampen glipper enn når alt flyter", () => {
  const opponent = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const make = (momentum) => createPlanChange({
    fromPlan: byId.get("patient_build_up"),
    toPlan: byId.get("chase_the_equaliser"),
    session: {
      decisions: [{ effects: { momentumDelta: momentum } }],
      coachSnapshot: { coachUnderstanding: 60, formationFamiliarity: 55 },
      opponent, events: [1, 2, 3]
    },
    opponent, eventsRemaining: 2
  });
  const deepTrouble = make(-5);
  const mildTrouble = make(-2);
  assert.ok(deepTrouble.rescueBonus > mildTrouble.rescueBonus,
    "jo dypere trøbbel, jo mer er den riktige lesningen verdt");
});

check("å bytte bort en plan som passet bedre straffes", () => {
  const opponent = getHistoricalOpponentProfile("milan_1988_90_sacchi");
  const downgrade = createPlanChange({
    fromPlan: byId.get("chase_the_equaliser"),
    toPlan: byId.get("see_out_the_game"),
    session: {
      decisions: [{ effects: { momentumDelta: -4 } }],
      coachSnapshot: { coachUnderstanding: 60, formationFamiliarity: 55 },
      opponent, events: [1, 2, 3]
    },
    opponent, eventsRemaining: 1
  });
  assert.ok(downgrade.improvement < 0, "å forlate en plan som passet må telle negativt");
  assert.equal(downgrade.tone, "negative");
  assert.ok(downgrade.feedback.includes("bytter bort"));
});

check("scorePlanNow rangerer planer i en gitt situasjon", () => {
  const opponent = getHistoricalOpponentProfile("leicester_2015_16_direct_transition");
  const chasing = scorePlanNow(byId.get("chase_the_equaliser"), { gameState: "behind", opponent });
  const closing = scorePlanNow(byId.get("see_out_the_game"), { gameState: "behind", opponent });
  assert.ok(chasing > closing, "å jage utligning må slå å lukke kampen når du er under");
});

check("motstanderens justeringer havner i sluttrapporten", () => {
  let session = buildSession("high_press_343");
  session = { ...session, decisions: [{ effects: { momentumDelta: 3 } }] };
  session = applyOpponentAdaptation(session);
  const report = finalizeMatchdaySession(session);
  assert.equal(report.opponentAdjustments.length, 1);
  assert.ok(report.opponentAdjustments[0].label.length > 3);
});


// ---------------------------------------------------------------------------
// Kampklokka: ekte løpende stilling gjennom kampen.
// ---------------------------------------------------------------------------
function playFullMatch(planId, { opponent } = {}) {
  let session = buildSession(planId);
  if (opponent) session = { ...session, opponent };
  const total = session.events.length + 1;
  session = advanceMatchClock(session);           // avspark -> hendelse 1
  for (let i = 0; i < session.events.length; i += 1) {
    session = { ...session, phase: `event_${i + 1}` };
    session = advanceMatchClock(session);
  }
  return { session, total };
}

check("kampen spilles periode for periode, med stilling underveis", () => {
  const before = buildSession("central_possession_4231");
  assert.deepEqual(before.score, { for: 0, against: 0 }, "0-0 før avspark");
  assert.deepEqual(before.timeline, []);

  const first = advanceMatchClock(before);
  assert.notEqual(first, before, "avspark må spille første periode");
  assert.equal(first.timeline.length, 1);
  assert.ok(first.timeline[0].minute > 0 && first.timeline[0].minute < 90);
  assert.ok(first.timeline[0].note.length > 5, "perioden må forklare seg");
  assert.deepEqual(first.score, {
    for: first.timeline[0].goalsFor,
    against: first.timeline[0].goalsAgainst
  });
  // Motoren muterer ikke sesjonen den fikk.
  assert.deepEqual(before.timeline, []);
});

check("klokka stopper ved full tid", () => {
  const { session, total } = playFullMatch("central_possession_4231");
  assert.equal(session.timeline.length, total, `forventet ${total} perioder`);
  assert.equal(advanceMatchClock(session), session, "ingen perioder igjen");
});

check("stillingen er summen av periodene", () => {
  const { session } = playFullMatch("high_press_343");
  const sumFor = session.timeline.reduce((n, e) => n + e.goalsFor, 0);
  const sumAgainst = session.timeline.reduce((n, e) => n + e.goalsAgainst, 0);
  assert.deepEqual(session.score, { for: sumFor, against: sumAgainst });
  // Hver tidslinjepost bærer stillingen slik den var da.
  let running = { for: 0, against: 0 };
  session.timeline.forEach((entry) => {
    running = { for: running.for + entry.goalsFor, against: running.against + entry.goalsAgainst };
    assert.deepEqual(entry.scoreAfter, running, `stillingen i ${entry.minute}' stemmer ikke`);
  });
});

check("sluttresultatet ER stillingen du så underveis", () => {
  // Å rulle et nytt sluttresultat oppå ville gjort den løpende stillingen til
  // en løgn: manageren så 2-1 og fikk 0-3 i rapporten.
  const { session } = playFullMatch("central_possession_4231");
  const report = finalizeMatchdaySession(session);
  assert.deepEqual(report.score, session.score);
  assert.equal(report.timeline.length, session.timeline.length);
  const expected = report.score.for > report.score.against
    ? "win" : report.score.for < report.score.against ? "loss" : "draw";
  assert.equal(report.outcome, expected);
});

check("en kamp uten klokke får fortsatt et resultat (bakoverkompatibelt)", () => {
  const report = finalizeMatchdaySession(buildSession("high_press_343"));
  assert.ok(Number.isFinite(report.score.for) && Number.isFinite(report.score.against));
  assert.deepEqual(report.timeline, []);
});

check("«du ligger under» betyr at du faktisk ligger under", () => {
  const base = buildSession("central_possession_4231");
  const behind = { ...base, timeline: [{ minute: 18 }], score: { for: 0, against: 1 } };
  assert.equal(readGameState(behind).state, "behind");
  assert.equal(readGameState(behind).scoreKnown, true);
  assert.deepEqual(readGameState(behind).score, { for: 0, against: 1 });

  const leading = { ...base, timeline: [{ minute: 18 }], score: { for: 2, against: 1 } };
  assert.equal(readGameState(leading).state, "leading");

  // Står det likt, er det spillet som forteller hvor kampen bærer.
  const levelButSinking = {
    ...base, timeline: [{ minute: 18 }], score: { for: 1, against: 1 },
    decisions: [{ effects: { momentumDelta: -3 } }]
  };
  assert.equal(readGameState(levelButSinking).state, "behind");
});

check("etiketten lyver aldri mot resultattavla", () => {
  // «Du leder 1–1» sto en gang rett ved siden av stillingen 1–1. Går spillet
  // din vei uten at tavla viser det, må etiketten si nettopp det.
  const t = [{ minute: 18 }];
  const levelButOnTop = readGameState({
    timeline: t, score: { for: 1, against: 1 }, decisions: [{ effects: { momentumDelta: 3 } }]
  });
  assert.equal(levelButOnTop.state, "leading");
  assert.ok(levelButOnTop.label.startsWith("Jevnt"), `fikk «${levelButOnTop.label}» ved 1-1`);
  assert.ok(!levelButOnTop.label.includes("Du leder"));

  const actuallyLeading = readGameState({ timeline: t, score: { for: 2, against: 1 }, decisions: [] });
  assert.equal(actuallyLeading.label, "Du leder");
  const actuallyBehind = readGameState({ timeline: t, score: { for: 0, against: 2 }, decisions: [] });
  assert.equal(actuallyBehind.label, "Du ligger under");
});

check("planvalget følger den ekte stillingen", () => {
  // Ligger du under, skal «Jag utligningen» passe og «Lukk kampen» ikke.
  const base = buildSession("central_possession_4231");
  const behind = { ...base, timeline: [{ minute: 18 }], score: { for: 0, against: 2 } };
  const state = readGameState(behind).state;
  assert.equal(state, "behind");
  assert.equal(evaluatePlanForGameState(byId.get("chase_the_equaliser"), state).fits, true);
  assert.equal(evaluatePlanForGameState(byId.get("see_out_the_game"), state).fits, false);
});

check("motstanderen svarer på den ekte stillingen", () => {
  const base = buildSession("high_press_343");
  // Du leder 2-0: de må ta sjansen.
  const leading = { ...base, timeline: [{ minute: 18 }], score: { for: 2, against: 0 } };
  const adapted = applyOpponentAdaptation(leading);
  assert.equal(adapted.opponentAdjustments[0].id, "push_up");
  // Du ligger under 0-2: de sikrer det de har.
  const behind = { ...base, timeline: [{ minute: 18 }], score: { for: 0, against: 2 } };
  assert.equal(applyOpponentAdaptation(behind).opponentAdjustments[0].id, "sit_back");
});

check("tidlige grep teller i flere perioder enn sene", () => {
  // Et grep som løfter xG tidlig får virke gjennom resten av kampen; det samme
  // grepet i siste periode rekker bare å påvirke sluttminuttene.
  const boost = { effects: { xgDeltaFor: 1.2, momentumDelta: 2 } };
  let early = buildSession("central_possession_4231");
  early = { ...early, decisions: [boost] };
  const earlySegments = [];
  for (let i = 0; i <= early.events.length; i += 1) {
    early = advanceMatchClock(early);
    earlySegments.push(early.timeline[early.timeline.length - 1].expectedGoals.for);
  }
  let late = buildSession("central_possession_4231");
  const lateSegments = [];
  for (let i = 0; i <= late.events.length; i += 1) {
    if (i === late.events.length) late = { ...late, decisions: [boost] };
    late = advanceMatchClock(late);
    lateSegments.push(late.timeline[late.timeline.length - 1].expectedGoals.for);
  }
  const earlyTotal = earlySegments.reduce((a, b) => a + b, 0);
  const lateTotal = lateSegments.reduce((a, b) => a + b, 0);
  assert.ok(earlyTotal > lateTotal,
    `tidlig grep (${earlyTotal.toFixed(2)}) må gi mer enn sent (${lateTotal.toFixed(2)})`);
});


// ---------------------------------------------------------------------------
// Minutt for minutt.
// ---------------------------------------------------------------------------
check("kampen logges minutt for minutt, ikke bare i perioder", () => {
  const { session } = playFullMatch("central_possession_4231");
  assert.ok(Array.isArray(session.minuteLog), "sesjonen må ha en minuttlogg");
  assert.ok(session.minuteLog.length >= session.timeline.length,
    "minuttloggen må være finere enn periodelista");
  session.minuteLog.forEach((entry) => {
    assert.ok(entry.minute >= 1 && entry.minute <= 90, `minutt utenfor kampen: ${entry.minute}`);
    assert.ok(["goal", "chance", "decision", "plan", "opponent", "manager"].includes(entry.type),
      `ukjent type ${entry.type}`);
    assert.ok(entry.scoreAfter && Number.isFinite(entry.scoreAfter.for));
  });
});

check("målene faller ut av sjansene, ikke ved siden av dem", () => {
  // Før ble målene rullet direkte fra xG og sjansene fantes ikke. Nå må hvert
  // mål i loggen svare til en sjanse som gikk inn.
  const { session } = playFullMatch("high_press_343");
  const goalsFor = session.minuteLog.filter((e) => e.type === "goal" && e.side === "for").length;
  const goalsAgainst = session.minuteLog.filter((e) => e.type === "goal" && e.side === "against").length;
  assert.equal(goalsFor, session.score.for, "mål i loggen må stemme med stillingen");
  assert.equal(goalsAgainst, session.score.against);
});

check("stillingen i loggen er riktig ved hvert mål", () => {
  const { session } = playFullMatch("wide_fast_433");
  let running = { for: 0, against: 0 };
  [...session.minuteLog].sort((a, b) => a.minute - b.minute).forEach((entry) => {
    if (entry.type === "goal") {
      if (entry.side === "for") running.for += 1; else running.against += 1;
      assert.deepEqual(entry.scoreAfter, running, `feil stilling i ${entry.minute}'`);
    }
  });
  assert.deepEqual(session.score, running);
});

check("minuttene går framover gjennom kampen", () => {
  const { session } = playFullMatch("central_possession_4231");
  const minutes = session.minuteLog.map((e) => e.minute);
  const sorted = [...minutes].sort((a, b) => a - b);
  assert.deepEqual(minutes, sorted, "loggen må være kronologisk");
  // Kampen skal dekke mer enn bare de siste minuttene.
  if (minutes.length > 1) {
    assert.ok(minutes[minutes.length - 1] - minutes[0] > 20,
      `kampen dekker bare ${minutes[0]}'-${minutes[minutes.length - 1]}'`);
  }
});

check("en sjanse som ikke går inn blir forklart", () => {
  const { session } = playFullMatch("wide_fast_433");
  session.minuteLog.filter((e) => e.type === "chance").forEach((entry) => {
    assert.ok(entry.detail && entry.detail.length > 3, `sjanse uten forklaring i ${entry.minute}'`);
    assert.notEqual(entry.detail, "MÅL");
  });
});

check("managergrep og motstanderens svar står i samme spor", () => {
  let session = buildSession("central_possession_4231");
  session = advanceMatchClock(session);
  session = logMatchMoment(session, { type: "decision", side: "for", detail: "Ditt grep: Press høyere" });
  const withMove = session.minuteLog.filter((e) => e.type === "decision");
  assert.equal(withMove.length, 1);
  assert.ok(withMove[0].detail.includes("Press høyere"));
  assert.ok(withMove[0].minute >= 1 && withMove[0].minute <= 90);

  // Motstanderens justering logges automatisk.
  const leading = { ...session, decisions: [{ effects: { momentumDelta: 3 } }] };
  const adapted = applyOpponentAdaptation(leading);
  const oppEntries = adapted.minuteLog.filter((e) => e.type === "opponent");
  assert.equal(oppEntries.length, 1);
  assert.ok(oppEntries[0].detail.length > 3);
});

check("flere hendelser rundt samme pause klumper seg ikke på ett minutt", () => {
  // Grep, planbytte og motstanderens svar skjer i samme pause. Uten forskyvning
  // sto alle tre på 45' og rekkefølgen ble uleselig.
  let session = buildSession("central_possession_4231");
  session = advanceMatchClock(session);
  session = { ...session, decisions: [{ effects: { momentumDelta: 3 } }] };
  session = applyOpponentAdaptation(session);
  session = applyMatchPlanChange(session, byId.get("all_out_attack"));
  session = logMatchMoment(session, { type: "decision", side: "for", detail: "Ditt grep: Press høyere" });

  const moments = session.minuteLog.filter((e) => ["decision", "plan", "opponent"].includes(e.type));
  assert.equal(moments.length, 3);
  const minutes = moments.map((e) => e.minute);
  assert.equal(new Set(minutes).size, minutes.length, `klumpet: ${minutes.join(", ")}`);
  assert.deepEqual(minutes, [...minutes].sort((a, b) => a - b), "rekkefølgen må være kronologisk");
  minutes.forEach((m) => assert.ok(m >= 1 && m <= 90));
});

check("en bom blir forklart på flere måter", () => {
  // Én variant om og om igjen leser som en bug. Over mange kamper må
  // forklaringene variere.
  const seen = new Set();
  for (let i = 0; i < 30; i += 1) {
    const { session } = playFullMatch("wide_fast_433");
    session.minuteLog.filter((e) => e.type === "chance").forEach((e) => seen.add(e.detail));
  }
  assert.ok(seen.size >= 3, `bare ${seen.size} ulike forklaringer: ${[...seen].join(", ")}`);
});

check("planbytte står i minuttloggen", () => {
  let session = buildSession("central_possession_4231");
  session = advanceMatchClock(session);
  session = applyMatchPlanChange(session, byId.get("all_out_attack"));
  const planEntries = session.minuteLog.filter((e) => e.type === "plan");
  assert.equal(planEntries.length, 1);
  assert.ok(planEntries[0].detail.includes("Alt frem"));
});

check("sesjonen bærer det avspillingen trenger", () => {
  // UI-et avdekker kampen minutt for minutt. Da må motoren fortelle hvor
  // perioden slutter, og hvor langt manageren har sett.
  const session = buildSession("central_possession_4231");
  assert.equal(session.liveMinute, 0, "kampen starter usett");
  const played = advanceMatchClock(session);
  const last = played.timeline[played.timeline.length - 1];
  assert.ok(last.range && Number.isFinite(last.range.from) && Number.isFinite(last.range.to),
    "perioden må oppgi sitt minuttspenn");
  assert.ok(last.range.to > last.range.from);
  assert.ok(last.range.to <= 90);
  // Alle minuttene i perioden ligger innenfor spennet.
  played.minuteLog.forEach((entry) => {
    assert.ok(entry.minute >= last.range.from && entry.minute <= last.range.to,
      `${entry.minute}' utenfor ${last.range.from}-${last.range.to}`);
  });
});

check("periodene dekker hele kampen uten hull", () => {
  const { session } = playFullMatch("high_press_343");
  const ranges = session.timeline.map((t) => t.range);
  assert.equal(ranges[0].from, 1, "kampen må starte i 1. minutt");
  assert.equal(ranges[ranges.length - 1].to, 90, "kampen må gå til 90.");
  for (let i = 1; i < ranges.length; i += 1) {
    assert.equal(ranges[i].from, ranges[i - 1].to + 1,
      `hull mellom ${ranges[i - 1].to}' og ${ranges[i].from}'`);
  }
});

check("minuttloggen følger med i sluttrapporten", () => {
  const { session } = playFullMatch("high_press_343");
  const report = finalizeMatchdaySession(session);
  assert.equal(report.minuteLog.length, session.minuteLog.length);
  const reportGoals = report.minuteLog.filter((e) => e.type === "goal").length;
  assert.equal(reportGoals, report.score.for + report.score.against);
});

console.log(`\nAlle ${checks.length} kampplansjekker besto (${plans.length} planer).`);

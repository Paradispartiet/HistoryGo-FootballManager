// Coverage of the last four canonical plans by causal pre-shot v6 phases.
import assert from "node:assert/strict";
import { resolveGameControlPhase, annotateGameControlChances }
  from "../src/football-matchday-control-v6.js";
import { highPressPhaseRoll } from "../src/football-matchday-high-press-v6.js";
import { advanceMatchClock, finalizeMatchdaySession }
  from "../src/football-matchday-engine.js";

const lineup=["GK","CB","DM","CM","ST","LB","RB","AM","LW","RW"]
  .map((position,i)=>({playerId:"control-"+i,position,roleId:"role_"+position,
    matchFitKnown:true,matchScore:75}));
const opponent={
  id:"possession_opponent",strength:73,defensiveStructure:71,
  transitionThreat:77,pressResistance:74,
  styleTraits:{possessionControl:78,highLine:76,pressIntensity:75,
    defensiveCompactness:60,shortBuildUp:58,transitionThreat:77}
};
function fixture(plan="low_block_transition_541",other={}) {
  return {
    id:"control-fixture",version:2,
    causalGameControlVersion:1,causalPressingVersion:1,
    causalTransitionsVersion:1,causalCompactBlockVersion:1,
    selectedTacticId:plan,tacticSnapshot:{id:plan},
    lineupSnapshot:lineup,opponent,
    teamFitSnapshot:{historicalScore:70,tacticalProfile:{
      buildUpScore:75,balanceScore:74,restDefenseScore:72,
      depthScore:73,widthScore:69,pressScore:66,
      teamScore:74,relationshipScore:70
    }},
    strengthSnapshot:{finalStrength:74,modifiers:{missing:0}},
    planMatchup:{edge:1.5},
    score:{for:2,against:1},events:[],timeline:[],decisions:[],
    planChanges:[],substitutions:[],minuteLog:[],
    ...other
  };
}
const roll=(s,x)=>resolveGameControlPhase(s,{rng:()=>x});
const routes={
  low_block_transition_541:"low_block_counter",
  deep_block_long_release:"deep_block_release",
  see_out_the_game:"protect_lead",
  slow_it_down:"tempo_control"
};
for(const [plan,route] of Object.entries(routes)){
  const result=roll(fixture(plan),0);
  assert.equal(result.route,route);
  assert.equal(result.situation,"game_control_and_release");
  assert.equal(result.steps.length,4);
  assert.equal(result.evidence.support.length,4);
  assert.equal(new Set(result.evidence.support.map(x=>x.playerId)).size,4,
    "four different known players must support each chain");
  assert.equal(result.status,["protect_lead","tempo_control"].includes(route)
    ?"controlled":"counterattack");
  if(result.status==="controlled") {
    assert.equal(result.side,null,"prevented attack is NOT a chance");
    assert.ok(result.xgDeltaAgainst<0);
    assert.equal(result.xgDeltaFor,0);
  } else {
    assert.equal(result.side,"for");
    assert.ok(result.xgDeltaFor>0);
  }
}
assert.equal(roll(fixture("see_out_the_game",{
  score:{for:0,against:0}
}),0),null,"cannot see out a match while not leading");
assert.equal(roll(fixture("see_out_the_game",{
  score:{for:0,against:1}
}),0),null,"plan is unavailable behind");
assert.equal(roll(fixture("deep_block_long_release",{
  opponent:{...opponent,styleTraits:{...opponent.styleTraits,highLine:42}}
}),0),null,"unknown space behind a low line must not be invented");
assert.equal(roll(fixture("low_block_transition_541",{
  opponent:{...opponent,styleTraits:{...opponent.styleTraits,possessionControl:undefined}}
}),0),null);
assert.equal(roll(fixture("slow_it_down",{
  opponent:{...opponent,styleTraits:{...opponent.styleTraits,pressIntensity:undefined}}
}),0),null);
assert.equal(roll(fixture("low_block_transition_541",{
  opponent:{...opponent,transitionThreat:undefined,
    styleTraits:{...opponent.styleTraits,transitionThreat:undefined}}
}),0),null);
assert.equal(roll(fixture("low_block_transition_541",{
  lineupSnapshot:lineup.map(p=>p.position==="ST"
    ? {...p,matchFitKnown:false}:p)
}),0),null,"do not invent knowledge of the forward's ability");
assert.equal(roll(fixture("deep_block_long_release",{
  teamFitSnapshot:{...fixture().teamFitSnapshot,
    tacticalProfile:{...fixture().teamFitSnapshot.tacticalProfile,depthScore:undefined}}
}),0),null);
assert.equal(roll(fixture("slow_it_down",{causalGameControlVersion:undefined}),0),null);
assert.equal(roll(fixture("high_press_343"),0),null);

const base=roll(fixture(),0.4);
const weaker=roll(fixture("low_block_transition_541",{
  lineupSnapshot:lineup.map(p=>p.position==="CB"||p.position==="ST"
    ? {...p,matchScore:43}:p)
}),0.4);
assert.ok(base.probability>weaker.probability,"player role fit matters, not formation name");
const protectedCounter=roll(fixture("low_block_transition_541",{
  opponent:{...opponent,tacticalBehaviour:{restDefence:"collective"}}
}),0.4);
assert.ok(protectedCounter.probability<base.probability,
  "confirmed rest-defence cover should counter a deep-block break");
const controlCover=roll(fixture("slow_it_down",{
  opponent:{...opponent,tacticalBehaviour:{passingLaneCover:"central"}}
}),0.4);
assert.ok(controlCover.probability<roll(fixture("slow_it_down"),0.4).probability);
const stalled=roll(fixture(),0.99);
assert.equal(stalled.status,"lost_control");
assert.equal(stalled.side,"against");
const weakRest=roll(fixture("low_block_transition_541",{
  teamFitSnapshot:{...fixture().teamFitSnapshot,
    tacticalProfile:{...fixture().teamFitSnapshot.tacticalProfile,restDefenseScore:43}}
}),0.99);
assert.equal(weakRest.xgDeltaAgainst,0.09);
assert.ok(weakRest.xgDeltaAgainst>stalled.xgDeltaAgainst);

const chances=[{side:"against",quality:0.09},{side:"for",quality:0.1}];
assert.equal(annotateGameControlChances(chances,roll(fixture("see_out_the_game"),0)),
  chances,"prevented shot must never label a fabricated event");
assert.equal(annotateGameControlChances(chances,base).filter(x=>x.tacticalMoment).length,1);
assert.equal(annotateGameControlChances(chances,stalled)[0].tacticalMoment.kind,"control_lost");
assert.equal(annotateGameControlChances([],base).length,0);

function scenario(plan,status){
  for(let i=0;i<2500;i++){
    const s=fixture(plan,{id:"v6-control-"+plan+"-"+i});
    if(roll(s,highPressPhaseRoll(s,"0:game-control"))?.status===status)return s;
  }
  throw Error("No "+plan+" "+status+" deterministic case");
}
const original=Math.random;
try{
  Math.random=()=>0.99;
  for(const plan of Object.keys(routes)){
    for(const outcome of (["see_out_the_game","slow_it_down"].includes(plan)
        ? ["controlled","lost_control"]:["counterattack","lost_control"])){
      const initial=scenario(plan,outcome);
      const played=advanceMatchClock(initial),period=played.timeline[0];
      assert.equal(period.tacticalPhase?.situation,"game_control_and_release");
      assert.equal(period.tacticalPhase.status,outcome);
      assert.equal(period.tacticalXg,undefined,"no duplicate static plan advantage");
      for(const key of ["for","against"]){
        assert.equal(Math.round((period.expectedGoals[key]-
          period.baselineExpectedGoals[key])*100)/100,
          period.tacticalPhase[key==="for"?"xgDeltaFor":"xgDeltaAgainst"]);
      }
      assert.equal(played.minuteLog.length,period.chances,"no phantom shots");
      assert.ok(played.minuteLog.filter(e=>e.tacticalMoment).length<=1);
      assert.equal(advanceMatchClock(played),played);
      assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(initial)))
        .timeline[0].tacticalPhase,period.tacticalPhase);
      const final=finalizeMatchdaySession(played);
      assert.equal(final.expectedGoals.for,period.expectedGoals.for);
      assert.equal(final.expectedGoals.against,period.expectedGoals.against);
    }
  }
  assert.equal(advanceMatchClock(fixture("slow_it_down",{
    causalGameControlVersion:undefined
  })).timeline[0].tacticalPhase,undefined,"old matches remain on previous engine");
}finally{Math.random=original}
console.log("OK: final four v6 plans, role chains, game state, opponent replies and xG conservation");

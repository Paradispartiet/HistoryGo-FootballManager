#!/usr/bin/env node
import assert from "node:assert/strict";
import { createOfficeSceneModel } from "../src/ui/manager-office-presentation.js";

let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks += 1; };

const ready = createOfficeSceneModel({
  clubName: "Rosenborg",
  clubWeekState: { week: 4, phase: "matchday" },
  phaseLabel: "Kampdag",
  nextActions: [{ tag: "Kamp", title: "Spill neste kamp", hint: "Laget er klart for avspark." }],
  nextMatch: { round: 4, opponent: "Viking", venue: "Hjemme", ground: "Lerkendal" },
  lineupCount: 11,
  rosterCount: 18,
  trainingSelected: true,
  inboxAttentionCount: 0,
  readiness: { canStartMatch: true, summary: "Kampklar" },
  teamStatus: "God balanse i laget",
  assistantSignal: "Vær tålmodig i oppbyggingen.",
  standing: { position: 2, points: 8, goalDifference: 4 },
  lastMatch: { outcome: "win", score: { for: 2, against: 0 }, opponent: { name: "Brann" } },
  boardTrust: 72,
  playerMorale: 68,
  mediaPressure: 31
});

check(ready.clubName === "Rosenborg", "klubbnavn beholdes");
check(ready.week === 4 && ready.phaseLabel === "Kampdag", "uke og fase beholdes");
check(ready.mainIssue.title === "Spill neste kamp", "neste handling blir ukas hovedsak");
check(ready.nextMatch.label === "Viking", "neste motstander vises");
check(ready.nextMatch.meta.includes("Lerkendal"), "stadion vises");
check(ready.statuses.length === 4, "fire operative statuser");
check(ready.statuses.find((item) => item.id === "lineup")?.value === "11/11", "lagstatus er konkret");
check(ready.statuses.find((item) => item.id === "training")?.value === "Valgt", "trening er valgt");
check(ready.statuses.find((item) => item.id === "inbox")?.value === "Håndtert", "inboks er håbndtert");
check(ready.statuses.find((item) => item.id === "readiness")?.value === "Kampklar", "kampklarhet er autoritativ");
check(ready.seasonLine.includes("2. plass") && ready.seasonLine.includes("8 poeng"), "sesongstatus vises");
check(ready.lastResult === "Seier 2–0 mot Brann", "siste resultat formateres");
check(ready.board.tone === "positive" && ready.media.tone === "positive", "klubbpuls er kvalitativ");

const incomplete = createOfficeSceneModel({
  clubWeekState: { week: 1, phase: "analysis" },
  nextActions: [{ tag: "Innboks", title: "Les assistentråden", hint: "Fysio venter på svar." }],
  lineupCount: 8,
  rosterCount: 12,
  trainingSelected: false,
  inboxAttentionCount: 1,
  inboxFocusTitle: "Belastningen er for høy",
  readiness: { canStartMatch: false, reason: "Tre plasser og trening gjenstår." }
});

check(incomplete.mainIssue.tag === "Innboks", "hovedsak kan komme fra innboksen");
check(incomplete.statuses.find((item) => item.id === "lineup")?.tone === "negative", "ufullstendig lag markeres");
check(incomplete.statuses.find((item) => item.id === "inbox")?.detail === "Belastningen er for høy", "fokussak følger kontoret");
check(incomplete.statuses.find((item) => item.id === "readiness")?.detail.includes("Tre plasser"), "blokkeringsgrunn vises");
check(incomplete.nextMatch.available === false, "manglende terminliste gir deaktivert kampkort");

console.log(`Manager Office & Inbox v1: ${checks}/${checks} kontroller bestått.`);

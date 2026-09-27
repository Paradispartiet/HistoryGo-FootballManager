import { expect, test } from "@playwright/test";
import { deriveSeasonTarget } from "../../src/football-season-review.js";

test("nivåskifte nullstiller gammel tabellplass når styret setter nytt sesongmål", () => {
  const promotedTakeover = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 2,
    previousPosition: 1,
    tierChanged: true,
    clubExpectation: {
      targetPosition: 8,
      label: "Topp 8",
      description: "På det nye nivået hører klubben hjemme i øvre halvdel."
    }
  });

  expect(promotedTakeover).toMatchObject({
    targetPosition: 8,
    label: "Topp 8"
  });

  const promotedOwnClub = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 2,
    previousPosition: 1,
    tierChanged: true
  });
  expect(promotedOwnClub.targetPosition).toBe(8);

  const relegatedTakeover = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 3,
    previousPosition: 16,
    tierChanged: true,
    clubExpectation: {
      targetPosition: 2,
      label: "Opprykk",
      description: "På det lavere nivået er klubben blant opprykksfavorittene."
    }
  });
  expect(relegatedTakeover).toMatchObject({
    targetPosition: 2,
    label: "Opprykk"
  });

  const sameTierChampion = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 2,
    previousPosition: 1,
    tierChanged: false,
    clubExpectation: {
      targetPosition: 8,
      label: "Topp 8",
      description: "Denne forventningen skal ikke overstyre progresjonen på samme nivå."
    }
  });
  expect(sameTierChampion).toMatchObject({
    targetPosition: 1,
    label: "Seriegull"
  });
});

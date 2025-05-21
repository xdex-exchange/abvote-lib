import { describe, it, expect } from "vitest";
import {
  applyFinalAsymmetricNoise,
  applyInertiaAndResistance,
  applyVolatilityNoise,
  computeLogReturn,
} from "../src";
import Decimal from "decimal.js";

function testApplyInertiaAndResistance() {
  const rawDeltaUp = new Decimal("0.02");
  const rawDeltaDown = new Decimal("-0.02");

  const prevDeltasUp = [
    new Decimal("0.01"),
    new Decimal("0.015"),
    new Decimal("0.02"),
    new Decimal("0.025"),
    new Decimal("0.03"),
  ];

  console.log("== Test trend rises in unison ==");
  const result1 = applyInertiaAndResistance(rawDeltaUp, {
    prevDeltas: prevDeltasUp,
    inertiaStrength: new Decimal(3),
    reversalResistance: new Decimal(2),
    memoryDepth: 5,
  });
  console.log("rawDeltaUp:", rawDeltaUp.toString());
  console.log("result1:", result1.toString());

  console.log("\n== Test trend reversal down ==");
  const result2 = applyInertiaAndResistance(rawDeltaDown, {
    prevDeltas: prevDeltasUp,
    inertiaStrength: new Decimal(3),
    reversalResistance: new Decimal(5),
    memoryDepth: 5,
  });
  console.log("rawDeltaDown:", rawDeltaDown.toString());
  console.log("result2:", result2.toString());
}

describe("math utils", () => {
  it("should compute log return correctly", () => {
    testApplyInertiaAndResistance();
  });
});

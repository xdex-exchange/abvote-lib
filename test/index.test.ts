import { describe, it, expect } from "vitest";
import { applyInertiaAndResistance } from "../src";
import Decimal from "decimal.js";

const inertiaStrength = 10;
const reversalResistance = 10;

function testApplyInertiaAndResistance(
  prevDeltasUp: Decimal[],
  rawDeltaUp: Decimal,
  rawDeltaDown: Decimal
) {
  console.log("== Test trend rises in unison ==");
  const result1 = applyInertiaAndResistance(rawDeltaUp, {
    prevDeltas: prevDeltasUp,
    inertiaStrength: new Decimal(inertiaStrength),
    reversalResistance: new Decimal(reversalResistance),
    memoryDepth: 5,
  });
  console.log("rawDeltaUp:", rawDeltaUp.toString());
  console.log("result1:", result1.toString());

  console.log("\n== Test trend reversal down ==");
  const result2 = applyInertiaAndResistance(rawDeltaDown, {
    prevDeltas: prevDeltasUp,
    inertiaStrength: new Decimal(inertiaStrength),
    reversalResistance: new Decimal(reversalResistance),
    memoryDepth: 5,
  });
  console.log("rawDeltaDown:", rawDeltaDown.toString());
  console.log("result2:", result2.toString());
}

describe("math utils", () => {
  it("should compute log return correctly", () => {
    {
      const rawDeltaUp = new Decimal("0.02");
      const rawDeltaDown = new Decimal("-0.02");

      const prevDeltasUp = [
        new Decimal("-0.011"),
        new Decimal("-0.015"),
        new Decimal("-0.02"),
        new Decimal("-0.025"),
        new Decimal("-0.03"),
      ];
      testApplyInertiaAndResistance(prevDeltasUp, rawDeltaUp, rawDeltaDown);
    }
    {
      const rawDeltaUp = new Decimal("0.02");
      const rawDeltaDown = new Decimal("-0.02");

      const prevDeltasUp = [
        new Decimal("0.011"),
        new Decimal("0.015"),
        new Decimal("0.02"),
        new Decimal("0.025"),
        new Decimal("0.03"),
      ];
      testApplyInertiaAndResistance(prevDeltasUp, rawDeltaUp, rawDeltaDown);
    }
  });
});

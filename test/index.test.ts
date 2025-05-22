import { describe, it, expect } from "vitest";
import { applyInertiaAndResistanceWithClamp } from "../src";
import Decimal from "decimal.js";

function testApplyInertiaAndResistance(
  prevDeltasUp: Decimal[],
  rawDeltaUp: Decimal,
  rawDeltaDown: Decimal,
  prevOraclePrice?: Decimal
) {
  console.log("== Delta Up ==");
  const result1 = applyInertiaAndResistanceWithClamp(
    rawDeltaUp,
    prevDeltasUp,
    5,
    {}
  );
  console.log(`rawDeltaUp:${rawDeltaUp.toString()}`);
  console.log(`deltaUp:${result1.toString()}`);
  if (prevOraclePrice) {
    const indexPriceMultiplier = Decimal.exp(result1);
    const nextIndexPrice = prevOraclePrice.mul(indexPriceMultiplier);
    console.log(`nextIndexPrice:${nextIndexPrice.toString()}`);
  }

  console.log("\n== Delta Down ==");
  const result2 = applyInertiaAndResistanceWithClamp(
    rawDeltaDown,
    prevDeltasUp,
    5,
    {}
  );
  console.log(`rawDeltaDown:${rawDeltaDown.toString()}`);
  console.log(`deltaDown:${result2.toString()}`);
}

describe("math utils", () => {
  it("should compute log return correctly", () => {
    console.log(
      "--------------------------------Situation of a downward trend--------------------------------"
    );
    {
      const rawDeltaUp = new Decimal("0.02");
      const rawDeltaDown = new Decimal("-0.061370001393850021745");

      const prevDeltasUp = [
        new Decimal("-0.017919198934148586477"),
        new Decimal("0.0042620134768052626305"),
        new Decimal("0.061041512185861635036"),
        new Decimal("-0.066141306024280737878"),
        new Decimal("-0.017157377162207816192"),
      ];
      testApplyInertiaAndResistance(prevDeltasUp, rawDeltaUp, rawDeltaDown);
    }
    console.log(
      "--------------------------------Situation of a upward trend--------------------------------"
    );
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
  it("maxFactor", () => {
    const rawDeltaUp = new Decimal("0.10119613785329498086");
    const rawDeltaDown = new Decimal("-0.02");
    const prevOraclePrice = new Decimal("0.030129264386458176827");
    const prevDeltasUp = [
      new Decimal("0.1622918974909516223"),
      new Decimal("0.45429100321398822674"),
      new Decimal("0.27171651202845584244"),
      new Decimal("0.18795389867090453923"),
      new Decimal("-0.013505218406999819531"),
    ];
    testApplyInertiaAndResistance(
      prevDeltasUp,
      rawDeltaUp,
      rawDeltaDown,
      prevOraclePrice
    );
  });
});

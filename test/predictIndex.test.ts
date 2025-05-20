import Decimal from "decimal.js";
import { predictIndexImpactFromExponentOnly } from "../src";
import { describe, it } from "vitest";

function testPredictIndexImpact() {
  const prevIndexPrice = new Decimal("0.005079775510208490099");
  const price24hAgo = new Decimal("0.0050829437880038297502");

  const options = {
    maxDailyPercent: 50,
    price24hAgo,
    prevTokenDeltas: [
      new Decimal("-0.043938655308389717227"),
      new Decimal("-0.018281412807738909623"),
      new Decimal("0.0094312860159767609877"),
      new Decimal("0.029325543555792175065"),
      new Decimal("-0.011316175012344287543"),
    ],
    showLog: true,
  };

  const testExponents = [
    new Decimal("0.909980071550066589"), // Extremely strong down
    new Decimal("0.959980071550066589"), // Stronger down
    new Decimal("0.999980071550066589"), // Faint down
    new Decimal("1.00"), // Neutral
    new Decimal("1.000019928449933"), // Faint upward
    new Decimal("1.040019928449933"), // stronger upward
    new Decimal("1.090019928449933"), // Extremely strong upward
  ];

  for (const exponentPrice of testExponents) {
    const result = predictIndexImpactFromExponentOnly(
      exponentPrice,
      prevIndexPrice,
      options
    );

    console.log(`\n===== Exponent: ${exponentPrice.toString()} =====`);
    console.log(
      `Predicted Index Price: ${result.predictedIndexPrice.toFixed(6)}`
    );
    console.log(`Δ%: ${result.deltaPercent.mul(100).toFixed(4)}%\n`);
  }
}

describe("predict utils", () => {
  it("predict index from exponent", () => {
    testPredictIndexImpact();
  });
});

import { describe, it, expect } from "vitest";
import {
  applyFinalAsymmetricNoise,
  applyVolatilityNoise,
  computeLogReturn,
} from "../src";
import Decimal from "decimal.js";

describe("math utils", () => {
  it("should compute log return correctly", () => {
    const prevIndexPrice = new Decimal("0.0046755848470784665504");
    let combinedDelta = new Decimal("-0.010827566174295808751");
    const tokenDelta = new Decimal("-0.00036632485676769495749");

    combinedDelta = applyVolatilityNoise(combinedDelta, {
      volatilityAmplifier: 1.105,
      noiseRange: 0.01,
    });
    let indexPriceMultiplier = Decimal.exp(combinedDelta);

    const nextIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);
    console.log("nextIndexPrice", nextIndexPrice);
  });
});

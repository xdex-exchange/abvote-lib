import { describe, it, expect } from "vitest";
import { computeLogReturn } from "../src";
import Decimal from "decimal.js";

describe("math utils", () => {
  it("should compute log return correctly", () => {
    const current = new Decimal(110);
    const previous = new Decimal(100);
    const result = computeLogReturn(current, previous);
    expect(result.toFixed(4)).toBe(new Decimal(110 / 100).log().toFixed(4));
  });
});

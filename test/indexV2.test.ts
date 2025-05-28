import Decimal from "decimal.js";
import { computeBiasDrivenIndexPriceV2, TokenWeightMap } from "../src";
import { describe, it } from "vitest";

type TokenPriceMap = Record<string, Decimal>;

function runSequentialIndexSimulation(
  testSeries: {
    label?: string;
    prices: TokenPriceMap;
    prevPrices: TokenPriceMap;
    tokenWeights: TokenWeightMap;
    exponentPrice: Decimal;
  }[],
  initialIndexPrice: Decimal
) {
  let prevIndexPrice = initialIndexPrice;

  testSeries.forEach((test, i) => {
    console.log(
      `\n=== ⏱️ ROUND ${i + 1} ${test.label ? `(${test.label})` : ""} ===`
    );
    const result = computeBiasDrivenIndexPriceV2(
      test.prices,
      test.prevPrices,
      test.tokenWeights,
      test.exponentPrice,
      prevIndexPrice,
      {
        showLog: true,
      }
    );
    console.log(`Prev Index Price: ${prevIndexPrice.toFixed(7)}`);
    console.log(`Next Index Price: ${result.nextIndexPrice.toFixed(7)}`);
    console.log(`Delta Applied: ${result.delat.toFixed(6)}`);

    prevIndexPrice = result.nextIndexPrice;
  });
}

describe("index", () => {
  it("indexV2 - sequential simulation", () => {
    const initialIndexPrice = new Decimal("0.030129");

    runSequentialIndexSimulation(
      [
        {
          label: "Round 1: Slight up",
          prices: {
            A: new Decimal("0.22811410012002892"),
            B: new Decimal("12.809483394925397"),
          },
          prevPrices: {
            A: new Decimal("0.22811410012002892"),
            B: new Decimal("12.816315318121726"),
          },
          tokenWeights: {
            A: new Decimal("1"),
            B: new Decimal("1"),
          },
          exponentPrice: new Decimal("1.0012"),
        },
        {
          label: "Round 2: Vote push up",
          prices: {
            A: new Decimal("0.229"),
            B: new Decimal("12.80"),
          },
          prevPrices: {
            A: new Decimal("0.229"),
            B: new Decimal("12.80"),
          },
          tokenWeights: {
            A: new Decimal("1"),
            B: new Decimal("1"),
          },
          exponentPrice: new Decimal("1.0045"),
        },
        {
          label: "Round 3: Slight down",
          prices: {
            A: new Decimal("0.22811410012002892"),
            B: new Decimal("12.812313393229338"),
          },
          prevPrices: {
            A: new Decimal("0.22811410012002892"),
            B: new Decimal("12.808923393815556"),
          },
          tokenWeights: {
            A: new Decimal("1"),
            B: new Decimal("1"),
          },
          exponentPrice: new Decimal("1.0045"),
        },
        {
          label: "Round 4: Vote push down",
          prices: {
            A: new Decimal("0.228"),
            B: new Decimal("12.95"),
          },
          prevPrices: {
            A: new Decimal("0.228"),
            B: new Decimal("12.95"),
          },
          tokenWeights: {
            A: new Decimal("1"),
            B: new Decimal("1"),
          },
          exponentPrice: new Decimal("0.9975"),
        },
      ],
      initialIndexPrice
    );
  });
  it("series", () => {
    const initialIndexPrice = new Decimal("0.030129");
    const rounds = [
      {
        label: "Round 1: down",
        prices: {
          A: new Decimal("0.22811410012002892"),
          B: new Decimal("13.987086344488754"),
        },
        prevPrices: {
          A: new Decimal("0.22811410012002892"),
          B: new Decimal("12.816315318121726"),
        },
        tokenWeights: {
          A: new Decimal("1"),
          B: new Decimal("1"),
        },
        exponentPrice: new Decimal("1.0012"),
      },
      {
        label: "Round 2: back to original",
        prices: {
          A: new Decimal("0.22811410012002892"),
          B: new Decimal("12.816315318121726"),
        },
        prevPrices: {
          A: new Decimal("0.22811410012002892"),
          B: new Decimal("13.987086344488754"),
        },
        tokenWeights: {
          A: new Decimal("1"),
          B: new Decimal("1"),
        },
        exponentPrice: new Decimal("1.0012"),
      },
    ];

    runSequentialIndexSimulation(rounds, initialIndexPrice);
  });
});

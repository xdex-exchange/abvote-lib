import { computeBiasDrivenIndexPriceV2, TokenWeightMap } from "../src";
import { describe, it } from "vitest";
import Decimal from "decimal.js";
import rawData from "./abvote_public_oracle_price_history.json";

type TokenPriceMap = Record<string, Decimal>;

type Round = {
  label?: string;
  prices: TokenPriceMap;
  prevPrices: TokenPriceMap;
  tokenWeights: TokenWeightMap;
  exponentPrice: Decimal;
};

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
  let indexPrices = [initialIndexPrice.toFixed(7)];
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
    indexPrices.push(result.nextIndexPrice.toFixed(7));
  });

  return indexPrices;
}

const addressMap = {
  A: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
  B: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
};

const exponentPrice = new Decimal("1.0012");

function parseRounds(rawData: any[], exponentPrice: Decimal): Round[] {
  const rounds: Round[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const current = rawData[i];
    const tokenPrices = JSON.parse(current.tokenPrices);

    const prices = {
      A: new Decimal(tokenPrices[addressMap.A]),
      B: new Decimal(tokenPrices[addressMap.B]),
    };

    const prevPrices =
      i === 0
        ? prices
        : {
            A: new Decimal(
              JSON.parse(rawData[i - 1].tokenPrices)[addressMap.A]
            ),
            B: new Decimal(
              JSON.parse(rawData[i - 1].tokenPrices)[addressMap.B]
            ),
          };

    rounds.push({
      label: `Round ${i + 1}`,
      prices,
      prevPrices,
      tokenWeights: {
        A: new Decimal("1"),
        B: new Decimal("1"),
      },
      exponentPrice,
    });
  }

  return rounds;
}

describe("index", () => {
  it("series", async () => {
    const rev = rawData.reverse();
    const rounds = parseRounds(rev, exponentPrice);
    const initialIndexPrice = rounds[0].prices["B"].div(rounds[0].prices["A"]);

    const indexPrices = runSequentialIndexSimulation(rounds, initialIndexPrice);
    console.log("indexPrices", indexPrices);
  });
});

import { ABValue, computeBiasDrivenIndexPriceV2 } from "../src";
import { describe, it } from "vitest";
import Decimal from "decimal.js";
import rawData from "./abvote_public_oracle_price_history.json";
import { Logger } from "@nestjs/common";
import { Round, writeIndexPricesToExcel } from "./utils";

function runSequentialIndexSimulation(
  testSeries: Round[],
  initialIndexPrice: Decimal
) {
  let indexPrices = [initialIndexPrice];
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
        sensitivityBase: 0.4,
        logger: new Logger(),
      }
    );
    console.log(`Prev Index Price: ${prevIndexPrice.toFixed(7)}`);
    console.log(`Next Index Price: ${result.nextIndexPrice.toFixed(7)}`);
    console.log(`Delta Applied: ${result.delat.toFixed(6)}`);

    prevIndexPrice = result.nextIndexPrice;
    indexPrices.push(result.nextIndexPrice);
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

    const prices = new ABValue(
      tokenPrices[addressMap.A],
      tokenPrices[addressMap.B]
    );

    const prevPrices =
      i === 0
        ? prices
        : new ABValue(
            JSON.parse(rawData[i - 1].tokenPrices)[addressMap.A],
            JSON.parse(rawData[i - 1].tokenPrices)[addressMap.B]
          );

    rounds.push({
      label: `Round ${i + 1}`,
      prices,
      prevPrices,
      tokenWeights: new ABValue("1", "1"),
      exponentPrice,
    });
  }

  return rounds;
}

describe("index", () => {
  it("series", async () => {
    const rev = rawData.reverse();
    const rounds = parseRounds(rev, exponentPrice);
    const initialIndexPrice = new Decimal("0.01");

    const indexPrices = runSequentialIndexSimulation(rounds, initialIndexPrice);

    writeIndexPricesToExcel(
      rounds,
      indexPrices,
      "my_index_prices_with_delta.xlsx"
    );
  });
});

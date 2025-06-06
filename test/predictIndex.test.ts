import Decimal from "decimal.js";
import {
  ABValue,
  computeBiasDrivenIndexPriceV2,
  DEFAULT_TWITTER_VOTE_WEIGHT,
  ExponentService,
  VotedAB,
  VoteSource,
} from "../src";
import { describe, it } from "vitest";

function runSequentialIndexSimulation(
  testSeries: {
    label?: string;
    prices: ABValue;
    prevPrices: ABValue;
    tokenWeights: ABValue;
    exponentPrice: Decimal;
  }[],
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
        twitterVoteWeight: new Decimal(0),
      }
    );
    console.log(`Prev Index Price: ${prevIndexPrice.toFixed(7)}`);
    console.log(`Next Index Price: ${result.nextIndexPrice.toFixed(7)}`);
    // console.log(
    //   `Applied: ${result.nextIndexPrice
    //     .div(prevIndexPrice)
    //     .sub(1)
    //     .mul(100)
    //     .toFixed(6)}%`
    // );

    prevIndexPrice = result.nextIndexPrice;
    indexPrices.push(result.nextIndexPrice);
  });

  return indexPrices;
}

function getExponentPrice(exponentService: ExponentService, number: number) {
  exponentService.computeExponent(number, VoteSource.TWITTER, VotedAB.A);
  const ex = exponentService.getExponent();
  const b = new Decimal(ex.b.toString());
  const a = new Decimal(ex.a.toString());
  const exponentPrice = b.div(a);
  return exponentPrice;
}

describe("index", () => {
  it("indexV2 - sequential simulation", () => {
    const initialIndexPrice = new Decimal("0.01");
    let indexPrices1: Decimal[];
    let indexPrices2: Decimal[];

    {
      const exponentService = new ExponentService();
      const w1 = getExponentPrice(exponentService, 0);

      indexPrices1 = runSequentialIndexSimulation(
        [
          {
            label: "Round 1: 10 up",
            prices: new ABValue("12.82460861209476", "0.22730061228727097"),
            prevPrices: new ABValue("12.82260861209476", "0.22730061228727097"),
            tokenWeights: new ABValue("1", "1"),
            exponentPrice: w1,
          },
          // {
          //   label: "Round 2: 50 up",
          //   prices: new ABValue("12.835466574976376", "0.22730061228727097"),
          //   prevPrices: new ABValue(
          //     "12.830758817100717",
          //     "0.22730061228727097"
          //   ),
          //   tokenWeights: new ABValue("1", "1"),
          //   exponentPrice: w1,
          // },
        ],
        initialIndexPrice
      );
    }

    {
      const exponentService = new ExponentService();
      const w1 = getExponentPrice(exponentService, 1000000);

      indexPrices2 = runSequentialIndexSimulation(
        [
          {
            label: "Round 1: 10 up",
            prices: new ABValue("12.82460861209476", "0.22730061228727097"),
            prevPrices: new ABValue("12.82260861209476", "0.22730061228727097"),
            tokenWeights: new ABValue("1", "1"),
            exponentPrice: w1,
          },
          // {
          //   label: "Round 2: 50 up",
          //   prices: new ABValue("12.835466574976376", "0.22730061228727097"),
          //   prevPrices: new ABValue(
          //     "12.830758817100717",
          //     "0.22730061228727097"
          //   ),
          //   tokenWeights: new ABValue("1", "1"),
          //   exponentPrice: w1,
          // },
        ],
        initialIndexPrice
      );
    }

    // Compare two series
    console.log(`\n=== 📊 COMPARISON: indexPrices2 vs indexPrices1 ===`);

    for (let i = 0; i < indexPrices1.length; i++) {
      const basePrice = indexPrices1[i];
      const comparePrice = indexPrices2[i];
      const pctChange = comparePrice.div(basePrice).sub(1).mul(100).toFixed(6);

      console.log(
        `Round ${
          i + 1
        }: index2:${comparePrice} / index1:${basePrice} = ${comparePrice
          .div(basePrice)
          .toFixed(7)} (${pctChange}%)`
      );
    }
  });
});

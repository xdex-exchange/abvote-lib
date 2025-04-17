// src/lib/indexPrice.ts
import Decimal from "decimal.js";
import { computeLogReturn } from "./math";
import {
  TokenPrevPriceMap,
  TokenPriceMap,
  TokenWeightMap,
} from "../types/types";

/**
 * Calculate the index price of a multi-token portfolio, weighted base price × exponent
 * @param prices Current price set, for example:{ BTC: 62000, ETH: 3200}
 * @param weights The weight of each currency, for example:{ BTC: 0.6, ETH: 0.4}
 * @param weightedExponent Weighted index impact factor, e.g., 1.02
 * @returns Composite weighted index price
 */
export const computeIndexPrice = (
  prices: TokenPriceMap,
  weights: TokenWeightMap,
  weightedExponent: Decimal
): Decimal => {
  let basePrice = new Decimal(0);

  for (const token in prices) {
    const price = prices[token];
    const weight = weights[token] ?? new Decimal(0);
    basePrice = basePrice.add(price.mul(weight));
  }

  return basePrice.mul(weightedExponent);
};

/**
 * Calculate the index price of the multi-token portfolio, taking into account the log return, weight and exponent of the multi-currency price.
 *
 * @param prices Current price set, for example:{ BTC: 62000, ETH: 3200}
 * @param prevPrices The price set of the previous point in time (some currencies can be defaulted, and the default is equal to the current price)
 * @param weights The weight of each currency, for example:{ BTC: 0.6, ETH: 0.4}
 * @param weightedExponent Weighted index impact factor, e.g., 1.02
 *
 * @returns Composite weighted index price
 */
export const computeIndexPriceWithLogReturnWeightedExponent = (
  prices: TokenPriceMap,
  prevPrices: TokenPrevPriceMap,
  weights: TokenWeightMap,
  weightedExponent: Decimal
): Decimal => {
  let weightedReturn = new Decimal(0);
  let basePrice = new Decimal(0);

  for (const token in prices) {
    const price = prices[token];
    const prevPrice = prevPrices[token] ?? price;
    const weight = weights[token] ?? new Decimal(0);

    const logReturn = computeLogReturn(price, prevPrice);
    weightedReturn = weightedReturn.add(logReturn.mul(weight));
    basePrice = basePrice.add(price.mul(weight));
  }

  return basePrice.mul(weightedReturn.add(1)).mul(weightedExponent);
};

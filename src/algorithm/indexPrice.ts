// src/lib/indexPrice.ts
import Decimal from "decimal.js";
import { computeLogReturn } from "./math";
import { TokenPriceMap, TokenWeightMap } from "../types/types";

/**
 * Calculate the index price of a multi-token portfolio, weighted base price × exponent
 * @param prices Current price set, for example:{ BTC: 62000, ETH: 3200}
 * @param weights The weight of each currency, for example:{ BTC: 0.6, ETH: 0.4}
 * @param weightedExponent Weighted index impact factor, e.g., 1.02
 * @returns Composite weighted index price.
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

export function computeBiasAdjustedIndexPrice(
  prices: TokenPriceMap,
  prevPrices: TokenPriceMap,
  weights: TokenWeightMap,
  exponentPrice: Decimal,
  prevIndexPrice: Decimal = new Decimal(0.01)
): Decimal {
  const symbols = Object.keys(prices);
  if (symbols.length < 2) return new Decimal(1);

  const aaSymbol = symbols[0];
  const bbSymbol = symbols[1];

  const aaPrice = prices[aaSymbol];
  const aaPrevPrice = prevPrices[aaSymbol];
  const bbPrice = prices[bbSymbol];
  const bbPrevPrice = prevPrices[bbSymbol];

  const aaWeight = weights[aaSymbol];
  const bbWeight = weights[bbSymbol];

  // Check if it is valid
  if (
    aaPrice.lte(0) ||
    aaPrevPrice.lte(0) ||
    bbPrice.lte(0) ||
    bbPrevPrice.lte(0)
  ) {
    return new Decimal(1);
  }

  // Step 1: Calculate log return
  const rA = Decimal.ln(aaPrice.div(aaPrevPrice));
  const rB = Decimal.ln(bbPrice.div(bbPrevPrice));

  // Step 2: Weighted combination (AA forward, BB reverse)
  const totalWeight = aaWeight.add(bbWeight);
  if (totalWeight.eq(0)) return new Decimal(1);

  const weightedDelta = aaWeight.mul(rA).sub(bbWeight.mul(rB)).div(totalWeight);

  // Step 3: Apply exponentPrice zoom in/out changes
  const adjustedDelta = weightedDelta.mul(exponentPrice);

  // Step 4: Multiplication of exp(Δ) from the previous price to arrive at the current indexPrice ratio (relative to the previous round)
  const indexPriceMultiplier = Decimal.exp(adjustedDelta);
  const nextIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);

  return nextIndexPrice;
}

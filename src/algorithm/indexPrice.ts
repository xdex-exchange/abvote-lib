// src/lib/indexPrice.ts
import Decimal from "decimal.js";
import { computeLogReturn } from "./math";
import { TokenPriceMap, TokenWeightMap } from "../types/types";
import { INITIAL_INDEX_PRICE } from "../constants/constants";
import { applyVolatilityNoise } from "./volatility";

type ComputeBiasAdjustedIndexPriceOptions = {
  enableVolatility?: boolean;
  volatilityAmplifier?: number;
  noiseRange?: number;
};

export function computeBiasAdjustedIndexPrice(
  prices: TokenPriceMap,
  prevPrices: TokenPriceMap,
  weights: TokenWeightMap,
  exponentPrice: Decimal,
  prevIndexPrice: Decimal = new Decimal(INITIAL_INDEX_PRICE),
  options?: ComputeBiasAdjustedIndexPriceOptions
): Decimal {
  const symbols = Object.keys(prices);
  if (symbols.length < 2) return new Decimal(INITIAL_INDEX_PRICE);
  const prevSymbols = Object.keys(prevPrices);
  if (prevSymbols.length < 2) return new Decimal(INITIAL_INDEX_PRICE);

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
    return new Decimal(INITIAL_INDEX_PRICE);
  }

  // Step 1: Calculate log return
  const rA = computeLogReturn(aaPrice, aaPrevPrice);
  const rB = computeLogReturn(bbPrice, bbPrevPrice);

  // Step 2: Weighted combination (AA forward, BB reverse)
  const totalWeight = aaWeight.add(bbWeight);
  if (totalWeight.eq(0)) return new Decimal(1);

  const weightedDelta = aaWeight.mul(rA).sub(bbWeight.mul(rB)).div(totalWeight);

  // Step 3: Apply exponent-based amplification (from voting bias)
  let adjustedDelta = weightedDelta.mul(exponentPrice);

  // Step 3.5: Optional - Apply synthetic volatility for stimulation
  if (options?.enableVolatility) {
    adjustedDelta = applyVolatilityNoise(adjustedDelta, {
      volatilityAmplifier: options.volatilityAmplifier,
      noiseRange: options.noiseRange,
    });
  }

  // Step 4: Multiplication of exp(Δ) from the previous price to arrive at the current indexPrice ratio (relative to the previous round)
  const indexPriceMultiplier = Decimal.exp(adjustedDelta);
  const nextIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);

  return nextIndexPrice;
}

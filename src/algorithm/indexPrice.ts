// src/lib/indexPrice.ts
import Decimal from "decimal.js";
import { computeLogReturn, tanhClampDelta } from "./math";
import { TokenPriceMap, TokenWeightMap } from "../types/types";
import { INITIAL_INDEX_PRICE } from "../constants/constants";
import { applyVolatilityNoise } from "./volatility";

type ComputeBiasAdjustedIndexPriceOptions = {
  enableVolatility?: boolean;
  volatilityAmplifier?: number;
  noiseRange?: number;
  maxStepPercent?: number; // Maximum fluctuation percentage per step (for example, 3 means ± 3%)
  maxDailyPercent?: number; // 24h cumulative maximum fluctuation percentage (e. g. 3 means ± 3%)
  price24hAgo?: Decimal; // Used to limit 24-hour cumulative volatility (can be index or token price)
  tokenImpactPercent?: number;
  biasImpactPercent?: number;
  showLog?: boolean;
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
  if (symbols.length < 2) return new Decimal(0);
  const prevSymbols = Object.keys(prevPrices);
  if (prevSymbols.length < 2) return new Decimal(0);

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
    return new Decimal(0);
  }

  // Step 1: Calculate log return
  const rA = computeLogReturn(aaPrice, aaPrevPrice);
  const rB = computeLogReturn(bbPrice, bbPrevPrice);

  // Step 2: Weighted combination (AA forward, BB reverse)
  const totalWeight = aaWeight.add(bbWeight);
  if (totalWeight.eq(0)) return new Decimal(0);

  const halfMaxStepPercent = (options?.maxStepPercent ?? 3) / 2;

  // Step 3: Weighted price return (token impact)
  const tokenDelta = aaWeight.mul(rA).sub(bbWeight.mul(rB)).div(totalWeight);
  const cappedTokenDelta = tanhClampDelta(
    tokenDelta,
    options?.tokenImpactPercent ?? halfMaxStepPercent
  );

  // Step 4: Voting exponent effect (bias impact)
  const biasMultiplier = exponentPrice;
  const rawBiasDelta = cappedTokenDelta.mul(biasMultiplier);
  const cappedBiasDelta = tanhClampDelta(
    rawBiasDelta.sub(cappedTokenDelta),
    options?.biasImpactPercent ?? halfMaxStepPercent
  );

  // Step 5: Combine
  let adjustedDelta = cappedTokenDelta.add(cappedBiasDelta);

  if (options?.showLog) {
    console.log(`Combine adjustedDelta:${adjustedDelta.toString()}`);
  }

  // Step 5.1: Optional - Apply synthetic volatility for stimulation
  if (options?.enableVolatility) {
    adjustedDelta = applyVolatilityNoise(adjustedDelta, {
      volatilityAmplifier: options.volatilityAmplifier,
      noiseRange: options.noiseRange,
    });
  }

  if (options?.showLog) {
    console.log(
      `Apply synthetic volatility adjustedDelta:${adjustedDelta.toString()}`
    );
  }

  // Step 5.2: Smooth Limiting per step
  if (options?.maxStepPercent) {
    adjustedDelta = tanhClampDelta(adjustedDelta, options.maxStepPercent);
  }

  if (options?.showLog) {
    console.log(
      `Smooth Limiting per step adjustedDelta:${adjustedDelta.toString()}`
    );
  }

  // Step 5.3: Daily Fluctuation Smoothing Limiting (based on index or token price)
  if (options?.maxDailyPercent && options?.price24hAgo) {
    const return24h = Decimal.ln(prevIndexPrice.div(options.price24hAgo));
    const effectiveDailyDelta = adjustedDelta.add(return24h);
    const cappedEffective = tanhClampDelta(
      effectiveDailyDelta,
      options.maxDailyPercent
    );
    adjustedDelta = cappedEffective.sub(return24h);
  }

  if (options?.showLog) {
    console.log(
      `Daily Fluctuation Smoothing Limiting adjustedDelta:${adjustedDelta.toString()}`
    );
  }

  // Step 6: Multiplication of exp(Δ) from the previous price to arrive at the current indexPrice ratio (relative to the previous round)
  const indexPriceMultiplier = Decimal.exp(adjustedDelta);
  const nextIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);

  return nextIndexPrice;
}

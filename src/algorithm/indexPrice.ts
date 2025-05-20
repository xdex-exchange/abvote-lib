// src/lib/indexPrice.ts
import Decimal from "decimal.js";
import {
  applyVolatilityNoiseWithTokenDrivenAmplifier,
  computeLogReturn,
  computeVolatility,
  tanhClampDelta,
} from "./math";
import { TokenPriceMap, TokenWeightMap } from "../types/types";
import {
  EXPONENT_INIT,
  INITIAL_INDEX_PRICE,
  MIN_DYNAMIC,
  ZERO,
} from "../constants/constants";

type ComputeBiasAdjustedIndexPriceOptions = {
  maxDailyPercent?: number; // 24h cumulative maximum fluctuation percentage (e. g. 3 means ± 3%)
  tokenWeight?: number; // Weight of the impact of token price fluctuations on the index
  price24hAgo?: Decimal; // Used to limit 24-hour cumulative volatility (can be index or token price)
  biasShiftWeight?: number; // Voting separately pushes the weight of the price
  biasScaleWeight?: number; // Vote to enlarge/reduce the weight of the price increase or decrease.
  biasShiftCapPercent?: number; // The most single vote can push the index up or down.
  biasScaleCapPercent?: number; // The maximum amount of increase or decrease that can be zoomed in/out at a time.
  prevTokenDeltas?: Decimal[];
  showLog?: boolean;
};

export type NextIndex = {
  nextIndexPrice: Decimal;
  delat: Decimal;
};

type configOptions = {
  tokenWeight: Decimal;
  biasShiftWeight: Decimal;
  biasScaleWeight: Decimal;
};

function config(options?: ComputeBiasAdjustedIndexPriceOptions): configOptions {
  const tokenWeight = new Decimal(options?.tokenWeight ?? 0.5);
  const biasShiftWeight = new Decimal(options?.biasShiftWeight ?? 0.25);
  const biasScaleWeight = new Decimal(options?.biasScaleWeight ?? 0.25);
  return {
    tokenWeight,
    biasShiftWeight,
    biasScaleWeight,
  };
}

export function computeBiasAdjustedIndexPrice(
  prices: TokenPriceMap,
  prevPrices: TokenPriceMap,
  weights: TokenWeightMap,
  exponentPrice: Decimal,
  prevIndexPrice: Decimal = new Decimal(INITIAL_INDEX_PRICE),
  options?: ComputeBiasAdjustedIndexPriceOptions
): NextIndex {
  const symbols = Object.keys(prices);
  if (symbols.length < 2)
    return {
      nextIndexPrice: ZERO,
      delat: ZERO,
    };
  const prevSymbols = Object.keys(prevPrices);
  if (prevSymbols.length < 2)
    return {
      nextIndexPrice: ZERO,
      delat: ZERO,
    };

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
    return {
      nextIndexPrice: ZERO,
      delat: ZERO,
    };
  }

  // Configs
  const { tokenWeight, biasShiftWeight, biasScaleWeight } = config(options);

  // Step 1: Calculate log return
  const rA = computeLogReturn(aaPrice, aaPrevPrice);
  const rB = computeLogReturn(bbPrice, bbPrevPrice);

  // Step 2: Weighted combination (AA forward, BB reverse)
  const totalTokenWeight = aaWeight.add(bbWeight);
  if (totalTokenWeight.eq(0))
    return {
      nextIndexPrice: ZERO,
      delat: ZERO,
    };

  // Step 3: Weighted price return (token delta)
  const tokenDelta = aaWeight
    .mul(rA)
    .sub(bbWeight.mul(rB))
    .div(totalTokenWeight);

  // === Step 3: BiasShiftDelta → Voting directly drives prices (exponent > 1 drives up,< 1 drives down) ===
  const biasShiftStrengthDelta = exponentPrice.sub(EXPONENT_INIT); // Both positive and negative can be

  // === Step 4: BiasScaleDelta → Vote to zoom in/out on price fluctuations (same direction) ===
  const rawBiasScaleDelta = tokenDelta.mul(exponentPrice.sub(EXPONENT_INIT));

  // === Step 5: Combine all effects ===
  let rawCombinedDelta = tokenDelta
    .mul(tokenWeight)
    .add(biasShiftStrengthDelta.mul(biasShiftWeight))
    .add(rawBiasScaleDelta.mul(biasScaleWeight));

  // Step 5: Adaptive delta clipping (maxStepPercent removed, based solely on tokenDelta history)
  const recentVolatility = computeVolatility(options?.prevTokenDeltas ?? []);
  const dynamicMax = Decimal.max(recentVolatility.mul(3), MIN_DYNAMIC); // Avoid 0, make sure there is a little sensitivity
  let combinedDelta = Decimal.tanh(rawCombinedDelta.div(dynamicMax)).mul(
    dynamicMax
  );

  if (options?.showLog) {
    console.log(`rA:${rA.toString()}`);
    console.log(`rB:${rB.toString()}`);
    console.log(`tokenDelta: ${tokenDelta.toString()}`);
    console.log(`biasShiftStrengthDelta: ${biasShiftStrengthDelta.toString()}`);
    console.log(`rawBiasScaleDelta: ${rawBiasScaleDelta.toString()}`);
    console.log(`rawCombinedDelta: ${rawCombinedDelta.toString()}`);
    console.log(`recentVolatility: ${recentVolatility.toString()}`);
    console.log(`dynamicMax: ${dynamicMax.toString()}`);
    console.log(`combinedDelta: ${combinedDelta.toString()}`);
  }

  // Step 5.3: Daily Fluctuation Smoothing Limiting (based on index or token price)
  if (options?.maxDailyPercent && options?.price24hAgo) {
    const return24h = Decimal.ln(prevIndexPrice.div(options.price24hAgo));
    const effectiveDailyDelta = combinedDelta.add(return24h);
    const cappedEffective = tanhClampDelta(
      effectiveDailyDelta,
      options.maxDailyPercent
    );
    combinedDelta = cappedEffective.sub(return24h);

    if (options?.showLog) {
      console.log(
        `Daily combinedDelta:${combinedDelta.toString()}, return24h:${return24h.toString()}, effectiveDailyDelta:${effectiveDailyDelta.toString()}, cappedEffective:${cappedEffective.toString()}`
      );
    }
  }

  combinedDelta = applyVolatilityNoiseWithTokenDrivenAmplifier(
    combinedDelta,
    rA,
    rB,
    tokenDelta
  );

  // Step 6: Multiplication of exp(Δ) from the previous price to arrive at the current indexPrice ratio (relative to the previous round)
  const indexPriceMultiplier = Decimal.exp(combinedDelta);
  const nextIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);

  return {
    nextIndexPrice,
    delat: combinedDelta,
  };
}

type PredictedIndexImpact = {
  predictedIndexPrice: Decimal;
  deltaPercent: Decimal; // (predicted / prev - 1)
};

export function predictIndexImpactFromExponentOnly(
  exponentPrice: Decimal,
  prevIndexPrice: Decimal,
  options?: ComputeBiasAdjustedIndexPriceOptions
): PredictedIndexImpact {
  // Configs
  const { biasShiftWeight } = config(options);

  // Step 1: tokenDelta = 0, so rawScale = 0, leaving only the bias shift item
  const biasShiftStrengthDelta = exponentPrice.sub(EXPONENT_INIT);

  const rawCombinedDelta = biasShiftStrengthDelta.mul(biasShiftWeight); // no scale contribution

  // Step 2: compute dynamicMax based on prevTokenDeltas
  const recentVolatility = computeVolatility(options?.prevTokenDeltas ?? []);
  const dynamicMax = Decimal.max(recentVolatility.mul(3), MIN_DYNAMIC); // Avoid 0, make sure there is a little sensitivity
  let combinedDelta = Decimal.tanh(rawCombinedDelta.div(dynamicMax)).mul(
    dynamicMax
  );

  // Step 3: Daily Fluctuation Smoothing Limiting (based on index or token price)
  if (options?.maxDailyPercent && options?.price24hAgo) {
    const return24h = Decimal.ln(prevIndexPrice.div(options.price24hAgo));
    const effectiveDailyDelta = combinedDelta.add(return24h);
    const cappedEffective = tanhClampDelta(
      effectiveDailyDelta,
      options.maxDailyPercent
    );
    combinedDelta = cappedEffective.sub(return24h);
  }

  // Step 4: Apply exp(Δ) to prevIndexPrice
  const indexPriceMultiplier = Decimal.exp(combinedDelta);
  const predictedIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);

  // Output percentage change and log change
  const deltaPercent = predictedIndexPrice.div(prevIndexPrice).sub(1); // linear %

  if (options?.showLog) {
    console.log(`biasShiftStrengthDelta: ${biasShiftStrengthDelta.toString()}`);
    console.log(`rawCombinedDelta: ${rawCombinedDelta.toString()}`);
    console.log(`recentVolatility: ${recentVolatility.toString()}`);
    console.log(`dynamicMax: ${dynamicMax.toString()}`);
    console.log(`combinedDelta: ${combinedDelta.toString()}`);
    console.log(`indexPriceMultiplier: ${indexPriceMultiplier.toString()}`);
    console.log(`deltaPercent: ${deltaPercent.toString()}`);
  }

  return {
    predictedIndexPrice,
    deltaPercent,
  };
}

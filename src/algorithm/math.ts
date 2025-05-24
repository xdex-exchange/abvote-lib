import Decimal from "decimal.js";

/**
 * Computes the log return (Logarithmic Return)
 *
 * Formula:
 *    r = ln(P_t / P_{t-1})
 *
 * Description:
 *    - P_t: current price
 *    - P_{t-1}: previous price
 *    - Returns 0 if either price is non-positive
 */
export const computeLogReturn = (
  current: Decimal,
  previous: Decimal
): Decimal => {
  if (previous.lte(0) || current.lte(0)) return new Decimal(0);
  return current.div(previous).log(); // ln(current / previous)
};

/**
 * Tanh buffer delta to make it gradually slow as it approaches ± maxPercent
 * @param delta Original Δ
 * @param maxDelta Maximum price limit (logarithm)
 * @returns Δ after smoothing
 */
export function tanhClampDelta(delta: Decimal, maxPercent: number): Decimal {
  const maxDelta = Decimal.ln(1 + maxPercent / 100);
  //  tanh(delta / maxDelta) ∈ [-1, 1]，Multiplyback maxDelta after range ∈ [-maxDelta, +maxDelta]
  return Decimal.tanh(delta.div(maxDelta)).mul(maxDelta);
}

export function computeVolatility(deltas: Decimal[]): Decimal {
  if (!deltas.length) return new Decimal(0);
  const sum = deltas.reduce((acc, d) => acc.add(d.abs()), new Decimal(0));
  return sum.div(deltas.length);
}

export type InertiaOptions = {
  maxFactor?: number; // default: 3
  minFactor?: number; // default: 1 / 3
  inertiaStrength?: Decimal;
  reversalResistance?: Decimal;
};

const MAX_FACTOR = new Decimal(1.5);
const MIN_FACTOR = new Decimal(0.01);
const DEFAULT_INERTIA_STRENGTH = new Decimal(2.5);
const DEFAULT_REVERSAL_RESISTANCE = new Decimal(3.5);

export function applyInertiaAndResistanceWithClamp(
  rawCombinedDelta: Decimal,
  prevDeltas: Decimal[],
  memoryDepth: number,
  options: InertiaOptions
): Decimal {
  const { maxFactor, minFactor, inertiaStrength, reversalResistance } = options;

  if (prevDeltas.length === 0) return rawCombinedDelta;

  // Step 1: Compute trend memory
  const recent = prevDeltas.slice(-memoryDepth);
  const trendMemory = recent
    .reduce((sum, d) => sum.add(d), new Decimal(0))
    .div(recent.length);

  console.log("trendMemory:", trendMemory.toString());

  const trendAbs = trendMemory.abs();
  const directionSame = trendMemory.mul(rawCombinedDelta).gte(0);

  // Step 3: Compute direction factor
  let directionFactor: Decimal;
  if (directionSame) {
    const inertiaDelta = trendAbs.mul(
      inertiaStrength ?? DEFAULT_INERTIA_STRENGTH
    );
    directionFactor = Decimal.exp(inertiaDelta);
  } else {
    const resistanceDelta = trendAbs.mul(
      reversalResistance ?? DEFAULT_REVERSAL_RESISTANCE
    );
    directionFactor = Decimal.exp(resistanceDelta.neg());
  }

  // Step 4: Clamp direction factor to avoid spikes
  const clampedFactor = Decimal.max(
    minFactor ?? MIN_FACTOR,
    Decimal.min(maxFactor ?? MAX_FACTOR, directionFactor)
  );

  console.log(
    `clampedFactor:${clampedFactor},directionFactor:${directionFactor} `
  );

  // Step 5: Apply to delta
  return rawCombinedDelta.mul(clampedFactor);
}

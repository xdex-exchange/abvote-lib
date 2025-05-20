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

export function applyVolatilityNoiseWithTokenDrivenAmplifier(
  delta: Decimal,
  rA: Decimal,
  rB: Decimal,
  tokenDelta: Decimal, // 用于方向性惩罚项
  options?: {
    baseAmplifier?: number; // default: 1.0
    scaleFactor?: number; // default: 5.0
    noiseRange?: number; // default: 0.01
    directionalBiasWeight?: number; // default: 0.3
  }
): Decimal {
  const baseAmplifier = new Decimal(options?.baseAmplifier ?? 1.0);
  const scaleFactor = new Decimal(options?.scaleFactor ?? 5.0);
  const noiseRange = options?.noiseRange ?? 0.01;
  const directionalBiasWeight = new Decimal(
    options?.directionalBiasWeight ?? 0.3
  );

  const combinedVol = rA.add(rB).div(2);

  // Step 2: Adjust amplifier dynamically based on token volatility
  let dynamicAmplifier = baseAmplifier.add(combinedVol.mul(scaleFactor));

  // Step 3: Directional bias based on tokenDelta
  const directionSign = delta.gte(0) ? 1 : -1;
  const tokenSign = Decimal.sign(tokenDelta);
  const directionalBoost = new Decimal(directionSign * tokenSign).mul(
    directionalBiasWeight
  );

  dynamicAmplifier = dynamicAmplifier.add(directionalBoost);

  // Step 4: Amplify delta nonlinearly
  const amplified = delta.mul(
    Decimal.pow(delta.abs().add(1), dynamicAmplifier)
  );

  // Step 5: Add small symmetric noise
  const noise = new Decimal(Math.random() * noiseRange - noiseRange / 2);

  return amplified.add(noise);
}

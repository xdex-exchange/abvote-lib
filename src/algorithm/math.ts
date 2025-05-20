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

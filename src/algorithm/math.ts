// src/lib/math.ts
import Decimal from "decimal.js";

/**
 * Calculate the logarithmic rate of return between two prices (log return)
 * @param current Current Price
 * @param previous Previous Price
 * @returns Logarithmic yield (ln(current / previous))
 */
export const computeLogReturn = (
  current: Decimal,
  previous: Decimal
): Decimal => {
  if (previous.lte(0) || current.lte(0)) return new Decimal(0);
  return current.div(previous).log();
};

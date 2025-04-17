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

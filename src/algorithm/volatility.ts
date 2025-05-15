import Decimal from "decimal.js";

const defaultVolatilityAmplifier = 10;
export function applyVolatilityNoise(
  delta: Decimal,
  options?: {
    volatilityAmplifier?: number; // default: 10
  }
): Decimal {
  const amplifier = new Decimal(
    options?.volatilityAmplifier ?? defaultVolatilityAmplifier
  );

  return delta.mul(amplifier);
}

import Decimal from "decimal.js";

export function applyVolatilityNoise(
  delta: Decimal,
  options?: {
    volatilityAmplifier?: number; // default: 1.2
    noiseRange?: number; // default: 0.002
  }
): Decimal {
  const amplifier = new Decimal(options?.volatilityAmplifier ?? 1.2);
  const noiseRange = options?.noiseRange ?? 0.02;

  // Step 1: Amplify based on the absolute value of delta
  const amplified = delta.mul(Decimal.pow(delta.abs().add(1), amplifier));

  // Step 2: Add small noise
  const noise = new Decimal(Math.random() * noiseRange - noiseRange / 2);

  return amplified.add(noise);
}

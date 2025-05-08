import Decimal from "decimal.js";

const defaultVolatilityAmplifier = 1.2;
const defaultNoiseRange = 0.02;

export function applyVolatilityNoise(
  delta: Decimal,
  options?: {
    volatilityAmplifier?: number; // default: 1.2
    noiseRange?: number; // default: 0.002
  }
): Decimal {
  const amplifier = new Decimal(
    options?.volatilityAmplifier ?? defaultVolatilityAmplifier
  );
  const noiseRange = options?.noiseRange ?? defaultNoiseRange;

  // Step 1: Amplify based on the absolute value of delta
  const amplified = delta.mul(Decimal.pow(delta.abs().add(1), amplifier));

  // Step 2: Add small noise
  const noise = new Decimal(Math.random() * noiseRange - noiseRange / 2);

  return amplified.add(noise);
}

import Decimal from "decimal.js";

const defaultVolatilityAmplifier = 1.2;
const defaultNoiseRange = 0.02;

export function applyVolatilityNoise(
  delta: Decimal,
  options?: {
    volatilityAmplifier?: number; // default: 1.2
    noiseRange?: number; // default: 0.002
    maxNoisePercent?: number; // default: 0.3=>30%
  }
): Decimal {
  const amplifier = new Decimal(
    options?.volatilityAmplifier ?? defaultVolatilityAmplifier
  );
  const noiseRange = options?.noiseRange ?? defaultNoiseRange;
  const maxNoisePercent = options?.maxNoisePercent ?? 3;

  // Step 1: Magnitude & Direction
  const direction = delta.isNegative() ? -1 : 1;
  const magnitude = delta.abs();

  // Step 2: Amplify the magnitude (preserve direction)
  const amplifiedMagnitude = magnitude.mul(
    Decimal.pow(magnitude.add(1), amplifier)
  );

  // Step 3: Generate bounded noise
  const rawNoise = new Decimal(Math.random() * noiseRange); // always positive
  const maxAllowedNoise = amplifiedMagnitude.mul(maxNoisePercent);
  const boundedNoise = Decimal.min(rawNoise, maxAllowedNoise);

  // Step 4: Add noise to amplified magnitude and restore direction
  const noisyDelta = amplifiedMagnitude.add(boundedNoise);
  return new Decimal(direction).mul(noisyDelta);
}

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

export function applyFinalAsymmetricNoise(
  baseMultiplier: Decimal,
  tokenDelta: Decimal,
  options?: {
    asymmetryStrength?: number; // default: 0.005
    randomness?: number; // default: 0.003
  }
): Decimal {
  const asymmetryStrength = options?.asymmetryStrength ?? 0.06;
  const randomness = options?.randomness ?? 0.003;

  const directionalBias = tokenDelta.clamp(-1, 1).mul(asymmetryStrength);

  const noise = new Decimal(Math.random() * randomness - randomness / 2);

  const finalMultiplier = baseMultiplier.mul(
    Decimal.exp(directionalBias.add(noise))
  );

  return finalMultiplier;
}

export function applyVolatilityNoise(
  delta: Decimal,
  options?: {
    volatilityAmplifier?: number; // default: 1.2
    noiseRange?: number; // default: 0.002
  }
): Decimal {
  const amplifier = new Decimal(options?.volatilityAmplifier ?? 1.115);
  const noiseRange = options?.noiseRange ?? 0.015;

  // Step 1: Amplify based on the absolute value of delta
  const amplified = delta.mul(Decimal.pow(delta.abs().add(1), amplifier));

  // Step 2: Add small noise
  const noise = new Decimal(Math.random() * noiseRange - noiseRange / 2);

  return amplified.add(noise);
}

type InertiaOptions = {
  prevDeltas: Decimal[];
  inertiaStrength?: Decimal;
  reversalResistance?: Decimal;
  memoryDepth?: number;
};

export function applyInertiaAndResistance(
  rawCombinedDelta: Decimal,
  options: InertiaOptions
): Decimal {
  const {
    prevDeltas,
    inertiaStrength,
    reversalResistance,
    memoryDepth = 5,
  } = options;

  if (prevDeltas.length === 0) return rawCombinedDelta;

  const recent = prevDeltas.slice(-memoryDepth);
  const trendMemory = recent
    .reduce((sum, d) => sum.add(d), new Decimal(0))
    .div(recent.length);

  const directionSame = trendMemory.mul(rawCombinedDelta).gte(0);
  let directionFactor: Decimal;

  if (directionSame) {
    const inertiaDelta = trendMemory.abs().mul(inertiaStrength ?? 3);
    directionFactor = Decimal.exp(inertiaDelta);
  } else {
    const resistanceDelta = trendMemory.abs().mul(reversalResistance ?? 2.5);
    directionFactor = Decimal.exp(resistanceDelta.neg());
  }

  return rawCombinedDelta.mul(directionFactor);
}

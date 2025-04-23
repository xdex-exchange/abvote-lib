# Index Price Calculation Algorithm

This project implements a robust mechanism for calculating a market index price based on the prices of two tokens (AA and BB), their weights, and a bias factor derived from voting (exponent price). The aim is to reflect directional market sentiment while incorporating safeguards against abrupt price movements.

## Overview

The index price at any time is determined by:

- Token price changes (AA and BB)
- Relative weights of AA and BB
- A dynamic bias factor derived from community or social sentiment (e.g., Twitter voting)
- Optionally, experimental volatility adjustment for added realism and interactive experimentation

## Formula Breakdown

### 1. Logarithmic Return

For each token:

```math
r = \ln\left(\frac{P_{t}}{P_{t-1}}\right)
```

Where:
- $P_{t}$ is the current price
- $P_{t-1}$ is the previous price

### 2. Weighted Token Delta

```math
\text{tokenDelta} = \frac{w_{AA} \cdot r_{AA} - w_{BB} \cdot r_{BB}}{w_{AA} + w_{BB}}
```

This reflects directional price pressure:
- If AA rises and BB falls → Index rises
- If both fall → Net price movement could partially offset (depending on weights), reducing impact
- If both rise → Impact is also softened

This structure is intended to model competitive outcomes, where the relative strength of AA over BB matters more than their absolute movement.

### 3. Bias Amplification

The `exponentPrice` reflects community sentiment (e.g., via voting). It acts as a multiplier on `tokenDelta`:

```math
	ext{rawBiasDelta} = 	ext{tokenDelta} \cdot 	ext{exponentPrice}
```

To isolate the effect of bias beyond pure price movement:

```math
	ext{biasDelta} = 	ext{rawBiasDelta} - 	ext{tokenDelta}
```

### 4. Final Delta Composition

```math
	ext{adjustedDelta} = 	ext{tokenDelta} + 	ext{biasDelta}
```

This sum is passed through a smoothing function to limit excessive swings.

### 5. Non-linear Clamping via Tanh

To prevent sudden jumps near ±max thresholds, a `tanh` transformation is applied:

```math
\text{tanhClamp}(\delta, \text{max\_percent}) = \tanh\left(\frac{\delta}{\ln\left(1 + \frac{\text{max\_percent}}{100}\right)}\right) \cdot \ln\left(1 + \frac{\text{max\_percent}}{100}\right)
```

This keeps the final delta smoothly constrained, avoiding sharp cliffs.

### 6. Daily Movement Capping (Optional)

If a 24h price is supplied, the algorithm compares cumulative log return and dampens new deltas to avoid breaking the ±max daily range:

```math
\text{return}_{24h} = \ln\left(\frac{P_{\text{now}}}{P_{\text{24h\_ago}}}\right)
```

This return is also clamped via `tanhClamp`.

### 7. Index Price Update

Finally:

```math
	ext{Index}_{t} = 	ext{Index}_{t-1} \cdot e^{	ext{adjustedDelta}}
```

## Features

- Smooth control of maximum step/daily volatility
- Modular weighting of price and sentiment (bias)
- Optional noise injection for simulating markets
- Fully customizable via configuration

## Configuration Options

```ts
type ComputeBiasAdjustedIndexPriceOptions = {
  enableVolatility?: boolean;
  volatilityAmplifier?: number;
  noiseRange?: number;
  maxStepPercent?: number;
  maxDailyPercent?: number;
  price24hAgo?: Decimal;
  tokenImpactPercent?: number;
  biasImpactPercent?: number;
};
```

## Why This Matters

This model provides a tunable framework for:

- Reflecting competitive token dynamics
- Integrating sentiment amplification without destabilizing the index
- Preventing exploits or manipulation through overly volatile inputs

It is ideal for decentralized, prediction-market-style systems or dual-token environments.
import Decimal from 'decimal.js';
import { LoggerService } from '@nestjs/common';

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
declare const computeLogReturn: (current: Decimal, previous: Decimal) => Decimal;
/**
 * Tanh buffer delta to make it gradually slow as it approaches ± maxPercent
 * @param delta Original Δ
 * @param maxDelta Maximum price limit (logarithm)
 * @returns Δ after smoothing
 */
declare function tanhClampDelta(delta: Decimal, maxPercent: number): Decimal;
declare function computeVolatility(deltas: Decimal[]): Decimal;
type InertiaOptions = {
    maxFactor?: number;
    minFactor?: number;
    inertiaStrength?: Decimal;
    reversalResistance?: Decimal;
};
declare function applyInertiaAndResistanceWithClamp(rawCombinedDelta: Decimal, prevDeltas: Decimal[], memoryDepth: number, options: InertiaOptions): Decimal;

declare class ABValue {
    readonly A: Decimal;
    readonly B: Decimal;
    constructor(a: Decimal.Value, b: Decimal.Value);
    toString(): string;
}
declare enum VoteSource {
    TWITTER = "TWITTER",
    CHAIN = "CHAIN",
    USER = "USER"
}
declare enum VotedAB {
    A = "A",
    B = "B"
}

declare class ExponentService {
    private readonly decimals;
    private readonly halfDecimals;
    private readonly initialA;
    private readonly initialB;
    private readonly initialK;
    private readonly initialWC;
    private readonly initialWT;
    private a;
    private b;
    private wc;
    private wt;
    private exponent;
    constructor();
    defaultState(): void;
    setState(a: bigint, b: bigint, wc: bigint, wt: bigint, exponent: bigint): void;
    computeExponent(voteAmount: number, voteSource: VoteSource, voteResult: VotedAB): {
        a: bigint;
        b: bigint;
        exponent: bigint;
    };
    private computeVoteWeight;
    getExponent(): {
        a: bigint;
        b: bigint;
        wc: bigint;
        wt: bigint;
        exponent: bigint;
    };
    getExponentPrice(): Decimal;
    serialize(): string;
    deserialize(json: string): void;
}

type ComputeBiasAdjustedIndexPriceOptions = {
    maxDailyPercent?: number;
    tokenWeight?: number;
    price24hAgo?: Decimal;
    biasShiftWeight?: number;
    biasScaleWeight?: number;
    biasShiftCapPercent?: number;
    biasScaleCapPercent?: number;
    prevTokenDeltas?: Decimal[];
    showLog?: boolean;
    logger?: LoggerService;
    inertiaOptions?: InertiaOptions;
};
type NextIndex = {
    nextIndexPrice: Decimal;
    delat: Decimal;
};
declare function computeBiasAdjustedIndexPrice(prices: ABValue, prevPrices: ABValue, weights: ABValue, exponentPrice: Decimal, prevIndexPrice?: Decimal, options?: ComputeBiasAdjustedIndexPriceOptions): NextIndex;
declare function computeBiasDrivenIndexPriceV2(prices: ABValue, prevPrices: ABValue, weights: ABValue, exponentPrice: Decimal, prevIndexPrice?: Decimal, options?: {
    prevBaseRatios?: Decimal[];
    inertiaOptions?: any;
    showLog?: boolean;
    logger?: LoggerService;
    sensitivityBase?: number;
}): NextIndex;
type PredictedIndexImpact = {
    predictedIndexPrice: Decimal;
    deltaPercent: Decimal;
};
declare function predictIndexImpactFromExponentOnly(exponentPrice: Decimal, prevIndexPrice: Decimal, options?: ComputeBiasAdjustedIndexPriceOptions): PredictedIndexImpact;

declare const getPriceAtomicResolution: (price: number) => number;
declare const generateEventHash: (eventTag: string, title: string) => string;
declare const getMarketParameters: (ticker: string, price: string) => {
    ticker: string;
    priceExponent: number;
    minPriceChange: number;
    atomicResolution: number;
    quantumConversionExponent: number;
    stepBaseQuantums: number;
    subticksPerTick: number;
};

declare const EXPONENT_INIT = 1;
declare const EXPONENT_DECIMALS = 18;
declare const EXPONENT_HALF_DECIMALS: number;
declare const INITIAL_EXPONENT: bigint;
declare const INITIAL_EXPONENT_WC: bigint;
declare const INITIAL_EXPONENT_WT: bigint;
declare const INITIAL_INDEX_PRICE = "0.01";
declare const ORACLE_PRICE_DECIMAL = 7;
declare const MIN_PRICE_CHANGE_PPM = 1;
declare const TWITTER_VOTE_AMOUNT = 10;
declare const USER_VOTE_AMOUNT = 1;
declare const ZERO: Decimal;
declare const MIN_DYNAMIC: Decimal;
declare const MIN_BETA = 0.1;
declare const DEFAULT_SENSITIVITY_BASE = 1;
declare const DEFAULT_TOKEN_WEIGHT = 1000000;
declare const DEFAULT_TWITTER_VOTE_WEIGHT = 10000;
declare const DEFAULT_PRICE_ALGORITHM = 1;

export { ABValue, DEFAULT_PRICE_ALGORITHM, DEFAULT_SENSITIVITY_BASE, DEFAULT_TOKEN_WEIGHT, DEFAULT_TWITTER_VOTE_WEIGHT, EXPONENT_DECIMALS, EXPONENT_HALF_DECIMALS, EXPONENT_INIT, ExponentService, INITIAL_EXPONENT, INITIAL_EXPONENT_WC, INITIAL_EXPONENT_WT, INITIAL_INDEX_PRICE, InertiaOptions, MIN_BETA, MIN_DYNAMIC, MIN_PRICE_CHANGE_PPM, NextIndex, ORACLE_PRICE_DECIMAL, TWITTER_VOTE_AMOUNT, USER_VOTE_AMOUNT, VoteSource, VotedAB, ZERO, applyInertiaAndResistanceWithClamp, computeBiasAdjustedIndexPrice, computeBiasDrivenIndexPriceV2, computeLogReturn, computeVolatility, generateEventHash, getMarketParameters, getPriceAtomicResolution, predictIndexImpactFromExponentOnly, tanhClampDelta };

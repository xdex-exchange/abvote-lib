import Decimal from 'decimal.js';

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

type TokenPriceMap = Record<string, Decimal>;
type TokenWeightMap = Record<string, Decimal>;
declare enum VoteSource {
    TWITTER = "TWITTER",
    CHAIN = "CHAIN"
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
    serialize(): string;
    deserialize(json: string): void;
}

type ComputeBiasAdjustedIndexPriceOptions = {
    enableVolatility?: boolean;
    volatilityAmplifier?: number;
    noiseRange?: number;
};
declare function computeBiasAdjustedIndexPrice(prices: TokenPriceMap, prevPrices: TokenPriceMap, weights: TokenWeightMap, exponentPrice: Decimal, prevIndexPrice?: Decimal, options?: ComputeBiasAdjustedIndexPriceOptions): Decimal;

declare const getPriceDecimals: (price: string) => number;
declare const getPriceExponent: (price: string) => number;
declare const getPriceAtomicResolution: (price: string) => number;

declare const EXPONENT_DECIMALS = 18;
declare const EXPONENT_HALF_DECIMALS: number;
declare const INITIAL_EXPONENT: bigint;
declare const INITIAL_EXPONENT_WC: bigint;
declare const INITIAL_EXPONENT_WT: bigint;
declare const INITIAL_INDEX_PRICE = "0.01";

export { EXPONENT_DECIMALS, EXPONENT_HALF_DECIMALS, ExponentService, INITIAL_EXPONENT, INITIAL_EXPONENT_WC, INITIAL_EXPONENT_WT, INITIAL_INDEX_PRICE, TokenPriceMap, TokenWeightMap, VoteSource, VotedAB, computeBiasAdjustedIndexPrice, computeLogReturn, getPriceAtomicResolution, getPriceDecimals, getPriceExponent };

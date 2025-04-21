import Decimal from 'decimal.js';

/**
 * Calculate the logarithmic rate of return between two prices (log return)
 * @param current Current Price
 * @param previous Previous Price
 * @returns Logarithmic yield (ln(current / previous))
 */
declare const computeLogReturn: (current: Decimal, previous: Decimal) => Decimal;

type TokenPriceMap = Record<string, Decimal>;
type TokenWeightMap = Record<string, Decimal>;
type TokenPrevPriceMap = Record<string, Decimal>;
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

/**
 * Calculate the index price of a multi-token portfolio, weighted base price × exponent
 * @param prices Current price set, for example:{ BTC: 62000, ETH: 3200}
 * @param weights The weight of each currency, for example:{ BTC: 0.6, ETH: 0.4}
 * @param weightedExponent Weighted index impact factor, e.g., 1.02
 * @returns Composite weighted index price
 */
declare const computeIndexPrice: (prices: TokenPriceMap, weights: TokenWeightMap, weightedExponent: Decimal) => Decimal;
/**
 * Calculate the index price of the multi-token portfolio, taking into account the log return, weight and exponent of the multi-currency price.
 *
 * @param prices Current price set, for example:{ BTC: 62000, ETH: 3200}
 * @param prevPrices The price set of the previous point in time (some currencies can be defaulted, and the default is equal to the current price)
 * @param weights The weight of each currency, for example:{ BTC: 0.6, ETH: 0.4}
 * @param weightedExponent Weighted index impact factor, e.g., 1.02
 *
 * @returns Composite weighted index price
 */
declare const computeIndexPriceWithLogReturnWeightedExponent: (prices: TokenPriceMap, prevPrices: TokenPrevPriceMap, weights: TokenWeightMap, weightedExponent: Decimal) => Decimal;

declare const getPriceDecimals: (price: string) => number;
declare const getPriceExponent: (price: string) => number;
declare const getPriceAtomicResolution: (price: string) => number;

export { ExponentService, TokenPrevPriceMap, TokenPriceMap, TokenWeightMap, VoteSource, VotedAB, computeIndexPrice, computeIndexPriceWithLogReturnWeightedExponent, computeLogReturn, getPriceAtomicResolution, getPriceDecimals, getPriceExponent };

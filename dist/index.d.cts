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
 * @returns Composite weighted index price.
 */
declare const computeIndexPrice: (prices: TokenPriceMap, weights: TokenWeightMap, weightedExponent: Decimal) => Decimal;
declare function computeBiasAdjustedIndexPrice(prices: TokenPriceMap, prevPrices: TokenPriceMap, weights: TokenWeightMap, exponentPrice: Decimal, prevIndexPrice?: Decimal): Decimal;

export { ExponentService, TokenPriceMap, TokenWeightMap, VoteSource, VotedAB, computeBiasAdjustedIndexPrice, computeIndexPrice, computeLogReturn };

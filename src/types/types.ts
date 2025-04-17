import Decimal from "decimal.js";

export type TokenPriceMap = Record<string, Decimal>;
export type TokenWeightMap = Record<string, Decimal>;
export type TokenPrevPriceMap = Record<string, Decimal>;

export enum VoteSource {
  TWITTER = "TWITTER",
  CHAIN = "CHAIN",
}

export enum VotedAB {
  A = "A",
  B = "B",
}
import Decimal from "decimal.js";

export type TokenPriceMap = Record<string, Decimal>;
export type TokenWeightMap = Record<string, Decimal>;

export enum VoteSource {
  TWITTER = "TWITTER",
  CHAIN = "CHAIN",
  USER = "USER",
}

export enum VotedAB {
  A = "A",
  B = "B",
}

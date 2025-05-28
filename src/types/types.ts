import Decimal from "decimal.js";

// export type TokenPriceMap = Record<string, Decimal>;
// export type TokenWeightMap = Record<string, Decimal>;
export class ABValue {
  readonly A: Decimal;
  readonly B: Decimal;
  constructor(a: Decimal.Value, b: Decimal.Value) {
    this.A = Decimal(a);
    this.B = Decimal(b);
  }
}

export enum VoteSource {
  TWITTER = "TWITTER",
  CHAIN = "CHAIN",
  USER = "USER",
}

export enum VotedAB {
  A = "A",
  B = "B",
}

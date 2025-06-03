import Decimal from "decimal.js";
export class ABValue {
  readonly A: Decimal;
  readonly B: Decimal;
  constructor(a: Decimal.Value, b: Decimal.Value) {
    this.A = new Decimal(a);
    this.B = new Decimal(b);
  }

  toString() {
    return JSON.stringify({
      A: this.A.toString(),
      B: this.B.toString(),
    });
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

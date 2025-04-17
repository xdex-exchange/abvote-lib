import { parseUnits } from "ethers";
import {
  EXPONENT_DECIMALS,
  EXPONENT_HALF_DECIMALS,
  INITIAL_EXPONENT,
  INITIAL_EXPONENT_WC,
  INITIAL_EXPONENT_WT,
} from "../constants/constants";
import { VoteSource, VotedAB } from "../types/types";

export class ExponentService {
  private readonly decimals = EXPONENT_DECIMALS;
  private readonly halfDecimals = EXPONENT_HALF_DECIMALS;
  private readonly initialA = INITIAL_EXPONENT;
  private readonly initialB = INITIAL_EXPONENT;
  private readonly initialK = this.initialA * this.initialB;
  private readonly initialWC = INITIAL_EXPONENT_WC;
  private readonly initialWT = INITIAL_EXPONENT_WT;

  private a!: bigint;
  private b!: bigint;
  private wc!: bigint;
  private wt!: bigint;
  private exponent!: bigint;

  constructor() {
    this.defaultState();
  }

  defaultState() {
    this.a = this.initialA;
    this.b = this.initialB;
    this.wc = this.initialWC;
    this.wt = this.initialWT;
    this.exponent = 0n;
  }

  setState(a: bigint, b: bigint, wc: bigint, wt: bigint, exponent: bigint) {
    this.a = a;
    this.b = b;
    this.wc = wc;
    this.wt = wt;
    this.exponent = exponent;
  }

  computeExponent(
    voteAmount: number,
    voteSource: VoteSource,
    voteResult: VotedAB
  ) {
    const weight = this.computeVoteWeight(voteSource) * BigInt(voteAmount);

    this.a += weight;
    this.b += weight;
    const newK = this.a * this.b;

    if (voteResult === VotedAB.A) {
      this.b += weight;
      this.a = newK / this.b;
    } else {
      this.a += weight;
      this.b = newK / this.a;
    }

    this.exponent = (newK * 10n ** 6n) / this.initialK;
    return { a: this.a, b: this.b, exponent: this.exponent };
  }

  private computeVoteWeight(voteSource: VoteSource) {
    const add = parseUnits("0.001", this.halfDecimals);
    this.wc += add;
    this.wt += add;
    const newK = this.wc * this.wt;

    if (voteSource === VoteSource.CHAIN) {
      this.wt += add;
      this.wc = newK / this.wt;
      return (this.wc * 10n ** BigInt(this.decimals)) / this.wt;
    } else {
      this.wc += add;
      this.wt = newK / this.wc;
      return (this.wt * 10n ** BigInt(this.decimals)) / this.wc;
    }
  }

  getExponent() {
    return {
      a: this.a,
      b: this.b,
      wc: this.wc,
      wt: this.wt,
      exponent: this.exponent,
    };
  }

  serialize() {
    return JSON.stringify({
      a: this.a + "",
      b: this.b + "",
      wc: this.wc + "",
      wt: this.wt + "",
      exponent: this.exponent + "",
    });
  }

  deserialize(json: string) {
    const obj = JSON.parse(json);
    this.a = BigInt(obj.a);
    this.b = BigInt(obj.b);
    this.wc = BigInt(obj.wc);
    this.wt = BigInt(obj.wt);
    this.exponent = BigInt(obj.exponent);
  }
}

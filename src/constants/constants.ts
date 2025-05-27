import Decimal from "decimal.js";
import { parseUnits } from "ethers";

export const EXPONENT_INIT = 1;
export const EXPONENT_DECIMALS = 18;
export const EXPONENT_HALF_DECIMALS = EXPONENT_DECIMALS / 2;
export const INITIAL_EXPONENT = parseUnits("100000", EXPONENT_DECIMALS);
export const INITIAL_EXPONENT_WC = parseUnits("10", EXPONENT_HALF_DECIMALS);
export const INITIAL_EXPONENT_WT = parseUnits("10", EXPONENT_HALF_DECIMALS);

export const INITIAL_INDEX_PRICE = "0.01";
export const ORACLE_PRICE_DECIMAL = 7;
export const MIN_PRICE_CHANGE_PPM = 1;

export const TWITTER_VOTE_AMOUNT = 10;
export const USER_VOTE_AMOUNT = 1;
export const ZERO = new Decimal(0);

export const MIN_DYNAMIC = new Decimal(0.01);

import { solidityPackedKeccak256 } from "ethers";
import {
  MIN_PRICE_CHANGE_PPM,
  ORACLE_PRICE_DECIMAL,
} from "../constants/constants";

export const getPriceAtomicResolution = (price: number): number => {
  if (!price || !isFinite(price) || price <= 0) return 0;

  if (price >= 1e4) return -9;
  if (price >= 1e3) return -8;
  if (price >= 3e2) return -7; // 300~999
  if (price >= 5e1) return -6; // 50~299
  if (price >= 1) return -5; // 1~49.999...
  if (price >= 0.1) return -4; // 0.1~0.999...
  if (price >= 0.01) return -3; // 0.01~0.0999
  if (price >= 0.001) return -2; // 0.001~0.00999
  if (price >= 0.0001) return -1; // 0.0001~0.000999
  if (price >= 0.00001) return 0; // 0.00001~0.000099...（Such as SHIB）

  return 0;
};

export const generateEventHash = (eventTag: string, title: string): string => {
  return solidityPackedKeccak256(["string", "string"], [eventTag, title]);
};

export const getMarketParameters = (ticker: string, price: string) => {
  return {
    ticker: ticker,
    priceExponent: -ORACLE_PRICE_DECIMAL,
    minPriceChange: MIN_PRICE_CHANGE_PPM,
    atomicResolution: getPriceAtomicResolution(Number(price)),
    quantumConversionExponent: -9,
    stepBaseQuantums: 1_000_000,
    subticksPerTick: 100_000,
  };
};

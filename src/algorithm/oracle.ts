export const getPriceDecimals = (price: string): number => {
  if (!price) {
    return 0;
  }
  const p = price.split(".");
  if (p.length < 2) {
    return 0;
  }
  return p[1].length;
};

export const getPriceExponent = (price: string): number => {
  if (!price) {
    return NaN;
  }
  const p = price.split(".");
  const a = Number(p[0]);
  if (a > 0) {
    return -p[0].length;
  } else if (p.length < 2) {
    return NaN;
  } else {
    const x = p[1].lastIndexOf("0") + 2;
    return -9 - x;
  }
};

export const getPriceAtomicResolution = (price: string): number => {
  if (!price) {
    return NaN;
  }
  const p = price.split(".");
  const a = Number(p[0]);
  if (a > 0) {
    return -(5 + p[0].length);
  } else if (p.length < 2) {
    return NaN;
  } else {
    const x = p[1].lastIndexOf("0") + 2;
    return x - 6;
  }
};

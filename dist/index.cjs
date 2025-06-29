"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ABValue: () => ABValue,
  DEFAULT_PRICE_ALGORITHM: () => DEFAULT_PRICE_ALGORITHM,
  DEFAULT_SENSITIVITY_BASE: () => DEFAULT_SENSITIVITY_BASE,
  DEFAULT_TOKEN_WEIGHT: () => DEFAULT_TOKEN_WEIGHT,
  DEFAULT_TWITTER_VOTE_WEIGHT: () => DEFAULT_TWITTER_VOTE_WEIGHT,
  EXPONENT_DECIMALS: () => EXPONENT_DECIMALS,
  EXPONENT_HALF_DECIMALS: () => EXPONENT_HALF_DECIMALS,
  EXPONENT_INIT: () => EXPONENT_INIT,
  ExponentService: () => ExponentService,
  INITIAL_EXPONENT: () => INITIAL_EXPONENT,
  INITIAL_EXPONENT_WC: () => INITIAL_EXPONENT_WC,
  INITIAL_EXPONENT_WT: () => INITIAL_EXPONENT_WT,
  INITIAL_INDEX_PRICE: () => INITIAL_INDEX_PRICE,
  MIN_BETA: () => MIN_BETA,
  MIN_DYNAMIC: () => MIN_DYNAMIC,
  MIN_PRICE_CHANGE_PPM: () => MIN_PRICE_CHANGE_PPM,
  ORACLE_PRICE_DECIMAL: () => ORACLE_PRICE_DECIMAL,
  TWITTER_VOTE_AMOUNT: () => TWITTER_VOTE_AMOUNT,
  USER_VOTE_AMOUNT: () => USER_VOTE_AMOUNT,
  VoteSource: () => VoteSource,
  VotedAB: () => VotedAB,
  ZERO: () => ZERO,
  applyInertiaAndResistanceWithClamp: () => applyInertiaAndResistanceWithClamp,
  computeBiasAdjustedIndexPrice: () => computeBiasAdjustedIndexPrice,
  computeBiasDrivenIndexPriceV2: () => computeBiasDrivenIndexPriceV2,
  computeLogReturn: () => computeLogReturn,
  computeVolatility: () => computeVolatility,
  generateEventHash: () => generateEventHash,
  getMarketParameters: () => getMarketParameters,
  getPriceAtomicResolution: () => getPriceAtomicResolution,
  predictIndexImpactFromExponentOnly: () => predictIndexImpactFromExponentOnly,
  tanhClampDelta: () => tanhClampDelta
});
module.exports = __toCommonJS(src_exports);

// src/algorithm/math.ts
var import_decimal = __toESM(require("decimal.js"), 1);
var computeLogReturn = (current, previous) => {
  if (previous.lte(0) || current.lte(0))
    return new import_decimal.default(0);
  return current.div(previous).log();
};
function tanhClampDelta(delta, maxPercent) {
  const maxDelta = import_decimal.default.ln(1 + maxPercent / 100);
  return import_decimal.default.tanh(delta.div(maxDelta)).mul(maxDelta);
}
function computeVolatility(deltas) {
  if (!deltas.length)
    return new import_decimal.default(0);
  const sum = deltas.reduce((acc, d) => acc.add(d.abs()), new import_decimal.default(0));
  return sum.div(deltas.length);
}
var MAX_FACTOR = new import_decimal.default(2);
var MIN_FACTOR = new import_decimal.default(0.01);
var DEFAULT_INERTIA_STRENGTH = new import_decimal.default(4);
var DEFAULT_REVERSAL_RESISTANCE = new import_decimal.default(5);
function applyInertiaAndResistanceWithClamp(rawCombinedDelta, prevDeltas, memoryDepth, options) {
  const { maxFactor, minFactor, inertiaStrength, reversalResistance } = options;
  if (prevDeltas.length === 0)
    return rawCombinedDelta;
  const recent = prevDeltas.slice(-memoryDepth);
  const trendMemory = recent.reduce((sum, d) => sum.add(d), new import_decimal.default(0)).div(recent.length);
  console.log("trendMemory:", trendMemory.toString());
  const trendAbs = trendMemory.abs();
  const directionSame = trendMemory.mul(rawCombinedDelta).gte(0);
  let directionFactor;
  if (directionSame) {
    const inertiaDelta = trendAbs.mul(
      inertiaStrength ?? DEFAULT_INERTIA_STRENGTH
    );
    directionFactor = import_decimal.default.exp(inertiaDelta);
  } else {
    const resistanceDelta = trendAbs.mul(
      reversalResistance ?? DEFAULT_REVERSAL_RESISTANCE
    );
    directionFactor = import_decimal.default.exp(resistanceDelta.neg());
  }
  const clampedFactor = import_decimal.default.max(
    minFactor ?? MIN_FACTOR,
    import_decimal.default.min(maxFactor ?? MAX_FACTOR, directionFactor)
  );
  console.log(
    `clampedFactor:${clampedFactor},directionFactor:${directionFactor} `
  );
  return rawCombinedDelta.mul(clampedFactor);
}

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/_version.js
var version = "6.13.5";

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/utils/properties.js
function checkType(value, type, name) {
  const types = type.split("|").map((t) => t.trim());
  for (let i = 0; i < types.length; i++) {
    switch (type) {
      case "any":
        return;
      case "bigint":
      case "boolean":
      case "number":
      case "string":
        if (typeof value === type) {
          return;
        }
    }
  }
  const error = new Error(`invalid value for type ${type}`);
  error.code = "INVALID_ARGUMENT";
  error.argument = `value.${name}`;
  error.value = value;
  throw error;
}
function defineProperties(target, values, types) {
  for (let key in values) {
    let value = values[key];
    const type = types ? types[key] : null;
    if (type) {
      checkType(value, type, key);
    }
    Object.defineProperty(target, key, { enumerable: true, value, writable: false });
  }
}

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/utils/errors.js
function stringify(value) {
  if (value == null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "[ " + value.map(stringify).join(", ") + " ]";
  }
  if (value instanceof Uint8Array) {
    const HEX = "0123456789abcdef";
    let result = "0x";
    for (let i = 0; i < value.length; i++) {
      result += HEX[value[i] >> 4];
      result += HEX[value[i] & 15];
    }
    return result;
  }
  if (typeof value === "object" && typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  switch (typeof value) {
    case "boolean":
    case "symbol":
      return value.toString();
    case "bigint":
      return BigInt(value).toString();
    case "number":
      return value.toString();
    case "string":
      return JSON.stringify(value);
    case "object": {
      const keys = Object.keys(value);
      keys.sort();
      return "{ " + keys.map((k) => `${stringify(k)}: ${stringify(value[k])}`).join(", ") + " }";
    }
  }
  return `[ COULD NOT SERIALIZE ]`;
}
function makeError(message, code, info) {
  let shortMessage = message;
  {
    const details = [];
    if (info) {
      if ("message" in info || "code" in info || "name" in info) {
        throw new Error(`value will overwrite populated values: ${stringify(info)}`);
      }
      for (const key in info) {
        if (key === "shortMessage") {
          continue;
        }
        const value = info[key];
        details.push(key + "=" + stringify(value));
      }
    }
    details.push(`code=${code}`);
    details.push(`version=${version}`);
    if (details.length) {
      message += " (" + details.join(", ") + ")";
    }
  }
  let error;
  switch (code) {
    case "INVALID_ARGUMENT":
      error = new TypeError(message);
      break;
    case "NUMERIC_FAULT":
    case "BUFFER_OVERRUN":
      error = new RangeError(message);
      break;
    default:
      error = new Error(message);
  }
  defineProperties(error, { code });
  if (info) {
    Object.assign(error, info);
  }
  if (error.shortMessage == null) {
    defineProperties(error, { shortMessage });
  }
  return error;
}
function assert(check, message, code, info) {
  if (!check) {
    throw makeError(message, code, info);
  }
}
function assertArgument(check, message, name, value) {
  assert(check, message, "INVALID_ARGUMENT", { argument: name, value });
}
var _normalizeForms = ["NFD", "NFC", "NFKD", "NFKC"].reduce((accum, form) => {
  try {
    if ("test".normalize(form) !== "test") {
      throw new Error("bad");
    }
    ;
    if (form === "NFD") {
      const check = String.fromCharCode(233).normalize("NFD");
      const expected = String.fromCharCode(101, 769);
      if (check !== expected) {
        throw new Error("broken");
      }
    }
    accum.push(form);
  } catch (error) {
  }
  return accum;
}, []);
function assertNormalize(form) {
  assert(_normalizeForms.indexOf(form) >= 0, "platform missing String.prototype.normalize", "UNSUPPORTED_OPERATION", {
    operation: "String.prototype.normalize",
    info: { form }
  });
}
function assertPrivate(givenGuard, guard, className) {
  if (className == null) {
    className = "";
  }
  if (givenGuard !== guard) {
    let method = className, operation = "new";
    if (className) {
      method += ".";
      operation += " " + className;
    }
    assert(false, `private constructor; use ${method}from* methods`, "UNSUPPORTED_OPERATION", {
      operation
    });
  }
}

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/utils/data.js
function _getBytes(value, name, copy) {
  if (value instanceof Uint8Array) {
    if (copy) {
      return new Uint8Array(value);
    }
    return value;
  }
  if (typeof value === "string" && value.match(/^0x(?:[0-9a-f][0-9a-f])*$/i)) {
    const result = new Uint8Array((value.length - 2) / 2);
    let offset = 2;
    for (let i = 0; i < result.length; i++) {
      result[i] = parseInt(value.substring(offset, offset + 2), 16);
      offset += 2;
    }
    return result;
  }
  assertArgument(false, "invalid BytesLike value", name || "value", value);
}
function getBytes(value, name) {
  return _getBytes(value, name, false);
}
function isHexString(value, length) {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }
  if (typeof length === "number" && value.length !== 2 + 2 * length) {
    return false;
  }
  if (length === true && value.length % 2 !== 0) {
    return false;
  }
  return true;
}
var HexCharacters = "0123456789abcdef";
function hexlify(data) {
  const bytes2 = getBytes(data);
  let result = "0x";
  for (let i = 0; i < bytes2.length; i++) {
    const v = bytes2[i];
    result += HexCharacters[(v & 240) >> 4] + HexCharacters[v & 15];
  }
  return result;
}
function concat(datas) {
  return "0x" + datas.map((d) => hexlify(d).substring(2)).join("");
}
function dataLength(data) {
  if (isHexString(data, true)) {
    return (data.length - 2) / 2;
  }
  return getBytes(data).length;
}
function zeroPad(data, length, left) {
  const bytes2 = getBytes(data);
  assert(length >= bytes2.length, "padding exceeds data length", "BUFFER_OVERRUN", {
    buffer: new Uint8Array(bytes2),
    length,
    offset: length + 1
  });
  const result = new Uint8Array(length);
  result.fill(0);
  if (left) {
    result.set(bytes2, length - bytes2.length);
  } else {
    result.set(bytes2, 0);
  }
  return hexlify(result);
}
function zeroPadValue(data, length) {
  return zeroPad(data, length, true);
}
function zeroPadBytes(data, length) {
  return zeroPad(data, length, false);
}

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/utils/maths.js
var BN_0 = BigInt(0);
var BN_1 = BigInt(1);
var maxValue = 9007199254740991;
function fromTwos(_value, _width) {
  const value = getUint(_value, "value");
  const width = BigInt(getNumber(_width, "width"));
  assert(value >> width === BN_0, "overflow", "NUMERIC_FAULT", {
    operation: "fromTwos",
    fault: "overflow",
    value: _value
  });
  if (value >> width - BN_1) {
    const mask2 = (BN_1 << width) - BN_1;
    return -((~value & mask2) + BN_1);
  }
  return value;
}
function toTwos(_value, _width) {
  let value = getBigInt(_value, "value");
  const width = BigInt(getNumber(_width, "width"));
  const limit = BN_1 << width - BN_1;
  if (value < BN_0) {
    value = -value;
    assert(value <= limit, "too low", "NUMERIC_FAULT", {
      operation: "toTwos",
      fault: "overflow",
      value: _value
    });
    const mask2 = (BN_1 << width) - BN_1;
    return (~value & mask2) + BN_1;
  } else {
    assert(value < limit, "too high", "NUMERIC_FAULT", {
      operation: "toTwos",
      fault: "overflow",
      value: _value
    });
  }
  return value;
}
function mask(_value, _bits) {
  const value = getUint(_value, "value");
  const bits = BigInt(getNumber(_bits, "bits"));
  return value & (BN_1 << bits) - BN_1;
}
function getBigInt(value, name) {
  switch (typeof value) {
    case "bigint":
      return value;
    case "number":
      assertArgument(Number.isInteger(value), "underflow", name || "value", value);
      assertArgument(value >= -maxValue && value <= maxValue, "overflow", name || "value", value);
      return BigInt(value);
    case "string":
      try {
        if (value === "") {
          throw new Error("empty string");
        }
        if (value[0] === "-" && value[1] !== "-") {
          return -BigInt(value.substring(1));
        }
        return BigInt(value);
      } catch (e) {
        assertArgument(false, `invalid BigNumberish string: ${e.message}`, name || "value", value);
      }
  }
  assertArgument(false, "invalid BigNumberish value", name || "value", value);
}
function getUint(value, name) {
  const result = getBigInt(value, name);
  assert(result >= BN_0, "unsigned value cannot be negative", "NUMERIC_FAULT", {
    fault: "overflow",
    operation: "getUint",
    value
  });
  return result;
}
var Nibbles = "0123456789abcdef";
function toBigInt(value) {
  if (value instanceof Uint8Array) {
    let result = "0x0";
    for (const v of value) {
      result += Nibbles[v >> 4];
      result += Nibbles[v & 15];
    }
    return BigInt(result);
  }
  return getBigInt(value);
}
function getNumber(value, name) {
  switch (typeof value) {
    case "bigint":
      assertArgument(value >= -maxValue && value <= maxValue, "overflow", name || "value", value);
      return Number(value);
    case "number":
      assertArgument(Number.isInteger(value), "underflow", name || "value", value);
      assertArgument(value >= -maxValue && value <= maxValue, "overflow", name || "value", value);
      return value;
    case "string":
      try {
        if (value === "") {
          throw new Error("empty string");
        }
        return getNumber(BigInt(value), name);
      } catch (e) {
        assertArgument(false, `invalid numeric string: ${e.message}`, name || "value", value);
      }
  }
  assertArgument(false, "invalid numeric value", name || "value", value);
}
function toBeArray(_value) {
  const value = getUint(_value, "value");
  if (value === BN_0) {
    return new Uint8Array([]);
  }
  let hex = value.toString(16);
  if (hex.length % 2) {
    hex = "0" + hex;
  }
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < result.length; i++) {
    const offset = i * 2;
    result[i] = parseInt(hex.substring(offset, offset + 2), 16);
  }
  return result;
}

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/utils/utf8.js
function errorFunc(reason, offset, bytes2, output2, badCodepoint) {
  assertArgument(false, `invalid codepoint at offset ${offset}; ${reason}`, "bytes", bytes2);
}
function ignoreFunc(reason, offset, bytes2, output2, badCodepoint) {
  if (reason === "BAD_PREFIX" || reason === "UNEXPECTED_CONTINUE") {
    let i = 0;
    for (let o = offset + 1; o < bytes2.length; o++) {
      if (bytes2[o] >> 6 !== 2) {
        break;
      }
      i++;
    }
    return i;
  }
  if (reason === "OVERRUN") {
    return bytes2.length - offset - 1;
  }
  return 0;
}
function replaceFunc(reason, offset, bytes2, output2, badCodepoint) {
  if (reason === "OVERLONG") {
    assertArgument(typeof badCodepoint === "number", "invalid bad code point for replacement", "badCodepoint", badCodepoint);
    output2.push(badCodepoint);
    return 0;
  }
  output2.push(65533);
  return ignoreFunc(reason, offset, bytes2, output2, badCodepoint);
}
var Utf8ErrorFuncs = Object.freeze({
  error: errorFunc,
  ignore: ignoreFunc,
  replace: replaceFunc
});
function toUtf8Bytes(str, form) {
  assertArgument(typeof str === "string", "invalid string value", "str", str);
  if (form != null) {
    assertNormalize(form);
    str = str.normalize(form);
  }
  let result = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 128) {
      result.push(c);
    } else if (c < 2048) {
      result.push(c >> 6 | 192);
      result.push(c & 63 | 128);
    } else if ((c & 64512) == 55296) {
      i++;
      const c2 = str.charCodeAt(i);
      assertArgument(i < str.length && (c2 & 64512) === 56320, "invalid surrogate pair", "str", str);
      const pair = 65536 + ((c & 1023) << 10) + (c2 & 1023);
      result.push(pair >> 18 | 240);
      result.push(pair >> 12 & 63 | 128);
      result.push(pair >> 6 & 63 | 128);
      result.push(pair & 63 | 128);
    } else {
      result.push(c >> 12 | 224);
      result.push(c >> 6 & 63 | 128);
      result.push(c & 63 | 128);
    }
  }
  return new Uint8Array(result);
}

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/utils/fixednumber.js
var BN_N1 = BigInt(-1);
var BN_02 = BigInt(0);
var BN_12 = BigInt(1);
var BN_5 = BigInt(5);
var _guard = {};
var Zeros = "0000";
while (Zeros.length < 80) {
  Zeros += Zeros;
}
function getTens(decimals) {
  let result = Zeros;
  while (result.length < decimals) {
    result += result;
  }
  return BigInt("1" + result.substring(0, decimals));
}
function checkValue(val, format, safeOp) {
  const width = BigInt(format.width);
  if (format.signed) {
    const limit = BN_12 << width - BN_12;
    assert(safeOp == null || val >= -limit && val < limit, "overflow", "NUMERIC_FAULT", {
      operation: safeOp,
      fault: "overflow",
      value: val
    });
    if (val > BN_02) {
      val = fromTwos(mask(val, width), width);
    } else {
      val = -fromTwos(mask(-val, width), width);
    }
  } else {
    const limit = BN_12 << width;
    assert(safeOp == null || val >= 0 && val < limit, "overflow", "NUMERIC_FAULT", {
      operation: safeOp,
      fault: "overflow",
      value: val
    });
    val = (val % limit + limit) % limit & limit - BN_12;
  }
  return val;
}
function getFormat(value) {
  if (typeof value === "number") {
    value = `fixed128x${value}`;
  }
  let signed = true;
  let width = 128;
  let decimals = 18;
  if (typeof value === "string") {
    if (value === "fixed") {
    } else if (value === "ufixed") {
      signed = false;
    } else {
      const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
      assertArgument(match, "invalid fixed format", "format", value);
      signed = match[1] !== "u";
      width = parseInt(match[2]);
      decimals = parseInt(match[3]);
    }
  } else if (value) {
    const v = value;
    const check = (key, type, defaultValue) => {
      if (v[key] == null) {
        return defaultValue;
      }
      assertArgument(typeof v[key] === type, "invalid fixed format (" + key + " not " + type + ")", "format." + key, v[key]);
      return v[key];
    };
    signed = check("signed", "boolean", signed);
    width = check("width", "number", width);
    decimals = check("decimals", "number", decimals);
  }
  assertArgument(width % 8 === 0, "invalid FixedNumber width (not byte aligned)", "format.width", width);
  assertArgument(decimals <= 80, "invalid FixedNumber decimals (too large)", "format.decimals", decimals);
  const name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
  return { signed, width, decimals, name };
}
function toString(val, decimals) {
  let negative = "";
  if (val < BN_02) {
    negative = "-";
    val *= BN_N1;
  }
  let str = val.toString();
  if (decimals === 0) {
    return negative + str;
  }
  while (str.length <= decimals) {
    str = Zeros + str;
  }
  const index = str.length - decimals;
  str = str.substring(0, index) + "." + str.substring(index);
  while (str[0] === "0" && str[1] !== ".") {
    str = str.substring(1);
  }
  while (str[str.length - 1] === "0" && str[str.length - 2] !== ".") {
    str = str.substring(0, str.length - 1);
  }
  return negative + str;
}
var _format, _val, _tens, _checkFormat, checkFormat_fn, _checkValue, checkValue_fn, _add, add_fn, _sub, sub_fn, _mul, mul_fn, _div, div_fn;
var _FixedNumber = class _FixedNumber {
  // Use this when changing this file to get some typing info,
  // but then switch to any to mask the internal type
  //constructor(guard: any, value: bigint, format: _FixedFormat) {
  /**
   *  @private
   */
  constructor(guard, value, format) {
    __privateAdd(this, _checkFormat);
    __privateAdd(this, _checkValue);
    __privateAdd(this, _add);
    __privateAdd(this, _sub);
    __privateAdd(this, _mul);
    __privateAdd(this, _div);
    /**
     *  The specific fixed-point arithmetic field for this value.
     */
    __publicField(this, "format");
    __privateAdd(this, _format, void 0);
    // The actual value (accounting for decimals)
    __privateAdd(this, _val, void 0);
    // A base-10 value to multiple values by to maintain the magnitude
    __privateAdd(this, _tens, void 0);
    /**
     *  This is a property so console.log shows a human-meaningful value.
     *
     *  @private
     */
    __publicField(this, "_value");
    assertPrivate(guard, _guard, "FixedNumber");
    __privateSet(this, _val, value);
    __privateSet(this, _format, format);
    const _value = toString(value, format.decimals);
    defineProperties(this, { format: format.name, _value });
    __privateSet(this, _tens, getTens(format.decimals));
  }
  /**
   *  If true, negative values are permitted, otherwise only
   *  positive values and zero are allowed.
   */
  get signed() {
    return __privateGet(this, _format).signed;
  }
  /**
   *  The number of bits available to store the value.
   */
  get width() {
    return __privateGet(this, _format).width;
  }
  /**
   *  The number of decimal places in the fixed-point arithment field.
   */
  get decimals() {
    return __privateGet(this, _format).decimals;
  }
  /**
   *  The value as an integer, based on the smallest unit the
   *  [[decimals]] allow.
   */
  get value() {
    return __privateGet(this, _val);
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% added
   *  to %%other%%, ignoring overflow.
   */
  addUnsafe(other) {
    return __privateMethod(this, _add, add_fn).call(this, other);
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% added
   *  to %%other%%. A [[NumericFaultError]] is thrown if overflow
   *  occurs.
   */
  add(other) {
    return __privateMethod(this, _add, add_fn).call(this, other, "add");
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%other%% subtracted
   *  from %%this%%, ignoring overflow.
   */
  subUnsafe(other) {
    return __privateMethod(this, _sub, sub_fn).call(this, other);
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%other%% subtracted
   *  from %%this%%. A [[NumericFaultError]] is thrown if overflow
   *  occurs.
   */
  sub(other) {
    return __privateMethod(this, _sub, sub_fn).call(this, other, "sub");
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% multiplied
   *  by %%other%%, ignoring overflow and underflow (precision loss).
   */
  mulUnsafe(other) {
    return __privateMethod(this, _mul, mul_fn).call(this, other);
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% multiplied
   *  by %%other%%. A [[NumericFaultError]] is thrown if overflow
   *  occurs.
   */
  mul(other) {
    return __privateMethod(this, _mul, mul_fn).call(this, other, "mul");
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% multiplied
   *  by %%other%%. A [[NumericFaultError]] is thrown if overflow
   *  occurs or if underflow (precision loss) occurs.
   */
  mulSignal(other) {
    __privateMethod(this, _checkFormat, checkFormat_fn).call(this, other);
    const value = __privateGet(this, _val) * __privateGet(other, _val);
    assert(value % __privateGet(this, _tens) === BN_02, "precision lost during signalling mul", "NUMERIC_FAULT", {
      operation: "mulSignal",
      fault: "underflow",
      value: this
    });
    return __privateMethod(this, _checkValue, checkValue_fn).call(this, value / __privateGet(this, _tens), "mulSignal");
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% divided
   *  by %%other%%, ignoring underflow (precision loss). A
   *  [[NumericFaultError]] is thrown if overflow occurs.
   */
  divUnsafe(other) {
    return __privateMethod(this, _div, div_fn).call(this, other);
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% divided
   *  by %%other%%, ignoring underflow (precision loss). A
   *  [[NumericFaultError]] is thrown if overflow occurs.
   */
  div(other) {
    return __privateMethod(this, _div, div_fn).call(this, other, "div");
  }
  /**
   *  Returns a new [[FixedNumber]] with the result of %%this%% divided
   *  by %%other%%. A [[NumericFaultError]] is thrown if underflow
   *  (precision loss) occurs.
   */
  divSignal(other) {
    assert(__privateGet(other, _val) !== BN_02, "division by zero", "NUMERIC_FAULT", {
      operation: "div",
      fault: "divide-by-zero",
      value: this
    });
    __privateMethod(this, _checkFormat, checkFormat_fn).call(this, other);
    const value = __privateGet(this, _val) * __privateGet(this, _tens);
    assert(value % __privateGet(other, _val) === BN_02, "precision lost during signalling div", "NUMERIC_FAULT", {
      operation: "divSignal",
      fault: "underflow",
      value: this
    });
    return __privateMethod(this, _checkValue, checkValue_fn).call(this, value / __privateGet(other, _val), "divSignal");
  }
  /**
   *  Returns a comparison result between %%this%% and %%other%%.
   *
   *  This is suitable for use in sorting, where ``-1`` implies %%this%%
   *  is smaller, ``1`` implies %%this%% is larger and ``0`` implies
   *  both are equal.
   */
  cmp(other) {
    let a = this.value, b = other.value;
    const delta = this.decimals - other.decimals;
    if (delta > 0) {
      b *= getTens(delta);
    } else if (delta < 0) {
      a *= getTens(-delta);
    }
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }
  /**
   *  Returns true if %%other%% is equal to %%this%%.
   */
  eq(other) {
    return this.cmp(other) === 0;
  }
  /**
   *  Returns true if %%other%% is less than to %%this%%.
   */
  lt(other) {
    return this.cmp(other) < 0;
  }
  /**
   *  Returns true if %%other%% is less than or equal to %%this%%.
   */
  lte(other) {
    return this.cmp(other) <= 0;
  }
  /**
   *  Returns true if %%other%% is greater than to %%this%%.
   */
  gt(other) {
    return this.cmp(other) > 0;
  }
  /**
   *  Returns true if %%other%% is greater than or equal to %%this%%.
   */
  gte(other) {
    return this.cmp(other) >= 0;
  }
  /**
   *  Returns a new [[FixedNumber]] which is the largest **integer**
   *  that is less than or equal to %%this%%.
   *
   *  The decimal component of the result will always be ``0``.
   */
  floor() {
    let val = __privateGet(this, _val);
    if (__privateGet(this, _val) < BN_02) {
      val -= __privateGet(this, _tens) - BN_12;
    }
    val = __privateGet(this, _val) / __privateGet(this, _tens) * __privateGet(this, _tens);
    return __privateMethod(this, _checkValue, checkValue_fn).call(this, val, "floor");
  }
  /**
   *  Returns a new [[FixedNumber]] which is the smallest **integer**
   *  that is greater than or equal to %%this%%.
   *
   *  The decimal component of the result will always be ``0``.
   */
  ceiling() {
    let val = __privateGet(this, _val);
    if (__privateGet(this, _val) > BN_02) {
      val += __privateGet(this, _tens) - BN_12;
    }
    val = __privateGet(this, _val) / __privateGet(this, _tens) * __privateGet(this, _tens);
    return __privateMethod(this, _checkValue, checkValue_fn).call(this, val, "ceiling");
  }
  /**
   *  Returns a new [[FixedNumber]] with the decimal component
   *  rounded up on ties at %%decimals%% places.
   */
  round(decimals) {
    if (decimals == null) {
      decimals = 0;
    }
    if (decimals >= this.decimals) {
      return this;
    }
    const delta = this.decimals - decimals;
    const bump = BN_5 * getTens(delta - 1);
    let value = this.value + bump;
    const tens = getTens(delta);
    value = value / tens * tens;
    checkValue(value, __privateGet(this, _format), "round");
    return new _FixedNumber(_guard, value, __privateGet(this, _format));
  }
  /**
   *  Returns true if %%this%% is equal to ``0``.
   */
  isZero() {
    return __privateGet(this, _val) === BN_02;
  }
  /**
   *  Returns true if %%this%% is less than ``0``.
   */
  isNegative() {
    return __privateGet(this, _val) < BN_02;
  }
  /**
   *  Returns the string representation of %%this%%.
   */
  toString() {
    return this._value;
  }
  /**
   *  Returns a float approximation.
   *
   *  Due to IEEE 754 precission (or lack thereof), this function
   *  can only return an approximation and most values will contain
   *  rounding errors.
   */
  toUnsafeFloat() {
    return parseFloat(this.toString());
  }
  /**
   *  Return a new [[FixedNumber]] with the same value but has had
   *  its field set to %%format%%.
   *
   *  This will throw if the value cannot fit into %%format%%.
   */
  toFormat(format) {
    return _FixedNumber.fromString(this.toString(), format);
  }
  /**
   *  Creates a new [[FixedNumber]] for %%value%% divided by
   *  %%decimal%% places with %%format%%.
   *
   *  This will throw a [[NumericFaultError]] if %%value%% (once adjusted
   *  for %%decimals%%) cannot fit in %%format%%, either due to overflow
   *  or underflow (precision loss).
   */
  static fromValue(_value, _decimals, _format2) {
    const decimals = _decimals == null ? 0 : getNumber(_decimals);
    const format = getFormat(_format2);
    let value = getBigInt(_value, "value");
    const delta = decimals - format.decimals;
    if (delta > 0) {
      const tens = getTens(delta);
      assert(value % tens === BN_02, "value loses precision for format", "NUMERIC_FAULT", {
        operation: "fromValue",
        fault: "underflow",
        value: _value
      });
      value /= tens;
    } else if (delta < 0) {
      value *= getTens(-delta);
    }
    checkValue(value, format, "fromValue");
    return new _FixedNumber(_guard, value, format);
  }
  /**
   *  Creates a new [[FixedNumber]] for %%value%% with %%format%%.
   *
   *  This will throw a [[NumericFaultError]] if %%value%% cannot fit
   *  in %%format%%, either due to overflow or underflow (precision loss).
   */
  static fromString(_value, _format2) {
    const match = _value.match(/^(-?)([0-9]*)\.?([0-9]*)$/);
    assertArgument(match && match[2].length + match[3].length > 0, "invalid FixedNumber string value", "value", _value);
    const format = getFormat(_format2);
    let whole = match[2] || "0", decimal = match[3] || "";
    while (decimal.length < format.decimals) {
      decimal += Zeros;
    }
    assert(decimal.substring(format.decimals).match(/^0*$/), "too many decimals for format", "NUMERIC_FAULT", {
      operation: "fromString",
      fault: "underflow",
      value: _value
    });
    decimal = decimal.substring(0, format.decimals);
    const value = BigInt(match[1] + whole + decimal);
    checkValue(value, format, "fromString");
    return new _FixedNumber(_guard, value, format);
  }
  /**
   *  Creates a new [[FixedNumber]] with the big-endian representation
   *  %%value%% with %%format%%.
   *
   *  This will throw a [[NumericFaultError]] if %%value%% cannot fit
   *  in %%format%% due to overflow.
   */
  static fromBytes(_value, _format2) {
    let value = toBigInt(getBytes(_value, "value"));
    const format = getFormat(_format2);
    if (format.signed) {
      value = fromTwos(value, format.width);
    }
    checkValue(value, format, "fromBytes");
    return new _FixedNumber(_guard, value, format);
  }
};
_format = new WeakMap();
_val = new WeakMap();
_tens = new WeakMap();
_checkFormat = new WeakSet();
checkFormat_fn = function(other) {
  assertArgument(this.format === other.format, "incompatible format; use fixedNumber.toFormat", "other", other);
};
_checkValue = new WeakSet();
checkValue_fn = function(val, safeOp) {
  val = checkValue(val, __privateGet(this, _format), safeOp);
  return new _FixedNumber(_guard, val, __privateGet(this, _format));
};
_add = new WeakSet();
add_fn = function(o, safeOp) {
  __privateMethod(this, _checkFormat, checkFormat_fn).call(this, o);
  return __privateMethod(this, _checkValue, checkValue_fn).call(this, __privateGet(this, _val) + __privateGet(o, _val), safeOp);
};
_sub = new WeakSet();
sub_fn = function(o, safeOp) {
  __privateMethod(this, _checkFormat, checkFormat_fn).call(this, o);
  return __privateMethod(this, _checkValue, checkValue_fn).call(this, __privateGet(this, _val) - __privateGet(o, _val), safeOp);
};
_mul = new WeakSet();
mul_fn = function(o, safeOp) {
  __privateMethod(this, _checkFormat, checkFormat_fn).call(this, o);
  return __privateMethod(this, _checkValue, checkValue_fn).call(this, __privateGet(this, _val) * __privateGet(o, _val) / __privateGet(this, _tens), safeOp);
};
_div = new WeakSet();
div_fn = function(o, safeOp) {
  assert(__privateGet(o, _val) !== BN_02, "division by zero", "NUMERIC_FAULT", {
    operation: "div",
    fault: "divide-by-zero",
    value: this
  });
  __privateMethod(this, _checkFormat, checkFormat_fn).call(this, o);
  return __privateMethod(this, _checkValue, checkValue_fn).call(this, __privateGet(this, _val) * __privateGet(this, _tens) / __privateGet(o, _val), safeOp);
};
var FixedNumber = _FixedNumber;

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/utils/units.js
var names = [
  "wei",
  "kwei",
  "mwei",
  "gwei",
  "szabo",
  "finney",
  "ether"
];
function parseUnits(value, unit) {
  assertArgument(typeof value === "string", "value must be a string", "value", value);
  let decimals = 18;
  if (typeof unit === "string") {
    const index = names.indexOf(unit);
    assertArgument(index >= 0, "invalid unit", "unit", unit);
    decimals = 3 * index;
  } else if (unit != null) {
    decimals = getNumber(unit, "unit");
  }
  return FixedNumber.fromString(value, { decimals, width: 512 }).value;
}

// node_modules/.pnpm/@noble+hashes@1.3.2/node_modules/@noble/hashes/esm/_assert.js
function number(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`Wrong positive integer: ${n}`);
}
function bytes(b, ...lengths) {
  if (!(b instanceof Uint8Array))
    throw new Error("Expected Uint8Array");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
}
function exists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output(out, instance) {
  bytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}

// node_modules/.pnpm/@noble+hashes@1.3.2/node_modules/@noble/hashes/esm/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  let Ah = new Uint32Array(lst.length);
  let Al = new Uint32Array(lst.length);
  for (let i = 0; i < lst.length; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;

// node_modules/.pnpm/@noble+hashes@1.3.2/node_modules/@noble/hashes/esm/utils.js
var u8a = (a) => a instanceof Uint8Array;
var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE)
  throw new Error("Non little-endian hardware is not supported");
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  if (!u8a(data))
    throw new Error(`expected Uint8Array, got ${typeof data}`);
  return data;
}
var Hash = class {
  // Safe version that clones internal state
  clone() {
    return this._cloneInto();
  }
};
var toStr = {}.toString;
function wrapConstructor(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function wrapXOFConstructorWithOpts(hashCons) {
  const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
  const tmp = hashCons({});
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  return hashC;
}

// node_modules/.pnpm/@noble+hashes@1.3.2/node_modules/@noble/hashes/esm/sha3.js
var [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _7n = /* @__PURE__ */ BigInt(7);
var _256n = /* @__PURE__ */ BigInt(256);
var _0x71n = /* @__PURE__ */ BigInt(113);
for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
  [x, y] = [y, (2 * x + 3 * y) % 5];
  SHA3_PI.push(2 * (5 * y + x));
  SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
  let t = _0n;
  for (let j = 0; j < 7; j++) {
    R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
    if (R & _2n)
      t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
  }
  _SHA3_IOTA.push(t);
}
var [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ split(_SHA3_IOTA, true);
var rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
var rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  B.fill(0);
}
var Keccak = class _Keccak extends Hash {
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
    super();
    this.blockLen = blockLen;
    this.suffix = suffix;
    this.outputLen = outputLen;
    this.enableXOF = enableXOF;
    this.rounds = rounds;
    this.pos = 0;
    this.posOut = 0;
    this.finished = false;
    this.destroyed = false;
    number(outputLen);
    if (0 >= this.blockLen || this.blockLen >= 200)
      throw new Error("Sha3 supports only keccak-f1600 function");
    this.state = new Uint8Array(200);
    this.state32 = u32(this.state);
  }
  keccak() {
    keccakP(this.state32, this.rounds);
    this.posOut = 0;
    this.pos = 0;
  }
  update(data) {
    exists(this);
    const { blockLen, state } = this;
    data = toBytes(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      for (let i = 0; i < take; i++)
        state[this.pos++] ^= data[pos++];
      if (this.pos === blockLen)
        this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = true;
    const { state, suffix, pos, blockLen } = this;
    state[pos] ^= suffix;
    if ((suffix & 128) !== 0 && pos === blockLen - 1)
      this.keccak();
    state[blockLen - 1] ^= 128;
    this.keccak();
  }
  writeInto(out) {
    exists(this, false);
    bytes(out);
    this.finish();
    const bufferOut = this.state;
    const { blockLen } = this;
    for (let pos = 0, len = out.length; pos < len; ) {
      if (this.posOut >= blockLen)
        this.keccak();
      const take = Math.min(blockLen - this.posOut, len - pos);
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
      this.posOut += take;
      pos += take;
    }
    return out;
  }
  xofInto(out) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(out);
  }
  xof(bytes2) {
    number(bytes2);
    return this.xofInto(new Uint8Array(bytes2));
  }
  digestInto(out) {
    output(out, this);
    if (this.finished)
      throw new Error("digest() was already called");
    this.writeInto(out);
    this.destroy();
    return out;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = true;
    this.state.fill(0);
  }
  _cloneInto(to) {
    const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
    to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
    to.state32.set(this.state32);
    to.pos = this.pos;
    to.posOut = this.posOut;
    to.finished = this.finished;
    to.rounds = rounds;
    to.suffix = suffix;
    to.outputLen = outputLen;
    to.enableXOF = enableXOF;
    to.destroyed = this.destroyed;
    return to;
  }
};
var gen = (suffix, blockLen, outputLen) => wrapConstructor(() => new Keccak(blockLen, suffix, outputLen));
var sha3_224 = /* @__PURE__ */ gen(6, 144, 224 / 8);
var sha3_256 = /* @__PURE__ */ gen(6, 136, 256 / 8);
var sha3_384 = /* @__PURE__ */ gen(6, 104, 384 / 8);
var sha3_512 = /* @__PURE__ */ gen(6, 72, 512 / 8);
var keccak_224 = /* @__PURE__ */ gen(1, 144, 224 / 8);
var keccak_256 = /* @__PURE__ */ gen(1, 136, 256 / 8);
var keccak_384 = /* @__PURE__ */ gen(1, 104, 384 / 8);
var keccak_512 = /* @__PURE__ */ gen(1, 72, 512 / 8);
var genShake = (suffix, blockLen, outputLen) => wrapXOFConstructorWithOpts((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === void 0 ? outputLen : opts.dkLen, true));
var shake128 = /* @__PURE__ */ genShake(31, 168, 128 / 8);
var shake256 = /* @__PURE__ */ genShake(31, 136, 256 / 8);

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/crypto/keccak.js
var locked = false;
var _keccak256 = function(data) {
  return keccak_256(data);
};
var __keccak256 = _keccak256;
function keccak256(_data) {
  const data = getBytes(_data, "data");
  return hexlify(__keccak256(data));
}
keccak256._ = _keccak256;
keccak256.lock = function() {
  locked = true;
};
keccak256.register = function(func) {
  if (locked) {
    throw new TypeError("keccak256 is locked");
  }
  __keccak256 = func;
};
Object.freeze(keccak256);

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/address/address.js
var BN_03 = BigInt(0);
var BN_36 = BigInt(36);
function getChecksumAddress(address) {
  address = address.toLowerCase();
  const chars = address.substring(2).split("");
  const expanded = new Uint8Array(40);
  for (let i = 0; i < 40; i++) {
    expanded[i] = chars[i].charCodeAt(0);
  }
  const hashed = getBytes(keccak256(expanded));
  for (let i = 0; i < 40; i += 2) {
    if (hashed[i >> 1] >> 4 >= 8) {
      chars[i] = chars[i].toUpperCase();
    }
    if ((hashed[i >> 1] & 15) >= 8) {
      chars[i + 1] = chars[i + 1].toUpperCase();
    }
  }
  return "0x" + chars.join("");
}
var ibanLookup = {};
for (let i = 0; i < 10; i++) {
  ibanLookup[String(i)] = String(i);
}
for (let i = 0; i < 26; i++) {
  ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
}
var safeDigits = 15;
function ibanChecksum(address) {
  address = address.toUpperCase();
  address = address.substring(4) + address.substring(0, 2) + "00";
  let expanded = address.split("").map((c) => {
    return ibanLookup[c];
  }).join("");
  while (expanded.length >= safeDigits) {
    let block = expanded.substring(0, safeDigits);
    expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
  }
  let checksum = String(98 - parseInt(expanded, 10) % 97);
  while (checksum.length < 2) {
    checksum = "0" + checksum;
  }
  return checksum;
}
var Base36 = function() {
  ;
  const result = {};
  for (let i = 0; i < 36; i++) {
    const key = "0123456789abcdefghijklmnopqrstuvwxyz"[i];
    result[key] = BigInt(i);
  }
  return result;
}();
function fromBase36(value) {
  value = value.toLowerCase();
  let result = BN_03;
  for (let i = 0; i < value.length; i++) {
    result = result * BN_36 + Base36[value[i]];
  }
  return result;
}
function getAddress(address) {
  assertArgument(typeof address === "string", "invalid address", "address", address);
  if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
    if (!address.startsWith("0x")) {
      address = "0x" + address;
    }
    const result = getChecksumAddress(address);
    assertArgument(!address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) || result === address, "bad address checksum", "address", address);
    return result;
  }
  if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
    assertArgument(address.substring(2, 4) === ibanChecksum(address), "bad icap checksum", "address", address);
    let result = fromBase36(address.substring(4)).toString(16);
    while (result.length < 40) {
      result = "0" + result;
    }
    return getChecksumAddress("0x" + result);
  }
  assertArgument(false, "invalid address", "address", address);
}

// node_modules/.pnpm/ethers@6.13.5/node_modules/ethers/lib.esm/hash/solidity.js
var regexBytes = new RegExp("^bytes([0-9]+)$");
var regexNumber = new RegExp("^(u?int)([0-9]*)$");
var regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");
function _pack(type, value, isArray) {
  switch (type) {
    case "address":
      if (isArray) {
        return getBytes(zeroPadValue(value, 32));
      }
      return getBytes(getAddress(value));
    case "string":
      return toUtf8Bytes(value);
    case "bytes":
      return getBytes(value);
    case "bool":
      value = !!value ? "0x01" : "0x00";
      if (isArray) {
        return getBytes(zeroPadValue(value, 32));
      }
      return getBytes(value);
  }
  let match = type.match(regexNumber);
  if (match) {
    let signed = match[1] === "int";
    let size = parseInt(match[2] || "256");
    assertArgument((!match[2] || match[2] === String(size)) && size % 8 === 0 && size !== 0 && size <= 256, "invalid number type", "type", type);
    if (isArray) {
      size = 256;
    }
    if (signed) {
      value = toTwos(value, size);
    }
    return getBytes(zeroPadValue(toBeArray(value), size / 8));
  }
  match = type.match(regexBytes);
  if (match) {
    const size = parseInt(match[1]);
    assertArgument(String(size) === match[1] && size !== 0 && size <= 32, "invalid bytes type", "type", type);
    assertArgument(dataLength(value) === size, `invalid value for ${type}`, "value", value);
    if (isArray) {
      return getBytes(zeroPadBytes(value, 32));
    }
    return value;
  }
  match = type.match(regexArray);
  if (match && Array.isArray(value)) {
    const baseType = match[1];
    const count = parseInt(match[2] || String(value.length));
    assertArgument(count === value.length, `invalid array length for ${type}`, "value", value);
    const result = [];
    value.forEach(function(value2) {
      result.push(_pack(baseType, value2, true));
    });
    return getBytes(concat(result));
  }
  assertArgument(false, "invalid type", "type", type);
}
function solidityPacked(types, values) {
  assertArgument(types.length === values.length, "wrong number of values; expected ${ types.length }", "values", values);
  const tight = [];
  types.forEach(function(type, index) {
    tight.push(_pack(type, values[index]));
  });
  return hexlify(concat(tight));
}
function solidityPackedKeccak256(types, values) {
  return keccak256(solidityPacked(types, values));
}

// src/constants/constants.ts
var import_decimal2 = __toESM(require("decimal.js"), 1);
var EXPONENT_INIT = 1;
var EXPONENT_DECIMALS = 18;
var EXPONENT_HALF_DECIMALS = EXPONENT_DECIMALS / 2;
var INITIAL_EXPONENT = parseUnits("100000", EXPONENT_DECIMALS);
var INITIAL_EXPONENT_WC = parseUnits("10", EXPONENT_HALF_DECIMALS);
var INITIAL_EXPONENT_WT = parseUnits("10", EXPONENT_HALF_DECIMALS);
var INITIAL_INDEX_PRICE = "0.01";
var ORACLE_PRICE_DECIMAL = 7;
var MIN_PRICE_CHANGE_PPM = 1;
var TWITTER_VOTE_AMOUNT = 10;
var USER_VOTE_AMOUNT = 1;
var ZERO = new import_decimal2.default(0);
var MIN_DYNAMIC = new import_decimal2.default(0.01);
var MIN_BETA = 0.1;
var DEFAULT_SENSITIVITY_BASE = 1;
var DEFAULT_TOKEN_WEIGHT = 1e6;
var DEFAULT_TWITTER_VOTE_WEIGHT = 1e4;
var DEFAULT_PRICE_ALGORITHM = 1;

// src/types/types.ts
var import_decimal3 = __toESM(require("decimal.js"), 1);
var ABValue = class {
  constructor(a, b) {
    this.A = new import_decimal3.default(a);
    this.B = new import_decimal3.default(b);
  }
  toString() {
    return JSON.stringify({
      A: this.A.toString(),
      B: this.B.toString()
    });
  }
};
var VoteSource = /* @__PURE__ */ ((VoteSource2) => {
  VoteSource2["TWITTER"] = "TWITTER";
  VoteSource2["CHAIN"] = "CHAIN";
  VoteSource2["USER"] = "USER";
  return VoteSource2;
})(VoteSource || {});
var VotedAB = /* @__PURE__ */ ((VotedAB2) => {
  VotedAB2["A"] = "A";
  VotedAB2["B"] = "B";
  return VotedAB2;
})(VotedAB || {});

// src/algorithm/exponent.ts
var import_decimal4 = __toESM(require("decimal.js"), 1);
var ExponentService = class {
  constructor() {
    this.decimals = EXPONENT_DECIMALS;
    this.halfDecimals = EXPONENT_HALF_DECIMALS;
    this.initialA = INITIAL_EXPONENT;
    this.initialB = INITIAL_EXPONENT;
    this.initialK = this.initialA * this.initialB;
    this.initialWC = INITIAL_EXPONENT_WC;
    this.initialWT = INITIAL_EXPONENT_WT;
    this.defaultState();
  }
  defaultState() {
    this.a = this.initialA;
    this.b = this.initialB;
    this.wc = this.initialWC;
    this.wt = this.initialWT;
    this.exponent = 0n;
  }
  setState(a, b, wc, wt, exponent) {
    this.a = a;
    this.b = b;
    this.wc = wc;
    this.wt = wt;
    this.exponent = exponent;
  }
  computeExponent(voteAmount, voteSource, voteResult) {
    const weight = this.computeVoteWeight(voteSource) * BigInt(voteAmount);
    this.a += weight;
    this.b += weight;
    const newK = this.a * this.b;
    if (voteResult === "A" /* A */) {
      this.b += weight;
      this.a = newK / this.b;
    } else {
      this.a += weight;
      this.b = newK / this.a;
    }
    this.exponent = newK * 10n ** 6n / this.initialK;
    return { a: this.a, b: this.b, exponent: this.exponent };
  }
  computeVoteWeight(voteSource) {
    const add = parseUnits("0.001", this.halfDecimals);
    this.wc += add;
    this.wt += add;
    const newK = this.wc * this.wt;
    if (voteSource === "CHAIN" /* CHAIN */) {
      this.wt += add;
      this.wc = newK / this.wt;
      return this.wc * 10n ** BigInt(this.decimals) / this.wt;
    } else {
      this.wc += add;
      this.wt = newK / this.wc;
      return this.wt * 10n ** BigInt(this.decimals) / this.wc;
    }
  }
  getExponent() {
    return {
      a: this.a,
      b: this.b,
      wc: this.wc,
      wt: this.wt,
      exponent: this.exponent
    };
  }
  getExponentPrice() {
    const exponentA = new import_decimal4.default(this.a.toString());
    const exponentB = new import_decimal4.default(this.b.toString());
    return exponentB.div(exponentA);
  }
  serialize() {
    return JSON.stringify({
      a: this.a + "",
      b: this.b + "",
      wc: this.wc + "",
      wt: this.wt + "",
      exponent: this.exponent + ""
    });
  }
  deserialize(json) {
    const obj = JSON.parse(json);
    this.a = BigInt(obj.a);
    this.b = BigInt(obj.b);
    this.wc = BigInt(obj.wc);
    this.wt = BigInt(obj.wt);
    this.exponent = BigInt(obj.exponent);
  }
};

// src/algorithm/indexPrice.ts
var import_decimal5 = __toESM(require("decimal.js"), 1);
function config(options) {
  const tokenWeight = new import_decimal5.default(options?.tokenWeight ?? 0.5);
  const biasShiftWeight = new import_decimal5.default(options?.biasShiftWeight ?? 0.25);
  const biasScaleWeight = new import_decimal5.default(options?.biasScaleWeight ?? 0.25);
  return {
    tokenWeight,
    biasShiftWeight,
    biasScaleWeight
  };
}
function computeBiasAdjustedIndexPrice(prices, prevPrices, weights, exponentPrice, prevIndexPrice = new import_decimal5.default(INITIAL_INDEX_PRICE), options) {
  const symbols = Object.keys(prices);
  if (symbols.length < 2)
    return {
      nextIndexPrice: ZERO,
      delat: ZERO
    };
  const prevSymbols = Object.keys(prevPrices);
  if (prevSymbols.length < 2)
    return {
      nextIndexPrice: ZERO,
      delat: ZERO
    };
  const aaSymbol = symbols[0];
  const bbSymbol = symbols[1];
  const aaPrice = prices.A;
  const aaPrevPrice = prevPrices.A;
  const bbPrice = prices.B;
  const bbPrevPrice = prevPrices.B;
  const aaWeight = weights.A;
  const bbWeight = weights.B;
  if (aaPrice.lte(0) || aaPrevPrice.lte(0) || bbPrice.lte(0) || bbPrevPrice.lte(0)) {
    return {
      nextIndexPrice: ZERO,
      delat: ZERO
    };
  }
  const { tokenWeight, biasShiftWeight, biasScaleWeight } = config(options);
  const rA = computeLogReturn(aaPrice, aaPrevPrice);
  const rB = computeLogReturn(bbPrice, bbPrevPrice);
  const totalTokenWeight = aaWeight.add(bbWeight);
  if (totalTokenWeight.eq(0))
    return {
      nextIndexPrice: ZERO,
      delat: ZERO
    };
  const tokenDelta = aaWeight.mul(rA).sub(bbWeight.mul(rB)).div(totalTokenWeight);
  const biasShiftStrengthDelta = exponentPrice.sub(EXPONENT_INIT);
  const rawBiasScaleDelta = tokenDelta.mul(exponentPrice.sub(EXPONENT_INIT));
  let rawCombinedDelta = tokenDelta.mul(tokenWeight).add(biasShiftStrengthDelta.mul(biasShiftWeight)).add(rawBiasScaleDelta.mul(biasScaleWeight));
  const recentVolatility = computeVolatility(options?.prevTokenDeltas ?? []);
  const dynamicMax = import_decimal5.default.max(recentVolatility.mul(3), MIN_DYNAMIC);
  let combinedDelta = import_decimal5.default.tanh(rawCombinedDelta.div(dynamicMax)).mul(
    dynamicMax
  );
  if (options?.showLog) {
    console.log(`combinedDelta: ${combinedDelta.toString()}`);
  }
  combinedDelta = applyInertiaAndResistanceWithClamp(
    combinedDelta,
    options?.prevTokenDeltas ?? [],
    options?.prevTokenDeltas?.length ?? 5,
    options?.inertiaOptions ?? {}
  );
  if (options?.showLog) {
    const log = (msg, value) => options?.logger ? options?.logger.log(`${msg} ${value}`) : console.log(`${msg} ${value}`);
    log("rA", rA.toString());
    log("rB", rB.toString());
    log("tokenDelta", tokenDelta.toString());
    log("biasShiftStrengthDelta", biasShiftStrengthDelta.toString());
    log("rawBiasScaleDelta", rawBiasScaleDelta.toString());
    log("rawCombinedDelta", rawCombinedDelta.toString());
    log("recentVolatility", recentVolatility.toString());
    log("dynamicMax", dynamicMax.toString());
    log("combinedDelta", combinedDelta.toString());
  }
  const indexPriceMultiplier = import_decimal5.default.exp(combinedDelta);
  const nextIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);
  if (!nextIndexPrice.isFinite()) {
    return {
      nextIndexPrice: ZERO,
      delat: ZERO
    };
  }
  return {
    nextIndexPrice,
    delat: combinedDelta
  };
}
function computeBiasDrivenIndexPriceV2(prices, prevPrices, weights, exponentPrice, prevIndexPrice = new import_decimal5.default(INITIAL_INDEX_PRICE), options) {
  const [a, b] = Object.keys(prices);
  if (!a || !b)
    throw new Error("Need exactly two tokens");
  const aPrice = prices.A;
  const bPrice = prices.B;
  const aPrev = prevPrices.A;
  const bPrev = prevPrices.B;
  if (aPrice.lte(0) || bPrice.lte(0) || aPrev.lte(0) || bPrev.lte(0)) {
    throw new Error("Invalid price data");
  }
  const wA = weights.A;
  const wB = weights.B;
  const totalWeight = wA.add(wB);
  const normWA = wA.div(totalWeight);
  const normWB = wB.div(totalWeight);
  const logA = import_decimal5.default.ln(aPrice);
  const logB = import_decimal5.default.ln(bPrice);
  const logAPrev = import_decimal5.default.ln(aPrev);
  const logBPrev = import_decimal5.default.ln(bPrev);
  const weightedLogNow = logA.mul(normWA).sub(logB.mul(normWB));
  const weightedLogPrev = logAPrev.mul(normWA).sub(logBPrev.mul(normWB));
  const baseLogReturn = weightedLogNow.sub(weightedLogPrev);
  const twitterVoteWeight = options?.twitterVoteWeight ?? DEFAULT_TWITTER_VOTE_WEIGHT;
  const weightExponentPrice = exponentPrice.mul(twitterVoteWeight);
  const biasStrength = weightExponentPrice.sub(twitterVoteWeight);
  const biasDelta = baseLogReturn.mul(biasStrength);
  let combinedDelta = baseLogReturn.add(biasDelta);
  const baseVolatility = computeVolatility([combinedDelta]);
  const sensitivityBase = options?.sensitivityBase ?? DEFAULT_SENSITIVITY_BASE;
  const beta = import_decimal5.default.max(
    MIN_BETA,
    import_decimal5.default.pow(sensitivityBase, import_decimal5.default.sub(1, baseVolatility))
  );
  const scaledDelta = combinedDelta.mul(beta);
  const nextIndexPrice = import_decimal5.default.exp(
    import_decimal5.default.ln(prevIndexPrice).add(scaledDelta)
  );
  if (options?.showLog) {
    const log = (msg, value) => options?.logger ? options?.logger.log(`${msg} ${value}`) : console.log(`${msg} ${value}`);
    log("\u{1F539} baseRatio:", import_decimal5.default.exp(weightedLogNow).toFixed(6));
    log("\u{1F539} prevBaseRatio:", import_decimal5.default.exp(weightedLogPrev).toFixed(6));
    log("\u{1F539} baseLogReturn:", baseLogReturn.toFixed(6));
    log("\u{1F539} biasStrength:", biasStrength.toFixed(6));
    log("\u{1F539} baseVolatility:", baseVolatility.toFixed(6));
    log("\u{1F539} finalDelta:", combinedDelta.toFixed(6));
    log("\u{1F539} scaledDelta:", scaledDelta.toFixed(6));
    log("\u{1F539} nextIndexPrice:", nextIndexPrice.toFixed(7));
  }
  return {
    nextIndexPrice,
    delat: combinedDelta
  };
}
function predictIndexImpactFromExponentOnly(exponentPrice, prevIndexPrice, options) {
  const { biasShiftWeight } = config(options);
  const biasShiftStrengthDelta = exponentPrice.sub(EXPONENT_INIT);
  const rawCombinedDelta = biasShiftStrengthDelta.mul(biasShiftWeight);
  const recentVolatility = computeVolatility(options?.prevTokenDeltas ?? []);
  const dynamicMax = import_decimal5.default.max(recentVolatility.mul(3), MIN_DYNAMIC);
  let combinedDelta = import_decimal5.default.tanh(rawCombinedDelta.div(dynamicMax)).mul(
    dynamicMax
  );
  if (options?.maxDailyPercent && options?.price24hAgo) {
    const return24h = import_decimal5.default.ln(prevIndexPrice.div(options.price24hAgo));
    const effectiveDailyDelta = combinedDelta.add(return24h);
    const cappedEffective = tanhClampDelta(
      effectiveDailyDelta,
      options.maxDailyPercent
    );
    combinedDelta = cappedEffective.sub(return24h);
  }
  const indexPriceMultiplier = import_decimal5.default.exp(combinedDelta);
  const predictedIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);
  const deltaPercent = predictedIndexPrice.div(prevIndexPrice).sub(1);
  if (options?.showLog) {
    console.log(`biasShiftStrengthDelta: ${biasShiftStrengthDelta.toString()}`);
    console.log(`rawCombinedDelta: ${rawCombinedDelta.toString()}`);
    console.log(`recentVolatility: ${recentVolatility.toString()}`);
    console.log(`dynamicMax: ${dynamicMax.toString()}`);
    console.log(`combinedDelta: ${combinedDelta.toString()}`);
    console.log(`indexPriceMultiplier: ${indexPriceMultiplier.toString()}`);
    console.log(`deltaPercent: ${deltaPercent.toString()}`);
  }
  return {
    predictedIndexPrice,
    deltaPercent
  };
}

// src/algorithm/oracle.ts
var getPriceAtomicResolution = (price) => {
  if (!price || !isFinite(price) || price <= 0)
    return 0;
  if (price >= 1e4)
    return -9;
  if (price >= 1e3)
    return -8;
  if (price >= 300)
    return -7;
  if (price >= 50)
    return -6;
  if (price >= 1)
    return -5;
  if (price >= 0.1)
    return -4;
  if (price >= 0.01)
    return -3;
  if (price >= 1e-3)
    return -2;
  if (price >= 1e-4)
    return -1;
  if (price >= 1e-5)
    return 0;
  return 0;
};
var generateEventHash = (eventTag, title) => {
  return solidityPackedKeccak256(["string", "string"], [eventTag, title]);
};
var getMarketParameters = (ticker, price) => {
  return {
    ticker,
    priceExponent: -ORACLE_PRICE_DECIMAL,
    minPriceChange: MIN_PRICE_CHANGE_PPM,
    atomicResolution: getPriceAtomicResolution(Number(price)),
    quantumConversionExponent: -9,
    stepBaseQuantums: 1e6,
    subticksPerTick: 1e5
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ABValue,
  DEFAULT_PRICE_ALGORITHM,
  DEFAULT_SENSITIVITY_BASE,
  DEFAULT_TOKEN_WEIGHT,
  DEFAULT_TWITTER_VOTE_WEIGHT,
  EXPONENT_DECIMALS,
  EXPONENT_HALF_DECIMALS,
  EXPONENT_INIT,
  ExponentService,
  INITIAL_EXPONENT,
  INITIAL_EXPONENT_WC,
  INITIAL_EXPONENT_WT,
  INITIAL_INDEX_PRICE,
  MIN_BETA,
  MIN_DYNAMIC,
  MIN_PRICE_CHANGE_PPM,
  ORACLE_PRICE_DECIMAL,
  TWITTER_VOTE_AMOUNT,
  USER_VOTE_AMOUNT,
  VoteSource,
  VotedAB,
  ZERO,
  applyInertiaAndResistanceWithClamp,
  computeBiasAdjustedIndexPrice,
  computeBiasDrivenIndexPriceV2,
  computeLogReturn,
  computeVolatility,
  generateEventHash,
  getMarketParameters,
  getPriceAtomicResolution,
  predictIndexImpactFromExponentOnly,
  tanhClampDelta
});
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=index.cjs.map
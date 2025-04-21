var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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

// src/algorithm/math.ts
import Decimal from "decimal.js";
var computeLogReturn = (current, previous) => {
  if (previous.lte(0) || current.lte(0))
    return new Decimal(0);
  return current.div(previous).log();
};

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

// src/constants/constants.ts
var EXPONENT_DECIMALS = 18;
var EXPONENT_HALF_DECIMALS = EXPONENT_DECIMALS / 2;
var INITIAL_EXPONENT = parseUnits("100000", EXPONENT_DECIMALS);
var INITIAL_EXPONENT_WC = parseUnits("10", EXPONENT_HALF_DECIMALS);
var INITIAL_EXPONENT_WT = parseUnits("10", EXPONENT_HALF_DECIMALS);
var INITIAL_INDEX_PRICE = "0.01";

// src/types/types.ts
var VoteSource = /* @__PURE__ */ ((VoteSource2) => {
  VoteSource2["TWITTER"] = "TWITTER";
  VoteSource2["CHAIN"] = "CHAIN";
  return VoteSource2;
})(VoteSource || {});
var VotedAB = /* @__PURE__ */ ((VotedAB2) => {
  VotedAB2["A"] = "A";
  VotedAB2["B"] = "B";
  return VotedAB2;
})(VotedAB || {});

// src/algorithm/exponent.ts
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
import Decimal3 from "decimal.js";

// src/algorithm/volatility.ts
import Decimal2 from "decimal.js";
function applyVolatilityNoise(delta, options) {
  const amplifier = new Decimal2(options?.volatilityAmplifier ?? 1.6);
  const noiseRange = options?.noiseRange ?? 0.2;
  const amplified = delta.mul(Decimal2.pow(delta.abs().add(1), amplifier));
  const noise = new Decimal2(Math.random() * noiseRange - noiseRange / 2);
  return amplified.add(noise);
}

// src/algorithm/indexPrice.ts
var computeIndexPrice = (prices, weights, weightedExponent) => {
  let basePrice = new Decimal3(0);
  for (const token in prices) {
    const price = prices[token];
    const weight = weights[token] ?? new Decimal3(0);
    basePrice = basePrice.add(price.mul(weight));
  }
  return basePrice.mul(weightedExponent);
};
function computeBiasAdjustedIndexPrice(prices, prevPrices, weights, exponentPrice, prevIndexPrice = new Decimal3(INITIAL_INDEX_PRICE), options) {
  const symbols = Object.keys(prices);
  if (symbols.length < 2)
    return new Decimal3(1);
  const aaSymbol = symbols[0];
  const bbSymbol = symbols[1];
  const aaPrice = prices[aaSymbol];
  const aaPrevPrice = prevPrices[aaSymbol];
  const bbPrice = prices[bbSymbol];
  const bbPrevPrice = prevPrices[bbSymbol];
  const aaWeight = weights[aaSymbol];
  const bbWeight = weights[bbSymbol];
  if (aaPrice.lte(0) || aaPrevPrice.lte(0) || bbPrice.lte(0) || bbPrevPrice.lte(0)) {
    return new Decimal3(1);
  }
  const rA = computeLogReturn(aaPrice, aaPrevPrice);
  const rB = computeLogReturn(bbPrice, bbPrevPrice);
  const totalWeight = aaWeight.add(bbWeight);
  if (totalWeight.eq(0))
    return new Decimal3(1);
  const weightedDelta = aaWeight.mul(rA).sub(bbWeight.mul(rB)).div(totalWeight);
  let adjustedDelta = weightedDelta.mul(exponentPrice);
  if (options?.enableVolatility) {
    adjustedDelta = applyVolatilityNoise(adjustedDelta, {
      volatilityAmplifier: options.volatilityAmplifier,
      noiseRange: options.noiseRange
    });
  }
  const indexPriceMultiplier = Decimal3.exp(adjustedDelta);
  const nextIndexPrice = prevIndexPrice.mul(indexPriceMultiplier);
  return nextIndexPrice;
}

// src/algorithm/oracle.ts
var getPriceDecimals = (price) => {
  if (!price) {
    return 0;
  }
  const p = price.split(".");
  if (p.length < 2) {
    return 0;
  }
  return p[1].length;
};
var getPriceExponent = (price) => {
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
var getPriceAtomicResolution = (price) => {
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
export {
  EXPONENT_DECIMALS,
  EXPONENT_HALF_DECIMALS,
  ExponentService,
  INITIAL_EXPONENT,
  INITIAL_EXPONENT_WC,
  INITIAL_EXPONENT_WT,
  INITIAL_INDEX_PRICE,
  VoteSource,
  VotedAB,
  computeBiasAdjustedIndexPrice,
  computeIndexPrice,
  computeLogReturn,
  getPriceAtomicResolution,
  getPriceDecimals,
  getPriceExponent
};
//# sourceMappingURL=index.js.map
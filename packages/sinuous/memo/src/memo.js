// Adapted from https://github.com/caiogondim/fast-memoize.js - MIT License
export function memo(func) {
  let cache = {};
  return function() {
    const args = Array.from(arguments);

    const argsWithFuncIds = args.map(x => {
      if (isPlainObject(x) || Array.isArray(x)) {
        let obj = {};
        for (let key in x) {
          obj[key] = memoizedIdFunc(x[key]);
        }
        return obj;
      }
      return memoizedIdFunc(x);
    });

    const cacheKey = JSON.stringify(argsWithFuncIds);
    let computedValue = cache[cacheKey];
    if (computedValue === undefined) {
      // eslint-disable-next-line
      computedValue = func.apply(this, args);

      // Memoizing the contents of a document fragment is impossible because
      // once it is appended, it's cleared of its children leaving an empty
      // shell, on next render the comp would just be cleared.
      // Store the child refs in an array and memo and return this.
      if (computedValue && computedValue.nodeType === 11) {
        computedValue = Array.from(computedValue.childNodes);
      }

      cache[cacheKey] = computedValue;
    }
    return computedValue;
  };
}

let id = 0;
function memoizedIdFunc(x) {
  if (typeof x === 'function' || x instanceof Node) {
    if (!x.$m) x.$m = ++id;
    return { $m: x.$m };
  }
  return x;
}

/**
 * Check if this is a plain obect.
 * @param {object} obj - The object to inspect.
 * @return {boolean}
 */
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

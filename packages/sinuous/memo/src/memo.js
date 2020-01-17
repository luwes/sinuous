// Adapted from https://github.com/caiogondim/fast-memoize.js - MIT License

export function memo(func) {
  let cache = {};
  return function() {
    const args = [].slice.call(arguments);

    const argsWithFuncIds = args.map(x => {
      if (isPlainObject(x)) {
        Object.keys(x).forEach(prop => (x[prop] = memoizedIdFunc(x[prop])));
        return x;
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
        computedValue = [].slice.call(computedValue.childNodes);
      }

      cache[cacheKey] = computedValue;
    }
    return computedValue;
  };
}

function memoizedIdFunc(x) {
  if (typeof x === 'function') return memoizedId(x);
  return x;
}

let id = 0;
function memoizedId(x) {
  if (!x.__memoizedId) x.__memoizedId = ++id;
  return { __memoizedId: x.__memoizedId };
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

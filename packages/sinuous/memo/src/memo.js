// Adapted from https://github.com/reduxjs/reselect - MIT License

export function memo(func, equalityCheck) {
  equalityCheck = equalityCheck || defaultEqualityCheck;

  let lastArgs = null;
  let lastResult = null;
  // we reference arguments instead of spreading them for performance reasons
  return function() {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);

      // Memoizing the contents of a document fragment is impossible because
      // once it is appended, it's cleared of its children leaving an empty
      // shell, on next render the comp would just be cleared.
      // Store the child refs in an array and memo and return this.
      if (lastResult && lastResult.nodeType === 11) {
        lastResult = [].slice.call(lastResult.childNodes);
      }
    }

    lastArgs = arguments;
    return lastResult;
  };
}

function defaultEqualityCheck(newVal, oldVal) {
  if (isPlainObject(newVal)) {
    let countA = 0;
    let countB = 0;
    for (let key in newVal) {
      if (
        Object.hasOwnProperty.call(newVal, key) &&
        newVal[key] !== oldVal[key]
      ) {
        return false;
      }
      countA++;
    }
    for (let key in oldVal) {
      if (Object.hasOwnProperty.call(oldVal, key)) countB++;
    }
    return countA === countB;
  }

  return newVal === oldVal;
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

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`)
  // so we can determine equality as fast as possible.
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

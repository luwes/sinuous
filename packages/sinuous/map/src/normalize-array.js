export function normalizeArray(normalized, array) {
  for (let i = 0, len = array.length; i < len; i++) {
    const item = array[i];
    if (item instanceof Node) {
      normalized.push(item);
    } else if (item == null || item === true || item === false) {
      // matches null, undefined, true or false
      // skip
    } else if (Array.isArray(item)) {
      normalizeArray(normalized, item);
    } else if (typeof item === 'string') {
      normalized.push(item);
    } else {
      normalized.push('' + item);
    }
  }
  return normalized;
}

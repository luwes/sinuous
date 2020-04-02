const cache = new Map();

/**
 * `sinuous/map` only works if the list items are unique.
 *
 * This helper function ensures the items are unique in case of duplicates.
 * It replaces the duplicate with a plain object with a $v (value) pointer
 * which gets retrieved in `sinuous/map`.
 *
 * @param  {Array} arr
 * @return {Array}
 */
export function unique(arr) {
  let u = new Map();
  let a = [];
  let c;
  let count = 0;
  for (let i = 0, l = arr.length; i < l; ++i) {
    let item = arr[i];
    if (!u.has(item)) {
      a.push(item);
      u.set(item, 1);
    } else if ((c = cache.get(item) || []) && c[count++]) {
      a.push(c[count]);
    } else {
      const uniqueItem = { $v: item };
      c = c || [];
      c.push(uniqueItem);
      cache.set(item, c);
      a.push(uniqueItem);
    }
  }
  return a;
}

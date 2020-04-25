import { api } from 'sinuous';
import { diff } from '../../src/diff.js';
export { unique } from '../../src/unique.js';

/**
 * Map over a list of unique items that create DOM nodes.
 *
 * No duplicates in the list of items is a hard requirement, the diffing
 * algorithm will not work with duplicate values. See `./unique.js`.
 *
 * @param  {Function} items - Function or observable that creates a list.
 * @param  {Function} expr
 * @param {boolean} [cleaning]
 * @return {DocumentFragment}
 */
export function map(items, expr, cleaning) {
  const { root, subscribe, sample, cleanup } = api;

  // Disable cleaning for templates by default.
  if (cleaning == null) cleaning = !expr.$t;

  const parent = api.h([]);
  const endMark = api.add(parent, '');

  const disposers = new Map();
  const nodes = new Map();
  const toRemove = new Set();

  const unsubscribe = subscribe(a => {
    const b = items();
    return sample(() => {
      toRemove.clear();

      // Array.from to make a copy of the current list.
      const content = Array.from(
        diff(endMark.parentNode, a || [], b, node, endMark)
      );

      toRemove.forEach(dispose);
      return content;
    });
  });

  cleanup(unsubscribe);
  cleanup(disposeAll);

  function node(item, i) {
    if (item == null) return;

    let n = nodes.get(item);
    if (i === 1) {
      toRemove.delete(item);

      if (!n) {
        n = cleaning
          ? root(dispose => {
              disposers.set(item, dispose);
              return expr(item.$v || item);
            })
          : expr(item.$v || item);

        if (n.nodeType === 11) n = n.firstChild;

        nodes.set(item, n);
      }
    } else if (i === -1) {
      toRemove.add(item);
    }

    return n;
  }

  function disposeAll() {
    disposers.forEach(d => d());
    disposers.clear();
    nodes.clear();
    toRemove.clear();
  }

  function dispose(item) {
    let disposer = disposers.get(item);
    if (disposer) {
      disposer();
      disposers.delete(item);
    }
    nodes.delete(item);
  }

  return parent;
}

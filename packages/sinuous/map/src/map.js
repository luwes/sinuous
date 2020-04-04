import { udomdiff } from './udomdiff.js';
import { diffable, persistent } from './uwire.js';
import { api } from 'sinuous';

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

  let parent = api.h([]);
  const endMark = api.add(parent, '');

  const disposers = new Map();
  const nodes = new Map();

  const unsubscribe = subscribe(a => {
    const b = items();
    return sample(() => {
      return Array.from(
        udomdiff(endMark.parentNode, a || [], b, node, endMark)
      );
    });
  });

  cleanup(unsubscribe);
  cleanup(disposeAll);

  function node(item, i) {
    let n = nodes.get(item);
    if (i === 1 && !n) {
      n = cleaning
        ? root(dispose => {
            disposers.set(item, dispose);
            return expr(item.$v || item);
          })
        : expr(item.$v || item);

      if (typeof n === 'string') n = document.createTextNode(n);
      else if (n.nodeType === 11) n = persistent(n) || n;

      nodes.set(item, n);
    } else if (i === -1) {
      dispose(item);
    }

    return diffable(n, i);
  }

  function disposeAll() {
    disposers.forEach(d => d());
    disposers.clear();
    nodes.clear();
  }

  function dispose(item) {
    let disposer = disposers.get(item);
    if (disposer) {
      disposer();
      disposers.delete(item);
    }
  }

  return parent;
}

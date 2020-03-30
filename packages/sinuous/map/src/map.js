import { api } from 'sinuous';
import { mapArray } from './map-array.js';
import { reconcileArrays } from './reconcile.js';
import { normalizeArray } from './normalize-array.js';

export function map(items, expr) {
  const { subscribe, cleanup } = api;

  const parent = document.createDocumentFragment();
  const afterNode = parent.appendChild(document.createTextNode(''));
  const b = mapArray(items, mapFn);

  const unsubscribe = subscribe(a => {
    return reconcileArrays(afterNode, a || [], normalizeArray([], b()));
  });

  cleanup(unsubscribe);

  function mapFn(item, i, data) {
    const value = expr(item, i, data);

    if (typeof value === 'string') {
      return document.createTextNode(value);
    }

    if (value.nodeType === 11) {
      return Array.from(value.childNodes);
    }

    return value;
  }

  return parent;
}

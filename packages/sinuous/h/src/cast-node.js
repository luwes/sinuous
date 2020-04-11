import { api } from './api.js';
import { EMPTY_ARR } from './constants.js';

export function castNode(value) {
  if (typeof value === 'string') {
    return document.createTextNode(value);
  }
  if (!(value instanceof Node)) {
    // Passing an empty array creates a DocumentFragment.
    return api.h(EMPTY_ARR, value);
  }
  return value;
}

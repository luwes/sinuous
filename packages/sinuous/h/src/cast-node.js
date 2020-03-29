import { api } from './api.js';
import { EMPTY_ARR } from './constants.js';

export function castNode(value) {
  if (typeof value === 'string') {
    value = document.createTextNode(value);
  }
  else if (!(value instanceof Node)) {
    // Passing an empty array creates a DocumentFragment.
    value = api.h(EMPTY_ARR, value);
  }
  return value;
}

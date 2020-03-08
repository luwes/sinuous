import { api } from './api.js';
import { EMPTY_ARR, GROUPING } from './constants.js';

let groupCounter = 0;

export function add(parent, value, endMark) {
  let mark;

  if (typeof value === 'string') {
    value = document.createTextNode(value);
  } else if (!(value instanceof Node)) {
    // Passing an empty array creates a DocumentFragment.
    value = api.h(EMPTY_ARR, value);
  }

  if (
    value.nodeType === 11 &&
    (mark = value.firstChild) &&
    mark !== value.lastChild
  ) {
    mark[GROUPING] = value.lastChild[GROUPING] = ++groupCounter;
  }

  // If endMark is `null`, value will be added to the end of the list.
  parent.insertBefore(value, endMark);

  // Explicit undefined to store if frag.firstChild is null.
  return mark === undefined ? value : mark;
}

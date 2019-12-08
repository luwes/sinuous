import { api } from './api.js';
import { EMPTY_ARR, GROUPING } from './constants.js';
import { clearAll } from './utils.js';

let groupCounter = 0;

export function insert(parent, value, marker, current, startNode) {
  // This is needed if the parent is a DocumentFragment initially.
  parent = (marker && marker.parentNode) || parent;

  const t = typeof value;
  if (value === current);
  else if ((!value && value !== 0) || value === true) {
    clearAll(parent, current, marker, startNode);
    current = null;
  } else if (
    (!current || typeof current === 'string') &&
    (t === 'string' || (t === 'number' && (value += '')))
  ) {
    // Block optimized for string insertion.
    if (current == null || !parent.firstChild) {
      if (marker) {
        parent.insertBefore(document.createTextNode(value), marker);
      } else {
        parent.textContent = value;
      }
    } else {
      if (marker) {
        (marker.previousSibling || parent.lastChild).data = value;
      } else {
        parent.firstChild.data = value;
      }
    }
    current = value;
  } else if (t === 'function') {
    api.subscribe(function insertContent() {
      current = api.insert(parent, value(), marker, current);
    });
  } else {
    // Block for nodes, fragments, Arrays, non-stringables and node -> stringable.
    clearAll(parent, current, marker, startNode);

    if (!(value instanceof Node)) {
      // Passing an empty array creates a DocumentFragment.
      value = api.h(EMPTY_ARR, value);
    }
    if (value.nodeType === 11 && value.firstChild !== value.lastChild) {
      value.firstChild[GROUPING] = value.lastChild[GROUPING] = ++groupCounter;
    }
    // If marker is `null`, value will be added to the end of the list.
    // IE9 requires an explicit `null` as second argument.
    parent.insertBefore(value, marker || null);
    current = value;
  }

  return current;
}

import { GROUPING } from './constants.js';
import { clearAll } from './utils.js';

let groupCounter = 0;

export function insert(api, parent, value, marker, current) {
  if (value === current) return current;

  const t = typeof value;
  if (value == null || value === '' || value === false || value === true) {
    clearAll(parent, current, marker);
    current = '';
  } else if (
    (!current || typeof current === 'string') &&
    (t === 'string' || (t === 'number' && (value += '')))
  ) {
    // Block optimized for string insertion.
    if (current == null) {
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
    api.subscribe(function() {
      current = insert(api, parent, value(), marker, current);
    });
  } else {
    // Block for nodes, fragments, non-stringables.
    clearAll(parent, current, marker);

    let mark;
    if (!(value instanceof Node)) {
      value = document.createTextNode('' + value);
    } else if (
      value.nodeType === 11 &&
      (mark = value.firstChild) &&
      mark !== value.lastChild
    ) {
      mark[GROUPING] = value.lastChild[GROUPING] = ++groupCounter;
    }

    if (marker) {
      parent.insertBefore(value, marker);
    } else {
      parent.appendChild(value);
    }

    current = value;
  }

  return current;
}

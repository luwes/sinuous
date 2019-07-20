import { GROUPING } from './constants.js';
import { clearAll } from './utils.js';

let groupCounter = 0;

export function insert(api, parent, value, marker, current) {
  const t = typeof value;
  if (value === current);
  else if ((!value && value !== 0) || value === true) {
    clearAll(parent, current, marker);
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
    api.subscribe(function() {
      current = insert(api, parent, value(), marker, current);
    });
  } else {
    // Block for nodes, fragments, non-stringables.
    clearAll(parent, current, marker);

    if (!(value instanceof Node)) {
      value = document.createTextNode('' + value);
    } else if (
      value.nodeType === 11 &&
      value.firstChild !== value.lastChild
    ) {
      value.firstChild[GROUPING] = value.lastChild[GROUPING] = ++groupCounter;
    }

    // If marker is `null`, value will be added to the end of the list.
    parent.insertBefore(value, marker);
    current = value;
  }

  return current;
}

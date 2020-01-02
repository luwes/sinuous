import { api } from './api.js';
import { add } from './add.js';
import { clearAll } from './utils.js';

export function insert(parent, value, marker, current, startNode) {
  // This is needed if the parent is a DocumentFragment initially.
  parent = (marker && marker.parentNode) || parent;

  if (value === current);
  else if (
    (!current || typeof current === 'string') &&
    (typeof value === 'string' || (typeof value === 'number' && (value += '')))
  ) {
    // Block optimized for string insertion.
    if (current == null || !parent.firstChild) {
      if (marker) {
        add(parent, value, marker);
      } else {
        // textContent is a lot faster than append -> createTextNode.
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
  } else if (typeof value === 'function') {
    api.subscribe(function insertContent() {
      current = api.insert(parent, value.call(parent), marker, current);
    });
  } else {
    // Block for nodes, fragments, Arrays, non-stringables and node -> stringable.
    clearAll(parent, current, marker, startNode);
    current = null;

    if (value && value !== true) {
      current = add(parent, value, marker);
    }
  }

  return current;
}

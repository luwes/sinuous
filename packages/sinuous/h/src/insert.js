import { api } from './api.js';
import { add } from './add.js';
import { clearAll } from './utils.js';

export function insert(parent, value, marker, current, startNode) {
  // This is needed if the parent is a DocumentFragment initially.
  parent = (marker && marker.parentNode) || parent;

  const type = typeof value;
  if (value === current);
  else if ((!value && value !== 0) || value === true) {
    clearAll(parent, current, marker, startNode);
    current = null;
  } else if (
    (!current || typeof current === 'string') &&
    (type === 'string' || (type === 'number' && (value += '')))
  ) {
    // Block optimized for string insertion.
    if (current == null || !parent.firstChild) {
      if (marker) {
        add(parent, document.createTextNode(value), marker);
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
  } else if (type === 'function') {
    api.subscribe(function insertContent() {
      current = api.insert(parent, value(), marker, current);
    });
  } else {
    // Block for nodes, fragments, Arrays, non-stringables and node -> stringable.
    clearAll(parent, current, marker, startNode);
    current = add(parent, value, marker);
  }

  return current;
}

import { clearAll, normalizeIncomingArray } from './utils.js';

export function insert(subscribe, parent, value, marker, current) {
  if (value === current) return current;
  parent = (marker && marker.parentNode) || parent;
  const t = typeof value;
  if (t === 'string' || t === 'number') {
    if (t === 'number') value = value.toString();
    if (marker) {
      if (value === '') clearAll(parent, current, marker);
      else if (current !== '' && typeof current === 'string') {
        marker.previousSibling.data = value;
      } else {
        const node = document.createTextNode(value);
        if (current !== '' && current != null) {
          parent.replaceChild(node, marker.previousSibling);
        } else {
          parent.insertBefore(node, marker);
        }
      }
      current = value;
    } else {
      if (current !== '' && typeof current === 'string') {
        current = parent.firstChild.data = value;
      } else {
        current = parent.textContent = value;
      }
    }
  } else if (value == null || t === 'boolean') {
    current = clearAll(parent, current, marker);
  } else if (t === 'function') {
    subscribe(function() {
      current = insert(subscribe, parent, value(), marker, current);
    });
  } else if (value instanceof Node) {
    if (Array.isArray(current)) {
      if (current.length === 0) {
        parent.insertBefore(value, marker);
      } else if (current.length === 1) {
        parent.replaceChild(value, current[0]);
      } else {
        clearAll(parent, current, marker);
        parent.appendChild(value);
      }
    } else if (current == null || current === '') {
      parent.insertBefore(value, marker);
    } else {
      parent.replaceChild(
        value,
        (marker && marker.previousSibling) || parent.firstChild
      );
    }
    current = value;
  } else if (Array.isArray(value)) {
    const array = normalizeIncomingArray([], value);
    clearAll(parent, current, marker);
    array.forEach(node => {
      parent.insertBefore(node, marker);
    });
    current = array;
  } else {
    // eslint-disable-next-line
    throw new Error('Expected node, string or array of same.');
  }

  return current;
}

import { clearAll, normalizeArray } from './utils.js';

export function insert(subscribe, parent, value, marker, current) {
  if (value === current) return current;

  const t = typeof value;
  if (value == null || value === '' || t === 'boolean') {
    clearAll(parent, current, marker);
    current = '';
  } else if (t === 'string' || t === 'number') {
    if (t === 'number') {
      value = '' + value;
    }
    if (current !== '' && typeof current === 'string') {
      if (marker) {
        (marker.previousSibling || parent.lastChild).data = value;
      } else {
        parent.firstChild.data = value;
      }
    } else {
      if (marker) {
        if (current !== '' && current != null) {
          parent.replaceChild(
            document.createTextNode(value),
            marker.previousSibling || parent.lastChild
          );
        } else {
          parent.insertBefore(document.createTextNode(value), marker);
        }
      } else {
        parent.textContent = value;
      }
    }
    current = value;
  } else if (t === 'function') {
    subscribe(function() {
      current = insert(subscribe, parent, value(), marker, current);
    });
  } else if (value instanceof Node) {
    if (Array.isArray(current)) {
      if (!current.length) {
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
    value = normalizeArray([], value);
    clearAll(parent, current, marker);
    value.forEach(node => {
      parent.insertBefore(node, marker);
    });
    current = value;
  } else {
    // EC1: Expected node, string or array of same
    // eslint-disable-next-line
    throw Error('EC1');
  }

  return current;
}

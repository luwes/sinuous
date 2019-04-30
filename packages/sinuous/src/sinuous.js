// Inspired by https://github.com/ryansolid/babel-plugin-jsx-dom-expressions
import { context } from './h.js';

export default function sinuous(wrap) {
  return context({
    wrap,
    insert,
  });
}

function insert(wrap, parent, accessor, current, marker) {
  if (typeof accessor !== 'function') {
    return insertExpression(wrap, parent, accessor, current, marker);
  }

  wrap(function() {
    current = insertExpression(wrap, parent, accessor(), current, marker);
  });
}

export function insertExpression(wrap, parent, value, current, marker) {
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
    wrap(function() {
      current = insertExpression(wrap, parent, value(), current, marker);
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
    let array = normalizeIncomingArray([], value);
    clearAll(parent, current, marker);
    array.forEach(node => {
      parent.insertBefore(node, marker);
    });
    current = array;
  } else {
    throw new Error('Expected node, string or array of same.');
  }

  return current;
}

export function clearAll(parent, current, marker, startNode) {
  if (!marker) return (parent.textContent = '');
  if (Array.isArray(current)) {
    current.forEach(node => {
      parent.removeChild(node);
    });
  } else if (current != null && current != '') {
    if (startNode !== undefined) {
      let node = marker.previousSibling,
        tmp;
      while (node !== startNode) {
        tmp = node.previousSibling;
        parent.removeChild(node);
        node = tmp;
      }
    } else {
      parent.removeChild(marker.previousSibling);
    }
  }
  return '';
}

export function normalizeIncomingArray(normalized, array) {
  for (let i = 0, len = array.length; i < len; i++) {
    const item = array[i];
    if (item instanceof Node) {
      if (item.nodeType === 11) {
        normalizeIncomingArray(normalized, item.childNodes);
      } else normalized.push(item);
      // matches null, undefined, true or false
    } else if (item == null || item === true || item === false) {
      // skip
    } else if (Array.isArray(item)) {
      normalizeIncomingArray(normalized, item);
    } else {
      normalized.push(document.createTextNode(item.toString()));
    }
  }
  return normalized;
}

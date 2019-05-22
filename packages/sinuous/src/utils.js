/**
 * Assign properties from `props` to `obj`.
 * @param {Object} obj - The object to copy properties to.
 * @param {Object} props - The object to copy properties from.
 * @return {Object}
 */
export function assign(obj, props) {
  for (let i in props) obj[i] = props[i];
  return obj;
}

export function normalizeIncomingArray(normalized, array) {
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i];
    if (item instanceof Node) {
      // DocumentFragment
      if (item.nodeType === 11) {
        normalizeIncomingArray(normalized, item.childNodes);
      } else {
        normalized.push(item);
      }
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

export function clearAll(parent, current, marker, startNode) {
  if (!marker) return (parent.textContent = '');
  if (Array.isArray(current)) {
    current.forEach(node => {
      parent.removeChild(node);
    });
  } else if (current != null && current != '') {
    if (startNode) {
      let node = marker.previousSibling;
      let tmp;
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

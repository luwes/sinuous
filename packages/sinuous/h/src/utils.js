export function normalizeArray(normalized, array) {
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i];
    if (item instanceof Node) {
      // DocumentFragment
      if (item.nodeType === 11) {
        normalizeArray(normalized, item.childNodes);
      } else {
        normalized.push(item);
      }
      // matches null, undefined, true or false
    } else if (item == null || item === false || item === true) {
      // skip
    } else if (Array.isArray(item)) {
      normalizeArray(normalized, item);
    } else {
      normalized.push(document.createTextNode('' + item));
    }
  }
  return normalized;
}

/**
 * Clear all nodes in the parent.
 * @param  {Node} parent
 * @param  {*} current
 * @param  {Node} marker - This is the end node.
 * @param  {Node} startNode - This is the start node.
 */
export function clearAll(parent, current, marker, startNode) {
  if (marker) {
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
  } else {
    parent.textContent = '';
  }
}

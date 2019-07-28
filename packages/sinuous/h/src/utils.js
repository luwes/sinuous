import { GROUPING } from './constants.js';

/**
 * Clear all nodes in the parent.
 * @param  {Node} parent
 * @param  {*} current
 * @param  {Node} marker - This is the ending marker node.
 * @param  {Node} startNode - This is the start node.
 */
export function clearAll(parent, current, marker, startNode) {
  if (marker) {
    // `current` can't be `0`, it's coerced to a string in insert.
    if (current) {
      if (!startNode) {
        startNode = marker.previousSibling || parent.lastChild;
        // Support fragments
        const key = startNode[GROUPING];
        if (key) {
          startNode = startNode.previousSibling;
          while (startNode && startNode[GROUPING] !== key) {
            startNode = startNode.previousSibling;
          }
        }
      }
      let tmp;
      while (startNode && startNode !== marker) {
        tmp = startNode.nextSibling;
        parent.removeChild(startNode);
        startNode[GROUPING] = 0;
        startNode = tmp;
      }
    }
  } else {
    parent.textContent = '';
  }
}

import { BACKWARD, GROUPING } from './constants.js';

/**
 * Clear all nodes in the parent.
 * @param  {Node} parent
 * @param  {*} current
 * @param  {Node} marker - This is the ending marker node.
 * @param  {Node} startNode - This is the start node.
 */
export function clearAll(parent, current, marker, startNode) {
  if (marker) {
    if (current !== '' && current != null) {
      if (!startNode) {
        startNode = marker.previousSibling || parent.lastChild;
        // Support fragments
        const key = startNode[GROUPING];
        if (key) {
          startNode = startNode[BACKWARD];
          while (startNode && startNode[GROUPING] !== key) {
            startNode = startNode[BACKWARD];
          }
        }
      }
      let tmp;
      while (startNode && startNode !== marker) {
        tmp = startNode.nextSibling;
        parent.removeChild(startNode);
        startNode = tmp;
      }
    }
  } else {
    parent.textContent = '';
  }
}

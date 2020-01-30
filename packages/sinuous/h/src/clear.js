import { GROUPING } from './constants.js';

/**
 * Clear all nodes in the parent.
 * @param  {Node} parent
 * @param  {*} current
 * @param  {Node} endMark - This is the ending marker node.
 * @param  {Node} startNode - This is the start node.
 */
export function clear(parent, current, endMark, startNode) {
  if (endMark) {
    // `current` can't be `0`, it's coerced to a string in insert.
    if (current) {
      if (!startNode) {
        startNode = endMark.previousSibling || parent.lastChild;
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
      while (startNode && startNode !== endMark) {
        tmp = startNode.nextSibling;
        // Is needed in case the child was pulled out the parent before clearing.
        if (parent === startNode.parentNode) {
          parent.removeChild(startNode);
          startNode[GROUPING] = 0;
        }
        startNode = tmp;
      }
    }
  } else {
    parent.textContent = '';
  }
}

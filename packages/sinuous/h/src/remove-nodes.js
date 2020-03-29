/**
 * Removes nodes, starting from `startNode` (inclusive) to `endMark` (exclusive).
 *
 * @param  {Node} parent
 * @param  {Node} startNode - This is the start node.
 * @param  {Node} endMark - This is the ending marker node.
 */
export function removeNodes(parent, startNode, endMark) {
  while (startNode && startNode !== endMark) {
    const n = startNode.nextSibling;
    // Is needed in case the child was pulled out the parent before clearing.
    if (parent === startNode.parentNode) {
      parent.removeChild(startNode);
    }
    startNode = n;
  }
}

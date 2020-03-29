import { castNode } from './cast-node.js';
import { frag } from './frag.js';

/**
 * Add a string or node before a reference node or at the end.
 *
 * @param {Node} parent
 * @param {Node|string} value
 * @param {Node} [endMark]
 * @return {Node}
 */
export function add(parent, value, endMark) {
  value = castNode(value);

  const fragOrNode = frag(value) || value;

  // If endMark is `null`, value will be added to the end of the list.
  parent.insertBefore(value, endMark && endMark.parentNode && endMark);

  return fragOrNode;
}

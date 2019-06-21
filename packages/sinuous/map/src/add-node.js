import { GROUPING } from './map.js';
import { normalizeIncomingArray } from './utils.js';

export default function addNode(parent, node, afterNode, counter) {
  if (Array.isArray(node)) {
    node = normalizeIncomingArray([], node);

    if (!node.length) return;

    let mark = node[0];
    if (node.length !== 1) {
      mark[GROUPING] = node[node.length - 1][GROUPING] = counter;
    }
    for (let i = 0; i < node.length; i++) {
      afterNode
        ? parent.insertBefore(node[i], afterNode)
        : parent.appendChild(node[i]);
    }
    return mark;
  }

  let mark;
  const t = typeof node;
  if (t === 'string' || t === 'number') {
    node = document.createTextNode(node);
  } else if (
    node.nodeType === 11 &&
    (mark = node.firstChild) &&
    mark !== node.lastChild
  ) {
    mark[GROUPING] = node.lastChild[GROUPING] = counter;
  }
  afterNode ? parent.insertBefore(node, afterNode) : parent.appendChild(node);
  return mark || node;
}

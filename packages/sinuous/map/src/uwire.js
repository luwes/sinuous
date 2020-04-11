/* Adapted from µdomdiff (https://github.com/WebReflection/udomdiff)
  ISC License - Andrea Giammarchi */
import { api } from 'sinuous';

const nodeType = 111;

export const diffable = (node, operation) =>
  node.nodeType === nodeType
    ? 1 / operation < 0
      ? operation
        ? api.rm(
            node._firstChild.parentNode,
            node._firstChild.nextSibling,
            node._lastChild.nextSibling
          ) || node._firstChild
        : node._lastChild
      : operation
      ? node._valueOf()
      : node._firstChild
    : node;

export const persistent = (fragment) => {
  const { childNodes } = fragment;
  const { length } = childNodes;
  // If the fragment has no content
  // it should return undefined and break
  if (length < 2) return childNodes[0];
  const nodes = Array.from(childNodes);
  const _firstChild = nodes[0];
  const _lastChild = nodes[length - 1];
  return {
    nodeType,
    _firstChild,
    _lastChild,
    _valueOf() {
      if (childNodes.length !== length) {
        let i = 0;
        while (i < length) fragment.appendChild(nodes[i++]);
      }
      return fragment;
    },
  };
};

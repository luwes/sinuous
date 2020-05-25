import { api } from './api.js';

const EMPTY_ARR = [];

/**
 * @type {(value: *) => Text | Node}
 */
const castNode = (value) => {
  if (typeof value === 'string') {
    return document.createTextNode(value);
  }
  if (!(value instanceof Node)) {
    // Passing an empty array creates a DocumentFragment.
    return api.h(EMPTY_ARR, value);
  }
  return value;
};

/**
 * @typedef {ChildNode | { _startMark: Node }} Frag
 * @type {(value: Node | DocumentFragment) => Frag?}
 */
const frag = (value) => {
  const { childNodes } = value;
  if (!childNodes || value.nodeType !== 11) return;
  if (childNodes.length < 2) return childNodes[0];
  // For a fragment of 2 elements or more add a startMark. This is required for
  // multiple nested conditional computeds that return fragments.
  return { _startMark: api.add(value, '', childNodes[0]) };
};

/**
 * Add a string or node before a reference node or at the end.
 * @typedef {(parent: Node, value: Node | string, endMark?: Node) => Node | Frag} hAdd
 * @type {hAdd}
 */
export const add = (parent, value, endMark) => {
  value = castNode(value);
  const fragOrNode = frag(value) || value;

  // If endMark is `null`, value will be added to the end of the list.
  parent.insertBefore(value, endMark && endMark.parentNode && endMark);
  return fragOrNode;
};

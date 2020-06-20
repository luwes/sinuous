import { api } from './api.js';

/** @type {[]} Instead of `any[]` */
const EMPTY_ARR = [];

/** @type {(value: *) => Text | Node | DocumentFragment} */
const castNode = (value) => {
  if (typeof value === 'string') {
    return document.createTextNode(value);
  }
  // Note that a DocumentFragment is an instance of Node
  if (!(value instanceof Node)) {
    // Passing an empty array creates a DocumentFragment
    // Note this means api.add is not purely a subcall of api.h; it can nest
    return api.h(EMPTY_ARR, value);
  }
  return value;
};

/**
 * @typedef {{ _startMark: Text }} Frag
 * @type {(value: Text | Node | DocumentFragment) => (Node | Frag)?}
 */
const frag = (value) => {
  const { childNodes } = value;
  if (!childNodes || value.nodeType !== 11) return;
  if (childNodes.length < 2) return childNodes[0];
  // For a fragment of 2 elements or more add a startMark. This is required for
  // multiple nested conditional computeds that return fragments.

  // It looks recursive here but the next call's fragOrNode is only Text('')
  return { _startMark: /** @type {Text} */ (api.add(value, '', childNodes[0])) };
};

/**
 * Add a string or node before a reference node or at the end.
 * @typedef {Node | string | number} Value
 * @typedef {(parent: Node, value: Value | Value[], endMark: Node?) => Node | Frag} hAdd
 * @type {hAdd}
 */
export const add = (parent, value, endMark) => {
  value = castNode(value);
  const fragOrNode = frag(value) || value;

  // If endMark is `null`, value will be added to the end of the list.
  parent.insertBefore(value, endMark && endMark.parentNode && endMark);
  return fragOrNode;
};

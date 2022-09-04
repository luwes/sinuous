import { api } from './api.js';

/**
 * @typedef {import('./add.js').Frag} Frag
 * @typedef {(el: Node, value: *, endMark: Node?, current: (Node | Frag)?,
 * startNode: Node?) => Node | Frag } hInsert
 * @type {hInsert}
 */
export const insert = (el, value, endMark, current, startNode) => {
  // This is needed if the el is a DocumentFragment initially.
  el = (endMark && endMark.parentNode) || el;

  // Save startNode of current. In clear() endMark.previousSibling is not always
  // accurate if content gets pulled before clearing.
  startNode = startNode || current instanceof Node && current;

  // @ts-ignore Allow empty if statement
  if (value === current);
  else if (
    (!current || typeof current === 'string')
    // @ts-ignore Doesn't like `value += ''`
    // eslint-disable-next-line no-implicit-coercion
    && (typeof value === 'string' || (typeof value === 'number' && (value += '')))
  ) {
    // Block optimized for string insertion.
    // eslint-disable-next-line eqeqeq
    if (current == null || !el.firstChild) {
      if (endMark) {
        api.add(el, value, endMark);
      } else {
        // Using textContent is a lot faster than append -> createTextNode.
        el.textContent = /** @type {string} See `value += '' */ (value);
      }
    } else {
      if (endMark) {
        (endMark.previousSibling || el.lastChild).data = value;
      } else {
        el.firstChild.data = value;
      }
    }
    current = value;
  } else if (typeof value === 'function') {
    api.subscribe(() => {
      current = api.insert(el, value.call({ el, endMark }), endMark, current, startNode);
    });
  } else {
    // Block for nodes, fragments, Arrays, non-stringables and node -> stringable.
    if (endMark) {
      // `current` can't be `0`, it's coerced to a string in insert.
      if (current) {
        if (!startNode) {
          // Support fragments
          startNode = (current._startMark && current._startMark.nextSibling)
            || endMark.previousSibling;
        }
        api.rm(el, startNode, endMark);
      }
    } else {
      el.textContent = '';
    }
    current = null;

    if (value && value !== true) {
      current = api.add(el, value, endMark);
    }
  }

  return current;
};

/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { api } from './api.js';

/**
 * Sinuous `h` tag aka hyperscript.
 * @typedef {HTMLElement | SVGElement | DocumentFragment} DOM
 * @typedef {(tag: string? | [], props: object?, ...children: Node | *) => DOM} hTag
 * @type {hTag}
 */

export const h = (...args) => {
  let el;
  const item = (/** @type {*} */ arg) => {
    // @ts-ignore Allow empty if
    // eslint-disable-next-line eqeqeq
    if (arg == null);
    else if (typeof arg === 'string') {
      if (el) {
        api.add(el, arg);
      } else {
        el = api.s
          ? document.createElementNS('http://www.w3.org/2000/svg', arg)
          : document.createElement(arg);
      }
    } else if (Array.isArray(arg)) {
      // Support Fragments
      if (!el) el = document.createDocumentFragment();
      arg.forEach(item);
    } else if (arg instanceof Node) {
      if (el) {
        api.add(el, arg);
      } else {
        // Support updates
        el = arg;
      }
    } else if (typeof arg === 'object') {
      // @ts-ignore 0 | 1 is a boolean but can't type cast; they don't overlap
      api.property(el, arg, null, api.s);
    } else if (typeof arg === 'function') {
      if (el) {
        // See note in add.js#frag() - This is a Text('') node
        const endMark = /** @type {Text} */ (api.add(el, ''));
        api.insert(el, arg, endMark);
      } else {
        // Support Components
        el = arg.apply(null, args.splice(1));
      }
    } else {
      // eslint-disable-next-line no-implicit-coercion,prefer-template
      api.add(el, '' + arg);
    }
  };
  args.forEach(item);
  return el;
};

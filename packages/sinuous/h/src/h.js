/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { api } from './api.js';

/**
 * Sinuous `h` tag aka hyperscript.
 * @return {Function} `h` tag.
 */
export const h = (...args) => {
  let el;
  function item(arg) {
    // @ts-ignore
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
      api.property(el, arg, null, api.s);
    } else if (typeof arg === 'function') {
      if (el) {
        const endMark = api.add(el, '');
        api.insert(el, arg, endMark);
      } else {
        // Support Components
        el = arg.apply(null, args.splice(1));
      }
    } else {
      api.add(el, '' + arg);
    }
  }
  args.forEach(item);
  return el;
}

/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { api } from './api.js';

/**
 * Create a sinuous `h` tag aka hyperscript.
 * @param {object} options
 * @param  {boolean} isSvg
 * @return {Function} `h` tag.
 */
export function context(options, isSvg) {
  for (let i in options) api[i] = options[i];

  function h() {
    const args = Array.from(arguments);
    let el;

    function item(arg) {
      if (arg == null);
      else if (typeof arg === 'string') {
        if (el) {
          api.add(el, arg);
        } else {
          if (isSvg) {
            el = document.createElementNS('http://www.w3.org/2000/svg', arg);
          } else {
            el = document.createElement(arg);
          }
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
        api.property(el, arg, null, isSvg);
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

  return h;
}

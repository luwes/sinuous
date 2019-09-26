/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { api } from './api.js';
import { EMPTY_ARR } from './constants.js';
import { insert } from './insert.js';
import { property } from './property.js';

/**
 * Create a sinuous `h` tag aka hyperscript.
 * @param {object} options
 * @param  {boolean} isSvg
 * @return {Function} `h` tag.
 */
export function context(options, isSvg) {
  for (let i in options) api[i] = options[i];

  function h() {
    const args = EMPTY_ARR.slice.call(arguments);
    let el;

    function item(arg) {
      const type = typeof arg;
      if (arg == null);
      else if (type === 'string') {
        if (el) {
          el.appendChild(document.createTextNode(arg));
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
          el.appendChild(arg);
        } else {
          // Support updates
          el = arg;
        }
      } else if (type === 'object') {
        property(null, arg, el, isSvg);
      } else if (type === 'function') {
        if (el) {
          const marker = el.appendChild(document.createTextNode(''));
          if (arg.$t) {
            // Record insert action in template, marker is used as pre-fill.
            arg.$t(1, insert, el, '');
          } else {
            insert(el, arg, marker);
          }
        } else {
          // Support Components
          el = arg.apply(null, args.splice(1));
        }
      } else {
        el.appendChild(document.createTextNode('' + arg));
      }
    }

    args.forEach(item);
    return el;
  }

  api.insert = insert;
  api.property = property;
  api.h = h;

  return h;
}

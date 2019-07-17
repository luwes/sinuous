/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { EMPTY_ARR } from './constants.js';
import { insert } from './insert.js';

/**
 * Create a sinuous `h` tag aka hyperscript.
 * @param  {object} api
 * @param {Function} [api.subscribe] - Function that listens to state changes.
 * @param {Function} [api.cleanup] - Add the given function to the cleanup stack.
 * @param  {boolean} isSvg
 * @return {Function} `h` tag.
 */
export function context(api, isSvg) {
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
        for (let name in arg) {
          // Create scope for every entry.
          property(name, arg[name], api, el, isSvg);
        }
      } else if (type === 'function') {
        if (el) {
          const marker = el.appendChild(document.createTextNode(''));
          if (arg.$f) {
            // Support flow control
            arg(api, el, marker);
          } else if (arg.$t) {
            // Record insert action in template, marker is used as pre-fill.
            arg.$t(1, api, insert, el, '');
          } else {
            insert(api, el, arg, marker);
          }
        } else {
          // Support Components
          el = arg.apply(null, args.splice(0));
        }
      } else {
        el.appendChild(document.createTextNode('' + arg));
      }
    }

    while (args.length) {
      item(args.shift());
    }
    return el;
  }

  return h;
}

export function property(name, value, api, el, isSvg, isCss) {
  if (name[0] === 'o' && name[1] === 'n' && !value.$o) {
    // Functions added as event handlers are not executed
    // on render unless they have an observable indicator.
    handleEvent(api, el, name, value);
  } else if (typeof value === 'function') {
    if (value.$t) {
      // Record property action in template.
      value.$t(2, api, property, el, name);
    } else {
      api.subscribe(() => {
        property(name, value(), api, el, isSvg, isCss);
      });
    }
  } else if (isCss) {
    el.style.setProperty(name, value);
  } else if (
    isSvg ||
    name.slice(0, 5) === 'data-' ||
    name.slice(0, 5) === 'aria-'
  ) {
    el.setAttribute(name, value);
  } else if (name === 'style') {
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else {
      for (name in value) {
        property(name, value[name], api, el, isSvg, true);
      }
    }
  } else if (name === 'attrs') {
    for (name in value) {
      property(name, value[name], api, el, true);
    }
  } else {
    if (name === 'class') name += 'Name';
    el[name] = value;
  }
}

function handleEvent(api, el, name, value) {
  name = name.slice(2);

  const removeListener = api.cleanup(() =>
    el.removeEventListener(name, eventProxy)
  );

  if (value) {
    el.addEventListener(name, eventProxy);
  } else {
    removeListener();
  }

  (el._listeners || (el._listeners = {}))[name] = value;
}

/**
 * Proxy an event to hooked event handlers.
 * @param {Event} e - The event object from the browser.
 * @return {Function}
 */
function eventProxy(e) {
  // eslint-disable-next-line
  return this._listeners[e.type](e);
}

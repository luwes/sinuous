/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { EMPTY_ARR } from './constants.js';
import { insert } from './insert.js';
import { assign } from './utils.js';

/**
 * Create a sinuous `h` tag aka hyperscript.
 * @param  {object} api
 * @param {Function} [api.subscribe] - Function that listens to state changes.
 * @param {Function} [api.cleanup] - Add the given function to the cleanup stack.
 * @return {Function} `h` tag.
 */
export function context(api) {
  function h() {
    const args = EMPTY_ARR.slice.call(arguments);
    const multi = isMultiExpression(args);
    let el;

    function item(arg) {
      const type = typeof arg;
      if (arg == null);
      else if (type === 'string') {
        if (el) {
          el.appendChild(document.createTextNode(arg));
        } else {
          el = document.createElement(arg);
        }
      } else if (Array.isArray(arg)) {
        // Support Fragments
        if (!el) el = document.createDocumentFragment();
        if (multi) {
          arg.forEach(item);
        } else {
          insert(h.subscribe, el, arg);
        }
      } else if (arg instanceof Node) {
        if (el) {
          if (multi) {
            insert(
              h.subscribe,
              el,
              arg,
              el.appendChild(document.createTextNode(''))
            );
          } else {
            el.appendChild(arg);
          }
        } else {
          // Support updates
          el = arg;
        }
      } else if (type === 'object') {
        parseNested(h, el, arg, parseKeyValue);
      } else if (type === 'function') {
        if (el) {
          const marker = multi && el.appendChild(document.createTextNode(''));
          if (arg.$f) {
            arg(h, el, marker);
          } else {
            if (arg.$t) {
              const insertAction = createInsertAction(h);
              insertAction(el, '');
              arg.$t(el, insertAction);
            } else {
              insert(h.subscribe, el, arg, marker);
            }
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

  return assign(h, api);
}

export default context();

/**
 * Create an insert action for a `template` tag.
 *
 * Subsequent `insert`'s of strings can be optimized by setting
 * `Text.data` instead of Element.textContent.
 *
 * @param  {Function} h
 * @param  {*} current
 * @return {Function}
 */
function createInsertAction(h, current = '') {
  return (element, value) => {
    current = insert(h.subscribe, element, value, null, current);
  };
}

export function parseNested(h, el, obj, callback) {
  for (let name in obj) {
    // Create scope for every entry.
    const propAction = function(element, value) {
      if (typeof value === 'function') {
        if (name === 'ref') {
          value(el);
        } else {
          if (value.$t) {
            value.$t(element, propAction);
          } else {
            h.subscribe(() =>
              // Functions added as event handlers are not executed on render
              // unless they have an observable indicator.
              callback(
                name,
                name[0] === 'o' && name[1] === 'n' && !value.$o
                  ? value
                  : value(),
                h,
                element
              )
            );
          }
        }
      } else {
        callback(name, value, h, element);
      }
    };
    propAction(el, obj[name]);
  }
}

export function parseKeyValue(name, value, h, el) {
  let prefix;
  if (name === 'class' || name === 'className') {
    el.className = value;
  } else if (
    (prefix = name.slice(0, 5)) &&
    (prefix === 'data-' || prefix === 'aria-')
  ) {
    el.setAttribute(name, value);
  } else if (name[0] === 'o' && name[1] === 'n') {
    handleEvent(h, el, name, value);
  } else if (name === 'style') {
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else {
      parseNested(h, el, value, (n, v) => el.style.setProperty(n, v));
    }
  } else if (name === 'attrs') {
    parseNested(h, el, value, (n, v) => el.setAttribute(n, v));
  } else {
    el[name] = value;
  }
}

export function isMultiExpression(item) {
  return Array.isArray(item)
    ? item.some(isMultiExpression)
    : typeof item === 'function';
}

function handleEvent(h, el, name, value) {
  const kLower = name.toLowerCase();
  name = (kLower in el ? kLower : name).slice(2);

  const removeListener = h.cleanup(() =>
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

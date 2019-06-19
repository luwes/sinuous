/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { EMPTY_ARR } from './constants.js';
import { insert } from './insert.js';
import { assign } from './utils.js';

/**
 * Create a sinuous `h` tag aka hyperscript.
 * @param  {object} api
 * @param {Function} [api.subscribe] - Function that listens to state changes.
 * @return {Function} `h` tag.
 */
export function context(api = {}) {
  api = assign(
    {
      bindings: {},
      cleanUp,
      context,
      insert,
      cleanup
    },
    api
  );

  let cleanups = [];

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
          el = parseClass(arg);
        }
      } else if (
        type === 'number' ||
        type === 'boolean' ||
        arg instanceof Date ||
        arg instanceof RegExp
      ) {
        el.appendChild(document.createTextNode('' + arg));
      } else {
        // Subscribe w/ root or parent is preferred. They take care of the cleanup.
        const subscribe = h.root
          ? h.subscribe
          : // Support observable libraries w/ simple subscribe/unsubscribe.
            fn => h.cleanup((h.subscribe || arg)(fn));

        if (Array.isArray(arg)) {
          // Support Fragments
          if (!el) el = document.createDocumentFragment();
          if (multi) {
            arg.forEach(item);
          } else {
            h.insert(subscribe, el, arg);
          }
        } else if (arg instanceof Node) {
          if (el) {
            if (multi) {
              const marker = el.appendChild(document.createTextNode(''));
              h.insert(subscribe, el, arg, marker);
            } else {
              el.appendChild(arg);
            }
          } else {
            // Support updates
            el = arg;
          }
        } else if (type === 'object') {
          const ref = (n, value) => value(el);
          parseNested(h, el, arg, parseKeyValue, { ref });
        } else if (type === 'function') {
          if (el) {
            const marker = multi
              ? el.appendChild(document.createTextNode(''))
              : undefined;
            if (arg.flow) {
              arg(h, el, marker);
            } else {
              if (arg.$) {
                arg.$(el, h.insert.bind(h, subscribe));
              } else {
                h.insert(subscribe, el, arg, marker);
              }
            }
          } else {
            // Support Components
            el = arg.apply(null, args.splice(0));
          }
        }
      }
    }

    while (args.length) {
      item(args.shift());
    }
    return el;
  }

  function cleanup(fn) {
    fn && cleanups.push(fn);
    return fn;
  }

  function cleanUp() {
    cleanups.map(fn => fn());
    cleanups = [];
  }

  return assign(h, api);
}

export default context();

export function parseNested(h, el, obj, callback, exception = {}) {
  for (let name in obj) {
    const val = obj[name];
    // Create scope for every entry.
    const propAction = function(element, value) {
      if (typeof value === 'function') {
        if (exception[name]) {
          exception[name](name, value);
        } else {
          if (value.$) {
            value.$(element, propAction);
          } else {
            const subscribe = h.root
              ? h.subscribe
              : fn => h.cleanup((h.subscribe || value)(fn));
            subscribe(() => callback(name, value(), h, element));
          }
        }
      } else {
        callback(name, value, h, element);
      }
    };
    propAction(el, val);
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
  } else if (name === 'events') {
    parseNested(h, el, value, (n, v) => handleEvent(h, el, 'on' + n, v));
  } else if (name === 'style') {
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else {
      parseNested(h, el, value, (n, v) => el.style.setProperty(n, v));
    }
  } else if (name === 'classList') {
    parseNested(h, el, value, (n, v) => el.classList.toggle(n, v));
  } else if (name === 'attrs') {
    parseNested(h, el, value, (n, v) => el.setAttribute(n, v));
  } else if (name[0] === '$') {
    h.bindings[name.slice(1)](el, value);
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
  const useCapture = name !== (name = name.replace(/Capture$/, ''));
  const kLower = name.toLowerCase();
  name = (kLower in el ? kLower : name).slice(2);

  const cleanup = h.cleanup(() =>
    el.removeEventListener(name, eventProxy, useCapture)
  );

  if (value) el.addEventListener(name, eventProxy, useCapture);
  else cleanup();

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

export function parseClass(string) {
  let el;
  // Our minimal parser doesn’t understand escaping CSS special
  // characters like `#`. Don’t use them. More reading:
  // https://mathiasbynens.be/notes/css-escapes .
  const m = string.split(/([.#]?[^\s#.]+)/);
  if (m[1][0] === '.' || m[1][0] === '#') {
    el = document.createElement('div');
  }

  for (let i = 0; i < m.length; i++) {
    const v = m[i];
    const s = v.slice(1);
    if (!v) continue;
    if (!el) el = document.createElement(v);
    else if (v[0] === '.') el.classList.add(s);
    else if (v[0] === '#') el.setAttribute('id', s);
  }

  return el;
}

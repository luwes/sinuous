/* Adapted from Hyper DOM Expressions - The MIT License - Ryan Carniato */
import { assign } from './utils.js';

export function context(options) {
  options = assign(
    {
      bindings: {},
      _addCleanup,
      cleanup,
      context
    },
    options
  );

  let cleanups = [];

  function h() {
    const args = [].slice.call(arguments);
    const multi = isMultiExpression(args);
    let el;

    function item(arg) {
      const type = typeof arg;
      const insertWrap = fn => h._addCleanup((h.wrap || arg)(fn));
      if (arg == null);
      else if (type === 'string') {
        if (el) el.appendChild(document.createTextNode(arg));
        else el = parseClass(arg);
      } else if (
        type === 'number' ||
        type === 'boolean' ||
        arg instanceof Date ||
        arg instanceof RegExp
      ) {
        el.appendChild(document.createTextNode(arg.toString()));
      } else if (Array.isArray(arg)) {
        // Support Fragments
        if (!el) el = document.createDocumentFragment();
        if (multi) {
          arg.forEach(item);
        } else {
          h.insert(insertWrap, el, arg);
        }
      } else if (arg instanceof Node) {
        if (multi) {
          const node = el.appendChild(document.createTextNode(''));
          h.insert(insertWrap, el, arg, undefined, node);
        } else {
          el.appendChild(arg);
        }
      } else if (type === 'object') {
        const ref = (n, value) => value(el);
        parseNested(h, el, arg, parseKeyValue, { ref });
      } else if (type === 'function') {
        const node = multi
          ? el.appendChild(document.createTextNode(''))
          : undefined;
        if (arg.flow) {
          arg(insertWrap, h.sample, el, node);
        } else {
          h.insert(insertWrap, el, arg, undefined, node);
        }
      }
    }

    while (args.length) {
      item(args.shift());
    }
    return el;
  }

  function _addCleanup(fn) {
    fn && cleanups.push(fn);
    return fn;
  }

  function cleanup() {
    cleanups.map(fn => fn());
    cleanups = [];
  }

  return assign(h, options);
}

export default context();

export function parseNested(h, el, obj, callback, exception = {}) {
  // Create scope for every entry.
  Object.keys(obj).map(name => {
    const value = obj[name];
    if (typeof value === 'function') {
      if (exception[name]) {
        exception[name](name, value);
      } else {
        h._addCleanup((h.wrap || value)(() => callback(name, value(), h, el)));
      }
    } else {
      callback(name, value, h, el);
    }
  });
}

export function parseKeyValue(name, value, h, el) {
  if (name[0] === 'o' && name[1] === 'n') {
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
  } else if (name.substr(0, 5) === 'data-') {
    el.setAttribute(name, value);
  } else if (name[0] === '$') {
    h.bindings[name.slice(1)](el, value);
  } else {
    if (name === 'class' || name === 'className') name = 'className';
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
  name = (kLower in el ? kLower : name).substring(2);

  const cleanup = h._addCleanup(() =>
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
  if (/^\.|#/.test(m[1])) {
    el = document.createElement('div');
  }

  m.forEach(v => {
    const s = v.substring(1, v.length);
    if (!v) return;
    if (!el) el = document.createElement(v);
    else if (v[0] === '.') el.classList.add(s);
    else if (v[0] === '#') el.setAttribute('id', s);
  });

  return el;
}

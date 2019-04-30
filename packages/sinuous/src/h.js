// Inspired by https://github.com/ryansolid/babel-plugin-jsx-dom-expressions
export function context(options) {
  options = assign({ bindings: {} }, options);

  function h() {
    const args = [].slice.call(arguments);
    const multi = isMultiExpression(args);
    let el;

    function item(arg) {
      const type = typeof arg;
      if (arg == null);
      else if (type === 'string') {
        if (!el) el = parseClass(arg);
        else el.appendChild(document.createTextNode(arg));
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
          h.insert(h.wrap || arg, el, arg);
        }
      } else if (arg instanceof Node) {
        if (multi) {
          const node = el.appendChild(document.createTextNode(''));
          h.insert(h.wrap || arg, el, arg, undefined, node);
        } else {
          el.appendChild(arg);
        }
      } else if (type === 'object') {
        for (let key in arg) {
          const value = arg[key];
          if (typeof value === 'function') {
            if (key === 'ref') {
              value(el);
            } else {
              (function(k, v) {
                (h.wrap || v)(() => parseKeyValue(h, el, k, v()));
              })(key, value);
            }
          } else {
            parseKeyValue(h, el, key, value);
          }
        }
      } else if (typeof arg === 'function') {
        let node = multi ? el.appendChild(document.createTextNode('')) : undefined;
        h.insert(h.wrap || arg, el, arg, undefined, node);
      }
    }

    while (args.length) {
      item(args.shift());
    }
    return el;
  }

  return assign(h, options);
}

const h = context();
h.context = context;
export default h;

export function isMultiExpression(item) {
  return Array.isArray(item) ?
    item.some(isMultiExpression) :
    typeof item === 'function';
}

/**
 * Assign properties from `props` to `obj`
 * @template O, P The obj and props types
 * @param {O} obj The object to copy properties to
 * @param {P} props The object to copy properties from
 * @returns {O & P}
 */
export function assign(obj, props) {
  for (let i in props) obj[i] = props[i];
  return obj;
}

function handleEvent(el, key, value) {
  let useCapture = key !== (key = key.replace(/Capture$/, ''));
  let kLower = key.toLowerCase();
  key = (kLower in el ? kLower : key).substring(2);

  if (value) el.addEventListener(key, eventProxy, useCapture);
  else el.removeEventListener(key, eventProxy, useCapture);

  (el._listeners || (el._listeners = {}))[key] = value;
}

/**
 * Proxy an event to hooked event handlers
 * @param {Event} e The event object from the browser
 * @private
 */
function eventProxy(e) {
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

  m.forEach((v) => {
    const s = v.substring(1, v.length);
    if (!v) return;
    if (!el) el = document.createElement(v);
    else if (v[0] === '.') el.classList.add(s);
    else if (v[0] === '#') el.setAttribute('id', s);
  });

  return el;
}

export function parseKeyValue(h, el, key, value) {
  if (key[0] === 'o' && key[1] === 'n') {
    handleEvent(el, key, value);
  } else if (key === 'events') {
    parseNested(h, value, (n, v) => handleEvent(el, 'on' + n, v));
  } else if (key === 'style') {
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else {
      parseNested(h, value, (n, v) => el.style.setProperty(n, v));
    }
  } else if (key === 'classList') {
    parseNested(h, value, (n, v) => el.classList.toggle(n, v));
  } else if (key === 'attrs') {
    parseNested(h, value, (n, v) => el.setAttribute(n, v));
  } else if (key.substr(0, 5) === 'data-') {
    el.setAttribute(key, value);
  } else if (key[0] === '$') {
    h.bindings[key.slice(1)](el, value);
  } else {
    el[key] = value;
  }
}

export function parseNested(h, obj, callback) {
  for (const name in obj) {
    const value = obj[name];
    if (typeof value === 'function') {
      (function(n, v) {
        (h.wrap || v)(() => callback(n, v()));
      })(name, value);
    } else {
      callback(name, value);
    }
  }
}

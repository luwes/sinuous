// Inspired by https://github.com/ryansolid/babel-plugin-jsx-dom-expressions
export function context(options) {

  function h() {
    const args = [].slice.call(arguments);
    let el;

    function item(arg) {
      const type = typeof arg;
      if (arg == null);
      else if ('string' === type) {
        if (!el) el = parseClass(arg);
        else el.appendChild(document.createTextNode(arg));
      } else if (
        'number' === type ||
        'boolean' === type ||
        arg instanceof Date ||
        arg instanceof RegExp
      ) {
        el.appendChild(document.createTextNode(arg.toString()));
      } else if (Array.isArray(arg)) {
        // Support Fragments
        if (!el) el = document.createDocumentFragment();
        const multi = args.some((i) => typeof i === 'function');
        if (multi) {
          arg.forEach((item) => {
            const n = el.appendChild(document.createTextNode(''));
            options.insert(el, item, undefined, n);
          });
        } else {
          options.insert(el, arg);
        }
      } else if (arg instanceof Node) {
        el.appendChild(arg);
      } else if ('object' === type) {
        for (let k in arg) {
          const v = arg[k];
          if ('function' === typeof v) {
            // Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
            if (k[0] === 'o' && k[1] === 'n') {
              let useCapture = k !== (k = k.replace(/Capture$/, ''));
              let kLower = k.toLowerCase();
              k = (kLower in el ? kLower : k).substring(2);
              if (v) el.addEventListener(k, eventProxy, useCapture);
              else el.removeEventListener(k, eventProxy, useCapture);
              (el._listeners || (el._listeners = {}))[k] = v;
            } else if (k === 'ref') {
              v(el);
            } else if (k[0] === '$') {
              options.bindings[k.slice(1)](el, v);
            } else {
              (function(k, v) {
                options.wrap(() => parseKeyValue(el, k, v()));
              })(k, v);
            }
          } else {
            parseKeyValue(el, k, v);
          }
        }
      } else if ('function' === typeof arg) {
        options.insert(el, arg);
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
export default h;

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

export function parseKeyValue(el, key, value) {
  if (key === 'style') {
    if ('string' === typeof value) {
      el.style.cssText = value;
    } else {
      for (const s in value) {
        el.style.setProperty(s, value[s]);
      }
    }
  } else if (key === 'classList') {
    for (const c in value) {
      el.classList.toggle(c, value[c]);
    }
  } else if (key === 'events') {
    for (const c in value) {
      el.addEventListener(c, value[c]);
    }
  } else if (key === 'attrs') {
    for (const a in value) {
      el.setAttribute(a, value[a]);
    }
  } else if (key.substr(0, 5) === 'data-') {
    el.setAttribute(key, value[key]);
  } else {
    el[key] = value;
  }
}

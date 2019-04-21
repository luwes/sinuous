// Inspired by https://github.com/ryansolid/babel-plugin-jsx-dom-expressions
const bindings = {};

export default function h() {
  const wrap = this;
  let args = [].slice.call(arguments),
    e = null;
  function item(l) {
    const type = typeof l;
    if (l == null);
    else if ('string' === type) {
      if (!e) parseClass(l);
      else e.appendChild(document.createTextNode(l));
    } else if (
      'number' === type ||
      'boolean' === type ||
      l instanceof Date ||
      l instanceof RegExp
    ) {
      e.appendChild(document.createTextNode(l.toString()));
    } else if (Array.isArray(l)) {
      // Support Fragments
      if (!e) e = document.createDocumentFragment();
      let multi = false;
      for (let i = 0; i < l.length; i++) {
        if (typeof l[i] === 'function') {
          multi = true;
          break;
        }
      }
      if (multi) {
        for (let i = 0; i < l.length; i++) {
          const item = l[i];
          const n = e.appendChild(document.createTextNode(''));
          insert(e, item, undefined, n);
        }
      } else insert(e, l);
    } else if (l instanceof Node) e.appendChild(l);
    else if ('object' === type) {
      for (let k in l) {
        const v = l[k];
        if ('function' === typeof v) {
          // Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
          if (k[0]==='o' && k[1]==='n') {
            let useCapture = k !== (k=k.replace(/Capture$/, ''));
            let kLower = k.toLowerCase();
            k = (kLower in e ? kLower : k).substring(2);
            if (v) e.addEventListener(k, eventProxy, useCapture);
            else e.removeEventListener(k, eventProxy, useCapture);
            (e._listeners || (e._listeners = {}))[k] = v;
          } else if (k === 'ref') {
            v(e);
          } else if (k[0] === '$') {
            bindings[k.slice(1)](e, v);
          } else
            (function(k, v) {
              wrap(() => parseKeyValue(k, v()));
            })(k, v);
        } else parseKeyValue(k, v);
      }
    } else if ('function' === typeof l) {
      insert(e, l);
    }
  }

  while (args.length) item(args.shift());
  return e;

  /**
   * Proxy an event to hooked event handlers
   * @param {Event} e The event object from the browser
   * @private
   */
  function eventProxy(e) {
    return this._listeners[e.type](e);
  }

  function parseClass(string) {
    // Our minimal parser doesn’t understand escaping CSS special
    // characters like `#`. Don’t use them. More reading:
    // https://mathiasbynens.be/notes/css-escapes .
    const m = string.split(/([.#]?[^\s#.]+)/);
    if (/^\.|#/.test(m[1])) e = document.createElement('div');
    for (let i = 0; i < m.length; i++) {
      const v = m[i],
        s = v.substring(1, v.length);
      if (!v) continue;
      if (!e) e = document.createElement(v);
      else if (v[0] === '.') e.classList.add(s);
      else if (v[0] === '#') e.setAttribute('id', s);
    }
  }

  function parseKeyValue(k, v) {
    if (k === 'style') {
      if ('string' === typeof v) e.style.cssText = v;
      else {
        for (const s in v) e.style.setProperty(s, v[s]);
      }
    } else if (k === 'classList') {
      for (const c in v) e.classList.toggle(c, v[c]);
    } else if (k === 'events') {
      for (const c in v) e.addEventListener(c, v[c]);
    } else if (k === 'attrs') {
      for (const a in v) e.setAttribute(a, v[a]);
    } else e[k] = v;
  }

  function insert(parent, accessor, init, marker) {
    if (typeof accessor !== 'function') return insertExpression(parent, accessor, init, marker);
    wrap((current = init) => insertExpression(parent, accessor(), current, marker));
  }

  function insertExpression(parent, value, current, marker) {
    if (value === current) return current;
    parent = (marker && marker.parentNode) || parent;
    const t = typeof value;
    if (t === 'string' || t === 'number') {
      if (t === 'number') value = value.toString();
      if (marker) {
        if (value === '') clearAll(parent, current, marker);
        else if (current !== '' && typeof current === 'string') {
          marker.previousSibling.data = value;
        } else {
          const node = document.createTextNode(value);
          if (current !== '' && current != null) {
            parent.replaceChild(node, marker.previousSibling);
          } else parent.insertBefore(node, marker);
        }
        current = value;
      } else {
        if (current !== '' && typeof current === 'string') {
          current = parent.firstChild.data = value;
        } else current = parent.textContent = value;
      }
    } else if (value == null || t === 'boolean') {
      current = clearAll(parent, current, marker);
    } else if (t === 'function') {
      wrap(function() { current = insertExpression(parent, value(), current, marker); });
    } else if (value instanceof Node) {
      if (Array.isArray(current)) {
        if (current.length === 0) {
          parent.insertBefore(value, marker);
        } else if (current.length === 1) {
          parent.replaceChild(value, current[0]);
        } else {
          clearAll(parent, current, marker);
          parent.appendChild(value);
        }
      } else if (current == null || current === '') {
        parent.insertBefore(value, marker);
      } else {
        parent.replaceChild(value, (marker && marker.previousSibling) || parent.firstChild);
      }
      current = value;
    } else if (Array.isArray(value)) {
      let array = normalizeIncomingArray([], value);
      clearAll(parent, current, marker);
      if (array.length !== 0) {
        for (let i = 0, len = array.length; i < len; i++) {
          parent.insertBefore(array[i], marker);
        }
      }
      current = array;
    } else {
      throw new Error("Expected node, string or array of same.");
    }

    return current;
  }
}

h.registerBinding = (key, fn) => {
  bindings[key] = fn;
};

function clearAll(parent, current, marker, startNode) {
  if (!marker) return parent.textContent = '';
  if (Array.isArray(current)) {
    for (let i = 0; i < current.length; i++) {
      parent.removeChild(current[i]);
    }
  } else if (current != null && current != '') {
    if (startNode !== undefined) {
      let node = marker.previousSibling, tmp;
      while(node !== startNode) {
        tmp = node.previousSibling;
        parent.removeChild(node);
        node = tmp;
      }
    }
    else parent.removeChild(marker.previousSibling);
  }
  return '';
}

function normalizeIncomingArray(normalized, array) {
  for (let i = 0, len = array.length; i < len; i++) {
    const item = array[i];
    if (item instanceof Node) {
      if (item.nodeType === 11) {
        normalizeIncomingArray(normalized, item.childNodes);
      } else normalized.push(item);
    // matches null, undefined, true or false
    } else if (item == null || item === true || item === false) {
      // skip
    } else if (Array.isArray(item)) {
      normalizeIncomingArray(normalized, item);
    } else {
      normalized.push(document.createTextNode(item.toString()));
    }
  }
  return normalized;
}

// Inspired by https://github.com/hyperhype/hyperscript
// Inspired by https://github.com/ryansolid/babel-plugin-jsx-dom-expressions

export function createHyperScript(options) {
  const bindings = {};
  function h() {
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
            options.insert(e, item, undefined, n);
          }
        } else options.insert(e, l);
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
                options.wrap(() => parseKeyValue(k, v()));
              })(k, v);
          } else parseKeyValue(k, v);
        }
      } else if ('function' === typeof l) {
        options.insert(e, l);
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
  }

  h.registerBinding = (key, fn) => {
    bindings[key] = fn;
  };

  return h;
}

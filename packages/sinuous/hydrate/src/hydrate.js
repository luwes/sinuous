import { h, hs, api } from 'sinuous';

export const _ = {};

let isHydrated;

/**
 * Create a sinuous `treeify` function.
 * @param  {boolean} isSvg
 * @return {Function}
 */
export function context(isSvg) {
  return function() {
    if (isHydrated) {
      // Hydrate on first pass, create on the rest.
      return (isSvg ? hs : h).apply(null, arguments);
    }

    let vnode;

    function item(arg) {
      if (arg == null);
      else if (arg === _ || typeof arg === 'function') {
        // Components can only be the first argument.
        if (vnode) {
          addChild(vnode, arg);
        } else {
          vnode = { type: arg, _children: [] };
        }
      } else if (Array.isArray(arg)) {
        vnode = vnode || { _children: [] };
        arg.forEach(item);

      } else if (typeof arg === 'object') {
        if (arg._children) {
          addChild(vnode, arg);
        } else {
          vnode._props = arg;
        }
      } else {
        // The rest is made into a string.
        if (vnode) {
          addChild(vnode, { type: null, _props: arg });
        } else {
          vnode = { type: arg, _children: [] };
        }
      }

      if (isSvg) vnode._isSvg = isSvg;
    }

    function addChild(parent, child) {
      parent._children.push(child);
      child._parent = parent;
    }

    Array.from(arguments).forEach(item);

    return vnode;
  };
}

/**
 * Hydrates the root node with a passed delta tree structure.
 *
 * `delta` looks like:
 * {
 *   type: 'div',
 *   _props: { class: '' },
 *   _children: []
 * }
 *
 * @param  {object} delta
 * @param  {Node} [root]
 * @return {Node} Returns the `root`.
 */
export function hydrate(delta, root) {
  if (!delta) {
    return;
  }

  if (typeof delta.type === 'function') {
    // Support Components
    delta = delta.type.apply(null, [delta._props].concat(delta._children));
  }

  if (!root) {
    root = document.querySelector(findRootSelector(delta));
  }

  const isFragment = delta.type === undefined;
  let el;

  function item(arg) {
    if (arg instanceof Node) {
      el = arg;
      // Keep a child pointer for multiple hydrate calls per element.
      el._index = el._index || 0;
    } else if (Array.isArray(arg)) {
      arg.forEach(item);
    } else if (el) {
      let target = filterChildNodes(el)[el._index];
      let current;
      let prefix;

      const updateText = text => {
        el._index++;

        // Leave whitespace alone.
        if (target.data.trim() !== text.trim()) {
          if (arg._parent._children.length !== filterChildNodes(el).length) {
            // If the parent's virtual children length don't match the DOM's,
            // it's probably adjacent text nodes stuck together. Split them.
            target.splitText(target.data.indexOf(text) + text.length);
            if (current) {
              // Leave prefix whitespace intact.
              prefix = current.match(/^\s*/)[0];
            }
          }
          // Leave whitespace alone.
          if (target.data.trim() !== text.trim()) {
            target.data = text;
          }
        }
      };

      if (target) {
        // Skip placeholder underscore.
        if (arg === _) {
          el._index++;
        } else if (typeof arg === 'object') {
          if (arg.type === null && target.nodeType === 3) {
            // This is a text vnode, add noskip so spaces don't get skipped.
            target._noskip = true;
            updateText(arg._props);
          } else if (arg.type) {
            hydrate(arg, target);
            el._index++;
          }
        }
      }

      if (typeof arg === 'function') {
        current = target ? target.data : undefined;
        prefix = '';
        let hydrated;
        let marker;
        let startNode;
        api.subscribe(() => {
          isHydrated = hydrated;

          let result = arg();
          if (result && result._children) {
            result = result.type
              ? result
              : result._children.length > 1
              ? result._children
              : result._children;
          }

          const isStringable =
            typeof result === 'string' || typeof result === 'number';
          result = isStringable ? prefix + result : result;

          if (hydrated || (!target && !isFragment)) {
            current = api.insert(el, result, marker, current, startNode);
          } else {
            if (isStringable) {
              updateText(result);
            } else {
              if (Array.isArray(result)) {
                startNode = target;
                target = el;
              }

              hydrate(result, target);
              current = [];
            }

            if (target) {
              marker = api.add(el, '', filterChildNodes(el)[el._index]);
            } else {
              marker = api.add(el.parentNode, '', el.nextSibling);
            }
          }

          isHydrated = false;
          hydrated = true;
        });
      } else if (typeof arg === 'object') {
        if (!arg._children) {
          api.property(el, arg, null, delta._isSvg);
        }
      }
    }
  }

  [root, delta._props, delta._children || delta].forEach(item);

  return el;
}

function findRootSelector(delta) {
  let selector = '';
  let prop;
  if (delta._props && (prop = delta._props.id)) {
    selector = '#';
  } else if (delta._props && (prop = delta._props.class)) {
    selector = '.';
  } else if ((prop = delta.type));
  else {
    return findRootSelector(delta._children[0]());
  }

  return (
    selector +
    (typeof prop === 'function' ? prop() : prop)
      .split(' ')
      // Escape CSS selector https://bit.ly/36h9I83
      .map(sel => sel.replace(/([^\x80-\uFFFF\w-])/g, '\\$1'))
      .join('.')
  );
}

/**
 * Filter out whitespace text nodes unless it has a noskip indicator.
 *
 * @param  {Node} parent
 * @return {Array}
 */
function filterChildNodes(parent) {
  return Array.from(parent.childNodes).filter(
    el => el.nodeType !== 3 || el.data.trim() || el._noskip
  );
}

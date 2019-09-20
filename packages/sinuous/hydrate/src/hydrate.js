import { h, hs, api } from 'sinuous';

export const EMPTY_ARR = [];
export const _ = {};

let isHydrated;

/**
 * Create a sinuous `treeify` function.
 * @param  {boolean} isSvg
 * @return {Function}
 */
export function context(isSvg) {
  function treeify() {
    if (isHydrated) {
      // Hydrate on first pass, create on the rest.
      return (isSvg ? hs : h).apply(null, arguments);
    }

    const args = EMPTY_ARR.slice.call(arguments);
    const tree = {
      _children: []
    };

    function item(arg) {
      if (isSvg) tree._isSvg = isSvg;
      if (arg == null);
      else if (arg === _) {
        tree._children.push(arg);
      } else if (typeof arg === 'string') {
        if (tree._tag) {
          tree._children.push(arg);
        } else {
          tree._tag = arg;
        }
      } else if (Array.isArray(arg)) {
        arg.forEach(item);
      } else if (typeof arg === 'object') {
        if (arg._tag) {
          tree._children.push(arg);
        } else {
          tree._props = arg;
        }
      } else if (typeof arg === 'function') {
        tree._children.push(arg);
      }
    }

    args.forEach(item);

    return tree._tag
      ? tree
      : tree._children[1]
      ? tree._children
      : tree._children[0];
  }

  return treeify;
}

/**
 * Hydrates the root node with a passed delta tree structure.
 *
 * `delta` looks like:
 * {
 *   _tag: 'div',
 *   _props: { class: '' },
 *   _children: []
 * }
 *
 * @param  {object} delta
 * @param  {Node} root
 * @return {Node} Returns the `root`.
 */
export function hydrate(delta, root) {
  const children = Array.isArray(delta) ? delta : delta._children;
  const args = [root, delta._props, children];
  const isSvg = delta._isSvg;
  let el;
  let childNodes;

  function item(arg) {
    if (arg instanceof Node) {
      el = arg;
      // Keep a child pointer for multiple hydrate calls per element.
      el._index = el._index || 0;
      // Make a copy of the current child tree.
      childNodes = EMPTY_ARR.slice.call(el.childNodes);
    } else if (Array.isArray(arg)) {
      arg.forEach(item);
    } else if (el) {
      let target = getChildNode(childNodes, el._index);
      if (target) {
        if (arg === _) {
          el._index++;
        } else if (typeof arg === 'string') {
          if (target.data !== arg) target.data = arg;
          el._index++;
        } else if (typeof arg === 'object') {
          if (arg._children) {
            hydrate(arg, target);
            el._index++;
          } else {
            for (let name in arg) {
              api.property(name, arg[name], el, isSvg);
            }
          }
        } else if (typeof arg === 'function') {
          let hydrated;
          let current = target.data;
          let marker;
          let startNode;
          api.subscribe(function() {
            isHydrated = hydrated;

            let result = arg();
            if (hydrated) {
              current = api.insert(el, result, marker, current, startNode);
            } else {
              if (typeof result === 'string' || typeof result === 'number') {
                el._index++;
              } else {
                if (Array.isArray(result)) {
                  startNode = target;
                  target = el;
                }
                hydrate(result, target);
                current = [];
              }

              marker = el.insertBefore(
                document.createTextNode(''),
                getChildNode(childNodes, el._index)
              );
            }

            isHydrated = false;
            hydrated = true;
          });
        }
      } else {
        // Adjecent text cannot be walked, fallback to creation.
        (isSvg ? hs : h)(el, arg);
      }
    }
  }

  args.forEach(item);

  return el;
}

function getChildNode(childNodes, index) {
  return childNodes
    .filter(child => child.nodeType !== 3 || child.data.trim())[index];
}

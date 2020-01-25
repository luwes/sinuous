import { api } from 'sinuous';
import { EMPTY_ARR } from './constants.js';

let recordedActions;
let actionId = 0;

/**
 * Observed template tag.
 * @param  {string} key
 * @return {Function}
 */
export function o(key) {
  return t(key, true);
}

/**
 * Template tag.
 * @param  {string} key
 * @param {boolean} [observed]
 * @param {boolean} [bind]
 * @param {*} [defaultValue]
 * @return {Function}
 */
export function t(key, observed, bind, defaultValue) {
  const tag = function() {
    // eslint-disable-next-line
    const { el, name, endMark } = this;

    const action = (element, endMark, prop, value) => {
      if (prop == null) {
        // Action + element is a unique reference we can use to store state.
        // Element is needed because of cloning.
        element._parts = element._parts || {};
        let part = element._parts[action._id] || (element._parts[action._id] = {});
        part._endMark = endMark;

        part._current = api.insert(
          element,
          value,
          endMark,
          part._current || '',
          part._startNode
        );

        // A startNode is needed because when there is no clone the childNodes
        // are pulled out the DOM and put back in via the document fragment
        // endMark.previousSibling would clear an element 1 before the current.
        if (part._current instanceof Node) {
          part._startNode = part._current;
        }
      } else {
        api.property(prop, value, element);
      }
    };

    action._id = actionId++;
    action._el = el;
    action._endMark = endMark;
    action._name = name;
    action._key = key;
    action._observed = observed;
    action._bind = bind;
    recordedActions.push(action);

    return defaultValue;
  };
  return tag;
}

export function fill(elementRef) {
  return template(elementRef, true);
}

/**
 * Creates a template function.
 * @param   {Function} elementRef
 * @param   {boolean} noClone
 * @return  {Function}
 */
export function template(elementRef, noClone) {
  const prevRecordedActions = recordedActions;
  recordedActions = [];

  const tpl = elementRef();

  let fragment =
    tpl.content || ((tpl.parentNode || tpl.nodeType === 11) && tpl);

  if (!fragment) {
    fragment = document.createDocumentFragment();
    fragment.appendChild(tpl);
  }

  if (fragment.nodeType === 11) {
    fragment._childNodes = EMPTY_ARR.slice.call(fragment.childNodes);
  }

  if (!noClone) {
    recordedActions.forEach(action => {
      action._paths = createPath(fragment, action._el);
      action._endMarkPath = action._endMark && createPath(action._el, action._endMark);
    });
  }

  const cloneActions = recordedActions;
  recordedActions = prevRecordedActions;

  function create(props, forceNoClone) {
    if (forceNoClone) noClone = forceNoClone;

    const keyedActions = {};
    let root;
    if (noClone) {
      if (fragment._childNodes && !fragment.firstChild) {
        fragment._childNodes.forEach(child => fragment.appendChild(child));
      }
      root = fragment;
    } else {
      root = fragment.cloneNode(true);
    }

    // Set a custom property `props` for easy access to the passed argument.
    if (root.firstChild) {
      root.firstChild.props = props;
    }

    cloneActions.forEach(action => {
      const target = noClone ? action._el : getPath(root, action._paths);
      const endMark = noClone
        ? action._endMark
        : action._endMarkPath && getPath(target, action._endMarkPath);

      const key = action._key;
      let elProps = props;

      const createAction = (prop, i, keys) => {
        let name = action._name || (keys && prop);
        // If the field is a plain object, the `_` prop is the element content.
        // For `sinuous/data` e.g. data-bind="this:my" refers to the current element.
        if (name === '_' || name === 'this') name = null;

        let value = elProps[prop];
        if (value != null) {
          action(target, endMark, name, value);
        }

        if (action._observed) {
          if (!keyedActions[key]) {
            keyedActions[key] = [];

            Object.defineProperty(elProps, prop, {
              get() {
                if (action._bind) {
                  if (name in target) {
                    return target[name];
                  }
                  return target;
                }
                return value;
              },
              set(newValue) {
                value = newValue;
                keyedActions[key].forEach(action => action(newValue));
              }
            });
          }
          keyedActions[key].push(action.bind(null, target, endMark, name));
        }
      };

      if (
        !(props[key] instanceof Node) &&
        !(props[key] instanceof Array) &&
        typeof props[key] === 'object'
      ) {
        elProps = props[key];
        Object.keys(elProps).forEach(createAction);
      } else {
        createAction(key);
      }
    });

    return root;
  }

  // Tiny indicator that this is a template create function.
  create.$t = true;

  return create;
}

function createPath(root, el) {
  let paths = [];
  let parent;
  while ((parent = el.parentNode) !== root.parentNode) {
    paths.unshift(EMPTY_ARR.indexOf.call(parent.childNodes, el));
    el = parent;
  }
  return paths;
}

function getPath(root, paths) {
  let target = root;
  let j = 0;
  while (j < paths.length) {
    target = target.firstChild;
    const path = paths[j];
    let k = 0;
    while (k < path) {
      target = target.nextSibling;
      k += 1;
    }
    j += 1;
  }
  return target;
}

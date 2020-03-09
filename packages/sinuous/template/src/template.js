import { api } from 'sinuous';

let recordedActions;

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
 * @return {Function}
 */
export function t(key, observed, bind) {
  const tag = function() {
    // eslint-disable-next-line
    const { el, name, endMark } = this;

    const action = (element, endMark, propName, value) => {
      if (propName == null) {
        // Store state on the unique endMark per action.
        const state = endMark || element;
        state._current = api.insert(element, value, endMark, state._current);
      } else {
        api.property(element, value, propName);
      }
    };

    action._el = el;
    action._endMark = endMark;
    action._propName = name;
    action._key = key;
    action._observed = observed;
    action._bind = bind;
    recordedActions.push(action);
  };
  return tag;
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

  const cloneActions = recordedActions;
  recordedActions = prevRecordedActions;

  let fragment = tpl.content || (tpl.parentNode && tpl);
  if (!fragment) {
    fragment = document.createDocumentFragment();
    fragment.appendChild(tpl);
  }

  let stamp = fragment.cloneNode(true);

  if (!noClone) {
    cloneActions.forEach(action => {
      action._paths = createPath(fragment, action._el);
      action._endMarkPath =
        action._endMark && createPath(action._el, action._endMark);
    });
  }

  function create(props, forceNoClone) {
    // Explicit check for a boolean here, this fn tends to be used in Array.map.
    if (forceNoClone === false || forceNoClone === true) noClone = forceNoClone;

    const keyedActions = {};
    let root;
    if (noClone) {
      if (fragment._childNodes) {
        fragment._childNodes.forEach(child => fragment.appendChild(child));
      }
      root = fragment;
    } else {
      root = stamp.cloneNode(true);
    }

    // Set a custom property `props` for easy access to the passed argument.
    if (root.firstChild) {
      root.firstChild.props = props;
    }

    // These paths have to be resolved before any elements are inserted.
    cloneActions.forEach(action => {
      action._target = noClone ? action._el : getPath(root, action._paths);
      action._endMarkTarget = noClone
        ? action._endMark
        : action._endMarkPath && getPath(action._target, action._endMarkPath);
    });

    cloneActions.forEach(action => {
      api.action(action, props, keyedActions)(action._key, action._propName);
    });

    // Copy the childNodes after inserting the values. This is needed for
    // fills with primitive values that stay the same between renders.
    fragment._childNodes = Array.from(fragment.childNodes);

    return root;
  }

  // Tiny indicator that this is a template create function.
  create.$t = true;

  return create;
}

api.action = (action, props, keyedActions) => {
  const target = action._target;

  // In the `data` module `key` and `propName` are transformed for special cases.
  return (key, propName) => {
    let value = props[key];
    if (value != null) {
      action(target, action._endMarkTarget, propName, value);
    }

    if (action._observed) {
      if (!keyedActions[key]) {
        keyedActions[key] = [];

        Object.defineProperty(props, key, {
          get() {
            if (action._bind) {
              if (propName in target) {
                return target[propName];
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
      keyedActions[key].push(
        action.bind(null, target, action._endMarkTarget, propName)
      );
    }
  };
};

function createPath(root, el) {
  let paths = [];
  let parent;
  while ((parent = el.parentNode) !== root.parentNode) {
    paths.unshift(Array.from(parent.childNodes).indexOf(el));
    el = parent;
  }
  return paths;
}

function getPath(target, paths) {
  paths.forEach(depth => (target = target.childNodes[depth]));
  return target;
}

import { api } from 'sinuous';
import { EMPTY_ARR } from './constants.js';

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
 * @param {*} [defaultValue]
 * @return {Function}
 */
export function t(key, observed, bind, defaultValue) {
  const tag = function() {
    // eslint-disable-next-line
    const { el, name } = this;

    let current = '';
    let action = (element, prop, value) => {
      if (prop == null) {
        api.insert(element, value, null, current);
      } else {
        api.property(prop, value, element);
      }
    };

    action._el = el;
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
  recordedActions = [];

  const tpl = elementRef();

  let fragment = tpl.content || (tpl.parentNode && tpl);
  if (!fragment) {
    fragment = document.createDocumentFragment();
    fragment.appendChild(tpl);
  }

  if (!noClone) {
    recordedActions.forEach(action => {
      action._paths = [];
      let el = action._el;
      let parent;
      while ((parent = el.parentNode) !== fragment.parentNode) {
        action._paths.unshift(EMPTY_ARR.indexOf.call(parent.childNodes, el));
        el = parent;
      }
    });
  }

  const cloneActions = recordedActions;
  recordedActions = null;

  // Tiny indicator that this is a template create function.
  create.$t = true;

  function create(props, forceNoClone) {
    if (forceNoClone) noClone = forceNoClone;

    const keyedActions = {};
    const root = noClone ? fragment : fragment.cloneNode(true);

    // Set a custom property `props` for easy access to the passed argument.
    root.firstChild.props = props;

    cloneActions.forEach(action => {
      const paths = action._paths;
      let target = action._el;

      if (!noClone) {
        target = root;
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
      }

      const key = action._key;
      let elProps = props;

      const createAction = (prop, i, keys) => {
        let name = action._name || (keys && prop);
        if (name === '_' || name === 'this') name = null;

        let value = elProps[prop];
        if (value != null) {
          action(target, name, value);
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
          keyedActions[key].push(action.bind(null, target, name));
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

  return create;
}

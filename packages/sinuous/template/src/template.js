import { api } from 'sinuous';
import { EMPTY_ARR } from './constants.js';

let recordedActions;

/**
 * Observable template tag.
 * @param  {string} key
 * @return {Function}
 */
export function o(key) {
  return t(key, true);
}

/**
 * Template tag.
 * @param  {string} key
 * @param {boolean} observable
 * @return {Function}
 */
export function t(key, observable) {
  const tag = function() {
    // eslint-disable-next-line
    const { el, name } = this;
    let action;
    if (name == null) {
      let current = '';
      action = (element, value) => {
        api.insert(element, value, null, current);
      };
      action._insert = true;
    } else {
      action = (element, value, prop) => {
        api.property(name || prop, value, element);
      };
    }
    action._tag = tag;
    action._el = el;
    action._key = key;
    action._observable = observable;
    recordedActions.push(action);
  };
  return tag;
}

export function fill(elementRef) {
  return template(elementRef, true);
}

/**
 * Creates a template function.
 * @param   {Function} elementRef
 * @param   {boolean} noclone
 * @return  {Function}
 */
export function template(elementRef, noclone) {
  recordedActions = [];

  const tpl = elementRef();

  let fragment = tpl.content || (tpl.parentNode && tpl);
  if (!fragment) {
    fragment = document.createDocumentFragment();
    fragment.appendChild(tpl);
  }

  if (!noclone) {
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

  function create(props) {
    const root = noclone ? fragment : fragment.cloneNode(true);
    const keyedActions = {};

    // Set a custom property `props` for easy access to the passed argument.
    root.firstChild.props = props;

    cloneActions.forEach(action => {
      const paths = action._paths;
      let target = action._el;

      if (!noclone) {
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
        const value = elProps[prop];
        if (value != null) {
          if (keys && action._insert && prop !== '_') {
            return;
          }
          action(target, value, prop);
        }

        if (action._observable) {
          if (!keyedActions[key]) {
            observeProperty(elProps, prop, value, (keyedActions[key] = []));
          }
          keyedActions[key].push(action.bind(null, target));
        }
      };

      if (typeof props[key] === 'function') {
        props[key] = props[key].call({ el: target });
      }

      if (typeof props[key] === 'object') {
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

function observeProperty(props, key, value, actions) {
  Object.defineProperty(props, key, {
    get() {
      return value;
    },
    set(newValue) {
      value = newValue;
      actions.forEach(action => action(newValue, key));
    }
  });
}

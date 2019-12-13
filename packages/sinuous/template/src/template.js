import { api } from 'sinuous';
import { EMPTY_ARR } from './constants.js';

let recordedActions;

let oldInsert = api.insert;
api.insert = function(parent, tag, a, b, c) {
  if (tag && tag.$t) {
    let current = '';
    const action = (element, value) => {
      oldInsert(element, value, null, current);
    };
    action._tag = tag;
    action._el = parent;
    recordedActions.push(action);
    return;
  }
  return oldInsert(parent, tag, a, b, c);
};

let oldProperty = api.property;
api.property = function(name, tag, el, a, b) {
  if (tag && tag.$t) {
    const action = (element, value) => {
      oldProperty(name, value, element);
    };
    action._tag = tag;
    action._el = el;
    recordedActions.push(action);
    return;
  }
  return oldProperty(name, tag, el, a, b);
};

/**
 * Template tag.
 * @param  {string} key
 * @return {Function}
 */
export function t(key) {
  const tag = () => key;
  tag.$t = true;
  return tag;
}

/**
 * Observable template tag.
 * @param  {string} key
 * @return {Function}
 */
export function o(key) {
  const observedTag = t(key);
  observedTag._observable = true;
  return observedTag;
}

/**
 * Creates a template.
 * @param  {Function} fn
 * @return {Function}
 */
export function template(fn) {
  recordedActions = [];

  const fragment = document.createDocumentFragment();
  fragment.appendChild(fn());

  recordedActions.forEach(action => {
    action._paths = [];
    let el = action._el;
    let parent;
    while ((parent = el.parentNode)) {
      action._paths.unshift(EMPTY_ARR.indexOf.call(parent.childNodes, el));
      el = parent;
    }
  });

  const cloneActions = recordedActions;
  recordedActions = null;

  // Tiny indicator that this is a template clone function.
  clone.$t = true;

  function clone(props) {
    const keyedActions = {};
    const el = fragment.cloneNode(true);

    // Set a custom property `props` for easy access to the passed argument.
    el.firstChild.props = props;

    for (let i = 0; i < cloneActions.length; i++) {
      let action = cloneActions[i];
      const paths = action._paths;

      let target = el;
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

      const tag = action._tag;
      const key = tag();
      const value = props[key];
      if (value != null) {
        action(target, value);
      }

      if (tag._observable) {
        if (!keyedActions[key]) {
          observeProperty(props, key, value, (keyedActions[key] = []));
        }
        keyedActions[key].push(action.bind(null, target));
      }
    }

    return el;
  }

  return clone;
}

function observeProperty(props, key, value, actions) {
  Object.defineProperty(props, key, {
    get() {
      return value;
    },
    set(newValue) {
      value = newValue;
      actions.forEach(action => action(newValue));
    }
  });
}

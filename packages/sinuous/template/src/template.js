import { EMPTY_ARR } from './constants.js';

let actions;

/**
 * Template tag.
 * @param  {string} key
 * @return {Function}
 */
export function t(key) {
  const tag = () => key;
  tag.$t = (type, api, fn, el, str) => {
    const create = type === 1 ? createInsert : createProperty;
    const action = create(api, fn, str);
    action._tag = tag;
    action._el = el;
    actions.push(action);
  };
  return tag;
}

/**
 * Observable template tag.
 * @param  {string} key
 * @return {Function}
 */
export function o(key) {
  const observedTag = t(key);
  observedTag._observable = 1;
  return observedTag;
}

function createInsert(api, insert, current) {
  return (element, value) => {
    current = insert(api, element, value, null, current);
  };
}

function createProperty(api, property, name) {
  return (element, value) => {
    property(name, value, api, element);
  };
}

/**
 * Creates a template.
 * @param  {Function} fn
 * @return {Function}
 */
export function template(fn) {
  actions = [];

  const fragment = document.createDocumentFragment();
  fragment.appendChild(fn());

  actions.forEach(action => {
    action._paths = [];
    let el = action._el;
    let parent;
    while ((parent = el.parentNode)) {
      action._paths.unshift(EMPTY_ARR.indexOf.call(parent.childNodes, el));
      el = parent;
    }
  });

  const cloneActions = actions;
  actions = null;

  return function clone(props) {
    const el = fragment.cloneNode(true);
    el.firstChild.props = props;

    for (let i = 0; i < cloneActions.length; i++) {
      const action = cloneActions[i];
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
        observeProperty(props, key, value, action, target);
      }
    }

    return el;
  };
}

function observeProperty(props, key, value, action, target) {
  Object.defineProperty(props, key, {
    get() {
      return value;
    },
    set(newValue) {
      value = newValue;
      action(target, newValue);
    }
  });
}

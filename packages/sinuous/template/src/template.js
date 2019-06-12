import { EMPTY_ARR } from './constants.js';

let actions;

export function t(key) {
  const tag = () => key;
  tag.$ = (el, action) => {
    action._tag = tag;
    action._el = el;
    actions.push(action);
  };
  return tag;
}

export function s(key) {
  const observedTag = t(key);
  observedTag._observable = 1;
  return observedTag;
}

export function template(fn) {
  actions = [];

  const fragment = document.createDocumentFragment();
  fragment.appendChild(fn());

  actions.forEach((action) => {
    action._paths = [];
    let el = action._el;
    let parent;
    while (parent = el.parentNode) {
      action._paths.unshift(EMPTY_ARR.indexOf.call(parent.children, el));
      el = parent;
    }
  });

  const cloneActions = actions;
  actions = null;

  return function clone(data) {
    const el = fragment.cloneNode(true);
    el.firstChild.data = data;

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
      const value = data[key];
      if (value != null) {
        action(target, value);
      }

      if (tag._observable) {
        observeProperty(data, key, value, action, target);
      }
    }

    return el;
  };
}

function observeProperty(data, key, value, action, target) {
  Object.defineProperty(data, key, {
    get() { return value; },
    set(newValue) {
      value = newValue;
      action(target, newValue);
    }
  });
}

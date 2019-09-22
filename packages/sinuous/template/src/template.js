import { EMPTY_ARR } from './constants.js';

let recordedActions;

/**
 * Template tag.
 * @param  {string} key
 * @return {Function}
 */
export function t(key) {
  const tag = () => key;
  tag.$t = (type, fn, el, str) => {
    const create = type === 1 ? createInsert : createProperty;
    const action = create(fn, str);
    action._tag = tag;
    action._el = el;
    recordedActions.push(action);
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
  observedTag._observable = true;
  return observedTag;
}

function createInsert(insert, current) {
  return (element, value) => {
    insert(element, value, null, current);
  };
}

function createProperty(property, name) {
  return (element, value) => {
    property(name, value, element);
  };
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

  let cache;
  let clonedCache;
  let rowCount = 0;
  let max = 0;
  let divisor;
  let repeat;

  // Tiny indicator that this is a template clone function.
  clone.$t = true;

  function clone(props, index, list) {
    const len = list && list.length;
    if (len - index > 9 && !cache) {
      divisor = Math.sqrt(len) | 0;
      repeat = len / divisor | 0;
      max = divisor * repeat;
      cache = document.createDocumentFragment();
      for (let i = 0; i < repeat; i++) {
        cache.appendChild(fragment.cloneNode(true));
      }
    }

    if (cache) {
      if (index >= max) {
        clonedCache = cache;
        cache = null;
      } else if (index % repeat === 0) {
        clonedCache = cache.cloneNode(true);
        rowCount = 0;
      }
    }

    const keyedActions = {};
    let fromCache;
    let el = clonedCache.childNodes[rowCount++];
    if (el) {
      fromCache = true;
    } else {
      el = fragment.cloneNode(true);
    }

    // Set a custom property `props` for easy access to the passed argument.
    if (fromCache) {
      el.props = props;
    } else {
      el.firstChild.props = props;
    }

    for (let i = 0; i < cloneActions.length; i++) {
      let action = cloneActions[i];
      let paths = action._paths;
      if (fromCache) {
        paths = paths.slice(1);
      }

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

    if (fromCache) {
      if (rowCount >= repeat) {
        return clonedCache;
      }
      return null;
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

import { api } from 'sinuous';
import { template as tpl, t } from 'sinuous/template';

const createAction = api.action;
api.action = (action, props, keyedActions) => {
  const handleAction = (propNameArg, runAction) => {
    return (key, i, keys) => {
      let propName = propNameArg || (keys && key);
      // If the field is a plain object, the `_` key is the element content.
      // For `sinuous/data` e.g. data-bind="this:my" refers to the current element.
      if (propName === '_' || propName === 'this') propName = null;

      return runAction(key, propName);
    };
  };

  return (key, propName) => {
    let elProps = props[key];
    if (
      elProps &&
      typeof elProps === 'object' &&
      !elProps.nodeType && // not a Node
      !elProps.length // not an Array
    ) {
      const execAction = handleAction(
        propName,
        createAction(action, elProps, keyedActions)
      );
      Object.keys(elProps).forEach(execAction);
    } else {
      const execAction = handleAction(
        propName,
        createAction(action, props, keyedActions)
      );
      execAction(key);
    }
  };
};

export function fill(elementRef) {
  return template(elementRef, true);
}

/**
 * Creates a template function.
 * @param   {string} elementRef
 * @param   {boolean} noclone
 * @return  {Function}
 */
export function template(elementRef, noclone) {
  return tpl(() => {
    let fragment = document.querySelector(elementRef);
    return recordDataAttributes(fragment);
  }, noclone);
}

const tags = ['t', 'o', 'bind'];

function recordDataAttributes(fragment) {
  const root = fragment.content || fragment;
  let index = 0;
  [fragment]
    .concat(Array.from(root.querySelectorAll('[data-t],[data-o],[data-bind]')))
    .forEach(el => {
      tags.forEach((tag, i) => {
        const dataset = el.dataset[tag];
        if (dataset == null) return;

        const observed = i > 0;
        const bind = i > 1;
        if (dataset) {
          let pairs = dataset.split(' ');
          pairs.forEach(id => {
            const [name, key] = id.split(':');
            if (key) {
              // Record a named property action.
              t(key, observed, bind).call({ el, name });
            } else {
              t(name, observed, bind).call({ el });
            }
          });
        } else {
          t(index, observed, bind).call({ el });
        }
        index++;
      });
    });
  return fragment;
}

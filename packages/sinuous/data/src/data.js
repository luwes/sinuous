import { template as tpl, t } from 'sinuous/template';
import { EMPTY_ARR } from './constants.js';

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
    .concat(
      EMPTY_ARR.slice.call(
        root.querySelectorAll('[data-t],[data-o],[data-bind]')
      )
    )
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

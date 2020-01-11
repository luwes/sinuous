import { template as tpl, o, t } from 'sinuous/template';
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
    return recordDataAttributes(fragment.content || fragment);
  }, noclone);
}

function recordDataAttributes(fragment) {
  EMPTY_ARR.slice
    .call(fragment.querySelectorAll('[data-t],[data-o]'))
    .forEach((el, i) => {
      let dataset = el.dataset.t;
      let tagFn = t;
      if ('o' in el.dataset) {
        dataset = el.dataset.o;
        tagFn = o;
      }
      if (dataset) {
        let tags = dataset.split(' ');
        tags.forEach(id => {
          const [name, key] = id.split(':');
          if (key) {
            // Record a named property action.
            tagFn(key).call({ el, name });
          } else {
            // Record a blank property action, name can be filled in later.
            tagFn(name).call({ el, name: 0 });
            // Record an insert action.
            tagFn(name).call({ el });
          }
        });
      } else {
        // Record a blank property action, name can be filled in later.
        tagFn(i).call({ el, name: 0 });
        // Record an insert action.
        tagFn(i).call({ el });
      }
    });
  return fragment;
}

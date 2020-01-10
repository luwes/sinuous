import { template as tpl, o, t } from 'sinuous/template';
import { EMPTY_ARR } from './constants.js';

export function fill(elementRef) {
  return template(elementRef, true);
}

/**
 * Creates a template.
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
      let tag = 't';
      let tagFn = t;
      if ('o' in el.dataset) {
        tag = 'o';
        tagFn = o;
      }
      if (el.dataset[tag]) {
        let tags = el.dataset[tag].split(' ');
        tags.forEach(id => {
          const [name, key] = id.split(':');
          if (key) {
            tagFn(key).call({ el, name });
          } else {
            tagFn(name).call({ el, name: 0 });
            tagFn(name).call({ el });
          }
        });
      } else {
        tagFn(i).call({ el, name: 0 });
        tagFn(i).call({ el });
      }
    });
  return fragment;
}

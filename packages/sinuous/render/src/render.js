import { api } from 'sinuous';
import { template, t } from 'sinuous/template';
import { EMPTY_ARR } from './constants.js';

const cache = {};
let tagIndex;

/**
 * Create a sinuous `treeify` function.
 * @param  {boolean} isSvg
 * @return {Function}
 */
export function context(isSvg) {
  const h = (isSvg ? api.hs : api.h).bind();

  h.wrap = function() {
    const createElement = this;
    const args = EMPTY_ARR.slice.call(arguments);
    const statics = args[0];
    const fields = args.slice(1);

    for (let i = 1; i < args.length; i++) {
      args[i] = x();
    }

    function create() {
      const tplKey = JSON.stringify(statics);

      let tpl = cache[tplKey];
      if (!tpl) {
        const prevTagIndex = tagIndex;
        tagIndex = 0;

        tpl = template(() => createElement.apply(null, args));
        cache[tplKey] = tpl;

        tagIndex = prevTagIndex;
      }

      const noClone = this && this.el._endMark === this.endMark;
      return tpl(fields, noClone);
    }
    return create;
  };

  return h;
}

export function render(value, el) {
  el._endMark = el._endMark || api.add(el, '');
  el._current = api.insert(el, value, el._endMark, el._current || '');
}

export function x() {
  return () => t(tagIndex++);
}

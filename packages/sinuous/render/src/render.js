import { api } from 'sinuous';
import { template, t } from 'sinuous/template';
import { EMPTY_ARR } from './constants.js';

const cache = {};

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
      args[i] = x(i - 1);
    }

    function create() {
      const ctx = this;
      const tplKey = JSON.stringify(statics);

      let tpl = cache[tplKey];
      if (!tpl) {
        tpl = template(() => createElement.apply(null, args));
        cache[tplKey] = tpl;
      }

      const parts = ctx && ctx.el && ctx.el._parts;
      const noClone = parts && Object.keys(parts)
        .some(k => parts[k]._endMark === ctx.endMark);

      return tpl(fields, noClone);
    }
    return create;
  };

  return h;
}

export function render(value, el) {
  el._parts = el._parts || {};
  let part = el._parts[0] || (el._parts[0] = {});

  part._endMark = part._endMark || api.add(el, '');
  part._current = api.insert(el, value, part._endMark, part._current || '');
}

export function x(tagIndex) {
  return t(tagIndex);
}

import { api } from 'sinuous';
import { template, t } from 'sinuous/template';
import { EMPTY_ARR } from './constants.js';

const cache = {};
const tpls = new WeakMap();

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

    function templateResult() {
      const { endMark } = this || {};
      const tplKey = statics.join('\0');

      let tpl = cache[tplKey];
      if (!tpl) {
        tpl = template(() => createElement.apply(null, args));
        cache[tplKey] = tpl;
      }

      // A template result is attached to a mark in the DOM.
      // Only this mark can re-use the template result without cloning.
      templateResult._endMark = templateResult._endMark || endMark;
      let clone = endMark && templateResult._endMark !== endMark;

      // A template can only be used once, after it must be cloned.
      let tplEndMark = tpls.get(tpl);
      if (tplEndMark) clone = tplEndMark !== endMark;
      else tpls.set(tpl, endMark);

      return tpl(fields, !clone);
    }
    return templateResult;
  };

  return h;
}

export function render(value, el) {
  el._parts = el._parts || {};
  let part = el._parts[0] || (el._parts[0] = {});

  part._endMark = part._endMark || api.add(el, '');
  part._current = api.insert(el, value, part._endMark, part._current, part._startNode);

  if (part._current instanceof Node) {
    part._startNode = part._current;
  }
}

export function x(tagIndex) {
  return t(tagIndex);
}

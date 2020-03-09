import { api } from 'sinuous';
import { template, t } from 'sinuous/template';

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
    const args = Array.from(arguments);
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
      if (tpl._endMark) clone = tpl._endMark !== endMark;
      else tpl._endMark = endMark;

      return tpl(fields, !clone);
    }
    return templateResult;
  };

  return h;
}

export function render(value, el) {
  el._endMark = el._endMark || api.add(el, '');
  el._current = api.insert(el, value, el._endMark, el._current);
}

export function x(tagIndex) {
  return t(tagIndex);
}

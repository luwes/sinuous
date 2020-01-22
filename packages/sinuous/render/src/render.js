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
      args[i] = x(args[i]);
    }

    return function() {
      return factory(createElement, args, statics, fields);
    };
  };

  return h;
}

function factory(createElement, args, statics, fields) {
  const tplKey = JSON.stringify(statics);

  let tpl = cache[tplKey];
  if (tpl) {
    return tpl(fields, true);
  }

  const prevTagIndex = tagIndex;
  tagIndex = 0;

  tpl = template(() => createElement.apply(null, args));
  cache[tplKey] = tpl;

  tagIndex = prevTagIndex;

  return tpl.el;
}

export function x(value) {
  return () => t(tagIndex++, null, null, value);
}

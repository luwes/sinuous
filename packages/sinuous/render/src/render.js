import { api } from 'sinuous';
import { fill, t } from 'sinuous/template';
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

    for (var i = 1; i < args.length; i++) {
      args[i] = x(args[i]);
    }

    return function() {
      return factory(createElement, args, statics, fields);
    };
  };

  return h;
}

function factory(createElement, args, statics, fields) {
  const templateKey = JSON.stringify(statics);

  let template = cache[templateKey];
  if (template) {
    template._fill(fields);
    return template._el;
  }

  const prevTagIndex = tagIndex;
  tagIndex = 0;

  template = {};
  template._fill = fill(() => {
    template._el = createElement.apply(createElement, args);
    return template._el;
  });

  tagIndex = prevTagIndex;
  cache[templateKey] = template;

  return template._el;
}

export function x(value) {
  return () => t(tagIndex++, null, null, value);
}

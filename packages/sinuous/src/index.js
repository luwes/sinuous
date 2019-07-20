import { context } from 'sinuous/h';
import * as api from 'sinuous/observable';
import htm from 'sinuous/htm';

export const o = api.o;
export { o as observable };
export { api, context };

export const h = context(api);
export const hs = context(api, true);

// `export const html = htm.bind(h)` is not tree-shakeable!
export function html() {
  return htm.apply(h, arguments);
}

export function svg() {
  return htm.apply(hs, arguments);
}

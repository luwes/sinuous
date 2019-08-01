/*
 * Sinuous by Wesley Luyten (@luwes).
 * Really ties all the packages together.
 */
import * as observable from 'sinuous/observable';
import { api, context } from 'sinuous/h';
import htm from 'sinuous/htm';

export const h = context(observable);
export const hs = context(observable, true);
export const o = observable.o;

// `export const html = htm.bind(h)` is not tree-shakeable!
export function html() {
  return htm.apply(h, arguments);
}

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export function svg() {
  return htm.apply(hs, arguments);
}

export { api, context, o as observable };

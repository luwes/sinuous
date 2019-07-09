/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import { context } from 'sinuous/h';
import * as api from 'sinuous/observable';
import htm from 'sinuous/htm';

export const o = api.o;
export const h = context(api);
export { context, o as observable };

// `export const html = htm.bind(h)` is not tree-shakeable!
export function html() {
  return htm.apply(h, arguments);
}

/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import { context, normalizeArray } from 'sinuous/h';
import observable, * as api from 'sinuous/observable';
import htm from 'sinuous/htm';

export const h = context(api);
export default context;
export {
  observable,
  observable as o,
  normalizeArray as na
};

// `export const html = htm.bind(h)` is not tree-shakeable!
export function html() {
  return htm.apply(h, arguments);
}

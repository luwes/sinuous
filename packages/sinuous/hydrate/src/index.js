import htm from 'sinuous/htm';
import { context } from './hydrate.js';
export { hydrate, _ } from './hydrate.js';

export const d = context();
export const ds = context(true);

// `export const html = htm.bind(h)` is not tree-shakeable!
export function dhtml() {
  return htm.apply(d, arguments);
}

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export function dsvg() {
  return htm.apply(ds, arguments);
}

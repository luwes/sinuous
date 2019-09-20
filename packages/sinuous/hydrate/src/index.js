import htm from 'sinuous/htm';
import { context } from './hydrate.js';
export { hydrate, _ } from './hydrate.js';

export const h = context();
export const hs = context(true);

// `export const html = htm.bind(h)` is not tree-shakeable!
export function html() {
  return htm.apply(h, arguments);
}

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export function svg() {
  return htm.apply(hs, arguments);
}

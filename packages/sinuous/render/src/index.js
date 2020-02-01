import htm from 'sinuous/htm';
import { context } from './render.js';
export { render, x } from './render.js';

export const r = context();
export const rs = context(true);

// `export const html = htm.bind(h)` is not tree-shakeable!
export function rhtml() {
  return htm.apply(r, arguments);
}

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export function rsvg() {
  return htm.apply(rs, arguments);
}

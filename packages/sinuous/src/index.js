/*
 * Sinuous by Wesley Luyten (@luwes).
 * Really ties all the packages together.
 */
import {
  o,
  observable,
  subscribe,
  cleanup,
  root,
  sample
} from 'sinuous/observable';
import { api } from 'sinuous/h';
import htm from 'sinuous/htm';

// Maintain object reference outside of context()
Object.assign(api, { subscribe, cleanup, root, sample, svgMode: 0 });

// Set `h` to work with an SVG namespace for the duration of the closure
export function svgWrap(closure) {
  api.svgMode++;
  const node = closure();
  api.svgMode--;
  return node;
}

// Makes it possible to intercept `h` calls and customize.
export function h() {
  return api.h.apply(api.h, arguments);
}

// Makes it possible to intercept `hs` calls and customize.
export function hs() {
  return svgWrap(() => api.h.apply(api.h, arguments));
}

// `export const html = htm.bind(h)` is not tree-shakeable!
export function html() {
  return htm.apply(h, arguments);
}

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export function svg() {
  return htm.apply(hs, arguments);
}

export { api, o, observable };

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
import { api, context } from 'sinuous/h';
import htm from 'sinuous/htm';

api.h = context({ subscribe, cleanup, root, sample });
api.hs = context({ subscribe, cleanup, root, sample }, true);

// Makes it possible to intercept `h` calls and customize.
export function h() {
  return api.h.apply(api.h, arguments);
}

// Makes it possible to intercept `hs` calls and customize.
export function hs() {
  return api.hs.apply(api.hs, arguments);
}

// `export const html = htm.bind(h)` is not tree-shakeable!
export function html() {
  return htm.apply(h, arguments);
}

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export function svg() {
  return htm.apply(hs, arguments);
}

export { api, context, o, observable };

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

// Minified this is actually smaller than Object.assign(api, { ... })
api.subscribe = subscribe;
api.cleanup = cleanup;
api.root = root;
api.sample = sample;

api.hs = (...args) => {
  api.s = true;
  const el = h(...args);
  api.s = false;
  return el;
};

// Makes it possible to intercept `h` calls and customize.
export const h = (...args) =>
  api.h.apply(api.h, args);

// Makes it possible to intercept `hs` calls and customize.
export const hs = (...args) =>
  api.hs.apply(api.hs, args);

// `export const html = htm.bind(h)` is not tree-shakeable!
export const html = (...args) =>
  htm.apply(h, args);

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export const svg = (...args) =>
  htm.apply(hs, args);

export { api, o, observable };

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

/* eslint-disable fp/no-rest-parameters,@typescript-eslint/no-use-before-define */

Object.assign(api, { subscribe, cleanup, root, sample });

// Makes it possible to intercept `h` calls and customize.
export const h = (...args) =>
  api.h.apply(api.h, args);

// Makes it possible to intercept `hs` calls and customize.
export const hs = (...args) =>
  svgJSX(() => api.h.apply(api.h, args));

// `export const html = htm.bind(h)` is not tree-shakeable!
export const html = (...args) =>
  htm.apply(h, args);

// `export const svg = htm.bind(hs)` is not tree-shakeable!
export const svg = (...args) =>
  htm.apply(hs, args);

// Set `h` to work with an SVG namespace for the duration of the closure
export const svgJSX = (closure) => {
  return api.s++, closure = closure(), api.s--, closure;
};

export { api, o, observable };

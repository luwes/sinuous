import {
  o,
  observable,
  subscribe,
  cleanup,
  root,
  sample
} from 'sinuous/observable';
import { api } from 'sinuous/h';

/* eslint-disable fp/no-rest-parameters,@typescript-eslint/no-use-before-define */

// Minified this is actually smaller than Object.assign(api, { ... })
api.subscribe = subscribe;
api.cleanup = cleanup;
api.root = root;
api.sample = sample;

// Makes it possible to intercept `h` calls and customize.
export const h = (...args) =>
  api.h.apply(api.h, args);

// Set `h` to work with an SVG namespace for the duration of the closure
export const svgJSX = (closure) => {
  return api.s++, closure = closure(), api.s--, closure;
};

export { api, o, observable };

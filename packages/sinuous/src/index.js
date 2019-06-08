/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import { context } from '../h/src/index.js';
import observable, * as api from '../observable/src/index.js';

export const h = context(api);
export default context;
export {
  observable,
  observable as o
};

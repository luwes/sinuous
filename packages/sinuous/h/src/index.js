/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import { add } from './add.js';
import { insert } from './insert.js';
import { property } from './property.js';
import { api } from './api.js';

api.insert = insert;
api.property = property;
api.add = add;

export { context } from './h.js';
export { api };

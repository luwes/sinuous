/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import { api } from './api.js';

import { h } from './h.js';
import { add } from './add.js';
import { insert } from './insert.js';
import { property } from './property.js';
import { removeNodes } from './remove-nodes.js';

api.h = h;
api.insert = insert;
api.property = property;
api.add = add;
api.rm = removeNodes;

export { api };

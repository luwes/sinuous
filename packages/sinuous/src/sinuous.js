/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import { context } from './h.js';
import { insert } from './insert.js';

export default function sinuous(wrap, sample) {
  return context({
    wrap,
    insert,
    sample
  });
}

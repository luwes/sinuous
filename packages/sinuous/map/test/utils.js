import test from 'tape';
import { normalizeIncomingArray } from '../src/utils.js';

test('normalizeIncomingArray', function(t) {
  const frag = document.createDocumentFragment();
  const el = document.createElement('div');
  const comment = document.createComment('');
  frag.appendChild(el);
  frag.appendChild(comment);
  const arr = [comment, el];
  const expected = [el, comment, comment, el, el];
  t.deepEqual(normalizeIncomingArray([], [frag, true, null, arr, false, el]), expected);
  t.assert(normalizeIncomingArray([], [99])[0].nodeType === 3);
  t.end();
});

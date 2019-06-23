import test from 'tape';
import { h } from 'sinuous';
import { GROUPING, BACKWARD } from '../src/constants.js';
import { normalizeIncomingArray, step } from '../src/utils.js';

test('normalizeIncomingArray', function(t) {
  const frag = document.createDocumentFragment();
  const el = document.createElement('div');
  const comment = document.createComment('');
  frag.appendChild(el);
  frag.appendChild(comment);
  const arr = [comment, el];
  const expected = [el, comment, comment, el, el];
  t.deepEqual(
    normalizeIncomingArray([], [frag, true, null, arr, false, el]),
    expected
  );
  t.assert(normalizeIncomingArray([], [99])[0].nodeType === 3);
  t.end();
});

test('step', function(t) {
  let newAfterNode;
  let prevEndNode;
  h('div', [
    newAfterNode = h('div', { [GROUPING]: 37 }),
    h('div'),
    prevEndNode = h('div', { [GROUPING]: 37 })
  ]);
  t.equal(step(prevEndNode, BACKWARD, true), newAfterNode);
  t.end();
});

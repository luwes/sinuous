import test from 'tape';
import { h } from 'sinuous';
import { GROUPING, BACKWARD } from '../src/constants.js';
import { step } from '../src/utils.js';

test('step', function(t) {
  let newAfterNode;
  let prevEndNode;
  h('div', [
    (newAfterNode = h('div', { [GROUPING]: 37 })),
    h('div'),
    (prevEndNode = h('div', { [GROUPING]: 37 }))
  ]);
  t.equal(step(prevEndNode, BACKWARD, true), newAfterNode);
  t.end();
});

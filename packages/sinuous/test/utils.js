import test from 'tape';
import { assign } from '../src/utils.js';

test('assign', function(t) {
  const target = {
    a: 1,
    b: 2
  };
  const source = {
    c: 3
  };
  const expected = {
    a: 1,
    b: 2,
    c: 3
  };

  const result = assign(target, source);
  t.equal(result, target);
  t.deepEqual(result, expected);
  t.end();
});

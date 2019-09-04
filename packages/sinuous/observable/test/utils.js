import test from 'tape';
import { getChildrenDeep } from '../src/utils.js';

test('getChildrenDeep', function(t) {
  const child = {
    name: 'child',
    _children: []
  };
  const child2 = {
    name: 'child2',
    _children: []
  };
  const father = {
    name: 'father',
    _children: [
      child,
      child2
    ]
  };
  const grandfather = {
    name: 'grandfather',
    _children: [
      father
    ]
  };

  t.deepEqual(getChildrenDeep(grandfather._children, []), [
    father,
    child,
    child2
  ]);

  t.end();
});

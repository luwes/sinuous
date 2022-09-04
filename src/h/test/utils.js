import test from 'tape';
import { removeNodes } from '../src/remove-nodes.js';

test('removeNodes', function(t) {
  const parent = document.createElement('div');
  let first = parent.appendChild(document.createComment(''));
  parent.appendChild(document.createElement('span'));
  let endMark = parent.appendChild(document.createTextNode(''));

  removeNodes(parent, first, endMark);

  t.equal(parent.innerHTML, '');
  t.equal(parent.childNodes.length, 1);

  t.end();
});

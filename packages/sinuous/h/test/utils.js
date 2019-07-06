import test from 'tape';
import { normalizeArray, clearAll } from '../src/utils.js';

test('normalizeArray', function(t) {
  const frag = document.createDocumentFragment();
  const el = document.createElement('div');
  const comment = document.createComment('');
  frag.appendChild(el);
  frag.appendChild(comment);
  const arr = [comment, el];
  const expected = [el, comment, comment, el, el];
  t.deepEqual(normalizeArray([], [frag, true, null, arr, false, el]), expected);
  t.assert(normalizeArray([], [99])[0].nodeType === 3);
  t.end();
});

test('clearAll', function(t) {
  const parent = document.createElement('div');
  parent.appendChild(document.createComment(''));
  parent.appendChild(document.createElement('span'));
  clearAll(parent);
  t.equal(parent.innerHTML, '');
  t.equal(parent.childNodes.length, 0);

  let current = [];
  current.push(parent.appendChild(document.createComment('')));
  current.push(parent.appendChild(document.createElement('span')));
  clearAll(parent, current);
  t.equal(parent.innerHTML, '');
  t.equal(parent.childNodes.length, 0);

  current = 99;
  parent.appendChild(document.createTextNode('first'));
  parent.appendChild(document.createElement('div'));
  parent.appendChild(document.createElement('b'));
  let marker = document.createComment('');
  parent.appendChild(marker);
  clearAll(parent, current, marker);
  t.equal(parent.innerHTML, 'first<div></div><!---->');
  t.equal(parent.childNodes.length, 3);

  clearAll(parent);
  parent.appendChild(document.createTextNode('first'));
  const startNode = document.createElement('span');
  parent.appendChild(startNode);
  parent.appendChild(document.createElement('div'));
  parent.appendChild(document.createElement('b'));
  marker = document.createComment('');
  parent.appendChild(marker);
  clearAll(parent, current, marker, startNode);
  t.equal(parent.innerHTML, 'first<span></span><!---->');
  t.equal(parent.childNodes.length, 3);

  t.end();
});

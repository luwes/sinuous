import test from 'tape';
import { assign, normalizeIncomingArray, clearAll } from '../src/utils.js';

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
  let marker = document.createTextNode('');
  parent.appendChild(marker);
  clearAll(parent, current, marker);
  t.equal(parent.innerHTML, 'first<div></div>');
  t.equal(parent.childNodes.length, 3);

  clearAll(parent);
  parent.appendChild(document.createTextNode('first'));
  const startNode = document.createElement('span');
  parent.appendChild(startNode);
  parent.appendChild(document.createElement('div'));
  parent.appendChild(document.createElement('b'));
  marker = document.createTextNode('');
  parent.appendChild(marker);
  clearAll(parent, current, marker, startNode);
  t.equal(parent.innerHTML, 'first<span></span>');
  t.equal(parent.childNodes.length, 3);

  t.end();
});

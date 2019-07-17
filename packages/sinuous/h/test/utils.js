import test from 'tape';
import { clearAll } from '../src/utils.js';

test('clearAll', function(t) {
  const parent = document.createElement('div');
  parent.appendChild(document.createComment(''));
  parent.appendChild(document.createElement('span'));
  clearAll(parent);
  t.equal(parent.innerHTML, '');
  t.equal(parent.childNodes.length, 0);

  let current = 99;
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
  parent.appendChild(document.createElement('span'));
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

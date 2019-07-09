import test from 'tape';
import { subscribe } from 'sinuous/observable';
import { h } from 'sinuous';
import { insert } from '../src/insert.js';

// insert with Markers
// <div>before<!-- insert -->after</div>

function insertValue(val) {
  const parent = clone(container);
  insert(subscribe, parent, val, parent.childNodes[1]);
  return parent;
}

// IE doesn't clone empty text nodes
function clone(el) {
  const cloned = el.cloneNode(true);
  cloned.textContent = '';
  [].slice.call(el.childNodes).forEach(n => cloned.appendChild(n.cloneNode()));
  return cloned;
}

const container = document.createElement('div');
container.appendChild(document.createTextNode('before'));
container.appendChild(document.createTextNode(''));
container.appendChild(document.createTextNode('after'));

test('inserts nothing for null', t => {
  const res = insertValue(null);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for undefined', t => {
  const res = insertValue(undefined);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for false', t => {
  const res = insertValue(false);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for true', t => {
  const res = insertValue(true);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('can insert strings', t => {
  let res = insertValue('foo');
  t.equal(res.innerHTML, 'beforefooafter');
  t.equal(res.childNodes.length, 4);

  res = insertValue('');
  t.equal(res.innerHTML, 'beforeafter');
  t.end();
});

test('can insert a node', t => {
  const node = document.createElement('span');
  node.textContent = 'foo';
  t.equal(insertValue(node).innerHTML, 'before<span>foo</span>after');
  t.end();
});

test('can re-insert a node, thereby moving it', t => {
  var node = document.createElement('span');
  node.textContent = 'foo';

  const first = insertValue(node),
    second = insertValue(node);

  t.equal(first.innerHTML, 'beforeafter');
  t.equal(second.innerHTML, 'before<span>foo</span>after');
  t.end();
});

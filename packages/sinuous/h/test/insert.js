import test from 'tape';
import { subscribe } from 'sinuous/observable';
import { h } from 'sinuous';
import { insert } from '../src/insert.js';

const insertValue = val => {
  const parent = container.cloneNode(true);
  insert(subscribe, parent, val);
  return parent;
};

// insert
// <div>before<!-- insert -->after</div>
const container = document.createElement('div');

test('inserts nothing for null', t => {
  const res = insertValue(null);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for undefined', t => {
  const res = insertValue(undefined);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for false', t => {
  const res = insertValue(false);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for true', t => {
  const res = insertValue(true);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for null in array', t => {
  const res = insertValue(['a', null, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('inserts nothing for undefined in array', t => {
  const res = insertValue(['a', undefined, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('inserts nothing for false in array', t => {
  const res = insertValue(['a', false, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('inserts nothing for true in array', t => {
  const res = insertValue(['a', true, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('can insert strings', t => {
  let res = insertValue('foo');
  t.equal(res.innerHTML, 'foo');
  t.equal(res.childNodes.length, 1);

  res = insertValue('foobar');
  t.equal(res.innerHTML, 'foobar');
  t.equal(res.childNodes.length, 1);
  t.end();
});

test('can insert a node', t => {
  const node = document.createElement('span');
  node.textContent = 'foo';
  t.equal(insertValue(node).innerHTML, '<span>foo</span>');
  t.end();
});

test('can re-insert a node, thereby moving it', t => {
  const node = document.createElement('span');
  node.textContent = 'foo';

  const first = insertValue(node),
    second = insertValue(node);

  t.equal(first.innerHTML, '');
  t.equal(second.innerHTML, '<span>foo</span>');
  t.end();
});

test('can insert an array of strings', t => {
  t.equal(insertValue(['foo', 'bar']).innerHTML, 'foobar', 'array of strings');
  t.end();
});

test('can insert an array of nodes', t => {
  const nodes = [document.createElement('span'), document.createElement('div')];
  nodes[0].textContent = 'foo';
  nodes[1].textContent = 'bar';
  t.equal(insertValue(nodes).innerHTML, '<span>foo</span><div>bar</div>');
  t.end();
});

test('can insert a changing array of nodes', t => {
  var parent = document.createElement('div'),
    current = '',
    n1 = document.createElement('span'),
    n2 = document.createElement('div'),
    n3 = document.createElement('span'),
    n4 = document.createElement('div'),
    orig = [n1, n2, n3, n4];

  n1.textContent = '1';
  n2.textContent = '2';
  n3.textContent = '3';
  n4.textContent = '4';

  var origExpected = expected(orig);

  // identity
  test([n1, n2, n3, n4]);

  // 1 missing
  test([n2, n3, n4]);
  test([n1, n3, n4]);
  test([n1, n2, n4]);
  test([n1, n2, n3]);

  // 2 missing
  test([n3, n4]);
  test([n2, n4]);
  test([n2, n3]);
  test([n1, n4]);
  test([n1, n3]);
  test([n1, n2]);

  // 3 missing
  test([n1]);
  test([n2]);
  test([n3]);
  test([n4]);

  // all missing
  test([]);

  // swaps
  test([n2, n1, n3, n4]);
  test([n3, n2, n1, n4]);
  test([n4, n2, n3, n1]);

  // rotations
  test([n2, n3, n4, n1]);
  test([n3, n4, n1, n2]);
  test([n4, n1, n2, n3]);

  // reversal
  test([n4, n3, n2, n1]);

  function test(array) {
    current = insert(subscribe, parent, array, undefined, current);
    t.equal(parent.innerHTML, expected(array));
    current = insert(subscribe, parent, orig, undefined, current);
    t.equal(parent.innerHTML, origExpected);
  }

  function expected(array) {
    return array.map(n => n.outerHTML).join('');
  }

  t.end();
});

test('can insert nested arrays', t => {
  let current = insertValue(['foo', ['bar', 'blech']]);
  t.equal(current.innerHTML, 'foobarblech', 'array of array of strings');
  t.end();
});

test('can update arrays of nodes with node', t => {
  const parent = container.cloneNode(true);

  let current = insert(subscribe, parent, []);
  t.equal(parent.innerHTML, '', 'empty array');

  insert(subscribe, parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  current = insert(subscribe, parent, [h('h1')]);
  t.equal(parent.innerHTML, '<h1></h1>', 'array of node');

  insert(subscribe, parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  current = insert(subscribe, parent, [h('h1'), h('h1'), h('h1')]);
  t.equal(parent.innerHTML, '<h1></h1><h1></h1><h1></h1>', 'array of nodes');

  insert(subscribe, parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');
  t.end();
});

test('can update text with node', t => {
  const parent = container.cloneNode(true);

  let current = insert(subscribe, parent, '🧬');
  t.equal(parent.innerHTML, '🧬', 'text dna');

  insert(subscribe, parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');
  t.end();
});

test('can update array with text with marker', t => {
  const parent = container.cloneNode(true);
  const marker = parent.appendChild(document.createTextNode(''));

  let current = insert(subscribe, parent, h('h1', '⛄️'), marker);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  insert(subscribe, parent, '⛄️', marker, current);
  t.equal(parent.innerHTML, '⛄️');
  t.end();
});

test('throws on unsupported value', t => {
  const parent = container.cloneNode(true);
  t.throws(() => insert(subscribe, parent, {}));
  t.end();
});

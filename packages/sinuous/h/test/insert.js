import test from 'tape';
import sinuous from 'sinuous';
const subscribe = fn => fn();
const h = sinuous({ subscribe });
h.insert = h.insert.bind(h, subscribe);

const insert = val => {
  const parent = container.cloneNode(true);
  h.insert(parent, val);
  return parent;
};

// h.insert
// <div>before<!-- insert -->after</div>
const container = document.createElement('div');

test('inserts nothing for null', t => {
  const res = insert(null);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for undefined', t => {
  const res = insert(undefined);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for false', t => {
  const res = insert(false);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for true', t => {
  const res = insert(true);
  t.equal(res.innerHTML, '');
  t.equal(res.childNodes.length, 0);
  t.end();
});

test('inserts nothing for null in array', t => {
  const res = insert(['a', null, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('inserts nothing for undefined in array', t => {
  const res = insert(['a', undefined, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('inserts nothing for false in array', t => {
  const res = insert(['a', false, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('inserts nothing for true in array', t => {
  const res = insert(['a', true, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 2);
  t.end();
});

test('can insert strings', t => {
  const res = insert('foo');
  t.equal(res.innerHTML, 'foo');
  t.equal(res.childNodes.length, 1);
  t.end();
});

test('can insert a node', t => {
  const node = document.createElement('span');
  node.textContent = 'foo';
  t.equal(insert(node).innerHTML, '<span>foo</span>');
  t.end();
});

test('can re-insert a node, thereby moving it', t => {
  const node = document.createElement('span');
  node.textContent = 'foo';

  const first = insert(node),
    second = insert(node);

  t.equal(first.innerHTML, '');
  t.equal(second.innerHTML, '<span>foo</span>');
  t.end();
});

// test('can spread over element', (t) => {
//   const node = document.createElement("span");
//   r.spread(node, () => ({href: '/', for: 'id', classList: {danger: true}, events: {custom: e => e}, style: {color: 'red'}, something: 'good'}))
//   t.equal(node.getAttribute('href'), '/');
//   t.equal(node.htmlFor, 'id');
//   t.equal(node.className, 'danger');
//   t.equal(node.style.color, 'red');
//   t.equal(node.something, 'good');
// });

test('can insert an array of strings', t => {
  t.equal(insert(['foo', 'bar']).innerHTML, 'foobar', 'array of strings');
  t.end();
});

test('can insert an array of nodes', t => {
  const nodes = [document.createElement('span'), document.createElement('div')];
  nodes[0].textContent = 'foo';
  nodes[1].textContent = 'bar';
  t.equal(insert(nodes).innerHTML, '<span>foo</span><div>bar</div>');
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
    current = h.insert(parent, array, undefined, current);
    t.equal(parent.innerHTML, expected(array));
    current = h.insert(parent, orig, undefined, current);
    t.equal(parent.innerHTML, origExpected);
  }

  function expected(array) {
    return array.map(n => n.outerHTML).join('');
  }

  t.end();
});

test('can insert nested arrays', t => {
  let current = insert(['foo', ['bar', 'blech']]);
  t.equal(current.innerHTML, 'foobarblech', 'array of array of strings');
  t.end();
});

test('can update arrays of nodes with node', t => {
  const parent = container.cloneNode(true);

  let current = h.insert(parent, []);
  t.equal(parent.innerHTML, '', 'empty array');

  h.insert(parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  current = h.insert(parent, [h('h1')]);
  t.equal(parent.innerHTML, '<h1></h1>', 'array of node');

  h.insert(parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  current = h.insert(parent, [h('h1'), h('h1'), h('h1')]);
  t.equal(parent.innerHTML, '<h1></h1><h1></h1><h1></h1>', 'array of nodes');

  h.insert(parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');
  t.end();
});

test('can update text with node', t => {
  const parent = container.cloneNode(true);

  let current = h.insert(parent, '🐍');
  t.equal(parent.innerHTML, '🐍', 'text snake');

  h.insert(parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');
  t.end();
});

test('can update array with text with marker', t => {
  const parent = container.cloneNode(true);
  const marker = parent.appendChild(document.createTextNode(''));

  let current = h.insert(parent, h('h1', '⛄️'), marker);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  h.insert(parent, '⛄️', marker, current);
  t.equal(parent.innerHTML, '⛄️');
  t.end();
});

test('throws on unsupported value', t => {
  const parent = container.cloneNode(true);
  t.throws(() => h.insert(parent, {}));
  t.end();
});

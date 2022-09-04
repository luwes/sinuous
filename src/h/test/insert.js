import test from 'tape';
import { o, h, html } from 'sinuous';
import { insert } from '../src/insert.js';

const insertValue = val => {
  const parent = container.cloneNode(true);
  insert(parent, val);
  return parent;
};

// insert
// <div>before<!-- insert -->after</div>
const container = document.createElement('div');

test('inserts observable into simple text', t => {
  let scratch = h('div');
  h(document.body, scratch);

  const counter = o(0);
  scratch.appendChild(html`
    Here's a list of items: Count: ${counter}
  `);
  t.equal(scratch.innerHTML, `Here's a list of items: Count: 0`);

  counter(counter() + 1);
  t.equal(scratch.innerHTML, `Here's a list of items: Count: 1`);

  t.end();
});

test('inserts fragments', t => {
  const frag = o(html`
    <h1>Hello world</h1>
    <p>Bye bye</p>
  `);
  const res = html`
    <div>${frag}</div>
  `;
  t.equal(res.innerHTML, '<h1>Hello world</h1><p>Bye bye</p>');
  t.equal(res.children.length, 2);

  frag(
    html`
      <h1>Cool</h1>
      <p>Beans</p>
    `
  );
  t.equal(res.innerHTML, '<h1>Cool</h1><p>Beans</p>');
  t.equal(res.children.length, 2);

  frag('make it a string');
  t.equal(res.innerHTML, 'make it a string');
  t.equal(res.childNodes.length, 4);

  frag(
    html`
      <h1>Cool</h1>
      <p>Beans</p>
    `
  );
  t.equal(res.innerHTML, '<h1>Cool</h1><p>Beans</p>');
  t.equal(res.children.length, 2);

  t.end();
});

test('inserts long fragments', t => {
  const frag = o(html`
    <h1>Hello world</h1>
    <p>Bye bye</p>
    <p>Hello again</p>
  `);
  const res = html`
    <div>${frag}</div>
  `;
  t.equal(
    res.innerHTML,
    '<h1>Hello world</h1><p>Bye bye</p><p>Hello again</p>'
  );
  t.equal(res.children.length, 3);

  frag(html`
    <p>Hello again</p>
    <p>Bye bye</p>
    <h1>Hello world</h1>
  `);
  t.equal(
    res.innerHTML,
    '<p>Hello again</p><p>Bye bye</p><h1>Hello world</h1>'
  );
  t.equal(res.children.length, 3);

  t.end();
});

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
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for undefined in array', t => {
  const res = insertValue(['a', undefined, 'b']);
  t.equal(res.innerHTML, 'ab');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('can insert stringable', t => {
  let res = insertValue('foo');
  t.equal(res.innerHTML, 'foo');
  t.equal(res.childNodes.length, 1);

  res = insertValue(11206);
  t.equal(res.innerHTML, '11206');
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

test('can insert a changing array of nodes 1', t => {
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
    current = insert(parent, array, undefined, current);
    t.equal(parent.innerHTML, expected(array));
    current = insert(parent, orig, undefined, current);
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

test('can update text with node', t => {
  const parent = container.cloneNode(true);

  let current = insert(parent, '🧬');
  t.equal(parent.innerHTML, '🧬', 'text dna');

  insert(parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');
  t.end();
});

test('can update content with text with marker', t => {
  const parent = container.cloneNode(true);
  const marker = parent.appendChild(document.createTextNode(''));

  let current = insert(parent, h('h1', '⛄️'), marker);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  insert(parent, '⛄️', marker, current);
  t.equal(parent.innerHTML, '⛄️');
  t.end();
});

test('can update content with text and observable with marker', t => {
  const parent = container.cloneNode(true);
  const marker = parent.appendChild(document.createTextNode(''));

  const reactive = o('reactive');
  const dynamic = o(99);

  insert(parent, h('h1', reactive, '⛄️', dynamic), marker);
  t.equal(parent.innerHTML, '<h1>reactive⛄️99</h1>');

  dynamic(77);
  t.equal(parent.innerHTML, '<h1>reactive⛄️77</h1>');

  reactive(1);
  t.equal(parent.innerHTML, '<h1>1⛄️77</h1>');

  dynamic('');
  t.equal(parent.innerHTML, '<h1>1⛄️</h1>');

  reactive('');
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  insert(parent, '⛄️', marker, parent.children[0]);
  t.equal(parent.innerHTML, '⛄️');
  t.end();
});

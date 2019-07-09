import test from 'tape';
import { subscribe } from 'sinuous/observable';
import { o, h, html } from 'sinuous';
import { insert } from '../src/insert.js';

const insertValue = val => {
  const parent = container.cloneNode(true);
  insert(subscribe, parent, val);
  return parent;
};

// insert
// <div>before<!-- insert -->after</div>
const container = document.createElement('div');

test('inserts fragments', t => {
  const frag = o(html`
    <h1>Hello world</h1>
    <p>Bye bye</p>
  `);
  const res = html`<div>${frag}</div>`;
  t.equal(res.innerHTML, '<h1>Hello world</h1><p>Bye bye</p>');
  t.equal(res.children.length, 2);

  frag(html`<h1>Cool</h1><p>Beans</p>`);
  t.equal(res.innerHTML, '<h1>Cool</h1><p>Beans</p>');
  t.equal(res.children.length, 2);

  frag('make it a string');
  t.equal(res.innerHTML, 'make it a string');
  t.equal(res.childNodes.length, 2);

  frag(html`<h1>Cool</h1><p>Beans</p>`);
  t.equal(res.innerHTML, '<h1>Cool</h1><p>Beans</p>');
  t.equal(res.children.length, 2);

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

test('can update text with node', t => {
  const parent = container.cloneNode(true);

  let current = insert(subscribe, parent, '🧬');
  t.equal(parent.innerHTML, '🧬', 'text dna');

  insert(subscribe, parent, h('h1', '⛄️'), undefined, current);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');
  t.end();
});

test('can update content with text with marker', t => {
  const parent = container.cloneNode(true);
  const marker = parent.appendChild(document.createTextNode(''));

  let current = insert(subscribe, parent, h('h1', '⛄️'), marker);
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  insert(subscribe, parent, '⛄️', marker, current);
  t.equal(parent.innerHTML, '⛄️');
  t.end();
});

test('can update content with text and observable with marker', t => {
  const parent = container.cloneNode(true);
  const marker = parent.appendChild(document.createTextNode(''));

  const reactive = o('reactive');
  const dynamic = o(99);

  let current = insert(
    subscribe,
    parent,
    h('h1', reactive, '⛄️', dynamic),
    marker
  );
  t.equal(parent.innerHTML, '<h1>reactive⛄️99</h1>');

  dynamic(77);
  t.equal(parent.innerHTML, '<h1>reactive⛄️77</h1>');

  reactive(1);
  t.equal(parent.innerHTML, '<h1>1⛄️77</h1>');

  dynamic('');
  t.equal(parent.innerHTML, '<h1>1⛄️</h1>');

  reactive('');
  t.equal(parent.innerHTML, '<h1>⛄️</h1>');

  insert(subscribe, parent, '⛄️', marker, current);
  t.equal(parent.innerHTML, '⛄️');
  t.end();
});

import test from 'tape';
import { h } from 'sinuous';
import addNode from '../src/add-node.js';

let counter = 0;

test('addNode does nothing for empty normalized array', function(t) {
  const parent = document.createElement('div');
  parent.appendChild(document.createTextNode('test'));

  addNode(parent, [null, true]);

  t.equal(parent.innerHTML, 'test');
  t.end();
});

test('addNode inserts normalized array of node', function(t) {
  const parent = document.createElement('div');
  parent.appendChild(document.createTextNode('test'));

  addNode(parent, [h('h1'), null, false]);

  t.equal(parent.innerHTML, 'test<h1></h1>');
  t.end();
});

test('addNode inserts fragment', function(t) {
  const parent = document.createElement('div');
  parent.appendChild(document.createTextNode('test'));

  const fragment = document.createDocumentFragment();
  fragment.appendChild(h('h1'));
  addNode(parent, fragment);

  t.equal(parent.innerHTML, 'test<h1></h1>');
  t.end();
});

test('addNode inserts array of nodes w/ marker', function(t) {
  const parent = document.createElement('div');
  parent.appendChild(document.createTextNode('test'));

  const marker = parent.appendChild(document.createElement('span'));
  addNode(parent, [h('h1'), h('h2')], marker, ++counter);

  t.equal(parent.innerHTML, 'test<h1></h1><h2></h2><span></span>');
  t.end();
});

test('addNode inserts fragment w/ marker', function(t) {
  const parent = document.createElement('div');
  parent.appendChild(document.createTextNode('test'));

  const marker = parent.appendChild(document.createElement('span'));
  const fragment = document.createDocumentFragment();
  fragment.appendChild(h('h1'));
  fragment.appendChild(h('h2'));
  addNode(parent, fragment, marker, ++counter);

  t.equal(parent.innerHTML, 'test<h1></h1><h2></h2><span></span>');
  t.end();
});

test('addNode inserts strings', function(t) {
  const parent = document.createElement('div');
  addNode(parent, '⛄');
  t.equal(parent.innerHTML, '⛄');
  t.end();
});

test('addNode inserts numbers', function(t) {
  const parent = document.createElement('div');
  addNode(parent, 99);
  t.equal(parent.innerHTML, '99');
  t.end();
});

test('addNode inserts nodes', function(t) {
  const parent = document.createElement('div');
  const node = document.createElement('div');
  t.equal(addNode(parent, node), node);
  t.end();
});

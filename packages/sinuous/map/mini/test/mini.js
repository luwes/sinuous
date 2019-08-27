import test from 'tape';
import * as api from 'sinuous/observable';
import { o, h } from 'sinuous';
import { map } from 'sinuous/map/mini';

const root = api.root;

let div;
const n1 = 'a',
  n2 = 'b',
  n3 = 'c',
  n4 = 'd';
const list = o([n1, n2, n3, n4]);
let dispose;
const Component = () =>
  root(d => {
    dispose = d;
    div = h('div', h('b'), h('i'), map(list, item => item), h('b'), h('i'));
  });

function apply(t, array) {
  list(array);
  t.equal(div.innerHTML, '<b></b><i></i>' + array.join('') + '<b></b><i></i>');
  list([n1, n2, n3, n4]);
  t.equal(div.innerHTML, '<b></b><i></i>abcd<b></b><i></i>');
}

test('Create map control flow', t => {
  Component();

  t.equal(div.innerHTML, '<b></b><i></i>abcd<b></b><i></i>');
  t.end();
});

test('1 missing', t => {
  apply(t, [n2, n3, n4]);
  apply(t, [n1, n3, n4]);
  apply(t, [n1, n2, n4]);
  apply(t, [n1, n2, n3]);
  t.end();
});

test('2 missing', t => {
  apply(t, [n3, n4]);
  apply(t, [n2, n4]);
  apply(t, [n2, n3]);
  apply(t, [n1, n4]);
  apply(t, [n1, n3]);
  apply(t, [n1, n2]);
  t.end();
});

test('3 missing', t => {
  apply(t, [n3]);
  apply(t, [n2]);
  apply(t, [n1]);
  apply(t, [n4]);
  t.end();
});

test('all missing', t => {
  apply(t, []);
  t.end();
});

test('swaps', t => {
  apply(t, [n2, n1, n3, n4]);
  apply(t, [n3, n2, n1, n4]);
  apply(t, [n4, n2, n3, n1]);
  t.end();
});

test('rotations', t => {
  apply(t, [n2, n3, n4, n1]);
  apply(t, [n3, n4, n1, n2]);
  apply(t, [n4, n1, n2, n3]);
  t.end();
});

test('reversal', t => {
  apply(t, [n4, n3, n2, n1]);
  t.end();
});

test('full replace', t => {
  apply(t, ['e', 'f', 'g', 'h']);
  t.end();
});

test('swap backward edge', t => {
  list(['milk', 'bread', 'chips', 'cookie', 'honey']);
  list(['chips', 'bread', 'cookie', 'milk', 'honey']);
  t.end();
});

test('dispose', t => {
  dispose();
  t.end();
});

import test from 'tape';
import * as api from 'sinuous/observable';
import { o, h } from 'sinuous';
import { map } from 'sinuous/map';

const root = api.root;

const list = o([h(['a', 1]), h(['b', 2]), h(['c', 3]), h(['d', 4])]);
const div = document.createElement('div');
div.appendChild(document.createElement('i'));
div.appendChild(document.createElement('b'));

let dispose;
root(d => {
  dispose = d;
  div.appendChild(map(list, item => item));
});

test('Basic map - create', t => {
  t.equal(div.innerHTML, '<i></i><b></b>a1b2c3d4');
  t.end();
});

test('Basic map - update', t => {
  list([h(['b', 2, 99]), h(['a', 1]), h(['c'])]);
  t.equal(div.innerHTML, '<i></i><b></b>b299a1c');
  t.end();
});

test('Basic map - clear', t => {
  list([]);
  t.equal(div.innerHTML, '<i></i><b></b>');
  t.end();
});

test('Basic map - dispose', t => {
  dispose();
  t.end();
});

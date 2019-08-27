import test from 'tape';
import * as api from 'sinuous/observable';
import { o, h } from 'sinuous';
import map from 'sinuous/map/mini';

const root = api.root;

const list = o(['a1', 'b2', 'c3', 'd4']);
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
  list(['b299', 'a1', 'c']);
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

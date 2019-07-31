import test from 'tape';
import * as api from 'sinuous/observable';
import { o, h, html } from 'sinuous';
import map from 'sinuous/map';

const root = api.root;

function divs(str) {
  return '<div>' + str.split(',').join('</div><div>') + '</div>';
}

const one = { text: o(1) };
const two = { text: o(2) };
const three = { text: o(3) };
const four = { text: o(4) };
const five = { text: o(5) };
const list = o([one, two, three, four, five]);

const div = document.createElement('div');
let dispose;
root(d => {
  dispose = d;
  div.appendChild(
    map(
      list,
      item =>
        html`
          <div>${item.text}</div>
        `
    )
  );
});

test('Object reference - create', t => {
  t.equal(div.innerHTML, divs('1,2,3,4,5'));
  t.end();
});

test('Object reference - update', t => {
  list([three, one, four, two]);
  t.equal(div.innerHTML, divs('3,1,4,2'));
  t.end();
});

test('Object reference - update 2', t => {
  list([one, one, three, two, one, three, four, three, three, four]);
  t.equal(div.innerHTML, divs('1,1,3,2,1,3,4,3,3,4'));
  t.end();
});

test('Object reference - update 3', t => {
  list([five, five, three, three, four]);
  t.equal(div.innerHTML, divs('5,5,3,3,4'));
  t.end();
});

test('Object reference - clear', t => {
  list([]);
  t.equal(div.innerHTML, '');
  t.end();
});

test('Object reference - dispose', t => {
  dispose();
  t.end();
});

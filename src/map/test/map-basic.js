import test from 'tape';
import { root } from 'sinuous/observable';
import { o, h, html } from 'sinuous';
import { map } from 'sinuous/map';

const list = o([]);
const show = o(true);
const fallback = o(html`<ul><li></li></ul>`);

let div;
let dispose;
root(d => {
  dispose = d;
  div = html`
    <div>
      ${() => show()
        ? html`${map(list, item => html`${item}`)}`
        : html`${fallback}`
      }
    </div>
  `;
});

test('Basic map - create', t => {
  list([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);
  t.equal(div.innerHTML, 'a1b2c3d4');
  t.end();
});

test('Basic map - update', t => {
  list([['b', 2, 99], ['a', 1], ['c']]);
  t.equal(div.innerHTML, 'b299a1c');
  t.end();
});

test('Basic map - clear', t => {
  list([]);
  t.equal(div.innerHTML, '');
  t.end();
});

test('Basic map - update 2', t => {
  show(false);
  list([['b', 2, 99], ['a', 1], ['c']]);
  t.equal(div.innerHTML, '<ul><li></li></ul>');
  t.end();
});

test('Basic map - clear 2', t => {
  show(true);
  list([]);
  fallback('');
  t.equal(div.innerHTML, '');
  t.end();
});

test('Basic map - update 3', t => {
  div.insertBefore(h('i'), div.firstChild);
  div.insertBefore(h('b'), div.firstChild);

  div.appendChild(h('i'));
  div.appendChild(h('b'));

  list([['b', 2, 99], ['a', 1], ['c']]);
  t.equal(div.innerHTML, '<b></b><i></i>b299a1c<i></i><b></b>');
  t.end();
});

test('Basic map - update 4', t => {
  list([]);
  show(false);
  fallback(html`<ul><li></li></ul>`);
  t.equal(div.innerHTML, '<b></b><i></i><ul><li></li></ul><i></i><b></b>');
  t.end();
});

test('Basic map - update 5', t => {
  show(true);
  fallback(11);
  t.equal(div.innerHTML, '<b></b><i></i><i></i><b></b>');
  t.end();
});

test('Basic map - dispose', t => {
  dispose();
  t.end();
});

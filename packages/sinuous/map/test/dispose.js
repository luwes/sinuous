import test from 'tape';
import sinuous from 'sinuous';
import map from 'sinuous/map';
import o, { subscribe, root, sample } from 'sinuous/observable';
const h = sinuous({ subscribe, root, sample });

function lis(str) {
  return '<li>' + str.split(',').join('</li><li>') + '</li>';
}

test("explicit h.cleanUp works and disposes observables", function(t) {
  let four = o(4);
  const list = o([1, 2, 3, four]);
  const el = h('ul', map(list, item => h('li', item)));
  t.equal(el.innerHTML, lis('1,2,3,4'));

  list([2, 2, four, 3]);
  t.equal(el.innerHTML, lis('2,2,4,3'));

  four(44);
  t.equal(el.innerHTML, lis('2,2,44,3'));

  h.cleanUp();

  four(44444);
  t.equal(el.innerHTML, lis('2,2,44,3'));

  list([9, 7, 8, 6]);
  t.equal(el.innerHTML, lis('2,2,44,3'));

  t.end();
});

test("emptying list disposes observables", function(t) {
  let four = o(4);
  const list = o([1, 2, 3, four]);

  const el = h('ul', map(list, item => h('li', item)));
  t.equal(el.innerHTML, lis('1,2,3,4'));

  list([2, 2, four, 3]);
  t.equal(el.innerHTML, lis('2,2,4,3'));

  four(44);
  t.equal(el.innerHTML, lis('2,2,44,3'));

  list([]);
  four(44444);
  t.equal(el.innerHTML, '');

  t.end();
});

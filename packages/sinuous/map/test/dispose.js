import test from 'tape';
import { root } from 'sinuous/observable';
import { o, h } from 'sinuous';
import map from 'sinuous/map';

function lis(str) {
  return '<li>' + str.split(',').join('</li><li>') + '</li>';
}

test('removing one observable diposes correct index', function(t) {
  let two = o(2);
  let four = o(4);
  let six = o(6);
  const list = o([1, two, 3, four, 5, six, 7]);
  const el = h('ul', map(list, item => h('li', item)));
  t.equal(el.innerHTML, lis('1,2,3,4,5,6,7'));

  list([1, two, four, 3, 5, six, 7]);
  t.equal(el.innerHTML, lis('1,2,4,3,5,6,7'));

  list([1, two, 3, six, 7]);
  four(44);
  two(22);
  t.equal(el.innerHTML, lis('1,22,3,6,7'));

  two(2);
  four(4444);
  six(66);
  t.equal(el.innerHTML, lis('1,2,3,66,7'));

  t.end();
});

test('explicit dispose works and disposes observables', function(t) {
  let four = o(4);
  const list = o([1, 2, 3, four]);
  let dispose;
  const el = root(d => {
    dispose = d;
    return h('ul', map(list, item => h('li', item)));
  });
  t.equal(el.innerHTML, lis('1,2,3,4'));

  list([2, 2, four, 3]);
  t.equal(el.innerHTML, lis('2,2,4,3'));

  four(44);
  t.equal(el.innerHTML, lis('2,2,44,3'));

  dispose();

  four(44444);
  t.equal(el.innerHTML, lis('2,2,44,3'));

  list([9, 7, 8, 6]);
  t.equal(el.innerHTML, lis('2,2,44,3'));

  t.end();
});

test('emptying list disposes observables', function(t) {
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

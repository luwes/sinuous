import test from 'tape';
import { root } from 'sinuous/observable';
import { o, h } from 'sinuous';
import map from 'sinuous/map';

function lis(str) {
  return '<li>' + str.split(',').join('</li><li>') + '</li>';
}

test('disposer index works correctly', function(t) {
  let one = o(1);
  let two = o(2);
  let three = o(3);
  let four = o(4);
  let five = o(5);
  // initialize 1, 2, 3, at indexes 0, 1, 2
  const list = o([one, two, three]);
  const el = h('ul', map(list, item => h('li', item)));
  t.equal(el.innerHTML, lis('1,2,3'));

  // insert 4, 5 at index 0, 1 overwriting disposers[0, 1]
  list([four, five, one, two, three]);
  t.equal(el.innerHTML, lis('4,5,1,2,3'));

  // remove 1, 2, with disposal index 0, 1, freeing disposers[0, 1]
  list([four, five, three]);
  t.equal(el.innerHTML, lis('4,5,3'));

  one(11);
  two(22);
  three(33);
  four(44);
  five(55);

  t.equal(el.innerHTML, lis('44,55,33'));

  t.end();
});

test('last algorithm insertNodes -> disposes correct index', function(t) {
  let one = o(1);
  let two = o(2);
  let three = o(3);
  let four = o(4);
  let five = o(5);
  const list = o([one, two, three, four, five]);
  const el = h('ul', map(list, item => h('li', item)));
  t.equal(el.innerHTML, lis('1,2,3,4,5'));

  list([one, four, five, three, two]);
  t.equal(el.innerHTML, lis('1,4,5,3,2'));

  list([one, two, three, four]);
  t.equal(el.innerHTML, lis('1,2,3,4'));

  one(11);
  two(22);
  three(33);
  four(44);
  five(55);

  t.equal(el.innerHTML, lis('11,22,33,44'));

  t.end();
});

test('swap backward -> disposes correct index', function(t) {
  let one = o(1);
  let two = o(2);
  let three = o(3);
  let four = o(4);
  let five = o(5);
  const list = o([one, two, three, four, five]);
  const el = h('ul', map(list, item => h('li', item)));
  t.equal(el.innerHTML, lis('1,2,3,4,5'));

  list([one, two, five, three, four]);
  t.equal(el.innerHTML, lis('1,2,5,3,4'));

  list([one, two, three, four]);
  t.equal(el.innerHTML, lis('1,2,3,4'));

  one(11);
  two(22);
  three(33);
  four(44);
  five(55);

  t.equal(el.innerHTML, lis('11,22,33,44'));

  t.end();
});

test('swap forward -> disposes correct index', function(t) {
  let one = o(1);
  let two = o(2);
  let three = o(3);
  let four = o(4);
  let five = o(5);
  const list = o([one, two, three, four, five]);
  const el = h('ul', map(list, item => h('li', item)));
  t.equal(el.innerHTML, lis('1,2,3,4,5'));

  list([two, three, one, four, five]);
  t.equal(el.innerHTML, lis('2,3,1,4,5'));

  list([two, three, four, five]);
  t.equal(el.innerHTML, lis('2,3,4,5'));

  one(11);
  two(22);
  three(33);
  four(44);
  five(55);

  t.equal(el.innerHTML, lis('22,33,44,55'));

  t.end();
});

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

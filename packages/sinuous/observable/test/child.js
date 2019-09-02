import test from 'tape';
import spy from 'ispy';
import {
  o,
  S
} from '../src/observable.js';

test('parent cleans up inner subscriptions', function(t) {
  let i = 0;

  const data = o(null);
  const cache = o(false);

  let childValue;
  let childValue2;

  const child = (d) => {
    S(function nested() {
      childValue = d();
      i++;
    });
    return 'Hi';
  };

  const child2 = (d) => {
    S(function nested2() {
      childValue2 = d();
    });
    return 'Hi';
  };

  S(function cacheFun(prev) {
    const d = !!data();
    if (d === prev) {
      return prev;
    }
    cache(d);
    return d;
  });

  // Run 1st time
  S(function memo() {
    cache();
    child2(data);
    child(data);
  });

  // 2nd
  data("name");
  t.equal(childValue, 'name');
  t.equal(childValue2, 'name');

  // 3rd
  data(null);
  t.equal(childValue, null);
  t.equal(childValue2, null);

  // 4th
  data("name2");
  t.equal(childValue, 'name2');
  t.equal(childValue2, 'name2');

  t.equal(i, 4);
  t.end();
});

test('parent cleans up inner conditional subscriptions', function(t) {
  let i = 0;

  const data = o(null);
  const cache = o(false);

  let childValue;

  const child = (d) => {
    S(function nested() {
      childValue = d();
      i++;
    });
    return 'Hi';
  };

  S(function cacheFun(prev) {
    const d = !!data();
    if (d === prev) {
      return prev;
    }
    cache(d);
    return d;
  });

  // Run 1st time
  S(function memo() {
    const c = cache();
    return c ? child(data) : undefined;
  });

  // 2nd
  data("name");
  t.equal(childValue, 'name');
  // data is null -> cache is false -> child is not run here
  data(null);
  t.equal(childValue, null);
  // 3rd
  data("name2");
  t.equal(childValue, 'name2');

  t.equal(i, 3);
  t.end();
});

test('deeply nested cleanup of subscriptions', function(t) {
  const data = o(null);

  const spy1 = spy();
  spy1.delegate = () => {
    spy2();
  };

  const spy2 = spy();
  spy2.delegate = () => {
    data();
    child3();
  };

  const spy3 = spy();
  spy3.delegate = () => {
    data();
  };

  const child1 = () => {
    S(spy1);
    return 'Hi';
  };

  const child3 = () => {
    S(spy3);
    return 'Hi';
  };

  S(() => {
    child1();
  });

  t.equal(spy1.callCount, 1);
  t.equal(spy3.callCount, 1);

  data('banana');

  t.equal(spy3.callCount, 2);

  t.end();
});

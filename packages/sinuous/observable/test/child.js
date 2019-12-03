import test from 'tape';
import spy from 'ispy';
import { o, S, transaction, observable, sample } from '../src/observable.js';

test('parent cleans up inner subscriptions', function(t) {
  let i = 0;

  const data = o(null);
  const cache = o(false);

  let childValue;
  let childValue2;

  const child = d => {
    S(function nested() {
      childValue = d();
      i++;
    });
    return 'Hi';
  };

  const child2 = d => {
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
  data('name');
  t.equal(childValue, 'name');
  t.equal(childValue2, 'name');

  // 3rd
  data(null);
  t.equal(childValue, null);
  t.equal(childValue2, null);

  // 4th
  data('name2');
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

  const child = d => {
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

  const memo = S(() => {
    const c = cache();
    return c ? child(data) : undefined;
  });

  let view;
  S(() => (view = memo()));

  t.equal(view, undefined);

  // Run 1st time
  data('name');
  t.equal(childValue, 'name');

  t.equal(view, 'Hi');

  // 2nd
  data('name2');
  t.equal(childValue, 'name2');

  // data is null -> cache is false -> child is not run here
  data(null);
  t.equal(childValue, 'name2');

  t.equal(view, undefined);

  t.equal(i, 2);
  t.end();
});

test('parent cleans up inner conditional subscriptions w/ other child', function(t) {
  let i = 0;

  const data = o(null);
  const cache = o(false);

  let childValue;
  let childValue2;

  const child = d => {
    S(function nested() {
      childValue = d();
      i++;
    });
    return 'Hi';
  };

  const child2 = d => {
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
  const memo = S(() => {
    const c = cache();
    child2(data);
    return c ? child(data) : undefined;
  });

  let view;
  S(() => (view = memo()));

  t.equal(view, undefined);

  // 2nd
  data('name');
  t.equal(childValue, 'name');
  t.equal(childValue2, 'name');

  t.equal(view, 'Hi');

  // 3rd
  data(null);
  t.equal(childValue, 'name');
  t.equal(childValue2, null);

  t.equal(view, undefined);

  // 4th
  data('name2');
  t.equal(childValue, 'name2');
  t.equal(childValue2, 'name2');

  t.equal(i, 2);
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

test('insures that new dependencies are updated before dependee', function(t) {
  var order = '';
  var a = o(0);

  var b = S(function x() {
    order += 'b';
    console.log('B');
    return a() + 1;
  });

  var c = S(function y() {
    order += 'c';
    console.log('C');
    return b() || d();
  });

  function z() {
    order += 'd';
    console.log('D');
    return a() + 10;
  }
  var d = S(z);

  t.equal(order, 'bcd', '1st bcd test');

  order = '';
  a(-1);

  t.equal(b(), 0, 'b equals 0');
  t.equal(order, 'bcd', '2nd bcd test');
  t.equal(d(), 9, 'd equals 9');
  t.equal(c(), 9, 'c equals d(9)');

  order = '';
  a(0);

  t.equal(order, 'bc', '3rd bcd test');
  t.equal(c(), 1);
  t.end();
});

test('unrelated state via transaction updates view correctly', function(t) {
  const data = observable(null),
    trigger = observable(false),
    cache = observable(sample(() => !!trigger())),
    child = data => {
      S(() => console.log('nested', data().length));
      return 'Hi';
    };

  S(prev => {
    const d = !!data();
    if (d === prev) return prev;
    cache(d);
    return d;
  });

  const memo = S(() => (cache() ? child(data) : undefined));

  let view;
  S(() => (view = memo()));
  t.equal(view, undefined);

  transaction(() => {
    trigger(true);
    data('name');
  });
  t.equal(view, 'Hi');

  transaction(() => {
    trigger(true);
    data('name2');
  });

  transaction(() => {
    data(undefined);
    trigger(false);
  });
  t.equal(view, undefined);

  t.end();
});

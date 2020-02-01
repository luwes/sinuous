import test from 'tape';
import { memo } from 'sinuous/memo';
import { html } from 'sinuous';

test('memo with multiple arguments', t => {
  // eslint-disable-next-line
  const memoized = memo((...args) =>
    args.reduce((sum, value) => sum + value, 0)
  );
  t.equal(memoized(1, 2), 3);
  t.equal(memoized(1), 1);
  t.end();
});

test('memo with functions', t => {
  // a rather absurd equals operation we can verify in tests
  let called = 0;
  const fn1 = (a) => a;
  const fn2 = (a) => a;
  const memoized = memo(a => {
    called++;
    return a;
  });
  t.equal(memoized(fn1), fn1);
  t.equal(called, 1);
  t.equal(memoized(fn2), fn2);
  t.equal(called, 2);
  t.end();
});

test('memo with functions in objects', t => {
  // a rather absurd equals operation we can verify in tests
  let called = 0;
  const fn1 = (a) => a;
  const fn2 = (a) => a;
  const obj1 = { fn1 };
  const obj2 = { fn2 };
  const memoized = memo(a => {
    called++;
    return a;
  });
  t.equal(memoized(obj1), obj1);
  t.equal(called, 1);
  t.equal(memoized({ fn1 }), obj1);
  t.equal(called, 1);
  t.equal(memoized(obj2), obj2);
  t.equal(called, 2);
  t.equal(typeof obj2.fn2, 'function');
  t.end();
});

test('memo with comparing object props', t => {
  // a rather absurd equals operation we can verify in tests
  let called = 0;
  const memoized = memo(a => {
    called++;
    return a;
  });
  let obj = { a: 9 };
  t.equal(memoized(obj), obj);
  t.equal(memoized({ a: 9 }), obj);
  t.equal(called, 1);

  let obj2 = { a: 7 };
  t.equal(memoized(obj2), obj2);
  t.equal(called, 2);

  t.end();
});

test('memo works with document fragments', t => {
  let called = 0;
  let props = {
    class: 99
  };
  const memoized = memo(p => {
    called++;
    return html`
      <h1>Sinuous</h1>
      <div class="${p.class}"></div>
    `;
  });

  t.equal(memoized(props), memoized({ class: 99 }));
  t.assert(Array.isArray(memoized(props)));
  t.equal(called, 1);
  t.equal(memoized(props).length, 2);

  t.end();
});

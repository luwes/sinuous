import test from 'tape';
import { memo } from 'sinuous/memo';
import { html } from 'sinuous';

test('exported memoize with multiple arguments', t => {
  // eslint-disable-next-line
  const memoized = memo((...args) =>
    args.reduce((sum, value) => sum + value, 0)
  );
  t.equal(memoized(1, 2), 3);
  t.equal(memoized(1), 1);
  t.end();
});

test('exported memoize with valueEquals override', t => {
  // a rather absurd equals operation we can verify in tests
  let called = 0;
  const valueEquals = (a, b) => typeof a === typeof b;
  const memoized = memo(a => {
    called++;
    return a;
  }, valueEquals);
  t.equal(memoized(1), 1);
  t.equal(memoized(2), 1); // yes, really true
  t.equal(called, 1);
  t.equal(memoized('A'), 'A');
  t.equal(called, 2);
  t.end();
});

test('exported memoize passes correct objects to equalityCheck', t => {
  let fallthroughs = 0;
  function shallowEqual(newVal, oldVal) {
    if (newVal === oldVal) return true;

    fallthroughs += 1; // code below is expensive and should be bypassed when possible

    let countA = 0;
    let countB = 0;
    for (let key in newVal) {
      if (
        Object.hasOwnProperty.call(newVal, key) &&
        newVal[key] !== oldVal[key]
      )
        return false;
      countA++;
    }
    for (let key in oldVal) {
      if (Object.hasOwnProperty.call(oldVal, key)) countB++;
    }
    return countA === countB;
  }

  const someObject = { foo: 'bar' };
  const anotherObject = { foo: 'bar' };
  const memoized = memo(a => a, shallowEqual);

  // the first call to `memoized` doesn't hit because `memo.lastArgs` is uninitialized
  // and so `equalityCheck` is never called
  memoized(someObject);
  t.equal(fallthroughs, 0, 'first call does not shallow compare');

  // the next call, with a different object reference, does fall through
  memoized(anotherObject);
  t.equal(fallthroughs, 1, 'call with different object does shallow compare');

  // the third call does not fall through because `memo` passes `anotherObject` as
  // both the `newVal` and `oldVal` params. This allows `shallowEqual` to be much more performant
  // than if it had passed `someObject` as `oldVal`, even though `someObject` and `anotherObject`
  // are shallowly equal
  memoized(anotherObject);
  t.equal(
    fallthroughs,
    1,
    'call with same object as previous call does not shallow compare'
  );

  t.end();
});

test('exported memoize with comparing object props', t => {
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

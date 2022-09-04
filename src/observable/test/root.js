import test from 'tape';
import { o, S, root } from '../src/observable.js';

test('allows subcomputations to escape their parents', function(t) {
  root(function() {
    var outerTrigger = o(null),
      innerTrigger = o(null),
      innerRuns = 0;

    S(function() {
      // register dependency to outer trigger
      outerTrigger();
      // inner computation
      root(function() {
        S(function() {
          // register dependency on inner trigger
          innerTrigger();
          // count total runs
          innerRuns++;
        });
      });
    });

    // at start, we have one inner computation, that's run once
    t.equal(innerRuns, 1);

    // trigger the outer computation, making more inners
    outerTrigger(null);
    outerTrigger(null);

    t.equal(innerRuns, 3);

    // now trigger inner signal: three orphaned computations should equal three runs
    innerRuns = 0;
    innerTrigger(null);

    t.equal(innerRuns, 3);
    t.end();
  });
});

//test("is necessary to create a toplevel computation", function () {
//    t.equal(() => {
//        S(() => 1)
//    }).toThrowError(/root/);
//});

test('does not freeze updates when used at top level', function(t) {
  root(() => {
    var s = o(1);
    var c = S(() => s());

    t.equal(c(), 1);
    s(2);
    t.equal(c(), 2);
    s(3);
    t.equal(c(), 3);
    t.end();
  });
});

test('persists through entire scope when used at top level', t => {
  root(() => {
    var s = o(1);

    S(() => s());
    s(2);

    var c2 = S(() => s());
    s(3);

    t.equal(c2(), 3);
    t.end();
  });
});

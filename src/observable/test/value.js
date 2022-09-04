import test from 'tape';
import { o, S, root } from '../src/observable.js';


function value(current, eq) {
  const v = o(current);
  return function(update) {
    if (!arguments.length) return v();
    if (!(eq ? eq(update, current) : update === current)) {
      current = v(update);
    }
    return update;
  };
}

test("takes and returns an initial value", function (t) {
    t.equal(value(1)(), 1);
    t.end();
});

test("can be set by passing in a new value", function (t) {
    var d = value(1);
    d(2);
    t.equal(d(), 2);
    t.end();
});

test("returns value being set", function (t) {
    var d = value(1);
    t.equal(d(2), 2);
    t.end();
});

test("does not propagate if set to equal value", function (t) {
    root(function () {
        var d = value(1),
            e = 0,
            f = S(function () { d(); return ++e; });

        t.equal(f(), 1);
        d(1);
        t.equal(f(), 1);
    });
    t.end();
});

test("propagate if set to unequal value", function (t) {
    root(function () {
        var d = value(1),
            e = 0,
            f = S(function () { d(); return ++e; });

        t.equal(f(), 1);
        d(1);
        t.equal(f(), 1);
        d(2);
        t.equal(f(), 2);
    });
    t.end();
});

test("can take an equality predicate", function (t) {
    root(function () {
        var d = value([1], function (a, b) { return a[0] === b[0]; }),
            e = 0,
            f = S(function () { d(); return ++e; });

        t.equal(f(), 1);
        d([1]);
        t.equal(f(), 1);
        d([2]);
        t.equal(f(), 2);
    });
    t.end();
});

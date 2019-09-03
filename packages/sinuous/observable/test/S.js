import test from 'tape';
import spy from 'ispy';
import { o, S } from '../src/observable.js';

// Tests from S.js

test('generates a function', function(t) {
  t.plan(1);
  var f = S(function() {
    return 1;
  });
  t.assert(typeof f === 'function');
});

test('returns initial value of wrapped function', function(t) {
  t.plan(1);
  var f = S(function() {
    return 1;
  });
  t.equal(f(), 1);
});

test('occurs once intitially', function(t) {
  var callSpy = spy();
  S(callSpy);
  t.equal(callSpy.callCount, 1);
  t.end();
});

test('does not re-occur when read', function(t) {
  var callSpy = spy(),
    f = S(callSpy);
  f();
  f();
  f();

  t.equal(callSpy.callCount, 1);
  t.end();
});

test('updates when S.data is set', function(t) {
  var d = o(1),
    fevals = 0;

  S(function() {
    fevals++;
    return d();
  });
  fevals = 0;

  d(1);
  t.equal(fevals, 1);
  t.end();
});

test('does not update when S.data is read', function(t) {
  var d = o(1),
    fevals = 0;

  S(function() {
    fevals++;
    return d();
  });
  fevals = 0;

  d();
  t.equal(fevals, 0);
  t.end();
});

test('updates return value', function(t) {
  var d = o(1),
    f = S(function() {
      return d();
    });

  d(2);
  t.equal(f(), 2);
  t.end();
});

test('set works from other computed', function(t) {
  var banana = o();
  var count = 0;
  S(() => {
    count++;
    return banana() + ' shake';
  });
  t.equal(count, 1);

  var carrot = o();
  S(() => {
    console.log('banana false');
    banana(false);

    carrot() + ' soup';

    console.log('banana true');
    banana(true);
  });

  carrot('carrot');
  t.equal(count, 5);

  banana(false);
  t.equal(count, 6);

  t.end();
});

(function() {
  var i, j, e, fevals, f;

  function init() {
    i = o(true);
    j = o(1);
    e = o(2);
    fevals = 0;
    f = S(function() {
      fevals++;
      return i() ? j() : e();
    });
    fevals = 0;
  }

  test('updates on active dependencies', function(t) {
    init();
    j(5);
    t.equal(fevals, 1);
    t.equal(f(), 5);
    t.end();
  });

  test('does not update on inactive dependencies', function(t) {
    init();
    e(5);
    t.equal(fevals, 0);
    t.equal(f(), 1);
    t.end();
  });

  test('deactivates obsolete dependencies', function(t) {
    init();
    i(false);
    fevals = 0;
    j(5);
    t.equal(fevals, 0);
    t.end();
  });

  test('activates new dependencies', function(t) {
    init();
    i(false);
    fevals = 0;
    e(5);
    t.equal(fevals, 1);
    t.end();
  });
})();

test('does not register a dependency', function(t) {
  var fevals = 0,
    d;

  S(function() {
    fevals++;
    d = o(1);
  });

  fevals = 0;
  d(2);
  t.equal(fevals, 0);
  t.end();
});

test('reads as undefined', function(t) {
  var f = S(function() {});
  t.equal(f(), undefined);
  t.end();
});

test('reduces seed value', function(t) {
  var a = o(5),
    f = S(function(v) {
      return v + a();
    }, 5);
  t.equal(f(), 10);
  a(6);
  t.equal(f(), 16);
  t.end();
});

(function() {
  var d, fcount, f, gcount, g;

  function init() {
    (d = o(1)),
      (fcount = 0),
      (f = S(function() {
        fcount++;
        return d();
      })),
      (gcount = 0),
      (g = S(function() {
        gcount++;
        return f();
      }));
  }

  test('does not cause re-evaluation', function(t) {
    init();
    t.equal(fcount, 1);
    t.end();
  });

  test('does not occur from a read', function(t) {
    init();
    f();
    t.equal(gcount, 1);
    t.end();
  });

  test('does not occur from a read of the watcher', function(t) {
    init();
    g();
    t.equal(gcount, 1);
    t.end();
  });

  test('occurs when computation updates', function(t) {
    init();
    d(2);
    t.equal(fcount, 2);
    t.equal(gcount, 2);
    t.equal(g(), 2);
    t.end();
  });
})();

// test("throws when continually setting a direct dependency", function () {
//   var d = S.data(1);

//   t.equal(function () {
//       S(function () { d(); d(2); });
//   }).toThrow();
// });

// test("throws when continually setting an indirect dependency", function () {
//   var d = S.data(1),
//       f1 = S(function () { return d(); }),
//       f2 = S(function () { return f1(); }),
//       f3 = S(function () { return f2(); });

//   t.equal(function () {
//       S(function () { f3(); d(2); });
//   }).toThrow();
// });

// test("throws when cycle created by modifying a branch", function () {
//   var d = S.data(1),
//       f = S(function () { return f ? f() : d(); });

//   t.equal(function () { d(0); }).toThrow();
// });

test('propagates in topological order', function(t) {
  //
  //     c1
  //    /  \
  //   /    \
  //  b1     b2
  //   \    /
  //    \  /
  //     a1
  //
  var seq = '',
    a1 = o(true),
    b1 = S(function() {
      a1();
      seq += 'b1';
    }),
    b2 = S(function() {
      a1();
      seq += 'b2';
    }),
    c1 = S(function() {
      b1(), b2();
      seq += 'c1';
    });

  seq = '';
  a1(true);

  t.equal(seq, 'b1b2c1');
  t.end();
});

test('only propagates once with linear convergences', function(t) {
  //         d
  //         |
  // +---+---+---+---+
  // v   v   v   v   v
  // f1  f2  f3  f4  f5
  // |   |   |   |   |
  // +---+---+---+---+
  //         v
  //         g
  var d = o(0),
    f1 = S(function() {
      return d();
    }),
    f2 = S(function() {
      return d();
    }),
    f3 = S(function() {
      return d();
    }),
    f4 = S(function() {
      return d();
    }),
    f5 = S(function() {
      return d();
    }),
    gcount = 0,
    g = S(function() {
      gcount++;
      return f1() + f2() + f3() + f4() + f5();
    });

  gcount = 0;
  d(0);
  t.equal(gcount, 1);
  t.end();
});

test('only propagates once with exponential convergence', function(t) {
  //     d
  //     |
  // +---+---+
  // v   v   v
  // f1  f2 f3
  //   \ | /
  //     O
  //   / | \
  // v   v   v
  // g1  g2  g3
  // +---+---+
  //     v
  //     h
  var d = o(0),
    f1 = S(function() {
      return d();
    }),
    f2 = S(function() {
      return d();
    }),
    f3 = S(function() {
      return d();
    }),
    g1 = S(function() {
      return f1() + f2() + f3();
    }),
    g2 = S(function() {
      return f1() + f2() + f3();
    }),
    g3 = S(function() {
      return f1() + f2() + f3();
    }),
    hcount = 0,
    h = S(function() {
      hcount++;
      return g1() + g2() + g3();
    });

  hcount = 0;
  d(0);
  t.equal(hcount, 1);
  t.end();
});

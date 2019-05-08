import test from 'tape';
import { spy } from 'sinon';
import o, { S } from '../src/observable.js';

// Tests from S.js

test("occurs once intitially", function (t) {
  var callSpy = spy();
  S(callSpy);
  t.equal(callSpy.callCount, 1);
  t.end();
});

test("does not re-occur when read", function (t) {
  var callSpy = spy(),
      f = S(callSpy);
  f(); f(); f();

  t.equal(callSpy.callCount, 1);
  t.end();
});

test("updates when S.data is set", function (t) {
  var d = o(1),
      fevals = 0;

  S(function () { fevals++; return d(); });
  fevals = 0;

  d(1);
  t.equal(fevals, 1);
  t.end();
});

test("does not update when S.data is read", function (t) {
  var d = o(1),
      fevals = 0;

  S(function () { fevals++; return d(); });
  fevals = 0;

  d();
  t.equal(fevals, 0);
  t.end();
});

test("updates return value", function (t) {
  var d = o(1),
      f = S(function () { fevals++; return d(); });

  d(2);
  t.equal(f(), 2);
  t.end();
});

var i, j, e, fevals, f;

function intest() {
  i = o(true);
  j = o(1);
  e = o(2);
  fevals = 0;
  f = S(function () { fevals++; return i() ? j() : e(); });
  fevals = 0;
}

test("updates on active dependencies", function (t) {
  intest();
  j(5);
  t.equal(fevals, 1);
  t.equal(f(), 5);
  t.end();
});

test("does not update on inactive dependencies", function (t) {
  intest();
  e(5);
  t.equal(fevals, 0);
  t.equal(f(), 1);
  t.end();
});

test("deactivates obsolete dependencies", function (t) {
  intest();
  i(false);
  fevals = 0;
  j(5);
  t.equal(fevals, 0);
  t.end();
});

test("activates new dependencies", function (t) {
  intest();
  i(false);
  fevals = 0;
  e(5);
  t.equal(fevals, 1);
  t.end();
});

test("insures that new dependencies are updated before dependee", function (t) {
  var order = "",
      a = o(0),
      b = S(function x() { order += "b"; return a() + 1; }),
      c = S(function y() { order += "c"; return b() || d(); }),
      d = S(function z() { order += "d"; return a() + 10; });

  t.equal(order, "bcd", '1st bcd test');

  order = "";
  a(-1);

  t.equal(b(), 0, 'b equals 0');
  t.equal(order, "bcd", '2nd bcd test');
  t.equal(d(), 9, 'd equals 9');
  t.equal(c(), 9, 'c equals d(9)');

  order = "";
  a(0);

  t.equal(order, "bcd", '3rd bcd test');
  t.equal(c(), 1);
  t.end();
});

test("propagates in topological order", function (t) {
  //
  //     c1
  //    /  \
  //   /    \
  //  b1     b2
  //   \    /
  //    \  /
  //     a1
  //
  var seq = "",
      a1 = o(true),
      b1 = S(function () { a1();       seq += "b1"; }),
      b2 = S(function () { a1();       seq += "b2"; }),
      c1 = S(function () { b1(), b2(); seq += "c1"; });

  seq = "";
  a1(true);

  t.equal(seq, "b1b2c1");
  t.end();
});

test("only propagates once with linear convergences", function (t) {
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
      f1 = S(function () { return d(); }),
      f2 = S(function () { return d(); }),
      f3 = S(function () { return d(); }),
      f4 = S(function () { return d(); }),
      f5 = S(function () { return d(); }),
      gcount = 0,
      g = S(function () { gcount++; return f1() + f2() + f3() + f4() + f5(); });

  gcount = 0;
  d(0);
  t.equal(gcount, 1);
  t.end();
});

test("only propagates once with exponential convergence", function (t) {
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

      f1 = S(function () { return d(); }),
      f2 = S(function () { return d(); }),
      f3 = S(function () { return d(); }),

      g1 = S(function () { return f1() + f2() + f3(); }),
      g2 = S(function () { return f1() + f2() + f3(); }),
      g3 = S(function () { return f1() + f2() + f3(); }),

      hcount = 0,
      h  = S(function () { hcount++; return g1() + g2() + g3(); });

  hcount = 0;
  d(0);
  t.equal(hcount, 1);
  t.end();
});
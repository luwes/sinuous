import test from 'tape';
import spy from 'ispy';
import { o, root, on } from '../src/observable.js';

test('registers a dependency', function(t) {
  root(function() {
    var d = o(1),
      callSpy = spy(),
      f = on(d, function() {
        callSpy();
      });

    t.equal(callSpy.callCount, 1);

    d(2);

    t.equal(callSpy.callCount, 2);
  });
  t.end();
});

test('prohibits dynamic dependencies', function(t) {
  root(function() {
    var d = o(1),
      callSpy = spy(),
      s = on(
        function() {},
        function() {
          callSpy();
          return d();
        }
      );

    t.equal(callSpy.callCount, 1);

    d(2);

    t.equal(callSpy.callCount, 1);
  });
  t.end();
});

test('allows multiple dependencies', function(t) {
  root(function() {
    var a = o(1),
      b = o(2),
      c = o(3),
      callSpy = spy(),
      f = on(
        function() {
          a();
          b();
          c();
        },
        function() {
          callSpy();
        }
      );

    t.equal(callSpy.callCount, 1);

    a(4);
    b(5);
    c(6);

    t.equal(callSpy.callCount, 4);
  });
  t.end();
});

test('allows an array of dependencies', function(t) {
  root(function() {
    var a = o(1),
      b = o(2),
      c = o(3),
      callSpy = spy(),
      f = on([a, b, c], function() {
        callSpy();
      });

    t.equal(callSpy.callCount, 1);

    a(4);
    b(5);
    c(6);

    t.equal(callSpy.callCount, 4);
  });
  t.end();
});

test('modifies its accumulator when reducing', function(t) {
  root(function() {
    var a = o(1),
      c = on(
        a,
        function(sum) {
          return sum + a();
        },
        0
      );

    t.equal(c(), 1);

    a(2);

    t.equal(c(), 3);

    a(3);
    a(4);

    t.equal(c(), 10);
  });
  t.end();
});

test('suppresses initial run when onchanges is true', function(t) {
  root(function() {
    var a = o(1),
      c = on(
        a,
        function() {
          return a() * 2;
        },
        0,
        true
      );

    t.equal(c(), 0);

    a(2);

    t.equal(c(), 4);
  });
  t.end();
});

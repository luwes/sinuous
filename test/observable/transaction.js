import test from 'tape';
import { o, S, root, transaction } from 'sinuous/observable';

test('batches all changes until end', function(t) {
  var d1 = o(9);
  var d2 = o(99);

  transaction(function() {
    d1(10);
    d2(100);
    t.equal(d1(), 9);
    t.equal(d2(), 99);
  });

  t.equal(d1(), 10);
  t.equal(d2(), 100);
  t.end();
});

test('halts propagation within its scope', function(t) {
  root(function() {
    var d1 = o(9);
    var d2 = o(99);

    var f = S(function() {
      return d1() + d2();
    });

    transaction(function() {
      d1(10);
      d2(100);

      t.equal(f(), 9 + 99);
    });

    t.equal(f(), 10 + 100);
    t.end();
  });
});

test('nested transaction', function(t) {
  var d = o(1);

  transaction(function() {
    d(2);
    t.equal(d(), 1);

    transaction(function() {
      d(3);
      t.equal(d(), 1);

      transaction(function() {
        d(4);
      });

      t.equal(d(), 1);
    });

    t.equal(d(), 1);
  });

  t.equal(d(), 4);
  t.end();
});

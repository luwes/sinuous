import test from 'tape';
import { o, S, root, transaction } from '../src/observable.js';

test("batches changes until end", function (t) {
  var d = o(1);

  transaction(function () {
    d(2);
    t.equal(d(), 1);
  });

  t.equal(d(), 2);
  t.end();
});

test("halts propagation within its scope", function (t) {
  root(function () {
    var d = o(1);
    var f = S(function() { return d(); });

    transaction(function () {
      d(2);
      t.equal(f(), 1);
    });

    t.equal(f(), 2);
    t.end();
  });
});

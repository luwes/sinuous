import test from 'tape';
import { o, S, root } from '../src/observable.js';

test("disables updates and sets computation's value to undefined", function(t) {
  root(function(dispose) {
    var c = 0,
      d = o(0),
      f = S(function() {
        c++;
        return d();
      });

    t.equal(c, 1);
    t.equal(f(), 0);

    d(1);

    t.equal(c, 2);
    t.equal(f(), 1);

    dispose();

    d(2);

    t.equal(c, 2);
    t.equal(f(), 1);
    t.end();
  });
});

// unconventional uses of dispose -- to insure S doesn't behaves as expected in these cases

test('works from the body of its own computation', function(t) {
  root(function(dispose) {
    var c = 0,
      d = o(0),
      f = S(function() {
        c++;
        if (d()) dispose();
        d();
      });

    t.equal(c, 1);

    d(1);
    t.equal(c, 2);

    d(2);
    t.equal(c, 2);

    t.end();
  });
});

test('works from the body of a subcomputation', function(t) {
  root(function(dispose) {
    var c = 0,
      d = o(0),
      f = S(function() {
        c++;
        d();
        S(function() {
          if (d()) dispose();
        });
      });

    t.equal(c, 1);

    d(1);

    t.equal(c, 2);

    d(2);

    t.equal(c, 2);
    t.end();
  });
});

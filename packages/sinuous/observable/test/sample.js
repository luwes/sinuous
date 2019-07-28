import test from 'tape';
import { o, S, sample } from '../src/observable.js';

test('avoids a depdendency', function(t) {
  var a = o(1),
    b = o(2),
    c = o(3),
    d = 0;

  S(function() {
    d++;
    a();
    sample(b);
    c();
  });

  t.equal(d, 1);

  b(4);

  t.equal(d, 1);

  a(5);
  c(6);

  t.equal(d, 3);
  t.end();
});

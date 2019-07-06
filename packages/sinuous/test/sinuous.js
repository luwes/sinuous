import test from 'tape';
import { html } from 'sinuous';

test('simple', function(t) {
  t.equal(
    html`
      <h1></h1>
    `.outerHTML,
    '<h1></h1>'
  );
  t.equal(
    html`
      <h1>hello world</h1>
    `.outerHTML,
    '<h1>hello world</h1>'
  );
  t.end();
});

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

test('returns a simple string', t => {
  t.equal(
    html`
      a
    `,
    'a'
  );
  t.end();
});

test('returns a document fragment', t => {
  const frag = html`
    ${[
      html`
        <div>Banana</div>
      `,
      html`
        <div>Apple</div>
      `
    ]}
  `;
  t.assert(frag instanceof DocumentFragment);
  t.equal(frag.children[0].outerHTML, '<div>Banana</div>');
  t.equal(frag.children[1].outerHTML, '<div>Apple</div>');
  t.end();
});

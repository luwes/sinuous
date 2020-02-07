import test from 'tape';
import { o, html } from 'sinuous';
import { fragInnerHTML } from './_utils.js';

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
  const frag = html`
    a
  `;
  t.assert(frag instanceof DocumentFragment);
  t.assert(frag.childNodes[0] instanceof Text);
  t.equal(frag.childNodes[0].textContent, 'a');
  t.end();
});

test('returns a simple number', t => {
  const frag = html`
    ${9}
  `;
  t.assert(frag instanceof DocumentFragment);
  t.assert(frag.childNodes[0] instanceof Text);
  t.equal(frag.childNodes[0].textContent, '9');
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
  t.equal(frag.childNodes[0].outerHTML, '<div>Banana</div>');
  t.equal(frag.childNodes[1].outerHTML, '<div>Apple</div>');
  t.end();
});

test('returns a simple observable string', t => {
  const title = o('Banana');
  const frag = html`
    ${title}
  `;
  t.assert(frag instanceof DocumentFragment);
  t.assert(frag.childNodes[0] instanceof Text);
  t.equal(frag.childNodes[0].textContent, 'Banana');
  t.end();
});

test('component children order', t => {
  let order = '';
  const Comp = (props, ...children) => {
    order += 'a';
    return children;
  };
  const Child = () => {
    order += 'b';
    return html`<b />`;
  };

  const result = html`
    <${Comp}>
      <${Child} />
    <//>
  `;

  t.equal(order, 'ab');
  t.equal(fragInnerHTML(result), '<b></b>');
  t.end();
});

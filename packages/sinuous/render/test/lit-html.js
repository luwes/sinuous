import tape from 'tape';
import { h } from 'sinuous';
import { rhtml, rsvg, render } from 'sinuous/render';
import { beforeEach } from '../../test/_utils.js';

let container;

const test = beforeEach(tape, (assert) => {
  container = document.createElement('div');
  assert.end();
});

test('renders plain text expression', (assert) => {
  render(rhtml`test`, container);
  assert.equal(container.innerHTML, 'test');
  assert.end();
});

test('renders undefined', (assert) => {
  render(rhtml`<div>${undefined}</div>`, container);
  assert.equal(container.innerHTML, '<div></div>');
  assert.end();
});

test('renders null', (assert) => {
  render(rhtml`<div>${null}</div>`, container);
  assert.equal(container.innerHTML, '<div></div>');
  assert.end();
});

test('renders parts with whitespace after them', (assert) => {
  render(rhtml`<div>${'foo'} </div>`, container);
  assert.equal(container.innerHTML, '<div>foo </div>');
  assert.end();
});

test('renders nested templates', t => {
  const partial = rhtml`<h1>${'foo'}</h1>`;
  render(rhtml`${partial}${'bar'}`, container);
  t.equal(container.innerHTML, '<h1>foo</h1>bar');
  t.end();
});

test('renders a template nested multiple times', t => {
  const partial = rhtml`<h1>${'foo'}</h1>`;
  render(rhtml`${partial}${'bar'}${partial}${'baz'}qux`, container);
  t.equal(container.innerHTML, '<h1>foo</h1>bar<h1>foo</h1>bazqux');
  t.end();
});

test('renders arrays of nested templates', (t) => {
  render(rhtml`<div>${[1, 2, 3].map((i) => rhtml`${i}`)}</div>`, container);
  t.equal(container.innerHTML, '<div>123</div>');
  t.end();
});

test('renders multiple parts per element, preserving whitespace', (assert) => {
  render(rhtml`<div>${'foo'} ${'bar'}</div>`, container);
  assert.equal(container.innerHTML, '<div>foo bar</div>');
  assert.end();
});

test('values contain interpolated values', (assert) => {
  const t = rhtml`${'a'},${'b'},${'c'}`;
  render(t, container);
  assert.equal(container.innerHTML, 'a,b,c');

  render(t, container);
  assert.equal(container.innerHTML, 'a,b,c');

  render(rhtml`${'a'},${'b'},${'d'}`, container);
  assert.equal(container.innerHTML, 'a,b,d');

  render(rhtml`${'a'},${'b'},${'d'},${'e'}`, container);
  assert.equal(container.innerHTML, 'a,b,d,e');

  assert.end();
});

test('renders an element', (assert) => {
  const child = document.createElement('p');
  render(rhtml`<div>${child}</div>`, container);
  assert.equal(container.innerHTML, '<div><p></p></div>');
  assert.end();
});

test('renders an array of elements', (assert) => {
  const children = [
    document.createElement('p'),
    document.createElement('a'),
    document.createElement('span')
  ];
  render(rhtml`<div>${children}</div>`, container);
  assert.equal(container.innerHTML, '<div><p></p><a></a><span></span></div>');
  assert.end();
});

test('renders expressions with preceding elements', (assert) => {
  render(rhtml`<a>${'foo'}</a>${rhtml`<h1>${'bar'}</h1>`}`, container);
  assert.equal(container.innerHTML, '<a>foo</a><h1>bar</h1>');

  // This is nearly the same test case as above, but was causing a
  // different stack trace
  render(rhtml`<a>${'foo'}</a>${'bar'}`, container);
  assert.equal(container.innerHTML, '<a>foo</a>bar');

  assert.end();
});

test('renders SVG', (assert) => {
  const container = document.createElement('svg');
  const t = rsvg`<line y1="1" y2="1"/>`;
  render(t, container);
  const line = container.firstElementChild;
  assert.equal(line.tagName, 'line');
  assert.equal(line.namespaceURI, 'http://www.w3.org/2000/svg');
  assert.end();
});

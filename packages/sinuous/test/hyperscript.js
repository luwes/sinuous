import test from 'tape';
import { spy } from 'sinon';
import sinuous from 'sinuous';
const subscribe = fn => fn();
const h = sinuous({ subscribe });

test('simple', function(t) {
  t.equal(h('h1').outerHTML, '<h1></h1>');
  t.equal(h('h1', 'hello world').outerHTML, '<h1>hello world</h1>');
  t.end();
});

test('nested', function(t) {
  t.equal(
    h('div', h('h1', 'Title'), h('p', 'Paragraph')).outerHTML,
    '<div><h1>Title</h1><p>Paragraph</p></div>'
  );
  t.end();
});

test('arrays for nesting is ok', function(t) {
  t.equal(
    h('div', [h('h1', 'Title'), h('p', 'Paragraph')]).outerHTML,
    '<div><h1>Title</h1><p>Paragraph</p></div>'
  );
  t.end();
});

test('can use namespace in name', function(t) {
  t.equal(h('myns:mytag').outerHTML, '<myns:mytag></myns:mytag>');
  t.end();
});

test('can use id selector', function(t) {
  t.equal(h('div#frame').outerHTML, '<div id="frame"></div>');
  t.end();
});

test('can use class selector', function(t) {
  t.equal(h('div.panel').outerHTML, '<div class="panel"></div>');
  t.end();
});

test('can default element types', function(t) {
  t.equal(h('.panel').outerHTML, '<div class="panel"></div>');
  t.equal(h('#frame').outerHTML, '<div id="frame"></div>');
  t.end();
});

test('can set properties', function(t) {
  let a = h('a', { href: 'http://google.com' });
  t.equal(a.href, 'http://google.com/');
  let checkbox = h('input', { name: 'yes', type: 'checkbox' });
  t.equal(checkbox.outerHTML, '<input name="yes" type="checkbox">');
  t.end();
});

test('registers an event handler', function(t) {
  h.subscribe = spy(fn => fn());

  let onClick = spy();
  let btn = h('button', { onclick: onClick }, 'something');
  btn.click();
  t.assert(onClick.called);
  t.end();
});

// test('unregisters an event handler', function(t) {
//   h.subscribe = spy();

//   let onClick = spy();
//   let btn = h('button', { onclick: onClick }, 'something');
//   btn.click();
//   t.equal(onClick.called);

//   h(btn, { onclick: false });
//   btn.click();
//   t.equal(onClick.called);
// });

test('registers event handlers', function(t) {
  h.subscribe = spy(fn => fn());

  let click = spy();
  let focus = spy();
  let btn = h('button', { events: { click, focus } }, 'something');
  document.body.appendChild(btn);
  btn.focus();
  t.assert(focus.called);
  btn.click();
  t.assert(click.called);
  btn.remove();
  t.end();
});

test('can use bindings', function(t) {
  h.bindings.innerHTML = (el, value) => (el.innerHTML = value);

  let el = h('div', { $innerHTML: '<b>look ma, no node value</b>' });
  t.equal(el.outerHTML, '<div><b>look ma, no node value</b></div>');
  t.end();
});

test('sets styles', function(t) {
  let div = h('div', { style: { color: 'red' } });
  t.equal(div.style.color, 'red');
  t.end();
});

test('sets styles as text', function(t) {
  let div = h('div', { style: 'color: red' });
  t.equal(div.style.color, 'red');
  t.end();
});

test('sets classes', function(t) {
  let div = h('div', { classList: { play: true, pause: true } });
  t.assert(div.classList.contains('play'));
  t.assert(div.classList.contains('pause'));
  t.end();
});

test('sets attributes', function(t) {
  let div = h('div', { attrs: { checked: 'checked' } });
  t.assert(div.hasAttribute('checked'));
  t.end();
});

test('sets data attributes', function(t) {
  let div = h('div', { 'data-value': 5 });
  t.equal(div.getAttribute('data-value'), '5'); // failing for IE9
  t.end();
});

test('sets refs', function(t) {
  let ref;
  let div = h('div', { ref: el => (ref = el) });
  t.equal(div, ref);
  t.end();
});

test("boolean, number, date, regex get to-string'ed", function(t) {
  let e = h('p', true, false, 4, new Date('Mon Jan 15 2001'), /hello/);
  t.assert(e.outerHTML.match(/<p>truefalse4Mon Jan 15.+2001.*\/hello\/<\/p>/));
  t.end();
});

test('unicode selectors', function(t) {
  t.equal(h('.⛄').outerHTML, '<div class="⛄"></div>');
  t.equal(h('span#⛄').outerHTML, '<span id="⛄"></span>');
  t.end();
});

test('can add insert functions', function(t) {
  h.insert = spy(h.insert);
  const insertCat = () => 'cat';
  let div = h('div', insertCat);
  t.assert(h.insert.called);
  t.equal(div.outerHTML, '<div>cat</div>');
  t.end();
});

test('can add subscribe functions', function(t) {
  h.subscribe = spy(fn => fn());
  const insertCat = () => 'cat';
  let div = h('div', { innerText: insertCat });
  t.assert(h.subscribe.called);
  t.equal(div.outerHTML, '<div>cat</div>');
  t.end();
});

test('can use fragments', function(t) {
  h.subscribe = spy(fn => fn());
  h.insert = spy(h.insert);
  const insertCat = () => 'cat';

  let frag = h([h('div', 'First'), insertCat, h('div', 'Last')]);

  const div = document.createElement('div');
  div.appendChild(frag);
  t.assert(h.insert.called);
  t.equal(div.innerHTML, '<div>First</div>cat<div>Last</div>');
  t.end();
});

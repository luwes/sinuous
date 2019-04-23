import sinuous from 'sinuous';
const h = sinuous();

it('simple', function() {
  assert(h('h1').outerHTML, '<h1></h1>');
  assert(h('h1', 'hello world').outerHTML, '<h1>hello world</h1>');
});

it('nested', function() {
  assert(
    h('div', h('h1', 'Title'), h('p', 'Paragraph')).outerHTML,
    '<div><h1>Title</h1><p>Paragraph</p></div>'
  );
});

it('arrays for nesting is ok', function() {
  assert(
    h('div', [h('h1', 'Title'), h('p', 'Paragraph')]).outerHTML,
    '<div><h1>Title</h1><p>Paragraph</p></div>'
  );
});

it('can use namespace in name', function() {
  assert(h('myns:mytag').outerHTML, '<myns:mytag></myns:mytag>');
});

it('can use id selector', function() {
  assert(h('div#frame').outerHTML, '<div id="frame"></div>');
});

it('can use class selector', function() {
  assert(h('div.panel').outerHTML, '<div class="panel"></div>');
});

it('can default element types', function() {
  assert(h('.panel').outerHTML, '<div class="panel"></div>');
  assert(h('#frame').outerHTML, '<div id="frame"></div>');
});

it('can set properties', function() {
  let a = h('a', { href: 'http://google.com' });
  assert(a.href, 'http://google.com/');
  let checkbox = h('input', { name: 'yes', type: 'checkbox' });
  assert(checkbox.outerHTML, '<input name="yes" type="checkbox">');
});

it('registers event handlers', function() {
  let onClick = sinon.spy();
  let btn = h('button', { onclick: onClick }, 'something');
  btn.click();
  assert(onClick.called);
});

it('sets styles', function() {
  let div = h('div', { style: { color: 'red' } });
  assert(div.style.color, 'red');
});

it('sets styles as text', function() {
  let div = h('div', { style: 'color: red' });
  assert(div.style.color, 'red');
});

it('sets data attributes', function() {
  let div = h('div', { 'data-value': 5 });
  assert(div.getAttribute('data-value'), '5'); // failing for IE9
});

it("boolean, number, date, regex get to-string'ed", function() {
  let e = h('p', true, false, 4, new Date('Mon Jan 15 2001'), /hello/);
  assert(e.outerHTML.match(/<p>truefalse4Mon Jan 15.+2001.*\/hello\/<\/p>/));
});

it('unicode selectors', function() {
  assert(h('.⛄').outerHTML, '<div class="⛄"></div>');
  assert(h('span#⛄').outerHTML, '<span id="⛄"></span>');
});

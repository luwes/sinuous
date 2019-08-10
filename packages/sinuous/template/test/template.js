import test from 'tape';
import { h, html } from 'sinuous';
import { template, o, t } from 'sinuous/template';

test('tags return functions', function(tt) {
  tt.assert(typeof o() === 'function');
  tt.assert(typeof t() === 'function');
  tt.end();
});

test('template returns a function', function(tt) {
  tt.assert(typeof template(() => h('h1')) === 'function');
  tt.end();
});

test('template result returns an element', function(tt) {
  tt.equal(template(() => h('h1'))().firstChild.outerHTML, '<h1></h1>');
  tt.end();
});

test('template result fills tags', function(tt) {
  tt.equal(
    template(() => h('h1', t('title')))({ title: 'Test' }).firstChild.outerHTML,
    '<h1>Test</h1>'
  );
  tt.end();
});

test('template result fills observable tags', function(tt) {
  const obj = { title: 'Apple', class: 'juice' };
  const tmpl = template(() =>
    h('h1', h('span', { class: o('class') }, 'Pear'), h('span', o('title')))
  )(obj);

  tt.equal(
    tmpl.firstChild.children[0].outerHTML,
    '<span class="juice">Pear</span>'
  );
  tt.equal(tmpl.firstChild.children[1].outerHTML, '<span>Apple</span>');

  obj.title = '⛄️';
  obj.class = 'mousse';

  tt.equal(obj.title, '⛄️');
  tt.equal(
    tmpl.firstChild.children[0].outerHTML,
    '<span class="mousse">Pear</span>'
  );
  tt.equal(tmpl.firstChild.children[1].outerHTML, '<span>⛄️</span>');
  tt.end();
});

test('template result fills tags w/ same value', function(tt) {
  const title = template(() => h('h1', t('title')));
  tt.equal(title({ title: 'Test' }).firstChild.outerHTML, '<h1>Test</h1>');
  tt.equal(title({ title: 'Test' }).firstChild.outerHTML, '<h1>Test</h1>');
  tt.end();
});

test('template result fills multiple observable tags w/ same key', function(tt) {
  const title = template(() => html`
    <h1 class="${o('title')}">
      ${o('title')} <i>${o('title')}</i>
    </h1>
  `);
  const obj = {
    dummy: 3,
    title: ''
  };

  const rendered = title(obj);
  obj.title = 'banana';

  tt.equal(rendered.firstChild.outerHTML, '<h1 class="banana">banana <i>banana</i></h1>');

  tt.deepEqual(Object.keys(obj), ['dummy', 'title']);
  tt.end();
});

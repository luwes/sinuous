import test from 'tape';
import { h } from 'sinuous';
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
  const obj = { title: 'Apple' };
  const tmpl = template(() =>
    h('h1', h('span', 'Pear'), h('span', o('title')))
  )(obj);

  tt.equal(tmpl.firstChild.children[1].outerHTML, '<span>Apple</span>');

  obj.title = '⛄️';

  tt.equal(obj.title, '⛄️');
  tt.equal(tmpl.firstChild.children[1].outerHTML, '<span>⛄️</span>');
  tt.end();
});

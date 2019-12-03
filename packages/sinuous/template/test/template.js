import test from 'tape';
import { h, html } from 'sinuous';
import { template, o, t } from 'sinuous/template';
import { map } from 'sinuous/map';
import { normalizeAttributes } from '../../test/_utils.js';

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
  const title = template(() =>
    h('h1', { class: o('title') }, h('b', o('title')), h('i', o('title')))
  );
  const obj = {
    title: ''
  };

  const rendered = title(obj);
  obj.title = 'banana';

  tt.equal(
    rendered.firstChild.outerHTML,
    '<h1 class="banana"><b>banana</b><i>banana</i></h1>'
  );

  tt.end();
});

test('template works with map', function(tt) {
  const Row = template(
    () => html`
      <tr class=${o('selected')}>
        <td class="col-md-1">${t('id')}</td>
        <td class="col-md-4"><a>${o('label')}</a></td>
        <td class="col-md-1">
          <a>
            <span
              class="glyphicon glyphicon-remove remove"
              aria-hidden="true"
            />
          </a>
        </td>
        <td class="col-md-6" />
      </tr>
    `
  );

  const rows = () =>
    [1, 2].map(id => ({
      id,
      label: `Label ${id}`
    }));

  const table = document.createElement('table');
  table.appendChild(map(rows, Row));

  tt.equal(
    normalizeAttributes(table.innerHTML),
    normalizeAttributes(
      `<tr>
        <td class="col-md-1">1</td>
        <td class="col-md-4"><a>Label 1</a></td>
        <td class="col-md-1"><a>
          <span class="glyphicon glyphicon-remove remove" aria-hidden="true"></span>
        </a></td>
        <td class="col-md-6"></td>
      </tr>
      <tr>
        <td class="col-md-1">2</td>
        <td class="col-md-4"><a>Label 2</a></td>
        <td class="col-md-1"><a>
          <span class="glyphicon glyphicon-remove remove" aria-hidden="true"></span>
        </a></td>
        <td class="col-md-6"></td>
      </tr>`.replace(/>[\s]+</g, '><')
    )
  );

  tt.end();
});

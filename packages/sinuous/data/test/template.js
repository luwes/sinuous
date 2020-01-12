import test from 'tape';
import { template } from 'sinuous/data';

test('template does clone', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t="text">Banana</h1>
    </div>
  `;

  const div = template('.container');
  const el = div({ text: '🧬' });
  t.assert(el !== div({ text: '🧬' }));
  t.assert(el.children[0].textContent === '🧬');
  t.end();
});

test('template works w/ template element', function(t) {
  document.body.innerHTML = `
    <template>
      <div>
        <h1 data-t="text">Banana</h1>
      </div>
      <h2 data-t="text">Banana</h2>
    </template>
  `;

  const div = template('template');
  const el = div({ text: 'Apple' });

  t.assert(el !== div({ text: 'Apple' }));
  t.assert(el !== div({ text: 'Banana' }));

  t.assert(el.children[0].children[0].textContent === 'Apple');
  t.assert(el.children[1].textContent === 'Apple');

  t.end();
});

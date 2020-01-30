import test from 'tape';
import { normalizeSvg } from '../../test/_utils.js';
import { ds, dsvg, hydrate } from 'sinuous/hydrate';
import { observable } from 'sinuous';

test('supports hydrating SVG via hyperscript', function(t) {
  document.body.innerHTML = `<svg class="redbox" viewBox="0 0 100 100"><path d="M 8.74211 7.70899"></path></svg>`;

  const delta = ds(
    'svg',
    { class: 'redbox', viewBox: '0 0 100 100' },
    ds('path', { d: 'M 8.74211 7.70899' })
  );

  const svg = hydrate(delta, document.querySelector('svg'));

  t.equal(
    normalizeSvg(svg),
    '<svg class="redbox" viewBox="0 0 100 100"><path d="M 8.74211 7.70899"></path></svg>'
  );
  t.end();
});

test('supports hydrating SVG', function(t) {
  document.body.innerHTML = `<svg class="redbox" viewBox="0 0 100 100"><path d="M 8.74211 7.70899"></path></svg>`;

  const delta = dsvg`
    <svg class="redbox" viewBox="0 0 100 100">
      <path d="M 8.74211 7.70899"></path>
    </svg>
  `;

  const el = hydrate(delta, document.querySelector('svg'));

  t.equal(
    normalizeSvg(el),
    '<svg class="redbox" viewBox="0 0 100 100"><path d="M 8.74211 7.70899"></path></svg>'
  );
  t.end();
});

test('can hydrate an array of svg elements', function(t) {
  document.body.innerHTML = `<svg><circle cx="0" cy="1" r="10"></circle><circle cx="0" cy="2" r="10"></circle><circle cx="0" cy="3" r="10"></circle><rect x="0"></rect><circle cx="0" cy="1" r="10"></circle><circle cx="0" cy="2" r="10"></circle><circle cx="0" cy="3" r="10"></circle></svg>`;

  const circles = observable([1, 2, 3]);
  const delta = dsvg`<svg>
    ${() => circles().map(c => dsvg`<circle cx="0" cy="${c}" r="10" />`)}
    <rect x="0"></rect>
    ${() => circles().map(c => dsvg`<circle cx="0" cy="${c}" r="10" />`)}
  </svg>`;

  const el = hydrate(delta, document.querySelector('svg'));

  t.equal(
    normalizeSvg(el),
    '<svg><circle cx="0" cy="1" r="10"></circle><circle cx="0" cy="2" r="10"></circle><circle cx="0" cy="3" r="10"></circle><rect x="0"></rect><circle cx="0" cy="1" r="10"></circle><circle cx="0" cy="2" r="10"></circle><circle cx="0" cy="3" r="10"></circle></svg>'
  );

  circles([1, 2, 3, 4]);

  t.equal(
    normalizeSvg(el),
    '<svg><circle cx="0" cy="1" r="10"></circle><circle cx="0" cy="2" r="10"></circle><circle cx="0" cy="3" r="10"></circle><circle cx="0" cy="4" r="10"></circle><rect x="0"></rect><circle cx="0" cy="1" r="10"></circle><circle cx="0" cy="2" r="10"></circle><circle cx="0" cy="3" r="10"></circle><circle cx="0" cy="4" r="10"></circle></svg>'
  );

  t.end();
});

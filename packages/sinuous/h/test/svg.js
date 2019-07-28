import test from 'tape';
import { hs, svg } from 'sinuous';
import { normalizeSvg } from '../../test/_utils.js';

test('normalizeSvg', function(t) {
  // IE11 adds xmlns and has a self closing tags.
  t.equal(
    normalizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" class="redbox" viewBox="0 0 100 100"><path d="M 8.74211 7.70899" /></svg>'
    ),
    '<svg class="redbox" viewBox="0 0 100 100"><path d="M 8.74211 7.70899"></path></svg>'
  );
  t.end();
});

test('supports SVG', function(t) {
  const svg = hs(
    'svg',
    { class: 'redbox', viewBox: '0 0 100 100' },
    hs('path', { d: 'M 8.74211 7.70899' })
  );

  t.equal(
    normalizeSvg(svg),
    '<svg class="redbox" viewBox="0 0 100 100"><path d="M 8.74211 7.70899"></path></svg>'
  );
  t.end();
});

test('can add an array of svg elements', function(t) {
  const circles = [1, 2, 3];
  t.equal(
    normalizeSvg(
      svg`<svg>
        ${() => circles.map(c => svg`<circle cx="0" cy="${c}" r="10" />`)}
      </svg>`
    ),
    '<svg><circle cx="0" cy="1" r="10"></circle><circle cx="0" cy="2" r="10"></circle><circle cx="0" cy="3" r="10"></circle></svg>'
  );
  t.end();
});

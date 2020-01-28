import test from 'tape';
import { sinuous, S } from '../src/index.js';

test('test functions exist on namespace S', function(t) {

  t.equal(typeof S.html, 'function', 'no html fun');
  t.equal(typeof S.svg, 'function', 'no svg fun');
  t.equal(typeof S.h, 'function', 'no h fun');
  t.equal(typeof S.hs, 'function', 'no hs fun');
  t.equal(typeof S.api, 'object', 'no api object');
  t.equal(typeof S.context, 'function', 'no context fun');

  t.equal(typeof S.map, 'function', 'no map fun');

  t.equal(typeof S.observable, 'function', 'no observable fun');
  t.equal(typeof S.subscribe, 'function', 'no subscribe fun');
  t.equal(typeof S.unsubscribe, 'function', 'no unsubscribe fun');
  t.equal(typeof S.computed, 'function', 'no computed fun');
  t.equal(typeof S.root, 'function', 'no root fun');
  t.equal(typeof S.cleanup, 'function', 'no cleanup fun');
  t.equal(typeof S.sample, 'function', 'no sample fun');
  t.equal(typeof S.transaction, 'function', 'no transaction fun');
  t.equal(typeof S.isListening, 'function', 'no isListening fun');

  t.equal(typeof S.hydrate.hydrate, 'function', 'no hydrate.hydrate fun');
  t.equal(typeof S.hydrate.dhtml, 'function', 'no hydrate.dhtml fun');
  t.equal(typeof S.hydrate.dsvg, 'function', 'no hydrate.dsvg fun');
  t.equal(typeof S.hydrate.d, 'function', 'no hydrate.d fun');
  t.equal(typeof S.hydrate.ds, 'function', 'no hydrate.ds fun');

  t.end();
});

test('test noConflict restores S and returns sinuous', function(t) {
  t.equal(S, sinuous, 'S equals sinuous');

  const $ = S.noConflict();
  t.equal(window.S, undefined, 'S equals undefined');
  t.equal($, window.sinuous, '$ equals sinuous');

  t.end();
});

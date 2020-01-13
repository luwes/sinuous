import test from 'tape';
import { fill } from 'sinuous/data';
import { normalizeAttributes } from '../../test/_utils.js';

test('fill w/ named data attributes', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t="fruit">Banana</h1>
      <h2 data-o="veggie">Sprout</h2>
    </div>
  `;

  const data = {
    fruit: { _: 'Banana milkshake', class: 'whippedcream' },
    veggie: { _: 'Brussel sprout' }
  };
  const div = fill('.container')(data);

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="fruit" class="whippedcream">Banana milkshake</h1>
      <h2 data-o="veggie">Brussel sprout</h2>
    </div>`)
  );

  data.fruit._ = '🧑';
  data.veggie._ = '🧑';

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="fruit" class="whippedcream">Banana milkshake</h1>
      <h2 data-o="veggie">🧑</h2>
    </div>`)
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill w/ named data attributes without content', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t="fruit">Banana</h1>
      <h2 data-o>Sprout</h2>
    </div>
  `;

  const data = {
    fruit: { class: 'whippedcream' },
    1: { title: 'Mister' }
  };
  const div = fill('.container')(data);

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="fruit" class="whippedcream">Banana</h1>
      <h2 data-o="" title="Mister">Sprout</h2>
    </div>`)
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill w/ indexed data attributes', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t>Banana</h1>
      <h2 data-o>Sprout</h2>
    </div>
  `;

  const data = [
    { _: 'Banana milkshake', class: 'whippedcream' },
    { _: 'Brussel sprout' }
  ];
  const div = fill('.container')(data);

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="" class="whippedcream">Banana milkshake</h1>
      <h2 data-o="">Brussel sprout</h2>
    </div>`)
  );

  data[0]._ = '🧑';
  data[1]._ = '🧑';

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="" class="whippedcream">Banana milkshake</h1>
      <h2 data-o="">🧑</h2>
    </div>`)
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill w/ paired data attributes', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t="fruit class:category">Banana</h1>
      <h2 data-o="veggie title:mr">Sprout</h2>
    </div>
  `;

  const data = {
    fruit: 'Banana milkshake',
    category: 'whippedcream',
    veggie: 'Brussel sprout',
    mr: 'Mister'
  };
  const div = fill('.container')(data);

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="fruit class:category" class="whippedcream">Banana milkshake</h1>
      <h2 data-o="veggie title:mr" title="Mister">Brussel sprout</h2>
    </div>`)
  );

  data.fruit = '🧑';
  data.veggie = '🧑';

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="fruit class:category" class="whippedcream">Banana milkshake</h1>
      <h2 data-o="veggie title:mr" title="Mister">🧑</h2>
    </div>`)
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill w/ multiple tags per element', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t="fruit" data-o="class:class">Banana</h1>
      <h2 data-o>Sprout</h2>
    </div>
  `;

  const data = {
    fruit: 'Banana milkshake',
    class: 'whippedcream',
    2: { title: 'Mister' }
  };
  const div = fill('.container')(data);

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="fruit" data-o="class:class" class="whippedcream">Banana milkshake</h1>
      <h2 data-o="" title="Mister">Sprout</h2>
    </div>`)
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill w/ bind', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <input data-bind="value:vakske">
    </div>
  `;

  const data = {
    vakske: 'geweldig'
  };
  const div = fill('.container')(data);
  const input = div.children[0];

  t.equal(data.vakske, input.value);
  data.vakske = '99';
  t.equal(data.vakske, input.value);
  t.equal('99', input.value);

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <input data-bind="value:vakske">
    </div>`)
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill w/ bind this', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <input data-bind="this:vakske">
    </div>
  `;

  const data = {};
  const div = fill('.container')(data);
  const input = div.children[0];

  t.equal(data.vakske, input);

  div.parentNode.removeChild(div);
  t.end();
});

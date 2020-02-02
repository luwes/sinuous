import test from 'tape';
import spy from 'ispy';
import { fill } from 'sinuous/data';
import { normalizeAttributes } from '../../test/_utils.js';

test('fill does not clone', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t="text">Banana</h1>
    </div>
  `;

  const div = fill('.container');
  const el = div({ text: '🧬' });
  t.assert(el === div({}));
  t.assert(el.children[0].textContent === '🧬');
  t.end();
});

test('fill mutates the DOM', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t>Banana</h1>
      <div class="main">
        <button>Cherry</button>
        <span data-o>Text node</span>
      </div>
    </div>
  `;

  const data = [
    { _: 'Banana milkshake' },
    { _: 'Text node patch' }
  ];
  const div = fill('.container')(data);

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="">Banana milkshake</h1>
      <div class="main">
        <button>Cherry</button>
        <span data-o="">Text node patch</span>
      </div>
    </div>`)
  );

  data[1]._ = '🧑';

  t.equal(
    normalizeAttributes(div.outerHTML),
    normalizeAttributes(`<div class="container">
      <h1 data-t="">Banana milkshake</h1>
      <div class="main">
        <button>Cherry</button>
        <span data-o="">🧑</span>
      </div>
    </div>`)
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill adds event listeners & top level attribute', function(t) {
  document.body.innerHTML = `
    <div>
      <button data-t>something</button>
    </div>
  `;

  const click = spy();
  const btn = fill('button')([{ onclick: click }]);
  btn.click();
  t.equal(click.callCount, 1, 'click called');

  btn.parentNode.parentNode.removeChild(btn.parentNode);
  t.end();
});

test('fill adds event listeners w/ alias ', function(t) {
  document.body.innerHTML = `
    <div>
      <button data-t="onclick:handleClick">something</button>
    </div>
  `;

  const click = spy();
  const btn = fill('button')({ handleClick: click });
  btn.click();
  t.equal(click.callCount, 1, 'click called');

  btn.parentNode.parentNode.removeChild(btn.parentNode);
  t.end();
});

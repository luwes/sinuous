import test from 'tape';
import spy from 'ispy';
import { h } from 'sinuous';
import { fill } from 'sinuous/template';

test('fill does not clone', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1 data-t="text">Banana</h1>
    </div>
  `;

  const div = fill('.container');
  const el = div({ text: '🧬' });
  t.assert(el === div());
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
    div.outerHTML,
    `<div class="container">
      <h1 data-t="">Banana milkshake</h1>
      <div class="main">
        <button>Cherry</button>
        <span data-o="">Text node patch</span>
      </div>
    </div>`
  );

  data[1]._ = '🧑';

  t.equal(
    div.outerHTML,
    `<div class="container">
      <h1 data-t="">Banana milkshake</h1>
      <div class="main">
        <button>Cherry</button>
        <span data-o="">🧑</span>
      </div>
    </div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('fill adds event listeners', function(t) {
  document.body.innerHTML = `
    <div>
      <button data-t>something</button>
    </div>
  `;

  const click = spy();
  const div = fill('div')([{ onclick: click }]);
  const btn = div.children[0];
  btn.click();
  t.equal(click.callCount, 1, 'click called');

  div.parentNode.removeChild(div);
  t.end();
});

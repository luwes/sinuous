import test from 'tape';
import spy from 'ispy';
import { h, html, hydrate, _ } from 'sinuous/hydrate';
import { observable } from 'sinuous';

test('hydrate adds event listeners', function(t) {
  document.body.innerHTML = `
    <div>
      <button>something</button>
    </div>
  `;

  const click = spy();
  const delta = h('div', [
    h('button', { onclick: click, title: 'Apply pressure' }, 'something')
  ]);
  const div = hydrate(delta, document.querySelector('div'));
  const btn = div.children[0];
  btn.click();
  t.equal(click.callCount, 1, 'click called');

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate works with nested children and patches text', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1>Banana</h1>
      <div class="main">
        <button>Cherry</button>
        Text node
      </div>
    </div>
  `;

  const delta = html`
    <div class="container">
      <h1>Banana milkshake</h1>
      <div class="main">
        <button>Cherry</button>
        Text node patch
      </div>
    </div>
  `;

  t.deepEqual(delta, {
    _tag: 'div',
    _props: { class: 'container' },
    _children: [
      { _tag: 'h1', _children: ['Banana milkshake'] },
      { _tag: 'div', _props: { class: 'main' }, _children: [
        { _tag: 'button', _children: ['Cherry'] },
        'Text node patch'
      ] }
    ]
  });

  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div class="container">
      <h1>Banana milkshake</h1>
      <div class="main">
        <button>Cherry</button>Text node patch</div>
    </div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can add observables', function(t) {
  document.body.innerHTML = `
    <div>
      0
      <button>off</button>
      0
    </div>
  `;

  const count = observable(0);
  const toggle = observable('off');
  const delta = h('div', [
    count,
    h('button', { class: 'toggle' }, toggle),
    count
  ]);
  const div = hydrate(delta, document.querySelector('div'));
  count(1);

  t.equal(
    div.outerHTML,
    `<div>1<button class="toggle">off</button>1</div>`
  );

  count(22);
  toggle('on');

  t.equal(
    div.outerHTML,
    `<div>22<button class="toggle">on</button>22</div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can add conditional observables in tags', function(t) {
  document.body.innerHTML = `
    <div class="hamburger">
      <span>Pickle</span>
      <span>Ketchup</span>
      <span>Cheese</span>
      <span>Ham</span>
    </div>
  `;

  const sauce = observable('');
  const delta = html`
    <div class="hamburger">
      <span>Pickle</span>
      <span>${() => sauce() === 'mayo' ? 'Mayo' : 'Ketchup'}</span>
      <span>Cheese</span>
      <span>Ham</span>
    </div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div class="hamburger">
      <span>Pickle</span>
      <span>Ketchup</span>
      <span>Cheese</span>
      <span>Ham</span>
    </div>`
  );

  sauce('mayo');

  t.equal(
    div.outerHTML,
    `<div class="hamburger">
      <span>Pickle</span>
      <span>Mayo</span>
      <span>Cheese</span>
      <span>Ham</span>
    </div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate works with a placeholder character', function(t) {
  document.body.innerHTML = `
    <div class="container">
      <h1>Banana</h1>
      <div class="main">
        <button>Cherry</button>
        Text node
        <button class="btn">Bom</button>
      </div>
    </div>
  `;

  const click = spy();
  const delta = html`
    <div>
      <h1>${_}</h1>
      <div>
        <button>${_}</button>
        ${_}
        <button class="btn" onclick=${click}>Bom</button>
      </div>
    </div>
  `;
  const div = hydrate(delta, document.querySelector('div'));
  const btn = div.querySelector('.btn');
  btn.click();
  t.equal(click.callCount, 1, 'click called');

  t.equal(
    div.outerHTML,
    `<div class="container">
      <h1>Banana</h1>
      <div class="main">
        <button>Cherry</button>
        Text node
        <button class="btn">Bom</button>
      </div>
    </div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can add a node from function', function(t) {
  document.body.innerHTML = `
    <div>
      <span>Pear</span>
    </div>
  `;

  const fruit = observable('Pear');
  const delta = html`
    <div>
      ${() => html`<span>${fruit}</span>`}
    </div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div>
      <span>Pear</span>
    </div>`
  );

  fruit('Apple');

  t.equal(
    div.outerHTML,
    `<div>
      <span>Apple</span>
    </div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can add a fragment from function', function(t) {
  document.body.innerHTML = `
    <div>
      <span>Pear</span>
      <span>Banana</span>
      <span>Tomato</span>
    </div>
  `;

  const fruit = observable('Pear');
  const veggie = observable('Tomato');
  const delta = html`
    <div>
      ${() => html`
        <span>${fruit}</span>
        <span>Banana</span>
        ${() => html`<span>${veggie}</span>`}
      `}
    </div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div>
      <span>Pear</span>
      <span>Banana</span>
      <span>Tomato</span>
    </div>`
  );

  fruit('Apple');
  veggie('Potato');

  t.equal(
    div.outerHTML,
    `<div>
      <span>Apple</span>
      <span>Banana</span>
      <span>Potato</span>
    </div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can add conditional observables in content', function(t) {
  document.body.innerHTML = `
    <div class="hamburger">
      Pickle
      Ketchup
      Cheese
      Ham
    </div>
  `;

  const sauce = observable('');
  const delta = html`
    <div class="hamburger">
      Pickle
      ${() => sauce() === 'mayo' ? ' Mayo ' : ' Ketchup '}
      Cheese
      Ham
    </div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div class="hamburger">Pickle Ketchup Cheese
      Ham</div>`
  );

  sauce('mayo');

  t.equal(
    div.outerHTML,
    `<div class="hamburger">Pickle Mayo Cheese
      Ham</div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrates adjacent text nodes', function(t) {
  document.body.innerHTML = `
    <div>Hi John Snow<span>!</span></div>
  `;

  const greeting = observable('Hi');
  const name = observable('John Snow');
  const delta = html`
    <div>${greeting} ${name}<span>!</span></div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div>Hi John Snow<span>!</span></div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

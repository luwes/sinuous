import test from 'tape';
import spy from 'ispy';
import { d, dhtml, hydrate, _ } from 'sinuous/hydrate';
import { observable, html } from 'sinuous';

test('hydrates div with children', function(t) {
  const delta = dhtml`<div>${[dhtml`<b />`]}</div>`;
  delete delta._children[0]._parent; // eslint-disable-line

  t.deepEqual(
    delta,
    { type: 'div', _children: [ { type: 'b', _children: [] } ] }
  );

  t.end();
});

test('hydrates root bug', function(t) {
  document.body.innerHTML = `
    <img class="hidden" />
  `;

  const img = hydrate(dhtml`
    <img class="hidden block" />
  `, document.querySelector('img'));

  t.equal(img.className, 'hidden block');
  t.end();
});

test('hydrate function undefined bug', function(t) {
  document.body.innerHTML = `
    <div class="navbar-item">
      <a>...</a>
    </div>
  `;

  const div = hydrate(dhtml`
    <div class="navbar-item">
      <a>${() => undefined}</a>
    </div>
  `);

  t.equal(div.querySelector('a').textContent, '...');
  t.end();
});

test('hydrate function bug', function(t) {
  document.body.innerHTML = `
    <div class="navbar-item">
      <a>...</a>
    </div>
  `;

  const div = hydrate(dhtml`
    <div class="navbar-item">
      <a>${() => 'Wesley'}</a>
    </div>
  `);

  t.equal(div.querySelector('a').textContent, 'Wesley');
  t.end();
});

test('add insert into empty node feature', function(t) {
  document.body.innerHTML = `
    <div class="navbar-item">
      <a></a>
    </div>
  `;

  const div = hydrate(dhtml`
    <div class="navbar-item">
      <a>${() => 'Wesley'}</a>
    </div>
  `);

  t.equal(div.querySelector('a').textContent, 'Wesley');
  t.end();
});

test('hydrate conditional root element', function(t) {
  document.body.innerHTML = `
    <player-x></player-x>
  `;

  const showing = observable(true);

  var player = hydrate(dhtml`
    ${() => (player = showing() ? dhtml`<player-x autoplay />` : '')}
  `);

  t.equal(player.tagName, 'PLAYER-X');
  t.equal(player.autoplay, true);

  showing(false);
  t.equal(player, '');

  showing(true);
  t.equal(player.tagName, 'PLAYER-X');

  t.end();
});

test('hydrate w/ observables bug', function(t) {
  document.body.innerHTML = `
    <div class="box level">
      <div class="level-item">
        <button class="button">-</button>
      </div>
      <div class="level-item">
        <h1 class="title">0</h1>
      </div>
      <div class="level-item">
        <button class="button">+</button>
      </div>
    </div>
  `;

  const count = observable(0);
  const down = spy();
  down.delegate = () => count(count() - 1);
  const up = spy();
  up.delegate = () => count(count() + 1);

  const delta = dhtml`
    <div class="box level">
      <div class="level-item">
        <button class="button" onclick="${down}">
          -
        </button>
      </div>
      <div class="level-item">
        <h1 class="title">${count}</h1>
      </div>
      <div class="level-item">
        <button class="button" onclick="${up}">
          +
        </button>
      </div>
    </div>
  `;

  const box = hydrate(delta, document.querySelector('.box'));

  box.querySelectorAll('.button')[0].click();
  t.equal(down.callCount, 1, 'click called');

  t.equal(box.querySelector('h1').textContent, '-1');

  t.end();
});

test('hydrate adds event listeners', function(t) {
  document.body.innerHTML = `
    <div>
      <button>something</button>
    </div>
  `;

  const click = spy();
  const delta = d('div', [
    d('button', { onclick: click, title: 'Apply pressure' }, 'something')
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

  const delta = dhtml`
    <div class="container">
      <h1>Banana milkshake</h1>
      <div class="main">
        <button>Cherry</button>
        Text node patch
      </div>
    </div>
  `;

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
  const delta = d('div', [
    count,
    d('button', { class: 'toggle' }, toggle),
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
  const delta = dhtml`
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
  const delta = dhtml`
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
  const delta = dhtml`
    <div>
      ${() => dhtml`<span>${fruit}</span>`}
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
  const delta = dhtml`
    <div>
      ${() => dhtml`
        <span>${fruit}</span>
        <span>Banana</span>
        ${() => dhtml`<span>${veggie}</span>`}
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

test('hydrates adjacent text nodes', function(t) {
  document.body.innerHTML = `
    <div>Hi John Snow<span>!</span></div>
  `;

  const greeting = observable('Hi');
  const name = observable('John Snow');
  const delta = dhtml`
    <div>${greeting} ${name}<span>!</span></div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div>Hi John Snow<span>!</span></div>`
  );

  name('Wesley Luyten');

  t.equal(
    div.outerHTML,
    `<div>Hi Wesley Luyten<span>!</span></div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can add conditional observables in content', function(t) {
  document.body.innerHTML = `
    <div class="hamburger">Pickle Ketchup Cheese Ham</div>
  `;

  const sauce = observable('');
  const delta = dhtml`
    <div class="hamburger">
      Pickle ${() => sauce() === 'mayo' ? 'Mayo' : 'Ketchup'} Cheese Ham
    </div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div class="hamburger">Pickle Ketchup Cheese Ham</div>`
  );

  sauce('mayo');

  t.equal(
    div.outerHTML,
    `<div class="hamburger">Pickle Mayo Cheese Ham</div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can add conditional observables in content w/ newlines', function(t) {
  document.body.innerHTML = `
    <div class="hamburger">
      Pickle
      Ketchup
      Cheese
      Ham
    </div>
  `;

  const sauce = observable('');
  const delta = dhtml`
    <div class="hamburger">
      Pickle
      ${() => sauce() === 'mayo' ? 'Mayo' : 'Ketchup'}
      Cheese
      Ham
    </div>
  `;
  const div = hydrate(delta, document.querySelector('div'));

  t.equal(
    div.outerHTML,
    `<div class="hamburger">
      Pickle
      Ketchup
      Cheese
      Ham
    </div>`
  );

  sauce('mayo');

  t.equal(
    div.outerHTML,
    `<div class="hamburger">
      Pickle
      Mayo
      Cheese
      Ham
    </div>`
  );

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate can create dom after hydration', function(t) {
  document.body.innerHTML = `
    <button>
      ...
    </button>
  `;

  const avatar = observable('W');

  const button = hydrate(dhtml`
    <button>
      ${avatar}
    </button>
  `, document.querySelector('button'));

  t.equal(button.childNodes[0].textContent, 'W');

  avatar(html`
    W
    <img class="hidden" src="https://sinuous.io/" />
  `);

  t.equal(button.childNodes[2].src, 'https://sinuous.io/');

  t.end();
});

test('hydrate components', function(t) {
  document.body.innerHTML = `
    <div id="wrap">
      <div class="name">
        <span>Wes</span>
      </div>
    </div>
  `;

  const name = observable('Wes');

  const Name = (props) => {
    return dhtml`
      <div class="name hidden">
        <span>${props.text}</span>
      </div>
    `;
  };

  const div = hydrate(dhtml`
    <div id="wrap">
      <${Name} text=${name} />
    </div>
  `);

  t.equal(div.children[0].className, 'name hidden');
  t.equal(div.children[0].children[0].textContent, 'Wes');

  name('Joe');

  t.equal(div.children[0].children[0].textContent, 'Joe');

  t.end();
});

test('hydrate root component', function(t) {
  document.body.innerHTML = `
    <div class="name">
      <span>Wes</span>
    </div>
  `;

  const name = observable('Wes');

  const Name = (props) => {
    return dhtml`
      <div class="name">
        <span>${props.text}</span>
      </div>
    `;
  };

  const div = hydrate(dhtml`
    <${Name} text=${name} />
  `);

  t.equal(div.className, 'name');
  t.equal(div.children[0].textContent, 'Wes');

  name('Joe');

  t.equal(div.children[0].textContent, 'Joe');

  t.end();
});

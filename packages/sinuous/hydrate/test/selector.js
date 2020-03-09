import test from 'tape';
import { dhtml, hydrate } from 'sinuous/hydrate';
import { observable } from 'sinuous';

test('hydrate selects root node via id selector', function(t) {
  document.body.innerHTML = `
    <div id="root">
      <button>something</button>
    </div>
  `;

  const div = hydrate(dhtml`
    <div id="root">
      <button title="Apply pressure">something</button>
    </div>
  `);

  t.equal(div, document.querySelector('#root'));

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate selects root node via class selector', function(t) {
  document.body.innerHTML = `
    <div class="root pure">
      <button>something</button>
    </div>
  `;

  const div = hydrate(dhtml`
    <div class="root pure">
      <button title="Apply pressure">something</button>
    </div>
  `);

  t.equal(div, document.querySelector('.root.pure'));
  t.equal(div, document.querySelector('.root'));
  t.equal(div, document.querySelector('.pure'));

  div.parentNode.removeChild(div);
  t.end();
});

test('hydrate selects root node via tag selector', function(t) {
  document.body.innerHTML = `
    <button>something</button>
  `;

  const btn = hydrate(dhtml`
    <button title="Apply pressure">something</button>
  `);

  t.equal(btn, document.querySelector('button'));

  btn.parentNode.removeChild(btn);
  t.end();
});

test('hydrate selects root node via partial class selector', function(t) {
  document.body.innerHTML = `
    <div class="root pure">
      <button>something</button>
    </div>
  `;

  const isActive = observable('');
  const div = hydrate(dhtml`
    <div class="root pure${isActive}">
      <button
        onclick=${() => isActive(isActive() ? '' : ' is-active')}
        title="Apply pressure"
      >
        something
      </button>
    </div>
  `);

  const btn = div.children[0];
  btn.click();
  t.equal(div.className, 'root pure is-active', 'click called');

  t.equal(div, document.querySelector('.root.pure'));
  t.equal(div, document.querySelector('.root'));
  t.equal(div, document.querySelector('.pure'));

  div.parentNode.removeChild(div);
  t.end();
});

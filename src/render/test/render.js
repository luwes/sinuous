import tape from 'tape';
import { h } from 'sinuous';
import { rhtml, render } from 'sinuous/render';
import { fragInnerHTML, beforeEach } from '../../test/_utils.js';

let container;

const test = beforeEach(tape, (assert) => {
  container = document.createElement('div');
  assert.end();
});

test('creates proper template', t => {
  const h1 = rhtml`
    <div>
      <h1>${1}</h1>
      <h2></h2>
    </div>`;

  t.equal(fragInnerHTML(h1()), '<div><h1>1</h1><h2></h2></div>');
  t.end();
});

test('simple render', t => {
  const Comp = title =>
    rhtml`
      <h1>${title}</h1>
    `;

  t.equal(fragInnerHTML(Comp('Yo')()), '<h1>Yo</h1>');
  t.equal(fragInnerHTML(Comp('Hi')()), '<h1>Hi</h1>');
  t.equal(Comp('Hi')().textContent, 'Hi');
  t.end();
});

test('render w/ multiple holes', t => {
  const Comp = (title, desc) =>
    rhtml`
      <div>
        <h1>${title}</h1>
        <div><i>${desc}</i></div>
      </div>
    `;

  t.equal(
    fragInnerHTML(Comp('Yo', 'Hello man')()),
    '<div><h1>Yo</h1><div><i>Hello man</i></div></div>'
  );

  t.equal(
    fragInnerHTML(Comp('Hi', 'there')()),
    '<div><h1>Hi</h1><div><i>there</i></div></div>'
  );

  t.end();
});

test('render w/ conditional branch', t => {
  const Comp = title => rhtml`
    <div>
      <h1 class="red">
        ${title ? rhtml`<span>${title}</span>` : rhtml`<span>No name</span>`}
      </h1>
    </div>
  `;

  render(Comp('Yo'), container);
  t.equal(container.innerHTML, '<div><h1 class="red"><span>Yo</span></h1></div>');

  render(Comp(''), container);
  t.equal(
    container.innerHTML,
    '<div><h1 class="red"><span>No name</span></h1></div>'
  );

  t.end();
});

test('render w/ multiple holes as document fragments', t => {
  const Comp = (title, desc) =>
    rhtml`
      <h1>${title}</h1>
      <div>${desc}</div>
    `;

  render(Comp('Yo', 'Hello man'), container);
  const h1 = container.children[0];
  t.equal(container.innerHTML, '<h1>Yo</h1><div>Hello man</div>');

  render(Comp('Hi', 'What up?'), container);
  t.equal(container.innerHTML, '<h1>Hi</h1><div>What up?</div>');
  t.equal(container.children[0], h1);

  t.end();
});

test('nested render 2', t => {
  const Comp = (title, desc = '') => rhtml`
    <div>
      9
      ${rhtml`
        <div>
          9
          ${rhtml`
            <h1>${title}</h1>
          `}
          <p>${desc}</p>
        </div>
      `}
    </div>`;

  render(Comp('Yo', 'hello'), container);
  t.equal(container.innerHTML, '<div>9<div>9<h1>Yo</h1><p>hello</p></div></div>');

  render(Comp('Hi'), container);
  t.equal(container.innerHTML, '<div>9<div>9<h1>Hi</h1><p></p></div></div>');

  render(Comp('What?'), container);
  t.equal(container.innerHTML, '<div>9<div>9<h1>What?</h1><p></p></div></div>');

  t.end();
});

test('nested render', t => {
  const Comp = (title, desc = '') => rhtml`
    <div>
      9
      ${rhtml`
        <h1>${title}</h1>
      `}
      ${desc ? rhtml`<p>${desc}</p>` : rhtml`<p>Nope</p>`}
    </div>`;

  render(Comp('Yo', 'hello'), container);
  t.equal(container.innerHTML, '<div>9<h1>Yo</h1><p>hello</p></div>');

  render(Comp('Hi'), container);
  t.equal(container.innerHTML, '<div>9<h1>Hi</h1><p>Nope</p></div>');

  render(Comp('What up?', 'dude'), container);
  t.equal(container.innerHTML, '<div>9<h1>What up?</h1><p>dude</p></div>');

  t.end();
});


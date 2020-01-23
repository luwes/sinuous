import test from 'tape';
import { h } from 'sinuous';
import { rhtml, render } from 'sinuous/render';
import { fragInnerHTML } from '../../test/_utils.js';

test('creates proper template', t => {
  const h1 = rhtml`
    <div>
      <h1>${1}</h1>
      <h2></h2>
    </div>`;

  t.equal(fragInnerHTML(h1()), '<div><h1>1</h1><h2></h2></div>');
  // t.equal(h1(), h1());
  t.end();
});

test('simple render', t => {
  const Comp = title =>
    rhtml`
      <h1>${title}</h1>
    `;

  t.equal(fragInnerHTML(Comp('Yo')()), '<h1>Yo</h1>');
  t.equal(fragInnerHTML(Comp('Hi')()), '<h1>Hi</h1>');
  // t.equal(Comp('Yo')(), Comp('Hi')());
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

  // t.equal(Comp('Yo', 'Hello man')(), Comp('Hi', 'there')());

  t.end();
});

test('render w/ conditional branch', t => {
  let scratch = h('div');
  h(document.body, scratch);

  const Comp = title => rhtml`
    <div>
      <h1 class="red">
        ${title
          ? rhtml`<span>${title}</span>`
          : rhtml`<span>No name</span>`
        }
      </h1>
    </div>
  `;

  render(Comp('Yo'), scratch);

  t.equal(scratch.innerHTML, '<div><h1 class="red"><span>Yo</span></h1></div>');

  render(Comp(''), scratch);

  t.equal(scratch.innerHTML, '<div><h1 class="red"><span>No name</span></h1></div>');

  // t.equal(Comp('')(), Comp('Yo')());

  t.end();
});

test('render w/ multiple holes as document fragments', t => {
  let scratch = h('div');
  h(document.body, scratch);

  const Comp = (title, desc) =>
    rhtml`
      <h1>${title}</h1>
      <div>${desc}</div>
    `;

  render(Comp('Yo', 'Hello man'), scratch);

  const h1 = scratch.children[0];

  t.equal(scratch.innerHTML, '<h1>Yo</h1><div>Hello man</div>');

  render(Comp('Hi', 'What up?'), scratch);

  t.equal(scratch.innerHTML, '<h1>Hi</h1><div>What up?</div>');

  t.equal(scratch.children[0], h1);

  t.end();
});

test('nested render', t => {
  let scratch = h('div');
  h(document.body, scratch);

  const Comp = title => rhtml`
    <div>
      9
      ${rhtml`
        <div>
          9
          ${rhtml`
            <h1>${title}</h1>
          `}
        </div>
      `}
    </div>`;

  // t.equal(fragInnerHTML(Comp('Yo')()), fragInnerHTML(Comp('Hi')()));

  render(Comp('Yo'), scratch);
  t.equal(scratch.innerHTML, '<div>9<div>9<h1>Yo</h1></div></div>');

  render(Comp('Hi'), scratch);
  t.equal(scratch.innerHTML, '<div>9<div>9<h1>Hi</h1></div></div>');

  render(Comp('What?'), scratch);
  t.equal(scratch.innerHTML, '<div>9<div>9<h1>What?</h1></div></div>');

  t.end();
});

test('render', t => {
  let scratch = h('div');
  h(document.body, scratch);

  const Comp = title => rhtml`
    <div>
      <h1>${title}</h1>
    </div>`;

  render(Comp('Yo'), scratch);
  t.equal(scratch.innerHTML, '<div><h1>Yo</h1></div>');

  const h1 = scratch.children[0].children[0];

  render(Comp('Hi'), scratch);
  t.equal(scratch.innerHTML, '<div><h1>Hi</h1></div>');

  t.equal(h1, scratch.children[0].children[0]);

  t.end();
});

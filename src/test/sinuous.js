import test from 'tape';
import { o, html } from 'sinuous';
import { subscribe } from 'sinuous/observable';
import { map } from 'sinuous/map';
import { fragInnerHTML } from './_utils.js';

test('simple', function(t) {
  t.equal(
    html`
      <h1></h1>
    `.outerHTML,
    '<h1></h1>'
  );
  t.equal(
    html`
      <h1>hello world</h1>
    `.outerHTML,
    '<h1>hello world</h1>'
  );
  t.end();
});

test('returns a simple string', t => {
  const frag = html`
    a
  `;
  t.assert(frag instanceof DocumentFragment);
  t.assert(frag.childNodes[0] instanceof Text);
  t.equal(frag.childNodes[0].textContent, 'a');
  t.end();
});

test('returns a simple number', t => {
  const frag = html`
    ${9}
  `;
  t.assert(frag instanceof DocumentFragment);
  t.assert(frag.childNodes[0] instanceof Text);
  t.equal(frag.childNodes[0].textContent, '9');
  t.end();
});

test('returns a document fragment', t => {
  const frag = html`
    ${[
      html`
        <div>Banana</div>
      `,
      html`
        <div>Apple</div>
      `
    ]}
  `;
  t.assert(frag instanceof DocumentFragment);
  t.equal(frag.childNodes[0].outerHTML, '<div>Banana</div>');
  t.equal(frag.childNodes[1].outerHTML, '<div>Apple</div>');
  t.end();
});

test('returns a simple observable string', t => {
  const title = o('Banana');
  const frag = html`
    ${title}
  `;
  t.assert(frag instanceof DocumentFragment);
  t.assert(frag.childNodes[0] instanceof Text);
  t.equal(frag.childNodes[0].textContent, 'Banana');
  t.end();
});

test('component children order', t => {
  let order = '';
  const Comp = (props, ...children) => {
    order += 'a';
    return children;
  };
  const Child = () => {
    order += 'b';
    return html`<b />`;
  };

  const result = html`
    <${Comp}>
      <${Child} />
    <//>
  `;

  t.equal(order, 'ab');
  t.equal(fragInnerHTML(result), '<b></b>');
  t.end();
});

test('conditional lists without root', t => {
  const choice = o(1);
  const filler = o(0);

  const Spinner = () => html`<div class="spinner"/>`;

  const Story = (index) => {
    const n1 = `a${index}`;
    const n2 = `b${index}`;
    const list = o();

    subscribe(() => {
      if (filler() === index) list([n1, n2]);
    });

    return html`${() => list() ? map(list, (item) => html`<i>${item}</i>`) : Spinner()}`;
  };

  const log = (el, ...args) => {
    console.warn(Array.from(el.childNodes)
      .map(c => `${c}${c.__g?','+c.__g:''}`).join(' — '), ...args);
    console.warn('');
  };

  const firstStory = Story(1);

  console.warn('raw story 1 element');
  log(firstStory);
  const stories = [firstStory, Story(2), Story(3)];

  const div = html`<div>${() => stories[choice() - 1]}</div>`;
  document.body.appendChild(div);
  log(div);

  console.warn('story 1 - filler 1');

  filler(1);
  t.equal(div.children.length, 2);
  log(div);

  console.warn('story 2 - filler 2');
  choice(2);
  t.equal(div.children.length, 1);
  log(div);

  filler(2);
  t.equal(div.children[0].innerText, 'a2');
  t.equal(div.children.length, 2);

  t.end();
});

test('nested fragments without root', t => {
  const choice = o(0);
  const show = o(true);
  const show2 = o(true);

  const Story = (index) => {
    const n1 = `a${index}`;
    const n2 = `b${index}`;
    const list = o([n1, n2]);
    return html`${() => show() ? map(list, (item) => html`<i>${item}</i>`) : ''}`;
  };

  const firstStory = Story(1);
  const stories = [firstStory, Story(2), Story(3)];

  const div = html`<div>${() => show2() && stories[choice()]}</div>`;
  document.body.appendChild(div);


  t.equal(div.children.length, 2);
  t.equal(div.children[0].innerText, 'a1');

  show(false);
  t.equal(div.children.length, 0);

  show(true);
  choice(1);
  t.equal(div.children[0].innerText, 'a2');

  t.equal(div.children.length, 2);

  show(false);
  t.equal(div.children.length, 0);

  show(true);
  choice(2);

  t.equal(div.children.length, 2);

  show2(false);
  t.equal(div.children.length, 0);

  choice(1);
  show(true);
  show2(true);

  t.equal(div.children.length, 2);
  t.equal(div.children[0].innerText, 'a2');

  t.end();
});

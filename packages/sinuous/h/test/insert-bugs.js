import test from 'tape';
import { o, h, html } from 'sinuous';
import { insert } from '../src/insert.js';

test('empty fragment clear bug', t => {
  let scratch = h('div');
  h(document.body, scratch);

  const value = o(99);
  const props = { val: value };
  const comp = ({ val }) => html`
    <h1>Hello world</h1>
    <p>Bye bye ${val}</p>
  `;

  const comp2 = ({ val }) => html`
    <h1>Bye world</h1>
    <p>Hello hello ${val}</p>
  `;

  let active = o(comp);
  const res = html`
    <h3>Dynamic Components</h3>
    <hr/>
    ${() => {
      const c = active();
      return c(props);
    }}
  `;
  scratch.appendChild(res);

  const emptyFrag = () => document.createDocumentFragment();

  t.equal(scratch.innerHTML, `<h3>Dynamic Components</h3><hr><h1>Hello world</h1><p>Bye bye 99</p>`);

  active(comp2);
  t.equal(scratch.innerHTML, `<h3>Dynamic Components</h3><hr><h1>Bye world</h1><p>Hello hello 99</p>`);

  active(emptyFrag);
  t.equal(scratch.innerHTML, `<h3>Dynamic Components</h3><hr>`);

  active(emptyFrag);
  t.equal(scratch.innerHTML, `<h3>Dynamic Components</h3><hr>`);

  t.end();
});

test('insert 9', t => {
  let scratch = h('div');
  h(document.body, scratch);

  let active = o(1);

  const Comp = title => html`
    <div>
      9
      ${() => {
        active();
        return html`
          <div>
            9
            ${() => html`
              <h1>${title}</h1>
            `}
          </div>
        `;
      }}
    </div>`;

  const el = Comp('Yo');
  insert(scratch, el);

  active(2);
  active(3);

  t.equal(scratch.innerHTML, '<div>9<div>9<h1>Yo</h1></div></div>');

  t.end();
});

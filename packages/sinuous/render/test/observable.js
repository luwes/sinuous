import tape from 'tape';
import { o } from 'sinuous';
import { rhtml, render } from 'sinuous/render';
import { beforeEach } from '../../test/_utils.js';

let container;

const test = beforeEach(tape, (assert) => {
  container = document.createElement('div');
  assert.end();
});

test('simple render', t => {
  const title = o('Yo');
  const subtitle = o(`What's up?`);

  const Comp = () => {
    const t = title();
    const sub = subtitle();

    return rhtml`
      <h1>${t}</h1>
      <p>${sub}</p>
    `;
  };

  render(Comp, container);
  t.equal(container.innerHTML, `<h1>Yo</h1><p>What's up?</p>`);

  title('Hi');
  t.equal(container.innerHTML, `<h1>Hi</h1><p>What's up?</p>`);

  t.end();
});

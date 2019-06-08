import S from 's-js';
import { context } from 'sinuous/h';
import map from 'sinuous/map';
import htm from 'htm';

const subscribe = (fn) => S.root((dispose) => S(fn) && dispose);
const h = context({ ...S, subscribe });
const html = htm.bind(h);
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const count = S.data(0);
const style = S.data({});
const onclick = S.data(clicked);

function clicked() {
  onclick(false);
  console.log('removed click handler');

  h.cleanUp();
  console.log('removed observers');
}

let list = S.data([
  'bread',
  'milk',
  'honey',
  'chips',
  'cookie'
]);

const template = () => {
  return html`
    <div>
      <h1 style=${style}>
        Sinuous <sup>${count}</sup>
        <div>${() => count() + count()}</div>
        <button onclick="${onclick}">Click</button>
      </h1>
      <ul>
        ${map(list, (item) => html`<li>${item}</li>`)}
      </ul>
    </div>
  `;
};

S.root(() => document.querySelector('.sinuous').appendChild(template()));
setInterval(() => {
  style({ color: randomColor() });
  count(count() + 1);

  const randomList = shuffle(list());
  list(randomList);
}, 1000);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

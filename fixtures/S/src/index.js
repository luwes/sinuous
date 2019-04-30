import S from 's-js';
import sinuous from 'sinuous';
import htm from 'htm';

const h = sinuous(S);
const html = htm.bind(h);
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const count = S.data(0);
const style = S.data('');
const onclick = S.data(clicked);

function clicked(e) {
  console.log(99);
  console.log(e);
}

const template = () => {
  return html`
    <h1 style=${() => style()}>
      Sinuous <sup>${() => count()}</sup>
      <div>${() => count() + count()}</div>
      <button onclick="${() => onclick()}">Click</button>
    </h1>
  `;
};

setTimeout(() => {
  onclick(false);
}, 300);

S.root(() => document.querySelector('.sinuous').append(template()));
setInterval(() => style({ color: randomColor() }) && count(count() + 1), 1000);

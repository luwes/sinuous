import o, { subscribe } from 'sinuous/observable';
import sinuous from 'sinuous';

const h = sinuous(subscribe);
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const count = o(0);
const style = o({});
const onclick = o(clicked);

function clicked() {
  onclick(false);
  console.log('removed click handler');

  setTimeout(() => {
    h.cleanup();
    console.log('removed observers');
  }, 500);
}

const template = () => {
  return html`
    <h1 style=${style}>
      Sinuous <sup>${count}</sup>
      <div>${() => count() + count()}</div>
      <button onclick="${onclick}">Click</button>
    </h1>
  `;
};

document.querySelector('.sinuous').append(template());
setInterval(() => style({ color: randomColor() }) && count(count() + 1), 1000);

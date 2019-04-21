import sinuous from 'sinuous';
import htm from 'htm';
import hyperactiv from 'hyperactiv';
const { observe, computed } = hyperactiv;

const h = sinuous.bind(computed);
const html = htm.bind(h);
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const s = observe({
  count: 0,
  style: ''
});

const template = () => {
  return html`
    <h1 style=${() => s.style}>
      Sinuous <sup>${() => s.count}</sup>
    </h1>
  `;
};

document.querySelector('.sinuous').append(template());
setInterval(() => (s.style = { color: randomColor() }) && s.count++, 1000);

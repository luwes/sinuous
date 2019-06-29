import { o, h } from 'sinuous';

const Timer = (props) => {
  const seconds = o(0);

  function tick() {
    seconds(seconds() + 1);
  }
  setInterval(tick, 1000);

  return html`
    <div>Seconds: ${seconds}</div>
  `;
};

document.querySelector('.counter-example').append(
  html`<${Timer}/>`
);

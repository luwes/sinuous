import { o, html, svg } from 'sinuous';

const ClockContainer = () => {
  const date = o(new Date());

  function tick() {
    date(new Date());
  }
  setInterval(tick, 1000);

  return html`
    <style>
      .square {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 100%;
      }

      .square svg {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      .clock-face {
        stroke: #333;
        fill: white;
      }

      .minor {
        stroke: #999;
        stroke-width: 0.5;
      }

      .major {
        stroke: #333;
        stroke-width: 1;
      }

      .hour {
        stroke: #333;
      }

      .minute {
        stroke: #666;
      }

      .second,
      .second-counterweight {
        stroke: rgb(180, 0, 0);
      }

      .second-counterweight {
        stroke-width: 3;
      }
    </style>
    <div class="square">
      <${Clock} date=${date} />
    </div>
  `;
};

const Clock = ({ date }) => {
  return svg`
    <svg viewBox="0 0 100 100">
      <g transform=translate(50,50)>
        <circle class=clock-face r=48 />
        ${minuteTicks}
        ${hourTicks}
        <line class=hour y1=2 y2=-20
          transform=${() =>
            `rotate(${30 * date().getHours() + date().getMinutes() / 2})`} />
        <line class=minute y1=4 y2=-30
          transform=${() =>
            `rotate(${6 * date().getMinutes() + date().getSeconds() / 10})`} />
        <g transform=${() => `rotate(${6 * date().getSeconds()})`}>
          <line class=second y1=10 y2=-38/>
          <line class=second-counterweight y1=10 y2=2/>
        </g>
      </g>
    </svg>`;
};

const minuteTicks = (() => {
  const lines = [];
  for (let i = 0; i < 60; i++) {
    lines.push(svg`
      <line class=minor y1=42 y2=45 transform=${`rotate(${(360 * i) / 60})`} />
    `);
  }
  return lines;
})();

const hourTicks = (() => {
  const lines = [];
  for (let i = 0; i < 12; i++) {
    lines.push(svg`
      <line class=major y1=32 y2=45 transform=${`rotate(${(360 * i) / 12})`} />
    `);
  }
  return lines;
})();

document.querySelector('.clock-example').append(ClockContainer());

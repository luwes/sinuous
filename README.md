# 🐍 Sinuous - Reactive render engine

Sinuous is a little experiment to get similar behavior as [Surplus](https://github.com/adamhaile/surplus) but with template literals instead of JSX.  
[HTM](https://github.com/developit/htm) compiles to an `h` tag. Adapted code from [Ryan Solid](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions)'s dom expression plugin + [S.js](https://github.com/adamhaile/S) provides the reactivity.

```js
import { root, data, html } from 'sinuous';

const title = data('The Shining');
const byline = data('🔪');
const className = data('axe');

const template = () => {
  return html`
    <div>
      <h1 className=${() => className()}>
        ${() => className() == 'red' ? title('REDRUM') : title()}
      </h1>
      <h2 className=${() => className()}>
        ${() => className() == 'axe' ? byline() : byline('RUN!')}
      </h2>
    </div>
  `;
};

root(() => document.querySelector('.sinuous').append(template()));

setTimeout(() => {
  className('red');
}, 2000);
```

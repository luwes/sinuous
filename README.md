# 🐍 Sinuous

![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/dist/sinuous.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Sinuous supports modern browsers and IE11+:

[![Sauce Test Status](https://saucelabs.com/browser-matrix/sinuous.svg)](https://saucelabs.com/u/sinuous)

Sinuous is a little experiment to get similar behavior as [Surplus](https://github.com/adamhaile/surplus) but with template literals instead of JSX.  
[HTM](https://github.com/developit/htm) compiles to an `h` tag. Adapted code from [Ryan Solid](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions)'s dom expressions + a Reactive library provides the reactivity.

Sinuous returns a [hyperscript](https://github.com/hyperhype/hyperscript) function which is armed to handle the callback functions from the reactive library and updates the dom accordingly.

### Example with [Sinuous Observable](./packages/sinuous/observable) ([Codesandbox](https://codesandbox.io/s/j4vm9yow89))

```js
// 1.98 kB gzip (with babel-plugin-htm)
import o, { subscribe } from 'sinuous/observable';
import sinuous from 'sinuous';

const h = sinuous({ subscribe });
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const count = o(0);
const style = o({});
const onclick = o(clicked);

function clicked() {
  onclick(false);
  console.log('removed click handler');

  setTimeout(() => {
    h.cleanUp();
    console.log('removed observers');
  }, 500);
}

// Closures are only needed for computations.
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
```

### Example with [S.js](https://github.com/adamhaile/S)

```js
// 3.87 kB gzip
import S from 's-js';
import sinuous from 'sinuous';
import htm from 'htm';

const h = sinuous({ subscribe: S });
const html = htm.bind(h);
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const count = S.data(0);
const style = S.data('');

const template = () => {
  return html`
    <h1 style=${() => style()}>Sinuous <sup>${() => count()}</sup></h1>
  `;
};

S.root(() => document.querySelector('.sinuous').append(template()));
setInterval(() => style({ color: randomColor() }) && count(count() + 1), 1000);
```

### Example with [hyperactiv](https://github.com/elbywan/hyperactiv)

```js
// 3.03 kB gzip
import sinuous from 'sinuous';
import htm from 'htm';
import hyperactiv from 'hyperactiv';
const { observe, computed } = hyperactiv;

const h = sinuous({ subscribe: computed });
const html = htm.bind(h);
const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);

const s = observe({
  count: 0,
  style: ''
});

const template = () => {
  return html`
    <h1 style=${() => s.style}>Sinuous <sup>${() => s.count}</sup></h1>
  `;
};

document.querySelector('.sinuous').append(template());
setInterval(() => (s.style = { color: randomColor() }) && s.count++, 1000);
```

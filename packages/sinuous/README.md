# <a href="https://github.com/luwes/sinuous"><img src="https://raw.githubusercontent.com/luwes/sinuous/master/media/sinuous-logo.svg?sanitize=true" height="36" alt="Sinuous" /></a>

[![Build Status](https://img.shields.io/travis/luwes/sinuous/master.svg?style=flat-square&label=Travis+CI)](https://travis-ci.org/luwes/sinuous)
![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/dist/sinuous.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

**npm**: `npm install sinuous --save`  
**cdn**: https://unpkg.com/sinuous@latest/dist/sinuous.js

### Intro

Sinuous provides the clarity of declarative views and the performance of direct DOM manipulation.  
It was built with these ideas in mind.

- Developer experience
- [Performance](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html)
- Small bundle size, made for use in other mini libraries like custom elements.
- Plain Javascript feel; template literals, standard HTML.
- Choose your own reactive library:
  [`Sinuous Observable`](./packages/sinuous/observable)
  [`S.js`](https://github.com/adamhaile/S)
  [`hyperactiv`](https://github.com/elbywan/hyperactiv)

### Add-ons

| Size                                                                                                                                                | Name                                                  | Description           |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------- |
| ![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/map/dist/map.js?compression=gzip&label=gzip&style=flat-square)               | [`sinuous/map`](./packages/sinuous/map)               | Fast list renderer    |
| ![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/template/dist/template.js?compression=gzip&label=gzip&style=flat-square)     | [`sinuous/template`](./packages/sinuous/template)     | Pre-rendered Template |
| ![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/observable/dist/observable.js?compression=gzip&label=gzip&style=flat-square) | [`sinuous/observable`](./packages/sinuous/observable) | Tiny observable       |

### Concept

Sinuous started as a little experiment to get similar behavior as [Surplus](https://github.com/adamhaile/surplus) but with template literals instead of JSX.
[HTM](https://github.com/developit/htm) compiles to an `h` tag. Adapted code from [Ryan Solid](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions)'s dom expressions + a Reactive library provides the reactivity.

Sinuous returns a [hyperscript](https://github.com/hyperhype/hyperscript) function which is armed to handle the callback functions from the reactive library and updates the DOM accordingly.

Sinuous supports modern browsers and IE11+:

[![Sauce Test Status](https://saucelabs.com/browser-matrix/sinuous.svg)](https://saucelabs.com/u/sinuous)

### Counter (_1.81kB gzip_)

```js
import { o, h } from 'sinuous';

const counter = o(0);
const template = () => {
  return html`
    <div>Counter ${counter}</div>
  `;
};

document.body.append(template());
setInterval(() => counter(counter() + 1), 1000);
```

### Example with [Sinuous Observable](./packages/sinuous/observable) ([Codesandbox](https://codesandbox.io/s/j4vm9yow89))

```js
// 1.98 kB gzip (with babel-plugin-htm)
import { o, h } from 'sinuous';

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

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com

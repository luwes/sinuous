# <a href="https://github.com/luwes/sinuous"><img src="https://raw.githubusercontent.com/luwes/sinuous/master/media/sinuous-logo.svg?sanitize=true" height="36" alt="Sinuous" /></a>

[![Build Status](https://img.shields.io/travis/luwes/sinuous/master.svg?style=flat-square&label=Travis+CI)](https://travis-ci.org/luwes/sinuous)
![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/sinuous.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

**npm**: `npm install sinuous --save`  
**cdn**: https://unpkg.com/sinuous/dist/sinuous.js

### Intro

Sinuous provides the clarity of declarative views and the performance of direct DOM manipulation.  
It was built with these ideas in mind.

- Small: use in other mini libraries like custom elements.
- Simple: plain Javascript feel; template literals, standard HTML.
- [Performance](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html)
- Choose your own reactive library:
  [`Sinuous Observable`](./packages/sinuous/observable)
  [`S.js`](https://github.com/adamhaile/S)
  [`hyperactiv`](https://github.com/elbywan/hyperactiv)

### Add-ons

| Size                                                                                                                                                | Name                                                  | Description           |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------- |
| ![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/map/dist/map.js?compression=gzip&label=gzip&style=flat-square&v=1)               | [`sinuous/map`](./packages/sinuous/map)               | Fast list renderer    |
| ![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/template/dist/template.js?compression=gzip&label=gzip&style=flat-square)     | [`sinuous/template`](./packages/sinuous/template)     | Pre-rendered Template |
| ![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/observable/dist/observable.js?compression=gzip&label=gzip&style=flat-square) | [`sinuous/observable`](./packages/sinuous/observable) | Tiny observable       |

### Concept

Sinuous started as a little experiment to get similar behavior as [Surplus](https://github.com/adamhaile/surplus) but with template literals instead of JSX.
[HTM](https://github.com/developit/htm) compiles to an `h` tag. Adapted code from [Ryan Solid](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions)'s dom expressions + a Reactive library provides the reactivity.

Sinuous returns a [hyperscript](https://github.com/hyperhype/hyperscript) function which is armed to handle the callback functions from the reactive library and updates the DOM accordingly.

### Counter Example (_1.81kB gzip_) ([Codesandbox](https://codesandbox.io/s/sinuous-counter-z6k71))

```js
import { o, h } from 'sinuous';

const counter = o(0);
const view = () => {
  return html`
    <div>Counter ${counter}</div>
  `;
};

document.body.append(view());
setInterval(() => counter(counter() + 1), 1000);
```

### Browser Support

Sinuous supports modern browsers and IE11+:

[![Sauce Test Status](https://saucelabs.com/browser-matrix/sinuous.svg)](https://saucelabs.com/u/sinuous)

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com

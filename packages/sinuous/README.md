# <a href="https://github.com/luwes/sinuous"><img src="https://raw.githubusercontent.com/luwes/sinuous/master/media/sinuous-logo.svg?sanitize=true" height="36" alt="Sinuous" /></a>

[![Build Status](https://img.shields.io/travis/luwes/sinuous/master.svg?style=flat-square&label=Travis+CI)](https://travis-ci.org/luwes/sinuous)
![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/sinuous.min.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

**npm**: `npm install sinuous --save`  
**cdn**: https://unpkg.com/sinuous  
**module**: https://unpkg.com/sinuous?module

### Intro

Sinuous provides the clarity of declarative views and the performance of direct DOM manipulation.  
It was built with these ideas in mind.

- Small: use in other mini libraries like custom elements.
- Simple: plain Javascript feel; template literals, standard HTML.
- [Performance](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html): top ranked of 80+ UI libs

### Add-ons

| Size                                                                                                                                   | Name                                                  | Description           |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------- |
| ![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/map.min.js?compression=gzip&label=gzip&style=flat-square)        | [`sinuous/map`](./packages/sinuous/map)               | Fast list renderer    |
| ![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/template.min.js?compression=gzip&label=gzip&style=flat-square)   | [`sinuous/template`](./packages/sinuous/template)     | Pre-rendered Template |
| ![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/observable.min.js?compression=gzip&label=gzip&style=flat-square) | [`sinuous/observable`](./packages/sinuous/observable) | Tiny observable       |
| ![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/hydrate.min.js?compression=gzip&label=gzip&style=flat-square)    | [`sinuous/hydrate`](./packages/sinuous/hydrate)       | Hydrate static HTML   |

## In a nutshell

### View syntax

In contrast to some other UI libraries, a goal Sinuous strives for is to have good interoperability. Sinuous creates DOM elements via **hyperscript** `h` calls. This allows the developer more freedom in the choice of the view syntax.

**Tagged templates** transform the HTML to `h` calls at runtime w/ the ` html`` ` tag or,  
at build time with [`sinuous/babel-plugin-htm`](./packages/sinuous/babel-plugin-htm). 

**JSX** needs to transformed at build time with [`@babel/plugin-transform-react-jsx`](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx).

**Handlebars/Mustache** is possible with [Hyperstache](https://github.com/luwes/hyperstache). See issue [#49](https://github.com/luwes/sinuous/issues/49).

---

**Counter Example (_1.4kB gzip_) ([Codesandbox](https://codesandbox.io/s/sinuous-counter-z6k71))**

#### Tagged template (recommended)

```js
import { observable, html } from 'sinuous';

const counter = observable(0);
const view = () => html`
  <div>Counter ${counter}</div>
`;

document.body.append(view());
setInterval(() => counter(counter() + 1), 1000);
```

#### Hyperscript

```js
import { observable, h } from 'sinuous';

const counter = observable(0);
const view = () => h('div', 'Counter ', counter);

document.body.append(view());
setInterval(() => counter(counter() + 1), 1000);
```

#### JSX

```jsx
/** @jsx h */
import { observable, h } from 'sinuous';

const counter = observable(0);
const view = () => (
  <div>Counter {counter}</div>
);

document.body.append(view());
setInterval(() => counter(counter() + 1), 1000);
```

### Reactivity

The Sinuous [`observable`](./packages/sinuous/observable) module provides a mechanism to store and update the application state in a reactive way. If you're familiar with [S.js](https://github.com/adamhaile/S) or [Mobx](https://mobx.js.org) some functions will look very familiar, in under `1kB` Sinuous observable is not as extensive but offers a distilled version of the same functionality. It works under this philosophy:

*Anything that can be derived from the application state, should be derived. Automatically.*

```js
import { observable, computed, subscribe } from 'sinuous/observable';

const length = observable(0);
const squared = computed(() => Math.pow(length(), 2));

subscribe(() => console.log(squared()));
length(4); // => logs 16
```

### Examples

- [Counter](https://codesandbox.io/s/sinuous-counter-z6k71) Simple Counter
- [SVG Clock](https://sinuous.netlify.com/examples/clock/) Analog SVG Clock
- [TodoMVC](https://github.com/luwes/sinuous-todomvc) Classic TodoMVC example
- [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark/blob/master/frameworks/keyed/sinuous/src/main.js) Most Popular UI library bench
- [Triangle Demo](https://github.com/luwes/sinuous-sierpinski-triangle-demo) Sinuous Sierpinski Triangle Demo

### Motivation

The motivation for Sinuous was to create a very lightweight UI library to use in our video player at Vimeo. The view layer in the player is rendered by innerHTML and native DOM operations which is probably the best in terms of performance and bundle size. However the need for a more declarative way of doing things is starting to creep up. Even if it's just for ergonomics.

The basic requirements are a small library size, small application size growth, fast <abbr title="Time to interactive">TTI</abbr>, not crucial but good render performance (creating & updating of DOM nodes).

More importantly, the developer experience. Working close to the metal with as few specialized syntaxes as possible is a key goal for Sinuous. The ` html`` ` tag returns a native `Node` instance and the components are nothing more than simple function calls in the view.

Another essential aspect is modularity, Sinuous is structured in a way that you only pay for what you use.

### Concept

Sinuous started as a little experiment to get similar behavior as [Surplus](https://github.com/adamhaile/surplus) but with template literals instead of JSX.
[HTM](https://github.com/developit/htm) compiles to an `h` tag. Adapted code from [Ryan Solid](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions)'s dom expressions + a Reactive library provides the reactivity.

Sinuous returns a [hyperscript](https://github.com/hyperhype/hyperscript) function which is armed to handle the callback functions from the reactive library and updates the DOM accordingly.

### Browser Support

Sinuous supports modern browsers and IE9+ but keep in mind that IE9 and IE10 do require a polyfill for the `Map` and `Set` collection type.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/sinuous.svg)](https://saucelabs.com/u/sinuous)

### Use your own reactive library

Sinuous can work with different observable libraries. See the [wiki for more info](https://github.com/luwes/sinuous/wiki/Choose-your-own-reactive-library).

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com

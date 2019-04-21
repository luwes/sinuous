# 🐍 Sinuous - Reactive render engine

![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/dist/sinuous.js?compression=gzip&label=gzip&style=flat-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Sinuous is a little experiment to get similar behavior as [Surplus](https://github.com/adamhaile/surplus) but with template literals instead of JSX.  
[HTM](https://github.com/developit/htm) compiles to an `h` tag. Adapted code from [Ryan Solid](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions)'s dom expressions + [S.js](https://github.com/adamhaile/S) provides the reactivity.

```js
import S from 's-js';
import sinuous from 'sinuous';
import htm from 'htm';

const h = sinuous.bind(S);
const html = htm.bind(h);

const count = S.data(0);
const style = S.data('');

const template = () => {
  return html`
    <h1 style=${() => style()}>
      Sinuous <sup>${() => count()}</sup>
    </h1>
  `;
};

S.root(() => document.querySelector('.sinuous').append(template()));
setInterval(() => style({ color: randomColor() }) && count(count() + 1), 1000);

const randomColor = () => '#' + ((Math.random() * (1 << 24)) | 0).toString(16);
```

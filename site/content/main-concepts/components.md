---
title: Components
menu:
  docs:
    parent: main concepts
    title: Components
    weight: 40
---

Components make it possible to split the UI into re-usable, isolated pieces of code. A component is a plain JS function which can be re-used by adding `<${Component}/>` to your view. A component returns a regular HTML element. No render function needed. Any defined attributes are passed to the component as props.

```js
import { o, html } from 'sinuous';

const Timer = props => {
  const seconds = o(0);
  return html`
    <div>${props.unit}: ${seconds}</div>
  `;
};

document.body.append(
  html`
    <${Timer} unit="Seconds" />
  `
);
```

## Composing Components

For every level of detail it's possible to create a component. They can be re-used and nested endlessly.

```js
function Welcome(props) {
  return html`
    <h1>Hello ${props.name}</h1>
  `;
}

function App() {
  return html`
    <div>
      <${Welcome} name="Sara" />
      <${Welcome} name="Cahal" />
      <${Welcome} name="Edite" />
    </div>
  `;
}

document.body.append(
  html`
    <${App} />
  `
);
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-components-nvxrt)

## A Bigger Example

```js
function Comment(props) {
  return html`
    <div class="comment">
      <${UserInfo} user=${props.author} />
      <div class="comment-text">
        ${props.text}
      </div>
      <div class="comment-date">
        ${formatDate(props.date)}
      </div>
    </div>
  `;
}

function UserInfo(props) {
  return html`
    <div class="userInfo">
      <${Avatar} user=${props.user} />
      <div class="userInfo-name">
        ${props.user.name}
      </div>
    </div>
  `;
}

function Avatar(props) {
  return html`
    <img class="avatar" src=${props.user.avatarUrl} alt=${props.user.name} />
  `;
}
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-components-904kz)

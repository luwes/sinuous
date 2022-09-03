---
title: Rendering
eleventyNavigation:
  key: Rendering
  parent: Main Concepts
  order: 3
tags: docs
layout: layouts/docs.njk
---

Rendering in Sinuous is handled by [hyperscript](https://github.com/hyperhype/hyperscript) like function calls.

```
HTMLElement = h(tag|Component|Fragment, [props?, text?, Element?, Observable?,...])
```

Luckily we don't have to worry about that too much because of the fantastic [`htm`](https://github.com/developit/htm) package.

This module converts native JS tagged template literals to `h` function calls. Sinuous supports both runtime and compile time transformation with [`sinuous/htm`](https://github.com/luwes/sinuous/tree/main/packages/sinuous/htm) and [`sinuous/babel-plugin-htm`](https://github.com/luwes/sinuous/tree/main/packages/sinuous/babel-plugin-htm) respectively.

The compile time version is preferred in production as the HTM runtime (0.5kB) will not be included, improves gzip compression and the performance cost of parsing the HTML will be removed.

## A Simple Example

```js
import { html } from 'sinuous';
const element = html`
  <h1>Hello world!</h1>
`;
```

This returns a real HTML element that can be appended to the DOM.  
The example is translated to the following `h` call under the hood.

```js
const element = h('h1', 'Hello world!');
```

## Observables

Observables are the key mechanisms to make the views of Sinuous reactive. They can represent state as content or properties in the view. Simple state can be represented in the view as a single template expression.

```js
const property = o('box');
const content = o('This is some text.');
const p = html`
  <p class=${property}>
    ${content}
  </p>
`;
```

If there is need for a computation in the view, one thing to keep in mind is that to retrieve the value of an observable a function call is needed and the computation is wrapped in a closure. Let's take a look.

```js
const length = o(0);
const div = html`
  <div>${length} squared: ${() => Math.pow(length(), 2)}</div>
`;
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-computation-e4b9s)

## Properties

Note that Sinuous sets **properties** on the DOM element object, not
**attributes** on the HTML element. This makes for better consistency across
browsers and a nicer API for booleans. There are some gotchas, however.
Attributes such as `colspan` are camel cased to `colSpan`, and `for` on the
label element is `htmlFor` to avoid collision with the language keyword.

```js
html`<a href=https://sinuous.dev></a>`;
```

### events

If an attribute starts with `on` and is a function, then it will be registered as an event listener.

```js
html`
  <a href="#" onclick=${() => alert('you are 1,000,000th visitor!')}>
    Click here to win a prize
  </a>
`;
```

### styles

If an attribute has a `style` property, then that will be handled specially.
It accepts either an object or a string.

```js
html`
  <h1 style=${% raw %}{{% endraw %}{ 'font-family': 'Comic Sans', color: 'springgreen' }}>
    Happy Birthday!
  </h1>
`;
```

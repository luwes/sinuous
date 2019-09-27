---
title: Getting Started
menu:
  main:
    title: Docs
    weight: 10
  docs:
    parent: introduction
    weight: 10
---

Sinuous is a small JS library for creating user interfaces.

One of the main goals is to keep that plain JavaScript feel and introduce as few specialized concepts as possible while offering a simple way to create declarative views.

## Installation

Sinuous is available on NPM for use with a module bundler or in a Node application:

```bash
npm install sinuous
```

## Basic Example

A component is a plain JS closure which can be re-used by adding `<${Component}/>` to your view.  
A component returns a regular HTML element. No render function needed.  
Any defined attributes are passed to the component as props.

A view can be declared with JavaScript's native tagged template literals ` html`` ` or with `h` function calls.

State is defined as observables, don't let this scare you, in this context it simply translates to dynamic parts in your view. An observable returns a function that can act as a getter or setter. Get the value by passing no arguments, set a new value by passing the value as argument.

That's it in a nutshell!

```js
import { observable, html } from 'sinuous';

/**
 * A simple Timer component.
 * @param  {object} props
 * @return {Element}
 */
const Timer = props => {
  // Create an obervable with number `0`.
  const seconds = observable(0);

  function tick() {
    // Get the current value and increment the value with 1.
    seconds(seconds() + 1);
  }
  setInterval(tick, 1000);

  // Creates the view of this component.
  return html`
    <div>${props.unit}: ${seconds}</div>
  `;
};

document.querySelector('.counter-example').append(
  // Use the component and pass some props.
  html`
    <${Timer} unit="Seconds" />
  `
);
```

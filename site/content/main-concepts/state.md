---
title: State
menu:
  docs:
    parent: main concepts
    name: State
    weight: 20
---

State in Sinuous is handled by observables. It relies on a module called [`sinuous/observable`](https://github.com/luwes/sinuous/tree/master/packages/sinuous/observable) with a powerful API yet small footprint.

## Reactivity

For the introduction of Sinuous state it's sufficient to know that observables provide a mechanism to make Sinuous views truly reactive without the overhead of VDOM diffing logic.

Imagine a view with dynamic data, when this view is created initially Sinuous makes certain DOM operations to put the data in its right place. It creates an `h1` element, a text node, maybe adds an attribute or so.

Sinuous simply records these DOM operations and whenever a value of a linked observable changes that DOM operation re-runs.

### Concept

```js
import { o, subscribe } from 'sinuous/observable';

const name = o('World');
subscribe(() => (document.body.innerHTML = `<h1>Hello, ${name()}!</h1>`));
```

The body should now contain `<h1>Hello, World</h1>`.

The callback passed to `subscribe` is run immediately on declaration, behind the scenes it links the observable to the callback function. To re-run the callback just set a new value to the `name` observable.

```js
name('Dude');
```

The body should now contain `<h1>Hello, Dude</h1>`.

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-observable-t9h7z)

### Real world

These are the basic workings of Sinuous state. In most cases you won't have to worry about subscribing though, this is all handled under the hood. The above example in Sinuous would look something like this.

```js
import { o, html } from 'sinuous';

const name = o('World');
document.body.append(
  html`
    <h1>Hello, ${name}!</h1>
  `
);
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-observable-542fl)

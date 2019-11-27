---
title: Hydrate
menu:
  docs:
    parent: main concepts
    title: Hydrate
    weight: 60
---

Sinuous **hydrate** is a small add-on that provides fast hydration of static HTML. It's used for adding event listeners, adding dynamic content or attributes to existing DOM elements.

Hydrate and static site generators go hand in glove. In terms of performance nothing beats statically generated HTML, both in serving and rendering on the client. As a matter of fact this website is built using [Hugo](https://gohugo.io/) and the minimal JavaScript is written with `hydrate()`.

You could say using hydrate is similar to using [jQuery](https://jquery.com/), only there is a difference in library size and the way the code is defined is more *declarative* because of the constraints the HTML syntax enforces. Plus the observables come with *reactivity* out of the box.

## Example

```js
import { observable } from 'sinuous';
import { hydrate, html } from 'sinuous/hydrate';

const isActive = observable('');

hydrate(
  html`<a class="navbar-burger burger${isActive}"
    onclick=${() => isActive(isActive() ? '' : ' is-active')} />`
);

hydrate(
  html`<a class="navbar-menu${isActive}" />`
);
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-hydrate-xbzu6)

As you can see it looks very similar to how you would create a DOM tree but the ` html`` ` tag from `hydrate` doesn't return a Node element. It returns a virtual node tree which is used to to add the dynamic parts to the existing HTML elements in the document. 

You might have noticed there is no explicit element selector in the example above to define which DOM element should be hydrated. It's still possible to pass this as the 2nd argument of `hydrate()` but since in a lot of cases an `id` or `class` is declared in the root element those attributes are used to get the DOM element instance. 

The DOM method `document.querySelector()` is used under the hood.

## API

### hydrate(tree, [root]) ⇒ <code>Node</code>

Hydrates the root node with the dynamic HTML.  
Passing the root node is not needed if it can be derived from the `id` or `class` attribute of the root HTML or SVG tree.

**Returns**: <code>Node</code> - Returns the root node.

| Param  | Type                | Description             |
| ------ | ------------------- | ----------------------- |
| tree   | <code>Object</code> | Virtual tree structure. |
| [root] | <code>Node</code>   | Root node.              |


### html`` or h()

Creates a virtual tree structure for HTML.
Looks like:

```js
  {
    type: 'div',
    _props: { class: '' },
    _children: []
  }
```

### svg`` or hs()

Creates a virtual tree structure for SVG.

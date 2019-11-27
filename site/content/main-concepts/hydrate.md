---
title: Hydrate
menu:
  docs:
    parent: main concepts
    title: Hydrate
    weight: 60
---

Sinuous **hydrate** is a small add-on that provides fast hydration of static HTML. It's used for adding event listeners, adding dynamic attributes or content to existing DOM elements.

Static site generators and hydrate go hand in glove. In terms of performance nothing beats statically generated HTML, both in serving and rendering on the client. As a matter of fact this website is built using [Hugo](https://gohugo.io/) and the minimal JavaScript used is written with `hydrate()`.

You could say using hydrate is a bit like using [jQuery](https://jquery.com/), you'll definitely write less JavaScript and do more. Additional benefits with Sinuous is that the syntax will be more *declarative* and *reactivity* is built-in.

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

## Usage

The HTML or SVG that is defined with this API doesn't have to be exactly the same as the HTML coming from the server. It's perfectly valid to only define the attributes that have any dynamic values in it. This is intentionally done to minimize duplication.

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

### _

A placeholder for content in tags that get skipped. The placeholder prevents duplication of long static texts in JavaScript which would add unnecessary bytes to your bundle.

For example:

```js
import { hydrate, html, _ } from 'sinuous/hydrate';

document.body.innerHTML = `
  <div class="container">
    <h1>Banana</h1>
    <div class="main">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
        ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
        aliquip ex ea commodo consequat. Duis aute irure dolor in 
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
        culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <button class="btn">Bom</button>
    </div>
  </div>
`;

hydrate(html`
  <div class="container">
    <h1>${_}</h1>
    <div>
      <p>${_}</p>
      <button onclick=${click}>${_}</button>
    </div>
  </div>
`);
```

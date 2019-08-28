---
title: Lists
menu:
  docs:
    parent: main concepts
    title: Lists
    weight: 50
---

Sinuous provides a submodule called [`map`](https://github.com/luwes/sinuous/tree/master/packages/sinuous/map) to make rendering large lists as snappy as possible.

## Without `map`

It is possible to create lists without this module but the drawback is that it would re-render each element in the list every time an item gets added or removed. Lets take a a look at that first.

```js
import { o, html } from 'sinuous';

const list = o([1, 2, 3, 4, 5]);
const view = () => html`
  <ul>
    ${() => list().map(i => html`<li>${i}: ${Date.now()}</li>`)}
  </ul>
`;
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-naive-list-sple7)

Rendering a list without the `map` module can still be useful if the number of items is fairly small and it's technically not an issue all elements get re-rendered or if the list has a static number of items but the content in each item is dynamic.

```js
import { o, html } from "sinuous";

const list = [
  { name: o("John") },
  { name: o("Lisa") },
  { name: o("Pete") }
];
const view = () => html`
  <ul>
    ${list.map(obj => html`<li>${obj.name}</li>`)}
  </ul>
`;

document.body.append(view());

// Change observable value of the 3rd item in the list.
list[2].name("Jack");
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-static-list-nyr2e)

## With `map`

In a lot of cases you'll find yourself with a list that'll change in the number of items and then it's recommended to use the provided `map` module.

This module will make a diff of the new state with the old state and make the least amount of DOM operations to create the new view.

```js
import { o, html } from "sinuous";
import { map } from "sinuous/map";

const list = o([
  { id: 1, text: o("bread") },
  { id: 2, text: o("milk") },
  { id: 3, text: o("honey") },
  { id: 4, text: o("chips") },
  { id: 5, text: o("cookie") }
]);
const view = () => html`
  <ul>
    ${map(list, item => html`<li id=${item.id}>${item.text}</li>`)}
  </ul>
`;

document.body.append(view());

setInterval(() => {
  list([...list().sort(() => Math.random() - 0.5)]);
}, 1000);
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-map-0ju3y)

If you look closer in the web inspector you'll notice that most of the time not all the item elements will light up signifying a DOM operation. This is the diff engine at work and will keep your list rendering super snappy!

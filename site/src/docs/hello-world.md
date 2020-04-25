---
title: Hello World
eleventyNavigation:
  key: Hello World
  parent: Main Concepts
  order: 1
tags: docs
layout: layouts/docs.njk
---

The smallest Sinuous example looks like this:

```js
document.body.append(
  html`
    <h1>Hello, world!</h1>
  `
);
```

It displays a heading saying “Hello, world!” on the page.

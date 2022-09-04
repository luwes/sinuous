# Sinuous Render

![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/render.min.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous/render.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)

```js
const title = o('Yo');
const subtitle = o(`What's up?`);

const Comp = () => {
  const t = title();
  const sub = subtitle();

  return rhtml`
      <h1>${t}</h1>
      <p>${sub}</p>
    `;
};

render(Comp, container);
t.equal(container.innerHTML, `<h1>Yo</h1><p>What's up?</p>`);

title('Hi');
t.equal(container.innerHTML, `<h1>Hi</h1><p>What's up?</p>`);
```

`Comp` is re-run but the `<h1>` and `<p>` tags are not re-created!

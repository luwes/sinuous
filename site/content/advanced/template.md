---
title: Template
menu:
  docs:
    parent: advanced
    title: Template
    weight: 20
---

The `template` module makes Sinuous a real powerhouse in the UI performance benchmarks. It offers a way to pre-render a template or HTML snippet with defined dynamic expressions. This template can then later be cloned in the fastest way possible, it uses the native `Element.cloneNode()` under the hood.

```js
import { h } from 'sinuous';
import { template, t, o } from 'sinuous/template';

const Row = template(
  () => html`
    <tr class=${o('selected')}>
      <td class="col-md-1" textContent=${t('id')} />
      <td class="col-md-4"><a>${o('label')}</a></td>
      <td class="col-md-1">
        <a>
          <span class="glyphicon glyphicon-remove remove" />
        </a>
      </td>
      <td class="col-md-6" />
    </tr>
  `
);
```

It looks similar to using a component but there is a big difference in the way the HTML snippet is created. Once the template `Row()` function is called the statics of the HTML snippet are cloned in 1 DOM operation while a regular component with ` html`` ` tag would create every node with properties and content one by one which makes a costly difference in performance.

- `o` is an observable tag.
  It adds a proxy on the passed object property and repeats the recorded tag action when set.
- `t` is a normal tag.

The `Row` in this case would accept an object like in the below example.

```js
Row({ id: 1, label: 'Banana', selected: 'peel' });
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-template-gsw1q)

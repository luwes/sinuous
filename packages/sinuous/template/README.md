# Sinuous Template

![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/template.min.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous/template.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A template can look something like this:

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

- `o` is an observable tag.
  It adds a proxy on the passed object property and repeats the recorded tag action when set.
- `t` is a normal tag.

The `Row` in this case would accept a object like so

```js
Row({ id: 1, label: 'Banana', selected: 'peel' });
```

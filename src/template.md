# Sinuous Template

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

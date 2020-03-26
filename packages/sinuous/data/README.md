# Sinuous Data

![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/data.min.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous/data.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)

Sinuous Data makes it possible to write as little HTML as possible in JavaScript. The module is built on top of `sinuous/template` and exports 2 methods; `template` and `fill` which create a clone and a fill function respectively.

The `data-o` and `data-t` attributes create a reference to the element.

- `data-o` is an observable tag.  
  It adds a proxy on the passed object property and repeats the recorded tag action when set.
- `data-t` is a normal tag.

A template can look something like this:

```html
<template id="row">
  <tr data-o="class:selected">
    <td class="col-md-1" data-t="id" />
    <td class="col-md-4"><a data-o="label"></a></td>
    <td class="col-md-1">
      <a>
        <span class="glyphicon glyphicon-remove remove" />
      </a>
    </td>
    <td class="col-md-6" />
  </tr>
</template>
```

```js
import { template, fill } from 'sinuous/data';

const Row = template('#row');
```

The `Row` in this case would accept a object like so

```js
Row({ id: 1, label: 'Banana', selected: 'peel' });
```

### Attribute mappings

Each tag accepts three mapping variants:

1. A plain `data-t` without a value maps to an array item:

```js
template('#id')(['My content']); // or
template('#id')([{ _: 'My content', class: 'my-class' }]);
```

2. An attribute with a value `data-o="mykey"` maps to a property:

```js
template('#id')({ mykey: 'My content' }); // or
template('#id')({ mykey: { _: 'My content', class: 'my-class', onclick } });
```

3. An attribute with multiple key value pairs `data-o="mycontent src:imageUrl alt:caption onclick:pet"` map to top level properties:

```js
template('#id')({
  mycontent: 'My content',
  imageUrl: 'https://placekitten.com/200/300',
  caption: 'Place for a kitten',
  pet() {
    console.log('Watch my fur son');
  }
});
```

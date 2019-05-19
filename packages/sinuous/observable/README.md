# 🐍 Sinuous Observable

![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/observable/dist/observable.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous/observable.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Sinuous Observable is a tiny reactive library. It shares the core features of [S.js](https://github.com/adamhaile/S) to be the engine driving the reactive dom operations in [Sinuous](https://github.com/luwes/sinuous).

## Features

- Automatic updates: when an observable changes, any computation that read the old value will re-run.
- Automatic disposals: any child computations are automatically disposed when the parent is re-run.

# API

###

- [root(fn)](#root) ⇒ <code>\*</code>
- [sample(fn)](#sample) ⇒ <code>\*</code>
- [observable(value)](#observable) ⇒ <code>function</code>
- [S(listener, value)](#S) ⇒ <code>function</code>
- [cleanup(fn)](#cleanup) ⇒ <code>function</code>
- [subscribe(listener)](#subscribe) ⇒ <code>function</code>
- [unsubscribe(listener)](#unsubscribe)

<a name="root"></a>

### root(fn) ⇒ <code>\*</code>

Creates a root and executes the passed function that can contain computations.
The executed function receives an `unsubscribe` argument which can be called to
unsubscribe all inner computations.

**Kind**: global function

| Param | Type                  |
| ----- | --------------------- |
| fn    | <code>function</code> |

---

<a name="sample"></a>

### sample(fn) ⇒ <code>\*</code>

Sample the current value of an observable but don't create a dependency on it.

**Kind**: global function

| Param | Type                  |
| ----- | --------------------- |
| fn    | <code>function</code> |

**Example**

```js
S(() => {
  if (foo()) bar(sample(bar) + 1);
});
```

---

<a name="observable"></a>

### observable(value) ⇒ <code>function</code>

Creates a new observable, returns a function which can be used to get
the observable's value by calling the function without any arguments
and set the value by passing one argument of any type.

**Kind**: global function

| Param | Type            | Description    |
| ----- | --------------- | -------------- |
| value | <code>\*</code> | Initial value. |

---

<a name="S"></a>

### S(listener, value) ⇒ <code>function</code>

Creates a new computation which runs when defined and automatically re-runs
when any of the used observable's values are set.

**Kind**: global function  
**Returns**: <code>function</code> - Computation which can be used in other computations.

| Param    | Type                  | Description |
| -------- | --------------------- | ----------- |
| listener | <code>function</code> |             |
| value    | <code>\*</code>       | Seed value. |

---

<a name="cleanup"></a>

### cleanup(fn) ⇒ <code>function</code>

Run the given function just before the enclosing computation updates
or is disposed.

**Kind**: global function

| Param | Type                  |
| ----- | --------------------- |
| fn    | <code>function</code> |

---

<a name="subscribe"></a>

### subscribe(listener) ⇒ <code>function</code>

Subscribe to updates of an observable.

**Kind**: global function

| Param    | Type                  |
| -------- | --------------------- |
| listener | <code>function</code> |

---

<a name="unsubscribe"></a>

### unsubscribe(listener)

Unsubscribe from a listener.

**Kind**: global function

| Param    | Type                  |
| -------- | --------------------- |
| listener | <code>function</code> |

---

# Example

```js
import observable, { S } from 'sinuous/observable';

var order = '',
  a = observable(0),
  b = S(function() {
    order += 'b';
    return a() + 1;
  }),
  c = S(function() {
    order += 'c';
    return b() || d();
  }),
  d = S(function() {
    order += 'd';
    return a() + 10;
  });

console.log(order); // bcd

order = '';
a(-1);

console.log(order); // bcd
console.log(c()); // 9

order = '';
a(0);

console.log(order); // bcd
console.log(c()); // 1
```

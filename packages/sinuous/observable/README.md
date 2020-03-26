# Sinuous Observable

![Badge size](https://img.badgesize.io/https://unpkg.com/sinuous/dist/observable.min.js?compression=gzip&label=gzip&style=flat-square)
[![codecov](https://img.shields.io/codecov/c/github/luwes/sinuous.svg?style=flat-square)](https://codecov.io/gh/luwes/sinuous)

Sinuous Observable is a tiny reactive library. It shares the core features of [S.js](https://github.com/adamhaile/S) to be the engine driving the reactive dom operations in [Sinuous](https://github.com/luwes/sinuous).

## Features

- Automatic updates: when an observable changes, any computation that read the old value will re-run.
- Automatic disposals: any child computations are automatically disposed when the parent is re-run.

# API

###

- [isListening()](#isListening) ⇒ <code>boolean</code>
- [root(fn)](#root) ⇒ <code>\*</code>
- [sample(fn)](#sample) ⇒ <code>\*</code>
- [transaction(fn)](#transaction) ⇒ <code>\*</code>
- [observable(value)](#observable) ⇒ <code>function</code>
- [computed(observer, value)](#computed) ⇒ <code>function</code>
- [cleanup(fn)](#cleanup) ⇒ <code>function</code>
- [subscribe(observer)](#subscribe) ⇒ <code>function</code>
- [on(obs, fn, [seed], [onchanges])](#on) ⇒ <code>function</code>
- [unsubscribe(observer)](#unsubscribe)

<a name="isListening"></a>

### isListening() ⇒ <code>boolean</code>

Returns true if there is an active observer.

**Kind**: global function

---

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
computed(() => {
  if (foo()) bar(sample(bar) + 1);
});
```

---

<a name="transaction"></a>

### transaction(fn) ⇒ <code>\*</code>

Creates a transaction in which an observable can be set multiple times
but only trigger a computation once.

**Kind**: global function

| Param | Type                  |
| ----- | --------------------- |
| fn    | <code>function</code> |

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

<a name="computed"></a>

### computed(observer, value) ⇒ <code>function</code>

Creates a new computation which runs when defined and automatically re-runs
when any of the used observable's values are set.

**Kind**: global function  
**Returns**: <code>function</code> - Computation which can be used in other computations.

| Param    | Type                  | Description |
| -------- | --------------------- | ----------- |
| observer | <code>function</code> |             |
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

### subscribe(observer) ⇒ <code>function</code>

Subscribe to updates of an observable.

**Kind**: global function

| Param    | Type                  |
| -------- | --------------------- |
| observer | <code>function</code> |

---

<a name="on"></a>

### on(obs, fn, [seed], [onchanges]) ⇒ <code>function</code>

Statically declare a computation's dependencies.

**Kind**: global function  
**Returns**: <code>function</code> - Computation which can be used in other computations.

| Param       | Type                                        | Description                         |
| ----------- | ------------------------------------------- | ----------------------------------- |
| obs         | <code>function</code> \| <code>Array</code> |                                     |
| fn          | <code>function</code>                       | Callback function.                  |
| [seed]      | <code>\*</code>                             | Seed value.                         |
| [onchanges] | <code>boolean</code>                        | If true the initial run is skipped. |

---

<a name="unsubscribe"></a>

### unsubscribe(observer)

Unsubscribe from an observer.

**Kind**: global function

| Param    | Type                  |
| -------- | --------------------- |
| observer | <code>function</code> |

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

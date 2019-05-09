# 🐍 Sinuous Observable

![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/observable/dist/observable.js?compression=gzip&label=gzip&style=flat-square&version=0.3.0)

Sinuous Observable is a tiny reactive library. It shares the core functionality of [S.js](https://github.com/adamhaile/S) to be the engine driving the reactive dom operations in [Sinuous](https://github.com/luwes/sinuous).

## Features

- Automatic updates: when an observable changes, any computation that read the old value will re-run.
- Automatic disposals: any child computations are automatically disposed when the parent is re-run.

## Functions

#### `observable(<value>)`
#### `S(() => <code>)`
#### `subscribe(() => <code>)`
#### `unsubscribe(() => <code>)`

## Example

```js
  import observable, { S } from 'sinuous/observable';

  var order = "",
      a = observable(0),
      b = S(function() { order += "b"; return a() + 1; }),
      c = S(function() { order += "c"; return b() || d(); }),
      d = S(function() { order += "d"; return a() + 10; });

  console.log(order); // bcd

  order = "";
  a(-1);

  console.log(order); // bcd
  console.log(c()); // 9

  order = "";
  a(0);

  console.log(order); // bcd
  console.log(c()); // 1
```

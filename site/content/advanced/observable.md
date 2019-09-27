---
title: Observable
menu:
  docs:
    parent: advanced
    title: Observable
    weight: 10
---

The Sinuous observable module provides a mechanism to store and update the application state in a reactive way. If you're familiar with [S.js](https://github.com/adamhaile/S) or [Mobx](https://mobx.js.org) some functions will look very familiar, in under `1kB` Sinuous observable is not as extensive but offers a distilled version of the same functionality.

Let's quickly go over the important functions, it's starts with creating some observable state.

## Creating observable state

This example creates a new observable `temperatureInCelsius`, its type is a function. By calling this function without an argument it acts as a getter, if an argument is passed it will set the value of the observable.

```js
import { observable } from 'sinuous/observable';

const temperatureInCelsius = observable(27);
console.log(temperatureInCelsius()); // logs 27

temperatureInCelsius(-4);
console.log(temperatureInCelsius()); // logs -4
```


## Run the observable in a tracking context

There are 2 functions available that can create a reactive function, `subscribe` and `computed`. The provided function is run immediately when defined and then each time when one of its dependencies changes.

- `subscribe` is used when making an effect, for example the reactive function runs a logging function or creates a network request. The return value is an unsubscribe function, which makes the reactive function stop reacting to any changes of its dependencies.

```js
import { observable, subscribe } from 'sinuous/observable';

const temperatureInCelsius = observable(27);
const unsubscribe = subscribe(() => {
  console.log(temperatureInCelsius()); // logs 27
});

temperatureInCelsius(31); // logs 31
```

- `computed` is used when making state that is derived from existing observable state or other computed state.

```js
import { observable, computed } from 'sinuous/observable';

const temperatureInCelsius = observable(27);
const temperatureInFahrenheit = computed(() => temperatureInCelsius() * 1.8 + 32);
const unsubscribe = subscribe(() => {
  console.log(temperatureInFahrenheit());
});

temperatureInCelsius(31); // logs 87.8 
```

Try it on [Codesandbox](https://codesandbox.io/s/sinuous-observable-35eut)

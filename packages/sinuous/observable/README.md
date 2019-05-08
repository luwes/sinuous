# 🐍 Sinuous Observable

![Badge size](http://img.badgesize.io/https://unpkg.com/sinuous@latest/observable/dist/observable.js?compression=gzip&label=gzip&style=flat-square)

```js
  import o, { subscribe } from 'sinuous/observable';

  let title = o();
  let text;
  subscribe(() => (text = title()));

  title('Welcome to Sinuous!');
  
  console.log(text); // Welcome to Sinuous!
```

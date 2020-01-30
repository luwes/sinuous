import { observable } from 'sinuous';
import { hydrate, d } from 'sinuous/hydrate';
import { ready } from './utils.js';

ready(() => {
  const isActive = observable('');

  hydrate(
    dhtml`<a class="navbar-burger burger${isActive}"
      onclick=${() => isActive(!isActive() ? ' is-active' : '')} />`
  );

  hydrate(
    dhtml`<a class="navbar-menu${isActive}" />`
  );
});

import { observable } from 'sinuous';
import { hydrate, h } from 'sinuous/hydrate';
import { ready } from './utils.js';

ready(() => {
  const isActive = observable('');

  hydrate(
    html`<a class="navbar-burger burger${isActive}"
      onclick=${() => isActive(!isActive() ? ' is-active' : '')} />`
  );

  hydrate(
    html`<a class="navbar-menu${isActive}" />`
  );
});

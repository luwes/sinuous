/* global Prism */
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

!function(){if("undefined"!=typeof self&&self.Prism||"undefined"!=typeof global&&global.Prism){var n=function(n){return n},s={classMap:n,prefixString:""};Prism.plugins.customClass={map:function(i){s.classMap="function"==typeof i?i:function(n){return i[n]||n}},prefix:function(n){s.prefixString=n}},Prism.hooks.add("wrap",function(i){(s.classMap!==n||s.prefixString)&&(i.classes=i.classes.map(function(n){return s.prefixString+s.classMap(n,i.language)}))})}}();

Prism.plugins.customClass.map({
  tag: 'node'
});

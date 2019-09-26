import { api } from './api.js';

export function property(name, value, el, isSvg, isCss) {
  if (name[0] === 'o' && name[1] === 'n' && !value.$o) {
    // Functions added as event handlers are not executed
    // on render unless they have an observable indicator.
    handleEvent(el, name, value);
  } else if (typeof value === 'function') {
    if (value.$t) {
      // Record property action in template.
      value.$t(2, property, el, name);
    } else {
      api.subscribe(() => {
        property(name, value(), el, isSvg, isCss);
      });
    }
  } else if (isCss) {
    el.style.setProperty(name, value);
  } else if (
    isSvg ||
    name.slice(0, 5) === 'data-' ||
    name.slice(0, 5) === 'aria-'
  ) {
    el.setAttribute(name, value);
  } else if (name === 'style') {
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else {
      for (name in value) {
        property(name, value[name], el, isSvg, true);
      }
    }
  } else if (name === 'attrs') {
    for (name in value) {
      property(name, value[name], el, true);
    }
  } else {
    if (name === 'class') name += 'Name';
    el[name] = value;
  }
}

function handleEvent(el, name, value) {
  name = name.slice(2);

  const removeListener = api.cleanup(() =>
    el.removeEventListener(name, eventProxy)
  );

  if (value) {
    el.addEventListener(name, eventProxy);
  } else {
    removeListener();
  }

  (el._listeners || (el._listeners = {}))[name] = value;
}

/**
 * Proxy an event to hooked event handlers.
 * @param {Event} e - The event object from the browser.
 * @return {Function}
 */
function eventProxy(e) {
  // eslint-disable-next-line
  return this._listeners[e.type](e);
}

import { observable } from 'sinuous';
import { hydrate, dhtml } from 'sinuous/hydrate';
import { invert } from './utils/utils.js';
import { cx } from './utils/dom.js';

const burgerIsActive = observable(false);
const openBurgerMenu = invert(burgerIsActive);

hydrate(
  dhtml`<a id=burger
    class=${cx({ active: burgerIsActive })}
    onclick=${openBurgerMenu} />`
);

hydrate(
  dhtml`<div id=main-menu
    class=${cx({ active: burgerIsActive })} />`
);

document.body.addEventListener('keyup', (e) => {
  // Tab
  if (e.which === 9 && !document.body.classList.contains('showfocus')) {
      document.body.classList.add('showfocus');
  }
  // Escape
  else if (e.which === 27) {
      document.body.classList.remove('showfocus');
  }
});

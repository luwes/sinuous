
export function qs(selector) {
  return document.querySelector(selector);
}

export function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

export function cx(classes) {
  return function() {
    const { el } = this;
    Object.keys(classes).forEach((key) => {
      const value = classes[key];
      el.classList.toggle(key, typeof value === 'function' ? value() : value);
    });
    return el.className;
  };
}

export function stopProp(fn) {
  return (e) => {
    e.stopPropagation();
    fn();
  };
}

export function scrollTo(element, to, duration) {
  var start = element.scrollLeft,
    change = to - start,
    currentTime = 0,
    increment = 20;

  var animateScroll = function() {
    currentTime += increment;
    var val = easeInOutQuad(currentTime, start, change, duration);
    element.scrollLeft = val;
    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    }
  };
  animateScroll();
}

export function scrollLeft(element, duration) {
  scrollTo(element, getScrollOffset(element, -1), duration);
}

export function scrollRight(element, duration) {
  scrollTo(element, getScrollOffset(element, 1), duration);
}

function getScrollOffset(element, direction) {
  if (element._scrollIndex == null) element._scrollIndex = 0;
  let i = element._scrollIndex;
  let children = element.children;
  const step = Math.floor(element.offsetWidth / children[0].offsetWidth) * direction;
  i = element._scrollIndex = Math.max(0, Math.min(children.length - 1, i + step));
  return children[i].offsetLeft;
}

//t = current time
//b = start value
//c = change in value
//d = duration
function easeInOutQuad(t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2*t*t + b;
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
}

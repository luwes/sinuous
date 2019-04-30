import test from 'tape';
import sinuous from 'sinuous';
const h = sinuous();
import o from 'observable';

test('observable content', function(t) {
  let title = o();
  title('Welcome to HyperScript!');
  let h1 = h('h1', title);
  t.equal(h1.outerHTML, '<h1>Welcome to HyperScript!</h1>');
  title('Leave, creep!');
  t.equal(h1.outerHTML, '<h1>Leave, creep!</h1>');
  t.end();
});

test('observable property', function(t) {
  let checked = o();
  checked(true);
  let checkbox = h('input', { type: 'checkbox', checked: checked });
  t.assert(checkbox.checked);
  checked(false);
  t.assert(!checkbox.checked);
  t.end();
});

test('observable style', function(t) {
  let color = o();
  color('red');
  let div = h('div', { style: { color: color } });
  t.equal(div.style.color, 'red');
  color('blue');
  t.equal(div.style.color, 'blue');
  t.end();
});

// test('context cleanup removes observable listeners', function(t) {
//   let _h = h.context();
//   let text = o();
//   text('hello');
//   let color = o();
//   color('red');
//   let className = o();
//   className('para');
//   let p = _h('p', { style: { color: color }, className: className }, text);
//   t.equal(p.outerHTML, '<p style="color: red; " class="para">hello</p>');
//   _h.cleanup();
//   color('blue');
//   text('world');
//   className('section');
//   t.equal(p.outerHTML, '<p style="color: red; " class="para">hello</p>');
//   t.end();
// });

// test('context cleanup removes event handlers', function(t) {
//   let _h = h.context();
//   let onClick = sinon.spy();
//   let button = _h('button', 'Click me!', { onclick: onClick });
//   _h.cleanup();
//   simu.click(button);
//   t.assert(!onClick.called, 'click listener was not triggered');
//   t.end();
// });

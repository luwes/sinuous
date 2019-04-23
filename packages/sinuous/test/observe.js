// it('observable content', function() {
//   let title = o();
//   title('Welcome to HyperScript!');
//   let h1 = h('h1', title);
//   assert(h1.outerHTML, '<h1>Welcome to HyperScript!</h1>');
//   title('Leave, creep!');
//   assert(h1.outerHTML, '<h1>Leave, creep!</h1>');
//   t.end();
// });

// it('observable property', function() {
//   let checked = o();
//   checked(true);
//   let checkbox = h('input', { type: 'checkbox', checked: checked });
//   assert(checkbox.checked, true);
//   checked(false);
//   assert(checkbox.checked, false);
//   t.end();
// });

// it('observable style', function() {
//   let color = o();
//   color('red');
//   let div = h('div', { style: { color: color } });
//   assert(div.style.color, 'red');
//   color('blue');
//   assert(div.style.color, 'blue');
//   t.end();
// });

// it('context cleanup removes observable listeners', function() {
//   let _h = h.context();
//   let text = o();
//   text('hello');
//   let color = o();
//   color('red');
//   let className = o();
//   className('para');
//   let p = _h('p', { style: { color: color }, className: className }, text);
//   assert(p.outerHTML, '<p style="color: red; " class="para">hello</p>');
//   _h.cleanup();
//   color('blue');
//   text('world');
//   className('section');
//   assert(p.outerHTML, '<p style="color: red; " class="para">hello</p>');
//   t.end();
// });

// it('context cleanup removes event handlers', function() {
//   let _h = h.context();
//   let onClick = spy();
//   let button = _h('button', 'Click me!', { onclick: onClick });
//   _h.cleanup();
//   simu.click(button);
//   t.assert(!onClick.called, 'click listener was not triggered');
//   t.end();
// });

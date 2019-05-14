import test from 'tape';
import sinuous from 'sinuous';
const wrap = fn => fn();
const h = sinuous(wrap);
h.insert = h.insert.bind(h, wrap);

// h.insert with Markers
// <div>before<!-- insert -->after</div>

const insert = val => {
  const parent = container.cloneNode(true);
  h.insert(parent, val, undefined, parent.childNodes[1]);
  return parent;
};

const container = document.createElement('div');
container.appendChild(document.createTextNode('before'));
container.appendChild(document.createTextNode(''));
container.appendChild(document.createTextNode('after'));

test('inserts nothing for null', t => {
  const res = insert(null);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for undefined', t => {
  const res = insert(undefined);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for false', t => {
  const res = insert(false);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for true', t => {
  const res = insert(true);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for null in array', t => {
  const res = insert(['a', null, 'b']);
  t.equal(res.innerHTML, 'beforeabafter');
  t.equal(res.childNodes.length, 5);
  t.end();
});

test('inserts nothing for undefined in array', t => {
  const res = insert(['a', undefined, 'b']);
  t.equal(res.innerHTML, 'beforeabafter');
  t.equal(res.childNodes.length, 5);
  t.end();
});

test('inserts nothing for false in array', t => {
  const res = insert(['a', false, 'b']);
  t.equal(res.innerHTML, 'beforeabafter');
  t.equal(res.childNodes.length, 5);
  t.end();
});

test('inserts nothing for true in array', t => {
  const res = insert(['a', true, 'b']);
  t.equal(res.innerHTML, 'beforeabafter');
  t.equal(res.childNodes.length, 5);
  t.end();
});

test('can insert strings', t => {
  const res = insert('foo');
  t.equal(res.innerHTML, 'beforefooafter');
  t.equal(res.childNodes.length, 4);
  t.end();
});

test('can insert a node', t => {
  const node = document.createElement('span');
  node.textContent = 'foo';
  t.equal(insert(node).innerHTML, 'before<span>foo</span>after');
  t.end();
});

test('can re-insert a node, thereby moving it', t => {
  var node = document.createElement('span');
  node.textContent = 'foo';

  const first = insert(node),
    second = insert(node);

  t.equal(first.innerHTML, 'beforeafter');
  t.equal(second.innerHTML, 'before<span>foo</span>after');
  t.end();
});

test('can insert an array of strings', t => {
  t.equal(
    insert(['foo', 'bar']).innerHTML,
    'beforefoobarafter',
    'array of strings'
  );
  t.end();
});

test('can insert an array of nodes', t => {
  const nodes = [document.createElement('span'), document.createElement('div')];
  nodes[0].textContent = 'foo';
  nodes[1].textContent = 'bar';
  t.equal(insert(nodes).innerHTML, 'before<span>foo</span><div>bar</div>after');
  t.end();
});

test('can insert a changing array of nodes', t => {
  let container = document.createElement('div'),
    marker = container.appendChild(document.createTextNode('')),
    span1 = document.createElement('span'),
    div2 = document.createElement('div'),
    span3 = document.createElement('span'),
    current;
  span1.textContent = '1';
  div2.textContent = '2';
  span3.textContent = '3';

  current = h.insert(container, [], current, marker);
  t.equal(container.innerHTML, '');

  current = h.insert(container, [span1, div2, span3], current, marker);
  t.equal(container.innerHTML, '<span>1</span><div>2</div><span>3</span>');

  current = h.insert(container, [div2, span3], current, marker);
  t.equal(container.innerHTML, '<div>2</div><span>3</span>');

  current = h.insert(container, [div2, span3], current, marker);
  t.equal(container.innerHTML, '<div>2</div><span>3</span>');

  current = h.insert(container, [span3, div2], current, marker);
  t.equal(container.innerHTML, '<span>3</span><div>2</div>');

  current = h.insert(container, [], current, marker);
  t.equal(container.innerHTML, '');

  current = h.insert(container, [span3], current, marker);
  t.equal(container.innerHTML, '<span>3</span>');

  current = h.insert(container, [div2], current, marker);
  t.equal(container.innerHTML, '<div>2</div>');
  t.end();
});

test('can insert nested arrays', t => {
  t.equal(
    insert(['foo', ['bar', 'blech']]).innerHTML,
    'beforefoobarblechafter',
    'array of array of strings'
  );
  t.end();
});

import test from 'tape';
import { h } from 'sinuous';
import { insert } from '../src/insert.js';

// insert with Markers
// <div>before<!-- insert -->after</div>

function insertValue(val) {
  const parent = clone(container);
  insert(parent, val, parent.childNodes[1]);
  return parent;
}

// IE doesn't clone empty text nodes
function clone(el) {
  const cloned = el.cloneNode(true);
  cloned.textContent = '';
  [].slice.call(el.childNodes).forEach(n => cloned.appendChild(n.cloneNode()));
  return cloned;
}

const container = document.createElement('div');
container.appendChild(document.createTextNode('before'));
container.appendChild(document.createTextNode(''));
container.appendChild(document.createTextNode('after'));

test('inserts nothing for null', t => {
  const res = insertValue(null);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for undefined', t => {
  const res = insertValue(undefined);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for false', t => {
  const res = insertValue(false);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for true', t => {
  const res = insertValue(true);
  t.equal(res.innerHTML, 'beforeafter');
  t.equal(res.childNodes.length, 3);
  t.end();
});

test('inserts nothing for null in array', t => {
  const res = insertValue(['a', null, 'b']);
  t.equal(res.innerHTML, 'beforeabafter');
  t.equal(res.childNodes.length, 6);
  t.end();
});

test('inserts nothing for undefined in array', t => {
  const res = insertValue(['a', undefined, 'b']);
  t.equal(res.innerHTML, 'beforeabafter');
  t.equal(res.childNodes.length, 6);
  t.end();
});

test('can insert strings', t => {
  let res = insertValue('foo');
  t.equal(res.innerHTML, 'beforefooafter');
  t.equal(res.childNodes.length, 4);

  res = insertValue('');
  t.equal(res.innerHTML, 'beforeafter');
  t.end();
});

test('can insert a node', t => {
  const node = document.createElement('span');
  node.textContent = 'foo';
  t.equal(insertValue(node).innerHTML, 'before<span>foo</span>after');
  t.end();
});

test('can re-insert a node, thereby moving it', t => {
  var node = document.createElement('span');
  node.textContent = 'foo';

  const first = insertValue(node),
    second = insertValue(node);

  t.equal(first.innerHTML, 'beforeafter');
  t.equal(second.innerHTML, 'before<span>foo</span>after');
  t.end();
});

test('can insert an array of strings', t => {
  t.equal(
    insertValue(['foo', 'bar']).innerHTML,
    'beforefoobarafter',
    'array of strings'
  );
  t.end();
});

test('can insert an array of nodes', t => {
  const nodes = [document.createElement('span'), document.createElement('div')];
  nodes[0].textContent = 'foo';
  nodes[1].textContent = 'bar';
  t.equal(
    insertValue(nodes).innerHTML,
    'before<span>foo</span><div>bar</div>after'
  );
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

  current = insert(container, [], marker, current);
  t.equal(container.innerHTML, '');

  current = insert(container, [span1, div2, span3], marker, current);
  t.equal(container.innerHTML, '<span>1</span><div>2</div><span>3</span>');

  current = insert(container, [div2, span3], marker, current);
  t.equal(container.innerHTML, '<div>2</div><span>3</span>');

  current = insert(container, [div2, span3], marker, current);
  t.equal(container.innerHTML, '<div>2</div><span>3</span>');

  current = insert(container, [span3, div2], marker, current);
  t.equal(container.innerHTML, '<span>3</span><div>2</div>');

  current = insert(container, [], marker, current);
  t.equal(container.innerHTML, '');

  current = insert(container, [span3], marker, current);
  t.equal(container.innerHTML, '<span>3</span>');

  current = insert(container, [div2], marker, current);
  t.equal(container.innerHTML, '<div>2</div>');
  t.end();
});

test('can insert nested arrays', t => {
  t.equal(
    insertValue(['foo', ['bar', 'blech']]).innerHTML,
    'beforefoobarblechafter',
    'array of array of strings'
  );
  t.end();
});

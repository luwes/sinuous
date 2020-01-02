/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import test from 'tape';
import htm from '../src/index.js';

const h = (tag, props, ...children) => ({ tag, props, children });
const html = htm.bind(h);

test('empty', t => {
  t.deepEqual(html``, undefined);
  t.end();
});

test('single named elements', t => {
  t.deepEqual(
    html`
      <div />
    `,
    { tag: 'div', props: null, children: [] }
  );
  t.deepEqual(
    html`
      <div />
    `,
    { tag: 'div', props: null, children: [] }
  );
  t.deepEqual(
    html`
      <span />
    `,
    { tag: 'span', props: null, children: [] }
  );
  t.end();
});

test('multiple root elements', t => {
  t.deepEqual(
    html`
      <a /><b></b><c><//>
    `,
    h([
      { tag: 'a', props: null, children: [] },
      { tag: 'b', props: null, children: [] },
      { tag: 'c', props: null, children: [] }
    ])
  );
  t.end();
});

test('single dynamic tag name', t => {
  t.deepEqual(
    html`
      <${'foo'} />
    `,
    { tag: 'foo', props: null, children: [] }
  );
  function Foo() {}
  t.deepEqual(
    html`
      <${Foo} />
    `,
    { tag: Foo, props: null, children: [] }
  );
  t.end();
});

test('single boolean prop', t => {
  t.deepEqual(
    html`
      <a disabled />
    `,
    { tag: 'a', props: { disabled: true }, children: [] }
  );
  t.end();
});

test('two boolean props', t => {
  t.deepEqual(
    html`
      <a invisible disabled />
    `,
    { tag: 'a', props: { invisible: true, disabled: true }, children: [] }
  );
  t.end();
});

test('single prop with empty value', t => {
  t.deepEqual(
    html`
      <a href="" />
    `,
    { tag: 'a', props: { href: '' }, children: [] }
  );
  t.end();
});

test('two props with empty values', t => {
  t.deepEqual(
    html`
      <a href="" foo="" />
    `,
    { tag: 'a', props: { href: '', foo: '' }, children: [] }
  );
  t.end();
});

test('single prop with empty name', t => {
  t.deepEqual(
    html`
      <a ""="foo" />
    `,
    { tag: 'a', props: { '': 'foo' }, children: [] }
  );
  t.end();
});

test('single prop with static value', t => {
  t.deepEqual(
    html`
      <a href="/hello" />
    `,
    { tag: 'a', props: { href: '/hello' }, children: [] }
  );
  t.end();
});

test('single prop with static value followed by a single boolean prop', t => {
  t.deepEqual(
    html`
      <a href="/hello" b />
    `,
    { tag: 'a', props: { href: '/hello', b: true }, children: [] }
  );
  t.end();
});

test('two props with static values', t => {
  t.deepEqual(
    html`
      <a href="/hello" target="_blank" />
    `,
    { tag: 'a', props: { href: '/hello', target: '_blank' }, children: [] }
  );
  t.end();
});

test('single prop with dynamic value', t => {
  t.deepEqual(
    html`
      <a href=${'foo'} />
    `,
    { tag: 'a', props: { href: 'foo' }, children: [] }
  );
  t.end();
});

test('slash in the middle of tag name or property name self-closes the element', t => {
  t.deepEqual(
    html`
      <ab/ba prop=value>
    `,
    { tag: 'ab', props: null, children: [] }
  );
  t.deepEqual(
    html`
      <abba pr/op=value>
    `,
    { tag: 'abba', props: { pr: true }, children: [] }
  );
  t.end();
});

test('slash in a property value does not self-closes the element, unless followed by >', t => {
  t.deepEqual(html`<abba prop=val/ue><//>`, {
    tag: 'abba',
    props: { prop: 'val/ue' },
    children: []
  });
  t.deepEqual(
    html`
      <abba prop="value" />
    `,
    { tag: 'abba', props: { prop: 'value' }, children: [] }
  );
  t.deepEqual(html`<abba prop=value/ ><//>`, {
    tag: 'abba',
    props: { prop: 'value/' },
    children: []
  });
  t.end();
});

test('two props with dynamic values', t => {
  function onClick() {}
  t.deepEqual(
    html`
      <a href=${'foo'} onClick=${onClick} />
    `,
    { tag: 'a', props: { href: 'foo', onClick }, children: [] }
  );
  t.end();
});

test('prop with multiple static and dynamic values get concatenated as strings', t => {
  t.deepEqual(
    html`
      <a href="before${'foo'}after" />
    `,
    { tag: 'a', props: { href: 'beforefooafter' }, children: [] }
  );
  t.deepEqual(
    html`
      <a href="${1}${1}" />
    `,
    { tag: 'a', props: { href: '11' }, children: [] }
  );
  t.deepEqual(
    html`
      <a href="${1}between${1}" />
    `,
    { tag: 'a', props: { href: '1between1' }, children: [] }
  );
  t.deepEqual(
    html`
      <a href=/before/${'foo'}/after />
    `,
    { tag: 'a', props: { href: '/before/foo/after' }, children: [] }
  );
  t.deepEqual(
    html`
      <a href=/before/${'foo'}/>
    `,
    { tag: 'a', props: { href: '/before/foo' }, children: [] }
  );
  t.end();
});

test('prop with multiple static and observables', t => {
  const observableMock = () => 'foo';

  t.equal(
    html`
      <a href="before${observableMock}after" />
    `.props.href(),
    'beforefooafter'
  );
  t.equal(
    html`
      <a href="${observableMock}after" />
    `.props.href(),
    'fooafter'
  );
  t.equal(
    html`
      <a href="${function() { return 'foo'; }}${1}" />
    `.props.href(),
    'foo1'
  );
  t.equal(
    html`
      <a href="${1}between${observableMock}" />
    `.props.href(),
    '1betweenfoo'
  );
  t.equal(
    html`
      <a href=/before/${() => 'foo'}/after />
    `.props.href(),
    '/before/foo/after'
  );
  t.equal(
    html`
      <a href=/before/${observableMock}/>
    `.props.href(),
    '/before/foo'
  );
  t.end();
});

test('spread props', t => {
  t.deepEqual(
    html`
      <a ...${{ foo: 'bar' }} />
    `,
    { tag: 'a', props: { foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a b ...${{ foo: 'bar' }} />
    `,
    { tag: 'a', props: { b: true, foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a b c ...${{ foo: 'bar' }} />
    `,
    { tag: 'a', props: { b: true, c: true, foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a ...${{ foo: 'bar' }} b />
    `,
    { tag: 'a', props: { b: true, foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a b="1" ...${{ foo: 'bar' }} />
    `,
    { tag: 'a', props: { b: '1', foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a x="1"><b y="2" ...${{ c: 'bar' }}/></a>
    `,
    h('a', { x: '1' }, h('b', { y: '2', c: 'bar' }))
  );
  t.deepEqual(
    html`
      <a b=${2} ...${{ c: 3 }}>d: ${4}</a>
    `,
    h('a', { b: 2, c: 3 }, 'd: ', 4)
  );
  t.deepEqual(
    html`
      <a ...${{ c: 'bar' }}><b ...${{ d: 'baz' }}/></a>
    `,
    h('a', { c: 'bar' }, h('b', { d: 'baz' }))
  );
  t.end();
});

test('multiple spread props in one element', t => {
  t.deepEqual(
    html`
      <a ...${{ foo: 'bar' }} ...${{ quux: 'baz' }} />
    `,
    { tag: 'a', props: { foo: 'bar', quux: 'baz' }, children: [] }
  );
  t.end();
});

test('mixed spread + static props', t => {
  t.deepEqual(
    html`
      <a b ...${{ foo: 'bar' }} />
    `,
    { tag: 'a', props: { b: true, foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a b c ...${{ foo: 'bar' }} />
    `,
    { tag: 'a', props: { b: true, c: true, foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a ...${{ foo: 'bar' }} b />
    `,
    { tag: 'a', props: { b: true, foo: 'bar' }, children: [] }
  );
  t.deepEqual(
    html`
      <a ...${{ foo: 'bar' }} b c />
    `,
    { tag: 'a', props: { b: true, c: true, foo: 'bar' }, children: [] }
  );
  t.end();
});

test('closing tag', t => {
  t.deepEqual(
    html`
      <a></a>
    `,
    { tag: 'a', props: null, children: [] }
  );
  t.deepEqual(
    html`
      <a b></a>
    `,
    { tag: 'a', props: { b: true }, children: [] }
  );
  t.end();
});

test('auto-closing tag', t => {
  t.deepEqual(
    html`
      <a><//>
    `,
    { tag: 'a', props: null, children: [] }
  );
  t.end();
});

test('non-element roots', t => {
  t.deepEqual(
    html`
      foo
    `,
    h(['foo'])
  );
  t.deepEqual(
    html`
      ${1}
    `,
    h([1])
  );
  t.deepEqual(
    html`
      foo${1}
    `,
    h(['foo', 1])
  );
  t.deepEqual(
    html`
      foo${1}bar
    `,
    h(['foo', 1, 'bar'])
  );
  t.end();
});

test('text child', t => {
  t.deepEqual(
    html`
      <a>foo</a>
    `,
    { tag: 'a', props: null, children: ['foo'] }
  );
  t.deepEqual(
    html`
      <a>foo bar</a>
    `,
    { tag: 'a', props: null, children: ['foo bar'] }
  );
  t.deepEqual(
    html`
      <a>foo "<b /></a>
    `,
    {
      tag: 'a',
      props: null,
      children: ['foo "', { tag: 'b', props: null, children: [] }]
    }
  );
  t.end();
});

test('dynamic child', t => {
  t.deepEqual(
    html`
      <a>${'foo'}</a>
    `,
    { tag: 'a', props: null, children: ['foo'] }
  );
  t.end();
});

test('mixed text + dynamic children', t => {
  t.deepEqual(
    html`
      <a>${'foo'}bar</a>
    `,
    { tag: 'a', props: null, children: ['foo', 'bar'] }
  );
  t.deepEqual(
    html`
      <a>before${'foo'}after</a>
    `,
    { tag: 'a', props: null, children: ['before', 'foo', 'after'] }
  );
  t.deepEqual(
    html`
      <a>foo${null}</a>
    `,
    { tag: 'a', props: null, children: ['foo', null] }
  );
  t.end();
});

test('element child', t => {
  t.deepEqual(
    html`
      <a><b /></a>
    `,
    h('a', null, h('b', null))
  );
  t.end();
});

test('multiple element children', t => {
  t.deepEqual(
    html`
      <a><b /><c /></a>
    `,
    h('a', null, h('b', null), h('c', null))
  );
  t.deepEqual(
    html`
      <a x><b y/><c z/></a>
    `,
    h('a', { x: true }, h('b', { y: true }), h('c', { z: true }))
  );
  t.deepEqual(
    html`
      <a x="1"><b y="2"/><c z="3"/></a>
    `,
    h('a', { x: '1' }, h('b', { y: '2' }), h('c', { z: '3' }))
  );
  t.deepEqual(
    html`
      <a x=${1}><b y=${2}/><c z=${3}/></a>
    `,
    h('a', { x: 1 }, h('b', { y: 2 }), h('c', { z: 3 }))
  );
  t.end();
});

test('mixed typed children', t => {
  t.deepEqual(
    html`
      <a>foo<b /></a>
    `,
    h('a', null, 'foo', h('b', null))
  );
  t.deepEqual(
    html`
      <a><b />bar</a>
    `,
    h('a', null, h('b', null), 'bar')
  );
  t.deepEqual(
    html`
      <a>before<b />after</a>
    `,
    h('a', null, 'before', h('b', null), 'after')
  );
  t.deepEqual(
    html`
      <a>before<b x="1" />after</a>
    `,
    h('a', null, 'before', h('b', { x: '1' }), 'after')
  );
  t.deepEqual(
    html`
      <a>
        before${'foo'}
        <b />
        ${'bar'}after
      </a>
    `,
    h('a', null, 'before', 'foo', h('b', null), 'bar', 'after')
  );
  t.end();
});

test('hyphens (-) are allowed in attribute names', t => {
  t.deepEqual(
    html`
      <a b-c></a>
    `,
    h('a', { 'b-c': true })
  );
  t.end();
});

test('NUL characters are allowed in attribute values', t => {
  t.deepEqual(
    html`
      <a b="\0"></a>
    `,
    h('a', { b: '\0' })
  );
  t.deepEqual(
    html`
      <a b="\0" c=${'foo'}></a>
    `,
    h('a', { b: '\0', c: 'foo' })
  );
  t.end();
});

test('NUL characters are allowed in text', t => {
  t.deepEqual(
    html`
      <a>\0</a>
    `,
    h('a', null, '\0')
  );
  t.deepEqual(
    html`
      <a>\0${'foo'}</a>
    `,
    h('a', null, '\0', 'foo')
  );
  t.end();
});

test('cache key should be unique', t => {
  html`
    <a b="${'foo'}" />
  `;
  t.deepEqual(
    html`
      <a b="\0" />
    `,
    h('a', { b: '\0' })
  );
  t.notDeepEqual(
    html`
      <a>${''}9aaaaaaaaa${''}</a>
    `,
    html`
      <a>${''}0${''}aaaaaaaaa${''}</a>
    `
  );
  t.notDeepEqual(
    html`
      <a>${''}0${''}aaaaaaaa${''}</a>
    `,
    html`
      <a>${''}.8aaaaaaaa${''}</a>
    `
  );
  t.end();
});

test('do not mutate spread variables', t => {
  const obj = {};
  html`
    <a ...${obj} b="1" />
  `;
  t.deepEqual(obj, {});
  t.end();
});

test('ignore HTML comments', t => {
  t.deepEqual(
    html`
      <a><!-- Hello, world! --></a>
    `,
    h('a', null)
  );
  t.deepEqual(
    html`
      <a
        ><!-- Hello,
world! --></a
      >
    `,
    h('a', null)
  );
  t.deepEqual(
    html`
      <a><!-- ${'Hello, world!'} --></a>
    `,
    h('a', null)
  );
  t.deepEqual(
    html`
      <a><!--> Hello, world <!--></a>
    `,
    h('a', null)
  );
  t.end();
});

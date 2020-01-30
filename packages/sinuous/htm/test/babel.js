import fs from 'fs';
import path from 'path';
import test from 'tape';
import { transform } from '@babel/core';
import htmBabelPlugin from '../../babel-plugin-htm/src/index.js';

const options = {
  babelrc: false,
  configFile: false,
  sourceType: 'script',
  compact: true
};

const describe = (title, fn) => fn() && console.log(title);

describe('htm/babel', () => {
  test('basic transformation', t => {
    t.equal(
      transform('html`<div id=hello>hello</div>`;', {
        ...options,
        plugins: [htmBabelPlugin]
      }).code,
      `h("div",{id:"hello"},"hello");`
    );
    t.end();
  });

  test('basic transformation with variable', t => {
    t.equal(
      transform('var name="world";html`<div id=hello>hello, ${name}</div>`;', {
        ...options,
        plugins: [htmBabelPlugin]
      }).code,
      `var name="world";h("div",{id:"hello"},"hello, ",name);`
    );
    t.end();
  });

  test('basic nested transformation', t => {
    t.equal(
      transform('html`<a b=${2} ...${{ c: 3 }}>d: ${4}</a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",Object.assign({b:2},{c:3}),"d: ",4);`
    );

    t.equal(
      transform('html`<a b=${2} ...${{ c: 3 }}>d: ${4}</a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{b:2,...{c:3}},"d: ",4);`
    );
    t.end();
  });

  test('spread a single variable', t => {
    t.equal(
      transform('html`<a ...${foo}></a>`;', {
        ...options,
        plugins: [htmBabelPlugin]
      }).code,
      `h("a",foo);`
    );

    t.equal(
      transform('html`<a ...${foo}></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",foo);`
    );
    t.end();
  });

  test('spread two variables', t => {
    t.equal(
      transform('html`<a ...${foo} ...${bar}></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",Object.assign({},foo,bar));`
    );

    t.equal(
      transform('html`<a ...${foo} ...${bar}></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{...foo,...bar});`
    );
    t.end();
  });

  test('property followed by a spread', t => {
    t.equal(
      transform('html`<a b="1" ...${foo}></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",Object.assign({b:"1"},foo));`
    );

    t.equal(
      transform('html`<a b="1" ...${foo}></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{b:"1",...foo});`
    );
    t.end();
  });

  test('spread followed by a property', t => {
    t.equal(
      transform('html`<a ...${foo} b="1"></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",Object.assign({},foo,{b:"1"}));`
    );

    t.equal(
      transform('html`<a ...${foo} b="1"></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{...foo,b:"1"});`
    );
    t.end();
  });

  test('mix-and-match spreads', t => {
    t.equal(
      transform('html`<a b="1" ...${foo} c=${2} ...${{d:3}}></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",Object.assign({b:"1"},foo,{c:2},{d:3}));`
    );

    t.equal(
      transform('html`<a b="1" ...${foo} c=${2} ...${{d:3}}></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{b:"1",...foo,c:2,...{d:3}});`
    );
    t.end();
  });

  test('mix-and-match dynamic and static values', t => {
    t.equal(
      transform('html`<a b="1${2}${3}"></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",{b:"1"+2+3});`
    );

    t.equal(
      transform('html`<a b="1${2}${3}"></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{b:"1"+2+3});`
    );
    t.end();
  });

  test('coerces props to strings when needed', t => {
    t.equal(
      transform('html`<a b=\'${1}${2}${"3"}${4}\'></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",{b:""+1+2+"3"+4});`
    );

    t.equal(
      transform('html`<a b=\'${1}${2}${"3"}${4}\'></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{b:""+1+2+"3"+4});`
    );
    t.end();
  });

  test('coerces props to strings only when needed', t => {
    t.equal(
      transform('html`<a b=\'${"1"}${2}${"3"}${4}\'></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useBuiltIns: true
            }
          ]
        ]
      }).code,
      `h("a",{b:"1"+2+"3"+4});`
    );

    t.equal(
      transform('html`<a b=\'${"1"}${2}${"3"}${4}\'></a>`;', {
        ...options,
        plugins: [
          [
            htmBabelPlugin,
            {
              useNativeSpread: true
            }
          ]
        ]
      }).code,
      `h("a",{b:"1"+2+"3"+4});`
    );
    t.end();
  });

  describe('{variableArity:false}', () => {
    test('should pass no children as an empty Array', t => {
      t.equal(
        transform('html`<div />`;', {
          ...options,
          plugins: [
            [
              htmBabelPlugin,
              {
                variableArity: false
              }
            ]
          ]
        }).code,
        `h("div",null,[]);`
      );
      t.end();
    });

    test('should pass children as an Array', t => {
      t.equal(
        transform('html`<div id=hello>hello</div>`;', {
          ...options,
          plugins: [
            [
              htmBabelPlugin,
              {
                variableArity: false
              }
            ]
          ]
        }).code,
        `h("div",{id:"hello"},["hello"]);`
      );
      t.end();
    });
  });

  describe('{pragma:false}', () => {
    test('should transform to inline vnodes', t => {
      t.equal(
        transform(
          'var name="world",vnode=html`<div id=hello>hello, ${name}</div>`;',
          {
            ...options,
            plugins: [
              [
                htmBabelPlugin,
                {
                  pragma: false
                }
              ]
            ]
          }
        ).code,
        `var name="world",vnode={tag:"div",props:{id:"hello"},children:["hello, ",name]};`
      );
      t.end();
    });
  });

  describe('{monomorphic:true}', () => {
    test('should transform to monomorphic inline vnodes', t => {
      t.equal(
        transform(
          'var name="world",vnode=html`<div id=hello>hello, ${name}</div>`;',
          {
            ...options,
            plugins: [
              [
                htmBabelPlugin,
                {
                  monomorphic: true
                }
              ]
            ]
          }
        ).code,
        `var name="world",vnode={type:1,tag:"div",props:{id:"hello"},children:[{type:3,tag:null,props:null,children:null,text:"hello, "},name],text:null};`
      );
      t.end();
    });
  });

  describe('{wrapExpressions:"h.wrap"}', () => {
    test('should transform to a wrapped expression', t => {
      t.equal(
        transform(
          'var name="world";html`<div id=hello>hello, ${name}</div>`;',
          {
            ...options,
            plugins: [
              [
                htmBabelPlugin,
                {
                  wrapExpression: 'h.wrap'
                }
              ]
            ]
          }
        ).code,
        `var name="world";h.wrap.apply((_statics,_field)=>h("div",{id:"hello"},"hello, ",_field),[["<div id=hello>hello, ","</div>"],name]);`
      );
      t.end();
    });

    test('should transform to a wrapped expression', t => {
      t.equal(
        transform(
          'var name="world";html`<div id=hello>hello, ${html`<h1>${name}</h1>`}</div>`;',
          {
            ...options,
            plugins: [
              [
                htmBabelPlugin,
                {
                  wrapExpression: 'h.wrap'
                }
              ]
            ]
          }
        ).code,
        `var name="world";h.wrap.apply((_statics,_field)=>h("div",{id:"hello"},"hello, ",_field),[["<div id=hello>hello, ","</div>"],h.wrap.apply((_statics2,_field2)=>h("h1",null,_field2),[["<h1>","</h1>"],name])]);`
      );

      t.end();
    });
  });

  describe('main test suite', () => {
    // Run all of the main tests against the Babel plugin:
    const mod = fs.readFileSync(
      path.resolve(__dirname, 'index.js'), 'utf8').replace(/\\0/g, '\0'
    );
    const { code } = transform(
      mod
        .replace("import test from 'tape';", '')
        .replace(/^\s*import htm from\s+(['"]).*?\1[\s;]*$/im, 'const htm = function(){};'
    ), {
      ...options,
      plugins: [htmBabelPlugin]
    });
    eval(code);
  });

});

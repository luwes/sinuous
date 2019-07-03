export const IIFE = 'iife';
export const CJS = 'cjs';
export const ESM = 'esm';
export const UMD = 'umd';

export const bundleFormats = {
  ESM,
  UMD
};

export const bundles = [
  {
    external: [],
    formats: [ESM, CJS],
    name: 'babel-plugin-htm',
    input: 'packages/sinuous/babel-plugin-htm/index.mjs',
    'dest': 'packages/sinuous/babel-plugin-htm/dist'
  },
  {
    external: ['sinuous'],
    formats: [ESM, UMD],
    global: 'observable',
    name: 'observable',
    input: 'packages/sinuous/observable/src/observable.js'
  },
  {
    external: ['sinuous'],
    formats: [ESM, UMD],
    global: 'h',
    name: 'h',
    input: 'packages/sinuous/h/src/index.js'
  },
  {
    external: [],
    formats: [ESM, UMD],
    global: 'htm',
    name: 'htm',
    input: 'packages/sinuous/htm/src/index.mjs'
  },
  {
    external: ['sinuous'],
    formats: [ESM, UMD],
    global: 'template',
    name: 'template',
    input: 'packages/sinuous/template/src/template.js'
  },
  {
    external: ['sinuous'],
    formats: [ESM, UMD],
    global: 'map',
    name: 'map',
    input: 'packages/sinuous/map/src/index.js'
  },
  {
    external: ['sinuous/observable', 'sinuous/htm'],
    formats: [ESM, UMD],
    global: 'sinuous',
    name: 'sinuous',
    input: 'packages/sinuous/src/index.js'
  }
];

export const fixtures = [
  // {
  //   formats: [UMD],
  //   global: 'sinuousS',
  //   name: 'sinuous-s',
  //   input: 'fixtures/S/src/index.js',
  //   sourcemap: true
  // },
  // {
  //   formats: [UMD],
  //   global: 'sinuousHyperactiv',
  //   name: 'sinuous-hyperactiv',
  //   input: 'fixtures/hyperactiv/src/index.js',
  //   sourcemap: true
  // },
  {
    formats: [UMD],
    global: 'sinuousHello',
    name: 'hello',
    input: 'fixtures/examples/hello/src/hello.js',
    sourcemap: true
  },
  {
    formats: [UMD],
    global: 'sinuousCounter',
    name: 'counter',
    input: 'fixtures/examples/counter/src/counter.js',
    sourcemap: true
  },
  {
    formats: [UMD],
    global: 'sinuousTodos',
    name: 'todos',
    input: 'fixtures/examples/todos/src/todos.js',
    sourcemap: true
  }
];

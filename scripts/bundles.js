export const IIFE = 'iife';
export const CJS = 'cjs';
export const ESM = 'esm';
export const UMD = 'umd';

export const bundleFormats = {
  ESM,
  UMD
};

export const bundles = [
  // `htm` has to come before `babel-plugin-htm`
  {
    external: [],
    formats: [UMD, ESM, IIFE],
    global: 'htm',
    name: 'htm',
    input: 'packages/sinuous/htm/src/index.js'
  },
  {
    external: ['sinuous'],
    formats: [UMD, ESM, IIFE],
    global: 'observable',
    name: 'observable',
    input: 'packages/sinuous/observable/src/observable.js'
  },
  {
    external: ['sinuous'],
    formats: [UMD, ESM, IIFE],
    global: 'h',
    name: 'h',
    input: 'packages/sinuous/h/src/index.js'
  },
  {
    external: ['sinuous'],
    formats: [UMD, ESM, IIFE],
    global: 'template',
    name: 'template',
    input: 'packages/sinuous/template/src/template.js'
  },
  {
    external: ['sinuous'],
    formats: [UMD, ESM, IIFE],
    global: 'map',
    name: 'map',
    input: 'packages/sinuous/map/src/index.js'
  },
  {
    external: ['sinuous/observable', 'sinuous/htm'],
    formats: [UMD, ESM, IIFE],
    global: 'sinuous',
    name: 'sinuous',
    input: 'packages/sinuous/src/index.js'
  },
  {
    external: [],
    formats: [ESM, CJS],
    name: 'babel-plugin-htm',
    input: 'packages/sinuous/babel-plugin-htm/src/index.js'
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
    formats: [IIFE],
    global: 'sinuousHello',
    name: 'hello',
    input: 'site/content/examples/hello/src/hello.js',
    gzip: true,
    babel: {
      plugins: ['sinuous/babel-plugin-htm']
    }
  },
  {
    formats: [IIFE],
    global: 'sinuousCounter',
    name: 'counter',
    input: 'site/content/examples/counter/src/counter.js',
    gzip: true,
    babel: {
      plugins: ['sinuous/babel-plugin-htm']
    }
  },
  {
    formats: [IIFE],
    global: 'sinuousTodos',
    name: 'todos',
    input: 'site/content/examples/todos/src/todos.js',
    gzip: true,
    babel: {
      plugins: ['sinuous/babel-plugin-htm']
    }
  }
];

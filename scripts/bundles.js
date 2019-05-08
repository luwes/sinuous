export const ESM = 'esm';
export const UMD = 'umd';

export const bundleFormats = {
  ESM,
  UMD
};

export const bundles = [
  {
    formats: [ESM, UMD],
    global: 'sinuous',
    name: 'sinuous',
    input: 'packages/sinuous/src/index.js'
  },
  {
    formats: [ESM, UMD],
    global: 'Observable',
    name: 'observable',
    input: 'packages/sinuous/observable/src/observable.js'
  },
];

export const fixtures = [
  {
    formats: [UMD],
    global: 'sinuousS',
    name: 'sinuous-s',
    input: 'fixtures/S/src/index.js',
    sourcemap: true
  },
  {
    formats: [UMD],
    global: 'sinuousHyperactiv',
    name: 'sinuous-hyperactiv',
    input: 'fixtures/hyperactiv/src/index.js',
    sourcemap: true
  },
  {
    formats: [UMD],
    global: 'sinuousObservable',
    name: 'sinuous-observable',
    input: 'fixtures/observable/src/index.js',
    sourcemap: true
  },
];

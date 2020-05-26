export const bundleFormats = {
  CJS:  'cjs',
  ESM:  'esm',
  IIFE: 'iife',
  UMD:  'umd',
};

const { CJS, ESM, IIFE, UMD } = bundleFormats;

const dest = (path = '') =>
  format => `packages/sinuous/${format === ESM ? 'module' : 'dist'}${path}`;

export const bundles = [
  // `htm` has to come before `babel-plugin-htm`
  {
    external: [],
    formats:  [ESM, UMD, IIFE],
    global:   'htm',
    filename: 'htm',
    input:    'packages/sinuous/htm/src/index.js',
    dest:     dest(),
  },
  {
    external: ['sinuous', './sinuous.js', 'sinuous/htm', './htm.js'],
    formats:  [ESM, UMD, IIFE],
    global:   'hydrate',
    filename: 'hydrate',
    input:    'packages/sinuous/hydrate/src/index.js',
    dest:     dest(),
  },
  {
    external: [],
    formats:  [ESM, UMD, IIFE],
    global:   'observable',
    filename: 'observable',
    input:    'packages/sinuous/observable/src/observable.js',
    dest:     dest(),
  },
  {
    external: [],
    formats:  [ESM, UMD, IIFE],
    global:   'h',
    filename: 'h',
    input:    'packages/sinuous/h/src/index.js',
    dest:     dest(),
  },
  {
    external: ['sinuous', './sinuous.js'],
    formats:  [ESM, UMD, IIFE],
    global:   'template',
    filename: 'template',
    input:    'packages/sinuous/template/src/template.js',
    dest:     dest(),
  },
  {
    external: ['sinuous', './sinuous.js', 'sinuous/template', './template.js'],
    formats:  [ESM, UMD, IIFE],
    global:   'data',
    filename: 'data',
    input:    'packages/sinuous/data/src/data.js',
    dest:     dest(),
  },
  {
    external: [],
    formats:  [ESM, UMD, IIFE],
    global:   'memo',
    filename: 'memo',
    input:    'packages/sinuous/memo/src/memo.js',
    dest:     dest(),
  },
  {
    external: ['sinuous', './sinuous.js', 'sinuous/template', './template.js', 'sinuous/htm', './htm.js'],
    formats:  [ESM, UMD, IIFE],
    global:   'render',
    filename: 'render',
    input:    'packages/sinuous/render/src/index.js',
    dest:     dest(),
  },
  {
    external: ['sinuous', '../sinuous.js'],
    formats:  [ESM, UMD, IIFE],
    global:   'mini',
    filename: 'mini',
    input:    'packages/sinuous/map/mini/src/mini.js',
    dest:     dest('/map'),
  },
  {
    external: ['sinuous', './sinuous.js'],
    replace:  [

    ],
    formats:  [ESM, UMD, IIFE],
    global:   'map',
    filename: 'map',
    input:    'packages/sinuous/map/src/index.js',
    dest:     dest(),
  },
  {
    external: [
      'sinuous/observable',
      './observable.js',
      'sinuous/htm',
      './htm.js',
    ],
    formats:  [ESM, UMD, IIFE],
    global:   'sinuous',
    filename: 'sinuous',
    input:    'packages/sinuous/src/index.js',
    dest:     dest(),
  },
  {
    external:  ['sinuous/htm', './htm.js'],
    formats:   [ESM],
    global:    'so',
    // Only used to display bundle size, `observable` is a peer dependency to
    // avoid issues with the global `tracking` variable.
    filename:  'sinuous-observable',
    input:     'packages/sinuous/src/index.js',
    dest:      dest(),
    sourcemap: false,
  },
  {
    external: [],
    formats:  [ESM, CJS],
    filename: 'babel-plugin-htm',
    input:    'packages/sinuous/babel-plugin-htm/src/index.js',
    dest:     dest(),
  },
  {
    external: [],
    formats:  [ESM, UMD, IIFE],
    // Multiple globals - @see https://github.com/rollup/rollup/issues/494
    global:   'window',
    extend:   true,
    filename: 'all',
    input:    'packages/sinuous/all/src/index.js',
    dest:     dest(),
  },
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
];

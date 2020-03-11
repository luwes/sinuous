export const IIFE = 'iife';
export const CJS = 'cjs';
export const ESM = 'esm';
export const UMD = 'umd';

export const bundleFormats = {
  ESM,
  UMD
};

const dest = (path = '') => format => {
  return `packages/sinuous/${format === ESM ? 'module' : 'dist'}${path}`;
};

export const bundles = [
  // `htm` has to come before `babel-plugin-htm`
  {
    external: [],
    formats: [ESM, UMD, IIFE],
    global: 'htm',
    name: 'htm',
    input: 'packages/sinuous/htm/src/index.js',
    dest: dest()
  },
  {
    // order is important, every even pkg name is replaced w/ next uneven file in ESM
    external: ['sinuous', './sinuous.js', 'sinuous/htm', './htm.js'],
    formats: [ESM, UMD, IIFE],
    global: 'hydrate',
    name: 'hydrate',
    input: 'packages/sinuous/hydrate/src/index.js',
    dest: dest()
  },
  {
    external: [],
    formats: [ESM, UMD, IIFE],
    global: 'observable',
    name: 'observable',
    input: 'packages/sinuous/observable/src/observable.js',
    dest: dest()
  },
  {
    external: [],
    formats: [ESM, UMD, IIFE],
    global: 'h',
    name: 'h',
    input: 'packages/sinuous/h/src/index.js',
    dest: dest()
  },
  {
    external: ['sinuous', './sinuous.js'],
    formats: [ESM, UMD, IIFE],
    global: 'template',
    name: 'template',
    input: 'packages/sinuous/template/src/template.js',
    dest: dest()
  },
  {
    external: ['sinuous', './sinuous.js', 'sinuous/template', './template.js'],
    formats: [ESM, UMD, IIFE],
    global: 'data',
    name: 'data',
    input: 'packages/sinuous/data/src/data.js',
    dest: dest()
  },
  {
    external: [],
    formats: [ESM, UMD, IIFE],
    global: 'memo',
    name: 'memo',
    input: 'packages/sinuous/memo/src/memo.js',
    dest: dest()
  },
  {
    // order is important, every even pkg name is replaced w/ next uneven file in ESM
    external: ['sinuous', './sinuous.js', 'sinuous/template', './template.js', 'sinuous/htm', './htm.js'],
    formats: [ESM, UMD, IIFE],
    global: 'render',
    name: 'render',
    input: 'packages/sinuous/render/src/index.js',
    dest: dest()
  },
  {
    // order is important, every even pkg name is replaced w/ next uneven file in ESM
    external: ['sinuous', '../sinuous.js'],
    formats: [ESM, UMD, IIFE],
    global: 'mini',
    name: 'mini',
    input: 'packages/sinuous/map/mini/src/mini.js',
    dest: dest('/map')
  },
  {
    // order is important, every even pkg name is replaced w/ next uneven file in ESM
    external: ['sinuous', './sinuous.js', 'sinuous/map/mini', './map/mini.js'],
    formats: [ESM, UMD, IIFE],
    global: 'map',
    name: 'map',
    input: 'packages/sinuous/map/src/index.js',
    dest: dest()
  },
  {
    // order is important, every even pkg name is replaced w/ next uneven file in ESM
    external: [
      'sinuous/observable',
      './observable.js',
      'sinuous/htm',
      './htm.js'
    ],
    formats: [ESM, UMD, IIFE],
    global: 'sinuous',
    name: 'sinuous',
    input: 'packages/sinuous/src/index.js',
    dest: dest()
  },
  {
    // order is important, every even pkg name is replaced w/ next uneven file in ESM
    external: ['sinuous/htm', './htm.js'],
    formats: [ESM],
    global: 'so',
    // only used to display bundle size, `observable` is a peer dependency to
    // avoid issues with the global `tracking` variable.
    name: 'sinuous-observable',
    input: 'packages/sinuous/src/index.js',
    dest: dest(),
    sourcemap: false
  },
  {
    external: [],
    formats: [ESM, CJS],
    name: 'babel-plugin-htm',
    input: 'packages/sinuous/babel-plugin-htm/src/index.js',
    dest: dest()
  },
  {
    external: [],
    formats: [ESM, UMD, IIFE],
    // multiple globals - @see https://github.com/rollup/rollup/issues/494
    global: 'window',
    extend: true,
    name: 'all',
    input: 'packages/sinuous/all/src/index.js',
    dest: dest()
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
    global: 'sinuousSite',
    name: 'site',
    input: 'site/assets/src/site.js',
    dest: () => 'site/assets/js',
    sourcemap: true,
    babel: {
      plugins: [
        ['sinuous/babel-plugin-htm', {
          pragma: 'd',
          tag: 'dhtml',
          import: 'sinuous/hydrate'
        }]
      ]
    }
  },
  {
    formats: [IIFE],
    global: 'sinuousHello',
    name: 'hello',
    input: 'site/content/examples/hello/src/hello.js',
    gzip: true,
    babel: {
      plugins: [
        ['sinuous/babel-plugin-htm', {
          import: 'sinuous'
        }]
      ]
    }
  },
  {
    formats: [IIFE],
    global: 'sinuousHelloJsx',
    name: 'hello',
    input: 'site/content/examples/hello-jsx/src/hello.js',
    gzip: true,
    babel: {
      plugins: [
        ['babel-plugin-transform-jsx-to-htm'],
        ['sinuous/babel-plugin-htm', {
          import: 'sinuous'
        }]
      ]
    }
  },
  {
    formats: [IIFE],
    global: 'sinuousCounter',
    name: 'counter',
    input: 'site/content/examples/counter/src/counter.js',
    gzip: true,
    babel: {
      plugins: [
        ['sinuous/babel-plugin-htm', {
          import: 'sinuous'
        }]
      ]
    }
  },
  {
    formats: [IIFE],
    global: 'sinuousTodos',
    name: 'todos',
    input: 'site/content/examples/todos/src/todos.js',
    gzip: true,
    babel: {
      plugins: [
        ['sinuous/babel-plugin-htm', {
          import: 'sinuous'
        }]
      ]
    }
  },
  {
    formats: [IIFE],
    global: 'sinuousClock',
    name: 'clock',
    input: 'site/content/examples/clock/src/clock.js',
    gzip: true,
    babel: {
      plugins: [
        ['sinuous/babel-plugin-htm', {
          import: 'sinuous'
        }],
        ['sinuous/babel-plugin-htm', {
          pragma: 'hs',
          tag: 'svg',
          import: 'sinuous'
        }, 'svg']
      ]
    }
  }
];

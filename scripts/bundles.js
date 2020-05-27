const bundleFormats = {
  CJS:  'cjs',
  ESM:  'esm',
  IIFE: 'iife',
  UMD:  'umd',
};

const { CJS, ESM, IIFE, UMD } = bundleFormats;

// Format extensions, see bundles#file
const ext = {
  [CJS ]: 'js',
  [ESM ]: 'js',
  [IIFE]: 'min.js',
  [UMD ]: 'js',
};

/**
 * @typedef {(code: string) => string} Replacer
 * @type {(from: string, to: string) => Replacer}
 */
// const replaceImport = (from, to) =>
//   (code) => code.replace(`from '${from}'`, `from '${to}'`);

/**
 * @typedef Bundle
 * Required
 * @property {string} input  Rollup's input
 * @property {string} file   Rollup's output.file
 * @property {string} format Rollup's output.format (ESM/UDM/IIFE)
 * Optional
 * @property {string}     [name]      Rollup's output.name
 * @property {boolean}    [extend]    Extend rather than replace global [name]
 * @property {boolean}    [sourcemap] Emit sourcemaps
 * @property {string[]}   [external]  Skipped dependencies
 * @property {Replacer[]} [replace]   Bundle string replacement functions
 */

/** @type {Bundle[]} */
const bundleConfig = [
  // `htm` has to come before `babel-plugin-htm`
  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/htm/src/index.js',
    file: `dist/${format}/htm.${ext[format]}`,
    format,
    name: 'htm',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/hydrate/src/index.js',
    file: `dist/${format}/hydrate.${ext[format]}`,
    format,
    name: 'hydrate',
    external: ['sinuous', 'sinuous/htm'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/observable/src/observable.js',
    file: `dist/${format}/observable.${ext[format]}`,
    format,
    name: 'observable',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/h/src/index.js',
    file:  `'dist/${format}/h.${ext[format]}`,
    format,
    name: 'h',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/template/src/template.js',
    file: `dist/${format}/template.${ext[format]}`,
    format,
    name: 'template',
    external: ['sinuous'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/data/src/data.js',
    file: `dist/${format}/data.${ext[format]}`,
    format,
    name: 'data',
    external: ['sinuous', 'sinuous/template'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/memo/src/memo.js',
    file: `dist/${format}/memo.${ext[format]}`,
    format,
    name: 'memo',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/render/src/index.js',
    file: `dist/${format}/render.${ext[format]}`,
    format,
    name: 'render',
    external: ['sinuous', 'sinuous/template', 'sinuous/htm'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/map/mini/src/mini.js',
    file: `dist/${format}/map/mini.${ext[format]}`,
    format,
    name: 'mini',
    external: ['sinuous'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/map/src/index.js',
    file: `dist/${format}/map.${ext[format]}`,
    format,
    name: 'map',
    external: ['sinuous'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'packages/sinuous/src/index.js',
    file: `dist/${format}/sinuous.${ext[format]}`,
    format,
    name: 'sinuous',
    external: ['sinuous/observable', 'sinuous/htm' ],
  })),

  ...[ESM].map(format => ({
    input:  'packages/sinuous/src/index.js',
    file: `dist/${format}/sinuous-observable.${ext[format]}`,
    format,
    // Only used to display bundle size, `observable` is a peer dependency to
    // avoid issues with the global `tracking` variable.
    name: 'so',
    external: ['sinuous/htm'],
    sourcemap: false,
  })),

  ...[ESM, CJS].map(format => ({
    input: 'packages/sinuous/babel-plugin-htm/src/index.js',
    file: `dist/${format}/babel-plugin-htm.${ext[format]}`,
    format,
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    // Multiple globals - @see https://github.com/rollup/rollup/issues/494
    input: 'packages/sinuous/all/src/index.js',
    file: `dist/${format}/all.${ext[format]}`,
    format,
    name: 'window',
    extend: true,
  })),
];

// Quick tune ups
const bundles = bundleConfig.map(config => {
  const defaults = {
    extend: false,
    sourcemap: false,
    external: [],
    replace: [],
  };
  // Set all optional properties
  config = Object.assign(defaults, config);

  return config;
});

export { bundles, bundleFormats };

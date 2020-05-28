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
 * @property {string} input  Rollup's input - modified later
 * @property {string} file   Rollup's output.file - modified later
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
    input: 'htm/src/index.js',
    file: 'htm',
    format,
    name: 'htm',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'hydrate/src/index.js',
    file: 'hydrate',
    format,
    name: 'hydrate',
    external: ['sinuous', 'sinuous/htm'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'observable/src/observable.js',
    file: 'observable',
    format,
    name: 'observable',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'h/src/index.js',
    file: 'h',
    format,
    name: 'h',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'template/src/template.js',
    file: 'template',
    format,
    name: 'template',
    external: ['sinuous'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'data/src/data.js',
    file: 'data',
    format,
    name: 'data',
    external: ['sinuous', 'sinuous/template'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'memo/src/memo.js',
    file: 'memo',
    format,
    name: 'memo',
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'render/src/index.js',
    file: 'render',
    format,
    name: 'render',
    external: ['sinuous', 'sinuous/template', 'sinuous/htm'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'map/mini/src/mini.js',
    file: 'map/mini',
    format,
    name: 'mini',
    external: ['sinuous'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'map/src/index.js',
    file: 'map',
    format,
    name: 'map',
    external: ['sinuous'],
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    input: 'src/index.js',
    file: 'sinuous',
    format,
    name: 'sinuous',
    external: ['sinuous/observable', 'sinuous/htm' ],
  })),

  ...[ESM].map(format => ({
    input: 'src/index.js',
    file: 'sinuous-observable',
    format,
    // Only used to display bundle size, `observable` is a peer dependency to
    // avoid issues with the global `tracking` variable.
    name: 'so',
    external: ['sinuous/htm'],
    sourcemap: false,
  })),

  ...[ESM, CJS].map(format => ({
    input: 'babel-plugin-htm/src/index.js',
    file: 'babel-plugin-htm',
    format,
  })),

  ...[ESM, UMD, IIFE].map(format => ({
    // Multiple globals - @see https://github.com/rollup/rollup/issues/494
    input: 'all/src/index.js',
    file: 'all',
    format,
    name: 'window',
    extend: true,
  })),
];

// Quick tune ups
const bundles = bundleConfig.map(config => {
  const defaults = {
    name: undefined,
    extend: false,
    sourcemap: false,
    external: [],
    replace: [],
  };
  // Set all optional properties
  config = Object.assign(defaults, config);

  // Prefix all input and output paths
  const { format } = config;
  config.input = `packages/sinuous/${config.input}`;
  config.file = `dist/${format}/${config.file}.${ext[format]}`;

  // Patch all bundle replacements
  // TODO: config.output[ESM].plugins.push(replace())

  return config;
});

export { bundles, bundleFormats };

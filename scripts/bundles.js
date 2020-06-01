import path from 'path';
import replace from './rollup-plugin-replace.js';
import nodeResolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-size';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

/**
 * @typedef {import("rollup").ModuleFormat} ModuleFormat
 * @typedef {import("rollup").InputOptions} InputOptions
 * @typedef {import("rollup").OutputOptions} OutputOptions
 * @typedef {import("rollup").Plugin} Plugin
 * @typedef {InputOptions & { output: OutputOptions }} RollupOptions
 */

/** @type {{ [key: string]: ModuleFormat }} */
const bundleFormatVariables = {
  CJS:  'cjs',
  ESM:  'esm',
  IIFE: 'iife',
  UMD:  'umd',
};

const { CJS, ESM, IIFE, UMD } = bundleFormatVariables;
const bundleFormats = Object.values(bundleFormatVariables);

// Format extensions
const ext = {
  [CJS ]: 'js',
  [ESM ]: 'js',
  [IIFE]: 'min.js',
  [UMD ]: 'js',
};

const src = 'packages/sinuous';
const dest = (name, format) => `${src}/dist/${format}/${name}.${ext[format]}`;

/**
 * For filtering by CLI, as names are dissolved into the config
 * @type {string[]}
 */
const bundleNames = [];

/** @type {RollupOptions[]} */
const bundleSnippets = [
  // `htm` has to come before `babel-plugin-htm`
  mk('htm', {
    input: `${src}/htm/src/index.js`,
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'htm' } },
  }),
  mk('hydrate', {
    input: `${src}/hydrate/src/index.js`,
    external: ['sinuous', 'sinuous/htm'],
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'hydrate' } },
  }),
  mk('observable', {
    input: `${src}/observable/src/observable.js`,
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'observable' } },
  }),
  mk('h', {
    input: `${src}/h/src/index.js`,
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'h' } },
  }),
  mk('template', {
    input: `${src}/template/src/template.js`,
    external: ['sinuous'],
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'template' } },
  }),
  mk('data', {
    input: `${src}/data/src/data.js`,
    external: ['sinuous', 'sinuous/template'],
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'data' } },
  }),
  mk('memo', {
    input: `${src}/memo/src/memo.js`,
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'memo' } },
  }),
  mk('render', {
    input: `${src}/render/src/index.js`,
    external: ['sinuous', 'sinuous/template', 'sinuous/htm'],
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'render' } },
  }),
  mk('map/mini', {
    input: `${src}/map/mini/src/mini.js`,
    external: ['sinuous'],
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'mini' } },
  }),
  mk('map', {
    input: `${src}/map/src/index.js`,
    external: ['sinuous'],
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'map' } },
  }),
  mk('sinuous', {
    input: `${src}/src/index.js`,
    external: ['sinuous/observable', 'sinuous/htm' ],
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'sinuous' } },
  }),
  mk('sinuous-observable', {
    input: `${src}/src/index.js`,
    external: ['sinuous/htm'],
    output: {
      sourcemap: false,
    },
    [ESM]: {},
  }),
  mk('babel-plugin-htm', {
    input: `${src}/babel-plugin-htm/src/index.js`,
    [ESM + CJS]: {},
  }),
  mk('all', {
    // Multiple globals - @see https://github.com/rollup/rollup/issues/494
    input: `${src}/all/src/index.js`,
    [ESM]: {},
    [UMD + IIFE]: { output: { name: 'window', extend: true } },
  }),
]
  .flat(); // Config snippets are split into their own full configs as an array

/**
 * Expand a multi-format snippet into an array of single-format configs
 * @typedef {InputOptions & { output?: OutputOptions }} PerFormatConfig
 * @typedef {PerFormatConfig & { [maybeFormat: string]: PerFormatConfig | {} }} ConfigSnippet
 * @type {(name: string, configSnippet: ConfigSnippet) => RollupOptions[]}
 */
function mk(name, configSnippet) {
  const all = {};
  /** @type {RollupOptions[]} */
  const perFormatConfigs = [];

  for (const key in configSnippet) {
    const matchedFormats = bundleFormats.filter(format => key.includes(format));
    for (const format of matchedFormats) {
      // @ts-ignore '{}' doesn't include 'output'
      const { output = {}, ...rest } = configSnippet[key];
      // For CLI later
      bundleNames.push(name);
      perFormatConfigs.push({
        output: {
          file: dest(name, format),
          format,
          ...output,
        },
        // TODO: For plugins or other object/array merging consider deepmerge
        ...rest,
      });
    }
    if (matchedFormats.length === 0) {
      all[key] = configSnippet[key];
    }
  }
  // TODO: This is yet another reason to delegate to deepemerge
  return perFormatConfigs.map(({ output, ...o }) =>
    Object.assign({}, all, { output: { ...all.output, ...output }, ...o }));
}

/**
 * Generate a full self contained bundle config from a single-format config
 * @type {(rollupConfig: RollupOptions) => RollupOptions}
 */
const makeBundleConfigs = (rollupConfig) => {
  const { input, external = [], output, ...rest } = rollupConfig;
  const { format, plugins = [], ...restOutput } = output;
  return {
    input,
    external,
    plugins: [
      nodeResolve(),
      [UMD, IIFE].includes(format)
        && pluginBabel(),
    ]
      .filter(Boolean),
    output: {
      format,
      sourcemap: true,
      plugins: [
        bundleSize({
          // Unfortunately this package wasn't properly typed or documented, see
          // package `size-plugin-core` for all available options
          // @ts-ignore
          columnWidth: 25,
          decorateItem: (item) =>
            item.replace('.js', `.js ${format.toUpperCase().padEnd(4)}`),
        }),
        [ESM, UMD, IIFE].includes(format)
          && pluginTerser(),
        [ESM].includes(format)
          && pluginReplaceESM(rollupConfig),

        ...plugins,
      ]
        .filter(Boolean),
      strict:   false, // Remove `use strict;`
      interop:  false, // Remove `r=r&&r.hasOwnProperty("default")?r.default:r;`
      freeze:   false, // Remove `Object.freeze()`
      esModule: false, // Remove `esModule` property
      ...restOutput,
    },
    watch: {
      clearScreen: false,
    },
    onwarn(warning) {
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
      const skip = [
        'THIS_IS_UNDEFINED',
        'UNKNOWN_OPTION',
        'MISSING_GLOBAL_NAME',
        'CIRCULAR_DEPENDENCY',
      ];
      if (skip.includes(warning.code)) return;
      console.error(warning.message);
    },
    ...rest,
  };
};

// Plugins
// -----------------------------------------------------------------------------

/** @type {() => Plugin} */
function pluginBabel() {
  return babel({
    babelHelpers: 'bundled',
  });
}

/** @type {() => Plugin} */
function pluginTerser() {
  return terser({
    sourcemap: true,
    ecma: 2017,
    warnings: true,
    compress: {
      passes: 2,
    },
    mangle: {
      properties: {
        regex: /^_/,
      },
    },
    nameCache: {
      props: {
        cname: 6,
        props: {
          $_tag: '__t',
          $_props: '__p',
          $_children: '__c',
          // Fixes a weird issue with mangling. `r.o.has` is not a function.
          $_observers: '__o',
        },
      },
    },
  });
}

/** @type {(bundleConfig: RollupOptions) => Plugin?} */
function pluginReplaceESM(bundleConfig) {
  const { external } = bundleConfig;
  if (!external || !Array.isArray(external) || !external.length) {
    return null;
  }
  const { format, file } = bundleConfig.output;
  const replacements = [];
  for (const dep of external) {
    // @ts-ignore Externals can be regular expressions which break basename()
    const depPath = path.relative(file, dest(path.basename(dep), format))
      .replace('..', '.')
      .replace('./..', '..');
    replacements.push({
      search: new RegExp(`from '${dep}'`, 'g'),
      eachMatch: () => `from '${depPath}'`,
    });
  }
  return replace(replacements, {
    sourcemap: Boolean(bundleConfig.output.sourcemap),
  });
}

const bundles = bundleSnippets.map(makeBundleConfigs);

export { bundles, bundleNames };

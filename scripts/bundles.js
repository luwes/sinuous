import path from 'path';
import replace from '@rollup/plugin-replace'; // TODO: Replace this
import nodeResolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-size';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

/**
 * @typedef {import("rollup").ModuleFormat} ModuleFormat
 * @typedef {import("rollup").MergedRollupOptions} MergedRollupOptions
 * @typedef {import("rollup").OutputOptions} OutputOptions
 * @typedef {import("rollup").Plugin} Plugin
 */

/** @type {{ [key: string]: ModuleFormat }} */
const bundleFormats = {
  CJS:  'cjs',
  ESM:  'esm',
  IIFE: 'iife',
  UMD:  'umd',
};

const { CJS, ESM, IIFE, UMD } = bundleFormats;
const src = 'packages/sinuous';
const dest = (name, format) => `dist/${format}/${name}.${ext[format]}`;

// Format extensions
const ext = {
  [CJS ]: 'js',
  [ESM ]: 'js',
  [IIFE]: 'min.js',
  [UMD ]: 'js',
};

// Store these for filtering by CLI
/** @type {string[]} */
const bundleNames = [];

/** @type {MergedRollupOptions[]} */
const bundles = [
  // `htm` has to come before `babel-plugin-htm`
  {
    input: `${src}/htm/src/index.js`,
    output: out('htm', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'htm' },
    }),
  },
  {
    input: `${src}/hydrate/src/index.js`,
    external: ['sinuous', 'sinuous/htm'],
    output: out('hydrate', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'hydrate' },
    }),
  },
  {
    input: `${src}/observable/src/observable.js`,
    output: out('observable', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'observable' },
    }),
  },
  {
    input: `${src}/h/src/index.js`,
    output: out('sinuous', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'h' },
    }),
  },
  {
    input: `${src}/template/src/template.js`,
    external: ['sinuous'],
    output: out('template', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'template' },
    }),
  },
  {
    input: `${src}/data/src/data.js`,
    external: ['sinuous', 'sinuous/template'],
    output: out('data', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'data' },
    }),
  },
  {
    input: `${src}/memo/src/memo.js`,
    output: out('memo', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'memo' },
    }),
  },
  {
    input: `${src}/render/src/index.js`,
    external: ['sinuous', 'sinuous/template', 'sinuous/htm'],
    output: out('render', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'render' },
    }),
  },
  {
    input: `${src}/map/mini/src/mini.js`,
    external: ['sinuous'],
    output: out('map/mini', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'mini' },
    }),
  },
  {
    input: `${src}/map/src/index.js`,
    external: ['sinuous'],
    output: out('map', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'map' },
    }),
  },
  {
    input: `${src}/src/index.js`,
    external: ['sinuous/observable', 'sinuous/htm' ],
    output: out('sinuous', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'sinuous' },
    }),
  },
  {
    input: `${src}/src/index.js`,
    external: ['sinuous/htm'],
    output: out('sinuous-observable', {
      sourcemap: false,
      [ESM]: {},
    }),
  },
  {
    input: `${src}/babel-plugin-htm/src/index.js`,
    output: out('babel-plugin-htm', {
      [ESM + CJS]: {},
    }),
  },
  {
    // Multiple globals - @see https://github.com/rollup/rollup/issues/494
    input: `${src}/all/src/index.js`,
    output: out('all', {
      [ESM]: {},
      [UMD + IIFE]: { name: 'window', extend: true },
    }),
  },
];

/**
 * @typedef { OutputOptions & { [maybeFormat: string]: (OutputOptions | {}) }} PerFormat
 * @type {(name: string, perFormat: PerFormat) => OutputOptions[]}
 */
function out(name, perFormat) {
  // Unfortunately this is the only reference to name...
  bundleNames.push(name);

  const globalOptions = {};
  const outputConfigs = [];
  for (const key in perFormat) {
    let keyIsFormat = false;
    for (const format of Object.values(bundleFormats)) {
      if (key.includes(format)) {
        outputConfigs.push({
          file: dest(name, format),
          format,
          ...perFormat[key],
        });
        keyIsFormat = true;
      }
    }
    if (keyIsFormat === false) {
      globalOptions[key] = perFormat[key];
    }
  }
  return outputConfigs.map(o => Object.assign({}, globalOptions, o));
}

// Tweaks and global changes. This finalizes the configs
bundles.forEach(bundle => {
  bundle.watch = {
    clearScreen: false,
  };
  // Global plugins not per format
  bundle.plugins = [
    nodeResolve(),
  ];
  bundle.output.forEach(o => {
    o.plugins = [
      bundleSize({
        // Unfortunately this package wasn't properly typed or documented, see
        // package `size-plugin-core` for all available options
        // @ts-ignore
        columnWidth: 25,
        decorateItem: (item) =>
          item.replace('.js', `.js ${o.format.toUpperCase().padEnd(4)}`),
      }),

      [ESM, UMD, IIFE].includes(o.format)
        && pluginTerser(),
      // TODO: Brutal
      // [UMD, IIFE].includes(o.format)
      //   && pluginBabel(),
      // [ESM].includes(o.format)
      //   && pluginReplaceESM(bundle),

      ...(o.plugins || []),
    ]
      // Allow plugins to return an array
      .flat()
      .filter(Boolean);

    o.strict = false;   // Remove `use strict;`
    o.interop = false;  // Remove `r=r&&r.hasOwnProperty("default")?r.default:r;`
    o.freeze = false;   // Remove `Object.freeze()`
    o.esModule = false; // Remove `esModule` property
  });
  bundle.onwarn = (warning) => {
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    const skip = [
      'THIS_IS_UNDEFINED',
      'UNKNOWN_OPTION',
      'MISSING_GLOBAL_NAME',
      'CIRCULAR_DEPENDENCY',
    ];
    if (skip.includes(warning.code)) {
      return;
    }
    console.error(warning.message);
  };
});

/** @type {() => Plugin} */
function pluginBabel() {
  // TODO: Brutal...
  return getBabelOutputPlugin({
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

/** @type {(bundleConfig: MergedRollupOptions) => Plugin[]?} */
function pluginReplaceESM(bundleConfig) {
  const { external } = bundleConfig;
  if (!external || !Array.isArray(external) || external.length === 0) {
    return;
  }
  const { format, file } = bundleConfig.output.find(o => o.format === ESM);
  const newExternals = [];
  const newPlugins = [];

  for (const dep of external) {
    // @ts-ignore Externals can be regular expressions :(
    const depFile = `dist/${format}/${path.basename(dep)}.js`;
    const depPath = path.relative(file, depFile)
      .replace('..', '.')
      .replace('./..', '..');
    // TODO: config.replace.push(replaceImport(dep, ''));
    newPlugins.push(
      replace({
        delimiters: ['', ''],
        [`from '${dep}'`]: `from '${depPath}'`,
      })
    );
    // Also mark itself as a dependency
    newExternals.push(depPath);
  }
  external.push(...newExternals);
  return newPlugins;
}

export { bundles, bundleNames, bundleFormats };

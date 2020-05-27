import path from 'path';
import babel from '@rollup/plugin-babel';
// TODO: Replace this
import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';

import bundleSize from 'rollup-plugin-size';
import gzip from 'rollup-plugin-gzip';
import { terser } from 'rollup-plugin-terser';

import minimist from 'minimist';

import { bundleFormats, bundles } from './bundles.js';
// TODO: import { replace } from './rollup-replace.js';

const { CJS, ESM, IIFE, UMD } = bundleFormats;
const argv = minimist(process.argv.slice(2));

const requestedBundleNames
  = argv.name
    ? argv.name
      .split(',')
      .map(name => name.trim())
    : [];
const requestedBundleTypes
  = argv.type
    ? argv.type
      .split(',')
      .map(type => type.trim())
    : [];

// For every type in bundle.types creates a new bundle obj.
const allBundles = bundles.filter(({ name, format }) => {
  if (requestedBundleNames.length > 0 && !requestedBundleNames.includes(name))
    return false;
  if (requestedBundleTypes.length > 0 && !requestedBundleTypes.includes(format))
    return false;
  return true;
});

function getConfig(options) {
  const {
    file,
    input,
    exports,
    format,
    external,
    sourcemap,
    extend,
  } = options;

  const config = {
    input,
    external,
    watch: {
      clearScreen: false,
    },
    output: {
      format,
      sourcemap,
      extend,
      file,
      name,
      exports,
      strict:   false, // Remove `use strict;`
      interop:  false, // Remove `r=r&&r.hasOwnProperty("default")?r.default:r;`
      freeze:   false, // Remove `Object.freeze()`
      esModule: false, // Remove `esModule` property
    },
    plugins: [
      // Unfortunately this package wasn't properly typed or documented, see
      // package `size-plugin-core` for all available options
      bundleSize({
        columnWidth: 25,
        decorateItem: (item) =>
          item.replace('.js', `.js ${format.toUpperCase().padEnd(4)}`),
      }),
      nodeResolve(),
      [UMD, IIFE].includes(format)
        && babel({
          babelHelpers: 'bundled',
        }),
      [ESM, UMD, IIFE].includes(format)
        && terser({
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
        }),
      // TODO: options.replace && replace(options.replace),
      options.gzip && gzip(),
    ].filter(Boolean),
    onwarn(warning) {
      // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
      const skip = ['THIS_IS_UNDEFINED', 'UNKNOWN_OPTION', 'MISSING_GLOBAL_NAME', 'CIRCULAR_DEPENDENCY'];
      if (skip.includes(warning.code)) return;
      console.error(warning.message);
    },
  };

  // Fix import paths
  if (format === ESM && external.length > 0) {
    const distFile = config.output.file;
    for (const dep of external) {
      const depFile = path.relative(`dist/${format}/${dep}.js`, distFile);
      console.log(`Replacing ${dep} to ${depFile}`);
      // TODO: config.replace.push(replaceImport(dep, ''));
      config.plugins.push(
        replace({
          delimiters: ['', ''],
          [`from '${dep}'`]: `from '${depFile}'`,
        }));
    }
  }

  return config;
}

export default allBundles.map(getConfig);

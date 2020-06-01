import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import bundleSize from 'rollup-plugin-size';
import gzip from 'rollup-plugin-gzip';
import sourcemaps from 'rollup-plugin-sourcemaps';
import minimist from 'minimist';

import { CJS, ESM, IIFE, UMD, bundles } from './bundles.js';

const formatExtensions = {
  [CJS ]: '.js',
  [ESM ]: '.js',
  [IIFE]: '.min.js',
  [UMD ]: '.js',
};

const argv = minimist(process.argv.slice(2));

const requestedBundleNames =
  argv.name
    ? argv.name
        .split(',')
        .map(name => name.trim())
    : [];
const requestedBundleTypes =
  argv.type
    ? argv.type
        .split(',')
        .map(type => type.trim().toUpperCase())
    : [];

// For every type in bundle.types creates a new bundle obj.
const allBundles =
  bundles
    .flatMap(({ formats, ...rest }) =>
      formats.map(format => ({ ...rest, format }))
    )
    .filter(({ name, format }) => {
      if (requestedBundleNames.length > 0 && !requestedBundleNames.includes(name))
        return false;
      if (requestedBundleTypes.length > 0 && !requestedBundleTypes.includes(format))
        return false;

      return true;
    });

function getConfig(options) {
  const {
    name,
    input,
    dest,
    format,
    external = [],
    sourcemap = true,
    extend = false
  } = options;
  const replacePeersForESM = external.map((name, i) => {
    return (
      ESM === format &&
      i % 2 == 0 &&
      replace({
        delimiters: ['', ''],
        [`from '${name}'`]: `from '${external[i + 1]}'`
      })
    );
  });

  return {
    input,
    external,
    watch: {
      clearScreen: false
    },
    output: {
      format,
      sourcemap,
      extend,
      file: `${dest(format)}/${name}${formatExtensions[format]}`,
      name: options.global,
      exports: options.exports,
      strict:   false, // Remove `use strict;`
      interop:  false, // Remove `r=r&&r.hasOwnProperty("default")?r.default:r;`
      freeze:   false, // Remove `Object.freeze()`
      esModule: false, // Remove `esModule` property
    },
    plugins: [
      bundleSize({
        columnWidth: 25
      }),
      sourcemaps(),
      nodeResolve(),
      [UMD, IIFE].includes(format) && babel(options.babel),
      [ESM, UMD, IIFE].includes(format) &&
        terser({
          sourcemap: true,
          ecma: '2017',
          warnings: true,
          compress: {
            passes: 2
          },
          mangle: {
            properties: {
              regex: /^_/
            }
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
              }
            }
          }
        }),
      ...replacePeersForESM,
      options.gzip && gzip()
    ].filter(Boolean),
    onwarn: function(warning) {
      // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
      if (
        ['THIS_IS_UNDEFINED', 'UNKNOWN_OPTION', 'MISSING_GLOBAL_NAME', 'CIRCULAR_DEPENDENCY'].includes(
          warning.code
        )
      )
        return;

      console.error(warning.message);
    }
  };
}

export default allBundles.map(getConfig);

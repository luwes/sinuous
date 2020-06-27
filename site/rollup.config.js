import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import bundleSize from 'rollup-plugin-size';

const terserPlugin = terser({
  warnings: true,
  compress: {
    passes: 2
  },
  mangle: {
    properties: {
      regex: /^_/
    }
  }
});

const config = {
  input: 'src/js/site.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'site',
    file: 'public/js/site.min.js',
    strict: false, // Remove `use strict;`
    interop: false, // Remove `r=r&&r.hasOwnProperty("default")?r.default:r;`
    freeze: false, // Remove `Object.freeze()`
    esModule: false, // Remove `esModule` property
  },
  plugins: [
    bundleSize(),
    resolve(),
    babel(),
    terserPlugin
  ],
  watch: {
    clearScreen: false
  }
};

export default [
  config,
  {
    ...config,
    input: 'src/examples/hello/src/hello.js',
    output: {
      ...config.output,
      name: 'sinuousHello',
      file: 'public/examples/hello/dist/hello.min.js',
    },
  },
  {
    ...config,
    input: 'src/examples/hello-jsx/src/hello.js',
    output: {
      ...config.output,
      name: 'sinuousHelloJsx',
      file: 'public/examples/hello-jsx/dist/hello.min.js',
    },
  },
  {
    ...config,
    input: 'src/examples/counter/src/counter.js',
    output: {
      ...config.output,
      name: 'sinuousCounter',
      file: 'public/examples/counter/dist/counter.min.js',
    },
  },
  {
    ...config,
    input: 'src/examples/todos/src/todos.js',
    output: {
      ...config.output,
      name: 'sinuousTodos',
      file: 'public/examples/todos/dist/todos.min.js',
    },
  },
  {
    ...config,
    input: 'src/examples/clock/src/clock.js',
    output: {
      ...config.output,
      name: 'sinuousClock',
      file: 'public/examples/clock/dist/clock.min.js',
    },
  },
];

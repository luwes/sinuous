import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import size from 'rollup-plugin-size';

const defaults = {
  watch: {
    clearScreen: false
  },
};

const plugins = [
  size(),
  babel({
    exclude: 'node_modules/**',
    plugins: [
      ['sinuous/babel-plugin-htm', {
        import: 'sinuous/hydrate',
        pragma: 'd',
        tag: 'dhtml'
      }, 'for hydrate'],
      ['sinuous/babel-plugin-htm', {
        import: 'sinuous'
      }]
    ]
  }),
  resolve(),
  commonjs()
];

if (process.env.production) {
  plugins.push(terser());
}

export default [{
  ...defaults,
  input: 'results.js',
  output: {
    file: 'dist/results.js',
    format: 'iife'
  },
  plugins
},
{
  ...defaults,
  input: 'speed-size.js',
  output: {
    file: 'dist/speed-size.js',
    format: 'iife'
  },
  plugins
}];

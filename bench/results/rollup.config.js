import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const defaults = {
  watch: {
    clearScreen: false
  },
};

const plugins = [
  babel({
    exclude: 'node_modules/**',
    plugins: [
      ['sinuous/babel-plugin-htm'],
      ['sinuous/babel-plugin-htm', {
        'pragma': 'hy|hys',
        'tag': '/tree|trees/'
      }, 'for hydrate']
    ]
  }),
  resolve()
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

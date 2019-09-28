import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

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
  input: 'results/results.js',
  output: {
    file: 'results/dist/results.js',
    format: 'iife'
  },
  plugins
},
{
  input: 'results/speed-size.js',
  output: {
    file: 'results/dist/speed-size.js',
    format: 'iife'
  },
  plugins
}];

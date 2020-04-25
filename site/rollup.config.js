import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import bundleSize from 'rollup-plugin-size';

const production = !process.env.ROLLUP_WATCH;

const terserPlugin = terser({
  sourcemap: true,
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
    file: 'public/js/site.min.js'
  },
  plugins: [
    bundleSize(),
    commonjs(),
    resolve(),
    // If we're building for production (npm run build
    // instead of npm run dev), minify
    terserPlugin
  ],
  watch: {
    clearScreen: false
  }
};

export default [
  {
    ...config,
    output: {
      ...config.output,
      file: 'public/js/site.min.js',
      format: 'umd'
    },
    plugins: [...config.plugins, babel()]
  }
];

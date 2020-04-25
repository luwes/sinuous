/* eslint-env node */
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        loose: true,
        targets: {
          browsers: ['ie >= 11']
        }
      }
    ]
  ],
  plugins: [
    ['babel-plugin-transform-async-to-promises'],
    ['sinuous/babel-plugin-htm', {
      import: 'sinuous/hydrate',
      pragma: 'd',
      tag: 'dhtml'
    }, 'for hydrate'],
    ['sinuous/babel-plugin-htm', {
      import: 'sinuous'
    }],
  ],
};

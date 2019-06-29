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
    ['htm'],
    ['@babel/plugin-transform-object-assign'],
    ['@babel/plugin-proposal-object-rest-spread', { 'loose': true }]
  ],
};

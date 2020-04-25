const purgecss = require('@fullhuman/postcss-purgecss');
const plugins = [
  require('postcss-import'),
  require('tailwindcss'),
];

if (process.env.NODE_ENV === 'prod') {
  plugins.push(
    require('autoprefixer'),
    purgecss({
      content: ['./public/**/*.{html,js}'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }),
    require('cssnano'),
  );
}

module.exports = {
  syntax: 'postcss-scss',
  plugins
};

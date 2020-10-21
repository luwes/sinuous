module.exports = {
  sourceType: 'module',
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc']
  },
  files: 'packages/*/src/**/*.js',
  plugins: ['plugins/markdown'],
  templates: {
    cleverLinks: false,
    monospaceLinks: true,
    useLongnameInNav: false,
    showInheritedInNav: true
  },
  opts: {
    destination: './docs/',
    encoding: 'utf8',
    private: true,
    recurse: true
  },
  // jsdoc2md
  'heading-depth': 3,
  'name-format': false,
  'separators': true,
  'global-index-format': 'grouped',
  'member-index-format': 'grouped',
  'module-index-format': 'grouped',
  'param-list-format': 'table',
  'property-list-format': 'table',
};

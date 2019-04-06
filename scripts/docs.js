const fs = require('fs-extra');
const path = require('path');
const jsdoc2md = require('jsdoc-to-markdown');
const c = require('ansi-colors');

const sources = [
  {
    cwd: '',
    files: 'packages/*/src/sinuous.js',
    config: 'jsdoc.config.js',
    output: 'README.md'
  }
];

async function run() {
  for (const s of sources) {
    await addDocsAfterHeader(s);
  }
}

async function addDocsAfterHeader({
  cwd,
  config,
  files,
  output,
  header = '# API'
}) {
  const p = createCwd(cwd);

  const jsdocConfig = getJsdocConfig(cwd, config, files);
  const docs = await jsdoc2md.render(jsdocConfig);

  try {
    // This replaces the `readme` section with the generated docs.
    // It replaces the token until the next ## header with the docs.
    let readmeFile = await fs.readFile(p(output), 'utf8');
    if (readmeFile) {
      // `[^]` matches any character, `.` doesn't include newlines.
      const regex = new RegExp(`${header}[^]*?^#\\s`, 'mig');
      readmeFile = readmeFile.replace(regex, `${header}\n\n${docs}# `);
      await fs.writeFile(p(output), readmeFile);
    }
  } catch (error) {
    console.log(`${c.bgRed.black(' OH NOES! ')} ${error}\n`);
  }
}

function createCwd(cwd) {
  return strings => {
    strings = [].concat(strings);
    return path.join(cwd, ...strings);
  };
}

function getJsdocConfig(cwd, config, files) {
  const p = createCwd(cwd);
  const c = require(path.resolve(config));
  c.files = (files && [].concat(files).map(p)) || c.files;
  return c;
}

run();

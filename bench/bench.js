const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const semver = require('semver');
const minimist = require('minimist');
const lodash = require('lodash');

const db = require('./db.js');
const { benchmarks } = require('./benchmarks.js');
const u = require('./utils.js');

const argv = minimist(process.argv.slice(2), {
  default: {
    count: 3,
    lib: null
  }
});

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const libs = (await fs.readdir('./libs'))
    .filter(name => name !== '.DS_Store')
    .filter(name => !argv.lib || name === argv.lib);

  const getRandomBench = u.randomNoRepeats(u.pairwise(libs, benchmarks));

  // eslint-disable-next-line
  for (let i of new Array(argv.count * libs.length * benchmarks.length)) {
    const [lib, createBench] = getRandomBench();
    await page.goto(`http://localhost:81/libs/${lib}`);
    await page.waitFor(100);

    const bench = await createBench(page, lib);
    const value = await bench.run();

    const pkg = require(`./libs/${lib}/package.json`);
    const version = lodash.get(pkg, `dependencies.${lib}`);
    const id = lib + (version ? '-' + semver.coerce(version).version : '');

    await db.saveMetrics(id, bench.id, value);
  }

  await db.writeMetrics();
  await browser.close();
}

process.on('unhandledRejection', error => {
  console.error(error);
});

run();

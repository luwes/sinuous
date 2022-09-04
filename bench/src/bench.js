const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const semver = require('semver');
const minimist = require('minimist');
const _ = require('lodash');

const db = require('./db.js');
const { benchmarks } = require('./benchmarks.js');
const u = require('./utils.js');

const argv = minimist(process.argv.slice(2), {
  default: {
    count: 3,
    lib: null,
    overwrite: null,
  },
});

async function run() {
  if (argv.overwrite) {
    const ids = argv.overwrite.split(',');
    for (let id of ids) {
      await db.deleteMetrics(id);
    }
  }

  const headless = true;
  const args = [
    '--js-flags=--expose-gc',
    '--enable-precise-memory-info',
    '--no-first-run',
    '--enable-automation',
    '--disable-infobars',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-cache',
    '--disable-translate',
    '--disable-sync',
    '--disable-extensions',
    '--disable-default-apps',
    // "--remote-debugging-port=" + (benchmarkOptions.remoteDebuggingPort).toFixed(),
    '--window-size=1200,800',
  ];

  if (headless) {
    args.push('--headless');
    // https://bugs.chromium.org/p/chromium/issues/detail?id=737678
    args.push('--disable-gpu');
    args.push('--no-sandbox');
  }

  const browser = await puppeteer.launch({
    headless,
    args,
    defaultViewport: {
      width: 1200,
      height: 800,
    },
  });

  const page = await browser.newPage();
  const libs = (await fs.readdir('./libs'))
    .filter((name) => name !== '.DS_Store')
    .filter((name) => !argv.lib || name === argv.lib);

  const getRandomBench = u.randomNoRepeats(u.pairwise(libs, benchmarks));

  // eslint-disable-next-line
  for (let i of new Array(argv.count * libs.length * benchmarks.length)) {
    const [lib, createBench] = getRandomBench();
    await page.goto(`http://localhost:8000/libs/${lib}`, {
      waitUntil: 'load',
    });

    const bench = await createBench(page, lib);
    const value = await bench.run();

    const pkg = require(`../libs/${lib}/package.json`);
    const version = _.get(pkg, `dependencies.${lib}`);
    const id = lib + (version ? '-' + semver.coerce(version).version : '');

    await db.saveMetrics(id, bench.id, value);
  }

  await db.writeMetrics();
  await browser.close();
}

process.on('unhandledRejection', (error) => {
  console.error(error);
});

run();

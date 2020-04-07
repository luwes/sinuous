const path = require('path');
const gzipSize = require('gzip-size');
const u = require('./utils.js');
const {
  metrics,
  testTextContains,
  getTextByXPath,
  clickElementByXPath,
  testClassContains
} = u;

const WARMUP_COUNT = 5;

async function benchBundleSize(page, lib) {
  const options = {
    lib,
    id: '00_bundlesize',
    label: 'measure bundle size'
  };

  async function run() {
    return gzipSize.file(path.resolve(`./libs/${lib}/dist/main.js`));
  }

  return Object.assign(options, { run });
}

async function benchRun(page, lib) {
  const options = {
    lib,
    id: '01_run1k',
    label: 'create 1000 rows'
  };

  async function run() {
    await page.waitForSelector('#add');

    const result = await metrics(page, options, async () => {
      await page.click('#add');
      await page.waitForXPath('//tbody/tr[1000]/td[2]/a');
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchReplaceAll(page, lib) {
  const options = {
    lib,
    id: '02_replace1k',
    label: 'replace all rows'
  };

  await page.waitForSelector('#run');

  for (let i = 0; i < WARMUP_COUNT; i++) {
    await page.click('#run');
    await testTextContains(
      page,
      '//tbody/tr[1]/td[1]',
      (i * 1000 + 1).toString()
    );
  }

  async function run() {
    const result = await metrics(page, options, async () => {
      await page.click('#run');
      await testTextContains(page, '//tbody/tr[1]/td[1]', `${WARMUP_COUNT}001`);
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchUpdate(page, lib) {
  const options = {
    lib,
    id: '03_update10th1k_x16',
    label: 'partial update',
    throttleCPU: 16
  };

  await page.waitForSelector('#run');
  await page.click('#run');
  await page.waitForXPath('//tbody/tr[1000]/td[2]/a');
  for (let i = 0; i < 3; i++) {
    await page.click('#update');
    await testTextContains(
      page,
      '//tbody/tr[991]/td[2]/a',
      ' !!!'.repeat(i + 1)
    );
  }

  async function run() {
    const result = await metrics(page, options, async () => {
      await page.click('#update');
      await testTextContains(
        page,
        '//tbody/tr[991]/td[2]/a',
        ' !!!'.repeat(3 + 1)
      );
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchSelect(page, lib) {
  const options = {
    lib,
    id: '04_select1k',
    label: 'select row',
    throttleCPU: 16
  };

  await page.waitForSelector('#run');
  await page.click('#run');
  await page.waitForXPath('//tbody/tr[1]/td[2]/a');
  for (let i = 0; i < WARMUP_COUNT; i++) {
    await clickElementByXPath(page, `//tbody/tr[${i + 1}]/td[2]/a`);
  }

  async function run() {
    const result = await metrics(page, options, async () => {
      await clickElementByXPath(page, `//tbody/tr[2]/td[2]/a`);
      await testClassContains(page, "//tbody/tr[2]", "danger");
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchSwapRows(page, lib) {
  const options = {
    lib,
    id: '05_swap1k',
    label: 'swap rows',
    throttleCPU: 4
  };

  await page.waitForSelector('#run');
  await page.click('#run');
  await page.waitForXPath('//tbody/tr[1]/td[2]/a');
  for (let i = 0; i < WARMUP_COUNT; i++) {
    let text = await getTextByXPath(page, '//tbody/tr[2]/td[2]/a');
    await page.click('#swaprows');
    await testTextContains(page, '//tbody/tr[999]/td[2]/a', text);
  }

  async function run() {
    const result = await metrics(page, options, async () => {
      let text = await getTextByXPath(page, '//tbody/tr[2]/td[2]/a');
      await page.click('#swaprows');
      await testTextContains(page, '//tbody/tr[999]/td[2]/a', text);
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchRemove(page, lib) {
  const options = {
    lib,
    id: '06_remove-one-1k',
    label: 'remove row'
  };

  await page.waitForSelector('#run');
  await page.click('#run');
  await page.waitForXPath("//tbody/tr[1]/td[2]/a");
  for (let i = 0; i < WARMUP_COUNT; i++) {
    await testTextContains(page, `//tbody/tr[${WARMUP_COUNT - i + 4}]/td[1]`, (WARMUP_COUNT - i + 4).toString());
    await clickElementByXPath(page, `//tbody/tr[${WARMUP_COUNT - i + 4}]/td[3]/a/span[1]`);
    await testTextContains(page, `//tbody/tr[${WARMUP_COUNT - i + 4}]/td[1]`, '10');
  }
  await testTextContains(page, '//tbody/tr[5]/td[1]', '10');
  await testTextContains(page, '//tbody/tr[4]/td[1]', '4');

  async function run() {
    const result = await metrics(page, options, async () => {
      await clickElementByXPath(page, "//tbody/tr[4]/td[3]/a/span[1]");
      await testTextContains(page, '//tbody/tr[4]/td[1]', '10');
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchRunBig(page, lib) {
  const options = {
    lib,
    id: '07_create10k',
    label: 'create 10,000 rows'
  };

  async function run() {
    await page.waitForSelector('#runlots');

    const result = await metrics(page, options, async () => {
      await page.click('#runlots');
      await page.waitForXPath('//tbody/tr[10000]/td[2]/a');
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchAppendToManyRows(page, lib) {
  const options = {
    lib,
    id: '08_create1k-after1k_x2',
    label: 'append rows to large table',
    throttleCPU: 2
  };

  await page.waitForSelector('#run');
  await page.click('#run');
  await page.waitForXPath('//tbody/tr[1000]/td[2]/a');

  async function run() {
    const result = await metrics(page, options, async () => {
      await page.click('#add');
      await page.waitForXPath('//tbody/tr[1100]/td[2]/a');
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

async function benchClear(page, lib) {
  const options = {
    lib,
    id: '09_clear1k_x8',
    label: 'clear rows',
    throttleCPU: 8
  };

  await page.waitForSelector('#run');
  await page.click('#run');
  await page.waitForXPath('//tbody/tr[1000]/td[2]/a');

  async function run() {
    const result = await metrics(page, options, async () => {
      await page.click('#clear');
      await page.waitForXPath('//tbody/tr[1]', { hidden: true });
    });
    return result.time;
  }

  return Object.assign(options, { run });
}

module.exports = {
  benchmarks: [
    benchBundleSize,
    benchRun,
    benchReplaceAll,
    benchUpdate,
    benchSelect,
    benchSwapRows,
    benchRemove,
    benchRunBig,
    benchAppendToManyRows,
    benchClear
  ]
};

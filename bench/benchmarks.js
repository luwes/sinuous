const path = require('path');
const gzipSize = require('gzip-size');
const u = require('./utils.js');

async function benchBundleSize(page, lib) {
  const options = {
    id: '00_bundlesize',
    label: 'measure bundle size'
  };

  async function run() {
    return gzipSize.file(path.resolve(`./libs/${lib}/dist/main.js`));
  }

  return {
    ...options,
    run
  };
}

async function benchRun(page) {
  const options = {
    id: '01_run1k',
    label: 'create 1000 rows'
  };

  async function run() {
    const metrics = await u.metrics(page, async () => {
      page.click('#add');
      await page.waitForXPath('//tbody/tr[1000]/td[2]/a');
    });
    return metrics.time;
  }

  return {
    ...options,
    run
  };
}

async function benchReplaceAll(page) {
  const options = {
    id: '02_replace1k',
    label: 'replace all rows'
  };

  for (let i = 0; i < 5; i++) {
    page.click('#run');
    await u.testTextContains(
      page,
      '//tbody/tr[1]/td[1]',
      (i * 1000 + 1).toString()
    );
  }

  async function run() {
    const metrics = await u.metrics(page, async () => {
      page.click('#run');
      await u.testTextContains(page, '//tbody/tr[1]/td[1]', '5001');
    });
    return metrics.time;
  }

  return {
    ...options,
    run
  };
}

async function benchSwapRows(page) {
  const options = {
    id: '05_swap1k',
    label: 'swap rows'
  };

  page.click('#run');
  await page.waitForXPath('//tbody/tr[1]/td[2]/a');
  for (let i = 0; i < 5; i++) {
    let text = await u.getTextByXPath(page, '//tbody/tr[2]/td[2]/a');
    page.click('#swaprows');
    await u.testTextContains(page, '//tbody/tr[999]/td[2]/a', text);
  }

  async function run() {
    const metrics = await u.metrics(page, async () => {
      let text = await u.getTextByXPath(page, '//tbody/tr[2]/td[2]/a');
      page.click('#swaprows');
      await u.testTextContains(page, '//tbody/tr[999]/td[2]/a', text);
    });
    return metrics.time;
  }

  return {
    ...options,
    run
  };
}

module.exports = {
  benchmarks: [benchBundleSize, benchRun, benchReplaceAll, benchSwapRows]
};

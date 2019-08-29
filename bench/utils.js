async function performance(page) {
  try {
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );

    return extractDataFromPerformanceTiming(
      performanceTiming,
      'responseEnd',
      'domInteractive',
      'domContentLoadedEventEnd',
      'loadEventEnd'
    );
  } catch (err) {
    console.error(err);
  }
}

const extractDataFromPerformanceTiming = (timing, ...dataNames) => {
  const navigationStart = timing.navigationStart;
  const extractedData = {};
  dataNames.forEach(name => {
    extractedData[name] = timing[name] - navigationStart;
  });
  return extractedData;
};

async function metrics(page, bench, testFunction) {
  try {
    await page._client.send('Performance.enable');
    await page._client.send('HeapProfiler.collectGarbage');

    await page.tracing.start({ path: 'trace.json' });

    if (bench.throttleCPU) {
      await page._client.send('Emulation.setCPUThrottlingRate', {
        rate: bench.throttleCPU
      });
    }
    await page.evaluate(() => console.timeStamp('runBenchmark'));

    await testFunction.apply(null, arguments);

    if (bench.throttleCPU) {
      await page._client.send('Emulation.setCPUThrottlingRate', {
        rate: 1
      });
    }
    await page.evaluate(() => console.timeStamp('finishBenchmark'));

    await page.waitFor(100);
    await page.evaluate(() => console.timeStamp('afterBenchmark'));

    await page.waitFor(100);
    const trace = JSON.parse((await page.tracing.stop()).toString());
    const time = getLastPaint(trace) - getClickBeforePaint(trace);

    return {
      time
    };
  } catch (err) {
    console.error(err);
  }
}

// const getTimestamp = (trace, msg) =>
//   trace.traceEvents.find(x => {
//     return x.name === 'TimeStamp' && x.args.data.message === msg;
//   }).ts / 1000;

const getClickBeforePaint = (trace) => {
  const evts = trace.traceEvents.filter(x => {
    return x.name === 'EventDispatch' && x.args.data.type === 'click';
  });

  const paint = getLastPaint(trace);
  let ts;
  do {
    ts = evts.pop().ts / 1000;
  } while (ts > paint && evts.length);

  return ts;
};

const getLastPaint = (trace) => {
  const evts = trace.traceEvents.filter(x => x.name === 'Paint');
  const evt = evts[evts.length - 1];
  return (evt.ts + evt.dur) / 1000;
};

function randomNoRepeats(array) {
  var copy = array.slice(0);
  return function() {
    if (copy.length < 1) {
      copy = array.slice(0);
    }
    var index = Math.floor(Math.random() * copy.length);
    var item = copy[index];
    copy.splice(index, 1);
    return item;
  };
}

function pairwise(a, b) {
  var pairs = [];
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++) {
      pairs.push([a[i], b[j]]);
    }
  }
  return pairs;
}

async function testTextContains(page, path, value) {
  const elHandle = await page.waitForXPath(path);
  return page.waitFor(
    (el, value) => el && el.textContent.includes(value),
    {},
    elHandle,
    value
  );
}

async function getTextByXPath(page, path) {
  const elHandle = await page.waitForXPath(path);
  return page.evaluate(el => el && el.textContent, elHandle);
}

async function clickElementByXPath(page, path) {
  const elHandle = await page.waitForXPath(path);
  return page.evaluate(el => el && el.click(), elHandle);
}

async function testClassContains(page, path, value) {
  const elHandle = await page.waitForXPath(path);
  return page.evaluate(
    (el, value) => el && el.className.includes(value),
    elHandle,
    value
  );
}

module.exports = {
  performance,
  metrics,
  randomNoRepeats,
  pairwise,
  testTextContains,
  getTextByXPath,
  clickElementByXPath,
  testClassContains
};

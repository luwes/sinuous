const { splitWhen } = require('ramda');

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
    await page.tracing.start({ path: 'trace.json' });

    await page.evaluate(() => console.timeStamp('initBenchmark'));

    let client;
    if (bench.throttleCPU) {
      client = await page.target().createCDPSession();
      await client.send('Emulation.setCPUThrottlingRate', {
        rate: bench.throttleCPU
      });
    }

    await page.evaluate(() => console.timeStamp('runBenchmark'));

    await testFunction.apply(null, arguments);

    if (bench.throttleCPU) {
      await client.send('Emulation.setCPUThrottlingRate', {
        rate: 1
      });
    }

    // Wait a little so the paint event is traced.
    await page.waitFor(100);
    await page.evaluate(() => console.timeStamp('finishBenchmark'));

    const trace = JSON.parse((await page.tracing.stop()).toString());
    const events = getBenchEventsWindow(trace.traceEvents);
    const duration = getLastPaint(events) - getFirstClick(events);

    console.log('***', bench.lib.padEnd(10), bench.id.padEnd(23), duration);
    if (duration < 0) {
      console.log('soundness check failed. reported duration is less than 0');
      throw 'soundness check failed. reported duration is less than 0';
    }

    return {
      time: duration
    };
  } catch (err) {
    console.error(err);
  }
}

function getBenchEventsWindow(events) {
  events = splitWhen(x => {
    return x.name === 'TimeStamp' && x.args.data.message === 'runBenchmark';
  }, events);

  events = splitWhen(x => {
    return x.name === 'TimeStamp' && x.args.data.message === 'finishBenchmark';
  }, events[1]);

  return events[0];
}

// const getTimestamp = (trace, msg) =>
//   trace.traceEvents.find(x => {
//     return x.name === 'TimeStamp' && x.args.data.message === msg;
//   }).ts / 1000;

const getFirstClick = events => {
  const clicks = events.filter(x => {
    return x.name === 'EventDispatch' && x.args.data.type === 'click';
  });
  if (clicks.length !== 1) {
    console.log('exactly one click event is expected', events);
    throw 'exactly one click event is expected';
  }
  return clicks[0].ts / 1000;
};

const getLastPaint = events => {
  const paints = events
    .filter(x => x.name === 'Paint')
    .map(x => ({ end: x.ts + x.dur }));
  let lastPaint = paints.reduce(
    (max, elem) => (max.end > elem.end ? max : elem),
    { end: 0 }
  );
  return lastPaint.end / 1000;
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

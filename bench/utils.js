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

async function metrics(page, testFunction) {
  try {
    await page._client.send('Performance.enable');

    // await client.send('HeapProfiler.collectGarbage');
    const start = await page._client.send('Performance.getMetrics');

    // console.time('metric');
    await testFunction.apply(null, arguments);
    //console.timeEnd('metric');

    // await client.send('HeapProfiler.collectGarbage');
    const end = await page._client.send('Performance.getMetrics');
    const time = getMetric(end, 'Timestamp') - getMetric(start, 'Timestamp');

    return {
      time
    };
  } catch (err) {
    console.error(err);
  }
}

const getMetric = (metrics, name) =>
  metrics.metrics.find(x => x.name === name).value * 1000;

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
  return page.waitFor(
    (path, value) => {
      function getElementByXpath(path) {
        return document.evaluate(
          path,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
      }
      const element = getElementByXpath(path);
      return element && element.textContent === value;
    },
    {},
    path,
    value
  );
}

async function getTextByXPath(page, path) {
  return page.evaluate((path) => {
    function getElementByXpath(path) {
      return document.evaluate(
        path,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    }
    const element = getElementByXpath(path);
    return element && element.textContent;
  }, path);
}

module.exports = {
  performance,
  metrics,
  randomNoRepeats,
  pairwise,
  testTextContains,
  getTextByXPath
};

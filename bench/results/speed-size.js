/* global Plotly */
import ColorHash from 'color-hash';
import { o } from 'sinuous';
import { computed, subscribe } from 'sinuous/observable';
import { hydrate, dhtml } from 'sinuous/hydrate';
import { colors, getId, getName } from './helpers.js';
import { median, getOutlierThresholds, unique } from './utils.js';

const url = o(
  'https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts/results.json'
);
const results = o([]);
const selected = o('#all');
const removeOutliers = o(true);
const benchmarks = computed(() =>
  unique(results().map(r => r.benchmark))
    .sort()
    .slice(0, 9)
);
const isLoading = o(false);

function init() {
  subscribe(loadResults);

  document.querySelectorAll('.filter-list a').forEach(node => {
    hydrate(dhtml`
      <a class=${() => (node.href.includes(selected()) ? 'is-active' : '')} />
    `, node);
  });

  hydrate(
    dhtml`<input oninput=${checkOutliers} />`,
    document.querySelector('.outlier-check')
  );

  subscribe(plotResults);

  window.addEventListener('hashchange', function() {
    if (location.hash) selected(location.hash);
  });
  if (location.hash) selected(location.hash);
}

function checkOutliers(e) {
  removeOutliers(e.target.checked);
}

async function loadResults() {
  isLoading(true);

  const response = await fetch(url());
  const json = await response.json();
  // krausest/js-framework-benchmark has a top level array.
  results(Array.isArray(json) ? json : json.results);

  isLoading(false);
}

function plotResults() {
  const mins = benchmarks().reduce((mins, b) => {
    mins[b] = results()
      .filter(result => !getId(result).includes('non-keyed'))
      .filter(result => result.benchmark === b)
      .sort((a, b) => {
        return median(a.values) > median(b.values) ? 1 : -1;
      })[0];
    return mins;
  }, {});

  let perfLibs = results()
    .filter(r => r.benchmark.startsWith('0') || r.benchmark.startsWith('34_'))
    .filter(r => !getId(r).includes('non-keyed'))
    .reduce((libs, r) => {
      const lib = (libs[r.framework] = libs[r.framework] || {
        framework: r.framework,
        results: []
      });
      if (r.benchmark.startsWith('0')) {
        lib.results.push(r);
      } else if (r.benchmark.startsWith('34_')) {
        lib.totalbytes = r.values[0];
      }
      return libs;
    }, []);

  perfLibs = Object.values(perfLibs)
    .map(lib => {
      const slowdownTotal = lib.results.reduce((total, b) => {
        return total + median(b.values) / median(mins[b.benchmark].values);
      }, 0);
      return {
        ...lib,
        slowdown: slowdownTotal / lib.results.length
      };
    })
    .sort((a, b) => a.slowdown - b.slowdown);

  const allTotalBytes = perfLibs.map(lib => lib.totalbytes);
  const { max } = getOutlierThresholds(allTotalBytes);
  if (removeOutliers()) {
    perfLibs = perfLibs.filter(lib => lib.totalbytes < max);
  }

  const cap = selected().match(/\d+/);
  if (cap) {
    perfLibs = perfLibs.slice(0, parseInt(cap[0]));
  }

  console.log(perfLibs);

  const data = perfLibs.map(lib => {
    return {
      name: getId(lib),
      // text: getName(lib),
      marker: { color: colors[getName(lib)] || new ColorHash().hex(getName(lib)) },
      x: [100 / lib.slowdown],
      y: [lib.totalbytes],
      mode: 'markers',
      type: 'scatter'
    };
  });

  // const upperLimitY = Math.max(...perfLibs.map(lib => lib.totalbytes));
  const layout = {
    title: 'Speed x Size',
    height: 650,
    xaxis: {
      title: '100 / avg. slowdown (higher is better)'
    },
    yaxis: {
      title: 'Size in bytes',
      autorange: 'reversed'
      // range: [upperLimitY + 50, 0]
    }
  };

  Plotly.newPlot('speed-size', data, layout, { responsive: true });
}

init();

/* global Plotly */
import { o, h } from 'sinuous';
import { subscribe, computed } from 'sinuous/observable';
import { hydrate, h as hy } from 'sinuous/hydrate';
import { colors, getId, getName, defaultBenchmarks } from './helpers.js';
import { median, unique } from './utils.js';

const url = o(document.querySelector('.load-input').value);
const results = o([]);
const selected = o('#10-fastest');
const benchmarks = computed(() => {
  const bs = results().map((result) => result.benchmark);
  return unique(bs.length ? bs : defaultBenchmarks).sort();
});
const isLoading = o(false);

function init() {
  // Paritial attributes would be awesome.
  const delta = tree`
    <div>
      <div class="${() => 'select is-small' + (isLoading() ? ' is-loading' : '')}">
        <select onchange="${(e) => url(e.target.value)}" />
      </div>
    </div>
  `;
  hydrate(delta, document.querySelector('.select-bench'));

  document.querySelectorAll('.filter-list a').forEach(node => {
    hydrate(tree`
      <a class=${() => (node.href.includes(selected()) ? 'is-active' : '')} />
    `, node);
  });

  subscribe(loadResults);

  document.querySelector('.benchmarks-list').append(html`
    ${() => benchmarks().map((benchmark) => html`
      <li><a onclick=${scrollTo} href="#${benchmark}">${benchmark}</a></li>
    `)}
  `);

  document.querySelector('.results').append(html`
    ${() => benchmarks().map((benchmark) => html`
      <div class="benchmark is-12 column">
        <div id=${benchmark}></div>
      </div>
    `)}
  `);

  subscribe(plotResults);

  window.addEventListener('hashchange', function() {
    if (location.hash) selected(location.hash);
  });
  if (location.hash) selected(location.hash);
}

function scrollTo(e) {
  e.preventDefault();
  document.getElementById(e.target.href.split('#')[1]).scrollIntoView({
    behavior: 'smooth'
  });
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
  benchmarks().forEach(benchmark => {
    let libs = results()
      .filter(result => !getId(result).includes('non-keyed'))
      .filter(result => result.benchmark === benchmark)
      .sort((a, b) => {
        return median(a.values) > median(b.values) ? 1 : -1;
      });

    const cap = selected().match(/\d+/);
    if (cap) {
      libs = libs.slice(0, parseInt(cap[0]));
    }

    let allValues = [];
    const data = libs.map(lib => {
      allValues = allValues.concat(lib.values);
      return {
        name: getId(lib),
        marker: { color: colors[getName(lib)] },
        y: lib.values,
        type: 'box'
      };
    });

    const layout = {
      title: benchmark,
      yaxis: {
        title: 'Duration in ms (lower is better)',
        range: [0, Math.max(...allValues)]
      }
    };

    Plotly.newPlot(benchmark, data, layout, { responsive: true });
  });
}

init();

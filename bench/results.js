/* global Plotly */
import { o, html } from 'https://unpkg.com/sinuous@0.15.0/module/sinuous.js';
import { S } from 'https://unpkg.com/sinuous@0.15.0/module/observable.js';
import { hydrate, html as tree, _ } from 'https://unpkg.com/sinuous@0.15.0/module/hydrate.js';

const url = o('./results.json');
const results = o([]);
const benchmarks = S(() => {
  return [...new Set(results().map((result) => result.benchmark))].sort();
});
const isLoading = o(false);

function init() {
  // Paritial attributes would be awesome.
  const delta = tree`
    <div>
      <div class="${() => 'select is-small' + (isLoading() ? ' is-loading' : '')}">
        <select onchange="${(e) => url(e.target.value)}">
          ${_}
        </select>
      </div>
    </div>
  `;
  hydrate(delta, document.querySelector('.select-bench'));

  S(loadResults);

  document.querySelector('.benchmarks-list').append(html`
    ${() => benchmarks().map((benchmark) => html`
      <li><a href="#${benchmark}">${benchmark}</a></li>
    `)}
  `);

  document.querySelector('.results').append(html`
    ${() => benchmarks().map((benchmark) => html`
      <div class="benchmark is-12 column">
        <div id=${benchmark}></div>
      </div>
    `)}
  `);

  S(plotResults);
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
  const colors = {
    vanillajs: '#FFDD57',
    sinuous: '#70EDAC',
    react: '#61DAFB'
  };

  benchmarks().forEach(benchmark => {
    const libs = results()
      .filter(result => !getId(result).includes('non-keyed'))
      .filter(result => result.benchmark === benchmark)
      .sort((a, b) => {
        return median(a.values) > median(b.values) ? 1 : -1;
      })
      .slice(0, 10);

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
        range: [0, Math.max(...allValues)]
      }
    };

    Plotly.newPlot(benchmark, data, layout);
  });
}

init();


function getId(lib) {
  // krausest/js-framework-benchmark uses `framework`.
  return lib.id || lib.framework;
}

function getName(lib) {
  return getId(lib).split('-')[0];
}

function median(values){
  if(values.length ===0) return 0;

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

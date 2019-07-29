/* global Plotly, sinuous, observable */
const { o, html } = sinuous;
const { S } = observable;

const url = o('./results.json');
const results = o([]);
const benchmarks = S(() => {
  return [...new Set(results().map((result) => result.benchmark))].sort();
});

function init() {
  S(loadResults);

  document.querySelector('.load-form').addEventListener('submit', (e) => {
    e.preventDefault();
    url(document.querySelector('.load-input').value);
  });

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
  document.querySelector('.load-input').value = url();

  const response = await fetch(url());
  const json = await response.json();
  // krausest/js-framework-benchmark has a top level array.
  results(Array.isArray(json) ? json : json.results);
}

function plotResults() {
  benchmarks().forEach(benchmark => {
    const libs = results()
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

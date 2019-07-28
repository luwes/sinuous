/* global Plotly, sinuous */
const { html } = sinuous;

(async function() {

const config = {
  libs: {
    sinuous: {
      color: '#78FFB9'
    },
    vanillajs: {
      color: '#F0DB4F'
    },
    react: {
      color: '#61DAFB'
    }
  }
};

const response = await fetch('./results.json');
const json = await response.json();
const benchmarks = [
  ...new Set(json.results.map((result) => result.benchmark))
].sort();

document.querySelector('.results').append(html`
  ${benchmarks.map((benchmark) => html`
    <div class="benchmark is-6 column">
      <div id=${benchmark}></div>
    </div>
  `)}
`);

benchmarks.forEach(benchmark => {
  const libs = json.results
    .filter(result => result.benchmark === benchmark)
    .sort((a, b) => {
      return a.id < b.id ? 1 : -1;
    });

  let allValues = [];
  const data = libs.map(lib => {
    allValues = allValues.concat(lib.values);
    return {
      name: lib.id,
      y: lib.values,
      type: 'box'
    };
  });

  const layout = {
    title: benchmark,
    colorway: libs.map(lib => config.libs[lib.id.split('-')[0]].color),
    yaxis: {
      range: [0, Math.max(...allValues)]
    }
  };

  Plotly.newPlot(benchmark, data, layout);
});


})(); // end async function

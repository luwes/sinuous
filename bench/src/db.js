const _ = require('lodash');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
var jStat = require('jstat').jStat;

let db;
let results;
let runner;

async function run() {
  db = await low(new FileAsync('results/results.json'));
  // Set some defaults (required if your JSON file is empty)
  await db.defaults({ results: [] }).value();

  results = await db.get('results', []);
}

async function deleteMetrics(id) {
  await runner;

  results
    .filter({ id })
    .each((bench) => (bench.values = []))
    .value();
}

async function saveMetrics(id, benchmark, value) {
  let result = results.find({ id, benchmark });
  if (!result.value()) {
    results
      .push({
        id,
        benchmark,
        values: [],
      })
      .value();
  }

  result = results.find({ id, benchmark });
  result.get('values').push(_.round(value, 3)).value();

  const values = result.get('values').value();

  const s = jStat(values);
  result
    .set('min', s.min())
    .set('max', s.max())
    .set('mean', s.mean())
    .set('median', s.median())
    .set('geometricMean', s.geomean())
    .set('standardDeviation', s.stdev(true))
    .value();
}

async function writeMetrics() {
  await results.write();
}

runner = run();

module.exports = {
  deleteMetrics,
  saveMetrics,
  writeMetrics,
};

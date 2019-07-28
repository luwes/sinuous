const lodash = require('lodash');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

let db;
let results;

async function run() {
  db = await low(new FileAsync('results.json'));
  // Set some defaults (required if your JSON file is empty)
  await db
    .defaults({ results: [] })
    .value();

  results = await db.get('results', []);
}

async function saveMetrics(id, benchmark, value) {
  let result = results.find({ id, benchmark });
  if (!result.value()) {
    result = results.push({
      id,
      benchmark,
      values: []
    })
    .value();
  }

  results.find({ id, benchmark })
    .get('values')
    .push(lodash.round(value, 3))
    .value();
}

async function writeMetrics() {
  await results.write();
}

run();

module.exports = {
  saveMetrics,
  writeMetrics
};

const gzipSize = require('gzip-size');
const prettyBytes = require('pretty-bytes');

module.exports = function(url) {
  return prettyBytes(gzipSize.fileSync(url));
};

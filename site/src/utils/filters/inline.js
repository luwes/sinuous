const fs = require('fs');

module.exports = function(url) {
  return fs.readFileSync(url);
};

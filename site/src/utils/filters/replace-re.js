
module.exports = function(value, a, b) {
  return value.replace(new RegExp(a), b);
};

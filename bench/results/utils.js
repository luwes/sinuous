
export function unique(arr) {
  return [...new Set(arr)];
}

export function median(values) {
  if (values.length === 0) return 0;

  values.sort(function(a, b) {
    return a - b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

export function getOutlierThresholds(someArray) {
  // Copy the values, rather than operating on references to existing values
  var values = someArray.concat().sort((a, b) => a - b);

  /* Then find a generous IQR. This is generous because if (values.length / 4)
   * is not an int, then really you should average the two elements on either
   * side to find q1.
   */
  var q1 = values[Math.floor(values.length / 4)];
  // Likewise for q3.
  var q3 = values[Math.ceil(values.length * (3 / 4))];
  var iqr = q3 - q1;

  // Then find min and max values
  var max = q3 + iqr * 1.5;
  var min = q1 - iqr * 1.5;

  return {
    max,
    min
  };
}

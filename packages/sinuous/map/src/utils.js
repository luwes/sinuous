import { GROUPING } from './map.js';

export function step(node, direction, inner) {
  const key = node[GROUPING];
  if (key) {
    node = node[direction];
    while (node && node[GROUPING] !== key) {
      node = node[direction];
    }
  }
  return inner ? node : node[direction];
}

export function removeNodes(parent, node, end) {
  let tmp;
  while (node !== end) {
    tmp = node.nextSibling;
    parent.removeChild(node);
    node = tmp;
  }
}

export function insertNodes(parent, node, end, target) {
  let tmp;
  while (node !== end) {
    tmp = node.nextSibling;
    parent.insertBefore(node, target);
    node = tmp;
  }
}

export function normalizeIncomingArray(normalized, array) {
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i];
    if (item instanceof Node) {
      if (item.nodeType === 11) {
        normalizeIncomingArray(normalized, item.childNodes);
      } else normalized.push(item);
      // matches null, undefined, true or false
    } else if (item == null || item === true || item === false) {
      // skip
    } else if (Array.isArray(item)) {
      normalizeIncomingArray(normalized, item);
    } else {
      normalized.push(document.createTextNode('' + item));
    }
  }
  return normalized;
}

// Picked from
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L368

// return an array of the indices of ns that comprise the longest increasing subsequence within ns
export function longestPositiveIncreasingSubsequence(ns, newStart) {
  var seq = [],
    is = [],
    l = -1,
    pre = new Array(ns.length);

  for (var i = newStart, len = ns.length; i < len; i++) {
    var n = ns[i];
    if (n < 0) continue;
    var j = findGreatestIndexLEQ(seq, n);
    if (j !== -1) pre[i] = is[j];
    if (j === l) {
      l++;
      seq[l] = n;
      is[l] = i;
    } else if (n < seq[j + 1]) {
      seq[j + 1] = n;
      is[j + 1] = i;
    }
  }

  for (i = is[l]; l >= 0; i = pre[i], l--) {
    seq[l] = i;
  }

  return seq;
}

export function findGreatestIndexLEQ(seq, n) {
  // invariant: lo is guaranteed to be index of a value <= n, hi to be >
  // therefore, they actually start out of range: (-1, last + 1)
  var lo = -1,
    hi = seq.length;

  // fast path for simple increasing sequences
  if (hi > 0 && seq[hi - 1] <= n) return hi - 1;

  while (hi - lo > 1) {
    var mid = Math.floor((lo + hi) / 2);
    if (seq[mid] > n) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return lo;
}


export function diff(parent, a, b, get, before) {
  const aIdx = new Map();
  const bIdx = new Map();
  let i;
  let j;

  // Create a mapping from keys to their position in the old list
  for (i = 0; i < a.length; i++) {
    aIdx.set(a[i], i);
  }

  // Create a mapping from keys to their position in the new list
  for (i = 0; i < b.length; i++) {
    bIdx.set(b[i], i);
  }

  for (i = j = 0; i !== a.length || j !== b.length;) {
    var aElm = a[i], bElm = b[j];
    if (aElm === null) {
      // This is a element that has been moved to earlier in the list
      i++;
    } else if (b.length <= j) {
      // No more elements in new, this is a delete
      parent.removeChild(get(a[i], -1));
      i++;
    } else if (a.length <= i) {
      // No more elements in old, this is an addition
      parent.insertBefore(get(bElm, 1), get(a[i], 0) || before);
      j++;
    } else if (aElm === bElm) {
      // No difference, we move on
      i++; j++;
    } else {
      // Look for the current element at this location in the new list
      // This gives us the idx of where this element should be
      var curElmInNew = bIdx.get(aElm);
      // Look for the the wanted elment at this location in the old list
      // This gives us the idx of where the wanted element is now
      var wantedElmInOld = aIdx.get(bElm);
      if (curElmInNew === undefined) {
        // Current element is not in new list, it has been removed
        parent.removeChild(get(a[i], -1));
        i++;
      } else if (wantedElmInOld === undefined) {
        // New element is not in old list, it has been added
        parent.insertBefore(
          get(bElm, 1),
          get(a[i], 0) || before
        );
        j++;
      } else {
        // Element is in both lists, it has been moved
        parent.insertBefore(
          get(a[wantedElmInOld], 1),
          get(a[i], 0) || before
        );
        a[wantedElmInOld] = null;
        if (wantedElmInOld > i + 1) i++;
        j++;
      }
    }
  }
  return b;
}

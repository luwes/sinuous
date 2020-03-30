import { api } from 'sinuous';

/* Adapted from S-array (https://github.com/adamhaile/S-array)
  The MIT License - Adam Haile */
/* Adapted from Solid (https://github.com/ryansolid/solid)
  The MIT License - Ryan Carniato */

export function mapArray(list, mapFn) {
  const { root, sample, cleanup } = api;

  let items = [],
    mapped = [],
    disposers = [],
    len = 0;

  cleanup(() => {
    for (let i = 0, length = disposers.length; i < length; i++) {
      disposers[i]();
    }
  });

  return () => {
    let newItems = list() || [],
      i,
      j;

    return sample(() => {
      let newLen = newItems.length,
        newIndices,
        newIndicesNext,
        temp,
        tempdisposers,
        start,
        end,
        newEnd,
        item;

      // fast path for empty arrays
      if (newLen === 0) {
        if (len !== 0) {
          for (i = 0; i < len; i++) disposers[i]();
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
        }
      }
      // fast path for new create
      else if (len === 0) {
        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = root(mapper);
        }
        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        // skip common prefix
        for (
          start = 0, end = Math.min(len, newLen);
          start < end && items[start] === newItems[start];
          start++
        );
        // common suffix
        for (
          end = len - 1, newEnd = newLen - 1;
          end >= start && newEnd >= start && items[end] === newItems[newEnd];
          end--, newEnd--
        ) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
        }
        // remove any remaining nodes and we're done
        if (start > newEnd) {
          for (j = end; start <= j; j--) disposers[j]();
          const rLen = end - start + 1;
          if (rLen > 0) {
            mapped.splice(start, rLen);
            disposers.splice(start, rLen);
          }
          items = newItems.slice(0);
          len = newLen;
          return mapped;
        }
        // insert any remaining updates and we're done
        if (start > end) {
          for (j = start; j <= newEnd; j++) mapped[j] = root(mapper);
          for (; j < newLen; j++) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
          }
          items = newItems.slice(0);
          len = newLen;
          return mapped;
        }
        // 0) prepare a map of all indices in newItems, scanning backwards so we encounter them in natural order
        newIndices = new Map();
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }
        // 1) step through all old items and see if they can be found in the new set; if so, save them in a temp array and mark them moved; if not, exit them
        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);
          if (j !== undefined && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }
        // 2) set all the new values, pulling from the temp array if copied, otherwise entering the new value
        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
          } else mapped[j] = root(mapper);
        }
        // 3) in case the new set is shorter than the old, set the length of the mapped array
        len = mapped.length = newLen;
        // 4) save a copy of the mapped items for the next update
        items = newItems.slice(0);
      }
      return mapped;
    });

    function mapper(disposer) {
      disposers[j] = disposer;
      return mapFn(newItems[j], j, newItems);
    }
  };
}

/* Adapted from List Difference - The MIT License - Simon Friis Vindum */
import { api } from 'sinuous';

export function map(items, expr) {
  const { subscribe, root, cleanup } = api;

  let parent = document.createDocumentFragment();
  const beforeNode = parent.appendChild(document.createTextNode(''));
  const afterNode = parent.appendChild(document.createTextNode(''));
  const disposers = new Map();

  function disposeAll() {
    disposers.forEach(d => d());
    disposers.clear();
  }

  function dispose(node) {
    let disposer = disposers.get(node);
    disposer && disposer();
    disposers.delete(node);
  }

  const unsubscribe = subscribe(a => {
    a = a || [];

    const b = items() || [];
    const aIdx = new Map();
    const bIdx = new Map();
    let i;
    let j;

    // When parent was a DocumentFragment, then items got appended to the DOM.
    parent = afterNode.parentNode;

    const childNodes = Array.from(parent.childNodes);
    const beforeNodeIndex = childNodes.indexOf(beforeNode);
    const afterNodeIndex = childNodes.indexOf(afterNode);

    // Optimization
    // const afterNodeIndex =
    //   childNodes.pop() === afterNode
    //     ? childNodes.length
    //     : EMPTY_ARR.indexOf.call(childNodes, afterNode);

    // Create a mapping from keys to their position in the old list
    for (i = 0; i < a.length; i++) {
      aIdx.set(a[i], i);
    }
    // Create a mapping from keys to their position in the new list
    for (i = 0; i < b.length; i++) {
      bIdx.set(b[i], i);
    }

    for (i = j = 0; i !== a.length || j !== b.length; ) {
      const aElm = a[i];
      const bElm = b[j];
      if (aElm === null) {
        // This is a element that has been moved to earlier in the list
        i++;
      } else if (b.length <= j) {
        // No more elements in new, this is a delete
        // opts.remove(i);
        dispose(parent.removeChild(getOriginalChild(i)));
        i++;
      } else if (a.length <= i) {
        // No more elements in old, this is an addition
        // opts.add(bElm, i);
        parent.insertBefore(create(bElm, j), getOriginalChild(i) || afterNode);
        j++;
      } else if (aElm === bElm) {
        // No difference, we move on
        i++;
        j++;
      } else {
        // Look for the current element at this location in the new list
        // This gives us the idx of where this element should be
        const curElmInNew = bIdx.get(aElm);
        // Look for the the wanted elment at this location in the old list
        // This gives us the idx of where the wanted element is now
        const wantedElmInOld = aIdx.get(bElm);
        if (curElmInNew === undefined) {
          // Current element is not in new list, it has been removed
          // opts.remove(i);
          dispose(parent.removeChild(getOriginalChild(i)));
          i++;
        } else if (wantedElmInOld === undefined) {
          // New element is not in old list, it has been added
          // opts.add(bElm, i);
          parent.insertBefore(
            create(bElm, j),
            getOriginalChild(i) || afterNode
          );
          j++;
        } else {
          // Element is in both lists, it has been moved
          // opts.move(wantedElmInOld, i);
          parent.insertBefore(
            getOriginalChild(wantedElmInOld),
            getOriginalChild(i) || afterNode
          );
          a[wantedElmInOld] = null;
          j++;
        }
      }
    }

    function getOriginalChild(index) {
      const i = beforeNodeIndex + index + 1;
      return i > beforeNodeIndex && i < afterNodeIndex && childNodes[i];
    }

    function create(item, i) {
      return root(disposeFn => {
        item = expr(item, i);
        item = item instanceof Node ? item : document.createTextNode(item);
        disposers.set(item, disposeFn);
        return item;
      });
    }

    return b.slice();
  });

  cleanup(unsubscribe);
  cleanup(disposeAll);

  return parent;
}

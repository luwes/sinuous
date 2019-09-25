/* Adapted from Stage0 - The MIT License - Pavel Martynov */
/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import { api } from 'sinuous';
import { FORWARD, BACKWARD } from './constants.js';
import {
  addNode,
  longestPositiveIncreasingSubsequence,
  insertNodes,
  removeNodes,
  step
} from './utils.js';

let groupCounter = 0;

export function map(items, expr, cleaning) {
  const { subscribe, root, sample, cleanup } = api;

  // Disable cleaning for templates by default.
  if (cleaning == null) cleaning = !expr.$t;

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

  function createFn(parent, item, i, data, afterNode) {
    // The root call makes it possible the child's computations outlive
    // their parents' update cycle.
    return cleaning ? root(disposeFn => {
      const node = addNode(
        parent,
        expr(item, i, data),
        afterNode,
        ++groupCounter
      );
      disposers.set(node, disposeFn);
      return node;
    }) : addNode(
      parent,
      expr(item, i, data),
      afterNode,
      ++groupCounter
    );
  }

  const unsubscribe = subscribe(a => {
    a = a || [];

    const b = items() || [];
    return sample(() =>
      reconcile(
        parent,
        a,
        b,
        beforeNode,
        afterNode,
        createFn,
        cleaning && disposeAll,
        cleaning && dispose
      )
    );
  });

  cleanup(unsubscribe);
  cleanup(disposeAll);

  return parent;
}

// This is almost straightforward implementation of reconcillation algorithm
// based on ivi documentation:
// https://github.com/localvoid/ivi/blob/2c81ead934b9128e092cc2a5ef2d3cabc73cb5dd/packages/ivi/src/vdom/implementation.ts#L1366
// With some fast paths from Surplus implementation:
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L86
// And working with data directly from Stage0:
// https://github.com/Freak613/stage0/blob/master/reconcile.js
// This implementation is tailored for fine grained change detection and adds support for fragments
export function reconcile(
  parent,
  a,
  b,
  beforeNode,
  afterNode,
  createFn,
  onClear,
  onRemove
) {
  // When parent was a DocumentFragment, then items got appended to the DOM.
  parent = afterNode.parentNode;

  let length = b.length;
  let i;

  // Fast path for clear
  if (length === 0) {
    if (!beforeNode.previousSibling && !afterNode.nextSibling) {
      parent.textContent = '';
      parent.appendChild(beforeNode);
      parent.appendChild(afterNode);
    } else {
      removeNodes(parent, beforeNode.nextSibling, afterNode);
    }

    onClear && onClear();
    return [];
  }

  // Fast path for create
  if (a.length === 0) {
    for (i = 0; i < length; i++) {
      createFn(parent, b[i], i, b, afterNode);
    }
    return b.slice();
  }

  let aStart = 0;
  let bStart = 0;
  let loop = true;
  let aEnd = a.length - 1;
  let bEnd = length - 1;
  let tmp;
  let aStartNode = beforeNode.nextSibling;
  let bStartNode = aStartNode;
  let aEndNode = afterNode.previousSibling;
  let bAfterNode = afterNode;
  let mark;
  let node;

  fixes: while (loop) {
    loop = false;

    // Skip prefix
    while (a[aStart] === b[bStart]) {
      bStart++;
      bStartNode = aStartNode = step(aStartNode, FORWARD);
      if (aEnd < ++aStart || bEnd < bStart) break fixes;
    }

    // Skip suffix
    while (a[aEnd] === b[bEnd]) {
      bEnd--;
      bAfterNode = step(aEndNode, BACKWARD, true);
      aEndNode = bAfterNode.previousSibling;
      if (--aEnd < aStart || bEnd < bStart) break fixes;
    }

    // Fast path to swap backward
    while (a[aEnd] === b[bStart]) {
      loop = true;
      mark = step(aEndNode, BACKWARD, true);
      node = mark.previousSibling;
      if (bStartNode !== mark) {
        insertNodes(parent, mark, aEndNode.nextSibling, bStartNode);
        aEndNode = node;
      }
      bStart++;
      aEnd--;
      if (aEnd < aStart || bEnd < bStart) break fixes;
    }

    // Fast path to swap forward
    while (a[aStart] === b[bEnd]) {
      loop = true;
      node = step(aStartNode, FORWARD);
      if (aStartNode !== bAfterNode) {
        mark = node.previousSibling;
        insertNodes(parent, aStartNode, node, bAfterNode);
        bAfterNode = mark;
        aStartNode = node;
      }
      aStart++;
      bEnd--;
      if (aEnd < aStart || bEnd < bStart) break fixes;
    }
  }

  // Fast path for shrink
  if (bEnd < bStart) {
    while (aStart <= aEnd--) {
      node = step(aEndNode, BACKWARD, true);
      mark = node.previousSibling;
      removeNodes(parent, node, aEndNode.nextSibling);
      onRemove && onRemove(node);
      aEndNode = mark;
    }
    return b.slice();
  }

  // Fast path for add
  if (aEnd < aStart) {
    while (bStart <= bEnd) {
      createFn(parent, b[bStart++], bStart, b, bAfterNode);
    }
    return b.slice();
  }

  // Positions for reusing nodes from current DOM state
  const P = new Array(bEnd + 1 - bStart);
  // Index to resolve position from current to new
  const I = new Map();
  for (i = bStart; i <= bEnd; i++) {
    P[i] = -1;
    I.set(b[i], i);
  }

  let reusingNodes = 0;
  let toRemove = [];
  for (i = aStart; i <= aEnd; i++) {
    tmp = I.get(a[i]);
    if (tmp) {
      P[tmp] = i;
      reusingNodes++;
    } else {
      toRemove.push(i);
    }
  }

  // Fast path for full replace
  if (reusingNodes === 0) {
    return reconcile(
      parent,
      reconcile(
        parent,
        a,
        [],
        beforeNode,
        afterNode,
        createFn,
        onClear
      ),
      b,
      beforeNode,
      afterNode,
      createFn
    );
  }

  // What else?
  const longestSeq = longestPositiveIncreasingSubsequence(P, bStart);

  // Collect nodes to work with them
  const nodes = [];
  tmp = aStartNode;
  for (i = aStart; i <= aEnd; i++) {
    nodes[i] = tmp;
    tmp = step(tmp, FORWARD);
  }

  for (i = 0; i < toRemove.length; i++) {
    let index = toRemove[i];
    node = nodes[index];
    removeNodes(parent, node, step(node, FORWARD));
    onRemove && onRemove(node);
  }

  length = longestSeq.length - 1;
  for (i = bEnd; i >= bStart; i--) {
    if (longestSeq[length] === i) {
      bAfterNode = nodes[P[longestSeq[length]]];
      length--;
    } else {
      if (P[i] === -1) {
        tmp = createFn(parent, b[i], i, b, bAfterNode);
      } else {
        tmp = nodes[P[i]];
        insertNodes(parent, tmp, step(tmp, FORWARD), bAfterNode);
      }
      bAfterNode = tmp;
    }
  }

  return b.slice();
}

/* Adapted from Stage0 - The MIT License - Pavel Martynov */
/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import createDisposer from './disposer.js';
import {
  normalizeIncomingArray,
  longestPositiveIncreasingSubsequence
} from './utils.js';

const GROUPING = '__rGroup';
const FORWARD = 'nextSibling';
const BACKWARD = 'previousSibling';
let groupCounter = 0;

export default function map(items, expr) {
  function init(h, parent, afterNode) {
    const { subscribe, root, sample, cleanup } = h;

    const disposer = createDisposer();
    const beforeNode = afterNode ? afterNode.previousSibling : null;
    let useFragment = !parent && !afterNode;

    function createFn(parent, item, i, data, afterNode) {
      return root(disposeFn => {
        const node = addNode(
          parent,
          expr(item, i, data),
          afterNode,
          ++groupCounter
        );
        disposer._disposables.set(node, disposeFn);
        return node;
      });
    }

    parent =
      (afterNode && afterNode.parentNode) ||
      parent ||
      document.createDocumentFragment();

    let child;
    function afterRender(beforeNodi) {
      child = beforeNodi;
    }

    function cacheParent() {
      if (useFragment && child && child.parentNode) {
        parent = child.parentNode;
      }
      return parent;
    }

    const unsubscribe = subscribe((renderedValues = []) => {
      const data = items() || [];
      return sample(() =>
        reconcile(
          disposer,
          cacheParent(),
          renderedValues,
          data,
          createFn,
          beforeNode,
          afterNode,
          afterRender
        )
      );
    });

    cleanup(unsubscribe);
    cleanup(disposer._disposeAll);

    return parent;
  }

  init.flow = true;
  return init;
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
  disposer,
  parent,
  renderedValues,
  data,
  createFn,
  beforeNode,
  afterNode,
  afterRender
) {
  const length = data.length;

  function after() {
    afterRender &&
      afterRender(
        beforeNode ? beforeNode.nextSibling : parent.firstChild,
        afterNode
      );
  }

  // Fast path for clear
  if (length === 0) {
    if (beforeNode || afterNode) {
      let node = beforeNode ? beforeNode.nextSibling : parent.firstChild;
      removeNodes(parent, node, afterNode ? afterNode : null);
    } else {
      parent.textContent = '';
    }

    disposer._disposeAll();
    if (length === 0) {
      after();
      return [];
    }
  }

  // Fast path for create
  if (renderedValues.length === 0) {
    for (let i = 0; i < length; i++) {
      createFn(parent, data[i], i, data, afterNode);
    }
    after();
    return data.slice();
  }

  let prevStart = 0;
  let newStart = 0;
  let loop = true;
  let prevEnd = renderedValues.length - 1;
  let newEnd = length - 1;
  let a;
  let b;
  let prevStartNode = beforeNode ? beforeNode.nextSibling : parent.firstChild;
  let newStartNode = prevStartNode;
  let prevEndNode = afterNode ? afterNode.previousSibling : parent.lastChild;
  let newAfterNode = afterNode;

  fixes: while (loop) {
    loop = false;
    let _node;

    // Skip prefix
    (a = renderedValues[prevStart]), (b = data[newStart]);
    while (a === b) {
      prevStart++;
      newStart++;
      newStartNode = prevStartNode = step(prevStartNode, FORWARD);
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevStart];
      b = data[newStart];
    }

    // Skip suffix
    (a = renderedValues[prevEnd]), (b = data[newEnd]);
    while (a === b) {
      prevEnd--;
      newEnd--;
      newAfterNode = step(prevEndNode, BACKWARD, true);
      prevEndNode = newAfterNode.previousSibling;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevEnd];
      b = data[newEnd];
    }

    // Fast path to swap backward
    (a = renderedValues[prevEnd]), (b = data[newStart]);
    while (a === b) {
      loop = true;
      let mark = step(prevEndNode, BACKWARD, true);
      _node = mark.previousSibling;
      if (newStartNode !== mark) {
        insertNodes(parent, mark, prevEndNode.nextSibling, newStartNode);
        prevEndNode = _node;
      }
      newStart++;
      prevEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevEnd];
      b = data[newStart];
    }

    // Fast path to swap forward
    (a = renderedValues[prevStart]), (b = data[newEnd]);
    while (a === b) {
      loop = true;
      _node = step(prevStartNode, FORWARD);
      if (prevStartNode !== newAfterNode) {
        let mark = _node.previousSibling;
        insertNodes(parent, prevStartNode, _node, newAfterNode);
        newAfterNode = mark;
        prevStartNode = _node;
      }
      prevStart++;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevStart];
      b = data[newEnd];
    }
  }

  // Fast path for shrink
  if (newEnd < newStart) {
    if (prevStart <= prevEnd) {
      let next, node;
      while (prevStart <= prevEnd) {
        node = step(prevEndNode, BACKWARD, true);
        next = node.previousSibling;
        removeNodes(parent, node, prevEndNode.nextSibling);
        disposer._dispose(node);
        prevEndNode = next;
        prevEnd--;
      }
    }
    after();
    return data.slice();
  }

  // Fast path for add
  if (prevEnd < prevStart) {
    if (newStart <= newEnd) {
      while (newStart <= newEnd) {
        createFn(parent, data[newStart], newStart, data, newAfterNode);
        newStart++;
      }
    }
    after();
    return data.slice();
  }

  // Positions for reusing nodes from current DOM state
  const P = new Array(newEnd + 1 - newStart);
  for (let i = newStart; i <= newEnd; i++) P[i] = -1;

  // Index to resolve position from current to new
  const I = new Map();
  for (let i = newStart; i <= newEnd; i++) I.set(data[i], i);

  let reusingNodes = 0;
  let toRemove = [];
  for (let i = prevStart; i <= prevEnd; i++) {
    if (I.has(renderedValues[i])) {
      P[I.get(renderedValues[i])] = i;
      reusingNodes++;
    } else {
      toRemove.push(i);
    }
  }

  // Fast path for full replace
  if (reusingNodes === 0) {
    const doRemove =
      prevStartNode !== parent.firstChild || prevEndNode !== parent.lastChild;
    let node = prevStartNode;
    let mark;
    newAfterNode = prevEndNode.nextSibling;
    while (node !== newAfterNode) {
      mark = step(node, FORWARD);
      disposer._dispose(node);
      doRemove && removeNodes(parent, node, mark);
      node = mark;
      prevStart++;
    }
    !doRemove && (parent.textContent = '');

    for (let i = newStart; i <= newEnd; i++) {
      createFn(parent, data[i], i, data, newAfterNode);
    }
    after();
    return data.slice();
  }

  // What else?
  const longestSeq = longestPositiveIncreasingSubsequence(P, newStart);
  const nodes = [];
  let tmpC = prevStartNode;
  let lisIdx = longestSeq.length - 1;
  let tmpD;

  // Collect nodes to work with them
  for (let i = prevStart; i <= prevEnd; i++) {
    nodes[i] = tmpC;
    tmpC = step(tmpC, FORWARD);
  }

  for (let i = 0; i < toRemove.length; i++) {
    let index = toRemove[i];
    let node = nodes[index];
    removeNodes(parent, node, step(node, FORWARD));
    disposer._dispose(node);
  }

  for (let i = newEnd; i >= newStart; i--) {
    if (longestSeq[lisIdx] === i) {
      newAfterNode = nodes[P[longestSeq[lisIdx]]];
      lisIdx--;
    } else {
      if (P[i] === -1) {
        tmpD = createFn(parent, data[i], i, data, newAfterNode);
      } else {
        tmpD = nodes[P[i]];
        insertNodes(parent, tmpD, step(tmpD, FORWARD), newAfterNode);
      }
      newAfterNode = tmpD;
    }
  }

  after();
  return data.slice();
}

function addNode(parent, node, afterNode, counter) {
  if (Array.isArray(node)) {
    if (!node.length) return;
    node = normalizeIncomingArray([], node);
    let mark = node[0];
    if (node.length !== 1) {
      mark[GROUPING] = node[node.length - 1][GROUPING] = counter;
    }
    for (let i = 0; i < node.length; i++) {
      afterNode
        ? parent.insertBefore(node[i], afterNode)
        : parent.appendChild(node[i]);
    }
    return mark;
  }
  let mark,
    t = typeof node;
  if (t === 'string' || t === 'number') {
    node = document.createTextNode(node);
  } else if (
    node.nodeType === 11 &&
    (mark = node.firstChild) &&
    mark !== node.lastChild
  ) {
    mark[GROUPING] = node.lastChild[GROUPING] = counter;
  }

  afterNode ? parent.insertBefore(node, afterNode) : parent.appendChild(node);
  return mark || node;
}

function step(node, direction, inner) {
  const key = node[GROUPING];
  if (key) {
    node = node[direction];
    while (node && node[GROUPING] !== key) {
      node = node[direction];
    }
  }
  return inner ? node : node[direction];
}

function removeNodes(parent, node, end) {
  let tmp;
  while (node !== end) {
    tmp = node.nextSibling;
    parent.removeChild(node);
    node = tmp;
  }
}

function insertNodes(parent, node, end, target) {
  let tmp;
  while (node !== end) {
    tmp = node.nextSibling;
    parent.insertBefore(node, target);
    node = tmp;
  }
}

/* Adapted from Stage0 - The MIT License - Pavel Martynov */
/* Adapted from DOM Expressions - The MIT License - Ryan Carniato */
import addNode from './add-node.js';
import {
  longestPositiveIncreasingSubsequence,
  insertNodes,
  removeNodes,
  step
} from './utils.js';

export const GROUPING = '__g';
const FORWARD = 'nextSibling';
const BACKWARD = 'previousSibling';
let groupCounter = 0;

export default function map(items, expr) {
  function init(h, parent, afterNode) {
    const { subscribe, root, sample, cleanup } = h;
    const beforeNode = afterNode.previousSibling;
    let disposables = new Map();

    function disposeAll() {
      disposables.forEach(d => d());
      disposables.clear();
    }

    function dispose(node) {
      let disposable;
      (disposable = disposables.get(node)) && disposable();
      disposables.delete(node);
    }

    function createFn(parent, item, i, data, afterNode) {
      return root(disposeFn => {
        const node = addNode(
          parent,
          expr(item, i, data),
          afterNode,
          ++groupCounter
        );
        disposables.set(node, disposeFn);
        return node;
      });
    }

    const unsubscribe = subscribe((renderedValues = []) => {
      const data = items() || [];
      return sample(() =>
        reconcile(
          parent,
          renderedValues,
          data,
          beforeNode,
          afterNode,
          createFn,
          disposeAll,
          dispose
        )
      );
    });

    cleanup(unsubscribe);
    cleanup(disposeAll);

    return parent;
  }

  init._flow = true;
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
  parent,
  renderedValues,
  data,
  beforeNode,
  afterNode,
  createFn,
  onClear,
  onRemove,
  onRender
) {
  const length = data.length;

  // When parent was a DocumentFragment, then items got appended to the DOM.
  parent = afterNode.parentNode;

  function afterRender() {
    onRender &&
      onRender(
        beforeNode ? beforeNode.nextSibling : parent.firstChild,
        afterNode
      );
  }

  // Fast path for clear
  if (length === 0) {
    if (beforeNode || afterNode !== parent.lastChild) {
      let node = beforeNode ? beforeNode.nextSibling : parent.firstChild;
      removeNodes(parent, node, afterNode);
    } else {
      parent.textContent = '';
      parent.appendChild(afterNode);
    }

    afterRender();
    onClear && onClear();
    return [];
  }

  // Fast path for create
  if (renderedValues.length === 0) {
    for (let i = 0; i < length; i++) {
      createFn(parent, data[i], i, data, afterNode);
    }
    afterRender();
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
  let prevEndNode = afterNode.previousSibling;
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
        onRemove && onRemove(node);
        prevEndNode = next;
        prevEnd--;
      }
    }
    afterRender();
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
    afterRender();
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
      doRemove && removeNodes(parent, node, mark);
      onRemove && onRemove(node);
      node = mark;
      prevStart++;
    }
    !doRemove && (parent.textContent = '');

    for (let i = newStart; i <= newEnd; i++) {
      createFn(parent, data[i], i, data, newAfterNode);
    }
    afterRender();
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
    onRemove && onRemove(node);
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

  afterRender();
  return data.slice();
}

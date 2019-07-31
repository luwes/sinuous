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

export default function map(items, expr) {
  const { subscribe, root, sample, cleanup } = api;

  const disposers = new Map();
  let parent = document.createDocumentFragment();
  const beforeNode = parent.appendChild(document.createTextNode(''));
  const afterNode = parent.appendChild(document.createTextNode(''));

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
    return root(disposeFn => {
      const node = addNode(
        parent,
        expr(item, i, data),
        afterNode,
        ++groupCounter
      );
      disposers.set(node, disposeFn);
      return node;
    });
  }

  const unsubscribe = subscribe(renderedValues => {
    renderedValues = renderedValues || [];

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
  onRemove
) {
  const length = data.length;
  // When parent was a DocumentFragment, then items got appended to the DOM.
  parent = afterNode.parentNode;

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
  if (renderedValues.length === 0) {
    for (let i = 0; i < length; i++) {
      createFn(parent, data[i], i, data, afterNode);
    }
    return data.slice();
  }

  let prevStart = 0;
  let newStart = 0;
  let loop = true;
  let prevEnd = renderedValues.length - 1;
  let newEnd = length - 1;
  let a;
  let b;
  let prevStartNode = beforeNode.nextSibling;
  let newStartNode = prevStartNode;
  let prevEndNode = afterNode.previousSibling;
  let newAfterNode = afterNode;

  fixes: while (loop) {
    loop = false;
    let _node;

    // Skip prefix
    a = renderedValues[prevStart];
    b = data[newStart];
    while (a === b) {
      prevStart++;
      newStart++;
      newStartNode = prevStartNode = step(prevStartNode, FORWARD);
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevStart];
      b = data[newStart];
    }

    // Skip suffix
    a = renderedValues[prevEnd];
    b = data[newEnd];
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
    a = renderedValues[prevEnd];
    b = data[newStart];
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
    a = renderedValues[prevStart];
    b = data[newEnd];
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
      let next;
      let node;
      while (prevStart <= prevEnd) {
        node = step(prevEndNode, BACKWARD, true);
        next = node.previousSibling;
        removeNodes(parent, node, prevEndNode.nextSibling);
        onRemove && onRemove(node);
        prevEndNode = next;
        prevEnd--;
      }
    }
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
    return data.slice();
  }

  // Positions for reusing nodes from current DOM state
  const P = new Array(newEnd + 1 - newStart);
  for (let i = newStart; i <= newEnd; i++) {
    P[i] = -1;
  }

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
    return reconcile(
      parent,
      reconcile(
        parent,
        renderedValues,
        [],
        beforeNode,
        afterNode,
        createFn,
        onClear
      ),
      data,
      beforeNode,
      afterNode,
      createFn
    );
  }

  // What else?
  const longestSeq = longestPositiveIncreasingSubsequence(P, newStart);

  // Collect nodes to work with them
  const nodes = [];
  let tmpC = prevStartNode;
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

  let lisIdx = longestSeq.length - 1;
  let tmpD;
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

  return data.slice();
}

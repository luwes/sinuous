import { safePush } from './utils.js';

let currentUpdate;
let parentUpdate;

/**
 * Creates a new observable, returns a function which can be used to get
 * the observable's value by calling the function without any arguments
 * and set the value by passing one argument of any type.
 *
 * @param  {*} value - Initial value.
 * @return {Function}
 */
export default function observable(value) {
  data._listeners = [];

  function data(nextValue) {
    if (typeof nextValue === 'undefined') {
      if (currentUpdate) {
        safePush(data._listeners, currentUpdate);
        safePush(currentUpdate._observables, data);
      }
      return value;
    }

    value = nextValue;

    data._listeners.forEach(update => (update._fresh = false));
    // Update can alter data._listeners, make a copy before running.
    data._listeners.slice().forEach(update => {
      update._children.forEach(_unsubscribe);
      if (!update._fresh) update();
    });
    return value;
  }

  return data;
}

/**
 * Creates a new computation which runs when defined and automatically re-runs
 * when any of the used observable's values are set.
 *
 * @param {Function} listener
 * @return {Function} Computation which can be used in other computations.
 */
export function S(listener) {
  let result;
  let prevUpdate;

  // Keep track of which observables trigger updates. Needed for unsubscribe.
  update._observables = [];
  listener._update = data._update = update;

  function update() {
    update._fresh = true;
    _unsubscribe(update);

    prevUpdate = currentUpdate;
    currentUpdate = update;
    update._children = [];

    let parent;
    if (parentUpdate) {
      safePush(parentUpdate._children, update);
    } else {
      parent = true;
      parentUpdate = update;
    }

    result = listener();

    if (parent) {
      parent = false;
      parentUpdate = undefined;
    }

    currentUpdate = prevUpdate;
    prevUpdate = undefined;
    return result;
  }

  function data() {
    if (update._fresh) {
      update._observables.forEach(o => o());
    } else {
      result = update();
    }
    return result;
  }

  update();
  return data;
}

/**
 * Subscribe to updates of value.
 * @param  {Function} update
 * @return {Function} unsubscribe
 */
export function subscribe(listener) {
  const update = S(listener)._update;
  return () => _unsubscribe(update);
}

/**
 * Unsubscribe from a listener.
 * @param  {Function} listener
 */
export function unsubscribe(listener) {
  _unsubscribe(listener._update);
}

function _unsubscribe(update) {
  update._observables.forEach(o => {
    o._listeners.splice(o._listeners.indexOf(update), 1);
  });
  update._observables = [];
}

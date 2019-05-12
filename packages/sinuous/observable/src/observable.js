let currentUpdate;

/**
 * Sample the current value of an observable but don't create a dependency on it.
 *
 * @example
 * S(() => { if (foo()) bar(sample(bar) + 1); });
 *
 * @param  {Function} fn
 * @return {*}
 */
export function sample(fn) {
  let update = currentUpdate;
  currentUpdate = undefined;
  const result = fn();
  currentUpdate = update;
  return result;
}

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
        data._listeners.push(currentUpdate);
        currentUpdate._observables.push(data);
      }
      return value;
    }

    value = nextValue;

    data._listeners.forEach(update => (update._fresh = false));
    // Update can alter data._listeners, make a copy before running.
    data._listeners.slice().forEach(update => {
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
 * @param {*} value - Seed value.
 * @return {Function} Computation which can be used in other computations.
 */
export function S(listener, value) {
  // Keep track of which observables trigger updates. Needed for unsubscribe.
  update._observables = [];
  update._children = [];
  listener._update = update;

  function update() {
    update._fresh = true;
    _unsubscribe(update);

    const prevUpdate = currentUpdate;

    if (currentUpdate) {
      currentUpdate._children.push(update);
    }

    currentUpdate = update;
    value = listener(value);
    currentUpdate = prevUpdate;

    return value;
  }

  function data() {
    if (update._fresh) {
      update._observables.forEach(o => o());
    } else {
      value = update();
    }
    return value;
  }

  update();
  return data;
}

/**
 * Subscribe to updates of value.
 * @param  {Function} listener
 * @return {Function}
 */
export function subscribe(listener) {
  S(listener);
  return () => _unsubscribe(listener._update);
}

/**
 * Unsubscribe from a listener.
 * @param  {Function} listener
 */
export function unsubscribe(listener) {
  _unsubscribe(listener._update);
}

function _unsubscribe(update) {
  update._children.forEach(_unsubscribe);
  update._children = [];

  update._observables.forEach(o => {
    o._listeners.splice(o._listeners.indexOf(update), 1);
  });
  update._observables = [];
}

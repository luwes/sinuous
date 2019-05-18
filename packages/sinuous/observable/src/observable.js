let currentUpdate;

/**
 * Creates a root and executes the passed function that can contain computations.
 * The executed function receives an `unsubscribe` argument which can be called to
 * unsubscribe all inner computations.
 *
 * @param  {Function} fn
 * @return {*}
 */
export function root(fn) {
  const update = currentUpdate;
  const rootUpdate = () => {};
  currentUpdate = resetUpdate(rootUpdate);
  const result = fn(() => {
    _unsubscribe(rootUpdate);
    currentUpdate = undefined;
  });
  currentUpdate = update;
  return result;
}

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
  const update = currentUpdate;
  currentUpdate = undefined;
  const value = fn();
  currentUpdate = update;
  return value;
}

/**
 * Creates a new observable, returns a function which can be used to get
 * the observable's value by calling the function without any arguments
 * and set the value by passing one argument of any type.
 *
 * @param  {*} value - Initial value.
 * @return {Function}
 */
function observable(value) {
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
  listener._update = update;

  resetUpdate(update);
  update();

  function update() {
    const prevUpdate = currentUpdate;
    if (currentUpdate) {
      currentUpdate._children.push(update);
    }

    _unsubscribe(update);
    update._fresh = true;
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

  return data;
}

/**
 * Run the given function just before the enclosing computation updates
 * or is disposed.
 * @param  {Function} fn
 * @return {Function}
 */
export function cleanup(fn) {
  currentUpdate && currentUpdate._cleanups.push(fn);
  return fn;
}

/**
 * Subscribe to updates of an observable.
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
  update._observables.forEach(o => {
    o._listeners.splice(o._listeners.indexOf(update), 1);
  });
  update._cleanups.forEach(c => c());
  resetUpdate(update);
}

function resetUpdate(update) {
  // Keep track of which observables trigger updates. Needed for unsubscribe.
  update._observables = [];
  update._children = [];
  update._cleanups = [];
  return update;
}

export default observable;

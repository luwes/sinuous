const EMPTY_ARR = [];
let tracking;
let queue;

/**
 * Returns true if there is an active observer.
 * @return {boolean}
 */
export function isListening() {
  return !!tracking;
}

/**
 * Creates a root and executes the passed function that can contain computations.
 * The executed function receives an `unsubscribe` argument which can be called to
 * unsubscribe all inner computations.
 *
 * @param  {Function} fn
 * @return {*}
 */
export function root(fn) {
  const prevTracking = tracking;
  const rootUpdate = () => {};
  tracking = rootUpdate;
  resetUpdate(rootUpdate);
  const result = fn(() => {
    _unsubscribe(rootUpdate);
    tracking = undefined;
  });
  tracking = prevTracking;
  return result;
}

/**
 * Sample the current value of an observable but don't create a dependency on it.
 *
 * @example
 * computed(() => { if (foo()) bar(sample(bar) + 1); });
 *
 * @param  {Function} fn
 * @return {*}
 */
export function sample(fn) {
  const prevTracking = tracking;
  tracking = undefined;
  const value = fn();
  tracking = prevTracking;
  return value;
}

/**
 * Creates a transaction in which an observable can be set multiple times
 * but only trigger a computation once.
 * @param  {Function} fn
 * @return {*}
 */
export function transaction(fn) {
  let prevQueue = queue;
  queue = [];
  const result = fn();
  let q = queue;
  queue = prevQueue;
  q.forEach(data => {
    if (data._pending !== EMPTY_ARR) {
      const pending = data._pending;
      data._pending = EMPTY_ARR;
      data(pending);
    }
  });
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
function observable(value) {
  function data(nextValue) {
    if (arguments.length === 0) {
      if (tracking && !data._observers.has(tracking)) {
        data._observers.add(tracking);
        tracking._observables.push(data);
      }
      return value;
    }

    if (queue) {
      if (data._pending === EMPTY_ARR) {
        queue.push(data);
      }
      data._pending = nextValue;
      return nextValue;
    }

    value = nextValue;

    // Clear `tracking` otherwise a computed triggered by a set
    // in another computed is seen as a child of that other computed.
    const clearedUpdate = tracking;
    tracking = undefined;

    // Update can alter data._observers, make a copy before running.
    data._runObservers = new Set(data._observers);
    data._runObservers.forEach(observer => (observer._fresh = false));
    data._runObservers.forEach(observer => {
      if (!observer._fresh) observer();
    });

    tracking = clearedUpdate;
    return value;
  }

  // Tiny indicator that this is an observable function.
  // Used in sinuous/h/src/property.js
  data.$o = 1;
  data._observers = new Set();
  // The 'not set' value must be unique, so `nullish` can be set in a transaction.
  data._pending = EMPTY_ARR;

  return data;
}

/**
 * @namespace
 * @borrows observable as o
 */
export { observable, observable as o };

/**
 * Creates a new computation which runs when defined and automatically re-runs
 * when any of the used observable's values are set.
 *
 * @param {Function} observer
 * @param {*} value - Seed value.
 * @return {Function} Computation which can be used in other computations.
 */
function computed(observer, value) {
  observer._update = update;

  // if (tracking == null) {
  //   console.warn("computations created without a root or parent will never be disposed");
  // }

  resetUpdate(update);
  update();

  function update() {
    const prevTracking = tracking;
    if (tracking) {
      tracking._children.push(update);
    }

    _unsubscribe(update);
    update._fresh = true;
    tracking = update;
    value = observer(value);

    tracking = prevTracking;
    return value;
  }

  // Tiny indicator that this is an observable function.
  // Used in sinuous/h/src/property.js
  data.$o = 1;

  function data() {
    if (update._fresh) {
      if (tracking) {
        // If being read from inside another computed, pass observables to it
        update._observables.forEach(o => o());
      }
    } else {
      value = update();
    }
    return value;
  }

  return data;
}

/**
 * @namespace
 * @borrows computed as S
 */
export { computed, computed as S };

/**
 * Run the given function just before the enclosing computation updates
 * or is disposed.
 * @param  {Function} fn
 * @return {Function}
 */
export function cleanup(fn) {
  if (tracking) {
    tracking._cleanups.push(fn);
  }
  return fn;
}

/**
 * Subscribe to updates of an observable.
 * @param  {Function} observer
 * @return {Function}
 */
export function subscribe(observer) {
  computed(observer);
  return () => _unsubscribe(observer._update);
}

/**
 * Statically declare a computation's dependencies.
 *
 * @param  {Function|Array}   obs
 * @param  {Function} fn - Callback function.
 * @param  {*} [seed] - Seed value.
 * @param  {boolean} [onchanges] - If true the initial run is skipped.
 * @return {Function} Computation which can be used in other computations.
 */
export function on(obs, fn, seed, onchanges) {
  obs = [].concat(obs);
  return computed((value) => {
    obs.forEach((o) => o());

    let result = value;
    if (!onchanges) {
      result = sample(() => fn(value));
    }

    onchanges = false;
    return result;
  }, seed);
}

/**
 * Unsubscribe from an observer.
 * @param  {Function} observer
 */
export function unsubscribe(observer) {
  _unsubscribe(observer._update);
}

function _unsubscribe(update) {
  update._children.forEach(_unsubscribe);
  update._observables.forEach(o => {
    o._observers.delete(update);
    if (o._runObservers) {
      o._runObservers.delete(update);
    }
  });
  update._cleanups.forEach(c => c());
  resetUpdate(update);
}

function resetUpdate(update) {
  // Keep track of which observables trigger updates. Needed for unsubscribe.
  update._observables = [];
  update._children = [];
  update._cleanups = [];
}

let currentUpdate;
let queue;

/**
 * Returns true if there is an active listener.
 * @return {boolean}
 */
export function isListening() {
  return !!currentUpdate;
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
  const update = currentUpdate;
  const rootUpdate = () => {};
  currentUpdate = rootUpdate;
  resetUpdate(rootUpdate);
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
 * Creates a transaction in which an observable can be set multiple times
 * but only trigger a computation once.
 * @param  {Function} fn
 * @return {*}
 */
export function transaction(fn) {
  queue = [];
  const result = fn();
  let q = queue;
  queue = undefined;
  q.forEach(data => {
    if (data._pending) {
      const pending = data._pending;
      data._pending = undefined;
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
  // Tiny indicator that this is an observable function.
  data.$o = 1;
  data._listeners = [];
  data._runListeners = [];

  function data(nextValue) {
    if (arguments.length === 0) {
      if (
        currentUpdate &&
        data._listeners[data._listeners.length - 1] !== currentUpdate
      ) {
        data._listeners.push(currentUpdate);
        currentUpdate._observables.push(data);
      }
      return value;
    }

    if (queue) {
      if (data._pending === undefined) {
        queue.push(data);
      }
      data._pending = nextValue;
      return nextValue;
    }

    value = nextValue;

    // Clear `currentUpdate` otherwise a computed triggered by a set
    // in another computed is seen as a child of that other computed.
    const clearedUpdate = currentUpdate;
    currentUpdate = undefined;

    // Update can alter data._listeners, make a copy before running.
    data._runListeners = data._listeners.slice();
    data._runListeners.forEach(update => (update._fresh = false));
    data._runListeners.forEach(update => {
      if (!update._fresh) update();
    });

    currentUpdate = clearedUpdate;
    return value;
  }

  return data;
}

export { observable, observable as o };

/**
 * Creates a new computation which runs when defined and automatically re-runs
 * when any of the used observable's values are set.
 *
 * @param {Function} listener
 * @param {*} value - Seed value.
 * @return {Function} Computation which can be used in other computations.
 */
function computed(listener, value) {
  listener._update = update;

  resetUpdate(update);
  update();

  function update() {
    const prevUpdate = currentUpdate;
    if (currentUpdate) {
      currentUpdate._children.push(update);
    }

    const prevChildren = update._children;

    _unsubscribe(update);
    update._fresh = true;
    currentUpdate = update;
    value = listener(value);

    // If any children computations were removed mark them as fresh.
    // Check the diff of the children list between pre and post update.
    prevChildren.forEach(u => {
      if (update._children.indexOf(u) === -1) {
        u._fresh = true;
      }
    });

    // If any children were marked as fresh remove them from the run lists.
    const allChildren = getChildrenDeep(update._children, []);
    allChildren.forEach(u => {
      if (u._fresh) {
        u._observables.forEach(o => {
          o._runListeners.splice(o._runListeners.indexOf(u), 1);
        });
      }
    });

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

export { computed, computed as S };

/**
 * Run the given function just before the enclosing computation updates
 * or is disposed.
 * @param  {Function} fn
 * @return {Function}
 */
export function cleanup(fn) {
  if (currentUpdate) {
    currentUpdate._cleanups.push(fn);
  }
  return fn;
}

/**
 * Subscribe to updates of an observable.
 * @param  {Function} listener
 * @return {Function}
 */
export function subscribe(listener) {
  computed(listener);
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
}

function getChildrenDeep(children, all) {
  all = all.concat(children);
  for (let i = 0; i < children.length; i++) {
    getChildrenDeep(children[i]._children, all);
  }
  return all;
}

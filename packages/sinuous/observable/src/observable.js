import { getChildrenDeep } from './utils.js';

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
 * S(() => { if (foo()) bar(sample(bar) + 1); });
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
  queue = [];
  const result = fn();
  let q = queue;
  queue = undefined;
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
  // Tiny indicator that this is an observable function.
  data.$o = true;
  data._observers = new Set();
  // The 'not set' value must be unique, so `nullish` can be set in a transaction.
  data._pending = EMPTY_ARR;

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
  return computationNode(observer, value);
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
  computationNode(observer);
  return () => _unsubscribe(observer._update);
}

/**
 * Unsubscribe from an observer.
 * @param  {Function} observer
 */
export function unsubscribe(observer) {
  _unsubscribe(observer._update);
}

/**
 * Create a context provider computationNode
 * @param {Object} context
 * @param {Function} childClosure
 * @return {Function}
 */
function context(context, childClosure) {
  return computationNode(childClosure, undefined, context);
}

/**
 * @namespace
 * @borrows context as ContextProvider
 */
export { context, context as ContextProvider };

/**
 * Get context from the nearest context provider above
 * @param {String} key - specifies the context to use
 * @return {*} The context object or a value from the context
 */
export function useContext(key) {
  if (tracking && tracking._context) {
    if (arguments.length === 0) {
      return tracking._context;
    }
    return tracking._context[key];
  }
}

function computationNode(observer, value, context) {
  observer._update = update;
  let oldContext = tracking._context;

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

    const prevChildren = update._children;
    _unsubscribe(update);
    update._fresh = true;
    // Merge contexts
    update._context = (oldContext || context) && { ...oldContext, ...context };
    tracking = update;
    value = observer(value);

    // If any children computations were removed mark them as fresh.
    // Check the diff of the children list between pre and post update.
    prevChildren.forEach(u => {
      if (update._children.indexOf(u) === -1) {
        u._fresh = true;
      }
    });

    // If any children were marked as fresh remove them from the run lists.
    const allChildren = getChildrenDeep(update._children);
    allChildren.forEach(removeFreshChildren);

    tracking = prevTracking;
    return value;
  }

  // Tiny indicator that this is an observable function.
  data.$o = true;

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

function removeFreshChildren(u) {
  if (u._fresh) {
    u._observables.forEach(o => {
      if (o._runObservers) {
        o._runObservers.delete(u);
      }
    });
  }
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
  update._context = {};
}

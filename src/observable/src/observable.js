/***** TYPES ******/
/*****  SHARED STATE  *****/
const NONE = Symbol();
let tracking;
let queue;
/*****  MAIN  *****/
/**
 * Returns true if there is an active observer.
 */
function isListening() {
    return Boolean(tracking);
}
/**
 * Creates a root and executes the passed function
 * which can contain computations.
 *
 * The function to be executed recieves a callback
 * which can be called to unsubscribe all inner
 * computations.
 */
function root(fn) {
    const prevTracking = tracking;
    const rootUpdate = () => { };
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
 * Provides current values of observables without
 * establishing dependencies.
 *
 * Example:
 * ```ts
 * computed(() => {
 *     if (foo()) bar(sample(bar) + 1)
 * })
 * ```
 */
function sample(fn) {
    const prevTracking = tracking;
    tracking = undefined;
    const value = fn();
    tracking = prevTracking;
    return value;
}
/**
 * Creates a transaction in which an observable
 * can be set multiple times but trigger a
 * computation only once.
 */
function transaction(fn) {
    const previousQueue = queue;
    queue = [];
    const result = fn();
    const transactionQueue = queue;
    queue = previousQueue;
    transactionQueue.forEach(observable => {
        if (observable._pending !== NONE) {
            const pending = observable._pending;
            observable._pending = NONE;
            observable(pending);
        }
    });
    return result;
}
/**
 * Creates a new observable and returns it.
 * An observable can be called without an argument
 * to get its current value, and be called with an
 * argument to update its value while also
 * triggering any computations that depend on it.
 */
function observable(value) {
    function data(nextValue) {
        if (arguments.length === 0 &&
            tracking &&
            !data._observers.has(tracking)) {
            data._observers.add(tracking);
            tracking._observables?.push(data);
            return value;
        }
        if (arguments.length === 0) {
            return value;
        }
        if (queue) {
            if (data._pending === NONE)
                queue.push(data);
            // @ts-ignore code is reachable only if
            // nextValue is provided, and tsc checks that
            // the type is T
            data._pending = nextValue;
            return nextValue;
        }
        // @ts-ignore code is reachable only if nextValue
        // is provided, and tsc checks that the type is T
        value = nextValue;
        // Clear `tracking`
        // otherwise a computed triggered by a set
        // operation in another computed is seen as
        // a child of that other computed
        const clearedUpdate = tracking;
        tracking = undefined;
        // Updates can queue more updates
        // so we create a copy of all the observers
        // we want to run beforehand
        data._queuedObservers =
            new Set(data._observers);
        data._queuedObservers.forEach(observer => {
            observer._fresh = false;
        });
        data._queuedObservers.forEach(observer => {
            if (observer._fresh === false) {
                observer();
            }
        });
        tracking = clearedUpdate;
        return value;
    }
    data.$o = 1;
    data._observers = new Set;
    data._queuedObservers = new Set;
    data._pending = NONE;
    return data;
}
/**
 * Creates a new computation which runs when
 * defined and automatically re-runs when any of
 * the used observable's values are updated.
 */
function computed(observer, value) {
    function update() {
        const prevTracking = tracking;
        if (tracking)
            tracking._children?.push(update);
        _unsubscribe(update);
        update._fresh = true;
        tracking = update;
        value = observer(value);
        tracking = prevTracking;
        return value;
    }
    update._fresh = false;
    update._observables = new Array;
    function data() {
        if (update._fresh && tracking) {
            update._observables.forEach(o => o());
        }
        if (update._fresh !== true) {
            value = update();
        }
        // @ts-ignore `value` should not be
        // undefined by this point
        return value;
    }
    data.$o = 1;
    data._observers = new Set;
    data._queuedObservers = new Set;
    data._pending = NONE;
    resetUpdate(update);
    update();
    observer._update = update;
    return data;
}
/**
 * Run the given function just before the enclosing
 * computation updates or is disposed
 */
function cleanup(fn) {
    if (tracking)
        tracking._cleanups?.push(fn);
    return fn;
}
/**
 * Subscribe to updates of an observable
 */
function subscribe(observer) {
    computed(observer);
    return () => {
        if (observer._update)
            _unsubscribe(observer._update);
    };
}
function on(observables, fn, seed, onchanges = false) {
    const obs = (new Array)
        .concat(observables);
    return computed((value) => {
        obs.forEach(o => o());
        // @ts-ignore onchanges being true
        // implies a seed value was provided
        // as the parameter preceding it, which
        // will be used as `value` here
        const result = onchanges == true
            ? value
            : sample(() => fn(value));
        onchanges = false;
        return result;
    }, seed);
}
/**
 * Unsubscribe from an observer
 */
function unsubscribe(observer) {
    observer._update && _unsubscribe(observer._update);
}
/*****  HELPER FUNCTIONS  *****/
function _unsubscribe(update) {
    update._children?.forEach(_unsubscribe);
    update._observables?.forEach(observable => {
        observable._observers.delete(update);
        observable._queuedObservers.delete(update);
    });
    update._cleanups?.forEach(cleanup => cleanup());
    resetUpdate(update);
}
function resetUpdate(update) {
    // Keep track of which observables trigger
    // an update, needed for unsubscribe
    update._observables = [];
    update._children = [];
    update._cleanups = [];
}
/*****  EXPORTS  *****/
export { isListening, root, sample, transaction, observable, observable as o, computed, computed as S, cleanup, subscribe, on, unsubscribe };

/***** TYPES ******/
type Observable<T> = {
    (): T;
    (newValue: T): T;
    $o: 1;
    _pending: T | NONE;
    _observers: Set<Observer<unknown>>;
    _queuedObservers: Set<Observer<unknown>>;
};
type Observer<T> = {
    (initialValue?: T): T;
    _cleanups?: Array<(...args: Array<unknown>) => unknown>;
    _fresh?: boolean;
    _update?: Observer<unknown>;
    _observables?: Array<Observable<unknown>>;
    _children?: Array<Observer<unknown>>;
};
type Unsubscribe = () => void;
type NONE = typeof NONE;
/*****  SHARED STATE  *****/
declare const NONE: unique symbol;
/*****  MAIN  *****/
/**
 * Returns true if there is an active observer.
 */
declare function isListening(): boolean;
/**
 * Creates a root and executes the passed function
 * which can contain computations.
 *
 * The function to be executed recieves a callback
 * which can be called to unsubscribe all inner
 * computations.
 */
declare function root<T>(fn: (unsubscribe?: Unsubscribe) => T): T;
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
declare function sample<T>(fn: Observer<T>): T;
/**
 * Creates a transaction in which an observable
 * can be set multiple times but trigger a
 * computation only once.
 */
declare function transaction<T>(fn: () => T): T;
/**
 * Creates a new observable and returns it.
 * An observable can be called without an argument
 * to get its current value, and be called with an
 * argument to update its value while also
 * triggering any computations that depend on it.
 */
declare function observable<T>(value: T): Observable<T>;
/**
 * Creates a new computation which runs when
 * defined and automatically re-runs when any of
 * the used observable's values are updated.
 */
declare function computed<T>(observer: Observer<T>, value?: T): Observable<T>;
/**
 * Run the given function just before the enclosing
 * computation updates or is disposed
 */
declare function cleanup<T extends (...args: unknown[]) => unknown>(fn: T): T;
/**
 * Subscribe to updates of an observable
 */
declare function subscribe(observer: Observer<unknown>): Unsubscribe;
/**
 * Sttically declare a computation's dependencies
 */
declare function on<Result>(observable: Observable<any> | Array<Observable<any>>, fn: () => Result): Observable<Result>;
declare function on<Result>(observables: Observable<any> | Array<Observable<any>>, fn: (accumulated: Result) => Result, seed: Result): Observable<Result>;
declare function on<Result>(observables: Observable<any> | Array<Observable<any>>, fn: (accumulated: Result) => Result, seed: Result, onchanges: boolean): Observable<Result>;
/**
 * Unsubscribe from an observer
 */
declare function unsubscribe(observer: Observer<unknown>): void;
/*****  EXPORTS  *****/
export { type Observable, isListening, root, sample, transaction, observable, observable as o, computed, computed as S, cleanup, subscribe, on, unsubscribe };

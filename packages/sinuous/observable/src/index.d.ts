export = observable;
export as namespace observable;

declare namespace observable {

  interface ObservableCreator<T> {
    (value: T): Observable<T>;
  }
  interface Observable<T> {
    (): T;
    (nextValue: T): T;
  }
  const observable: ObservableCreator<Observable<any>>;
  const o: ObservableCreator<Observable<any>>;

  interface Computed<T> {
    (): T;
  }
  interface ComputedCreator<T> {
    (observer: (v: T) => T, seed: T): Computed<T>;
    (observer: () => T): Computed<T>;
  }
  const computed: ComputedCreator<any>;
  const S: ComputedCreator<any>;

  function subscribe<T>(observer: () => T): () => void;
  function unsubscribe<T>(observer: () => T): void;
  function isListening(): boolean;
  function root<T>(fn: () => T): T;
  function sample<T>(fn: () => T): T;
  function transaction<T>(fn: () => T): T;

  type CleanupFn = () => any;
  function cleanup(fn: CleanupFn): CleanupFn;
}

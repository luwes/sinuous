export interface ObservableCreator<T> {
  (value: T): Observable<T>;
}
export interface Observable<T> {
  (): T;
  (nextValue: T): T;
}
export const observable: ObservableCreator<any>;
export const o: ObservableCreator<any>;

export interface Computed<T> {
  (): T;
}
export interface ComputedCreator<T> {
  (observer: (v: T) => T, seed: T): Computed<T>;
  (observer: () => T): Computed<T>;
}
export const computed: ComputedCreator<any>;
export const S: ComputedCreator<any>;

export function subscribe<T>(observer: () => T): () => void;
export function unsubscribe<T>(observer: () => T): void;
export function isListening(): boolean;
export function root<T>(fn: () => T): T;
export function sample<T>(fn: () => T): T;
export function transaction<T>(fn: () => T): T;

type CleanupFn = () => any;
export function cleanup(fn: CleanupFn): CleanupFn;

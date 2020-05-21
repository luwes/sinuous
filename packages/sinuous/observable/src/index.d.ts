export interface Observable<T> {
  (): T;
  (nextValue: T): T;
}
export function observable<T>(value: T): Observable<T>;
export function o<T>(value: T): Observable<T>;
export function computed<T extends () => unknown>(observer: T): T;
export function S<T extends () => unknown>(observer: T): T;

export function subscribe<T>(observer: () => T): () => void;
export function unsubscribe<T>(observer: () => T): void;
export function isListening(): boolean;
export function root<T>(fn: () => T): T;
export function sample<T>(fn: () => T): T;
export function transaction<T>(fn: () => T): T;
export function cleanup<T extends () => unknown>(fn: T): T;

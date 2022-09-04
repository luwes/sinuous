import { Observable } from '../../observable/src';

export function map<T>(
  items: ((...args: unknown[]) => T[]) | Observable<T[]>,
  expr: (item: T, i: number, items: T[]) => Node,
  cleaning?: boolean
): DocumentFragment;

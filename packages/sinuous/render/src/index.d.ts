import { JSXInternal } from '../../src/jsx';

type Props =
  | JSXInternal.HTMLAttributes &
    Record<string, any>
  | null

type Child =
  | Node
  | Node[]

interface Func {
  (props: Props): Child
}

export function memo<T>(func: Func): Func;

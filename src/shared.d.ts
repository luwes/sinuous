import { Observable } from './observable/src';

export type ElementChild =
    | Node
    | Function
    | Observable<unknown>
    | object
    | string
    | number
    | boolean
    | null
    | undefined;
  type ElementChildren = ElementChild[] | ElementChild;

export interface FunctionComponent {
  (props: object, ...children: ElementChildren[]): Node
  (...children: ElementChildren[]): Node
}

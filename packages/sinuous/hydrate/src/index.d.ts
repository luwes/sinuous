import { JSXInternal } from '../../src/jsx';
import { Observable } from '../../observable/src';

interface VNode<P = {}> {
  type: string
  _props: object
  _children: VNode[]
  _isSvg: boolean
}

type ElementChild =
  | VNode
  | Function
  | Observable<any>
  | object
  | string
  | number
  | boolean
  | null
  | undefined;
type ElementChildren = ElementChild[] | ElementChild;

interface FunctionComponent<P = {}> {
  (props: object, ...children: ElementChildren[]): any
  (...children: ElementChildren[]): any
}

export function hydrate(delta: VNode, root?: Node): Node;

export const dhtml: (strings: TemplateStringsArray, ...values: any[]) => VNode | VNode[];
export const dsvg: (strings: TemplateStringsArray, ...values: any[]) => VNode | VNode[];

export function dh(
  type: string,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function dh(
  type: FunctionComponent,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function dh(
  children: ElementChildren[]
): VNode | VNode[];
export namespace dh {
  export import JSX = JSXInternal;
}

export function dhs(
  type: string,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function dhs(
  type: FunctionComponent,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function dhs(
  children: ElementChildren[]
): VNode | VNode[];
export namespace dhs {
  export import JSX = JSXInternal;
}

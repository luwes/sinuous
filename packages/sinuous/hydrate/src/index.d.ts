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

export const html: (strings: TemplateStringsArray, ...values: any[]) => VNode | VNode[];
export const svg: (strings: TemplateStringsArray, ...values: any[]) => VNode | VNode[];

export function h(
  type: string,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function h(
  type: FunctionComponent,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function h(
  children: ElementChildren[]
): VNode | VNode[];
export namespace h {
  export import JSX = JSXInternal;
}

export function hs(
  type: string,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function hs(
  type: FunctionComponent,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function hs(
  children: ElementChildren[]
): VNode | VNode[];
export namespace hs {
  export import JSX = JSXInternal;
}

import { JSXInternal } from '../../jsx-internal';
import { ElementChildren, FunctionComponent } from '../../shared';

interface VNode<P = {}> {
  type: string
  _props: object
  _children: VNode[]
  _isSvg: boolean
}

export function hydrate(delta: VNode, root?: Node): Node;

export const dhtml: (strings: TemplateStringsArray, ...values: any[]) => VNode | VNode[];
export const dsvg: (strings: TemplateStringsArray, ...values: any[]) => VNode | VNode[];

export function d(
  type: string,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function d(
  type: FunctionComponent,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function d(
  children: ElementChildren[]
): VNode | VNode[];
export namespace d {
  export import JSX = JSXInternal;
}

export function ds(
  type: string,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function ds(
  type: FunctionComponent,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): VNode | VNode[];
export function ds(
  children: ElementChildren[]
): VNode | VNode[];
export namespace ds {
  export import JSX = JSXInternal;
}

import { JSXInternal } from '../../jsx';
import { FunctionComponent, ElementChildren } from '../../shared';

interface TemplateResult<P = {}> {
  (): Node
}

export function render(delta: TemplateResult, root?: Node): Node;

export const rhtml: (strings: TemplateStringsArray, ...values: any[]) => TemplateResult;
export const rsvg: (strings: TemplateStringsArray, ...values: any[]) => TemplateResult;

export function r(
  type: string,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): TemplateResult;
export function r(
  type: FunctionComponent,
  props:
    | JSXInternal.HTMLAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): TemplateResult;
export function r(
  children: ElementChildren[]
): TemplateResult;
export namespace r {
  export import JSX = JSXInternal;
}

export function rs(
  type: string,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): TemplateResult;
export function rs(
  type: FunctionComponent,
  props:
    | JSXInternal.SVGAttributes &
      Record<string, any>
    | null,
  ...children: ElementChildren[]
): TemplateResult;
export function rs(
  children: ElementChildren[]
): TemplateResult;
export namespace rs {
  export import JSX = JSXInternal;
}

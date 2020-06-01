import { JSXInternal } from "../../jsx-internal";
import { ElementChildren, FunctionComponent } from "../../shared";

import { subscribe } from "../../observable/src";

export function h(
  type: string,
  props:
    | (JSXInternal.HTMLAttributes | JSXInternal.SVGAttributes) &
      Record<string, unknown>
    | null,
  ...children: ElementChildren[]
): HTMLElement;
export  function h(
  type: FunctionComponent,
  props:
    | (JSXInternal.HTMLAttributes | JSXInternal.SVGAttributes) &
      Record<string, unknown>
    | null,
  ...children: ElementChildren[]
): HTMLElement;
export  function h(
  children: ElementChildren[]
): DocumentFragment;
export namespace h {
  export import JSX = JSXInternal;
}

export interface HyperscriptApi {
  // Hyperscript
  h: typeof h;

  // Internal API
  insert<T>(el: Node, value: T, endMark?: Node, current?: T, startNode?: Node): T;
  property(el: Node, value: unknown, name: string, isAttr?: boolean, isCss?: boolean): void;
  add(parent: Node, value: Node | string, endMark?: Node): Node;
  rm(parent: Node, startNode: Node, endMark: Node): void;

  // Required from an observable implmentation
  subscribe: typeof subscribe;
}

export const api: HyperscriptApi;

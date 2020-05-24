export = sinuous;
export as namespace sinuous;

import { JSXInternal } from './jsx';
import { Observable, subscribe, cleanup, root, sample } from '../observable/src';

declare namespace sinuous {
  export import JSX = JSXInternal;

  type ElementChild =
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

  interface SinuousDOMAttributes {
    children?: ElementChildren;
  }

  interface FunctionComponent {
    (props: object, ...children: ElementChildren[]): Node
    (...children: ElementChildren[]): Node
  }

  function observable<T>(value: T): Observable<T>;
  function o<T>(value: T): Observable<T>;

  const html: (strings: TemplateStringsArray, ...values: unknown[]) => HTMLElement | DocumentFragment;
  const svg: (strings: TemplateStringsArray, ...values: unknown[]) => SVGElement | DocumentFragment;

  const svgWrap: <T extends () => unknown>(closure: T) => ReturnType<T>;

  function h(
    type: string,
    props:
      | JSXInternal.HTMLAttributes &
        Record<string, unknown>
      | null,
    ...children: ElementChildren[]
  ): HTMLElement;
  function h(
    type: FunctionComponent,
    props:
      | JSXInternal.HTMLAttributes &
        Record<string, unknown>
      | null,
    ...children: ElementChildren[]
  ): HTMLElement;
  function h(
    children: ElementChildren[]
  ): DocumentFragment;
  namespace h {
    export import JSX = JSXInternal;
  }

  function hs(
    type: string,
    props:
      | JSXInternal.SVGAttributes &
        Record<string, unknown>
      | null,
    ...children: ElementChildren[]
  ): SVGElement;
  function hs(
    type: FunctionComponent,
    props:
      | JSXInternal.SVGAttributes &
        Record<string, unknown>
      | null,
    ...children: ElementChildren[]
  ): SVGElement;
  function hs(
    children: ElementChildren[]
  ): DocumentFragment;
  namespace hs {
    export import JSX = JSXInternal;
  }

  /** Sinuous API */
  interface Api {
    // Hyperscript
    h: typeof h;
    hs: typeof hs;

    // Internal API
    insert<T>(el: Node, value: T, endMark?: Node, current?: T, startNode?: Node): T;
    property(el: Node, value: unknown, name: string, isAttr?: boolean, isCss?: boolean): void;
    add(parent: Node, value: Node | string, endMark?: Node): Node;
    rm(parent: Node, startNode: Node, endMark: Node): void;

    // Observables
    subscribe: typeof subscribe;
    cleanup: typeof cleanup;
    root: typeof root;
    sample: typeof sample;
  }

  const api: Api;

}

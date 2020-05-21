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

  const svgJSX: <T extends () => unknown>(closure: T) => ReturnType<T>;

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

  /**
   * Options required for reactive state, defaults to the Sinuous observable API.
   */
  interface Options {
    subscribe: typeof subscribe;
    cleanup: typeof cleanup;
    root: typeof root;
    sample: typeof sample;
  }

  /**
   * Creates a new hyperscript function with the passed reactive API.
   * @param apiOverloads Written into the API object
   * @param state For inflight changes; `hs` is fixed to `{ svgMode: true }`
   */
  function context(options: Options, state?: { svgMode: boolean }): typeof h | typeof hs;

  /**
   * Sinuous internal API.
   */
  interface Api extends Options {
    h: typeof h;
    hs: typeof hs;
    insert<T>(el: Node, value: T, endMark?: Node, current?: T, startNode?: Node): T;
    property(el: Node, value: unknown, name: string, isAttr?: boolean, isCss?: boolean): void;
    add(parent: Node, value: Node | string, endMark?: Node): Node;
    rm(parent: Node, startNode: Node, endMark: Node): void;
  }

  const api: Api;

}

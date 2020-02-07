export = sinuous;
export as namespace sinuous;

import { JSXInternal } from './jsx';
import { Observable, ObservableCreator, subscribe, cleanup, root, sample } from '../observable/src';

declare namespace sinuous {
  export import JSX = JSXInternal;

  type ElementChild =
    | Node
    | Function
    | Observable<any>
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

  interface FunctionComponent<P = {}> {
    (props: object, ...children: ElementChildren[]): any
    (...children: ElementChildren[]): any
  }

  const observable: ObservableCreator<any>;
  const o: ObservableCreator<any>;

  const html: (strings: TemplateStringsArray, ...values: any[]) => HTMLElement | DocumentFragment;
  const svg: (strings: TemplateStringsArray, ...values: any[]) => SVGElement | DocumentFragment;

  function h(
    type: string,
    props:
      | JSXInternal.HTMLAttributes &
        Record<string, any>
      | null,
    ...children: ElementChildren[]
  ): HTMLElement;
  function h(
    type: FunctionComponent,
    props:
      | JSXInternal.HTMLAttributes &
        Record<string, any>
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
        Record<string, any>
      | null,
    ...children: ElementChildren[]
  ): SVGElement;
  function hs(
    type: FunctionComponent,
    props:
      | JSXInternal.SVGAttributes &
        Record<string, any>
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
   * @param options
   * @param isSvg
   */
  function context(options: Options, isSvg?: boolean): typeof h | typeof hs;

  /**
   * Sinuous internal API.
   */
  interface Api extends Options {
    insert<T>(el: Node, value: T, marker?: Node, current?: T, startNode?: Node): T;
    property(el: Node, value: any, name: string, isAttr?: boolean, isCss?: boolean): void;
  }

  const api: Api;

}

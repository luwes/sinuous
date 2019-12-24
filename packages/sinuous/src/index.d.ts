export = sinuous;
export as namespace sinuous;

import { Observable, ObservableCreator } from '../observable/src';

declare namespace sinuous {
  const observable: ObservableCreator<Observable<any>>;
  const o: ObservableCreator<Observable<any>>;

  type ElementChild =
    | Node
    | object
    | string
    | number
    | boolean
    | null
    | undefined;
  type ElementChildren = ElementChild[] | ElementChild;

  const html: (strings: TemplateStringsArray, ...values: any[]) => HTMLElement | DocumentFragment;
  const svg: (strings: TemplateStringsArray, ...values: any[]) => SVGElement | DocumentFragment;

  function h(
    type: string,
    props: object,
    ...children: ElementChildren[]
  ): HTMLElement;
  function h(
    type: string,
    ...children: ElementChildren[]
  ): HTMLElement;
  function h(
    children: ElementChildren[]
  ): DocumentFragment;

  function hs(
    type: string,
    props: object,
    ...children: ElementChildren[]
  ): SVGElement;
  function hs(
    type: string,
    ...children: ElementChildren[]
  ): SVGElement;
  function hs(
    children: ElementChildren[]
  ): DocumentFragment;

}

export = sinuous;
export as namespace sinuous;

import { Observable, ObservableCreator } from '../observable/src';

declare namespace sinuous {

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

  interface FunctionComponent<P = {}> {
    (props: object, ...children: ElementChildren[]): any
    (...children: ElementChildren[]): any
	}

  const observable: ObservableCreator<Observable<any>>;
  const o: ObservableCreator<Observable<any>>;

  const html: (strings: TemplateStringsArray, ...values: any[]) => HTMLElement | DocumentFragment;
  const svg: (strings: TemplateStringsArray, ...values: any[]) => SVGElement | DocumentFragment;

  function h(
    type: string | FunctionComponent,
    props: object,
    ...children: ElementChildren[]
  ): HTMLElement;
  function h(
    type: string | FunctionComponent,
    ...children: ElementChildren[]
  ): HTMLElement;
  function h(
    children: ElementChildren[]
  ): DocumentFragment;

  function hs(
    type: string | FunctionComponent,
    props: object,
    ...children: ElementChildren[]
  ): SVGElement;
  function hs(
    type: string | FunctionComponent,
    ...children: ElementChildren[]
  ): SVGElement;
  function hs(
    children: ElementChildren[]
  ): DocumentFragment;

}

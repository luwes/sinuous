export = sinuous;
export as namespace sinuous;

import { JSXInternal } from '../jsx-internal';
import { HyperscriptApi } from '../h/src';
import * as _shared from '../shared'
import * as _o from '../observable/src';

// Adapted from Preact's index.d.ts
// Namespace prevents conflict with React typings
declare namespace sinuous {
  export import JSX = JSXInternal;
  import FunctionComponent = _shared.FunctionComponent;
  import ElementChildren = _shared.ElementChildren;

  interface SinuousDOMAttributes {
    children?: ElementChildren;
  }

  export import observable = _o.observable;
  export import o = _o.o;

  const html: (strings: TemplateStringsArray, ...values: unknown[]) => HTMLElement | DocumentFragment;
  const svg: (strings: TemplateStringsArray, ...values: unknown[]) => SVGElement | DocumentFragment;

  // Split HyperscriptApi's h() tag into functions with more narrow typings
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
  interface SinuousApi extends HyperscriptApi {
    // Hyperscript
    h: typeof h;
    hs: typeof hs;

    // Observable
    subscribe: typeof _o.subscribe;
    cleanup: typeof _o.cleanup;
    root: typeof _o.root;
    sample: typeof _o.sample;
  }

  const api: SinuousApi;

}

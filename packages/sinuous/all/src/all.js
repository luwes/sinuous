import * as hydrate from 'sinuous/hydrate';
export { hydrate };
export { html, svg, h, hs, api, context } from 'sinuous';
export { map } from 'sinuous/map/mini';
export * from 'sinuous/observable';

const oldS = self.S;
export function noConflict() {
  self.S = oldS;
  return self.sinuous;
}

import * as hydrate from 'sinuous/hydrate';
export { hydrate };
export { html, svg, h, hs, api } from 'sinuous';
export { map } from 'sinuous/map';
export * from 'sinuous/observable';

const oldS = self.S;
export function noConflict() {
  self.S = oldS;
  return self.sinuous;
}

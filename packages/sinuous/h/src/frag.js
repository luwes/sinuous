/* eslint fp/no-this:0 fp/no-valueof-field:0 */
import { EMPTY_ARR } from './constants.js';

export function frag(childNodes) {
  childNodes = EMPTY_ARR.slice.call(childNodes);

  const firstChild = childNodes[0];
  const lastChild = childNodes[childNodes.length - 1];
  let fragment;

  const instance = {
    firstChild,
    lastChild,
    childNodes,
    nodeType: 22,
    valueOf() {
      fragment = fragment || document.createDocumentFragment();
      childNodes.forEach(child => {
        child._frag = instance;
        fragment.appendChild(child);
      });
      return fragment;
    },
    remove() {
      fragment = null;
      childNodes.forEach(child => {
        child._frag = null;
        child.parentNode.removeChild(child);
      });
    }
  };
  return instance;
}

/**
 * Internal API.
 * Consumer must provide an observable at api.subscribe<T>(observer: () => T).
 *
 * @typedef {boolean} hSVG Determines if `h` will build HTML or SVG elements
 * @type {{
 * h:         import('./h.js').hTag
 * s:         hSVG
 * insert:    import('./insert.js').hInsert
 * property:  import('./property.js').hProperty
 * add:       import('./add.js').hAdd
 * rm:        import('./remove-nodes.js').hRemoveNodes
 * subscribe: (observer: () => *) => void
 * }}
 */
// @ts-ignore Object is populated in index.js
export const api = {};

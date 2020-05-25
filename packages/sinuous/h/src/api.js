/**
 * Internal API.
 *
 * @typedef {0 | 1} hSVG Determines if `h` will build HTML or SVG elements
 * @type {{
 * h:         import('./h.js').hTag
 * s:         hSVG
 * insert:    import('./insert.js').hInsert
 * property:  import('./property.js').hProperty
 * add:       import('./add.js').hAdd
 * rm:        import('./remove-nodes.js').hRemoveNodes
 * }}
 */
export const api = {};

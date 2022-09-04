import MagicString from 'magic-string';

/**
 * @typedef {import('rollup').Plugin} Plugin
 * @typedef {(match?: RegExpMatchArray) => string} MatchFn
 * @typedef {{ search: RegExp | string, eachMatch: MatchFn }} Replacer
 * @typedef {{ sourcemap?: boolean }} Options
 */

/**
 * Replace with regular expressions
 *
 * Supports short or long form parameters:
 *  (search, eachMatch, options) =>
 *  ([{ search, eachMatch }, ...], options) =>
 *
 * @type {(
    searchOrList: RegExp | Replacer[],
    eachMatch?: MatchFn | Options,
    options?: Options
   ) => Plugin}
 */
export default function replace(searchOrList, eachMatch, options = {}) {
  const replacements = Array.isArray(searchOrList)
    ? searchOrList
    : [
        {
          search: searchOrList,
          eachMatch,
        },
      ];

  // Support `options` as the second parameter for `(list, options) =>` form
  if (replacements === searchOrList && typeof options === 'undefined')
    options = eachMatch;

  if (options.sourcemap !== false) options.sourcemap = true;

  return {
    name: 'replace-output-plugin',
    renderChunk(code, chunk) {
      const magicString = new MagicString(code);
      const id = chunk.fileName;

      let matched = false;
      let match;
      for (const { search, eachMatch } of replacements) {
        // Must assign a new object with global flag to avoid an infinite loop
        const pattern = new RegExp(search, 'g');
        // Debug: console.log(`RPL: ${id} "${search.toString()}"`);
        while ((match = pattern.exec(code))) {
          matched = true;
          const start = match.index;
          const end = start + match[0].length;
          const replacement = eachMatch(match);
          // Debug: console.log('\t', id, match[0], replacement);
          magicString.overwrite(start, end, replacement);
        }
      }
      if (!matched) {
        return null;
      }
      const result = { code: magicString.toString() };
      if (options.sourcemap) {
        result.map = magicString.generateMap({ hires: true });
      }
      return result;
    },
  };
}

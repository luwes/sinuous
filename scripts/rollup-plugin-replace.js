import MagicString from 'magic-string';

/**
 * @typedef {import('rollup').Plugin} Plugin
 * @typedef {(match?: RegExpMatchArray) => string} MatchFn
 * @typedef {{ search: RegExp | string, eachMatch: MatchFn }} Replacer
 * @typedef {{ sourcemap?: boolean }} Options
 */

/** @type {(replacements: Replacer[], options: Options) => Plugin} */
export default (replacements, options = {}) => ({
  name: 'replace-output-plugin',
  renderChunk(code, chunk) {
    const magicString = new MagicString(code);
    const id = chunk.fileName;

    let matched = false;
    let match;
    for (const { search, eachMatch } of replacements) {
      const pattern = search instanceof RegExp
        ? search
        : new RegExp(search);

      while ((match = pattern.exec(code))) {
        matched = true;
        const start = match.index;
        const end = start + match[0].length;
        const replacement = eachMatch(match);
        console.log(id, match, replacement);
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
});

export function normalizeSvg(html) {
  // IE doesn't support `.outerHTML` of an SVG element.
  const htmlStr =
    typeof html === 'string'
      ? html
      : new XMLSerializer().serializeToString(html);

  // Normalization logic from Preact test helpers.
  return normalizeAttributes(
    htmlStr.replace(' xmlns="http://www.w3.org/2000/svg"', '')
  );
}

export function normalizeAttributes(htmlStr) {
  return htmlStr.replace(
    /<([a-z0-9-]+)((?:\s[a-z0-9:_.-]+=".*?")+)((?:\s*\/)?>)/gi,
    (s, pre, attrs, after) => {
      let list = attrs
        .match(/\s[a-z0-9:_.-]+=".*?"/gi)
        .sort((a, b) => (a > b ? 1 : -1));
      if (~after.indexOf('/')) after = '></' + pre + '>';
      return '<' + pre + list.join('') + after;
    }
  );
}

export function fragInnerHTML(fragment) {
  return [].slice
    .call(fragment.childNodes)
    .map(c => c.outerHTML)
    .join('');
}

export function beforeEach(test, handler) {
  return function tapish(name, listener) {
    test(name, function(assert) {
      var _end = assert.end;
      assert.end = function() {
        assert.end = _end;
        listener(assert);
      };

      handler(assert);
    });
  };
}

export function stripExpressionMarkers(value) {
  return value;
}

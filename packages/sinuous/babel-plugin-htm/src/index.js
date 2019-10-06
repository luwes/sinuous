import { build, treeify } from '../../htm/src/build.js';

/**
 * @param {Babel} babel
 * @param {object} options
 * @param {string} [options.pragma=h]  JSX/hyperscript pragma.
 * @param {string} [options.tag=html]  The tagged template "tag" function name to process.
 * @param {boolean} [options.monomorphic=false]  Output monomorphic inline objects instead of using String literals.
 * @param {boolean} [options.useBuiltIns=false]  Use the native Object.assign instead of trying to polyfill it.
 * @param {boolean} [options.useNativeSpread=false]  Use the native { ...a, ...b } syntax for prop spreads.
 * @param {boolean} [options.variableArity=true] If `false`, always passes exactly 3 arguments to the pragma function.
 */
export default function htmBabelPlugin({ types: t }, options = {}) {
  const pragma = options.pragma===false ? false : (options.pragma || 'h|hs');
  const useBuiltIns = options.useBuiltIns;
  const useNativeSpread = options.useNativeSpread;
  const inlineVNodes = options.monomorphic || pragma===false;
  let currentPragma;

  // The tagged template tag function name we're looking for.
  // This is static because it's generally assigned via htm.bind(h),
  // which could be imported from elsewhere, making tracking impossible.
  const htmlName = options.tag || '/html|svg/';

  function TaggedTemplateExpression(path, state) {
    const tag = path.node.tag.name;
    let match = tag === htmlName;
    let matchName = htmlName;
    if (htmlName[0]==='/') {
      match = tag.match(patternStringToRegExp(htmlName));
      matchName = match && match[0];
    }

    if (match) {
      const matchIndex = htmlName.replace(/\//g, '').split('|').indexOf(matchName);
      currentPragma = pragma && dottedIdentifier(pragma.split('|')[matchIndex]);

      const statics = path.node.quasi.quasis.map(e => e.value.raw);
      const expr = path.node.quasi.expressions;

      let tree = treeify(build(statics), expr);

      // Turn array expression in Array so it can be converted below
      // to a pragma call expression for fragments.
      if (t.isArrayExpression(tree)) {
        tree = tree.elements;
      }

      const node = Array.isArray(tree)
        ? t.callExpression(currentPragma, [
            t.arrayExpression(tree.map(root => transform(root, state)))
          ])
        : t.isNode(tree)
        ? t.callExpression(currentPragma, [
            t.arrayExpression([transform(tree, state)])
          ])
        : transform(tree, state);

      path.replaceWith(node);
    }
  }

  function patternStringToRegExp(str) {
    const parts = str.split('/').slice(1);
    const end = parts.pop() || '';
    return new RegExp(parts.join('/'), end);
  }

  function dottedIdentifier(keypath) {
    const path = keypath.split('.');
    let out;
    for (let i=0; i<path.length; i++) {
      const ident = propertyName(path[i]);
      out = i===0 ? ident : t.memberExpression(out, ident);
    }
    return out;
  }

  function transform(node, state) {
    if (t.isNode(node)) return node;
    if (typeof node === 'string') return stringValue(node);
    if (node === undefined) return t.identifier('undefined');

    const { tag, props, children } = node;
    const newTag = typeof tag === 'string' ? t.stringLiteral(tag) : tag;
    const newProps = spreadNode(props, state);
    const newChildren = t.arrayExpression((children || []).map(child => transform(child, state)));
    return createVNode(newTag, newProps, newChildren);
  }

  function stringValue(str) {
    if (options.monomorphic) {
      return t.objectExpression([
        t.objectProperty(propertyName('type'), t.numericLiteral(3)),
        t.objectProperty(propertyName('tag'), t.nullLiteral()),
        t.objectProperty(propertyName('props'), t.nullLiteral()),
        t.objectProperty(propertyName('children'), t.nullLiteral()),
        t.objectProperty(propertyName('text'), t.stringLiteral(str))
      ]);
    }
    return t.stringLiteral(str);
  }

  function spreadNode(args, state) {
    if (!args || args.length === 0) {
      return t.nullLiteral();
    }
    if (args.length > 0 && t.isNode(args[0])) {
      args.unshift({});
    }

    // 'Object.assign(x)', can be collapsed to 'x'.
    if (args.length === 1) {
      return propsNode(args[0]);
    }
    // 'Object.assign({}, x)', can be collapsed to 'x'.
    if (args.length === 2 && !t.isNode(args[0]) && Object.keys(args[0]).length === 0) {
      return propsNode(args[1]);
    }

    if (useNativeSpread) {
      const properties = [];
      args.forEach(arg => {
        if (t.isNode(arg)) {
          properties.push(t.spreadElement(arg));
        }
        else {
          properties.push(...objectProperties(arg));
        }
      });
      return t.objectExpression(properties);
    }

    const helper = useBuiltIns ? dottedIdentifier('Object.assign') : state.addHelper('extends');
    return t.callExpression(helper, args.map(propsNode));
  }

  function propsNode(props) {
    return t.isNode(props) ? props : t.objectExpression(objectProperties(props));
  }

  function objectProperties(obj) {
    return Object.keys(obj).map(key => {
      const values = obj[key].map(valueOrNode =>
        t.isNode(valueOrNode) ? valueOrNode : t.valueToNode(valueOrNode)
      );

      let node = values[0];
      if (values.length > 1 && !t.isStringLiteral(node) && !t.isStringLiteral(values[1])) {
        node = t.binaryExpression('+', t.stringLiteral(''), node);
      }
      values.slice(1).forEach(value => {
        node = t.binaryExpression('+', node, value);
      });

      return t.objectProperty(propertyName(key), node);
    });
  }

  function createVNode(tag, props, children) {
    // Never pass children=[[]].
    if (
      children.elements.length === 1 &&
      t.isArrayExpression(children.elements[0]) &&
      children.elements[0].elements.length === 0
    ) {
      children = children.elements[0];
    }

    if (inlineVNodes) {
      return t.objectExpression([
        options.monomorphic && t.objectProperty(propertyName('type'), t.numericLiteral(1)),
        t.objectProperty(propertyName('tag'), tag),
        t.objectProperty(propertyName('props'), props),
        t.objectProperty(propertyName('children'), children),
        options.monomorphic && t.objectProperty(propertyName('text'), t.nullLiteral())
      ].filter(Boolean));
    }

    // Passing `{variableArity:false}` always produces `h(tag, props, children)` - where `children` is always an Array.
    // Otherwise, the default is `h(tag, props, ...children)`.
    if (options.variableArity !== false) {
      children = children.elements;
    }

    return t.callExpression(currentPragma, [tag, props].concat(children));
  }

  function propertyName(key) {
    if (t.isValidIdentifier(key)) {
      return t.identifier(key);
    }
    return t.stringLiteral(key);
  }

  return {
    name: 'htm',
    visitor: {
      TaggedTemplateExpression
    }
  };
}

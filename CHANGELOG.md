# Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## 0.12.7 - 2019-07-28

### Fixed

- Fixed [Plain computed in root doesn't return result #22](https://github.com/luwes/sinuous/issues/22)

## 0.12.6 - 2019-07-28

### Fixed

- Fixed naming issue for umd and iife bundles
- Add observable duplicate edges check
- Replace Map w/ array for `map` disposers

## 0.12.5 - 2019-07-23

### Fixed

- Fixed [Plain array in root doesn't return `DocumentFragment` #19](https://github.com/luwes/sinuous/issues/19)

## 0.12.4 - 2019-07-23

### Fixed

- Fixed [template` inserts with duplicate value are empty #14](https://github.com/luwes/sinuous/issues/14)

## 0.12.3 - 2019-07-22

### Fixed

- Fixed [Incorrect updating of observable #18](https://github.com/luwes/sinuous/issues/18)

### Changed

- Upgraded `sinuous/htm` and `sinuous/babel-plugin-htm` to latest version.

## 0.12.2 - 2019-07-21

### Added

- Added support for plain array inserts again w/ no size increase.

## 0.12.1 - 2019-07-19

### Changed

- Make `map` return a DocumentFragment.
- Optimized and re-used code for full replace in `map`.

## 0.12.0 - 2019-07-17

### Added

- Added SVG support.

### Removed

- Removed plain array inserts. Fragments can be used for this aka

```js
  html` 
    <h1>Title</h1>
    <p>Some text</p>
  `
```

## 0.11.4 - 2019-07-07

### Changed

- Prioritized string and numeric values for `insert`.

## 0.11.3 - 2019-07-07

### Removed

- Removed array to node support in `insert`. Save some bytes.

## 0.11.2 - 2019-07-07

### Changed

- Fixed mixed exports
  It's not recommended to have a default AND named exports

### Removed

- Removed multi expressions

## 0.11.1 - 2019-07-04

### Added

- Added minified browser version `.min.js`.

### Removed

- Removed shorthand tag parser from hyperscript.
- Removed specialized attribute `ref`.
  No need w/ Sinuous since it returns plain elements.
- Removed unneeded api on `h` tag.

### Changed

- Optimized rollup/terser config for smaller bundle.

## 0.11.0 - 2019-07-03

### Added

- Added `sinuous/htm` and `sinuous/babel-plugin-htm` supporting fragments.
- Added easy import `import { html } from 'sinuous';`

## 0.10.1 - 2019-07-02

### Changed

- Removed specialized attribute `bindings`.
- Removed specialized Capture syntax.
- Used Sinuous's normalizeArray in `map`, save bytes.

## 0.10.0 - 2019-06-30 - BREAKING CHANGES

### Changed

- Removed `classList` property handler, this can be done with a function.
- Removed specialized `events` property, HTM supports spread props.
- Removed initial execution of non observable event handlers so there is now no need for the extra closure. Fixes [#3](https://github.com/luwes/sinuous/issues/3)
- Removed Date, RegExp coercion This can be done in the view.

## 0.9.2 - 2019-06-29

### Changed

- Removed `named: true` in rollup config to fix `default` import.

## 0.9.1 - 2019-06-29

### Changed

- Optimized template insert action w/ Text.data
- Changed .mjs to .esm.js to fix submodule issue

## 0.9.0 - 2019-06-22

### Removed

- Removed support for the legacy [`observable` library](https://github.com/dominictarr/observable)
  It has some limitations:
  - Not possible to store a function because passing a function as argument of the observable setter acts as the `subscribe` function.
    Because of this every observable has its own `subscribe` function.
  - Needs extra cleanup logic

### Added

- First release

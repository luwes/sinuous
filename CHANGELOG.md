# Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

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

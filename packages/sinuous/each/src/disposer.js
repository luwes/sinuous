export default function createDisposer() {
  let _disposables = new Map();

  function _disposeAll() {
    _disposables.forEach((d) => d());
    _disposables.clear();
  }

  function _dispose(node) {
    let disposable;
    (disposable = _disposables.get(node)) && disposable();
    _disposables.delete(node);
  }

  return {
    _disposables,
    _dispose,
    _disposeAll
  };
}

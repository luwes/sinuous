export default function createDisposer() {
  let _disposables = new Map();

  function _disposeAll() {
    for (let i of _disposables.keys()) _disposables.get(i)();
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

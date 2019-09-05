(function() {
  var defaultContext = this;
  var __id = 0;

  function $R(fnc, context) {
      var rf = function() {
        var dirtyNodes = topo(rf);
        var v = dirtyNodes[0].run.apply(rf, arguments);
        dirtyNodes.slice(1).forEach(function (n) { n.run(); } );
        return v;
      };
      rf.id = __id++;
      rf.context = context || defaultContext;
      rf.fnc = fnc;
      rf.dependents = [];
      rf.dependencies = [];
      rf.memo = $R.empty;
      return $R.extend(rf, reactiveExtensions, $R.pluginExtensions);
  }
  $R.version = "1.0.0";
  $R._ = {};
  $R.empty = {};
  $R.state = function (initial) {
    var rFnc = $R(function () {
      return this.val;
    });
    rFnc.context = rFnc;
    rFnc.val = initial;
    rFnc.set = $R(function(value) { this.val = value; return this(); }.bind(rFnc));
    rFnc.modify = $R(function(transform) { return this.set(transform(this.val)); }.bind(rFnc));
    return rFnc;
  };
  $R.extend = function(o) {
    var extensions = Array.prototype.slice.call(arguments, 1);
    extensions.forEach(function (extension) {
      if (extension) {
        for (var prop in extension) { o[prop] = extension[prop]; }
      }
    });
    return o;
  };
  $R.pluginExtensions = {};

  var reactiveExtensions = {
    _isReactive: true,
    toString: function () { return this.fnc.toString(); },
    get: function() { return this.memo === $R.empty ? this.run() : this.memo; },
    run: function() {
      var unboundArgs = Array.prototype.slice.call(arguments);
      return this.memo = this.fnc.apply(this.context, this.argumentList(unboundArgs));
    },
    bindTo: function() {
      var newDependencies = Array.prototype.slice.call(arguments).map(wrap);
      var oldDependencies = this.dependencies;

      oldDependencies.forEach(function (d) {
        if (d !== $R._) { d.removeDependent(this); }
      }, this);

      newDependencies.forEach(function (d) {
        if (d !== $R._) { d.addDependent(this); }
      }, this);

      this.dependencies = newDependencies;
      return this;
    },
    removeDependent: function(rFnc) {
      this.dependents = this.dependents.filter(function (d) { return d !== rFnc; });
    },
    addDependent: function(rFnc) {
      if (!this.dependents.some(function (d) { return d === rFnc; })) {
        this.dependents.push(rFnc);
      }
    },
    argumentList: function(unboundArgs) {
      return this.dependencies.map(function(dependency) {
        if (dependency === $R._) {
          return unboundArgs.shift();
        } else if (dependency._isReactive) {
          return dependency.get();
        } else {
          return undefined;
        }
      }).concat(unboundArgs);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = $R;
  } else {
    defaultContext.$R = $R;
  }

  //Private
  function topo(rootFnc) {
    var explored = {};
    function search(rFnc) {
      if (explored[rFnc.id]) { return []; }
      explored[rFnc.id] = true;
      return rFnc.dependents.reduce(function (acc, dep) { return acc.concat(search(dep))},[]).concat(rFnc);
    }

    return search(rootFnc).reverse();
  }

  function wrap(v) {
    return v && (v._isReactive || v == $R._) ? v : $R(function () {return v;});
  }
})();
/**
 * @name $jin
 * @class $jin
 * @singleton
 */
this.$jin = {}

;
var $jin;
(function ($jin) {
    var object = (function () {
        function object(name) {
            this.objectName = name || '' + ++$jin.object._object_seed;
        }
        object.create = function (config) {
            var parent = this;
            var klass = config.hasOwnProperty('constructor') ? config['constructor'] : function () {
                parent.apply(this, arguments);
            };
            klass.prototype = Object.create(this.prototype);
            for (var key in config) {
                klass.prototype[key] = config[key];
            }
            return klass;
        };

        object.prototype.destroy = function () {
            this.havings.forEach(function (having) {
                return having.destroy();
            });
            this.owner = null;
        };

        Object.defineProperty(object.prototype, "havings", {
            get: function () {
                var havings = [];
                for (var field in this) {
                    if (!this.hasOwnProperty(field))
                        continue;
                    var value = this[field];
                    if (!value)
                        continue;
                    if (value.owner !== this)
                        continue;
                    havings.push(value);
                }
                return havings;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(object.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            set: function (owner) {
                if (owner) {
                    owner[this.objectName] = this;
                } else {
                    if (!this._owner)
                        return;
                    this._owner[this.objectName] = null;
                }
                this._owner = owner;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(object.prototype, "objectPath", {
            get: function () {
                var path = this.objectName;
                if (this._owner)
                    path = this._owner.objectPath + '.' + path;
                return path;
            },
            enumerable: true,
            configurable: true
        });

        object.prototype.toString = function () {
            return this.objectName;
        };
        object._object_seed = 0;
        return object;
    })();
    $jin.object = object;
})($jin || ($jin = {}));
//object.js.map

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    (function (prop) {
        var vary = (function (_super) {
            __extends(vary, _super);
            function vary(config) {
                _super.call(this, config.name);

                this._host = config.owner || this;

                if (config.pull)
                    this._pull = config.pull;
                if (config.get)
                    this._get = config.get;
                if (config.merge)
                    this._merge = config.merge;
                if (config.put)
                    this._put = config.put;
                if (config.clear)
                    this._clear = config.clear;

                return this;
            }
            vary.prototype._get = function (value) {
                return value;
            };
            vary.prototype._pull = function (prev) {
                return prev;
            };
            vary.prototype._merge = function (next, prev) {
                return next;
            };
            vary.prototype._put = function (next, prev) {
                this._host[this.objectName] = next;
            };
            vary.prototype._clear = function (prev) {
            };

            vary.prototype.clear = function () {
                var prev = this._host[this.objectName];
                this._host[this.objectName] = undefined;
                this._clear(prev);
            };

            vary.prototype.value = function () {
                return this._host[this.objectName];
            };

            vary.prototype.push = function (next) {
                next = this._merge(next, this.value());
                this._host[this.objectName] = next;
                return next;
            };

            vary.prototype.get = function () {
                var value = this.value();
                if (value !== undefined)
                    return this._get(value);

                var next = this._pull(value);
                next = this._merge(next, value);
                this._host[this.objectName] = next;

                return this._get(next);
            };

            vary.prototype.pull = function () {
                var value = this.value();
                value = this._pull(value);
                value = this.push(value);
                return value;
            };

            vary.prototype.update = function () {
                if (this.value() !== undefined) {
                    this.pull();
                }
            };

            vary.prototype.set = function (next) {
                var prev = this.value();
                next = this._merge(next, prev);
                if (next !== prev) {
                    this._put(next, prev);
                }
            };
            return vary;
        })($jin.object);
        prop.vary = vary;
    })($jin.prop || ($jin.prop = {}));
    var prop = $jin.prop;
})($jin || ($jin = {}));
//vary.js.map

;
var $jin;
(function ($jin) {
    (function (prop) {
        var proxy = (function () {
            function proxy(config) {
                if (config.pull)
                    this.get = config.pull;
                if (config.put)
                    this.set = config.put;
                return this;
            }
            proxy.prototype.get = function () {
                return undefined;
            };

            proxy.prototype.set = function (next) {
            };
            return proxy;
        })();
        prop.proxy = proxy;
    })($jin.prop || ($jin.prop = {}));
    var prop = $jin.prop;
})($jin || ($jin = {}));
//proxy.js.map

;
var $jin;
(function ($jin) {
    var schedule = (function () {
        function schedule(timeout, handler) {
            this._handler = handler;
            this.start(timeout);
        }
        schedule.prototype.isScheduled = function () {
            return this._timer != null;
        };

        schedule.prototype.start = function (timeout) {
            if (this._timer)
                return;
            this._timer = setTimeout(this._handler, timeout);
        };

        schedule.prototype.stop = function () {
            clearTimeout(this._timer);
            this._timer = null;
        };

        schedule.prototype.destroy = function () {
            this.stop();
        };
        schedule._queue = [];
        return schedule;
    })();
    $jin.schedule = schedule;
})($jin || ($jin = {}));
//schedule.js.map

;
var $jin;
(function ($jin) {
    var defer = (function () {
        function defer(handler) {
            this._handler = handler;
            $jin.defer.start(this);
        }
        defer.schedule = function () {
            if (this._schedule)
                return;
            if (!this._queue.length)
                return;

            this._schedule = new $jin.schedule(0, $jin.defer.run);
        };

        defer.start = function (defer) {
            this._queue.push(defer);
            this.schedule();
        };

        defer.stop = function (defer) {
            var index = this._queue.indexOf(defer);
            if (index >= 0)
                this._queue.splice(index, 1);
        };

        defer.callback = function (func) {
            return function () {
                var result = func.apply(this, arguments);
                $jin.defer.run();
                return result;
            };
        };

        defer.run = function () {
            $jin.defer._schedule = undefined;
            $jin.defer.schedule();
            var defer;
            while (defer = $jin.defer._queue.shift()) {
                defer.run();
            }
        };

        defer.prototype.destroy = function () {
            $jin.defer.stop(this);
        };

        defer.prototype.run = function () {
            this._handler();
        };
        defer._queue = [];
        return defer;
    })();
    $jin.defer = defer;
})($jin || ($jin = {}));
//defer.js.map

;
var $jin;
(function ($jin) {
    var enumeration = (function () {
        function enumeration(_name) {
            this._name = _name;
        }
        enumeration.prototype.toString = function () {
            return this._name;
        };
        return enumeration;
    })();
    $jin.enumeration = enumeration;
})($jin || ($jin = {}));
//enumeration.js.map

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    (function (atom) {
        var status = (function (_super) {
            __extends(status, _super);
            function status() {
                _super.apply(this, arguments);
            }
            status.clear = new status('clear');
            status.pull = new status('pull');
            status.actual = new status('actual');
            status.error = new status('error');
            return status;
        })($jin.enumeration);
        atom.status = status;
    })($jin.atom || ($jin.atom = {}));
    var atom = $jin.atom;
})($jin || ($jin = {}));
//status.js.map

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    (function (atom) {
        var prop = (function (_super) {
            __extends(prop, _super);
            function prop(config) {
                _super.call(this, config.name);
                this._status = $jin.atom.status.clear;
                this._masters = {};
                this._mastersDeep = 0;
                this._slavesCount = 0;

                this._value = config.value;

                var field = config.name;

                var owner = config.owner;
                if (owner) {
                    var prop = owner[field];
                    if (prop)
                        return prop;
                    this.owner = owner;
                }

                if (config.pull)
                    this._pull = config.pull;
                if (config.get)
                    this._get = config.get;
                if (config.merge)
                    this._merge = config.merge;
                if (config.put)
                    this._put = config.put;
                if (config.reap)
                    this._reap = config.reap;
                if (config.notify)
                    this._notify = config.notify;
                if (config.fail)
                    this._fail = config.fail;
            }
            prop.swap = function (atom) {
                var last = this.currentSlave;
                this.currentSlave = atom;
                return last;
            };

            prop.induceSchedule = function () {
                var _this = this;
                if (!this._defer) {
                    this._defer = new $jin.defer(function () {
                        return _this.induce();
                    });
                }
            };

            prop.updateSchedule = function (atom) {
                var deep = atom.mastersDeep();
                var plan = this._updatePlan;
                var queue = plan[deep];
                if (!queue)
                    queue = plan[deep] = [];
                queue.push(atom);

                this.induceSchedule();
            };

            prop.reapSchedule = function (atom) {
                var plan = this._reapPlan[atom.objectPath] = atom;

                this.induceSchedule();
            };

            prop.induce = function () {
                var updatePlan = $jin.atom.prop._updatePlan;
                for (var deep = 0; deep < updatePlan.length; ++deep) {
                    var queue = updatePlan[deep];
                    if (!queue)
                        continue;
                    if (!queue.length)
                        continue;

                    var atom = queue.shift();
                    if (atom.status() === $jin.atom.status.clear) {
                        atom.pull();
                    }

                    deep = -1;
                }

                var reapPlan = $jin.atom.prop._reapPlan;
                this._reapPlan = {};

                for (var id in reapPlan) {
                    var atom = reapPlan[id];
                    if (!atom)
                        continue;
                    if (atom.slavesCount() !== 0)
                        continue;
                    atom._reap();
                }

                this._defer = null;
            };

            prop.prototype.destroy = function () {
                this.clear();
                _super.prototype.destroy.call(this);
            };

            prop.prototype.status = function () {
                return this._status;
            };

            prop.prototype.value = function () {
                return this._value;
            };

            prop.prototype.error = function () {
                return this._error;
            };

            prop.prototype.mastersDeep = function () {
                return this._mastersDeep;
            };

            prop.prototype.slavesCount = function () {
                return this._slavesCount;
            };

            prop.prototype._get = function (value) {
                return value;
            };

            prop.prototype._pull = function (prev) {
                return prev;
            };

            prop.prototype._merge = function (next, prev) {
                return next;
            };

            prop.prototype._put = function (next, prev) {
                this.push(next);
            };

            prop.prototype._reap = function () {
                this.destroy();
            };

            prop.prototype._notify = function (next, prev) {
            };

            prop.prototype._fail = function (error) {
            };

            prop.prototype.push = function (next) {
                var prev = this._value;
                next = this.merge(next, prev);
                this._status = $jin.atom.status.actual;
                this._value = next;
                if ((next !== prev) || this._error) {
                    this.notify(null, next, prev);
                }
                this._error = undefined;
                return next;
            };

            prop.prototype.fail = function (error) {
                this._status = $jin.atom.status.error;
                if (this._error !== error) {
                    this._error = error;
                    this.notify(error, undefined, this._value);
                    this._value = undefined;
                }
                return error;
            };

            prop.prototype.notify = function (error, next, prev) {
                if (this._slavesCount) {
                    for (var slaveId in this._slaves) {
                        var slave = this._slaves[slaveId];
                        if (!slave)
                            continue;

                        slave.update();
                    }
                }
                if (error) {
                    this._fail(error);
                } else {
                    this._notify(next, prev);
                }
            };

            prop.prototype.update = function () {
                if (this._status === $jin.atom.status.clear) {
                    return;
                }

                if (this._status === $jin.atom.status.pull) {
                    return;
                }

                this._status = $jin.atom.status.clear;

                $jin.atom.prop.updateSchedule(this);
            };

            prop.prototype.touch = function () {
                var slave = $jin.atom.prop.currentSlave;
                if (slave) {
                    this.lead(slave);
                    slave.obey(this);
                } else {
                    this.reap();
                }
            };

            prop.prototype.get = function () {
                if (this._status === $jin.atom.status.pull) {
                    throw new Error('Cyclic dependency of atom:' + this.objectPath);
                }

                this.touch();

                if (this._status === $jin.atom.status.clear) {
                    this.pull();
                }

                if (this._status === $jin.atom.status.error) {
                    throw this._error;
                }

                if (this._status === $jin.atom.status.actual) {
                    return this._get(this._value);
                }

                throw new Error('Unknown status ' + this._status);
            };

            prop.prototype.pull = function () {
                var lastCurrent = $jin.atom.prop.swap(this);

                var oldMasters = this._masters;
                this._masters = {};

                this._status = $jin.atom.status.pull;

                try  {
                    var value = this._value;
                    value = this._pull(value);
                    this.push(value);
                } catch (error) {
                    this.fail(error);
                } finally {
                    $jin.atom.prop.swap(lastCurrent);

                    for (var masterId in oldMasters) {
                        var master = oldMasters[masterId];
                        if (!master)
                            continue;

                        if (this._masters[masterId])
                            continue;

                        master.dislead(this);
                    }
                }
            };

            prop.prototype.set = function (next) {
                var prev = this._value;

                next = this.merge(next, prev);

                if (next !== prev) {
                    this.put(next);
                }
            };

            prop.prototype.put = function (next) {
                return this._put(next, this._value);
            };

            prop.prototype.mutate = function (mutate) {
                this.set(mutate(this.get()));
            };

            prop.prototype.merge = function (next, prev) {
                return this._merge(next, prev);
            };

            prop.prototype.clear = function () {
                var prev = this._value;
                var next = this._value = undefined;

                this.disobeyAll();
                this._status = $jin.atom.status.clear;
                this.notify(null, next, prev);
            };

            prop.prototype.reap = function () {
                $jin.atom.prop.reapSchedule(this);
            };

            prop.prototype.lead = function (slave) {
                var slaveId = slave.objectPath;

                if (this._slaves) {
                    if (this._slaves[slaveId])
                        return;
                } else {
                    this._slaves = {};
                }

                this._slaves[slaveId] = slave;

                this._slavesCount++;
            };

            prop.prototype.dislead = function (slave) {
                var slaveId = slave.objectPath;
                if (!this._slaves[slaveId])
                    return;

                this._slaves[slaveId] = null;

                if (!--this._slavesCount) {
                    this.reap();
                }
            };

            prop.prototype.disleadAll = function () {
                if (!this._slavesCount)
                    return;

                for (var slaveId in this._slaves) {
                    var slave = this._slaves[slaveId];
                    if (!slave)
                        continue;

                    slave.disobey(this);
                }

                this._slaves = null;
                this._slavesCount = 0;

                this.reap();
            };

            prop.prototype.obey = function (master) {
                if (this._masters[master.objectPath])
                    return;
                this._masters[master.objectPath] = master;

                var masterDeep = master.mastersDeep();
                if ((this._mastersDeep - masterDeep) > 0)
                    return;

                this._mastersDeep = masterDeep + 1;
            };

            prop.prototype.disobey = function (master) {
                this._masters[master.objectPath] = null;
            };

            prop.prototype.disobeyAll = function () {
                if (!this._mastersDeep)
                    return;

                for (var masterId in this._masters) {
                    var master = this._masters[masterId];
                    if (!master)
                        continue;

                    master.dislead(this);
                }

                this._masters = {};
                this._mastersDeep = 0;
                this._status = $jin.atom.status.clear;
            };

            prop.prototype.then = function (done, fail) {
                var _this = this;
                if (!done)
                    done = function (value) {
                        return value;
                    };
                if (!fail)
                    fail = function (error) {
                        return error;
                    };

                var promise = new $jin.atom.prop({
                    pull: function (prev) {
                        var next = _this.get();
                        if (next === prev)
                            return prev;

                        promise.disobeyAll();

                        return done(next);
                    },
                    fail: function (error) {
                        promise.disobeyAll();

                        fail(error);
                    }
                });

                promise.push(undefined);
                promise.update();

                return promise;
            };

            prop.prototype.catch = function (fail) {
                return this.then(null, fail);
            };
            prop._updatePlan = [];
            prop._reapPlan = {};
            return prop;
        })($jin.object);
        atom.prop = prop;
    })($jin.atom || ($jin.atom = {}));
    var atom = $jin.atom;
})($jin || ($jin = {}));
//atom.js.map

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    (function (atom) {
        var list = (function (_super) {
            __extends(list, _super);
            function list() {
                _super.apply(this, arguments);
            }
            list.prototype.merge = function (next, prev) {
                next = _super.prototype.merge.call(this, next, prev);

                if (!next || !prev)
                    return next;
                if (next.length !== prev.length)
                    return next;

                for (var i = 0; i < next.length; ++i) {
                    if (next[i] !== prev[i])
                        return next;
                }

                return prev;
            };

            list.prototype.append = function (values) {
                var value = this.get();
                value.push.apply(value, values);
                this.notify(null, value);
            };

            list.prototype.prepend = function (values) {
                var value = this.get();
                value.unshift.apply(value, values);
                this.notify(null, value);
            };

            list.prototype.cut = function (from, to) {
                var value = this.get();
                value.splice(from, to);
                this.notify(null, value);
            };
            return list;
        })($jin.atom.prop);
        atom.list = list;
    })($jin.atom || ($jin.atom = {}));
    var atom = $jin.atom;
})($jin || ($jin = {}));
//atom-list.js.map

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    (function (atom) {
        var numb = (function (_super) {
            __extends(numb, _super);
            function numb() {
                _super.apply(this, arguments);
            }
            numb.prototype.summ = function (value) {
                this.set(this.get() + value);
            };

            numb.prototype.multiply = function (value) {
                this.set(this.get() * value);
            };
            return numb;
        })($jin.atom.prop);
        atom.numb = numb;
    })($jin.atom || ($jin.atom = {}));
    var atom = $jin.atom;
})($jin || ($jin = {}));
//numb.js.map

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    (function (atom) {
        var flag = (function (_super) {
            __extends(flag, _super);
            function flag() {
                _super.apply(this, arguments);
            }
            flag.prototype.toggle = function () {
                this.set(!this.get());
            };
            return flag;
        })($jin.atom.prop);
        atom.flag = flag;
    })($jin.atom || ($jin.atom = {}));
    var atom = $jin.atom;
})($jin || ($jin = {}));
//atom-flag.js.map

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    (function (atom) {
        var str = (function (_super) {
            __extends(str, _super);
            function str() {
                _super.apply(this, arguments);
            }
            str.prototype.append = function (value) {
                this.set(this.get() + value);
            };

            str.prototype.prepend = function (value) {
                this.set(value + this.get());
            };

            str.prototype.replace = function (regexp, handler) {
                this.set(this.get().replace(regexp, handler));
            };
            return str;
        })($jin.atom.prop);
        atom.str = str;
    })($jin.atom || ($jin.atom = {}));
    var atom = $jin.atom;
})($jin || ($jin = {}));
//str.js.map

//# sourceMappingURL=index.js.map
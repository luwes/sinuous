with(this){ /**
 * @name $jin
 * @class $jin
 * @singleton
 */
this.$jin = {}

;
//value.js.map
;
this.$jin.value = function $jin_value( value ){
    
    var func = function $jin_value_instance( ){
        return value
    }
	
	func.valueOf = func
	func.toString = func
    
    func.$jin_value = value
    
    return func
}

;
var $jin;
(function ($jin) {
    var object = (function () {
        function object(config) {
            var name = config.name || ('_' + ++$jin.object._objectIdSeed);
            this.name = name;
            var owner = config.owner || this.constructor;
            this.objectId = owner.objectId + '.' + name;
            this.owner = owner;
        }
        object.makeConstructor = function (parent) {
            return function jin_object() {
                parent.apply(this, arguments);
            };
        };
        object.makeClass = function (config) {
            var parent = this;
            var klass = config.hasOwnProperty('constructor')
                ? config['constructor']
                : this.makeConstructor(parent);
            klass.prototype = Object.create(this.prototype);
            for (var key in this) {
                if (this[key] === void 0)
                    continue;
                klass[key] = this[key];
            }
            for (var key in config) {
                if (config[key] === void 0)
                    continue;
                klass.prototype[key] = config[key];
            }
            return klass;
        };
        object.prototype.destroy = function () {
            this.havings.forEach(function (obj) {
                obj.destroy();
            });
            this.owner = null;
        };
        Object.defineProperty(object.prototype, "havings", {
            get: function () {
                var havings = [];
                for (var key in this) {
                    if (!this.hasOwnProperty(key))
                        continue;
                    var value = this[key];
                    if (!value)
                        continue;
                    if (value._owner !== this)
                        continue;
                    if (havings.indexOf(value) === -1)
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
            set: function (next) {
                var prev = this._owner;
                if (next === prev)
                    return;
                if (prev) {
                    prev[this.name] = null;
                }
                if (next) {
                    next[this.name] = this;
                }
                this._owner = next;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(object.prototype, "overLord", {
            get: function () {
                var owner = this.owner;
                if (!owner)
                    return this;
                return owner['overLord'];
            },
            enumerable: true,
            configurable: true
        });
        object.objectId = '$jin.object';
        object._objectIdSeed = 0;
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
    var prop;
    (function (prop_1) {
        var vary = (function (_super) {
            __extends(vary, _super);
            function vary(config) {
                _super.call(this, {
                    owner: config.owner || this,
                    name: config.name || '_value'
                });
                if (config.pull)
                    this._pull = config.pull;
                if (config.get)
                    this._get = config.get;
                if (config.merge)
                    this._merge = config.merge;
                if (config.notify)
                    this._notify = config.notify;
                if (config.put)
                    this._put = config.put;
                if (config.clear)
                    this._clear = config.clear;
                return this;
            }
            Object.defineProperty(vary.prototype, "owner", {
                get: function () {
                    return this._owner;
                },
                set: function (next) {
                    this._owner = next;
                },
                enumerable: true,
                configurable: true
            });
            vary.prototype._get = function (prop, value) {
                return value;
            };
            vary.prototype._pull = function (prop, prev) {
                return prev;
            };
            vary.prototype._merge = function (prop, next, prev) {
                return next;
            };
            vary.prototype._notify = function (prop, next, prev) {
            };
            vary.prototype._put = function (prop, next, prev) {
                this.push(next);
            };
            vary.prototype._clear = function (prop, prev) {
            };
            vary.prototype.clear = function () {
                var prev = this.owner[this.name];
                this.owner[this.name] = undefined;
                this._clear(this, prev);
            };
            vary.prototype.value = function () {
                return this.owner[this.name];
            };
            vary.prototype.push = function (next) {
                var prev = this.owner[this.name];
                if (next === prev)
                    return next;
                next = this._merge(this, next, prev);
                if (next === prev)
                    return next;
                this.owner[this.name] = next;
                this._notify(this, next, prev);
                return next;
            };
            vary.prototype.get = function () {
                var host = this.owner;
                var field = this.name;
                var value = host[field];
                if (value === undefined) {
                    value = this.pull();
                }
                return this._get(this, value);
            };
            vary.prototype.pull = function () {
                var value = this.value();
                value = this._pull(this, value);
                value = this.push(value);
                return value;
            };
            vary.prototype.update = function () {
                if (this.value() !== undefined) {
                    this.pull();
                }
            };
            vary.prototype.set = function (next, prev) {
                if (prev === void 0) { prev = this.value(); }
                next = this._merge(this, next, prev);
                if (next !== prev) {
                    this._put(this, next, prev);
                }
                return this.owner;
            };
            return vary;
        })($jin.object);
        prop_1.vary = vary;
    })(prop = $jin.prop || ($jin.prop = {}));
})($jin || ($jin = {}));
//vary.js.map
;
var $jin;
(function ($jin) {
    var prop;
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
    })(prop = $jin.prop || ($jin.prop = {}));
})($jin || ($jin = {}));
//proxy.js.map
;
var $jin;
(function ($jin) {
    var atom;
    (function (atom) {
        var wait = (function () {
            function wait(message) {
                this.message = message;
                this.jin_log_isLogged = true;
                this._nativeError = new Error(message);
            }
            wait.prototype.toString = function () {
                return String(this._nativeError);
            };
            return wait;
        })();
        atom.wait = wait;
    })(atom = $jin.atom || ($jin.atom = {}));
})($jin || ($jin = {}));
//wait.js.map
;
//sync2async.js.map
;
this.$jin.sync2async= function( func ){
	return func
}

;
var $jin;
(function ($jin) {
    var schedule = (function () {
        function schedule(timeout, handler) {
            this._handler = $jin.sync2async(handler);
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
    var atom;
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
            status.destroyed = new status('destroyed');
            return status;
        })($jin.enumeration);
        atom.status = status;
    })(atom = $jin.atom || ($jin.atom = {}));
})($jin || ($jin = {}));
//status.js.map
;
//log.js.map
;
this.$jin.log = function( ){
	if( typeof console === 'undefined' ) return
	
	console.log.apply( console, arguments )

	return arguments[0]
}

this.$jin.log.info = function( ){
	if( typeof console === 'undefined' ) return
	
	return console.info.apply( console, arguments )
}

this.$jin.log.warn = function( ){
	if( typeof console === 'undefined' ) return
	
	return console.warn.apply( console, arguments )
}

this.$jin.log.error = function( error ){
	if( typeof console === 'undefined' ) return
	
	if( error.jin_log_isLogged ) return
	
	var message = error.stack || error
	
	if( console.exception ) console.exception( error )
	else if( console.error ) console.error( message )
	else if( console.log ) console.log( message )
	
	error.jin_log_isLogged = true
}

this.$jin.log.error.ignore = function( error ){
	error.jin_log_isLogged = true
	return error
}

;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    var atom;
    (function (atom_1) {
        var prop = (function (_super) {
            __extends(prop, _super);
            function prop(config) {
                if (config.name) {
                    if (config.owner) {
                        var genericField = config.name;
                        var instanceField = genericField;
                        if (config.param !== void 0)
                            instanceField += '_' + config.param;
                        var instanceHost = config.owner;
                        var instance = instanceHost[instanceField];
                        if (instance)
                            return instance;
                        var genericHost = config.owner['constructor'];
                        var klass = genericHost[genericField];
                        if (!klass)
                            klass = genericHost[genericField] = this.constructor.makeClass({
                                name: config.name,
                                _pull: config.pull,
                                _get: config.get,
                                _merge: config.merge,
                                _put: config.put,
                                _reap: config.reap,
                                _notify: config.notify,
                                _fail: config.fail
                            });
                        return new klass({
                            owner: config.owner,
                            param: config.param,
                            status: config.status,
                            value: config.value,
                            error: config.error
                        });
                    }
                    else {
                        this.name = config.name;
                    }
                }
                if (config.owner) {
                    this.param = config.param;
                    _super.call(this, {
                        owner: config.owner,
                        name: this.name && (this.param !== void 0 ? (this.name + '_' + this.param) : this.name)
                    });
                }
                else {
                    _super.call(this, { name: config.name });
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
                this.status = config.status || $jin.atom.status.clear;
                this.value = config.value;
                this.error = config.error;
                this.slavesCount = 0;
                this.mastersDeep = 0;
                return this;
            }
            prop.swap = function (atom) {
                var last = this.currentSlave;
                this.currentSlave = atom;
                return last;
            };
            prop.induceSchedule = function () {
                var _this = this;
                if (!this._defer) {
                    this._defer = new $jin.defer(function () { return _this.induce(); });
                }
            };
            prop.updateSchedule = function (atom) {
                var deep = atom.mastersDeep;
                var plan = this._updatePlan;
                var queue = plan[deep];
                if (!queue)
                    queue = plan[deep] = [];
                queue.push(atom);
                if (deep < this._minDeep)
                    this._minDeep = deep;
                this.induceSchedule();
            };
            prop.reapSchedule = function (atom) {
                var plan = this._reapPlan[atom.objectId] = atom;
                this.induceSchedule();
            };
            prop.induce = function () {
                var updatePlan = $jin.atom.prop._updatePlan;
                while ($jin.atom.prop._minDeep < updatePlan.length) {
                    var queue = updatePlan[$jin.atom.prop._minDeep++];
                    if (!queue)
                        continue;
                    if (!queue.length)
                        continue;
                    var atom = queue.shift();
                    if (queue.length)
                        $jin.atom.prop._minDeep--;
                    if (atom.status === $jin.atom.status.clear) {
                        atom.pull();
                    }
                }
                var reapPlan = $jin.atom.prop._reapPlan;
                this._reapPlan = {};
                for (var id in reapPlan) {
                    var atom = reapPlan[id];
                    if (!atom)
                        continue;
                    if (atom.slavesCount !== 0)
                        continue;
                    if (!atom.status)
                        continue;
                    atom._reap(atom, atom.value);
                }
                this._defer = null;
            };
            prop.prototype.destroy = function () {
                this.clear();
                this.status = $jin.atom.status.destroyed;
                _super.prototype.destroy.call(this);
            };
            prop.prototype._get = function (atom, value) {
                return value;
            };
            prop.prototype._pull = function (atom, prev) {
                return prev;
            };
            prop.prototype._merge = function (atom, next, prev) {
                return next;
            };
            prop.prototype._put = function (atom, next, prev) {
                this.push(next);
                return this;
            };
            prop.prototype._reap = function (atom, value) {
                this.destroy();
            };
            prop.prototype._notify = function (atom, next, prev) {
            };
            prop.prototype._fail = function (atom, error) {
            };
            prop.prototype.push = function (next) {
                if (this.status === $jin.atom.status.destroyed) {
                    throw new Error('Can not push to destroyed atom');
                }
                var prev = this.value;
                next = this.merge(next, prev);
                this.value = next;
                this.status = $jin.atom.status.actual;
                if ((next !== prev) || this.error) {
                    this.notify(null, next, prev);
                }
                this.error = undefined;
                this.status = $jin.atom.status.actual;
                return next;
            };
            prop.prototype.fail = function (error) {
                if (this.error !== error) {
                    this.error = error;
                    this.status = $jin.atom.status.error;
                    this.notify(error, undefined, this.value);
                    console.error(error);
                }
                this.status = $jin.atom.status.error;
                return error;
            };
            prop.prototype.notify = function (error, next, prev) {
                if ($jin.atom.prop.enableLogs) {
                    $jin.log(this.objectId);
                    if (error) {
                        $jin.log.error(error);
                    }
                    else {
                        $jin.log(error || next);
                    }
                }
                var lastCurrent = $jin.atom.prop.swap(null);
                try {
                    if (error) {
                        this._fail(this, error);
                    }
                    else {
                        this._notify(this, next, prev);
                    }
                    if (prev && (prev['owner'] === this) && (typeof prev['destroy'] === 'function')) {
                        prev['destroy']();
                    }
                }
                finally {
                    $jin.atom.prop.swap(lastCurrent);
                }
                if (this.slavesCount) {
                    for (var slaveId in this.slaves) {
                        var slave = this.slaves[slaveId];
                        if (!slave)
                            continue;
                        slave.update();
                    }
                }
            };
            prop.prototype.update = function () {
                if (this.status === $jin.atom.status.clear) {
                    return;
                }
                if (this.error === $jin.atom.prop.pull) {
                    return;
                }
                if (this.status === $jin.atom.status.destroyed) {
                    throw new Error('Can not update destroyed atom');
                }
                $jin.atom.prop.updateSchedule(this);
                this.status = $jin.atom.status.clear;
            };
            prop.prototype.touch = function () {
                var slave = $jin.atom.prop.currentSlave;
                if (slave) {
                    this.lead(slave);
                    slave.obey(this);
                }
                else {
                }
            };
            prop.prototype.get = function () {
                this.touch();
                if (this.status === $jin.atom.status.clear) {
                    this.pull();
                }
                if (this.status === $jin.atom.status.error) {
                    throw this.error;
                }
                if (this.status === $jin.atom.status.actual) {
                    return this._get(this, this.value);
                }
                throw new Error('Wrong status: ' + this.status);
            };
            prop.prototype.pull = function () {
                var lastCurrent = $jin.atom.prop.swap(this);
                var oldMasters = this.masters;
                this.masters = null;
                this.mastersDeep = 0;
                this.status = $jin.atom.status.error;
                this.error = $jin.atom.prop.pull;
                try {
                    var value = this.value;
                    value = this._pull(this, value);
                    this.push(value);
                }
                catch (error) {
                    this.fail(error);
                }
                finally {
                    $jin.atom.prop.swap(lastCurrent);
                    if (oldMasters)
                        for (var masterId in oldMasters) {
                            var master = oldMasters[masterId];
                            if (!master)
                                continue;
                            if (this.masters && this.masters[masterId])
                                continue;
                            master.dislead(this);
                        }
                }
            };
            prop.prototype.set = function (next, prev) {
                if (prev === void 0) { prev = this.value; }
                next = this.merge(next, prev);
                if (next !== prev) {
                    return this.put(next, prev);
                }
                return this;
            };
            prop.prototype.put = function (next, prev) {
                var lastCurrent = $jin.atom.prop.swap(null);
                try {
                    return this._put(this, next, prev);
                }
                finally {
                    $jin.atom.prop.swap(lastCurrent);
                }
            };
            prop.prototype.mutate = function (mutate) {
                var lastCurrent = $jin.atom.prop.swap(null);
                try {
                    this.set(mutate(this.get()));
                }
                finally {
                    $jin.atom.prop.swap(lastCurrent);
                }
            };
            prop.prototype.merge = function (next, prev) {
                return this._merge(this, next, prev);
            };
            prop.prototype.clear = function () {
                var prev = this.value;
                var next = this.value = undefined;
                this.disobeyAll();
                this.status = $jin.atom.status.clear;
                this.notify(null, next, prev);
            };
            prop.prototype.reap = function () {
                if (this._pull === $jin.atom.prop.prototype._pull)
                    return;
                $jin.atom.prop.reapSchedule(this);
            };
            prop.prototype.lead = function (slave) {
                var slaveId = slave.objectId;
                if (this.slaves) {
                    if (this.slaves[slaveId])
                        return;
                }
                else {
                    this.slaves = {};
                }
                this.slaves[slaveId] = slave;
                this.slavesCount++;
            };
            prop.prototype.dislead = function (slave) {
                var slaveId = slave.objectId;
                if (!this.slaves[slaveId])
                    return;
                this.slaves[slaveId] = null;
                if (!--this.slavesCount) {
                    this.reap();
                }
            };
            prop.prototype.disleadAll = function () {
                if (!this.slavesCount)
                    return;
                for (var slaveId in this.slaves) {
                    var slave = this.slaves[slaveId];
                    if (!slave)
                        continue;
                    slave.disobey(this);
                }
                this.slaves = null;
                this.slavesCount = 0;
                this.reap();
            };
            prop.prototype.obey = function (master) {
                var masters = this.masters;
                if (!masters)
                    masters = this.masters = {};
                var masterId = master.objectId;
                if (masters[masterId])
                    return;
                masters[masterId] = master;
                var masterDeep = master.mastersDeep;
                if ((this.mastersDeep - masterDeep) > 0)
                    return;
                this.mastersDeep = masterDeep + 1;
            };
            prop.prototype.disobey = function (master) {
                if (!this.masters)
                    return;
                this.masters[master.objectId] = null;
            };
            prop.prototype.disobeyAll = function () {
                if (!this.mastersDeep)
                    return;
                for (var masterId in this.masters) {
                    var master = this.masters[masterId];
                    if (!master)
                        continue;
                    master.dislead(this);
                }
                this.masters = null;
                this.mastersDeep = 0;
                this.status = $jin.atom.status.clear;
            };
            prop.prototype.on = function (done, fail) {
                var _this = this;
                if (!done)
                    done = function (value) { return null; };
                if (!fail)
                    fail = function (error) { return $jin.log.error(error); };
                var listener = new $jin.atom.prop({
                    pull: function (promise, prev) {
                        try {
                            return _this.get();
                        }
                        catch (error) {
                            if (error instanceof $jin.atom.wait) {
                                return;
                            }
                            else {
                                throw error;
                            }
                        }
                    },
                    notify: function (listener, next) {
                        if (next === undefined)
                            return;
                        done(next);
                    },
                    fail: function (listener, error) {
                        if (error instanceof $jin.atom.wait)
                            return;
                        fail(error);
                    }
                });
                listener.push(undefined);
                listener.update();
                return listener;
            };
            prop.prototype.then = function (done, fail) {
                var _this = this;
                if (!done)
                    done = function (value) { return null; };
                if (!fail)
                    fail = function (error) { return $jin.log.error(error); };
                var promise = new $jin.atom.prop({
                    pull: function (promise, prev) {
                        try {
                            var next = _this.get();
                            if (next === void 0)
                                return prev;
                            promise.disobeyAll();
                            return done(next);
                        }
                        catch (error) {
                            if (error instanceof $jin.atom.wait) {
                                return;
                            }
                            else {
                                throw error;
                            }
                        }
                    },
                    fail: function (promise, error) {
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
            prop.pull = new $jin.atom.wait('pull');
            prop.enableLogs = false;
            prop._updatePlan = [];
            prop._reapPlan = {};
            prop._minDeep = 0;
            return prop;
        })($jin.object);
        atom_1.prop = prop;
    })(atom = $jin.atom || ($jin.atom = {}));
})($jin || ($jin = {}));
//prop.js.map
;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $jin;
(function ($jin) {
    var atom;
    (function (atom) {
        var map = (function (_super) {
            __extends(map, _super);
            function map() {
                _super.apply(this, arguments);
            }
            map.prototype.patch = function (patch) {
                var next = {};
                var prev = this.get();
                if (prev) {
                    for (var key in prev) {
                        if (!prev.hasOwnProperty(key))
                            continue;
                        next[key] = prev[key];
                    }
                }
                for (var key in patch) {
                    if (!patch.hasOwnProperty(key))
                        continue;
                    next[key] = patch[key];
                }
                this.set(next);
                return this.owner;
            };
            map.prototype.itemSet = function (key, value) {
                var patch = {};
                patch[key] = value;
                this.patch(patch);
            };
            return map;
        })($jin.atom.prop);
        atom.map = map;
    })(atom = $jin.atom || ($jin.atom = {}));
})($jin || ($jin = {}));
//atom-map.js.map
;
var $jin;
(function ($jin) {
    var atom;
    (function (atom) {
        function get(map) {
            var res = [];
            var wait = null;
            for (var key in map) {
                try {
                    res[key] = map[key].get();
                }
                catch (error) {
                    if (error instanceof $jin.atom.wait) {
                        wait = wait || error;
                    }
                    else {
                        throw error;
                    }
                }
            }
            if (wait)
                throw wait;
            return res;
        }
        atom.get = get;
    })(atom = $jin.atom || ($jin.atom = {}));
})($jin || ($jin = {}));
//get.js.map
;
var $jin;
(function ($jin) {
    function when(list) {
        var response = new $jin.atom.prop({});
        var values = [];
        var awaitCount = 0;
        function makeHandler(key) {
            return function (value) {
                values[key] = value;
                if (!--awaitCount)
                    response.push(values);
            };
        }
        for (var key in list) {
            ++awaitCount;
            var handle = makeHandler(key);
            list[key].then(handle, handle);
        }
        return response;
    }
    $jin.when = when;
})($jin || ($jin = {}));
//when.js.map
;
$jin.value;
$jin.prop.vary;
$jin.prop.proxy;
$jin.atom.prop;
$jin.atom.map;
$jin.atom.get;
$jin.when;
//props.js.map
}
//# sourceMappingURL=index.env=web.stage=release.js.map